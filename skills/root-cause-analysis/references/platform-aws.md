---
title: AWS Error Signatures and Diagnostic Patterns
impact: HIGH
impactDescription: Decodes IAM permission errors, service-specific failures, and cross-service interaction bugs — the patterns behind most "it works locally but not in AWS" issues
tags: aws, iam, lambda, s3, ecs, eks, api-gateway, cloudwatch, cloudtrail, sqs, dynamodb
---

## AWS Diagnostic Reference

AWS errors are frustrating because they're deliberately vague for security reasons (a 403 doesn't tell you WHICH permission is missing) and because the root cause often involves the interaction between multiple services. An API Gateway 500 might be caused by a Lambda timeout, which is caused by a DynamoDB throttle, which is caused by a hot partition. This reference teaches you to trace through the AWS service chain.

### IAM Permission Errors

`AccessDeniedException`, `AccessDenied`, `UnauthorizedAccess`, `403 Forbidden` — the most common AWS error, and the hardest to debug because the error message intentionally doesn't tell you what's wrong.

**Incorrect (adding broader permissions until it works):**

```json
{
    "Effect": "Allow",
    "Action": "*",
    "Resource": "*"
}
// "I'll just give it admin and tighten later" — this is a security incident waiting to happen
// AND it doesn't help you understand the actual required permission
```

**Correct (systematic IAM debugging):**

```bash
# Step 1: Find the EXACT API call that was denied
# CloudTrail → Event history → filter by error code "AccessDenied"
aws cloudtrail lookup-events \
    --lookup-attributes AttributeKey=EventName,AttributeValue=PutObject \
    --max-results 5 \
    --query 'Events[].{Time:EventTime,Error:CloudTrailEvent}' \
    --output json

# The CloudTrail event shows:
# - eventName: the exact API call (e.g., "s3:PutObject")
# - errorCode: "AccessDenied"
# - errorMessage: sometimes includes the specific policy denial
# - userIdentity: WHO made the call (is it the right role?)
# - resources: WHICH resource was being accessed

# Step 2: Verify the identity
# Is the code assuming the role you think it is?
aws sts get-caller-identity
# Shows: Account, Arn, UserId — compare to what you expect

# Step 3: Simulate the policy
aws iam simulate-principal-policy \
    --policy-source-arn arn:aws:iam::123456789012:role/MyRole \
    --action-names s3:PutObject \
    --resource-arns arn:aws:s3:::my-bucket/my-key

# Step 4: Check ALL policy layers (any one can deny):
# - Identity policy (attached to user/role)
# - Resource policy (on the S3 bucket, SQS queue, etc.)
# - Permission boundary (limits what the role CAN have)
# - SCP (organization-level deny)
# - VPC endpoint policy (if accessing via VPC endpoint)
# - Session policy (if using assumed role with session policy)

# Common gotcha: S3 bucket in a different account
# Need BOTH: role policy allows s3:PutObject AND bucket policy allows the role
```

### Lambda Errors

**Symptoms:** timeouts, cold starts, out of memory, module import failures, 502 from API Gateway.

**Incorrect (increasing timeout and memory as first response):**

```python
# Lambda times out at 15s. Wrong: just increase to 60s.
# If the Lambda was fast before and is now slow, the timeout isn't the cause.

# Wrong: increase memory for an OOM
# If memory usage grows over invocations, you have a leak in a warm container.
```

**Correct (diagnosing the actual Lambda failure):**

```bash
# Step 1: Check CloudWatch Logs — ALWAYS
aws logs filter-log-events \
    --log-group-name /aws/lambda/my-function \
    --start-time $(date -d '1 hour ago' +%s000) \
    --filter-pattern "ERROR"

# Step 2: Check the invocation metrics
# - Duration vs timeout: if Duration ≈ Timeout, the function is timing out
# - Max memory used vs configured: if MaxMemory ≈ MemorySize, it's OOM
# - Concurrent executions: hitting the concurrency limit?

# Lambda-specific failure modes:
# 1. Timeout: function is waiting on something external
#    - Check VPC config: Lambda in VPC needs NAT gateway for internet access
#    - Check security groups: outbound rules must allow the target
#    - Check the external service (DB, API) — is IT slow?

# 2. Cold start: first invocation after idle period is slow
#    - Init duration in logs shows how long initialization took
#    - Move SDK client creation outside the handler (reuse across invocations)

# 3. Import error at deploy time:
#    - Native modules compiled for wrong architecture (x86 vs arm64)
#    - Layer not compatible with runtime version
#    - Package too large (check /tmp usage and deployment package size)

# 4. "Task timed out" vs application error:
#    - "Task timed out" = Lambda killed it (increase timeout or fix the slow call)
#    - Application error = your code threw/returned an error (check the error)
```

