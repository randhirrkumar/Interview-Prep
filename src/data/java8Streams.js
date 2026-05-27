const java8 = {
  title: 'Java 8 & Stream API',
  description: 'Complete Stream API coding questions, functional interfaces, Optional, lambdas, and method references.',
  tags: ['Java 8', 'Streams', 'Lambda', 'Functional Interface', 'Optional'],
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
        'What is the difference between filter() and map() in streams?',
        'Can you partition these in a single pass using partitioningBy?',
        'What happens if the list is null? How do you handle it?',
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
    .map(String::valueOf)           // [11, 22, 3, 41, 5, 6, 17, 58] as strings
    .filter(n -> n.startsWith("1")) // ["11", "17"]... wait, also "1x" patterns
    .map(Integer::valueOf)
    .collect(Collectors.toList());

System.out.println(startsWithOne); // [11, 17]`,
      followUp: [
        'What is a method reference? Give 4 types of method references.',
        'What is the difference between Integer::valueOf and Integer::parseInt?',
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
    .mapToInt(Integer::intValue)  // or: .mapToInt(n -> n)
    .sum();
System.out.println(sum1); // 36

// Method 2: reduce
int sum2 = numbers.stream()
    .reduce(0, Integer::sum);  // or: (a, b) -> a + b
System.out.println(sum2); // 36

// Method 3: collect with summarizing
IntSummaryStatistics stats = numbers.stream()
    .mapToInt(Integer::intValue)
    .summaryStatistics();
System.out.println(stats.getSum()); // 36`,
      followUp: [
        'What is the difference between reduce() and collect()?',
        'What does mapToInt() return? Why is it different from map()?',
        'Explain IntSummaryStatistics.',
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
        'Why is the HashSet approach problematic in parallel streams?',
        'What is a stateful predicate? Why should you avoid it?',
        'How does groupingBy work internally?',
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
      code: `// From List
List<Integer> numbers = Arrays.asList(11, 2, 3, 4, 51, 6, 7, 8);

numbers.stream()
    .findFirst()
    .ifPresent(System.out::println); // 11

// From array
int[] arr = {11, 2, 3, 4, 51, 6, 7, 8};

Arrays.stream(arr)
    .boxed()          // convert IntStream to Stream<Integer>
    .findFirst()
    .ifPresent(System.out::println); // 11

// Safe get with orElse
Integer first = numbers.stream()
    .findFirst()
    .orElse(-1);  // default if empty`,
      followUp: [
        'What is Optional? Why was it introduced in Java 8?',
        'What is the difference between findFirst() and findAny()?',
        'What are the different ways to unwrap an Optional?',
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
        'What is the difference between count() and size()? When would you use stream count vs list.size()?',
        'What does reduce() do when the identity value is 0?',
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
    .getAsInt();  // throws NoSuchElementException if empty!

int min = numbers.stream()
    .mapToInt(Integer::intValue)
    .min()
    .getAsInt();

System.out.println("Max: " + max); // 64
System.out.println("Min: " + min); // 2

// Safer: using Comparator
Optional<Integer> safeMax = numbers.stream()
    .max(Comparator.naturalOrder());

Optional<Integer> safeMin = numbers.stream()
    .min(Comparator.naturalOrder());

safeMax.ifPresent(m -> System.out.println("Max: " + m));`,
      followUp: [
        'What happens if you call getAsInt() on an empty OptionalInt?',
        'How would you find the max object from a list of employees by salary?',
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
    .sorted()           // ascending: [2, 4, 5, 7, 8, 23, 31, 64]
    .skip(1)            // skip 2
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
        'What does skip() return? Is it a lazy operation?',
        'How would you find the Nth highest salary from an Employee list?',
        'What if the list has fewer than 2 distinct elements?',
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
      followUp: ['How would you handle k being out of range?'],
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

System.out.println(firstNonRepeating); // 'j' (first non-repeating char)

// Production-grade: LinkedHashMap approach
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
        'What does s.chars() return? What is IntStream?',
        'Why LinkedHashMap instead of HashMap for the second approach?',
        'What is the time complexity of both approaches?',
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

System.out.println(firstRepeating); // 'a' (appears multiple times, and is first)`,
      followUp: ['What if you need to find the first character that repeats consecutively?'],
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

// Sorting objects
List<Employee> employees = getEmployees();

// Sort by salary ascending
List<Employee> bySalary = employees.stream()
    .sorted(Comparator.comparing(Employee::getSalary))
    .collect(Collectors.toList());

// Sort by salary desc, then by name asc
List<Employee> complex = employees.stream()
    .sorted(Comparator.comparing(Employee::getSalary).reversed()
        .thenComparing(Employee::getName))
    .collect(Collectors.toList());`,
      followUp: [
        'Is sorted() a stateful or stateless intermediate operation?',
        'How does sorted() work with parallel streams?',
        'What is the difference between Comparator.comparing() and Comparable?',
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

In my projects, I used this exact pattern to group Kafka events by event type and count them for monitoring dashboards.

There are two approaches — using split("") to get a Stream<String> or using chars().mapToObj() to get Stream<Character>. I prefer the chars approach since it avoids creating a string array.`,
      code: `String s = "interview";

// Approach 1: using split("")
Map<String, Long> freqByString = Arrays.stream(s.split(""))
    .collect(Collectors.groupingBy(
        str -> str,
        Collectors.counting()
    ));
System.out.println(freqByString);
// {i=1, n=1, t=2, e=2, r=2, v=1, w=1}

// Approach 2: using chars (returns Character keys)
Map<Character, Long> freqByChar = s.chars()
    .mapToObj(c -> (char) c)
    .collect(Collectors.groupingBy(
        Function.identity(),  // same as c -> c
        Collectors.counting()
    ));
System.out.println(freqByChar);

// Sort by frequency descending
freqByString.entrySet().stream()
    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
    .forEach(e -> System.out.println(e.getKey() + " -> " + e.getValue()));`,
      followUp: [
        'What is Function.identity()? Why use it instead of a lambda?',
        'What is the difference between groupingBy and partitioningBy?',
        'How would you get the top 3 most frequent characters?',
      ],
      tip: 'Know Collectors well: groupingBy, partitioningBy, counting, joining, toMap, toList, summarizingInt. These are heavily tested.',
    },
    {
      id: 14,
      question: 'Sort a string using Stream',
      difficulty: 'beginner',
      tags: ['streams', 'sorted', 'joining', 'chars'],
      answer: `Two approaches: use s.chars().mapToObj() to get characters, sort them, and join back. Or split by "" and sort the array of single-character strings.

I prefer the split approach as it's slightly more readable.`,
      code: `String s = "java";

// Approach 1: using chars
String sorted1 = s.chars()
    .mapToObj(c -> String.valueOf((char) c))
    .sorted()
    .collect(Collectors.joining());
System.out.println(sorted1); // "aajv"

// Approach 2: using split
String sorted2 = Arrays.stream(s.split(""))
    .sorted()
    .collect(Collectors.joining());
System.out.println(sorted2); // "aajv"

// Sort descending
String sortedDesc = s.chars()
    .mapToObj(c -> String.valueOf((char) c))
    .sorted(Comparator.reverseOrder())
    .collect(Collectors.joining());
System.out.println(sortedDesc); // "vjaa"`,
      followUp: ['What does Collectors.joining() do? What are its three overloads?'],
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
    .collect(Collectors.toList());
System.out.println(endsWithOne2); // [31, 61, 71]`,
      followUp: ['How would you handle negative numbers in the arithmetic approach?'],
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
System.out.println(merged2); // [3, 2, 7, 4, 5, 8]

// Merge and sort
List<Integer> mergedSorted = Stream.concat(list1.stream(), list2.stream())
    .sorted()
    .collect(Collectors.toList());
System.out.println(mergedSorted); // [2, 3, 4, 5, 7, 8]

// Merge and remove duplicates
List<Integer> mergedDistinct = Stream.concat(list1.stream(), list2.stream())
    .distinct()
    .collect(Collectors.toList());`,
      followUp: [
        'What is the difference between map() and flatMap()?',
        'When would you use flatMap in a real project scenario?',
      ],
      tip: 'flatMap is used to "flatten" nested structures. E.g., List<List<String>> -> Stream<String>. Very common when processing JSON arrays or nested collections.',
    },
    {
      id: 17,
      question: 'Sort an array and convert sorted array into stream',
      difficulty: 'beginner',
      tags: ['streams', 'Arrays', 'sorted'],
      answer: `For primitive arrays like int[], I use Arrays.sort() first then Arrays.stream(). Or I can use Arrays.stream().sorted() directly — though for primitive int arrays, sorted() works on IntStream directly.`,
      code: `int[] arr = {3, 2, 7, 5, 4, 8};

// Sort first, then stream
Arrays.sort(arr);
Arrays.stream(arr).forEach(n -> System.out.print(n + " "));
// 2 3 4 5 7 8

// Or: stream with sorted (doesn't modify original array)
Arrays.stream(arr)
    .sorted()
    .forEach(System.out::println);

// For Integer array (boxed)
Integer[] boxed = {3, 2, 7, 5, 4, 8};
Arrays.stream(boxed)
    .sorted(Comparator.reverseOrder())
    .forEach(System.out::println);`,
      followUp: [
        'What is the difference between Arrays.stream(int[]) and Arrays.stream(Integer[])?',
        'How do you convert IntStream to List<Integer>?',
      ],
      tip: 'Arrays.stream(int[]) returns IntStream. To collect it to a list: .boxed().collect(Collectors.toList())',
    },
    {
      id: 18,
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

// Using lambda
List<String> upper2 = list.stream()
    .map(s -> s.toUpperCase())
    .collect(Collectors.toList());

// Also lowercase
List<String> lower = list.stream()
    .map(String::toLowerCase)
    .collect(Collectors.toList());`,
      followUp: [
        'What is an instance method reference on arbitrary object type?',
        'Can you chain multiple map() operations?',
      ],
    },
    {
      id: 19,
      question: 'Perform cube on list elements and filter numbers greater than 50',
      difficulty: 'beginner',
      tags: ['streams', 'map', 'filter'],
      answer: `Chain map() to cube each number, then filter() to keep only those greater than 50. This shows the power of stream pipelines — transforming and filtering in a clean readable chain.`,
      code: `List<Integer> numbers = Arrays.asList(3, 2, 5, 9, 1, 4);

List<Integer> result = numbers.stream()
    .map(n -> n * n * n)   // cube: [27, 8, 125, 729, 1, 64]
    .filter(n -> n > 50)   // filter > 50: [125, 729, 64]
    .collect(Collectors.toList());

System.out.println(result); // [125, 729, 64]

// With sorted
List<Integer> sortedResult = numbers.stream()
    .map(n -> (int) Math.pow(n, 3))
    .filter(n -> n > 50)
    .sorted()
    .collect(Collectors.toList());`,
      followUp: ['What is the order of intermediate operations in a stream pipeline?'],
    },
    {
      id: 20,
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
        'What is the difference between Optional.of() and Optional.ofNullable()?',
        'When should you NOT use Optional? (as method parameters, in collections)',
        'What is Optional.empty()?',
      ],
      tip: 'Do NOT use Optional as a method parameter or in collections. It\'s designed for return values only. Mention this to show you know the design intent.',
    },
    {
      id: 21,
      question: 'Find min, max, average, sum and count in a list',
      difficulty: 'beginner',
      asked: true,
      tags: ['streams', 'IntSummaryStatistics', 'mapToInt'],
      answer: `IntSummaryStatistics is the most efficient way — a single pass through the stream to get all stats. I can also call them individually with mapToInt().

In my EPLMS project, I used this to compute vehicle event statistics — minimum, maximum and average event processing times across a day's batch of events.`,
      code: `List<Integer> numbers = Arrays.asList(3, 2, 5, 9, 1, 4);

// Individual calls
int min = numbers.stream().mapToInt(Integer::intValue).min().getAsInt();
int max = numbers.stream().mapToInt(Integer::intValue).max().getAsInt();
double avg = numbers.stream().mapToInt(Integer::intValue).average().getAsDouble();
long sum = numbers.stream().mapToInt(Integer::intValue).asLongStream().sum();
long count = numbers.stream().count();

// BEST: all in one pass using summaryStatistics
IntSummaryStatistics stats = numbers.stream()
    .mapToInt(Integer::intValue)
    .summaryStatistics();

System.out.println("Min: " + stats.getMin());       // 1
System.out.println("Max: " + stats.getMax());       // 9
System.out.println("Avg: " + stats.getAverage());   // 4.0
System.out.println("Sum: " + stats.getSum());       // 24
System.out.println("Count: " + stats.getCount());   // 6

// For doubles
DoubleSummaryStatistics dStats = numbers.stream()
    .mapToDouble(Integer::doubleValue)
    .summaryStatistics();`,
      followUp: [
        'What is the difference between IntSummaryStatistics and DoubleSummaryStatistics?',
        'Why is summaryStatistics() more efficient than calling min/max/avg separately?',
      ],
      tip: 'summaryStatistics() does a single pass. Calling min(), max(), average() separately means 3 passes through the stream.',
    },
    {
      id: 22,
      question: 'Find common elements between two lists',
      difficulty: 'beginner',
      asked: true,
      tags: ['streams', 'filter', 'contains'],
      answer: `I stream the first list and use list2::contains as the filter predicate. This is O(n*m) which is fine for small lists. For large lists, converting list2 to a HashSet first makes it O(n).

I often use this pattern in my projects to find matching policy IDs between two data sources during a reconciliation process.`,
      code: `List<Integer> list1 = Arrays.asList(3, 2, 7, 8, 1);
List<Integer> list2 = Arrays.asList(1, 4, 3, 8, 5);

// Basic (O(n*m))
List<Integer> common = list1.stream()
    .filter(list2::contains)
    .collect(Collectors.toList());
System.out.println(common); // [3, 8, 1]

// Optimized: convert list2 to HashSet first (O(n+m))
Set<Integer> set2 = new HashSet<>(list2);
List<Integer> commonFast = list1.stream()
    .filter(set2::contains)
    .collect(Collectors.toList());

// Find elements only in list1 (not in list2)
List<Integer> onlyInList1 = list1.stream()
    .filter(n -> !set2.contains(n))
    .collect(Collectors.toList());`,
      followUp: [
        'What is the time complexity of list2::contains vs set2::contains?',
        'How would you find elements present in list1 but not in list2?',
      ],
      tip: 'Always mention converting to HashSet for large lists. Shows performance awareness.',
    },
    {
      id: 23,
      question: 'Convert first character of each word to uppercase in a sentence',
      difficulty: 'intermediate',
      asked: true,
      tags: ['streams', 'map', 'substring', 'joining'],
      answer: `Split the sentence by spaces, then map each word to capitalize its first character using substring(0,1).toUpperCase() + substring(1), then join with space.

I used this kind of string transformation when formatting vehicle registration numbers and owner names in the EPLMS project for display purposes.`,
      code: `String s = "convert first character of each word into uppercase";

// Standard approach
String result = Arrays.stream(s.split(" "))
    .map(word -> word.isEmpty() ? word :
        word.substring(0, 1).toUpperCase() + word.substring(1))
    .collect(Collectors.joining(" "));

System.out.println(result);
// "Convert First Character Of Each Word Into Uppercase"

// Handle multiple spaces (regex split)
String result2 = Arrays.stream(s.split("\\s+"))
    .map(w -> Character.toUpperCase(w.charAt(0)) + w.substring(1))
    .collect(Collectors.joining(" "));`,
      followUp: [
        'What does Collectors.joining(delimiter) do?',
        'How would you handle an empty string or null input?',
      ],
    },
    {
      id: 24,
      question: 'Convert last character of each word to uppercase in a sentence',
      difficulty: 'intermediate',
      tags: ['streams', 'map', 'substring'],
      answer: `Similar to the previous, but take all chars except the last with substring(0, len-1), and uppercase just the last one with substring(len-1).toUpperCase().`,
      code: `String s = "convert last character of each word into uppercase";

String result = Arrays.stream(s.split(" "))
    .map(w -> w.length() <= 1 ? w.toUpperCase() :
        w.substring(0, w.length() - 1) + w.substring(w.length() - 1).toUpperCase())
    .collect(Collectors.joining(" "));

System.out.println(result);
// "converT lasT charactEr oF eacH worD intO uppercasE"`,
      followUp: ['How would you handle single-character words?'],
    },
    {
      id: 25,
      question: 'Count duplicate Strings from a list',
      difficulty: 'intermediate',
      asked: true,
      tags: ['streams', 'groupingBy', 'counting', 'filter'],
      answer: `I use groupingBy with counting() to get a frequency map, then filter entries where count > 1. This gives me a Map of duplicate strings with their counts.

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
    .collect(Collectors.toList());

System.out.println(duplicateList); // [Apple, Mango]`,
      followUp: [
        'What is Collectors.toMap()? How do you handle duplicate keys in toMap()?',
        'What happens if you use Collectors.toMap() with duplicate keys without a merge function?',
      ],
      tip: 'Collectors.toMap() throws IllegalStateException on duplicate keys. Always provide a merge function for safety: toMap(k, v, (v1,v2) -> v1)',
    },
    {
      id: 26,
      question: 'Find the length of each String and print it alongside',
      difficulty: 'beginner',
      tags: ['streams', 'map', 'forEach'],
      answer: `Map each string to "string = length" format and forEach to print.`,
      code: `List<String> list = Arrays.asList("Apple", "Orange", "Mango", "Banana");

// Using map to create formatted string
list.stream()
    .map(s -> s + " = " + s.length())
    .forEach(System.out::println);
// Apple = 5
// Orange = 6
// Mango = 5
// Banana = 6

// As a Map
Map<String, Integer> lengthMap = list.stream()
    .collect(Collectors.toMap(s -> s, String::length));
System.out.println(lengthMap);`,
      followUp: ['How would you sort the list by string length?'],
    },
    {
      id: 27,
      question: 'Merge two lists and sort the merged list',
      difficulty: 'beginner',
      tags: ['streams', 'concat', 'sorted'],
      answer: `Stream.concat() to merge, then .sorted() to sort. Clean one-liner.`,
      code: `List<Integer> list1 = Arrays.asList(3, 2, 7);
List<Integer> list2 = Arrays.asList(4, 5, 8);

List<Integer> mergedSorted = Stream.concat(list1.stream(), list2.stream())
    .sorted()
    .collect(Collectors.toList());
System.out.println(mergedSorted); // [2, 3, 4, 5, 7, 8]

// With distinct
List<Integer> mergedDistinctSorted = Stream.concat(list1.stream(), list2.stream())
    .distinct()
    .sorted()
    .collect(Collectors.toList());`,
    },
    {
      id: 28,
      question: 'Sum of even and odd numbers from a list',
      difficulty: 'beginner',
      asked: true,
      tags: ['streams', 'filter', 'mapToInt', 'sum'],
      answer: `Filter by even/odd condition, then mapToInt().sum(). Clean and readable. I can also use a single stream with partitioningBy and then sum each partition.`,
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
      followUp: ['What does partitioningBy return? How is it different from groupingBy?'],
      tip: 'partitioningBy always creates a Map<Boolean, List<T>> — only two buckets. groupingBy creates Map<K, List<T>> for any key.',
    },
    {
      id: 29,
      question: 'Reverse each word in a given sentence using Stream',
      difficulty: 'intermediate',
      tags: ['streams', 'map', 'StringBuilder', 'joining'],
      answer: `Split by space, map each word through StringBuilder(word).reverse(), then join back. StringBuilder.reverse() is the cleanest way to reverse a string in Java.`,
      code: `String str = "We are learning Java";

String reversed = Arrays.stream(str.split(" "))
    .map(word -> new StringBuilder(word).reverse().toString())
    .collect(Collectors.joining(" "));

System.out.println(reversed); // "eW era gninrael avaJ"

// Reverse the entire sentence (not just words)
String wholeSentenceReversed = new StringBuilder(str).reverse().toString();
System.out.println(wholeSentenceReversed); // "avaJ gninrael era eW"

// Reverse word order
String wordOrderReversed = Arrays.stream(str.split(" "))
    .reduce((a, b) -> b + " " + a)
    .orElse("");
System.out.println(wordOrderReversed); // "Java learning are We"`,
      followUp: [
        'What does StringBuilder.reverse() do for special characters?',
        'How would you reverse the order of words (not characters)?',
      ],
    },
    {
      id: 30,
      question: 'Generate Fibonacci series using Stream',
      difficulty: 'advanced',
      asked: true,
      tags: ['streams', 'iterate', 'limit'],
      answer: `Stream.iterate() is perfect for this. I seed it with int[] {0, 1} representing the two current Fibonacci numbers. Each iteration generates the next pair. Then I limit to the required count and map to get the first element of each pair.

This is a beautiful use of Stream.iterate() which takes a seed value and a function to generate the next value.`,
      code: `// Stream.iterate approach (Java 8+)
Stream.iterate(
    new int[]{0, 1},
    fib -> new int[]{fib[1], fib[0] + fib[1]}  // next pair
)
.limit(10)
.map(fib -> fib[0])
.forEach(System.out::println);
// 0 1 1 2 3 5 8 13 21 34

// Collect to list
List<Long> fibonacci = Stream.iterate(
    new long[]{0L, 1L},
    f -> new long[]{f[1], f[0] + f[1]}
)
.limit(15)
.map(f -> f[0])
.collect(Collectors.toList());

// Java 9+: Stream.iterate with predicate (stop condition)
Stream.iterate(
    new int[]{0, 1},
    fib -> fib[0] < 1000,  // stop when value >= 1000
    fib -> new int[]{fib[1], fib[0] + fib[1]}
)
.map(fib -> fib[0])
.forEach(System.out::println);`,
      followUp: [
        'What is the difference between Stream.iterate() in Java 8 vs Java 9?',
        'What is Stream.generate()? How is it different from Stream.iterate()?',
        'How would you generate an infinite stream of random numbers?',
      ],
      tip: 'Java 9 added a 3-arg Stream.iterate(seed, hasNext, next) that works like a for-loop. Java 8 iterate() is infinite — you MUST use limit() or it runs forever.',
    },
    {
      id: 31,
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
List<Order> orders = getOrders();
List<Item> allItems = orders.stream()
    .flatMap(order -> order.getItems().stream())
    .collect(Collectors.toList());`,
      followUp: [
        'What would happen if you used map() instead of flatMap() for the nested case?',
        'What is flatMapToInt()?',
      ],
    },
    {
      id: 32,
      question: 'Explain the difference between intermediate and terminal operations',
      difficulty: 'intermediate',
      asked: true,
      tags: ['streams', 'lazy evaluation'],
      answer: `Intermediate operations are lazy — they don't execute until a terminal operation is called. Terminal operations trigger the actual stream processing.

Examples:
- Intermediate: filter(), map(), sorted(), distinct(), limit(), skip(), peek()
- Terminal: collect(), forEach(), count(), min(), max(), findFirst(), anyMatch(), allMatch(), reduce()

In my experience, this laziness is actually very powerful. If I have filter().map().limit(5), the stream stops processing after finding 5 matching elements — it doesn't process the entire list.`,
      code: `List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// This does NOTHING until collect() is called
Stream<Integer> stream = numbers.stream()
    .filter(n -> {
        System.out.println("filtering: " + n);
        return n % 2 == 0;
    })
    .map(n -> {
        System.out.println("mapping: " + n);
        return n * 2;
    });

// Stream executes HERE (terminal operation triggers it)
List<Integer> result = stream.collect(Collectors.toList());

// Short-circuit: stops after finding 2 elements
numbers.stream()
    .filter(n -> n % 2 == 0)
    .limit(2)           // short-circuit
    .forEach(System.out::println);  // prints only 2 and 4`,
      followUp: [
        'What is a short-circuit operation? Give examples.',
        'What happens if you call a terminal operation on a stream twice?',
      ],
      tip: 'Streams can only be consumed once. Calling a terminal op twice throws IllegalStateException. Mention this — it\'s a common gotcha.',
    },
    {
      id: 33,
      question: 'What are Functional Interfaces in Java 8? Give examples.',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java 8', 'Functional Interface', 'Lambda'],
      answer: `A functional interface has exactly one abstract method. They are the backbone of lambdas and method references in Java 8.

The most important ones from java.util.function:
- Function<T,R>: takes T, returns R → used in map()
- Predicate<T>: takes T, returns boolean → used in filter()
- Consumer<T>: takes T, returns void → used in forEach()
- Supplier<T>: takes nothing, returns T → used in orElseGet()
- BiFunction<T,U,R>: takes two args → used in Map.compute()
- UnaryOperator<T>: Function<T,T> → input and output same type

In my Spring Boot projects I use these heavily — Predicate for validation logic, Function for data transformation, and Supplier for lazy initialization.`,
      code: `// Predicate - filter / test
Predicate<String> isLong = s -> s.length() > 5;
System.out.println(isLong.test("Hello"));    // false
System.out.println(isLong.test("HelloWorld")); // true

// Function - transform
Function<String, Integer> strLen = String::length;
System.out.println(strLen.apply("Java")); // 4

// Function composition
Function<Integer, Integer> doubleIt = n -> n * 2;
Function<Integer, Integer> addTen = n -> n + 10;
Function<Integer, Integer> doubleThenAdd = doubleIt.andThen(addTen);
System.out.println(doubleThenAdd.apply(5)); // 20

// Consumer
Consumer<String> print = System.out::println;
print.accept("Hello Java 8!");

// Supplier
Supplier<List<String>> listFactory = ArrayList::new;
List<String> newList = listFactory.get();

// BiFunction
BiFunction<String, Integer, String> repeat = (s, n) -> s.repeat(n);
System.out.println(repeat.apply("Java", 3)); // JavaJavaJava`,
      followUp: [
        'What is @FunctionalInterface annotation? Is it mandatory?',
        'Can a functional interface have default or static methods?',
        'What is the difference between Predicate.and() vs &&?',
      ],
      tip: '@FunctionalInterface is optional but acts as a compile-time check. If you add a second abstract method, the compiler will flag it immediately.',
    },
    {
      id: 34,
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
        return Double.compare(this.salary, other.salary); // natural: by salary
    }
}

// Comparator — external, multiple orderings
Comparator<Employee> byName = Comparator.comparing(Employee::getName);
Comparator<Employee> bySalaryDesc = Comparator.comparingDouble(Employee::getSalary).reversed();
Comparator<Employee> byNameThenSalary = byName.thenComparing(bySalaryDesc);

List<Employee> sorted = employees.stream()
    .sorted(byNameThenSalary)
    .collect(Collectors.toList());

// Java 8 Comparator static methods
Comparator.naturalOrder()    // uses Comparable
Comparator.reverseOrder()    // reverse of natural
Comparator.nullsFirst(...)   // nulls come first`,
      followUp: [
        'What is the contract for compareTo()? (returns negative, zero, positive)',
        'How do you sort null values with Comparator?',
      ],
    },
  ],
}

export default java8
