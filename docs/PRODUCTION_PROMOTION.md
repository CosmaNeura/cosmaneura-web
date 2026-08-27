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
