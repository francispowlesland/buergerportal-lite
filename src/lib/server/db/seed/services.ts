import { services } from '../schema';
import { idOf, type Db, type Ids } from './util';
import { buergeramtServices, kfzServices, standesamtServices } from './servicesPersonal';
import {
	bauamtServices,
	jugendamtServices,
	ordnungsamtServices,
	wahlamtServices
} from './servicesMunicipal';

export const allServices = [
	...buergeramtServices,
	...standesamtServices,
	...kfzServices,
	...ordnungsamtServices,
	...bauamtServices,
	...jugendamtServices,
	...wahlamtServices
];

export async function seedServices(db: Db, office: Ids): Promise<Ids> {
	const rows = await db
		.insert(services)
		.values(
			allServices.map((s) => ({
				slug: s.slug,
				name: s.name,
				summary: s.summary,
				description: s.description,
				officeId: idOf(office, s.office, 'office'),
				lebenslagen: s.lebenslagen,
				keywords: s.keywords,
				documents: s.documents,
				legalBasis: s.legalBasis,
				feeCents: s.feeCents,
				feeNote: s.feeNote ?? null,
				processingTime: s.processingTime,
				requiredTrust: s.requiredTrust,
				action: s.action,
				wizardSlug: s.wizardSlug ?? null,
				efaProvider: s.efaProvider ?? null,
				efaUrl: s.efaUrl ?? null
			}))
		)
		.returning({ id: services.id, slug: services.slug });
	return Object.fromEntries(rows.map((r) => [r.slug, r.id]));
}
