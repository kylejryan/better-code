---
title: Choose the Right Messaging — SQS vs SNS vs EventBridge vs Kinesis
impact: CRITICAL
impactDescription: Wrong messaging pattern causes tight coupling, lost messages, or unscalable architectures
tags: messaging, sqs, sns, eventbridge, kinesis, async, decoupling, events
---

## Choose the Right Messaging — SQS vs SNS vs EventBridge vs Kinesis

Prefer async over sync. An API Gateway → Lambda → SQS → Lambda chain decouples the request from processing, enables retry/DLQ for failures, and smooths traffic spikes. The requesting Lambda returns immediately; the processing Lambda works at its own pace.

```
Need async task processing?
├─ Simple queue (one consumer) → SQS
├─ Fan-out (many consumers for same message) → SNS → SQS (each consumer gets its own queue)
├─ Complex routing rules → EventBridge (content-based routing, schema registry)
├─ Ordered processing → SQS FIFO
└─ High-throughput streaming → Kinesis (or Kafka via MSK)

Need real-time communication?
├─ WebSockets → API Gateway WebSocket API + Lambda or ECS
├─ Server-sent events → ECS/Fargate (Lambda can't hold connections)
└─ Push notifications → SNS mobile push
```

**Incorrect (synchronous Lambda chaining):**

```typescript
// Lambda A calls Lambda B directly — tight coupling, no retry, no backpressure
// If Lambda B fails, Lambda A fails. If Lambda B is slow, Lambda A times out.
export const handler = async (event) => {
  const result = await lambda.invoke({
    FunctionName: "ProcessorFunction",
    Payload: JSON.stringify(event),
  }).promise();
  return JSON.parse(result.Payload);
};
```

**Correct (decoupled with SQS):**

```typescript
// SST: Queue with consumer, automatic retry, DLQ for failed messages
const queue = new sst.Queue("ProcessingQueue", {
  consumer: "packages/functions/src/workers/process.handler",
});

// API handler enqueues and returns immediately
export const handler = async (event) => {
  await sqs.sendMessage({
    QueueUrl: Queue.ProcessingQueue.queueUrl,
    MessageBody: JSON.stringify(event.body),
  }).promise();
  return { statusCode: 202, body: JSON.stringify({ status: "accepted" }) };
};
```

**Pattern:** Emit events for state changes, not for queries. "Finding created," "scan completed," "user signed up" — these are events. "Get findings list" is a query; it goes through the API.

**SST context:** `sst.Queue` wraps SQS with Lambda consumer. `sst.Topic` wraps SNS. `sst.Bus` wraps EventBridge. `sst.Cron` wraps CloudWatch Events for scheduled tasks. These are the composition primitives for async architectures in SST.
