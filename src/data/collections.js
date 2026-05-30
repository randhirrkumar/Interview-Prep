const collections = {
  title: 'Collections & Data Structures',
  description: 'Java Collections Framework, HashMap internals, ArrayList vs LinkedList, and when to use which.',
  tags: ['Collections', 'HashMap', 'Java', 'Data Structures'],
  questions: [
    {
      id: 1,
      question: 'Explain HashMap internal working — how put() and get() work',
      difficulty: 'advanced',
      asked: true,
      tags: ['HashMap', 'Internal Working'],
      answer: `HashMap is backed by an array of buckets (Node[] table). Each bucket is a linked list (or tree for large lists).

put(key, value):
1. Compute hashCode() of key
2. Apply hash function to get bucket index: (n-1) & hash
3. If bucket empty: insert directly
4. If bucket has entries: walk the chain, check equals() for each
   - If key found: update value
   - If not found: add to chain
5. If chain length > 8 AND array size >= 64: convert to Red-Black Tree (Java 8+) → O(log n) instead of O(n)

Default capacity: 16. Default load factor: 0.75. Resizing (rehashing) happens when size > capacity * loadFactor.

hashCode() + equals() contract: if two objects are equals(), they MUST have the same hashCode. Violating this breaks HashMap — objects are lost!`,
      code: `// HashMap bucket structure (simplified)
class HashMap<K, V> {
    Node<K,V>[] table;  // array of buckets
    int size;
    float loadFactor = 0.75f;

    static class Node<K,V> {
        final int hash;
        final K key;
        V value;
        Node<K,V> next;  // linked list for same-bucket entries
    }

    public V put(K key, V value) {
        int hash = hash(key.hashCode());
        int i = (table.length - 1) & hash;  // bucket index

        if (table[i] == null) {
            table[i] = new Node<>(hash, key, value, null);
        } else {
            // Walk the chain
            for (Node<K,V> e = table[i]; e != null; e = e.next) {
                if (e.hash == hash && (e.key == key || key.equals(e.key))) {
                    e.value = value;  // update existing
                    return;
                }
            }
            table[i] = new Node<>(hash, key, value, table[i]);  // prepend
        }

        if (++size > threshold) resize();  // rehash when 75% full
    }
}

// Always override hashCode when overriding equals!
class PolicyKey {
    String policyNumber;
    String customerId;

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof PolicyKey)) return false;
        PolicyKey other = (PolicyKey) o;
        return Objects.equals(policyNumber, other.policyNumber)
            && Objects.equals(customerId, other.customerId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(policyNumber, customerId);  // MUST implement this!
    }
}

// HashMap vs Hashtable vs ConcurrentHashMap
// HashMap: not thread-safe, allows null key/value
// Hashtable: thread-safe (synchronized), NO null keys, legacy
// ConcurrentHashMap: thread-safe, high performance (segment locking in Java 7, CAS in Java 8)

ConcurrentHashMap<String, Vehicle> cache = new ConcurrentHashMap<>();
cache.computeIfAbsent(key, k -> loadFromDB(k));  // atomic get-or-compute`,
      followUp: [
        { question: 'What is the difference between HashMap and TreeMap?', answer: `HashMap is backed by a hash table — O(1) average for get/put, no ordering. TreeMap is backed by a Red-Black Tree — O(log n) for get/put, keys are sorted in natural order (or by Comparator). Use TreeMap when you need sorted keys or range queries (subMap, headMap, tailMap). For most use cases where you don't need ordering, HashMap is faster.` },
        { question: 'What is LinkedHashMap? When would you use it?', answer: `Maintains insertion order (default) or access order (LRU). Has a doubly-linked list running through the nodes. Slightly slower than HashMap due to maintaining the linked list. Use for: predictable iteration order, LRU cache (access order = true + override removeEldestEntry). In Spring: LinkedMultiValueMap maintains order of added values.` },
        { question: 'What happens in HashMap if two keys have the same hashCode?', answer: `Both keys go to the same bucket. HashMap stores them as a chain (linked list). get() walks the chain, comparing with equals() until it finds the right key. In Java 8+, if bucket length exceeds 8, the chain converts to a Red-Black Tree for O(log n) performance. This is why hashCode() quality matters — poor hash functions cause many collisions → poor performance.` },
      ],
      tip: 'HashMap allows null key (one), null values (many). TreeMap sorts by key (uses Comparable/Comparator). LinkedHashMap maintains insertion order. Know when to use each.',
    },
    {
      id: 2,
      question: 'ArrayList vs LinkedList — when to use which?',
      difficulty: 'beginner',
      asked: true,
      tags: ['Collections', 'ArrayList', 'LinkedList'],
      answer: `ArrayList is backed by an array. LinkedList is a doubly linked list.

ArrayList:
- Get by index: O(1) — fast random access
- Add at end: O(1) amortized (O(n) when resize needed)
- Add/remove in middle: O(n) — shifts elements
- Memory: compact (just the array)

LinkedList:
- Get by index: O(n) — must traverse from head
- Add/remove at head or tail: O(1)
- Add/remove in middle (with iterator): O(1) for the add, but O(n) to find position
- Memory: more overhead (node pointers)

In practice, ArrayList is almost always better. I use it in 95% of cases. LinkedList only when I need frequent add/remove at the front (like a queue) and don't need random access.

In my projects, I always use ArrayList. For queue operations, I use ArrayDeque (better than LinkedList as a queue).`,
      code: `// ArrayList — best for random access and iteration
List<VehicleEvent> events = new ArrayList<>();
events.add(event);          // O(1) amortized
events.get(5);              // O(1) - random access
events.remove(0);           // O(n) - shifts elements

// LinkedList — best for frequent head/tail operations
Deque<Task> taskQueue = new ArrayDeque<>();  // Better than LinkedList for queues!
taskQueue.addFirst(urgentTask);   // O(1)
taskQueue.pollLast();             // O(1)

// Which to use summary:
// Need random access → ArrayList
// Need frequent inserts/removes at end → ArrayList
// Need frequent inserts/removes at front/middle → LinkedList
// Need queue/deque → ArrayDeque
// Need thread-safe list → Collections.synchronizedList() or CopyOnWriteArrayList

// CopyOnWriteArrayList for read-heavy concurrent access
CopyOnWriteArrayList<Listener> listeners = new CopyOnWriteArrayList<>();
// Add creates a new copy — safe for concurrent reads during iteration`,
      followUp: [
        { question: 'What is the initial capacity of ArrayList? When does it resize?', answer: `Default initial capacity is 10. When full, ArrayList creates a new array of capacity * 1.5 (grows by 50%) and copies all elements — O(n) operation. This is why add() is O(1) AMORTIZED — most adds are O(1), occasional resize is O(n), but amortized over many adds it's O(1). If you know the size upfront, pass it to the constructor: new ArrayList<>(expectedSize) to avoid resizing.` },
        { question: 'What is the difference between List.of() and new ArrayList()?', answer: `List.of() (Java 9+) returns an immutable list — no add(), remove(), set() — throws UnsupportedOperationException. Also does NOT allow null elements. new ArrayList() is mutable and allows null. Collections.unmodifiableList(list) returns an unmodifiable VIEW of a mutable list — modifications to the underlying list ARE reflected. List.copyOf() creates an immutable copy.` },
      ],
      tip: 'List.of() (Java 9+) returns an immutable list. new ArrayList() is mutable. Collections.unmodifiableList() returns a view that throws UnsupportedOperationException on modification.',
    },
  ],
}

export default collections
