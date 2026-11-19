import { desc, eq, and, inArray } from 'drizzle-orm';
import { requireCitizen } from '#lib/server/auth/guards.ts';
import { db, applications, services } from '#lib/server/db/index.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const { user, trust } = requireCitizen({ locals, url });
	const wizardSlugs = ['meldebescheinigung', 'anwohnerparkausweis', 'briefwahl'];

	const userApplications = await db
		.select({
			application: applications,
			service: services
		})
		.from(applications)
		.innerJoin(services, eq(services.id, applications.serviceId))
		.where(and(eq(applications.userId, user.id), inArray(services.wizardSlug, wizardSlugs)))
		.orderBy(desc(applications.updatedAt));

	const availableServices = await db
		.select()
		.from(services)
		.where(and(eq(services.action, 'antrag'), inArray(services.wizardSlug, wizardSlugs)))
		.orderBy(services.name);

	return {
		user,
		trust,
		applications: userApplications,
		availableServices
	};
};
