# Flight plan: credential-neutral public paid-pilot copy

## Outcome and boundaries

- Problem and measurable outcome: remove every public statement that makes provider credential or
  licensure approval a condition of trial, continued use, entitlement, capability, or real-PHI
  access; add deterministic tests that prevent the language from returning.
- In scope: editable pricing/onboarding copy, repository guidance, production-promotion checks, and
  site-readiness tests.
- Explicit non-goals: no change to the byte-pinned BAA, Privacy, Terms, authentication, Checkout,
  entitlements, PHI processing, deployment workflows, Cloudflare configuration, or production.
- Affected users, public surfaces, environments, and data classes: prospective private-practice
  customers on `/`, `/catholic`, and `/success`; copy only, no stored data.

## Risk and dependencies

- Tier and reason: Tier 1 because the correction is reversible public offer copy and is coordinated
  with a cross-repository authorization contract.
- Irreversible or high-blast-radius decisions: none in this repository; production promotion remains
  separately founder-gated.
- Dependency-ordered PR stack: architecture PR #11 records the governing decision; this site PR may
  merge after exact-head review but must not be promoted until the application implements the same
  credential-neutral contract and the normal production gates pass.
- Cross-repo contract/version and receiver-before-sender order: ADR 0025 is the policy receiver.
  Core remains the runtime authority; this site never grants access.

## Current deployed state

- Live content SHA/artifact, Cloudflare configuration, headers, and routes: reconcile read-only in
  the production release record immediately before any promotion.
- Difference from `main` and any deployed-only behavior: not established by this source-only PR.
- Reconciliation decision: retain the current production artifact until an independently reviewed
  `main` artifact is explicitly promoted.
- Previous known-good content/artifact boundary: record the active Cloudflare deployment ID and URL
  immediately before promotion.

## Release control

- This repository has no feature-flag system. The bounded release is a reviewed merge followed by a
  separate founder-only manual promotion; rollback reactivates the recorded prior Cloudflare
  artifact.

## Schema/data sequence

N/A — this static repository owns no schema or stored application data.

## Rollout and promotion

- Ordered environments/cohorts and hold points: local deterministic build, Cloudflare preview,
  signed-out synthetic direct/Catholic/MCD journeys, then founder decision on the exact current
  `main` SHA. No production promotion is authorized by this plan.
- Health signals and measurable abort thresholds: all 30 readiness tests, syntax/build checks,
  legal-asset hash pins, CTA channel assertions, and credential-neutral copy assertions pass; abort
  on any failure or mismatch with the reviewed Core contract.
- Public canary journey: verify `/`, `/catholic`, `/mcd`, `/company`, `/baa`, `/privacy`, `/terms`,
  the three app CTA channels, required headers, and actual 404s for retired/source paths.
- Founder-only production record: `docs/PRODUCTION_PROMOTION.md` and the workflow run tied to the
  exact reviewed `main` SHA.

## Security, legal, and recovery

- Counsel/security acceptance: BAA/Privacy/Terms bytes are unchanged. BAA Exhibit A disposition and
  any newly versioned legal text remain separate activation blockers.
- Recovery move: reactivate the exact Cloudflare deployment recorded before promotion; do not
  rebuild an older source commit as rollback.
- Observation window: complete the live smoke test and CTA checks before any obsolete configuration
  cleanup.

## Completion

- Evidence: exact-head independent review, green CI/change budget, 30/30 readiness tests, syntax and
  allowlisted build pass, legal hashes unchanged, preview copy approved, and Core contract aligned.
- Follow-up: remove any superseded credential fields or UI only in their owning application PRs.
- Documentation: ADR 0025, public-launch policy record, README, operator guidance, and promotion
  checklist all state the same credential-neutral boundary.
