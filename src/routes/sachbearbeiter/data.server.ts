import { and, asc, count, desc, eq, gte, inArray, lt, ne, type SQL } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import {
	applicationEvents,
	applications,
	appointments,
	attachments,
	bescheide,
	db,
	defects,
	defectUpdates,
	locations,
	offices,
	services,
	users,
	type ApplicationStatus,
	type DefectStatus,
	type User
} from '#lib/server/db/index.ts';
import { addDays, berlinInstant, isoDate } from '#lib/server/appointments.ts';
import { formatDate, formatDateLong } from '#lib/format.ts';
import {
	ageInDays,
	DAY_MS,
	describeData,
	maskSteuerId,
	median,
	URGENT_DAYS
} from '#lib/components/admin/helpers.ts';
import { OPEN_APPLICATION_STATUSES, OPEN_DEFECT_STATUSES } from '#lib/components/admin/rules.ts';
import type {
	AttachmentRow,
	BescheidInfo,
	CitizenInfo,
	DefectRow,
	EventRow,
	QueueRow,
	ScheduleDay,
	ScopeInfo
} from '#lib/components/admin/types.ts';

const citizen = alias(users, 'citizen');
const assignee = alias(users, 'assignee');
const actor = alias(users, 'actor');
const issuer = alias(users, 'issuer');

const fullName = (first: string | null, last: string | null) =>
	first && last ? `${first} ${last}` : null;

/* ───────────── Zuständigkeitsbereich ───────────── */

/** Scope comes from `?amt=`; default is the caseworker's own Amt. */
export async function resolveScope(user: User, param: string | null): Promise<ScopeInfo> {
	const list = await db
		.select({ id: offices.id, slug: offices.slug, name: offices.name })
		.from(offices)
		.orderBy(asc(offices.name));
	const own = list.find((o) => o.id === user.officeId) ?? null;
	const ownSlug = own?.slug ?? null;

	let slug = param ?? ownSlug ?? 'alle';
	if (slug !== 'alle' && !list.some((o) => o.slug === slug)) slug = ownSlug ?? 'alle';

	return {
		slug,
		label: list.find((o) => o.slug === slug)?.name ?? 'Alle Ämter',
		offices: list.map(({ slug: s, name }) => ({ slug: s, name })),
		ownSlug
	};
}

const scopeWhere = (scope: ScopeInfo): SQL | undefined =>
	scope.slug === 'alle' ? undefined : eq(offices.slug, scope.slug);

/* ───────────── Anträge ───────────── */

export async function loadQueue(
	scope: ScopeInfo,
	statuses: ApplicationStatus[],
	opts: { limit?: number; oldestFirst?: boolean } = {}
): Promise<QueueRow[]> {
	const { limit = 100, oldestFirst = true } = opts;
	const rows = await db
		.select({
			id: applications.id,
			reference: applications.reference,
			status: applications.status,
			submittedAt: applications.submittedAt,
			citizenFirst: citizen.firstName,
			citizenLast: citizen.lastName,
			serviceName: services.name,
			officeSlug: offices.slug,
			officeName: offices.name,
			assigneeFirst: assignee.firstName,
			assigneeLast: assignee.lastName
		})
		.from(applications)
		.innerJoin(services, eq(services.id, applications.serviceId))
		.innerJoin(offices, eq(offices.id, services.officeId))
		.innerJoin(citizen, eq(citizen.id, applications.userId))
		.leftJoin(assignee, eq(assignee.id, applications.assignedToId))
		.where(and(inArray(applications.status, statuses), scopeWhere(scope)))
		.orderBy(
			oldestFirst ? asc(applications.submittedAt) : desc(applications.updatedAt),
			asc(applications.id)
		)
		.limit(limit);

	const now = new Date();
	return rows.map((r) => {
		const ageDays = ageInDays(r.submittedAt, now);
		return {
			id: r.id,
			reference: r.reference,
			status: r.status,
			citizenName: `${r.citizenFirst} ${r.citizenLast}`,
			serviceName: r.serviceName,
			officeSlug: r.officeSlug,
			officeName: r.officeName,
			submittedAt: r.submittedAt,
			ageDays,
			overdue:
				ageDays !== null &&
				ageDays > URGENT_DAYS &&
				(r.status === 'eingereicht' || r.status === 'in_pruefung'),
			assigneeName: fullName(r.assigneeFirst, r.assigneeLast)
		};
	});
}

