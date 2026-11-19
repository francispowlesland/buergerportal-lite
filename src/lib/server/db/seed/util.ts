import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from '../schema';

export type Db = PostgresJsDatabase<typeof schema>;

/** Lookup of seeded rows: natural key (slug, reference …) → database id. */
export type Ids = Record<string, number>;

export const NOW = new Date();

const berlinFormat = new Intl.DateTimeFormat('en-GB', {
	timeZone: 'Europe/Berlin',
	year: 'numeric',
	month: 'numeric',
	day: 'numeric',
	hour: 'numeric',
	minute: 'numeric',
	hourCycle: 'h23'
});

type WallClock = { year: number; month: number; day: number; hour: number; minute: number };

/** Wall-clock time in Europe/Berlin for the given instant. */
function berlinParts(date: Date): WallClock {
	const out: WallClock = { year: 0, month: 0, day: 0, hour: 0, minute: 0 };
	for (const part of berlinFormat.formatToParts(date)) {
		if (part.type in out) out[part.type as keyof WallClock] = Number(part.value);
	}
	return out;
}

/**
 * The instant at which the Berlin wall clock shows `hour:minute`, `dayOffset` calendar days from
 * today (negative = past).
 */
export function berlinTime(dayOffset: number, hour: number, minute = 0): Date {
	const today = berlinParts(NOW);
	const wall = Date.UTC(today.year, today.month - 1, today.day + dayOffset, hour, minute);
	const shown = berlinParts(new Date(wall));
	const shownAsUtc = Date.UTC(shown.year, shown.month - 1, shown.day, shown.hour, shown.minute);
	return new Date(wall - (shownAsUtc - wall));
}

/** Shorthand for a moment in the past, given as days ago at a Berlin wall-clock time. */
export function daysAgoAt(days: number, hour: number, minute = 0): Date {
	return berlinTime(-days, hour, minute);
}

export function plusMinutes(date: Date, minutes: number): Date {
	return new Date(date.getTime() + minutes * 60_000);
}

export function plusHours(date: Date, hours: number): Date {
	return plusMinutes(date, hours * 60);
}

function weekdayOf(dayOffset: number): number {
	const today = berlinParts(NOW);
	return new Date(Date.UTC(today.year, today.month - 1, today.day + dayOffset)).getUTCDay();
}

/** First weekday on or after `dayOffset` (direction 1) or on or before it (direction -1). */
export function weekday(dayOffset: number, direction: 1 | -1 = 1): number {
	let offset = dayOffset;
	while (weekdayOf(offset) === 0 || weekdayOf(offset) === 6) offset += direction;
	return offset;
}

/** Day offsets of the next `count` weekdays, starting tomorrow. */
export function nextWeekdays(count: number): number[] {
	const out: number[] = [];
	let offset = 1;
	while (out.length < count) {
		offset = weekday(offset);
		out.push(offset);
		offset += 1;
	}
	return out;
}

/** ISO date (YYYY-MM-DD) of the first Sunday on or after `dayOffset` days from today. */
export function isoSunday(dayOffset: number): string {
	let offset = dayOffset;
	while (weekdayOf(offset) !== 0) offset += 1;
	const today = berlinParts(NOW);
	const date = new Date(Date.UTC(today.year, today.month - 1, today.day + offset));
	return date.toISOString().slice(0, 10);
}

export function formatDateDe(date: Date): string {
	return new Intl.DateTimeFormat('de-DE', {
		timeZone: 'Europe/Berlin',
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	}).format(date);
}

export function formatTimeDe(date: Date): string {
	return new Intl.DateTimeFormat('de-DE', {
		timeZone: 'Europe/Berlin',
		hour: '2-digit',
		minute: '2-digit'
	}).format(date);
}

/** Looks up a seeded id and fails loudly when the key is unknown. */
export function idOf(ids: Ids, key: string, what: string): number {
	const id = ids[key];
	if (id === undefined) throw new Error(`Seed: unknown ${what} "${key}"`);
	return id;
}
