# Flight plan: publish BAA v2.3 without claim-submission scope

## Outcome and boundaries

- Problem and measurable outcome: publish counsel-approved
  `CN-BAA-CUST-CW v2.3` with only the phrase “claims preparation and
  submission support,” removed from Exhibit A item (b), while preserving the
  remaining billing and revenue-cycle language.
- In scope: immutable v2.2/v2.3 PDF assets, the canonical `/baa` and
  `/baa.pdf` aliases, exact SHA-256 pins, the Core BAA asset/current-version
  record, onboarding version text, tests, and release documentation.
- Explicit non-goals: no product-capability expansion, billing activation,
  claim submission, 837P generation, clearinghouse enrollment, EHR writeback,
  production deployment, or customer-data mutation in these changes.
- Affected users, public surfaces, environments, and data classes: public BAA
  readers and self-service practice owners accepting a BAA; production web and
  Core are affected when separately promoted. Source changes contain no PHI.

## Risk and dependencies

- Tier and reason: Tier 2 because this changes a legally operative agreement
  and the version-bound acceptance contract across repositories.
- Irreversible or high-blast-radius decisions: existing v2.2 assets and
  acceptance records remain immutable. v2.3 is additive until final alias
  activation, and no historical acceptance is rewritten.
- Dependency-ordered PR stack; explain how each PR can be held safely:
  1. Web receiver publishes immutable `/baa-v2-2`, `/baa-v2-2.pdf`,
     `/baa-v2-3`, and `/baa-v2-3.pdf`; canonical `/baa` and `/baa.pdf`
     remain v2.2.
  2. Core activates v2.3 and links its clickwrap to `/baa-v2-3.pdf`; this is
     held until the receiver asset is live and hash-verified.
  3. Web activation moves canonical `/baa` and `/baa.pdf` to v2.3; this is
     held until Core serves and records v2.3.
- Cross-repo contract/version and receiver-before-sender order: the web
  versioned PDF is the receiver. Core is the sender of the v2.3 acceptance
  identity and must not activate before that immutable PDF is live.

## Current deployed state

- Live content SHA/artifact, Cloudflare configuration, headers, and routes:
  observed 2026-08-29 at Cloudflare deployment
  `f943e901-1c63-42fc-9301-4343d5fa3b60`, commit
  `b25506dbb028e980ded9d47b3eb940922f96bf35`; `/baa` and `/baa.pdf`
  serve v2.2. The pinned v2.2 PDF SHA-256 is
  `43fe893059cf4fbd3db364e30632b35aa5716dc1a5a6759299f5cf039aceabcc`.
- Difference from `main` and any deployed-only behavior: web `main` was
  `b92cab5728296653eee7e91ddc73a6330501aa54` when this plan began; live is
  behind it. This stack preserves the deliberate manual-promotion boundary.
- Reconciliation decision: replace the live marketing artifact only through
  the normal founder-gated workflow, after reviewing the complete `main`
  delta and recording the active Cloudflare deployment as rollback target.
- Previous known-good content/artifact boundary: the Cloudflare deployment
  above and the immutable v2.2 legal assets.

## Release control (reversible user-visible behavior only)

- This repository has no feature-flag system. Control is the three-step,
  founder-gated deployment order above, with each step independently
  revertible to its preceding reviewed commit/deployment.
- Removal PR/condition: N/A; no temporary application flag is introduced.

## Schema/data sequence

N/A — the web repository owns no schema or stored application data. Core adds
an immutable v2.3 version row and marks v2.2 non-current without modifying or
deleting prior acceptance records.

## Rollout and promotion

- Ordered environments/cohorts and hold points: web receiver preview and
  production; verify versioned PDF hashes; Core staging and production; verify
  `/internal/v1/baa/current` reports v2.3; web canonical activation preview and
  production.
- Health signals and measurable abort thresholds: abort on any hash mismatch,
  non-200 legal asset, missing `no-transform` on canonical HTML, wrong version
  in onboarding, failed acceptance tests, or HTML/PDF wording mismatch.
- Public canary journey: fetch both versioned PDFs, `/baa`, `/baa.pdf`, all
  marketing/legal pages, and required 404 paths; complete synthetic onboarding
  without PHI or a live charge and confirm the displayed, downloaded, and
  recorded agreement identities are all v2.3.
- Founder-only manual production record location: GitHub workflow runs and the
  release change record required by `docs/PRODUCTION_PROMOTION.md`.

## Security, legal, and recovery

- Counsel/security acceptance, scope, expiry, and promotion impact: the
  founder confirmed on 2026-08-29 that counsel approved removal of only the
  quoted claim-submission phrase. No security exception is created.
- Recovery move: reactivate the recorded Cloudflare deployment for web;
  redeploy the preceding Core image if v2.3 has not been accepted. Once any
  v2.3 acceptance exists, do not delete or rewrite it; stop new onboarding,
  retain both immutable versions, and obtain counsel direction before changing
  which agreement is current.
- Observation window before irreversible cleanup: no legal assets or
  acceptance records are deleted. Observe both releases through the first
  successful synthetic acceptance and normal production monitoring.

## Completion

- Evidence required: exact hashes for all BAA assets; passing web and Core
  tests; rendered PDF visual review; exact-head independent-agent review for
  each branch; live versioned-PDF checks before Core activation; and a final
  synthetic v2.3 acceptance check after both promotions.
- Follow-up cleanup PRs and owners: none required for historical legal assets;
  the founder owns promotion sequencing and final change-record completion.
- Documentation and public-contract records to update: web README, AGENTS,
  CLAUDE, promotion runbook, sitemap, smoke tests, canonical hash tests, Core
  model constants, migration, frontend label/link, and BAA asset tests.
