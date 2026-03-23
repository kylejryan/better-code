---
title: ReAct vs Plan-and-Execute Loop Architecture
impact: HIGH
impactDescription: Choosing the right loop architecture can halve iterations for predictable tasks
tags: loop, react, plan-and-execute, architecture, hybrid
---

## ReAct vs Plan-and-Execute Loop Architecture

### ReAct (Reason + Act, Interleaved)

```
Think → Act → Observe → Think → Act → Observe → ... → Done
```

Each iteration: the model reasons about the current state, takes one action, observes the result, and repeats.

**Good for:** exploratory tasks where the next step depends on what you find.
**Bad for:** predictable multi-step tasks where the plan is known upfront.

### Plan-and-Execute

```
Plan → [Execute step 1, Execute step 2, ... Execute step N] → Synthesize → Done
```

The model creates a full plan first, then executes each step (possibly with a lighter-weight model or deterministic execution), then synthesizes results.

**Good for:** tasks with predictable structure where the plan can be determined upfront.
**Bad for:** tasks where early results change the plan.

### Hybrid (Recommended for Most Agents)

Plan at a high level, then use ReAct within each plan step. This gets the token efficiency of planning (fewer reasoning tokens per step) with the adaptability of ReAct (can adjust within a step).

```
Plan: [1. Gather code context, 2. Analyze for vulns, 3. Write report]
Step 1 (ReAct): read files, search patterns, batch gather → observe
Step 2 (ReAct): trace data flows, verify exploitability → observe
Step 3 (Execute): generate report from accumulated findings → done
```

The plan reduces per-step reasoning cost because the model doesn't have to re-derive the overall strategy on every iteration. ReAct within steps preserves adaptability to unexpected findings.

**Incorrect (pure ReAct for a predictable task — wastes iterations re-deriving the plan):**

```typescript
// Each iteration: "hmm, what should I do next?"
// Iteration 1: "I should probably read the code first" → reads one file
// Iteration 2: "Now I should look at another file" → reads another
// Iteration 3: "I think I need the tests too" → reads tests
// 8 iterations of incremental discovery for a 3-step task
```

**Correct (plan once, execute efficiently):**

```typescript
// Iteration 1: Plan
const plan = await llm.chat([
  { role: 'system', content: 'Create an execution plan. Do not call tools yet.' },
  { role: 'user', content: task },
]); // Output: "1. Read auth files 2. Trace data flow 3. Report findings"

// Iteration 2: Execute step 1 (batch)
await callTools([
  { tool: "read_file", args: { path: "auth.go" } },
  { tool: "read_file", args: { path: "handler.go" } },
  { tool: "read_file", args: { path: "middleware.go" } },
]); // Parallel execution

// Iteration 3: Execute steps 2-3 with full context → done
```
