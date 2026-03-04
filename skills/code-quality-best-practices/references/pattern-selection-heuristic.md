---
title: Select Design Patterns Using the Four-Question Heuristic
impact: HIGH
impactDescription: Prevents over-engineering and under-engineering, ensures every pattern earns its keep
tags: pattern-selection, heuristic, decision-framework, design-patterns
---

## Select Design Patterns Using the Four-Question Heuristic

Design patterns are solutions to recurring problems, not decorations. Every pattern has a cost. Before applying one, answer four questions. If you can't answer all four clearly, you don't need the pattern yet.

**Incorrect (pattern applied without the problem — over-engineering):**

```typescript
// Abstract Factory for... one database that will never change
interface DatabaseFactory {
  createConnection(): Connection;
  createQueryBuilder(): QueryBuilder;
  createMigrationRunner(): MigrationRunner;
}
class PostgresFactory implements DatabaseFactory { /* ... */ }
// No other factory will ever exist. This is 50 lines of indirection for nothing.

// Observer pattern for... two fixed subscribers
class OrderEventEmitter extends EventEmitter {
  onOrderCreated(handler: Handler) { this.on("created", handler); }
}
orderEvents.onOrderCreated(sendEmail);
orderEvents.onOrderCreated(updateAnalytics);
// Two fixed subscribers. Just call the two functions directly.
```

**Correct (four-question heuristic applied before choosing a pattern):**

```
1. What specific problem am I solving?
   → "Notification behavior varies by channel and new channels are added frequently."

2. What is the cost of NOT using this pattern?
   → "Every new channel requires modifying the notification function, risking
      regression in existing channels." (Cost is real and current, not theoretical.)

3. What does this pattern make harder?
   → "Debugging requires tracing through the strategy lookup. Stack traces are
      one level deeper." (Acceptable tradeoff for our use case.)

4. Will the next engineer recognize the pattern and understand why?
   → "Yes — Strategy is well-known, and the dispatch table is self-documenting."
```

```typescript
// Pattern justified: Strategy for notification channels (answers all 4 questions)
const channels: Record<ChannelType, NotificationChannel> = {
  email: new EmailChannel(smtpConfig),
  slack: new SlackChannel(webhookUrl),
  sms: new SmsChannel(twilioConfig),
};

// No pattern needed: two fixed logging destinations (fails question 2)
function logOrder(order: Order): void {
  console.log(`Order ${order.id} created`);
  auditLog.write(order); // Fixed. Direct calls are simpler.
}
```

If the cost of NOT using the pattern is theoretical ("what if someday..."), you don't need the pattern. Apply YAGNI. Add it when the third variation appears.