```python
# Lambda handler diagnostic pattern:
import json
import time
import os

def handler(event, context):
    print(f"Remaining time: {context.get_remaining_time_in_millis()}ms")
    print(f"Memory limit: {context.memory_limit_in_mb}MB")
    print(f"Request ID: {context.aws_request_id}")
    print(f"Event: {json.dumps(event, default=str)[:1000]}")  # Truncate large events

    # Your logic here — wrap in timing to identify the slow part
    start = time.time()
    result = do_work(event)
    print(f"do_work took {time.time() - start:.2f}s")

    return result
```

### S3 Errors

```bash
# 403 Forbidden on S3 — could be ANY of these:
# 1. IAM policy doesn't allow the action
# 2. Bucket policy explicitly denies
# 3. Object ACL restricts access (legacy — avoid ACLs)
# 4. Bucket is in a different account (need cross-account policy)
# 5. VPC endpoint policy blocks the action
# 6. S3 Block Public Access settings override your policy
# 7. Object is encrypted with a KMS key you don't have access to

# 404 Not Found on S3 can mean:
# - Object doesn't exist (obvious)
# - You don't have s3:ListBucket permission (S3 returns 404 instead of 403!)
#   This is a SECURITY feature — denying list hides whether objects exist

# Diagnostic:
aws s3api head-object --bucket my-bucket --key my-key  # Check object exists
aws s3api get-bucket-policy --bucket my-bucket          # Check bucket policy
aws s3api get-bucket-encryption --bucket my-bucket      # Check encryption config
```

### DynamoDB and SQS Patterns

```bash
# DynamoDB throttling (ProvisionedThroughputExceededException):
# - Hot partition: one partition key gets disproportionate traffic
# - Burst capacity exhausted: sustained traffic above provisioned
# Diagnostic: CloudWatch → ConsumedReadCapacityUnits / ConsumedWriteCapacityUnits
# Fix: review partition key design, enable on-demand, or add DAX cache

# SQS messages not being processed:
# 1. Check DLQ: aws sqs get-queue-attributes --queue-url <url> --attribute-names All
# 2. Visibility timeout too low? Message becomes visible again before processing finishes
# 3. Lambda trigger: check for invocation errors in CloudWatch
# 4. Message format: is the consumer parsing the message correctly?
#    SQS wraps SNS messages in an extra JSON layer
```

**Incorrect (just retrying failed SQS messages without investigation):**

```python
# Blindly retrying — if the message is malformed, it will fail forever
# and eventually land in the DLQ anyway
for message in messages:
    try:
        process(message)
    except Exception:
        pass  # "It'll retry" — but WHY did it fail?
```

**Correct (inspecting the failure before retrying):**

```python
# Log the message content and error on failure — you need this to diagnose
for message in messages:
    try:
        process(message)
        sqs.delete_message(QueueUrl=queue_url, ReceiptHandle=message['ReceiptHandle'])
    except Exception as e:
        print(f"Failed to process message {message['MessageId']}: {e}")
        print(f"Message body: {message['Body'][:500]}")
        # Don't delete — let visibility timeout expire for retry
        # But if it's a poison message (will never succeed), detect and DLQ it
```

### Key Diagnostic Commands

```bash
# Identity and permissions
aws sts get-caller-identity                    # WHO am I?
aws iam simulate-principal-policy ...          # Can this role do this action?

# Logs
aws logs tail /aws/lambda/my-function --follow # Live tail Lambda logs
aws logs filter-log-events --filter-pattern "ERROR" ...

# CloudTrail (the audit log for ALL AWS API calls)
aws cloudtrail lookup-events \
    --lookup-attributes AttributeKey=EventName,AttributeValue=AssumeRole

# Debugging API calls
aws <service> <command> --debug 2>&1 | head -50  # Full HTTP request/response

# Service-specific health
aws lambda get-function --function-name my-func  # Lambda config
aws ecs describe-services --cluster my-cluster --services my-service  # ECS events
aws ec2 describe-instances --instance-ids i-xxx --query 'Reservations[].Instances[].State'
```
