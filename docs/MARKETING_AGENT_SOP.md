# Marketing agent SOP — Cosmaneura Web

**Audience:** Cursor agents and humans operating marketing work in `cosmaneura-web`.  
**Related:** `.agents/product-marketing.md`, `docs/grok-bot-cmo/`, `AGENTS.md`.

## Purpose

Use marketing skills for better prompting and better drafts. They do not grant
autonomous publish rights, analytics installs, or PHI access.

## Install (narrow set)

Skills are **not** vendored in git (change-budget). Install locally:

```bash
./scripts/install-marketing-skills.sh
```

That installs into `.agents/skills/` (gitignored) for Cursor:

- `product-marketing`, `cro`, `copywriting`, `copy-editing`
- `site-architecture`, `seo-audit`, `ai-seo`, `schema`
- `marketing-ideas`, `marketing-psychology`, `marketing-council`

Pinned intent is recorded in `skills-lock.json` after install.

## Before any marketing task

1. Read `.agents/product-marketing.md` (v1+ is ACTIVE).
2. Obey the three messaging layers: SOAP **now**; named suite **coming soon**;
   Cosmas OS **waitlist** only. Do not sell roadmap or OS as generally available.
3. Prefer live commercial facts (price/trial/card) until the founder ships the
   post-Auth billing change to site + this doc together.
4. Never invent trial, SOC 2, claim submission, EHR write-back, NPI-at-signup,
   faith-forward door copy, or named competitors.
5. Escalate only remaining **W#** wording items from product-marketing.md.

## Partner ads — off by design

Upstream skills may mention partner tools. Treat them as optional ads.
Do not recommend, install, or wire them unless the founder explicitly enables
a named tool in writing.

## PHI boundary

Never place real PHI, patient recordings, charts, claim files, production
exports, or identifiable clinical content in prompts, fixtures, drafts,
screenshots, PR text, or Grok Bot memory. Synthetic examples only.

## Creative vs Tier 2 — separate PRs

| Work | Home |
|------|------|
| Homepage/secondary marketing copy, layout, CRO experiments | Tier 0/1 creative PR |
| `privacy.html`, `terms.html`, `baa.html` / `baa.pdf`, `_headers`, `_redirects` | Tier 2 — founder-gated, separate PR/stack |
| Analytics, CSP, cookies, measurement | Ask first; usually Tier 2 |

Do not mix creative homepage rewrites with legal/security-header changes.

## Stacked PR methodology (canonical)

Obey the repository change-budget (≤2,000 lines and ≤50 files). For site
revamps, ship a dependency-ordered stack, for example:

1. Resolve product-marketing conflicts (docs-only).
2. Homepage CRO/copy only.
3. Secondary pages (catholic/mcd/company) — one concern each if large.
4. SEO/schema — separate from copy tone changes.
5. Legal/trust pages — only when counsel/founder scoped.

Each PR: one releasable outcome, green `node --test tests/site-readiness.test.mjs`,
independent agent review, no production promote by agents.

## Grok Bot CMO

Cursor authors and versions the context here. Port to Grok Bot with
`docs/grok-bot-cmo/`. Do not edit `settings-grok` / `visit-prep-grok`.
Grok Bot must use the same product-marketing file and approval boundaries.

## Recovery

- Revert the marketing PR.
- Re-run site readiness tests.
- If a bad skill install lands, delete `.agents/skills/` and re-run the install script.
