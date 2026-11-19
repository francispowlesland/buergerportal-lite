import type { ScopeInfo } from './types.ts';

/** Default scope of a caseworker: their own Amt, or all Ämter if they have none. */
export const defaultScope = (scope: ScopeInfo) => scope.ownSlug ?? 'alle';

/** Adds `?amt=` to an internal href so the chosen Amt survives navigation. */
export function scopeHref(href: string, scope: ScopeInfo, extra: Record<string, string> = {}) {
	const q = new URLSearchParams(extra);
	if (scope.slug !== defaultScope(scope)) q.set('amt', scope.slug);
	const s = q.toString();
	return s ? `${href}${href.includes('?') ? '&' : '?'}${s}` : href;
}
