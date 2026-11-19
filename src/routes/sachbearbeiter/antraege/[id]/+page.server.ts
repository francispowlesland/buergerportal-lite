import { error, fail } from '@sveltejs/kit';
import { and, eq, inArray } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { requireCaseworker } from '#lib/server/auth/guards.ts';
import { applications, db } from '#lib/server/db/index.ts';
import { addEvent, issueBescheid, notify } from '#lib/server/domain.ts';
import {
	canMoveApplication,
	checkText,
	mayDecideOffice,
	parseId,
	sourcesOf,
	TEXT_MIN
} from '#lib/components/admin/rules.ts';
import { APPLICATION_STATUS } from '#lib/labels.ts';
import type { FormState } from '#lib/components/admin/types.ts';
import { loadApplicationHead, loadDossier } from '../../data.server.ts';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const { user } = requireCaseworker({ locals, url });
	const id = parseId(params.id);
	if (!id) error(404, 'Der Antrag wurde nicht gefunden.');

	const dossier = await loadDossier(id);
	if (!dossier) error(404, 'Der Antrag wurde nicht gefunden oder ist noch ein Entwurf.');

	return {
		...dossier,
		canDecide: mayDecideOffice(user.officeId, dossier.service.officeId),
		isAssignedToMe: dossier.application.assignedToId === user.id
	};
};

/** Common checks of every decision action: role, existence, own Amt and allowed transition. */
async function prepare(
	event: Parameters<Actions[string]>[0],
	to: 'in_pruefung' | 'nachforderung' | 'bewilligt' | 'abgelehnt'
) {
	const { user } = requireCaseworker({ locals: event.locals, url: event.url });
	const id = parseId(event.params.id);
	if (!id) error(404, 'Der Antrag wurde nicht gefunden.');

	const head = await loadApplicationHead(id);
	if (!head) error(404, 'Der Antrag wurde nicht gefunden oder ist noch ein Entwurf.');
	if (!mayDecideOffice(user.officeId, head.officeId)) {
		error(
			403,
			`Anträge des Bereichs ${head.officeName} können nur von dessen Mitarbeitenden entschieden werden.`
		);
	}

	const form = await event.request.formData();
	const blocked: FormState | null = canMoveApplication(head.status, to)
		? null
		: {
				ok: false,
				action: '',
				message: `Der Antrag hat den Status „${APPLICATION_STATUS[head.status].label}“. Diese Aktion ist nicht mehr möglich. Laden Sie die Seite neu, um den aktuellen Stand zu sehen.`
			};
	return { user, head, form, blocked };
}

const textError = (action: string, message: string, field: string, value: string): FormState => ({
	ok: false,
	action,
	message: 'Bitte korrigieren Sie die markierte Eingabe.',
	errors: { [field]: message },
	values: { [field]: value }
});

async function decide(input: Parameters<typeof issueBescheid>[0]) {
	try {
		return await issueBescheid(input);
	} catch (caught) {
		const cause = caught instanceof Error && caught.cause ? caught.cause : caught;
		if (
			cause instanceof Error &&
			'code' in cause &&
			cause.code === '23505' &&
			'constraint_name' in cause &&
			cause.constraint_name === 'bescheide_number_unique'
		)
			error(
				409,
				'Der Antrag wurde in der Zwischenzeit entschieden. Bitte laden Sie die Seite neu.'
			);
		throw caught;
	}
}

