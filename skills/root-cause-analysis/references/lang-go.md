---
title: Go Error Signatures and Diagnostic Patterns
impact: CRITICAL
impactDescription: Eliminates most common Go misdiagnoses — nil interface vs nil pointer, goroutine leaks, race conditions — cutting debug cycles from hours to minutes
tags: go, golang, goroutine, nil, panic, race, deadlock, context, module
---

## Go Diagnostic Reference

Go errors are precise but deceptive. A nil pointer panic tells you WHERE it happened but not WHY — and the "why" in Go is often an interface subtlety, a goroutine lifecycle issue, or a context propagation gap. This reference maps error signatures to their actual root causes.

### Nil Pointer and Interface Errors

The most common Go diagnostic mistake is treating all nil panics the same. Go has two distinct nil failure modes with different root causes.

**Incorrect (treating nil interface like nil pointer):**

```go
// User sees: "panic: runtime error: invalid memory address or nil pointer dereference"
// Immediately adds nil checks everywhere:
func processUser(u *User) error {
    if u == nil { // This check is correct but may not be the actual problem
        return errors.New("user is nil")
    }
    return u.Validate()
}

// But the ACTUAL crash was on an interface value:
var w io.Writer // nil interface — type AND value are both nil
// vs
var buf *bytes.Buffer // nil concrete pointer
var w io.Writer = buf // non-nil interface wrapping a nil pointer!
// w != nil is TRUE, but w.Write() will panic
```

**Correct (distinguishing nil interface from nil concrete pointer in interface):**

```go
// Step 1: Read the stack trace to find the EXACT line of the panic
// Step 2: Check if the nil value is an interface type
// Step 3: If interface, check if it's a nil-pointer-inside-non-nil-interface

// Diagnostic: use reflect to distinguish at debug time
func debugNil(v interface{}) string {
    if v == nil {
        return "nil interface (both type and value are nil)"
    }
    rv := reflect.ValueOf(v)
    if rv.Kind() == reflect.Ptr && rv.IsNil() {
        return fmt.Sprintf("non-nil interface containing nil %T", v)
    }
    return "not nil"
}

// Common source: functions returning (*ConcreteType, error) where the
// concrete type is nil but gets assigned to an interface variable.
// Fix: return the interface type directly, or check before assignment.
func getWriter() io.Writer {
    var buf *bytes.Buffer // intentionally nil for some reason
    if buf == nil {
        return nil // Return nil interface, not nil-pointer-in-interface
    }
    return buf
}
```

### Goroutine Leaks

**Symptoms:** memory grows over time, pprof shows increasing goroutine count, service eventually OOMs.

**Incorrect (adding a timeout without understanding the leak source):**

```go
// "Just add a context timeout" — but the goroutine is blocked on a channel, not a context
func process(items []Item) {
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
    for _, item := range items {
        go func(it Item) {
            // This goroutine sends to ch but nobody reads from ch after
            // the parent returns. Context timeout doesn't help here —
            // the goroutine is blocked on ch <- result, not on ctx.Done()
            result := expensive(it)
            ch <- result // BLOCKED FOREVER if ch is unbuffered and reader is gone
        }(item)
    }
}
```

**Correct (identifying and fixing the blocked channel operation):**

```go
// Diagnostic: curl http://localhost:6060/debug/pprof/goroutine?debug=2
// This shows FULL stack traces of all goroutines including WHERE they're blocked

// Fix: use select with context, AND ensure channel has capacity or is read
func process(ctx context.Context, items []Item) error {
    ch := make(chan Result, len(items)) // buffered to prevent blocking
    for _, item := range items {
        go func(it Item) {
            result := expensive(it)
            select {
            case ch <- result:
            case <-ctx.Done():
                return // goroutine exits cleanly
            }
        }(item)
    }
    // Ensure all results are consumed or context cancels
    for range items {
        select {
        case r := <-ch:
            handle(r)
        case <-ctx.Done():
            return ctx.Err()
        }
    }
    return nil
}
```

### Race Conditions

**Diagnostic commands:**

```bash
# Run with race detector — this is the FIRST thing to do for any concurrency bug
go test -race ./...
go run -race main.go

# The race detector output tells you EXACTLY which goroutines and which variable:
# WARNING: DATA RACE
# Write at 0x00c000014088 by goroutine 7:    ← one goroutine writing
#   main.(*Server).handleRequest()
#       /app/server.go:42 +0x1a4
# Previous read at 0x00c000014088 by goroutine 6:  ← another goroutine reading
#   main.(*Server).getStatus()
#       /app/server.go:58 +0x6c
```

**Incorrect (adding a mutex around the symptom location only):**

```go
// Race detector says server.go:42 and server.go:58
// Wrong: only protecting one of the two access points
type Server struct {
    mu     sync.Mutex
    status string
}

func (s *Server) handleRequest() {
    s.mu.Lock()
    s.status = "processing" // Protected
    s.mu.Unlock()
}

func (s *Server) getStatus() string {
    return s.status // STILL UNPROTECTED — race still exists
}
```

**Correct (protecting ALL access points for the shared state):**

```go
type Server struct {
    mu     sync.RWMutex
    status string
}

func (s *Server) handleRequest() {
    s.mu.Lock()
    defer s.mu.Unlock()
    s.status = "processing"
}

func (s *Server) getStatus() string {
    s.mu.RLock()
    defer s.mu.RUnlock()
    return s.status
}

// Or better: use atomic if the shared state is a simple value
// Or better still: restructure so the state isn't shared
```

### Context Errors

`context.Canceled` and `context.DeadlineExceeded` are different root causes:

- `context.Canceled` → something UPSTREAM explicitly called `cancel()`. Check the caller chain — who canceled and why?
- `context.DeadlineExceeded` → the operation took too long. Check what the operation was waiting on.

**Diagnostic:** add context cause chain logging:

```go
// Go 1.20+: context.Cause() reveals the original cancellation reason
if err := ctx.Err(); err != nil {
    cause := context.Cause(ctx)
    log.Printf("context error: %v, cause: %v", err, cause)
}
```

### Module and Dependency Errors

```bash
# "module not found" or version conflicts:
go mod graph | grep problematic-module   # see who requires what version
go mod why -m some/module                # why is this module in the graph
go mod tidy                              # clean up, often fixes phantom deps
GOFLAGS=-mod=mod go build                # bypass read-only module errors temporarily
go clean -modcache                       # nuclear option: clear entire module cache

# "ambiguous import" — two modules provide the same package:
go mod graph | grep the-package          # find both providers
# Fix: add explicit require + exclude in go.mod
```

### Key Diagnostic Tools

```bash
# Profiling (must import _ "net/http/pprof" or use runtime/pprof)
go tool pprof http://localhost:6060/debug/pprof/heap       # memory
go tool pprof http://localhost:6060/debug/pprof/goroutine  # goroutine leaks
go tool pprof http://localhost:6060/debug/pprof/profile    # CPU (30s sample)

# Debugging
dlv debug ./cmd/server -- --flag=value   # delve debugger
dlv attach <pid>                          # attach to running process

# Build diagnostics
go build -gcflags='-m -m' ./...          # escape analysis (why is this heap-allocated?)
go vet ./...                              # static analysis
GODEBUG=gctrace=1 ./binary               # GC behavior
```
