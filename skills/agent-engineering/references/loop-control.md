---
title: Agent Loop Control and Termination
impact: HIGH
impactDescription: Prevents runaway loops and wasted tokens from unbounded execution
tags: loop, control, termination, iteration-limit, loop-detection, budget
---

## Agent Loop Control and Termination

### Explicit Termination Conditions

The agent must know when to stop. Without explicit termination, agents loop indefinitely, burning tokens on diminishing returns.

**Termination signals:**
- **Task complete:** the agent has produced the required output/artifact
- **Max iterations reached:** hard cap prevents runaway loops (set at 2-3x expected iterations)
- **Budget exhausted:** token/cost limit exceeded
- **No progress:** the last N iterations didn't advance toward the goal (loop detection)
- **Unrecoverable error:** a tool failure that can't be retried or worked around

### Loop Detection

If the agent calls the same tool with the same arguments twice, or if its reasoning repeats the same plan without progress, it's stuck. Detect this and either:
1. Inject a hint ("You've already tried X. Consider Y instead.")
2. Force a different approach
3. Terminate with a partial result

### Iteration Budgets by Task Type

| Task Type | Expected Iterations |
|-----------|-------------------|
| Simple lookup/retrieval | 1-3 |
| Analysis/investigation | 5-10 |
| Multi-step generation | 8-15 |
| Complex multi-file changes | 15-25 |

**Incorrect (no termination conditions, agent runs forever):**

```typescript
async function agentLoop(task: string) {
  const messages = [{ role: 'user', content: task }];
  while (true) { // No exit condition!
    const response = await llm.chat(messages);
    if (response.toolCalls) {
      const results = await executeTools(response.toolCalls);
      messages.push(...results);
    }
  }
}
```

**Correct (explicit termination with max iterations and loop detection):**

```typescript
async function agentLoop(task: string, maxIterations = 15) {
  const messages = [{ role: 'user', content: task }];
  const actionHistory: string[] = [];
  for (let i = 0; i < maxIterations; i++) {
    const response = await llm.chat(messages);
    if (response.done) return response.result;
    if (response.toolCalls) {
      const key = JSON.stringify(response.toolCalls);
      if (actionHistory.includes(key)) {
        messages.push({ role: 'system', content: 'Loop detected. Try a different approach.' });
        continue;
      }
      actionHistory.push(key);
      const results = await executeTools(response.toolCalls);
      messages.push(...results);
    }
  }
  return { partial: true, reason: 'max_iterations_reached' };
}
```

If an agent regularly exceeds these ranges, the task decomposition or tool design needs work — not the iteration limit.
