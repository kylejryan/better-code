---
title: Always Search For The Cheaper Mechanism Before Approving New Architecture
impact: HIGH
impactDescription: Replaces 60-80% of proposed services, queues, and sync paths with constraints, batches, types, or deletions
tags: scope, mechanism, simplicity, alternatives, leverage
---

## Always Search For The Cheaper Mechanism Before Approving New Architecture

Every proposed service, queue, real-time sync path, or new abstraction has a cheaper alternative that satisfies the same invariant or desired state. The principal-review job is to *demand* the cheaper alternative be considered and rejected on the merits before the expensive one is approved.

The hierarchy of mechanisms, cheapest first:

| Cheaper                                | Often replaces                              |
|----------------------------------------|---------------------------------------------|
| Deleting the requirement               | Any feature                                 |
| Type-system constraint                 | Runtime validation, defensive checks        |
| Schema constraint (NOT NULL, CHECK, FK)| Service-layer validation, "we'll be careful"|
| State machine / enum                   | Boolean fields, status strings              |
| Daily / hourly batch job               | Real-time sync service                      |
| Cron + reconciliation                  | Event-driven dual-write systems             |
| Single command / use-case function     | New microservice                            |
| One DB + read replicas                 | Polyglot persistence                        |
| Existing tool (Grafana, OPA, Temporal) | Custom-built equivalent                     |
| Documentation                          | Wrapper library no one will maintain        |

**Incorrect (jump to the expensive mechanism without asking the question):**

```markdown
Proposal: "Build a real-time sync service that mirrors findings into
Snowflake within 30 seconds so the analytics team has fresh data."

Approved as proposed. Engineering cost: 1 quarter. Operational cost:
on-call rotation, schema-drift bugs, dual-write reconciliation forever.
```

**Correct (cheaper mechanism considered and either chosen or explicitly rejected):**

```markdown
Proposal: "Real-time sync of findings to Snowflake."

Underlying desired state: "Analytics team can run queries on findings
data without waiting >24h for freshness."

Cheaper mechanisms considered:
1. DELETE: do they actually need <30s freshness? Asked. They need <1 day,
   not <30s. The original framing was an over-spec.
2. BATCH: hourly Airflow DAG dumping findings table to Snowflake.
   Cost: 2 days. Operational cost: ~zero.
3. READ REPLICA: point analytics at a Postgres read replica with
   Snowflake federation. Cost: 1 day. Caveat: query perf on big scans.
4. REAL-TIME SYNC SERVICE (original proposal). Cost: 1 quarter.
   On-call burden: significant.

Decision: chose (2). 1-day freshness satisfies the actual desired state.
Saved a quarter of engineering and an on-call rotation. Reconsider only
if a future desired state genuinely requires sub-minute freshness.
```

The discipline is **cultural, not technical**: every architecture proposal must list at least two cheaper alternatives and explain why each was rejected. If the author can't list any, they have not designed yet — they have just picked the first thing they thought of.

Three failure modes to watch for:

- **"Real-time" used as a default** when the desired state only needs eventual consistency. Ask: what is the actual freshness requirement, in numbers, that a customer or invariant requires?
- **A new service when a new column would do.** Ask: is this a property of existing data, or genuinely new behavior?
- **A new abstraction "for flexibility"** when there is exactly one current call site. Three call sites, then talk about abstraction.

The cheaper mechanism is not always right — sometimes a real-time service is genuinely necessary. The point is to *force the comparison* so the choice is made on the merits, and the cost of the expensive option is paid knowingly.
