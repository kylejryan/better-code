---
title: Test Doubles — Fakes Over Mocks
impact: HIGH
impactDescription: Catches real behavior bugs that mocks systematically miss
tags: architecture, test-doubles, mock, stub, fake, dependency-injection
---

## Test Doubles — Fakes Over Mocks

Mocks verify that specific methods were called with specific arguments — they assert on implementation details, not behavior. When you refactor the implementation (without changing behavior), mock-heavy tests break. Fakes are working simplified implementations that have real behavior. They're more work to build but dramatically more valuable.

**Incorrect (heavy mocking — asserts on implementation, not behavior):**

```typescript
test("create finding saves and notifies", async () => {
    const mockRepo = { save: jest.fn().mockResolvedValue({ id: "1" }) };
    const mockNotifier = { notify: jest.fn() };
    const mockLogger = { info: jest.fn(), error: jest.fn() };
    const mockCache = { invalidate: jest.fn() };

    const service = new FindingService(mockRepo, mockNotifier, mockLogger, mockCache);
    await service.create({ title: "XSS", severity: "critical" });

    // Tests implementation details — HOW it works, not WHAT it does
    expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({
        title: "XSS",
    }));
    expect(mockNotifier.notify).toHaveBeenCalledTimes(1);
    expect(mockCache.invalidate).toHaveBeenCalledWith("findings:list");
    // Refactor the internals → all these assertions break
});
```

**Correct (fake implementation — tests real behavior):**

```typescript
// A fake repository with real (in-memory) behavior
class FakeFindinRepo implements FindingRepository {
    private store = new Map<string, Finding>();

    async save(finding: Finding): Promise<Finding> {
        const id = randomUUID();
        const saved = { ...finding, id };
        this.store.set(id, saved);
        return saved;
    }

    async findById(id: string): Promise<Finding | null> {
        return this.store.get(id) ?? null;
    }

    async count(): Promise<number> {
        return this.store.size;
    }
}

test("create finding persists and is retrievable", async () => {
    const repo = new FakeFindinRepo();
    const service = new FindingService(repo);

    const created = await service.create({ title: "XSS", severity: "critical" });

    // Tests WHAT happened — a finding was created and is retrievable
    const retrieved = await repo.findById(created.id);
    expect(retrieved).toBeDefined();
    expect(retrieved!.title).toBe("XSS");
    expect(await repo.count()).toBe(1);
});
```

```go
// Go: stub for simple returns, fake for behavior
type StubClock struct{ now time.Time }
func (s StubClock) Now() time.Time { return s.now }

type FakeUserRepo struct {
    store map[string]User
    mu    sync.RWMutex
}
func (f *FakeUserRepo) Create(ctx context.Context, u User) error {
    f.mu.Lock()
    defer f.mu.Unlock()
    if _, exists := f.store[u.Email]; exists {
        return ErrDuplicateEmail
    }
    f.store[u.Email] = u
    return nil
}
```

Rule of thumb: if you're mocking more than 2 dependencies in a single test, move up to an integration test with real or fake dependencies.
