import assert from 'node:assert/strict';

// Run against a running, seeded demo: npx tsx src/lib/server/portal.check.ts
const origin = process.env.PORTAL_URL ?? 'http://localhost:5180';
const publicRoutes = [
	'/',
	'/dienste',
	'/maengelmelder',
	'/impressum',
	'/datenschutz',
	'/barrierefreiheit'
];
const citizenRoutes = [
	'/mein-buergerportal',
	'/antrag',
	'/postkorb',
	'/termine',
	'/termine/buchen'
];
let checked = 0;

for (const persona of ['visitor', 'max-hoch', 'max-basis', 'erika-basis', 'hans-hoch']) {
	const switched = await fetch(`${origin}/auth/persona`, {
		method: 'POST',
		headers: { Origin: origin },
		body: new URLSearchParams({ persona, redirectTo: '/' }),
		redirect: 'manual'
	});
	assert.equal(switched.status, 303, `Switch ${persona}`);
	const cookie = switched.headers
		.getSetCookie()
		.map((value) => value.split(';')[0])
		.join('; ');
	for (const route of [...publicRoutes, ...citizenRoutes, '/sachbearbeiter']) {
		const response = await fetch(origin + route, {
			headers: { Cookie: cookie },
			redirect: 'manual'
		});
		const expected =
			route === '/sachbearbeiter'
				? persona === 'visitor'
					? 303
					: persona === 'hans-hoch'
						? 200
						: 403
				: citizenRoutes.includes(route) && (persona === 'visitor' || persona === 'hans-hoch')
					? 303
					: 200;
		assert.equal(response.status, expected, `${persona}: ${route}`);
		if (expected === 200) {
			const html = await response.text();
			assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, `${persona}: one h1 on ${route}`);
			assert.ok(!html.includes('Internal Error'), `${persona}: ${route} rendered`);
		} else if (expected === 303) {
			assert.ok(
				response.headers
					.get('location')
					?.startsWith(persona === 'hans-hoch' ? '/sachbearbeiter' : '/auth/login'),
				`${persona}: guarded ${route}`
			);
		}
		checked++;
	}
}

// SvelteKit intentionally skips origin checks in dev; exercise them on the built Node server.
if (process.env.CHECK_CSRF === '1') {
	const crossSite = await fetch(`${origin}/auth/persona`, {
		method: 'POST',
		headers: { Origin: 'https://outside.invalid' },
		body: new URLSearchParams({ persona: 'hans-hoch' }),
		redirect: 'manual'
	});
	assert.equal(crossSite.status, 403, 'Cross-origin form rejected');
}
console.log(`Portal checks passed: ${checked} persona/route checks.`);
