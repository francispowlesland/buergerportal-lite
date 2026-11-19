import { randomBytes } from 'node:crypto';
import { and, eq, gt } from 'drizzle-orm';
import type { Cookies } from '@sveltejs/kit';
import { db, sessions, users } from '#lib/server/db/index.ts';
import type { TrustLevel } from '#lib/trust.ts';

export const SESSION_COOKIE = 'sid';
const SESSION_HOURS = 8;

export async function createSession(cookies: Cookies, userId: number, trust: TrustLevel) {
	// One live session per browser: replace whatever was there.
	const old = cookies.get(SESSION_COOKIE);
	if (old) await db.delete(sessions).where(eq(sessions.id, old));

	const id = randomBytes(24).toString('hex');
	const expiresAt = new Date(Date.now() + SESSION_HOURS * 3600_000);
	await db.insert(sessions).values({ id, userId, trustLevel: trust, expiresAt });
	cookies.set(SESSION_COOKIE, id, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: false, // demo runs on http://localhost
		expires: expiresAt
	});
}

export async function destroySession(cookies: Cookies) {
	const id = cookies.get(SESSION_COOKIE);
	if (id) await db.delete(sessions).where(eq(sessions.id, id));
	cookies.delete(SESSION_COOKIE, { path: '/' });
}

/** Raise the trust level of the live session (step-up authentication). */
export async function raiseTrust(sessionId: string, trust: TrustLevel) {
	await db.update(sessions).set({ trustLevel: trust }).where(eq(sessions.id, sessionId));
}

export async function loadSession(sessionId: string) {
	const [row] = await db
		.select({ user: users, trust: sessions.trustLevel })
		.from(sessions)
		.innerJoin(users, eq(users.id, sessions.userId))
		.where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())))
		.limit(1);
	return row ?? null;
}
