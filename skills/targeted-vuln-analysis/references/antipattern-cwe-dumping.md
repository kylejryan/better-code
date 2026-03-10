---
title: Avoid CWE Database Dump Reports
impact: HIGH
impactDescription: CWE-class listings without proven instances are the hallmark of shallow analysis
tags: anti-pattern, cwe, noise, shallow-analysis, pattern-matching
---

## Avoid CWE Database Dump Reports

A CWE database dump is a report that lists every vulnerability class the code MIGHT be vulnerable to, with a paragraph for each, but no proven instance of any. This is the most common failure mode of AI security analysis.

**Incorrect (CWE database dump):**

```markdown
## Findings

### SQL Injection (CWE-89)
The application uses database queries. SQL injection occurs when user input
is concatenated into queries without sanitization. Consider using parameterized
queries for all database interactions.

### Cross-Site Scripting (CWE-79)
The application renders user content in web pages. XSS occurs when user input
is displayed without encoding. Consider implementing output encoding for all
user-generated content.

### Path Traversal (CWE-22)
The application handles file operations. Path traversal occurs when user input
controls file paths without validation. Consider validating file paths against
an allowlist.

### Insecure Deserialization (CWE-502)
The application may process serialized data. Insecure deserialization occurs
when untrusted data is deserialized without validation. Consider using safe
deserialization methods.
```

This report is useless. It describes the CWE database entries for four vulnerability classes and adds "consider" recommendations. It does not reference a single line of code. It does not prove any of these vulnerabilities exist in this specific application. The word "may" is a confession that no analysis was performed.

**Correct (specific, traced findings):**

```markdown
## Confirmed Findings

### [CRITICAL] Authentication Bypass via SQL Injection in Login Handler

**CWE**: CWE-89: SQL Injection
**Attacker Profile**: Remote unauthenticated

### Traced Code Path
1. POST /api/login handler at routes/auth.js:23 reads req.body.username
2. Passed directly to authenticateUser() at services/auth.js:45
3. authenticateUser() calls db.query(`SELECT * FROM users WHERE
   username='${username}'`) at services/auth.js:52
4. No parameterization, no escaping, no validation between entry and sink

### Proof of Exploitability
Payload: admin'--
Query becomes: SELECT * FROM users WHERE username='admin'--'
Password check is commented out. Returns admin user row.
Tested: Query syntax is valid PostgreSQL. Comment terminates correctly.

### Impact
Full authentication bypass. Attacker obtains admin session without credentials.

## Investigated and Not Vulnerable

### XSS in User Profile Display
Template at templates/profile.html:34 renders {{ user.bio }}.
Django auto-escaping is enabled (verified: no |safe filter applied).
HTML entities are correctly encoded in output.
NOT VULNERABLE — framework control prevents exploitation.
```

The second report contains one proven finding and one investigated non-finding. It is more valuable than the first report's four unproven possibilities because the defender knows exactly what to fix, what's safe, and why.

**How to self-check for CWE dumping:**
- Does every finding reference specific files and line numbers? If not, you're describing a class, not an instance.
- Can you remove the finding and replace it with the CWE database entry without losing information? If so, the finding adds no value.
- Does the finding use the word "could," "may," or "might"? These signal unverified possibilities, not traced findings.
- Does the finding include a concrete payload? If not, exploitability has not been proven.
