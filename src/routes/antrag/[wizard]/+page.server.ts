import { error, redirect } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { requireCitizen } from '#lib/server/auth/guards.ts';
import { db, applications, services } from '#lib/server/db/index.ts';
import { addEvent, newReference } from '#lib/server/domain.ts';
import { getWizard } from '#lib/server/wizards/index.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const wizardDef = getWizard(params.wizard);
	if (!wizardDef) {
		error(404, `Der Online-Dienst „${params.wizard}“ wurde nicht gefunden.`);
	}

	const [service] = await db
		.select()
		.from(services)
		.where(eq(services.wizardSlug, params.wizard))
		.limit(1);

	if (!service) {
		error(404, `Der Dienst zum Assistenten „${params.wizard}“ existiert nicht.`);
	}

	const { user } = requireCitizen({ locals, url }, service.requiredTrust);

	// Check if user already has an active draft for this service
	const [existingDraft] = await db
		.select()
		.from(applications)
		.where(
			and(
				eq(applications.userId, user.id),
				eq(applications.serviceId, service.id),
				eq(applications.status, 'entwurf')
			)
		)
		.limit(1);

	if (existingDraft) {
		redirect(303, `/antrag/${params.wizard}/${existingDraft.id}`);
	}

	// Create a new draft application
	const initialData = wizardDef.getInitialData(user);
	const reference = newReference('MS');

	const [newApp] = await db
		.insert(applications)
		.values({
			reference,
			userId: user.id,
			serviceId: service.id,
			status: 'entwurf',
			step: 0,
			data: initialData
		})
		.returning();

	if (!newApp) {
		error(500, 'Der Antrag konnte nicht initialisiert werden.');
	}

	await addEvent(db, newApp.id, 'erstellt', 'Entwurf angelegt.', user.id);

	redirect(303, `/antrag/${params.wizard}/${newApp.id}`);
};
