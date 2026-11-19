import { error, fail, redirect } from '@sveltejs/kit';
import { and, asc, eq } from 'drizzle-orm';
import { requireCitizen } from '#lib/server/auth/guards.ts';
import { db, locations, offices, services } from '#lib/server/db/index.ts';
import {
	addDays,
	addMonths,
	buildCalendar,
	getAvailability,
	getOwnedAppointment,
	HORIZON_DAYS,
	isoDate,
	isoWeekday,
	isIsoDate,
	isTime,
	bookAppointment,
	toAppointmentView
} from '#lib/server/appointments.ts';
import { newToken, notify } from '#lib/server/domain.ts';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, url, setHeaders }) => {
	const { user } = requireCitizen({ locals, url }, 'basis');
	setHeaders({ 'cache-control': 'private, no-store' });
	const now = new Date();
	const replaceCode = url.searchParams.get('replaceCode');
	const old = replaceCode ? await getOwnedAppointment(db, replaceCode, user.id) : null;
	if (replaceCode && !old) error(404, 'Termin nicht gefunden.');
	if (old && (old.appointment.status !== 'gebucht' || old.appointment.startsAt <= now)) {
		error(409, 'Nur bevorstehende, aktive Termine können verschoben werden.');
	}

	const allBookable = await db
		.select({
			serviceId: services.id,
			serviceSlug: services.slug,
			serviceName: services.name,
			documents: services.documents,
			feeCents: services.feeCents,
			feeNote: services.feeNote,
			officeId: offices.id,
			officeSlug: offices.slug,
			officeName: offices.name
		})
		.from(services)
		.innerJoin(offices, eq(offices.id, services.officeId))
		.where(eq(services.action, 'termin'))
		.orderBy(asc(offices.name), asc(services.name));
	const dienstSlug = url.searchParams.get('dienst') ?? old?.service.slug ?? '';
	const service = allBookable.find((s) => s.serviceSlug === dienstSlug) ?? null;
	if (dienstSlug && !service) error(404, 'Diese Leistung ist nicht für Termine buchbar.');
	if (old && service?.serviceId !== old.service.id)
		error(400, 'Beim Verschieben bleibt die Leistung gleich.');
	const bookableOffices = allBookable.filter(
		(s, i, all) => all.findIndex((o) => o.officeId === s.officeId) === i
	);
	const amtSlug = url.searchParams.get('amt') ?? service?.officeSlug ?? '';
	const office = bookableOffices.find((s) => s.officeSlug === amtSlug) ?? null;
	if (amtSlug && !office) error(400, 'Bitte wählen Sie ein Amt mit buchbaren Leistungen.');
	if (service && office?.officeId !== service.officeId)
		error(400, 'Die Leistung gehört nicht zu diesem Amt.');

	const availableLocations = service
		? await db
				.select()
				.from(locations)
				.where(eq(locations.officeId, service.officeId))
				.orderBy(asc(locations.name))
		: [];
	const standort = url.searchParams.get('standort');
	const selectedLocation = availableLocations.find((l) => l.id === Number(standort)) ?? null;
	if (standort !== null && (!/^\d+$/.test(standort) || !selectedLocation))
		error(400, 'Dieser Standort gehört nicht zur gewählten Leistung.');
	const datum = url.searchParams.get('datum');
	if (datum !== null && !isIsoDate(datum)) error(400, 'Bitte wählen Sie ein gültiges Datum.');
	const today = isoDate(now);
	const lastDate = addDays(today, HORIZON_DAYS);
	const month = url.searchParams.get('monat') ?? datum?.slice(0, 7) ?? today.slice(0, 7);
	if (!isIsoDate(`${month}-01`) || month < today.slice(0, 7) || month > lastDate.slice(0, 7)) {
		error(400, 'Bitte wählen Sie einen Monat innerhalb der nächsten 28 Tage.');
	}
	let calendarData = null;
	if (service && selectedLocation) {
		const first = `${month}-01`;
		const last = addDays(`${addMonths(month, 1)}-01`, -1);
		const from = addDays(first, 1 - isoWeekday(first));
		const to = addDays(last, 7 - isoWeekday(last));
		const days = await getAvailability(db, selectedLocation.id, service.serviceId, from, to, now);
		const daysMap = new Map(days.map((d) => [d.date, d]));
		const hrefFor = (date: string): `/termine/buchen?${string}` => {
			const next = new URLSearchParams(url.searchParams);
			next.set('datum', date);
			next.set('monat', date.slice(0, 7));
			return `/termine/buchen?${next}#uhrzeiten`;
		};
		calendarData = {
			month,
			prevMonth: month > today.slice(0, 7) ? addMonths(month, -1) : null,
			nextMonth: month < lastDate.slice(0, 7) ? addMonths(month, 1) : null,
			calendar: buildCalendar(month, daysMap, { now, selected: datum, hrefFor }),
			slots: (datum ? (daysMap.get(datum)?.slots ?? []) : []).map(({ time, free }) => ({
				time,
				free
			}))
		};
	}
	return {
		allBookable,
		bookableOffices,
		office,
		service,
		availableLocations,
		selectedLocation,
		datum,
		calendarData,
		replaceCode,
		replacing: old ? toAppointmentView(old, now) : null,
		step: !office ? 0 : !service ? 1 : !selectedLocation ? 2 : 3
	};
};

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const { user } = requireCitizen({ locals, url }, 'basis');
		const data = await request.formData();
		const text = (name: string) => {
			const value = data.get(name);
			return typeof value === 'string' ? value : '';
		};
		const dienstSlug = text('dienst');
		const standort = text('standort');
		const datum = text('datum');
		const zeit = text('zeit');
		const replaceCode = text('replaceCode') || null;
		if (
			!/^\d+$/.test(standort) ||
			!Number.isSafeInteger(Number(standort)) ||
			Number(standort) < 1 ||
			Number(standort) > 2_147_483_647 ||
			!isIsoDate(datum) ||
			!isTime(zeit)
		) {
			return fail(400, {
				error: 'Bitte wählen Sie einen Standort, ein Datum und eine freie Uhrzeit.'
			});
		}
		const [svc] = await db
			.select()
			.from(services)
			.where(and(eq(services.slug, dienstSlug), eq(services.action, 'termin')))
			.limit(1);
		if (!svc) return fail(400, { error: 'Diese Leistung ist nicht für Termine buchbar.' });
		const [loc] = await db
			.select()
			.from(locations)
			.where(and(eq(locations.id, Number(standort)), eq(locations.officeId, svc.officeId)))
			.limit(1);
		if (!loc) return fail(400, { error: 'Dieser Standort gehört nicht zur gewählten Leistung.' });
		const result = await bookAppointment(db, {
			userId: user.id,
			serviceId: svc.id,
			serviceSlug: svc.slug,
			locationId: loc.id,
			date: datum,
			time: zeit,
			replaceCode,
			makeCode: () => `T-${newToken(6)}`
		});
		if (!result.ok)
			return fail(result.kind === 'invalid' ? 400 : 409, {
				error: `${result.message} Bitte wählen Sie einen freien Termin.`
			});
		// shortcut: booking survives a Postkorb outage; add an outbox when delivery must be guaranteed.
		try {
			await notify(db, {
				userId: user.id,
				kind: 'status',
				subject: `${result.replaced ? 'Termin verschoben' : 'Terminbestätigung'}: ${svc.name}`,
				body: `Ihr Termin am ${datum} um ${zeit} Uhr bei ${loc.name} wurde bestätigt. Termin-Code: ${result.code}.${result.replaced ? ' Ihr bisheriger Termin ist abgesagt.' : ''}`,
				fromName: 'Stadt Musterstadt – Terminservice'
			});
		} catch (cause) {
			console.error('Termin gebucht, Postkorb-Benachrichtigung fehlgeschlagen.', cause);
		}
		redirect(303, `/termine/${result.code}`);
	}
};
