---
title: Identify and Rank Crown Jewels Before Analysis
impact: CRITICAL
impactDescription: Without crown jewels, severity ratings are arbitrary — no way to distinguish critical from noise
tags: crown jewels, assets, prioritization, impact, data classification
---

## Identify and Rank Crown Jewels Before Analysis

Crown jewels are the 3-5 assets that, if compromised, would cause the most damage. They determine how severity is assessed — a vulnerability is only as severe as the asset it threatens. Name them explicitly and rank them. If you cannot name the crown jewels, you cannot prioritize findings. Ask the user.

**Incorrect (vague asset identification):**

```markdown
# Assets
- User data
- Application secrets
- System availability
- Compliance requirements
```

This is too generic to drive analysis. "User data" could mean usernames (low impact) or SSNs (critical). "Application secrets" gives no indication of what they protect. These labels do not help you decide whether a finding is critical or informational.

**Correct (specific, ranked crown jewels):**

```markdown
# Crown Jewels (ranked by breach impact)

1. **Patient PHI records** — HIPAA-regulated health data for 2M+ patients.
   Breach triggers mandatory notification, regulatory fines ($50K+ per record),
   and reputational destruction.

2. **OAuth refresh tokens** — Long-lived tokens granting persistent access to
   user accounts. Compromise enables silent, ongoing access to patient data
   without re-authentication.

3. **Inter-org sharing policies** — Access control rules governing which
   providers can see which patient records. Manipulation enables unauthorized
   PHI access without leaving obvious audit trails.

4. **Database encryption keys** — AES-256 keys for at-rest encryption of PHI.
   Compromise renders all encryption meaningless and exposes historical data.

5. **AWS IAM role credentials** — Service role with S3, RDS, and SQS access.
   Compromise enables lateral movement to infrastructure and bulk data
   exfiltration.
```

Now every finding can be evaluated: "Does this vulnerability create a realistic path to one of these five assets? Which one? How direct is the path?" A SQL injection reaching the PHI database is critical. A reflected XSS on a marketing page with no session context is informational.

**Common crown jewel categories to consider:**
- User credentials or session tokens
- Financial data or payment instruments
- PII, PHI, or regulated data
- Cryptographic keys or signing material
- Administrative access or privilege escalation paths
- Model weights or proprietary training data
- Infrastructure access (cloud credentials, SSH keys)
