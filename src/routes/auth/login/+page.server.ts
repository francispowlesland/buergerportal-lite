import { fail, redirect } from '@sveltejs/kit';
import { eq, or } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db, users } from '#lib/server/db/index.ts';
import { createSession, raiseTrust } from '#lib/server/auth/session.ts';
import { safePath } from '#lib/server/auth/redirect.ts';
import { HOME } from '#lib/personas.ts';
import { TRUST_LEVELS, meetsTrust, trustRank, type TrustLevel } from '#lib/trust.ts';

/** Demo credentials. Shown on the page so presenters never get stuck. */
const DEMO_PASSWORD = 'demo1234';
const DEMO_CODE = '123456';

export const load: PageServerLoad = async ({ locals, url }) => {
	const min = url.searchParams.get('min');
	const required = (TRUST_LEVELS as readonly string[]).includes(min ?? '')
		? (min as TrustLevel)
		: null;
	const redirectTo = safePath(url.searchParams.get('redirectTo'), '');

	// Already good enough? Nothing to do here.
	if (locals.user && locals.trust && (!required || meetsTrust(locals.trust, required))) {
		redirect(303, redirectTo || HOME[locals.user.role]);
	}

	const demoUsers = await db
		.select({
			slug: users.slug,
			firstName: users.firstName,
			lastName: users.lastName,
			maxTrust: users.maxTrust,
			role: users.role
		})
		.from(users)
		.where(or(eq(users.slug, 'max'), eq(users.slug, 'erika'), eq(users.slug, 'hans')));

	return { required, redirectTo, demoUsers };
};

export const actions: Actions = {
	/**
	 * Verifies a credential for one Vertrauensniveau.
	 * Anonymous → creates a session. Signed in → raises the trust of the live session (Step-up).
	 */
	verify: async ({ request, locals, cookies }) => {
		const f = await request.formData();
		const level = f.get('level');
		if (typeof level !== 'string' || !(TRUST_LEVELS as readonly string[]).includes(level)) {
			return fail(400, { message: 'Unbekanntes Vertrauensniveau.' });
		}
		const wanted = level as TrustLevel;
		const redirectTo = safePath(f.get('redirectTo'), '');

		// Who is authenticating? The live session, or the account named in the form.
		let user = locals.user;
		if (!user) {
			const username = f.get('username');
			const name = typeof username === 'string' ? username.trim().toLowerCase() : '';
			if (!name) return fail(400, { message: 'Bitte geben Sie Ihren Benutzernamen an.' });
			const all = await db.select().from(users);
			user =
				all.find(
					(u) =>
						u.slug === name ||
						u.email.toLowerCase() === name ||
						u.email.split('@')[0].toLowerCase() === name
				) ?? null;
			if (!user)
				return fail(401, { message: 'Benutzername oder Zugangsdaten sind nicht korrekt.' });
		}

		// Check the credential for the chosen level.
		if (wanted === 'basis') {
			if (f.get('password') !== DEMO_PASSWORD) {
				return fail(401, { message: 'Benutzername oder Passwort sind nicht korrekt.' });
			}
		} else if (wanted === 'substanziell') {
			if (f.get('code') !== DEMO_CODE) {
				return fail(401, { message: 'Der Bestätigungscode ist nicht korrekt.' });
			}
		} else {
			const pin = f.get('pin');
			if (typeof pin !== 'string' || !/^\d{6}$/.test(pin))
				return fail(400, { message: 'Die PIN hat genau 6 Ziffern.' });
			if (pin !== DEMO_CODE) {
				return fail(401, { message: 'Die PIN ist nicht korrekt. Bitte versuchen Sie es erneut.' });
			}
		}

		// Can this account reach that level at all?
		if (trustRank(user.maxTrust) < trustRank(wanted)) {
			return fail(403, {
				message:
					wanted === 'hoch'
						? 'Bei diesem Personalausweis ist die Online-Ausweisfunktion nicht aktiviert. Aktivieren Sie sie bei Ihrem Bürgeramt.'
						: 'Für dieses Konto ist kein ELSTER-Zertifikat hinterlegt.'
			});
		}

		if (locals.sessionId && locals.user?.id === user.id) {
			if (trustRank(wanted) > trustRank(locals.trust ?? 'basis')) {
				await raiseTrust(locals.sessionId, wanted);
			}
		} else {
			await createSession(cookies, user.id, wanted);
		}
		redirect(303, redirectTo || HOME[user.role]);
	}
};
