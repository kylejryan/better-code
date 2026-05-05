# Section Definitions

This file defines the rule categories for principal-review. Rules are automatically assigned to sections based on their filename prefix.

---

## 1. Desired State (desired)
**Impact:** CRITICAL
**Description:** Frame initiatives as externally observable, testable statements about what must be true in production when "done." Replaces feature-list thinking with state-based thinking and BDI-style intentions.

## 2. Invariants (invariant)
**Impact:** CRITICAL
**Description:** Domain rules that must never be violated for desired state to hold. Make impossible states unrepresentable. Distinguishes invariants (internal correctness) from guardrails (boundary filtering).

## 3. Enforcement (enforce)
**Impact:** CRITICAL
**Description:** Where each invariant is enforced (DB, service, policy engine, workflow) and how it is tested or monitored. Localize enforcement so invariants can be demoted later without rewriting the world.

## 4. Scope Cutting (scope)
**Impact:** HIGH
**Description:** Three-filter scope review — does the work advance a desired state, protect an invariant, or have a cheaper mechanism? Anything else is deferred, deleted, or replaced with a constraint.

## 5. State Transitions (state)
**Impact:** HIGH
**Description:** Diagram legal states and transitions. Make desired-state statements first-class tests, monitors, and dashboards. Measure progress as distance to desired state, not tickets closed.

## 6. Review Loop (loop)
**Impact:** MEDIUM
**Description:** The concrete team walkthrough — desired state, invariants, enforcement, scope-cutting, transition check. A repeatable ritual you can run on any new initiative or design review.

## 7. Anti-Patterns (anti)
**Impact:** HIGH
**Description:** Failure modes of invariant-driven review — invariant rot, scope creep through guardrail confusion, undated invariants, ticket-counting as progress, and treating monitors as a substitute for enforcement.
