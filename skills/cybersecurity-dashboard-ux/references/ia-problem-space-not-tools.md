---
title: Organize by Problem Space, Not by Tool
impact: CRITICAL
impactDescription: Tool-based navigation forces users to think in scanner taxonomy instead of security questions
tags: information-architecture, navigation, mental-model, organization
---

## Organize by Problem Space, Not by Tool

Group information by what the user is trying to understand — vulnerabilities, secrets, misconfigurations, threats, compliance gaps — never by which scanner or tool produced the data. Users don't think "what did my SAST find?" They think "what vulnerabilities do I have?"

**Incorrect (organized by scanner/tool):**

```text
Nav: [SAST] [DAST] [SCA] [Secrets] [Cloud Config] [Container Scan]
```

This forces users to visit six tabs to answer "do I have any critical findings?" It also breaks when tools overlap (SCA and SAST both find code vulnerabilities) and when new tools are added (where does API security scanning go?).

**Correct (organized by problem space):**

```text
Nav: [Vulnerabilities] [Secrets] [Misconfigurations] [Threats] [Compliance]
```

Each tab answers a security question. The underlying data source is an implementation detail — vulnerabilities from SAST, DAST, and SCA are unified in one view. Adding a new scanner doesn't change navigation.

### Task-First Variant

For top-level navigation, mirror jobs-to-be-done, not data categories:

```text
Monitor    — "What's the current state?"
Investigate — "What happened and why?"
Fix         — "What do I need to do?"
Configure   — "How do I set policies and rules?"
Report      — "What do I tell stakeholders?"
```

Each nav item maps to a clear user intent. Users should never wonder "which tab has the thing I'm looking for?" because the tabs are named after what they're trying to accomplish.

### The Litmus Test

If a user asks "where do I see my critical vulnerabilities?" and the answer requires them to check multiple tabs, the navigation is organized by tool, not by problem. Reorganize until every user question maps to exactly one navigation path.
