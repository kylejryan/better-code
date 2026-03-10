---
title: Calibrate and Communicate Confidence Levels Honestly
impact: HIGH
impactDescription: Mixing confirmed and unconfirmed findings at the same confidence level destroys report credibility
tags: confidence, calibration, reporting, honesty, static-analysis-limits
---

## Calibrate and Communicate Confidence Levels Honestly

Every finding has a confidence level that reflects how thoroughly it was verified. Mixing confidence levels — presenting pattern matches with the same language as proven vulnerabilities — destroys report credibility.

**Incorrect (all findings presented at same confidence regardless of evidence depth):**

```markdown
## CRITICAL: SQL Injection in Login Handler
The login handler concatenates user input into SQL. This is a critical
SQL injection vulnerability.

## CRITICAL: XSS in Comment Display
Comments are rendered in HTML templates. This is a critical XSS vulnerability.

## CRITICAL: Path Traversal in File Download
The download handler uses a filename parameter. This is a critical path
traversal vulnerability.
```

**Correct (findings separated by confidence with explicit evidence basis):**

```markdown
## [CRITICAL — Confirmed] SQL Injection in Login Handler
Traced path: routes/auth.js:23 → services/auth.js:52 (string interpolation)
Payload: admin'-- bypasses password check, returns admin user row
Evidence: Full source-to-sink trace, no controls on path, payload verified

## [HIGH — Likely Exploitable] XSS in Comment Display
Traced path: models/comment.js:12 → views/comments.ejs:34
Comment body rendered with <%- comment.body %> (unescaped EJS).
UNVERIFIABLE: CSP headers not in source — may limit impact. Test required.

## [MEDIUM — Unconfirmed] Potential Path Traversal in File Download
The download handler at routes/files.js:56 uses req.params.filename.
COULD NOT VERIFY: The express.static middleware configuration at app.js:12
may restrict paths. Check if path.resolve() is called before file access.

## [NOT VULNERABLE] SQL Injection in User Search
Path: routes/users.js:34 → models/user.js:12
Sequelize ORM parameterizes this query. CLEARED.
```

**Four confidence levels:**

- **Confirmed**: Full trace, concrete payload, verified impact. "I read the code, traced the path, and here is the proof."
- **Likely Exploitable**: Traced path, no controls found, but payload requires runtime verification. "The path is vulnerable, but exploitation depends on [specific condition]."
- **Unconfirmed**: Pattern matches vulnerability class, but full path not traced. "This warrants investigation, but I cannot prove it from source alone."
- **Not Vulnerable**: Path investigated, definitive control found. "Investigated because [reason], but [control] prevents exploitation."

Always include confidence in the header. Group by confidence level — never interleave. End every report with "Surfaces Not Yet Analyzed" listing unexamined areas from the threat model.
