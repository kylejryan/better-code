---
title: System Prompt and Output Token Compression
impact: HIGH
impactDescription: Concrete techniques that reduce prompt tokens 50-75% without losing behavior
tags: token, compression, prompt, terse, structured, abbreviation
---

## System Prompt and Output Token Compression

### Terse Instruction Style

```
Before: "When you encounter an error from a tool call, you should analyze the error
         message carefully, determine what went wrong, and try a different approach
         rather than retrying the exact same call."
After:  "On tool errors: analyze, adapt, don't retry same call."
```

### Structured Formats Over Prose

```
Before: "You should first read the relevant code files, then trace the data flow
         from user input to the dangerous function, then verify whether sanitization
         exists along the path, and finally report your findings."
After:  "Workflow: 1) Read code 2) Trace source→sink 3) Check sanitizers 4) Report"
```

### Define Abbreviations for Recurring Concepts

```
"Severity levels: C=critical, H=high, M=medium, L=low. Use these abbreviations in output."
```

**Incorrect (verbose reasoning before every tool call):**

```typescript
// Model output (85 tokens):
// "I need to check the authentication handler to see if there's a SQL injection
//  vulnerability. The best way to do this is to read the file that contains the
//  login function. Let me use the read_file tool to examine auth.go."
// { tool: "read_file", args: { path: "auth.go" } }
```

**Correct (terse tool calls, reasoning in thinking block):**

```typescript
// System prompt includes: "Call tools directly without explaining your reasoning."
// Model output (0 visible tokens, reasoning in thinking block):
// { tool: "read_file", args: { path: "auth.go" } }
// Saves 85 output tokens per iteration × 8 iterations = 680 tokens saved
```

### Controlling Output Verbosity

The model's output tokens are expensive (often 3-5x input token cost). Control output length:

**Terse tool call arguments:** The model doesn't need to explain why it's calling a tool. Add: "Call tools directly without explaining your reasoning."

**Structured output over prose.** If the agent's final output is data (findings, analysis, structured report), request JSON or a defined format. The model generates less filler and the output is more useful.

**Think step vs output step.** If the model supports extended thinking or scratchpad, use it for reasoning and keep the visible output terse. Reasoning tokens in thinking blocks are often cheaper or don't appear in the output at all.
