# AGENTS.md — Cosmaneura web engineering guardrails (v0.2.1)

> The canonical baseline lives in `cosmaneura-architecture/deploy-kit/`.
> Preserve stricter local rules when syncing it here.

## Operating objective

Reduce deployment risk created by rapid code growth. Keep changes small,
independently releasable, observable, and reversible. Documentation supports
that work; it does not replace decomposition or deployed-state reconciliation.

## Repository facts and commands

- This is the static public marketing and legal site. It owns no authenticated
  application, billing, checkout, entitlement, PHI store, or application API.
- Default branch: `main`. Cloudflare's Git integration retains preview builds,
  but account-side automatic production deployments are disabled and the
  repository build fails closed if that setting regresses.
- Production promotion is only through
  `.github/workflows/promote-production.yml`, after founder authorization and
  exact-commit independent-agent review. It publishes only the allowlisted
  `dist/` artifact.
- GitHub Actions also runs readiness checks and live-domain uptime probes.
- Install: N/A; this repository has no package manifest or dependency install.
- Full/focused test: `node --test tests/site-readiness.test.mjs`.
- Syntax and build: `node --check channel-links.js && node --check content/product-capabilities.mjs && node --check scripts/build-site.mjs && node --check scripts/preview-server.mjs && node --check scripts/smoke-live.mjs && node scripts/build-site.mjs`.
- Lint/typecheck: N/A; no linter or type checker is configured.
- Local preview: build with `node scripts/build-site.mjs`, then run
  `node scripts/preview-server.mjs`. The preview server models pretty HTML
  paths and real 404 responses without adding a dependency.
- Migration: N/A; this repository owns no database or stored application data.

## Risk classes (declare one on every PR)

- **Tier 0 — routine:** localized copy, styling, tests, documentation, or a
  behavior-preserving refactor with no legal, security-header, redirect,
  build, deployment, or external-contract impact.
- **Tier 1 — deployment-sensitive and reversible:** build/CI changes,
  dependencies, additive public behavior, or another change needing a
  deliberate release and rollback.
- **Tier 2 — irreversible or high blast radius:** legally operative BAA,
  privacy, or terms changes; security headers or redirects; production
  promotion machinery; breaking public contracts; or any future auth, billing,
  PHI, security-boundary, or broad infrastructure work.

Path minimums are strict: `baa.html`, `baa.pdf`, `privacy.html`,
`terms.html`, `_headers`, and `_redirects` are Tier 2. Classify by effect and
blast radius; urgency never lowers a tier. Split mixed concerns when they can
be released independently.

## Conditional controls

- Use a flag or cohort control only for reversible user-visible behavior. This
  repository currently has no feature-flag system; do not pretend one exists.
- A flight plan is required for Tier 2, cross-repo, multi-deploy, or cohort
  work. Routine single-deploy changes do not manufacture one.
- Migration rungs and rehearsal are currently N/A because this repository owns
  no schema or stored application data. See `docs/MIGRATION_PLAYBOOK.md` before
  adding either.
- Every code-changing PR receives an independent agent review after its last
  substantive push. The reviewer cannot be the implementing agent. Durable PR
  evidence identifies the reviewed commit, findings, and disposition; a later
  substantive push invalidates it. Agent review is not GitHub approval.

## Approval and promotion boundaries

- Preserve the repository's current GitHub approval settings. This document
  neither adds nor removes required human approvals.
- Production policy is founder-only manual promotion from the exact current
  `main` commit after independent-agent review. Founder promotion is recorded
  self-authorization; agent review is evidence, not GitHub approval.
- The GitHub `production` environment admits only `main` and has no required
  reviewer. Do not claim a separate environment approver exists. The manual
  path remains unavailable until its least-privilege Cloudflare token is stored
  as an environment secret.
- The current workflow builds during promotion. Selecting a previously built,
  immutable artifact remains a future hardening gap.
