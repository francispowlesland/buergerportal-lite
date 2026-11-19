import type { ApplicationStatus, DefectCategory, DefectStatus, Message } from './server/db/schema';

export type Tone = 'neutral' | 'info' | 'ok' | 'warn' | 'bad';

export const APPLICATION_STATUS: Record<ApplicationStatus, { label: string; tone: Tone }> = {
	entwurf: { label: 'Entwurf', tone: 'neutral' },
	eingereicht: { label: 'Eingereicht', tone: 'info' },
	in_pruefung: { label: 'In Prüfung', tone: 'info' },
	nachforderung: { label: 'Nachweise fehlen', tone: 'warn' },
	bewilligt: { label: 'Bewilligt', tone: 'ok' },
	abgelehnt: { label: 'Abgelehnt', tone: 'bad' }
};

export const DEFECT_STATUS: Record<DefectStatus, { label: string; tone: Tone }> = {
	gemeldet: { label: 'Gemeldet', tone: 'warn' },
	in_bearbeitung: { label: 'In Bearbeitung', tone: 'info' },
	behoben: { label: 'Behoben', tone: 'ok' }
};

export const DEFECT_CATEGORY: Record<DefectCategory, string> = {
	schlagloch: 'Schlagloch',
	strassenbeleuchtung: 'Straßenbeleuchtung',
	graffiti: 'Graffiti',
	illegale_muellablagerung: 'Illegale Müllablagerung',
	spielplatz: 'Spielplatz',
	sonstiges: 'Sonstiges'
};

export const MESSAGE_KIND: Record<Message['kind'], { label: string; tone: Tone }> = {
	status: { label: 'Status', tone: 'info' },
	bescheid: { label: 'Bescheid', tone: 'ok' },
	nachforderung: { label: 'Nachforderung', tone: 'warn' },
	nachricht: { label: 'Nachricht', tone: 'neutral' }
};

/** Lebenslagen (life events) used to filter the Behördenwegweiser. */
export const LEBENSLAGEN: Record<string, string> = {
	geburt: 'Geburt',
	kinder: 'Kinder und Familie',
	heirat: 'Heirat',
	umzug: 'Umzug',
	wohnen: 'Wohnen',
	bauen: 'Bauen',
	auto: 'Auto und Verkehr',
	ausweise: 'Ausweise und Urkunden',
	wahl: 'Wahlen',
	umwelt: 'Umwelt und Abfall',
	hund: 'Hund',
	tod: 'Todesfall'
};
