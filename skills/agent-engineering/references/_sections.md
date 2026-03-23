# Section Definitions

This file defines the rule categories for agent-engineering. Rules are automatically assigned
to sections based on their filename prefix.

---

## 1. System Prompt Engineering (prompt)
**Impact:** CRITICAL
**Description:** Dense, structured prompts that earn their tokens on every LLM call. The system prompt is included in every iteration — optimize it ruthlessly.

## 2. Context Window Management (context)
**Impact:** CRITICAL
**Description:** Control what enters the context window. Less context that's more relevant produces better results than more context with noise.

## 3. Tool Design (tool)
**Impact:** CRITICAL
**Description:** Tool interface design, granularity, composition, and error handling. Tools are the agent's hands — bad tools make agents slow, expensive, and unreliable.

## 4. Agent Loop Architecture (loop)
**Impact:** HIGH
**Description:** Loop control, termination conditions, iteration reduction, parallel tool calls, and choosing between ReAct and Plan-and-Execute.

## 5. Model Selection & Routing (routing)
**Impact:** HIGH
**Description:** Route different agent steps to different model tiers based on complexity. Plan with large, execute with medium, classify with small.

## 6. Multi-Agent Systems (multi)
**Impact:** HIGH
**Description:** When and how to decompose into specialized sub-agents. Coordination patterns and inter-agent communication design.

## 7. Reliability Engineering (reliability)
**Impact:** CRITICAL
**Description:** Failure modes, guardrails, input/output validation, sandboxing, and cost circuit breakers.

## 8. Evaluation & Measurement (eval)
**Impact:** HIGH
**Description:** Metrics to track, evaluation frameworks, regression detection, and data-driven optimization.

## 9. Token Optimization (token)
**Impact:** HIGH
**Description:** Concrete techniques for reducing token consumption in prompts, tool results, and conversation history.