export async function countApplications(
	scope: ScopeInfo,
	statuses: ApplicationStatus[]
): Promise<number> {
	const [row] = await db
		.select({ n: count() })
		.from(applications)
		.innerJoin(services, eq(services.id, applications.serviceId))
		.innerJoin(offices, eq(offices.id, services.officeId))
		.where(and(inArray(applications.status, statuses), scopeWhere(scope)));
	return row?.n ?? 0;
}

export async function loadKpis(scope: ScopeInfo) {
	const base = () =>
		db
			.select({ n: count() })
			.from(applications)
			.innerJoin(services, eq(services.id, applications.serviceId))
			.innerJoin(offices, eq(offices.id, services.officeId));

	const [neu, inPruefung, nachforderung, overdue] = await Promise.all([
		base().where(and(eq(applications.status, 'eingereicht'), scopeWhere(scope))),
		base().where(and(eq(applications.status, 'in_pruefung'), scopeWhere(scope))),
		base().where(and(eq(applications.status, 'nachforderung'), scopeWhere(scope))),
		base().where(
			and(
				inArray(applications.status, ['eingereicht', 'in_pruefung']),
				lt(applications.submittedAt, new Date(Date.now() - URGENT_DAYS * DAY_MS)),
				scopeWhere(scope)
			)
		)
	]);

	const decided = await db
		.select({ submittedAt: applications.submittedAt, decidedAt: applications.decidedAt })
		.from(applications)
		.innerJoin(services, eq(services.id, applications.serviceId))
		.innerJoin(offices, eq(offices.id, services.officeId))
		.where(and(inArray(applications.status, ['bewilligt', 'abgelehnt']), scopeWhere(scope)));
	const durations = decided.flatMap((d) =>
		d.submittedAt && d.decidedAt ? [(d.decidedAt.getTime() - d.submittedAt.getTime()) / DAY_MS] : []
	);
	const med = median(durations);

	return {
		neu: neu[0]?.n ?? 0,
		inPruefung: inPruefung[0]?.n ?? 0,
		nachforderung: nachforderung[0]?.n ?? 0,
		overdue: overdue[0]?.n ?? 0,
		decidedCount: durations.length,
		medianDays: med === null ? null : Math.round(med * 10) / 10
	};
}

/** Header row of an application for action checks (never exposes drafts). */
export async function loadApplicationHead(id: number) {
	const [row] = await db
		.select({
			id: applications.id,
			reference: applications.reference,
			status: applications.status,
			userId: applications.userId,
			serviceName: services.name,
			officeId: offices.id,
			officeName: offices.name
		})
		.from(applications)
		.innerJoin(services, eq(services.id, applications.serviceId))
		.innerJoin(offices, eq(offices.id, services.officeId))
		.where(and(eq(applications.id, id), ne(applications.status, 'entwurf')))
		.limit(1);
	return row ?? null;
}

