---
title: Write Invariants As Domain Rules, Not Implementation Details
impact: CRITICAL
impactDescription: Eliminates entire classes of bugs by making impossible states unrepresentable; survives refactors that implementation-level rules don't
tags: invariants, domain-rules, modeling, correctness
---

## Write Invariants As Domain Rules, Not Implementation Details

An invariant is a domain-level "rule of the game" that must never be violated for desired state to hold. Good invariants are written in the language of the business, not the language of the framework. They survive refactors, language changes, and rewrites — implementation-level rules do not.

**Incorrect (implementation-coupled — these rot the moment you change frameworks):**

```markdown
- The findings table must have an index on (tenant_id, severity).
- The Slack notification handler must retry 3 times.
- The Redis cache TTL on user permissions must be 5 minutes.
- The React component must memoize the finding list.
```

These are all *decisions*, not invariants. Replace any of them and the system is still correct. They belong in a design doc or ADR, not in the invariant list.

**Correct (domain-level — true regardless of implementation):**

```markdown
1. A finding cannot be marked "resolved" while there exists an open
   successful exploit path against the same asset.
2. Every finding has exactly one owner at all times; orphaned findings
   are impossible to represent.
3. A tenant's data is never readable across tenant boundaries, regardless
   of misconfiguration in any single layer.
4. An agent may never execute a tool call without an attached identity,
   authorization scope, and audit record.
5. A scan result is never visible to users until it has been validated
   against the scanner's signature.
```

Each one is a sentence about the world the software models. Each one would still make sense if you rewrote the entire stack in a different language. Each one tells a future engineer *what they are not allowed to break*, even when they don't understand the original implementation.

Aim for **5-10 invariants** per system. Fewer and you have not modeled the domain; more and you are mixing in implementation details. Each invariant should be:

- **Negative or universal** ("never," "always," "exactly one") — invariants are constraints, not capabilities.
- **Domain-shaped** — phrased in nouns the product team would recognize.
- **Independent of mechanism** — the rule, not where you enforce it.
- **Locally checkable** — given a snapshot of state, you can decide whether it holds.

If you find yourself writing "the X service must..." you have written an architecture decision. Rewrite it as a property of the data or domain instead.
