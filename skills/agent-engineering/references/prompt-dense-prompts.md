---
title: Make System Prompts Dense, Not Long
impact: CRITICAL
impactDescription: 75% token reduction on the most expensive per-call element
tags: prompt, system-prompt, token-efficiency, compression, density
---

## Make System Prompts Dense, Not Long

The system prompt is the most token-expensive element in your agent — it's included in every single LLM call across the entire agent loop. A 2,000-token system prompt in an agent that makes 8 LLM calls costs 16,000 input tokens just for the prompt. Every sentence must earn its tokens.

**Incorrect (verbose, ~340 tokens):**

```text
You are a helpful security analysis assistant. Your role is to help users
identify vulnerabilities in their code. You should be thorough and careful
in your analysis. When you find a potential vulnerability, you should
explain what it is, why it's dangerous, and how to fix it. You have access
to several tools that can help you accomplish this task. Please use these
tools wisely and efficiently. Remember to always consider the context of
the code you're analyzing and don't report false positives. Be sure to
check for common vulnerability types including SQL injection, XSS, command
injection, path traversal, and others.
```

**Correct (dense, ~85 tokens):**

```text
Security code auditor. Analyze code for exploitable vulnerabilities.
Use tools to read code, trace data flows, and verify findings.
Report only confirmed vulnerabilities with: location, root cause,
exploit scenario, and fix. No theoretical findings without traced paths.
```

The dense version carries the same behavioral directives in 75% fewer tokens — and it's clearer because there's no filler to parse through. Apply a ruthless cost-benefit to every sentence: does it measurably improve agent behavior? If you can't point to a failure case it prevents, cut it.
