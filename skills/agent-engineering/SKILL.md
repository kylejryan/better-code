---
name: agent-engineering
description: >
  Use this skill when designing, building, optimizing, or debugging AI agents —
  autonomous systems that use LLMs with tools to accomplish tasks. Triggers when
  the user asks about agent architecture, prompt engineering for agents, tool use
  optimization, token efficiency, context window management, agent loops,
  multi-agent systems, agent reliability, reducing agent cost, making agents
  faster, agent evaluation, or any discussion of building systems where an LLM
  orchestrates tool calls to achieve goals. Also triggers when an agent is
  working but is slow, expensive, unreliable, or producing inconsistent results.
  Do NOT use for simple single-turn LLM API calls without tool use or autonomy.
metadata:
  author: kylejryan
  version: "1.0.0"
  organization: kylejryan
  date: March 2026
  abstract: >
    Agent engineering discipline for building LLM-powered autonomous systems
    that are fast, cheap, and reliable through systematic optimization of
    prompts, tools, context, and loop architecture.
---

# Agent Engineering

## Core Philosophy

An agent is an LLM that decides which tools to call, in what order, with what arguments, based on intermediate results — looping until the task is complete. Every loop iteration costs tokens, latency, and money. Every unnecessary tool call, every bloated prompt, every redundant context injection is waste that compounds across thousands of executions.

The engineering discipline is: accomplish the task in the minimum number of LLM calls, with the minimum tokens per call, using the minimum tool invocations, while maintaining reliability. These four objectives are not in tension — wasteful agents are also unreliable agents, because every unnecessary step is another opportunity for the model to hallucinate, lose track of its goal, or choose the wrong tool.

## The Agent Performance Triangle

Every agent design decision involves three competing forces:

**Reliability** — does the agent accomplish the task correctly? This is the constraint, not the optimization target. Establish a reliability floor first (e.g., 95% correct on representative tasks), then optimize cost and speed without dropping below it.

**Cost** — how many tokens does the agent consume? Token cost = input tokens + output tokens across all LLM calls. Cost scales linearly with loop iterations and context size.

**Latency** — how long does the task take end-to-end? LLM inference time scales with input token count (time to first token) and output token count (generation time). Sequential tool calls add latency linearly; parallel tool calls add latency once.

The highest-leverage optimizations improve all three simultaneously: fewer loop iterations means lower cost, lower latency, AND fewer chances to go off-track.

## When to Apply

Use this skill when:
- Designing an agent's architecture (tools, prompts, loop structure)
- Optimizing an agent that's too slow, too expensive, or unreliable
- Writing system prompts for autonomous tool-using agents
- Designing tool interfaces that agents will consume
- Managing context windows across multi-step agent loops
- Building multi-agent systems with coordination
- Evaluating and benchmarking agent performance
- Debugging agent failure modes (loops, hallucinations, drift)

## Rule Categories by Priority

| # | Category | Prefix | Impact | Description |
|---|----------|--------|--------|-------------|
| 1 | System Prompt Engineering | `prompt` | CRITICAL | Dense, structured prompts that earn their tokens on every LLM call |
| 2 | Context Window Management | `context` | CRITICAL | Control what enters context — less is more when it's more relevant |
| 3 | Tool Design | `tool` | CRITICAL | Tools are the agent's hands — interface, granularity, and error design |
| 4 | Agent Loop Architecture | `loop` | HIGH | Loop control, iteration reduction, parallel calls, ReAct vs Plan-and-Execute |
| 5 | Model Selection & Routing | `routing` | HIGH | Right model for each step — plan with large, execute with medium, classify with small |
| 6 | Multi-Agent Systems | `multi` | HIGH | Decomposition, coordination patterns, and inter-agent communication |
| 7 | Reliability Engineering | `reliability` | CRITICAL | Failure modes, guardrails, and preventing runaway agents |
| 8 | Evaluation & Measurement | `eval` | HIGH | Metrics, benchmarking, and data-driven optimization |
| 9 | Token Optimization | `token` | HIGH | Concrete techniques for reducing token consumption |

## Reference Guide

Detailed patterns and examples are in `references/`. Each file follows the format:

```
{prefix}-{topic}.md
```

Access them when you need specific implementation patterns for a category.

## Agent Design Checklist

**System prompt:**
- [ ] Under 500 tokens for the static portion
- [ ] Every sentence traces to a measurable behavior improvement
- [ ] Structured for scanning (not paragraphs of prose)
- [ ] No redundant instructions

**Tool design:**
- [ ] Names describe the action, not the resource
- [ ] Parameters are typed, constrained, and defaulted
- [ ] Returns are structured data, not prose — only fields the agent uses
- [ ] Batch variants exist for frequently-repeated calls
- [ ] Errors are structured with recovery suggestions

**Context management:**
- [ ] Explicit token budget per run, tracked and enforced
- [ ] Tool results truncated/filtered to relevant sections
- [ ] Completed sub-task history summarized, not carried verbatim

**Loop architecture:**
- [ ] Explicit termination conditions defined
- [ ] Max iteration limit set (2-3x expected)
- [ ] Loop detection for repeated actions
- [ ] Parallel tool calls used where tools are independent
- [ ] Front-loaded information gathering (batch reads)

**Reliability:**
- [ ] Tool call arguments validated before execution
- [ ] Output validated against task requirements
- [ ] State-modifying tools sandboxed or gated
- [ ] Cost circuit breaker prevents runaway spending

**Evaluation:**
- [ ] Representative task set (20-50 tasks)
- [ ] Per-run and aggregate metrics tracked
- [ ] Prompt changes benchmarked on full task set
- [ ] Top 10% expensive runs analyzed for optimization
