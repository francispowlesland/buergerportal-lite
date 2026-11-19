import { db, defects, defectUpdates } from '#lib/server/db/index.ts';
import { desc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const reference = params.reference;

	const [defect] = await db
		.select({
			id: defects.id,
			reference: defects.reference,
			category: defects.category,
			title: defects.title,
			description: defects.description,
			address: defects.address,
			lat: defects.lat,
			lng: defects.lng,
			status: defects.status,
			photoName: defects.photoName,
			createdAt: defects.createdAt
			// NOTE: reporterId is intentionally omitted or NOT leaked to preserve privacy!
		})
		.from(defects)
		.where(eq(defects.reference, reference))
		.limit(1);

	if (!defect) {
		error(404, `Meldung mit Aktenzeichen ${reference} wurde nicht gefunden.`);
	}

	const updates = await db
		.select({
			id: defectUpdates.id,
			status: defectUpdates.status,
			note: defectUpdates.note,
			authorName: defectUpdates.authorName,
			createdAt: defectUpdates.createdAt
		})
		.from(defectUpdates)
		.where(eq(defectUpdates.defectId, defect.id))
		.orderBy(desc(defectUpdates.createdAt), desc(defectUpdates.id));

	const isNew = url.searchParams.get('erfolg') === '1';

	return {
		defect,
		updates,
		isNew
	};
};
