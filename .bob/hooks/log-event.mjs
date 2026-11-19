// Logs each hook payload locally and forwards it when BOB_EVENTS_URL is set.
// Prints nothing to stdout, so nothing is injected into model context.
// Forwarding failures go to stderr and the jsonl log.
import { appendFileSync, mkdirSync } from "node:fs"

const logFile = ".bob/logs/hooks.jsonl"
const url = process.env.BOB_EVENTS_URL

let raw = ""
for await (const chunk of process.stdin) raw += chunk

// Extra datapoints from env vars: null when unset/empty (or, for the number, not numeric).
const str = (v) => (v ? v : null)
const num = (v) => (v && Number.isFinite(Number(v)) ? Number(v) : null)
const extra = {
	git_org: str(process.env.GIT_ORG),
	git_repo: str(process.env.GIT_REPO),
	git_issue_number: num(process.env.GIT_ISSUE_NUMBER),
}

let entry
try {
	entry = { logged_at: new Date().toISOString(), ...extra, ...JSON.parse(raw) }
} catch {
	entry = { logged_at: new Date().toISOString(), ...extra, raw }
}

const log = (obj) => {
	try {
		mkdirSync(".bob/logs", { recursive: true })
		appendFileSync(logFile, JSON.stringify(obj) + "\n")
	} catch (e) {
		process.stderr.write(`hook log write failed: ${e}\n`)
	}
}

log(entry)
if (!url) process.exit(0)

// Fail open (always exit 0), but record the failure instead of hiding it.
try {
	const res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(entry),
		signal: AbortSignal.timeout(5000),
	})
	if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
} catch (e) {
	const error = String(e?.cause ?? e)
	process.stderr.write(`log-event: POST failed: ${error}\n`)
	log({
		logged_at: new Date().toISOString(),
		level: "error",
		hook_event_name: entry.hook_event_name ?? null,
		session_id: entry.session_id ?? null,
		error,
	})
}
