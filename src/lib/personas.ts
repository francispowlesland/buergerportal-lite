/** Demo personas for the floating Persona Bar. `key` is posted to /auth/persona. */
import type { TrustLevel } from './trust';

export type Persona = {
	key: string;
	/** users.slug; null = anonymous visitor */
	slug: string | null;
	trust: TrustLevel | null;
	label: string;
	detail: string;
};

export const PERSONAS: Persona[] = [
	{ key: 'visitor', slug: null, trust: null, label: 'Besucher', detail: 'nicht angemeldet' },
	{ key: 'max-hoch', slug: 'max', trust: 'hoch', label: 'Max Mustermann', detail: 'eID, Hoch' },
	{ key: 'max-basis', slug: 'max', trust: 'basis', label: 'Max Mustermann', detail: 'Basis' },
	{ key: 'erika-basis', slug: 'erika', trust: 'basis', label: 'Erika Musterfrau', detail: 'Basis' },
	{ key: 'hans-hoch', slug: 'hans', trust: 'hoch', label: 'Hans Schmidt', detail: 'Sachbearbeiter' }
];

/** Where each role lands after login or a persona switch. */
export const HOME = { citizen: '/mein-buergerportal', caseworker: '/sachbearbeiter' } as const;
