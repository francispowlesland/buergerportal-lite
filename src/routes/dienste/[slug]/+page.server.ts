import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getServiceBySlug, relatedServices } from '#lib/server/services.ts';

export const load: PageServerLoad = async ({ params, locals }) => {
	const service = await getServiceBySlug(params.slug);
	if (!service) error(404, 'Diese Leistung gibt es im Behördenwegweiser nicht.');

	return {
		service,
		related: await relatedServices(service),
		trust: locals.trust
	};
};