export async function loadDossier(id: number) {
	const [row] = await db
		.select({
			app: applications,
			serviceName: services.name,
			wizardSlug: services.wizardSlug,
			legalBasis: services.legalBasis,
			documents: services.documents,
			officeId: offices.id,
			officeName: offices.name,
			officeSlug: offices.slug,
			citizen: citizen,
			assigneeFirst: assignee.firstName,
			assigneeLast: assignee.lastName
		})
		.from(applications)
		.innerJoin(services, eq(services.id, applications.serviceId))
		.innerJoin(offices, eq(offices.id, services.officeId))
		.innerJoin(citizen, eq(citizen.id, applications.userId))
		.leftJoin(assignee, eq(assignee.id, applications.assignedToId))
		.where(and(eq(applications.id, id), ne(applications.status, 'entwurf')))
		.limit(1);
	if (!row) return null;

	const [eventRows, attachmentRows, bescheidRows] = await Promise.all([
		db
			.select({
				id: applicationEvents.id,
				kind: applicationEvents.kind,
				note: applicationEvents.note,
				createdAt: applicationEvents.createdAt,
				actorFirst: actor.firstName,
				actorLast: actor.lastName,
				actorRole: actor.role
			})
			.from(applicationEvents)
			.leftJoin(actor, eq(actor.id, applicationEvents.actorId))
			.where(eq(applicationEvents.applicationId, id))
			.orderBy(asc(applicationEvents.createdAt), asc(applicationEvents.id)),
		db
			.select({
				id: attachments.id,
				label: attachments.label,
				filename: attachments.filename,
				sizeBytes: attachments.sizeBytes,
				mimeType: attachments.mimeType,
				createdAt: attachments.createdAt
			})
			.from(attachments)
			.where(eq(attachments.applicationId, id))
			.orderBy(asc(attachments.createdAt)),
		db
			.select({
				number: bescheide.number,
				decision: bescheide.decision,
				bodyText: bescheide.bodyText,
				verificationCode: bescheide.verificationCode,
				issuedAt: bescheide.issuedAt,
				issuerFirst: issuer.firstName,
				issuerLast: issuer.lastName
			})
			.from(bescheide)
			.leftJoin(issuer, eq(issuer.id, bescheide.issuedById))
			.where(eq(bescheide.applicationId, id))
			.orderBy(desc(bescheide.issuedAt))
			.limit(1)
	]);

	const c = row.citizen;
	const citizenInfo: CitizenInfo = {
		name: `${c.firstName} ${c.lastName}`,
		email: c.email,
		steuerId: maskSteuerId(c.steuerId),
		birthDate: c.birthDate ? formatDate(c.birthDate) : null,
		address: [c.street, [c.postalCode, c.city].filter(Boolean).join(' ')].filter(Boolean).join(', ')
	};

	const events: EventRow[] = eventRows.map((e) => ({
		id: e.id,
		kind: e.kind,
		note: e.note,
		createdAt: e.createdAt,
		actorName: fullName(e.actorFirst, e.actorLast),
		actorRole: e.actorRole
	}));

	const bescheid: BescheidInfo | null = bescheidRows[0]
		? {
				number: bescheidRows[0].number,
				decision: bescheidRows[0].decision,
				bodyText: bescheidRows[0].bodyText,
				verificationCode: bescheidRows[0].verificationCode,
				issuedAt: bescheidRows[0].issuedAt,
				issuedByName: fullName(bescheidRows[0].issuerFirst, bescheidRows[0].issuerLast)
			}
		: null;

	return {
		application: {
			id: row.app.id,
			reference: row.app.reference,
			status: row.app.status,
			submittedAt: row.app.submittedAt,
			decidedAt: row.app.decidedAt,
			ageDays: ageInDays(row.app.submittedAt),
			assigneeName: fullName(row.assigneeFirst, row.assigneeLast),
			assignedToId: row.app.assignedToId
		},
		service: {
			name: row.serviceName,
			legalBasis: row.legalBasis,
			documents: row.documents,
			officeId: row.officeId,
			officeName: row.officeName
		},
		citizen: citizenInfo,
		fields: describeData(row.wizardSlug, row.app.data),
		attachments: attachmentRows satisfies AttachmentRow[],
		events,
		bescheid
	};
}

/* ───────────── Termine ───────────── */

