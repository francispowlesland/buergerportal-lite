import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireUser } from '#lib/server/auth/guards.ts';
import { efaFields, getServiceBySlug } from '#lib/server/services.ts';
import { meetsTrust } from '#lib/trust.ts';

async function loadEfaService(slug: string) {
	const service = await getServiceBySlug(slug);
	if (!service || service.action !== 'efa' || !service.efaProvider || !service.efaUrl) {
		error(404, 'Diese Leistung wird nicht über einen anderen Dienstleister angeboten.');
	}
	return { ...service, efaProvider: service.efaProvider, efaUrl: service.efaUrl };
}

export const load: PageServerLoad = async ({ params, locals }) => {
	const service = await loadEfaService(params.slug);
	const signedIn = locals.user && locals.trust ? { user: locals.user, trust: locals.trust } : null;

	return {
		service: {
			slug: service.slug,
			name: service.name,
			requiredTrust: service.requiredTrust,
			efaProvider: service.efaProvider,
			efaUrl: service.efaUrl,
			officeName: service.office.name
		},
		trust: signedIn?.trust ?? null,
		persona: signedIn ? `${signedIn.user.firstName} ${signedIn.user.lastName}` : null,
		fields: signedIn ? efaFields(signedIn.user, signedIn.trust) : [],
		stepUpNeeded: !meetsTrust(signedIn?.trust, service.requiredTrust)
	};
};

export const actions: Actions = {
	/** Simulated handoff: validates consent and returns exactly what would be transmitted. */
	default: async ({ params, request, locals, url }) => {
		const service = await loadEfaService(params.slug);
		// Anonymous or too-low session → login / step-up, then back here.
		const { user, trust } = requireUser({ locals, url }, service.requiredTrust);

		const form = await request.formData();
		if (form.get('consent') !== 'on') {
			return fail(400, {
				consentError: `Bitte stimmen Sie der Datenübermittlung an ${service.efaProvider} zu. Ohne Ihre Zustimmung können wir Sie nicht weiterleiten.`
			});
		}

		return {
			transferred: {
				provider: service.efaProvider,
				url: service.efaUrl,
				at: new Date().toISOString(),
				fields: efaFields(user, trust).flatMap((f) =>
					f.value === null ? [] : [{ label: f.label, value: f.value }]
				)
			}
		};
	}
};
