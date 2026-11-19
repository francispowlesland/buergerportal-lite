import type { Handle } from '@sveltejs/kit/hooks';
import { SESSION_COOKIE, loadSession } from '#lib/server/auth/session.ts';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = null;
	event.locals.trust = null;
	event.locals.sessionId = null;

	const sid = event.cookies.get(SESSION_COOKIE);
	if (sid) {
		const session = await loadSession(sid);
		if (session) {
			event.locals.user = session.user;
			event.locals.trust = session.trust;
			event.locals.sessionId = sid;
		} else {
			event.cookies.delete(SESSION_COOKIE, { path: '/' });
		}
	}

	return resolve(event);
};
