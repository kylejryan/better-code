# Systems-Level Code Leverage

## Structure

```
systems-level-code-leverage/
  SKILL.md       # Main skill file - read this first
  AGENTS.md      # This navigation guide
  CLAUDE.md      # Symlink to AGENTS.md
  references/    # Detailed reference files
```

## Usage

1. Read `SKILL.md` for the main skill instructions
2. Browse `references/` for detailed documentation on specific topics
3. Reference files are loaded on-demand - read only what you need

Every line you write is a line someone must read, understand, test, debug, and maintain. The goal: engineers working in this codebase should feel like they're assembling, not building. The hard problems are solved once, in the right place, and everything else is composition.

## When to Apply

Apply leverage thinking when:
- Designing abstractions or shared libraries
- Building reusable primitives or frameworks
- Choosing between building new code vs configuring existing code
- Reviewing code for leverage and reuse potential
- Establishing conventions and patterns across a codebase
- Evaluating whether code should be data instead

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Leverage Mindset | CRITICAL | `mindset-` |
| 2 | Abstraction Design | CRITICAL | `abstraction-` |
| 3 | Minimum Code Patterns | HIGH | `pattern-` |
| 4 | System Boundaries | HIGH | `boundary-` |
| 5 | Code Reduction | MEDIUM-HIGH | `reduce-` |
| 6 | Review Lens | MEDIUM | `review-` |

## Core Principles

**Think in Primitives**: Features are one-time. Primitives are forever. Decompose every feature: `Feature = Primitive A + Primitive B + Glue(A, B)`. Build A and B as reusable. Keep the glue thin.

**Lines of Code Are Liability**: Before writing anything, ask: Does this already exist? Should this be data instead of code? How many future features does this unlock? What's the smallest useful version?

**The Three Cs**: Every abstraction must be Composable (combines without special-casing), Constraining (makes incorrect usage hard), and Complete (handles the full problem within its boundary).

**Thin Glue Principle**: Application-specific code should be 10-15% of the codebase. If feature code is 70%, every new feature costs as much as the first — there's no compounding.

## How to Use

Read individual reference files for detailed explanations and examples:

```
references/mindset-primitives.md
references/abstraction-three-cs.md
references/pattern-registry.md
references/reduce-eliminate-states.md
references/_sections.md
```

Each reference file contains:
- Brief explanation of the principle and why it matters
- Incorrect approach with explanation
- Correct approach with explanation
- Additional context and trade-offs

## Code Leverage Checklist

Before committing code, verify:
- Searched for existing solutions (codebase, stdlib, packages) before writing new code
- Logic that could be data/config IS data/config
- New primitives are named for what they ARE, not where they're USED
- Abstractions satisfy the Three Cs (Composable, Constraining, Complete)
- Vocabulary doesn't leak across layers
- Adding the next similar feature requires configuration, not code
- No boolean soup — states are modeled explicitly
- Branching is minimized via polymorphism, dispatch, defaults
- Feature-specific code is thin glue between reusable pieces
- Every function, class, and module earns its existence
