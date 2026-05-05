---
title: Verify The System Reaches Desired State, Not Just That Code Shipped
impact: HIGH
impactDescription: Replaces ticket-counting with distance-to-desired-state as the progress metric; surfaces stuck or leaking transitions early
tags: state-transitions, verification, monitoring, progress, acceptance
---

## Verify The System Reaches Desired State, Not Just That Code Shipped

Shipping code and reaching desired state are not the same thing. Without explicit verification, teams measure progress by tickets closed and discover six months later that nothing actually moved. Make desired-state checks first-class artifacts: tests, monitors, dashboards.

Three habits make this concrete:

- **Diagram the legal states and transitions.** Drawing the state machine forces invariants to surface. Any transition that doesn't fit your invariant list is suspicious.
- **Convert each desired-state statement into a test or monitor.** A statement nobody has written a check for is a statement nobody is enforcing.
- **Use Given–When–Then around invariants.** Arrange state that satisfies invariants, act with the change, assert invariants and desired state still hold.

**Incorrect (progress measured by tickets, no state verification):**

```markdown
Sprint review:
- 14 tickets closed ✓
- All PRs merged ✓
- Demo went well ✓
- Q3 goal: "improve triage" — status: green

Reality (discovered three months later):
- p95 time-to-first-view: 9 hours (target: 5 min). Unmoved.
- Orphan findings: 18%. Unmoved.
- Nobody noticed because no one was watching the desired-state metrics.
```

**Correct (desired-state metrics are the dashboard; tickets are incidental):**

```markdown
## Desired-state dashboard (what we actually watch)

D1: p95 time-to-first-view after scan completion
    Current: 9h        Target: <5m       Trend: ↓ 2h/week     Status: 🟡
D2: critical assets vulnerable >24h without page
    Current: 3         Target: 0         Trend: ↓ 1/week      Status: 🟡
D3: orphan findings (no owner)
    Current: 0         Target: 0         Trend: flat at 0     Status: 🟢

## Invariant monitors (loud failures expected)

I1 violations (resolved with open exploit):  0 ✓ (alert at >0)
I2 violations (no owner):                    0 ✓ (alert at >0)
I3 violations (cross-tenant read):           0 ✓ (alert at >0)

## Tests as proof
- D1: synthetic scan + measurement test in CI, runs hourly in prod
- D2: production query + alert
- D3: schema constraint + nightly audit job
```

```typescript
// Acceptance test pattern: arrange state, act, assert invariants AND desired state
test("triage flow satisfies D1, I1, I2 simultaneously", async () => {
  // Given — state that already satisfies invariants
  const tenant = await arrangeTenant();
  const scan = await arrangeScan(tenant);

  // When — the action under test
  const completedAt = await runScan(scan);
  const firstView = await waitForFirstView(scan);

  // Then — both desired state and invariants hold
  expect(firstView - completedAt).toBeLessThan(5 * MINUTE);     // D1
  await expectInvariant(I1, "no resolved-with-open-exploit");
  await expectInvariant(I2, "every finding has an owner");
});
```

The state diagram itself is a deliverable. For each entity (finding, scan, asset, agent run), the legal states and the legal transitions between them should be drawn — and every transition should map to an invariant that constrains it. Transitions with no invariant guarding them are where bugs accumulate.

A good progress conversation now sounds like: *"D1 went from 9h to 4h this sprint. D2 is stuck — the pager rule fires but the on-call rotation isn't acknowledging in time, so the bottleneck has moved. D3 is solid. I1 and I2 have stayed at zero violations."* That is what principal-level progress reporting looks like — distance to desired state, not throughput.
