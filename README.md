# Better Code

Agent Skills for engineering excellence — code quality best practices,
systems design patterns, and expert vulnerability analysis. Agent Skills are
folders of instructions, scripts, and resources that agents like Claude Code,
Cursor, Github Copilot, etc... can discover and use to write better code.

The skills in this repo follow the [Agent Skills](https://agentskills.io/)
format.

## Installation

```bash
npx skills add kylejryan/better-code
```

### Claude Code Plugin

You can also install the skills in this repo as Claude Code plugins

```bash
/plugin marketplace add kylejryan/better-code
/plugin install code-quality-best-practices@better-code
/plugin install systems-design-patterns@better-code
/plugin install vulnerability-analysis@better-code
```

## Available Skills

<details>
<summary><strong>code-quality-best-practices</strong></summary>

Distinguished Engineer-level code quality standards for writing, reviewing, and
refactoring code across any language. Enforces correctness, clarity, and
changeability as non-negotiable invariants.

**Use when:**

- Writing new code or functions
- Reviewing or refactoring existing code
- Designing class hierarchies or module boundaries
- Choosing design patterns or architecture
- Fixing bugs or addressing code smells
- Optimizing performance

**Categories covered:**

- Core Philosophy (Critical) — three invariants, KISS, DRY
- Architecture (Critical) — separation of concerns, dependency inversion, boundaries
- Code Quality Standards (Critical) — naming, function design, error handling, testing
- Anti-Patterns (High) — god objects, stringly-typed code, boolean blindness
- Design Patterns (High) — creational, structural, behavioral with selection heuristics
- Performance (High) — algorithmic complexity, optimization hierarchy, concurrency
- Code Smells (Medium-High) — structural, coupling, dispensable smell catalogs
- Refactoring (Medium) — safe methodology, conversation protocol

</details>

<details>
<summary><strong>systems-design-patterns</strong></summary>

Staff+ engineering patterns for maximum leverage per line of code. Build
primitives that make the next twenty features trivial instead of building each
feature from scratch.

**Use when:**

- Designing abstractions or shared libraries
- Building reusable primitives or frameworks
- Reducing code through architecture decisions
- Reviewing code for leverage and reuse potential
- Choosing between building vs configuring
- Establishing conventions and patterns

**Categories covered:**

- Leverage Mindset (Critical) — primitives over features, lines as liability
- Abstraction Design (Critical) — Three Cs, layers, extraction decisions
- Minimum Code Patterns (High) — convention over config, schema-driven, registries
- System Boundaries (High) — internal APIs as products, DRY across boundaries
- Code Reduction (Medium-High) — eliminate states, branching, ceremony
- Review Lens (Medium) — existence, placement, shape, minimum, composability

</details>

<details>
<summary><strong>vulnerability-analysis</strong></summary>

Expert-level security vulnerability analysis for source code auditing. Systematic
taint analysis from source to sink with false positive reduction discipline
calibrated against real-world VMM/systems code audits.

**Use when:**

- Reviewing code for security vulnerabilities
- Auditing authentication, authorization, or session logic
- Evaluating input handling and output encoding
- Assessing cryptographic implementations
- Reviewing file operations, command execution, or deserialization
- Checking for race conditions in concurrent code
- Analyzing dependency security and supply chain risks

**Categories covered:**

- Taint Analysis (Critical) — source-sink tracing, filter evaluation, FP reduction, threat model evaluation
- Memory Safety (Critical) — buffer overflow, use-after-free, integer overflow, unsafe Rust audit, reachability analysis
- Injection Attacks (Critical) — SQL, command, XSS, SSTI, path traversal, deserialization, SSRF
- Authentication & Authorization (High) — bypass, IDOR, session management, privileged setup phases
- Cryptographic Vulnerabilities (High) — weak algorithms, key management, entropy
- Concurrency & Race Conditions (High) — TOCTOU, atomicity, established patterns recognition
- Web & API Security (Medium-High) — CORS, CSRF, mass assignment, API hardening
- Supply Chain & Dependencies (Medium) — dependency confusion, ML model files

</details>

## Usage

Skills are automatically available once installed. The agent will use them when
relevant tasks are detected.

**Examples:**

```
Review this function for code quality
```

```
Refactor this class — it has too many responsibilities
```

```
Design a reusable abstraction for these three similar handlers
```

```
Audit this endpoint for security vulnerabilities
```

```
Review the authentication flow for bypass risks
```

## Skill Structure

Each skill follows the [Agent Skills Open Standard](https://agentskills.io/):

- `SKILL.md` - Required skill manifest with frontmatter (name, description, metadata)
- `AGENTS.md` - Compiled references document (generated)
- `references/` - Individual reference files
