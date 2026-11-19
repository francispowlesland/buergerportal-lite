import { MAP_BOUNDS, MAP_CENTER } from '#lib/geo.ts';
import type { DefectCategory } from '#lib/server/db/schema.ts';

const CATEGORIES: DefectCategory[] = [
	'schlagloch',
	'strassenbeleuchtung',
	'graffiti',
	'illegale_muellablagerung',
	'spielplatz',
	'sonstiges'
];

export function validateReport(data: FormData) {
	const text = (key: string) => {
		const value = data.get(key);
		return typeof value === 'string' ? value.trim() : '';
	};
	const category = CATEGORIES.find((value) => value === text('category'));
	const title = text('title');
	const description = text('description');
	const address = text('address');
	const lat = text('lat') ? Number(text('lat')) : NaN;
	const lng = text('lng') ? Number(text('lng')) : NaN;
	const photoName = text('photoName') || null;
	const errors: Record<string, string> = {};

	if (!category) errors.category = 'Bitte wählen Sie eine gültige Kategorie aus.';
	if (title.length < 5 || title.length > 200)
		errors.title = 'Bitte geben Sie einen Titel mit 5 bis 200 Zeichen an.';
	if (description.length < 10 || description.length > 2000)
		errors.description = 'Bitte beschreiben Sie den Mangel mit 10 bis 2000 Zeichen.';
	if (address.length < 3 || address.length > 300)
		errors.address = 'Bitte geben Sie eine Ortsangabe mit 3 bis 300 Zeichen an.';
	if (
		!Number.isFinite(lat) ||
		!Number.isFinite(lng) ||
		lat < MAP_BOUNDS.south ||
		lat > MAP_BOUNDS.north ||
		lng < MAP_BOUNDS.west ||
		lng > MAP_BOUNDS.east
	)
		errors.coords = 'Bitte wählen Sie einen gültigen Standort innerhalb von Musterstadt aus.';
	if (
		photoName &&
		// eslint-disable-next-line no-control-regex -- reject control characters in public filenames
		(photoName.length > 255 || !/^[^/\\\u0000-\u001f]+\.(jpe?g|png|webp)$/i.test(photoName))
	)
		errors.photoName =
			'Bitte wählen Sie ein Foto im Format JPG, PNG oder WEBP mit gültigem Dateinamen.';
	if (data.get('photoName') instanceof File)
		errors.photoName = 'Bitte übermitteln Sie nur den Namen des simulierten Fotos.';

	return {
		category,
		errors,
		values: {
			category: category ?? '',
			title,
			description,
			address,
			lat: Number.isFinite(lat) ? lat : MAP_CENTER.lat,
			lng: Number.isFinite(lng) ? lng : MAP_CENTER.lng,
			photoName
		}
	};
}
