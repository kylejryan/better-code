---
name: software-testing
description: >
  Use this skill when designing test strategies, writing tests beyond basic unit
  tests, verifying software for production readiness, or improving test coverage
  and reliability. Triggers when the user asks about testing strategy, integration
  tests, end-to-end tests, contract tests, property-based tests, load tests,
  chaos testing, test architecture, flaky tests, test confidence, 'how do I test
  this,' 'how do I know this is safe to deploy,' 'my tests are flaky,' 'what
  should I test,' 'test coverage,' CI/CD test pipelines, or any question about
  software verification and validation. Also triggers when the user is shipping a
  change and wants confidence it won't break production. Primarily targets
  TypeScript and Go but principles apply universally. Do NOT use for writing basic
  unit tests for simple functions — this skill is for the harder testing questions.
metadata:
  author: kylejryan
  version: "1.0.0"
  organization: kylejryan
  date: March 2026
  abstract: >
    Comprehensive software testing guide covering test strategy, architecture,
    and production verification for building justified confidence to ship.
---

# Software Testing

## Core Philosophy

Tests exist for one reason: to give you justified confidence that your software does what you intend and won't break what already works when you change it.

The key word is "justified." Confidence without evidence is delusion. A green test suite that doesn't exercise real failure modes is theater. 100% code coverage where every test asserts `expect(true).toBe(true)` is worse than no tests — it creates false confidence.

The question is never "do we have enough tests?" The question is: "if this change introduced a bug, which test would catch it?" If you can't point to the specific test, you don't have coverage for that behavior — regardless of what the coverage percentage says.

## When to Apply

Use this skill when:
- Designing a testing strategy for a new service or feature
- Deciding what level of testing a change needs
- Writing integration, contract, property-based, or E2E tests
- Diagnosing flaky tests or test suite reliability issues
- Designing CI/CD test pipelines
- Verifying production readiness before shipping
- Improving confidence in an existing test suite

## Rule Categories by Priority

| # | Category | Prefix | Impact | Description |
|---|----------|--------|--------|-------------|
| 1 | Testing Philosophy | `philosophy` | CRITICAL | Core principles: confidence over coverage, test what matters |
| 2 | Test Strategy | `strategy` | CRITICAL | Risk-driven testing, the right test at the right level |
| 3 | Unit Tests | `unit` | HIGH | Effective unit test design: structure, naming, table-driven patterns |
| 4 | Integration Tests | `integration` | CRITICAL | Testing real component interactions with real dependencies |
| 5 | Contract Tests | `contract` | HIGH | Verifying service boundary agreements |
| 6 | Advanced Test Types | `advanced` | HIGH | Property-based, load, chaos, and snapshot testing |
| 7 | Test Architecture | `arch` | HIGH | Test doubles, data management, flaky test discipline |
| 8 | CI Pipeline | `pipeline` | MEDIUM-HIGH | Pipeline design, coverage ratchets, deploy gates |
| 9 | Production Verification | `prod` | MEDIUM-HIGH | Canary deploys, feature flags, observability as testing |

## Reference Guide

Detailed patterns and examples are in `references/`. Each file follows the format:

```
{prefix}-{topic}.md
```

Access them when you need specific implementation patterns for a testing category.

## The Testing Shape

The classic pyramid — many unit tests, fewer integration tests, even fewer E2E tests — was good advice when integration tests were slow and expensive. Modern tooling has changed the cost equation:

```
                    /\
                   /  \          E2E / Smoke tests (few, critical paths only)
                  /    \
                 /------\
                /        \       Integration tests (many, real interactions)
               /          \
              /------------\
             /              \    Focused unit tests (targeted, complex logic)
            /                \
           /------------------\
          /                    \  Static analysis + type system (zero runtime cost)
         /                      \
        /------------------------\
```

**The base is the type system and static analysis** — not unit tests. A well-typed codebase eliminates entire categories of bugs with zero runtime cost.

**The middle is integration tests** — not unit tests. The bugs that reach production are usually "these two components don't agree on the contract," not "this function computes the wrong value."

**Unit tests are for complex, branchy logic** — algorithms, parsers, state machines, business rules with many code paths.

**E2E tests are for critical path smoke tests** — the 3-5 journeys that, if broken, mean the product is fundamentally non-functional.

## Self-Review Checklist

Before shipping any change:

- [ ] New behavior has tests that would fail if the behavior regressed
- [ ] Edge cases are covered (empty input, boundary values, error cases)
- [ ] Integration tests cover real interaction paths, not just mocked versions
- [ ] No new flaky tests introduced
- [ ] All CI stages pass
- [ ] Coverage of changed files meets threshold
- [ ] Monitoring and alerts in place for new behavior
