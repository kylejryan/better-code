---
title: Event-Driven Pattern — EventBridge for Decoupled Architectures
impact: CRITICAL
impactDescription: Enables independent service evolution, eliminates synchronous coupling between components
tags: eventbridge, events, event-driven, decoupling, sns, fan-out, sst
---

## Event-Driven Pattern — EventBridge for Decoupled Architectures

EventBridge is the backbone for event-driven architectures. Every significant system event publishes to EventBridge, and rules route events to handlers based on content. This decouples producers from consumers — adding a new consumer requires zero changes to the publisher, and if a consumer is down, events are still delivered when it recovers. Emit events for state changes, not for queries.

**Incorrect (direct service-to-service calls for events):**

```typescript
// When a finding is created, directly call notification and analytics services
// If either is down, the finding creation fails. Adding a new consumer requires code changes.
export const createFinding = async (event) => {
  const finding = await saveFinding(event.body);
  await notificationService.send(finding);    // Tight coupling
  await analyticsService.record(finding);     // More coupling
  await auditService.log(finding);            // Every new consumer = code change
  return { statusCode: 201, body: JSON.stringify(finding) };
};
```

**Correct (publish event, let consumers subscribe independently):**

```typescript
// SST EventBridge bus with independent subscribers
const bus = new sst.Bus("AppBus");

// Each consumer subscribes independently — adding a new consumer requires zero changes to the publisher
bus.subscribe("finding.created", "packages/functions/src/events/finding-created-notify.handler");
bus.subscribe("finding.created", "packages/functions/src/events/finding-created-analytics.handler");
bus.subscribe("scan.completed", "packages/functions/src/events/scan-completed.handler");

// Publisher just emits the event
export const createFinding = async (event) => {
  const finding = await saveFinding(event.body);
  await eventBridge.putEvents({
    Entries: [{
      Source: "app.findings",
      DetailType: "finding.created",
      Detail: JSON.stringify(finding),
      EventBusName: Bus.AppBus.eventBusName,
    }],
  }).promise();
  return { statusCode: 201, body: JSON.stringify(finding) };
};
```

**Pattern:** Emit events for state changes, not for queries. "Finding created," "scan completed," "user signed up" — these are events. "Get findings list" is a query; it goes through the API.
