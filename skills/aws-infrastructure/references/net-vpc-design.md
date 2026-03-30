---
title: VPC Design — When to Use One and How to Structure It
impact: HIGH
impactDescription: Avoids unnecessary VPC overhead on serverless workloads; prevents misconfigured networking that blocks traffic or leaks data
tags: vpc, subnets, public, private, nat-gateway, networking, availability-zones
---

## VPC Design — When to Use One and How to Structure It

**Not everything needs a VPC.** Lambda, DynamoDB, S3, SQS, SNS, EventBridge, Step Functions, API Gateway — all work without VPC configuration. Only attach Lambda to a VPC if it needs to access VPC resources (RDS, ElastiCache, internal services). VPC-attached Lambda has slower cold starts and requires NAT Gateway for internet access.

**Incorrect (VPC-attaching Lambda that doesn't need it):**

```typescript
// This Lambda only reads from DynamoDB and writes to SQS
// VPC attachment adds: ~1-2s cold start, NAT Gateway cost ($97/mo for 3 AZs),
// and complexity for zero benefit
const fn = new sst.Function("Processor", {
  handler: "src/processor.handler",
  bind: [table, queue],
  vpc: myVpc,              // Unnecessary — DynamoDB and SQS don't need VPC
  vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
});
```

**Correct (VPC only when needed):**

```typescript
// Lambda accessing DynamoDB/SQS — no VPC needed
const processor = new sst.Function("Processor", {
  handler: "src/processor.handler",
  bind: [table, queue],  // No VPC — faster cold starts, no NAT cost
});

// Lambda accessing RDS — VPC required
const dbReader = new sst.Function("DbReader", {
  handler: "src/db-reader.handler",
  bind: [db],  // SST automatically VPC-attaches when binding RDS
});
```

### VPC Structure (when needed)

```
Production VPC (10.0.0.0/16)
  ├── Public Subnets (10.0.0.0/20 x 3 AZs)
  │   └── ALB/NLB, NAT Gateways ONLY
  ├── Private App Subnets (10.0.48.0/20 x 3 AZs)
  │   └── ECS tasks, VPC-attached Lambdas
  └── Private Data Subnets (10.0.96.0/20 x 3 AZs)
      └── RDS, ElastiCache, OpenSearch
```

**SST context:** `sst.Vpc` creates a VPC with public and private subnets across AZs. When you add `sst.RDS`, SST automatically creates the VPC if one doesn't exist. Functions that `bind` to the RDS resource are automatically VPC-attached.
