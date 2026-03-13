---
title: Vulnerability Explorer — Power-User Investigation Tool
impact: HIGH
impactDescription: A well-designed explorer handles triage of thousands of findings without pagination confusion or performance degradation
tags: screen-design, explorer, vulnerability, filtering, triage, bulk-actions
---

## Vulnerability Explorer — Power-User Investigation Tool

The power-user investigation tool. Heavy filtering, sorting, grouping, and export.

### Filter Bar (Persistent, Always Visible)

- **Severity:** Critical / High / Medium / Low / Info (multi-select)
- **Status:** Open / In Progress / Resolved / Suppressed / Won't Fix
- **Category:** Code vuln / Dependency / Secret / Misconfig / Runtime
- **Source:** SAST / DAST / SCA / Secret scan / Cloud config / Manual
- **Environment:** Production / Staging / Development
- **Team / Owner**
- **Age:** < 7d / 7-30d / 30-90d / > 90d
- **SLA:** On track / At risk / Breached
- **Free text search** across title, description, CWE, CVE

The filter bar should show active filters as removable chips. "Clear all" must be one click.

### Table Columns (Configurable)

- Severity icon + Finding title
- Service / Repo
- CWE / CVE identifier
- First seen / Last seen
- SLA status
- Owner / Assigned to
- Status

**Group by:** severity, service, team, category, CWE — user's choice.

### Bulk Actions

Assign, change status, suppress, export selection, create tickets for selection.

### Interaction Details

Row click → issue detail page (or slide-over panel to maintain explorer context).

**Key UX detail:** When entering the explorer from a dashboard card click, pre-populate the filters to match the card's context. "Critical vulns: 37" should open the explorer with severity=Critical already applied, showing exactly those 37 items. The user should never have to re-apply filters they already implicitly selected.

**Incorrect (context lost on navigation):**

```text
User clicks "Critical: 37" on overview
→ Explorer opens with all filters cleared
→ Shows 2,847 total findings
→ User manually selects Severity: Critical
→ Now sees the 37 they expected
```

**Correct (context preserved on navigation):**

```text
User clicks "Critical: 37" on overview
→ Explorer opens with chip: [Severity: Critical ×]
→ Shows exactly 37 findings
→ User can add more filters or clear to broaden
```

### Performance Requirements

- The explorer must handle 10,000+ findings without pagination confusion
- Virtual scrolling or progressive loading preferred over traditional page-based pagination
- Filter changes should update results within 200ms
- URL state: filter configuration encoded in URL for deep-linking and sharing
