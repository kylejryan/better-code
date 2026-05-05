---
title: Avoid The Common Failure Modes Of Invariant-Driven Review
impact: HIGH
impactDescription: Prevents the review loop from collapsing into a documentation exercise; keeps invariants honest and current
tags: anti-patterns, failure-modes, invariant-rot, monitors, review
---

## Avoid The Common Failure Modes Of Invariant-Driven Review

Invariant-driven review fails in predictable ways. Most failures look like the loop is being followed; they are detectable only by checking whether anything actually changed. Watch for these.

### 1. Invariant rot — yesterday's invariant is today's assumption

What today's product calls "an invariant" tomorrow's product manager calls "obviously we need an exception for X." The fix is not to fight the change — invariants legitimately get demoted. The fix is to **date your invariants** and **localize their enforcement**, so demoting one is a single-point change rather than a system rewrite.

**Incorrect:**
```markdown
Invariants: (undated, scattered enforcement across 14 files)
- Findings always have an owner.
```

**Correct:**
```markdown
I2. Findings always have an owner. (noted 2026-05-05; revisit 2026-08-05)
    Enforced at: schema NOT NULL + auto-assign trigger.
    If demoted: change the constraint and the trigger; nothing else.
```

### 2. Guardrails labeled as invariants

A boundary check that one of N writers must pass is not an invariant — it is a guardrail. The test: *can a writer that bypasses your check violate the rule?* If yes, move enforcement to a layer every writer must pass through (schema, type, workflow). See `invariant-vs-guardrail.md`.

### 3. Monitors used as a substitute for enforcement

A Prometheus alert is not enforcement; it is *detection of failed enforcement*. Monitors belong on top of synchronous enforcement, not instead of it. If your only mechanism for "findings always have an owner" is "an alert fires when one doesn't," the system is already broken by the time the alert lands.

**Incorrect:**
```markdown
Invariant: every finding has an owner.
Enforcement: nightly job alerts if any orphan exists.
```

**Correct:**
```markdown
Invariant: every finding has an owner.
Enforcement: NOT NULL + auto-assign trigger (synchronous, mandatory).
Detection: nightly job alerts if any orphan exists (catches trigger drift).
```

### 4. Desired states without monitors

A desired-state statement nobody has converted into a test or dashboard is decorative. Three months in, "p95 time-to-first-view < 5 min" sits unmeasured while the team ships tickets. The loop is broken at step 5 (state-transition check), not step 1.

### 5. Ticket-counting as progress

If sprint reviews celebrate tickets closed rather than distance-to-desired-state moved, the loop has been replaced by its old, broken predecessor. Force every status update to lead with desired-state metrics; tickets are incidental.

### 6. The "deferred" list silently becomes the backlog

Items on the deferred list must require a *new desired state* to come back, not a free pass next quarter. If "deferred" means "we'll do it next sprint," scope was never actually cut.

### 7. Invariants that aren't locally checkable

"The system is always consistent" is not an invariant — it cannot be checked from a state snapshot. Replace with rules of the form "for every X, property P holds," which can be queried, tested, and monitored. If you cannot write a SQL query (or equivalent) that finds violations, the rule is too vague to enforce.

### 8. Skipping the cheaper-mechanism question

Approving a real-time service when an hourly batch satisfies the desired state. Approving a new microservice when a column would do. The discipline is to require at least two cheaper alternatives to be listed and rejected on the merits before the expensive option is approved (see `scope-cheaper-mechanisms.md`).

### 9. The walkthrough produces no artifact

A 90-minute meeting that ends in vibes is the same as no meeting. The output of step 5 is a one-page document. If you cannot fit the desired states, invariants, enforcement points, scope decisions, and revisit date on a page, you have not made decisions yet.

### 10. The artifact is never reread

Date the doc. Schedule the revisit. The single most common failure of this method is doing it once and never coming back — the system drifts, invariants quietly stop being true, and a year later nobody remembers why the rules were the rules. Set a recurring calendar item the same day you write the artifact.
