import { randomBytes, randomInt } from 'node:crypto';
import { eq } from 'drizzle-orm';
import {
	applicationEvents,
	applications,
	bescheide,
	db,
	messages,
	offices,
	services,
	users,
	type Application
} from './db/index.ts';

type Db = typeof db;
type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];

/** Aktenzeichen / reference such as `MS-2026-483920`. */
export function newReference(prefix: string, digits = 6): string {
	const year = new Date().getFullYear();
	const n = randomInt(10 ** (digits - 1), 10 ** digits);
	return `${prefix}-${year}-${n}`;
}

/** Printed verification code, e.g. `7KQ2-M9XD-41LP`. */
export function newVerificationCode(): string {
	const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	const pick = () => alphabet[randomInt(alphabet.length)];
	return [0, 1, 2].map(() => Array.from({ length: 4 }, pick).join('')).join('-');
}

/** Short opaque token, e.g. for appointment codes. */
export function newToken(len = 6): string {
	const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	const bytes = randomBytes(len);
	return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

export const RECHTSBEHELFSBELEHRUNG =
	'Rechtsbehelfsbelehrung: Gegen diesen Bescheid kann innerhalb eines Monats nach Bekanntgabe Widerspruch erhoben werden. ' +
	'Der Widerspruch ist schriftlich oder zur Niederschrift bei der Stadt Musterstadt, Marktplatz 1, 12345 Musterstadt, einzulegen. ' +
	'Die Frist ist auch gewahrt, wenn der Widerspruch innerhalb dieser Frist bei der Widerspruchsbehörde eingeht.';

/** Append an entry to the audit trail of an application. */
export async function addEvent(
	conn: Db | Tx,
	applicationId: number,
	kind: string,
	note: string | null,
	actorId: number | null
) {
	await conn.insert(applicationEvents).values({ applicationId, kind, note, actorId });
}

/** Put a message into a citizen's Postkorb. */
export async function notify(
	conn: Db | Tx,
	input: {
		userId: number;
		applicationId?: number | null;
		kind: 'status' | 'bescheid' | 'nachforderung' | 'nachricht';
		subject: string;
		body: string;
		fromName: string;
		requiredTrust?: 'basis' | 'substanziell' | 'hoch';
	}
) {
	const [m] = await conn
		.insert(messages)
		.values({ requiredTrust: 'basis', applicationId: null, ...input })
		.returning();
	return m;
}

/**
 * Decide an application: creates the Bescheid record, the Postkorb message (opens only with
 * Vertrauensniveau Hoch), updates the application and writes the audit trail.
 * Use for both instant decisions in wizards and caseworker decisions.
 */
export async function issueBescheid(input: {
	applicationId: number;
	decision: 'bewilligt' | 'abgelehnt';
	/** Free-text reason; required in practice for 'abgelehnt'. */
	reason?: string;
	issuedById: number | null;
}) {
	return db.transaction(async (tx) => {
		const [row] = await tx
			.select({ app: applications, service: services, office: offices, citizen: users })
			.from(applications)
			.innerJoin(services, eq(services.id, applications.serviceId))
			.innerJoin(offices, eq(offices.id, services.officeId))
			.innerJoin(users, eq(users.id, applications.userId))
			.where(eq(applications.id, input.applicationId))
			.limit(1);
		if (!row) throw new Error(`Application ${input.applicationId} not found`);

		const year = new Date().getFullYear();
		const number = `B-${year}-${String(row.app.id).padStart(6, '0')}`;
		const approved = input.decision === 'bewilligt';
		const salutation = `${row.citizen.firstName} ${row.citizen.lastName}`;
		const bodyText = approved
			? `Sehr geehrte/r ${salutation},\n\nIhrem Antrag „${row.service.name}“ (Aktenzeichen ${row.app.reference}) wird stattgegeben.` +
				(input.reason ? `\n\n${input.reason}` : '') +
				`\n\nDie Entscheidung ergeht auf Grundlage von ${row.service.legalBasis}.`
			: `Sehr geehrte/r ${salutation},\n\nIhr Antrag „${row.service.name}“ (Aktenzeichen ${row.app.reference}) wird abgelehnt.` +
				`\n\nBegründung: ${input.reason ?? 'Die Voraussetzungen sind nicht erfüllt.'}` +
				`\n\nDie Entscheidung ergeht auf Grundlage von ${row.service.legalBasis}.`;

		const message = await notify(tx, {
			userId: row.app.userId,
			applicationId: row.app.id,
			kind: 'bescheid',
			subject: `Bescheid: ${row.service.name} – ${approved ? 'bewilligt' : 'abgelehnt'}`,
			body: `Ihr Bescheid zum Antrag ${row.app.reference} liegt bereit.`,
			fromName: row.office.name,
			requiredTrust: 'hoch'
		});

		const [bescheid] = await tx
			.insert(bescheide)
			.values({
				applicationId: row.app.id,
				messageId: message.id,
				decision: input.decision,
				number,
				bodyText,
				rechtsbehelf: RECHTSBEHELFSBELEHRUNG,
				verificationCode: newVerificationCode(),
				issuedById: input.issuedById
			})
			.returning();

		await tx
			.update(applications)
			.set({
				status: input.decision,
				assignedToId: input.issuedById ?? row.app.assignedToId,
				decidedAt: new Date(),
				updatedAt: new Date()
			})
			.where(eq(applications.id, row.app.id));
		await addEvent(tx, row.app.id, input.decision, input.reason ?? null, input.issuedById);

		return { bescheid, message };
	});
}

export type { Application };
