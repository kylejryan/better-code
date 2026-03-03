# Section Definitions

This file defines the rule categories for code quality best practices. Rules are automatically assigned to sections based on their filename prefix.

---

## 1. Core Philosophy (philosophy)
**Impact:** CRITICAL
**Description:** Foundational engineering principles — three invariants (correctness, clarity, changeability), KISS, and DRY. The bedrock that all other rules build upon.

## 2. Architecture (arch)
**Impact:** CRITICAL
**Description:** Separation of concerns, dependency inversion, boundaries and contracts, cohesion and coupling. Structural decisions that determine long-term maintainability.

## 3. Code Quality Standards (quality)
**Impact:** CRITICAL
**Description:** Naming conventions, function design, error handling, and testing strategy. The daily practices that compound into excellent codebases.

## 4. Anti-Patterns (anti)
**Impact:** HIGH
**Description:** Patterns to never use regardless of justification — god objects, stringly-typed code, boolean blindness, null abuse, and more.

## 5. Design Patterns (pattern)
**Impact:** HIGH
**Description:** Creational, structural, and behavioral patterns with selection heuristics. Solutions to recurring problems, applied only when the problem is present.

## 6. Performance (perf)
**Impact:** HIGH
**Description:** Algorithmic complexity, optimization hierarchy, space efficiency, and concurrency. Choosing the right data structures and access patterns at design time.

## 7. Code Smells (smell)
**Impact:** MEDIUM-HIGH
**Description:** Structural, coupling, and dispensable smell catalogs. Symptoms demanding investigation, not just aesthetic preferences.

## 8. Refactoring (refactor)
**Impact:** MEDIUM
**Description:** Safe refactoring methodology — before, during, and after. Small verified steps that preserve behavior while improving structure.
