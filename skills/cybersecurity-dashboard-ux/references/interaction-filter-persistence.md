---
title: Filters Persist Across Navigation — Context Is Sacred
impact: MEDIUM
impactDescription: Losing filter context on navigation forces users to re-establish their scope at every level, destroying triage flow
tags: interaction, filters, navigation, context-preservation, state-management
---

## Filters Persist Across Navigation — Context Is Sacred

If the user sets a time range to "last 7 days" on the overview, that filter should carry into any explorer they drill into. Filters are context, and losing context on navigation is disorienting.

### Rules

1. **Active filters display as removable chips** — always visible, individually clearable
2. **"Clear all" is one click** — never require users to remove filters one by one to reset
3. **Drill-down inherits parent filters** — clicking "Critical: 37" pre-applies severity=Critical in the explorer
4. **URL encodes filter state** — sharing a URL shares the exact filtered view
5. **Saved views persist filter configurations** — users can bookmark frequently-used filter combinations

**Incorrect (filters reset on navigation):**

```text
Overview: Time range set to "Last 7 days"
  → Click "Critical: 37"
  → Explorer opens with ALL time, ALL severities
  → User re-selects "Last 7 days" and "Critical"
```

**Correct (filters persist and compose):**

```text
Overview: Time range set to "Last 7 days"
  → Click "Critical: 37"
  → Explorer opens with chips: [Last 7 days ×] [Severity: Critical ×]
  → User adds more filters to narrow further
  → URL: /explorer?timeRange=7d&severity=critical
```

### Saved Views and Bookmarks

Let users save filtered explorer states as named views:
- "My team's critical vulns"
- "Production SLA breaches"
- "Unscanned services"

These become personal dashboard entry points and reduce repetitive filter setup. Power users in AppSec may have 5-10 saved views for different triage workflows.
