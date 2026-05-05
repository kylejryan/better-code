---
title: Frame Initiatives As Desired-State Statements, Not Feature Lists
impact: CRITICAL
impactDescription: Cuts 30-60% of proposed scope by exposing work that doesn't move any externally observable outcome
tags: desired-state, scoping, outcomes, framing, principal
---

## Frame Initiatives As Desired-State Statements, Not Feature Lists

Replace "what should we build?" with "what must be true in production when this is done?" A desired-state statement is **externally observable**, **testable**, and **framed at the level of system or world state** — not UI, not implementation. Anything that doesn't measurably move at least one desired-state statement is a candidate for cutting or deferring.

**Incorrect (feature list disguised as goals — un-testable, implementation-coupled, infinitely expandable):**

```markdown
# Vulnerability triage initiative — Q3 goals
- Build a triage queue UI
- Add a "resolve" button
- Send Slack notifications when scans finish
- Add bulk actions
- Add filters for severity and asset type
- Add SAML SSO
- Refactor the scanner service
- Add a dashboard
```

Nothing here tells you whether the system is actually doing its job. You can ship every bullet and still have engineers ignoring the queue, and you can never end the project because there is always one more feature.

**Correct (3-7 externally observable, testable statements about system state):**

```markdown
# Vulnerability triage initiative — desired state when done
1. Security engineers see exploitable, unowned vulnerabilities within 5 minutes of scan completion (p95).
2. No production asset stays in a critically vulnerable state for more than 24 hours without a paging alert.
3. Every finding has exactly one named owner at all times; orphaned findings are impossible.
4. A finding marked "resolved" cannot have an open successful exploit path against it.
5. 90% of high-severity findings are acknowledged within one business hour during business hours.
```

Each statement is a sentence you could write a monitor or acceptance test for. Each one tells you whether you are *done*, not just whether you *shipped*. When someone proposes a feature, you ask: "which of these does it move, and how would we measure it?" If the answer is none, the feature is fat — defer or delete.

Three properties make a desired-state statement load-bearing: **observable** (someone outside the team could check it), **testable** (a query, monitor, or audit can verify it), and **state-shaped** (describes a property of the world, not an action the team takes).
