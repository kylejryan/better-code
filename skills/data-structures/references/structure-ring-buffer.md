---
title: Ring Buffer — Fixed-Capacity FIFO with Automatic Overwrite
impact: HIGH
impactDescription: O(1) push with zero allocations and bounded memory for sliding windows and event logs
tags: ring-buffer, circular-buffer, fifo, sliding-window, bounded
---

## Ring Buffer — Fixed-Capacity FIFO with Automatic Overwrite

Fixed-capacity FIFO where old entries are automatically overwritten by new ones. Common for: sliding windows, recent event logs, rate limiting windows, bounded history buffers.

**Interface:**
```
Push(item)              // add to head; overwrites oldest if full
Peek() → item           // view newest without removing
Slice(n) → []item       // last n items in insertion order
Len() → int             // current number of items (up to capacity)
Full() → bool
Iterate() → iterator    // oldest to newest
```

**Incorrect (unbounded slice for "last N" events):**

```go
// Grows forever, manual truncation is error-prone
var events []Event
func addEvent(e Event) {
    events = append(events, e)
    if len(events) > 1000 {
        events = events[len(events)-1000:]  // copies on every trim
    }
}
```

**Correct (Go ring buffer):**

```go
type RingBuffer[T any] struct {
    buf  []T
    head int    // next write position
    len  int    // current number of items
    cap  int
}

func NewRingBuffer[T any](capacity int) *RingBuffer[T] {
    return &RingBuffer[T]{
        buf: make([]T, capacity),
        cap: capacity,
    }
}

func (r *RingBuffer[T]) Push(item T) {
    r.buf[r.head] = item
    r.head = (r.head + 1) % r.cap
    if r.len < r.cap {
        r.len++
    }
}

func (r *RingBuffer[T]) Slice(n int) []T {
    count := n
    if count > r.len {
        count = r.len
    }
    result := make([]T, count)
    start := (r.head - count + r.cap) % r.cap
    for i := 0; i < count; i++ {
        result[i] = r.buf[(start+i)%r.cap]
    }
    return result
}

func (r *RingBuffer[T]) Len() int  { return r.len }
func (r *RingBuffer[T]) Full() bool { return r.len == r.cap }
```

**Correct (TypeScript ring buffer):**

```typescript
class RingBuffer<T> {
    private buf: (T | undefined)[];
    private head = 0;
    private _len = 0;

    constructor(capacity: number) {
        this.buf = new Array(capacity);
    }

    push(item: T): void {
        this.buf[this.head] = item;
        this.head = (this.head + 1) % this.buf.length;
        if (this._len < this.buf.length) this._len++;
    }

    slice(n: number): T[] {
        const count = Math.min(n, this._len);
        const result: T[] = [];
        let idx = (this.head - count + this.buf.length) % this.buf.length;
        for (let i = 0; i < count; i++) {
            result.push(this.buf[idx]!);
            idx = (idx + 1) % this.buf.length;
        }
        return result;
    }

    get length(): number { return this._len; }
    get full(): boolean { return this._len === this.buf.length; }
}
```

**Performance:** O(1) push. O(n) slice for n items. Zero allocations on push (pre-allocated buffer). Ideal for bounded-memory sliding windows.
