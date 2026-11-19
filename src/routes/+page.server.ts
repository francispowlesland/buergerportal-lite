import { LEBENSLAGEN } from '#lib/labels.ts';
import { db, services } from '#lib/server/db/index.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const rows = await db.select({ lebenslagen: services.lebenslagen }).from(services);

	const counts = new Map<string, number>();
	for (const row of rows) {
		for (const key of row.lebenslagen) counts.set(key, (counts.get(key) ?? 0) + 1);
	}

	// Only life events that actually have services, in the order defined in labels.ts.
	const lebenslagen = Object.entries(LEBENSLAGEN)
		.filter(([key]) => counts.has(key))
		.map(([key, label]) => ({ key, label, count: counts.get(key) ?? 0 }));

	return { lebenslagen, serviceCount: rows.length };
};
