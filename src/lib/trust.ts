/** BundID Vertrauensniveaus, ordered from lowest to highest. Shared by server and client. */
export const TRUST_LEVELS = ['basis', 'substanziell', 'hoch'] as const;
export type TrustLevel = (typeof TRUST_LEVELS)[number];

export const TRUST_LABELS: Record<TrustLevel, string> = {
	basis: 'Basis',
	substanziell: 'Substanziell',
	hoch: 'Hoch'
};

export const TRUST_METHODS: Record<TrustLevel, string> = {
	basis: 'Benutzername und Passwort',
	substanziell: 'ELSTER-Zertifikat mit Zwei-Faktor-Bestätigung',
	hoch: 'Online-Ausweis (eID) mit 6-stelliger PIN'
};

export function trustRank(level: TrustLevel): number {
	return TRUST_LEVELS.indexOf(level);
}

/** True when `actual` meets or exceeds `required`. */
export function meetsTrust(actual: TrustLevel | null | undefined, required: TrustLevel): boolean {
	return actual != null && trustRank(actual) >= trustRank(required);
}
