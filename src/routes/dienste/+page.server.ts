import type { PageServerLoad } from './$types';
import { listServices } from '#lib/server/services.ts';

// Deliberately independent of the URL: the filter runs on the client over this full list,
// so typing never triggers a reload.
export const load: PageServerLoad = async () => {
	return { services: await listServices() };
};
