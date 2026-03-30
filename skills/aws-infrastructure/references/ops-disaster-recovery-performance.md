---
title: Operational Patterns — Disaster Recovery, Performance, and Tagging
impact: MEDIUM-HIGH
impactDescription: Enables recovery from data loss in minutes; reduces Lambda cold starts by 50-80%; enables cost allocation by team/service
tags: disaster-recovery, pitr, backups, cold-start, performance, tagging, operational-excellence
---

## Operational Patterns — Disaster Recovery, Performance, and Tagging

### Disaster Recovery

| Resource | Strategy | Recovery |
|----------|----------|----------|
| DynamoDB | PITR (point-in-time recovery) | Restore to any second in last 35 days |
| Aurora | Automated backups (35-day retention) | Cross-region read replicas for DR |
| S3 | Versioning enabled on all data buckets | Cross-region replication for critical data |
| Infrastructure | IaC in git IS the DR plan | Redeploy to new region/account from code |

### Lambda Cold Start Optimization

**Incorrect (maximizing cold start penalty):**

```typescript
// x86 architecture (slower cold start than ARM64)
// Massive deployment package with unused dependencies
// VPC-attached unnecessarily
// No provisioned concurrency on latency-sensitive path
import { everything } from "aws-sdk";  // Imports entire SDK
```

**Correct (minimizing cold start):**

```typescript
// ARM64 (Graviton) — faster cold starts than x86
// Tree-shaken, minimal dependencies
// No VPC unless needed
// Provisioned concurrency on API handlers
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";  // Only what's needed

new sst.Function("ApiHandler", {
  handler: "src/api.handler",
  architecture: "arm64",
  // Provisioned concurrency for latency-sensitive paths
  // (configure via CDK or console — not needed for async workers)
});
```

### DynamoDB Query Optimization

- Single-table design reduces round trips
- Projection expressions: return only needed attributes, not full items
- BatchGetItem for multiple items (25 per batch, parallel)
- Always use queries with partition key — NEVER scan in production

### Tagging Strategy

Tag every resource. Without tags, cost allocation and ownership are impossible.

```typescript
// SST default tags on all functions
$transform(sst.Function, (args) => {
  args.tags = {
    ...args.tags,
    Environment: $app.stage,
    ManagedBy: "sst",
    Service: $app.name,
  };
});
```

Required tags: `Environment`, `Service`, `Team`, `ManagedBy`, `CostCenter`.