export async function loadSchedule(scope: ScopeInfo, daysAhead = 3): Promise<ScheduleDay[]> {
	const today = isoDate(new Date());
	const from = berlinInstant(today, '00:00') ?? new Date();
	const to =
		berlinInstant(addDays(today, daysAhead + 1), '00:00') ?? new Date(Date.now() + 4 * DAY_MS);

	const rows = await db
		.select({
			id: appointments.id,
			code: appointments.code,
			startsAt: appointments.startsAt,
			durationMin: appointments.durationMin,
			locationName: locations.name,
			serviceName: services.name,
			citizenFirst: citizen.firstName,
			citizenLast: citizen.lastName
		})
		.from(appointments)
		.innerJoin(services, eq(services.id, appointments.serviceId))
		.innerJoin(offices, eq(offices.id, services.officeId))
		.innerJoin(locations, eq(locations.id, appointments.locationId))
		.innerJoin(citizen, eq(citizen.id, appointments.userId))
		.where(
			and(
				eq(appointments.status, 'gebucht'),
				gte(appointments.startsAt, from),
				lt(appointments.startsAt, to),
				scopeWhere(scope)
			)
		)
		.orderBy(asc(appointments.startsAt));

	const byDay = new Map<string, ScheduleDay['items']>();
	for (const r of rows) {
		const key = isoDate(r.startsAt);
		const items = byDay.get(key) ?? [];
		items.push({
			id: r.id,
			code: r.code,
			startsAt: r.startsAt,
			endsAt: new Date(r.startsAt.getTime() + r.durationMin * 60_000),
			locationName: r.locationName,
			serviceName: r.serviceName,
			citizenName: `${r.citizenFirst} ${r.citizenLast}`
		});
		byDay.set(key, items);
	}

	const days: ScheduleDay[] = [];
	for (let i = 0; i <= daysAhead; i++) {
		const key = addDays(today, i);
		const items = byDay.get(key) ?? [];
		if (i > 0 && items.length === 0) continue;
		const noon = berlinInstant(key, '12:00') ?? from;
		days.push({
			key,
			label:
				i === 0
					? `Heute, ${formatDate(noon)}`
					: i === 1
						? `Morgen, ${formatDate(noon)}`
						: formatDateLong(noon),
			isToday: i === 0,
			items
		});
	}
	return days;
}

/* ───────────── Mängelmelder ───────────── */

export async function loadDefects(
	statuses: DefectStatus[],
	opts: { limit?: number; oldestFirst?: boolean } = {}
): Promise<DefectRow[]> {
	const { limit = 100, oldestFirst = true } = opts;
	const rows = await db
		.select()
		.from(defects)
		.where(inArray(defects.status, statuses))
		.orderBy(oldestFirst ? asc(defects.createdAt) : desc(defects.createdAt), asc(defects.id))
		.limit(limit);
	if (rows.length === 0) return [];

	const updates = await db
		.select()
		.from(defectUpdates)
		.where(
			inArray(
				defectUpdates.defectId,
				rows.map((r) => r.id)
			)
		)
		.orderBy(desc(defectUpdates.createdAt), desc(defectUpdates.id));
	const latest = new Map<number, (typeof updates)[number]>();
	for (const u of updates) if (!latest.has(u.defectId)) latest.set(u.defectId, u);

	const now = new Date();
	return rows.map((r) => {
		const last = latest.get(r.id);
		return {
			id: r.id,
			reference: r.reference,
			category: r.category,
			title: r.title,
			address: r.address,
			status: r.status,
			createdAt: r.createdAt,
			ageDays: ageInDays(r.createdAt, now) ?? 0,
			lastUpdateAt: last?.createdAt ?? null,
			lastUpdateNote: last?.note ?? null,
			lastUpdateAuthor: last?.authorName ?? null
		};
	});
}

export async function countDefects(): Promise<Record<DefectStatus, number>> {
	const rows = await db
		.select({ status: defects.status, n: count() })
		.from(defects)
		.groupBy(defects.status);
	const result: Record<DefectStatus, number> = { gemeldet: 0, in_bearbeitung: 0, behoben: 0 };
	for (const r of rows) result[r.status] = r.n;
	return result;
}

export { OPEN_APPLICATION_STATUSES, OPEN_DEFECT_STATUSES };
