---
title: Apply Creational Patterns Only When Object Creation Complexity Demands Them
impact: HIGH
impactDescription: Eliminates telescoping constructors, enables flexible object creation without coupling to concrete types
tags: factory, builder, singleton, prototype, creational, design-patterns
---

## Apply Creational Patterns Only When Object Creation Complexity Demands Them

Creational patterns solve specific object creation problems. Using them without the problem is over-engineering. A constructor is fine when there's one concrete type.

**Factory Method** — Use when object creation logic varies by type and callers shouldn't know the concrete class. Avoid when there's only one type.

**Builder** — Use when construction requires many optional parameters or cross-field validation. Avoid when the object has 3 or fewer required fields.

**Singleton** — Use when exactly one instance must exist AND be globally accessible (logging, config). Prefer dependency injection instead. Singletons are global mutable state in disguise.

**Incorrect (unnecessary factory for one type, singleton for convenience):**

```typescript
// Over-engineered: only one type of logger exists
class LoggerFactory {
  static create(type: string): Logger {
    if (type === "console") return new ConsoleLogger();
    throw new Error(`Unknown: ${type}`);
  }
}
const logger = LoggerFactory.create("console"); // Just use new ConsoleLogger()

// Singleton for convenience, not necessity
class UserService {
  private static instance: UserService;
  static getInstance(): UserService {
    if (!this.instance) this.instance = new UserService();
    return this.instance;
  }
}
```

**Correct (patterns applied where they solve real problems):**

```typescript
// Factory: creation varies by type, callers shouldn't know concrete classes
interface NotificationChannel {
  send(message: Message): Promise<void>;
}

function createChannel(config: ChannelConfig): NotificationChannel {
  switch (config.type) {
    case "email": return new EmailChannel(config.smtpSettings);
    case "slack": return new SlackChannel(config.webhookUrl);
    case "sms": return new SmsChannel(config.twilioConfig);
  }
}

// Builder: many optional params with cross-field validation
const query = new QueryBuilder("users")
  .select(["id", "name", "email"])
  .where("status", "=", "active")
  .orderBy("created_at", "desc")
  .limit(50)
  .build(); // Validates: can't ORDER BY a column not in SELECT
```

Before applying any creational pattern, verify: there's real creation complexity, a constructor won't suffice, and the pattern simplifies the call sites.
