---
title: Notification Hierarchy — Respect Attention, Don't Abuse It
impact: MEDIUM
impactDescription: Over-notification trains users to ignore alerts; under-notification misses critical events
tags: interaction, notifications, alerts, attention-management, severity
---

## Notification Hierarchy — Respect Attention, Don't Abuse It

Not every finding deserves a notification. Calibrate to severity x environment x novelty.

### Notification Tiers

| Trigger | Channel | Timing |
|---------|---------|--------|
| Critical severity + production + new | Real-time alert (banner, email, Slack) | Immediate |
| High severity + SLA approaching | Daily digest or dashboard badge | Batched |
| Medium/Low severity | Dashboard badge only | On next visit |
| Resolved findings (positive signal) | Weekly digest | Batched |

### Rules

1. **Over-notification trains users to ignore notifications.** If everything is an alert, nothing is an alert. Reserve real-time notifications for events that require same-day action.

2. **Under-notification misses critical events.** Critical findings in production that go unnotified for 24 hours represent a failure of the notification system.

3. **Positive notifications build engagement.** "3 critical findings resolved this week" in a weekly digest reinforces progress and encourages continued use.

4. **Users must control their notification preferences.** Provide per-channel, per-severity configuration. An AppSec lead may want all critical alerts; an engineer may only want alerts for their services.

5. **Notification fatigue is measurable.** If notification click-through rates drop below 10%, the system is sending too many. Tighten the criteria.

**Incorrect (everything alerts):**

```text
🔔 New medium-severity finding in staging
🔔 Scan completed for dev-branch
🔔 New low-severity finding in development
🔔 Configuration change detected
```

Four notifications in an hour, none requiring action. User mutes the channel.

**Correct (calibrated alerts):**

```text
🚨 CRITICAL: New SQL injection in production auth-service (requires immediate action)
```

One notification that matters. User acts on it because notifications have earned trust.
