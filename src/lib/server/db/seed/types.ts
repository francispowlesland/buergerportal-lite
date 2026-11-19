import type { TrustLevel } from '../../../trust';

export type Lebenslage =
	| 'geburt'
	| 'umzug'
	| 'heirat'
	| 'kinder'
	| 'auto'
	| 'wahl'
	| 'bauen'
	| 'wohnen'
	| 'umwelt'
	| 'tod'
	| 'ausweise'
	| 'hund';

export type ServiceSeed = {
	slug: string;
	name: string;
	/** Office slug. */
	office: string;
	summary: string;
	description: string;
	lebenslagen: Lebenslage[];
	keywords: string[];
	documents: string[];
	legalBasis: string;
	feeCents: number;
	feeNote?: string;
	processingTime: string;
	requiredTrust: TrustLevel;
	action: 'antrag' | 'termin' | 'efa' | 'info';
	wizardSlug?: string;
	efaProvider?: string;
	efaUrl?: string;
};
