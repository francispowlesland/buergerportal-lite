#!/usr/bin/env bash
# Deterministic structure check for a generated plan. No LLM involved.
# Usage: validate-plan.sh <plan.md>
set -euo pipefail

plan=$1
max_chars=60000 # GitHub comments cap at 65536; leave room for the wrapper.

required=(
  "## Summary"
  "## Acceptance criteria"
  "## Assumptions"
  "## Impact analysis"
  "## Contract changes"
  "## Implementation steps"
  "## Test strategy"
  "## Security and data"
  "## Rollout and rollback"
  "## Risks and estimate"
  "## Definition of done"
)

fail=0
for heading in "${required[@]}"; do
  count=$(grep -cxF "$heading" "$plan" || true)
  if [ "$count" -eq 0 ]; then
    echo "missing section: $heading"
    fail=1
  elif [ "$count" -gt 1 ]; then
    echo "duplicate section: $heading"
    fail=1
  fi
done

size=$(wc -c < "$plan")
if [ "$size" -gt "$max_chars" ]; then
  echo "plan too long: $size > $max_chars characters"
  fail=1
fi

exit "$fail"
