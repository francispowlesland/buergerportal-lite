// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { TrustLevel } from '#lib/trust.ts';
import type { User } from '#lib/server/db/schema.ts';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			/** Signed-in persona, or null for an anonymous visitor. */
			user: User | null;
			/** Trust level of the CURRENT session (may be below `user.maxTrust`). */
			trust: TrustLevel | null;
			sessionId: string | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
