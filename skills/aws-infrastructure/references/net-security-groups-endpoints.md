---
title: Security Groups and VPC Endpoints — Instance Firewalls and Private AWS Access
impact: HIGH
impactDescription: Prevents lateral movement between tiers; eliminates NAT Gateway data processing charges for AWS service calls
tags: security-groups, vpc-endpoints, gateway-endpoint, interface-endpoint, firewall, egress
---

## Security Groups and VPC Endpoints

### Security Groups

Reference other security groups instead of CIDRs — this is dynamic and survives IP changes.

**Incorrect (broad CIDR-based security groups):**

```typescript
// Allow all traffic from the entire VPC CIDR — any compromised instance can reach the database
const dbSg = new ec2.SecurityGroup(this, "DbSg", { vpc });
dbSg.addIngressRule(ec2.Peer.ipv4("10.0.0.0/16"), ec2.Port.tcp(5432));
// Default egress: allow ALL outbound — database can reach the internet
```

**Correct (SG-to-SG references, restricted egress):**

```
ALB SG: inbound 443 from 0.0.0.0/0, outbound 8080 to App SG
App SG: inbound 8080 from ALB SG, outbound 5432 to DB SG
DB SG:  inbound 5432 from App SG, no outbound rules
```

```typescript
const appSg = new ec2.SecurityGroup(this, "AppSg", { vpc, allowAllOutbound: false });
const dbSg = new ec2.SecurityGroup(this, "DbSg", { vpc, allowAllOutbound: false });

// Only app tier can reach database
dbSg.addIngressRule(appSg, ec2.Port.tcp(5432), "App tier to database");
// App tier can only reach database (and AWS services via VPC endpoints)
appSg.addEgressRule(dbSg, ec2.Port.tcp(5432), "App to database");
```

**Critical rules:**
- `0.0.0.0/0` inbound only on public-facing ALB on port 443 (and 80 for redirect)
- One SG per role (ALB, App, DB, Cache), not per instance
- Database security groups: zero outbound rules

### VPC Endpoints

VPC endpoints let VPC resources access AWS services privately — faster, cheaper, more secure.

| Type | Services | Cost |
|------|----------|------|
| Gateway (always create) | S3, DynamoDB | Free |
| Interface (prioritize by traffic) | Secrets Manager, KMS, STS, CloudWatch Logs, ECR, SQS, SNS | Per-hour + per-GB |

Gateway endpoints for S3 and DynamoDB eliminate NAT Gateway data processing charges for those services. Always create them for any production VPC.
