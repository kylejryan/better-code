---
title: Trie / Prefix Tree — O(key length) Prefix Operations
impact: HIGH
impactDescription: Prefix search goes from O(n × key length) with hash map filtering to O(prefix length + matches) with a trie
tags: trie, prefix-tree, radix-tree, autocomplete, routing, prefix-search
---

## Trie / Prefix Tree — O(key length) Prefix Operations

String keys with prefix-based operations: autocomplete, prefix search, longest prefix match, IP routing table, URL path routing.

**Interface:**
```
Insert(key string, value V)
Get(key string) → (V, bool)
Delete(key string)
HasPrefix(prefix string) → bool
GetByPrefix(prefix string) → []V
LongestPrefixMatch(key string) → (string, V, bool)
```

**Incorrect (linear scan for prefix search):**

```typescript
const routes = new Map<string, Handler>();
function findHandler(path: string): Handler | undefined {
    // O(n) scan of all routes for every request
    for (const [pattern, handler] of routes) {
        if (path.startsWith(pattern)) return handler;
    }
    return undefined;
}
```

**Correct (Go trie):**

```go
type TrieNode[V any] struct {
    children map[byte]*TrieNode[V]
    value    *V    // nil if not a terminal
}

func NewTrie[V any]() *TrieNode[V] {
    return &TrieNode[V]{children: make(map[byte]*TrieNode[V])}
}

func (t *TrieNode[V]) Insert(key string, value V) {
    node := t
    for i := 0; i < len(key); i++ {
        c := key[i]
        if node.children[c] == nil {
            node.children[c] = &TrieNode[V]{children: make(map[byte]*TrieNode[V])}
        }
        node = node.children[c]
    }
    node.value = &value
}

func (t *TrieNode[V]) Get(key string) (V, bool) {
    node := t
    for i := 0; i < len(key); i++ {
        node = node.children[key[i]]
        if node == nil {
            var zero V
            return zero, false
        }
    }
    if node.value == nil {
        var zero V
        return zero, false
    }
    return *node.value, true
}

func (t *TrieNode[V]) LongestPrefixMatch(key string) (string, V, bool) {
    node := t
    var lastMatch string
    var lastValue V
    found := false
    for i := 0; i < len(key); i++ {
        if node.value != nil {
            lastMatch = key[:i]
            lastValue = *node.value
            found = true
        }
        node = node.children[key[i]]
        if node == nil {
            break
        }
    }
    if node != nil && node.value != nil {
        return key, *node.value, true
    }
    return lastMatch, lastValue, found
}
```

**Correct (TypeScript trie):**

```typescript
class TrieNode<V> {
    children: Map<string, TrieNode<V>> = new Map();
    value: V | undefined;
    isTerminal = false;
}

class Trie<V> {
    private root = new TrieNode<V>();

    insert(key: string, value: V): void {
        let node = this.root;
        for (const ch of key) {
            if (!node.children.has(ch)) {
                node.children.set(ch, new TrieNode());
            }
            node = node.children.get(ch)!;
        }
        node.value = value;
        node.isTerminal = true;
    }

    getByPrefix(prefix: string): V[] {
        let node = this.root;
        for (const ch of prefix) {
            node = node.children.get(ch)!;
            if (!node) return [];
        }
        const results: V[] = [];
        this.collect(node, results);
        return results;
    }

    private collect(node: TrieNode<V>, results: V[]): void {
        if (node.isTerminal) results.push(node.value!);
        for (const child of node.children.values()) {
            this.collect(child, results);
        }
    }
}
```

**Radix tree optimization:** Compress chains of single-child nodes into single edges with multi-character labels. Reduces memory and depth for long keys with common prefixes (URLs, file paths, dotted identifiers).

For dense child sets (ASCII only), replace `map[byte]` with `[256]*TrieNode` for better cache performance.

**Performance:** O(key length) for all operations. Memory depends on key set density. Radix compression dramatically reduces memory for long keys with common prefixes.
