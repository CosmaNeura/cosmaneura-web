# Product Marketing Context — Cosmas / Cosmaneura

**Document version:** v1  
**Last updated:** 2026-09-05  
**Status:** ACTIVE for Cursor and Grok Bot CMO — follow this file. Remaining open items are wording/ops only (see bottom), not strategy conflicts.

Other marketing skills must read this file first.

---

## Decision log (founder 2026-09-05)

| ID | Resolution |
|----|------------|
| **C1** | Hybrid narrative: SOAP **now**; named suite **coming soon**; **Cosmas OS** as waitlist “AI employee / practice OS” horizon. |
| **C2** | SOAP now. Coming soon (named): Session Prep (embedded AI), suggested billing codes, Card Chase, Scribe, Intake. Cosmas OS = waitlist. |
| **C3** | CAB = future **advisory-only** billing intelligence **with integrated admin assistance**. Never claim submit / 837P / clearinghouse / EHR writeback. |
| **C4** | **De-emphasize faith** on all doors. Channels remain attribution; no theology or faith-forward persuasion. |
| **C5** | Keep **live commercial truth** for agents now. Change site + this doc **together later** when staging + Auth/IAM are stable and billing is incorporated. Do not invent trial/card/checkout. |
| **C6** | “Practice computer” / OS language: **About only**, framed as **coming Q4** (with Cosmas OS waitlist — not homepage hero as shipping product). |
| **C7** | Trust ceiling: **BAA available**. No SOC 2, HITRUST, or “HIPAA certified” claims. |
| **C8** | **No competitive copy** until founder approves a list. |

---

## Messaging architecture (C1 — working frame)

Use this three-layer story. Do not collapse layers (e.g. do not sell Cosmas OS as shipping on the homepage).

### Layer 1 — Available now
**Cosmas drafts the note from the visit recording.**

- Upload a visit recording → draft SOAP note → clinician reviews/edits → copy/paste into the chart.  
- Cosmas does **not** write to the EHR.  
- This is the only capability marketed as **available** until the registry flips.

**Primary one-liner (now):**  
Upload a visit recording. Get a draft SOAP note.

**Supporting line (now + horizon, optional):**  
Start with documentation today. More AI teammates for the practice are on the way.

### Layer 2 — Coming soon (named, not available)
May appear as a “Coming soon” / roadmap strip — never as Available, never as checkout features:

| Name | Public framing | Hard bans |
|------|----------------|-----------|
| **Session Prep** (embedded AI) | Pre-visit prep assistance embedded in Cosmas | No PHI scraping claims; not live |
| **Suggested billing codes** | Advisory code suggestions for clinician review | Not claim submission; not payer enrollment |
| **Card Chase** | Follow-up / recovery assistance (patient-responsibility style workflows) | Not clearinghouse; not 837P; not guaranteed collections |
| **Scribe** | Broader ambient/documentation assistance | Not EHR writeback |
| **Intake** | Intake Prep for pre-visit information gathering | Not live |

**CAB** sits with this horizon as: future **advisory-only** billing intelligence with **integrated admin assistance** (see C3). Prefer “billing assistance / suggested codes / admin help” over “CAB” in public copy unless explaining the product name.

### Layer 3 — Waitlist horizon
**Cosmas OS** — the practice’s AI employee / operating layer.

- Position as waitlist / notify interest, not GA.  
- “Practice computer” phrasing: **About page only**, **coming Q4**.  
- Avoid absolute “world’s first” claims unless founder later approves legal/marketing review. Prefer: **“your practice’s first AI employee”** or **“an AI employee for the practice.”**

**Approved direction (draft — refine in W1/W2 below):**  
Cosmas starts as the teammate that drafts the note. Cosmas OS is the waitlist for a fuller AI employee that helps run the practice — documentation first, then prep, billing assistance, and admin help over time.

---

## Settled product facts

### Identity
- **Product (shipping surface):** Cosmas  
- **Horizon product:** Cosmas OS (waitlist; naming polish open — see W1)  
- **Company:** Cosmaneura Inc (Delaware C-corp; New Hampshire)  
- **Category now:** Clinical documentation assistance (recording → draft SOAP)  
- **Category horizon:** Practice AI employee / ops assistance (waitlist)  
- **Type:** B2B healthcare SaaS (practice-tenant)

