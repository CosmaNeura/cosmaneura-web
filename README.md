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

## Still pending (tracked)

- [ ] **Stripe account** for CosmaNeura (needs John's legal entity + bank details).
- [ ] **Stripe checkout + webhook** as a Pages Function — $89/mo subscription that
      unlocks the CosmaNeura app login. Phase 1 records who paid; Phase 2 auto-provisions
      the app account.
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
