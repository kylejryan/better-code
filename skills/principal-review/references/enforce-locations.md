---
title: Pin Each Invariant To One Enforcement Point And One Test Or Monitor
impact: CRITICAL
impactDescription: Makes invariants auditable; turns silent violations into loud failures; localizes future demotion to assumptions
tags: enforcement, invariants, monitoring, testing, ownership
---

## Pin Each Invariant To One Enforcement Point And One Test Or Monitor

An invariant without a named enforcement point is a wish. An invariant without a test or monitor is a wish you will not notice breaking. For every invariant, write down two things explicitly: **where** the system rejects violations, and **how** you would learn that it stopped working.

Pick the enforcement layer based on who can violate the rule:

| Enforcement layer            | Use when                                                              |
|------------------------------|-----------------------------------------------------------------------|
| Type system                  | Violation should be impossible to compile; finite, closed states.     |
| Schema constraint (DB / proto)| Multiple writers; rule is a property of the data itself.             |
| Service-layer check          | Rule depends on cross-aggregate state not encodable in the schema.    |
| Workflow / state-machine guard| Rule is about legal transitions, not legal states.                   |
| Policy engine (OPA, Cedar)   | Rule is multi-tenant, audited, or changes faster than code deploys.   |
| Periodic reconciliation job  | Rule cannot be enforced synchronously; eventual correctness is OK.    |

**Incorrect (invariants written down, enforcement implicit):**

```markdown
## Invariants
1. A finding cannot be "resolved" while it has an open exploit path.
2. Every finding has exactly one owner.
3. Cross-tenant reads are impossible.

## How we enforce these
(empty — "the team handles it in the service layer")
```

When the next engineer adds a new write path, they have no idea what they need to preserve. Six months later, a backfill job marks 4,000 findings resolved while exploits are still open. The invariant was a comment.

**Correct (every invariant has one enforcement point and one detector):**

```markdown
## Invariant 1: A finding cannot be "resolved" while it has an open exploit path.

- Enforced at: `findings` service `markResolved()` — wraps in a transaction
  that selects open exploit paths FOR UPDATE and refuses if any exist.
- Also enforced at: `findings_exploits` table CHECK constraint via trigger
  (defense in depth — backfill jobs cannot bypass).
- Detector: `invariant_resolved_with_open_exploit` Prometheus alert,
  query runs every 5 min, pages on any non-zero result.
- Test: `findings.resolve.spec.ts::cannot resolve with open exploit`.
- Owner: triage team.
- Date noted: 2026-05-05.

## Invariant 2: Every finding has exactly one owner.

- Enforced at: schema — `findings.owner_id` NOT NULL with FK and default
  via `auto_assign_owner` trigger.
- Detector: nightly job `audit_orphan_findings` — alerts if any row has
  null owner_id (should be impossible; alert exists to catch trigger drift).
- Test: `findings.creation.spec.ts::owner_id is always set`.
- Owner: triage team.
- Date noted: 2026-05-05.
```

Three properties make this auditable. **One named layer**, so the next engineer knows where to look and where to add new logic. **At least one synchronous mechanism** (constraint, type, guard) — monitors are not enforcement, they are *detection of failed enforcement*. **A dated owner**, so when the rule needs to be revisited or demoted to an assumption, someone is accountable for that decision.

The localized enforcement also gives you optionality: when a future invariant gets demoted (see `anti-patterns.md`), you change one place, not a sprawl of conditionals. Localized enforcement is what makes invariant-driven design *cheaper* than ad-hoc validation, not more expensive.
