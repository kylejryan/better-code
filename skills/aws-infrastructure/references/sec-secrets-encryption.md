---
title: Secrets Management and Encryption — Never Plaintext, Always Encrypted
impact: CRITICAL
impactDescription: Prevents credential exposure in CloudFormation, console, logs, and git; eliminates data breach from unencrypted storage
tags: secrets, encryption, ssm, secrets-manager, kms, tls, sst-secrets
---

## Secrets Management and Encryption — Never Plaintext, Always Encrypted

All secrets in SST Secrets or AWS Secrets Manager. Never in environment variables as plaintext, never in code, never in git.

**Incorrect (secrets in plaintext environment variables):**

```typescript
// Secrets visible in CloudFormation template, Lambda console, and CloudWatch logs
const api = new sst.Api("Api", {
  defaults: {
    function: {
      environment: {
        STRIPE_KEY: "sk_live_abc123...",          // In git, in CloudFormation, in console
        DATABASE_URL: "postgres://user:pass@...", // Password visible everywhere
      },
    },
  },
});
```

**Correct (SST Secrets — encrypted, access-controlled):**

```typescript
// SST Secrets — encrypted in SSM Parameter Store, not visible in CloudFormation
const stripeKey = new sst.Secret("StripeKey");
const dbUrl = new sst.Secret("DatabaseUrl");

api.route("POST /payments", {
  handler: "packages/functions/src/payments/create.handler",
  bind: [stripeKey],  // Function can access via Config.StripeKey at runtime
});

// Set values via CLI (not in code):
// npx sst secret set StripeKey sk_live_... --stage production
// npx sst secret set DatabaseUrl postgres://... --stage staging
```

### Encryption Checklist

| Resource | Minimum | Sensitive Data |
|----------|---------|----------------|
| S3 | SSE-S3 (default) | SSE-KMS with CMK |
| DynamoDB | AWS-managed key (default) | Customer-managed KMS key |
| RDS/Aurora | Encryption at creation | SST enables by default |
| EBS | Enable default encryption at account level | - |
| In transit | TLS 1.2+ everywhere | Force SSL on RDS connections |

**S3 bucket policy denying non-HTTPS:**

```json
{
  "Effect": "Deny",
  "Principal": "*",
  "Action": "s3:*",
  "Resource": ["arn:aws:s3:::bucket-name/*"],
  "Condition": { "Bool": { "aws:SecureTransport": "false" } }
}
```

**Account-level security controls (set once):**
- S3 Block Public Access at account level — prevents any bucket from being made public
- Default EBS Encryption per region
- IMDSv2 required on all EC2 (prevents SSRF-based credential theft)
- CloudTrail organization trail to a separate Log Archive account
- GuardDuty enabled in all accounts and regions
