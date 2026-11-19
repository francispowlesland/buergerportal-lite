import type { PageServerLoad } from './$types';
import { requireCaseworker } from '#lib/server/auth/guards.ts';
import {
	countDefects,
	loadDefects,
	loadKpis,
	loadQueue,
	loadSchedule,
	OPEN_DEFECT_STATUSES
} from './data.server.ts';

export const load: PageServerLoad = async ({ parent, locals, url }) => {
	requireCaseworker({ locals, url });
	const { scope } = await parent();
	const [kpis, queue, nachforderungen, schedule, defects, defectCounts] = await Promise.all([
		loadKpis(scope),
		loadQueue(scope, ['eingereicht', 'in_pruefung'], { limit: 8 }),
		loadQueue(scope, ['nachforderung'], { limit: 5 }),
		loadSchedule(scope, 3),
		loadDefects(OPEN_DEFECT_STATUSES, { limit: 6 }),
		countDefects()
	]);
	return { kpis, queue, nachforderungen, schedule, defects, defectCounts };
};
