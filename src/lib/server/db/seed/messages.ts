import { messages } from '../schema';
import type { TrustLevel } from '../../../trust';
import {
	ERIKA_AUSWEIS_CODE,
	ERIKA_AUSWEIS_START,
	MAX_REISEPASS_CODE,
	MAX_REISEPASS_START
} from './appointments';
import {
	daysAgoAt,
	formatDateDe,
	formatTimeDe,
	idOf,
	plusMinutes,
	type Db,
	type Ids
} from './util';

type MessageSeed = {
	/** Key under which the inserted id is returned. */
	key: string;
	user: string;
	application?: string;
	kind: 'status' | 'bescheid' | 'nachforderung' | 'nachricht';
	subject: string;
	body: string;
	fromName: string;
	requiredTrust?: TrustLevel;
	createdAt: Date;
	/** Minutes after creation at which the message was read; omitted = unread. */
	readAfterMin?: number;
};

const BUERGERAMT = 'Bürgeramt Musterstadt';
const ORDNUNGSAMT = 'Ordnungsamt Musterstadt';
const PORTAL = 'Bürgerportal Musterstadt';

function buildMessages(): MessageSeed[] {
	return [
		/* ───────── Max Mustermann ───────── */
		{
			key: 'max-welcome',
			user: 'max',
			kind: 'nachricht',
			subject: 'Willkommen im Postkorb',
			body: 'Guten Tag Herr Mustermann,\n\nwillkommen im Bürgerportal der Stadt Musterstadt. Im Postkorb finden Sie künftig alle Nachrichten Ihrer Anträge: Eingangsbestätigungen, Nachforderungen und Bescheide.\n\nBescheide und Nachrichten mit sensiblem Inhalt öffnen Sie mit dem Vertrauensniveau „hoch“ (Online-Ausweis). Sie werden bei Bedarf automatisch dazu aufgefordert.\n\nFreundliche Grüße\nIhr Bürgerportal Musterstadt',
			fromName: PORTAL,
			createdAt: daysAgoAt(45, 10, 0),
			readAfterMin: 5
		},
		{
			key: 'max-mb-status',
			user: 'max',
			application: 'MS-2026-004711',
			kind: 'status',
			subject: 'Ihr Antrag MS-2026-004711 ist eingegangen',
			body: 'Guten Tag Herr Mustermann,\n\nIhr Antrag auf Ausstellung einer Meldebescheinigung ist bei uns eingegangen und wird in Kürze bearbeitet. Das Aktenzeichen lautet MS-2026-004711.\n\nFreundliche Grüße\nBürgeramt Musterstadt',
			fromName: BUERGERAMT,
			createdAt: daysAgoAt(16, 9, 14),
			readAfterMin: 20
		},
		{
			key: 'max-mb-bescheid',
			user: 'max',
			application: 'MS-2026-004711',
			kind: 'bescheid',
			subject: 'Bescheid zu Ihrem Antrag MS-2026-004711 (Meldebescheinigung)',
			body: 'Guten Tag Herr Mustermann,\n\nIhr Antrag auf Ausstellung einer Meldebescheinigung wurde bewilligt. Den Bescheid (Nummer B-2026-004711) mit der Meldebescheinigung können Sie hier abrufen. Aus Datenschutzgründen ist dafür das Vertrauensniveau „hoch“ erforderlich.\n\nFreundliche Grüße\nBürgeramt Musterstadt',
			fromName: BUERGERAMT,
			requiredTrust: 'hoch',
			createdAt: daysAgoAt(14, 11, 20)
		},
		{
			key: 'max-ap-status-eingang',
			user: 'max',
			application: 'MS-2026-004738',
			kind: 'status',
			subject: 'Ihr Antrag MS-2026-004738 ist eingegangen',
			body: 'Guten Tag Herr Mustermann,\n\nIhr Antrag auf einen Anwohnerparkausweis (Parkzone B) ist beim Ordnungsamt eingegangen. Das Aktenzeichen lautet MS-2026-004738.\n\nFreundliche Grüße\nOrdnungsamt Musterstadt',
			fromName: ORDNUNGSAMT,
			createdAt: daysAgoAt(10, 18, 41),
			readAfterMin: 600
		},
		{
			key: 'max-ap-status-pruefung',
			user: 'max',
			application: 'MS-2026-004738',
			kind: 'status',
			subject: 'Ihr Antrag MS-2026-004738 wird geprüft',
			body: 'Guten Tag Herr Mustermann,\n\nIhr Antrag auf einen Anwohnerparkausweis wird jetzt von Frau Weber im Ordnungsamt geprüft. Wir melden uns, falls noch Unterlagen fehlen.\n\nFreundliche Grüße\nOrdnungsamt Musterstadt',
			fromName: ORDNUNGSAMT,
			createdAt: daysAgoAt(8, 10, 5),
			readAfterMin: 180
		},
		{
			key: 'max-ap-nachforderung',
			user: 'max',
			application: 'MS-2026-004738',
			kind: 'nachforderung',
			subject: 'Nachforderung zu Antrag MS-2026-004738: Zulassungsbescheinigung Teil I',
			body: 'Guten Tag Herr Mustermann,\n\nzur Bearbeitung Ihres Antrags auf einen Anwohnerparkausweis benötigen wir noch die Zulassungsbescheinigung Teil I (Fahrzeugschein) für das Kennzeichen MS-MM 1985. Bitte laden Sie eine gut lesbare Kopie oder ein Foto beider Seiten hoch.\n\nSolange der Nachweis fehlt, kann der Antrag nicht abgeschlossen werden.\n\nFreundliche Grüße\nSabine Weber, Ordnungsamt Musterstadt',
			fromName: ORDNUNGSAMT,
			createdAt: daysAgoAt(5, 14, 12)
		},
		{
			key: 'max-termin',
			user: 'max',
			kind: 'nachricht',
			subject: 'Terminbestätigung: Reisepass beantragen',
			body: `Guten Tag Herr Mustermann,\n\nIhr Termin zur Beantragung eines Reisepasses ist bestätigt:\n\n${formatDateDe(MAX_REISEPASS_START)}, ${formatTimeDe(MAX_REISEPASS_START)} Uhr\nBürgeramt Mitte, Hauptstraße 12, 12345 Musterstadt\nTermin-Code: ${MAX_REISEPASS_CODE}\n\nBitte bringen Sie ein biometrisches Passfoto und Ihren bisherigen Reisepass oder Personalausweis mit.\n\nFreundliche Grüße\nBürgeramt Musterstadt`,
			fromName: BUERGERAMT,
			createdAt: daysAgoAt(1, 9, 42),
			readAfterMin: 45
		},
		/* ───────── Erika Musterfrau ───────── */
		{
			key: 'erika-welcome',
			user: 'erika',
			kind: 'nachricht',
			subject: 'Willkommen im Postkorb',
			body: 'Guten Tag Frau Musterfrau,\n\nwillkommen im Bürgerportal der Stadt Musterstadt. Im Postkorb erhalten Sie Nachrichten zu Ihren Anträgen und Terminen.\n\nFreundliche Grüße\nIhr Bürgerportal Musterstadt',
			fromName: PORTAL,
			createdAt: daysAgoAt(30, 17, 30),
			readAfterMin: 12
		},
		{
			key: 'erika-bw-status',
			user: 'erika',
			application: 'MS-2026-004809',
			kind: 'status',
			subject: 'Ihr Antrag MS-2026-004809 ist eingegangen',
			body: 'Guten Tag Frau Musterfrau,\n\nIhr Antrag auf Briefwahl zur Oberbürgermeisterwahl Musterstadt ist beim Wahlamt eingegangen. Die Unterlagen werden in den nächsten Tagen an Ihre Wohnanschrift versendet.\n\nFreundliche Grüße\nWahlamt Musterstadt',
			fromName: 'Wahlamt Musterstadt',
			createdAt: daysAgoAt(2, 19, 11)
		},
		{
			key: 'erika-termin',
			user: 'erika',
			kind: 'nachricht',
			subject: 'Terminbestätigung: Personalausweis beantragen',
			body: `Guten Tag Frau Musterfrau,\n\nIhr Termin im Bürgeramt Süd ist bestätigt:\n\n${formatDateDe(ERIKA_AUSWEIS_START)}, ${formatTimeDe(ERIKA_AUSWEIS_START)} Uhr\nBürgeramt Süd, Bahnhofstraße 8, 12345 Musterstadt\nTermin-Code: ${ERIKA_AUSWEIS_CODE}\n\nBitte bringen Sie ein biometrisches Passfoto und Ihren bisherigen Ausweis mit. Wenn Sie den Termin nicht wahrnehmen können, stornieren Sie ihn bitte im Portal, damit andere Bürgerinnen und Bürger den Termin nutzen können.\n\nFreundliche Grüße\nBürgeramt Musterstadt`,
			fromName: BUERGERAMT,
			createdAt: daysAgoAt(3, 10, 0),
			readAfterMin: 90
		}
	];
}

/** Inserts the Postkorb messages and returns their ids by key. */
export async function seedMessages(db: Db, user: Ids, application: Ids): Promise<Ids> {
	const ids: Ids = {};
	for (const m of buildMessages()) {
		const [row] = await db
			.insert(messages)
			.values({
				userId: idOf(user, m.user, 'user'),
				applicationId: m.application ? idOf(application, m.application, 'application') : null,
				kind: m.kind,
				subject: m.subject,
				body: m.body,
				fromName: m.fromName,
				requiredTrust: m.requiredTrust ?? 'basis',
				fromCitizen: false,
				readAt: m.readAfterMin === undefined ? null : plusMinutes(m.createdAt, m.readAfterMin),
				createdAt: m.createdAt
			})
			.returning({ id: messages.id });
		if (!row) throw new Error(`Seed: message ${m.key} was not inserted`);
		ids[m.key] = row.id;
	}
	return ids;
}
