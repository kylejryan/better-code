---
title: Comprehensive Security Dashboard Design Checklist
impact: MEDIUM
impactDescription: Systematic verification prevents shipping screens that fail core usability benchmarks
tags: checklist, design-review, quality-assurance, verification
---

## Comprehensive Security Dashboard Design Checklist

Use this checklist before shipping any security dashboard screen. Skipping checklist items leads to screens that feel broken for one or both personas.

**Incorrect (shipped without checklist — fails both personas):**

```text
Overview screen shows:
- 2,847 findings (no severity breakdown, no trend)
- All services listed (no scoping to "my services")
- Static numbers (no drill-down, no click targets)
- No timestamps (data could be 3 days stale)
- Red brand buttons competing with red severity badges
Result: AppSec can't assess posture. Engineers can't find their work. Nobody uses it.
```

**Correct (checklist-verified — serves both personas):**

```text
Overview screen shows:
- Severity breakdown with trends: Crit 37 ↑12 | High 142 ↓8
- Role-based defaults: engineer sees "My Services (3)"
- Every card is clickable → pre-filtered explorer
- "Last scanned: 4 min ago" per widget
- Severity colors reserved for severity only
Result: AppSec assesses posture in 10s. Engineers find blockers in 5s.
```

### Persona Clarity

- [ ] Every widget has a clear primary persona (AppSec or Engineer)
- [ ] Engineers see their own services by default, not the whole org
- [ ] AppSec has org-wide views with slicing by team, env, and severity
- [ ] Role-based defaults are set; users can expand scope, not reduce from firehose

### Information Hierarchy

- [ ] The single most important question per screen is answered in the top-left quadrant
- [ ] Every metric that can trend shows its trend (arrow, sparkline, delta)
- [ ] Severity colors are used consistently and exclusively for severity
- [ ] Empty states, loading states, and error states are all designed (not afterthoughts)

### Drill-Down Integrity

- [ ] Every summary card, chart segment, and table row has a clear drill-down target
- [ ] Drill-down pre-applies filters matching the source context
- [ ] Breadcrumbs and filter chips show "you are here" at every level
- [ ] "Back" and "reset filters" are always available
- [ ] Every view is deep-linkable via URL

### Action Density

- [ ] Inline actions (create ticket, open PR, re-scan, assign) are available without leaving the current view
- [ ] Work queue items link directly to code locations and remediation guidance
- [ ] Bulk actions are available in explorer views for triage at scale
- [ ] "Is it safe to deploy?" is answerable in under 3 seconds from the engineering home

### Data Integrity

- [ ] Organized by problem space (vulns, secrets, misconfigs) not by tool/scanner
- [ ] Top-level navigation mirrors jobs-to-be-done (Monitor, Investigate, Fix, Configure, Report)
- [ ] Scan freshness timestamps are visible — users must know when data was last updated
- [ ] Per-widget loading states, not full-page blocking

### Usability Benchmarks

- [ ] A new AppSec hire can find "top 5 riskiest services" within 10 seconds of landing
- [ ] An engineer can find "what's blocking my deploy" within 5 seconds of landing
- [ ] The explorer handles 10,000+ findings without pagination confusion or performance degradation
- [ ] Keyboard shortcuts exist for high-frequency triage actions
- [ ] Saved/bookmarked views reduce repetitive filter setup

### The Ultimate Test

A security dashboard succeeds when users open it proactively — not because an alert forced them to, but because it's the fastest way to understand their security posture and take action. If users only visit when something is already on fire, the dashboard has failed as a daily tool.
