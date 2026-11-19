import { asc, eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import { requireCitizen } from '#lib/server/auth/guards.ts';
import { db, offices, services } from '#lib/server/db/index.ts';
import { listAppointments, toAppointmentView } from '#lib/server/appointments.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url, setHeaders }) => {
	const { user } = requireCitizen({ locals, url });
	setHeaders({ 'cache-control': 'private, no-store' });
	const service = url.searchParams.get('service');
	if (service) redirect(303, `/termine/buchen?${new URLSearchParams({ dienst: service })}`);
	const rows = await listAppointments(db, user.id);

	// Offices that have bookable services (action = 'termin')
	const bookableServices = await db
		.select({
			serviceId: services.id,
			serviceSlug: services.slug,
			serviceName: services.name,
			officeId: offices.id,
			officeSlug: offices.slug,
			officeName: offices.name
		})
		.from(services)
		.innerJoin(offices, eq(offices.id, services.officeId))
		.where(eq(services.action, 'termin'))
		.orderBy(asc(offices.name), asc(services.name));

	return {
		appointments: rows.map((row) => toAppointmentView(row)),
		officeGroups: [...new Set(bookableServices.map((s) => s.officeSlug))].map((slug) => ({
			officeSlug: slug,
			officeName: bookableServices.find((s) => s.officeSlug === slug)!.officeName,
			services: bookableServices.filter((s) => s.officeSlug === slug)
		}))
	};
};
