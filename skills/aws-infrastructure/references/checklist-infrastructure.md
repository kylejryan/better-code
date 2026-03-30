---
title: Infrastructure Pre-Deployment Checklist
impact: MEDIUM
impactDescription: Catches misconfigurations before they reach production; covers architecture, scaling, networking, security, cost, observability, and operations
tags: checklist, review, pre-deployment, production-readiness, audit
---

## Infrastructure Pre-Deployment Checklist

Use this checklist before deploying infrastructure to production. Each item represents a common misconfiguration that causes outages, security incidents, or cost overruns. The checklist covers architecture, scaling, networking, security, cost, observability, deployment, and operational readiness.

**Incorrect (deploying without review):**

```typescript
// No checklist review — common issues that slip through:
// - Lambda with no reserved concurrency (one function starves all others)
// - DLQ missing on SQS queue (failed messages disappear silently)
// - Default allow-all egress on security groups
// - No encryption on S3 bucket
// - Infinite CloudWatch log retention
// - No budget alerts
// - removal: "remove" on production (accidental stack deletion loses data)
```

**Correct (systematic pre-deployment review):**

```typescript
// Each item verified before production deploy:
const api = new sst.Api("Api", {
  defaults: {
    authorizer: "jwt",                    // Default-deny auth ✓
    function: {
      architecture: "arm64",              // Cost optimized ✓
      memory: "512 MB",                   // Right-sized ✓
      tracing: "active",                  // X-Ray enabled ✓
    },
  },
});
// removal: "retain" on production ✓
// Secrets in sst.Secret ✓
// DLQ on all queues ✓
// Budget alerts configured ✓
// Log retention set ✓
```

### Architecture
- [ ] Compute choice justified (Lambda vs Fargate vs EKS vs EC2) based on workload characteristics
- [ ] Database choice justified based on access patterns and scale requirements
- [ ] Async processing for operations > 3 seconds (SQS + worker Lambda)
- [ ] DLQ configured for every queue (failed messages don't disappear)
- [ ] Step Functions for multi-step workflows (not Lambda-chaining)

### Scaling
- [ ] Lambda reserved concurrency on critical functions
- [ ] DynamoDB capacity mode matched to traffic pattern (on-demand vs provisioned)
- [ ] Auto-scaling configured for ECS/Fargate with appropriate min/max
- [ ] RDS Proxy for Lambda → Aurora connections
- [ ] No single points of failure (multi-AZ for production)

### Networking
- [ ] VPC only where needed (Lambda not VPC-attached unnecessarily)
- [ ] Public subnets contain only load balancers
- [ ] Security groups reference SGs, not broad CIDRs
- [ ] VPC endpoints for S3 and DynamoDB (free, always create)
- [ ] Egress restricted (no default allow-all outbound)

### Security
- [ ] Default-deny auth on all API routes (public routes explicitly opted out)
- [ ] Secrets in SST Secrets or Secrets Manager (never plaintext env vars)
- [ ] Encryption at rest on all storage (S3, DynamoDB, RDS, EBS)
- [ ] S3 Block Public Access at account level
- [ ] CloudTrail enabled, GuardDuty enabled
- [ ] IAM roles follow least privilege (no * in actions or resources)

### Cost
- [ ] NAT Gateway costs understood and mitigated (VPC endpoints, minimal VPC attachment)
- [ ] Lambda memory right-sized (Power Tuning tool)
- [ ] CloudWatch log retention set (not infinite)
- [ ] Budget alerts configured
- [ ] Resources tagged for cost allocation

### Observability
- [ ] Structured JSON logging from all functions
- [ ] X-Ray tracing enabled for distributed traces
- [ ] Alarms on: 5xx rate, DLQ depth, throttling, latency anomalies
- [ ] Dashboard showing service health at a glance

### Deployment
- [ ] SST stages separate environments completely
- [ ] `removal: "retain"` on production
- [ ] Secrets per-stage via SST Secrets
- [ ] Database migrations run before code deploys
- [ ] Rollback plan exists (Lambda alias revert or CloudFormation rollback)

### Operational
- [ ] DynamoDB PITR enabled on production tables
- [ ] RDS automated backups with 35-day retention
- [ ] S3 versioning on data buckets
- [ ] Infrastructure fully reproducible from code (disaster recovery = redeploy)
