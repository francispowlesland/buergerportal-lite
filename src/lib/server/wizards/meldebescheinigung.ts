import type { WizardDefinition } from './types.ts';
import { validateWizardStep, validateWizard } from './validation.ts';

export const meldebescheinigungWizard: WizardDefinition = {
	slug: 'meldebescheinigung',
	serviceSlug: 'meldebescheinigung',
	title: 'Meldebescheinigung beantragen',
	lead: 'Amtlicher Nachweis über Ihre aktuelle Meldeanschrift in Musterstadt.',
	steps: [
		{ id: 'angaben', title: 'Angaben zur Bescheinigung' },
		{ id: 'pruefen', title: 'Prüfen und absenden' }
	],
	getInitialData: () => ({
		zweck: 'arbeitgeber',
		anzahl: 1,
		uebermittlung: 'postkorb',
		bestaetigt: false
	}),
	validateStep: (step, data, user) => validateWizardStep('meldebescheinigung', step, data, user),
	validateAll: (data, user) => validateWizard('meldebescheinigung', data, user)
};
