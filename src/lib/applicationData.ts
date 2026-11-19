/** Shape of `applications.data` per wizard (`services.wizardSlug`). Shared by wizards, seed and Sachbearbeiter. */

export type MeldebescheinigungData = {
	zweck: 'arbeitgeber' | 'behoerde' | 'bank' | 'sonstiges';
	anzahl: number; // 1–5
	uebermittlung: 'postkorb' | 'post';
	bestaetigt: boolean;
};

export type AnwohnerparkausweisData = {
	kennzeichen: string; // e.g. "MS-AB 1234"
	fahrzeugart: 'pkw' | 'motorrad' | 'carsharing';
	halter: 'selbst' | 'andere';
	parkzone: 'A' | 'B' | 'C' | 'D';
	zulassungGeprueft: boolean; // simulated Zulassungsbescheinigung check passed
	laufzeitMonate: 12 | 24;
	nachweise: string[]; // labels of uploaded proofs (see `attachments`)
};

export type BriefwahlData = {
	wahl: string; // e.g. "Oberbürgermeisterwahl Musterstadt"
	wahlDatum: string; // ISO date
	wahlbezirk: string; // e.g. "Wahlbezirk 07 – Grundschule Nord"
	wahlbenachrichtigungsnummer: string; // e.g. "WB-07-004711"
	zustellung: 'wohnanschrift' | 'abweichend';
	abweichendeAnschrift?: { street: string; postalCode: string; city: string };
};

export type WizardSlug = 'meldebescheinigung' | 'anwohnerparkausweis' | 'briefwahl';

export type WizardDataMap = {
	meldebescheinigung: MeldebescheinigungData;
	anwohnerparkausweis: AnwohnerparkausweisData;
	briefwahl: BriefwahlData;
};
