---
title: Serverless API Pattern — API Gateway + Lambda + DynamoDB
impact: CRITICAL
impactDescription: The foundational pattern for 90% of serverless APIs, determines latency and cost baseline
tags: api, api-gateway, lambda, serverless, http-api, rest-api, sst
---

## Serverless API Pattern — API Gateway + Lambda + DynamoDB

The foundational pattern for most serverless APIs: API Gateway HTTP API receives requests, Lambda functions handle business logic, and DynamoDB or Aurora stores data. Async operations flow through SQS to worker Lambdas. The key decisions are HTTP API vs REST API, ARM64 vs x86, memory sizing, and timeout configuration — each has significant cost and performance implications.

**Incorrect (REST API with oversized Lambda defaults):**

```typescript
// REST API costs more, higher latency, and these Lambda defaults waste money
const api = new sst.Api("Api", {
  defaults: {
    function: {
      timeout: "900 seconds",   // Max timeout — if something takes 15 min, it's not an API call
      memory: "3008 MB",        // Overpaying for memory you don't use
      architecture: "x86_64",   // 20% more expensive than ARM64
      runtime: "nodejs18.x",    // Outdated runtime
    },
  },
  // REST API when HTTP API would suffice
  cdk: {
    httpApi: undefined,
    restApi: { /* ... */ },
  },
  routes: {
    "GET /findings": "packages/functions/src/findings/list.handler",
  },
});
```

**Correct (HTTP API with right-sized defaults):**

```typescript
const api = new sst.Api("Api", {
  defaults: {
    function: {
      timeout: "30 seconds",
      memory: "512 MB",
      architecture: "arm64",        // 20% cheaper, better performance
      runtime: "nodejs20.x",
    },
  },
  routes: {
    "GET /findings":      "packages/functions/src/findings/list.handler",
    "GET /findings/{id}": "packages/functions/src/findings/get.handler",
    "POST /findings":     "packages/functions/src/findings/create.handler",
  },
});
```

**Key decisions:**
- HTTP API (not REST API) — cheaper, faster, sufficient for most use cases. REST API only if you need request validation, API keys, or usage plans.
- ARM64 architecture — 20% cheaper than x86, often faster for Node.js/Python workloads.
- Memory: start at 512MB. Lambda CPU scales proportionally with memory. For CPU-bound functions, increasing memory to 1024-1769MB often REDUCES cost because the function runs faster.
- Timeout: set to the actual expected duration + buffer, not the max (900s). A function stuck for 900 seconds costs money and holds concurrency.
