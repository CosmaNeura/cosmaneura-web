<!-- deploy-kit v0.2.1 -->

## Outcome and scope

<!-- State one independently releasable outcome and explicit non-goals. -->

## Risk class

- [ ] **Tier 0 — routine:** no legal, security-header, redirect, build,
      deployment, schema/data, auth, billing, PHI, or external-contract impact
- [ ] **Tier 1 — deployment-sensitive/reversible:** release behavior changes
      and has a deliberate recovery move
- [ ] **Tier 2 — irreversible/high blast radius:** legal pages, security
      headers/redirects, promotion machinery, breaking contracts, security, or
      another broad-impact change

Classification reason:

## Evidence required for every code change

- [ ] Repository CI is green for the final substantive push
- [ ] Independent non-implementer agent review identifies the reviewed commit:
      <!-- durable PR comment/check link -->
- [ ] Agent findings are resolved or explicitly accepted in the PR
- [ ] Existing GitHub human-approval requirements are satisfied
- [ ] This PR is one independently releasable outcome; otherwise link the
      dependency-ordered split/stack decision

Agent evidence is not a GitHub approval. A later substantive push requires a
new review.

## Conditional controls

<!-- Fill what applies and mark the rest N/A with a reason. -->

- **User-visible reversible behavior:** release control, owner, expiry, and
  first cohort; otherwise N/A (this repo has no flag system)
- **Flight plan:** link for Tier 2, cross-repo, multi-deploy, or cohort work;
  otherwise N/A
- **Schema/data rung and rehearsal:** N/A — this repository owns no schema or
  stored application data
- **Cross-repo:** contract version and receiver-before-sender order; otherwise
  N/A
- **Security acceptance:** record, scope, expiry, and allowed environment/data
  boundary; otherwise N/A

## Deployment and recovery

- Cloudflare/runtime effect:
- Current live-state comparison required: yes/no; evidence or reason:
- Health/canary signal:
- Exact rollback or recovery move:
- Previous known-good artifact/content boundary:

Production promotion is founder-only and manual through
`.github/workflows/promote-production.yml`, from the exact current `main`
commit with bound independent-agent review evidence. Founder promotion is
recorded self-authorization; agent review is not GitHub approval. Confirm the
required production-environment secrets exist before attempting promotion.

## Change record

- Systems and data affected:
- PHI impact: none / read / write / schema-data
- Tests actually run:
- Documentation or runbook changed:
