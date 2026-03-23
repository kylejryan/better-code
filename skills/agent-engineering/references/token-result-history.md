---
title: Tool Result and Conversation History Token Management
impact: HIGH
impactDescription: Prevents context bloat from accumulating tool results across iterations
tags: token, tool-results, history, summarization, truncation, pruning
---

## Tool Result and Conversation History Token Management

### Tool Result Compression

**Return summaries, not raw data.** If a tool reads a 500-line file, return only the relevant section with context markers:

```json
{ "file": "auth.go", "lines": "38-52", "content": "func Login(...) { ... }" }
```

Not the full 500-line file.

**Use structured formats.** JSON is more token-dense than natural language for the same information:

```
Natural language (45 tokens): "The function Login in auth.go at line 38 takes two
parameters: username of type string and password of type string. It returns an error."

JSON (28 tokens): {"func":"Login","file":"auth.go","line":38,"params":[
  {"name":"username","type":"string"},{"name":"password","type":"string"}],
  "returns":["error"]}
```

**Truncate with awareness.** When truncating tool results, preserve the beginning (headers, metadata) and the end (conclusions, final state). The middle is usually the lowest-value content.

**Incorrect (keeping full tool results in conversation history):**

```typescript
// After 8 iterations, history contains:
messages = [
  systemPrompt,                          // 500 tokens
  { tool: 'read_file', result: fullFileA },  // 3,000 tokens (done analyzing)
  { tool: 'read_file', result: fullFileB },  // 2,500 tokens (done analyzing)
  { tool: 'read_file', result: fullFileC },  // 4,000 tokens (done analyzing)
  { tool: 'search', result: allMatches },    // 2,000 tokens (done analyzing)
  // ... current work
]; // 12,000+ tokens of stale results competing for attention
```

**Correct (collapsing completed work into summaries):**

```typescript
messages = [
  systemPrompt,                          // 500 tokens
  { role: 'system', content:             // 200 tokens
    'Completed analysis: fileA (no issues), fileB (SQL injection at line 42), fileC (XSS at line 17). Search found 3 additional references to unsanitized input.' },
  { tool: 'read_function', result: currentFunction },  // 500 tokens (active work)
]; // 1,200 tokens total, all relevant to current decision
```

### Conversation History Management

**Prune completed sub-tasks.** When the agent finishes analyzing file A and moves to file B, replace the detailed back-and-forth about file A with a compact summary of the findings.

**Collapse tool call/result pairs.** Instead of keeping the full tool call arguments + full tool result in history, collapse to: "Called read_file(auth.go): found Login function at line 38 with SQL injection vulnerability."

**Limit history depth.** For agents with many iterations, keep only the last K turns of detailed history. Older turns are summarized into the state object. The goal is to maintain enough context for the current decision without carrying the full weight of every prior decision.
