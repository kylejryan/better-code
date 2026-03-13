---
title: Model the Unauthenticated Remote Attacker Profile
impact: HIGH
impactDescription: Most critical attack vector — internet-facing surface with no access prerequisites
tags: attacker profile, remote attacker, unauthenticated, external, attack narrative
---

## Model the Unauthenticated Remote Attacker Profile

The unauthenticated remote attacker has the largest attack surface with the lowest barrier to entry. They can send arbitrary requests to any publicly exposed endpoint. Modeling this profile first establishes the baseline of what is reachable without any credentials or internal access.

**Incorrect (generic attacker description):**

```markdown
# Attacker Profile: External

An external attacker may attempt to exploit vulnerabilities in the
application. They could try SQL injection, XSS, CSRF, and other
OWASP Top 10 attacks against the web application.
```

This is a list of attack categories, not an attacker profile. It does not define starting position, goals, or realistic paths. You cannot use this to evaluate whether a specific finding is exploitable — it just says "attacks might happen."

**Correct (specific attacker narrative):**

```markdown
# Attacker Profile: Unauthenticated Remote Attacker

## Starting Position
- Can reach any endpoint exposed through the public load balancer
  (ports 443/tcp confirmed via DNS: api.example.com, app.example.com)
- Can send arbitrary HTTP requests with crafted headers, cookies,
  query parameters, and request bodies
- Can register new accounts via the public signup flow
- Cannot access internal services, databases, or admin endpoints directly

## Target (Crown Jewels)
Primary: Patient PHI records (highest breach impact)
Secondary: OAuth refresh tokens (enables persistent access)

## Attack Paths

### Path 1: Public API → Authentication Bypass → PHI Access
1. Enumerate public API endpoints via OpenAPI spec (publicly served)
2. Test JWT validation: algorithm confusion, expired token replay,
   missing audience check
3. If auth bypass achieved: access patient records API directly

### Path 2: Account Registration → Privilege Escalation → PHI Access
1. Register legitimate account via public signup
2. Exploit IDOR in patient record endpoints (sequential IDs observed)
3. Access records belonging to other organizations

### Path 3: File Upload → Server-Side Processing → RCE
1. Upload crafted file via patient document upload endpoint
2. Exploit file processing (ImageMagick, PDF parsing) for code execution
3. Pivot from application server to database containing PHI

## Impact Ceiling
Whatever the public-facing application can do — limited by application
permissions, not attacker skill. If the app server has database read
access to all PHI, a successful RCE grants access to all PHI.
```

Each path is a testable hypothesis. During vulnerability analysis, you trace these paths through the code to determine which are viable and which are blocked by existing controls.
