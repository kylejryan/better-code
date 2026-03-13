# Cybersecurity Dashboard UX

## Structure

```
cybersecurity-dashboard-ux/
  SKILL.md       # Main skill file - read this first
  AGENTS.md      # This navigation guide
  CLAUDE.md      # Symlink to AGENTS.md
  references/    # Detailed reference files
```

## Usage

1. Read `SKILL.md` for the main skill instructions
2. Browse `references/` for detailed documentation on specific topics
3. Reference files are loaded on-demand - read only what you need

Security dashboards serve two fundamentally different audiences with the same underlying data: AppSec teams who need org-wide risk posture and triage at scale, and engineers who need scoped, actionable work queues for their own services. Every design decision must account for this split.

The user's primary emotion when using a security dashboard is anxiety — "am I safe? what's broken? what do I need to do?" Good security UX replaces anxiety with clarity. Bad security UX amplifies anxiety with walls of alerts, unexplained severity scores, and data without context.

## When to Apply

Apply these patterns when:
- Designing security dashboards or risk posture views
- Building vulnerability explorers, incident queues, or triage interfaces
- Creating role-based views for AppSec vs engineering personas
- Designing drill-down navigation for security data
- Reviewing security product UI for usability
- Building DevSecOps portals or security posture management tools

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Personas | CRITICAL | `persona-` |
| 2 | Information Architecture | CRITICAL | `ia-` |
| 3 | Screen Design | HIGH | `screen-` |
| 4 | Drill-Down & Navigation | HIGH | `drilldown-` |
| 5 | Visual Design | MEDIUM-HIGH | `visual-` |
| 6 | Interaction Patterns | MEDIUM | `interaction-` |
| 7 | Design Checklist | MEDIUM | `checklist-` |

## Core Principles

**Dual-Persona Design**: Every widget has a clear primary persona. AppSec sees org-wide risk with slicing by team, env, and severity. Engineers see their own services by default with scoped work queues. One view for both serves neither.

**Information Layers**: Structure as Overview → Lens (role) → Explorer → Detail. Each layer increases specificity and decreases scope. Every summary card, chart segment, and table row has a clear drill-down target.

**Problem Space, Not Tool Space**: Organize by what users understand — vulnerabilities, secrets, misconfigurations, threats, compliance — never by which scanner produced the data.

**Task-First Navigation**: Top-level nav mirrors jobs-to-be-done: Monitor, Investigate, Fix, Configure, Report. Users should never wonder which tab has what they need.

**Severity Colors Are Sacred**: Critical=red, High=orange, Medium=yellow/amber, Low=blue. Never use severity colors for non-severity purposes. Red means critical. Always.

## The Practical V1 Screen Set

Build these screens in priority order:

```
1. Org Overview (AppSec Home)           — the situation room
2. Engineering Home ("My Security Work") — the engineer's action center
3. Service Detail Page                  — shared, role-adapted
4. Vulnerability Explorer               — power-user investigation tool
5. Issue Detail Page                    — deep-linkable, full context
6. Incident/Threat Explorer             — if runtime detection is in scope
7. Policy/Configuration Panel           — rule and policy management
8. Audit Log / Activity Timeline        — who did what when
```

Screens 1-5 are the core loop. Each screen should be functional standalone — a user who deep-links to the issue detail page shouldn't need to navigate from the overview first.

## How to Use

Read individual reference files for detailed specifications:

```
references/persona-appsec.md
references/persona-engineer.md
references/screen-org-overview.md
references/screen-vuln-explorer.md
references/drilldown-navigation-chains.md
references/visual-severity-colors.md
references/checklist-comprehensive.md
references/_sections.md
```

Each reference file contains:
- Detailed specifications for that aspect of security dashboard design
- Specific widget layouts, interaction patterns, and UX rules
- Concrete examples of correct and incorrect approaches

## Quick Design Checklist

Before shipping a security dashboard screen, verify:
- Every widget has a clear primary persona (AppSec or Engineer)
- Engineers see their own services by default, not the whole org
- Every metric that can trend shows its trend (arrow, sparkline, delta)
- Severity colors used consistently and exclusively for severity
- Every summary card and table row has a clear drill-down target
- Drill-down pre-applies filters matching source context
- Inline actions available without leaving the current view
- "Is it safe to deploy?" answerable in under 3 seconds from engineering home
- Organized by problem space, not by tool/scanner
- Every view is deep-linkable via URL

A security dashboard succeeds when users open it proactively — not because an alert forced them to, but because it's the fastest way to understand their security posture and take action.
