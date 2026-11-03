#!/usr/bin/env bash
# Install the narrow Cosmaneura marketing skill set for Cursor.
# Skills land in .agents/skills/ (gitignored). Re-run to refresh.
set -euo pipefail
cd "$(dirname "$0")/.."

npx --yes skills add coreyhaines31/marketingskills \
  --agent cursor \
  --skill product-marketing \
  --skill cro \
  --skill copywriting \
  --skill copy-editing \
  --skill site-architecture \
  --skill seo-audit \
  --skill ai-seo \
  --skill schema \
  --skill marketing-ideas \
  --skill marketing-psychology \
  --skill marketing-council \
  --yes \
  --copy

# Eval fixtures are not needed for agent use and inflate diffs.
find .agents/skills -type d -name evals -prune -exec rm -rf {} + 2>/dev/null || true

echo "Installed narrow marketing skills into .agents/skills/"
echo "Read .agents/product-marketing.md and docs/MARKETING_AGENT_SOP.md before use."
