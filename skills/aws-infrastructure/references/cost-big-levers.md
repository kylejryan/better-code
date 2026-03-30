---
title: Cost Optimization — The Big Levers That Actually Move the Bill
impact: HIGH
impactDescription: NAT Gateway alone can cost $97/mo before data transfer; right-sizing Lambda and DynamoDB saves 30-70%
tags: cost, nat-gateway, lambda-power-tuning, dynamodb-capacity, cloudwatch-logs, data-transfer
---

## Cost Optimization — The Big Levers That Actually Move the Bill

The biggest AWS cost drivers in serverless architectures are NAT Gateways, over-provisioned Lambda memory, wrong DynamoDB capacity mode, and unbounded CloudWatch log retention. Fixing these four levers typically reduces the monthly bill by 30-70% without any architectural changes. Model the cost curve at 10x traffic, not just the current bill.

**Incorrect (cost-blind serverless setup):**

```typescript
// VPC-attached Lambda that doesn't need VPC (adds $97/mo NAT Gateway cost)
// Over-provisioned memory (paying for 3GB when 512MB suffices)
// Infinite CloudWatch log retention (storage costs forever)
// DynamoDB on-demand for steady-state traffic (7x more expensive than provisioned)
const fn = new sst.Function("Processor", {
  handler: "src/processor.handler",
  memory: "3008 MB",           // Way more than needed
  vpc: myVpc,                   // Only reads DynamoDB — no VPC needed
  bind: [table],
});
// CloudWatch logs: default infinite retention
// DynamoDB: on-demand for table with predictable 1000 WCU steady state
```

**Correct (cost-optimized configuration):**

```typescript
// No VPC attachment — DynamoDB access doesn't need it (saves $97/mo)
// Right-sized memory at 512MB (use Lambda Power Tuning to verify)
// Explicit log retention
const fn = new sst.Function("Processor", {
  handler: "src/processor.handler",
  memory: "512 MB",            // Right-sized via Power Tuning
  architecture: "arm64",        // 20% cheaper than x86
  bind: [table],                // No VPC — no NAT Gateway cost
  logRetention: "one_month",    // Not infinite
});
// DynamoDB: provisioned with auto-scaling for predictable traffic
// VPC endpoints for S3/DynamoDB: free gateway endpoints, eliminate NAT data charges
```

**Cost monitoring:** weekly Cost Explorer review, budget alerts at 50%/80%/100%, and tagging (`Environment`, `Service`, `Team`, `CostCenter`) on every resource for cost allocation.
