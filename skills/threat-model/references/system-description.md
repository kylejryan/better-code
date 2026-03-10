---
title: Describe the System by Function, Not Technology
impact: CRITICAL
impactDescription: Eliminates misdirected analysis — wrong system description produces wrong threat model
tags: system, description, function, scope, identity
---

## Describe the System by Function, Not Technology

The system description must explain what the software does for its users in one paragraph. The function determines what matters — a reverse proxy routing HTTP traffic has fundamentally different threats than a payment API processing financial transactions, even if both are written in Go and deployed on Kubernetes. Technology stack is implementation detail; function is what defines the attack surface.

**Incorrect (technology-focused description):**

```markdown
# System Description

This is a Node.js application using Express.js with a PostgreSQL database,
deployed on AWS ECS with an ALB in front. It uses Redis for caching and
RabbitMQ for message queuing. Authentication is handled by Passport.js
with JWT tokens stored in HTTP-only cookies.
```

This tells you nothing about what matters. You cannot determine crown jewels, draw trust boundaries, or scope attacker impact from a technology list.

**Correct (function-focused description):**

```markdown
# System Description

This is a multi-tenant SaaS platform that allows healthcare organizations
to manage patient appointment scheduling and medical record sharing between
providers. It processes PHI (Protected Health Information), handles
inter-organization data sharing with configurable access policies, and
provides a patient-facing portal for viewing records and booking appointments.
```

Now you know: PHI is a crown jewel, multi-tenancy creates tenant isolation boundaries, inter-organization sharing creates complex authorization surfaces, and patient-facing portals are internet-exposed attack surfaces. Every subsequent analysis decision flows from this description.

**Follow-up questions to ask if the description is unclear:**
- Who are the users and what do they use it for?
- What is the most sensitive thing this system touches?
- What would make the news if it was breached?
