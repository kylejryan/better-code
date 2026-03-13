---
title: Engineering Home ("My Security Work") — The Engineer's Action Center
impact: HIGH
impactDescription: Engineers who can't find their action items in 5 seconds will bypass the dashboard entirely
tags: screen-design, engineering, work-queue, release-safety, action-center
---

## Engineering Home ("My Security Work") — The Engineer's Action Center

The engineer's landing page. Everything is scoped to their services by default.

**Incorrect (org-wide firehose as default):**

```text
Dashboard loads → "All Findings (2,847)"
  Filters: [Severity ▼] [Team ▼] [Service ▼] [Environment ▼]
  Table: finding after finding with no owner context
  Engineer thinks: "Which of these are mine? How do I filter?"
  Result: Engineer closes tab, gets security info from Slack instead.
```

**Correct (pre-scoped to "my stuff" with inline actions):**

```text
Dashboard loads → "Your Services (3)"
  auth-service: 2 critical (blocking deploy)  [View]
  user-api: 1 high (due in 5 days)            [View]
  payments: ✓ clean

  Work Queue (4 items):
  1. SQLi in auth-service/login.ts:47     [View Code] [Create PR]
  2. Outdated lodash 4.17.20              [View Fix]  [Auto-update]
  3. Hardcoded secret in config.ts:12     [Remove]    [Rotate]
  4. TLS 1.1 in staging nginx.conf        [View]      [Snooze]
  Result: Engineer knows exactly what to do within 5 seconds.
```

### Primary Widgets

**My Services Panel**
- List of repos/services the engineer owns
- Each row: service name, small health indicators (vuln count by severity, secrets found, misconfig count, runtime events)
- Color-coded status badge per service: clean (green), issues (yellow), critical (red), unknown/no-scan (gray)
- Click row → service detail page

**Work Queue**
- Prioritized list of fixes assigned to this engineer or their team
- Each item: title, severity, SLA countdown, linked ticket/PR, suggested owner
- Direct action buttons: "View in code" / "Create PR" / "Snooze" / "Won't fix (with reason)"
- Sort by: priority (default), SLA urgency, ease of fix, age

**Release Safety**
- Per-branch or per-build security status
- Clear "safe to deploy" / "blocked" / "warnings" signal
- If blocked: exactly which findings are blocking and what policy they violate
- One-click to view blocking findings

**Security Trend (My Services)**
- Simple line chart: open findings over last 30 days across owned services
- Arrow and delta: "+12 this week" or "-8 this week"
- Positive reinforcement when the trend is down — engineers should feel progress

### Layout

Work queue takes center stage — it's the primary action surface. My services panel on the left as a navigation/context sidebar. Release safety and trend at the top as status indicators.

```text
┌──────────────────────────────────────────────────┐
│  Release: ✓ Safe to deploy    Trend: ↓8 (7d) ✓  │  ← "Am I blocked?"
├──────────────┬───────────────────────────────────┤
│ My Services  │  Work Queue (4 items)             │
│              │                                   │
│ auth-svc  🔴│  1. SQLi in login.ts:47   [Fix]   │  ← "What do I do?"
│ user-api  🟡│  2. lodash 4.17.20       [Update] │
│ payments  🟢│  3. Hardcoded secret     [Remove] │
│              │  4. TLS misconfig        [View]   │
│              │                                   │
└──────────────┴───────────────────────────────────┘
```

### UX Rules for This Screen

- Default scope is "my team / my services" — never start with org-wide
- Work queue items must link directly to code locations
- Inline remediation hints on every work queue item — don't make engineers leave to figure out how to fix
- "Autofix available" badges on findings with automated remediation
- Release safety section must load and render within 3 seconds
- The engineer's first question is "what do I need to do?" — the work queue answers it immediately
