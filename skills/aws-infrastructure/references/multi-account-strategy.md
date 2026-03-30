---
title: Multi-Account Strategy — Blast Radius Isolation and Organization Controls
impact: MEDIUM-HIGH
impactDescription: Hard isolation boundary prevents credential leaks in dev from reaching production; enables independent limits and clean billing
tags: multi-account, organizations, scp, blast-radius, isolation, governance
---

## Multi-Account Strategy — Blast Radius Isolation and Organization Controls

Separate AWS accounts by environment to create hard blast radius boundaries. A credential leak in dev cannot reach production, each environment has independent IAM policies and service limits, and cost per environment is immediately visible. Service Control Policies enforce invariants that no IAM policy can override.

**Incorrect (single account for all environments):**

```typescript
// Everything in one account — dev and production share IAM, service limits, and blast radius
// A runaway Lambda in dev can consume all account concurrency, starving production
// A leaked dev credential has access to production data
// Cost attribution between environments is impossible
export default $config({
  app() {
    return { name: "myapp", removal: "remove", home: "aws" };
  },
});
// npx sst deploy --stage dev       // Same account
// npx sst deploy --stage production // Same account — no isolation
```

**Correct (separate accounts per environment):**

```typescript
// Same code, different accounts — hard isolation
export default $config({
  app(input) {
    return {
      name: "myapp",
      removal: input.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
});
// npx sst deploy --stage production --profile prod-account
// npx sst deploy --stage staging --profile staging-account
// npx sst deploy --stage dev --profile dev-account
```

### Account Structure

```
Organization
  ├── Production Account    (production workloads only, strictest policies)
  ├── Staging Account       (pre-production validation)
  ├── Development Account   (developer experimentation)
  ├── Security Account      (GuardDuty, Security Hub, audit tools)
  └── Log Archive Account   (CloudTrail, immutable log storage)
```

**Why separate accounts:**
- Hard blast radius boundary — credential leak in dev can't reach production
- Independent IAM — dev account can have relaxed permissions without weakening prod
- Clean billing — cost per environment is immediately visible
- Independent limits — Lambda concurrency limits per account, dev can't starve prod
- Compliance — auditors want production isolated

### Service Control Policies (SCPs)

SCPs enforce invariants across the organization that cannot be overridden by any IAM policy:

**Production account SCPs:**
- Deny CloudTrail modification
- Deny public S3 buckets
- Require encrypted volumes
- Restrict to approved regions only

**All accounts:**
- Deny root account usage (except break-glass)
- Deny leaving the organization
- Require IMDSv2 on EC2

### SST Multi-Account Deployment

```bash
# Deploy to different accounts via AWS profiles
npx sst deploy --stage production --profile prod-account
npx sst deploy --stage staging --profile staging-account
npx sst deploy --stage dev --profile dev-account
```

Same SST app, same code, different accounts. Stage isolation plus account isolation.
