# Distinguished Engineer Code Quality

## Structure

```
distinguished-engineer-code-quality/
  SKILL.md       # Main skill file - read this first
  AGENTS.md      # This navigation guide
  CLAUDE.md      # Symlink to AGENTS.md
  references/    # Detailed reference files
```

## Usage

1. Read `SKILL.md` for the main skill instructions
2. Browse `references/` for detailed documentation on specific topics
3. Reference files are loaded on-demand - read only what you need

Every line of code must satisfy three invariants simultaneously: correctness, clarity, and changeability. They are not in tension — at the DE level, they reinforce each other.

## When to Apply

Apply these standards when:
- Writing any new code or functions
- Reviewing or refactoring existing code
- Designing class hierarchies or module boundaries
- Choosing between design patterns
- Fixing bugs or addressing code smells
- Optimizing performance or algorithmic complexity
- Handling errors or defining failure modes

## Three Invariants

Every piece of code must satisfy all three:

1. **Correctness**: Does exactly what it claims. Handles every edge case. Fails explicitly when it cannot proceed. Silent failures are bugs.
2. **Clarity**: A competent engineer unfamiliar with the codebase can understand intent, contract, and failure modes within 30 seconds.
3. **Changeability**: Blast radius of a change is proportional to its semantic scope. One-line requirement changes should be one-line code changes.

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Core Philosophy | CRITICAL | `philosophy-` |
| 2 | Architecture | CRITICAL | `arch-` |
| 3 | Code Quality Standards | CRITICAL | `quality-` |
| 4 | Anti-Patterns | HIGH | `anti-` |
| 5 | Design Patterns | HIGH | `pattern-` |
| 6 | Performance | HIGH | `perf-` |
| 7 | Code Smells | MEDIUM-HIGH | `smell-` |
| 8 | Refactoring | MEDIUM | `refactor-` |

## Core Principles

**KISS**: Prefer the boring solution that works over the clever solution that impresses. Every abstraction must pay for itself — if it doesn't simplify at least three call sites or eliminate a class of bugs, remove it.

**DRY** (knowledge, not text): Two identical-looking code blocks that change for different reasons are NOT duplication — they are coincidence. Tolerate duplication until you see it three times.

**Parse, don't validate**: Push validation to the boundary and produce typed, validated domain objects. Internal code operates on objects that are correct by construction.

**Fail fast**: Validate preconditions at the top. Return early for error cases. The happy path should be the least-indented path.

## How to Use

Read individual reference files for detailed explanations and code examples:

```
references/philosophy-kiss.md
references/quality-naming.md
references/arch-dependency-inversion.md
references/pattern-selection-heuristic.md
references/_sections.md
```

Each reference file contains:
- Brief explanation of the principle and why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Additional context, edge cases, or trade-offs

## Self-Review Checklist

After writing code, verify:
- Every function does exactly one thing
- Every name communicates intent
- No function exceeds 3 parameters
- Error handling is explicit and typed
- No dead code or commented-out blocks
- No premature abstraction (Rule of Three respected)
- Algorithmic complexity is appropriate
- Dependencies flow inward (high-level to low-level)
- The code is testable without mocking frameworks
- A competent engineer can understand any function in 30 seconds
