import { and, desc, eq, inArray, isNull } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { applications, db, messages } from '#lib/server/db/index.ts';
import { requireCitizen } from '#lib/server/auth/guards.ts';
import { lockedSubject } from './access.server.ts';
import { TRUST_LEVELS, meetsTrust } from '#lib/trust.ts';
import {
	FILTERS,
	matchesFilter,
	type FilterKey,
	type InboxItem
} from '#lib/components/postkorb/types.ts';

export const load: PageServerLoad = async ({ locals, url }) => {
	const { user, trust } = requireCitizen({ locals, url });

	// Explicit column list: the message body never travels with the list.
	const rows = await db
		.select({
			id: messages.id,
			kind: messages.kind,
			subject: messages.subject,
			fromName: messages.fromName,
			requiredTrust: messages.requiredTrust,
			fromCitizen: messages.fromCitizen,
			readAt: messages.readAt,
			createdAt: messages.createdAt,
			reference: applications.reference,
			applicationStatus: applications.status
		})
		.from(messages)
		.leftJoin(
			applications,
			and(eq(applications.id, messages.applicationId), eq(applications.userId, user.id))
		)
		.where(eq(messages.userId, user.id))
		.orderBy(desc(messages.createdAt), desc(messages.id));

	const all: InboxItem[] = rows.map((r) => ({
		id: r.id,
		kind: r.kind,
		// A locked subject can reveal the decision ("… abgelehnt"), so it stays on the server.
		subject: meetsTrust(trust, r.requiredTrust) ? r.subject : lockedSubject(r.kind, r.reference),
		fromName: r.fromName,
		requiredTrust: r.requiredTrust,
		fromCitizen: r.fromCitizen,
		unread: r.readAt === null && !r.fromCitizen,
		locked: !meetsTrust(trust, r.requiredTrust),
		actionRequired: r.kind === 'nachforderung' && r.applicationStatus === 'nachforderung',
		createdAt: r.createdAt,
		reference: r.reference
	}));

	const requested = url.searchParams.get('filter');
	const filter: FilterKey = FILTERS.some((f) => f.key === requested)
		? (requested as FilterKey)
		: 'alle';

	const counts = Object.fromEntries(
		FILTERS.map((f) => [f.key, all.filter((m) => matchesFilter(m, f.key)).length])
	) as Record<FilterKey, number>;

	return {
		items: all.filter((m) => matchesFilter(m, filter)),
		filter,
		counts,
		trust,
		openRequests: all.filter((m) => m.actionRequired).length,
		lockedUnread: all.filter((m) => m.unread && m.locked).length
	};
};

export const actions: Actions = {
	/** Marks everything read that this session is allowed to open. Locked messages stay unread. */
	alleGelesen: async ({ locals, url }) => {
		const { user, trust } = requireCitizen({ locals, url });
		const openable = TRUST_LEVELS.filter((level) => meetsTrust(trust, level));
		if (openable.length === 0) return fail(400, { message: 'Keine Nachrichten markiert.' });
		await db
			.update(messages)
			.set({ readAt: new Date() })
			.where(
				and(
					eq(messages.userId, user.id),
					isNull(messages.readAt),
					inArray(messages.requiredTrust, openable)
				)
			);
		return { marked: true };
	}
};
