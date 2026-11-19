import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { requireCitizen } from '#lib/server/auth/guards.ts';
import { applications, db, services } from '#lib/server/db/index.ts';
import { getWizard } from './index.ts';

type Context = Pick<RequestEvent, 'locals' | 'url'> & { params: { wizard?: string; id?: string } };

export async function readApplication(
	ctx: Context,
	conn: Pick<typeof db, 'select'> = db,
	draft = false
) {
	const wizard = getWizard(ctx.params.wizard ?? '');
	const id = Number(ctx.params.id);
	if (!wizard || !Number.isSafeInteger(id) || id <= 0)
		error(404, 'Der Antrag wurde nicht gefunden.');
	const { user, trust } = requireCitizen(ctx);
	const query = conn
		.select({ app: applications, service: services })
		.from(applications)
		.innerJoin(services, eq(services.id, applications.serviceId))
		.where(eq(applications.id, id))
		.limit(1);
	const [row] = await (draft ? query.for('update', { of: applications }) : query);
	if (!row || row.service.wizardSlug !== wizard.slug)
		error(404, 'Der Antrag wurde nicht gefunden.');
	if (row.app.userId !== user.id) error(403, 'Sie haben keine Berechtigung für diesen Antrag.');
	requireCitizen(ctx, row.service.requiredTrust);
	if (draft && row.app.status !== 'entwurf')
		error(409, 'Der Antrag wurde bereits abgesendet und kann nicht mehr geändert werden.');
	return { ...row, wizard, user, trust };
}
