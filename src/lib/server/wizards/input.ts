import type { WizardSlug } from '#lib/applicationData.ts';
import { validateGermanPlate } from './parkingZones.ts';
import { resolveWahlbezirk } from './election.ts';

const FIELDS = {
	meldebescheinigung: {
		zweck: 'string',
		anzahl: 'number',
		uebermittlung: 'string',
		bestaetigt: 'boolean'
	},
	anwohnerparkausweis: {
		kennzeichen: 'string',
		fahrzeugart: 'string',
		halter: 'string',
		parkzone: 'string',
		laufzeitMonate: 'number'
	},
	briefwahl: { wahlbenachrichtigungsnummer: 'string', zustellung: 'string' }
} as const;

export function readWizardInput(
	slug: WizardSlug,
	form: FormData,
	saved: Record<string, unknown>,
	initial: Record<string, unknown>,
	proofLabels: string[]
) {
	const raw = form.get('dataPayload');
	let payload: unknown = {};
	if (raw !== null) {
		if (typeof raw !== 'string' || raw.length > 12000)
			throw new Error('Die Formulardaten sind zu groß oder ungültig.');
		try {
			payload = JSON.parse(raw);
		} catch {
			throw new Error('Die Formulardaten sind ungültig. Bitte laden Sie den Antrag neu.');
		}
	}
	if (!payload || typeof payload !== 'object' || Array.isArray(payload))
		throw new Error('Die Formulardaten müssen ein Objekt sein.');
	const input = payload as Record<string, unknown>;
	const data = { ...initial, ...saved };
	for (const [key, type] of Object.entries(FIELDS[slug])) {
		let value = input[key];
		// Native fields take precedence so the same actions also work without JavaScript.
		if (form.has(key)) {
			const native = form.get(key);
			value = type === 'number' ? Number(native) : type === 'boolean' ? native === 'on' : native;
		} else if (
			key === 'bestaetigt' &&
			form.get('currentStep') === '1' &&
			form.has('nativeFields')
		) {
			value = false;
		}
		if (value === undefined) continue;
		if (
			typeof value !== type ||
			(typeof value === 'string' && value.length > 300) ||
			(typeof value === 'number' && !Number.isFinite(value))
		)
			throw new Error(
				'Die Formulardaten haben ein ungültiges Format. Bitte prüfen Sie Ihre Angaben.'
			);
		data[key] = typeof value === 'string' ? value.trim() : value;
	}
	if (slug === 'briefwahl') {
		const rawAddress = input.abweichendeAnschrift;
		if (
			rawAddress !== undefined &&
			(!rawAddress || typeof rawAddress !== 'object' || Array.isArray(rawAddress))
		)
			throw new Error('Die abweichende Anschrift ist ungültig.');
		const address: Record<string, unknown> = {
			...((data.abweichendeAnschrift as Record<string, unknown>) ?? {})
		};
		for (const key of ['street', 'postalCode', 'city']) {
			const value =
				form.get(`abweichendeAnschrift_${key}`) ??
				(rawAddress as Record<string, unknown> | undefined)?.[key];
			if (value === undefined || value === null) continue;
			if (typeof value !== 'string' || value.length > 300)
				throw new Error('Die abweichende Anschrift ist ungültig.');
			address[key] = value.trim();
		}
		data.abweichendeAnschrift = address;
		data.wahlbenachrichtigungsnummer = String(data.wahlbenachrichtigungsnummer).toUpperCase();
		data.wahlbezirk = resolveWahlbezirk(String(data.wahlbenachrichtigungsnummer));
	} else if (slug === 'anwohnerparkausweis') {
		data.kennzeichen = validateGermanPlate(String(data.kennzeichen)).normalized;
		data.nachweise = proofLabels;
		data.zulassungGeprueft =
			saved.zulassungGeprueft === true &&
			data.kennzeichen === saved.kennzeichen &&
			data.halter === saved.halter;
	}
	return data;
}

export function readStep(value: FormDataEntryValue | null, count: number) {
	const step = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : NaN;
	return Number.isInteger(step) && step >= 0 && step < count ? step : null;
}

export function validateAttachment(filename: string, sizeBytes: number, mimeType: string) {
	const extensions: Record<string, RegExp> = {
		'application/pdf': /\.pdf$/i,
		'image/jpeg': /\.jpe?g$/i,
		'image/png': /\.png$/i
	};
	return (
		filename.length > 0 &&
		filename.length <= 200 &&
		!/[\\/]/.test(filename) &&
		![...filename].some((character) => character.charCodeAt(0) < 32) &&
		Number.isSafeInteger(sizeBytes) &&
		sizeBytes > 0 &&
		sizeBytes <= 5 * 1024 * 1024 &&
		Object.hasOwn(extensions, mimeType) &&
		extensions[mimeType].test(filename)
	);
}
