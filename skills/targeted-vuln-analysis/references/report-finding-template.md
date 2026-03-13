---
title: Document Findings With Full Traced Evidence
impact: HIGH
impactDescription: Consistent, evidence-backed finding documentation enables immediate action by defenders
tags: reporting, template, documentation, findings, evidence
---

## Document Findings With Full Traced Evidence

Each confirmed finding must follow this structure. Sections that cannot be filled with specific, concrete information indicate the finding is not yet confirmed — either go deeper or downgrade to Unconfirmed.

**Finding template:**

```markdown
## [SEVERITY] [Short Descriptive Title]

**CWE**: [CWE-XXX: Name]
**CVSS** (if applicable): [score with vector string]
**Attacker Profile**: [from threat model — who can exploit this]
**Crown Jewel at Risk**: [from threat model — what's threatened]

### Summary
[2-3 sentences: what the vulnerability is, why it matters in this system's context]

### Traced Code Path
[Full source → sink trace with file:line references at every step]
[Each step: where data arrives, what transforms, what validates, what leaves]

### Missing/Bypassed Control
[What protection should exist and why it's absent or insufficient]
[If a control exists but is bypassed, show how]

### Proof of Exploitability
[Concrete payload that triggers the vulnerability]
[Step-by-step: attacker provides X → system processes as Y → result is Z]
[Account for all controls the payload must survive]

### Impact
[Concrete impact in this system's context, mapped to threat model framework]
[What the attacker gains, what the defender loses, in specific terms]

### Remediation
[Specific code fix — not "use parameterized queries" but the actual fix for
this specific code location with a code example]
[Why this fix addresses the root cause, not just the symptom]

### Verification
[How to confirm the fix works — specific test case, payload that should now fail,
or automated check to add]
```

**Example of a complete finding:**

```markdown
## [CRITICAL] Authentication Bypass via SQL Injection in Login Handler

**CWE**: CWE-89: Improper Neutralization of Special Elements in SQL Command
**CVSS**: 9.8 (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)
**Attacker Profile**: Remote unauthenticated (Attacker Profile 1 from threat model)
**Crown Jewel at Risk**: Patient PHI records (Crown Jewel #1)

### Summary
The login endpoint at /api/auth/login constructs a SQL query using string
interpolation with the username parameter. No parameterization or input
validation exists on this path. An attacker can bypass authentication entirely
and access any user account, including admin accounts with PHI access.

### Traced Code Path
1. ENTRY: req.body.username at routes/auth.js:23
   Data: string from JSON POST body, parsed by express.json() middleware
   Validation: express.json() parses JSON — no content validation

2. PASSES THROUGH: authenticateUser(username, password) at routes/auth.js:25
   No modification to username value

3. REACHES SINK: db.query() at services/auth.js:52
   Query: `SELECT * FROM users WHERE username='${username}' AND password_hash='${hash}'`
   Protection: NONE — string interpolation, no parameterization

### Missing/Bypassed Control
No parameterization at the query construction point. No input validation at any
point between the HTTP handler and the database query. The password is hashed
before interpolation (services/auth.js:50) but the username is interpolated raw.

### Proof of Exploitability
Payload: username = "admin'--", password = "anything"
Query becomes: SELECT * FROM users WHERE username='admin'--' AND password_hash='...'
The -- comments out the password check. Query returns admin user row.
Application at routes/auth.js:28 creates a session for the returned user.
Attacker receives a valid admin session cookie.

### Impact
Full authentication bypass. Attacker gains admin session, which has unrestricted
access to the PHI records API (routes/patients.js). Directly compromises Crown
Jewel #1 (Patient PHI records). HIPAA breach implications.

### Remediation
Replace string interpolation with parameterized query at services/auth.js:52:

    // Before (vulnerable)
    const result = await db.query(
      `SELECT * FROM users WHERE username='${username}' AND password_hash='${hash}'`
    );

    // After (parameterized)
    const result = await db.query(
      'SELECT * FROM users WHERE username=$1 AND password_hash=$2',
      [username, hash]
    );

### Verification
Test: Send POST /api/auth/login with body {"username": "admin'--", "password": "x"}
Expected after fix: Login fails (no user matches literal string "admin'--")
Automated: Add integration test asserting login rejects inputs containing SQL metacharacters
```
