---
title: Choose the Right Database — DynamoDB vs Aurora vs RDS vs ElastiCache
impact: CRITICAL
impactDescription: Wrong database choice causes data model rewrites, scaling ceilings, and 3-5x cost at scale
tags: database, dynamodb, aurora, rds, elasticache, postgresql, single-table-design
---

## Choose the Right Database — DynamoDB vs Aurora vs RDS vs ElastiCache

DynamoDB is the default for serverless architectures — it scales infinitely, requires zero management, and integrates natively with Lambda via event source mappings and SST bindings. Design your data model for DynamoDB first. Only reach for RDS/Aurora when your access patterns genuinely require relational queries.

```
Is the access pattern key-value or simple queries?
├─ Yes, single-digit millisecond latency at any scale → DynamoDB
│   ├─ Predictable traffic? → Provisioned capacity (cheaper)
│   └─ Spiky traffic? → On-demand capacity (auto-scales, no planning)
├─ Need complex queries, joins, transactions across tables?
│   ├─ Moderate scale (< 64TB, < 128k IOPS) → Aurora Serverless v2 (auto-scales, pay per ACU)
│   ├─ Large scale, read-heavy → Aurora with read replicas
│   └─ PostgreSQL-specific features needed → Aurora PostgreSQL or RDS PostgreSQL
├─ Need full-text search or analytics? → OpenSearch Service
├─ Need caching layer? → ElastiCache (Redis for features, Memcached for simple caching)
├─ Need time-series data? → Timestream
└─ Need graph relationships? → Neptune
```

**The DynamoDB decision:** DynamoDB requires you to know your access patterns upfront and model your data accordingly (single-table design, GSIs for secondary access). If your access patterns are well-defined, DynamoDB is unbeatable. If your access patterns are evolving or truly require ad-hoc relational queries, Aurora Serverless v2 gives you PostgreSQL flexibility with auto-scaling.

**Incorrect (using RDS for a simple key-value workload):**

```typescript
// RDS for key-value lookups — you now need VPC, RDS Proxy, connection pooling,
// and you've introduced a scaling ceiling and cold start penalty
const db = new sst.RDS("Db", {
  engine: "postgresql13.9",
  defaultDatabaseName: "items",
  scaling: { minCapacity: "ACU_2", maxCapacity: "ACU_16" },
});
// Lambda in VPC adds ~1-2s cold start, needs NAT Gateway ($97/mo for 3 AZs)
```

**Correct (DynamoDB for key-value access patterns):**

```typescript
// DynamoDB: no VPC needed, no connection pooling, scales infinitely, zero cold start impact
const table = new sst.Dynamo("Items", {
  fields: { pk: "string", sk: "string", gsi1pk: "string", gsi1sk: "string" },
  primaryIndex: { partitionKey: "pk", sortKey: "sk" },
  globalIndexes: {
    gsi1: { partitionKey: "gsi1pk", sortKey: "gsi1sk" },
  },
});
```

**SST context:** `sst.Dynamo` creates tables with SST bindings for Lambda access. `sst.RDS` creates Aurora Serverless v2 clusters with automatic password management via Secrets Manager. `sst.RDS` provisions in a VPC automatically — your Lambda functions need VPC access to reach it (adds cold start latency; mitigate with provisioned concurrency on hot functions).
