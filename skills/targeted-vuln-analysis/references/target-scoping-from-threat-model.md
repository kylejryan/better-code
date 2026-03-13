---
title: Scope Analysis Targets From the Threat Model Priority List
impact: CRITICAL
impactDescription: Without scoping from the threat model, analysis defaults to breadth-first scanning — the root cause of noise
tags: target-selection, threat-model, scoping, prioritization, attack-surface
---

## Scope Analysis Targets From the Threat Model Priority List

The threat model's attack surface priority list is the input to this phase. Pick the SINGLE highest-priority surface that has not yet been analyzed. Do not attempt to analyze the entire codebase. Depth on one surface produces more value than breadth across ten.

**Incorrect (selecting a target without the threat model):**

```markdown
TARGET: The web application's authentication system
ATTACKER PROFILE: External attacker
ENTRY POINT: Login page
CROWN JEWEL AT RISK: User data
```

This is too vague to drive depth-first analysis. "The authentication system" could mean session management, password hashing, MFA, OAuth, or JWT validation — each requires different analysis techniques. "External attacker" doesn't specify starting position. "User data" doesn't say what data matters.

**Correct (target scoped from threat model):**

```markdown
TARGET: JWT token validation in /api/middleware/auth.ts
ATTACKER PROFILE: Remote unauthenticated attacker with ability to craft HTTP requests
ENTRY POINT: Authorization header parsing in verifyToken() at auth.ts:23
CROWN JEWEL AT RISK: Patient PHI records (crown jewel #1 from threat model)
```

This target is specific enough to trace completely. It names the exact function, the exact attacker capability, and the exact asset at risk. Analysis can start immediately by reading `auth.ts:23`.

**How to extract targets from the threat model:**

1. Read the attack surface priority list (the threat model's final output)
2. For each priority surface, identify the specific code entry point (not the general area)
3. Map it to the attacker profile that can reach it
4. Identify which crown jewel is threatened if this surface is compromised
5. State all four explicitly before beginning analysis

If the threat model's priority list contains broad entries like "API endpoints," break them into specific entry points before selecting one. Each target should be a single, traceable code path.
