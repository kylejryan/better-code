---
title: Produce the Complete Threat Model Document
impact: MEDIUM
impactDescription: The document is the deliverable that scopes all subsequent analysis — incomplete documents produce incomplete analysis
tags: output, document, template, deliverable, structure, format
---

## Produce the Complete Threat Model Document

The threat model document is the structured output of Steps 1-4. It becomes the scoping document for all subsequent vulnerability analysis. Every section must be present and complete — a missing section means that dimension of the threat model is undefined, and findings in that area will revert to generic pattern matching.

**Incorrect (incomplete threat model):**

```markdown
# Threat Model

## Overview
This is a web application that handles sensitive data.

## Threats
- SQL injection
- XSS
- CSRF
- Authentication bypass
- Insecure deserialization

## Recommendations
- Use parameterized queries
- Sanitize output
- Implement CSRF tokens
- Use strong authentication
- Avoid deserializing untrusted data
```

This is not a threat model. It is a list of attack categories with generic countermeasures. It does not define the system, name assets, draw boundaries, model attackers, or calibrate impact. It provides zero guidance for prioritizing analysis.

**Correct (complete threat model document):**

```markdown
# Threat Model: HealthShare Patient Records Platform

## System Description
Multi-tenant SaaS platform enabling healthcare organizations to manage
patient appointment scheduling and medical record sharing between providers.
Processes PHI for 2M+ patients across 150+ healthcare organizations.

## Deployment Context
- Internet-facing: API (api.healthshare.com) + web app (app.healthshare.com)
- Multi-tenant: organization-based isolation in shared PostgreSQL database
- Cloud: AWS (us-east-1), ECS Fargate containers, ALB, RDS, S3
- Runs as: unprivileged container user (uid 1000), no host access
- Network: Public ALB → private VPC subnets, database in isolated subnet

## Crown Jewels
1. Patient PHI records (HIPAA-regulated, 2M+ patients)
2. OAuth refresh tokens (persistent account access)
3. Inter-org sharing policies (authorization rules)
4. Database encryption keys (at-rest PHI protection)
5. AWS IAM role credentials (infrastructure lateral movement)

## Trust Boundary Map
[Full boundary map from Step 2]

## Attacker Profiles
[Full profiles from Step 3, each with start → goal → paths]

## Impact Framework
[Calibrated severity definitions from Step 4]

## Scope and Exclusions

### In Scope
- All code handling PHI data: storage, retrieval, sharing, export
- Authentication and session management (JWT, OAuth flow)
- Authorization: tenant isolation, role-based access, sharing policies
- File upload and processing pipeline
- API input validation at all trust boundaries
- Dependency analysis for high-risk packages

### Out of Scope (with rationale)
- AWS infrastructure configuration (separate infrastructure audit)
- Client-side React application (no sensitive data in browser state)
- Marketing website (separate domain, no session context, no PHI)
- Load testing and availability (not a confidentiality/integrity concern)
- Physical security (cloud-hosted, not applicable)

## Attack Surface Priority
1. **Tenant isolation in database queries** — Single database, multi-tenant.
   If tenant filtering is missing on ANY query, full cross-tenant PHI access.
   Exposure: HIGH, Impact: CRITICAL, Controls: ORM middleware (unverified).

2. **File upload processing pipeline** — Internet-facing, processes untrusted
   binary data. Exposure: HIGH, Impact: HIGH (RCE → PHI access),
   Controls: Extension whitelist only (no content validation).

3. **OAuth token lifecycle** — Token generation, storage, refresh, revocation.
   Exposure: MEDIUM, Impact: CRITICAL (persistent access),
   Controls: Standard library (unaudited configuration).

4. **Inter-org sharing authorization** — Complex policy engine governing
   cross-organization data access. Exposure: MEDIUM, Impact: HIGH,
   Controls: Custom policy engine (complex, likely to have edge cases).

5. **Admin API endpoints** — User management, config, audit logs.
   Exposure: LOW (auth required), Impact: HIGH (policy manipulation),
   Controls: Role check middleware (verify completeness).
```

The "Attack Surface Priority" section is the direct input to vulnerability analysis. It tells the analyst where to look first and why, replacing the default behavior of scanning everything at equal depth.
