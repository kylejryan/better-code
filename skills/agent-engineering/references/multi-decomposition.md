---
title: When and How to Decompose Into Multiple Agents
impact: HIGH
impactDescription: Specialization improves reliability while enabling parallel execution
tags: multi-agent, decomposition, specialization, complexity, context-limits
---

## When and How to Decompose Into Multiple Agents

### Single Agent is Sufficient When

- The task has a linear flow (step 1 -> step 2 -> step 3)
- The tool set is <10 tools
- The context fits comfortably in one window
- One persona/expertise covers the full task

### Decompose Into Multiple Agents When

- Different phases require different tool sets (gathering vs analysis vs generation)
- Different phases require different expertise (security analysis vs code generation vs report writing)
- Phases can run in parallel (analyze service A while analyzing service B)
- The context window can't hold all the information simultaneously
- Reliability improves with specialization (a focused agent makes fewer mistakes)

### Inter-Agent Communication

**Minimize what's passed between agents.** The output of agent A should be a compact, structured artifact — not a dump of agent A's entire context. If agent A analyzed 5 files and found 3 vulnerabilities, pass the 3 findings (with file:line references), not the 5 files of raw code.

**Define schemas for inter-agent data.** Just like API contracts between services. The producing agent outputs data in a defined schema; the consuming agent expects that schema. This prevents drift and enables independent testing.

**Pass references, not content.** Instead of passing full source code from agent A to agent B, pass file paths/identifiers that agent B can read with its own tools. This keeps inter-agent messages small and gives agent B control over how much context to load.

**Incorrect (single agent with 25 tools and conflicting responsibilities):**

```typescript
const agent = new Agent({
  tools: [
    readFile, writeFile, searchCode, runTests,      // Code tools
    queryDB, migrateSchema, seedData,                // DB tools
    createPR, commentIssue, assignReviewer,          // GitHub tools
    sendSlack, createJiraTicket, updateDashboard,    // Notification tools
    // ... 12 more tools
  ],
  // Agent confused by tool selection, context overloaded
});
```

**Correct (decomposed into focused sub-agents):**

```typescript
const codeAgent = new Agent({
  tools: [readFile, writeFile, searchCode, runTests],
  systemPrompt: 'Code analysis and modification specialist.',
});
const reviewAgent = new Agent({
  tools: [createPR, commentIssue, assignReviewer],
  systemPrompt: 'Code review workflow specialist.',
});
const orchestrator = new Agent({
  subAgents: [codeAgent, reviewAgent],
  systemPrompt: 'Decompose tasks and dispatch to specialists.',
});
```
