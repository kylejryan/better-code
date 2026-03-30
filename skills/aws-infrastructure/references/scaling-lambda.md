---
title: Lambda Scaling — Concurrency Limits, Reserved, and Provisioned
impact: HIGH
impactDescription: Prevents one runaway function from starving all others; eliminates cold starts for latency-sensitive paths
tags: lambda, scaling, concurrency, provisioned-concurrency, reserved-concurrency, cold-start, burst
---

## Lambda Scaling — Concurrency Limits, Reserved, and Provisioned

Lambda scales automatically — each concurrent invocation runs in its own execution environment. But there are limits and patterns to understand.

**Incorrect (no concurrency management):**

```typescript
// All functions share the default 1,000 account concurrency limit
// A traffic spike on the background worker starves the API handler
const api = new sst.Api("Api", {
  routes: { "GET /findings": "src/api.handler" },  // No reserved concurrency
});
const queue = new sst.Queue("Queue", {
  consumer: "src/worker.handler",  // Can consume ALL available concurrency
});
// Result: background worker processes 900 messages → API returns 429 errors
```

**Correct (concurrency managed per function):**

```typescript
// Reserve concurrency for critical functions
const api = new sst.Api("Api", {
  routes: {
    "GET /findings": {
      function: {
        handler: "src/api.handler",
        cdk: {
          function: {
            reservedConcurrentExecutions: 500,  // Guaranteed 500 for API
          },
        },
      },
    },
  },
});

// Provisioned concurrency for latency-sensitive endpoints (eliminates cold starts)
// Configure via Lambda console or CDK — use for hot API paths, not async workers

// Background workers use remaining concurrency
const queue = new sst.Queue("Queue", {
  consumer: {
    function: {
      handler: "src/worker.handler",
      cdk: {
        function: {
          reservedConcurrentExecutions: 200,  // Capped — won't starve API
        },
      },
    },
  },
});
```

**Key numbers:**
- Account concurrency limit: 1,000 default (request increase to 3,000-10,000+ for production)
- Burst limit: 3,000 immediate (us-east-1), then 500/minute growth
- Reserved concurrency: guaranteed portion of account limit for critical functions
- Provisioned concurrency: pre-warmed environments, eliminates cold starts — use for API handlers, NOT async workers

**Cost scaling:** Lambda charges per request ($0.20/million) + per GB-second. At > 1M requests/day sustained, compare Lambda cost to Fargate. Lambda's per-request premium becomes significant at steady-state high throughput.
