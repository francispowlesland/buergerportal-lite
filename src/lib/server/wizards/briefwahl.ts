import { eq, and, ne, sql } from 'drizzle-orm';
import { db, applications, services } from '#lib/server/db/index.ts';
import type { WizardDefinition } from './types.ts';
import { getElectionDate, WAHL_NAME } from './election.ts';
import { validateWizardStep, validateWizard } from './validation.ts';

export async function hasExistingSubmittedBriefwahl(
	userId: number,
	currentAppId: number,
	electionDate: string,
	conn: Pick<typeof db, 'select'> = db
): Promise<{ exists: boolean; reference?: string }> {
	const [existing] = await conn
		.select({ reference: applications.reference })
		.from(applications)
		.innerJoin(services, eq(services.id, applications.serviceId))
		.where(
			and(
				eq(applications.userId, userId),
				eq(services.wizardSlug, 'briefwahl'),
				ne(applications.status, 'entwurf'),
				ne(applications.status, 'abgelehnt'),
				ne(applications.id, currentAppId),
				sql`${applications.data}->>'wahlDatum' = ${electionDate}`
			)
		)
		.limit(1);
	return existing ? { exists: true, reference: existing.reference } : { exists: false };
}

export const briefwahlWizard: WizardDefinition = {
	slug: 'briefwahl',
	serviceSlug: 'briefwahl',
	title: 'Wahlschein und Briefwahlunterlagen beantragen',
	lead: 'Stimmabgabe per Briefwahl für die bevorstehende Oberbürgermeisterwahl.',
	steps: [
		{ id: 'wahl', title: 'Wahl und Wahlbenachrichtigung' },
		{ id: 'zustellung', title: 'Zustellung der Unterlagen' },
		{ id: 'pruefen', title: 'Prüfen und absenden' }
	],
	getInitialData: () => ({
		wahl: WAHL_NAME,
		wahlDatum: getElectionDate(),
		wahlbezirk: 'Wahlbezirk 07 – Grundschule Nord',
		wahlbenachrichtigungsnummer: 'WB-07-004711',
		zustellung: 'wohnanschrift',
		abweichendeAnschrift: { street: '', postalCode: '', city: '' }
	}),
	validateStep: (step, data, user) => validateWizardStep('briefwahl', step, data, user),
	validateAll: (data, user) => validateWizard('briefwahl', data, user)
};
