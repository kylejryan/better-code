---
title: Think in Primitives — Features Are One-Time, Primitives Are Forever
impact: CRITICAL
impactDescription: Third use of a primitive is near-zero cost, compounding savings on every subsequent feature
tags: primitives, reuse, decomposition, leverage, mindset
---

## Think in Primitives — Features Are One-Time, Primitives Are Forever

Feature thinking builds a dead end. Primitive thinking builds a platform. The primitive approach costs maybe 30% more upfront but repays that cost by the third use case and compounds from there.

When you see a feature request, decompose it: `Feature = Primitive A + Primitive B + Glue(A, B)`. Build A and B as reusable primitives. Keep the glue thin and specific.

**Incorrect (feature thinking — one-off solution):**

```typescript
// Feature: "Send a Slack notification when a deployment fails"
async function notifyDeploymentFailure(deployment: Deployment): Promise<void> {
  const slack = new WebClient(process.env.SLACK_TOKEN);
  await slack.chat.postMessage({
    channel: "#deployments",
    text: `Deployment ${deployment.id} failed: ${deployment.error}`,
    blocks: [
      { type: "header", text: { type: "plain_text", text: "Deployment Failed" } },
      { type: "section", text: { type: "mrkdwn", text: `*ID:* ${deployment.id}\n*Error:* ${deployment.error}` } },
    ],
  });
}
// Next request: "Send a Slack notification when a build fails" → copy-paste-modify
// Next request: "Send an email when deployment fails" → another one-off function
```

**Correct (primitive thinking — build the notification dispatch system):**

```typescript
// Primitive: notification channel interface
interface NotificationChannel {
  send(message: NotificationMessage): Promise<void>;
}

// Primitive: notification dispatcher with registry
class NotificationDispatcher {
  constructor(private readonly channels: Map<string, NotificationChannel>) {}

  async dispatch(event: string, message: NotificationMessage): Promise<void> {
    const channel = this.channels.get(event);
    if (!channel) return;
    await channel.send(message);
  }
}

// Primitive: template renderer
const templates: Record<string, (data: unknown) => NotificationMessage> = {
  "deployment.failed": (d: Deployment) => ({
    title: "Deployment Failed",
    body: `Deployment ${d.id} failed: ${d.error}`,
    severity: "critical",
  }),
  "build.failed": (d: Build) => ({
    title: "Build Failed",
    body: `Build ${d.id} failed at step: ${d.failedStep}`,
    severity: "high",
  }),
};

// Adding a new notification: add ONE template entry. Zero code changes to dispatch.
// Adding a new channel: implement NotificationChannel. Zero changes to templates.
```

The next ten notification requests are zero-code changes — they're entries in a registry. Build the machine that builds the thing, not the thing itself.
