import { applicationEvents, applications, attachments } from '../schema';
import type {
	AnwohnerparkausweisData,
	BriefwahlData,
	MeldebescheinigungData
} from '../../../applicationData';
import { daysAgoAt, idOf, isoSunday, type Db, type Ids } from './util';

type ApplicationStatus = (typeof applications.$inferSelect)['status'];

type EventSeed = { kind: string; at: Date; actor?: string; note?: string };

type AttachmentSeed = {
	label: string;
	filename: string;
	sizeBytes: number;
	mimeType?: string;
	at: Date;
};

type ApplicationSeed = {
	reference: string;
	user: string;
	service: string;
	status: ApplicationStatus;
	data: Record<string, unknown>;
	step: number;
	assignedTo?: string;
	createdAt: Date;
	submittedAt?: Date;
	decidedAt?: Date;
	events: EventSeed[];
	attachments?: AttachmentSeed[];
};

/** Date of the (fictional) next election, a Sunday roughly three and a half weeks ahead. */
export const WAHL_DATUM = isoSunday(24);
const WAHL = 'Oberbürgermeisterwahl Musterstadt';

function briefwahl(
	wahlbezirk: string,
	nummer: string,
	extra: Partial<BriefwahlData> = {}
): BriefwahlData {
	return {
		wahl: WAHL,
		wahlDatum: WAHL_DATUM,
		wahlbezirk,
		wahlbenachrichtigungsnummer: nummer,
		zustellung: 'wohnanschrift',
		...extra
	};
}

/** Events for an application that has been submitted, with an optional first review step. */
function submitted(
	created: Date,
	submittedAt: Date,
	review?: { at: Date; actor: string }
): EventSeed[] {
	const events: EventSeed[] = [
		{ kind: 'erstellt', at: created, note: 'Antrag angelegt.' },
		{ kind: 'eingereicht', at: submittedAt, note: 'Antrag online eingereicht.' }
	];
	if (review) {
		events.push({
			kind: 'in_pruefung',
			at: review.at,
			actor: review.actor,
			note: 'Antrag zur Bearbeitung übernommen und in Prüfung gesetzt.'
		});
	}
	return events;
}