- Before replacing a live site whose artifact, SHA, configuration, or routing
  differs from `main`, record the difference and choose keep, assimilate, or
  replace. Never reconcile drift by blindly publishing current `main`.
- Scoped security acceptance permits only its named environment and data
  boundary. Unless explicitly broader, it allows dark non-PHI development and
  blocks production or PHI-bearing promotion.

## Permission boundaries

**Allowed without a separate production decision**

- Create small PRs, tests, flight plans, and reversible site refactors.
- Inspect public/live state read-only and prepare reconciliation options.

**Ask first**

- Change the legally operative pages, `_headers`, `_redirects`, build/deploy
  configuration, external services, analytics, or privacy behavior.
- Activate a release control for a broader cohort or trigger production.

**Never**

- Restore Pages Functions, Workers, runtime secrets, checkout/webhooks,
  application APIs, authenticated state, or PHI storage here.
- Put PHI or secrets in source, tests, logs, PR text, or agent prompts.
- Force-push the default branch, deploy an unmerged branch, or represent agent
  output as a GitHub approval.
- Archive or delete repositories or production resources under this doctrine.

## Architecture and workflow

1. For Tier 2, cross-repo, multi-deploy, or cohort work, first draft
   `docs/flight-plans/<feature>.md` from the template. Do not manufacture a
   flight plan for routine work.
2. Where a change needs decomposition, build it as a stack of small PRs
   (interface/seam → logic → UI → activation). Use flag wiring only for
   reversible user-visible behavior. Keep each layer reviewable by one human.
3. Every PR fills in the PR template completely, including the tier and the change record.
4. If a PR changes deploy-relevant behavior, update this file in the same PR.

### Repo notes

- **Cloudflare Pages, not Azure.** The operational deployment source is
  `docs/PRODUCTION_PROMOTION.md`; do not import Azure mechanics from another
  repository. The shared process rules (tiers, PR template, flight plans) still
  apply.
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
- Preserve the static-site boundary and the public-asset allowlist in
  `scripts/build-site.mjs`. Keep `404.html` and the retired `/api/*` paths at
  HTTP 404. Do not add a 200 SPA fallback.
- Keep the five-tool availability catalog in
  `content/product-capabilities.mjs`; the build renders it into `index.html`
  without publishing the source module or adding runtime behavior.
- Initial signup and onboarding must not request or require an NPI or present
  one as identity, security, or credential proof. Any future NPI collection is
  app-owned and just-in-time for an enabled payer-facing transaction or
  integration that actually requires it. CAB remains billing intelligence and
  advisory only; claim submission, 837P generation, clearinghouse enrollment,
  and EHR writeback are not on the roadmap.
- Preserve channel attribution without treating it as authorization.
- `baa.html` and `baa.pdf` remain byte-pinned counsel-approved CN-BAA-CUST-CW
  v2.2; a substantive change needs a new version, counsel approval, and hashes.
  Do not reinterpret its Exhibit A “claims preparation and submission support”
  phrase as a CAB product commitment. Production remains blocked until counsel
  provides written reconciliation with advisory-only CAB or approves a newly
  versioned BAA and version-bound acceptance flow.
- Do not add analytics without approved privacy scope, disclosures, and CSP.
- Keep each PR to one deployable outcome, reviewable in roughly ten minutes.
  Cross-repo changes are receiver-first and backward compatible.
- Obey the repository-specific blocking change-budget check once installed.
  Its numeric threshold belongs in a small, separately reviewed policy
  workflow; an oversized PR cannot waive its own limit by label or checkbox.
  The tracked `change-budget` workflow rejects more than 2,000 changed lines or
  50 changed files and fails closed on missing, malformed, or negative GitHub
  diff metadata. Repository administration must require its status context for
  merge blocking; the workflow itself does not alter the current human-approval
  requirements.
- Every PR records its tier, tests, exact recovery move, independent agent
  review evidence, and only the conditional controls that actually apply.
- Documentation-only changes must not build or deploy production artifacts.
