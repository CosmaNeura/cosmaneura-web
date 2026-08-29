# Production promotion

Cloudflare Pages is connected to this repository, but a merge to `main` is not
authorization to publish. `scripts/build-site.mjs` deliberately fails before
creating `dist` when Cloudflare's Git integration tries to build `main`.
Preview-branch builds remain available. The last successful production
deployment remains live when the blocked automatic build fails.

The only intended production path is the **Promote production** GitHub Actions
workflow. It builds the selected commit in GitHub Actions and uploads the
allowlisted `dist` artifact directly to the existing `cosmaneura-web` Pages
project.

## One-time setup

The GitHub `production` environment restricts deployment branches to `main`,
and its Cloudflare account identifier is stored there. Before the first
promotion, add the remaining environment secret below. Do not put secret values in
repository-level secrets, the repository, PRs, comments, or logs.

- `CLOUDFLARE_API_TOKEN` — a dedicated, least-privilege token limited to Pages
  edit access for the Cosmaneura Cloudflare account

The repository is private and the founder is the production authority. The
environment is an audit boundary, not a claim that a separate GitHub
environment reviewer exists. The workflow itself admits only a manual run from
`main` where both `github.actor` and `github.triggering_actor` are `JohnClem`.

## Final pre-promotion gate

Do not start the production workflow until the release change record shows a
pass for every item below:

- Complete one final copy check against the approved price, seat limit, trial
  timing, card collection, credential-neutral workforce policy, capability availability, and legal
  links. Record the reviewer and exact `main` SHA.
- Confirm initial signup and onboarding do not request or require an NPI and do
  not present NPI as identity, security, or credential proof. Confirm CAB is
  billing intelligence and advisory only and that claim submission, 837P
  generation, clearinghouse enrollment, and EHR writeback are not described as
  current or roadmap capabilities. Any future NPI collection must be
  just-in-time for an enabled payer-facing transaction or integration that
  actually requires it.
- Confirm public copy says practices authorize workforce membership and roles,
  does not claim Cosmaneura verifies licensure or credentials, and does not make
  credential/licensure status a condition of signup, trial, billing, continued
  use, entitlement, capability, or real-PHI access.
- For BAA v2.3, follow `docs/flight-plans/baa-v2-3-claims-scope.md` exactly:
  publish and hash-verify the immutable versioned web assets before Core
  activates v2.3 acceptance, then move the canonical `/baa` and `/baa.pdf`
  aliases only after Core serves and records v2.3. Do not skip or reorder those
  hold points.
- Exercise the direct, Catholic, and MCD CTAs end to end with a signed-out,
  synthetic test session. Confirm channel attribution, the production app
  destination, authentication, onboarding, test-mode Checkout,
  practice-authorized membership/role behavior, entitlements, first SOAP value, and Billing
  Portal. Inspect every signup and onboarding field and record that no NPI
  prompt or requirement appears and that NPI is not used to verify identity,
  account security, or credentials. Do not use PHI or create a live charge.
- Confirm both `CLOUDFLARE_ACCOUNT_ID` and the least-privilege
  `CLOUDFLARE_API_TOKEN` exist in the GitHub `production` environment without
  exposing their values.
- Record the active Cloudflare production deployment ID, deployment URL, and
  observation time as the exact rollback target.
- Obtain explicit written founder approval for this exact reviewed `main` SHA.
  Approval to merge or preview is not approval to promote.

## Review and promote

1. In **Cloudflare → Workers & Pages → cosmaneura-web → Deployments**, record
   the active production deployment ID, deployment URL, and observation time
   in the release change record. This exact immutable deployment is the
   rollback target; a Git commit alone is not sufficient evidence that the
   same artifact can be reactivated.
2. Merge through the repository's current PR process. Cloudflare automatic
   production deployments are disabled and no production build should start.
   If account configuration regresses and one does start, the repository build
   guard must fail before creating `dist`.
3. Have a non-implementer agent review the exact commit now at `main`, including
   the cumulative diff that will be published. Agent review is evidence, not a
   GitHub approval and not founder authorization.
4. Record the result in a comment on the merged PR with these exact lines:

   ```text
   Independent agent review: PASS
   Reviewed commit: <full 40-character main SHA>
   Reviewer agent: <agent name or task identifier>
   ```

5. As `JohnClem`, run **Promote production** from `main`. Supply the exact
   reviewed SHA, the review comment URL, and `PROMOTE COSMANEURA WEB`. The
   equivalent GitHub CLI invocation is:

   ```bash
   release_sha="<40-character-reviewed-main-SHA>"
   review_url="https://github.com/CosmaNeura/cosmaneura-web/pull/<PR>#issuecomment-<COMMENT>"
   gh workflow run promote-production.yml \
     --repo CosmaNeura/cosmaneura-web \
     --ref main \
     -f "release_sha=${release_sha}" \
     -f "agent_review_url=${review_url}" \
     -f "confirmation=PROMOTE COSMANEURA WEB"
   ```

6. The workflow checks that the requested SHA is current `main` before building.
   After installing the pinned deployment client, its final pre-deploy commands
   verify that the Pages project's production branch is `main` and recheck the
   GitHub ref immediately before the first Cloudflare mutation. The run summary
   records the review URL, commit, deployment URL, and artifact-manifest digest.
7. Run the read-only live smoke test and inspect the Cloudflare deployment:

   ```bash
   SITE_URL=https://cosmaneura.com node scripts/smoke-live.mjs
   ```

If `main` changes after review, stop and obtain a new review of the new exact
commit. Do not promote a stale commit. A failed workflow before the upload step
does not mutate Cloudflare.

## Rollback

1. In **Cloudflare → Workers & Pages → cosmaneura-web → Deployments**, open the
   production deployment ID recorded in step 1 above.
2. Choose **Rollback to this deployment** and confirm that exact artifact. Do
   not rebuild an older Git commit or upload a new artifact as a rollback.
3. Wait until Cloudflare marks that deployment active, record the rollback and
   reason in the incident/change record, and run:

   ```bash
   SITE_URL=https://cosmaneura.com node scripts/smoke-live.mjs
   ```

4. Verify `/`, `/catholic`, and `/mcd`, then verify an unknown path plus
   `/README.md`, `/.github/workflows/uptime.yml`, `/api/checkout`, and
   `/api/webhook`. If the recorded predecessor is the currently exposed legacy
   artifact, source-file leakage is a known residual incident and requires a
   separately reviewed forward promotion of an allowlisted artifact.

Rollback does not authorize a rebuild or an unreviewed forward deployment.

Account-side automatic production deployments are disabled. Preserve the
in-repository build guard as defense in depth; do not relax it merely because
the current account setting is correct.
