---
title: Tool Granularity and Composition Patterns
impact: CRITICAL
impactDescription: Right-sized tools reduce iterations by 2-5x through batching and composition
tags: tool, granularity, batching, composition, parallel, compound-tools
---

## Tool Granularity and Composition Patterns

### Getting Granularity Right

**Too coarse:** one tool that does everything. The model can't express precise intent, and the tool output includes everything regardless of need.

```
Bad: analyze_code(repo_path) → returns ALL findings for ALL files
```

**Too fine:** many tiny tools that each do one micro-operation. The agent needs 15 tool calls for a task that should take 3.

```
Bad: open_file(path), read_line(line_num), close_file(path) → 3 calls to read one function
```

**Right granularity:** each tool completes a meaningful sub-task and returns what's needed for the next decision.

```
Good: read_function(file_path, function_name) → returns the function's source code
Good: search_code(pattern, scope) → returns matching locations with surrounding context
Good: query_findings(filters) → returns filtered findings list
```

**The test:** if the agent typically calls tool A immediately followed by tool B with the output of A, merge them into one tool. If a tool returns data that the agent always filters the same way, build the filter into the tool.

**Incorrect (too-fine granularity forcing 3 calls for one operation):**

```typescript
// Agent needs 3 sequential calls to read one function
const result1 = await callTool("open_file", { path: "auth.go" });
const result2 = await callTool("find_function", { handle: result1.handle, name: "Login" });
const result3 = await callTool("read_range", { handle: result1.handle, start: result2.line, end: result2.endLine });
await callTool("close_file", { handle: result1.handle });
```

**Correct (right-sized tool completing a meaningful sub-task):**

```typescript
// Agent gets what it needs in one call
const result = await callTool("read_function", {
  file: "auth.go",
  function_name: "Login",
}); // Returns: { file, lines: "38-72", content: "func Login(...) { ... }", language: "go" }
```

### Composition Patterns

**Batch operations:** If the agent frequently calls the same tool N times with different inputs, add a batch variant. One tool call with 10 inputs is faster and cheaper than 10 tool calls with 1 input each.

```
Instead of:  read_file("auth.go") → read_file("handler.go") → read_file("middleware.go")
Provide:     read_files(["auth.go", "handler.go", "middleware.go"]) → [result, result, result]
```

**Compound operations:** If a sequence of 2-3 tool calls always occurs together, create a compound tool that performs the sequence atomically.

```
Instead of:  search_code("parseJSON") → read_function(locations[0])
Provide:     search_and_read("parseJSON") → code of matching functions with context
```

**Streaming results:** For tools that may return large result sets, support pagination. Return a page of results with a `has_more` flag. The agent decides whether to fetch more or proceed with what it has.