### Commercial (binding until C5 change ships)
- Public list price: **$89 per active clinician / month**; up to **20** active clinician seats per practice.  
- Live site: **no** 14-day trial at checkout; **no** card during onboarding; marketing site does **not** checkout or create a paid plan.  
- Founder intent: after staging + Auth/IAM are stable, incorporate billing and then update **site + this doc in the same change**. Agents must not invent that future UX early.

### Legal / trust
- One **BAA available** per practice with Cosmaneura Inc (CN-BAA-CUST-CW v2.3).  
- HIPAA: self-attested compliance language only as already on site — **not** “HIPAA certified.”  
- Cosmaneura is **not** SOC 2 certified. Do not claim SOC 2, HITRUST, or third-party audit badges.

### Audience
- Independent outpatient practices, roughly 1–20 clinicians.  
- Buyers: practice owner / clinical lead / office manager.  
- Jobs: cut after-visit documentation time; later, prep/billing-admin assistance without taking over clinical or payer authority.

### Doors (attribution only — faith de-emphasized)
| Door | Path | App channel | Copy rule |
|------|------|-------------|-----------|
| Direct | `/` | `direct` | Default commercial voice |
| Catholic practices | `/catholic` | `catholic` | Operational audience label only; **no** faith persuasion |
| MyCatholicDoctor | `/mcd` | `mcd` | Work-email / network rollout framing; **no** faith persuasion |

Channel ≠ authorization. De-emphasize faith across **all** doors (C4). Future page copy PRs should strip faith-forward language; keep channel params.

### Hard claims — never say
- Cosmas **submits** claims, generates **837P**, enrolls clearinghouses, or **writes to an EHR**.  
- Suggested codes / Card Chase / CAB **guarantee** payment or replace biller judgment.  
- Cosmas OS is **generally available** or “shipping now.”  
- NPI required at signup, or NPI as identity/security/credential proof.  
- Cosmaneura verifies licensure/credentials as a gate to signup, trial, billing, entitlement, or PHI.  
- SOC 2 / HITRUST / “HIPAA certified.”  
- Named competitors (C8).  
- Partner marketplace tools from upstream skills are required (they stay **off by default**).

### Registry vs marketing
`content/product-capabilities.mjs` still marks only `soap_note` as Available. Roadmap names above are **marketing “coming soon” / waitlist** only until a registry+site activation stack flips status. Do not imply Available in UI chrome that the build treats as live catalog.

### PHI / agent boundary
- No real PHI, recordings, charts, claim files, or production exports in prompts, drafts, fixtures, screenshots, PR text, or Grok Bot memory.  
- Synthetic examples only.  
- Do not connect Grok Bot to PHI-bearing production systems for CMO work.

### Brand voice
- Direct, clinical-operational, low hype.  
- Concrete workflow language for Layer 1; clear “coming soon” / “waitlist” labels for Layers 2–3.  
- No emoji-led marketing; no “AI magic.”  
- No competitive smack-talk (C8).

### Conversion
- Primary CTA now: **Continue in Cosmas** (channel-preserving).  
- Secondary CTAs allowed in drafts: **Notify me / join waitlist** for Cosmas OS (implementation may follow in a later PR).  
- Do not add checkout, cards, or trials on the marketing site until the C5 billing change ships.

### Partner / marketplace ads
Optional ads from upstream skills remain **off by default**.

---

## Still open (wording / ops — not strategy blockers)

Reply anytime; agents may use the defaults in parentheses until then.

| ID | Topic | Default until you say otherwise |
|----|--------|----------------------------------|
| **W1** | Public name: `Cosmas OS` vs `Cosmas-OS` vs other | **Cosmas OS** |
| **W2** | AI-employee line: allow “first AI employee for your practice” vs softer “AI teammate for the practice” | **“your practice’s first AI employee”** (no “world’s first”) |
| **W3** | Waitlist mechanism on site (form, mailto, app flag) | Draft copy only until a PR implements capture |
| **W4** | Exact public labels for Card Chase / suggested billing codes | Use founder names above; keep advisory disclaimers |
| **W5** | Timing of faith de-emphasis page edits | Separate creative PR stack after this context ships |

---

## Changelog
- v1 (2026-09-05) — Founder resolutions C1–C8 applied; three-layer messaging architecture added; Cosmas OS waitlist + coming-soon suite named; BAA trust ceiling; faith de-emphasized; commercial truth held until post-Auth billing change.  
- v0-draft-conflicts (2026-09-05) — Initial conflict draft from live site + registry.
