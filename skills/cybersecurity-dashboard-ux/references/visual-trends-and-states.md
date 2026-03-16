---
title: Trends Must Have Direction — Every Metric Needs Context
impact: MEDIUM-HIGH
impactDescription: A number without a trend is a snapshot; a number with a trend is information that drives decisions
tags: visual-design, trends, sparklines, empty-states, loading-states
---

## Trends Must Have Direction — Every Metric Needs Context

A number alone ("37 critical vulns") is a snapshot. A number with a trend ("37 critical vulns ↑12 from last week") is information. Every metric that can trend should show its trend.

### Trend Indicators

Use arrows, sparklines, or delta text. The user should never have to compare two time-filtered views to determine direction.

**Incorrect (snapshot only):**

```text
┌──────────────┐
│  Critical: 37│
│  High: 142   │
│  Medium: 483 │
└──────────────┘
```

Is 37 good or bad? Getting better or worse? The user has no idea without comparing to a previous view.

**Correct (trend-enriched):**

```text
┌──────────────────────────┐
│  Critical: 37  ↑12 (7d)  │  ← Getting worse — take action
│  High: 142     ↓8  (7d)  │  ← Improving — progress visible
│  Medium: 483   ━   (7d)  │  ← Stable — no change
└──────────────────────────┘
```

### Status Badges Must Be Glanceable

A wall of findings with identical visual weight is unusable. Each finding/service/alert needs a visual severity indicator that's readable at scan speed — colored dot, icon, or badge at the left edge of each row. Users scan the left column first; put severity there.

### Empty States Are Not Errors

A vulnerability explorer with zero results should congratulate, not confuse. "No critical vulnerabilities found in the selected scope" with a green checkmark is a positive signal. A blank table with no explanation feels like a loading failure.

### Loading States Must Be Explicit

Security dashboards often aggregate data from multiple scanners with different latencies. Show per-widget loading states ("Scanning data loading..." with a spinner on that widget) rather than blocking the entire page. Stale data with a "last updated: 3 minutes ago" timestamp is better than a loading screen.

### Dense but Not Cluttered

AppSec users want density — they're comfortable with information-rich screens. But density requires structure: clear grid alignment, consistent spacing, visual grouping with borders or background color, and sufficient contrast between adjacent widgets.

**Dense and well-structured:** Professional. Information flows in a clear visual hierarchy.

**Dense and unstructured:** Chaotic. Information competes for attention with no clear reading order.

The difference is alignment, spacing, and grouping — not reducing the amount of information shown.
