---
title: Background Processing — SQS Queues with DLQ and Retry
impact: CRITICAL
impactDescription: Prevents data loss from transient failures and decouples request latency from processing time
tags: sqs, dlq, dead-letter-queue, background, async, retry, worker, queue
---

## Background Processing — SQS Queues with DLQ and Retry

For any operation that takes more than 3 seconds or might fail transiently, decouple it from the API handler. The API Lambda validates the request and enqueues to SQS, returning 202 Accepted immediately. A worker Lambda processes from the queue with automatic retries. After max retries, the message moves to a Dead Letter Queue for alerting and manual review. This pattern prevents client timeouts, enables retry without user intervention, and smooths traffic spikes.

**Incorrect (processing in the API handler with no retry):**

```typescript
// Long processing in the API handler — client times out, no retry on failure,
// if Lambda hits concurrency limit, requests are rejected
export const handler = async (event) => {
  const result = await expensiveScanOperation(event.body);  // Takes 30-60 seconds
  await saveResults(result);                                  // What if this fails?
  return { statusCode: 200, body: JSON.stringify(result) };   // Client waited 60 seconds
};
```

**Correct (enqueue immediately, process asynchronously):**

```typescript
// SST Queue with consumer and DLQ
const dlq = new sst.Queue("ScanDLQ");

const queue = new sst.Queue("ScanQueue", {
  consumer: {
    function: {
      handler: "packages/functions/src/workers/scan.handler",
      timeout: "150 seconds",
    },
  },
  cdk: {
    queue: {
      visibilityTimeout: Duration.seconds(900),   // >= 6x function timeout
      retentionPeriod: Duration.days(14),
      deadLetterQueue: {
        maxReceiveCount: 3,                        // 3 retries then DLQ
        queue: dlq.cdk.queue,
      },
    },
  },
});

// API handler returns immediately
export const handler = async (event) => {
  await sqs.sendMessage({
    QueueUrl: Queue.ScanQueue.queueUrl,
    MessageBody: JSON.stringify(event.body),
  }).promise();
  return { statusCode: 202, body: JSON.stringify({ status: "accepted" }) };
};
```

**Critical:** Visibility timeout must be >= 6x the consumer function timeout. If the function times out, SQS retries after the visibility timeout. If visibility timeout < function timeout, you get duplicate processing.

**Step Functions alternative:** When the processing involves branching, waiting, human approval, or orchestrating multiple services, use Step Functions instead of chaining Lambdas through SQS. Step Functions provide visual execution history, built-in retry with backoff per step, parallel execution branches, and wait states without holding compute.
