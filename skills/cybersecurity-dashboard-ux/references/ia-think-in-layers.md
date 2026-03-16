---
title: Think in Layers — Progressive Specificity from Overview to Detail
impact: CRITICAL
impactDescription: Flat navigation forces users to context-switch between summary and detail, destroying triage speed
tags: information-architecture, layers, navigation, drill-down, progressive-disclosure
---

## Think in Layers — Progressive Specificity from Overview to Detail

Structure information as: Overview → Lens (role or object) → Explorer → Detail. Each layer increases specificity and decreases scope.

```text
Layer 1: Org Overview (AppSec Home)
  ├── Risk posture, coverage, alerts, key trends
  └── Entry point to everything — the "situation room"

Layer 2: Role-Based Lenses
  ├── AppSec Lens: risk + coverage + incident queues
  └── Engineering Lens: "my services" + work queue + release readiness

Layer 3: Object-Centric Views
  ├── Service/application detail page
  ├── Repository detail page
  └── Environment detail page
  └── All security signals attached to that specific object

Layer 4: Explorers (Power User)
  ├── Vulnerability explorer
  ├── Incident explorer
  ├── Configuration explorer
  └── Audit log explorer
  └── Full filtering, sorting, grouping, export

Layer 5: Issue Detail
  └── Single finding with full context, evidence, timeline, remediation
```

**Incorrect (flat navigation — everything at the same level):**

```text
Nav: [Vulnerabilities] [Services] [Incidents] [Config] [Reports]
```

Every section is a peer. Users bounce between tabs to build context. No progressive narrowing. The overview and the detail compete for the same screen.

**Correct (layered navigation — progressive narrowing):**

```text
Layer 1: Overview dashboard → shows risk posture, top risks, coverage
  ↓ click "Critical: 12"
Layer 4: Explorer → 12 critical vulns, filterable, sortable
  ↓ click a finding
Layer 5: Detail → full context, evidence, remediation, actions
  ↑ breadcrumb: Overview > Critical Vulnerabilities > SQL Injection in auth-service
```

Each layer answers a more specific question. Users drill in for detail and pop back out for context. The breadcrumb trail maintains orientation.

### Implementation Rule

Every screen must know its layer. Layer 1-2 screens show aggregates and trends. Layer 3 screens show all signals for one object. Layer 4 screens are searchable/filterable tables. Layer 5 screens are single-item deep views. If a screen tries to be two layers at once, it serves neither purpose well.
