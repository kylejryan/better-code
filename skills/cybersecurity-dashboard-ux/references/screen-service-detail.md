---
title: Service Detail Page — Shared, Role-Adapted Deep View
impact: HIGH
impactDescription: The service detail page is the convergence point for both personas — getting it wrong fragments the experience
tags: screen-design, service-detail, role-adaptive, findings, coverage
---

## Service Detail Page — Shared, Role-Adapted Deep View

Shared between personas but with different emphasis. This is the deep view of a single service/application.

### Header (Universal)

- Service name, owning team, environment, business criticality tier
- Overall health badge
- Last scan timestamp and scan type indicators
- Quick actions: re-scan, view repo, view deployment

### For AppSec Viewers — Full Signal Density

- Risk score trend chart (30/60/90 day)
- Findings table grouped by category (vuln, secret, misconfig) with full severity, CWE, first seen, SLA status
- Coverage status: which scans are active, when they last ran, any failures
- Related incidents and alerts
- Policy compliance status

### For Engineer Viewers — Simplified, Action-Oriented

- Same data, but with simplified language (no raw CWE IDs unless expanded, plain-English descriptions)
- Findings sorted by "what to fix first" with inline remediation hints
- "Autofix available" badges on findings that have automated remediation
- Direct links: "View in code" / "See diff" / "Open PR"
- Learning hints: for recurrent patterns, show a brief explanation and link to docs

### Implementation Approach

This can be the same page with a role-based toggle or with the engineer view as the default and an "advanced view" expansion for AppSec. Don't build two separate pages — the data is the same; the presentation layer adapts.

**Incorrect (two separate pages):**

```text
/services/auth-service/security    ← AppSec version
/services/auth-service/findings    ← Engineer version
```

Two pages with overlapping data that drift out of sync. Maintenance burden doubles. Links shared between personas break expectations.

**Correct (one page, adaptive presentation):**

```text
/services/auth-service

Default view: Engineer-friendly
  - Plain English descriptions, "fix first" sorting, inline remediation
  [Toggle: Advanced View]
  - Full CWE/CVE IDs, risk scoring breakdown, compliance mapping, coverage details
```

One URL, one source of truth. The presentation adapts to the viewer's needs. Deep links work for both personas.
