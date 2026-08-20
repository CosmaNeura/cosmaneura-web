# Cosmas marketing site

Public site for **Cosmas** (the product), operated by **Cosmaneura Inc**.
Hosted on Cloudflare Pages at `cosmaneura.com`.

Same product, three doors — not cloned apps:

| URL | Voice |
| --- | --- |
| `/` | Independent clinics |
| `/catholic` | Catholic practices |
| `/mcd` | MyCatholicDoctor rollout (invite-only; `@mycatholicdoctor.com`) |
| `/company` | Cosmaneura Inc |
| `/baa` | Draft BAA (UX; counsel must ratify) |

Sign-in and sign-up go to production Cosmas at `https://app.cosmaneura.com/sign-up?channel=…`.
Channel is attribution. Join still requires a matching practice work-email domain.

## Deploy

Cloudflare Pages, connected to this repo. **No build command.** Output = project root.
Pretty paths are Cloudflare Pages HTML files (`catholic.html` → `/catholic`). Do not 200-rewrite those to `.html` — it 308-loops against Pages’ pretty URLs.

The site does not sell anything: every CTA (including pricing) goes to app
sign-up, and billing happens in the app once the practice's BAA is in force
(checkout, portal, and webhooks live in the main repo). The old `/api/checkout`
and `/api/webhook` Pages Functions are deleted — after deploying, also remove
the `STRIPE_*` environment variables from the Cloudflare Pages project and the
Stripe webhook endpoint that pointed at `cosmaneura.com/api/webhook`.
MCD has no public subscribe.

## Local

```bash
npx serve .
```