function buildSpecs(): ApplicationSeed[] {
	const maxMbCreated = daysAgoAt(16, 9, 5);
	const maxMbSubmitted = daysAgoAt(16, 9, 14);
	const maxMbDecided = daysAgoAt(14, 11, 20);
	const maxApCreated = daysAgoAt(10, 18, 20);
	const maxApSubmitted = daysAgoAt(10, 18, 41);
	const maxApReview = daysAgoAt(8, 10, 5);
	const maxApRequest = daysAgoAt(5, 14, 12);
	const maxBwCreated = daysAgoAt(1, 20, 15);
	const erikaCreated = daysAgoAt(2, 19, 2);
	const erikaSubmitted = daysAgoAt(2, 19, 11);

	const mb = (data: MeldebescheinigungData): Record<string, unknown> => ({ ...data });
	const ap = (data: AnwohnerparkausweisData): Record<string, unknown> => ({ ...data });
	const bw = (data: Partial<BriefwahlData>): Record<string, unknown> => ({ ...data });

	return [
		{
			reference: 'MS-2026-004711',
			user: 'max',
			service: 'meldebescheinigung',
			status: 'bewilligt',
			data: mb({ zweck: 'arbeitgeber', anzahl: 1, uebermittlung: 'postkorb', bestaetigt: true }),
			step: 3,
			assignedTo: 'hans',
			createdAt: maxMbCreated,
			submittedAt: maxMbSubmitted,
			decidedAt: maxMbDecided,
			events: [
				...submitted(maxMbCreated, maxMbSubmitted, { at: daysAgoAt(15, 8, 30), actor: 'hans' }),
				{
					kind: 'bewilligt',
					at: maxMbDecided,
					actor: 'hans',
					note: 'Meldebescheinigung ausgestellt und als Bescheid im Postkorb bereitgestellt.'
				}
			]
		},
		{
			reference: 'MS-2026-004738',
			user: 'max',
			service: 'anwohnerparkausweis',
			status: 'nachforderung',
			data: ap({
				kennzeichen: 'MS-MM 1985',
				fahrzeugart: 'pkw',
				halter: 'selbst',
				parkzone: 'B',
				zulassungGeprueft: false,
				laufzeitMonate: 12,
				nachweise: []
			}),
			step: 4,
			assignedTo: 'sabine',
			createdAt: maxApCreated,
			submittedAt: maxApSubmitted,
			events: [
				...submitted(maxApCreated, maxApSubmitted, { at: maxApReview, actor: 'sabine' }),
				{
					kind: 'nachforderung',
					at: maxApRequest,
					actor: 'sabine',
					note: 'Zulassungsbescheinigung Teil I (Fahrzeugschein) nachgefordert, da der Nachweis fehlt.'
				}
			]
		},
		{
			reference: 'MS-2026-004822',
			user: 'max',
			service: 'briefwahl',
			status: 'entwurf',
			data: bw({
				wahl: WAHL,
				wahlDatum: WAHL_DATUM,
				wahlbezirk: 'Wahlbezirk 07 – Grundschule Nord',
				wahlbenachrichtigungsnummer: 'WB-07-004711'
			}),
			step: 1,
			createdAt: maxBwCreated,
			events: [{ kind: 'erstellt', at: maxBwCreated, note: 'Entwurf angelegt.' }]
		},
		{
			reference: 'MS-2026-004809',
			user: 'erika',
			service: 'briefwahl',
			status: 'eingereicht',
			data: briefwahl('Wahlbezirk 12 – Gemeindehaus Süd', 'WB-12-003218'),
			step: 3,
			createdAt: erikaCreated,
			submittedAt: erikaSubmitted,
			events: submitted(erikaCreated, erikaSubmitted)
		},
		{
			reference: 'MS-2026-004816',
			user: 'lena',
			service: 'meldebescheinigung',
			status: 'eingereicht',
			data: mb({ zweck: 'bank', anzahl: 1, uebermittlung: 'postkorb', bestaetigt: true }),
			step: 3,
			createdAt: daysAgoAt(1, 17, 40),
			submittedAt: daysAgoAt(1, 17, 48),
			events: submitted(daysAgoAt(1, 17, 40), daysAgoAt(1, 17, 48))
		},
		{
			reference: 'MS-2026-004803',
			user: 'jonas',
			service: 'anwohnerparkausweis',
			status: 'eingereicht',
			data: ap({
				kennzeichen: 'MS-XY 7788',
				fahrzeugart: 'pkw',
				halter: 'selbst',
				parkzone: 'A',
				zulassungGeprueft: true,
				laufzeitMonate: 24,
				nachweise: ['Zulassungsbescheinigung Teil I']
			}),
			step: 4,
			createdAt: daysAgoAt(2, 12, 10),
			submittedAt: daysAgoAt(2, 12, 31),
			events: submitted(daysAgoAt(2, 12, 10), daysAgoAt(2, 12, 31)),
			attachments: [
				{
					label: 'Zulassungsbescheinigung Teil I',
					filename: 'zulassung_ms-xy7788.pdf',
					sizeBytes: 391204,
					at: daysAgoAt(2, 12, 28)
				}
			]
		},
		{
			reference: 'MS-2026-004796',
			user: 'fatma',
			service: 'briefwahl',
			status: 'eingereicht',
			data: briefwahl('Wahlbezirk 03 – Rathaus Mitte', 'WB-03-001927', {
				zustellung: 'abweichend',
				abweichendeAnschrift: { street: 'Schulstraße 11', postalCode: '12345', city: 'Musterstadt' }
			}),
			step: 3,
			createdAt: daysAgoAt(3, 20, 5),
			submittedAt: daysAgoAt(3, 20, 12),
			events: submitted(daysAgoAt(3, 20, 5), daysAgoAt(3, 20, 12))
		},
		{
			reference: 'MS-2026-004783',
			user: 'tobias',
			service: 'meldebescheinigung',
			status: 'in_pruefung',
			data: mb({ zweck: 'behoerde', anzahl: 2, uebermittlung: 'post', bestaetigt: true }),
			step: 3,
			assignedTo: 'hans',
			createdAt: daysAgoAt(4, 7, 50),
			submittedAt: daysAgoAt(4, 7, 58),
			events: submitted(daysAgoAt(4, 7, 50), daysAgoAt(4, 7, 58), {
				at: daysAgoAt(3, 8, 40),
				actor: 'hans'
			})
		},
		{
			reference: 'MS-2026-004771',
			user: 'svetlana',
			service: 'anwohnerparkausweis',
			status: 'in_pruefung',
			data: ap({
				kennzeichen: 'MS-AB 1234',
				fahrzeugart: 'pkw',
				halter: 'selbst',
				parkzone: 'C',
				zulassungGeprueft: true,
				laufzeitMonate: 12,
				nachweise: ['Zulassungsbescheinigung Teil I']
			}),
			step: 4,
			assignedTo: 'sabine',
			createdAt: daysAgoAt(6, 14, 20),
			submittedAt: daysAgoAt(6, 14, 41),
			events: submitted(daysAgoAt(6, 14, 20), daysAgoAt(6, 14, 41), {
				at: daysAgoAt(5, 9, 15),
				actor: 'sabine'
			}),
			attachments: [
				{
					label: 'Zulassungsbescheinigung Teil I',
					filename: 'zulassung_ms-ab1234.pdf',
					sizeBytes: 482113,
					at: daysAgoAt(6, 14, 37)
				}
			]
		},
		{
			reference: 'MS-2026-004760',
			user: 'klaus',
			service: 'meldebescheinigung',
			status: 'in_pruefung',
			data: mb({ zweck: 'arbeitgeber', anzahl: 1, uebermittlung: 'post', bestaetigt: true }),
			step: 3,
			assignedTo: 'hans',
			createdAt: daysAgoAt(7, 10, 30),
			submittedAt: daysAgoAt(7, 10, 37),
			events: submitted(daysAgoAt(7, 10, 30), daysAgoAt(7, 10, 37), {
				at: daysAgoAt(6, 8, 20),
				actor: 'hans'
			})
		},
		{
			reference: 'MS-2026-004752',
			user: 'mia',
			service: 'anwohnerparkausweis',
			status: 'eingereicht',
			data: ap({
				kennzeichen: 'MS-KM 4821',
				fahrzeugart: 'pkw',
				halter: 'andere',
				parkzone: 'B',
				zulassungGeprueft: true,
				laufzeitMonate: 12,
				nachweise: ['Zulassungsbescheinigung Teil I', 'Nutzungsbestätigung des Halters']
			}),
			step: 4,
			createdAt: daysAgoAt(8, 21, 2),
			submittedAt: daysAgoAt(8, 21, 20),
			events: submitted(daysAgoAt(8, 21, 2), daysAgoAt(8, 21, 20)),
			attachments: [
				{
					label: 'Zulassungsbescheinigung Teil I',
					filename: 'zulassung_ms-km4821.pdf',
					sizeBytes: 455870,
					at: daysAgoAt(8, 21, 12)
				},
				{
					label: 'Nutzungsbestätigung des Halters',
					filename: 'nutzungsbestaetigung_halter.pdf',
					sizeBytes: 128044,
					at: daysAgoAt(8, 21, 16)
				}
			]
		},
		{
			reference: 'MS-2026-004744',
			user: 'ahmet',
			service: 'briefwahl',
			status: 'eingereicht',
			data: briefwahl('Wahlbezirk 09 – Turnhalle Süd', 'WB-09-006443'),
			step: 3,
			createdAt: daysAgoAt(9, 16, 45),
			submittedAt: daysAgoAt(9, 16, 50),
			events: submitted(daysAgoAt(9, 16, 45), daysAgoAt(9, 16, 50))
		}
	];
}

