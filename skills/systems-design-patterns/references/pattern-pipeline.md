---
title: Compose Operations as Pipelines for Independent Testability
impact: MEDIUM-HIGH
impactDescription: Each step independently testable, pipeline reconfigurable, cross-cutting concerns applied once
tags: pipeline, composition, middleware, data-flow, leverage
---

## Compose Operations as Pipelines for Independent Testability

When operations share a common shape (take input, produce output, may fail), compose them as pipelines. Each step is independently testable, the pipeline is reconfigurable, and cross-cutting concerns (logging, timing, error handling) are applied once at the pipeline level.

**Incorrect (deeply nested function calls with interleaved concerns):**

```typescript
async function processDocument(raw: string): Promise<ProcessedDoc> {
  console.log("Starting processing...");
  const start = Date.now();

  const parsed = parse(raw);
  console.log(`Parsed in ${Date.now() - start}ms`);

  const normalized = normalize(parsed);
  console.log(`Normalized in ${Date.now() - start}ms`);

  const enriched = await enrich(normalized);
  console.log(`Enriched in ${Date.now() - start}ms`);

  const validated = validate(enriched);
  console.log(`Validated in ${Date.now() - start}ms`);

  return validated;
  // Logging is tangled with logic. Can't reorder steps. Can't test steps independently.
}
```

**Correct (pipeline composition — each step independent):**

```typescript
// Each step is a pure function with a common shape
type Step<TIn, TOut> = (input: TIn) => Promise<TOut> | TOut;

class Pipeline<TIn, TOut> {
  constructor(private readonly steps: Step<any, any>[]) {}

  async execute(input: TIn): Promise<TOut> {
    let result: any = input;
    for (const step of this.steps) {
      result = await step(result);
    }
    return result;
  }

  // Cross-cutting concern applied once
  withTiming(logger: Logger): Pipeline<TIn, TOut> {
    return new Pipeline(this.steps.map((step) => timed(step, logger)));
  }
}

// Compose the pipeline — reconfigurable, each step testable in isolation
const processDocument = new Pipeline([parse, normalize, enrich, validate])
  .withTiming(logger);

const result = await processDocument.execute(rawInput);
// Adding a new step = adding one entry. Reordering = moving one entry.
```

Benefits: each step is independently testable, the pipeline is reconfigurable, new steps are added without touching existing ones, and cross-cutting concerns are applied once at the pipeline level.