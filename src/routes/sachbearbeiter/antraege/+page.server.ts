import type { PageServerLoad } from './$types';
import type { ApplicationStatus } from '#lib/server/db/schema.ts';
import { requireCaseworker } from '#lib/server/auth/guards.ts';
import { loadQueue, OPEN_APPLICATION_STATUSES } from '../data.server.ts';

const FILTERS: Record<string, ApplicationStatus[]> = {
	offen: OPEN_APPLICATION_STATUSES,
	eingereicht: ['eingereicht'],
	in_pruefung: ['in_pruefung'],
	nachforderung: ['nachforderung'],
	entschieden: ['bewilligt', 'abgelehnt']
};

export const load: PageServerLoad = async ({ parent, url, locals }) => {
	requireCaseworker({ locals, url });
	const { scope } = await parent();
	const requested = url.searchParams.get('status') ?? 'offen';
	const status = Object.hasOwn(FILTERS, requested) ? requested : 'offen';
	const rows = await loadQueue(scope, FILTERS[status] ?? OPEN_APPLICATION_STATUSES, {
		limit: 200,
		oldestFirst: status !== 'entschieden'
	});
	return { rows, status };
};
