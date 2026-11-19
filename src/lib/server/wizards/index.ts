import type { WizardSlug } from '#lib/applicationData.ts';
import type { WizardDefinition } from './types.ts';
import { meldebescheinigungWizard } from './meldebescheinigung.ts';
import { anwohnerparkausweisWizard } from './anwohnerparkausweis.ts';
import { briefwahlWizard } from './briefwahl.ts';

export * from './types.ts';
export type { WizardSlug } from '#lib/applicationData.ts';
export * from './election.ts';
export * from './parkingZones.ts';
export * from './meldebescheinigung.ts';
export * from './anwohnerparkausweis.ts';
export * from './briefwahl.ts';

export const WIZARDS: Record<WizardSlug, WizardDefinition> = {
	meldebescheinigung: meldebescheinigungWizard,
	anwohnerparkausweis: anwohnerparkausweisWizard,
	briefwahl: briefwahlWizard
};

export function isWizardSlug(slug: string): slug is WizardSlug {
	return slug === 'meldebescheinigung' || slug === 'anwohnerparkausweis' || slug === 'briefwahl';
}

export function getWizard(slug: string): WizardDefinition | null {
	if (isWizardSlug(slug)) {
		return WIZARDS[slug];
	}
	return null;
}
