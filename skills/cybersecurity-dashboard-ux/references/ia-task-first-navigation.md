---
title: Task-First Navigation — Mirror Jobs-to-Be-Done
impact: CRITICAL
impactDescription: Intent-based navigation reduces time-to-answer by eliminating "which tab has what I need" guessing
tags: information-architecture, navigation, jobs-to-be-done, task-first
---

## Task-First Navigation — Mirror Jobs-to-Be-Done

Top-level navigation should mirror what users are trying to accomplish, not how data is structured internally. Security practitioners have five primary jobs:

```text
Monitor    — "What's the current state?"
Investigate — "What happened and why?"
Fix         — "What do I need to do?"
Configure   — "How do I set policies and rules?"
Report      — "What do I tell stakeholders?"
```

**Incorrect (data-category navigation):**

```text
Nav: [Dashboard] [Findings] [Assets] [Scans] [Settings]
```

"Findings" and "Assets" are data categories. A user investigating a production incident has to decide: is the incident a "finding" or does it relate to an "asset"? The navigation forces data-model thinking instead of task thinking.

**Correct (task-first navigation):**

```text
Nav: [Monitor] [Investigate] [Fix] [Configure] [Report]

Monitor → Overview dashboard, health status, coverage metrics
Investigate → Explorers (vulnerability, incident, audit log)
Fix → Work queues, remediation guides, PR/ticket creation
Configure → Policies, scan settings, integrations, notification rules
Report → Executive summaries, compliance reports, trend analysis
```

Each nav item maps to a clear user intent. The same underlying data (findings, assets, scans) appears in multiple sections, surfaced differently based on the task context.

### Role-Based Entry Points

Even with task-first navigation, different personas enter at different points:
- **AppSec** lands on Monitor → the situation room
- **Engineers** land on Fix → their work queue
- **Executives** land on Report → posture summaries
- **Platform teams** land on Configure → policy management

The navigation structure is the same for all roles. The default landing page adapts. This keeps the mental model consistent while optimizing each persona's first-click experience.
