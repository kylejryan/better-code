---
title: Evaluate Security Controls for Bypass and Sufficiency
impact: HIGH
impactDescription: A control that exists but can be bypassed is worse than no control — it creates false confidence
tags: controls, bypass, sanitization, validation, defense-evaluation
---

## Evaluate Security Controls for Bypass and Sufficiency

For each security control on a traced path, answer three questions: Is it sufficient for this sink context? Can it be bypassed? Is it correctly positioned?

**Incorrect (noting a control exists without evaluating it):**

```markdown
The input passes through a sanitization function before reaching the query.
This mitigates the SQL injection risk.
```

This assumes the sanitizer works. A sanitizer that strips single quotes doesn't help if the query uses double quotes. A sanitizer at the entry point doesn't protect data arriving from a different path.

**Correct (evaluating the control's effectiveness):**

```markdown
CONTROL: sanitize_input() at utils/security.py:12
MECHANISM: Removes characters matching ['";<>] via regex substitution
EVALUATION:
- Sufficient for this sink? PARTIAL — strips single/double quotes which
  prevents basic SQL injection, but does not handle:
  - Unicode escape sequences (e.g., \u0027 for single quote)
  - URL-encoded characters if decoded after sanitization
  - Numeric injection in unquoted integer contexts (WHERE id = {input})
- Correctly positioned? NO — applied at HTTP handler level, but the same
  data is also written to a cache and later read by a background job that
  queries the database without re-sanitizing
- Bypassable? YES — the regex operates on the raw string but the SQL driver
  processes Unicode escapes, allowing: username = \u0027 OR 1=1--
```

**Control sufficiency depends on the sink context:**

| Control | Sufficient For | NOT Sufficient For |
|---------|---------------|-------------------|
| HTML entity encoding | HTML body context | JavaScript context, URL context, CSS context |
| SQL parameterization | Query values | Table/column names, ORDER BY, LIMIT |
| URL encoding | URL parameter values | URL path components (may be decoded by server) |
| Integer casting | Numeric SQL injection | Any non-numeric injection vector |
| Allowlist validation | Known-good values only | Open-ended user content |
| Length limits | Buffer overflow | Injection within the length limit |
| WAF rules | Known attack signatures | Novel payloads, encoding tricks, fragmentation |

**Common bypass patterns to check:**

1. **Encoding mismatches**: Sanitizer operates on one encoding, sink interprets another (UTF-8 vs UTF-16, URL-encoded vs raw)
2. **Double encoding**: Input is URL-encoded, sanitizer decodes and checks, but the value is decoded again before the sink
3. **Truncation**: Input is truncated after sanitization, and the truncation creates a new dangerous payload
4. **Case sensitivity**: Sanitizer blocks `<SCRIPT>` but not `<script>` or `<ScRiPt>`
5. **Alternative representations**: Sanitizer blocks `../` but not `..%2f`, `..\/`, or `....//`
6. **Null bytes**: Null byte terminates the check but not the sink operation (`file.php%00.jpg` passes extension check, PHP processes as `.php`)
7. **TOCTOU**: Value is validated, then modified between check and use (race condition in validation)
8. **Second-order**: Input is sanitized for storage but the stored value becomes a new taint source when retrieved and used in a different context
