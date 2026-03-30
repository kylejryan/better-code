---
title: CI/CD Pipeline — SST Deployment, Stage Isolation, and Safety
impact: HIGH
impactDescription: Prevents accidental production deletions; ensures environment isolation and safe rollback
tags: cicd, deployment, sst, stages, rollback, migration, secrets, pipeline
---

## CI/CD Pipeline — SST Deployment, Stage Isolation, and Safety

### Deployment Pipeline

```
PR opened → sst diff (preview changes)
PR merged to main → sst deploy --stage staging → integration tests → sst deploy --stage production
```

**Incorrect (no stage isolation, no production protection):**

```typescript
export default $config({
  app(input) {
    return {
      name: "myapp",
      removal: "remove",  // Production resources deleted if stack removed
      home: "aws",
    };
  },
});
// Deploying with shared resources between stages
// No sst diff before deploy — surprise deletions
```

**Correct (stage isolation with production protection):**

```typescript
export default $config({
  app(input) {
    return {
      name: "myapp",
      removal: input.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    // Resources created here are per-stage — completely separate stacks
    const table = new sst.Dynamo("Findings", { /* ... */ });
    const api = new sst.Api("Api", { /* ... */ });
  },
});
```

### Deployment Safety

- **Preview changes:** `sst diff` before deploy shows exactly what will be created, updated, or deleted
- **Staged rollout:** staging first → integration tests → production
- **Lambda versioning:** API Gateway points to a Lambda alias; rollback = repoint alias
- **Database migrations:** run separately from infrastructure deploys. Migration → validate → deploy code. Never deploy code that requires a schema change before the migration runs.
- **Canary alarms:** after production deploy, monitor error rate and latency for 10 minutes

### Environment Configuration

```bash
# Per-stage secrets — encrypted in SSM Parameter Store, scoped to stage
npx sst secret set DatabaseUrl "postgres://..." --stage production
npx sst secret set StripeKey "sk_live_..." --stage production
npx sst secret set DatabaseUrl "postgres://..." --stage staging
npx sst secret set StripeKey "sk_test_..." --stage staging
```

Secrets are NOT in environment variables, NOT in code, NOT in git. Functions access them via `Config.SecretName` at runtime.

### Multi-Account Deployment

```bash
npx sst deploy --stage production --profile prod-account
npx sst deploy --stage staging --profile staging-account
```

Separate AWS accounts per environment: production, staging, development, security, log archive. Hard blast radius boundary — credential leak in dev can't reach production.
