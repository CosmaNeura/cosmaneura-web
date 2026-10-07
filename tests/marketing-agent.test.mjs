import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(root, path), "utf8");

test("marketing agent SOP and product context exist with required guardrails", () => {
  const sop = read("docs/MARKETING_AGENT_SOP.md");
  assert.match(sop, /Partner ads — off by design/);
  assert.match(sop, /PHI boundary/);
  assert.match(sop, /Stacked PR methodology/);
  assert.match(sop, /Creative vs Tier 2/);
  assert.match(sop, /Grok Bot CMO/);
  assert.match(sop, /three messaging layers|Cosmas OS \*\*waitlist\*\*/);

  const context = read(".agents/product-marketing.md");
  assert.match(context, /\*\*Document version:\*\* v1/);
  assert.match(context, /Decision log/);
  assert.match(context, /Messaging architecture/);
  assert.match(context, /Cosmas OS/);
  assert.match(context, /Coming soon/);
  assert.match(context, /Session Prep/);
  assert.match(context, /Card Chase/);
  assert.match(context, /BAA available/);
  assert.match(context, /No real PHI/);
  assert.match(context, /off by default/);

  assert.equal(existsSync(join(root, "scripts/install-marketing-skills.sh")), true);
  assert.equal(existsSync(join(root, "docs/grok-bot-cmo/README.md")), true);
  assert.equal(existsSync(join(root, "docs/grok-bot-cmo/BOT_PROFILE.md")), true);
  assert.equal(
    existsSync(join(root, "docs/grok-bot-cmo/APPROVALS_AND_BOUNDARIES.md")),
    true,
  );
  assert.equal(
    existsSync(join(root, "docs/grok-bot-cmo/product-marketing.md")),
    true,
  );
});

test("Grok Bot port kit includes the narrow Cosmas skill briefs", () => {
  const required = [
    "product-marketing",
    "cro",
    "copywriting",
    "copy-editing",
    "site-architecture",
    "seo-audit",
    "ai-seo",
    "schema",
    "marketing-ideas",
    "marketing-psychology",
    "marketing-council",
  ];
  for (const name of required) {
    const body = read(`docs/grok-bot-cmo/skills/${name}.md`);
    assert.match(body, /# Skill:/);
    assert.match(body, /product-marketing\.md|Hard stops|Cosmas|hard bans/i);
  }
});

test("install script pins the narrow skill set only", () => {
  const script = read("scripts/install-marketing-skills.sh");
  assert.match(script, /coreyhaines31\/marketingskills/);
  assert.match(script, /--skill product-marketing/);
  assert.match(script, /--skill cro/);
  assert.match(script, /--skill marketing-council/);
  assert.doesNotMatch(script, /--skill '\*'/);
  assert.doesNotMatch(script, /--all\b/);
});
