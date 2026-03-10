---
title: Model Supply Chain and Local Attacker Profiles
impact: HIGH
impactDescription: Supply chain attacks bypass all application-level controls — one compromised dependency can own everything
tags: attacker profile, supply chain, dependencies, local attacker, CI/CD, build pipeline
---

## Model Supply Chain and Local Attacker Profiles

Supply chain attackers compromise the software before it runs in production — through malicious dependencies, build pipeline manipulation, or compromised development tools. Local attackers have code execution on the same machine. Both profiles require different analysis than network-facing threats. The key question for both is: does the attack grant capabilities BEYOND what the starting position already provides?

**Incorrect (treating supply chain as a checklist):**

```markdown
# Supply Chain Security

- [ ] Dependencies are pinned to exact versions
- [ ] Dependabot is enabled
- [ ] npm audit shows 0 critical vulnerabilities
- [ ] Docker base image is scanned
```

This is a hygiene checklist, not a threat model. It tells you nothing about what a compromised dependency could actually do, what the blast radius would be, or which dependencies are high-risk.

**Correct (supply chain attacker with attack narrative):**

```markdown
# Attacker Profile: Supply Chain Attacker

## Starting Position
- Can publish a malicious version of any npm package in the dependency tree
- Can submit a crafted pull request to an open-source dependency
- Can compromise a CI/CD pipeline step (GitHub Action, Docker build)
- Cannot directly access production systems (attack must flow through
  the software supply chain)

## Target
Primary: Production runtime access (code execution in production)
Secondary: Credential harvesting (API keys, database URLs in env vars)
Tertiary: Backdoor persistence (modify deployed artifacts)

## Attack Paths

### Path 1: Malicious Dependency → Production RCE
1. Identify transitive dependencies with high privilege:
   - Build tools with file system access (webpack plugins, babel transforms)
   - Serialization libraries that process untrusted data (yaml, xml parsers)
   - HTTP client libraries that handle credentials
2. Compromise a dependency's postinstall script
3. Script executes during `npm install` in CI/CD pipeline
4. Exfiltrate environment variables (contains DATABASE_URL, API keys)

### Path 2: Compromised Model/Data File → Deserialization RCE
1. Publish malicious model file to public model registry
2. Application loads model via pickle/joblib (Python) or similar
3. Deserialization triggers arbitrary code execution
4. Attacker gains application runtime permissions

### Critical Dependencies to Audit (high privilege, high risk):
- Dependencies with native bindings (can execute arbitrary C/C++)
- Dependencies with postinstall scripts (execute during install)
- Dependencies that process untrusted formats (YAML, XML, image libs)
- Dependencies with few maintainers and high download counts

# Attacker Profile: Local Attacker (for CLI/desktop tools)

## Starting Position
- Can run arbitrary code on the same machine as the application
- Can read/write files accessible to the current user
- Can set environment variables and manipulate IPC channels

## Key Question
Does the vulnerability grant capabilities BEYOND what local code
execution already provides? If the attacker can already read files
and run code as the same user, a "path traversal" in a CLI tool
that reads local files is NOT a vulnerability — it is expected behavior.

## What IS a vulnerability for local tools:
- Escalation from user to root/admin privilege
- Escape from a sandbox or container to the host
- Access to other users' data on a shared system
- Persistence mechanisms that survive user logout/reboot
```

The supply chain profile shifts analysis from "is this code vulnerable?" to "what happens if this dependency is malicious?" — a fundamentally different question that standard vulnerability scanning does not address.
