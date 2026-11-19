import type { LayoutServerLoad } from './$types';
import { requireCaseworker } from '#lib/server/auth/guards.ts';
import { resolveScope } from './data.server.ts';

/** Role guard for the whole route group: visitors → login, citizens → 403. */
export const load: LayoutServerLoad = async ({ locals, url }) => {
	const { user } = requireCaseworker({ locals, url });
	const scope = await resolveScope(user, url.searchParams.get('amt'));
	return {
		scope,
		caseworker: {
			name: `${user.firstName} ${user.lastName}`,
			jobTitle: user.jobTitle
		}
	};
};
