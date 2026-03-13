---
title: Map Every Trust Boundary Where Trust Level Changes
impact: CRITICAL
impactDescription: Missing trust boundaries are where real vulnerabilities live — unmapped boundaries mean unvalidated attack surfaces
tags: trust boundary, data flow, validation, architecture, attack surface
---

## Map Every Trust Boundary Where Trust Level Changes

A trust boundary is a line where the level of trust changes. Data crossing a trust boundary requires validation because the sender is less trusted than the receiver. Draw them explicitly — if a boundary is not mapped, it will not be analyzed, and vulnerabilities at that boundary will be missed.

**Incorrect (no trust boundaries, just a component list):**

```markdown
# Architecture
- Frontend (React)
- API Gateway (Kong)
- Backend Services (Node.js)
- Database (PostgreSQL)
- Cache (Redis)
- Message Queue (RabbitMQ)
```

A component list without trust boundaries tells you nothing about where validation must occur. Every arrow between components that crosses a trust level change is an attack surface — and none are identified here.

**Correct (explicit trust boundary map):**

```markdown
# Trust Boundary Map

UNTRUSTED                    TRUST BOUNDARY                 TRUSTED
─────────────────────────────────────────────────────────────────────
Internet users          →    [API Gateway + Rate Limit] →   Backend API
Browser JS              →    [CORS + CSRF Token]        →   State-Changing Endpoints
API request body        →    [JSON Schema Validation]   →   Business Logic
Business logic          →    [Parameterized Queries]    →   PostgreSQL
External webhook data   →    [Signature Verification]   →   Event Processing
User-uploaded files     →    [Type Check + AV Scan]     →   File Storage/Processing
Inter-service calls     →    [mTLS + JWT Validation]    →   Internal Microservices
Admin API endpoints     →    [Role-Based Auth Check]    →   Admin Functions
Config from env vars    →    [Startup Validation]       →   Runtime Configuration

## Boundary Detail: API Gateway → Backend API

- **What crosses:** HTTP requests with user-supplied headers, query params, body
- **Validation present:** Rate limiting (100 req/min), JWT signature check,
  request size limit (10MB)
- **What is NOT validated here:** Request body content, authorization for
  specific resources, business logic constraints
- **If bypassed:** Direct access to all backend endpoints without rate limiting
  or authentication
```

For each boundary, document three things: what crosses it, what validation exists at the crossing, and what happens if that validation is bypassed or absent. The third question is the one that reveals vulnerabilities.
