import { and, count, eq, isNull } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';
import { db, messages } from '#lib/server/db/index.ts';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = locals.user;
	let unread = 0;
	if (user?.role === 'citizen') {
		const [row] = await db
			.select({ n: count() })
			.from(messages)
			.where(
				and(eq(messages.userId, user.id), isNull(messages.readAt), eq(messages.fromCitizen, false))
			);
		unread = row?.n ?? 0;
	}

	return {
		session: user
			? {
					id: user.id,
					slug: user.slug,
					role: user.role,
					firstName: user.firstName,
					lastName: user.lastName,
					maxTrust: user.maxTrust,
					trust: locals.trust!
				}
			: null,
		unread
	};
};
