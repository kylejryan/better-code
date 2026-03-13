# Section Definitions

This file defines the rule categories for the threat-model skill. Rules are
automatically assigned to sections based on their filename prefix.

---

## 1. System Identification (system)
**Impact:** CRITICAL
**Description:** Establish what the system does, its deployment context, and its
crown jewels before any analysis begins. Without understanding the system's
function and environment, trust boundaries cannot be drawn and attacker profiles
cannot be scoped. This is the foundation everything else builds on.

## 2. Trust Boundaries (boundary)
**Impact:** CRITICAL
**Description:** Map every point where trust level changes. Data crossing a trust
boundary requires validation because the sender is less trusted than the receiver.
Missing trust boundaries — where untrusted data flows into trusted context with no
validation — are where real vulnerabilities live.

## 3. Attacker Profiles (attacker)
**Impact:** HIGH
**Description:** Define who you are defending against and what capabilities they
have. Each attacker profile specifies starting position, target (crown jewels),
and viable paths through trust boundaries. Every finding must map to at least one
realistic attacker with a credible attack narrative.

## 4. Impact Assessment (impact)
**Impact:** HIGH
**Description:** Calibrate severity to the specific system under analysis, not
generic CVSS scores. Define what Critical, High, Medium, Low, and Informational
mean for THIS deployment context. Most importantly, identify patterns that look
like vulnerabilities but are not exploitable in context.

## 5. Threat Model Output (output)
**Impact:** MEDIUM
**Description:** Produce the structured threat model document and attack surface
priority list that drives the subsequent vulnerability analysis. The output
section translates all prior steps into a deliverable that scopes, prioritizes,
and filters the analysis.
