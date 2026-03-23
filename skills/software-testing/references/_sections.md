# Section Definitions

This file defines the rule categories for software-testing. Rules are automatically assigned
to sections based on their filename prefix.

---

## 1. Testing Philosophy (philosophy)
**Impact:** CRITICAL
**Description:** Core principles — tests exist for justified confidence, not coverage metrics. Optimize for confidence per engineering-hour.

## 2. Test Strategy (strategy)
**Impact:** CRITICAL
**Description:** Risk-driven testing approach. Test proportionally to risk: probability of a bug times cost of that bug reaching production.

## 3. Unit Tests (unit)
**Impact:** HIGH
**Description:** Effective unit test design for complex, branchy logic. Arrange-Act-Assert structure, naming, table-driven patterns.

## 4. Integration Tests (integration)
**Impact:** CRITICAL
**Description:** Testing real component interactions with real dependencies. Use real databases, real HTTP handlers, real middleware chains.

## 5. Contract Tests (contract)
**Impact:** HIGH
**Description:** Verifying that service boundaries agree on communication shape without requiring both services running simultaneously.

## 6. Advanced Test Types (advanced)
**Impact:** HIGH
**Description:** Property-based testing, load/performance testing, chaos/resilience testing, and snapshot/golden file testing.

## 7. Test Architecture (arch)
**Impact:** HIGH
**Description:** Test doubles selection, test data management with builders/factories, and flaky test discipline.

## 8. CI Pipeline (pipeline)
**Impact:** MEDIUM-HIGH
**Description:** Staged pipeline design with fail-fast, coverage ratchets, and explicit deploy gate definitions.

## 9. Production Verification (prod)
**Impact:** MEDIUM-HIGH
**Description:** Canary deploys, feature flags, health checks, and observability as a continuation of testing in production.
