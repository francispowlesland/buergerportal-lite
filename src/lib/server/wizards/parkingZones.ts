export type ParkingZoneInfo = {
	id: 'A' | 'B' | 'C' | 'D';
	name: string;
	description: string;
	streets: string[];
};

export const PARKING_ZONES: ParkingZoneInfo[] = [
	{
		id: 'A',
		name: 'Zone A – Altstadt & Stadtzentrum',
		description: 'Historischer Kern, Fußgängerzone und umliegende Wohnstraßen.',
		streets: ['Marktplatz', 'Domstraße', 'Schlossplatz', 'Rathausgasse', 'Krämerbrücke']
	},
	{
		id: 'B',
		name: 'Zone B – Nordviertel & Universitätsviertel',
		description: 'Nördliche Innenstadt, Wohnquartiere rund um Campus und Ringstraße.',
		streets: ['Nordallee', 'Universitätsstraße', 'Ringstraße', 'Campusallee', 'Goethestraße']
	},
	{
		id: 'C',
		name: 'Zone C – Südliche Vorstadt',
		description: 'Südliche Wohnquartiere zwischen Südbahnhof und Stadtpark.',
		streets: ['Gartenstraße', 'Parkring', 'Südbahnhofstraße', 'Lindenweg', 'Schillerstraße']
	},
	{
		id: 'D',
		name: 'Zone D – Westend & Gewerbepark',
		description: 'Westliche Wohn- und Mischgebiete mit hohem Gewerbe- und Pendleraufkommen.',
		streets: ['Westendstraße', 'Industriering', 'Am Wasserturm', 'Kanalstraße', 'Bahnhofsallee']
	}
];

/**
 * Deterministically derives the eligible resident parking zone from a street and postal code.
 */
export function deriveParkingZone(
	street?: string | null,
	postalCode?: string | null
): 'A' | 'B' | 'C' | 'D' {
	if (!street) return 'B';
	const s = street.toLowerCase();
	const exact = PARKING_ZONES.find((zone) =>
		zone.streets.some((name) => s.startsWith(name.toLowerCase()))
	);
	if (exact) return exact.id;

	if (
		s.includes('nord') ||
		s.includes('ring') ||
		s.includes('univ') ||
		s.includes('campus') ||
		s.includes('goethe')
	) {
		return 'B';
	}
	if (
		s.includes('altstadt') ||
		s.includes('dom') ||
		s.includes('markt') ||
		s.includes('schloss') ||
		s.includes('krämer')
	) {
		return 'A';
	}
	if (
		s.includes('süd') ||
		s.includes('garten') ||
		s.includes('park') ||
		s.includes('linden') ||
		s.includes('schiller')
	) {
		return 'C';
	}
	if (
		s.includes('west') ||
		s.includes('gewerbe') ||
		s.includes('industrie') ||
		s.includes('wasser') ||
		s.includes('kanal')
	) {
		return 'D';
	}

	// Simple hash fallback for any other street
	let hash = 0;
	const address = street + (postalCode ?? '');
	for (let i = 0; i < address.length; i++) {
		hash = (hash << 5) - hash + address.charCodeAt(i);
		hash |= 0;
	}
	const zones: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
	return zones[Math.abs(hash) % zones.length];
}

/** German license plate regex */
export const GERMAN_PLATE_REGEX = /^[A-ZÄÖÜ]{1,3}-[A-ZÄÖÜ]{1,2}\s?[1-9][0-9]{0,3}[EH]?$/i;

/** Format and validate a German license plate */
export function validateGermanPlate(plate: string): {
	valid: boolean;
	normalized: string;
	error?: string;
} {
	const trimmed = plate.trim().toUpperCase();
	if (!trimmed) {
		return {
			valid: false,
			normalized: '',
			error: 'Bitte geben Sie ein amtliches Kennzeichen ein.'
		};
	}

	// Normalize spacing: ensure single space before numbers if not present
	// E.g. "MS-AB1234" -> "MS-AB 1234"
	let formatted = trimmed;
	const match = formatted.match(/^([A-ZÄÖÜ]{1,3}-[A-ZÄÖÜ]{1,2})\s?([1-9][0-9]{0,3}[EH]?)$/);
	if (match) {
		formatted = `${match[1]} ${match[2]}`;
	}

	if (!GERMAN_PLATE_REGEX.test(formatted)) {
		return {
			valid: false,
			normalized: trimmed,
			error: 'Das Kennzeichen entspricht nicht dem deutschen Format (z. B. MS-AB 1234).'
		};
	}

	return { valid: true, normalized: formatted };
}
