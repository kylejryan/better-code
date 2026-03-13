---
title: Examples of Well-Scoped vs Poorly-Scoped Analysis Targets
impact: HIGH
impactDescription: Poorly-scoped targets are the primary cause of breadth-first analysis drift
tags: target-selection, scoping, examples, anti-pattern
---

## Examples of Well-Scoped vs Poorly-Scoped Analysis Targets

A target is well-scoped when you can start tracing code immediately after stating it. If you need to "explore" or "survey" before you can trace, the target is too broad.

**Incorrect (target too broad — will produce shallow breadth-first scanning):**

```yaml
# Each of these targets spans too many code paths to trace deeply
TARGET: The web application's input validation
PROBLEM: "Input validation" spans every endpoint — no single path to trace

TARGET: Authentication and authorization
PROBLEM: Two distinct concerns combined — auth bypass and authz bypass
  require different analysis techniques. Pick one.

TARGET: All API endpoints
PROBLEM: Could be 50+ paths — will produce shallow coverage of each

TARGET: The Python codebase
PROBLEM: Not a target — this is the entire project

TARGET: Security of the database layer
PROBLEM: Includes query construction, connection management, credential
  storage, schema permissions — each is a separate analysis target
```

**Correct (target specific enough to trace immediately):**

```yaml
TARGET: JWT validation in /api/middleware/auth.ts
ATTACKER: Remote unauthenticated (can craft HTTP requests)
ENTRY: verifyToken() at auth.ts:23
CROWN JEWEL: Patient PHI records
QUESTION: Can a forged or manipulated JWT bypass validation?

TARGET: File upload handler path traversal
ATTACKER: Authenticated user (has valid session)
ENTRY: handle_upload() at upload_controller.py:12
CROWN JEWEL: Server filesystem integrity
QUESTION: Can the filename parameter escape the upload directory?

TARGET: GraphQL tenant isolation in patient resolver
ATTACKER: Authenticated user in tenant A
ENTRY: resolvePatient() at resolvers/patient.ts:89
CROWN JEWEL: Cross-tenant patient data
QUESTION: Can tenant A's token access tenant B's records?

TARGET: YAML config import deserialization
ATTACKER: Authenticated admin user
ENTRY: import_config() at api/config.py:34
CROWN JEWEL: Server-side code execution
QUESTION: Does the YAML parser allow arbitrary object instantiation?
```

**Rule of thumb:** If stating the target doesn't immediately suggest which file to open and which function to start reading, it's too broad. Narrow it until it does. If it could take more than 30 minutes of focused analysis, it's too broad.
