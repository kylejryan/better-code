---
title: Aurora Serverless v2 and ECS/Fargate Scaling
impact: HIGH
impactDescription: Right-sizes database and container compute to avoid over-provisioning costs and under-provisioning outages
tags: aurora, serverless-v2, acu, rds-proxy, ecs, fargate, auto-scaling, connection-pooling
---

## Aurora Serverless v2 and ECS/Fargate Scaling

### Aurora Serverless v2

Aurora Serverless v2 scales between 0.5 and 128 ACUs (each ACU ≈ 2 GB RAM).

**Incorrect (production Aurora with low minimum ACUs):**

```typescript
// Minimum 0.5 ACUs in production — scaling from 0.5 to needed capacity
// takes time, causing latency spikes under sudden load
const db = new sst.RDS("Db", {
  engine: "postgresql13.9",
  defaultDatabaseName: "app",
  scaling: { minCapacity: "ACU_0_5", maxCapacity: "ACU_64" },
  // Also missing: RDS Proxy for Lambda connection pooling
});
```

**Correct (production-ready Aurora configuration):**

```typescript
const db = new sst.RDS("Db", {
  engine: "postgresql13.9",
  defaultDatabaseName: "app",
  scaling: {
    minCapacity: "ACU_2",    // Production: 2-4 minimum to avoid scaling latency
    maxCapacity: "ACU_64",
  },
});

// RDS Proxy is ESSENTIAL for Lambda → Aurora (prevents "too many connections")
// Lambda creates many short-lived connections; Proxy pools them
```

**Sizing guide:**
- Dev/staging: min 0.5 ACUs (cold start is 25-30s, acceptable for non-production)
- Production: min 2-4 ACUs to avoid scaling latency under load
- Read-heavy: add up to 15 read replicas; reader endpoint distributes reads automatically

### ECS/Fargate Auto-Scaling

**Correct scaling configuration:**

```
Target tracking: maintain average CPU at 60%
  → Fargate adds tasks when CPU > 60%
  → Fargate removes tasks when CPU < 60%

Step scaling for finer control:
  CPU 60-75% → add 1 task
  CPU 75-90% → add 3 tasks
  CPU > 90%  → add 5 tasks
```

**Key settings:**
- Scale on the metric that reflects user-experienced load (CPU, request count per target, queue depth)
- Minimum tasks >= 2 for production (multi-AZ availability)
- Maximum tasks based on cost budget AND downstream capacity (database connections, API rate limits)
- Scale-in cooldown: 300 seconds (prevent flapping)
- Scale-out cooldown: 60 seconds (respond quickly to spikes)
