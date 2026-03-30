# Section Definitions

This file defines the categories for AWS infrastructure best practices. Reference files are automatically assigned to sections based on their filename prefix.

---

## 1. Architecture Decisions (arch)
**Impact:** CRITICAL
**Description:** Compute selection (Lambda vs Fargate vs EKS vs EC2), database selection (DynamoDB vs Aurora vs RDS), and messaging patterns (SQS vs SNS vs EventBridge). The foundational choices that determine scalability, cost, and operational burden.

## 2. Serverless Patterns (serverless)
**Impact:** CRITICAL
**Description:** API patterns, event-driven architectures, background processing with SQS, and Step Functions for complex workflows. The composition patterns for building serverless applications on AWS.

## 3. Security (sec)
**Impact:** CRITICAL
**Description:** IAM least privilege, secrets management, encryption at rest and in transit, account-level security controls, and API security. Security baked in by default, not bolted on.

## 4. Scaling Strategies (scaling)
**Impact:** HIGH
**Description:** Lambda concurrency and provisioned concurrency, DynamoDB capacity modes and partition design, Aurora Serverless v2 ACU sizing, and ECS/Fargate auto-scaling. Scaling that works without manual intervention.

## 5. Networking (net)
**Impact:** HIGH
**Description:** VPC design and when to use one, security group rules, VPC endpoints for cost and performance, and custom domain configuration. The network layer that connects and isolates services.

## 6. Cost Optimization (cost)
**Impact:** HIGH
**Description:** NAT Gateway cost mitigation, Lambda right-sizing, DynamoDB capacity mode selection, CloudWatch log retention, data transfer optimization, and budget monitoring. Keeping the bill proportional to usage.

## 7. Observability (obs)
**Impact:** HIGH
**Description:** Structured JSON logging, CloudWatch metrics, X-Ray distributed tracing, and alarm design. The three pillars of observability for understanding system behavior in production.

## 8. CI/CD and Deployment (cicd)
**Impact:** HIGH
**Description:** SST deployment pipeline, stage isolation, deployment safety (preview, staged rollout, rollback), database migration strategy, and environment configuration with secrets.

## 9. Multi-Account Strategy (multi)
**Impact:** MEDIUM-HIGH
**Description:** Account separation by environment, Service Control Policies, blast radius isolation, and SST multi-account deployment. Organization-level architecture for production systems.

## 10. Operational Patterns (ops)
**Impact:** MEDIUM-HIGH
**Description:** Disaster recovery (PITR, backups, cross-region replication), Lambda cold start optimization, DynamoDB query patterns, API Gateway optimization, and resource tagging strategy.

## 11. Infrastructure Checklist (checklist)
**Impact:** MEDIUM
**Description:** Comprehensive pre-deployment checklist covering architecture, scaling, networking, security, cost, observability, deployment, and operational readiness.
