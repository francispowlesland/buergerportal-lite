import type { WizardSlug } from '#lib/applicationData.ts';
import type { User } from '#lib/server/db/schema.ts';
import { deriveParkingZone, validateGermanPlate } from './parkingZones.ts';
import { WAHLBEZIRKE, WAHLBENACHRICHTIGUNG_REGEX } from './election.ts';

export const STEP_COUNTS = { meldebescheinigung: 2, anwohnerparkausweis: 5, briefwahl: 3 };

export function validateWizardStep(
	slug: WizardSlug,
	step: number,
	data: Record<string, unknown>,
	user: Pick<User, 'street' | 'postalCode'>
) {
	const errors: Record<string, string> = {};
	if (!Number.isInteger(step) || step < 0 || step >= STEP_COUNTS[slug]) {
		errors._form = 'Ungültiger Schritt. Bitte öffnen Sie den Antrag erneut.';
	} else if (slug === 'meldebescheinigung') {
		if (step === 0) {
			if (!['arbeitgeber', 'behoerde', 'bank', 'sonstiges'].includes(String(data.zweck)))
				errors.zweck = 'Bitte wählen Sie einen Verwendungszweck aus.';
			if (
				typeof data.anzahl !== 'number' ||
				!Number.isInteger(data.anzahl) ||
				data.anzahl < 1 ||
				data.anzahl > 5
			)
				errors.anzahl = 'Bitte wählen Sie zwischen 1 und 5 Exemplaren.';
			if (!['postkorb', 'post'].includes(String(data.uebermittlung)))
				errors.uebermittlung = 'Bitte wählen Sie einen Übermittlungsweg aus.';
		} else if (data.bestaetigt !== true) {
			errors.bestaetigt = 'Bitte bestätigen Sie die Richtigkeit Ihrer Angaben.';
		}
	} else if (slug === 'anwohnerparkausweis') {
		if (step === 0) {
			const plate = validateGermanPlate(
				typeof data.kennzeichen === 'string' ? data.kennzeichen : ''
			);
			if (!plate.valid) errors.kennzeichen = plate.error!;
			if (!['pkw', 'motorrad', 'carsharing'].includes(String(data.fahrzeugart)))
				errors.fahrzeugart = 'Bitte wählen Sie eine Fahrzeugart aus.';
			if (!['selbst', 'andere'].includes(String(data.halter)))
				errors.halter = 'Bitte wählen Sie das Halterverhältnis aus.';
		} else if (step === 1 && data.parkzone !== deriveParkingZone(user.street, user.postalCode)) {
			errors.parkzone = `Für Ihre Meldeadresse ist nur Zone ${deriveParkingZone(user.street, user.postalCode)} zulässig.`;
		} else if (step === 2) {
			const proof =
				Array.isArray(data.nachweise) && data.nachweise.includes('Zulassungsbescheinigung Teil I');
			if (!proof && !(data.halter === 'selbst' && data.zulassungGeprueft === true))
				errors.nachweise =
					'Bitte prüfen Sie die Zulassung oder laden Sie die Zulassungsbescheinigung Teil I hoch. Bei fremden Haltern ist der Upload erforderlich.';
		} else if (step === 3 && data.laufzeitMonate !== 12 && data.laufzeitMonate !== 24) {
			errors.laufzeitMonate = 'Bitte wählen Sie 12 oder 24 Monate.';
		}
	} else if (step === 0) {
		const nr =
			typeof data.wahlbenachrichtigungsnummer === 'string'
				? data.wahlbenachrichtigungsnummer.trim().toUpperCase()
				: '';
		if (!WAHLBENACHRICHTIGUNG_REGEX.test(nr) || !WAHLBEZIRKE[nr.slice(3, 5)])
			errors.wahlbenachrichtigungsnummer =
				'Bitte geben Sie eine gültige Nummer im Format WB-XX-XXXXXX für Wahlbezirk 01 bis 15 ein.';
	} else if (step === 1) {
		if (!['wohnanschrift', 'abweichend'].includes(String(data.zustellung)))
			errors.zustellung = 'Bitte wählen Sie eine Zustelladresse aus.';
		if (data.zustellung === 'abweichend') {
			const address = data.abweichendeAnschrift;
			const a =
				address && typeof address === 'object' && !Array.isArray(address)
					? (address as Record<string, unknown>)
					: {};
			if (typeof a.street !== 'string' || !a.street.trim())
				errors['abweichendeAnschrift.street'] = 'Bitte geben Sie Straße und Hausnummer an.';
			if (typeof a.postalCode !== 'string' || !/^\d{5}$/.test(a.postalCode))
				errors['abweichendeAnschrift.postalCode'] =
					'Bitte geben Sie eine 5-stellige deutsche Postleitzahl an.';
			if (typeof a.city !== 'string' || !a.city.trim())
				errors['abweichendeAnschrift.city'] = 'Bitte geben Sie den Wohnort an.';
		}
	}
	return { valid: Object.keys(errors).length === 0, errors };
}

export function validateWizard(
	slug: WizardSlug,
	data: Record<string, unknown>,
	user: Pick<User, 'street' | 'postalCode'>
) {
	const errors: Record<string, string> = {};
	for (let step = 0; step < STEP_COUNTS[slug]; step++)
		Object.assign(errors, validateWizardStep(slug, step, data, user).errors);
	return { valid: Object.keys(errors).length === 0, errors };
}