export async function seedApplications(db: Db, user: Ids, service: Ids): Promise<Ids> {
	const ids: Ids = {};
	for (const spec of buildSpecs()) {
		const lastEvent = spec.events.reduce(
			(latest, e) => (e.at > latest ? e.at : latest),
			spec.createdAt
		);
		const [row] = await db
			.insert(applications)
			.values({
				reference: spec.reference,
				userId: idOf(user, spec.user, 'user'),
				serviceId: idOf(service, spec.service, 'service'),
				status: spec.status,
				data: spec.data,
				step: spec.step,
				assignedToId: spec.assignedTo ? idOf(user, spec.assignedTo, 'user') : null,
				createdAt: spec.createdAt,
				updatedAt: lastEvent,
				submittedAt: spec.submittedAt ?? null,
				decidedAt: spec.decidedAt ?? null
			})
			.returning({ id: applications.id });
		if (!row) throw new Error(`Seed: application ${spec.reference} was not inserted`);
		ids[spec.reference] = row.id;

		await db.insert(applicationEvents).values(
			spec.events.map((e) => ({
				applicationId: row.id,
				actorId: e.actor ? idOf(user, e.actor, 'user') : idOf(user, spec.user, 'user'),
				kind: e.kind,
				note: e.note ?? null,
				createdAt: e.at
			}))
		);

		if (spec.attachments?.length) {
			await db.insert(attachments).values(
				spec.attachments.map((a) => ({
					applicationId: row.id,
					uploadedById: idOf(user, spec.user, 'user'),
					label: a.label,
					filename: a.filename,
					sizeBytes: a.sizeBytes,
					mimeType: a.mimeType ?? 'application/pdf',
					createdAt: a.at
				}))
			);
		}
	}
	return ids;
}
