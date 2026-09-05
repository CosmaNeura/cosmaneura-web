# Grok Bot CMO — Cosmaneura port kit

Port package for an external **Grok Bot** (xAI persistent agent teammate) acting
as Cosmaneura’s marketing CMO. Authoritative product context lives in this
repository; Grok prototype repos (`settings-grok`, `visit-prep-grok`) are out of
scope and should not be edited.

## What Grok Bot is (research summary)

Sources: [Introducing Grok Bot](https://x.ai/news/introducing-grok-bot) (2026-08-11),
[Grok Bot for GTM](https://x.ai/bot/guides/grok-bot-for-gtm),
[docs — create/manage Bots](https://docs.x.ai/grok-bot/bots).

- Persistent named Bots with their own cloud computer; work continues when your
  laptop is closed.
- Configure via **profile** (name, title, description), **skills** (reusable
  procedures), **routines** (schedule/event), **connectors**, and **approvals**.
- Multi-Bot teams / group chats are supported; specialists beat one mega-bot.
- Bots on one account share a computer — not a security boundary between bots.
- Teach workflows once (“show how it’s done”) and save as skills/routines.
- Keep consequential sends/publishes behind human approval.

## Port steps (manual — no API import assumed)

1. Create a Bot named **Cosmas CMO** (or similar).
2. Paste `BOT_PROFILE.md` into the Bot description / standing instructions.
3. Paste `product-marketing.md` into Bot knowledge/files (or pin as the first
   always-read document). **Do not port until founder resolves OPEN CONFLICTS.**
4. Create Skills from each file in `skills/` (one skill per file). Prefer pasting
   the Cosmaneura-constrained briefs here over raw upstream marketingskills text.
5. Set Approvals: require human approval for send/publish/spend/delete/production
   changes. Never auto-publish site or ads.
6. Do **not** connect PHI-bearing production systems, EHR, claim rails, or
   patient mailboxes to this Bot.
7. Optional later: a Chief-of-Staff Bot that only delegates to this CMO Bot —
   still bound by the same product-marketing file.

## Sync rule

Cursor (`cosmaneura-web`) is the source of truth. After founder resolves
conflicts or changes positioning, update files here first, then re-paste into
Grok Bot. Do not let Grok Bot memory silently override settled canon.

## Files

| File | Paste into |
|------|------------|
| `BOT_PROFILE.md` | Bot profile / description |
| `product-marketing.md` | Always-on context (copy of `.agents/product-marketing.md`) |
| `APPROVALS_AND_BOUNDARIES.md` | Standing rules / a dedicated “guardrails” skill |
| `skills/*.md` | Individual Grok Bot skills |
