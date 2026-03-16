---
title: Engineer Persona — Scoped, Actionable Work Queues
impact: CRITICAL
impactDescription: Engineers who can't find "what's blocking my deploy" in 5 seconds will ignore the dashboard entirely
tags: persona, engineer, work-queue, release-safety, action-centric
---

## Engineer Persona — Scoped, Actionable Work Queues

Engineering dashboards must be action-centric and tightly scoped to "my stuff." Engineers don't care about the org's risk posture — they care about what's blocking their release and what they need to fix this sprint.

### Questions They Need Answered

- "Do I have any security work that's actually blocking me or my releases?"
- "What do I need to fix this sprint, and what can wait?"
- "Where is this issue coming from (dependency, config, code path) and how do I resolve it?"
- "Is security posture for my services getting better as I ship?"

### Interaction Style

- Default scope is "my team / my services" — org-wide views are secondary or hidden
- Emphasis on inline actions: create PR, open ticket, re-run scan — directly from the dashboard
- Less dense metrics, more simple badges, sorted lists, and diff-over-time on services they own
- Remediation guidance inline — don't make them leave the dashboard to figure out how to fix something
- "Is it safe to deploy?" must be answerable in under 3 seconds

### Design Implications

Engineers have low patience for security UIs. If the dashboard doesn't immediately show them what to do and how to do it, they'll ignore it. Every extra click between "I see the problem" and "I'm fixing the problem" is friction that reduces adoption.

**Incorrect (org-wide firehose as default):**

```text
Dashboard loads → 2,847 total findings across all services
Engineer thinks: "Which of these are mine? How do I filter? Never mind."
```

Starting from the org view and requiring engineers to filter down to their scope guarantees low adoption. They'll get their security info from Slack messages and PR comments instead.

**Correct (pre-scoped to "my stuff"):**

```text
Dashboard loads → "Your Services (3)"
  auth-service: 2 critical (blocking deploy) ← fix these
  user-api: 1 high (due in 5 days)
  payments: ✓ clean

Work Queue (4 items):
  1. SQL injection in auth-service/login.ts:47  [View Code] [Create PR]
  2. Outdated dependency: lodash 4.17.20         [View Fix] [Auto-update]
  ...
```

Pre-scoped, sorted by priority, with inline actions. The engineer knows exactly what to do within seconds.

### Key Principle

The engineer's dashboard is a work queue, not an analytics platform. Optimize for time-to-action, not information density. Every extra click between "I see the problem" and "I'm fixing the problem" is friction that reduces adoption. If engineers only visit when forced, the dashboard has failed.
