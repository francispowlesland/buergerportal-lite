import { error } from '@sveltejs/kit';
import { requireCitizen } from '#lib/server/auth/guards.ts';
import { db } from '#lib/server/db/index.ts';
import { buildIcs, getOwnedAppointment } from '#lib/server/appointments.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url, params }) => {
	const { user } = requireCitizen({ locals, url }, 'basis');
	const row = await getOwnedAppointment(db, params.code, user.id);
	if (!row) error(404, 'Termin nicht gefunden.');
	if (row.appointment.status !== 'gebucht')
		error(410, 'Dieser Termin wurde abgesagt. Bitte entfernen Sie ihn aus Ihrem Kalender.');
	const { appointment, service, location } = row;
	return new Response(
		buildIcs({
			code: appointment.code,
			summary: `${service.name} – ${location.name}`,
			location: `${location.name}, ${location.street}, ${location.postalCode} ${location.city}`,
			description: `Termin-Code: ${appointment.code}. Bitte kommen Sie zehn Minuten vor Beginn. Mitbringen: ${service.documents.join('; ')}. Verwalten: ${url.origin}/termine/${appointment.code}`,
			startsAt: appointment.startsAt,
			durationMin: appointment.durationMin
		}),
		{
			headers: {
				'content-type': 'text/calendar; charset=utf-8',
				'content-disposition': `attachment; filename="termin-${encodeURIComponent(appointment.code)}.ics"`,
				'cache-control': 'private, no-store',
				'x-content-type-options': 'nosniff'
			}
		}
	);
};
