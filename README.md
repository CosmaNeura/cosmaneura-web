# Cosmas marketing site

Public site for **Cosmas** (the product), operated by **Cosmaneura Inc**.
Hosted on Cloudflare Pages at `cosmaneura.com`.

Same product, three doors — not cloned apps:

| URL | Voice |
| --- | --- |
| `/` | Independent clinics |
| `/catholic` | Catholic practices |
| `/mcd` | Limited MyCatholicDoctor rollout (`@mycatholicdoctor.com`) |
| `/company` | Cosmaneura Inc |
| `/baa` | Counsel-approved CN-BAA-CUST-CW v2.2 |

Sign-in and sign-up go to production Cosmas with one of the app's three
accepted channels: `direct`, `catholic`, or `mcd`. Every CTA on an editable
marketing page must preserve its door's channel; the neutral `/success` handoff
accepts only those three values from its own query string. The byte-pinned BAA
page is intentionally unchanged pending an approved wrapper/accessibility
strategy. Channel is attribution, not authorization. Join still requires a
matching practice work-email domain.

## Deploy

Cloudflare Pages is connected to this repo. A merge to `main` does not publish:
the configured `node scripts/build-site.mjs` command fails closed when the
Cloudflare Git integration attempts a production-branch build. Production is
built and directly uploaded only by the founder-gated **Promote production**
workflow after an independent agent reviews the exact current `main` commit.
See [`docs/PRODUCTION_PROMOTION.md`](docs/PRODUCTION_PROMOTION.md). The
allowlisted build keeps repository guidance, tests, workflows, and scripts off
the public site.
Pretty paths are Cloudflare Pages HTML files (`catholic.html` → `/catholic`). Do not 200-rewrite those to `.html` — it 308-loops against Pages’ pretty URLs.

This is a static Pages project: the deployed code requires no Pages Functions,
Worker, or runtime environment variables. Keep `404.html` at the project root
so unknown paths — including retired `/api/*` paths — return an actual 404
instead of Pages’ single-page-app fallback serving `index.html` with a 200.
Current code does not use Cloudflare runtime variables. Remove obsolete entries
before enabling the candidate build or previews: Pages also exposes project
variables to build commands, so an untrusted build change could publish them.

`_headers` supplies the static site's CSP, framing, MIME-sniffing, referrer, and
browser-permission protections. `_redirects` intentionally contains no 200
rewrites; Cloudflare Pages owns the `.html` → pretty-path redirects.
The CSP permits the account's existing Cloudflare Web Analytics Automatic
Setup; it does not permit PostHog. Do not broaden measurement without the
privacy decision described in `CLAUDE.md`.

The site does not sell anything: every CTA (including pricing) goes to app
sign-up, and billing happens in the app once the practice's BAA is in force
(checkout, portal, and webhooks live in the main repo). The old `/api/checkout`
and `/api/webhook` Pages Functions are deleted. Remove obsolete `STRIPE_*`
Cloudflare variables before the candidate build as described above; after the
application endpoint is ready, remove the retired Stripe webhook endpoint that
pointed at `cosmaneura.com/api/webhook`.
MCD has no public subscribe.

`baa.html` and `baa.pdf` publish the counsel-approved CN-BAA-CUST-CW v2.2
artifact. The canonical agreement text and PDF bytes must not be edited in
place; a text change requires a new version, counsel approval, and new pinned
hashes. The `/baa` response carries `Cache-Control: no-transform` so
Cloudflare does not rewrite the notice email or inject its email decoder into
the canonical HTML.

## Local

```bash
node --test tests/site-readiness.test.mjs
node --check channel-links.js
node --check scripts/build-site.mjs
node --check scripts/smoke-live.mjs
node scripts/build-site.mjs
git diff --check
npx serve dist
```

The readiness tests resolve every internal link, enforce channel attribution,
pin the complete canonical BAA HTML and PDF, check semantic landmarks and
keyboard focus, and validate the Pages headers/redirect posture. `npx serve`
is only for visual review after building `dist`; it does not emulate
Cloudflare's pretty-path or 404 rules exactly.

The same deterministic checks run on pull requests and pushes to `main`. The
temporary GitHub-hosted uptime probe runs every six hours to conserve the
private-repository Actions budget; move it to a dedicated monitor before using
a shorter interval.

## Deployment checklist

1. Run the deterministic checks above and confirm `baa.html` and
   `baa.pdf` still hash to the values pinned in
   `tests/site-readiness.test.mjs`.
2. Before the first candidate deployment, set the Pages build command to
   `node scripts/build-site.mjs` and output directory to `dist`. Keep the root
   directory at its repository default. Confirm there is no Functions/Worker
   code. After explicit approval, remove obsolete runtime variables before
   triggering a preview or production build; never expose their values.
3. Merge through the normal reviewed path. The Cloudflare Git integration's
   production build is expected to fail closed, leaving the current production
   artifact live.
4. Obtain and record an independent-agent review of the exact commit now at
   `main`, then have `JohnClem` run **Promote production** as described in
   `docs/PRODUCTION_PROMOTION.md`. Do not upload a second copy manually or add
   `.html` rewrites in the Cloudflare dashboard.
5. After Pages reports success, verify `/`, `/catholic`, `/mcd`, `/company`,
   `/baa`, `/privacy`, and `/terms`; confirm an unknown path and `/api/checkout`
   both return HTTP 404, not the home page with HTTP 200.
   Also confirm `/README.md`, `/CLAUDE.md`, `/tests/site-readiness.test.mjs`, and
   `/.github/workflows/uptime.yml` return 404.
6. Inspect a live response for the `_headers` values and click one CTA from
   each door to confirm the app receives `channel=direct`, `channel=catholic`,
   and `channel=mcd` respectively.
7. Operator cleanup remains outside this repo: delete the retired Stripe
   webhook endpoint only after confirming no traffic still depends on it.

Rollback is artifact-first: reactivate the last known-good `891ac80`
deployment in Cloudflare. That does not rebuild it. Before retrying or rebuilding
an older commit that lacks `scripts/build-site.mjs`, restore the former empty
build command and root output; otherwise that rebuild will fail while the last
successful deployment remains live.

Steps 4 and 5 have a deterministic read-only probe:

```bash
SITE_URL=https://cosmaneura.com node scripts/smoke-live.mjs
```
