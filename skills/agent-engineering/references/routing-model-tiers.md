---
title: Model Tier Selection and Routing Patterns
impact: HIGH
impactDescription: 3-5x cost reduction by routing simple steps to smaller models
tags: routing, model-selection, cost, opus, sonnet, haiku, escalation
---

## Model Tier Selection and Routing Patterns

Not every agent step needs the most powerful model. Routing different steps to different models based on complexity is one of the highest-leverage cost optimizations.

### When to Use Which Tier

**Large/frontier model (Opus-class):**
- Planning and complex reasoning steps
- Synthesizing findings across multiple sources
- Generating nuanced natural-language output
- Handling ambiguous or underspecified instructions

**Medium model (Sonnet-class):**
- Standard tool selection and execution
- Code reading and analysis
- Structured data extraction and transformation
- Most agent loop iterations
- Following well-defined plans

**Small/fast model (Haiku-class):**
- Classification and routing decisions (which tool? which sub-task?)
- Structured output extraction from tool results
- Validation and format checking
- Simple transformations and mappings
- Summarization of intermediate results

### Routing Patterns

**Plan with large, execute with medium:** Use the frontier model to create the plan and make complex decisions. Use the medium model to execute individual plan steps that are well-specified. Can cut cost 3-5x with minimal reliability loss.

**Classify with small, process with medium:** Use the fast model to classify incoming requests, route to the right sub-agent or tool, and validate outputs. Use the medium model for the actual work.

**Escalation:** Start with the medium model. If it fails, loops excessively, or reports low confidence, escalate to the frontier model with the accumulated context. Most tasks complete on the medium model; only hard cases pay for the frontier.

**Incorrect (using frontier model for every step):**

```typescript
// Every iteration uses opus — $15/MTok input
const planner = new Agent({ model: 'claude-opus-4-6' });    // Planning: needs opus ✓
const executor = new Agent({ model: 'claude-opus-4-6' });   // File reads: doesn't need opus ✗
const validator = new Agent({ model: 'claude-opus-4-6' });  // Format check: doesn't need opus ✗
// Cost: $2.40 per run
```

**Correct (routing each step to the appropriate tier):**

```typescript
const planner = new Agent({ model: 'claude-opus-4-6' });     // Complex reasoning ✓
const executor = new Agent({ model: 'claude-sonnet-4-6' });  // Standard execution ✓
const validator = new Agent({ model: 'claude-haiku-4-5' });  // Classification/validation ✓
// Cost: $0.55 per run — same reliability on the eval set
```
