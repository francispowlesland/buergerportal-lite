import { asc, and, eq, ne } from 'drizzle-orm';
import {
	db,
	locations,
	offices,
	services,
	type Location,
	type Office,
	type Service
} from './db/index.ts';
import type { TrustLevel } from '../trust.ts';
export { efaFields } from '../components/services/efa.ts';

/** Slim row for the A–Z list: no long description, office name and slug joined. */
export type ServiceListItem = {
	id: number;
	slug: string;
	name: string;
	summary: string;
	keywords: string[];
	lebenslagen: string[];
	feeCents: number;
	feeNote: string | null;
	processingTime: string;
	requiredTrust: TrustLevel;
	action: Service['action'];
	efaProvider: string | null;
	officeSlug: string;
	officeName: string;
};

export type ServiceDetail = Service & { office: Office; locations: Location[] };

const listColumns = {
	id: services.id,
	slug: services.slug,
	name: services.name,
	summary: services.summary,
	keywords: services.keywords,
	lebenslagen: services.lebenslagen,
	feeCents: services.feeCents,
	feeNote: services.feeNote,
	processingTime: services.processingTime,
	requiredTrust: services.requiredTrust,
	action: services.action,
	efaProvider: services.efaProvider,
	officeSlug: offices.slug,
	officeName: offices.name
};

/** All services, alphabetically, with their responsible office. */
export async function listServices(): Promise<ServiceListItem[]> {
	const rows = await db
		.select(listColumns)
		.from(services)
		.innerJoin(offices, eq(services.officeId, offices.id))
		.orderBy(asc(services.name));
	return rows.sort((a, b) => a.name.localeCompare(b.name, 'de'));
}

/** One service with its office and the office's Standorte, or null for an unknown slug. */
export async function getServiceBySlug(slug: string): Promise<ServiceDetail | null> {
	const [row] = await db
		.select({ service: services, office: offices })
		.from(services)
		.innerJoin(offices, eq(services.officeId, offices.id))
		.where(eq(services.slug, slug))
		.limit(1);
	if (!row) return null;

	const officeLocations = await db
		.select()
		.from(locations)
		.where(eq(locations.officeId, row.office.id))
		.orderBy(asc(locations.name));

	return { ...row.service, office: row.office, locations: officeLocations };
}

/** Other services of the same Amt, alphabetically. */
export async function relatedServices(
	service: Pick<Service, 'id' | 'officeId'>,
	limit = 4
): Promise<ServiceListItem[]> {
	const rows = await db
		.select(listColumns)
		.from(services)
		.innerJoin(offices, eq(services.officeId, offices.id))
		.where(and(eq(services.officeId, service.officeId), ne(services.id, service.id)))
		.orderBy(asc(services.name))
		.limit(limit);
	return rows.sort((a, b) => a.name.localeCompare(b.name, 'de'));
}
