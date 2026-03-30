---
title: IAM Least Privilege — Every Function Gets Only What It Needs
impact: CRITICAL
impactDescription: Prevents lateral movement from compromised functions, reduces blast radius of credential exposure
tags: iam, least-privilege, permissions, roles, security, sst, bind
---

## IAM Least Privilege — Every Function Gets Only What It Needs

Every Lambda/container gets its own IAM role with only the permissions it needs. SST handles this well — when you `bind` a resource to a function, SST grants the minimum permissions for that binding.

**Incorrect (overly permissive IAM):**

```typescript
// Wild card actions and resources — this function can delete any table, read any secret,
// invoke any Lambda in the account
const policy = new iam.PolicyStatement({
  actions: ["dynamodb:*", "secretsmanager:*", "lambda:*"],
  resources: ["*"],
});

// Or in SST, manually attaching broad permissions
api.route("GET /findings", {
  handler: "packages/functions/src/findings/list.handler",
  permissions: ["dynamodb", "s3"],  // Grants full access to ALL DynamoDB tables and S3 buckets
});
```

**Correct (SST bind for automatic least privilege):**

```typescript
const table = new sst.Dynamo("Findings", {
  fields: { pk: "string", sk: "string" },
  primaryIndex: { partitionKey: "pk", sortKey: "sk" },
});

api.route("GET /findings", {
  handler: "packages/functions/src/findings/list.handler",
  bind: [table],  // SST grants dynamodb:GetItem, PutItem, Query, Scan on THIS table only
});

// For read-only access, further restrict manually:
api.route("GET /findings", {
  handler: "packages/functions/src/findings/list.handler",
  bind: [table],
  permissions: [{
    actions: ["dynamodb:GetItem", "dynamodb:Query"],
    resources: [table.tableArn, `${table.tableArn}/index/*`],
  }],
});
```

**Beyond SST defaults:**
- Review generated IAM policies — SST's automatic bindings are good but sometimes broader than needed. A function that only reads should not have `PutItem`.
- No `*` in resource ARNs. `arn:aws:dynamodb:*:*:table/*` grants access to ALL tables.
- No `*` in actions. `dynamodb:*` grants DeleteTable, CreateBackup, UpdateTimeToLive — far beyond what an API handler needs.
- Permission boundaries on any role that runs untrusted code.
