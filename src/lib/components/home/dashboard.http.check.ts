// Run with a seeded database and dev server; retains one new demo message, never deletes seeds.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import postgres from 'postgres';

assert(process.env.DATABASE_URL, 'Run with tsx --env-file=.env');
const sql = postgres(process.env.DATABASE_URL);
const origin = process.env.PORTAL_URL ?? 'http://localhost:5180';
const secret = `Protected-dashboard-${randomUUID()}`;

try {
	const [user] = await sql<{ id: number }[]>`select id from users where slug = 'max'`;
	assert(user, 'Seed Max first');
	const [message] = await sql<{ id: number }[]>`
		insert into messages ("userId", kind, subject, body, "fromName", "requiredTrust")
		values (${user.id}, 'bescheid', ${secret}, ${secret}, 'Demo-Prüfung', 'hoch') returning id`;
	assert(message);
	for (const persona of ['max-basis', 'max-hoch', 'erika-basis']) {
		const switched = await fetch(`${origin}/auth/persona`, {
			method: 'POST',
			headers: { Origin: origin },
			body: new URLSearchParams({ persona, redirectTo: '/' }),
			redirect: 'manual'
		});
		assert.equal(switched.status, 303);
		const cookie = switched.headers
			.getSetCookie()
			.map((value) => value.split(';')[0])
			.join('; ');
		for (const route of ['/mein-buergerportal', '/mein-buergerportal/__data.json']) {
			const response = await fetch(origin + route, { headers: { Cookie: cookie } });
			assert.equal(response.status, 200);
			const body = await response.text();
			assert.equal(body.includes(secret), persona === 'max-hoch', `${persona}: ${route}`);
			if (persona === 'max-basis' && !route.endsWith('.json')) {
				assert.ok(body.includes('Geschützte Nachricht'));
				assert.match(body, /data-sveltekit-preload-data="false"/);
			}
		}
	}
	const [state] = await sql<
		{ readAt: Date | null }[]
	>`select "readAt" from messages where id = ${message.id}`;
	assert.equal(state.readAt, null, 'Dashboard visits must not mark mail as read');
	console.log('Dashboard trust, ownership, no-prefetch and unread checks passed.');
} finally {
	await sql.end();
}
