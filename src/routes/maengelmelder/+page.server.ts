import { db, defects, type DefectCategory, type DefectStatus } from '#lib/server/db/index.ts';
import { and, count, desc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

const VALID_STATUSES: DefectStatus[] = ['gemeldet', 'in_bearbeitung', 'behoben'];
const VALID_CATEGORIES: DefectCategory[] = [
	'schlagloch',
	'strassenbeleuchtung',
	'graffiti',
	'illegale_muellablagerung',
	'spielplatz',
	'sonstiges'
];

export const load: PageServerLoad = async ({ url }) => {
	const statusParam = url.searchParams.get('status');
	const categoryParam = url.searchParams.get('category');
	const viewParam = url.searchParams.get('view') || 'map'; // 'map' | 'list'

	const selectedStatus =
		statusParam && VALID_STATUSES.includes(statusParam as DefectStatus)
			? (statusParam as DefectStatus)
			: null;

	const selectedCategory =
		categoryParam && VALID_CATEGORIES.includes(categoryParam as DefectCategory)
			? (categoryParam as DefectCategory)
			: null;

	// Build WHERE conditions
	const conditions = [];
	if (selectedStatus) {
		conditions.push(eq(defects.status, selectedStatus));
	}
	if (selectedCategory) {
		conditions.push(eq(defects.category, selectedCategory));
	}

	const defectList = await db
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
		})
		.from(defects)
		.where(conditions.length > 0 ? and(...conditions) : undefined)
		.orderBy(desc(defects.createdAt));
	const statusCounts = await db
		.select({ status: defects.status, n: count() })
		.from(defects)
		.where(selectedCategory ? eq(defects.category, selectedCategory) : undefined)
		.groupBy(defects.status);
	const totalFor = (status: DefectStatus) =>
		statusCounts.find((row) => row.status === status)?.n ?? 0;

	return {
		defects: defectList,
		selectedStatus,
		selectedCategory,
		view: viewParam === 'list' ? 'list' : 'map',
		stats: {
			total: statusCounts.reduce((total, row) => total + row.n, 0),
			gemeldet: totalFor('gemeldet'),
			inBearbeitung: totalFor('in_bearbeitung'),
			behoben: totalFor('behoben')
		}
	};
};
