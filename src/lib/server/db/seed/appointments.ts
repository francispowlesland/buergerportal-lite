import { appointments } from '../schema';
import { berlinTime, idOf, weekday, nextWeekdays, type Db, type Ids } from './util';

type AppointmentStatus = (typeof appointments.$inferSelect)['status'];

type AppointmentSeed = {
	user: string;
	service: string;
	location: string;
	startsAt: Date;
	durationMin?: number;
	status?: AppointmentStatus;
	createdAt: Date;
	code?: string;
};

/** Max' upcoming Reisepass appointment, also referenced by his Postkorb message. */
export const MAX_REISEPASS_START = berlinTime(weekday(6), 9, 30);
/** Erika's upcoming Personalausweis appointment, also referenced by her Postkorb message. */
export const ERIKA_AUSWEIS_START = berlinTime(weekday(4), 14, 0);
export const MAX_REISEPASS_CODE = 'T-7KQ2M9';
export const ERIKA_AUSWEIS_CODE = 'T-4HX8WD';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Deterministic pseudo-random codes, so reseeding yields stable references. */
function codeGenerator(taken: Set<string>): () => string {
	let state = 0x2f6e2b1;
	const next = (): number => {
		state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
		return state;
	};
	return () => {
		for (;;) {
			let code = 'T-';
			for (let i = 0; i < 6; i += 1) {
				code += CODE_ALPHABET.charAt((next() >>> 8) % CODE_ALPHABET.length);
			}
			if (!taken.has(code)) {
				taken.add(code);
				return code;
			}
		}
	};
}

/** Bulk bookings of the other citizens: [user, service, location, working day index, HH:MM]. */
const bulk: [string, string, string, number, string][] = [
	// Bürgeramt Mitte
	['lena', 'personalausweis-beantragen', 'buergeramt-mitte', 0, '08:00'],
	['jonas', 'reisepass-beantragen', 'buergeramt-mitte', 0, '08:15'],
	['klaus', 'anmeldung-wohnsitz', 'buergeramt-mitte', 0, '09:00'],
	['mia', 'reisepass-beantragen', 'buergeramt-mitte', 1, '08:30'],
	['ahmet', 'fuehrungszeugnis-beantragen', 'buergeramt-mitte', 1, '10:45'],
	['fatma', 'personalausweis-beantragen', 'buergeramt-mitte', 2, '08:00'],
	['tobias', 'anmeldung-wohnsitz', 'buergeramt-mitte', 2, '08:15'],
	['svetlana', 'reisepass-beantragen', 'buergeramt-mitte', 2, '08:30'],
	['lena', 'anmeldung-wohnsitz', 'buergeramt-mitte', 3, '13:00'],
	['jonas', 'personalausweis-beantragen', 'buergeramt-mitte', 4, '09:45'],
	['klaus', 'reisepass-beantragen', 'buergeramt-mitte', 5, '11:15'],
	['mia', 'fuehrungszeugnis-beantragen', 'buergeramt-mitte', 7, '14:30'],
	// Bürgeramt Nord
	['tobias', 'personalausweis-beantragen', 'buergeramt-nord', 0, '10:00'],
	['fatma', 'anmeldung-wohnsitz', 'buergeramt-nord', 1, '08:00'],
	['ahmet', 'reisepass-beantragen', 'buergeramt-nord', 1, '08:15'],
	['svetlana', 'personalausweis-beantragen', 'buergeramt-nord', 3, '09:30'],
	['lena', 'reisepass-beantragen', 'buergeramt-nord', 6, '15:45'],
	['jonas', 'anmeldung-wohnsitz', 'buergeramt-nord', 8, '12:00'],
	// Bürgeramt Süd
	['klaus', 'personalausweis-beantragen', 'buergeramt-sued', 2, '10:30'],
	['mia', 'anmeldung-wohnsitz', 'buergeramt-sued', 3, '08:45'],
	['ahmet', 'personalausweis-beantragen', 'buergeramt-sued', 5, '13:15'],
	['fatma', 'reisepass-beantragen', 'buergeramt-sued', 9, '09:00'],
	// Weitere Ämter
	['tobias', 'eheschliessung-anmelden', 'standesamt', 4, '10:00'],
	['svetlana', 'geburtsurkunde-beantragen', 'standesamt', 1, '11:00'],
	['ahmet', 'sterbeurkunde-beantragen', 'standesamt', 7, '09:30'],
	['klaus', 'kfz-ummeldung', 'kfz', 3, '09:15'],
	['lena', 'kfz-ummeldung', 'kfz', 2, '15:15'],
	['mia', 'baugenehmigung-beratung', 'bauamt', 6, '14:00']
];

