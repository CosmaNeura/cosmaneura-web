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

Stripe `$89/mo` checkout remains `/api/checkout` (independent + Catholic pages).
MCD has no public subscribe.

## Local

```bash
npx serve .
```
