---
title: Model Authenticated User Privilege Escalation Paths
impact: HIGH
impactDescription: Authorization flaws are the most common critical vulnerability class — authenticated attackers can reach deeper attack surface
tags: attacker profile, authenticated, privilege escalation, authorization, insider threat
---

## Model Authenticated User Privilege Escalation Paths

An authenticated regular user has valid credentials and can interact with the application's features. Their attack surface is larger than the unauthenticated attacker because they pass authentication checks. The threat is not what they can do within their authorized scope — it is what they can reach beyond it. Authorization boundary testing is where this profile generates critical findings.

**Incorrect (conflating authentication with authorization):**

```markdown
# Authenticated User Threat

Authenticated users have access to the application. They might try to
access data they shouldn't. We use role-based access control to prevent
unauthorized access.
```

This acknowledges the problem without modeling it. "We use RBAC" is a control claim, not an analysis. The threat model must define what specific escalation paths exist so you can verify whether RBAC actually blocks them.

**Correct (escalation-focused attacker narrative):**

```markdown
# Attacker Profile: Authenticated Regular User

## Starting Position
- Valid account credentials (email + password or SSO)
- Assigned to Organization A with "member" role
- Can access: own profile, Org A patient records, Org A scheduling
- Cannot access (per policy): Org B data, admin panel, audit logs,
  sharing policy configuration

## Target (Crown Jewels)
Primary: Other organizations' PHI records (horizontal escalation)
Secondary: Admin functions — user management, sharing policies (vertical)

## Escalation Paths to Test

### Horizontal: Org A Member → Org B Patient Data
1. Access patient record API: GET /api/patients/{id}
2. Test: Are patient IDs sequential? Can Org A member request Org B
   patient IDs? (IDOR)
3. Test: Does the sharing API (POST /api/shares) validate that the
   source org owns the record being shared?
4. Test: Can a member create a sharing policy that grants their org
   access to another org's records?

### Vertical: Member → Admin
1. Access admin endpoints directly: GET /api/admin/users
2. Test: Is authorization checked per-request, or only at login?
3. Test: Can the role field be set via user profile update?
   PUT /api/users/me with {"role": "admin"}
4. Test: Are admin client-side routes protected server-side, or only
   hidden in the UI?

### Data Boundary: Own Records → All Records
1. Test: GraphQL introspection — can the user craft queries that
   traverse relationships beyond their authorization scope?
2. Test: Export/report endpoints — do bulk operations enforce the
   same per-record authorization as individual access?
3. Test: Search functionality — does search index respect org
   boundaries, or does it return results the API would block?

## Impact Assessment
Horizontal escalation to another org's PHI: CRITICAL (full breach)
Vertical escalation to admin: HIGH (enables policy manipulation)
Data boundary escape via bulk ops: HIGH (mass data access)
```

Each escalation path becomes a specific test case during vulnerability analysis. The code audit traces these paths through the authorization middleware to verify that checks exist and are correct at every step.
