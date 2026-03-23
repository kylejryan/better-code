---
title: Agent Guardrails and Safety Mechanisms
impact: CRITICAL
impactDescription: Prevents catastrophic failures from hallucinated or runaway agent actions
tags: reliability, guardrails, validation, sandboxing, circuit-breaker, safety
---

## Agent Guardrails and Safety Mechanisms

### Input Validation

Validate every tool call argument before executing it. Reject invalid file paths, out-of-range parameters, and malformed inputs at the tool layer — don't let them fail inside the tool and generate confusing error context.

**Incorrect:** pass the model's arguments directly to the tool implementation and let it throw.

**Correct:** validate arguments match expected types, ranges, and formats before executing. Return a structured validation error that tells the model exactly what to fix.

### Output Validation

After the agent produces its final result, validate it against the task requirements with deterministic checks (schema validation, required field presence, format correctness). Catch structural failures before they reach the user.

**Incorrect (passing unvalidated model arguments directly to tools):**

```typescript
async function executeTool(call: ToolCall) {
  // Model says read "/etc/passwd" — tool blindly executes
  return tools[call.name].execute(call.arguments);
}
```

**Correct (validating arguments before execution):**

```typescript
async function executeTool(call: ToolCall, allowedPaths: string[]) {
  const schema = tools[call.name].schema;
  const validation = validateArgs(call.arguments, schema);
  if (!validation.valid) {
    return { error: 'invalid_args', details: validation.errors, suggestion: validation.suggestion };
  }
  if (call.name === 'read_file' && !allowedPaths.some(p => call.arguments.path.startsWith(p))) {
    return { error: 'path_not_allowed', path: call.arguments.path, allowed: allowedPaths };
  }
  return tools[call.name].execute(call.arguments);
}
```

### Execution Sandboxing

Agent tool calls that modify state (write files, create PRs, send messages) should be sandboxed or require confirmation. A hallucinated tool call that reads a file is cheap to recover from. A hallucinated tool call that deletes a file is not.

**Tier tool actions by risk:**
- **Read-only tools:** execute freely (file reads, searches, queries)
- **Scoped mutations:** execute with validation (write to specific paths, update specific records)
- **Broad mutations:** require confirmation (delete operations, external API calls, message sends)

### Cost Circuit Breaker

Set hard limits on total tokens, total tool calls, and total elapsed time per agent run. When any limit is hit, terminate gracefully with a partial result and explanation rather than running until the API budget is exhausted.

```text
Limits:
  max_tokens: 200,000
  max_tool_calls: 50
  max_elapsed_seconds: 300

On breach: save partial results → log reason → return partial output with explanation
```
