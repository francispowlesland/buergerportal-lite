import type { WizardDefinition } from './types.ts';
import { deriveParkingZone } from './parkingZones.ts';
import { validateWizardStep, validateWizard } from './validation.ts';

export const anwohnerparkausweisWizard: WizardDefinition = {
	slug: 'anwohnerparkausweis',
	serviceSlug: 'anwohnerparkausweis',
	title: 'Bewohnerparkausweis beantragen',
	lead: 'Parkberechtigung für Anwohnerinnen und Anwohner im Bewohnerparkgebiet.',
	steps: [
		{ id: 'fahrzeug', title: 'Fahrzeugangaben' },
		{ id: 'parkzone', title: 'Parkzone auswählen' },
		{ id: 'nachweise', title: 'Nachweise erbringen' },
		{ id: 'laufzeit', title: 'Gültigkeit und Gebühr' },
		{ id: 'pruefen', title: 'Prüfen und absenden' }
	],
	getInitialData: (user) => ({
		kennzeichen: '',
		fahrzeugart: 'pkw',
		halter: 'selbst',
		parkzone: deriveParkingZone(user.street, user.postalCode),
		zulassungGeprueft: false,
		laufzeitMonate: 12,
		nachweise: []
	}),
	validateStep: (step, data, user) => validateWizardStep('anwohnerparkausweis', step, data, user),
	validateAll: (data, user) => validateWizard('anwohnerparkausweis', data, user)
};
