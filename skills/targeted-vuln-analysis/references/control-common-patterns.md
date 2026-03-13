---
title: Common Security Control Patterns and Their Limitations
impact: MEDIUM-HIGH
impactDescription: Understanding control limitations prevents both false positives and false negatives
tags: controls, patterns, sanitization, parameterization, encoding, validation
---

## Common Security Control Patterns and Their Limitations

Every security control has a scope — the set of attacks it prevents — and limitations — the attacks it does not address. Misunderstanding a control's scope leads to false positives (reporting a vulnerability that the control prevents) or false negatives (assuming a control covers more than it does).

**Incorrect (assuming a control covers all injection vectors when it only covers values):**

```python
# Analyst concludes "parameterized queries prevent SQL injection" and stops.
# But the table name is STILL injectable via string interpolation.
table_name = request.args.get("table")  # Attacker-controlled
user_id = request.args.get("id")

# user_id is parameterized — safe
# table_name is interpolated — VULNERABLE
cursor.execute(f"SELECT * FROM {table_name} WHERE id = %s", (user_id,))
```

**Correct (evaluating each use of attacker data against the control's actual scope):**

```python
# Parameterized queries protect VALUE positions only.
# Identifiers (table/column names) require allowlist validation.
ALLOWED_TABLES = {"users", "orders", "products"}
table_name = request.args.get("table")
user_id = request.args.get("id")

if table_name not in ALLOWED_TABLES:
    abort(400)

cursor.execute(f"SELECT * FROM {table_name} WHERE id = %s", (user_id,))
# table_name: allowlist-validated (safe)
# user_id: parameterized (safe)
```

**Control scope reference:**

| Control | Sufficient For | NOT Sufficient For |
|---------|---------------|-------------------|
| Parameterized queries | Query values | Table/column names, ORDER BY, LIMIT |
| HTML entity encoding | HTML body context | JavaScript, URL, or CSS context |
| URL encoding | URL parameter values | URL path components (may be decoded by server) |
| Integer casting | Numeric SQL injection | Non-numeric injection vectors |
| Allowlist validation | Known-good values | Open-ended user content |
| Length limits | Buffer overflow | Injection within the length limit |
| CSP headers | XSS impact mitigation | XSS prevention (defense-in-depth only) |
| Rate limiting | Brute force at single IP | Distributed attacks, single correct guess |

When evaluating a control on a traced path, ask: (1) What is this control's designed scope? (2) Does the sink on this path fall within that scope? (3) Is it configured correctly for this context? (4) Are there paths to the same sink that bypass this control?
