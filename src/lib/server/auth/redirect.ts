/** Keep post-login navigation on this portal, including after URL normalisation. */
export function safePath(raw: unknown, fallback = ''): string {
	if (
		typeof raw !== 'string' ||
		!raw.startsWith('/') ||
		raw.startsWith('//') ||
		raw.includes('\\') ||
		[...raw].some((char) => char <= ' ')
	)
		return fallback;
	const url = new URL(raw, 'https://portal.invalid');
	return url.pathname === '/auth' || url.pathname.startsWith('/auth/')
		? fallback
		: url.pathname + url.search + url.hash;
}
