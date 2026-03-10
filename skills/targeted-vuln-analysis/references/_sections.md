# Section Definitions

This file defines the methodology phases for the targeted-vuln-analysis skill.
Rules are automatically assigned to sections based on their filename prefix.

---

## 1. Target Selection (target)
**Impact:** CRITICAL
**Description:** Select and scope a single attack surface from the threat model's
priority list. A well-scoped target names the exact entry point, relevant attacker
profile, and crown jewel at risk. Poorly-scoped targets (too broad) produce the
breadth-first analysis this skill exists to prevent. If the target feels like it
could take more than 30 minutes of focused analysis, it's too broad — narrow it.

## 2. Code Path Tracing (trace)
**Impact:** CRITICAL
**Description:** Read the actual code and trace the specific data flow from entry
point to potential sink. Every step must reference real functions, files, and line
numbers. "Code like this usually works this way" is not tracing — read the actual
code in this project. If you cannot trace the full path, you are speculating.

## 3. Control Evaluation (control)
**Impact:** HIGH
**Description:** For each traced path, enumerate every security control between
source and sink. Assess whether each control is sufficient for the specific sink
context, whether it can be bypassed, and whether it's correctly positioned. Also
identify where controls are missing and why their absence is exploitable.

## 4. Exploitability Proof (exploit)
**Impact:** CRITICAL
**Description:** Construct concrete attack inputs and trace them through the code
path to prove or disprove exploitability. Account for partial controls, implicit
protections, and deployment context. If exploitability cannot be proven, mark the
finding as unconfirmed. If a path is unexploitable, document WHY — this is valuable.

## 5. Anti-Pattern Suppression (antipattern)
**Impact:** HIGH
**Description:** Actively resist breadth-first hallucination behaviors: pivoting
to tangential findings, pattern-matching from training data instead of reading code,
appending generic recommendations, dumping CWE class listings, and padding reports
with low-severity findings. Each anti-pattern is a specific failure mode with a
specific correction.

## 6. Reporting and Confidence (report)
**Impact:** HIGH
**Description:** Document findings with explicit confidence levels (Confirmed,
Likely Exploitable, Unconfirmed, Not Vulnerable). Structure reports to clearly
separate proven findings from possibilities. Include investigated-and-not-vulnerable
paths and unanalyzed surfaces for honest scoping.
