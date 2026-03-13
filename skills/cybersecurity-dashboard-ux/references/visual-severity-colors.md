---
title: Severity Colors Are Sacred — Consistent Color System for Security Data
impact: MEDIUM-HIGH
impactDescription: Inconsistent severity colors cause misreads that can delay response to critical findings
tags: visual-design, colors, severity, consistency, accessibility
---

## Severity Colors Are Sacred — Consistent Color System for Security Data

Establish a severity palette and use it consistently everywhere — badges, chart segments, table row accents, status indicators.

### The Severity Palette

- **Critical:** Red (not orange-red, not pink — unmistakable red)
- **High:** Orange
- **Medium:** Yellow or amber
- **Low:** Blue or gray-blue
- **Info:** Gray

### The Rule

Never use these colors for non-severity purposes. If your brand color is red, you have a conflict — the brand must yield on dashboard surfaces. Red means critical. Always.

**Incorrect (severity colors reused for non-severity):**

```css
/* Brand uses red for primary buttons */
.btn-primary { background: #dc2626; }  /* Same red as critical severity */

/* Navigation uses orange for active state */
.nav-active { color: #f97316; }  /* Same orange as high severity */
```

Users see red buttons and orange nav items and unconsciously associate them with severity. The color system loses its signal value.

**Correct (severity colors reserved exclusively):**

```css
/* Severity colors — ONLY used for severity indicators */
.severity-critical { color: #dc2626; }
.severity-high     { color: #f97316; }
.severity-medium   { color: #f59e0b; }
.severity-low      { color: #3b82f6; }
.severity-info     { color: #6b7280; }

/* Brand/UI colors use a different palette */
.btn-primary { background: #6366f1; }  /* Indigo — distinct from all severity colors */
.nav-active  { color: #8b5cf6; }      /* Violet — distinct from all severity colors */
```

### Accessibility Consideration

Severity colors must work for colorblind users. Always pair color with a secondary indicator:
- Shape: different icon per severity (filled circle, triangle, square, outline circle)
- Text: always show the severity label alongside the color
- Position: critical items on the left/top (most visible scan position)

Color is a reinforcement of meaning, not the sole carrier of meaning.
