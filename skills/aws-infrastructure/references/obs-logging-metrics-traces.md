---
title: Observability — Structured Logging, Metrics, Traces, and Alarms
impact: HIGH
impactDescription: Enables rapid incident diagnosis; structured logs reduce MTTR by 50-80% vs unstructured
tags: observability, logging, metrics, traces, x-ray, cloudwatch, alarms, powertools
---

## Observability — Structured Logging, Metrics, Traces, and Alarms

### Structured JSON Logging

**Incorrect (unstructured console.log):**

```typescript
// Unstructured — impossible to query, filter, or alert on
export const handler = async (event) => {
  console.log("Processing request");
  console.log("User: " + userId);
  console.log("Error: " + error.message);
};
```

**Correct (structured JSON with AWS Lambda Powertools):**

```typescript
import { Logger } from "@aws-lambda-powertools/logger";

const logger = new Logger({ serviceName: "findings-api" });

export const handler = async (event) => {
  logger.info("Processing request", {
    path: event.path,
    method: event.httpMethod,
    userId: event.requestContext.authorizer?.claims?.sub,
  });
  // Structured output: {"level":"INFO","message":"Processing request","path":"/findings",...}
};
```

### X-Ray Distributed Tracing

```typescript
new sst.Function("Handler", {
  handler: "src/handler.main",
  tracing: "active",  // Enable X-Ray — traces Lambda → DynamoDB → SQS → Lambda chains
});
```

### Alarms That Matter

**P1 (page someone):**
- API 5xx error rate > 1% for 5 minutes
- Lambda function error rate > 5% for 5 minutes
- DLQ message count > 0 (failed processing that won't self-heal)
- DynamoDB throttling > 0 sustained
- Certificate expiration < 7 days

**P2 (Slack alert, next business day):**
- API p99 latency > 3x baseline for 15 minutes
- Lambda concurrent executions > 80% of account limit
- DynamoDB consumed capacity > 80% of provisioned
- Monthly cost > 80% of budget

**P3 (dashboard review):**
- Lambda cold start rate
- Cache hit rate
- Queue processing latency
- Deployment frequency and rollback rate

Don't alarm on everything — alarm on what indicates user-facing impact.
