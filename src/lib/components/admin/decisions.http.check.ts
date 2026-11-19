// Run: npx tsx --env-file=.env src/lib/components/admin/decisions.http.check.ts
// Requires the seeded DB and localhost:5180; retains fresh demo records and never deletes seeds.
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import postgres from 'postgres';

assert(process.env.DATABASE_URL, 'Load DATABASE_URL with tsx --env-file=.env');
const sql = postgres(process.env.DATABASE_URL);
const origin = 'http://localhost:5180';
const tag = randomBytes(6).toString('hex');
type Worker = { id: number; cookie: string };
type Case = { id: number; reference: string };
type Decision = 'bewilligt' | 'abgelehnt';

try {
	const [citizen] = await sql<{ id: number }[]>`select id from users where slug = 'max'`;
	const [service] = await sql<{ id: number; officeId: number }[]>`
		select s.id, s."officeId" from services s join users u on u."officeId" = s."officeId"
		where u.slug = 'hans' and s."wizardSlug" = 'meldebescheinigung' limit 1`;
	assert(citizen && service, 'Seed Max, Hans and Meldebescheinigung first');
	const citizenId = citizen.id;
	const serviceId = service.id;
	const officeId = service.officeId;

	async function worker(label: string): Promise<Worker> {
		const [user] = await sql<{ id: number }[]>`
			insert into users (slug, role, "firstName", "lastName", email, "maxTrust", "officeId")
			values (${`check-${tag}-${label}`}, 'caseworker', 'Demo', 'Entscheidungsprüfung',
				'check@example.invalid', 'hoch', ${officeId}) returning id`;
		assert(user);
		const sid = randomBytes(24).toString('hex');
		await sql`insert into sessions (id, "userId", "trustLevel", "expiresAt")
			values (${sid}, ${user.id}, 'hoch', now() + interval '1 hour')`;
		return { id: user.id, cookie: `sid=${sid}` };
	}

	async function application(label: string, assignee: Worker): Promise<Case> {
		const [record] = await sql<Case[]>`
			insert into applications (reference, "userId", "serviceId", status, "assignedToId", "submittedAt")
			values (${`MS-CK-${tag}-${label}`}, ${citizenId}, ${serviceId}, 'eingereicht', ${assignee.id}, now())
			returning id, reference`;
		assert(record);
		return record;
	}

	async function decide(record: Case, actor: Worker, decision: Decision): Promise<number> {
		const action = decision === 'bewilligt' ? 'bewilligen' : 'ablehnen';
		const field = decision === 'bewilligt' ? 'hinweis' : 'begruendung';
		const response = await fetch(`${origin}/sachbearbeiter/antraege/${record.id}?/${action}`, {
			method: 'POST',
			headers: { Origin: origin, Cookie: actor.cookie, Accept: 'text/html' },
			body: new URLSearchParams({ [field]: `Entscheidungsprüfung ${tag}: ${decision}.` }),
			redirect: 'manual',
			signal: AbortSignal.timeout(30_000)
		});
		await response.arrayBuffer();
		return response.status;
	}

	async function verify(record: Case, actor: Worker, decision: Decision) {
		const rows = await sql<
			{
				status: string;
				assignedToId: number;
				decidedAt: Date;
				decision: string;
				issuedById: number;
				bodyText: string;
				userId: number;
				requiredTrust: string;
				actorId: number;
				notices: number;
				events: number;
			}[]
		>`
			select a.status, a."assignedToId", a."decidedAt", b.decision, b."issuedById", b."bodyText",
				m."userId", m."requiredTrust", e."actorId",
				(select count(*)::int from messages where "applicationId" = a.id and kind = 'bescheid') as notices,
				(select count(*)::int from application_events where "applicationId" = a.id) as events
			from applications a join bescheide b on b."applicationId" = a.id
			join messages m on m.id = b."messageId"
			join application_events e on e."applicationId" = a.id and e.kind = b.decision
			where a.id = ${record.id}`;
		assert.equal(rows.length, 1, `${record.reference}: exactly one Bescheid and decision event`);
		const row = rows[0];
		assert.equal(row.status, decision);
		assert.equal(row.decision, decision);
		assert.equal(row.assignedToId, actor.id);
		assert.equal(row.issuedById, actor.id);
		assert.equal(row.actorId, actor.id);
		assert.equal(row.userId, citizenId);
		assert.equal(row.requiredTrust, 'hoch');
		assert.equal(row.notices, 1, 'Losing decision must roll back its notification');
		assert.equal(row.events, 1);
		assert(row.decidedAt);
		assert(row.bodyText.includes(`Entscheidungsprüfung ${tag}: ${decision}.`));
		console.log(
			`${record.reference}: ${decision}, one Bescheid, assignee/issuer/actor ${actor.id}`
		);
	}

	const first = await worker('a');
	const second = await worker('b');
	const approval = await application('a', second);
	assert.equal(await decide(approval, first, 'bewilligt'), 200);
	await verify(approval, first, 'bewilligt');
	const rejection = await application('r', first);
	assert.equal(await decide(rejection, second, 'abgelehnt'), 200);
	await verify(rejection, second, 'abgelehnt');
	const race = await application('c', first);
	const statuses = await Promise.all([
		decide(race, first, 'bewilligt'),
		decide(race, second, 'abgelehnt')
	]);
	assert.deepEqual(
		[...statuses].sort(),
		[200, 409],
		'Concurrent decisions: one winner, one conflict'
	);
	await verify(
		race,
		statuses[0] === 200 ? first : second,
		statuses[0] === 200 ? 'bewilligt' : 'abgelehnt'
	);
	console.log(`Concurrent approval/rejection: HTTP ${statuses.join(' + ')}. All checks passed.`);
} finally {
	await sql.end();
}
