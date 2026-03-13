# Targeted Vuln Analysis

## Structure

```
targeted-vuln-analysis/
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

The default behavior when asked to "find vulnerabilities in this code" is breadth-first hallucination: scan every file, pattern-match against known CWE classes, and produce a long list of theoretical possibilities. This fails for two reasons:

1. Broad prompts invite broad answers. The model pattern-matches common bug classes even when they are not possible in the code's actual context. You end up reviewing theoretical vulnerabilities in code paths no attacker could reach.

2. Without depth, nothing is proven. A finding that says "this function concatenates user input into SQL" is a pattern match. A finding that traces the exact path from HTTP request → parameter extraction → string concatenation → query execution, demonstrates that no sanitizer exists on that path, and shows the concrete payload that exploits it — that is a vulnerability. The first is noise. The second is actionable.

This skill enforces depth-first analysis: pick a specific attack surface from the threat model, go deep on it, prove or disprove exploitability, and only then move to the next surface. Never scan broadly.

## The Rule

Every finding must be PROVEN exploitable through an actual traced code path, or explicitly marked as unconfirmed/theoretical. "This pattern looks vulnerable" is never acceptable as a finding. Either trace the full path and prove it, or don't report it.

## Prerequisites

A threat model must exist before this skill runs. The threat model provides:
- The ranked attack surface priority list (where to focus)
- Attacker profiles (who can reach what)
- Trust boundary map (where validation should exist)
- Impact framework (how to rate severity in this specific context)
- Crown jewels (what actually matters)

If no threat model exists, stop and build one first using the threat-model skill. Analyzing code without a threat model is the root cause of the noise problem.

## Methodology: Depth-First Analysis

| Phase | Action | Priority | Prefix |
|-------|--------|----------|--------|
| 1 | Select Target Surface | CRITICAL | `target` |
| 2 | Map the Concrete Code Path | CRITICAL | `trace` |
| 3 | Identify Controls Along the Path | HIGH | `control` |
| 4 | Prove or Disprove Exploitability | CRITICAL | `exploit` |
| 5 | Anti-Pattern Suppression | HIGH | `antipattern` |
| 6 | Document and Report | HIGH | `report` |

The cycle: Select target → Map path → Identify controls → Prove exploitability → Document → Next target. Never revert to breadth-first scanning. If you have time to analyze 3 surfaces deeply, that is infinitely more valuable than shallowly scanning 30.

## How to Use

Work through phases sequentially for each attack surface. Read reference files for detailed guidance:

- Read `references/target-scoping-from-threat-model.md` — How to select and scope targets
- Read `references/target-well-scoped-examples.md` — Examples of good vs bad target scoping
- Read `references/trace-data-flow-mapping.md` — Source-to-sink path tracing techniques
- Read `references/trace-framework-specific.md` — Framework-specific tracing patterns
- Read `references/control-bypass-evaluation.md` — Evaluating and bypassing security controls
- Read `references/control-common-patterns.md` — Common control patterns and their limits
- Read `references/exploit-payload-construction.md` — Constructing proof-of-concept payloads
- Read `references/exploit-static-analysis-limits.md` — What static analysis can and cannot prove
- Read `references/antipattern-breadth-first.md` — Recognizing and suppressing breadth-first hallucination
- Read `references/antipattern-cwe-dumping.md` — Avoiding CWE database dump reports
- Read `references/report-finding-template.md` — Detailed finding documentation format
- Read `references/report-confidence-calibration.md` — Confidence levels and honest scoping

## Output Format

Structure the final report as:

```
# Security Analysis: [System Name]
## Threat Model Reference: [link or section reference]
## Scope: [what was analyzed and to what depth]

## Confirmed Findings
[Full finding documentation per finding template]

## Likely Exploitable (Pending Verification)
[Findings with traced paths but unverifiable conditions]

## Investigated and Not Vulnerable
[Paths analyzed and found protected — proves thoroughness]

## Unconfirmed (Requires Further Analysis)
[Pattern matches that could not be fully traced — honest about limits]

## Surfaces Not Yet Analyzed
[Remaining items from threat model priority list — shows what's left]
```

The "Investigated and Not Vulnerable" section proves depth. The "Surfaces Not Yet Analyzed" section is honest scoping — it tells the user what was covered and what wasn't.

## Self-Review Checklist

Before finalizing any analysis, verify:
- [ ] Every confirmed finding has a full source-to-sink trace with file:line references
- [ ] Every confirmed finding has a concrete exploit payload or attack scenario
- [ ] Every finding maps to an attacker profile and crown jewel from the threat model
- [ ] Unconfirmed findings are clearly separated from confirmed findings
- [ ] No generic security recommendations without traced code paths
- [ ] No CWE-class listings without proven instances in this codebase
- [ ] Investigated-and-not-vulnerable paths are documented (proves thoroughness)
- [ ] Remaining unanalyzed surfaces are listed (honest scoping)
