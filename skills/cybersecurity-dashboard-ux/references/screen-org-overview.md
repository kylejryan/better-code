---
title: Org Overview (AppSec Home) — The Situation Room
impact: HIGH
impactDescription: The landing screen determines whether AppSec can assess posture in seconds or must dig through multiple views
tags: screen-design, overview, appsec, risk-posture, situation-room
---

## Org Overview (AppSec Home) — The Situation Room

The situation room. AppSec lands here. Engineers may see a read-only version or skip it entirely.

**Incorrect (summary without actionability):**

```text
┌─────────────────────────────────┐
│       Security Dashboard        │
│                                 │
│   Total Findings: 2,847         │
│   Services: 87                  │
│   Last Scan: March 10           │
│                                 │
│   [View All Findings]           │
└─────────────────────────────────┘
```

Single aggregate number, no severity split, no trends, no drill-down targets. AppSec cannot assess whether things are improving or which services need attention.

**Correct (structured density with drill-down targets):**

```text
┌─────────────────────────────────────────────────────┐
│ Risk Score: 72 ↓3 (7d)    Coverage: 87% ↑2%        │
│ ━━━━━━━━━━░░░░             ████████░░               │
│ Crit: 12 ↑4 | High: 47 ↓2 | Med: 183 | Low: 412   │
│ SLA Breaches: 3    Gaps: 12 services                │
│ Top Risk: auth-service (Crit: 5, no DAST)           │
└─────────────────────────────────────────────────────┘
```

Every number is clickable. Trends inline. Severity breakdown immediate. AppSec assesses posture without clicking.

### Primary Widgets

**Risk Posture Score**
- Single prominent number or grade (A-F, 0-100, or traffic light) with trend arrow
- Must answer "are we getting better or worse?" in under 1 second
- Click → risk breakdown by category, team, or environment

**Severity Breakdown**
- Critical / High / Medium / Low counts with trend sparklines
- Horizontal stacked bar showing proportion — critical on the left (most visible)
- Click any severity → vulnerability explorer pre-filtered

**Coverage & Hygiene**
- Percentage of services with SAST/DAST/SCA/secret scanning enabled
- "Gaps in coverage" count prominently displayed — these are blind spots
- Click → list of uncovered services with owner and suggested action

**Active Incidents / Alerts**
- Count of open high-priority items with SLA status (on track / breaching / breached)
- MTTR trend
- Click → incident explorer

**Top Risks**
- Table: top 5-10 risky services/repos with owning team, environment, business criticality
- Sortable by risk score, severity count, or age of oldest unresolved finding
- Click row → service detail page

**Compliance Snapshot**
- Control status cards: compliant / non-compliant / exception counts per framework
- Upcoming audit dates
- Click → compliance detail with per-control breakdown

### Layout

Risk score and severity breakdown at top (the "headline"), coverage and incidents in the middle row, top risks table and compliance below. The top third of the page should answer "how are we doing?" The bottom two-thirds answer "where are the problems?"

```text
┌──────────────────────────────────────────────────┐
│  Risk Score: 72 ↓3      Severity Breakdown       │  ← "How are we doing?"
│  ━━━━━━━━░░░            C:12 H:47 M:183 L:412   │
├────────────────────┬─────────────────────────────┤
│  Coverage: 87%     │  Active Incidents: 8        │  ← Key health signals
│  Gaps: 12 services │  SLA Breaches: 3            │
├────────────────────┴─────────────────────────────┤
│  Top Risks                              Sort ▼   │  ← "Where are the problems?"
│  1. auth-service    Team: Auth   Crit: 5         │
│  2. payment-api     Team: Pay    Crit: 3         │
│  3. user-service    Team: Core   High: 12        │
├──────────────────────────────────────────────────┤
│  Compliance: SOC2 ✓  PCI ⚠ (2 gaps)  HIPAA ✓   │
└──────────────────────────────────────────────────┘
```

### UX Rules for This Screen

- Every card is clickable — no static widgets on the overview
- Time range selector applies globally to all widgets on this page
- Per-widget "last updated" timestamps for data freshness transparency
- Real-time or near-real-time updates for critical/incident counts
- This screen must load fast — even if some widgets show stale data initially with background refresh
