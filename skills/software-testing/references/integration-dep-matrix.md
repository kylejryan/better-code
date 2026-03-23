---
title: Dependency Decision Matrix — What to Mock vs Keep Real
impact: HIGH
impactDescription: Eliminates wasted effort mocking things that should be real and vice versa
tags: integration, dependencies, mocking, testcontainers, decision-matrix
---

## Dependency Decision Matrix — What to Mock vs Keep Real

Not every dependency should be real in integration tests, and not every dependency should be mocked. The decision depends on whether you control the dependency and whether its real behavior is essential to what you're testing.

**Incorrect (mocking everything including your own database):**

```typescript
// Over-mocked integration test — tests nothing real
const mockDB = { query: jest.fn().mockResolvedValue([{ id: 1, name: "test" }]) };
const mockCache = { get: jest.fn().mockResolvedValue(null), set: jest.fn() };
const mockQueue = { publish: jest.fn() };
const mockLogger = { info: jest.fn(), error: jest.fn() };

const service = new FindingService(mockDB, mockCache, mockQueue, mockLogger);
const result = await service.create({ title: "XSS" });

expect(mockDB.query).toHaveBeenCalled();
expect(mockCache.set).toHaveBeenCalled();
expect(mockQueue.publish).toHaveBeenCalled();
// Tests that mocks were called — not that the system works
```

**Correct (real where feasible, mock only external boundaries):**

```typescript
// Real database and cache — mock only the external third-party API
const db = await TestDatabase.create();        // real postgres
const cache = new RedisTestContainer();         // real redis
const externalAPI = nock("https://api.vendor.com")  // mock external
    .post("/notify")
    .reply(200, { status: "sent" });

const service = new FindingService(db, cache, externalAPI.baseUrl);
const result = await service.create({ title: "XSS", severity: "critical" });

// Assert real behavior
expect(result.id).toBeDefined();
const fromDB = await db.findings.findById(result.id);
expect(fromDB).toBeDefined();
expect(externalAPI.isDone()).toBe(true);
```

Decision matrix:

| Dependency | Keep real | Mock/stub | Reason |
|---|---|---|---|
| Your database | Yes | Only if startup prohibitive | SQL bugs are #1 integration failure |
| Your message queue | Yes | Only for unit tests | Serialization and routing bugs are common |
| External third-party APIs | No | HTTP mock server | You can't control their availability |
| File system | Depends | Use temp directories | Real FS catches path issues |
| Time/clocks | No | Inject a clock interface | Deterministic time-dependent tests |
| Random/UUID generation | No | Inject a generator | Deterministic assertions |
