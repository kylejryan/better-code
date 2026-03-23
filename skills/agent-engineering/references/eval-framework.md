---
title: Evaluation Framework and Data-Driven Optimization
impact: HIGH
impactDescription: Systematic evaluation prevents prompt changes that regress common cases
tags: evaluation, framework, benchmarking, regression, a-b-testing, optimization
---

## Evaluation Framework and Data-Driven Optimization

### Representative Task Set

Maintain a set of 20-50 representative tasks that cover the agent's expected workload. Include easy tasks, hard tasks, edge cases, and adversarial inputs. Run the full set on every agent change.

### Automated Grading

For tasks with verifiable outputs (correct code, valid findings, successful operations), grade automatically. For subjective outputs, use an LLM judge with a rubric — but validate the judge's accuracy against human grades periodically.

**Incorrect (evaluating prompt changes by gut feel):**

```typescript
// "This prompt feels better" — ship it
const newPrompt = 'Analyze code for vulnerabilities. Be thorough.';
agent.setPrompt(newPrompt);
// No measurement of impact on success rate, cost, or latency
```

**Correct (benchmarking every prompt change against the full task set):**

```typescript
const taskSet = loadTaskSet('security-analysis-v2'); // 50 representative tasks
const baseline = await evaluateAgent(agent, taskSet);
agent.setPrompt(newPrompt);
const candidate = await evaluateAgent(agent, taskSet);

compare(baseline, candidate);
// Success rate: 92% → 94% (+2%)
// Median cost: $0.42 → $0.38 (-10%)
// Median latency: 12s → 11s (-8%)
// Regression on tasks: #17, #31 (investigate before shipping)
```

### Regression Detection

Track all metrics across agent versions. A change that improves success rate by 2% but increases cost by 50% might not be a net improvement. Dashboard the metrics and set alerts for regressions.

### Optimizing With Data

**Find the expensive runs.** Sort runs by cost. The top 10% most expensive runs often reveal: unnecessarily long loops, bloated tool results, or tasks the agent is poorly suited for. Fix these outliers first — they dominate average cost.

**Find the failure patterns.** Cluster failed runs by failure mode. If 60% of failures are "hallucinated file path," the fix is better file path validation in tools — not a better model or a longer prompt.

**Find the wasted iterations.** In successful runs, identify iterations that didn't contribute to the final output. Were they exploratory dead ends? Redundant information gathering? Failed tool calls that were retried? Each pattern suggests a different optimization.

**Benchmark prompt changes.** Every system prompt edit should be evaluated on the full task set. A change that fixes one edge case but regresses three common cases is a net loss. Prompt engineering without evaluation is guessing.
