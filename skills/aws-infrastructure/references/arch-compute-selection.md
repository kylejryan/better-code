---
title: Choose the Right Compute — Lambda vs Fargate vs EKS vs EC2
impact: CRITICAL
impactDescription: Wrong compute choice causes 2-10x cost overruns and re-architecture within 6 months
tags: compute, lambda, fargate, ecs, eks, ec2, serverless, containers
---

## Choose the Right Compute — Lambda vs Fargate vs EKS vs EC2

The default answer is Lambda or Fargate. Use EC2 only when Lambda and Fargate can't meet the requirement. Every EC2 instance is an operating system you have to patch, monitor, and secure.

```
Is the workload request-driven with variable traffic?
├─ Yes, and execution is < 15 minutes per invocation
│   ├─ Latency-sensitive (< 100ms cold start matters)? → Lambda with provisioned concurrency or ECS Fargate
│   └─ Cold starts acceptable? → Lambda (simplest, cheapest at low-to-moderate scale)
├─ Yes, but long-running (> 15 min) or needs persistent connections
│   ├─ Container-friendly? → ECS Fargate (serverless containers, no host management)
│   └─ Needs GPU or specific instance types? → ECS on EC2 or EKS
├─ Steady-state baseline with burst capacity?
│   ├─ Simple workload? → ECS Fargate with auto-scaling
│   └─ Complex orchestration, multi-tenant, service mesh? → EKS
└─ Batch processing or ML training?
    ├─ Fits in Lambda (< 15 min, < 10GB memory)? → Lambda
    ├─ Needs more? → AWS Batch on Fargate or EC2
    └─ GPU-heavy? → EC2 with GPU instances or SageMaker
```

**Incorrect (defaulting to EC2 for a simple API):**

```typescript
// EC2 instance running Express.js — you now own the OS, patching, scaling, load balancing
const instance = new ec2.Instance(this, "ApiServer", {
  instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
  machineImage: ec2.MachineImage.latestAmazonLinux2(),
  // Now you need: ASG, ALB, health checks, AMI updates, OS patches, monitoring agent...
});
```

**Correct (Lambda for request-driven API):**

```typescript
// SST: zero server management, scales automatically, pay per request
const api = new sst.Api("Api", {
  defaults: {
    function: {
      timeout: "30 seconds",
      memory: "512 MB",
      architecture: "arm64",  // 20% cheaper, better performance
      runtime: "nodejs20.x",
    },
  },
  routes: {
    "GET /items":      "packages/functions/src/items/list.handler",
    "POST /items":     "packages/functions/src/items/create.handler",
  },
});
```

**SST context:** `sst.Function` wraps Lambda with sensible defaults (ARM64, Node.js/Python bundling, live debugging). `sst.Cluster` wraps ECS Fargate for container workloads. Use `Function` for API handlers, event processors, cron jobs. Use `Cluster` for long-running services, WebSocket servers, or workloads that don't fit Lambda's constraints.

**Cost crossover:** At high volume (> 1M requests/day sustained), compare Lambda cost to Fargate. Lambda's per-request premium becomes significant at steady-state high throughput — Fargate's per-second pricing may be cheaper.
