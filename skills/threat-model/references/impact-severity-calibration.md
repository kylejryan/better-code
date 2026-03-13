---
title: Calibrate Severity to the Specific System Under Analysis
impact: HIGH
impactDescription: Generic CVSS scores misrank 30-50% of findings — system-specific calibration eliminates false prioritization
tags: impact, severity, calibration, CVSS, context, prioritization
---

## Calibrate Severity to the Specific System Under Analysis

Generic severity ratings (CVSS scores, tool-assigned severities) do not account for the specific system's deployment context, crown jewels, or attacker profiles. A SQL injection is not always critical — it depends on what data the database holds, who can reach the endpoint, and what the injection can actually do. Severity must be calibrated to THIS system before any findings are reported.

**Incorrect (generic severity definitions):**

```markdown
# Severity Ratings

- **Critical**: CVSS 9.0-10.0 — Remote code execution, authentication bypass
- **High**: CVSS 7.0-8.9 — Privilege escalation, data exposure
- **Medium**: CVSS 4.0-6.9 — XSS, CSRF, information disclosure
- **Low**: CVSS 0.1-3.9 — Missing headers, verbose errors
```

These are textbook definitions that apply to no system in particular. A reflected XSS on a static marketing site is informational. The same XSS on a banking portal's session-bearing page is high. CVSS cannot make this distinction — the threat model can.

**Correct (system-calibrated severity):**

```markdown
# Impact Framework: Patient Records SaaS Platform

## Critical (breach-level impact)
- Direct access to PHI database without authorization
  → Regulatory breach, mandatory notification, $50K+/record fines
- Authentication bypass on any internet-facing endpoint
  → Unauthenticated access to patient data
- RCE on application servers with database connectivity
  → Full PHI exfiltration capability
- Compromise of database encryption keys
  → Historical PHI exposure regardless of other controls

## High (significant compromise, constrained)
- Horizontal privilege escalation: Org A accessing Org B data
  → PHI breach scoped to targeted records, not bulk
- Vertical escalation: member → admin role
  → Sharing policy manipulation, user management abuse
- Session fixation or token theft enabling account takeover
  → Persistent unauthorized access until detected
- SSRF with internal network reach
  → Potential pivot to database or cloud metadata

## Medium (limited scope or requires prerequisites)
- Information disclosure: stack traces, internal IPs, config details
  → Reconnaissance value, not direct breach
- Denial of service against API availability
  → Operational impact, no data compromise
- CSRF on non-sensitive state changes (e.g., display preferences)
  → User inconvenience, not security breach
- Timing side channels in authentication
  → Username enumeration, requires follow-up attack

## Low (minimal direct impact)
- Missing security headers on non-sensitive pages
  → Defense-in-depth gap, not exploitable alone
- Outdated library without proven exploit in this context
  → Theoretical risk, no demonstrated impact
- Verbose error messages without sensitive data
  → Minor information leakage

## Informational (not a vulnerability in this context)
- SQL injection in admin-only endpoint where admins have direct DB access
  → Attacker already has the access the vuln would grant
- Path traversal in a tool designed to read the filesystem
  → Expected behavior, not a vulnerability
- "Vulnerabilities" requiring physical access to a cloud-only service
  → Threat not applicable to deployment context
- Missing CSRF protection on GET-only endpoints
  → No state change, CSRF is not applicable
```

The informational category is the most important. It is where false positives live. Every "vulnerability" that requires capabilities the attacker already has, or threatens assets that do not exist in the deployment context, belongs here. Reporting them as real findings wastes everyone's time and erodes trust in the analysis.
