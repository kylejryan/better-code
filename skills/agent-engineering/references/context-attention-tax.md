---
title: The Attention Tax and What Goes In the Context
impact: CRITICAL
impactDescription: Less context with higher relevance produces measurably better agent decisions
tags: context, attention, relevance, signal-to-noise, context-window
---

## The Attention Tax and What Goes In the Context

Every token in the context competes for the model's attention. Adding 10,000 tokens of marginally relevant code doesn't just cost money — it actively degrades the model's performance on the task because the signal-to-noise ratio drops. The model may attend to an irrelevant function instead of the critical one. This is not theoretical — it's measured and consistent.

**The rule: less context, more relevant context, better results.**

### What to Include

**Always include:**
- System prompt (compressed)
- Current task/goal (specific to this iteration)
- Results from the most recent tool calls (needed for the next decision)
- Accumulated state that the current decision depends on (e.g., "findings so far" if avoiding duplicates)

**Include only when needed:**
- Previous tool call results that are still relevant (prune completed sub-tasks)
- Reference material that the current step specifically requires
- Error messages from failed attempts (for retry logic)

**Never include:**
- Tool results from completed sub-tasks that don't inform the current decision
- Entire files when only a function or section is relevant
- Conversation history from turns that have been fully resolved
- Duplicate information (same content injected by multiple tools)
- Verbose tool outputs when a summary would suffice

**Incorrect (injecting entire file when only one function matters):**

```typescript
// Tool returns the full 500-line file
function readFile(path: string): ToolResult {
  return { content: fs.readFileSync(path, 'utf-8') }; // 500 lines, ~5000 tokens
}
// Agent asked "find the login handler" but now has 490 irrelevant lines in context
```

**Correct (returning only what the agent needs):**

```typescript
// Tool returns the relevant function with context
function readFunction(path: string, functionName: string): ToolResult {
  const ast = parse(fs.readFileSync(path, 'utf-8'));
  const fn = ast.findFunction(functionName);
  return {
    file: path,
    lines: `${fn.start}-${fn.end}`,
    content: fn.sourceCode,  // ~50 lines, ~500 tokens
  };
}
```
