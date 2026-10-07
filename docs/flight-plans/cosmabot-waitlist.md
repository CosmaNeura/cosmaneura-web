# Flight plan: CosmaBot introduction and waitlist

## Outcome and boundaries

October 7 implementation: use the owner-selected platform-first presentation
at `/cosmabot`, promote it from the existing homepage, and prioritize creating
practice accounts through the current Cosmas entry. Optional CosmaBot launch
emails remain a separate signup on cosmas.ai; an account grants neither bot
access nor email consent. Preserve the current direct/Catholic/MCD channels.
Reuse the approved six bot portraits, including orange-and-black Billing.
No new analytics or application changes are included.

Provide a distinct company introduction at `cosmaneura.com/cosmabot`, pointing
to the primary product home and waitlist at `cosmas.ai`. The owner selected
healthcare practices first, cosmas.ai for search authority, and Resend for mail.
Public Provider Team: Visit Prep, Scribe, Follow-up, Chief, Research, Billing
Support. CosmasOS remains internal and naming integration is deferred.

Company repository: static page, discovery link, sitemap and asset allowlist.
Separate `CosmaNeura/cosmabot-web`: public page and marketing-only Worker/D1
waitlist. This company repository gains no Worker, API, secrets or database.
Neither change touches clinical state, identity, checkout, EHR integration or
BAA bytes. Planned roles are identified as planned, not currently available.

## Risk and dependencies

Company introduction is Tier 1: additive public content and a build allowlist
entry. The separate waitlist handles marketing contacts and new privacy/security
behavior; its activation is held for an explicit production decision.

Receiver-before-sender order: deploy and verify cosmas.ai with signup disabled;
configure D1, Resend, Turnstile and suppression; verify a controlled signup;
activate only after production approval; then promote the company introduction.
The company page can merge safely because automatic main production builds
remain blocked. No clinical cross-repo interface is introduced.

## Current deployed state

Upstream baseline: `3a0f99d111a5ec29348cd05713a02a45be27de06`, tree
`c6f9e70264cb0d060f33e003d58973dd80c2a96c`, read October 6, 2026.
The materialized local snapshot has the exact upstream tree; its synthetic
local baseline commit is not the upstream history.

Read-only live comparison found current homepage copy differs from upstream
main around trial/card onboarding. Retain the live site while this additive
change is reviewed. Do not publish all of main as an implicit reconciliation.
Before company promotion, identify and record the active Pages deployment ID
and artifact, preserve deployed copy or obtain an explicit replacement decision.
The previous exact production artifact remains the rollback target; it is not
yet available through the current connection.

October 7 recheck: remote main is `6ca166dd427bcab8c353d823e5fea14047b2344b`
after PR #22. The earlier trial/card homepage mismatch is no longer present
in the fetched main homepage and observed public copy. `/cosmabot` still
returns the public 404, so the company introduction remains unpublished.
The active immutable Pages artifact and cumulative release comparison still
must be recorded before production; this PR does not authorize promotion.

The cosmas.ai controlled email test passed and signup has been closed again.
Both Google and Cloudflare resolve the apex and www on October 7; apex HTTPS
returns 200 and www redirects 301 to the apex. Do not change functioning DNS
based on a sandbox resolver failure. Public signup/indexing remain separate
release decisions. A company product introduction may publish while the
waitlist is closed if it describes availability accurately.

## Release control

Company site has no feature-flag system: bounded manual promotion and exact
Pages artifact rollback remain the controls. CosmaBot’s separate waitlist has
`WAITLIST_ENABLED=false` and `INDEXABLE=false` by default; no DNS routes or
production D1 ID are committed in the preview config. Owner: John.

## Schema/data sequence

N/A in this repository. Separate waitlist uses a new marketing-only database;
its runbook rehearses migration, duplicate/confirmation/unsubscribe handling,
delivery failures and retention using synthetic data before activation.

## Rollout and promotion

1. Pass local company checks and implementer review under owner’s September 25
   local-validation merge decision. Record exact remote tested SHA and findings.
2. Review separate waitlist build and local tests; preview is non-indexed and
   sending is disabled until provider bindings and secrets are verified.
3. Configure sending from updates@cosmas.ai, Reply-To john@cosmaneura.com.
   Cloudflare incoming forwarding is configured separately, preserving existing
   MX records and merging SPF requirements instead of adding a second SPF record.
4. Record production site/DNS/sender/DB readiness and request exact release approval.
5. Activate cosmas.ai, run canary, then promote company intro only after deployed
   drift is resolved and the existing founder-only production gate is satisfied.

Abort on an unconfirmed address enrolled, a suppressed address sent mail, any
PHI requested/stored, an unknown path returning 200, missing spam/origin controls,
or a stale/unverified product claim. A transient email failure remains queued;
permanent failures are visible through aggregate outbox counts.

## Security, legal, and recovery

No existing legally operative company pages, security headers or redirects change.
New waitlist privacy notice is reviewed separately before it is public.
No analytics scripts or advertising pixels. Reverting the additive page and
allowlist/sitemap/discovery link recovers company source; production rollback
uses the recorded Pages artifact. Disable separate signup before rollback;
preserve marketing consent/suppression records. No automatic destructive cleanup
of infrastructure or repositories.

## Completion

Evidence: passing checks for the exact company commit, review findings and
disposition, passing synthetic waitlist journey and runtime checks, verified
sender and forwarding, explicit production record, live canonical/robots/header/
404 verification, and company CTA landing on the working product waitlist.
Until those live gates pass, this is built/reviewable implementation, not a
completed public launch.
