---
title: Drill-Down Navigation Chains — Consistent, Predictable Patterns
impact: HIGH
impactDescription: Inconsistent drill-down behavior destroys user muscle memory and slows triage
tags: drill-down, navigation, filters, breadcrumbs, deep-linking
---

## Drill-Down Navigation Chains — Consistent, Predictable Patterns

Consistent, predictable drill-down chains across cards, charts, and tables. Users should develop muscle memory for how navigation works.

### From Overview Cards

"Critical vulns: 37" → vulnerability explorer pre-filtered to severity=critical, time range=selected.
"Coverage gaps: 12" → service list filtered to uncovered services.
"SLA breaches: 5" → explorer filtered to SLA=breached.

**Rule:** Card click → explorer with matching filters pre-applied.

### From Trend Charts

Vuln count over time → click a spike → list of new/changed issues in that time window → click an issue → issue detail page.

**Rule:** Chart click → filtered list for that data point → item click → detail.

### From Segmentation Charts

Risk by team/app/env → click a slice/bar → filtered service list → click service → service detail.

**Rule:** Segment click → filtered list for that segment → item click → detail.

### From Tables

Any row click → detail page with full context (evidence, timeline, related entities, proposed fixes).

**Rule:** Row click → detail. No ambiguity about what clicking a row does.

### UX Rules for Drill-Down

1. **Always show "you are here" context:** Breadcrumbs and filter chips showing what's currently applied
2. **Consistent interactions:** Click card → explorer; click chart point → filtered list; click row → detail
3. **Keep drill-down in-place when possible:** Slide-over panels and modals maintain parent context
4. **Always provide navigation affordances:** "Back to [previous scope]" and "reset filters" available at every level
5. **Deep links for every view:** Any filtered explorer state or detail page must be shareable via URL

### Anti-Pattern: Context Loss

The most common drill-down failure is losing context on navigation.

**Incorrect (context lost on drill-down):**

```text
User on Overview (time range: Last 7 days)
  → Clicks "Critical: 37"
  → Explorer opens: time range reset to "All time", no severity filter
  → Shows 2,847 findings across all severities and dates
  → User must manually re-apply: severity=Critical, time=7d
  → URL: /explorer (no filter state encoded)
```

**Correct (context preserved through drill-down chain):**

```text
User on Overview (time range: Last 7 days)
  → Clicks "Critical: 37"
  → Explorer opens with chips: [Last 7 days ×] [Severity: Critical ×]
  → Shows exactly 37 critical findings from the last 7 days
  → Breadcrumb: Overview > Critical Vulnerabilities
  → URL: /explorer?timeRange=7d&severity=critical (shareable)
```

Every drill-down must preserve the context that triggered it. Filters, time ranges, and scope selections carry forward. The user adds specificity going deeper; they should never have to re-establish context they already selected.
