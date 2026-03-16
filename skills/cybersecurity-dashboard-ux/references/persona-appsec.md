---
title: AppSec Persona — Org-Wide Risk Posture and Triage at Scale
impact: CRITICAL
impactDescription: Misunderstanding AppSec needs leads to dashboards that bury critical signals in noise
tags: persona, appsec, risk-posture, triage, coverage, incidents
---

## AppSec Persona — Org-Wide Risk Posture and Triage at Scale

AppSec dashboards are about risk posture, coverage, and incident triage at scale. These users think in terms of the entire organization — all services, all teams, all environments.

### Questions They Need Answered at a Glance

- "What is our current risk level, and is it getting better or worse?"
- "Where are the biggest exposures — by app, team, or asset class?"
- "What needs attention today, and who owns it?"
- "Are critical controls and scanners actually deployed and healthy?"

### Interaction Style

- Time-range presets (last 24h, 7d, 30d, 90d) for trend reading
- Quick filters by severity, asset type, environment, business unit
- Click-through from any summary card into an explorer for deeper slicing
- Export and reporting capabilities for stakeholder communication
- Bulk actions: assign, escalate, suppress, set policy across multiple items

### Design Implications

AppSec users tolerate density. They want information-rich screens with multiple signals visible simultaneously. But density must be structured — every widget must have a clear purpose and a clear drill-down path.

**Incorrect (low-density, consumer-app aesthetic):**

```text
┌─────────────────────────────────┐
│                                 │
│        Risk Score: 72           │
│                                 │
│     [View Details Button]       │
│                                 │
└─────────────────────────────────┘
```

Single metric per card with large whitespace. AppSec users must click through multiple screens to build a mental model. Wastes the most valuable real estate on the page.

**Correct (structured density with drill-down):**

```text
┌─────────────────────────────────────────────────────┐
│ Risk Score: 72 ↓3 (7d)    Coverage: 87% ↑2%        │
│ ━━━━━━━━━━░░░░             ████████░░               │
│ Crit: 12 ↑4 | High: 47 ↓2 | Med: 183 | Low: 412   │
│ SLA Breaches: 3    Gaps: 12 services                │
│ Top Risk: auth-service (Crit: 5, no DAST)           │
└─────────────────────────────────────────────────────┘
```

Multiple signals visible simultaneously. Trends inline. Drill-down targets obvious. AppSec can assess posture without clicking.

### Key Principle

AppSec users are the "air traffic controllers" of security. Their screen should function like a control tower — all critical signals visible at once, with the ability to zoom into any signal instantly. If they have to navigate to see whether coverage is healthy while looking at vulnerabilities, the layout has failed.
