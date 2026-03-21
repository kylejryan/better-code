---
title: Bitset — Fast Membership and Set Operations on Bounded Universes
impact: HIGH
impactDescription: Set union/intersection on 1024 elements costs 16 bitwise operations vs 1024 hash lookups
tags: bitset, membership, set-operations, flags, permissions, enum
---

## Bitset — Fast Membership and Set Operations on Bounded Universes

Membership tracking for a small, bounded universe of integer-like values. Dramatically faster and smaller than hash sets for sets of flags, permissions, enum combinations, or small integer IDs.

**Interface:**
```
Set(i int)
Clear(i int)
Has(i int) → bool
Union(other Bitset) → Bitset      // O(1) per word, not per element
Intersection(other Bitset) → Bitset
Difference(other Bitset) → Bitset
Count() → int                      // popcount
```

**Incorrect (hash set for permission checks):**

```go
// Each user has a set of permissions (< 64 possible)
type Permissions map[string]struct{}

func hasAll(user, required Permissions) bool {
    for p := range required {
        if _, ok := user[p]; !ok { return false }
    }
    return true // O(n) hash lookups
}

func union(a, b Permissions) Permissions {
    result := make(Permissions)
    for p := range a { result[p] = struct{}{} }
    for p := range b { result[p] = struct{}{} }
    return result // O(n) allocations + hash insertions
}
```

**Correct (Go bitset):**

```go
type Bitset struct {
    words []uint64
}

func NewBitset(size int) *Bitset {
    return &Bitset{words: make([]uint64, (size+63)/64)}
}

func (b *Bitset) Set(i int)         { b.words[i/64] |= 1 << (i % 64) }
func (b *Bitset) Clear(i int)       { b.words[i/64] &^= 1 << (i % 64) }
func (b *Bitset) Has(i int) bool    { return b.words[i/64]&(1<<(i%64)) != 0 }

func (b *Bitset) Union(other *Bitset) *Bitset {
    result := NewBitset(len(b.words) * 64)
    for i := range b.words {
        result.words[i] = b.words[i] | other.words[i]
    }
    return result
}

func (b *Bitset) Intersection(other *Bitset) *Bitset {
    result := NewBitset(len(b.words) * 64)
    for i := range b.words {
        result.words[i] = b.words[i] & other.words[i]
    }
    return result
}

func (b *Bitset) Difference(other *Bitset) *Bitset {
    result := NewBitset(len(b.words) * 64)
    for i := range b.words {
        result.words[i] = b.words[i] &^ other.words[i]
    }
    return result
}

func (b *Bitset) Count() int {
    n := 0
    for _, w := range b.words {
        n += bits.OnesCount64(w)
    }
    return n
}
```

**Correct (TypeScript bitset):**

```typescript
class Bitset {
    private words: Uint32Array;

    constructor(size: number) {
        this.words = new Uint32Array(Math.ceil(size / 32));
    }

    set(i: number): void   { this.words[i >>> 5] |= 1 << (i & 31); }
    clear(i: number): void { this.words[i >>> 5] &= ~(1 << (i & 31)); }
    has(i: number): boolean { return (this.words[i >>> 5] & (1 << (i & 31))) !== 0; }

    union(other: Bitset): Bitset {
        const result = new Bitset(this.words.length * 32);
        for (let i = 0; i < this.words.length; i++) {
            result.words[i] = this.words[i] | other.words[i];
        }
        return result;
    }

    intersection(other: Bitset): Bitset {
        const result = new Bitset(this.words.length * 32);
        for (let i = 0; i < this.words.length; i++) {
            result.words[i] = this.words[i] & other.words[i];
        }
        return result;
    }

    count(): number {
        let n = 0;
        for (let i = 0; i < this.words.length; i++) {
            let w = this.words[i];
            w = w - ((w >>> 1) & 0x55555555);
            w = (w & 0x33333333) + ((w >>> 2) & 0x33333333);
            n += (((w + (w >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
        }
        return n;
    }
}
```

Use `Uint32Array` in TS because bitwise operators in JS work on 32-bit integers.

**Performance:** O(1) set/clear/has. O(words) for set operations — a 1024-element universe uses 16 uint64s, so union/intersection is 16 OR/AND operations vs 1024 hash lookups. Memory: 1 bit per possible element vs ~50-100 bytes per element in a hash set.
