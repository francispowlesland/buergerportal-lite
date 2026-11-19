/** Shapes shared between the booking engine (server) and the appointment components. */

/** Why a calendar day can or cannot be chosen. */
export type DayState =
	'frei' | 'ausgebucht' | 'wochenende' | 'feiertag' | 'vergangen' | 'ausserhalb';

export type CalendarCell = {
	/** ISO date, YYYY-MM-DD. */
	date: string;
	/** Day of the month. */
	day: number;
	/** 1 = Monday … 7 = Sunday. */
	weekday: number;
	/** Day belongs to the displayed month (otherwise it only fills the week row). */
	inMonth: boolean;
	state: DayState;
	/** Free slots on that day. */
	free: number;
	/** Name of the public holiday, if any. */
	note?: string;
	/** Link to select the day; only present for days with a free slot. */
	href?: `/termine/buchen?${string}`;
	today: boolean;
	selected: boolean;
};

export type CalendarWeek = {
	/** ISO calendar week (Kalenderwoche). */
	kw: number;
	cells: CalendarCell[];
};

/** One selectable entry of the Amt, Leistung and Standort steps. */
export type Choice = {
	key: string;
	href: string;
	title: string;
	detail: string;
	/** Link text, specific to the step, e.g. "Standort wählen". */
	cta: string;
};

export type SlotView = {
	/** HH:MM, Berlin wall clock. */
	time: string;
	free: boolean;
};

export type AppointmentPhase = 'aktiv' | 'vergangen' | 'storniert';

/** One appointment as shown in lists and on the Terminzettel. */
export type AppointmentView = {
	/** Termin-Code, e.g. T-7KQ2M9. */
	code: string;
	phase: AppointmentPhase;
	/** ISO instant. */
	startsAt: string;
	durationMin: number;
	serviceName: string;
	locationName: string;
	/** Street, postal code and city. */
	locationAddress: string;
};
