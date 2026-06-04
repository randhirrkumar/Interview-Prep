const streamCoding = {
  title: 'Stream API Coding Problems',
  description: 'Hands-on Java 8 Stream coding challenges — filter, map, reduce, collect, Optional, and real interview problems.',
  tags: ['streams', 'Optional', 'groupingBy', 'flatMap', 'reduce'],
  questions: [
    {
      id: 1,
      question: 'Find odd and even numbers from a list using Stream',
      difficulty: 'beginner',
      asked: true,
      tags: ['streams', 'filter'],
      answer: `So this is a classic warm-up question. I use filter() to separate them.

The logic is simple — if n % 2 != 0, it's odd; if n % 2 == 0, it's even. I just apply the filter and collect into separate lists.

In my projects, we used this kind of pattern quite often to separate records into different buckets based on a condition — like separating processed vs unprocessed events in Kafka consumers.`,
      code: `List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8);

// Odd numbers
List<Integer> odd = numbers.stream()
    .filter(n -> n % 2 != 0)
    .collect(Collectors.toList());

// Even numbers
List<Integer> even = numbers.stream()
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toList());

System.out.println("Odd: " + odd);    // [1, 3, 5, 7]
System.out.println("Even: " + even);  // [2, 4, 6, 8]`,
      followUp: [
        { question: 'What is the difference between filter() and map() in streams?', answer: `filter() keeps or removes elements based on a predicate — same elements, fewer of them. Returns Stream<T> where T is the same type. map() transforms each element into something else — same count, different values. Returns Stream<R> where R can be any type. filter(n -> n > 5) keeps elements > 5. map(n -> n * 2) doubles every element.` },
        { question: 'Can you partition these in a single pass using partitioningBy?', answer: `Collectors.partitioningBy(n -> n % 2 == 0) does both odd and even in ONE stream pass and returns Map<Boolean, List<Integer>>: the true key has evens, false key has odds. More efficient than two separate streams.` },
        { question: 'What happens if the list is null? How do you handle it?', answer: `If the list reference itself is null, calling .stream() throws NullPointerException. Guard with: Optional.ofNullable(numbers).orElse(Collections.emptyList()).stream() or simply if (list != null) before streaming.` },
      ],
      tip: 'Mention partitioningBy collector as an alternative — it impresses interviewers: Collectors.partitioningBy(n -> n % 2 == 0)',
    },
    {
      id: 2,
      question: 'Find all numbers starting with 1 from a list',
      difficulty: 'beginner',
      tags: ['streams', 'filter', 'map'],
      answer: `Here I use a combination of map() and filter(). I first convert each integer to a String using String::valueOf, then filter by startsWith("1"), then convert back.

The key thing here is the method reference String::valueOf — it's cleaner than n -> String.valueOf(n). I prefer method references wherever possible because the code reads better.`,
      code: `List<Integer> numbers = Arrays.asList(11, 22, 3, 41, 5, 6, 17, 58);

List<Integer> startsWithOne = numbers.stream()
    .map(String::valueOf)           // convert to strings
    .filter(n -> n.startsWith("1")) // keep those starting with "1"
    .map(Integer::valueOf)
    .collect(Collectors.toList());

System.out.println(startsWithOne); // [11, 17]`,
      followUp: [
        { question: 'What is a method reference? Give 4 types of method references.', answer: `(1) Static method: ClassName::staticMethod — e.g., Integer::parseInt, String::valueOf. (2) Instance method on arbitrary object: ClassName::instanceMethod — e.g., String::toUpperCase (called on each element). (3) Instance method on a specific object: instance::method — e.g., System.out::println, myList::contains. (4) Constructor reference: ClassName::new — e.g., ArrayList::new, Employee::new.` },
        { question: 'What is the difference between Integer::valueOf and Integer::parseInt?', answer: `Integer.parseInt(String) returns int (primitive). Integer.valueOf(String) returns Integer (object, may use cache). In streams, use Integer::parseInt when you have a Stream<String> and want IntStream via mapToInt, or Integer::valueOf when you want Stream<Integer> via map.` },
      ],
      tip: 'Know the 4 method reference types: static (Integer::parseInt), instance on arbitrary object (String::toUpperCase), instance on specific object (myObj::method), constructor (ArrayList::new)',
    },
    {
      id: 3,
      question: 'Find the sum of a given list using Stream',
      difficulty: 'beginner',
      asked: true,
      tags: ['streams', 'reduce', 'mapToInt'],
      answer: `There are two good ways to do this. The first is using mapToInt() and calling .sum() — this is the most readable. The second is using reduce() with 0 as the identity element.

In interviews I always mention both. I prefer mapToInt().sum() in production code because it's cleaner, but reduce() is more flexible — you can use it for any aggregation, not just sum.

In my MetLife project, we used stream reduce operations to aggregate policy premium amounts from a list of policy objects.`,
      code: `List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8);

// Method 1: mapToInt + sum
int sum1 = numbers.stream()
    .mapToInt(Integer::intValue)
    .sum();
System.out.println(sum1); // 36

// Method 2: reduce
int sum2 = numbers.stream()
    .reduce(0, Integer::sum);
System.out.println(sum2); // 36

// Method 3: summaryStatistics
IntSummaryStatistics stats = numbers.stream()
    .mapToInt(Integer::intValue)
    .summaryStatistics();
System.out.println(stats.getSum()); // 36`,
      followUp: [
        { question: 'What is the difference between reduce() and collect()?', answer: `reduce() produces a SINGLE summary value by repeatedly applying a binary operator (sum, product, concat). It's for aggregations that result in one value. collect() produces a COLLECTION (List, Map, Set) by accumulating elements using a Collector. It's mutable reduction — more efficient for building containers because it uses a mutable accumulator rather than creating intermediate objects at each step.` },
        { question: 'What does mapToInt() return? Why is it different from map()?', answer: `mapToInt() returns IntStream — a specialized stream of primitive int values. No boxing/unboxing overhead compared to Stream<Integer>. IntStream has convenient methods: sum(), average(), min(), max(), summaryStatistics(). When you need the boxed version, call .boxed() to get back Stream<Integer>.` },
      ],
      tip: 'mapToInt() returns an IntStream (primitive stream). This avoids boxing/unboxing overhead compared to Stream<Integer>. Mention this performance aspect.',
    },
    {
      id: 4,
      question: 'Find duplicates in a given list of integers',
      difficulty: 'intermediate',
      asked: true,
      tags: ['streams', 'filter', 'HashSet'],
      answer: `The trick here is using a HashSet. I create an empty HashSet, and in the filter I try to add each element. Set.add() returns false if the element is already present — so if it returns false, it's a duplicate.

One thing I always clarify in interviews: this approach modifies state inside a stream operation (the HashSet). Technically it's a stateful predicate, which isn't ideal for parallel streams. For single-threaded use it's completely fine.

If you want clean parallel-safe code, use groupingBy + counting approach instead.`,
      code: `List<Integer> numbers = Arrays.asList(1, 2, 3, 8, 1, 6, 7, 8, 7);

// Using HashSet trick
Set<Integer> seen = new HashSet<>();
List<Integer> duplicates = numbers.stream()
    .filter(n -> !seen.add(n))  // add() returns false if already present
    .distinct()                  // avoid listing same duplicate twice
    .collect(Collectors.toList());

System.out.println(duplicates); // [1, 8, 7]

// Alternative: groupingBy approach (parallel-safe)
Map<Integer, Long> freq = numbers.stream()
    .collect(Collectors.groupingBy(n -> n, Collectors.counting()));

List<Integer> duplicates2 = freq.entrySet().stream()
    .filter(e -> e.getValue() > 1)
    .map(Map.Entry::getKey)
    .collect(Collectors.toList());`,
      followUp: [
        { question: 'Why is the HashSet approach problematic in parallel streams?', answer: `filter(n -> !seen.add(n)) — the "seen" HashSet is shared state being mutated inside the predicate. In parallel streams, multiple threads call add() concurrently → race condition → incorrect results or ConcurrentModificationException. Fix: use ConcurrentHashMap.newKeySet() instead of HashSet, or just avoid parallel streams for stateful predicates.` },
        { question: 'What is a stateful predicate? Why should you avoid it?', answer: `A predicate whose result depends on state that changes during stream processing — like tracking seen elements. Stateful predicates in intermediate operations are problematic in parallel streams. Java's stream specification says: stream operations should not modify shared state (should be non-interfering and stateless). Stateful predicates violate this.` },
      ],
      tip: 'The HashSet approach question is a classic trap. Always mention the parallel stream limitation — it shows depth of knowledge.',
    },
    {
      id: 5,
      question: 'Find the first element in a given list or array',
      difficulty: 'beginner',
      tags: ['streams', 'findFirst', 'Optional'],
      answer: `I use findFirst() which returns an Optional. I then call ifPresent() to safely print it, which handles the case where the list might be empty.

The key interview point here is understanding Optional. findFirst() returns Optional<T>, not T directly. If the stream is empty, you'd get an empty Optional instead of a NullPointerException.

Also worth mentioning: findFirst() vs findAny(). In parallel streams, findAny() can be faster since it doesn't need to guarantee order, while findFirst() guarantees it returns the first element in encounter order.`,
      code: `List<Integer> numbers = Arrays.asList(11, 2, 3, 4, 51, 6, 7, 8);

numbers.stream()
    .findFirst()
    .ifPresent(System.out::println); // 11

// From array
int[] arr = {11, 2, 3, 4, 51, 6, 7, 8};
Arrays.stream(arr)
    .boxed()
    .findFirst()
    .ifPresent(System.out::println); // 11

// Safe get with orElse
Integer first = numbers.stream()
    .findFirst()
    .orElse(-1);`,
      followUp: [
        { question: 'What is the difference between findFirst() and findAny()?', answer: `In sequential streams, both behave identically — return the first element. In parallel streams, findFirst() guarantees the first element in the original encounter order (requires coordination). findAny() returns whichever element the parallel stream finds first (faster, non-deterministic). Use findAny() in parallel streams when order doesn't matter.` },
        { question: 'What are the different ways to unwrap an Optional?', answer: `get() — throws NoSuchElementException if empty (avoid). orElse(value) — returns value if empty (always evaluated, even if present). orElseGet(() -> compute()) — lazy evaluation (only computed if empty — prefer for expensive defaults). orElseThrow() — throws NoSuchElementException. orElseThrow(CustomException::new) — throws specific exception. ifPresent(consumer) — performs action if value exists. map(f) — transforms the value if present.` },
      ],
      tip: 'Mention Optional methods: get(), orElse(), orElseGet(), orElseThrow(), ifPresent(), map(), filter(), isPresent()',
    },
    {
      id: 6,
      question: 'Find total number of elements present in the list',
      difficulty: 'beginner',
      tags: ['streams', 'count', 'reduce'],
      answer: `The simplest way is stream().count() which returns a long. But I can also demonstrate reduce() — using 0 as identity and (a, b) -> a + 1 to just count by incrementing.

The reduce version is a fun trick to show in interviews but in real code I'd always use count().`,
      code: `List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8);

// Using count()
long count = numbers.stream().count();
System.out.println(count); // 8

// Using reduce (creative alternative)
int countByReduce = numbers.stream()
    .reduce(0, (a, b) -> a + 1);
System.out.println(countByReduce); // 8

// Note: count() returns long, not int`,
      followUp: [
        { question: 'What is the difference between count() and size()? When would you use stream count vs list.size()?', answer: `list.size() is O(1) — ArrayList stores the size as a field, instant access. stream().count() is a terminal operation — it iterates through all remaining elements after transformations, so it's O(n) after a filter or map pipeline. Use list.size() when you just need the size of the collection. Use stream().count() when you need to count after filtering: list.stream().filter(n -> n > 0).count().` },
      ],
      tip: 'count() is a terminal operation that returns long. Using it on a large stream after multiple transformations can be expensive — mention this.',
    },
    {
      id: 7,
      question: 'Find the maximum and minimum value in a list',
      difficulty: 'beginner',
      asked: true,
      tags: ['streams', 'mapToInt', 'max', 'min'],
      answer: `I use mapToInt() to get an IntStream, then call .max() and .min() which return OptionalInt. I call getAsInt() to unwrap.

In production code I'd prefer using Comparator.naturalOrder() with max(Comparator) and min(Comparator) to stay on Stream<Integer> and keep the Optional<Integer> — easier to chain with other operations.`,
      code: `List<Integer> numbers = Arrays.asList(31, 2, 23, 4, 5, 64, 7, 8);

// Using mapToInt
int max = numbers.stream()
    .mapToInt(Integer::intValue)
    .max()
    .getAsInt();

int min = numbers.stream()
    .mapToInt(Integer::intValue)
    .min()
    .getAsInt();

System.out.println("Max: " + max); // 64
System.out.println("Min: " + min); // 2

// Safer: using Comparator
Optional<Integer> safeMax = numbers.stream()
    .max(Comparator.naturalOrder());

safeMax.ifPresent(m -> System.out.println("Max: " + m));`,
      followUp: [
        { question: 'What happens if you call getAsInt() on an empty OptionalInt?', answer: `Throws NoSuchElementException. Always guard with: optionalInt.orElse(-1) or optionalInt.orElseThrow(() -> new RuntimeException("No elements")). The safe pattern in production is always orElse() or orElseThrow().` },
        { question: 'How would you find the max object from a list of employees by salary?', answer: `employees.stream().max(Comparator.comparingDouble(Employee::getSalary)) returns Optional<Employee>. Then call .orElseThrow() or .orElse(null).` },
      ],
      tip: 'Always mention the safer orElseThrow() or orElse(-1) instead of getAsInt() to handle empty streams safely.',
    },
    {
      id: 8,
      question: 'Find the second highest and second lowest value in a list',
      difficulty: 'intermediate',
      asked: true,
      tags: ['streams', 'sorted', 'skip', 'distinct'],
      answer: `This is a very common interview question. The approach is:
1. Use distinct() to remove duplicates (important!)
2. Sort in reverse order (for second highest) or natural order (for second lowest)
3. Skip the first element
4. Use findFirst() to get the second one

The distinct() step is important — without it, if you have [64, 64, 5, 2], the "second highest" would still be 64, which is wrong.`,
      code: `List<Integer> numbers = Arrays.asList(31, 2, 23, 4, 5, 64, 7, 8);

// Second highest
Integer secondHighest = numbers.stream()
    .distinct()
    .sorted(Comparator.reverseOrder())  // descending: [64, 31, 23, 8, 7, 5, 4, 2]
    .skip(1)                            // skip 64
    .findFirst()
    .orElse(null);

System.out.println("2nd Highest: " + secondHighest); // 31

// Second lowest
Integer secondLowest = numbers.stream()
    .distinct()
    .sorted()
    .skip(1)
    .findFirst()
    .orElse(null);

System.out.println("2nd Lowest: " + secondLowest); // 4

// Generic: kth element
int k = 3;
Integer kthHighest = numbers.stream()
    .distinct()
    .sorted(Comparator.reverseOrder())
    .skip(k - 1)
    .findFirst()
    .orElse(null);`,
      followUp: [
        { question: 'What does skip() return? Is it a lazy operation?', answer: `skip(n) returns Stream<T> — it skips the first n elements in encounter order. It is a STATEFUL intermediate operation — for ordered streams, it must track how many elements have been skipped. Still lazy in that it doesn't consume all elements upfront.` },
        { question: 'How would you find the Nth highest salary from an Employee list?', answer: `employees.stream().map(Employee::getSalary).distinct().sorted(Comparator.reverseOrder()).skip(N - 1).findFirst().orElse(null). The distinct() is critical because salaries can repeat across employees.` },
      ],
      tip: 'This pattern — distinct().sorted().skip(n-1).findFirst() — is the go-to for Nth largest/smallest. Memorize it.',
    },
    {
      id: 9,
      question: 'Find the kth element from the list',
      difficulty: 'intermediate',
      tags: ['streams', 'skip', 'findFirst'],
      answer: `Skip k-1 elements and take the first. Simple and clean. For kth from the end, I'd combine with reversed sorting or use list.size() - k.`,
      code: `List<Integer> numbers = Arrays.asList(11, 22, 33, 44, 55, 66, 77, 88);
int k = 5;

// kth element (1-indexed)
Integer kthElement = numbers.stream()
    .skip(k - 1)
    .findFirst()
    .orElse(null);

System.out.println("5th element: " + kthElement); // 55

// kth from the end
Integer kthFromEnd = numbers.stream()
    .skip(numbers.size() - k)
    .findFirst()
    .orElse(null);

System.out.println("5th from end: " + kthFromEnd); // 44`,
      followUp: [
        { question: 'How would you handle k being out of range?', answer: `skip(k-1).findFirst() returns an empty Optional when k > list.size(). With .orElse(null) you get null safely. Always validate k before calling: if (k < 1 || k > list.size()) throw new IllegalArgumentException("k is out of bounds").` },
      ],
      tip: 'skip() is a stateful intermediate operation. It cannot be parallelized efficiently for ordered streams.',
    },
    {
      id: 10,
      question: 'Find the first non-repeating character from a string',
      difficulty: 'intermediate',
      asked: true,
      tags: ['streams', 'chars', 'filter'],
      answer: `I convert the string to a char stream using s.chars(), then mapToObj() to get Character objects. Then I filter using indexOf == lastIndexOf — if both positions are the same, the character appears only once.

This is O(n²) for each character check, but for interview purposes it's perfectly acceptable. In a production optimization scenario, I'd use LinkedHashMap to track insertion order and count.

I faced a similar problem in my project where I needed to find the first non-duplicate event ID in a Kafka message stream.`,
      code: `String s = "java is a beautiful language";

// Using indexOf == lastIndexOf
Character firstNonRepeating = s.chars()
    .mapToObj(c -> (char) c)
    .filter(c -> s.indexOf(c) == s.lastIndexOf(c))
    .findFirst()
    .orElse(null);

System.out.println(firstNonRepeating); // 'j'

// Production-grade: LinkedHashMap approach — O(n)
Map<Character, Long> freq = s.chars()
    .mapToObj(c -> (char) c)
    .collect(Collectors.groupingBy(
        c -> c,
        LinkedHashMap::new,  // maintains insertion order!
        Collectors.counting()
    ));

Character first = freq.entrySet().stream()
    .filter(e -> e.getValue() == 1)
    .map(Map.Entry::getKey)
    .findFirst()
    .orElse(null);`,
      followUp: [
        { question: 'What does s.chars() return? What is IntStream?', answer: `s.chars() returns IntStream — a stream of int values representing Unicode code points of each character. Not Stream<Character>. To get Character objects, you must call .mapToObj(c -> (char) c).` },
        { question: 'Why LinkedHashMap instead of HashMap for the second approach?', answer: `HashMap does NOT preserve insertion order — characters come out in unpredictable order. LinkedHashMap maintains insertion order — so iterating to find value == 1 gives the FIRST unique character in the original string.` },
        { question: 'What is the time complexity of both approaches?', answer: `indexOf approach: O(n²) — for each of the n characters, indexOf() and lastIndexOf() each scan the whole string O(n). LinkedHashMap approach: O(n) — one pass to build the frequency map, one pass to find the first entry with count 1.` },
      ],
      tip: 'Always mention that the LinkedHashMap approach is O(n) vs O(n²) for the indexOf approach. This shows you think about performance.',
    },
    {
      id: 11,
      question: 'Find the first repeating character from a string',
      difficulty: 'intermediate',
      tags: ['streams', 'chars', 'filter'],
      answer: `Same as the non-repeating, but I flip the condition — filter where indexOf != lastIndexOf. That means the character appears more than once. findFirst() gives me the first one in the string that repeats.`,
      code: `String s = "java is a beautiful language";

Character firstRepeating = s.chars()
    .mapToObj(c -> (char) c)
    .filter(c -> s.indexOf(c) != s.lastIndexOf(c))
    .findFirst()
    .orElse(null);

System.out.println(firstRepeating); // 'a'`,
      followUp: [
        { question: 'What if you need to find the first character that repeats consecutively?', answer: `Use IntStream with range-based indexing: IntStream.range(1, s.length()).filter(i -> s.charAt(i) == s.charAt(i-1)).mapToObj(i -> s.charAt(i)).findFirst(). This checks each position against the previous character.` },
      ],
      tip: 'Distinguish between "first character that repeats somewhere" vs "first character that repeats consecutively". Clarify with the interviewer.',
    },
    {
      id: 12,
      question: 'Sort elements in a list using Stream (ascending and descending)',
      difficulty: 'beginner',
      asked: true,
      tags: ['streams', 'sorted', 'Comparator'],
      answer: `sorted() without arguments uses natural ordering (ascending). For descending, I pass Comparator.reverseOrder().

For objects, I use Comparator.comparing(Employee::getSalary) and then .reversed() for descending. That's what I used in my projects to sort insurance policies by premium amount or sort vehicle events by timestamp.`,
      code: `List<Integer> numbers = Arrays.asList(31, 2, 23, 4, 5, 64, 7, 8);

// Ascending
List<Integer> asc = numbers.stream()
    .sorted()
    .collect(Collectors.toList());
System.out.println("ASC: " + asc); // [2, 4, 5, 7, 8, 23, 31, 64]

// Descending
List<Integer> desc = numbers.stream()
    .sorted(Comparator.reverseOrder())
    .collect(Collectors.toList());
System.out.println("DESC: " + desc); // [64, 31, 23, 8, 7, 5, 4, 2]

// Sort objects by salary desc, then name asc
List<Employee> complex = employees.stream()
    .sorted(Comparator.comparing(Employee::getSalary).reversed()
        .thenComparing(Employee::getName))
    .collect(Collectors.toList());`,
      followUp: [
        { question: 'Is sorted() a stateful or stateless intermediate operation?', answer: `sorted() is a STATEFUL intermediate operation — it must see ALL elements before it can output the first sorted element. This makes it expensive in lazy evaluation (can't pipeline early) and suboptimal for large streams.` },
        { question: 'What is the difference between Comparator.comparing() and Comparable?', answer: `Comparable is implemented BY the class itself (compareTo method) — defines the natural ordering. Only one natural order per class. Comparator is EXTERNAL — defined outside the class for specific use cases. Multiple Comparators can exist.` },
      ],
      tip: 'sorted() is a stateful intermediate operation — it needs to see all elements before outputting any. This makes it expensive on large streams.',
    },
    {
      id: 13,
      question: 'Find the frequency/count of each character from a string',
      difficulty: 'intermediate',
      asked: true,
      tags: ['streams', 'groupingBy', 'counting'],
      answer: `I use Collectors.groupingBy() with Collectors.counting() as the downstream collector. This is one of the most useful stream patterns I use regularly.

In my projects, I used this exact pattern to group Kafka events by event type and count them for monitoring dashboards.`,
      code: `String s = "interview";

// Using chars
Map<Character, Long> freqByChar = s.chars()
    .mapToObj(c -> (char) c)
    .collect(Collectors.groupingBy(
        Function.identity(),
        Collectors.counting()
    ));
System.out.println(freqByChar);

// Sort by frequency descending
s.chars()
    .mapToObj(c -> (char) c)
    .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()))
    .entrySet().stream()
    .sorted(Map.Entry.<Character, Long>comparingByValue().reversed())
    .forEach(e -> System.out.println(e.getKey() + " -> " + e.getValue()));`,
      followUp: [
        { question: 'What is Function.identity()? Why use it instead of a lambda?', answer: `Returns a function that always returns its input argument — equivalent to x -> x. Cleaner than a lambda when you need a Function that doesn't transform the value.` },
        { question: 'What is the difference between groupingBy and partitioningBy?', answer: `partitioningBy(predicate) creates Map<Boolean, List<T>> — exactly TWO buckets (true/false). groupingBy(classifier) creates Map<K, List<T>> — any number of buckets.` },
      ],
      tip: 'Know Collectors well: groupingBy, partitioningBy, counting, joining, toMap, toList, summarizingInt. These are heavily tested.',
    },
    {
      id: 14,
      question: 'Sort a string using Stream',
      difficulty: 'beginner',
      tags: ['streams', 'sorted', 'joining', 'chars'],
      answer: `Two approaches: use s.chars().mapToObj() to get characters, sort them, and join back. Or split by "" and sort the array of single-character strings.`,
      code: `String s = "java";

// Using chars
String sorted1 = s.chars()
    .mapToObj(c -> String.valueOf((char) c))
    .sorted()
    .collect(Collectors.joining());
System.out.println(sorted1); // "aajv"

// Sort descending
String sortedDesc = s.chars()
    .mapToObj(c -> String.valueOf((char) c))
    .sorted(Comparator.reverseOrder())
    .collect(Collectors.joining());
System.out.println(sortedDesc); // "vjaa"`,
      followUp: [
        { question: 'What does Collectors.joining() do? What are its three overloads?', answer: `(1) joining() — concatenates with no separator. (2) joining(delimiter) — joins with separator: joining(", ") gives "a, b, c". (3) joining(delimiter, prefix, suffix) — wraps with prefix/suffix: joining(", ", "[", "]") gives "[a, b, c]".` },
      ],
      tip: 'Collectors.joining(delimiter, prefix, suffix) — know all three variants. E.g., joining(", ", "[", "]") gives "[a, b, c]"',
    },
    {
      id: 15,
      question: 'Find all numbers ending with 1 from a list',
      difficulty: 'beginner',
      tags: ['streams', 'filter', 'modulo'],
      answer: `Either check n % 10 == 1 (arithmetic approach) or convert to string and use endsWith("1"). I prefer the arithmetic one since it avoids string conversion overhead.`,
      code: `List<Integer> numbers = Arrays.asList(31, 2, 23, 4, 5, 61, 71, 8);

// Arithmetic approach
List<Integer> endsWithOne = numbers.stream()
    .filter(n -> Math.abs(n) % 10 == 1)  // Math.abs handles negatives
    .collect(Collectors.toList());
System.out.println(endsWithOne); // [31, 61, 71]

// String approach
List<Integer> endsWithOne2 = numbers.stream()
    .filter(n -> String.valueOf(n).endsWith("1"))
    .collect(Collectors.toList());`,
      followUp: [
        { question: 'How would you handle negative numbers in the arithmetic approach?', answer: `For negative numbers, -31 % 10 in Java gives -1, not 1. Use Math.abs(n) % 10 == 1 to handle negatives correctly. The String approach String.valueOf(n).endsWith("1") handles negatives naturally.` },
      ],
    },
    {
      id: 16,
      question: 'Merge two lists of integers using Stream',
      difficulty: 'beginner',
      asked: true,
      tags: ['streams', 'concat', 'flatMap'],
      answer: `Two ways: Stream.concat() or Stream.of() with flatMap(). In my projects I frequently use Stream.concat() when combining results from two different data sources — like merging two API response lists.

flatMap with List::stream is more flexible when you have a list of lists.`,
      code: `List<Integer> list1 = Arrays.asList(3, 2, 7);
List<Integer> list2 = Arrays.asList(4, 5, 8);

// Method 1: Stream.concat
List<Integer> merged1 = Stream.concat(list1.stream(), list2.stream())
    .collect(Collectors.toList());
System.out.println(merged1); // [3, 2, 7, 4, 5, 8]

// Method 2: flatMap
List<Integer> merged2 = Stream.of(list1, list2)
    .flatMap(List::stream)
    .collect(Collectors.toList());

// Merge, sort, and remove duplicates
List<Integer> mergedDistinct = Stream.concat(list1.stream(), list2.stream())
    .distinct()
    .sorted()
    .collect(Collectors.toList());`,
      followUp: [
        { question: 'What is the difference between map() and flatMap()?', answer: `map() transforms each element into exactly one output — 1-to-1. flatMap() transforms each element into a Stream, then flattens all those Streams into one — 1-to-many. Use flatMap when transformation produces zero or more values (nested collections, splitting strings).` },
        { question: 'When would you use flatMap in a real project scenario?', answer: `Fetching orders from a database where each Order has a List<OrderItem>. To get all items across all orders: orders.stream().flatMap(order -> order.getItems().stream()). In my MetLife project, policies had multiple coverages — I used flatMap to get all coverages across all policies for batch validation.` },
      ],
      tip: 'flatMap is used to "flatten" nested structures. E.g., List<List<String>> -> Stream<String>.',
    },
    {
      id: 17,
      question: 'Convert list of Strings to uppercase using Stream',
      difficulty: 'beginner',
      asked: true,
      tags: ['streams', 'map', 'method reference'],
      answer: `Classic use of map() with a method reference. String::toUpperCase is a method reference to the instance method toUpperCase() on the String class. I always prefer method references over lambdas when the lambda just calls one method — it's cleaner.

In my MetLife project I used similar mapping to normalize incoming policy codes to uppercase before database lookups.`,
      code: `List<String> list = Arrays.asList("apple", "banana", "cherry", "date");

// Using method reference (preferred)
List<String> upper = list.stream()
    .map(String::toUpperCase)
    .collect(Collectors.toList());
System.out.println(upper); // [APPLE, BANANA, CHERRY, DATE]

// Also lowercase
List<String> lower = list.stream()
    .map(String::toLowerCase)
    .collect(Collectors.toList());`,
      followUp: [
        { question: 'Can you chain multiple map() operations?', answer: `Yes — each map() returns a new Stream and the chain is evaluated lazily. For example: stream.map(String::trim).map(String::toUpperCase).map(String::length). Because streams are lazy, all three transformations are applied per element in a single pipeline traversal — not three separate passes through the data.` },
      ],
    },
    {
      id: 18,
      question: 'Perform cube on list elements and filter numbers greater than 50',
      difficulty: 'beginner',
      tags: ['streams', 'map', 'filter'],
      answer: `Chain map() to cube each number, then filter() to keep only those greater than 50. This shows the power of stream pipelines — transforming and filtering in a clean readable chain.`,
      code: `List<Integer> numbers = Arrays.asList(3, 2, 5, 9, 1, 4);

List<Integer> result = numbers.stream()
    .map(n -> n * n * n)   // cube: [27, 8, 125, 729, 1, 64]
    .filter(n -> n > 50)   // filter > 50: [125, 729, 64]
    .collect(Collectors.toList());

System.out.println(result); // [125, 729, 64]`,
      followUp: [
        { question: 'What is the order of intermediate operations in a stream pipeline?', answer: `Order matters for performance but not correctness. Rule: always place filter() BEFORE map() when possible — filter reduces the number of elements, so subsequent map() runs on fewer elements. With lazy evaluation, operations are fused per element — cube(1) → 1 > 50? no, cube(2) → 8 > 50? no — not cube ALL elements first then filter.` },
      ],
    },
    {
      id: 19,
      question: 'Check if list is empty using Optional and iterate through it',
      difficulty: 'intermediate',
      tags: ['Optional', 'streams', 'null handling'],
      answer: `Optional.ofNullable() handles the case where the list itself could be null. Then I use filter() to check it's not empty, and ifPresent() to iterate.

This is a good pattern to avoid NullPointerException. In my Spring Boot REST APIs, I use Optional extensively when returning data from repositories — the JPA repository methods return Optional<Entity>.`,
      code: `List<Integer> list = Arrays.asList(3, 2, 5, 9, 1, 4);

// Using Optional
Optional.ofNullable(list)
    .filter(l -> !l.isEmpty())
    .ifPresent(l -> l.forEach(System.out::println));

// Practical: returning Optional from service
public Optional<User> findUserById(Long id) {
    return userRepository.findById(id);  // JPA returns Optional
}

// Consumer code
findUserById(123L)
    .map(User::getName)
    .orElse("Unknown");

// Java 9+: ifPresentOrElse
Optional.ofNullable(list)
    .filter(l -> !l.isEmpty())
    .ifPresentOrElse(
        l -> l.forEach(System.out::println),
        () -> System.out.println("List is null or empty")
    );`,
      followUp: [
        { question: 'What is the difference between Optional.of() and Optional.ofNullable()?', answer: `Optional.of(value) throws NullPointerException immediately if value is null. Use when you are certain the value is not null. Optional.ofNullable(value) safely wraps null as Optional.empty(). Use when the value might legitimately be null.` },
        { question: 'When should you NOT use Optional?', answer: `(1) Method parameters — use overloading instead. (2) Fields in classes — Optional doesn't serialize well. (3) Collections — empty collection already communicates absence. Optional is designed specifically for method return types.` },
      ],
      tip: 'Do NOT use Optional as a method parameter or in collections. It\'s designed for return values only.',
    },
    {
      id: 20,
      question: 'Find min, max, average, sum and count in a list',
      difficulty: 'beginner',
      asked: true,
      tags: ['streams', 'IntSummaryStatistics', 'mapToInt'],
      answer: `IntSummaryStatistics is the most efficient way — a single pass through the stream to get all stats.

In my EPLMS project, I used this to compute vehicle event statistics — minimum, maximum and average event processing times across a day's batch of events.`,
      code: `List<Integer> numbers = Arrays.asList(3, 2, 5, 9, 1, 4);

// BEST: all in one pass using summaryStatistics
IntSummaryStatistics stats = numbers.stream()
    .mapToInt(Integer::intValue)
    .summaryStatistics();

System.out.println("Min: " + stats.getMin());       // 1
System.out.println("Max: " + stats.getMax());       // 9
System.out.println("Avg: " + stats.getAverage());   // 4.0
System.out.println("Sum: " + stats.getSum());       // 24
System.out.println("Count: " + stats.getCount());   // 6`,
      followUp: [
        { question: 'Why is summaryStatistics() more efficient than calling min/max/avg separately?', answer: `A single terminal operation that computes count, sum, min, max, and average in ONE pass through the stream. Calling min(), max(), average() separately requires creating and traversing the stream THREE times — once per terminal operation. Streams cannot be reused.` },
      ],
      tip: 'summaryStatistics() does a single pass. Calling min(), max(), average() separately means 3 passes through the stream.',
    },
    {
      id: 21,
      question: 'Find common elements between two lists',
      difficulty: 'beginner',
      asked: true,
      tags: ['streams', 'filter', 'contains'],
      answer: `I stream the first list and use list2::contains as the filter predicate. This is O(n*m) which is fine for small lists. For large lists, converting list2 to a HashSet first makes it O(n).

I often use this pattern in my projects to find matching policy IDs between two data sources during a reconciliation process.`,
      code: `List<Integer> list1 = Arrays.asList(3, 2, 7, 8, 1);
List<Integer> list2 = Arrays.asList(1, 4, 3, 8, 5);

// Optimized: convert list2 to HashSet first (O(n+m))
Set<Integer> set2 = new HashSet<>(list2);
List<Integer> common = list1.stream()
    .filter(set2::contains)
    .collect(Collectors.toList());
System.out.println(common); // [3, 8, 1]

// Elements only in list1 (set difference)
List<Integer> onlyInList1 = list1.stream()
    .filter(n -> !set2.contains(n))
    .collect(Collectors.toList());`,
      followUp: [
        { question: 'What is the time complexity of list2::contains vs set2::contains?', answer: `list2::contains (ArrayList.contains) is O(m) — scans linearly. With n elements in list1 and m in list2, total complexity is O(n × m). set2::contains (HashSet.contains) is O(1) amortized — hash lookup. Total complexity: O(n + m).` },
      ],
      tip: 'Always mention converting to HashSet for large lists. Shows performance awareness.',
    },
    {
      id: 22,
      question: 'Convert first character of each word to uppercase in a sentence',
      difficulty: 'intermediate',
      asked: true,
      tags: ['streams', 'map', 'substring', 'joining'],
      answer: `Split the sentence by spaces, then map each word to capitalize its first character using substring(0,1).toUpperCase() + substring(1), then join with space.`,
      code: `String s = "convert first character of each word into uppercase";

String result = Arrays.stream(s.split(" "))
    .map(word -> word.isEmpty() ? word :
        word.substring(0, 1).toUpperCase() + word.substring(1))
    .collect(Collectors.joining(" "));

System.out.println(result);
// "Convert First Character Of Each Word Into Uppercase"`,
      followUp: [
        { question: 'How would you handle an empty string or null input?', answer: `For empty string: word.isEmpty() ? word : capitalize(word). For null input: wrap in Objects.requireNonNullElse(input, "") or add explicit null check at the method entry.` },
      ],
    },
    {
      id: 23,
      question: 'Count duplicate Strings from a list',
      difficulty: 'intermediate',
      asked: true,
      tags: ['streams', 'groupingBy', 'counting', 'filter'],
      answer: `I use groupingBy with counting() to get a frequency map, then filter entries where count > 1.

In my projects I used this to detect duplicate policy numbers in incoming batch data — a very real data quality check.`,
      code: `List<String> list = Arrays.asList("Apple", "Orange", "Apple", "Mango", "Mango", "Banana");

// Get all duplicates with count
Map<String, Long> duplicatesWithCount = list.stream()
    .collect(Collectors.groupingBy(s -> s, Collectors.counting()))
    .entrySet().stream()
    .filter(e -> e.getValue() > 1)
    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

System.out.println(duplicatesWithCount); // {Apple=2, Mango=2}

// Just the duplicate values
List<String> duplicateList = list.stream()
    .collect(Collectors.groupingBy(s -> s, Collectors.counting()))
    .entrySet().stream()
    .filter(e -> e.getValue() > 1)
    .map(Map.Entry::getKey)
    .collect(Collectors.toList());`,
      followUp: [
        { question: 'What is Collectors.toMap()? How do you handle duplicate keys in toMap()?', answer: `toMap(keyMapper, valueMapper) throws IllegalStateException if two elements produce the same key. Always use the 3-argument version for safety: toMap(keyMapper, valueMapper, (v1, v2) -> v1) — keeps first on conflict.` },
      ],
      tip: 'Collectors.toMap() throws IllegalStateException on duplicate keys. Always provide a merge function for safety: toMap(k, v, (v1,v2) -> v1)',
    },
    {
      id: 24,
      question: 'Find the length of each String and print it alongside',
      difficulty: 'beginner',
      tags: ['streams', 'map', 'forEach'],
      answer: `Map each string to "string = length" format and forEach to print.`,
      code: `List<String> list = Arrays.asList("Apple", "Orange", "Mango", "Banana");

list.stream()
    .map(s -> s + " = " + s.length())
    .forEach(System.out::println);
// Apple = 5
// Orange = 6

// As a Map
Map<String, Integer> lengthMap = list.stream()
    .collect(Collectors.toMap(s -> s, String::length));`,
      followUp: [
        { question: 'How would you sort the list by string length?', answer: `list.stream().sorted(Comparator.comparingInt(String::length)).collect(Collectors.toList()). For descending: sorted(Comparator.comparingInt(String::length).reversed()). Tie-break: thenComparing(Comparator.naturalOrder()).` },
      ],
    },
    {
      id: 25,
      question: 'Sum of even and odd numbers from a list',
      difficulty: 'beginner',
      asked: true,
      tags: ['streams', 'filter', 'mapToInt', 'sum'],
      answer: `Filter by even/odd condition, then mapToInt().sum(). I can also use a single stream with partitioningBy and then sum each partition.`,
      code: `List<Integer> list = Arrays.asList(3, 2, 7, 1, 8, 4, 6);

int evenSum = list.stream()
    .filter(n -> n % 2 == 0)
    .mapToInt(Integer::intValue)
    .sum();
System.out.println("Even sum: " + evenSum); // 20

int oddSum = list.stream()
    .filter(n -> n % 2 != 0)
    .mapToInt(Integer::intValue)
    .sum();
System.out.println("Odd sum: " + oddSum); // 11

// Alternative: partitioningBy
Map<Boolean, List<Integer>> partitioned = list.stream()
    .collect(Collectors.partitioningBy(n -> n % 2 == 0));

int evenSumAlt = partitioned.get(true).stream().mapToInt(Integer::intValue).sum();
int oddSumAlt = partitioned.get(false).stream().mapToInt(Integer::intValue).sum();`,
      followUp: [
        { question: 'What does partitioningBy return? How is it different from groupingBy?', answer: `partitioningBy(Predicate) always returns Map<Boolean, List<T>> with exactly two keys: true and false — both keys present even if one bucket is empty. groupingBy(Function) returns Map<K, List<T>> with as many keys as distinct classifier values.` },
      ],
      tip: 'partitioningBy always creates a Map<Boolean, List<T>> — only two buckets. groupingBy creates Map<K, List<T>> for any key.',
    },
    {
      id: 26,
      question: 'Reverse each word in a given sentence using Stream',
      difficulty: 'intermediate',
      tags: ['streams', 'map', 'StringBuilder', 'joining'],
      answer: `Split by space, map each word through StringBuilder(word).reverse(), then join back. StringBuilder.reverse() is the cleanest way to reverse a string in Java.`,
      code: `String str = "We are learning Java";

String reversed = Arrays.stream(str.split(" "))
    .map(word -> new StringBuilder(word).reverse().toString())
    .collect(Collectors.joining(" "));

System.out.println(reversed); // "eW era gninrael avaJ"

// Reverse word order
String wordOrderReversed = Arrays.stream(str.split(" "))
    .reduce((a, b) -> b + " " + a)
    .orElse("");
System.out.println(wordOrderReversed); // "Java learning are We"`,
    },
    {
      id: 27,
      question: 'Generate Fibonacci series using Stream',
      difficulty: 'advanced',
      asked: true,
      tags: ['streams', 'iterate', 'limit'],
      answer: `Stream.iterate() is perfect for this. I seed it with int[] {0, 1} representing the two current Fibonacci numbers. Each iteration generates the next pair. Then I limit to the required count and map to get the first element of each pair.`,
      code: `// Stream.iterate approach (Java 8+)
Stream.iterate(
    new int[]{0, 1},
    fib -> new int[]{fib[1], fib[0] + fib[1]}  // next pair
)
.limit(10)
.map(fib -> fib[0])
.forEach(System.out::println);
// 0 1 1 2 3 5 8 13 21 34

// Java 9+: Stream.iterate with predicate (stop condition)
Stream.iterate(
    new int[]{0, 1},
    fib -> fib[0] < 1000,  // stop when value >= 1000
    fib -> new int[]{fib[1], fib[0] + fib[1]}
)
.map(fib -> fib[0])
.forEach(System.out::println);`,
      followUp: [
        { question: 'What is the difference between Stream.iterate() in Java 8 vs Java 9?', answer: `Java 8: Stream.iterate(seed, f) — INFINITE stream, must use limit(). Java 9: Stream.iterate(seed, hasNextPredicate, f) — 3-argument version with a stop condition, works like a for-loop. The Java 9 version is safer — no risk of forgetting limit().` },
        { question: 'What is Stream.generate()? How is it different from Stream.iterate()?', answer: `Stream.generate(Supplier) creates an infinite stream by calling the Supplier repeatedly. No concept of "previous value" — each element is independent. Good for: random numbers (Stream.generate(Math::random)). Stream.iterate creates each element based on the previous — sequential dependency. Good for: sequences (Fibonacci, counters).` },
      ],
      tip: 'Java 9 added 3-arg Stream.iterate(seed, hasNext, next) that works like a for-loop. Java 8 iterate() is infinite — MUST use limit().',
    },
    {
      id: 28,
      question: 'What are the differences between map() and flatMap()?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['streams', 'map', 'flatMap'],
      answer: `map() is 1-to-1: each element produces exactly one output element. flatMap() is 1-to-many: each element produces a stream, and all those streams are flattened into one.

Think of it like: map transforms, flatMap transforms AND flattens.

Real example from my project: I had a list of orders, each with a list of items. To get a flat list of all items, I use flatMap.`,
      code: `// map: 1-to-1 transformation
List<String> words = Arrays.asList("Hello World", "Java Streams");
List<String[]> splitWords = words.stream()
    .map(s -> s.split(" "))  // returns Stream<String[]>
    .collect(Collectors.toList());
// Result: [[Hello, World], [Java, Streams]]  — nested!

// flatMap: 1-to-many, then flatten
List<String> allWords = words.stream()
    .flatMap(s -> Arrays.stream(s.split(" ")))  // Stream<String>
    .collect(Collectors.toList());
// Result: [Hello, World, Java, Streams]  — flat!

// Real example: List of orders with items
List<Item> allItems = orders.stream()
    .flatMap(order -> order.getItems().stream())
    .collect(Collectors.toList());`,
      followUp: [
        { question: 'What would happen if you used map() instead of flatMap() for the nested case?', answer: `words.stream().map(s -> Arrays.stream(s.split(" "))) returns Stream<Stream<String>> — cannot directly collect into a flat List<String>. You'd need to call .flatMap(Function.identity()) afterward.` },
      ],
    },
    {
      id: 29,
      question: 'Explain the difference between intermediate and terminal operations',
      difficulty: 'intermediate',
      asked: true,
      tags: ['streams', 'lazy evaluation'],
      answer: `Intermediate operations are lazy — they don't execute until a terminal operation is called. Terminal operations trigger the actual stream processing.

Intermediate: filter(), map(), sorted(), distinct(), limit(), skip(), peek()
Terminal: collect(), forEach(), count(), min(), max(), findFirst(), anyMatch(), allMatch(), reduce()

In my experience, this laziness is very powerful. If I have filter().map().limit(5), the stream stops processing after finding 5 matching elements.`,
      code: `List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// This does NOTHING until collect() is called
Stream<Integer> stream = numbers.stream()
    .filter(n -> { System.out.println("filtering: " + n); return n % 2 == 0; })
    .map(n -> { System.out.println("mapping: " + n); return n * 2; });

// Stream executes HERE
List<Integer> result = stream.collect(Collectors.toList());

// Short-circuit: stops after finding 2 elements
numbers.stream()
    .filter(n -> n % 2 == 0)
    .limit(2)
    .forEach(System.out::println);  // prints only 2 and 4`,
      followUp: [
        { question: 'What is a short-circuit operation? Give examples.', answer: `Operations that can stop processing early. Short-circuit intermediate: limit(n) — stops after n elements. Short-circuit terminal: findFirst(), findAny(), anyMatch(), allMatch(), noneMatch() — return as soon as result is determined.` },
        { question: 'What happens if you call a terminal operation on a stream twice?', answer: `Streams can only be consumed ONCE. After a terminal operation is called, the stream is exhausted. Calling another terminal operation throws IllegalStateException: "stream has already been operated upon or closed." Create the stream again from the source.` },
      ],
      tip: 'Streams can only be consumed once. Calling a terminal op twice throws IllegalStateException. Mention this — it\'s a common gotcha.',
    },
    {
      id: 30,
      question: 'What is the difference between Comparable and Comparator?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java', 'sorting', 'Comparator', 'Comparable'],
      answer: `Comparable is for natural ordering — it's implemented by the class itself using compareTo(). A class can have only one natural order.

Comparator is external — you define it outside the class and can have multiple comparators for different sorting criteria.

In my EPLMS project, Vehicle implements Comparable by registration number for natural sort. But when the UI needs to sort by timestamp or location, I create separate Comparators.`,
      code: `// Comparable — natural order in the class
class Employee implements Comparable<Employee> {
    private String name;
    private double salary;

    @Override
    public int compareTo(Employee other) {
        return Double.compare(this.salary, other.salary);
    }
}

// Comparator — external, multiple orderings
Comparator<Employee> byName = Comparator.comparing(Employee::getName);
Comparator<Employee> bySalaryDesc = Comparator.comparingDouble(Employee::getSalary).reversed();
Comparator<Employee> byNameThenSalary = byName.thenComparing(bySalaryDesc);

List<Employee> sorted = employees.stream()
    .sorted(byNameThenSalary)
    .collect(Collectors.toList());

// Null-safe sorting
Comparator.nullsFirst(Comparator.comparing(Employee::getName))`,
      followUp: [
        { question: 'What is the contract for compareTo()?', answer: `Returns negative if this < other, 0 if equal, positive if this > other. Must be consistent with equals(). For double comparison, always use Double.compare(a, b) instead of a - b to avoid floating-point overflow.` },
        { question: 'How do you sort null values with Comparator?', answer: `Comparator.nullsFirst(Comparator) puts nulls at the beginning. Comparator.nullsLast(Comparator) puts nulls at the end.` },
      ],
    },
  ],
}

export default streamCoding
