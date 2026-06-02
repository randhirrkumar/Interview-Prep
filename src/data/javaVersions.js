const javaVersions = {
  title: 'Java Versions 8 → 21',
  description: 'Comprehensive Java 8, 11, 17, and 21 features — lambdas, records, sealed classes, virtual threads, pattern matching, and interview-ready comparisons.',
  tags: ['Java 8', 'Java 11', 'Java 17', 'Java 21', 'Lambda', 'Records', 'Virtual Threads', 'Sealed Classes', 'Pattern Matching'],
  questions: [

    // ═══════════════════════════════════════════════════
    //  JAVA 8  (Released March 2014 — LTS)
    // ═══════════════════════════════════════════════════

    {
      id: 1,
      question: 'Java 8 Overview — Why was it a landmark release? What are its key features?',
      difficulty: 'beginner',
      asked: true,
      tags: ['Java 8', 'Overview', 'LTS'],
      answer: `Java 8 (March 2014) is arguably the most important Java release since Java 5. It introduced functional programming to Java and is still the most widely deployed Java version in enterprise systems.

Why it was critical:
— Functional Programming: Lambda expressions let you pass behavior as data
— Code conciseness: Replaced verbose anonymous inner classes
— Performance: Stream API enables parallel processing with minimal code
— Null safety: Optional class reduces NullPointerExceptions
— Modern Date/Time: Replaced the notoriously bad java.util.Date

LTS Status: Java 8 is an LTS (Long-Term Support) release. Oracle supports it until December 2030.

Enterprise adoption: As of 2024, ~40% of enterprise Java applications still run on Java 8. It remains the baseline for most interview questions.

Key Features:
1. Lambda Expressions
2. Functional Interfaces (java.util.function)
3. Method References
4. Stream API
5. Optional<T>
6. Default and Static methods in interfaces
7. New Date/Time API (java.time)
8. CompletableFuture
9. Nashorn JavaScript engine (deprecated later)`,
      code: `// Before Java 8 — verbose anonymous inner class
List<String> names = Arrays.asList("Charlie", "Alice", "Bob");
Collections.sort(names, new Comparator<String>() {
    @Override
    public int compare(String a, String b) {
        return a.compareTo(b);
    }
});

// Java 8 — lambda + method reference
names.sort(String::compareTo);
// or
names.sort(Comparator.naturalOrder());

// Before Java 8 — for loop
List<String> result = new ArrayList<>();
for (String name : names) {
    if (name.startsWith("A")) {
        result.add(name.toUpperCase());
    }
}

// Java 8 — Stream pipeline
List<String> result = names.stream()
    .filter(n -> n.startsWith("A"))
    .map(String::toUpperCase)
    .collect(Collectors.toList());`,
      tip: 'In interviews: "Java 8 brought functional programming to Java — the most important change since generics in Java 5. It makes code concise, readable, and enables parallelism without boilerplate."',
    },

    {
      id: 2,
      question: 'What is a Lambda Expression in Java 8? How does it work internally?',
      difficulty: 'beginner',
      asked: true,
      tags: ['Java 8', 'Lambda', 'Functional Programming'],
      answer: `A lambda expression is an anonymous function — a block of code with parameters that can be passed around as data.

Syntax:
  (parameters) -> expression
  (parameters) -> { statements; return value; }

Internally: Lambda expressions are compiled to invokedynamic bytecode (introduced in Java 7). At runtime, the JVM uses LambdaMetafactory to create the functional interface implementation. This avoids creating a .class file per lambda (unlike anonymous inner classes).

Key rules:
1. Lambdas can only be used where a functional interface is expected
2. They can capture effectively final local variables
3. "this" inside a lambda refers to the ENCLOSING class (not the lambda)
4. They are NOT anonymous classes — they don't create a new scope

Effectively final: Local variables used inside a lambda must not be modified after initialization. The compiler enforces this because the lambda may outlive the stack frame.`,
      code: `// 1. No parameters
Runnable r = () -> System.out.println("Running");

// 2. Single parameter (parens optional)
Consumer<String> print = s -> System.out.println(s);

// 3. Multiple parameters
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;

// 4. Block body
Comparator<String> byLength = (s1, s2) -> {
    if (s1.length() != s2.length()) return s1.length() - s2.length();
    return s1.compareTo(s2);
};

// 5. Effectively final capture
String prefix = "Hello, ";  // effectively final
Consumer<String> greet = name -> System.out.println(prefix + name);

// 6. "this" refers to enclosing class
class MyService {
    String name = "Service";
    Runnable r = () -> System.out.println(this.name); // "Service"
}

// Production: Sorting employees
employees.sort(Comparator.comparingDouble(Employee::getSalary)
    .thenComparing(Employee::getName));`,
      followUp: [
        { question: 'What is the difference between a lambda and an anonymous inner class?', answer: `(1) Syntax: Lambda is concise; anonymous class is verbose. (2) "this" keyword: In lambda, "this" = enclosing class. In anonymous class, "this" = the anonymous class instance. (3) Compilation: Lambda → invokedynamic bytecode (no .class file). Anonymous class → separate .class file. (4) State: Anonymous class can have instance variables. Lambda only implements the one abstract method. (5) Performance: Lambda avoids creating a separate class per usage — slightly more efficient.` },
        { question: 'What does "effectively final" mean?', answer: `A local variable is effectively final if its value is never changed after initialization — even without the explicit "final" keyword. The compiler checks this. If you try to modify it inside a lambda, you get: "Variable used in lambda expression should be final or effectively final." Why: lambdas may be executed asynchronously, and by then the local variable's stack frame may be gone. Only effectively final variables are safe to capture.` },
      ],
      tip: '"this" in a lambda refers to the ENCLOSING class — this is a classic interview trap. In an anonymous class, "this" is the anonymous class itself.',
    },

    {
      id: 3,
      question: 'What are Functional Interfaces? List and explain the core ones from java.util.function.',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java 8', 'Functional Interface', '@FunctionalInterface'],
      answer: `A functional interface has EXACTLY ONE abstract method. Lambdas and method references are syntactic sugar for implementing functional interfaces.

@FunctionalInterface annotation: Optional but adds compile-time safety — the compiler throws an error if you accidentally add a second abstract method. Can have any number of default and static methods.

Core interfaces from java.util.function:

┌─────────────────────┬──────────────────┬──────────────────────────┐
│ Interface           │ Signature        │ Used in                  │
├─────────────────────┼──────────────────┼──────────────────────────┤
│ Function<T,R>       │ T → R            │ stream.map()             │
│ Predicate<T>        │ T → boolean      │ stream.filter()          │
│ Consumer<T>         │ T → void         │ stream.forEach()         │
│ Supplier<T>         │ () → T           │ Optional.orElseGet()     │
│ BiFunction<T,U,R>   │ T,U → R          │ Map.merge()              │
│ UnaryOperator<T>    │ T → T            │ List.replaceAll()        │
│ BinaryOperator<T>   │ T,T → T          │ Stream.reduce()          │
│ Comparator<T>       │ T,T → int        │ List.sort()              │
└─────────────────────┴──────────────────┴──────────────────────────┘

Primitive specializations (avoid boxing overhead):
IntPredicate, IntFunction<R>, IntSupplier, IntConsumer, IntUnaryOperator`,
      code: `// Predicate — test condition, compose with and/or/negate
Predicate<String> isLong = s -> s.length() > 5;
Predicate<String> startsA = s -> s.startsWith("A");
Predicate<String> longAndA = isLong.and(startsA);
Predicate<String> longOrA  = isLong.or(startsA);
Predicate<String> notLong  = isLong.negate();
// Java 11+: Predicate.not(isLong)

// Function — transform, compose with andThen/compose
Function<String, Integer> len = String::length;
Function<Integer, String> toStr = n -> "Length:" + n;
Function<String, String> lenStr = len.andThen(toStr);
System.out.println(lenStr.apply("Java")); // "Length:4"

// Consumer — action
Consumer<String> log = msg -> System.out.println("[LOG] " + msg);
Consumer<String> save = msg -> db.save(msg);
Consumer<String> logAndSave = log.andThen(save);  // chain consumers

// Supplier — lazy factory (only evaluated when needed)
Supplier<List<Employee>> factory = ArrayList::new;
Supplier<LocalDate> today = LocalDate::now;

// Production: Validation pipeline
Predicate<User> isActive  = u -> u.getStatus() == Status.ACTIVE;
Predicate<User> hasEmail   = u -> u.getEmail() != null;
Predicate<User> isVerified = u -> u.isEmailVerified();
Predicate<User> isValid    = isActive.and(hasEmail).and(isVerified);

List<User> validUsers = users.stream()
    .filter(isValid)
    .collect(Collectors.toList());`,
      followUp: [
        { question: 'What is the difference between andThen() and compose() in Function?', answer: `andThen(after): applies THIS function first, then "after". f.andThen(g) = g(f(x)). compose(before): applies "before" first, then THIS. f.compose(g) = f(g(x)). Memory trick: andThen = "do this, THEN do that" (left-to-right). compose = inside-out (mathematical composition). In practice, andThen() is more intuitive.` },
        { question: 'Can a functional interface have default or static methods?', answer: `Yes — unlimited. @FunctionalInterface only restricts abstract methods to exactly one. Predicate itself has default and(), or(), negate() and static not() — all default/static, doesn't break the functional interface contract.` },
      ],
      tip: '@FunctionalInterface is optional but a compile-time safety net. Primitive specializations (IntPredicate, IntFunction) avoid boxing — mention this for performance interviews.',
    },

    {
      id: 4,
      question: 'What are Default and Static methods in interfaces? Why were they introduced?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java 8', 'Default Methods', 'Interface', 'Backward Compatibility'],
      answer: `Default Methods: Concrete methods with a body in an interface. Declared with the "default" keyword.

Why introduced: Java 8 needed to add methods to existing interfaces (like Collection, List, Iterable) for Stream API support — forEach(), stream(), spliterator() — without breaking the millions of existing implementations. Default methods solve the "interface evolution" problem.

Static Methods: Interface-level utility methods — like helper factories. They cannot be overridden and are called via InterfaceName.method().

Diamond Problem with defaults: If a class implements two interfaces that both have a default method with the same signature, the class MUST override it — otherwise compile error.

Priority rule (when there's a conflict):
1. Class methods ALWAYS win over interface defaults
2. Most specific interface wins (child interface over parent interface)
3. If ambiguous → compile error, must override`,
      code: `// Default method example
interface Greeting {
    String greet(String name);  // abstract

    default String greetPolitely(String name) {  // default
        return "Dear " + greet(name);
    }

    static Greeting formal() {  // static factory
        return name -> "Mr./Ms. " + name;
    }
}

// Implementation — can override or inherit default
class SimpleGreeting implements Greeting {
    @Override
    public String greet(String name) { return "Hello, " + name; }
    // greetPolitely() inherited — works without override
}

// Diamond problem
interface A { default String hello() { return "A"; } }
interface B { default String hello() { return "B"; } }

class C implements A, B {
    @Override
    public String hello() {
        return A.super.hello();  // explicit resolution
    }
}

// Real Java 8 additions to existing interfaces:
List<String> list = Arrays.asList("a", "b", "c");
list.forEach(System.out::println);        // forEach — default in Iterable
list.replaceAll(String::toUpperCase);     // replaceAll — default in List
list.sort(Comparator.naturalOrder());     // sort — default in List
list.removeIf(s -> s.equals("b"));       // removeIf — default in Collection

// Map new defaults
map.getOrDefault("key", "fallback");
map.putIfAbsent("key", "value");
map.computeIfAbsent("key", k -> new ArrayList<>());
map.merge("key", "new", (old, n) -> old + "," + n);`,
      followUp: [
        { question: 'What is the difference between default methods in interfaces and abstract methods in abstract classes?', answer: `Abstract class: Can have state (instance fields), constructors, any method type. Single inheritance only (a class extends only one abstract class). Interface with defaults: No state (no instance fields), no constructors, only constants. Multiple inheritance possible (a class implements many interfaces). Use abstract class when you need shared state. Use interface+defaults when defining behavior contracts across multiple unrelated types.` },
        { question: 'Can you call a specific interface\'s default method when there\'s a conflict?', answer: `Yes: InterfaceName.super.methodName(). Example: A.super.hello(). This is how you resolve diamond problems — explicitly delegate to the specific interface's default implementation.` },
      ],
      tip: 'Default methods were added to enable interface evolution without breaking existing implementations — key design motivation for Java 8 Stream API additions.',
    },

    {
      id: 5,
      question: 'What is the Optional class in Java 8? Why was it introduced? How do you use it correctly?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java 8', 'Optional', 'Null Safety'],
      answer: `Optional<T> is a container that may or may not hold a non-null value. Introduced to:
1. Eliminate NullPointerException from method return values
2. Force callers to handle the "no value" case explicitly
3. Make the API's intent clear — "this might not have a value"

When to use: ONLY as a method return type when the value may be absent.
When NOT to use: Method parameters, fields, collections.

Key methods:
— Optional.of(value)          → wraps value, throws NPE if null
— Optional.ofNullable(value)  → wraps value, returns empty if null
— Optional.empty()            → empty container singleton
— isPresent() / isEmpty()     → check if value exists (Java 11)
— get()                       → get value, throws if empty (AVOID)
— orElse(default)             → return default (always evaluated)
— orElseGet(() -> default)    → lazy default (only computed if empty)
— orElseThrow()               → throw NoSuchElementException
— ifPresent(consumer)         → run action if present
— map(function)               → transform if present
— filter(predicate)           → filter, return empty if doesn't match
— flatMap(f)                  → when f returns Optional (avoid nested)`,
      code: `// Don't do this — defeats the purpose
Optional<User> opt = userRepo.findById(id);
if (opt.isPresent()) {
    User u = opt.get();  // same as null check
}

// Do this — chain operations
String name = userRepo.findById(id)
    .map(User::getName)
    .map(String::toUpperCase)
    .orElse("UNKNOWN");

// orElse vs orElseGet
// orElse: ALWAYS evaluates the default (even if value is present)
User user = userRepo.findById(id)
    .orElse(new User("default"));  // new User() called always — BAD if expensive

// orElseGet: LAZY — only called if empty (PREFER for expensive defaults)
User user = userRepo.findById(id)
    .orElseGet(() -> createDefaultUser());  // createDefaultUser() called only if empty

// orElseThrow — throw specific exception
User user = userRepo.findById(id)
    .orElseThrow(() -> new UserNotFoundException("User not found: " + id));

// filter + map pipeline
Optional<String> activeEmail = userRepo.findById(id)
    .filter(u -> u.getStatus() == Status.ACTIVE)
    .filter(u -> u.getEmail() != null)
    .map(User::getEmail);

// ifPresent — side effect only
userRepo.findById(id)
    .ifPresent(u -> auditLog.log("User accessed: " + u.getId()));

// Java 9: ifPresentOrElse
userRepo.findById(id)
    .ifPresentOrElse(
        u -> processUser(u),
        () -> log.warn("User not found")
    );

// Java 9: or() — return another Optional if empty
Optional<User> user = userRepo.findByEmail(email)
    .or(() -> userRepo.findByPhone(phone));  // fallback Optional`,
      followUp: [
        { question: 'What is the difference between orElse() and orElseGet()?', answer: `orElse(T): The argument is evaluated EAGERLY — even if Optional has a value. If the default involves a database call or object creation, it happens regardless. orElseGet(Supplier<T>): LAZY — the Supplier is only called if the Optional is empty. Always prefer orElseGet() when the default is expensive (DB call, API call, complex object construction). For simple constants: orElse("default") is fine.` },
        { question: 'Why should you not use Optional as a method parameter?', answer: `(1) Forces callers to wrap their values in Optional unnecessarily. (2) Callers can still pass Optional.empty() or null, so null safety isn't guaranteed. (3) Makes the API awkward: findUser(Optional.of("john")). Better: provide overloaded methods or use nullable + @Nullable annotation.` },
      ],
      tip: 'Never use Optional.get() without isPresent() check — it can throw NoSuchElementException just like NPE. Always use orElse/orElseGet/orElseThrow.',
    },

    {
      id: 6,
      question: 'What is the new Date/Time API in Java 8? How is it better than java.util.Date?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java 8', 'Date/Time API', 'LocalDate', 'ZonedDateTime'],
      answer: `Java 8 introduced java.time package (based on Joda-Time). Problems with old java.util.Date:
— Mutable (thread-unsafe) — Date is not thread-safe
— Design flaws: Date.getYear() returns year - 1900, months 0-indexed
— No timezone handling — TimeZone class is cumbersome
— Calendar API was verbose and error-prone

New java.time classes:

LocalDate       — date only (2024-01-15), no time, no timezone
LocalTime       — time only (14:30:00), no date, no timezone
LocalDateTime   — date + time (2024-01-15T14:30:00), no timezone
ZonedDateTime   — date + time + timezone (full representation)
Instant         — machine-readable UTC timestamp (epoch milliseconds)
Duration        — amount of time in seconds/nanoseconds (time-based)
Period          — amount of time in years/months/days (date-based)
DateTimeFormatter — thread-safe formatting (unlike SimpleDateFormat)

All classes are IMMUTABLE and THREAD-SAFE.`,
      code: `// LocalDate — date without time
LocalDate today = LocalDate.now();
LocalDate birthday = LocalDate.of(1995, Month.JULY, 15);
LocalDate nextWeek = today.plusWeeks(1);
LocalDate prevMonth = today.minusMonths(1);

System.out.println(today);           // 2024-01-15
System.out.println(today.getDayOfWeek()); // MONDAY
System.out.println(today.isLeapYear());   // false

// Period — difference in dates
Period age = Period.between(birthday, today);
System.out.println(age.getYears() + " years old");

// LocalDateTime
LocalDateTime meeting = LocalDateTime.of(2024, 6, 15, 14, 30);
LocalDateTime oneHourLater = meeting.plusHours(1);

// ZonedDateTime — with timezone
ZoneId india = ZoneId.of("Asia/Kolkata");
ZonedDateTime istNow = ZonedDateTime.now(india);
ZonedDateTime utcNow = istNow.withZoneSameInstant(ZoneId.of("UTC"));

// Instant — for timestamps in logs/databases
Instant start = Instant.now();
// ... do work ...
Instant end = Instant.now();
Duration elapsed = Duration.between(start, end);
System.out.println("Elapsed: " + elapsed.toMillis() + "ms");

// DateTimeFormatter — thread-safe (unlike SimpleDateFormat!)
DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
String formatted = LocalDateTime.now().format(fmt);
LocalDateTime parsed = LocalDateTime.parse("15-01-2024 14:30", fmt);

// Production: audit timestamps
@Entity
public class AuditableEntity {
    private Instant createdAt = Instant.now();
    private LocalDate effectiveDate;

    // Store in DB as UTC, display in user's timezone
    public ZonedDateTime getCreatedAtForUser(String timezone) {
        return createdAt.atZone(ZoneId.of(timezone));
    }
}`,
      followUp: [
        { question: 'What is the difference between LocalDate, LocalDateTime, and ZonedDateTime? When to use which?', answer: `LocalDate: Use for dates without a time component — birthdays, deadlines, effective dates. "On 2024-01-15" — no time needed. LocalDateTime: Use for date+time without timezone — meeting schedules, log entries in a single-timezone app. ZonedDateTime: Use when timezone matters — user-facing timestamps, scheduling across timezones, storing events that need to be displayed in the user's local time. Instant: Use for machine timestamps — database storage, event sourcing, measuring elapsed time. Always store Instants in DB, convert to ZonedDateTime for display.` },
        { question: 'Why is SimpleDateFormat not thread-safe? How does DateTimeFormatter solve it?', answer: `SimpleDateFormat maintains internal state (parse position, calendar fields) — when multiple threads share one instance and call format()/parse() simultaneously, they corrupt each other's state, causing wrong results or exceptions. DateTimeFormatter is IMMUTABLE — all state is set at construction and never modified. Safe to share a single instance across threads without synchronization.` },
      ],
      tip: 'Key interview point: java.time classes are IMMUTABLE and THREAD-SAFE. plus/minus methods return NEW objects — they do not modify the original.',
    },

    {
      id: 7,
      question: 'What is CompletableFuture? How does it improve on Future<T>?',
      difficulty: 'advanced',
      asked: true,
      tags: ['Java 8', 'CompletableFuture', 'Async', 'Concurrency'],
      answer: `Future<T> (Java 5) problems:
— future.get() BLOCKS the calling thread — can't compose
— No callback mechanism — no "when done, do this"
— Cannot combine multiple futures
— Cannot manually complete a future
— No exception handling chain

CompletableFuture<T> (Java 8) solves all of these:
— Non-blocking: thenApply(), thenAccept(), thenRun() — callbacks
— Composable: thenCompose() chains, thenCombine() merges
— Combinators: allOf(), anyOf() for parallel tasks
— Exception handling: exceptionally(), handle()
— Can be manually completed: complete(), completeExceptionally()
— Runs on ForkJoinPool.commonPool() by default (or custom Executor)

Key method categories:
Creating: supplyAsync(), runAsync(), completedFuture()
Transforming: thenApply() (like map), thenCompose() (like flatMap)
Consuming: thenAccept() (no return), thenRun() (no input, no return)
Combining: thenCombine(), allOf(), anyOf()
Error handling: exceptionally(), handle(), whenComplete()`,
      code: `// Old Future — blocking, not composable
ExecutorService exec = Executors.newSingleThreadExecutor();
Future<String> future = exec.submit(() -> fetchUserName(123L));
String name = future.get();  // BLOCKS until done — bad!

// CompletableFuture — non-blocking chain
CompletableFuture<String> cf = CompletableFuture
    .supplyAsync(() -> fetchUserById(123L))           // runs on ForkJoinPool
    .thenApply(user -> user.getName())                // transform (like map)
    .thenApply(String::toUpperCase);                  // chain another transform

// thenCompose — when next step also returns a CompletableFuture (flatMap)
CompletableFuture<Order> orderCF = CompletableFuture
    .supplyAsync(() -> fetchUser(id))
    .thenCompose(user -> fetchLatestOrder(user));     // flatMap equivalent

// Exception handling
CompletableFuture<User> safeCF = CompletableFuture
    .supplyAsync(() -> riskyFetchUser(id))
    .exceptionally(ex -> {
        log.error("Failed to fetch user", ex);
        return User.defaultUser();  // fallback
    });

// handle() — runs for both success AND failure
CompletableFuture<String> result = CompletableFuture
    .supplyAsync(() -> fetchData())
    .handle((data, ex) -> {
        if (ex != null) return "ERROR: " + ex.getMessage();
        return "OK: " + data;
    });

// Run 3 tasks in parallel, wait for ALL
CompletableFuture<User> userCF  = CompletableFuture.supplyAsync(() -> fetchUser(id));
CompletableFuture<Order> orderCF = CompletableFuture.supplyAsync(() -> fetchOrder(id));
CompletableFuture<Void> allDone = CompletableFuture.allOf(userCF, orderCF);
allDone.thenRun(() -> {
    User user = userCF.join();    // join() = get() without checked exception
    Order order = orderCF.join();
    process(user, order);
});

// anyOf — race condition: use fastest response
CompletableFuture<Object> fastest = CompletableFuture.anyOf(cf1, cf2, cf3);

// Production: Spring Boot async service
@Service
public class UserService {
    @Async("taskExecutor")
    public CompletableFuture<User> findUserAsync(Long id) {
        return CompletableFuture.completedFuture(userRepo.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id)));
    }
}`,
      followUp: [
        { question: 'What is the difference between thenApply() and thenCompose()?', answer: `thenApply(f): the function f returns a PLAIN VALUE. If f returns a CompletableFuture, you get CompletableFuture<CompletableFuture<T>> — nested. thenCompose(f): the function f returns a CompletableFuture. thenCompose automatically flattens it to CompletableFuture<T>. Rule: thenApply = map, thenCompose = flatMap. Use thenCompose when the next step is also async (returns a CompletableFuture).` },
        { question: 'What is the difference between get() and join() in CompletableFuture?', answer: `get(): throws checked exceptions — InterruptedException and ExecutionException. Must be in try-catch. join(): throws unchecked CompletionException. No try-catch required. Preferred in lambda chains. Both BLOCK until the future completes. Note: In Java 21 with Virtual Threads, blocking is cheap — using join() in a virtual thread doesn't waste a platform thread.` },
      ],
      tip: 'thenApply = map (returns value), thenCompose = flatMap (returns CompletableFuture). Mixing them up is the #1 CompletableFuture interview mistake.',
    },

    // ═══════════════════════════════════════════════════
    //  JAVA 11  (Released September 2018 — LTS)
    // ═══════════════════════════════════════════════════

    {
      id: 8,
      question: 'Java 11 Overview — What are the key features? Why is it the most popular LTS after Java 8?',
      difficulty: 'beginner',
      asked: true,
      tags: ['Java 11', 'LTS', 'Overview'],
      answer: `Java 11 (September 2018) is an LTS release and the next major milestone after Java 8 for enterprise adoption. It's the most popular Java version after Java 8.

Key reasons for adoption:
— First LTS with the "Modern Java" feel (lambdas now established)
— New HttpClient API replaces the outdated HttpURLConnection
— Useful String and Files API additions
— var keyword (from Java 10) now usable in lambda parameters
— Java Flight Recorder (monitoring) made free (was commercial)
— Removed: Java EE modules (moved to Jakarta EE), Nashorn JS engine

Changes between Java 8 and 11 also include:
Java 9: Module system (JPMS), Process API, jshell REPL, Collection factory methods
Java 10: Local variable type inference (var), List.copyOf(), Map.copyOf()
Java 11: New String methods, HttpClient, Files.readString/writeString

Enterprise adoption: Java 11 is used by ~25% of production systems. Spring Boot 3.x requires Java 17 minimum, but many projects targeting Spring Boot 2.x still use Java 11.`,
      code: `// Java 9: Collection factory methods (immutable)
List<String> list = List.of("a", "b", "c");         // immutable
Set<String> set   = Set.of("x", "y", "z");          // immutable, no duplicates
Map<String, Integer> map = Map.of("one", 1, "two", 2); // immutable

// Java 9: Stream improvements
Stream.of(1, 2, null, 3, null, 4)
    .flatMap(Optional::stream)  // Optional.stream() — Java 9
    .forEach(System.out::println);

// Java 10: var — local variable type inference
var list2 = new ArrayList<String>();  // inferred as ArrayList<String>
var user = userRepo.findById(1L);     // inferred as Optional<User>

// Java 11: var in lambda
// Before Java 11
list.stream().filter((String s) -> s.length() > 3);
// Java 11: var in lambda (needed for annotations)
list.stream().filter((@NonNull var s) -> s.length() > 3);`,
      tip: 'Java 9-10-11 features are often grouped in interviews. Know the LTS versions: Java 8, 11, 17, 21, 25. Non-LTS versions (9, 10, 12-16, 18-20) are skipped in enterprise.',
    },

    {
      id: 9,
      question: 'What are the new String methods added in Java 11?',
      difficulty: 'beginner',
      asked: true,
      tags: ['Java 11', 'String Methods'],
      answer: `Java 11 added 6 very useful String methods that eliminate boilerplate.

isBlank()    — true if empty or contains only whitespace (better than isEmpty())
strip()      — removes leading/trailing whitespace, UNICODE-aware (better than trim())
stripLeading() — removes only leading whitespace
stripTrailing() — removes only trailing whitespace
lines()      — splits string by line terminators, returns Stream<String>
repeat(n)    — repeats the string n times

Key difference: strip() vs trim():
— trim() removes characters with ASCII code ≤ 32 (not all Unicode whitespace)
— strip() uses Character.isWhitespace() — handles all Unicode whitespace characters
— Always prefer strip() over trim() in new code`,
      code: `// isBlank() — better than isEmpty()
"".isBlank()       // true
" ".isBlank()      // true  (trim would give "", isEmpty would be false — isBlank is better)
"  ".isBlank()     // true
"hi".isBlank()     // false

// Was needed before Java 11:
str == null || str.trim().isEmpty();  // clunky
// Java 11:
str == null || str.isBlank();         // clean

// strip() — Unicode-aware (trim() is not)
" Hello ".trim()    // might not remove Unicode space
" Hello ".strip()   // correctly removes it → "Hello"

// lines() — great for processing multiline text
String multiline = "Java 8\nJava 11\nJava 17\nJava 21";
multiline.lines()
    .filter(line -> !line.isBlank())
    .map(String::strip)
    .forEach(System.out::println);

// Processing config files or CSV line by line
Files.readString(Path.of("config.txt")).lines()
    .filter(line -> !line.startsWith("#"))  // skip comments
    .map(line -> line.split("="))
    .filter(parts -> parts.length == 2)
    .forEach(parts -> config.put(parts[0].strip(), parts[1].strip()));

// repeat(n) — simple but useful
String divider = "-".repeat(50);         // "---...---"
String padding = " ".repeat(indent * 2); // dynamic indentation
String csv = "Java,Python,Go\n".repeat(3); // test data generation`,
      followUp: [
        { question: 'What is the difference between isBlank() and isEmpty()?', answer: `isEmpty() returns true only for zero-length strings: "".isEmpty() = true, " ".isEmpty() = false. isBlank() returns true for zero-length AND whitespace-only strings: "".isBlank() = true, " ".isBlank() = true, "  ".isBlank() = true. For user input validation, isBlank() is almost always what you want.` },
      ],
      tip: 'strip() is Unicode-aware; trim() is not. Always use strip() in Java 11+ code. isBlank() is better than isEmpty() for user input validation.',
    },

    {
      id: 10,
      question: 'What is the new HttpClient API in Java 11? How does it improve on HttpURLConnection?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java 11', 'HttpClient', 'HTTP/2'],
      answer: `Java 11 introduced java.net.http.HttpClient — a modern HTTP client built in. Before this, developers had to use HttpURLConnection (verbose, no HTTP/2) or add libraries like Apache HttpClient or OkHttp.

Java 11 HttpClient features:
— HTTP/1.1 AND HTTP/2 support
— Synchronous and Asynchronous calls
— WebSocket support
— Immutable builder pattern
— Reactive Streams support (request/response bodies as publishers/subscribers)
— Built-in timeout support
— Automatic redirect handling

Problems with old HttpURLConnection:
— No HTTP/2 support
— Very verbose API — many lines for a simple GET
— No async support
— No built-in JSON handling
— Difficult to configure timeouts properly`,
      code: `// Java 11 HttpClient — synchronous GET
HttpClient client = HttpClient.newBuilder()
    .version(HttpClient.Version.HTTP_2)
    .connectTimeout(Duration.ofSeconds(10))
    .followRedirects(HttpClient.Redirect.NORMAL)
    .build();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/users/1"))
    .header("Authorization", "Bearer " + token)
    .header("Accept", "application/json")
    .GET()
    .timeout(Duration.ofSeconds(30))
    .build();

HttpResponse<String> response = client.send(request,
    HttpResponse.BodyHandlers.ofString());

System.out.println("Status: " + response.statusCode());
System.out.println("Body: " + response.body());

// Async GET — non-blocking
CompletableFuture<HttpResponse<String>> asyncResponse = client
    .sendAsync(request, HttpResponse.BodyHandlers.ofString())
    .thenApply(r -> {
        System.out.println("Got response: " + r.statusCode());
        return r;
    });

// POST with JSON body
HttpRequest postRequest = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/users"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(
        "{\"name\": \"John\", \"email\": \"john@example.com\"}"
    ))
    .build();

// Production pattern with retry
public <T> T callWithRetry(HttpRequest req,
                           HttpResponse.BodyHandler<T> handler,
                           int maxRetries) throws Exception {
    for (int i = 0; i < maxRetries; i++) {
        try {
            HttpResponse<T> resp = client.send(req, handler);
            if (resp.statusCode() < 500) return resp.body();
        } catch (IOException e) {
            if (i == maxRetries - 1) throw e;
            Thread.sleep(1000L * (i + 1));  // exponential backoff
        }
    }
    throw new RuntimeException("Max retries exceeded");
}`,
      followUp: [
        { question: 'When would you use the Java 11 HttpClient vs RestTemplate vs WebClient?', answer: `Java 11 HttpClient: Simple projects with no Spring dependency, or when you need a lightweight client without framework overhead. RestTemplate (Spring): Synchronous REST calls in Spring MVC applications — familiar, simple, but deprecated in Spring 5.x in favor of WebClient. WebClient (Spring WebFlux): Reactive/non-blocking HTTP calls — preferred for new Spring applications, reactive streams support. For most Spring Boot microservices: WebClient. For non-Spring: Java 11 HttpClient. RestTemplate is legacy.` },
      ],
      tip: 'Java 11 HttpClient is immutable and thread-safe — create ONE instance and reuse it (like OkHttpClient). Creating per-request is wasteful.',
    },

    // ═══════════════════════════════════════════════════
    //  JAVA 17  (Released September 2021 — LTS)
    // ═══════════════════════════════════════════════════

    {
      id: 11,
      question: 'Java 17 Overview — What are the major features? Why is it significant?',
      difficulty: 'beginner',
      asked: true,
      tags: ['Java 17', 'LTS', 'Overview'],
      answer: `Java 17 (September 2021) is an LTS release and the baseline for Spring Boot 3.x and Jakarta EE 10. It includes features that accumulated from Java 9 to 17.

Key features that FINALIZED in Java 17:
— Records (finalized Java 16, available 17)
— Sealed Classes (finalized Java 17)
— Pattern Matching for instanceof (finalized Java 16)
— Switch Expressions (finalized Java 14)
— Text Blocks (finalized Java 15)
— Strong Encapsulation of JDK internals
— New macOS rendering pipeline
— Enhanced RandomGenerator API

Why it matters:
— Spring Boot 3.x requires Java 17 minimum
— Significant productivity improvements: Records replace POJOs, sealed classes replace enums for complex hierarchies
— Pattern matching eliminates boilerplate casting
— Performance: ZGC and G1 GC improvements

Adoption: Growing rapidly as teams migrate Spring Boot 2 → 3.`,
      code: `// Java 14: Switch Expression (finalized)
String day = "MONDAY";
int numLetters = switch (day) {
    case "MONDAY", "FRIDAY", "SUNDAY" -> 6;
    case "TUESDAY"                     -> 7;
    case "THURSDAY", "SATURDAY"        -> 8;
    case "WEDNESDAY"                   -> 9;
    default                            -> throw new IllegalArgumentException("Invalid day: " + day);
};

// Java 15: Text Blocks (finalized)
String json = """
    {
        "name": "Randhir",
        "role": "Java Backend Engineer",
        "experience": 5
    }
    """;

String sql = """
    SELECT u.name, u.email, o.order_id
    FROM users u
    JOIN orders o ON u.id = o.user_id
    WHERE u.status = 'ACTIVE'
    ORDER BY o.created_at DESC
    """;`,
      tip: 'For Spring Boot 3.x interviews: "Java 17 is the minimum. I use Records for DTOs, Sealed Classes for domain models, and Pattern Matching to eliminate instanceof casts."',
    },

    {
      id: 12,
      question: 'What are Records in Java 16/17? How do they replace boilerplate POJOs?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java 17', 'Records', 'POJO', 'Immutable'],
      answer: `Records are a new kind of class for immutable data carriers. They automatically generate:
— private final fields for each component
— Public accessor methods (not getters with "get" prefix — just name())
— Canonical constructor (all fields)
— equals() based on all components
— hashCode() based on all components
— toString() with all component values

Restrictions:
— Records are implicitly FINAL — cannot be extended
— All fields are implicitly private and final — immutable
— Cannot declare instance fields (only record components)
— Can implement interfaces
— Can have custom constructors, methods, and static fields

Perfect for:
— DTOs (Data Transfer Objects) in REST APIs
— Value objects in Domain-Driven Design
— Database query results
— Configuration data
— Event objects in event-driven systems`,
      code: `// Before Records — 30+ lines of boilerplate POJO
public class UserDTO {
    private final Long id;
    private final String name;
    private final String email;

    public UserDTO(Long id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
    public Long getId()     { return id; }
    public String getName() { return name; }
    public String getEmail(){ return email; }

    @Override
    public boolean equals(Object o) { /* ... 10 lines ... */ }
    @Override
    public int hashCode() { /* ... */ }
    @Override
    public String toString() { /* ... */ }
}

// Java Record — 1 line!
public record UserDTO(Long id, String name, String email) {}

// Usage — accessors are name(), not getName()
UserDTO user = new UserDTO(1L, "Randhir", "r@example.com");
System.out.println(user.id());     // 1
System.out.println(user.name());   // "Randhir"
System.out.println(user.email());  // "r@example.com"
System.out.println(user);          // UserDTO[id=1, name=Randhir, email=r@example.com]

// Compact constructor — for validation
public record UserDTO(Long id, String name, String email) {
    public UserDTO {  // compact constructor (no parameter list)
        Objects.requireNonNull(name, "Name cannot be null");
        if (email == null || !email.contains("@"))
            throw new IllegalArgumentException("Invalid email: " + email);
        name = name.strip();  // can modify before assignment
        email = email.toLowerCase();
    }
}

// Custom methods are fine
public record Point(double x, double y) {
    public double distance(Point other) {
        return Math.sqrt(Math.pow(x - other.x, 2) + Math.pow(y - other.y, 2));
    }
    public static Point origin() { return new Point(0, 0); }
}

// Records work great as DTOs in Spring Boot
@RestController
public class UserController {
    @GetMapping("/users/{id}")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long id) {
        return userService.findById(id)
            .map(u -> ResponseEntity.ok(new UserDTO(u.getId(), u.getName(), u.getEmail())))
            .orElse(ResponseEntity.notFound().build());
    }
}

// Records as Map keys (correct hashCode/equals)
Map<UserDTO, List<Order>> ordersByUser = orders.stream()
    .collect(Collectors.groupingBy(o -> new UserDTO(o.getUserId(), o.getUserName(), o.getEmail())));`,
      followUp: [
        { question: 'Can a Record extend another class or be extended?', answer: `No on both. Records implicitly extend java.lang.Record and are implicitly final. They cannot extend another class (already extending Record). They cannot be extended by another class (they're final). But Records CAN implement interfaces — which makes them useful for polymorphism in sealed class hierarchies. Example: sealed interface Shape permits Circle, Rectangle; record Circle(double radius) implements Shape; record Rectangle(double width, double height) implements Shape.` },
        { question: 'How do Records interact with Jackson for JSON serialization?', answer: `Jackson 2.12+ fully supports Records. It can serialize/deserialize Records automatically — the component names become JSON field names. But Records use foo() not getFoo(), so older Jackson versions may not detect the accessors. Ensure you use @JsonProperty or Jackson >= 2.12 which auto-detects record components. With Spring Boot 3.x and Jackson 2.14+, Records just work out of the box.` },
      ],
      tip: 'Record accessors are name() not getName(). Records are implicitly final. They work perfectly for DTOs — mention this in Spring Boot REST API interviews.',
    },

    {
      id: 13,
      question: 'What are Sealed Classes in Java 17? When would you use them?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java 17', 'Sealed Classes', 'Domain Modeling'],
      answer: `Sealed classes restrict which classes can extend or implement them. They give the author CONTROL over the inheritance hierarchy.

Keywords:
— sealed: declares the restricted class/interface
— permits: lists the allowed subtypes
— final: the subtype cannot be extended further
— non-sealed: the subtype can be freely extended
— sealed: the subtype is itself sealed (restricts further)

Why use sealed classes?
1. Exhaustive pattern matching — compiler knows ALL possible subtypes → can warn about missing switch cases
2. Domain modeling — explicitly model a closed set of types
3. Better than enums — when subtypes need different data fields
4. Better than abstract class — without sealed, anyone can add subtypes

Use cases:
— Payment types: CreditCard, DebitCard, UPI, NetBanking
— Shape hierarchy: Circle, Rectangle, Triangle
— Result types: Success, Failure, Pending
— Event types: UserCreated, UserUpdated, UserDeleted`,
      code: `// Sealed interface — payment types
public sealed interface Payment
    permits CreditCardPayment, UPIPayment, NetBankingPayment {
    double getAmount();
    String getPaymentId();
}

// Each subtype must be final, sealed, or non-sealed
public record CreditCardPayment(String cardNumber, double amount, String paymentId)
    implements Payment {
    public double getAmount() { return amount; }
    public String getPaymentId() { return paymentId; }
}

public record UPIPayment(String upiId, double amount, String paymentId)
    implements Payment {
    public double getAmount() { return amount; }
    public String getPaymentId() { return paymentId; }
}

public record NetBankingPayment(String bankCode, String accountNo, double amount, String paymentId)
    implements Payment {
    public double getAmount() { return amount; }
    public String getPaymentId() { return paymentId; }
}

// Exhaustive switch (Java 21 pattern matching)
double processFee = switch (payment) {
    case CreditCardPayment cc -> cc.getAmount() * 0.02;   // 2% fee
    case UPIPayment upi       -> 0.0;                      // free
    case NetBankingPayment nb -> 5.0;                      // flat ₹5
    // No default needed — compiler knows all subtypes!
};

// Real-world: API result type
public sealed interface ApiResult<T>
    permits ApiResult.Success, ApiResult.Failure {

    record Success<T>(T data, int statusCode) implements ApiResult<T> {}
    record Failure<T>(String error, int statusCode) implements ApiResult<T> {}
}

// Usage
ApiResult<User> result = userService.findUser(id);
String response = switch (result) {
    case ApiResult.Success<User> s -> "Found: " + s.data().getName();
    case ApiResult.Failure<User> f -> "Error: " + f.error();
};`,
      followUp: [
        { question: 'What is the difference between sealed classes and enums?', answer: `Enums: All instances are singletons, cannot have different field structures per variant (well, technically they can via abstract methods but it's clunky), always a VALUE type with no generics. Sealed classes: Each subtype is a full class — can have different constructors, fields, generics, and behavior. Records as sealed subtypes = perfect combination. Use enum when you need a small, fixed set of constants (NORTH/SOUTH/EAST/WEST). Use sealed classes when subtypes need different data structures (CreditCard has cardNumber, UPI has upiId).` },
        { question: 'What does "permits" do if I don\'t specify it?', answer: `If you mark a class as sealed but don't use permits, the compiler infers the permitted subtypes from the same compilation unit (same file or same package with Java 16 preview). In Java 17, the explicit permits clause is required for classes in different files. Always specify permits explicitly for clarity — don't rely on inference.` },
      ],
      tip: 'Sealed classes + Records + Pattern Matching switch = the "modern Java" trifecta. Together they enable exhaustive type-safe modeling without boilerplate.',
    },

    {
      id: 14,
      question: 'What is Pattern Matching for instanceof in Java 16? How does it reduce boilerplate?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java 17', 'Pattern Matching', 'instanceof'],
      answer: `Pattern matching for instanceof eliminates the explicit cast after an instanceof check. Before Java 16, you'd check the type and then immediately cast — which was repetitive.

Java 16 finalized this feature. The pattern variable is automatically scoped — it's only in scope where the compiler can prove the test was true.

Benefits:
— Eliminates "check and cast" boilerplate
— Reduces chance of ClassCastException
— Makes code more readable
— Compiler ensures pattern variable is only used when safe

Java 21 extended this to switch statements (Pattern Matching for switch).`,
      code: `// Before Java 16 — verbose and repetitive
Object obj = getShape();
if (obj instanceof Circle) {
    Circle c = (Circle) obj;  // redundant cast!
    System.out.println("Circle radius: " + c.getRadius());
} else if (obj instanceof Rectangle) {
    Rectangle r = (Rectangle) obj;  // redundant cast!
    System.out.println("Rectangle area: " + r.getWidth() * r.getHeight());
}

// Java 16+ — pattern variable declared inline
Object obj = getShape();
if (obj instanceof Circle c) {         // c is Circle, no explicit cast
    System.out.println("Circle radius: " + c.getRadius());
} else if (obj instanceof Rectangle r) {
    System.out.println("Rectangle area: " + r.getWidth() * r.getHeight());
}

// Can combine with && for guard conditions
if (obj instanceof String s && s.length() > 5) {
    System.out.println("Long string: " + s.toUpperCase());
}

// Pattern variable scope — compiler enforces safety
if (!(obj instanceof String s)) {
    return;  // early exit if not String
}
// s IS in scope here — compiler knows we didn't return
System.out.println(s.toUpperCase());

// Production: equals() implementation (classic use case)
public record Point(int x, int y) {
    @Override
    public boolean equals(Object obj) {
        return obj instanceof Point p && x == p.x && y == p.y;
    }
}

// Java 21: Pattern Matching for switch
double area = switch (shape) {
    case Circle c       -> Math.PI * c.radius() * c.radius();
    case Rectangle r    -> r.width() * r.height();
    case Triangle t     -> 0.5 * t.base() * t.height();
    case null           -> throw new NullPointerException("Shape is null");
};`,
      followUp: [
        { question: 'What is the scope of the pattern variable?', answer: `The pattern variable is in scope only where the compiler can prove the type test succeeded. In "if (obj instanceof String s) { // s in scope } else { // s NOT in scope }". With negation: "if (!(obj instanceof String s)) { return; } // s IS in scope after the if block because we know we didn't return". The compiler tracks the scope through the control flow.` },
      ],
      tip: 'Pattern matching for instanceof combines the type check and cast into one step — the pattern variable is automatically typed without an explicit cast.',
    },

    // ═══════════════════════════════════════════════════
    //  JAVA 21  (Released September 2023 — LTS)
    // ═══════════════════════════════════════════════════

    {
      id: 15,
      question: 'Java 21 Overview — What are the key features? Why is it the most exciting LTS in years?',
      difficulty: 'beginner',
      asked: true,
      tags: ['Java 21', 'LTS', 'Overview', 'Virtual Threads'],
      answer: `Java 21 (September 2023) is an LTS release and the most significant since Java 8. It finalizes several major features from Project Loom (concurrency) and Project Amber (language).

Key finalized features:
— Virtual Threads (Project Loom) — massive scalability improvement
— Sequenced Collections — consistent ordering for collections
— Record Patterns — extends pattern matching to records
— Pattern Matching for switch — exhaustive switch on types
— String Templates (preview — Java 21)
— Structured Concurrency (preview)

Why it's significant:
Virtual Threads alone can change how Java microservices are written. A Tomcat server can handle 10x more concurrent requests with virtual threads — without changing application code.

Enterprise trajectory:
Spring Boot 3.2+ supports virtual threads natively. For new projects in 2024+, Java 21 is the recommended LTS. Payara, JBoss, and other Jakarta EE servers support Java 21.`,
      code: `// Java 21: Virtual Threads — one line change!
// Old Tomcat thread pool (limited to ~200 platform threads)
// New: Virtual Thread per request
SpringApplication.run(MyApp.class, args);
// In application.properties:
// spring.threads.virtual.enabled=true
// That's it! No code changes needed.

// Sequenced Collections — new interface in Java 21
List<String> list = new ArrayList<>(List.of("a", "b", "c", "d"));
String first = list.getFirst();  // new — no more list.get(0)
String last  = list.getLast();   // new — no more list.get(list.size()-1)
list.addFirst("z");              // new
list.addLast("e");               // new
list.removeFirst();              // new
List<String> reversed = list.reversed(); // new — reversed view

// Record Patterns (Java 21)
record Point(int x, int y) {}
record Line(Point start, Point end) {}

Object obj = new Line(new Point(0, 0), new Point(3, 4));
if (obj instanceof Line(Point(var x1, var y1), Point(var x2, var y2))) {
    double length = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
    System.out.println("Line length: " + length);  // 5.0
}`,
      tip: 'Virtual Threads are the headline Java 21 feature. One-liner for Spring Boot: spring.threads.virtual.enabled=true. Know the difference between Virtual Threads and Platform Threads.',
    },

    {
      id: 16,
      question: 'What are Virtual Threads in Java 21? How do they solve the thread-per-request problem?',
      difficulty: 'advanced',
      asked: true,
      tags: ['Java 21', 'Virtual Threads', 'Project Loom', 'Concurrency', 'Scalability'],
      answer: `Virtual Threads (Project Loom) are lightweight threads managed by the JVM — not the OS. They solve the fundamental scalability problem of traditional Java servers.

Traditional Platform Threads:
— Each Java thread maps 1:1 to an OS thread
— OS thread = 1MB+ stack memory
— Context switching between OS threads is expensive
— Typical server: limited to ~200-500 concurrent threads
— Thread BLOCKS during I/O (database, HTTP calls) — wastes CPU

Virtual Threads:
— Managed by JVM, not OS — much lighter (a few KB)
— Millions of virtual threads possible
— Mapped to a small pool of carrier (platform) threads
— When a virtual thread BLOCKS (I/O), JVM unmounts it, carrier thread does other work
— I/O blocking is CHEAP — virtual thread is parked, not wasting an OS thread

Impact: A server that handles 200 concurrent requests with platform threads can handle 100,000+ with virtual threads — same code, same blocking style.

This is the key insight: Virtual threads let you write simple blocking code that scales like reactive/async code.`,
      code: `// Platform threads — limited, expensive
Thread platformThread = new Thread(() -> {
    // This thread holds an OS thread — expensive!
    User user = db.findUser(id);          // blocks OS thread
    Order order = orderApi.fetch(userId); // blocks OS thread
    process(user, order);
});
platformThread.start();

// Virtual threads — lightweight, scalable
Thread virtualThread = Thread.ofVirtual().start(() -> {
    // When this blocks on I/O, JVM parks it — carrier thread is freed!
    User user = db.findUser(id);          // carrier thread reused while waiting
    Order order = orderApi.fetch(userId); // carrier thread reused while waiting
    process(user, order);
});

// ExecutorService with virtual threads
try (ExecutorService exec = Executors.newVirtualThreadPerTaskExecutor()) {
    // Spawn 100,000 virtual threads — no problem!
    List<Future<String>> futures = IntStream.range(0, 100_000)
        .mapToObj(i -> exec.submit(() -> {
            Thread.sleep(1000);  // blocking sleep is fine in virtual thread
            return "Task " + i + " done";
        }))
        .collect(Collectors.toList());

    futures.forEach(f -> {
        try { System.out.println(f.get()); }
        catch (Exception e) { e.printStackTrace(); }
    });
}  // auto-close: ExecutorService shuts down after all tasks complete

// Spring Boot 3.2+: enable virtual threads
// application.properties:
// spring.threads.virtual.enabled=true
// This makes Tomcat use virtual threads per request — one line change!

// What DOESN'T work well with virtual threads:
// 1. CPU-intensive tasks (compute-bound — not I/O bound)
//    Virtual threads shine for I/O. For CPU work, use platform thread pools.
// 2. Synchronized blocks with I/O inside (thread pinning — JDK 21 limitation)
//    Virtual thread is PINNED to carrier thread during synchronized block.
//    Use ReentrantLock instead of synchronized.
// 3. ThreadLocal state management (if pool-sized assumptions)

// Avoid synchronized + I/O (pinning)
synchronized (lock) {
    db.save(entity);  // BAD — virtual thread is pinned here in Java 21
}

// Use ReentrantLock instead
lock.lock();
try {
    db.save(entity);  // GOOD — virtual thread can yield to carrier
} finally {
    lock.unlock();
}`,
      followUp: [
        { question: 'What is thread pinning in Virtual Threads?', answer: `Thread pinning: A virtual thread is "pinned" to its carrier platform thread when it's inside a synchronized block OR a native method. During pinning, the carrier thread CANNOT be shared with other virtual threads — defeating the purpose of virtual threads. In Java 21, this is a known limitation. Fix: Replace synchronized blocks with ReentrantLock (which is virtual-thread-friendly). Java 22+ has improved synchronized to reduce pinning.` },
        { question: 'Should I always use Virtual Threads? When are Platform Threads better?', answer: `Use Virtual Threads for: I/O-bound workloads (REST APIs, database calls, Kafka consumers), server applications handling many concurrent requests. Use Platform Threads for: CPU-intensive tasks (compression, encryption, image processing) — virtual threads bring no benefit since they're not blocked on I/O; parallel computation with ForkJoinPool. Rule: If your thread spends most time WAITING (I/O), use virtual. If it spends most time COMPUTING, use platform threads.` },
        { question: 'What is Structured Concurrency in Java 21?', answer: `A preview feature that treats multiple concurrent tasks as a unit. Instead of managing individual futures, you group related tasks: try (var scope = new StructuredTaskScope.ShutdownOnFailure()) { Future<User> user = scope.fork(() -> fetchUser(id)); Future<Order> order = scope.fork(() -> fetchOrder(id)); scope.join(); scope.throwIfFailed(); // process user.resultNow() and order.resultNow() } If either task fails, the other is cancelled. This prevents orphaned threads — a key problem with unstructured CompletableFuture chains.` },
      ],
      tip: 'Virtual Threads shine for I/O-bound work. The key insight: blocking is now CHEAP. Don\'t use virtual threads for CPU-intensive tasks — they don\'t help there.',
    },

    {
      id: 17,
      question: 'What are Sequenced Collections in Java 21?',
      difficulty: 'intermediate',
      tags: ['Java 21', 'Sequenced Collections', 'Collections API'],
      answer: `Java 21 added three new interfaces to the collections hierarchy to provide consistent access to the first and last elements across different collection types.

Problem before Java 21: No consistent way to get first/last element:
— List: list.get(0), list.get(list.size()-1)
— Deque: deque.peekFirst(), deque.peekLast()
— SortedSet: sortedSet.first(), sortedSet.last()
— No common API — had to know the specific type

New interfaces:
— SequencedCollection<E>: Collection with defined encounter order
— SequencedSet<E>: SequencedCollection with no duplicates
— SequencedMap<K,V>: Map with defined encounter order for entries

New methods: getFirst(), getLast(), addFirst(), addLast(), removeFirst(), removeLast(), reversed()`,
      code: `// Java 21: Sequenced Collections
List<String> list = new ArrayList<>(List.of("a", "b", "c", "d"));

// Before Java 21 — inconsistent and verbose
String first = list.get(0);
String last  = list.get(list.size() - 1);

// Java 21 — consistent API
String first = list.getFirst();  // "a"
String last  = list.getLast();   // "d"

list.addFirst("z");   // ["z", "a", "b", "c", "d"]
list.addLast("e");    // ["z", "a", "b", "c", "d", "e"]
list.removeFirst();   // removes "z"
list.removeLast();    // removes "e"

// reversed() — returns a REVERSED VIEW (not a copy)
List<String> reversed = list.reversed();
System.out.println(reversed.getFirst());  // "d" (was last)

// Works on LinkedHashSet too!
LinkedHashSet<String> set = new LinkedHashSet<>(Set.of("x", "y", "z"));
String setFirst = set.getFirst();
String setLast  = set.getLast();

// LinkedHashMap — SequencedMap
LinkedHashMap<String, Integer> map = new LinkedHashMap<>();
map.put("a", 1); map.put("b", 2); map.put("c", 3);

Map.Entry<String, Integer> firstEntry = map.firstEntry();  // {a=1}
Map.Entry<String, Integer> lastEntry  = map.lastEntry();   // {c=3}
map.putFirst("z", 0);   // insert at beginning
SequencedMap<String, Integer> reversedMap = map.reversed();`,
      tip: 'Sequenced Collections unify first/last access across List, Deque, LinkedHashSet, LinkedHashMap. reversed() returns a VIEW — modifications to the view affect the original.',
    },

    // ═══════════════════════════════════════════════════
    //  COMPARISONS
    // ═══════════════════════════════════════════════════

    {
      id: 18,
      question: 'Java 8 vs Java 17 vs Java 21 — Create a comparison of major improvements.',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java 8', 'Java 17', 'Java 21', 'Comparison'],
      answer: `Here's a structured comparison across key dimensions:

LANGUAGE FEATURES:
Java 8:  Lambda, Stream, Optional, Functional Interfaces
Java 11: var in lambdas, String methods (isBlank, strip, lines, repeat)
Java 17: Records, Sealed Classes, Pattern Matching instanceof, Switch Expressions, Text Blocks
Java 21: Pattern Matching switch, Record Patterns, Sequenced Collections, String Templates (preview)

CONCURRENCY:
Java 8:  CompletableFuture (async pipelines), Parallel Streams
Java 11: No major changes
Java 17: No major changes
Java 21: Virtual Threads (Project Loom) — GAME CHANGER for scalability

DATA MODELING:
Java 8:  POJOs + Lombok for boilerplate reduction
Java 17: Records (built-in immutable data classes, no Lombok needed)
Java 21: Record Patterns (destructure records in pattern matching)

SWITCH:
Java 8:  Traditional switch statement (only int, String, enum)
Java 14: Switch expression (yields values, arrow syntax) — finalized
Java 21: Pattern Matching switch (match on types, guards, exhaustiveness)

APIS:
Java 8:  Stream API, Date/Time API, Optional
Java 11: HttpClient, String methods, Files.readString/writeString
Java 17: Enhanced RandomGenerator, Stronger JDK encapsulation
Java 21: SequencedCollection, FFM API (preview), Vector API (incubator)

PERFORMANCE:
Java 8:  G1GC became default (Java 9)
Java 11: Epsilon GC (no-op for benchmarks), ZGC (experimental)
Java 17: ZGC production-ready, G1GC improvements
Java 21: Virtual Threads (massive throughput), Generational ZGC`,
      code: `// Side-by-side code comparison

// 1. IMMUTABLE DATA CLASS
// Java 8 (with Lombok):
@Value
public class UserDTO { Long id; String name; String email; }

// Java 17+ (Record):
public record UserDTO(Long id, String name, String email) {}

// 2. TYPE-SAFE SHAPE PROCESSING
// Java 8:
if (shape instanceof Circle) {
    Circle c = (Circle) shape;       // manual cast
    return Math.PI * c.getRadius() * c.getRadius();
} else if (shape instanceof Rectangle) {
    Rectangle r = (Rectangle) shape; // manual cast
    return r.getWidth() * r.getHeight();
}

// Java 21:
return switch (shape) {
    case Circle c    -> Math.PI * c.radius() * c.radius();
    case Rectangle r -> r.width() * r.height();
};  // compiler ensures exhaustiveness with sealed classes!

// 3. HIGH-CONCURRENCY SERVER
// Java 8-17: Thread pool (limited to ~200 threads):
@Bean
public ExecutorService executorService() {
    return Executors.newFixedThreadPool(200);
}

// Java 21: Virtual threads (millions of threads):
// application.properties: spring.threads.virtual.enabled=true
// No code changes — Tomcat uses virtual threads automatically`,
      followUp: [
        { question: 'If you are starting a new project today, which Java version would you recommend?', answer: `Java 21 for new projects. Reasons: (1) LTS — supported until 2028+. (2) Virtual threads for high-concurrency microservices. (3) Records eliminate DTO boilerplate — no need for Lombok for data classes. (4) Sealed classes for better domain modeling. (5) Pattern matching switch for cleaner business logic. (6) Spring Boot 3.2+ supports Java 21 fully including virtual threads. If the project must use Spring Boot 2.x: Java 17 (it's the maximum supported). If legacy constraints force Java 11: upgrade ASAP, Java 11 is end of free support for Oracle.` },
      ],
      tip: 'Key interview answer: "Java 21 for new projects — Virtual Threads + Records + Sealed Classes + Pattern Matching make it the most productive Java version ever."',
    },

    {
      id: 19,
      question: 'Virtual Threads vs CompletableFuture vs Reactive (WebFlux) — When to use which?',
      difficulty: 'advanced',
      asked: true,
      tags: ['Java 21', 'Virtual Threads', 'CompletableFuture', 'Reactive', 'Architecture'],
      answer: `Three approaches to async/concurrent Java — each suited for different problems:

TRADITIONAL BLOCKING + VIRTUAL THREADS (Java 21):
— Write simple blocking code, get async scalability for free
— Best for: NEW microservices with Java 21, REST APIs, Kafka consumers
— Readable and debuggable — stack traces are normal
— Works with JDBC, Hibernate, Spring JDBC out of the box
— NOT reactive — just very cheap blocking

COMPLETABLEFUTURE (Java 8+):
— Explicit async pipeline, callback-based
— Best for: Combining multiple async calls (allOf, anyOf), conditional async flows
— Works on any Java 8+ version
— Stack traces are harder to read (deep in async chains)
— Requires careful exception handling

REACTIVE (Project Reactor / WebFlux):
— True reactive streams — backpressure support
— Best for: Streaming data (SSE, WebSockets), integrating with reactive databases (R2DBC)
— Steep learning curve — Mono/Flux mental model
— Full backpressure propagation
— Highest complexity — harder to debug, test, and maintain

Recommendation matrix:
┌──────────────────────────────┬─────────────────────────┐
│ Scenario                     │ Recommended Approach    │
├──────────────────────────────┼─────────────────────────┤
│ New REST API, Java 21        │ Virtual Threads         │
│ Existing Java 8 async API    │ CompletableFuture       │
│ SSE / WebSocket streaming    │ Reactive (WebFlux)      │
│ Kafka consumers              │ Virtual Threads         │
│ High-throughput pipelines    │ Reactive (WebFlux)      │
│ Simple microservice          │ Virtual Threads         │
│ Combine 3 parallel API calls │ CompletableFuture/allOf │
└──────────────────────────────┴─────────────────────────┘`,
      code: `// Scenario: Fetch user + orders + notifications for a dashboard

// APPROACH 1: Virtual Threads (Java 21) — simplest, blocking style
@GetMapping("/dashboard/{userId}")
public DashboardDTO getDashboard(@PathVariable Long id) {
    try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
        var user  = scope.fork(() -> userService.findUser(id));
        var orders = scope.fork(() -> orderService.findByUser(id));
        var notifs = scope.fork(() -> notifService.findUnread(id));

        scope.join().throwIfFailed();
        return new DashboardDTO(user.resultNow(), orders.resultNow(), notifs.resultNow());
    }
}

// APPROACH 2: CompletableFuture (Java 8+) — explicit async
@GetMapping("/dashboard/{userId}")
public CompletableFuture<DashboardDTO> getDashboard(@PathVariable Long id) {
    CompletableFuture<User> userCF   = CompletableFuture.supplyAsync(() -> userService.findUser(id));
    CompletableFuture<List<Order>> ordersCF = CompletableFuture.supplyAsync(() -> orderService.findByUser(id));
    CompletableFuture<List<Notification>> notifsCF = CompletableFuture.supplyAsync(() -> notifService.findUnread(id));

    return CompletableFuture.allOf(userCF, ordersCF, notifsCF)
        .thenApply(v -> new DashboardDTO(userCF.join(), ordersCF.join(), notifsCF.join()));
}

// APPROACH 3: Reactive WebFlux (Project Reactor) — full reactive
@GetMapping("/dashboard/{userId}")
public Mono<DashboardDTO> getDashboard(@PathVariable Long id) {
    return Mono.zip(
        userService.findUserReactive(id),
        orderService.findByUserReactive(id).collectList(),
        notifService.findUnreadReactive(id).collectList()
    ).map(tuple -> new DashboardDTO(tuple.getT1(), tuple.getT2(), tuple.getT3()));
}`,
      tip: 'Key message: Virtual Threads simplify async — write blocking code, get async scalability. CompletableFuture is for explicit async pipelines. Reactive is for streaming/backpressure scenarios.',
    },

    // ═══════════════════════════════════════════════════
    //  PRODUCTION SCENARIOS
    // ═══════════════════════════════════════════════════

    {
      id: 20,
      question: 'How would you design a high-concurrency REST API using Java 21 Virtual Threads?',
      difficulty: 'advanced',
      asked: true,
      tags: ['Java 21', 'Virtual Threads', 'Production', 'REST API', 'Performance'],
      answer: `Banking/e-commerce APIs need to handle thousands of concurrent requests. Classic approach: thread pool of 200 threads + async programming. Java 21 approach: Virtual thread per request — simpler and more scalable.

Architecture for a high-concurrency order processing API:

1. Enable Virtual Threads in Spring Boot 3.2+
2. Use blocking JDBC (Hibernate) — virtual threads make blocking cheap
3. Use thread-local (or ScopedValue — Java 21 preview) for context propagation
4. Avoid synchronized blocks with I/O — use ReentrantLock
5. Database connection pool (HikariCP) — virtual threads wait on pool, don't waste OS threads
6. Monitor with Java Flight Recorder

Key insight: With virtual threads, HikariCP pool of 20 connections can serve thousands of concurrent virtual threads — they queue and wait, but the OS only sees 20 active threads.`,
      code: `// 1. application.properties — one line to enable
spring.threads.virtual.enabled=true

// 2. HikariCP pool — SMALLER is better with virtual threads!
spring.datasource.hikari.maximum-pool-size=20  // not 200!
// Virtual threads queue up efficiently — 20 DB connections serve thousands of VT

// 3. ReentrantLock instead of synchronized
@Service
public class OrderService {
    private final ReentrantLock inventoryLock = new ReentrantLock();

    public Order placeOrder(OrderRequest req) {
        inventoryLock.lock();  // virtual thread-friendly
        try {
            // Check and reserve inventory atomically
            Product product = productRepo.findById(req.productId())
                .orElseThrow(ProductNotFoundException::new);

            if (product.getStock() < req.quantity())
                throw new InsufficientStockException();

            product.setStock(product.getStock() - req.quantity());
            productRepo.save(product);

            Order order = new Order(req, OrderStatus.PENDING);
            Order saved = orderRepo.save(order);

            // Async notifications (non-blocking)
            notificationService.notifyAsync(saved);
            return saved;
        } finally {
            inventoryLock.unlock();
        }
    }
}

// 4. Parallel I/O with StructuredTaskScope (Java 21 preview)
@GetMapping("/checkout/{orderId}")
public CheckoutDTO getCheckout(@PathVariable Long orderId) throws Exception {
    try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
        var orderFuture   = scope.fork(() -> orderRepo.findById(orderId).orElseThrow());
        var paymentFuture = scope.fork(() -> paymentService.getPaymentStatus(orderId));
        var shippingFuture = scope.fork(() -> shippingService.getStatus(orderId));

        scope.join().throwIfFailed();  // fails fast if any task throws

        return new CheckoutDTO(
            orderFuture.resultNow(),
            paymentFuture.resultNow(),
            shippingFuture.resultNow()
        );
    }
}

// 5. Load test results comparison (same hardware):
// Platform threads (200 pool): ~2,000 req/sec, 200 concurrent
// Virtual threads:             ~15,000 req/sec, 50,000+ concurrent`,
      tip: 'With virtual threads, reduce HikariCP pool size — you don\'t need 200 connections. 20-50 connections serve thousands of virtual threads efficiently.',
    },

    {
      id: 21,
      question: 'How do you use Records as DTOs in a Spring Boot REST API? What are the gotchas?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java 17', 'Records', 'Spring Boot', 'REST API', 'DTOs'],
      answer: `Records are ideal for DTOs — they're immutable, have equals/hashCode/toString auto-generated, and require zero boilerplate.

Benefits for REST APIs:
— Replace request/response POJO classes
— Work with Jackson 2.12+ for JSON serialization
— Perfect for read-only response objects
— Can be used with Spring Data projections

Gotchas:
1. Jackson: Use Jackson 2.12+ or add @JsonProperty if field names differ
2. Validation: Use @Valid with @NotNull, @NotBlank etc — works on record components
3. No default constructor: Jackson needs @JsonCreator or Jackson 2.12+
4. Accessor names: name() not getName() — some older tools expect getX()`,
      code: `// Request record — with validation
public record CreateUserRequest(
    @NotBlank(message = "Name is required")
    String name,

    @Email(message = "Invalid email format")
    @NotBlank
    String email,

    @Min(value = 18, message = "Must be 18 or older")
    int age
) {}

// Response record — clean DTO
public record UserResponse(
    Long id,
    String name,
    String email,
    LocalDate createdDate
) {
    // Factory method from entity
    public static UserResponse from(User user) {
        return new UserResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getCreatedAt().toLocalDate()
        );
    }
}

// Controller
@RestController
@RequestMapping("/api/users")
public class UserController {

    @PostMapping
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody CreateUserRequest request) {
        User saved = userService.create(request.name(), request.email(), request.age());
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(UserResponse.from(saved));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        return userService.findById(id)
            .map(UserResponse::from)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}

// Paginated response with Records
public record PagedResponse<T>(
    List<T> content,
    int page,
    int size,
    long totalElements,
    int totalPages
) {
    public static <T> PagedResponse<T> from(Page<T> page) {
        return new PagedResponse<>(
            page.getContent(), page.getNumber(),
            page.getSize(), page.getTotalElements(),
            page.getTotalPages()
        );
    }
}`,
      tip: 'Records + Spring Boot 3.x = perfect for DTOs. Use compact constructors for validation. Use static factory methods like UserResponse.from(entity) for clean mapping.',
    },

    // ═══════════════════════════════════════════════════
    //  COMMON INTERVIEW TRAPS & REVISION
    // ═══════════════════════════════════════════════════

    {
      id: 22,
      question: 'Common Java version interview traps and mistakes — What should you avoid saying?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Interview Tips', 'Java 8', 'Java 17', 'Java 21', 'Traps'],
      answer: `Here are the classic mistakes that show shallow knowledge:

TRAP 1: "this" in lambdas
❌ Wrong: "this refers to the lambda itself"
✅ Right: "this refers to the ENCLOSING class instance — unlike anonymous inner classes"

TRAP 2: Optional.get() without check
❌ Wrong: Optional<User> opt = ...; User u = opt.get();
✅ Right: Always use orElse(), orElseGet(), orElseThrow(), or ifPresent()

TRAP 3: Record accessor names
❌ Wrong: "I call getName() on a record"
✅ Right: "Record accessors match component names: name(), not getName()"

TRAP 4: Streams are reusable
❌ Wrong: "I can call collect() twice on the same stream"
✅ Right: "Streams can only be consumed once — second terminal op throws IllegalStateException"

TRAP 5: Virtual threads replace thread pools everywhere
❌ Wrong: "I should always use virtual threads instead of thread pools"
✅ Right: "Virtual threads shine for I/O-bound tasks. CPU-intensive work still uses platform thread pools. Never use virtual threads for CPU-bound computation."

TRAP 6: Sealed classes are like enums
❌ Wrong: "Sealed classes are just better enums"
✅ Right: "Sealed classes restrict subtyping hierarchy. Unlike enums, each subtype can be a full class with different constructors and fields. Records as sealed subtypes = best combination."

TRAP 7: orElse() vs orElseGet()
❌ Wrong: "They're the same — just different syntax"
✅ Right: "orElse() evaluates EAGERLY — always. orElseGet() is LAZY — only called if Optional is empty. For expensive defaults (DB calls), always use orElseGet()."

RAPID REVISION CHECKLIST:
— Java 8:  Lambda, FunctionalInterface, Stream API, Optional, Date/Time, CompletableFuture
— Java 11: String methods (isBlank, strip, lines, repeat), HttpClient, var in lambda
— Java 17: Records, Sealed Classes, Pattern Matching instanceof, Switch Expression, Text Blocks
— Java 21: Virtual Threads, Sequenced Collections, Record Patterns, Pattern Matching switch`,
      code: `// TRAP DEMONSTRATIONS

// 1. this in lambda vs anonymous class
class Service {
    String name = "MyService";

    Runnable lambdaExample = () ->
        System.out.println(this.name);  // "MyService" — enclosing class

    Runnable anonExample = new Runnable() {
        String name = "AnonClass";
        public void run() {
            System.out.println(this.name);  // "AnonClass" — the anonymous class
        }
    };
}

// 2. orElse ALWAYS evaluates
User user = optionalUser.orElse(expensiveUserCreation()); // expensiveUserCreation() CALLED EVERY TIME!
User user = optionalUser.orElseGet(() -> expensiveUserCreation()); // ONLY called if empty

// 3. Stream reuse
Stream<Integer> stream = list.stream().filter(n -> n > 0);
long count = stream.count();          // OK — first terminal op
List<Integer> list2 = stream.collect(...); // IllegalStateException!

// 4. Record accessors
record User(String name, int age) {}
User u = new User("Alice", 30);
u.name();  // CORRECT — component name
u.age();   // CORRECT
// u.getName(); // WRONG — records don't generate getX() methods

// 5. Virtual threads — don't use for CPU work
// BAD: Using VT for CPU-intensive compression
ExecutorService vtExec = Executors.newVirtualThreadPerTaskExecutor();
vtExec.submit(() -> compressLargeFile(file));  // VT doesn't help — CPU bound!

// GOOD: Regular thread pool for CPU work
ExecutorService cpuPool = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors());
cpuPool.submit(() -> compressLargeFile(file));  // Matches CPU cores`,
      tip: 'The #1 interview differentiator: show you know the WHY behind each feature, not just the syntax. "Records were introduced to eliminate POJO boilerplate for immutable data" beats just writing the syntax.',
    },

    {
      id: 23,
      question: 'Rapid Revision — 5-minute cheat sheet for Java version interview questions',
      difficulty: 'beginner',
      tags: ['Revision', 'Java 8', 'Java 11', 'Java 17', 'Java 21', 'Cheat Sheet'],
      answer: `━━━ JAVA 8 (2014, LTS) — Foundation ━━━
Lambda:           (a, b) -> a + b
Functional IF:    Predicate<T>, Function<T,R>, Consumer<T>, Supplier<T>
Method Ref:       String::toUpperCase, System.out::println, ArrayList::new
Streams:          .filter().map().sorted().collect(Collectors.toList())
Optional:         .orElse() .orElseGet() .orElseThrow() .ifPresent() .map()
Date/Time:        LocalDate, LocalDateTime, ZonedDateTime, Instant, Duration, Period
CompletableFuture: .supplyAsync().thenApply().thenCompose().allOf().exceptionally()
Default Methods:  Solve interface evolution without breaking implementations
Gotcha:           Streams consumed once; orElse() eagerly evaluated; lambda "this" = enclosing class

━━━ JAVA 11 (2018, LTS) — Quality of Life ━━━
String:           isBlank(), strip(), stripLeading(), stripTrailing(), lines(), repeat(n)
HttpClient:       Built-in HTTP/2, sync+async, replaces HttpURLConnection
var in lambda:    (@NonNull var s) -> s.toUpperCase() — for annotations on parameters
Files:            Files.readString(path), Files.writeString(path, content)
List.of:          Immutable factory methods (Java 9)  List.of("a","b","c")
Gotcha:           strip() is Unicode-aware; trim() is not. Use strip() always.

━━━ JAVA 17 (2021, LTS) — Modern Java ━━━
Records:          public record UserDTO(Long id, String name) {} — auto equals/hashCode/toString
Sealed Classes:   sealed interface Shape permits Circle, Rectangle — closed hierarchy
Pattern Matching: if (obj instanceof String s) { use s directly — no cast }
Switch Expression: return switch(day) { case MONDAY -> 1; case TUESDAY -> 2; };
Text Blocks:      String sql = """ SELECT * FROM users """;
Gotcha:           Record accessors = name() not getName(); Records are final (no extension)

━━━ JAVA 21 (2023, LTS) — Game Changer ━━━
Virtual Threads:  Thread.ofVirtual().start(task); millions possible, managed by JVM
VT Enable:        spring.threads.virtual.enabled=true (Spring Boot 3.2+)
Sequenced Coll:   list.getFirst(), list.getLast(), list.reversed()
Record Patterns:  if (obj instanceof Line(Point(var x,var y), Point end)) — destructure
Pattern Match sw: switch(shape) { case Circle c -> ...; case Rectangle r -> ...; }
Gotcha:           VT + synchronized = pinning; use ReentrantLock. VT for I/O, not CPU.

━━━ LTS TIMELINE ━━━
Java 8  (Mar 2014) — Still dominant (~40% enterprise)
Java 11 (Sep 2018) — Most common LTS after Java 8 (~25%)
Java 17 (Sep 2021) — Spring Boot 3.x minimum
Java 21 (Sep 2023) — Recommended for new projects
Java 25 (Sep 2025) — Next LTS (forthcoming)`,
      code: `// Quick reference code snippets

// Java 8 — Stream pipeline
List<String> names = employees.stream()
    .filter(e -> e.getSalary() > 50000)
    .map(Employee::getName)
    .sorted()
    .collect(Collectors.toList());

// Java 17 — Record + Sealed
sealed interface Result<T> permits Result.Ok, Result.Err {
    record Ok<T>(T value) implements Result<T> {}
    record Err<T>(String message) implements Result<T> {}
}
// Usage:
Result<User> result = findUser(id);
String msg = switch (result) {
    case Result.Ok<User>(var u) -> "Found: " + u.name();
    case Result.Err<User>(var m) -> "Error: " + m;
};

// Java 21 — Virtual threads
try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10_000)
        .forEach(i -> exec.submit(() -> processTask(i)));
}  // waits for all tasks

// Spring Boot 3.2 + Java 21
// application.properties:
// spring.threads.virtual.enabled=true
// spring.datasource.hikari.maximum-pool-size=20`,
      tip: 'For experienced developers (3-7 yrs): The expectation is you know Java 8 thoroughly, are aware of Java 11/17 improvements, and can discuss Virtual Threads impact on microservices architecture.',
    },
  ],
}

export default javaVersions
