---
title: Context Pruning Strategies and Token Budgets
impact: CRITICAL
impactDescription: Prevents context bloat that causes goal drift and ballooning costs
tags: context, pruning, budget, summarization, sliding-window, token-management
---

## Context Pruning Strategies and Token Budgets

### Pruning Strategies

**Sliding window:** Keep only the last N tool interactions. Old interactions scroll out. Simple, but loses context that may be needed later.

**Summarization checkpoints:** After every K iterations, summarize accumulated results into a compact state object and replace the detailed history.

```
Iteration 1-5: [full detail, 3000 tokens]
→ Summarize to: "Found 3 vulns in auth-service (SQL injection, XSS, path traversal).
   Analyzed files: auth.go, handler.go, middleware.go. Remaining: data-service."
→ Compressed: [200 tokens]
```

**Incorrect (carrying full history across all iterations):**

```typescript
// After 10 iterations, context has 30,000 tokens of stale tool results
const messages = [
  systemPrompt,                    // 500 tokens
  ...allPriorToolCallsAndResults,  // 25,000 tokens (mostly irrelevant)
  currentTask,                     // 200 tokens
]; // Model attends to old results instead of current task
```

**Correct (summarizing completed work, keeping only active context):**

```typescript
// After 10 iterations, stale results are summarized
const messages = [
  systemPrompt,                    // 500 tokens
  { role: 'system', content: summarizeFindings(completedSteps) }, // 300 tokens
  ...last3ToolCallsAndResults,     // 3,000 tokens (all relevant)
  currentTask,                     // 200 tokens
]; // 4,000 tokens total, high signal-to-noise ratio
```

**Relevance filtering:** Before injecting tool results into context, filter to only the portions relevant to the current sub-task. If the agent asked "read file X" to find function Y, inject only function Y's code, not the entire file.

**Tool result truncation:** Set maximum token limits on tool results. If a tool returns 50,000 tokens of log output, truncate to the most relevant 2,000 tokens with a note: "[truncated — showing last 2000 tokens of 50000]".

### Token Budget

Set an explicit token budget per agent run and track it:

```
Budget: 100,000 total tokens (input + output across all calls)
System prompt: 500 tokens × N calls
Tool results: variable, cap at 3,000 per result
Output: variable, typically 200-500 per call

At 8 iterations: 500×8 + 3000×8 + 400×8 = 31,200 tokens (within budget)
At 20 iterations: 500×20 + 3000×20 + 400×20 = 78,000 tokens (approaching limit)
```

If the agent regularly exceeds its budget, that's a design problem — not a resource allocation problem. Either the task decomposition is wrong, the tools are returning too much data, or the agent is looping unnecessarily.
