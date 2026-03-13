# Threat Model

## Structure

```
threat-model/
  SKILL.md       # Main skill file - read this first
  AGENTS.md      # This navigation guide
  CLAUDE.md      # Symlink to AGENTS.md
  references/    # Detailed reference files
```

## Usage

1. Read `SKILL.md` for the main skill instructions
2. Browse `references/` for detailed documentation on specific topics
3. Reference files are loaded on-demand - read only what you need

## Why This Exists

Security analysis without a threat model produces a long list of generic CWE-pattern-matched possibilities with no prioritization. Without defined trust boundaries, attacker capabilities, and impact assessment, there is no way to distinguish interesting findings from noise. Every vulnerability report that starts with "I found 47 potential issues" without first establishing what matters is fundamentally broken.

This skill forces threat model construction BEFORE any code analysis begins. The threat model becomes the lens that scopes, prioritizes, and filters all subsequent findings.

## The Rule

Do NOT enumerate vulnerabilities until the threat model is complete. No exceptions. A finding without a threat model is just a pattern match — it has no demonstrated impact, no proven reachability, and no prioritization. It is noise.

## Threat Modeling Steps

| Step | Action | Priority | Prefix |
|------|--------|----------|--------|
| 1 | Identify the System | CRITICAL | `system` |
| 2 | Map Trust Boundaries | CRITICAL | `boundary` |
| 3 | Define Attacker Profiles | HIGH | `attacker` |
| 4 | Assess Impact Categories | HIGH | `impact` |
| 5 | Produce the Threat Model Document | MEDIUM | `output` |

## How to Use

Work through steps sequentially. Each step builds on the previous one. Read the reference files for detailed guidance on each step:

- Read `references/system-description.md` — Establish what the system does
- Read `references/system-crown-jewels.md` — Identify critical assets
- Read `references/boundary-mapping.md` — Draw trust boundary diagrams
- Read `references/boundary-validation-gaps.md` — Find missing validation at crossings
- Read `references/attacker-remote-unauthenticated.md` — Model external attackers
- Read `references/attacker-authenticated-escalation.md` — Model insider threats
- Read `references/attacker-supply-chain.md` — Model supply chain threats
- Read `references/impact-severity-calibration.md` — Calibrate severity to context
- Read `references/impact-false-positive-elimination.md` — Filter noise from findings
- Read `references/output-document-structure.md` — Produce the final threat model
- Read `references/output-attack-surface-priority.md` — Rank areas for analysis

## After the Threat Model

Once the document exists, pass it to the vulnerability analysis phase. Every finding must reference:
1. Which attacker profile can exploit it
2. Which trust boundary it crosses
3. What crown jewel it threatens
4. What the realistic impact is (using the calibrated framework)

Findings that cannot answer these four questions are noise. Discard them.

## Self-Review Checklist

Before moving to vulnerability analysis, verify:
- [ ] System description is one paragraph focused on FUNCTION, not technology
- [ ] Deployment context answers: who runs it, where, as what user, facing what network
- [ ] Crown jewels are named and ranked (3-5 specific assets)
- [ ] Trust boundaries show every crossing where trust level changes
- [ ] Each boundary documents: what crosses, what validates, what if bypassed
- [ ] At least 2 attacker profiles with start position, goal, and path
- [ ] Impact categories are calibrated to THIS system, not generic CVSS
- [ ] Scope explicitly states what is in and out of the analysis
- [ ] Attack surface priority list ranks where to look first and why