function buildSeeds(): AppointmentSeed[] {
	const seeds: AppointmentSeed[] = [
		{
			user: 'max',
			service: 'reisepass-beantragen',
			location: 'buergeramt-mitte',
			startsAt: MAX_REISEPASS_START,
			createdAt: berlinTime(-1, 9, 42),
			code: MAX_REISEPASS_CODE
		},
		{
			user: 'max',
			service: 'kfz-ummeldung',
			location: 'kfz',
			startsAt: berlinTime(weekday(12), 10, 15),
			createdAt: berlinTime(-2, 20, 11),
			code: 'T-9RM3PA'
		},
		{
			user: 'max',
			service: 'anmeldung-wohnsitz',
			location: 'buergeramt-nord',
			startsAt: berlinTime(weekday(3), 11, 0),
			status: 'storniert',
			createdAt: berlinTime(-9, 18, 5),
			code: 'T-2VC6NF'
		},
		{
			user: 'max',
			service: 'personalausweis-beantragen',
			location: 'buergeramt-mitte',
			startsAt: berlinTime(weekday(-20, -1), 10, 0),
			createdAt: berlinTime(-30, 8, 15),
			code: 'T-5DJ7YB'
		},
		{
			user: 'erika',
			service: 'personalausweis-beantragen',
			location: 'buergeramt-sued',
			startsAt: ERIKA_AUSWEIS_START,
			createdAt: berlinTime(-3, 10, 0),
			code: ERIKA_AUSWEIS_CODE
		}
	];

	const days = nextWeekdays(10);
	for (const [user, service, location, dayIndex, time] of bulk) {
		const [hour, minute] = time.split(':').map(Number);
		const day = days[dayIndex];
		if (day === undefined || hour === undefined || minute === undefined) {
			throw new Error(`Seed: invalid appointment entry ${user}/${service}/${time}`);
		}
		seeds.push({
			user,
			service,
			location,
			startsAt: berlinTime(day, hour, minute),
			durationMin: service === 'eheschliessung-anmelden' ? 30 : 15,
			createdAt: berlinTime(-((dayIndex % 5) + 1), 9 + (dayIndex % 6), 10 * (dayIndex % 6))
		});
	}
	return seeds;
}

export async function seedAppointments(
	db: Db,
	user: Ids,
	service: Ids,
	location: Ids
): Promise<number> {
	const seeds = buildSeeds();
	const takenCodes = new Set(seeds.flatMap((s) => (s.code ? [s.code] : [])));
	const nextCode = codeGenerator(takenCodes);

	// Guard against violating the partial unique index on (location, start time).
	const slots = new Set<string>();
	for (const s of seeds) {
		if ((s.status ?? 'gebucht') !== 'gebucht') continue;
		const key = `${s.location}@${s.startsAt.toISOString()}`;
		if (slots.has(key)) throw new Error(`Seed: duplicate appointment slot ${key}`);
		slots.add(key);
	}

	await db.insert(appointments).values(
		seeds.map((s) => ({
			code: s.code ?? nextCode(),
			userId: idOf(user, s.user, 'user'),
			serviceId: idOf(service, s.service, 'service'),
			locationId: idOf(location, s.location, 'location'),
			startsAt: s.startsAt,
			durationMin: s.durationMin ?? 15,
			status: s.status ?? 'gebucht',
			createdAt: s.createdAt
		}))
	);
	return seeds.length;
}
