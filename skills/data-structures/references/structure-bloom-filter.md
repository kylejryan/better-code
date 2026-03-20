---
title: Bloom Filter — Probabilistic Membership with Zero False Negatives
impact: HIGH
impactDescription: 1.2 MB for 1M items at 1% false positive rate vs ~50 MB for a hash set
tags: bloom-filter, probabilistic, membership, deduplication, set
---

## Bloom Filter — Probabilistic Membership with Zero False Negatives

Fast "has this item been seen before?" checks on massive sets, where occasional false positives are acceptable but false negatives are not. Common for: deduplication, "already processed" checks, membership pre-filtering before expensive lookups.

**Key property:** "definitely not in the set" (no false negatives) or "probably in the set" (possible false positives). Uses dramatically less memory than a hash set for large cardinalities.

**Interface:**
```
Add(item)
MightContain(item) → bool   // true = maybe present, false = definitely absent
EstimatedCount() → int
FalsePositiveRate() → float
```

**Sizing formula:**
For n expected items and desired false positive rate p:
- m (bits) = -(n × ln(p)) / (ln(2)²)
- k (hash functions) = (m/n) × ln(2)

Example: 1 million items, 1% false positive rate → m ≈ 9.6M bits (1.2 MB), k ≈ 7.

**Incorrect (hash set for 10M membership checks):**

```go
// 10M entries × ~50 bytes each = ~500 MB
seen := make(map[string]struct{}, 10_000_000)
func isDuplicate(id string) bool {
    _, ok := seen[id]
    return ok
}
```

**Correct (Go bloom filter):**

```go
type BloomFilter struct {
    bits []uint64
    m    uint64  // total bits
    k    int     // number of hash functions
}

func NewBloomFilter(expectedItems int, fpRate float64) *BloomFilter {
    m := uint64(-float64(expectedItems) * math.Log(fpRate) / (math.Ln2 * math.Ln2))
    k := int(float64(m) / float64(expectedItems) * math.Ln2)
    return &BloomFilter{
        bits: make([]uint64, (m+63)/64),
        m:    m,
        k:    k,
    }
}

func (bf *BloomFilter) Add(data []byte) {
    h1, h2 := hash128(data)  // two 64-bit hashes (e.g., murmur3-128)
    for i := 0; i < bf.k; i++ {
        pos := (h1 + uint64(i)*h2) % bf.m  // double hashing
        bf.bits[pos/64] |= 1 << (pos % 64)
    }
}

func (bf *BloomFilter) MightContain(data []byte) bool {
    h1, h2 := hash128(data)
    for i := 0; i < bf.k; i++ {
        pos := (h1 + uint64(i)*h2) % bf.m
        if bf.bits[pos/64]&(1<<(pos%64)) == 0 {
            return false  // definitely not present
        }
    }
    return true  // probably present
}
```

**Correct (TypeScript bloom filter):**

```typescript
class BloomFilter {
    private bits: Uint32Array;
    private m: number;
    private k: number;

    constructor(expectedItems: number, fpRate: number) {
        this.m = Math.ceil(-expectedItems * Math.log(fpRate) / (Math.LN2 * Math.LN2));
        this.k = Math.round((this.m / expectedItems) * Math.LN2);
        this.bits = new Uint32Array(Math.ceil(this.m / 32));
    }

    add(item: string): void {
        const [h1, h2] = this.hash(item);
        for (let i = 0; i < this.k; i++) {
            const pos = (h1 + i * h2) % this.m;
            this.bits[pos >>> 5] |= 1 << (pos & 31);
        }
    }

    mightContain(item: string): boolean {
        const [h1, h2] = this.hash(item);
        for (let i = 0; i < this.k; i++) {
            const pos = (h1 + i * h2) % this.m;
            if ((this.bits[pos >>> 5] & (1 << (pos & 31))) === 0) {
                return false;
            }
        }
        return true;
    }

    private hash(item: string): [number, number] {
        // FNV-1a based double hash
        let h1 = 2166136261;
        let h2 = 1099511628211;
        for (let i = 0; i < item.length; i++) {
            const c = item.charCodeAt(i);
            h1 = Math.imul(h1 ^ c, 16777619);
            h2 = Math.imul(h2 ^ c, 2654435761);
        }
        return [h1 >>> 0, h2 >>> 0];
    }
}
```

**Performance:** O(k) add and query (effectively O(1) for typical k values of 3-10). Memory: see sizing formula — dramatically less than storing actual elements.
