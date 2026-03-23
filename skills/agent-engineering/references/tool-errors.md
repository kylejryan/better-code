---
title: Structured Error Handling in Tools
impact: HIGH
impactDescription: Structured errors enable self-correction instead of confusion spirals
tags: tool, errors, recovery, structured-errors, self-correction
---

## Structured Error Handling in Tools

Tools MUST return structured errors that the agent can reason about — not stack traces or raw exception messages.

**Incorrect:**

```json
"Error: ENOENT: no such file or directory, open '/src/auth.go'"
```

**Correct:**

```json
{
  "error": "file_not_found",
  "path": "/src/auth.go",
  "suggestion": "Did you mean /src/pkg/auth.go?"
}
```

The structured error tells the model: what went wrong (file_not_found), what the input was (/src/auth.go), and what to try next (the suggested path). The raw error forces the model to parse a string and derive the recovery strategy.

### Common Tool Errors to Handle Explicitly

- **Not found:** return what was searched for and suggest alternatives
- **Permission denied:** return what was attempted and whether retry would help
- **Rate limited:** return when to retry (backoff duration)
- **Timeout:** return how far the operation progressed and whether partial results are available
- **Invalid input:** return which parameter was invalid and what valid values look like

Each error type should guide the agent toward a specific recovery action rather than leaving it to guess. A tool that returns `{ "error": "not_found", "tried": "auth.go", "alternatives": ["pkg/auth.go", "internal/auth.go"] }` saves an iteration compared to the agent calling a search tool to find the right path.
