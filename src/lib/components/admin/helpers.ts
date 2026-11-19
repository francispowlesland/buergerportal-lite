import { formatDate } from '#lib/format.ts';

/** Pure helpers shared by server queries and admin components (no server imports). */

/** Submissions older than this many days are flagged in queues. */
export const URGENT_DAYS = 5;

export const DAY_MS = 86_400_000;

export function daysOpenText(days: number): string {
	return days === 1 ? 'seit 1 Tag offen' : `seit ${days} Tagen offen`;
}

export function ageText(days: number): string {
	if (days <= 0) return 'heute';
	return days === 1 ? '1 Tag' : `${days} Tage`;
}

/** Whole days between `from` and `now`. */
export function ageInDays(from: Date | string | null | undefined, now = new Date()): number | null {
	if (!from) return null;
	return Math.max(0, Math.floor((now.getTime() - new Date(from).getTime()) / DAY_MS));
}

/** Keeps only the last three digits of the Steuer-ID visible. */
export function maskSteuerId(id: string | null | undefined): string {
	if (!id) return 'nicht hinterlegt';
	return '•'.repeat(Math.max(id.length - 3, 0)) + id.slice(-3);
}

export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} Byte`;
	const kb = bytes / 1024;
	if (kb < 1024) return `${Math.round(kb)} KB`;
	return `${(kb / 1024).toLocaleString('de-DE', { maximumFractionDigits: 1 })} MB`;
}

export function median(values: number[]): number | null {
	if (values.length === 0) return null;
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	const lower = sorted[mid - 1] ?? 0;
	const upper = sorted[mid] ?? 0;
	return sorted.length % 2 ? upper : (lower + upper) / 2;
}

/** Labels of the audit-trail entries (`applicationEvents.kind`). */
export const EVENT_KIND: Record<string, string> = {
	erstellt: 'Antrag angelegt',
	eingereicht: 'Antrag eingereicht',
	in_pruefung: 'Prüfung begonnen',
	zugewiesen: 'Zuweisung',
	nachforderung: 'Nachweise nachgefordert',
	nachgereicht: 'Nachweise nachgereicht',
	bewilligt: 'Antrag bewilligt',
	abgelehnt: 'Antrag abgelehnt',
	nachricht: 'Nachricht'
};

export function eventLabel(kind: string): string {
	return EVENT_KIND[kind] ?? humanise(kind);
}

export function humanise(key: string): string {
	const spaced = key
		.replace(/([a-z\d])([A-Z])/g, '$1 $2')
		.replace(/[_-]+/g, ' ')
		.trim();
	return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/* ───────────── Antragsdaten lesbar machen ───────────── */

export type DataField = { label: string; value: string | string[] };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function asText(v: unknown): string {
	if (v === null || v === undefined || v === '') return 'keine Angabe';
	if (typeof v === 'boolean') return v ? 'Ja' : 'Nein';
	if (typeof v === 'number') return JSON.stringify(v) ?? '';
	if (typeof v === 'string') return ISO_DATE.test(v) ? formatDate(v) : v;
	if (Array.isArray(v)) return v.map(asText).join(', ');
	if (typeof v === 'object') {
		return Object.entries(v as Record<string, unknown>)
			.map(([k, x]) => `${humanise(k)}: ${asText(x)}`)
			.join(', ');
	}
	return JSON.stringify(v) ?? '';
}

function asValue(v: unknown): string | string[] {
	if (Array.isArray(v)) return v.length ? v.map(asText) : 'keine';
	if (v && typeof v === 'object') {
		return Object.entries(v as Record<string, unknown>).map(
			([k, x]) => `${humanise(k)}: ${asText(x)}`
		);
	}
	return asText(v);
}

const pick = (map: Record<string, string>) => (v: unknown) => map[String(v)] ?? asText(v);

type FieldSpec = { key: string; label: string; format?: (v: unknown) => string | string[] };

const address = (v: unknown): string => {
	if (v && typeof v === 'object') {
		const a = v as { street?: string; postalCode?: string; city?: string };
		return `${a.street ?? ''}, ${a.postalCode ?? ''} ${a.city ?? ''}`.trim();
	}
	return asText(v);
};

const SPECS: Record<string, FieldSpec[]> = {
	meldebescheinigung: [
		{
			key: 'zweck',
			label: 'Verwendungszweck',
			format: pick({
				arbeitgeber: 'Vorlage beim Arbeitgeber',
				behoerde: 'Vorlage bei einer Behörde',
				bank: 'Vorlage bei einer Bank',
				sonstiges: 'Sonstiges'
			})
		},
		{ key: 'anzahl', label: 'Anzahl Ausfertigungen' },
		{
			key: 'uebermittlung',
			label: 'Übermittlung',
			format: pick({ postkorb: 'Elektronisch im Postkorb', post: 'Per Post' })
		},
		{ key: 'bestaetigt', label: 'Richtigkeit der Angaben bestätigt' }
	],
	anwohnerparkausweis: [
		{ key: 'kennzeichen', label: 'Kennzeichen' },
		{
			key: 'fahrzeugart',
			label: 'Fahrzeugart',
			format: pick({ pkw: 'Pkw', motorrad: 'Motorrad', carsharing: 'Carsharing-Fahrzeug' })
		},
		{
			key: 'halter',
			label: 'Halterverhältnis',
			format: pick({
				selbst: 'Antragsteller/in ist Halter/in',
				andere: 'Andere Person ist Halter/in'
			})
		},
		{ key: 'parkzone', label: 'Parkzone', format: (v) => `Zone ${asText(v)}` },
		{
			key: 'zulassungGeprueft',
			label: 'Zulassungsbescheinigung (automatische Prüfung)',
			format: (v) => (v === true ? 'Geprüft' : 'Nicht geprüft')
		},
		{ key: 'laufzeitMonate', label: 'Laufzeit', format: (v) => `${asText(v)} Monate` },
		{ key: 'nachweise', label: 'Angegebene Nachweise' }
	],
	briefwahl: [
		{ key: 'wahl', label: 'Wahl' },
		{ key: 'wahlDatum', label: 'Wahltag' },
		{ key: 'wahlbezirk', label: 'Wahlbezirk' },
		{ key: 'wahlbenachrichtigungsnummer', label: 'Wahlbenachrichtigungsnummer' },
		{
			key: 'zustellung',
			label: 'Zustellung der Unterlagen',
			format: pick({
				wohnanschrift: 'An die Wohnanschrift',
				abweichend: 'An eine abweichende Anschrift'
			})
		},
		{ key: 'abweichendeAnschrift', label: 'Abweichende Anschrift', format: address }
	]
};

/**
 * Turns `applications.data` into labelled rows. Known wizards get proper labels and wording;
 * unknown wizards or additional keys fall back to a generic, humanised rendering.
 */
export function describeData(
	wizardSlug: string | null | undefined,
	data: Record<string, unknown> | null | undefined
): DataField[] {
	const source = data && typeof data === 'object' ? data : {};
	const specs = (wizardSlug && SPECS[wizardSlug]) || [];
	const known = new Set(specs.map((s) => s.key));

	const fields: DataField[] = [];
	for (const spec of specs) {
		if (!(spec.key in source)) continue;
		const v = source[spec.key];
		fields.push({ label: spec.label, value: spec.format ? spec.format(v) : asValue(v) });
	}
	for (const [key, v] of Object.entries(source)) {
		if (known.has(key)) continue;
		fields.push({ label: humanise(key), value: asValue(v) });
	}
	return fields;
}
