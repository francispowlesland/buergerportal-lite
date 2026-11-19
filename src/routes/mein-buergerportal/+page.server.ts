import { and, count, desc, eq, inArray, isNull } from 'drizzle-orm';
import { requireCitizen } from '#lib/server/auth/guards.ts';
import { getUpcomingAppointments } from '#lib/server/appointments.ts';
import { applications, db, messages, services } from '#lib/server/db/index.ts';
import { meetsTrust } from '#lib/trust.ts';
import type { PageServerLoad } from './$types';

const ACTIVE = ['entwurf', 'eingereicht', 'in_pruefung', 'nachforderung'] as const;

export const load: PageServerLoad = async ({ locals, url }) => {
	const { user, trust } = requireCitizen({ locals, url });

	const unreadWhere = and(
		eq(messages.userId, user.id),
		isNull(messages.readAt),
		eq(messages.fromCitizen, false)
	);

	const [active, decided, appointmentRows, unreadCount, unreadMessages] = await Promise.all([
		db
			.select({
				id: applications.id,
				reference: applications.reference,
				status: applications.status,
				updatedAt: applications.updatedAt,
				serviceName: services.name,
				wizardSlug: services.wizardSlug
			})
			.from(applications)
			.innerJoin(services, eq(services.id, applications.serviceId))
			.where(and(eq(applications.userId, user.id), inArray(applications.status, [...ACTIVE])))
			.orderBy(desc(applications.updatedAt)),
		db
			.select({ n: count() })
			.from(applications)
			.where(
				and(
					eq(applications.userId, user.id),
					inArray(applications.status, ['bewilligt', 'abgelehnt'])
				)
			),
		getUpcomingAppointments(user.id, 3),
		db.select({ n: count() }).from(messages).where(unreadWhere),
		db
			.select({
				id: messages.id,
				subject: messages.subject,
				kind: messages.kind,
				fromName: messages.fromName,
				requiredTrust: messages.requiredTrust,
				createdAt: messages.createdAt
			})
			.from(messages)
			.where(unreadWhere)
			.orderBy(desc(messages.createdAt))
			.limit(3)
	]);

	return {
		firstName: user.firstName,
		lastName: user.lastName,
		trust,
		applications: active.map((a) => ({ ...a, updatedAt: a.updatedAt.toISOString() })),
		decidedCount: decided[0]?.n ?? 0,
		appointments: appointmentRows.map((r) => ({
			code: r.appointment.code,
			startsAt: r.appointment.startsAt.toISOString(),
			durationMin: r.appointment.durationMin,
			serviceName: r.service.name,
			locationName: r.location.name,
			locationStreet: r.location.street
		})),
		unreadCount: unreadCount[0]?.n ?? 0,
		unreadMessages: unreadMessages.map((m) => ({
			...m,
			subject: meetsTrust(trust, m.requiredTrust) ? m.subject : 'Geschützte Nachricht',
			createdAt: m.createdAt.toISOString()
		}))
	};
};
