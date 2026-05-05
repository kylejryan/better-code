---
title: Use BDI Framing — Beliefs, Desires, Intentions — To Commit To Minimum Scope
impact: HIGH
impactDescription: Forces explicit separation of current state, target state, and committed work; prevents goal-creep by anchoring intentions to a small set
tags: bdi, intentions, scoping, commitment, framing
---

## Use BDI Framing — Beliefs, Desires, Intentions — To Commit To Minimum Scope

Borrow the Belief-Desire-Intention model from rational-agent design. **Beliefs** are your current model of how the system actually behaves. **Desires** are your desired-state statements. **Intentions** are the *minimum* set of behaviors and changes you commit to building now to move from beliefs to desires. The discipline is in keeping intentions small — the desire set is allowed to grow, the intention set must not.

**Incorrect (every desire becomes an intention — no commitment, no cutting):**

```markdown
Desires: 5 desired-state statements about triage.
Intentions: 18 epics, 47 tickets, 6 services.

Net effect: every desire spawned three or four intentions, with no argument
about why each is necessary. The team is building everything that "could
help," not the minimum that *must* exist.
```

**Correct (intentions are explicitly the minimum, each tied to a desire):**

```markdown
Beliefs (current state):
- Findings land in a JSON blob queue, no ownership column.
- Mean time-to-acknowledge is 14 hours.
- 22% of findings have no assignee for >7 days.

Desires (desired state):
D1. Findings have an owner at all times.
D2. p95 time-to-first-view < 5 min after scan completion.
D3. No critical asset vulnerable >24h without page.

Intentions (minimum commitment):
I1. Add NOT NULL owner_id column with auto-assignment rule  → satisfies D1.
I2. Push notification on scan completion to owner            → satisfies D2.
I3. Pager rule on (severity=critical AND age>24h)            → satisfies D3.

Deferred: triage UI redesign, bulk actions, SSO, dashboards. None of them
flip a desire from false to true.
```

Two rules keep this honest. First, **every intention must name the desire it satisfies**; an intention with no desire is a feature wish, not a commitment. Second, **count intentions, not tickets** — if your intention list has 30 items, you have not committed, you have written a backlog. The intention list should fit on an index card.

The payoff: when the inevitable mid-project pressure hits ("can we also add X?"), you have a clean answer. X is a new desire (write it down) and a new intention (argue for it on the merits) — not a quiet expansion of the current commitment.
