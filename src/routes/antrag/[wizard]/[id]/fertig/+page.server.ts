import { redirect } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { db, messages, attachments } from '#lib/server/db/index.ts';
import { readApplication } from '#lib/server/wizards/application.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { app, service, user } = await readApplication(event);
	if (app.status === 'entwurf') redirect(303, `/antrag/${event.params.wizard}/${app.id}`);
	const [message] = await db
		.select({ id: messages.id })
		.from(messages)
		.where(eq(messages.applicationId, app.id))
		.orderBy(desc(messages.createdAt), desc(messages.id))
		.limit(1);
	const atts = await db.select().from(attachments).where(eq(attachments.applicationId, app.id));
	return { application: app, service, user, messageId: message?.id, attachments: atts };
};
