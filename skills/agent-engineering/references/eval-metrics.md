---
title: Agent Performance Metrics
impact: HIGH
impactDescription: You cannot optimize what you don't measure — these metrics enable data-driven improvement
tags: evaluation, metrics, cost, latency, reliability, efficiency
---

## Agent Performance Metrics

### Per-Run Metrics

- **Total tokens** (input + output across all LLM calls)
- **Total LLM calls** (iterations)
- **Total tool calls**
- **Total latency** (end-to-end wall clock)
- **Task success** (binary: did it accomplish the goal?)
- **Output quality** (graded: how good was the result? requires a rubric or judge)
- **Cost** ($)

### Aggregate Metrics

- **Success rate** (% of runs that accomplish the goal)
- **Mean/median tokens** per successful run
- **Mean/median latency** per successful run
- **Mean/median iterations** per successful run
- **Cost per successful task**
- **Failure mode distribution** (why do failures happen?)

### Efficiency Metrics

- **Tokens per unit of useful output** (tokens per finding, tokens per file analyzed, tokens per test written)
- **Tool calls per task** (lower is better if reliability holds)
- **Wasted iterations** (iterations that didn't advance toward the goal)
- **Context utilization** (what % of context tokens were actually relevant to the current decision?)

The most actionable metric is **cost per successful task**. It naturally combines cost efficiency and reliability — an unreliable agent has a high cost-per-success even if individual runs are cheap, because failed runs still cost money.

**Incorrect (tracking only success/failure — no cost visibility):**

```typescript
function logRun(result: AgentResult) {
  console.log(`Task: ${result.taskId} — ${result.success ? 'PASS' : 'FAIL'}`);
}
```

**Correct (comprehensive per-run metrics enabling optimization):**

```typescript
function logRun(result: AgentResult) {
  metrics.record({
    taskId: result.taskId,
    success: result.success,
    totalTokens: result.inputTokens + result.outputTokens,
    llmCalls: result.iterations,
    toolCalls: result.toolCallCount,
    latencyMs: result.endTime - result.startTime,
    costUsd: calculateCost(result),
    failureMode: result.success ? null : classifyFailure(result),
  });
}
// Now you can: sort by cost, cluster failures, find wasted iterations
```
