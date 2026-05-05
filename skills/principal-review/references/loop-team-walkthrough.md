---
title: Run The Five-Step Walkthrough At The Start Of Every Initiative
impact: MEDIUM
impactDescription: Compresses scoping and design alignment from weeks of drift to a single 60-90 minute meeting with a written artifact
tags: process, ritual, walkthrough, alignment, kickoff
---

## Run The Five-Step Walkthrough At The Start Of Every Initiative

The principal-review loop is a 60-90 minute meeting with a written artifact at the end. Run it at the start of every initiative, every refactor, and every design review where scope is unclear. The output is a one-page document the team can disagree with explicitly rather than a Slack thread of vague intentions.

The five steps, in order, with timeboxes:

1. **Desired state (10-15 min)** — write 3-7 externally observable statements about what must be true in production when "done."
2. **Invariants (15-20 min)** — write 5-10 domain rules that must never be violated for those desired states to hold.
3. **Enforcement points (15-20 min)** — for each invariant, name the layer that enforces it and the test or monitor that detects violations.
4. **Scope-cutting pass (15-20 min)** — run every proposed feature through the three filters; produce a kept list, a cut list, and a deferred list.
5. **State-transition check (10 min)** — sketch the legal states and transitions; identify which monitors and tests will track desired state.

**Incorrect (vague kickoff, no artifact, weeks of slow drift):**

```
Kickoff meeting (60 min):
  - 30 min discussing "the goals" in abstract terms
  - 20 min brainstorming features on a whiteboard
  - 10 min "we'll figure out the details async"

Result: three weeks of Slack threads, two competing design docs, scope
keeps growing because no one ever wrote down what was *not* in scope.
```

**Correct (60-90 min walkthrough, one-page artifact, decisions are explicit):**

```markdown
# Triage v2 — principal review (2026-05-05)

## 1. Desired state
D1. p95 time-to-first-view < 5 min after scan completion.
D2. No critical asset vulnerable >24h without page.
D3. Every finding has an owner; orphans impossible.

## 2. Invariants
I1. resolved ⇒ no open exploit path.
I2. exactly-one-owner per finding at all times.
I3. cross-tenant read impossible regardless of layer misconfig.
I4. resolution audit trail is append-only.
I5. agent-driven mutations require attached identity + scope + audit.

## 3. Enforcement
I1. service-layer guard + DB trigger; alert on violation; test in CI.
I2. NOT NULL owner_id + auto-assign trigger; nightly audit; test in CI.
I3. row-level security + per-tenant DB roles; weekly fuzz test.
I4. append-only schema (no UPDATE on audit); review on schema migrations.
I5. policy engine wraps tool calls; rejected calls logged; CI test.

## 4. Scope decisions
Kept:    NOT NULL owner_id, pager rule (D2), email digest (D1),
         service-layer I1 guard, policy-engine wrapper (I5).
Cut:     Triage queue UI (replaced by email), bulk resolve (risks I1),
         per-team dashboards (replaced by Grafana board).
Deferred: SAML SSO (no current desired state), comments threads,
          mobile push, custom severity rules.

## 5. State transitions & verification
Finding states: NEW → ACKNOWLEDGED → IN_PROGRESS → RESOLVED, with
RESOLVED gated by I1.
Dashboards: D1/D2/D3 metrics + I1-I5 violation counters.
Acceptance tests: one per desired state, hourly synthetic in prod.

Owner: Kyle. Revisit invariant list on 2026-08-05.
```

Three things make the artifact work in practice. **One page** — if it does not fit on a page, you have not made decisions. **Explicit deferrals** — the deferred list is *what we are choosing not to do*, and a future request to bring it back must come with a new desired state. **A revisit date** — invariants and desired states drift; somebody must reread this in three months and decide what gets demoted.

Run the walkthrough lightly the second time, more structured the first. After three or four passes, the team writes desired-state statements naturally and the meeting compresses to 30 minutes. The artifact is the point — without it, the loop is just another whiteboard.