export const actions: Actions = {
	/** Take over: eingereicht/nachforderung → in_pruefung, assigned to the caseworker. */
	uebernehmen: async (event) => {
		const { user, head, blocked } = await prepare(event, 'in_pruefung');
		if (blocked) return fail(409, { ...blocked, action: 'uebernehmen' });

		const moved = await db.transaction(async (tx) => {
			const rows = await tx
				.update(applications)
				.set({ status: 'in_pruefung', assignedToId: user.id, updatedAt: new Date() })
				.where(
					and(eq(applications.id, head.id), inArray(applications.status, sourcesOf('in_pruefung')))
				)
				.returning({ id: applications.id });
			if (rows.length === 0) return false;
			await addEvent(
				tx,
				head.id,
				'in_pruefung',
				'Antrag zur Bearbeitung übernommen und in Prüfung gesetzt.',
				user.id
			);
			return true;
		});
		if (!moved) {
			return fail(409, {
				ok: false,
				action: 'uebernehmen',
				message: 'Der Antrag wurde in der Zwischenzeit geändert. Bitte laden Sie die Seite neu.'
			} satisfies FormState);
		}
		return {
			ok: true,
			action: 'uebernehmen',
			message: 'Der Antrag ist in Prüfung und Ihnen zugewiesen.'
		} satisfies FormState;
	},

	/** Request more documents: message to the Postkorb, status → nachforderung. */
	nachforderung: async (event) => {
		const { user, head, form, blocked } = await prepare(event, 'nachforderung');
		if (blocked) return fail(409, { ...blocked, action: 'nachforderung' });

		const text = checkText(form.get('nachricht'), {
			label: 'Die Nachricht an die Antragstellerin oder den Antragsteller',
			required: true,
			min: TEXT_MIN
		});
		if (text.error)
			return fail(400, textError('nachforderung', text.error, 'nachricht', text.value));

		const moved = await db.transaction(async (tx) => {
			const rows = await tx
				.update(applications)
				.set({
					status: 'nachforderung',
					assignedToId: user.id,
					updatedAt: new Date()
				})
				.where(
					and(
						eq(applications.id, head.id),
						inArray(applications.status, sourcesOf('nachforderung'))
					)
				)
				.returning({ id: applications.id });
			if (rows.length === 0) return false;
			await addEvent(tx, head.id, 'nachforderung', text.value, user.id);
			await notify(tx, {
				userId: head.userId,
				applicationId: head.id,
				kind: 'nachforderung',
				subject: `Nachforderung zu Antrag ${head.reference}: ${head.serviceName}`,
				body: `${text.value}\n\nBitte reichen Sie die Unterlagen über Ihren Postkorb nach.`,
				fromName: head.officeName,
				requiredTrust: 'basis'
			});
			return true;
		});
		if (!moved) {
			return fail(409, {
				ok: false,
				action: 'nachforderung',
				message: 'Der Antrag wurde in der Zwischenzeit geändert. Bitte laden Sie die Seite neu.'
			} satisfies FormState);
		}
		return {
			ok: true,
			action: 'nachforderung',
			message:
				'Die Nachforderung wurde in den Postkorb der Antragstellerin oder des Antragstellers gestellt.'
		} satisfies FormState;
	},

	/** Approve and issue the Bescheid (domain helper). */
	bewilligen: async (event) => {
		const { user, head, form, blocked } = await prepare(event, 'bewilligt');
		if (blocked) return fail(409, { ...blocked, action: 'bewilligen' });

		const text = checkText(form.get('hinweis'), {
			label: 'Der Hinweis im Bescheid',
			max: 1000
		});
		if (text.error) return fail(400, textError('bewilligen', text.error, 'hinweis', text.value));

		const { bescheid } = await decide({
			applicationId: head.id,
			decision: 'bewilligt',
			reason: text.value || undefined,
			issuedById: user.id
		});
		return {
			ok: true,
			action: 'bewilligen',
			message: `Der Antrag ist bewilligt. Bescheid ${bescheid.number} liegt im Postkorb der Antragstellerin oder des Antragstellers bereit.`
		} satisfies FormState;
	},

	/** Reject with a mandatory reason. */
	ablehnen: async (event) => {
		const { user, head, form, blocked } = await prepare(event, 'abgelehnt');
		if (blocked) return fail(409, { ...blocked, action: 'ablehnen' });

		const text = checkText(form.get('begruendung'), {
			label: 'Die Begründung der Ablehnung',
			required: true,
			min: TEXT_MIN
		});
		if (text.error) return fail(400, textError('ablehnen', text.error, 'begruendung', text.value));

		const { bescheid } = await decide({
			applicationId: head.id,
			decision: 'abgelehnt',
			reason: text.value,
			issuedById: user.id
		});
		return {
			ok: true,
			action: 'ablehnen',
			message: `Der Antrag ist abgelehnt. Bescheid ${bescheid.number} liegt im Postkorb der Antragstellerin oder des Antragstellers bereit.`
		} satisfies FormState;
	}
};
