---
title: Caching Strategies for Agent Efficiency
impact: HIGH
impactDescription: Eliminates redundant LLM calls and tool executions across runs
tags: routing, caching, prompt-caching, result-caching, semantic-caching
---

## Caching Strategies for Agent Efficiency

### Prompt Caching

If your provider supports it (Anthropic prompt caching, OpenAI cached responses), structure your prompts so the static prefix (system prompt + tool definitions) is identical across calls. The cached prefix is processed much faster and at reduced cost.

**Key:** keep the static prefix stable and identical. Any change to the prefix invalidates the cache. Put dynamic content (current task, accumulated state) after the static prefix.

**Incorrect (dynamic content mixed into static prefix, cache never hits):**

```typescript
const messages = [
  { role: 'system', content: `${systemPrompt}\n\nCurrent task: ${task}\nFindings so far: ${findings}` },
  // System prompt changes every call → cache miss every time
];
```

**Correct (static prefix separated from dynamic content):**

```typescript
const messages = [
  { role: 'system', content: systemPrompt },     // Identical every call → cache hit
  { role: 'system', content: toolDefinitions },   // Identical every call → cache hit
  { role: 'user', content: `Task: ${task}` },     // Dynamic — after cached prefix
  { role: 'assistant', content: `Progress: ${JSON.stringify(findings)}` },
];
// Static prefix cached at 90% discount, only dynamic content charged at full rate
```

### Result Caching

If the agent frequently calls the same tool with the same arguments (across runs, not within a single run), cache the results. Code file contents, database lookups, and external API responses are all cacheable for short TTLs.

**Incorrect:** every agent run re-reads the same config file, re-queries the same database schema, re-fetches the same API documentation.

**Correct:** cache tool results keyed on (tool_name, arguments_hash) with a TTL appropriate to the data's freshness requirements. Config files: minutes to hours. Database schemas: hours. API docs: days.

### Semantic Caching

For agents handling similar requests repeatedly, cache the (request pattern -> plan) mapping. If a new request matches a cached pattern, skip the planning step and go straight to execution.

This is most effective for agents that handle a relatively small set of request types (e.g., "analyze code for security" vs "generate test cases" vs "create documentation") where the high-level plan is the same even if the specific inputs differ.
