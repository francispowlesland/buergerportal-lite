import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq, sql } from 'drizzle-orm';
import { db, applications, attachments } from '#lib/server/db/index.ts';
import { addEvent, issueBescheid, notify } from '#lib/server/domain.ts';
import { readApplication } from '#lib/server/wizards/application.ts';
import {
	hasExistingSubmittedBriefwahl,
	PARKING_ZONES,
	deriveParkingZone,
	WAHLBEZIRKE
} from '#lib/server/wizards/index.ts';
import { readWizardInput, readStep, validateAttachment } from '#lib/server/wizards/input.ts';
import type { PageServerLoad, Actions, RequestEvent } from './$types';

export const load: PageServerLoad = async (event) => {
	const { app, service, wizard, user, trust } = await readApplication(event);
	if (app.status !== 'entwurf') redirect(303, `/antrag/${wizard.slug}/${app.id}/fertig`);
	const atts = await db.select().from(attachments).where(eq(attachments.applicationId, app.id));
	const initial = wizard.getInitialData(user);
	const values = readWizardInput(
		wizard.slug,
		new FormData(),
		app.data,
		initial,
		atts.map((a) => a.label)
	);
	const duplicate =
		wizard.slug === 'briefwahl'
			? await hasExistingSubmittedBriefwahl(user.id, app.id, String(values.wahlDatum))
			: { exists: false };
	const queryStep = event.url.searchParams.get('schritt');
	const step = queryStep === null ? app.step : Number(queryStep);
	return {
		application: { ...app, data: values },
		service,
		attachments: atts,
		user,
		trust,
		currentStep: Number.isInteger(step) ? Math.max(0, Math.min(wizard.steps.length - 1, step)) : 0,
		wizardSlug: wizard.slug,
		wizard: { title: wizard.title, lead: wizard.lead, steps: wizard.steps },
		parkingZones: PARKING_ZONES,
		eligibleZone: deriveParkingZone(user.street, user.postalCode),
		wahlbezirke: WAHLBEZIRKE,
		briefwahlDuplicateError: duplicate.exists
			? `Sie haben bereits einen Briefwahlantrag für diese Wahl eingereicht (${duplicate.reference}).`
			: null
	};
};

type ActionName =
	| 'saveStep'
	| 'saveDraft'
	| 'uploadAttachment'
	| 'deleteAttachment'
	| 'checkRegistration'
	| 'submit';

