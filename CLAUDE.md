# CLAUDE.md — cosmaneura-web

> Architecture decisions for this system live in the `cosmaneura-architecture` repo, in `ARCHITECTURE.md`. Read it before making structural changes. If a change conflicts with it, stop and resolve the conflict rather than proceeding.

## What this repository owns

This repository is the static public website for Cosmaneura Inc and Cosmas. It
is promoted manually from reviewed `main` commits to Cloudflare Pages. The
Cloudflare Git integration's automatic production build fails closed in
`node scripts/build-site.mjs`; the founder-gated workflow builds and directly
uploads the allowlisted `dist` directory. See
`docs/PRODUCTION_PROMOTION.md`.

The website currently owns marketing, company, privacy, terms, and public BAA
pages. It does not own checkout, subscription webhooks, entitlement, PHI state,
or application APIs. Those belong to the main `cosmaneura` application. The
retired `/api/checkout` and `/api/webhook` Pages Functions must not be restored.

Future public Sovereign mounts are governed by the architecture repository's
embed contract. Do not add chatbot logic, capabilities, clinical state, or PHI
storage here.

## Invariants

- Keep the site static: no Pages Functions, Worker, runtime secrets, or 200 SPA
  fallback.
- Keep repository guidance, tests, workflows, and scripts out of the public
  build. Add a public asset only through the allowlist in `build-site.mjs`.
- Keep `404.html` at the root so unknown and retired `/api/*` paths return 404.
- Preserve `channel=direct`, `channel=catholic`, or `channel=mcd` on app CTAs
  outside the byte-pinned BAA page. Channel is attribution, never authorization.
- Provider credential/licensure status is informational only and never controls
  signup, trial, billing, continued use, entitlement, capability, or real-PHI
  access. Practices authorize workforce membership and roles; do not claim that
  Cosmaneura verifies professional licensure or credentials.
- `baa.html` and `baa.pdf` publish counsel-approved CN-BAA-CUST-CW v2.2. Never
  edit canonical agreement bytes in place. A substantive change requires a new
  version, counsel approval, and updated pinned hashes.
- Do not add analytics code in this repository. Cloudflare Web Analytics
  Automatic Setup is account-owned and must remain consistent with the site's
  no-analytics-cookie disclosure. PostHog or any broader measurement requires
  approved scope, privacy mode, disclosures, and CSP changes. Never capture PHI
  or authenticated-app content here.
- Do not add `.html` rewrites. Cloudflare Pages provides pretty-path redirects.

## Checks

Run before publishing:

```bash
node --test tests/site-readiness.test.mjs
node --check channel-links.js
node --check scripts/build-site.mjs
node scripts/build-site.mjs
npx serve dist
git diff --check
```

After deployment, verify every public page, all three CTA channels, response
security headers, the canonical BAA hashes, and HTTP 404 responses for an
unknown path plus `/api/checkout` and `/api/webhook`.
