---
title: Multi-Agent Coordination Patterns
impact: HIGH
impactDescription: Right coordination pattern determines parallelism, latency, and reliability
tags: multi-agent, orchestrator, pipeline, peer-review, coordination
---

## Multi-Agent Coordination Patterns

### Orchestrator + Workers

One orchestrator agent decomposes the task, dispatches sub-tasks to specialized workers, collects results, and synthesizes the final output. Workers are stateless — they receive a complete sub-task and return a complete result.

```
Orchestrator: "Analyze these 3 services for vulnerabilities"
  → Worker 1: analyze auth-service → findings
  → Worker 2: analyze data-service → findings
  → Worker 3: analyze api-gateway → findings
Orchestrator: synthesize all findings into prioritized report
```

**Advantage:** workers can run in parallel.
**Disadvantage:** orchestrator must produce good sub-task specifications.

### Pipeline

Each agent processes the output of the previous one. Agent 1 -> Agent 2 -> Agent 3.

```
Agent 1 (Gatherer): read code, collect relevant functions → code context
Agent 2 (Analyzer): trace data flows, identify vulns → raw findings
Agent 3 (Reporter): prioritize, format, add remediation → final report
```

**Advantage:** each agent has a focused role with minimal context.
**Disadvantage:** strictly sequential, total latency is the sum.

### Peer Review

Two agents work on the same task independently, then a third agent (or deterministic logic) compares and reconciles the results. Useful when reliability is critical and the task is subjective.

**Advantage:** catches errors through independent verification.
**Disadvantage:** 2x cost for the processing step. Use only when the reliability gain justifies the cost.

**Incorrect (passing full context between agents):**

```typescript
// Agent A dumps its entire context to Agent B
const agentAResult = await agentA.run(task);
await agentB.run({
  ...task,
  context: agentAResult.fullConversationHistory,  // 50,000 tokens of noise
});
```

**Correct (passing compact structured artifacts):**

```typescript
// Agent A outputs a structured summary
const findings = await agentA.run(task);
// findings = { analyzed: ["auth.go", "handler.go"], findings: [{file, line, severity, title}] }

await agentB.run({
  task: 'Generate remediation report',
  input: findings,  // 500 tokens of structured data
  // Agent B reads specific files with its own tools if it needs more detail
});
```
