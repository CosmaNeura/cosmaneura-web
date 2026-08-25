# Flight plan: name the outcome

Use this template only for Tier 2, cross-repo, multi-deploy, or cohort work.
Schema/data sections are currently N/A for this static repository. Delete
instructional text and mark other inapplicable sections `N/A` with a reason.

## Outcome and boundaries

- Problem and measurable outcome:
- In scope:
- Explicit non-goals:
- Affected users, public surfaces, environments, and data classes:

## Risk and dependencies

- Tier and reason:
- Irreversible or high-blast-radius decisions:
- Dependency-ordered PR stack; explain how each PR can be held safely:
- Cross-repo contract/version and receiver-before-sender order:

## Current deployed state

- Live content SHA/artifact, Cloudflare configuration, headers, and routes:
- Difference from `main` and any deployed-only behavior:
- Reconciliation decision: assimilate / retain temporarily / replace
- Previous known-good content/artifact boundary:

## Release control (reversible user-visible behavior only)

- Control, owner, expiry, cohorts, and activation authority:
- Removal PR/condition:
- If N/A, note that this repository has no feature-flag system and describe the
  bounded release/revert method:

## Schema/data sequence

N/A — this repository owns no schema or stored application data. If that
boundary changes, stop and obtain the architecture decision and migration
mechanism required by `docs/MIGRATION_PLAYBOOK.md`.

## Rollout and promotion

- Ordered environments/cohorts and hold points:
- Health signals and measurable abort thresholds:
- Public canary journey, including headers and required 404s:
- Founder-only manual production record location, or the current control gap:

## Security, legal, and recovery

- Counsel/security acceptance, scope, expiry, and promotion impact:
- Recovery move for content, headers, redirects, build, and deployment:
- Observation window before any irreversible cleanup:

## Completion

- Evidence required to call the outcome complete:
- Follow-up cleanup PRs and owners:
- Documentation and public-contract records to update:
