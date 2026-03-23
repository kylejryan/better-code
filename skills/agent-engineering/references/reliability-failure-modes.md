---
title: Agent Failure Modes and Recovery
impact: CRITICAL
impactDescription: Understanding failure modes is prerequisite to building reliable agents
tags: reliability, failure-modes, hallucination, goal-drift, loops, error-amplification
---

## Agent Failure Modes and Recovery

An unreliable agent is worse than no agent — it produces results that look correct but aren't, requiring human verification of everything, which eliminates the automation benefit.

### Failure Mode Catalog

**Hallucinated tool arguments:** The model invents a file path, function name, or parameter value that doesn't exist.
**Fix:** Constrain tool parameters with enums, validate arguments before execution, return helpful errors that guide correction.

**Goal drift:** Over many iterations, the agent gradually drifts from the original task toward a related but different objective.
**Fix:** Re-inject the original goal periodically ("Reminder: your task is X. Current progress: Y."). Use a structured state object that tracks the plan and completed steps.

**Infinite loops:** The agent repeats the same action expecting different results.
**Fix:** Track action history, detect duplicates, force alternative approaches or terminate.

**Premature completion:** The agent declares the task complete when it's only partially done.
**Fix:** Define explicit completion criteria in the system prompt. Use validation steps that check the output against requirements before accepting it.

**Error amplification:** The agent encounters an error, reasons about it incorrectly, and takes actions that make the situation worse.
**Fix:** Limit retry attempts, provide clear error recovery instructions, escalate to a human or different agent after N failures.

**Context pollution:** A large tool result fills the context with irrelevant data, causing the model to lose track of the important information.
**Fix:** Truncate tool results, summarize periodically, use targeted tool calls that return only relevant data.

**Incorrect (no goal drift protection — agent wanders off task):**

```typescript
const messages = [
  { role: 'system', content: systemPrompt },
  { role: 'user', content: 'Find SQL injection vulnerabilities in auth.go' },
  // ... 10 iterations later, agent is refactoring error handling in utils.go
];
```

**Correct (periodic goal re-injection prevents drift):**

```typescript
function buildMessages(systemPrompt: string, goal: string, iteration: number, state: AgentState) {
  const messages = [{ role: 'system', content: systemPrompt }];
  if (iteration > 3) {
    messages.push({
      role: 'system',
      content: `Reminder — your task: ${goal}\nCompleted: ${state.completed.join(', ')}\nRemaining: ${state.remaining.join(', ')}`,
    });
  }
  messages.push(...state.recentHistory);
  return messages;
}
```
