# CosmaNeura — marketing site

The CosmaNeura landing page (`cosmaneura.com`), migrated off Squarespace to
Cloudflare Pages. Static HTML/CSS now; a Cloudflare Pages Function will handle
the Stripe subscription once the Stripe account exists.

## Structure

```
cosmaneura-web/
├── index.html      # the landing page
├── styles.css      # all styling (light + dark via prefers-color-scheme)
├── favicon.svg     # pulse-cross mark
└── functions/      # (later) Cloudflare Pages Functions for Stripe
```

## Preview locally

It's plain static files — just open `index.html` in a browser, or serve it:

```bash
npx serve .        # then open the printed URL
```

## Deploy (Cloudflare Pages)

1. Create/verify the **Cloudflare account** (recommend a company login, not personal).
2. **Pages → Create a project.** Either connect this GitHub repo (auto-deploy on
   push — preferred, mirrors the Sovereign PR workflow) or use direct upload.
3. Build settings: **no build command**, output directory = project root (`/`).
4. Add the custom domain `cosmaneura.com` in Pages → Custom domains.

## Stripe subscription ($89/mo)

Self-serve: a **Subscribe** button (`#pricing` section) → `/api/checkout` creates a
Stripe Checkout Session → hosted checkout → `/api/webhook` records the subscriber.
No Stripe SDK; the functions call Stripe's REST API directly.

**Setup (do it in Test mode first):**

1. **Stripe → Product/Price:** create a recurring product at **$89 / month**. Copy its
   **Price ID** (`price_...`).
2. **Stripe → Developers → API keys:** copy the **Secret key** (`sk_test_...`).
3. **Cloudflare Pages → Settings → Variables and Secrets** — add:
   - `STRIPE_SECRET_KEY` = `sk_test_...` (encrypt as a secret)
   - `STRIPE_PRICE_ID` = `price_...`
4. Redeploy, then **Stripe → Developers → Webhooks → Add endpoint:**
   - URL: `https://<your-site>/api/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Copy the **Signing secret** (`whsec_...`) → add `STRIPE_WEBHOOK_SECRET` in Cloudflare, redeploy.
5. **Test:** click Subscribe, pay with card `4242 4242 4242 4242` (any future date / CVC).
6. When ready, swap the Test keys for **Live** keys (`sk_live_...`, live `price_...`, live `whsec_...`).

Phase 1 grants the app login **manually** (webhook logs the subscriber). Phase 2 will
auto-provision the CosmaNeura app account from the webhook.

## Demo-request form

`POST /api/book-demo` is fail-closed until Cloudflare Turnstile and at least one
lead-delivery path are configured. Add these Cloudflare Pages variables:

- `TURNSTILE_SITE_KEY` — public site key for a Turnstile widget restricted to the
  deployed marketing-site hostname.
- `TURNSTILE_SECRET_KEY` — matching secret key; store it as a secret.
- Either `RESEND_API_KEY` (plus a verified `LEAD_FROM` domain) or an HTTPS-only
  `LEAD_WEBHOOK_URL`. `LEAD_TO` defaults to `info@cosmaneura.com`.

The Function verifies a one-time Turnstile token before delivering a lead and
rejects oversized bodies before parsing. It deliberately does **not** claim an
in-process rate limit: Pages Functions instances are not durable shared storage.
Configure a Cloudflare WAF rate-limiting rule for `POST /api/book-demo` (for
example, five requests per minute per source IP, tuned from observed traffic) as
an additional deployment control. The form must never be used for patient data
or PHI.

The Privacy Policy and Terms in this repository are drafts pending counsel
review; publishing the files does not constitute legal approval.

## Public Sovereign panel

The optional public panel unlocks only after a successful demo request. That is
a presentation gate, not identity, authorization, subscription entitlement, or
a capability grant. `PUBLIC_SOVEREIGN_ORIGIN` must be a bare HTTPS origin and is
used only for the panel's API calls; the lead form's values are never passed to
the panel.

The panel code itself is an audited, content-addressed copy of
`CosmaNeura/cosmaneura-sovereign`'s `app/panel.js` served from this website's
`/vendor/` path with SRI. The source commit, SHA-256, SRI and path are pinned in
`public-panel-asset.js` and checked by the dependency-free test suite. Do not
replace it with a script loaded from `PUBLIC_SOVEREIGN_ORIGIN`: a cross-origin
script executes in the marketing page's main realm and could read lead-form
PII. Updating the asset requires reviewing a merged Sovereign commit, copying
its exact bytes, and updating all four pins together.

The separately deployed public Sovereign API must allow the marketing origin
through its exact CORS allowlist. Leave `PUBLIC_SOVEREIGN_ORIGIN` unset until
that deployment and CORS handoff are complete; the panel then remains off.

## Still pending (tracked)

- [ ] **DNS cutover** — point `cosmaneura.com` at Cloudflare Pages, **preserving the
      Google Workspace MX records** so the 4 mailboxes keep working.
- [ ] **Transfer Google Workspace billing** from Squarespace to Google (before fully
      cancelling Squarespace).
- [ ] **Cancel the Squarespace plan** before its ~Aug 5 2026 renewal.
- [ ] Logo + copy tweaks (John wants to revisit — non-blocking).
- [ ] Product screenshots / illustrations (mockup prioritizes type + layout).

## Notes

- The wordmark uses a stand-in system font (`Futura`/`Century Gothic` stack). Final
  typeface to be chosen and embedded.
- Colors: blue `#2F7DC4`, navy `#16234E`, coral `#E4788D`.
