import { error, fail } from '@sveltejs/kit';
import { requireCitizen } from '#lib/server/auth/guards.ts';
import { db } from '#lib/server/db/index.ts';
import {
	cancelAppointment,
	getOwnedAppointment,
	qrPayload,
	qrSvg,
	toAppointmentView
} from '#lib/server/appointments.ts';
import { notify } from '#lib/server/domain.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url, params, setHeaders }) => {
	const { user } = requireCitizen({ locals, url }, 'basis');
	const row = await getOwnedAppointment(db, params.code, user.id);
	if (!row) error(404, 'Termin nicht gefunden.');
	setHeaders({ 'cache-control': 'private, no-store' });
	const appointment = toAppointmentView(row);
	return {
		appointment,
		citizenName: `${user.firstName} ${user.lastName}`,
		documents: row.service.documents,
		feeCents: row.service.feeCents,
		feeNote: row.service.feeNote,
		qr:
			appointment.phase === 'aktiv'
				? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvg(qrPayload(appointment.code)))}`
				: null
	};
};

export const actions: Actions = {
	cancel: async ({ locals, url, params }) => {
		const { user } = requireCitizen({ locals, url }, 'basis');
		const row = await getOwnedAppointment(db, params.code, user.id);
		if (!row) error(404, 'Termin nicht gefunden.');
		if (!(await cancelAppointment(db, params.code, user.id))) {
			return fail(409, {
				error:
					'Der Termin ist bereits abgesagt, verschoben oder hat schon begonnen. Bitte prüfen Sie Ihre Terminübersicht.'
			});
		}
		// shortcut: cancellation survives a Postkorb outage; add an outbox when delivery must be guaranteed.
		try {
			await notify(db, {
				userId: user.id,
				kind: 'status',
				subject: `Termin abgesagt: ${row.service.name}`,
				body: `Ihr Termin mit dem Termin-Code ${params.code} wurde abgesagt. Sie können jederzeit einen neuen Termin buchen.`,
				fromName: 'Stadt Musterstadt – Terminservice'
			});
		} catch (cause) {
			console.error('Termin abgesagt, Postkorb-Benachrichtigung fehlgeschlagen.', cause);
		}
		return { cancelled: true };
	}
};
