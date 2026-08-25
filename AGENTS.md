# AGENTS.md — Cosmaneura engineering guardrails

> Canonical copy lives in `cosmaneura-architecture/deploy-kit/`. Sync on Contract Friday.
> Keep this file under ~150 lines: only non-inferable rules belong here.

## Stack

GitHub + GitHub Actions (no Azure DevOps) · Azure Container Apps · ACR ·
Azure Database for PostgreSQL Flexible Server · Clerk + Microsoft Entra ID
(sign-in; varies by service). Core deploys from `master`. Key Vault + App
Insights are target-state, not yet live in core prod.
**This repo: the public marketing site. **Cloudflare Pages, not Azure.****

## Commands

- Install: `no package manifest — plain static site; Node scripts run directly`
- Test (all): `node --test tests/site-readiness.test.mjs`
- Test (single file): `node --test tests/<file>.test.mjs`
- Lint + typecheck: `n/a (no linter configured)`
- Local dev: `open `index.html`, or `node scripts/build-site.mjs``
- DB migration create: n/a — no database.
- Deploy: Cloudflare Pages, not Azure. Automatic production builds from `main`
  fail closed. Only `.github/workflows/promote-production.yml` may upload
  production after founder authorization and exact-commit agent review.

## Risk tiers (declare one on every PR)

- **Tier 0** — copy, styling, docs, config text, additive UI behind an existing flag. CI green → merge.
- **Tier 1** — new feature logic, new endpoints, additive-only schema changes (new tables/columns, nullable). Requires: feature flag + flight plan reference.
- **Tier 2** — anything touching the BAA and legal pages (`baa.html`, `baa.pdf`, `privacy.html`, `terms.html`) and `_headers` / `_redirects`, or any destructive migration. Requires: flight plan, migration ladder compliance (docs/MIGRATION_PLAYBOOK.md), rehearsal run, founder sign-off.

Tier is set by the *paths a change touches*, never by urgency.

## Permission boundaries

**Allowed freely**
- Creating branches, PRs, and stacked PRs; small refactors inside a feature's own module
- Adding feature flags; additive migrations (new nullable columns, new tables, new indexes)
- Updating docs, tests, and flight plans

**Ask first**
- Any change under the Tier 2 paths above — even one line
- Adding a new external dependency or third-party service (BAA implications)
- Changing CI workflows, environment config, or anything under `.github/`
- Backfill scripts that write to production data

**Never**
- Destructive migrations (DROP/RENAME column or table, type changes) outside a labeled `contract` PR whose hold period has elapsed
- Importing auth/billing internals from feature code — go through the public interface of the module only
- Turning a feature flag on for all users in code; rollout happens through the flag system, by cohort
- Touching production directly (`az` commands against prod resources), force-pushing the default branch, committing secrets, or putting real PHI in tests, fixtures, seeds, staging, or logs

## Architecture rules (the non-inferable ones)

- Identity: only this repo's designated auth adapter module(s) — n/a — this site has no authenticated surface — may import vendor SDKs (Clerk, Entra/MSAL) or parse provider claims. All domain code consumes a normalized principal from the adapter — never raw tokens, never provider-specific branches. One adapter per service; there is no cross-service facade.
- Reversible user-visible behavior ships behind a flag/cohort control from its first commit (name: `ff_<feature>_<yyyymm>`, owner + expiry in the flight plan). Refactors, security fixes, infra, and schema work are NOT flagged — small PRs + migration ladder + revert.
- All schema changes follow docs/MIGRATION_PLAYBOOK.md. Additive first; destructive only as a final `contract` step. A "rung" = one independently deployable, observable, backward-compatible transition (may span coordinated cross-repo PRs; receiver/auth deploys before sender activation).
- Users carry an `auth_version` (or equivalent) marker during auth migrations; both old and new paths must work until the contract step.

## Workflow

1. New feature? FIRST draft `docs/flight-plans/<feature>.md` from the template. Do not write feature code before the flight plan exists.
2. Build as a stack of small PRs (interface/seam → logic → UI → flag wiring). One session per layer. Keep diffs reviewable by one human.
3. Every PR fills in the PR template completely, including the tier and the change record.
4. If a PR changes deploy-relevant behavior, update this file in the same PR.

## Repo notes

- **Cloudflare Pages, not Azure.** The Azure mechanics in DEPLOYMENT.md do not apply
  here; the process rules (tiers, PR template, flight plans) do.
- A merge is not a production promotion. Preserve the fail-closed Cloudflare
  `main` build guard and follow `docs/PRODUCTION_PROMOTION.md`. Agent review is
  required evidence tied to the exact promoted commit; it is not GitHub
  approval or founder authorization.
- No database, no migrations, no feature flags. Tier 0 is the normal case.
- `baa.html` / `baa.pdf` are legally operative documents served to practices. Changing
  them is Tier 2 regardless of how small the diff looks, and needs founder sign-off.
- `_headers` and `_redirects` control security headers and routing for the live site —
  a one-line mistake is a production incident.
- The uptime workflow probes `cosmaneura.com` and `app.cosmaneura.com`; a red run
  there means the live site is down, not that a test is flaky.
