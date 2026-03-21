---
title: Fundamental Data Structures — Arrays, Linked Lists, Stacks, Queues
impact: MEDIUM
impactDescription: Reference for complexity characteristics and use cases of foundational sequential data structures
tags: array, linked-list, stack, queue, deque, circular-buffer, fundamentals
---

## Fundamental Data Structures — Arrays, Linked Lists, Stacks, Queues

Choosing the right sequential data structure depends on your access pattern — random access favors arrays, frequent mid-collection mutation favors linked lists, and FIFO/LIFO patterns favor queues and stacks respectively.

**Incorrect (using a linked list when random access is the primary operation):**

```typescript
// O(n) per access — linked list has no random access
class Node<T> { constructor(public val: T, public next: Node<T> | null = null) {} }

function getAtIndex<T>(head: Node<T>, index: number): T {
  let curr: Node<T> | null = head;
  for (let i = 0; i < index && curr; i++) curr = curr.next;
  if (!curr) throw new Error("out of bounds");
  return curr.val;
}
// Called 10k times per request for random lookups — O(n) each time
```

**Correct (use an array for O(1) random access):**

```typescript
// O(1) per access — contiguous memory, index-based
const items: T[] = loadItems();
function getAtIndex(index: number): T {
  return items[index]; // O(1), cache-friendly
}
```

### Arrays and Variants

**Static array:** Contiguous block, fixed size, O(1) random access, O(n) insert/delete in middle.

**Dynamic array** (Go slice, JS Array): Grows via resize + copy, amortized O(1) append, O(n) insert/delete in middle.

**Other variants:** bit arrays/bitsets, circular buffers/ring buffers, matrices, parallel arrays.

**Typical uses:** dense sequences, index-heavy workloads, backing storage for hash tables, heaps, stacks, queues.

### Linked Lists and Variants

**Singly linked list:** Nodes with value + pointer to next; insert/delete given a node is O(1), search is O(n).

**Doubly linked list:** Next + prev pointers; supports O(1) removal from middle when you have the node.

**Circular, skip lists, unrolled lists, XOR lists:** Tradeoffs around cache behavior, search time, memory, and pointer overhead.

**Typical uses:** frequent insert/delete in the middle, queues with stable iterators, LRU caches when combined with hash tables.

### Stacks and Queues

**Stack (LIFO):** push, pop, top, all O(1); implementable via array or list.

**Queue (FIFO):** enqueue, dequeue, front, also O(1) with circular buffer or linked list.

**Deques:** Insert/remove at both ends in O(1), support stacks and queues in one structure.

**Specialized:** monotonic queues/deques (for sliding-window extrema), priority queues (see heaps).

**Typical uses:** call stacks, backtracking, BFS, producer-consumer pipelines, undo/redo, sliding-window algorithms.
