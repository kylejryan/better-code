---
title: Structure for Scanning and Avoid Instruction Debt
impact: CRITICAL
impactDescription: Faster model attention to relevant instructions, prevents prompt bloat
tags: prompt, structure, instruction-debt, system-prompt, organization
---

## Structure for Scanning and Avoid Instruction Debt

The model re-reads the system prompt on every call. Structure it so the relevant section is easy to locate — the model attends to structure:

```
[Role: 1 sentence]
[Goal: 1 sentence]
[Constraints: numbered list, 3-5 items max]
[Tool usage rules: only if non-obvious]
[Output format: only if structured output required]
```

Don't bury critical instructions in paragraphs. Don't repeat instructions in different phrasings "for emphasis" — repetition wastes tokens and the model doesn't need emphasis, it needs clarity.

**Separate static from dynamic context:**
- **Static** (changes never or rarely): role, constraints, output format, tool descriptions. Compress maximally — paid for on every call.
- **Dynamic** (changes per task or per iteration): current goal, accumulated findings, relevant code snippets. Precisely scoped to the current iteration — don't carry forward irrelevant information.

**Avoid instruction debt.** Every instruction added to handle an edge case is paid for on every single run, including the 95% of runs where that edge case doesn't occur. Before adding an instruction:
1. How often does this failure actually occur? (measure, don't guess)
2. Can tool design prevent it instead? (a tool that returns structured data eliminates "parse the output carefully")
3. Can post-processing catch it instead? (a validation step after the agent loop is cheaper than prompt tokens on every iteration)

If the failure occurs in <5% of runs, fix it outside the prompt.

**Incorrect (burying instructions in paragraphs):**

```typescript
const systemPrompt = `You are a helpful assistant that analyzes code. You have many tools available to help you. When analyzing code, you should be thorough and check for various issues. If you find something, explain it clearly. Remember to use your tools wisely and efficiently. Don't forget to check imports. Also make sure to verify that all variables are used. Additionally, consider performance implications of the code you're reviewing. One more thing - always check for security issues too. And remember, be concise in your output.`;
```

**Correct (structured for scanning):**

```typescript
const systemPrompt = `Code analyzer. Find bugs, security issues, and performance problems.

Constraints:
1. Report only confirmed issues with file:line references
2. Severity: C/H/M/L
3. Max 10 findings per run

Tools: read_file, search_code, list_files
Output: JSON array of {file, line, severity, description, fix}`;
```
