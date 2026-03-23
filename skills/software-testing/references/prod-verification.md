---
title: Production Verification — Canary, Flags, and Observability
impact: MEDIUM-HIGH
impactDescription: Catches deployment-specific and real-traffic failures that CI cannot
tags: production, canary, feature-flags, observability, health-checks, deploy-safety
---

## Production Verification — Canary, Flags, and Observability

Tests in CI verify the build. Production has real traffic, real data, and real failure modes that don't exist in test environments. Production verification extends testing past the CI boundary: canary deploys limit blast radius, feature flags decouple deployment from release, and observability turns alerts into continuous assertions.

**Incorrect (deploy and hope — CI passed so we're fine):**

```typescript
// Deployment pipeline
async function deploy(version: string) {
    await buildAndPush(version);
    await rollOutToAllInstances(version);  // 100% traffic immediately
    console.log("Deployed! CI passed so we're good.");
    // Missing: environment variables changed, staging DB ≠ prod DB,
    // traffic patterns differ, memory limits differ, secrets rotated...
}
```

**Correct (progressive verification with automated rollback):**

```typescript
// Canary deploy with metric-based promotion
async function deploy(version: string) {
    // Step 1: Deploy to canary (5% of traffic)
    await deployCanary(version, { trafficPercent: 5 });

    // Step 2: Run smoke tests against canary
    const smokeResults = await runSmokeTests({
        target: "canary",
        checks: [
            { endpoint: "/health", expectStatus: 200 },
            { endpoint: "/api/findings?limit=1", expectStatus: 200 },
            { name: "db-connectivity", expectHealthy: true },
        ],
    });
    if (!smokeResults.allPassed) {
        await rollback(version);
        throw new Error(`Smoke tests failed: ${smokeResults.failures}`);
    }

    // Step 3: Monitor canary metrics for 10 minutes
    const metrics = await monitorCanary({
        duration: "10m",
        thresholds: {
            errorRateDelta: 0.01,    // <1% error rate increase vs baseline
            p99LatencyDelta: 1.5,    // <1.5x p99 latency vs baseline
            businessMetricDelta: 0.05, // <5% conversion rate decrease
        },
    });
    if (!metrics.withinThresholds) {
        await rollback(version);
        throw new Error(`Canary metrics degraded: ${metrics.violations}`);
    }

    // Step 4: Progressive rollout
    for (const percent of [25, 50, 100]) {
        await promoteCanary(version, { trafficPercent: percent });
        await monitorForMinutes(5);
    }
}
```

Observability as testing: error rate spikes mean something broke, latency spikes mean something degraded, new error types mean new code paths are failing. Structure alerts like test assertions — they verify expected behavior and fire when violated.
