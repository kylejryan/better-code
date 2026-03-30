---
title: DynamoDB Scaling — Capacity Modes, Partition Design, and DAX
impact: HIGH
impactDescription: Prevents throttling from hot partitions and selects the cost-optimal capacity mode for traffic patterns
tags: dynamodb, scaling, on-demand, provisioned, partition-key, dax, global-tables
---

## DynamoDB Scaling — Capacity Modes, Partition Design, and DAX

DynamoDB distributes data across partitions by partition key. A hot partition key — one key receiving disproportionate traffic — creates throttling regardless of total capacity. Design partition keys for even distribution (user ID is usually good; date is usually bad). Then choose the right capacity mode: on-demand for unpredictable traffic, provisioned with auto-scaling for steady-state workloads at significant cost savings.

**Incorrect (bad partition key causing hot partition):**

```typescript
// Using date as partition key — ALL traffic hits today's partition
const table = new sst.Dynamo("Events", {
  fields: { date: "string", timestamp: "string" },
  primaryIndex: { partitionKey: "date", sortKey: "timestamp" },
});
// Result: 99% of reads/writes hit "2026-03-30" partition → throttling
// regardless of total provisioned capacity
```

**Correct (well-distributed partition key):**

```typescript
// User ID distributes traffic evenly across partitions
const table = new sst.Dynamo("Events", {
  fields: { userId: "string", timestamp: "string", gsi1pk: "string", gsi1sk: "string" },
  primaryIndex: { partitionKey: "userId", sortKey: "timestamp" },
  globalIndexes: {
    byDate: { partitionKey: "gsi1pk", sortKey: "gsi1sk" },
    // gsi1pk = "EVENT#2026-03-30" with write sharding if needed
  },
});
```

### Capacity Mode Selection

| Mode | Best For | Cost |
|------|----------|------|
| On-demand | Unpredictable/spiky traffic, new tables, dev environments | ~7x more per request than provisioned at steady state |
| Provisioned + auto-scaling | Predictable sustained throughput | Cheapest for known traffic patterns |

### DAX (DynamoDB Accelerator)

In-memory cache for microsecond read latency. Use when:
- Reads dominate (> 80% of operations)
- Cache hit rate is high (> 80%)
- Same items are read repeatedly

Do NOT use for write-heavy workloads or when every read is unique.

### Global Tables

Multi-region active-active replication. Use for:
- Disaster recovery (automatic failover)
- Serving users from the nearest region (reduced latency)
- Compliance requirements for data residency

**Partition design matters at scale.** DynamoDB distributes data across partitions by partition key. A hot partition key creates throttling regardless of total capacity. Design partition keys for even distribution.
