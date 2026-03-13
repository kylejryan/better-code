---
title: Identify Missing Validation at Trust Boundary Crossings
impact: CRITICAL
impactDescription: Every missing validation at a trust boundary is a potential exploitable vulnerability — these are the highest-signal findings
tags: validation gaps, trust boundary, attack surface, missing controls, security controls
---

## Identify Missing Validation at Trust Boundary Crossings

After mapping trust boundaries, systematically check each crossing for validation gaps. A validation gap is where untrusted data enters a trusted context with insufficient or absent checking. These gaps are the highest-signal targets for vulnerability analysis — they represent real attack surface, not theoretical pattern matches.

**Incorrect (checking controls exist without verifying completeness):**

```markdown
# Security Controls Review

✅ Input validation: Yes (Express middleware validates request body)
✅ Authentication: Yes (JWT tokens verified on all endpoints)
✅ Authorization: Yes (role-based access control implemented)
✅ SQL injection: Yes (ORM used for all queries)
✅ XSS: Yes (React auto-escapes output)
```

Checkboxes confirm presence, not correctness. "JWT tokens verified on all endpoints" does not tell you whether the verification checks expiration, audience, issuer, or algorithm. "ORM used" does not tell you whether raw queries bypass it. This is a compliance checklist, not a security analysis.

**Correct (systematic validation gap analysis):**

```markdown
# Trust Boundary Validation Gap Analysis

## Boundary: Internet → API Gateway
| Data Element       | Validation Present          | Gap Identified                    |
|--------------------|-----------------------------|-----------------------------------|
| JWT token          | Signature verified (RS256)  | No audience claim check — token   |
|                    |                             | from staging accepted in prod     |
| Request body       | Size limit (10MB)           | No schema validation — arbitrary  |
|                    |                             | JSON structure reaches backend    |
| Content-Type       | Not checked                 | Non-JSON content types accepted   |
|                    |                             | and forwarded to JSON parser      |

## Boundary: Backend → Database
| Data Element       | Validation Present          | Gap Identified                    |
|--------------------|-----------------------------|-----------------------------------|
| User queries       | ORM parameterized queries   | 3 raw SQL queries in reporting    |
|                    |                             | module bypass ORM (search.ts:47,  |
|                    |                             | reports.ts:112, export.ts:89)     |
| Stored procedures  | Called via ORM              | No gap identified                 |

## Boundary: User Upload → File Processing
| Data Element       | Validation Present          | Gap Identified                    |
|--------------------|-----------------------------|-----------------------------------|
| File type          | Extension whitelist check   | No magic byte verification —      |
|                    |                             | .jpg extension with executable    |
|                    |                             | content passes validation         |
| File size          | 50MB limit                  | No gap identified                 |
| File content       | No content scanning         | Malicious content in valid file   |
|                    |                             | formats not detected (e.g., SVG   |
|                    |                             | with embedded JavaScript)         |
```

Each gap maps directly to a potential vulnerability. The gap analysis becomes the prioritized input for the vulnerability hunting phase — look here first, because these are confirmed missing controls at real trust boundaries.
