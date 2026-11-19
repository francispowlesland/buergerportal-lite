/** Client-safe helpers for the Behördenwegweiser: search folding and scoring, A–Z grouping, fee text. */
import { formatFee } from '#lib/format.ts';

/**
 * Two foldings of a text. A word matches when it matches in EITHER folding, so that
 * "Bürgeramt", "Buergeramt" and "Burgeramt" all find "Bürgeramt", while "neu" still finds "neue".
 *  - plain: strip diacritics (ä → a, ß → ss)
 *  - expanded: German transliteration (ä → ae, ö → oe, ü → ue, ß → ss)
 */
type Folded = { plain: string; expanded: string };

function fold(text: string): Folded {
	const lower = text.toLowerCase().replace(/ß/g, 'ss');
	const expanded = lower.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue');
	const plain = lower.normalize('NFD').replace(/\p{M}/gu, '');
	return { plain, expanded: expanded.normalize('NFD').replace(/\p{M}/gu, '') };
}

type SearchableService = {
	name: string;
	summary: string;
	keywords: string[];
	officeName: string;
};

/** Pre-fold the searchable fields of a service once; reuse for every keystroke. */
export function searchIndex(s: SearchableService) {
	return {
		name: fold(s.name),
		office: fold(s.officeName),
		keywords: fold(s.keywords.join(' \n ')),
		summary: fold(s.summary)
	};
}
export type SearchIndex = ReturnType<typeof searchIndex>;

const has = (haystack: Folded, needle: Folded) =>
	haystack.plain.includes(needle.plain) || haystack.expanded.includes(needle.expanded);

/** Weight of the best field a word is found in. Name hits count most. */
const WEIGHTS = { name: 10, keywords: 5, office: 3, summary: 1 } as const;

/**
 * Relevance of a service for a query. Every word must appear in some field (AND);
 * returns 0 when one does not. Hits in the name outrank keywords, office and summary,
 * and a name that starts with the word gets a small bonus.
 */
export function scoreQuery(index: SearchIndex, query: string): number {
	const words = query.trim().split(/\s+/).filter(Boolean);
	let total = 0;
	for (const word of words) {
		const f = fold(word);
		let best = 0;
		for (const field of ['name', 'keywords', 'office', 'summary'] as const) {
			if (has(index[field], f)) best = Math.max(best, WEIGHTS[field]);
		}
		if (best === 0) return 0;
		if (
			best === WEIGHTS.name &&
			(index.name.plain.startsWith(f.plain) || index.name.expanded.startsWith(f.expanded))
		)
			best += 2;
		total += best;
	}
	return Math.max(total, 1);
}

/** Register letter of a name: Ä → A, Ö → O, Ü → U; anything that is not A–Z goes under "#". */
export function letterOf(name: string): string {
	const first = fold(name.trim()).plain.charAt(0).toUpperCase();
	return /[A-Z]/.test(first) ? first : '#';
}

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function groupByLetter<T extends { name: string }>(items: T[]) {
	const groups = new Map<string, T[]>();
	for (const item of items) {
		const letter = letterOf(item.name);
		const list = groups.get(letter);
		if (list) list.push(item);
		else groups.set(letter, [item]);
	}
	return [...groups.entries()]
		.sort(([a], [b]) => a.localeCompare(b, 'de'))
		.map(([letter, entries]) => ({ letter, items: entries }));
}

/** "30,00 € pro Jahr", "kostenfrei", or the fee note when the base fee is zero. */
export function feeText(feeCents: number, feeNote: string | null): string {
	if (feeCents > 0) return feeNote ? `${formatFee(feeCents)} ${feeNote}` : formatFee(feeCents);
	return feeNote ?? formatFee(0);
}
