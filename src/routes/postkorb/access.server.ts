import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db, messages, type Message } from '#lib/server/db/index.ts';
import { requireCitizen } from '#lib/server/auth/guards.ts';
import { meetsTrust } from '#lib/trust.ts';

/**
 * Subject shown while a message is locked. The real subject can reveal the decision
 * ("… abgelehnt"), so it only leaves the server once the session level is high enough.
 */
export function lockedSubject(kind: Message['kind'], reference: string | null): string {
	if (kind === 'bescheid' && reference) return `Bescheid zu Ihrem Antrag ${reference}`;
	return 'Geschützte Nachricht';
}

/**
 * Loads one Postkorb message for the signed-in citizen.
 * Foreign and unknown ids both end in 404, so existence of other people's mail is not revealed.
 * `locked` = the live session level is below the level the message requires.
 */
export async function loadOwnedMessage(ctx: { locals: App.Locals; url: URL }, rawId: string) {
	const { user, trust } = requireCitizen(ctx);
	const id = /^\d{1,9}$/.test(rawId) ? Number(rawId) : NaN;
	if (!Number.isInteger(id)) error(404, 'Diese Nachricht wurde nicht gefunden.');

	const [message] = await db
		.select()
		.from(messages)
		.where(and(eq(messages.id, id), eq(messages.userId, user.id)))
		.limit(1);
	if (!message) error(404, 'Diese Nachricht wurde nicht gefunden.');

	return { user, trust, message, locked: !meetsTrust(trust, message.requiredTrust) };
}
