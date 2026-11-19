import type { ApplicationStatus, DefectStatus } from '#lib/server/db/schema.ts';

/** Pure business rules of the Sachbearbeiter-Portal (status transitions, text validation). */

/** Which status an application may move to from its current one. Drafts are not editable here. */
export const APPLICATION_TRANSITIONS: Record<ApplicationStatus, readonly ApplicationStatus[]> = {
	entwurf: [],
	eingereicht: ['in_pruefung', 'nachforderung', 'bewilligt', 'abgelehnt'],
	in_pruefung: ['nachforderung', 'bewilligt', 'abgelehnt'],
	nachforderung: ['in_pruefung', 'bewilligt', 'abgelehnt'],
	bewilligt: [],
	abgelehnt: []
};

export function canMoveApplication(from: ApplicationStatus, to: ApplicationStatus): boolean {
	return APPLICATION_TRANSITIONS[from].includes(to);
}

export const mayDecideOffice = (officeId: number | null, applicationOfficeId: number) =>
	officeId !== null && officeId === applicationOfficeId;

/** All statuses from which `to` can be reached (used for guarded `UPDATE … WHERE status IN (…)`). */
export function sourcesOf(to: ApplicationStatus): ApplicationStatus[] {
	return (Object.keys(APPLICATION_TRANSITIONS) as ApplicationStatus[]).filter((from) =>
		canMoveApplication(from, to)
	);
}

export const DEFECT_TRANSITIONS: Record<DefectStatus, readonly DefectStatus[]> = {
	gemeldet: ['in_bearbeitung', 'behoben'],
	in_bearbeitung: ['behoben'],
	behoben: ['in_bearbeitung']
};

export function canMoveDefect(from: DefectStatus, to: DefectStatus): boolean {
	return DEFECT_TRANSITIONS[from].includes(to);
}

export const DEFECT_STATUSES = ['gemeldet', 'in_bearbeitung', 'behoben'] as const;
export const OPEN_DEFECT_STATUSES: DefectStatus[] = ['gemeldet', 'in_bearbeitung'];
export const OPEN_APPLICATION_STATUSES: ApplicationStatus[] = [
	'eingereicht',
	'in_pruefung',
	'nachforderung'
];

export const TEXT_MIN = 10;
export const TEXT_MAX = 2000;

/** Reads a trimmed text field from a form and validates its length. */
export function checkText(
	raw: FormDataEntryValue | null,
	opts: { label: string; required?: boolean; min?: number; max?: number }
): { value: string; error?: string } {
	const value = (typeof raw === 'string' ? raw : '').trim();
	const max = opts.max ?? TEXT_MAX;
	if (!value) {
		return opts.required ? { value, error: `${opts.label} ist erforderlich.` } : { value };
	}
	if (opts.min && value.length < opts.min) {
		return {
			value,
			error: `${opts.label} ist zu kurz. Bitte schreiben Sie mindestens ${opts.min} Zeichen.`
		};
	}
	if (value.length > max) {
		return {
			value,
			error: `${opts.label} ist zu lang. Erlaubt sind höchstens ${max} Zeichen, es sind ${value.length}.`
		};
	}
	return { value };
}

/** Parses a positive integer id, otherwise null. */
export function parseId(raw: FormDataEntryValue | string | null | undefined): number | null {
	if (typeof raw !== 'string' || !/^\d{1,9}$/.test(raw)) return null;
	const n = Number(raw);
	return n > 0 ? n : null;
}
