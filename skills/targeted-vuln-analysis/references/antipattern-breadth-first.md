---
title: Recognize and Suppress Breadth-First Hallucination
impact: HIGH
impactDescription: Breadth-first scanning is the primary failure mode — produces long lists of theoretical vulnerabilities with no proven exploitability
tags: anti-pattern, breadth-first, hallucination, noise, discipline
---

## Recognize and Suppress Breadth-First Hallucination

Breadth-first hallucination is the default behavior when asked to find vulnerabilities. Recognize it in yourself and stop it immediately. Each pattern below is a specific failure mode with a specific correction.

**Incorrect (breadth-first analysis that context-switches and produces shallow findings):**

```markdown
## Analysis of Authentication System

### Finding 1: Possible SQL Injection in Login
The login handler passes user input to a database query. This could lead
to SQL injection.

### Finding 2: While reviewing login, I noticed potential XSS in profile
The profile template renders user content. This could lead to XSS.
[Note: switched targets mid-analysis without finishing login trace]

### Finding 3: Possible CSRF on password reset
The password reset form does not appear to have CSRF tokens.

### Additional Recommendations
- Consider implementing rate limiting
- Add Content Security Policy headers
- Use parameterized queries for all database interactions
- Implement input validation on all endpoints
```

**Correct (depth-first analysis that completes one target before moving to the next):**

```markdown
## TARGET: Login handler SQL injection (Attack Surface #1 from threat model)

### Traced Code Path
1. ENTRY: req.body.username at routes/auth.js:23 — string from POST body
2. PASSES THROUGH: authenticateUser() at services/auth.js:45 — no modification
3. REACHES SINK: db.query() at services/auth.js:52 — string interpolation
   Query: `SELECT * FROM users WHERE username='${username}'`
   Protection: NONE

### Proof of Exploitability
Payload: admin'-- → bypasses password check → returns admin user row
Query becomes: SELECT * FROM users WHERE username='admin'--' AND ...

### Impact: Authentication bypass to admin account (Crown Jewel #2)

---
[Login analysis COMPLETE. Now selecting next target from threat model.]
[XSS in profile noted for later — it is Attack Surface #3 on the priority list.]
```

The first example produces four shallow "could lead to" findings and generic recommendations. None are proven. The second example produces one fully traced, proven finding. The second is more valuable because the defender can act on it immediately.

**Specific anti-patterns to catch yourself doing:**

1. **"While I'm here..."** — Note the tangential observation for later. Finish the current target.
2. **"This pattern commonly leads to..."** — Read the actual code. Prove it in THIS codebase.
3. **"Additional recommendations..."** — Only recommend what you've proven is missing AND exploitable.
4. **Scanning every file** — Follow the data flow. Read only files on the trace path.
