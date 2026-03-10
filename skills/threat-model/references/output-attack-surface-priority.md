---
title: Rank Attack Surface Areas by Risk for Targeted Analysis
impact: MEDIUM
impactDescription: Targeted analysis of top 5 attack surfaces finds 80%+ of critical vulnerabilities in 20% of the analysis time
tags: attack surface, prioritization, risk ranking, analysis scope, efficiency
---

## Rank Attack Surface Areas by Risk for Targeted Analysis

The attack surface priority list translates the threat model into a ranked work queue for vulnerability analysis. Instead of scanning every file at equal depth, this list directs attention to the areas where the combination of exposure, impact, and control weakness creates the highest probability of exploitable findings. The ranking formula is: Exposure (who can reach it) x Impact (what can go wrong) x Control Weakness (how likely existing protections fail).

**Incorrect (unprioritized analysis scope):**

```markdown
# Areas to Review
- Authentication
- Authorization
- Input validation
- Cryptography
- Session management
- Error handling
- Logging
- File handling
- API security
- Database queries
```

This is every category from a security review template. Reviewing all of them at equal depth is not feasible in a time-constrained engagement. Without prioritization, the analyst either rushes through everything (finding nothing substantive) or goes deep on the first item and never reaches the critical ones later in the list.

**Correct (risk-ranked attack surface priority):**

```markdown
# Attack Surface Priority (ranked by risk)

## Priority 1: Tenant Isolation — Database Query Filtering
**Risk Score:** Exposure HIGH × Impact CRITICAL × Controls UNCERTAIN = P1
**Why first:** Single shared database serving 150+ organizations. Every
database query that returns patient data MUST filter by organization_id.
A single missing filter exposes all 2M+ patient records across all tenants.
The ORM middleware claims to enforce this, but middleware can be bypassed
with direct query builder usage.

**Analysis approach:**
1. Identify all database query patterns (ORM calls, raw queries, query builder)
2. For each pattern, verify tenant filtering is present and cannot be bypassed
3. Search for raw SQL or query builder usage that bypasses ORM middleware
4. Test: Can Org A's authenticated user reach a query path without tenant filter?

**Files to prioritize:** models/*.ts, repositories/*.ts, any file with
`knex.raw()`, `sequelize.literal()`, or direct SQL strings.

## Priority 2: File Upload Pipeline — Untrusted Binary Processing
**Risk Score:** Exposure HIGH × Impact HIGH × Controls WEAK = P1
**Why second:** Internet-facing endpoint accepts arbitrary file uploads.
Current validation is extension whitelist only — no magic byte verification,
no content scanning. File processing libraries (ImageMagick, PDF parsers)
have extensive CVE history for processing crafted inputs.

**Analysis approach:**
1. Trace upload flow: HTTP handler → validation → storage → processing
2. Verify file type validation (extension AND content/magic bytes)
3. Identify all file processing libraries and check for known CVEs
4. Test: Can a file with mismatched extension/content bypass validation?

## Priority 3: OAuth Token Lifecycle — Generation to Revocation
**Risk Score:** Exposure MEDIUM × Impact CRITICAL × Controls UNKNOWN = P2
**Why third:** Token compromise grants persistent PHI access. Need to verify:
token generation entropy, storage security, refresh token rotation,
revocation effectiveness, and token scope limitations.

**Analysis approach:**
1. Review token generation (entropy source, claims, expiration)
2. Review token validation (algorithm, audience, issuer, expiration checks)
3. Review refresh flow (rotation on use, revocation propagation)
4. Test: Do revoked tokens continue to work? Is there a cache delay?

## Priority 4-5: [Continue with remaining areas...]

## Explicitly Deprioritized (review only if time permits)
- **Error handling and logging:** Low direct impact, defense-in-depth only
- **Client-side React code:** No sensitive data in browser, no session tokens
  in localStorage (confirmed cookies are httpOnly)
- **Marketing site:** Separate domain, no shared authentication context
```

Each priority entry gives the vulnerability analyst a focused scope: what to look at, why it matters, how to approach it, and which files to read first. This replaces "scan everything" with "analyze the highest-risk attack surfaces deeply."
