---
title: Inline Actions Reduce Context-Switching
impact: MEDIUM
impactDescription: Every navigation away from the dashboard is a potential drop-off point — inline actions keep users in flow
tags: interaction, inline-actions, context-switching, triage, workflow
---

## Inline Actions Reduce Context-Switching

Every action that can be taken from the current view should be available from the current view. The fewer times the user leaves the dashboard, the more they'll use it.

### Actions That Must Be Inline

- **"Create ticket"** should open a pre-filled modal, not navigate to Jira
- **"View in code"** should open a code panel or new tab, not leave the dashboard
- **"Re-scan"** should trigger immediately with a toast confirmation
- **"Assign"** should open a quick-assign dropdown, not a full form
- **"Suppress"** should require a reason (dropdown or free text) but stay inline
- **"Create PR"** should pre-fill with remediation and open in new tab

### Bulk Actions in Explorers

For triage at scale, AppSec users need to act on multiple findings simultaneously:
- Select multiple findings (checkbox column + shift-click for range)
- Bulk assign to a team/person
- Bulk change status (suppress, won't fix, in progress)
- Bulk create tickets (one per finding or grouped)
- Bulk export (CSV, PDF for reporting)

**Incorrect (action requires leaving context):**

```text
Finding row → [Assign] button → navigates to /assign?finding=abc-123
  → Full page form with fields
  → Submit → redirects back to explorer
  → Explorer has lost scroll position and filter state
```

**Correct (action stays in context):**

```text
Finding row → [Assign] button → dropdown appears inline
  → Select team member from dropdown
  → Toast: "Assigned to @engineer"
  → Row updates in place with new assignee
  → Explorer state (scroll, filters) unchanged
```

### Keyboard Shortcuts for Power Users

AppSec analysts triage hundreds of findings. Keyboard navigation dramatically accelerates workflows:
- `j` / `k` — next / previous finding
- `e` — expand finding detail (slide-over)
- `a` — assign
- `s` — suppress (with reason prompt)
- `/` — focus search
- `?` — show keyboard shortcuts help

Don't require keyboard shortcuts — they're a power-user accelerator. Show a "Keyboard shortcuts" help modal (`?`) for discoverability.
