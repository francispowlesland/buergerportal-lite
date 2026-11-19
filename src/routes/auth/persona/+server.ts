import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { db, users } from '#lib/server/db/index.ts';
import { createSession, destroySession } from '#lib/server/auth/session.ts';
import { safePath } from '#lib/server/auth/redirect.ts';
import { HOME, PERSONAS } from '#lib/personas.ts';

/** Demo-only: jump straight into a persona at its showcase trust level. */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const form = await request.formData();
	const persona = PERSONAS.find((p) => p.key === form.get('persona'));
	if (!persona) error(400, 'Unbekannte Demo-Rolle');

	const path = safePath(form.get('redirectTo'), '/');

	if (!persona.slug || !persona.trust) {
		await destroySession(cookies);
		redirect(303, path.startsWith('/auth') ? '/' : path);
	}

	const [user] = await db.select().from(users).where(eq(users.slug, persona.slug)).limit(1);
	if (!user) error(500, 'Demo-Nutzer fehlt. Bitte "npm run db:seed" ausführen.');
	await createSession(cookies, user.id, persona.trust);

	// Keep the page if it still makes sense for the role, otherwise go to the role's home.
	const caseworkerPath = path.startsWith('/sachbearbeiter');
	const citizenOnly = /^\/(mein-buergerportal|postkorb|antrag)/.test(path);
	if (user.role === 'caseworker' && !caseworkerPath && citizenOnly) redirect(303, HOME.caseworker);
	if (user.role === 'citizen' && caseworkerPath) redirect(303, HOME.citizen);
	redirect(303, path.startsWith('/auth') ? HOME[user.role] : path);
};
