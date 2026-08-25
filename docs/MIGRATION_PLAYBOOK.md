# MIGRATION_PLAYBOOK.md — schema and data ladder (v0.2.1)

## Current repository status

Schema migration and PHI-safe database rehearsal are **currently N/A**. This
repository is a static public site with no database, schema, stored application
data, authenticated state, or PHI store. Legal, header, redirect, or deployment
changes may still be Tier 2, but they do not invent a migration rung or
rehearsal.

Adding persistent application data to this repository would be an architecture
change, not an ordinary feature. It requires founder approval, an architecture
decision, an owned migration mechanism, and a reviewed rehearsal/cleanup
runbook before implementation.

## Future schema/data rules

If this repository later becomes an approved schema or data owner, use this
ladder. One rung is one independently deployable, observable,
backward-compatible transition. A PR declares exactly one rung and may be held
indefinitely. Cross-repo rungs use versioned contracts and deploy receivers
before activating senders.

1. **Expand:** add nullable/additive structures beside the old representation.
   Recovery stops rollout and leaves the structure dormant. Never `DROP` it as
   an immediate rollback.
2. **Dual-write:** write both representations while reads remain old. Recovery
   stops the new write without destroying compatible data.
3. **Backfill / just-in-time migration:** use bounded, resumable, idempotent
   batches and progress/mismatch metrics. Recovery pauses the worker.
4. **Shadow-verify:** run the new path without enforcing it and observe a
   predeclared mismatch threshold and duration. Mandatory for identity data.
5. **Cut reads:** move explicit cohorts to the new representation while
   retaining the compatible old path. A release control applies only when the
   cut is reversible user-visible behavior.
6. **Contract:** after the recorded stability window, stop compatibility
   writes in one PR. Old-code/schema removal is a separate destructive PR with
   explicit founder approval.

Before any schema/data rung reaches a PHI-bearing environment, provide and
prove a reviewed runbook that creates an isolated restore target, verifies
network isolation, restores through approved automation, scrubs in place,
verifies every PHI-bearing field without emitting values, runs the exact rung
and recovery, revokes access, and verifies TTL cleanup. A generic command with
placeholders is not authorization.

Hard rules:

- One rung per schema/data PR.
- No cutover migration, unbounded backfill, or blind destructive recovery.
- No `DROP`, rename, narrowing/type conversion, or destructive rewrite before
  a separately approved contract cleanup.
- No PHI, connection strings, secrets, or raw query output in CI, PRs,
  artifacts, tests, or agent context.
- A failed or unverifiable rehearsal blocks PHI-bearing promotion.
