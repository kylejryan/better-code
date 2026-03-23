---
title: Risk-Driven Test Investment
impact: CRITICAL
impactDescription: Focuses testing effort where bugs are most costly
tags: strategy, risk, priority, coverage-allocation, test-planning
---

## Risk-Driven Test Investment

Don't test everything equally. Test proportionally to risk: the probability of a bug multiplied by the cost of that bug reaching production. Authentication bugs, financial logic bugs, and data integrity bugs warrant aggressive multi-layered testing. Pure data transforms and logging warrant spot checks.

**Incorrect (uniform testing effort regardless of risk):**

```go
// Same level of testing for a critical auth boundary and a log formatter
func TestFormatLogMessage(t *testing.T) {
    tests := []struct {
        level   string
        msg     string
        want    string
    }{
        {"info", "started", "[INFO] started"},
        {"warn", "slow query", "[WARN] slow query"},
        {"error", "failed", "[ERROR] failed"},
        {"debug", "trace", "[DEBUG] trace"},
        // 20 more cases for a simple string formatter...
    }
    for _, tt := range tests {
        // Exhaustive testing of trivial logic
    }
}

func TestAuthenticateUser(t *testing.T) {
    // Meanwhile, auth has just one happy-path test
    token := Authenticate("user", "pass")
    if token == "" {
        t.Fatal("expected token")
    }
}
```

**Correct (test investment proportional to risk):**

```go
// Light testing for low-risk code
func TestFormatLogMessage(t *testing.T) {
    // Spot check — the type system ensures the return type
    got := FormatLogMessage("error", "connection refused")
    if !strings.HasPrefix(got, "[ERROR]") {
        t.Errorf("expected ERROR prefix, got %s", got)
    }
}

// Aggressive testing for high-risk auth boundary
func TestAuthentication(t *testing.T) {
    db := setupTestDB(t)
    svc := NewAuthService(db)

    t.Run("valid credentials return token with correct claims", func(t *testing.T) {
        token, err := svc.Authenticate(ctx, "user@example.com", "correct-password")
        require.NoError(t, err)
        claims := parseToken(t, token)
        assert.Equal(t, "user@example.com", claims.Email)
        assert.WithinDuration(t, time.Now().Add(24*time.Hour), claims.ExpiresAt, time.Minute)
    })

    t.Run("invalid password returns error not token", func(t *testing.T) {
        token, err := svc.Authenticate(ctx, "user@example.com", "wrong-password")
        assert.Error(t, err)
        assert.Empty(t, token)
    })

    t.Run("expired token rejected on validation", func(t *testing.T) { /* ... */ })
    t.Run("tampered token rejected", func(t *testing.T) { /* ... */ })
    t.Run("revoked token rejected", func(t *testing.T) { /* ... */ })
    t.Run("concurrent sessions respected", func(t *testing.T) { /* ... */ })
    t.Run("brute force protection triggers after N failures", func(t *testing.T) { /* ... */ })
    t.Run("cross-tenant token rejected", func(t *testing.T) { /* ... */ })
}
```

High risk (auth, payments, data integrity): test every path, every edge case, every failure mode. Low risk (formatting, logging): type system plus spot checks.
