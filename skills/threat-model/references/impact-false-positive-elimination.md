---
title: Eliminate False Positives Using Threat Model Context
impact: HIGH
impactDescription: 40-70% of automated scanner findings are false positives without threat model filtering — eliminating them is the primary value of threat modeling
tags: false positives, noise, filtering, context, exploitability, validation
---

## Eliminate False Positives Using Threat Model Context

The primary value of building a threat model before vulnerability analysis is the ability to filter noise. Without a threat model, every CWE pattern match looks like a finding. With a threat model, you can ask four questions that eliminate the majority of false positives. If a finding cannot answer all four, it is noise.

**Incorrect (reporting findings without threat model validation):**

```markdown
# Security Findings

1. **HIGH: SQL Injection in admin search** (CWE-89)
   File: admin/search.ts:47
   Raw SQL query with string concatenation.

2. **HIGH: Path Traversal in file export** (CWE-22)
   File: export/files.ts:112
   User-controlled path used in fs.readFile().

3. **MEDIUM: Missing rate limiting on login** (CWE-307)
   File: auth/login.ts:23
   No brute-force protection on authentication endpoint.

4. **MEDIUM: Hardcoded secret in test file** (CWE-798)
   File: test/fixtures/auth.test.ts:5
   API key hardcoded in test fixture.
```

Without threat model context, you cannot distinguish real findings from noise. Are these actually exploitable? By whom? With what impact?

**Correct (findings validated against threat model):**

```markdown
# Security Findings (Threat Model Validated)

1. **INFORMATIONAL: SQL Injection in admin search** (CWE-89)
   File: admin/search.ts:47
   - Attacker profile: Authenticated Privileged User (admin)
   - Trust boundary: Admin Functions → Database
   - Crown jewel threatened: Patient PHI records
   - **Verdict: NOT A VULNERABILITY in context.** Admin users already
     have direct database access via the admin panel's data export
     feature. SQL injection grants no additional capability beyond
     what the admin role already provides. Recommend fixing as code
     quality issue (defense in depth), not security finding.

2. **CRITICAL: Path Traversal in file export** (CWE-22)
   File: export/files.ts:112
   - Attacker profile: Authenticated Regular User (member)
   - Trust boundary: Business Logic → File System
   - Crown jewel threatened: Database encryption keys (stored at
     /etc/app/keys/), other orgs' uploaded documents
   - **Verdict: CRITICAL.** Regular users can craft export paths to
     read files outside the intended document directory. The application
     runs as a user with read access to key material. Confirmed
     reachable via GET /api/exports?path=../../etc/app/keys/master.key

3. **HIGH: Missing rate limiting on login** (CWE-307)
   File: auth/login.ts:23
   - Attacker profile: Unauthenticated Remote Attacker
   - Trust boundary: Internet → Authentication
   - Crown jewel threatened: OAuth refresh tokens (via credential stuffing)
   - **Verdict: HIGH.** Internet-facing endpoint, no rate limiting or
     account lockout. Combined with the lack of MFA requirement,
     credential stuffing is a viable path to account takeover.

4. **DROPPED: Hardcoded secret in test file** (CWE-798)
   File: test/fixtures/auth.test.ts:5
   - **Verdict: NOT A FINDING.** Test fixtures with fake API keys are
     expected. The key is not a real credential — it is a test constant.
     Verified: value does not match any production secret format.
```

## The Four-Question Filter

Every finding must answer:
1. **Which attacker profile** can exploit it? (Must be a defined profile)
2. **Which trust boundary** does it cross? (Must be a mapped boundary)
3. **What crown jewel** does it threaten? (Must be a named asset)
4. **What is the realistic impact?** (Using the calibrated framework)

If ANY answer is "none" or "unclear," the finding requires further investigation before reporting. If investigation confirms no realistic path, the finding is noise — drop it or downgrade to informational.
