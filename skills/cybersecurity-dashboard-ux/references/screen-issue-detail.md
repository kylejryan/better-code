---
title: Issue Detail Page — Deep-Linkable, Full Context
impact: HIGH
impactDescription: The issue detail page is where findings become actionable — missing context here means engineers can't fix the problem
tags: screen-design, issue-detail, remediation, evidence, deep-link
---

## Issue Detail Page — Deep-Linkable, Full Context

The deepest level. Full context for a single finding.

### Structure

**Header:** Severity badge, title, status, SLA countdown, assigned owner

**Summary:** 2-3 sentence plain-English explanation of what this is and why it matters. Not a CWE description dump — a contextual explanation: "This SQL injection in the login handler allows unauthenticated attackers to extract user credentials from the database."

**Evidence:** The specific code location (file, line, function), the vulnerable pattern, and — if available — the data flow trace from source to sink. Syntax-highlighted code snippet with the vulnerable line marked.

**Impact:** What an attacker could do if this is exploited, calibrated to the deployment context. "In production, this endpoint is internet-facing and handles authentication, making this a critical-severity finding."

**Remediation:** Specific fix guidance with code example. Not "use parameterized queries" in the abstract — show the fix applied to THIS code. If autofix is available, one-click "Apply fix" button.

**Timeline:** When first detected, scan history, status changes, comments, related PRs/commits.

**Related Findings:** Other findings in the same service, same CWE class, or same code area. Helps the engineer fix a cluster of related issues in one pass.

**Actions:** Change status, assign, create ticket, link PR, suppress (with required reason), re-scan.

### Deep-Linking Requirement

The issue detail page must be deep-linkable (unique URL). Engineers share finding links in Slack, PRs, and tickets. If the detail page requires session state or navigation context to reach, it fails this use case.

**Incorrect:**

```text
/explorer?selected=finding-abc-123
```

Finding detail lives as a modal overlay on the explorer. Sharing this URL opens the explorer, not the finding. The finding context is lost if the explorer state changes.

**Correct:**

```text
/findings/finding-abc-123
```

Standalone URL that loads the full finding detail regardless of how the user arrived. Can be shared, bookmarked, linked from tickets, and opened in new tabs.

### Remediation Quality

Generic remediation is barely better than no remediation. The fix guidance must be specific to the actual code.

**Incorrect:** "Use parameterized queries to prevent SQL injection."

**Correct:** "In `auth-service/src/handlers/login.ts:47`, replace the string-concatenated query with a parameterized query: `db.query('SELECT * FROM users WHERE email = $1', [email])` instead of `db.query('SELECT * FROM users WHERE email = ' + email)`."
