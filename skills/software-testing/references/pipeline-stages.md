---
title: Staged CI Pipeline with Fail-Fast
impact: MEDIUM-HIGH
impactDescription: Faster feedback loops and reduced CI cost through progressive validation
tags: pipeline, ci, stages, fail-fast, static-analysis, deploy-gates
---

## Staged CI Pipeline with Fail-Fast

Structure your CI pipeline as stages with increasing scope and cost. If the cheap fast stage fails, don't run the expensive slow stages. Every stage is a gate — only proceed if the previous stage passes.

**Incorrect (single monolithic test stage):**

```yaml
# All tests run in one undifferentiated stage
test:
  script:
    - npm run lint          # 10 seconds
    - npm run typecheck     # 15 seconds
    - npm run test:unit     # 30 seconds
    - npm run test:integration  # 3 minutes (spins up databases)
    - npm run test:e2e      # 5 minutes (deploys to staging)
    # If lint fails, still waits for all 8+ minutes of subsequent stages
    # No parallelism, no fail-fast between stages
```

**Correct (staged pipeline with fail-fast gates):**

```yaml
# Stage 1: Static Analysis (seconds) — catches obvious issues cheaply
static-analysis:
  parallel:
    - typecheck:
        script: tsc --noEmit
    - lint:
        script: eslint . && biome check .
    - security:
        script: semgrep --config auto src/

# Stage 2: Unit Tests (seconds to low minutes) — requires Stage 1 pass
unit-tests:
  needs: [static-analysis]
  parallel:
    - unit:
        script: vitest run --project unit
    - property:
        script: vitest run --project property

# Stage 3: Integration Tests (minutes) — requires Stage 2 pass
integration-tests:
  needs: [unit-tests]
  services:
    - postgres:16
    - redis:7
  parallel:
    - api-integration:
        script: vitest run --project integration
    - contract-verification:
        script: npm run test:contracts

# Stage 4: E2E Smoke Tests (minutes) — requires Stage 3 pass
e2e-smoke:
  needs: [integration-tests]
  script: |
    deploy --env ephemeral
    npm run test:e2e:critical-paths
    teardown --env ephemeral

# Stage 5: Performance Gate (optional) — requires Stage 3 pass
performance:
  needs: [integration-tests]
  allow_failure: false
  script: |
    k6 run --threshold 'p99<200' load-tests/api.js
```

Fail fast: stage 1 failure (type error, lint violation) gives feedback in seconds, not minutes. Parallel within stages: unit tests, linters, and security scans all run concurrently. Progressive cost: only spin up databases and staging environments after cheap checks pass.