function action(name: ActionName) {
	return async (event: RequestEvent) => {
		const outcome = await db.transaction(async (tx) => {
			const { app, service, wizard, user, trust } = await readApplication(event, tx, true);
			const form = await event.request.formData();
			const step = readStep(form.get('currentStep'), wizard.steps.length);
			if (step === null)
				return fail(400, {
					errors: { _form: 'Ungültiger Schritt. Bitte laden Sie den Antrag neu.' }
				});
			let atts = await tx.select().from(attachments).where(eq(attachments.applicationId, app.id));
			let data: Record<string, unknown>;
			try {
				data = readWizardInput(
					wizard.slug,
					form,
					app.data,
					wizard.getInitialData(user),
					atts.map((a) => a.label)
				);
			} catch (err) {
				return fail(400, {
					step,
					attachments: atts,
					errors: { _form: err instanceof Error ? err.message : 'Ungültige Formulardaten.' }
				});
			}
			let nextStep = step;
			if (name === 'saveStep') {
				const target = readStep(form.get('targetStep'), wizard.steps.length);
				if (target === null || target > step + 1)
					return fail(400, {
						step,
						data,
						attachments: atts,
						errors: { _form: 'Bitte bearbeiten Sie die Schritte der Reihe nach.' }
					});
				if (target > step) {
					for (let i = 0; i <= step; i++) {
						const check = wizard.validateStep(i, data, user);
						if (!check.valid)
							return fail(400, { step: i, data, attachments: atts, errors: check.errors });
					}
				}
				nextStep = target;
			}
			if (['uploadAttachment', 'deleteAttachment', 'checkRegistration'].includes(name)) {
				if (wizard.slug !== 'anwohnerparkausweis')
					error(400, 'Nachweise sind nur für Bewohnerparkausweise vorgesehen.');
				if (name === 'uploadAttachment') {
					const filenameValue = form.get('filename');
					const filename = typeof filenameValue === 'string' ? filenameValue : '';
					const sizeBytes = Number(form.get('sizeBytes'));
					const mimeValue = form.get('mimeType');
					const mimeType = typeof mimeValue === 'string' ? mimeValue : '';
					if (!validateAttachment(filename, sizeBytes, mimeType) || atts.length >= 10)
						return fail(400, {
							step,
							data,
							attachments: atts,
							errors: {
								_form:
									'Bitte wählen Sie eine PDF-, JPG- oder PNG-Datei bis 5 MB (maximal 10 Nachweise).'
							}
						});
					await tx.insert(attachments).values({
						applicationId: app.id,
						uploadedById: user.id,
						label: 'Zulassungsbescheinigung Teil I',
						filename,
						sizeBytes,
						mimeType
					});
				} else if (name === 'deleteAttachment') {
					const attachmentId = Number(form.get('attachmentId'));
					if (!atts.some((a) => a.id === attachmentId))
						error(403, 'Dieser Nachweis gehört nicht zu Ihrem Antrag.');
					await tx
						.delete(attachments)
						.where(and(eq(attachments.id, attachmentId), eq(attachments.applicationId, app.id)));
				} else {
					const check = wizard.validateStep(0, data, user);
					if (!check.valid)
						return fail(400, { step: 0, data, attachments: atts, errors: check.errors });
					if (data.halter !== 'selbst')
						return fail(400, {
							step,
							data,
							attachments: atts,
							errors: { _form: 'Bei einem fremden Halter laden Sie bitte den Fahrzeugschein hoch.' }
						});
					data.zulassungGeprueft = true;
				}
				atts = await tx.select().from(attachments).where(eq(attachments.applicationId, app.id));
				data.nachweise = [...new Set(atts.map((a) => a.label))];
			}
			if (name === 'submit') {
				const check = wizard.validateAll(data, user);
				if (!check.valid) {
					const firstErrorStep = wizard.steps.findIndex(
						(_, i) => !wizard.validateStep(i, data, user).valid
					);
					return fail(400, { step: firstErrorStep, data, attachments: atts, errors: check.errors });
				}
				if (wizard.slug === 'briefwahl') {
					await tx.execute(sql`select pg_advisory_xact_lock(4242, ${user.id})`);
					const duplicate = await hasExistingSubmittedBriefwahl(
						user.id,
						app.id,
						String(data.wahlDatum),
						tx
					);
					if (duplicate.exists)
						return fail(400, {
							step,
							data,
							attachments: atts,
							errors: {
								_form: `Für diese Wahl liegt bereits Ihr Antrag ${duplicate.reference} vor.`
							}
						});
					if (data.zustellung === 'wohnanschrift') delete data.abweichendeAnschrift;
				}
				const now = new Date();
				await tx
					.update(applications)
					.set({
						data,
						step: wizard.steps.length - 1,
						status: 'eingereicht',
						submittedAt: now,
						updatedAt: now
					})
					.where(eq(applications.id, app.id));
				await addEvent(
					tx,
					app.id,
					'eingereicht',
					`Antrag „${service.name}“ online eingereicht.`,
					user.id
				);
				await notify(tx, {
					userId: user.id,
					applicationId: app.id,
					kind: 'status',
					fromName: 'Stadt Musterstadt',
					subject: `Antragseingang: ${service.name}`,
					body: `Ihr Antrag „${service.name}“ (${app.reference}) ist eingegangen. Den Bearbeitungsstand finden Sie in Ihrer Antragsübersicht.`
				});
				return {
					submitted: true as const,
					applicationId: app.id,
					slug: wizard.slug,
					instant: wizard.slug === 'meldebescheinigung' && trust === 'hoch'
				};
			}
			await tx
				.update(applications)
				.set({ data, step: nextStep, updatedAt: new Date() })
				.where(eq(applications.id, app.id));
			return {
				step: nextStep,
				data,
				attachments: atts,
				draftSaved: name === 'saveDraft',
				registrationChecked: name === 'checkRegistration'
			};
		});
		if ('submitted' in outcome) {
			if (outcome.instant) {
				// shortcut: the shared Bescheid helper owns its transaction; retain the submitted receipt if issuance fails, pass tx when supported.
				try {
					await issueBescheid({
						applicationId: outcome.applicationId,
						decision: 'bewilligt',
						issuedById: null,
						reason:
							'Die Meldebescheinigung wurde nach Identifizierung mit dem Online-Ausweis automatisch erstellt.'
					});
				} catch (err) {
					console.error('Automatische Bescheiderstellung fehlgeschlagen:', err);
				}
			}
			redirect(303, `/antrag/${outcome.slug}/${outcome.applicationId}/fertig`);
		}
		return outcome;
	};
}

export const actions = {
	saveStep: action('saveStep'),
	saveDraft: action('saveDraft'),
	uploadAttachment: action('uploadAttachment'),
	deleteAttachment: action('deleteAttachment'),
	checkRegistration: action('checkRegistration'),
	submit: action('submit')
} satisfies Actions;
