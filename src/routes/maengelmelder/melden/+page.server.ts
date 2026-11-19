import { db, defects, defectUpdates } from '#lib/server/db/index.ts';
import { newReference } from '#lib/server/domain.ts';
import { MAP_CENTER } from '#lib/geo.ts';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { validateReport } from './validation.ts';

export const load: PageServerLoad = ({ locals }) => {
	// Reporting a defect is public and does NOT require login.
	// If the user is logged in, we attach their user ID to the report.
	return {
		user: locals.user
			? {
					id: locals.user.id,
					name: `${locals.user.firstName} ${locals.user.lastName}`,
					email: locals.user.email
				}
			: null,
		defaultCoords: MAP_CENTER
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const { category, errors, values } = validateReport(await request.formData());
		if (!category || Object.keys(errors).length > 0) return fail(400, { errors, values });

		for (let attempt = 0; attempt < 3; attempt++) {
			const createdRef = await db.transaction(async (tx) => {
				const [created] = await tx
					.insert(defects)
					.values({
						...values,
						reference: newReference('M', 4),
						category,
						status: 'gemeldet',
						reporterId: locals.user?.id ?? null
					})
					.onConflictDoNothing({ target: defects.reference })
					.returning({ id: defects.id, reference: defects.reference });

				if (!created) return null;

				// Add initial status update entry
				await tx.insert(defectUpdates).values({
					defectId: created.id,
					status: 'gemeldet',
					note: 'Meldung eingegangen und an den zuständigen Fachbereich übermittelt.',
					authorName: 'Mängelmelder Musterstadt'
				});
				return created.reference;
			});
			if (createdRef) redirect(303, `/maengelmelder/${createdRef}?erfolg=1`);
		}
		error(
			503,
			'Das Aktenzeichen konnte nicht vergeben werden. Bitte senden Sie die Meldung erneut.'
		);
	}
};
