#!/usr/bin/env bash
# Run Bob Shell once and write its final message to a file.
# Usage: run-bob.sh <input-file> <output-md> <max-cost> <max-turns> [plan|implement]
# Needs BOB_API_KEY in the environment.
#   plan (default): read-only. Plan mode, no shell, no MCP, no subagents.
#   implement:      agent mode with edit and shell, still no MCP or subagents.
#                   Only for input a maintainer has approved.
set -euo pipefail

input=$1 out=$2 max_cost=$3 max_turns=$4 kind=${5:-plan}
raw=$(mktemp)

case "$kind" in
  # The issue text is untrusted input and must not be able to make Bob run anything.
  plan) mode=plan disabled=execute,mcp ;;
  implement) mode=agent disabled=mcp ;;
  *) echo "::error::Unknown kind '$kind'"; exit 2 ;;
esac

bob run --accept-license --trust --mode "$mode" --format json \
  --disable-tool-groups "$disabled" --disable-subagents \
  --max-cost "$max_cost" --max-turns "$max_turns" \
  < "$input" > "$raw"

# Result shape: {"type":"result","status":"success","last_message":"..."}
result=$(jq -s 'map(select(.type == "result")) | last' "$raw")
status=$(jq -r '.status // "missing"' <<<"$result")
if [ "$status" != "success" ]; then
  echo "::error::Bob finished with status '$status'"
  exit 1
fi
jq -r '.last_message // empty' <<<"$result" > "$out"

# Models like to wrap the whole answer in a code fence; unwrap it.
case "$(head -n1 "$out")" in
  '```markdown'|'```md')
    sed '1d' "$out" | sed '${/^```$/d;}' > "$out.tmp" && mv "$out.tmp" "$out" ;;
esac
[ -s "$out" ] || { echo "::error::Bob returned an empty message"; exit 1; }
