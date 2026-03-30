---
name: aws-infrastructure
description: "Use this skill when designing, building, reviewing, or troubleshooting AWS infrastructure. Triggers when the user works with SST, CDK, Terraform, CloudFormation, or any AWS infrastructure-as-code tool and wants to make correct architectural decisions. Covers: VPC and networking design, compute selection (Lambda vs ECS vs EKS vs EC2), database selection (DynamoDB vs RDS vs Aurora vs ElastiCache), serverless architecture patterns, scaling strategies, cost optimization, security hardening, IAM, monitoring, CI/CD pipelines, multi-account strategy, and operational excellence. Also triggers when the user asks 'should I use X or Y on AWS,' 'how do I scale this,' 'how do I secure this,' 'is this the right architecture,' or 'how do I set this up in SST.' Do NOT use for application-level code logic unrelated to infrastructure."
license: MIT
metadata:
  author: kylejryan
  version: "1.0.0"
  organization: kylejryan
  date: March 2026
  abstract: Comprehensive AWS infrastructure guide for building scalable, secure, and cost-effective cloud architectures. Covers compute and database selection, serverless patterns with SST, VPC and networking design, IAM and security hardening, scaling strategies, cost optimization, observability, CI/CD pipelines, multi-account strategy, and operational excellence.
---

# AWS Infrastructure

## Core Philosophy

Good infrastructure makes the right thing easy and the wrong thing hard. It scales without manual intervention, secures by default without extra effort, costs proportionally to usage, and recovers from failures automatically. The goal is infrastructure that the team forgets about — because it just works.

Three forces govern every infrastructure decision:

1. **Will it scale?** Not "can it theoretically scale" — will it scale without re-architecture, without downtime, and without an engineer waking up at 3am?
2. **Is it secure by default?** Security that requires remembering to enable it will eventually be forgotten. Bake it in so the default path is the secure path.
3. **What does it cost at 10x traffic?** An architecture that's cheap at current load but bankrupting at 10x is a trap. Model the cost curve, not just the current bill.

## Decision Framework Summary

| Decision | Default Choice | Escalate When |
|----------|---------------|---------------|
| Compute | Lambda (ARM64) | > 15 min execution, persistent connections, GPU |
| Long-running compute | ECS Fargate | Service mesh, multi-tenant → EKS |
| Database (key-value) | DynamoDB on-demand | Complex queries, joins → Aurora Serverless v2 |
| Async messaging | SQS | Fan-out → SNS+SQS, routing → EventBridge |
| API | API Gateway HTTP API | Request validation, API keys → REST API |
| Networking | No VPC (serverless) | RDS, ElastiCache, internal services → VPC |

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Architecture Decisions | CRITICAL | `arch-` |
| 2 | Serverless Patterns | CRITICAL | `serverless-` |
| 3 | Security | CRITICAL | `sec-` |
| 4 | Scaling Strategies | HIGH | `scaling-` |
| 5 | Networking | HIGH | `net-` |
| 6 | Cost Optimization | HIGH | `cost-` |
| 7 | Observability | HIGH | `obs-` |
| 8 | CI/CD and Deployment | HIGH | `cicd-` |
| 9 | Multi-Account Strategy | MEDIUM-HIGH | `multi-` |
| 10 | Operational Patterns | MEDIUM-HIGH | `ops-` |
| 11 | Infrastructure Checklist | MEDIUM | `checklist-` |

## How to Use

Read individual reference files for detailed explanations, decision trees, and code examples:

```
references/arch-compute-selection.md
references/arch-database-selection.md
references/sec-iam-least-privilege.md
references/serverless-api-pattern.md
references/scaling-lambda.md
references/net-vpc-design.md
references/cost-big-levers.md
references/_sections.md
```

Each reference file contains:
- Detailed decision criteria and trade-offs
- Incorrect configuration with explanation of the risk
- Correct configuration with SST/CDK examples
- Scaling, cost, and security implications

## Infrastructure Review Checklist

After designing or reviewing infrastructure, verify:
- Compute choice justified based on workload characteristics
- Database choice justified based on access patterns
- Async processing for operations > 3 seconds
- DLQ configured for every queue
- Default-deny auth on all API routes
- Secrets in SST Secrets or Secrets Manager (never plaintext)
- Encryption at rest on all storage
- IAM roles follow least privilege (no * in actions or resources)
- NAT Gateway costs understood and mitigated
- Structured JSON logging and X-Ray tracing enabled
- Alarms on 5xx rate, DLQ depth, throttling, latency
- `removal: "retain"` on production stacks
