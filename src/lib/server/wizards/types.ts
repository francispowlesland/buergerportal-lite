import type { User } from '#lib/server/db/schema.ts';
import type { WizardSlug } from '#lib/applicationData.ts';

export type WizardStep = {
	id: string;
	title: string;
	shortTitle?: string;
};

export type WizardValidationResult = {
	valid: boolean;
	errors: Record<string, string>;
};

export type WizardDefinition = {
	slug: WizardSlug;
	serviceSlug: string;
	title: string;
	lead: string;
	steps: WizardStep[];
	getInitialData: (user: User) => Record<string, unknown>;
	validateStep: (
		stepIndex: number,
		data: Record<string, unknown>,
		user: User
	) => WizardValidationResult;
	validateAll: (data: Record<string, unknown>, user: User) => WizardValidationResult;
};
