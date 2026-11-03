# Flight plan: owner-only CAB TEST SMS public disclosure

## Outcome and boundaries

- Problem and measurable outcome: public `/privacy` and `/terms` contain the reviewed Cosmaneura CAB TEST SMS privacy and terms disclosure before the separately approved owner-only texting test starts.
- In scope: the same eighteen added HTML lines previously reviewed, plus this Tier 2 flight plan. Initial testing uses fictional administrative cases, one owner-controlled number, at most five messages total across all directions and provider replies, and at most $1 usage.
- Explicit non-goals: sending, enrollment, campaign submission, runtime/API changes, marketing analytics, patients or PHI, new staff cohorts, BAA changes, headers/redirects/build/deployment changes.
- Affected surfaces/data: public static `/privacy` and `/terms`; no form, storage, collection, credential or application API is added. Support address remains `info@cosmaneura.com`; actual monitoring is unconfirmed.

## Risk and dependencies

- Tier 2: repository minimum for legally operative privacy/terms pages. Drafting does not adopt the commitments or authorize publication.
- Legal decisions: owner adoption, support monitoring and final effective/publication date remain pending. Existing August 20, 2026 dates remain unchanged only for this unpublished draft.
- PR outcome: two additive public sections and this flight plan; old counsel-approved BAA and all existing legal paragraphs remain untouched. Current source main `618b2cde378fd17991b3a7b092a3ae4af30ac4e5` has exactly the same tree as the earlier reviewed `022d0ebd` baseline.
- Receiver-before-sender order: adopt and publish the public disclosure, then verify both live URLs and obtain the required Twilio campaign approval before the separately approved one-operation CAB test. The site grants no CAB dispatch authority.

## Current deployed state

- Root authenticated the current remote source and fetched the exact commit. No current deployed artifact, Cloudflare configuration, header/routing observation or live legal-page comparison is supplied by this draft.
- Reconciliation decision and previous known-good artifact: pending owner/operator observation. Record the active production deployment ID and URL before any promotion; do not infer deployed content from main or blindly replace drift.
- The retained local draft comparison records both legal source hashes and current BAA/header/redirect pins; all match the previous reviewed baseline. This is source equality, not deployed-state equality.

## Release control

N/A: this static repository has no feature flags. Hold the local draft or PR without promoting it. The owner-only cohort and CAB runtime latches are outside this website and remain separately governed.

## Schema/data sequence

N/A: the site owns no database or stored application data. No data migration or rehearsal is introduced.

## Rollout and promotion

1. Owner confirms exact disclosure adoption, monitored support and final effective/publication date before merge or publication. Update the exact date only after that decision and re-review changed bytes.
2. On an isolated current-main branch, apply only the two reviewed page additions and this flight plan. Complete the PR template, run the repository-required focused readiness/build checks locally, and obtain independent review after the final substantive push. No check is claimed by this draft.
3. Reconcile current live source/artifact/routes with reviewed main, record the immutable rollback deployment, and obtain distinct founder approval for the exact current-main production promotion.
4. Follow the existing `docs/PRODUCTION_PROMOTION.md` founder-only manual path. A merge is not publication. Do not trigger a workflow or change Cloudflare configuration under this draft; the current conversation's local-agent preference does not authorize an alternate deployment mechanism.
5. Before any message or campaign activation, verify both public disclosures, support links, content hashes, security headers and required HTTP404 paths. Confirm unrelated public and counsel-approved BAA bytes remain unchanged. Carrier/consent and the four-message planned test with fifth unused remain separate gates.
- Abort: stale main/review, unconfirmed adopted language/support/date, unresolved deployed drift or rollback artifact, broken disclosure links/headers/404s, or changed unrelated legal/BAA bytes. Stop promotion and sending.

## Security, legal, and recovery

- Acceptance: owner legal adoption and founder promotion remain pending. Prior draft review is content evidence only, not counsel/compliance opinion, carrier approval or operating assurance. Existing counsel-approved BAA v2.3 bytes are preserved, with no new version.
- Recovery: discard the unpublished draft without live effect. If later promoted, reactivate only the exact previously recorded Cloudflare deployment per the existing runbook; do not rebuild an old commit as rollback. A rollback does not erase consent/STOP or CAB dispatch reservations.
- Observe public content/routing/404s before any separately approved texting test. No deletion, infrastructure change or cleanup is proposed.

## Completion

Complete only after adopted, exact reviewed main is promoted under a distinct founder record and public verification passes, with monitored support established. Source drafting, merge and old review evidence do not meet that condition. CAB sending and campaign registration are separate outcomes; this draft does not complete or authorize them.
