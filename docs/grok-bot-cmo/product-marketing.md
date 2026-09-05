# Product Marketing Context — Cosmas / Cosmaneura

**Document version:** v0-draft-conflicts  
**Last updated:** 2026-09-05  
**Status:** STOP — founder must resolve every open conflict before this doc is treated as authoritative for Cursor or Grok Bot.

Other marketing skills and the Grok Bot CMO must read this file first. Until conflicts are closed, treat only the **Settled for now** section as usable; do not invent resolutions.

---

## OPEN CONFLICTS — founder decision required

Do not soft-merge these. Reply with a choice per ID (or a third option).

### C1 — What Cosmas is in public marketing *today*
- **A (live site):** Visit-recording → draft SOAP note → clinician copies into chart. Cosmas does not write to the EHR.
- **B (OS / architecture narrative):** Cosmas is the practice computer / broader clinical-ops platform.
- **C:** Public marketing stays A; B is internal/future only until founder activates.

### C2 — Capability catalog on the public site
Live `content/product-capabilities.mjs` marks only `soap_note` as Available. `intake_prep`, `session_prep`, `scribe`, and `cab` are **Not offered**.
- **A:** Marketing may only promote the SOAP workflow. Never tease the others.
- **B:** Marketing may say “more tools coming” without naming them.
- **C:** Marketing may name Intake Prep / Session Prep / Scribe / CAB as roadmap with explicit “not available” labels.
- **D:** Flip specific tools to Available (list which) and update the registry + site in the same stack.

### C3 — CAB (Computer-Assisted Billing)
CAB exists as an internal/advisory codebase; public registry says Not offered; BAA v2.3 removed claim-submission language.
- **A:** CAB is invisible in all marketing until a separate activation PR.
- **B:** CAB may be described as future billing *intelligence/advisory only* (no submit/837P/clearinghouse/EHR writeback).
- **C:** Other — specify exact allowed sentence.

### C4 — Faith / Catholic / MCD doors vs INV-7
OS material includes INV-7-style “faith never appears in product copy or marketing.” The site has `/catholic` and `/mcd` doors with channel attribution.
- **A:** Doors are attribution-only. No faith claims, theology, or religious persuasion in copy; Catholic/MCD pages stay operational (“for Catholic practices” / MCD work-email rollout).
- **B:** Faith-forward messaging is allowed on `/catholic` and `/mcd` only.
- **C:** Remove or de-emphasize faith-adjacent doors from marketing strategy (product change — separate stack).

### C5 — Trial, card, and checkout truth
Live site: list price only; **no 14-day trial begins at checkout**; **no card collected during onboarding**; this site does not checkout or create a paid plan.
- **A:** Lock that commercial story for all agents (Cursor + Grok Bot).
- **B:** Update site + this doc together when trial/card policy changes (do not let agents invent a trial).

### C6 — “Practice computer” phrase
- **A:** Allowed in marketing now.
- **B:** Forbidden in public marketing until product UI matches.
- **C:** Allowed only in company/about long-form, not homepage/hero.

### C7 — Security / trust claims ceiling
Live site: “HIPAA compliance is self-attested. Cosmaneura is not SOC 2 certified.” One BAA per practice with Cosmaneura Inc.
- **A:** Agents must not claim SOC 2, HITRUST, “HIPAA certified,” or third-party audits.
- **B:** Founder will supply stronger approved trust language (paste it).

### C8 — Competitive positioning
Public site does not name competitors.
- **A:** Agents may compare generically (ambient scribes, EHR-native note tools) without naming vendors.
- **B:** Founder supplies an approved competitor list and claim boundaries.
- **C:** No competitive copy until approved.

---

## Settled for now (use these until conflicts close)

### Product overview
- **Product:** Cosmas  
- **Company:** Cosmaneura Inc (Delaware C-corp; New Hampshire)  
- **One-liner (live):** Upload a visit recording. Get a draft SOAP note.  
- **What it does (live):** After a visit, the practice uploads a recording; Cosmas drafts a SOAP note; the clinician reviews/edits; the clinician copies into the patient chart. Cosmas does not write to the EHR.  
- **Category:** Clinical documentation assistance for outpatient practices (recording → draft note).  
- **Type:** B2B healthcare SaaS (practice-tenant).  
- **Public list price:** $89 per active clinician / month; up to 20 active clinician seats per practice.  
- **Legal:** One BAA per practice with Cosmaneura Inc (CN-BAA-CUST-CW v2.3).  

### Target audience (provisional)
- Independent outpatient practices, roughly 1–20 clinicians.  
- Decision-makers: practice owner / clinical lead / office manager.  
- Primary job: reduce after-visit documentation time without EHR write-back risk.  

### Three doors (attribution, not authorization)
| Door | Path | App channel |
|------|------|-------------|
| Direct | `/` | `direct` |
| Catholic practices | `/catholic` | `catholic` |
| MyCatholicDoctor rollout | `/mcd` | `mcd` |

Channel is attribution only. Join still requires matching practice controls in-app.

### Hard claims — never say
- Cosmas submits claims, generates 837P, enrolls clearinghouses, or writes to an EHR.  
- NPI is required at signup/onboarding, or is identity/security/credential proof.  
- Cosmaneura verifies provider licensure/credentials as a gate to signup, trial, billing, entitlement, or PHI access.  
- SOC 2 certified (unless C7 changes).  
- Partner marketing tools from third-party skill marketplaces are required (they are **off by design**).  

### PHI / data boundary for agents
- Never put real PHI, patient recordings, charts, claim files, or production exports into prompts, drafts, fixtures, screenshots, or Grok Bot memory.  
- Marketing work uses synthetic examples only.  
- Do not connect Grok Bot to PHI-bearing production systems for CMO work.

### Brand voice (provisional)
- Direct, clinical-operational, low hype.  
- Prefer concrete workflow language over platform abstraction.  
- No emoji-led marketing; no “AI magic” claims.  

### Conversion action (live site)
- Primary CTA: **Continue in Cosmas** → `app.cosmaneura.com` sign-up with the page’s channel.  
- This static site does not sell, checkout, or collect cards.

### Partner / marketplace ads
- Third-party tools promoted inside upstream marketing skills (analytics pixels, website platforms, agencies) are **optional ads, off by default**. Do not recommend or install them unless the founder explicitly enables one.

---

## Changelog
- v0-draft-conflicts (2026-09-05) — Initial draft from live `cosmaneura-web` + capability registry; conflicts listed for founder call before Cursor/Grok Bot treat this as canon.
