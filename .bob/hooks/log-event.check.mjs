import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const hook = new URL('./log-event.mjs', import.meta.url).href;
const payload = { hook_event_name: 'PostToolUse', session_id: 'test-session' };

function run(url, outcome = 'ok') {
	const cwd = mkdtempSync(join(tmpdir(), 'bob-hook-check-'));
	const env = { ...process.env, GIT_ORG: 'demo', GIT_REPO: 'portal', GIT_ISSUE_NUMBER: '42' };
	delete env.BOB_EVENTS_URL;
	if (url !== undefined) env.BOB_EVENTS_URL = url;
	try {
		const result = spawnSync(
			process.execPath,
			[
				'--input-type=module',
				'--eval',
				`
			import { writeFileSync } from "node:fs";
			globalThis.fetch = async (url, options) => {
				writeFileSync("forwarded.json", JSON.stringify({ url, method: options.method, body: JSON.parse(options.body) }));
				if (${JSON.stringify(outcome)} === "throw") throw new Error("offline");
				return { ok: ${outcome === 'ok'}, status: 503, statusText: "Unavailable" };
			};
			await import(${JSON.stringify(hook)});
		`
			],
			{ cwd, env, input: JSON.stringify(payload), encoding: 'utf8', timeout: 10000 }
		);
		assert.equal(result.status, 0, result.stderr);
		assert.equal(result.stdout, '');
		const entries = readFileSync(join(cwd, '.bob/logs/hooks.jsonl'), 'utf8')
			.trim()
			.split('\n')
			.map(JSON.parse);
		assert.equal(entries[0].hook_event_name, payload.hook_event_name);
		assert.equal(entries[0].git_issue_number, 42);
		const forwarded = join(cwd, 'forwarded.json');
		return {
			entries,
			stderr: result.stderr,
			request: existsSync(forwarded) ? JSON.parse(readFileSync(forwarded, 'utf8')) : null
		};
	} finally {
		rmSync(cwd, { recursive: true, force: true });
	}
}

for (const url of [undefined, '']) {
	const result = run(url);
	assert.equal(result.request, null);
	assert.equal(result.entries.length, 1);
	assert.equal(result.stderr, '');
}

const url = 'https://events.example.test/api/events';
const forwarded = run(url);
assert.equal(forwarded.request.url, url);
assert.equal(forwarded.request.method, 'POST');
assert.deepEqual(forwarded.request.body, forwarded.entries[0]);
assert.equal(forwarded.entries.length, 1);
assert.equal(forwarded.stderr, '');

for (const outcome of ['http-error', 'throw']) {
	const result = run(url, outcome);
	assert.equal(result.entries.length, 2);
	assert.equal(result.entries[1].level, 'error');
	assert.match(result.stderr, /log-event: POST failed:/);
}

console.log('Bob hook endpoint, local-only logging and fail-open checks passed.');
