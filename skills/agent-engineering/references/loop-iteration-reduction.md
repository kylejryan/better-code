---
title: Reducing Loop Iterations
impact: HIGH
impactDescription: Each saved iteration cuts cost, latency, and failure probability simultaneously
tags: loop, iterations, optimization, batching, front-loading, parallel-tools
---

## Reducing Loop Iterations

Every iteration costs tokens and latency. The most impactful optimization is reducing the number of iterations required.

### Front-Load Information Gathering

Instead of: gather one piece -> reason -> gather next piece -> reason -> ...
Do: gather all needed pieces in one turn -> reason once -> act.

```
Wasteful (4 iterations):
  1. Read file A → observe
  2. Read file B → observe
  3. Read file C → observe
  4. Analyze all three → produce result

Efficient (2 iterations):
  1. Read files [A, B, C] (batch) → observe all three
  2. Analyze all three → produce result
```

**Incorrect (sequential single-file reads waste 3 iterations):**

```typescript
// Iteration 1: "I need to read auth.go"
await callTool("read_file", { path: "auth.go" });
// Iteration 2: "Now I need handler.go"
await callTool("read_file", { path: "handler.go" });
// Iteration 3: "And middleware.go"
await callTool("read_file", { path: "middleware.go" });
// Iteration 4: finally analyzes all three
```

**Correct (batch read in one iteration):**

```typescript
// Iteration 1: "I need all three files to analyze the auth flow"
await callTool("read_files", {
  paths: ["auth.go", "handler.go", "middleware.go"]
});
// Iteration 2: analyzes all three and produces result
```

### Provide Planning Space

Let the agent plan before acting. A single "think step" that produces a plan ("I need to: 1. read the config, 2. check the handler, 3. verify the test") followed by batched tool calls is cheaper than incremental discovery.

### Proactive Context Injection

Give the agent enough context to decide in one step. If the agent needs information X to make decision D, inject X proactively rather than waiting for the agent to ask for it. Proactive context injection trades input tokens (cheap, fast) for iteration count (expensive, slow).

### Parallel Tool Calls

If the model supports parallel tool calling, design your tools and prompts to enable it:

- **Enable parallelism by making tools independent.** If tool A's output is needed as input to tool B, they must be sequential. If they operate on independent data, they can be parallel.
- **Prompt for parallelism.** "Use parallel tool calls when operations are independent" can increase parallelism.
- **Measure the impact.** Parallel tool calls reduce latency by ~Nx for N parallel calls. They don't reduce token cost but dramatically improve user-perceived speed.

```
Sequential (required): read_file("auth.go") → extract function names → read specific functions
Parallel (better):     read_file("auth.go") + read_file("handler.go") + read_file("routes.go")
```
