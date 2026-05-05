# Principal Review

## Structure

```
principal-review/
  SKILL.md       # Main skill file - read this first
  AGENTS.md      # This navigation guide
  CLAUDE.md      # Symlink to AGENTS.md
  references/    # Detailed reference files
```

## Usage

1. Read `SKILL.md` for the main skill instructions
2. Browse `references/` for detailed documentation on specific topics
3. Reference files are loaded on-demand - read only what you need

Stop reviewing features. Start reviewing **desired state** and **invariants**. A principal review answers two questions, in order: *what must be true in the world when this is done?* and *what must never be allowed to happen for that to remain true?* Everything else — architecture, scope, tickets — falls out of those answers.

## When to Apply

Run this loop when:
- Kicking off a new capability, initiative, or refactor
- Reviewing a design doc, RFC, or roadmap for over-scope
- A PR or epic feels bloated and you need a principled way to cut
- The team disagrees on what "done" means
- An invariant has been silently violated in production
- You inherit a system and need to map what it actually guarantees

## The Loop

1. **Desired state** — Write 3-7 externally observable statements about what must be true in production when this is done.
2. **Invariants** — Write 5-10 domain rules that must never be violated for those desired states to hold.
3. **Enforcement points** — For each invariant, name the layer that enforces it (DB constraint, service check, policy engine, workflow guard) and how it is tested or monitored.
4. **Scope-cutting pass** — For every proposed feature, ask: which desired state does it advance, which invariant does it support, and is there a cheaper mechanism that does the same job?
5. **State-transition check** — Diagram the legal states and transitions. Make desired-state statements first-class tests and dashboards. Measure progress as *distance to desired state*, not tickets closed.

## Core Distinction: Guardrails vs. Invariants

- **Guardrails** filter untrusted input at boundaries. They keep bad data out.
- **Invariants** guarantee internal state is always valid after every mutation. They make impossible states unrepresentable.

A skill review confuses the two. A principal review separates them — guardrails go at the boundary, invariants go in the type system, the schema, and the workflow engine.

## Categories by Priority

| Priority | Category          | Impact   | Prefix       |
|----------|-------------------|----------|--------------|
| 1        | Desired State     | CRITICAL | `desired-`   |
| 2        | Invariants        | CRITICAL | `invariant-` |
| 3        | Enforcement       | CRITICAL | `enforce-`   |
| 4        | Scope Cutting     | HIGH     | `scope-`     |
| 5        | State Transitions | HIGH     | `state-`     |
| 6        | Review Loop       | MEDIUM   | `loop-`      |
| 7        | Anti-Patterns     | HIGH     | `anti-`      |

## How to Use

Read individual reference files for detailed mechanics and worked examples:

```
references/desired-state-statements.md
references/desired-bdi-framing.md
references/invariant-domain-rules.md
references/invariant-vs-guardrail.md
references/enforce-locations.md
references/scope-cutting-filters.md
references/scope-cheaper-mechanisms.md
references/state-transition-verification.md
references/loop-team-walkthrough.md
references/anti-patterns.md
references/_sections.md
```

## Self-Review Checklist

Before signing off on a design, refactor, or epic, verify:
- 3-7 desired-state statements exist, are externally observable, and are testable
- Each desired state has at least one acceptance test or production monitor
- 5-10 domain invariants are written down, each with an explicit enforcement point
- Every invariant has a test or monitor that fails loudly when it is violated
- Guardrails (boundary filtering) and invariants (internal correctness) are not conflated
- Every proposed feature points to a desired state it advances OR an invariant it protects — anything else is deferred or cut
- A cheaper mechanism (DB constraint, batch job, type, deletion) was considered and rejected with a reason for every new service, queue, or sync path
- A state diagram exists and the legal transitions match the invariants
- Progress is measured by distance to desired state, not by ticket throughput
- The list of invariants is dated — owners know they will need to revisit which ones get demoted to assumptions later
