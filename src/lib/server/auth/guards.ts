import { error, redirect } from '@sveltejs/kit';
import { meetsTrust, type TrustLevel } from '#lib/trust.ts';

type Ctx = { locals: App.Locals; url: URL };

function loginUrl(url: URL, min?: TrustLevel) {
	const q = new URLSearchParams({ redirectTo: url.pathname + url.search });
	if (min) q.set('min', min);
	return `/auth/login?${q}`;
}

/** Require a signed-in citizen or caseworker. Redirects anonymous visitors to the BundID login. */
export function requireUser({ locals, url }: Ctx, min?: TrustLevel) {
	if (!locals.user || !locals.trust) redirect(303, loginUrl(url, min));
	if (min && !meetsTrust(locals.trust, min)) redirect(303, loginUrl(url, min));
	return { user: locals.user, trust: locals.trust };
}

/** Require a signed-in citizen (caseworkers are redirected to their own workspace). */
export function requireCitizen(ctx: Ctx, min?: TrustLevel) {
	const s = requireUser(ctx, min);
	if (s.user.role !== 'citizen') redirect(303, '/sachbearbeiter');
	return s;
}

/** Require a caseworker. Anonymous → login; citizens → 403. */
export function requireCaseworker(ctx: Ctx) {
	const s = requireUser(ctx);
	if (s.user.role !== 'caseworker')
		error(403, 'Dieser Bereich ist Sachbearbeiterinnen und Sachbearbeitern vorbehalten.');
	return s;
}
