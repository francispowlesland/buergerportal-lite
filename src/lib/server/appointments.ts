/**
 * Terminvereinbarung: slot model, availability, booking and calendar export.
 *
 * Everything above "Datenbank" is pure (no database, no SvelteKit) so that it can be checked with
 * `npx tsx src/lib/server/appointments.check.ts`. All wall-clock times are Europe/Berlin and are
 * turned into instants with Intl, never with the server's local zone.
 */
import { and, asc, count, desc, eq, gt, gte, lt, ne, sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import QRCode from 'qrcode';
import type {
	AppointmentView,
	CalendarCell,
	CalendarWeek,
	DayState
} from '#lib/components/appointments/types.ts';
import {
	appointments,
	locations,
	offices,
	services,
	type Appointment,
	type Location,
	type Service
} from './db/schema.ts';
import type * as schema from './db/schema.ts';

type Db = PostgresJsDatabase<typeof schema>;
/** Anything that can run a select: the database or a transaction. */
type Conn = Pick<Db, 'select'>;

export const TIME_ZONE = 'Europe/Berlin';
/** Bookable up to this many days ahead. */
export const HORIZON_DAYS = 28;
/** Slots starting sooner than this are not bookable any more. */
export const LEAD_MINUTES = 120;
/** A citizen may hold at most this many active future appointments. */
export const MAX_ACTIVE_APPOINTMENTS = 3;

// shortcut: national holidays are listed through 2027; extend before booking opens for 2028.
/** National public holidays (bundesweit), constant list; closed for all offices. */
export const HOLIDAYS: Readonly<Record<string, string>> = {
	'2026-01-01': 'Neujahr',
	'2026-04-03': 'Karfreitag',
	'2026-04-06': 'Ostermontag',
	'2026-05-01': 'Tag der Arbeit',
	'2026-05-14': 'Christi Himmelfahrt',
	'2026-05-25': 'Pfingstmontag',
	'2026-10-03': 'Tag der Deutschen Einheit',
	'2026-12-25': '1. Weihnachtstag',
	'2026-12-26': '2. Weihnachtstag',
	'2027-01-01': 'Neujahr',
	'2027-03-26': 'Karfreitag',
	'2027-03-29': 'Ostermontag',
	'2027-05-01': 'Tag der Arbeit',
	'2027-05-06': 'Christi Himmelfahrt',
	'2027-05-17': 'Pfingstmontag',
	'2027-10-03': 'Tag der Deutschen Einheit',
	'2027-12-25': '1. Weihnachtstag',
	'2027-12-26': '2. Weihnachtstag'
};

/* ───────────── Time zone and dates ───────────── */

const wallFormat = new Intl.DateTimeFormat('en-GB', {
	timeZone: TIME_ZONE,
	year: 'numeric',
	month: 'numeric',
	day: 'numeric',
	hour: 'numeric',
	minute: 'numeric',
	second: 'numeric',
	hourCycle: 'h23'
});

type Wall = { y: number; m: number; d: number; h: number; min: number; s: number };

/** Berlin wall clock for an instant. */
function wallParts(date: Date): Wall {
	const out: Wall = { y: 0, m: 0, d: 0, h: 0, min: 0, s: 0 };
	const key = {
		year: 'y',
		month: 'm',
		day: 'd',
		hour: 'h',
		minute: 'min',
		second: 's'
	} as const;
	for (const part of wallFormat.formatToParts(date)) {
		const k = key[part.type as keyof typeof key];
		if (k) out[k] = Number(part.value);
	}
	return out;
}

/** Offset of Berlin to UTC in milliseconds at the given instant (+3 600 000 or +7 200 000). */
function berlinOffsetMs(date: Date): number {
	const w = wallParts(date);
	const seconds = Math.floor(date.getTime() / 1000) * 1000;
	return Date.UTC(w.y, w.m - 1, w.d, w.h, w.min, w.s) - seconds;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** The instant at which the Berlin wall clock shows `date` `time`; null if invalid or skipped by DST. */
export function berlinInstant(date: string, time: string): Date | null {
	const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
	const tm = /^(\d{2}):(\d{2})$/.exec(time);
	if (!dm || !tm) return null;
	const [y, mo, d] = [Number(dm[1]), Number(dm[2]), Number(dm[3])];
	const [h, mi] = [Number(tm[1]), Number(tm[2])];
	if (h > 23 || mi > 59) return null;
	const wall = Date.UTC(y, mo - 1, d, h, mi);
	const check = new Date(wall);
	if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) {
		return null;
	}
	const first = wall - berlinOffsetMs(new Date(wall));
	const result = new Date(wall - berlinOffsetMs(new Date(first)));
	// A wall-clock time inside the spring-forward gap does not exist.
	const w = wallParts(result);
	if (w.d !== d || w.h !== h || w.min !== mi) return null;
	return result;
}

/** Berlin calendar date (YYYY-MM-DD) of an instant. */
export function isoDate(instant: Date): string {
	const w = wallParts(instant);
	return `${w.y}-${pad(w.m)}-${pad(w.d)}`;
}

/** Berlin wall-clock time (HH:MM) of an instant. */
export function isoTime(instant: Date): string {
	const w = wallParts(instant);
	return `${pad(w.h)}:${pad(w.min)}`;
}

function utcOf(iso: string): Date {
	const [y, m, d] = iso.split('-').map(Number);
	return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(iso: string, days: number): string {
	const t = utcOf(iso);
	t.setUTCDate(t.getUTCDate() + days);
	return t.toISOString().slice(0, 10);
}

/** 1 = Monday … 7 = Sunday. */
export function isoWeekday(iso: string): number {
	return utcOf(iso).getUTCDay() || 7;
}

/** ISO calendar week number (KW). */
export function isoWeekNumber(iso: string): number {
	const t = utcOf(iso);
	t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
	const jan1 = Date.UTC(t.getUTCFullYear(), 0, 1);
	return Math.ceil(((t.getTime() - jan1) / 86_400_000 + 1) / 7);
}

/** `YYYY-MM` shifted by `n` months. */
export function addMonths(month: string, n: number): string {
	const [y, m] = month.split('-').map(Number);
	const t = new Date(Date.UTC(y, m - 1 + n, 1));
	return t.toISOString().slice(0, 7);
}

export const isIsoDate = (s: string | null | undefined): s is string =>
	typeof s === 'string' && berlinInstant(s, '12:00') !== null;
export const isTime = (s: string | null | undefined): s is string =>
	typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

/* ───────────── Opening model and slot grid ───────────── */

export type SlotProfile = {
	/** First slot start, HH:MM. */
	first: string;
	/** Last slot start Monday to Wednesday and Friday. */
	last: string;
	/** Last slot start on Thursday (Do-Verlängerung). */
	thursdayLast: string;
	durationMin: number;
};

/** Eheschließung runs in 30-minute slots, everything else in 15-minute slots. */
export function slotProfile(serviceSlug: string): SlotProfile {
	if (serviceSlug === 'eheschliessung-anmelden') {
		return { first: '09:00', last: '14:30', thursdayLast: '14:30', durationMin: 30 };
	}
	return { first: '08:00', last: '15:45', thursdayLast: '17:45', durationMin: 15 };
}

const toMinutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const fromMinutes = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

export type ClosedReason = 'wochenende' | 'feiertag';

export function closedReason(iso: string): ClosedReason | null {
	if (isoWeekday(iso) >= 6) return 'wochenende';
	if (HOLIDAYS[iso]) return 'feiertag';
	return null;
}

/** All slot start times of an open day on the grid of `profile`; empty when closed. */
export function gridTimes(iso: string, profile: SlotProfile): string[] {
	if (closedReason(iso)) return [];
	const last = isoWeekday(iso) === 4 ? profile.thursdayLast : profile.last;
	const out: string[] = [];
	for (let m = toMinutes(profile.first); m <= toMinutes(last); m += profile.durationMin) {
		out.push(fromMinutes(m));
	}
	return out;
}

export type SlotCheck =
	| { ok: true; startsAt: Date }
	| {
			ok: false;
			message: string;
			reason: 'format' | 'closed' | 'grid' | 'past' | 'lead' | 'horizon';
	  };

/** Can a slot at this Berlin date/time be booked right now? */
export function checkSlot(
	iso: string,
	time: string,
	profile: SlotProfile,
	now: Date = new Date()
): SlotCheck {
	const startsAt = berlinInstant(iso, time);
	if (!startsAt) {
		return { ok: false, reason: 'format', message: 'Datum oder Uhrzeit sind ungültig.' };
	}
	const closed = closedReason(iso);
	if (closed) {
		const what = closed === 'feiertag' ? `am Feiertag ${HOLIDAYS[iso]}` : 'am Wochenende';
		return { ok: false, reason: 'closed', message: `Termine gibt es nicht ${what}.` };
	}
	if (!gridTimes(iso, profile).includes(time)) {
		return {
			ok: false,
			reason: 'grid',
			message: 'Diese Uhrzeit gehört nicht zu den buchbaren Terminen.'
		};
	}
	if (startsAt.getTime() <= now.getTime()) {
		return { ok: false, reason: 'past', message: 'Dieser Termin liegt in der Vergangenheit.' };
	}
	if (startsAt.getTime() < now.getTime() + LEAD_MINUTES * 60_000) {
		return {
			ok: false,
			reason: 'lead',
			message: 'Termine sind nur bis 2 Stunden vor Beginn buchbar.'
		};
	}
	if (iso > addDays(isoDate(now), HORIZON_DAYS)) {
		return {
			ok: false,
			reason: 'horizon',
			message: `Termine sind höchstens ${HORIZON_DAYS} Tage im Voraus buchbar.`
		};
	}
	return { ok: true, startsAt };
}

/* ───────────── Availability ───────────── */

export type BookedSlot = { startsAt: Date; durationMin: number };
export type Slot = { time: string; startsAt: Date; free: boolean };
export type Day = {
	date: string;
	closed: ClosedReason | null;
	holiday: string | null;
	/** Bookable-in-time slots, free or already taken. */
	slots: Slot[];
	freeCount: number;
};

/** Days `from`..`to` (inclusive, ISO dates) with their slots; booked slots stay in the list. */
export function buildDays(
	from: string,
	to: string,
	profile: SlotProfile,
	booked: BookedSlot[],
	now: Date = new Date()
): Day[] {
	const today = isoDate(now);
	const horizon = addDays(today, HORIZON_DAYS);
	const earliest = now.getTime() + LEAD_MINUTES * 60_000;
	const out: Day[] = [];
	for (let date = from, guard = 0; date <= to && guard < 500; date = addDays(date, 1), guard += 1) {
		const slots: Slot[] = [];
		if (date >= today && date <= horizon) {
			for (const time of gridTimes(date, profile)) {
				const startsAt = berlinInstant(date, time);
				if (!startsAt || startsAt.getTime() < earliest) continue;
				const s = startsAt.getTime();
				const e = s + profile.durationMin * 60_000;
				const taken = booked.some(
					(b) => b.startsAt.getTime() < e && b.startsAt.getTime() + b.durationMin * 60_000 > s
				);
				slots.push({ time, startsAt, free: !taken });
			}
		}
		out.push({
			date,
			closed: closedReason(date),
			holiday: HOLIDAYS[date] ?? null,
			slots,
			freeCount: slots.filter((s) => s.free).length
		});
	}
	return out;
}

export function dayState(day: Day, today: string): DayState {
	if (day.date < today) return 'vergangen';
	if (day.date > addDays(today, HORIZON_DAYS)) return 'ausserhalb';
	if (day.closed) return day.closed;
	// An open day inside the horizon without any slot is today, after the booking cut-off.
	if (day.slots.length === 0) return 'vergangen';
	return day.freeCount > 0 ? 'frei' : 'ausgebucht';
}

/** Free and booked slots of one location for the grid of one service. */
export async function getAvailability(
	conn: Conn,
	locationId: number,
	serviceId: number,
	from: string,
	to: string,
	now: Date = new Date()
): Promise<Day[]> {
	const [svc] = await conn
		.select({ slug: services.slug })
		.from(services)
		.where(eq(services.id, serviceId))
		.limit(1);
	const start = berlinInstant(from, '00:00');
	const end = berlinInstant(addDays(to, 1), '00:00');
	if (!svc || !start || !end) return [];
	const booked = await conn
		.select({ startsAt: appointments.startsAt, durationMin: appointments.durationMin })
		.from(appointments)
		.where(
			and(
				eq(appointments.locationId, locationId),
				eq(appointments.status, 'gebucht'),
				// A longer booking that began just before the range can still overlap its first slot.
				gte(appointments.startsAt, new Date(start.getTime() - 3 * 3_600_000)),
				lt(appointments.startsAt, end)
			)
		);
	return buildDays(from, to, slotProfile(svc.slug), booked, now);
}

/** Weeks (Monday first) of a month, each day described for the calendar component. */
export function buildCalendar(
	month: string,
	days: ReadonlyMap<string, Day>,
	opts: {
		now: Date;
		selected: string | null;
		hrefFor: (iso: string) => `/termine/buchen?${string}`;
	}
): CalendarWeek[] {
	const today = isoDate(opts.now);
	const first = `${month}-01`;
	const lastOfMonth = addDays(`${addMonths(month, 1)}-01`, -1);
	const weeks: CalendarWeek[] = [];
	for (let monday = addDays(first, 1 - isoWeekday(first)); monday <= lastOfMonth;) {
		const cells: CalendarCell[] = [];
		for (let i = 0; i < 7; i += 1) {
			const date = addDays(monday, i);
			const day = days.get(date);
			const state: DayState = day
				? dayState(day, today)
				: date < today
					? 'vergangen'
					: 'ausserhalb';
			cells.push({
				date,
				day: Number(date.slice(8)),
				weekday: i + 1,
				inMonth: date.startsWith(month),
				state,
				free: day?.freeCount ?? 0,
				note: HOLIDAYS[date],
				href: state === 'frei' ? opts.hrefFor(date) : undefined,
				today: date === today,
				selected: date === opts.selected
			});
		}
		weeks.push({ kw: isoWeekNumber(monday), cells });
		monday = addDays(monday, 7);
	}
	return weeks;
}

/* ───────────── QR code ───────────── */

/** Inline SVG of a QR code (black on white incl. quiet zone), rendered on the server. */
export function qrSvg(text: string): string {
	const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
	const n = qr.modules.size;
	const data = qr.modules.data;
	const quiet = 4;
	let path = '';
	for (let y = 0; y < n; y += 1) {
		for (let x = 0; x < n; x += 1) {
			if (!data[y * n + x]) continue;
			let run = 1;
			while (x + run < n && data[y * n + x + run]) run += 1;
			path += `M${x + quiet} ${y + quiet}h${run}v1h-${run}z`;
			x += run - 1;
		}
	}
	const size = n + quiet * 2;
	return (
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" ` +
		`shape-rendering="crispEdges" aria-hidden="true" focusable="false">` +
		`<rect width="${size}" height="${size}" fill="#fff"/><path d="${path}" fill="#14212c"/></svg>`
	);
}

/** What the QR code on the Terminzettel encodes. */
export const qrPayload = (code: string) => `MUSTERSTADT-TERMIN:${code}`;

/* ───────────── Calendar export (RFC 5545) ───────────── */

const encoder = new TextEncoder();

/** Fold a content line to at most 75 octets per line (continuations start with one space). */
export function foldLine(line: string): string {
	if (encoder.encode(line).length <= 75) return line;
	const parts: string[] = [];
	let current = '';
	let bytes = 0;
	let limit = 75;
	for (const ch of line) {
		const size = encoder.encode(ch).length;
		if (bytes + size > limit) {
			parts.push(current);
			current = '';
			bytes = 0;
			limit = 74;
		}
		current += ch;
		bytes += size;
	}
	parts.push(current);
	return parts.join('\r\n ');
}

const icsText = (s: string) =>
	s
		.replace(/\\/g, '\\\\')
		.replace(/;/g, '\\;')
		.replace(/,/g, '\\,')
		.replace(/\r\n|\r|\n/g, '\\n');
const icsStamp = (d: Date) =>
	d
		.toISOString()
		.replace(/[-:]/g, '')
		.replace(/\.\d{3}/, '');

export function buildIcs(input: {
	code: string;
	summary: string;
	location: string;
	description: string;
	startsAt: Date;
	durationMin: number;
	now?: Date;
}): string {
	const end = new Date(input.startsAt.getTime() + input.durationMin * 60_000);
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Stadt Musterstadt//Buergerportal//DE',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'BEGIN:VEVENT',
		`UID:${input.code}@buergerportal.musterstadt.example`,
		`DTSTAMP:${icsStamp(input.now ?? new Date())}`,
		`DTSTART:${icsStamp(input.startsAt)}`,
		`DTEND:${icsStamp(end)}`,
		`SUMMARY:${icsText(input.summary)}`,
		`LOCATION:${icsText(input.location)}`,
		`DESCRIPTION:${icsText(input.description)}`,
		'STATUS:CONFIRMED',
		'TRANSP:OPAQUE',
		'BEGIN:VALARM',
		'ACTION:DISPLAY',
		`DESCRIPTION:${icsText(`Erinnerung: ${input.summary}`)}`,
		'TRIGGER:-PT1H',
		'END:VALARM',
		'END:VEVENT',
		'END:VCALENDAR'
	];
	return lines.map(foldLine).join('\r\n') + '\r\n';
}

/* ───────────── Datenbank ───────────── */

const LOCK_USER = 7001;
const LOCK_LOCATION = 7002;

/** Postgres error (possibly wrapped by drizzle in `cause`). */
function findPgError(e: unknown): { code: string; constraint: string | undefined } | null {
	let cur: unknown = e;
	for (let i = 0; i < 4 && typeof cur === 'object' && cur !== null; i += 1) {
		const o = cur as { code?: unknown; constraint_name?: unknown; cause?: unknown };
		if (typeof o.code === 'string' && /^[0-9A-Z]{5}$/.test(o.code)) {
			return {
				code: o.code,
				constraint: typeof o.constraint_name === 'string' ? o.constraint_name : undefined
			};
		}
		cur = o.cause;
	}
	return null;
}

export type BookResult =
	| { ok: true; code: string; replaced: boolean }
	| { ok: false; kind: 'invalid' | 'taken' | 'limit' | 'overlap' | 'gone'; message: string };

/** Overlapping active booking of this citizen, or too many active ones; null when fine. */
export async function checkUserLimits(
	conn: Conn,
	userId: number,
	startsAt: Date,
	durationMin: number,
	excludeId: number | null,
	now: Date = new Date()
): Promise<{ kind: 'limit' | 'overlap'; message: string } | null> {
	const others = excludeId === null ? undefined : ne(appointments.id, excludeId);
	const [active] = await conn
		.select({ n: count() })
		.from(appointments)
		.where(
			and(
				eq(appointments.userId, userId),
				eq(appointments.status, 'gebucht'),
				gt(appointments.startsAt, now),
				others
			)
		);
	if ((active?.n ?? 0) >= MAX_ACTIVE_APPOINTMENTS) {
		return {
			kind: 'limit',
			message: `Sie haben bereits ${MAX_ACTIVE_APPOINTMENTS} Termine gebucht. Sagen Sie einen Termin ab, bevor Sie einen weiteren buchen.`
		};
	}
	const [clash] = await conn
		.select({ id: appointments.id })
		.from(appointments)
		.where(
			and(
				eq(appointments.userId, userId),
				eq(appointments.status, 'gebucht'),
				lt(appointments.startsAt, new Date(startsAt.getTime() + durationMin * 60_000)),
				sql`${appointments.startsAt} + ${appointments.durationMin} * interval '1 minute' > ${startsAt.toISOString()}::timestamptz`,
				others
			)
		)
		.limit(1);
	if (clash) {
		return {
			kind: 'overlap',
			message:
				'Sie haben zu dieser Zeit bereits einen anderen Termin. Bitte wählen Sie eine andere Uhrzeit.'
		};
	}
	return null;
}

/**
 * Books a slot in one transaction. With `replaceCode` the citizen's old appointment is cancelled in
 * the same transaction; on any conflict nothing changes.
 *
 * Locks (per citizen, then per location) serialise concurrent bookings so that overlapping
 * bookings of different grids cannot slip through; the partial unique index on
 * (locationId, startsAt) remains the last line of defence.
 */
export async function bookAppointment(
	db: Db,
	input: {
		userId: number;
		serviceId: number;
		serviceSlug: string;
		locationId: number;
		date: string;
		time: string;
		replaceCode?: string | null;
		makeCode: () => string;
		now?: Date;
	}
): Promise<BookResult> {
	const now = input.now ?? new Date();
	const profile = slotProfile(input.serviceSlug);
	const check = checkSlot(input.date, input.time, profile, now);
	if (!check.ok) return { ok: false, kind: 'invalid', message: check.message };
	const { startsAt } = check;
	const taken: BookResult = {
		ok: false,
		kind: 'taken',
		message: 'Dieser Termin wurde soeben von jemand anderem gebucht.'
	};

	for (let attempt = 0; attempt < 3; attempt += 1) {
		try {
			return await db.transaction(async (tx): Promise<BookResult> => {
				await tx.execute(
					sql`select pg_advisory_xact_lock(${LOCK_USER}::int, ${input.userId}::int)`
				);
				await tx.execute(
					sql`select pg_advisory_xact_lock(${LOCK_LOCATION}::int, ${input.locationId}::int)`
				);

				let oldId: number | null = null;
				if (input.replaceCode) {
					const [old] = await tx
						.select({
							id: appointments.id,
							serviceId: appointments.serviceId,
							locationId: appointments.locationId,
							startsAt: appointments.startsAt
						})
						.from(appointments)
						.where(
							and(
								eq(appointments.code, input.replaceCode),
								eq(appointments.userId, input.userId),
								eq(appointments.status, 'gebucht'),
								gt(appointments.startsAt, now)
							)
						)
						.limit(1);
					if (!old) {
						return {
							ok: false,
							kind: 'gone',
							message: 'Der Termin, den Sie verschieben wollten, ist nicht mehr aktiv.'
						};
					}
					if (old.serviceId !== input.serviceId) {
						return {
							ok: false,
							kind: 'invalid',
							message:
								'Beim Verschieben bleibt die Leistung gleich. Buchen Sie für ein anderes Anliegen einen neuen Termin.'
						};
					}
					if (
						old.locationId === input.locationId &&
						old.startsAt.getTime() === startsAt.getTime()
					) {
						return {
							ok: false,
							kind: 'invalid',
							message: 'Bitte wählen Sie einen anderen Termin oder Standort.'
						};
					}
					oldId = old.id;
				}

				const limits = await checkUserLimits(
					tx,
					input.userId,
					startsAt,
					profile.durationMin,
					oldId,
					now
				);
				if (limits) return { ok: false, ...limits };

				const [clash] = await tx
					.select({ id: appointments.id })
					.from(appointments)
					.where(
						and(
							eq(appointments.locationId, input.locationId),
							eq(appointments.status, 'gebucht'),
							oldId === null ? undefined : ne(appointments.id, oldId),
							lt(
								appointments.startsAt,
								new Date(startsAt.getTime() + profile.durationMin * 60_000)
							),
							sql`${appointments.startsAt} + ${appointments.durationMin} * interval '1 minute' > ${startsAt.toISOString()}::timestamptz`
						)
					)
					.limit(1);
				if (clash) return taken;

				if (oldId !== null) {
					await tx
						.update(appointments)
						.set({ status: 'storniert' })
						.where(eq(appointments.id, oldId));
				}
				const code = input.makeCode();
				await tx.insert(appointments).values({
					code,
					userId: input.userId,
					serviceId: input.serviceId,
					locationId: input.locationId,
					startsAt,
					durationMin: profile.durationMin
				});
				return { ok: true, code, replaced: oldId !== null };
			});
		} catch (e) {
			const pg = findPgError(e);
			if (pg?.code !== '23505') throw e;
			// A clash of the generated code: try again with a new one. Anything else: slot taken.
			if (!pg.constraint?.includes('code')) return taken;
		}
	}
	throw new Error('Termin-Code konnte nicht eindeutig erzeugt werden.');
}

/** A citizen's own appointment with everything the detail pages need; null if not theirs. */
export async function getOwnedAppointment(conn: Conn, code: string, userId: number) {
	const [row] = await conn
		.select({
			appointment: appointments,
			service: services,
			location: locations,
			office: offices
		})
		.from(appointments)
		.innerJoin(services, eq(services.id, appointments.serviceId))
		.innerJoin(locations, eq(locations.id, appointments.locationId))
		.innerJoin(offices, eq(offices.id, locations.officeId))
		.where(and(eq(appointments.code, code), eq(appointments.userId, userId)))
		.limit(1);
	return row ?? null;
}

/** Active (booked, not yet started) appointments of a citizen. */
export async function countActiveAppointments(
	conn: Conn,
	userId: number,
	now: Date = new Date()
): Promise<number> {
	const [row] = await conn
		.select({ n: count() })
		.from(appointments)
		.where(
			and(
				eq(appointments.userId, userId),
				eq(appointments.status, 'gebucht'),
				gt(appointments.startsAt, now)
			)
		);
	return row?.n ?? 0;
}

/**
 * Cancels an appointment of this citizen. False when it is not theirs, already cancelled or has
 * already started. Shares the citizen lock with rescheduling so a cancellation cannot be lost.
 */
export async function cancelAppointment(
	db: Db,
	code: string,
	userId: number,
	now: Date = new Date()
): Promise<boolean> {
	return db.transaction(async (tx) => {
		await tx.execute(sql`select pg_advisory_xact_lock(${LOCK_USER}::int, ${userId}::int)`);
		const rows = await tx
			.update(appointments)
			.set({ status: 'storniert' })
			.where(
				and(
					eq(appointments.code, code),
					eq(appointments.userId, userId),
					eq(appointments.status, 'gebucht'),
					gt(appointments.startsAt, now)
				)
			)
			.returning({ id: appointments.id });
		return rows.length > 0;
	});
}

/** What the appointment components need, with dates as ISO strings (safe to send to the client). */
export function toAppointmentView(
	row: { appointment: Appointment; service: Service; location: Location },
	now: Date = new Date()
): AppointmentView {
	const { appointment: a, service, location } = row;
	return {
		code: a.code,
		phase: a.status === 'storniert' ? 'storniert' : a.startsAt > now ? 'aktiv' : 'vergangen',
		startsAt: a.startsAt.toISOString(),
		durationMin: a.durationMin,
		serviceName: service.name,
		locationName: location.name,
		locationAddress: `${location.street}, ${location.postalCode} ${location.city}`
	};
}

/** All appointments of a citizen (active, past and cancelled), latest start first. */
export async function listAppointments(conn: Conn, userId: number) {
	return conn
		.select({ appointment: appointments, service: services, location: locations })
		.from(appointments)
		.innerJoin(services, eq(services.id, appointments.serviceId))
		.innerJoin(locations, eq(locations.id, appointments.locationId))
		.where(eq(appointments.userId, userId))
		.orderBy(desc(appointments.startsAt));
}

/** Upcoming active appointments of a citizen, soonest first (used by the dashboard). */
export async function getUpcomingAppointments(userId: number, limit = 5) {
	const { db } = await import('./db/index.ts');
	return db
		.select({ appointment: appointments, service: services, location: locations })
		.from(appointments)
		.innerJoin(services, eq(services.id, appointments.serviceId))
		.innerJoin(locations, eq(locations.id, appointments.locationId))
		.where(
			and(
				eq(appointments.userId, userId),
				eq(appointments.status, 'gebucht'),
				gt(appointments.startsAt, new Date())
			)
		)
		.orderBy(asc(appointments.startsAt))
		.limit(limit);
}
