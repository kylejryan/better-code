---
title: API Security — Default-Deny Authentication and Protection
impact: CRITICAL
impactDescription: Prevents unauthorized access to API routes; default-deny means forgetting auth = protected, not exposed
tags: api, authentication, authorization, jwt, waf, throttling, api-gateway
---

## API Security — Default-Deny Authentication and Protection

All routes require auth by default. Public routes explicitly opt out. This is security by default — forgetting to add auth means the route is protected, not exposed.

**Incorrect (default-allow, auth opt-in):**

```typescript
// No default authorizer — every route is public unless you remember to add auth
// Forgetting auth on a route = data exposed to the internet
const api = new sst.Api("Api", {
  routes: {
    "GET /findings": "packages/functions/src/findings/list.handler",      // PUBLIC — oops
    "POST /findings": "packages/functions/src/findings/create.handler",   // PUBLIC — oops
    "GET /health": "packages/functions/src/health.handler",               // PUBLIC — intended
  },
});
```

**Correct (default-deny, public routes opt out):**

```typescript
const api = new sst.Api("Api", {
  defaults: {
    authorizer: "jwt",  // ALL routes require auth by default
  },
  authorizers: {
    jwt: {
      type: "jwt",
      jwt: {
        issuer: "https://auth.example.com",
        audience: ["api.example.com"],
      },
    },
  },
  routes: {
    // Authenticated routes (default — no extra config needed)
    "GET /findings": "packages/functions/src/findings/list.handler",
    "POST /findings": "packages/functions/src/findings/create.handler",

    // Public routes (explicitly opt out)
    "GET /health": {
      function: "packages/functions/src/health.handler",
      authorizer: "none",
    },
  },
});
```

**Additional API protections:**
- **WAF** on API Gateway for rate limiting, geo-blocking, and common attack patterns (SQL injection, XSS in headers)
- **Throttling:** set per-route and per-API rate limits to prevent abuse
- **Request validation:** validate request body against JSON schema at API Gateway level (before Lambda runs — saves cost and reduces attack surface)
