export const WAHL_NAME = 'Oberbürgermeisterwahl Musterstadt';

/** Districts mapped by 2-digit district code. */
export const WAHLBEZIRKE: Record<string, string> = {
	'01': 'Wahlbezirk 01 – Rathaus Altstadt',
	'02': 'Wahlbezirk 02 – Stadthaus West',
	'03': 'Wahlbezirk 03 – Rathaus Mitte',
	'04': 'Wahlbezirk 04 – Realschule Mitte',
	'05': 'Wahlbezirk 05 – Gymnasium Süd',
	'06': 'Wahlbezirk 06 – Gesamtschule West',
	'07': 'Wahlbezirk 07 – Grundschule Nord',
	'08': 'Wahlbezirk 08 – Bürgerhaus Ost',
	'09': 'Wahlbezirk 09 – Turnhalle Süd',
	'10': 'Wahlbezirk 10 – Stadtbibliothek',
	'11': 'Wahlbezirk 11 – Kulturzentrum Nord',
	'12': 'Wahlbezirk 12 – Gemeindehaus Süd',
	'13': 'Wahlbezirk 13 – Seniorenzentrum West',
	'14': 'Wahlbezirk 14 – Schützenhaus Ost',
	'15': 'Wahlbezirk 15 – Grundschule am Park'
};

/** Compute the next election Sunday ~3.5 weeks (24 days) from today. */
export function getElectionDate(): string {
	const target = new Date();
	target.setDate(target.getDate() + 24);
	// Move to Sunday: 0 is Sunday
	const day = target.getDay();
	const diff = (7 - day) % 7;
	target.setDate(target.getDate() + diff);
	return target.toISOString().slice(0, 10);
}

/** Format Wahlbenachrichtigungsnummer regex: WB-07-004711 */
export const WAHLBENACHRICHTIGUNG_REGEX = /^WB-\d{2}-\d{6}$/;

/** Resolve district name from a Wahlbenachrichtigungsnummer. */
export function resolveWahlbezirk(nummer: string): string {
	const trimmed = nummer.trim().toUpperCase();
	const match = trimmed.match(/^WB-(\d{2})-\d{6}$/);
	if (match) {
		const code = match[1];
		if (WAHLBEZIRKE[code]) {
			return WAHLBEZIRKE[code];
		}
		return `Wahlbezirk ${code} – Wahllokal ${code}`;
	}
	return 'Wahlbezirk 07 – Grundschule Nord';
}
