#!/usr/bin/env bash
#
# Publish a commit status saying whether a pull request still carries a label
# that should stop it merging.
#
# This is written as a commit status rather than a job result because labels
# applied by a workflow's own GITHUB_TOKEN do not trigger further workflow runs.
# A gate that only listened for label events would therefore stay green when the
# triage workflow added needs-verification. Both the triage workflow and the
# label-event workflow call this script, so the status is refreshed whichever
# way the labels changed.
#
# Requires: PR, REPO, GH_TOKEN. Set DRY_RUN=1 to print instead of publishing.

set -euo pipefail

: "${PR:?pull request number is required}"
: "${REPO:?repository is required}"

readonly CONTEXT='triage/no-blocking-labels'

# needs-changes, needs-verification, needs-coordination and blocked all mean the
# same thing to a merge: something is still owed. entry:* labels describe the
# change and are deliberately not gates.
readonly BLOCKING='^(needs-.+|blocked)$'

pr_json=$(gh pr view "$PR" --repo "$REPO" --json labels,headRefOid,state)
state=$(jq -r .state <<<"$pr_json")

if [ "$state" != 'OPEN' ]; then
    echo "Pull request #${PR} is ${state}; nothing to gate."
    exit 0
fi

sha=$(jq -r .headRefOid <<<"$pr_json")
blocking=$(jq -r '.labels[].name' <<<"$pr_json" | grep -E "$BLOCKING" | sort | paste -sd', ' - || true)

if [ -n "$blocking" ]; then
    status='failure'
    description="Blocked by: ${blocking}"
else
    status='success'
    description='No blocking labels'
fi

# The status API rejects descriptions longer than 140 characters.
description=${description:0:140}

echo "#${PR} @ ${sha:0:7} -> ${status}: ${description}"

if [ -n "${DRY_RUN:-}" ]; then
    exit 0
fi

gh api -X POST "repos/${REPO}/statuses/${sha}" \
    -f state="$status" \
    -f context="$CONTEXT" \
    -f description="$description" \
    --silent
