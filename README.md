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
