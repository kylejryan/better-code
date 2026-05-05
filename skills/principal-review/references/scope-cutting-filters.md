---
title: Run Every Proposed Feature Through Three Scope Filters
impact: HIGH
impactDescription: Cuts 30-60% of proposed scope by killing work that advances no desired state and protects no invariant
tags: scope, cutting, prioritization, review
---

## Run Every Proposed Feature Through Three Scope Filters

Vague "MVP" cuts produce smaller versions of the wrong thing. Principled cuts come from running each proposed piece of work through three filters in order. If a feature fails the first filter, do not run it through the others — defer or delete.

**Filter 1: Which desired-state statement does this advance, and how would we measure it?**
**Filter 2: Which invariant does this enforce or protect?**
**Filter 3: Can a cheaper mechanism satisfy the same desired state or invariant?**

A feature that survives all three is real work. Anything else is fat or future work.

**Incorrect (no filters — every plausible idea becomes scope):**

```markdown
Backlog for triage v2:
- Triage queue UI
- Bulk resolve
- Slack digest
- SAML SSO
- Per-team dashboards
- Saved filter views
- Comment threads on findings
- Mobile push notifications
- Custom severity rules per tenant
- A new microservice for assignment

Decision: "Let's do all of it. We can always cut later." (We never do.)
```

**Correct (every item answers all three filters or it is cut):**

```markdown
Desired states:
D1. p95 time-to-first-view < 5 min after scan completion.
D2. No critical asset stays vulnerable >24h without page.
D3. Every finding has an owner; orphans impossible.

Invariants:
I1. resolved-only-if-no-open-exploit
I2. exactly-one-owner-per-finding
I3. cross-tenant-read-impossible

Proposed work — scope-cutting pass:

1. Triage queue UI
   F1: advances D1 (engineer needs to see the finding in <5min) ✓
   F2: doesn't enforce an invariant directly
   F3: cheapest mechanism. Email-with-link satisfies D1 and ships in a day
       vs. UI in a quarter.
   → CUT. Replace with email digest. Revisit if email proves insufficient.

2. NOT NULL owner_id with auto-assign trigger
   F1: advances D3 ✓
   F2: enforces I2 ✓
   F3: this IS the cheapest mechanism — schema-level, not service-level.
   → KEEP.

3. SAML SSO
   F1: doesn't advance any current desired state.
   → DEFER. Add as new desired state when a customer requires it; not now.

4. Per-team dashboards
   F1: weakly advances D1 (informational, not the path to <5min).
   F2: no invariant.
   F3: a Grafana board over the existing data costs zero engineering.
   → REPLACE with Grafana board. Save quarter for invariant work.

5. Pager rule on (severity=critical AND age>24h)
   F1: advances D2 ✓
   F2: detects violations of an aspirational invariant ("no critical asset
       vulnerable >24h").
   F3: pager rule is the cheap version; full SLO tooling is the expensive
       version.
   → KEEP the pager rule. Defer the SLO tooling.

6. Bulk resolve
   F1: weak — saves clicks, doesn't move D1/D2/D3.
   F2: actively risks I1 if implemented naively.
   → CUT. If it later proves load-bearing, design with invariant guard.
```

The three filters are in order on purpose. **Filter 1 is mandatory** — work with no desired-state link is a wish. **Filter 2 catches the structural work** that doesn't ship a feature but makes whole classes of bugs impossible. **Filter 3 is where the leverage is** — most "features" have a 10x cheaper alternative if you're willing to ask the question.

Run this in writing, with the team, in 30-60 minutes. The output is a kept list, a cut list, and a deferred list. The deferred list is not a backlog — it is the set of items that would need *new* desired states to come back, not just a free pass next quarter.
