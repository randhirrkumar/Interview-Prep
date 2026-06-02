const javaVersions = {
  title: 'Java Versions 8 → 21',
  description: 'Interview-ready answers for every Java 8, 11, 17, and 21 feature — written the way you\'d actually speak in an interview.',
  tags: ['Java 8', 'Java 11', 'Java 17', 'Java 21', 'Lambda', 'Records', 'Virtual Threads', 'Sealed Classes', 'Pattern Matching'],
  questions: [

    // ═══════════════════════════════════
    //  JAVA 8
    // ═══════════════════════════════════

    {
      id: 1,
      question: 'What are the key features introduced in Java 8?',
      difficulty: 'beginner',
      asked: true,
      tags: ['Java 8', 'Overview'],
      answer: `Java 8 was released in March 2014 and it's honestly the most impactful Java release since Java 5. It completely changed the way we write Java code by bringing in functional programming.

The main features are:
1. Lambda Expressions — anonymous functions, makes code much shorter
2. Functional Interfaces — Predicate, Function, Consumer, Supplier from java.util.function
3. Method References — shorthand for lambdas that just call one method
4. Stream API — functional-style pipeline for processing collections
5. Optional — wrapper to avoid NullPointerException
6. New Date/Time API — LocalDate, LocalDateTime, ZonedDateTime — replaces the broken java.util.Date
7. Default and Static methods in interfaces
8. CompletableFuture — async programming without blocking threads

In my daily work, I use streams and lambdas constantly. In my EPLMS project, I used streams to filter and process vehicle events. In MetLife, I used CompletableFuture for async policy processing. Java 8 is still the most asked Java version in interviews because most companies still run it.`,
      code: `// Before Java 8 — verbose anonymous class
List<String> names = Arrays.asList("Charlie", "Alice", "Bob");
Collections.sort(names, new Comparator<String>() {
    @Override
    public int compare(String a, String b) {
        return a.compareTo(b);
    }
});

// Java 8 — lambda + method reference
names.sort(String::compareTo);

// Before Java 8 — for loop with condition
List<String> result = new ArrayList<>();
for (String name : names) {
    if (name.startsWith("A")) {
        result.add(name.toUpperCase());
    }
}

// Java 8 — clean stream pipeline
List<String> result = names.stream()
    .filter(n -> n.startsWith("A"))
    .map(String::toUpperCase)
    .collect(Collectors.toList());`,
      followUp: [
        { question: 'Why is Java 8 still so widely used?', answer: `Java 8 became an LTS (Long-Term Support) release and Oracle extended free support until December 2030. When it came out, most enterprises migrated to it and it solved enough problems that many teams never felt the urgency to upgrade. The Stream API and lambdas were so big that teams spent years learning and adopting them. Today about 35-40% of enterprise Java is still on Java 8. That's why it's asked in almost every interview.` },
      ],
      tip: 'Java 8 LTS support extended until 2030. Always mention this — it explains why companies are still on Java 8 even though Java 21 is out.',
    },

    {
      id: 2,
      question: 'What is a Lambda Expression in Java 8? Why was it introduced?',
      difficulty: 'beginner',
      asked: true,
      tags: ['Java 8', 'Lambda'],
      answer: `A lambda expression is basically an anonymous function — a block of code without a name that you can pass around like a variable.

Before Java 8, if I wanted to define some behavior to pass to a method — like a sorting rule — I had to write a whole anonymous inner class. It was 5-6 lines for something conceptually simple. Lambdas let me express the same thing in one line.

The syntax is: (parameters) -> expression, or (parameters) -> { statements }

The important thing to remember is that lambdas can only be assigned to a functional interface — an interface with exactly one abstract method. The lambda provides the implementation of that one method.

One key gotcha: "this" inside a lambda refers to the ENCLOSING class, not the lambda itself. This is different from anonymous inner classes where "this" refers to the anonymous class.

Also, lambdas can only use local variables from the outer scope if they are effectively final — meaning they don't change after initialization.`,
      code: `// 1. No parameters
Runnable r = () -> System.out.println("Running");

// 2. Single parameter (parens optional)
Consumer<String> print = name -> System.out.println("Hello, " + name);

// 3. Multiple parameters
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;

// 4. Block body (multiple statements need return)
Comparator<String> byLength = (s1, s2) -> {
    if (s1.length() != s2.length())
        return s1.length() - s2.length();
    return s1.compareTo(s2);
};

// 5. Effectively final — OK
String prefix = "Hello ";  // never re-assigned after this
Consumer<String> greet = name -> System.out.println(prefix + name);

// 6. "this" in lambda refers to enclosing class
class OrderService {
    String serviceName = "OrderService";
    Runnable log = () -> System.out.println(this.serviceName); // "OrderService"
}

// Real usage — sorting employees by salary
employees.sort(Comparator.comparingDouble(Employee::getSalary));`,
      followUp: [
        { question: 'What does "effectively final" mean?', answer: `It means a local variable is never modified after its initial assignment — even without the explicit "final" keyword. The Java compiler enforces this for variables captured inside lambdas. Why? Because a lambda might execute later (maybe asynchronously), and by then the stack frame is gone. So Java needs the captured value to be stable. If you try to change the variable inside or after the lambda, you get: "Variable used in lambda expression should be final or effectively final."` },
        { question: 'What is the difference between a lambda and an anonymous inner class?', answer: `Three key differences: (1) "this" keyword — in lambda, this = enclosing class. In anonymous class, this = the anonymous class instance itself. (2) Compilation — lambdas compile to invokedynamic bytecode, no extra .class file created. Anonymous classes get their own .class file. (3) Scope — lambda doesn't create a new scope, so you can't re-declare variables from the enclosing method. Anonymous class creates its own scope so you can.` },
      ],
      tip: '"this" in lambda = enclosing class. "this" in anonymous class = the anonymous class itself. This distinction comes up in almost every Java 8 interview.',
    },

    {
      id: 3,
      question: 'What are Functional Interfaces? What are the main ones from java.util.function?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java 8', 'Functional Interface', 'Predicate', 'Function', 'Consumer', 'Supplier'],
      answer: `A functional interface is any interface with exactly one abstract method. It's the target type for a lambda or method reference — the lambda provides the implementation of that single abstract method.

The @FunctionalInterface annotation is optional but I always use it because it gives you a compile-time error if you accidentally add a second abstract method. It's like a safety net.

The key ones from java.util.function that I use every day:

Predicate<T> — takes T, returns boolean. I use it in stream.filter(). For example, filtering active users.

Function<T,R> — takes T, returns R. I use it in stream.map(). For example, converting a User entity to a UserDTO.

Consumer<T> — takes T, returns nothing. I use it in stream.forEach() and for logging.

Supplier<T> — takes nothing, returns T. I use it in Optional.orElseGet() for lazy default values.

BiFunction<T,U,R> — takes two inputs, returns R. Useful when your transformation needs two parameters.

In my MetLife project, I built a validation pipeline using Predicate composition — isActive.and(hasEmail).and(isVerified) — and applied it to filter valid policy holders before processing.`,
      code: `// Predicate — test condition
Predicate<User> isActive  = u -> u.getStatus() == Status.ACTIVE;
Predicate<User> hasEmail  = u -> u.getEmail() != null && !u.getEmail().isBlank();
Predicate<User> isValid   = isActive.and(hasEmail);  // compose with and()

List<User> validUsers = users.stream()
    .filter(isValid)
    .collect(Collectors.toList());

// Function — transform
Function<User, UserDTO> toDTO = user ->
    new UserDTO(user.getId(), user.getName(), user.getEmail());

List<UserDTO> dtos = users.stream()
    .map(toDTO)
    .collect(Collectors.toList());

// Function composition — andThen runs left to right
Function<String, Integer> length = String::length;
Function<Integer, String> describe = n -> "Length is " + n;
Function<String, String> combined = length.andThen(describe);
System.out.println(combined.apply("Java")); // "Length is 4"

// Consumer — side effect, no return
Consumer<String> logInfo = msg -> log.info("[INFO] " + msg);
Consumer<String> logAudit = msg -> auditService.log(msg);
Consumer<String> logAll = logInfo.andThen(logAudit); // chain consumers

// Supplier — lazy factory
Supplier<List<String>> emptyList = ArrayList::new;
// Used in Optional.orElseGet — only called if empty
User user = userRepo.findById(id)
    .orElseGet(() -> createDefaultUser()); // lazy — only called if empty`,
      followUp: [
        { question: 'What is the difference between andThen() and compose() in Function?', answer: `andThen(f): applies the current function first, then f. So a.andThen(b) = b(a(x)). compose(f): applies f first, then the current function. So a.compose(b) = a(b(x)). I always use andThen because it reads left to right — "do this, THEN do that." compose is more mathematical and reads inside-out. Example: doubleIt.andThen(addTen).apply(5) → first double to 10, then add 10 → 20.` },
        { question: 'Can a functional interface have default or static methods?', answer: `Yes, it can have any number of default and static methods — they don't count against the "exactly one abstract method" rule. The Predicate interface itself is a perfect example — it has one abstract method test(), but also default methods and(), or(), negate() and a static method not(). The @FunctionalInterface annotation only enforces that there's exactly ONE abstract method.` },
      ],
      tip: 'The four most asked: Predicate (filter), Function (map/transform), Consumer (forEach/side effects), Supplier (lazy factories / orElseGet). Know them cold.',
    },

    {
      id: 4,
      question: 'What are Method References? What are the 4 types?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java 8', 'Method References'],
      answer: `A method reference is a shorthand for a lambda that does nothing but call a single existing method. When my lambda body is just "call this method," I use a method reference instead — it's cleaner and more readable.

The syntax is ClassName::methodName or object::methodName.

There are 4 types:

1. Static method reference — Integer::parseInt, String::valueOf. Equivalent lambda: x -> Integer.parseInt(x)

2. Instance method on arbitrary object of that type — String::toUpperCase. Equivalent lambda: s -> s.toUpperCase(). This is used in stream.map(String::toUpperCase) where each String element has the method called on it.

3. Instance method on a specific object — System.out::println, myList::contains. Here "myList" is a specific instance I already have. Equivalent lambda: x -> myList.contains(x)

4. Constructor reference — ArrayList::new, Employee::new. Equivalent lambda: () -> new ArrayList<>()

In my projects I use method references constantly. String::toUpperCase in map(), System.out::println in forEach(), Collectors.groupingBy(Employee::getDepartment) — all method references.`,
      code: `// 1. Static method reference
// Lambda:           x -> String.valueOf(x)
// Method reference: String::valueOf
List<String> strs = numbers.stream()
    .map(String::valueOf)       // static method on String
    .collect(Collectors.toList());

// 2. Instance method on arbitrary object (type's instance method)
// Lambda:           s -> s.toUpperCase()
// Method reference: String::toUpperCase
List<String> upper = names.stream()
    .map(String::toUpperCase)   // toUpperCase called on each element
    .collect(Collectors.toList());

// 3. Instance method on a specific object
// Lambda:           x -> System.out.println(x)
// Method reference: System.out::println
names.forEach(System.out::println);

Set<String> validNames = new HashSet<>(Arrays.asList("Alice", "Bob"));
// Lambda:           name -> validNames.contains(name)
// Method reference: validNames::contains
List<String> filtered = names.stream()
    .filter(validNames::contains)  // specific object's method
    .collect(Collectors.toList());

// 4. Constructor reference
// Lambda:           () -> new ArrayList<>()
// Method reference: ArrayList::new
Supplier<List<String>> listFactory = ArrayList::new;
List<String> newList = listFactory.get();

// Constructor with parameter:
// Lambda:           name -> new Employee(name)
// Method reference: Employee::new
List<Employee> employees = names.stream()
    .map(Employee::new)
    .collect(Collectors.toList());`,
      followUp: [
        { question: 'When should you use a method reference vs a lambda?', answer: `I use a method reference when the lambda body is ONLY a method call with no extra logic. If the lambda is just x -> x.someMethod() or x -> SomeClass.staticMethod(x), convert it to a method reference — it's cleaner and more readable. But if the lambda has any extra logic — conditions, multiple statements, variable manipulation — keep it as a lambda. Never use a method reference just to look smart if a lambda is clearer.` },
      ],
      tip: 'Type 2 (String::toUpperCase) is the most commonly confused. The method is called on each STREAM ELEMENT as the object — the element IS the receiver.',
    },

    {
      id: 5,
      question: 'What are Default Methods in interfaces? Why were they introduced in Java 8?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java 8', 'Default Methods', 'Interface'],
      answer: `A default method is a method with a concrete implementation defined directly in an interface, using the "default" keyword.

The reason they were introduced is very specific: when the Java team designed the Stream API for Java 8, they needed to add new methods to existing interfaces like Collection, List, and Iterable — methods like forEach(), stream(), and spliterator(). But if you add a new abstract method to an existing interface, you break every class that implements it, because now they all need to implement the new method. That would have broken millions of existing Java programs.

Default methods solve this — you can add new methods to an interface with a default implementation, and existing implementors don't have to change anything. They just inherit the default behavior.

There's a diamond problem if a class implements two interfaces that both have a default method with the same signature. In that case, the class MUST override it. You can still call a specific interface's default using InterfaceName.super.methodName().

One thing I clarify in interviews: default methods can be overridden by implementing classes, and the class always wins over the interface's default.`,
      code: `// Default method in interface
interface Notifiable {
    void sendEmail(String message);  // abstract — must be implemented

    default void sendWithLog(String message) {  // default — optional to override
        System.out.println("Sending: " + message);
        sendEmail(message);
    }

    static Notifiable noOp() {  // static factory method
        return msg -> System.out.println("NO-OP: " + msg);
    }
}

// Implementing class — inherits sendWithLog for free
class EmailService implements Notifiable {
    @Override
    public void sendEmail(String message) {
        // actual email sending logic
    }
    // sendWithLog() inherited, no need to override
}

// Diamond problem — two interfaces with same default method name
interface A { default String hello() { return "Hello from A"; } }
interface B { default String hello() { return "Hello from B"; } }

class C implements A, B {
    @Override
    public String hello() {
        return A.super.hello();  // explicit — resolve diamond
    }
}

// Real Java 8 additions to existing interfaces via default methods:
list.forEach(item -> process(item));           // Iterable.forEach()
list.removeIf(item -> item.isExpired());       // Collection.removeIf()
list.replaceAll(String::toUpperCase);          // List.replaceAll()
map.getOrDefault("key", "fallback");           // Map.getOrDefault()
map.computeIfAbsent("key", k -> new ArrayList<>());  // Map.computeIfAbsent()`,
      followUp: [
        { question: 'What is the difference between default methods and abstract class methods?', answer: `Abstract class can have state (instance fields), constructors, and access modifiers. A class can only extend ONE abstract class. Interface with default methods: no state, no constructors, everything is implicitly public. A class can implement MANY interfaces. Use abstract class when subtypes share state (fields) or you want constructor-based initialization. Use interface with defaults when you want to add reusable behavior that can be mixed into multiple unrelated classes.` },
        { question: 'Can you have static methods in interfaces?', answer: `Yes, since Java 8. Interface static methods work exactly like class static methods — you call them on the interface name directly (e.g., Comparator.naturalOrder(), Notifiable.noOp()). They cannot be overridden or inherited. They're useful as factory methods or utilities closely related to the interface. In Java 9, interfaces can also have private methods, which are used to share helper logic between default methods without exposing it.` },
      ],
      tip: 'The WHY is the most important thing here: default methods were added to allow Java 8 Stream API additions (forEach, stream, spliterator) to existing Collection interfaces without breaking all existing implementations.',
    },

    {
      id: 6,
      question: 'What is Optional in Java 8? Why was it introduced and how do you use it correctly?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java 8', 'Optional', 'NullPointerException'],
      answer: `Optional is a container object that may or may not contain a non-null value. It was introduced to make the "this method might return nothing" case explicit at the API level — instead of returning null and hoping the caller checks it.

Before Optional, you'd return null, the caller might forget to check, and you'd get a NullPointerException at runtime. Optional forces the caller to handle both cases — value present and value absent.

When to use it: Only as a return type of methods that might not return a value. Don't use it as method parameters, and don't use it for fields.

The methods I use most:
- orElse(default) — returns default if empty. But the default is always evaluated even if value is present — so if the default is expensive, use orElseGet.
- orElseGet(() -> compute()) — lazy — only evaluated if empty. I prefer this for DB calls or object creation.
- orElseThrow(() -> new Exception()) — throw if empty. I use this in services when the entity must exist.
- map(f) — transform if present, stays empty if absent.
- ifPresent(consumer) — run action if present.

In my Spring Boot projects, JPA repository methods like findById() return Optional<Entity>. I chain .orElseThrow(() -> new EntityNotFoundException()) in service methods.`,
      code: `// Creating Optional
Optional<String> present = Optional.of("Hello");          // throws NPE if null
Optional<String> maybe   = Optional.ofNullable(getValue()); // safe with null
Optional<String> empty   = Optional.empty();               // explicitly empty

// orElse vs orElseGet — IMPORTANT distinction
User user1 = userRepo.findById(id)
    .orElse(createDefaultUser());  // BAD: createDefaultUser() called ALWAYS, even if found!

User user2 = userRepo.findById(id)
    .orElseGet(() -> createDefaultUser());  // GOOD: only called if empty

// orElseThrow — in service layer
User user = userRepo.findById(id)
    .orElseThrow(() -> new UserNotFoundException("User not found: " + id));

// map — transform if present
String email = userRepo.findById(id)
    .map(User::getEmail)           // if user exists, get email
    .map(String::toLowerCase)      // if email exists, lowercase it
    .orElse("unknown@example.com");

// ifPresent — side effects
userRepo.findById(id)
    .ifPresent(u -> auditLog.record("Accessed user: " + u.getId()));

// Java 9: ifPresentOrElse
userRepo.findById(id)
    .ifPresentOrElse(
        u -> processUser(u),
        () -> log.warn("User not found: " + id)
    );

// Java 9: or() — chain Optional fallbacks
Optional<User> user = userRepo.findByEmail(email)
    .or(() -> userRepo.findByPhone(phone));  // try phone if email fails

// filter — conditional unwrapping
Optional<User> activeUser = userRepo.findById(id)
    .filter(u -> u.getStatus() == Status.ACTIVE);`,
      followUp: [
        { question: 'What is the difference between orElse() and orElseGet()?', answer: `orElse(value): The value is computed EAGERLY — always, regardless of whether Optional is empty or not. If value is an expensive operation like a database call or object construction, it happens every time. orElseGet(Supplier): LAZY — the Supplier is only called when Optional is empty. For constants like orElse("unknown") it doesn't matter. For anything that involves computation — DB call, object creation — always use orElseGet(() -> ...). This is one of the most common Optional mistakes in code reviews.` },
        { question: 'When should you NOT use Optional?', answer: `Three clear cases: (1) Method parameters — it forces callers to wrap values unnecessarily. Just overload the method or accept nullable. (2) Class fields — Optional doesn't serialize well with Jackson or JPA, and it adds overhead. Use @Nullable annotation instead. (3) Collection return types — returning Optional<List<T>> is wrong. An empty list already communicates absence. Return an empty list, never null, never Optional<List>. Optional was designed specifically to signal "this method might not return a value" — use it only for that.` },
      ],
      tip: 'Never use Optional.get() without isPresent() check. It throws NoSuchElementException just like NPE. The whole point of Optional is to use the safe methods: orElse, orElseGet, orElseThrow, ifPresent.',
    },

    {
      id: 7,
      question: 'What is the new Date/Time API in Java 8? How is it better than java.util.Date?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java 8', 'Date/Time API', 'LocalDate', 'LocalDateTime'],
      answer: `The old java.util.Date class was notoriously bad. It was mutable — so not thread-safe, which caused bugs in multi-threaded applications. It had design mistakes like getYear() returning year - 1900 and months being 0-indexed. Calendar was verbose and error-prone. SimpleDateFormat was not thread-safe either — I've seen production bugs caused by sharing a SimpleDateFormat instance across threads.

Java 8 introduced the java.time package — based on Joda-Time — which fixed all of this. All classes are immutable and thread-safe.

The main classes:

LocalDate — date only (2024-01-15), no time, no timezone. I use this for things like policy effective dates, birthdays, deadlines.

LocalTime — time only, no date, no timezone.

LocalDateTime — date + time, but no timezone. I use this for meeting schedules or log timestamps in single-timezone apps.

ZonedDateTime — date + time + timezone. I use this for user-facing timestamps when the app serves multiple timezones.

Instant — a UTC timestamp — just a point on the timeline in seconds + nanoseconds. I use this for storing timestamps in databases — always store as UTC Instant, display in user's timezone.

Duration — amount of time in seconds/nanoseconds. I use this for measuring elapsed time.

Period — amount of time in years/months/days. I use this to calculate age or days between dates.

DateTimeFormatter is immutable and thread-safe — unlike SimpleDateFormat.`,
      code: `// LocalDate — date without time
LocalDate today = LocalDate.now();
LocalDate dob   = LocalDate.of(1995, Month.JULY, 15);
LocalDate next  = today.plusDays(30);  // all operations return NEW objects — immutable

System.out.println(today.getDayOfWeek());  // MONDAY
System.out.println(today.isLeapYear());    // false

// Period — difference in dates
Period age = Period.between(dob, today);
System.out.println(age.getYears() + " years old");

// LocalDateTime
LocalDateTime meeting = LocalDateTime.of(2024, 6, 15, 14, 30);
LocalDateTime extended = meeting.plusHours(2);  // doesn't modify meeting!

// ZonedDateTime — with timezone
ZonedDateTime istTime = ZonedDateTime.now(ZoneId.of("Asia/Kolkata"));
ZonedDateTime utcTime = istTime.withZoneSameInstant(ZoneId.of("UTC"));

// Instant — for DB storage and duration measurement
Instant start = Instant.now();
// ... do work ...
Instant end  = Instant.now();
Duration elapsed = Duration.between(start, end);
System.out.println("Took: " + elapsed.toMillis() + "ms");

// DateTimeFormatter — thread-safe (unlike SimpleDateFormat!)
DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
String formatted = LocalDateTime.now().format(fmt);
LocalDateTime parsed = LocalDateTime.parse("15-01-2024 14:30", fmt);

// Production pattern: store as Instant, display in user timezone
@Entity
class AuditLog {
    private Instant createdAt = Instant.now(); // always UTC

    public String getDisplayTime(String userTimezone) {
        return createdAt.atZone(ZoneId.of(userTimezone))
                        .format(DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm"));
    }
}`,
      followUp: [
        { question: 'What is the difference between LocalDate, LocalDateTime, and ZonedDateTime?', answer: `LocalDate: use when time doesn't matter — birthdays, effective dates, holidays. LocalDateTime: use for date + time in a single timezone context — meeting schedules, log entries in a single-timezone application. ZonedDateTime: use when timezone is important — user-facing timestamps, calendar events that span timezones. Instant: use for machine timestamps — store in DB as UTC, measure elapsed time. My rule: store Instants in the database, convert to ZonedDateTime only when displaying to the user.` },
        { question: 'Why is SimpleDateFormat not thread-safe?', answer: `SimpleDateFormat maintains internal state in fields — a Calendar instance and a NumberFormat. When two threads simultaneously call format() or parse() on the same SimpleDateFormat instance, they corrupt each other's internal state, producing wrong dates or throwing exceptions. The fix in old code was to use ThreadLocal<SimpleDateFormat>. Java 8's DateTimeFormatter is completely immutable — no mutable state — so it's safe to share a single static instance across all threads.` },
      ],
      tip: 'Key phrase: all java.time classes are IMMUTABLE. Methods like plusDays() return a NEW object — they do not modify the original. This is the most important property for thread safety.',
    },

    {
      id: 8,
      question: 'What is CompletableFuture in Java 8? How is it better than Future?',
      difficulty: 'advanced',
      asked: true,
      tags: ['Java 8', 'CompletableFuture', 'Async', 'Future'],
      answer: `Future was introduced in Java 5 for async programming, but it had a big problem — to get the result, you had to call future.get() which blocks the calling thread. You couldn't say "when this finishes, do the next thing" — there was no callback. You also couldn't combine multiple futures easily.

CompletableFuture in Java 8 solved all of this. It gives you a non-blocking, composable async pipeline.

The key methods I use:

supplyAsync() — runs a task asynchronously in the ForkJoinPool and returns a CompletableFuture.

thenApply() — like map in streams — transforms the result when it's ready. This is non-blocking.

thenCompose() — like flatMap — use this when the next step also returns a CompletableFuture. Without it you'd get a CompletableFuture<CompletableFuture<T>>.

thenAccept() — like forEach — consume the result, no return value.

exceptionally() — handle exceptions and return a fallback value.

allOf() — run multiple futures in parallel, wait for all to complete.

anyOf() — return as soon as ANY one completes — useful for racing multiple sources.

In my MetLife project, I used CompletableFuture.allOf() to fetch user data, policy data, and payment history in parallel, then combined them for a dashboard response. That reduced latency by about 60% compared to calling them sequentially.`,
      code: `// Old Future — blocks the thread
Future<String> future = executor.submit(() -> fetchData());
String result = future.get();  // BLOCKS until done — bad for high concurrency!

// CompletableFuture — non-blocking chain
CompletableFuture<User> userCF = CompletableFuture
    .supplyAsync(() -> userRepo.findById(userId))   // async on ForkJoinPool
    .thenApply(user -> enrichUser(user))            // non-blocking transform
    .thenApply(user -> { log("Found: " + user); return user; });

// thenCompose — when next step also returns CompletableFuture
CompletableFuture<Order> orderCF = CompletableFuture
    .supplyAsync(() -> findUser(id))               // returns User
    .thenCompose(user -> findLatestOrder(user));   // returns CompletableFuture<Order>
    // NOT thenApply — that would give CompletableFuture<CompletableFuture<Order>>

// Exception handling
CompletableFuture<User> safe = CompletableFuture
    .supplyAsync(() -> riskyFetch(id))
    .exceptionally(ex -> {
        log.error("Fetch failed: " + ex.getMessage());
        return User.defaultUser();  // fallback
    });

// handle() — runs for both success AND failure
CompletableFuture<String> result = CompletableFuture
    .supplyAsync(() -> fetchData())
    .handle((data, ex) -> ex != null ? "ERROR: " + ex.getMessage() : "OK: " + data);

// allOf — run 3 tasks in parallel, wait for all
CompletableFuture<User>             userF    = CompletableFuture.supplyAsync(() -> fetchUser(id));
CompletableFuture<List<Policy>>     policiesF = CompletableFuture.supplyAsync(() -> fetchPolicies(id));
CompletableFuture<PaymentHistory>   paymentF  = CompletableFuture.supplyAsync(() -> fetchPayments(id));

CompletableFuture.allOf(userF, policiesF, paymentF)
    .thenRun(() -> {
        User user = userF.join();           // join() = get() without checked exception
        List<Policy> policies = policiesF.join();
        PaymentHistory payment = paymentF.join();
        buildDashboard(user, policies, payment);
    });`,
      followUp: [
        { question: 'What is the difference between thenApply() and thenCompose()?', answer: `thenApply(f): f is a Function<T, R> — it returns a PLAIN VALUE. Use when the next step is a simple synchronous transformation. thenCompose(f): f is a Function<T, CompletableFuture<R>> — it returns a CompletableFuture. thenCompose automatically flattens it. Use when the next step is also async. If you use thenApply with a function that returns a CompletableFuture, you get CompletableFuture<CompletableFuture<R>> — nested, which is almost never what you want. Rule: thenApply = map, thenCompose = flatMap.` },
        { question: 'What is the difference between get() and join() in CompletableFuture?', answer: `get() throws checked exceptions — InterruptedException and ExecutionException. You must put it in a try-catch. join() throws unchecked CompletionException — no try-catch required. In lambda chains, join() is cleaner because checked exceptions don't work well inside lambdas. Both BLOCK the calling thread until the result is available. In Java 21 with virtual threads, blocking is cheap — but it's still a synchronous wait.` },
      ],
      tip: 'The most common mistake: using thenApply when the next step returns a CompletableFuture. Always use thenCompose in that case — otherwise you get nested CompletableFutures.',
    },

    // ═══════════════════════════════════
    //  JAVA 11
    // ═══════════════════════════════════

    {
      id: 9,
      question: 'What are the key features in Java 11? Why is it important?',
      difficulty: 'beginner',
      asked: true,
      tags: ['Java 11', 'Overview', 'LTS'],
      answer: `Java 11 was released in September 2018 and it's an LTS — Long-Term Support — release, which is why enterprises adopted it as the next step after Java 8. It's the second most widely used Java version today.

The most important additions in Java 11:

New String methods — isBlank(), strip(), lines(), repeat(n). These seem small but I use them constantly. strip() is better than trim() because it handles Unicode whitespace correctly.

HttpClient API — a modern built-in HTTP client with HTTP/2 support. Before this, if you didn't use a library like Apache HttpClient or OkHttp, you were stuck with HttpURLConnection which was very verbose.

var in lambda parameters — you could now use var in lambda parameter types, mainly useful when you need to add an annotation like @NonNull to a lambda parameter.

Files.readString() and Files.writeString() — read/write a whole file in one line instead of multiple stream operations.

Java 9-10 features that enterprise teams got together with 11: Collection factory methods (List.of, Set.of, Map.of), local variable type inference with var, and the jshell REPL.`,
      code: `// Java 9: Immutable collection factories
List<String> list = List.of("Java", "Python", "Go");    // immutable
Set<String> set   = Set.of("a", "b", "c");              // immutable, no duplicates
Map<String, Integer> map = Map.of("one", 1, "two", 2);  // immutable

// Java 10: var — local variable type inference
var user = userRepo.findById(1L);     // Optional<User>
var names = new ArrayList<String>();  // ArrayList<String>
// var i = 10;  — works for primitives too

// Java 11: var in lambda (needed for annotations)
list.stream()
    .filter((@NonNull var s) -> s.length() > 3)  // var needed to add annotation
    .forEach(System.out::println);

// Java 11: Files API
String content = Files.readString(Path.of("config.txt"));
Files.writeString(Path.of("output.txt"), "Hello World");`,
      tip: 'LTS versions are Java 8, 11, 17, 21, 25. Always mention this timeline in interviews — it shows you understand how enterprises choose Java versions.',
    },

    {
      id: 10,
      question: 'What are the new String methods added in Java 11?',
      difficulty: 'beginner',
      asked: true,
      tags: ['Java 11', 'String', 'isBlank', 'strip', 'lines', 'repeat'],
      answer: `Java 11 added 6 very useful String methods. They seem minor but they eliminate a lot of boilerplate.

isBlank() — returns true if the string is empty or contains only whitespace. Before this, I had to write str.trim().isEmpty() which is clunky. isBlank() does it in one call.

strip() — removes leading and trailing whitespace, but unlike trim(), it's Unicode-aware. trim() only removes characters with ASCII code ≤ 32. strip() uses Character.isWhitespace() which handles Unicode whitespace characters too. I always use strip() in new code.

stripLeading() and stripTrailing() — strip only from one side.

lines() — splits a string by line terminators and returns Stream<String>. This is really useful for processing multiline text — config files, CSV data, API responses with newlines.

repeat(n) — repeats the string n times. Useful for generating test data, padding, or dividers.`,
      code: `// isBlank() — better than isEmpty() for validation
"".isBlank()        // true
" ".isBlank()       // true   (trim().isEmpty() would work too, but isBlank is cleaner)
"  \t\n".isBlank()  // true
"hello".isBlank()   // false

// Real usage: validating user input
if (name == null || name.isBlank()) {
    throw new ValidationException("Name is required");
}

// strip() — Unicode-aware whitespace removal
String messy = "  Hello World  ";
messy.strip()          // "Hello World"
messy.stripLeading()   // "Hello World  "
messy.stripTrailing()  // "  Hello World"

// strip() vs trim() — why strip() is better
String unicodeSpace = " Hello "; // Em space (Unicode whitespace)
unicodeSpace.trim();   // " Hello " — trim() MISSED IT!
unicodeSpace.strip();  // "Hello"            — strip() got it right

// lines() — process multiline strings as a stream
String config = "# comment\nserver.port=8080\nserver.host=localhost";
Map<String, String> props = config.lines()
    .filter(line -> !line.startsWith("#"))  // skip comments
    .filter(line -> line.contains("="))
    .map(line -> line.split("=", 2))
    .collect(Collectors.toMap(parts -> parts[0].strip(), parts -> parts[1].strip()));

// repeat(n) — simple and useful
String divider  = "=".repeat(50);     // "==...=="
String indented = " ".repeat(4 * depth) + code;
String testData = "row\n".repeat(100); // generate 100 CSV rows for tests`,
      followUp: [
        { question: 'What is the difference between isBlank() and isEmpty()?', answer: `isEmpty() returns true only for zero-length strings — "".isEmpty() is true, " ".isEmpty() is false. isBlank() returns true for zero-length AND whitespace-only strings — "".isBlank() is true, " ".isBlank() is true, "\t\n".isBlank() is true. For user input validation, isBlank() is almost always what you want — an input of only spaces is as bad as an empty input.` },
      ],
      tip: 'Always use strip() instead of trim() in Java 11+. strip() is Unicode-aware; trim() is not. This is a quick win to show you write modern Java.',
    },

    {
      id: 11,
      question: 'What is the Java 11 HttpClient API? Why is it better than HttpURLConnection?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java 11', 'HttpClient', 'HTTP/2'],
      answer: `Before Java 11, if you wanted to make HTTP calls without adding a dependency, you had to use HttpURLConnection — which was painful. You needed 15-20 lines just for a simple GET request, there was no HTTP/2 support, no async support, and timeout configuration was tricky.

Java 11 added java.net.http.HttpClient — a proper, modern HTTP client built into the JDK. Key features:

HTTP/1.1 and HTTP/2 support out of the box.

Both synchronous and asynchronous calls — send() blocks, sendAsync() returns a CompletableFuture.

Immutable, builder pattern — you create one HttpClient and reuse it everywhere, like OkHttpClient.

Built-in timeout support at both the request and connection level.

In practice, most Spring Boot projects use RestTemplate or WebClient for HTTP calls. But in non-Spring projects, or when you want zero external dependencies, the Java 11 HttpClient is the go-to.`,
      code: `// Create one client and reuse it (immutable, thread-safe)
HttpClient client = HttpClient.newBuilder()
    .version(HttpClient.Version.HTTP_2)
    .connectTimeout(Duration.ofSeconds(10))
    .followRedirects(HttpClient.Redirect.NORMAL)
    .build();

// Synchronous GET
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/users/1"))
    .header("Authorization", "Bearer " + token)
    .timeout(Duration.ofSeconds(30))
    .GET()
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.statusCode());  // 200
System.out.println(response.body());        // {"id":1,"name":"Alice"}

// Asynchronous GET — returns CompletableFuture
client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
    .thenApply(HttpResponse::body)
    .thenAccept(body -> System.out.println("Got: " + body))
    .exceptionally(ex -> { log.error("Failed", ex); return null; });

// POST with JSON body
HttpRequest postRequest = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/users"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString("{\"name\":\"Bob\"}"))
    .build();

HttpResponse<String> postResponse = client.send(postRequest, HttpResponse.BodyHandlers.ofString());`,
      followUp: [
        { question: 'When would you use Java 11 HttpClient vs RestTemplate vs WebClient?', answer: `Java 11 HttpClient: Simple projects with no Spring dependency, utilities, command-line tools. RestTemplate: Legacy Spring MVC code — it works fine but is deprecated in favor of WebClient for new code. WebClient (Spring WebFlux): Preferred for new Spring Boot projects — reactive, non-blocking, better suited for microservices that make many outgoing calls. For a new Spring Boot 3.x service, I use WebClient. For a non-Spring project, I use Java 11 HttpClient. I avoid RestTemplate for new projects.` },
      ],
      tip: 'Create ONE HttpClient instance and reuse it — same pattern as OkHttpClient. Creating per-request wastes resources and doesn\'t use HTTP/2 connection pooling.',
    },

    // ═══════════════════════════════════
    //  JAVA 17
    // ═══════════════════════════════════

    {
      id: 12,
      question: 'What are the key features in Java 17? Why do Spring Boot 3.x projects require it?',
      difficulty: 'beginner',
      asked: true,
      tags: ['Java 17', 'Overview', 'LTS'],
      answer: `Java 17 was released in September 2021 and it's the LTS release after Java 11. The Spring Boot team set Java 17 as the minimum for Spring Boot 3.x, which forced a lot of enterprise migration.

The main features that finalized in Java 17 are:

Records — immutable data classes in one line. Replaces DTOs that used to need Lombok or 30 lines of boilerplate.

Sealed Classes — you declare exactly which classes can implement or extend an interface or class. Great for domain modeling.

Pattern Matching for instanceof — you do the instanceof check and the cast in one statement. No more redundant casts.

Switch Expressions — switch can now return a value, with cleaner arrow syntax. Finalized in Java 14 but included in Java 17 LTS.

Text Blocks — multi-line strings with proper indentation. Finalized in Java 15. Huge improvement for SQL, JSON, HTML in Java code.

In practice, the Records feature alone was worth upgrading for me — in my Spring Boot projects, I replaced all DTO classes (which needed Lombok's @Data or 30 lines of getters/setters/equals/hashCode) with one-line records.`,
      code: `// Text Blocks — multi-line strings (Java 15, final in 17)
// Before
String sql = "SELECT u.name, u.email " +
             "FROM users u " +
             "JOIN orders o ON u.id = o.user_id " +
             "WHERE u.status = 'ACTIVE'";

// Java 17 Text Block — much cleaner
String sql = """
    SELECT u.name, u.email
    FROM users u
    JOIN orders o ON u.id = o.user_id
    WHERE u.status = 'ACTIVE'
    """;

// Switch Expression — returns a value, arrow syntax (Java 14, final in 17)
// Before: switch statement (no return value, fallthrough)
String result;
switch (status) {
    case ACTIVE: result = "Active User"; break;
    case PENDING: result = "Pending Approval"; break;
    default: result = "Unknown";
}

// Java 17: switch expression
String result = switch (status) {
    case ACTIVE   -> "Active User";
    case PENDING  -> "Pending Approval";
    case INACTIVE -> "Inactive";  // no fall-through, no break needed
};`,
      tip: 'Spring Boot 3.x requires Java 17 minimum. If asked why: "Spring Boot 3 moved to Jakarta EE 9+ which required Java 17." Know this — it\'s a common follow-up.',
    },

    {
      id: 13,
      question: 'What are Records in Java 16/17? How do they reduce boilerplate?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java 17', 'Records', 'DTO', 'Immutable'],
      answer: `Records are a special kind of class for immutable data. They automatically generate: private final fields, a canonical constructor that takes all fields, public accessor methods that match the field names, and correct equals(), hashCode(), and toString() based on all fields.

Before records, if I needed a simple DTO — say UserResponse with an id, name, and email — I'd either write 30 lines of boilerplate or use Lombok. With records, it's literally one line.

One important thing: the accessors are name(), not getName(). So for a record with a field "name", you call user.name(), not user.getName(). This trips people up.

Records are also implicitly final — you can't extend them. And all fields are private and final — they're immutable by design. You can add a compact constructor for validation, custom methods, and static factory methods.

I use records heavily in Spring Boot for DTOs — both request and response objects. They work perfectly with Jackson 2.12+ for JSON serialization without any additional annotations.`,
      code: `// Before Records — 30+ lines of POJO
public class UserResponse {
    private final Long id;
    private final String name;
    private final String email;
    public UserResponse(Long id, String name, String email) {
        this.id = id; this.name = name; this.email = email;
    }
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    // equals(), hashCode(), toString()... 20 more lines
}

// Java 17 Record — one line!
public record UserResponse(Long id, String name, String email) {}

// Usage — accessor is name(), NOT getName()
UserResponse user = new UserResponse(1L, "Randhir", "r@email.com");
System.out.println(user.id());     // 1
System.out.println(user.name());   // "Randhir"
System.out.println(user);          // UserResponse[id=1, name=Randhir, email=r@email.com]

// Compact constructor — for validation
public record UserRequest(String name, String email, int age) {
    public UserRequest {  // compact constructor — no parameter list
        Objects.requireNonNull(name, "Name required");
        if (!email.contains("@")) throw new IllegalArgumentException("Bad email");
        name = name.strip();     // can transform before assignment
        email = email.toLowerCase();
    }
}

// Custom methods are fine
public record Money(BigDecimal amount, String currency) {
    public Money add(Money other) {
        if (!this.currency.equals(other.currency)) throw new IllegalArgumentException("Currency mismatch");
        return new Money(this.amount.add(other.amount), this.currency);
    }
    public static Money of(double amount, String currency) {
        return new Money(BigDecimal.valueOf(amount), currency);
    }
}

// Spring Boot: Records as DTOs
@PostMapping("/orders")
public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request) {
    // request.productId(), request.quantity() — no getters!
    Order order = orderService.create(request.productId(), request.quantity());
    return ResponseEntity.ok(new OrderResponse(order.getId(), order.getTotal()));
}`,
      followUp: [
        { question: 'Can a Record extend another class or be extended?', answer: `No on both sides. Records implicitly extend java.lang.Record and are implicitly final. They cannot extend any other class since they already extend Record. And since they're final, no class can extend them. However, records CAN implement interfaces — this makes them very useful with sealed class hierarchies: sealed interface Shape permits Circle, Rectangle; record Circle(double radius) implements Shape {}; record Rectangle(double w, double h) implements Shape {}. This combination is very powerful.` },
        { question: 'How do Records work with Jackson for JSON?', answer: `Jackson 2.12+ fully supports Records automatically — it serializes/deserializes record components as JSON fields. Jackson detects the constructor arguments by name and maps JSON fields to them. With Spring Boot 2.6+ which bundles Jackson 2.13+, Records just work with @RequestBody and @ResponseBody without any extra annotations. One gotcha: Jackson uses the component name as the JSON field name — so the field "firstName" in the record becomes "firstName" in JSON. If you need a different JSON name, use @JsonProperty("first_name") on the record component.` },
      ],
      tip: 'Record accessors match the component name exactly: name(), not getName(). This is the #1 trap. Records are final and implicitly extend java.lang.Record.',
    },

    {
      id: 14,
      question: 'What are Sealed Classes in Java 17? When would you use them?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java 17', 'Sealed Classes', 'Domain Modeling'],
      answer: `Sealed classes let you control exactly which classes can extend or implement a class or interface. You declare the permitted subtypes explicitly using the "permits" keyword.

Before sealed classes, anyone could extend your abstract class or implement your interface. Sealed classes let you say "only THESE specific classes are allowed to be subtypes." This is useful for domain modeling where you know the complete set of variants.

A practical example: a Payment interface. In my application, the only valid payment types are CreditCard, UPI, and NetBanking — nothing else. With a sealed interface, I can express that constraint in the type system.

Each permitted subtype must be declared as either:
- final — cannot be further extended
- sealed — can be extended but only by its own permitted types
- non-sealed — can be freely extended by anyone

The real power comes when you combine sealed classes with pattern matching switch in Java 21. Because the compiler knows all the permitted subtypes, it can warn you when your switch is not exhaustive — you don't need a default case.`,
      code: `// Sealed interface — only 3 payment types allowed
public sealed interface Payment
    permits CreditCardPayment, UPIPayment, NetBankingPayment {

    double getAmount();
    String getPaymentId();
}

// Each subtype must be final, sealed, or non-sealed
public record CreditCardPayment(String cardNumber, double amount, String paymentId)
    implements Payment {}  // record is implicitly final — OK

public record UPIPayment(String upiId, double amount, String paymentId)
    implements Payment {}

public record NetBankingPayment(String bankCode, String accountNo, double amount, String paymentId)
    implements Payment {}

// Processing — compiler knows ALL possible types
// No default needed — compiler enforces exhaustiveness!
double fee = switch (payment) {
    case CreditCardPayment cc -> cc.getAmount() * 0.02;   // 2% fee
    case UPIPayment upi       -> 0.0;                      // free
    case NetBankingPayment nb -> 5.0;                      // flat fee
};

// Real-world: Result type pattern
public sealed interface ApiResult<T>
    permits ApiResult.Success, ApiResult.Failure {

    record Success<T>(T data) implements ApiResult<T> {}
    record Failure<T>(String error, int statusCode) implements ApiResult<T> {}
}

// Usage
ApiResult<User> result = userService.findUser(id);
return switch (result) {
    case ApiResult.Success<User>(var user)   -> ResponseEntity.ok(user);
    case ApiResult.Failure<User>(var error, var code) -> ResponseEntity.status(code).body(error);
};`,
      followUp: [
        { question: 'What is the difference between sealed classes and enums?', answer: `Enums: each constant is a singleton with the same class type. All enum constants share the same fields (declared in enum body). Good for simple value sets like NORTH/SOUTH/EAST/WEST or PENDING/ACTIVE/INACTIVE. Sealed classes: each subtype is a full class — can have different fields, different constructors, generics, and behavior. Good when different variants have different data. CreditCardPayment has a cardNumber, UPIPayment has a upiId — they need different structure, so sealed + records is the right tool, not enum.` },
      ],
      tip: 'Sealed classes + Records + Java 21 switch = the modern Java trifecta. The switch becomes exhaustive — no default case needed because the compiler knows all subtypes.',
    },

    {
      id: 15,
      question: 'What is Pattern Matching for instanceof in Java 16? How does it reduce boilerplate?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java 17', 'Pattern Matching', 'instanceof'],
      answer: `Before Java 16, whenever I did an instanceof check I immediately followed it with a cast. It's the most repetitive pattern in Java:

if (shape instanceof Circle) {
    Circle c = (Circle) shape;  // redundant cast
    // use c
}

Java 16 finalized pattern matching for instanceof. Now the check and the cast happen in one step — you declare a "pattern variable" right in the instanceof expression:

if (shape instanceof Circle c) {
    // c is already a Circle here, no cast needed
}

The pattern variable c is in scope only where the compiler can prove the type test was true. So you can't accidentally use c where the instanceof returned false.

You can also combine it with && for guard conditions:
if (obj instanceof String s && s.length() > 5) { ... }

I use this a lot in equals() implementations and anywhere I need to downcast safely. In my experience it reduces bugs because you can't do the instanceof check and then forget to cast to the correct type.`,
      code: `// Before Java 16 — check then cast (redundant)
Object obj = getShape();
if (obj instanceof Circle) {
    Circle c = (Circle) obj;  // already know it's Circle, but must cast
    System.out.println("Radius: " + c.getRadius());
} else if (obj instanceof Rectangle) {
    Rectangle r = (Rectangle) obj;
    System.out.println("Area: " + r.getWidth() * r.getHeight());
}

// Java 16+ — pattern variable, no separate cast
if (obj instanceof Circle c) {
    System.out.println("Radius: " + c.getRadius());  // c is Circle, ready to use
} else if (obj instanceof Rectangle r) {
    System.out.println("Area: " + r.getWidth() * r.getHeight());
}

// With guard condition (&&)
if (obj instanceof String s && s.length() > 5) {
    System.out.println("Long string: " + s.toUpperCase());
}

// Scope is tracked by control flow
if (!(obj instanceof String s)) {
    return;  // early exit for non-strings
}
// s IS in scope here — compiler knows we survived the check
System.out.println(s.toUpperCase());

// Classic use case — equals() method
@Override
public boolean equals(Object obj) {
    return obj instanceof UserDTO other
        && this.id.equals(other.id)
        && this.email.equals(other.email);
}`,
      tip: 'Pattern variable scope is enforced by the compiler using flow analysis. The variable is only usable where the instanceof test MUST be true — the compiler tracks this through if/else branches.',
    },

    // ═══════════════════════════════════
    //  JAVA 21
    // ═══════════════════════════════════

    {
      id: 16,
      question: 'What are the key features in Java 21? Why is it considered the most exciting LTS?',
      difficulty: 'beginner',
      asked: true,
      tags: ['Java 21', 'Overview', 'LTS'],
      answer: `Java 21 was released in September 2023 and it's the LTS after Java 17. It's being called the most impactful LTS since Java 8 — and the main reason is Virtual Threads.

The key finalized features:

Virtual Threads (Project Loom) — lightweight threads managed by the JVM. A single JVM can now have millions of virtual threads. For I/O-bound microservices, this changes the scalability equation completely without requiring you to change to reactive programming.

Sequenced Collections — consistent API to access the first and last element of any ordered collection (List, Deque, LinkedHashSet) via getFirst(), getLast(), reversed().

Record Patterns — extends pattern matching to destructure records in instanceof and switch. You can pull out the individual fields directly in the pattern.

Pattern Matching for switch — you can switch on the type of an object, not just values. Combined with sealed classes, the switch becomes exhaustive.

For Spring Boot projects: Spring Boot 3.2 supports Java 21 Virtual Threads natively. Enabling them is one property: spring.threads.virtual.enabled=true. No code changes. Tomcat will use a virtual thread per request instead of a platform thread.`,
      code: `// Java 21: Virtual Threads — enable in Spring Boot
// application.properties
// spring.threads.virtual.enabled=true
// That's literally it — Tomcat switches to virtual threads per request

// Sequenced Collections
List<String> list = new ArrayList<>(List.of("a", "b", "c", "d"));
String first = list.getFirst();   // "a" — was list.get(0)
String last  = list.getLast();    // "d" — was list.get(list.size()-1)
list.addFirst("z");               // add to front
List<String> reversed = list.reversed(); // reversed VIEW of the list

// Record Patterns (Java 21)
record Point(int x, int y) {}
record Line(Point start, Point end) {}

if (obj instanceof Line(Point(var x1, var y1), Point(var x2, var y2))) {
    double length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Pattern Matching for switch (Java 21)
String desc = switch (shape) {
    case Circle c       -> "Circle with radius " + c.radius();
    case Rectangle r    -> "Rectangle " + r.width() + "x" + r.height();
    case null           -> "No shape provided";
};`,
      tip: 'For Java 21 interviews: Virtual Threads is the headline. Know the one-liner to enable in Spring Boot and know the difference between I/O-bound (good for VT) and CPU-bound (still use platform threads).',
    },

    {
      id: 17,
      question: 'What are Virtual Threads in Java 21? How do they solve the scalability problem?',
      difficulty: 'advanced',
      asked: true,
      tags: ['Java 21', 'Virtual Threads', 'Project Loom', 'Concurrency', 'Scalability'],
      answer: `To understand Virtual Threads, I need to explain the problem first.

Traditional Java threads (called Platform Threads) map 1:1 to OS threads. Each OS thread uses about 1MB of stack memory. So if my Tomcat server uses a thread pool of 200 threads, it can handle 200 concurrent requests — after that, requests queue up. And the real waste is that most of these threads are just waiting — waiting for a database response, waiting for an external API — they're not computing anything, but they're still blocking an OS thread.

Virtual Threads are lightweight threads managed by the JVM — not the OS. They use only a few KB of memory. When a virtual thread blocks on I/O (database call, HTTP call, Thread.sleep), the JVM parks it and frees the underlying carrier thread to do other work. When the I/O completes, the virtual thread is resumed on a carrier thread.

So with virtual threads I can have millions of threads, and the JVM multiplexes them over a small pool of OS threads. I can write simple blocking code — no callback hell, no reactive programming — and still get the scalability of async code.

The important caveat: virtual threads help for I/O-bound work, not CPU-bound. If my thread is computing something complex (compression, encryption, image processing), virtual threads don't help. Also, in Java 21, synchronized blocks with I/O inside can pin the virtual thread to the carrier thread — defeating the purpose. I use ReentrantLock instead of synchronized for that reason.

In Spring Boot 3.2+, one property enables it: spring.threads.virtual.enabled=true. Tomcat uses a virtual thread per request. No application code changes needed.`,
      code: `// Platform thread — limited to ~200, each uses 1MB stack
ExecutorService pool = Executors.newFixedThreadPool(200);
pool.submit(() -> {
    User user = db.findUser(id);     // BLOCKS platform thread while waiting
    Order order = api.fetch(userId); // BLOCKS platform thread while waiting
    return process(user, order);
});

// Virtual thread — lightweight, millions possible
Thread vt = Thread.ofVirtual().start(() -> {
    User user = db.findUser(id);     // blocks virtual thread, frees carrier thread!
    Order order = api.fetch(userId); // blocks virtual thread, frees carrier thread!
    return process(user, order);
});

// ExecutorService — virtual thread per task
try (ExecutorService exec = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<String>> results = IntStream.range(0, 10_000)
        .mapToObj(i -> exec.submit(() -> {
            Thread.sleep(1000);  // fine — virtual thread parks, doesn't block OS thread
            return "Task " + i;
        }))
        .collect(Collectors.toList());
    // All 10,000 tasks run "concurrently" with very few OS threads
}

// Spring Boot 3.2+ — just one property
// application.properties:
// spring.threads.virtual.enabled=true

// WRONG: synchronized + I/O = thread pinning (avoid!)
synchronized (lock) {
    db.save(entity);  // virtual thread is PINNED to carrier here — bad!
}

// RIGHT: ReentrantLock + I/O = virtual thread friendly
ReentrantLock lock = new ReentrantLock();
lock.lock();
try {
    db.save(entity);  // virtual thread can yield to carrier while waiting
} finally {
    lock.unlock();
}`,
      followUp: [
        { question: 'What is thread pinning in Virtual Threads?', answer: `Thread pinning is when a virtual thread gets stuck to its carrier platform thread and cannot be unmounted — even when it blocks on I/O. This happens in two cases in Java 21: (1) inside a synchronized block, and (2) inside native methods. When a virtual thread is pinned, the carrier thread is blocked just like an old platform thread, destroying the benefit of virtual threads. The fix: replace synchronized blocks (especially ones that contain I/O) with ReentrantLock. Java 22 improved this — synchronized blocks no longer cause pinning in most cases.` },
        { question: 'Should I always use Virtual Threads? Are there cases where platform threads are better?', answer: `Virtual threads are perfect for I/O-bound tasks — REST API handlers, database calls, Kafka consumers, any code that waits on external resources. For CPU-intensive work — compression, encryption, image processing, number crunching — virtual threads offer no benefit. The thread isn't blocking, it's computing. In those cases, platform thread pools sized to the number of CPU cores (Runtime.getRuntime().availableProcessors()) is the right approach. Also, avoid putting VTs in synchronized blocks with I/O — pinning negates the advantage.` },
      ],
      tip: 'Key phrase: "Virtual threads make blocking cheap — I can write simple, readable blocking code and get async-level scalability." This is the one-line interview answer for Virtual Threads.',
    },

    {
      id: 18,
      question: 'What are Sequenced Collections in Java 21?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java 21', 'Sequenced Collections'],
      answer: `Before Java 21, there was no consistent way to access the first or last element of an ordered collection. Each type had its own API:

For List: list.get(0) for first, list.get(list.size()-1) for last.
For Deque: deque.peekFirst(), deque.peekLast().
For SortedSet: sortedSet.first(), sortedSet.last().

No common interface meant you had to know which collection type you were working with.

Java 21 introduced three new interfaces — SequencedCollection, SequencedSet, and SequencedMap — that add consistent methods to all ordered collections:

getFirst(), getLast() — access first and last element.
addFirst(), addLast() — insert at front or back.
removeFirst(), removeLast() — remove from front or back.
reversed() — get a reversed view of the collection.

These are now available on ArrayList, LinkedList, ArrayDeque, LinkedHashSet, and LinkedHashMap. It's a small addition but makes working with ordered collections much cleaner.`,
      code: `// Before Java 21 — inconsistent API
List<String> list = new ArrayList<>(List.of("a", "b", "c", "d"));
String first = list.get(0);                  // only way for ArrayList
String last  = list.get(list.size() - 1);   // verbose

// Java 21 — consistent
String first = list.getFirst();  // "a"
String last  = list.getLast();   // "d"

list.addFirst("z");  // ["z", "a", "b", "c", "d"]
list.addLast("e");   // ["z", "a", "b", "c", "d", "e"]
list.removeFirst();  // removes "z"

// reversed() — returns a VIEW (not a copy)
List<String> rev = list.reversed();
System.out.println(rev.getFirst()); // "e" (was last)
// Modifying rev affects the original list and vice versa

// Works on LinkedHashSet too
LinkedHashSet<String> set = new LinkedHashSet<>();
set.add("Java"); set.add("Python"); set.add("Go");
System.out.println(set.getFirst()); // "Java"
System.out.println(set.getLast());  // "Go"

// LinkedHashMap — SequencedMap
LinkedHashMap<String, Integer> map = new LinkedHashMap<>();
map.put("a", 1); map.put("b", 2); map.put("c", 3);
Map.Entry<String, Integer> firstEntry = map.firstEntry(); // {a=1}
Map.Entry<String, Integer> lastEntry  = map.lastEntry();  // {c=3}`,
      tip: 'reversed() returns a LIVE VIEW — modifications to the reversed view affect the original. It is not a copy. This is an important distinction for correctness.',
    },

    // ═══════════════════════════════════
    //  COMPARISON QUESTIONS
    // ═══════════════════════════════════

    {
      id: 19,
      question: 'How would you compare Java 8, Java 17, and Java 21? What changed across versions?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java 8', 'Java 17', 'Java 21', 'Comparison'],
      answer: `I think of it as three eras:

Java 8 — "Functional Java": Lambda expressions and the Stream API fundamentally changed how we write Java. Instead of imperative for-loops and anonymous classes, we write declarative pipelines. Optional brought some null safety. CompletableFuture brought async programming. Date/Time fixed the broken java.util.Date. This is still the most widely deployed version.

Java 11 — "Quality of Life": Added nice-to-have improvements. String methods like isBlank() and strip(). A proper built-in HttpClient. var keyword. But no major paradigm shift — just polish.

Java 17 — "Modern Java": Records eliminated DTO boilerplate in one line. Sealed classes let you model closed type hierarchies. Pattern matching instanceof removed redundant casts. Switch expressions became clean and value-producing. Text blocks made multi-line strings readable. Spring Boot 3 requires Java 17 minimum.

Java 21 — "Scalability Revolution": Virtual Threads are the headline. You can now write simple blocking code that scales like reactive/async code — millions of threads without code complexity. Sequenced Collections unified the API for ordered collections. Pattern matching for switch (with sealed classes) makes exhaustive type-based switching possible.

If I were summing it up in one sentence: Java 8 made the language expressive. Java 17 made it concise. Java 21 made it scalable.`,
      code: `// Writing the same "fetch and process user" across Java versions

// Java 8 — CompletableFuture + Stream API
CompletableFuture<List<OrderDTO>> result = CompletableFuture
    .supplyAsync(() -> userRepo.findById(id).orElseThrow(UserNotFoundException::new))
    .thenApply(user -> orderRepo.findByUser(user))
    .thenApply(orders -> orders.stream()
        .filter(o -> o.getStatus() == Status.ACTIVE)
        .map(o -> new OrderDTO(o.getId(), o.getTotal()))  // DTO needs 20 lines elsewhere
        .collect(Collectors.toList()));

// Java 17 — Same logic, records replace DTO boilerplate
record OrderDTO(Long id, BigDecimal total) {}  // one line!
record UserOrdersResponse(String name, List<OrderDTO> orders) {}

CompletableFuture<UserOrdersResponse> result = CompletableFuture
    .supplyAsync(() -> userRepo.findById(id).orElseThrow(UserNotFoundException::new))
    .thenApply(user -> new UserOrdersResponse(
        user.getName(),
        orderRepo.findByUser(user).stream()
            .filter(o -> o.getStatus() == Status.ACTIVE)
            .map(o -> new OrderDTO(o.getId(), o.getTotal()))
            .toList()  // Java 16+: .toList() instead of .collect(Collectors.toList())
    ));

// Java 21 — Virtual threads + records, blocking style, scales like async
// In a virtual thread (via Spring Boot spring.threads.virtual.enabled=true):
User user = userRepo.findById(id).orElseThrow(UserNotFoundException::new);
List<OrderDTO> orders = orderRepo.findByUser(user).stream()
    .filter(o -> o.getStatus() == Status.ACTIVE)
    .map(o -> new OrderDTO(o.getId(), o.getTotal()))
    .toList();
return new UserOrdersResponse(user.getName(), orders);
// Simple blocking code — but handles 100,000+ concurrent requests via virtual threads`,
      tip: '"Java 8 made Java expressive. Java 17 made it concise. Java 21 made it scalable." — a clean one-line summary for interviews.',
    },

    {
      id: 20,
      question: 'Virtual Threads vs CompletableFuture — When do you use each?',
      difficulty: 'advanced',
      asked: true,
      tags: ['Java 21', 'Virtual Threads', 'CompletableFuture', 'Architecture'],
      answer: `This is a question I get a lot and it's worth being precise.

CompletableFuture is still valuable even in Java 21. It's not obsolete. The scenarios where I still reach for it:

Running multiple async operations in parallel and combining results — CompletableFuture.allOf() with thenApply. For example, fetching user data, order history, and notifications simultaneously for a dashboard endpoint. allOf waits for all and then I process the combined results.

Error recovery pipelines — exceptionally() and handle() give you clean ways to return fallback values when something fails.

Racing multiple data sources — anyOf() to take whichever responds first.

Virtual Threads, on the other hand, are about server scalability, not parallel task composition. With Virtual Threads I write simple blocking code and Tomcat handles 100k+ concurrent requests instead of 200. The code looks exactly like synchronous code — no callbacks, no thenApply chains.

The real difference: CompletableFuture makes parallel work COMPOSABLE. Virtual Threads make BLOCKING cheap.

I can also combine them — run CompletableFuture tasks inside a virtual thread. The virtual thread parks while waiting for the future to complete, which is perfectly fine.`,
      code: `// CompletableFuture — best for: parallel tasks + combine results
@GetMapping("/dashboard/{id}")
public DashboardResponse getDashboard(@PathVariable Long id) throws Exception {
    // Fire all 3 requests in parallel
    CompletableFuture<User>              userF    = CompletableFuture.supplyAsync(() -> userService.find(id));
    CompletableFuture<List<Order>>       ordersF  = CompletableFuture.supplyAsync(() -> orderService.findByUser(id));
    CompletableFuture<List<Notification>> notifsF = CompletableFuture.supplyAsync(() -> notifService.findUnread(id));

    // Wait for all 3
    CompletableFuture.allOf(userF, ordersF, notifsF).join();

    return new DashboardResponse(userF.join(), ordersF.join(), notifsF.join());
}

// Virtual Threads — best for: high concurrency server (Spring Boot 3.2+)
// application.properties: spring.threads.virtual.enabled=true
// No code change needed — Tomcat handles 100k+ concurrent requests
@GetMapping("/orders/{id}")
public Order getOrder(@PathVariable Long id) {
    Order order = orderRepo.findById(id).orElseThrow();  // blocking — virtual thread parks here
    return order;  // simple, readable, scales to tens of thousands of concurrent requests
}

// Java 21 StructuredTaskScope — parallel + virtual threads combined (preview)
@GetMapping("/dashboard/{id}")
public DashboardResponse getDashboard(@PathVariable Long id) throws Exception {
    try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
        var user   = scope.fork(() -> userService.find(id));
        var orders = scope.fork(() -> orderService.findByUser(id));
        var notifs = scope.fork(() -> notifService.findUnread(id));

        scope.join().throwIfFailed();  // fails fast if any subtask throws
        return new DashboardResponse(user.resultNow(), orders.resultNow(), notifs.resultNow());
    }
}`,
      tip: 'The one-liner: "CompletableFuture = composing parallel tasks. Virtual Threads = making blocking cheap for server throughput." You often want both in the same application.',
    },

    {
      id: 21,
      question: 'How do Records replace Lombok in Java 17? What are the differences?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java 17', 'Records', 'Lombok'],
      answer: `Lombok is a library that generates boilerplate via annotations — @Data gives you getters, setters, equals, hashCode, toString. @Value makes it immutable. @Builder gives you a builder pattern.

Java 17 Records replace Lombok for immutable data classes. For a plain DTO with all fields final and no business logic, a record is strictly better — zero dependency, compiler-generated, no annotation processor.

The key differences:

1. Mutability: Lombok @Data gives you setters — mutable. Records are always immutable. If you need mutable fields (like for JPA entities), Lombok is still the tool.

2. Accessor names: Lombok generates getName(), getAge(). Records generate name(), age(). Some older frameworks expect getX() conventions — Jackson 2.12+ handles records, but some others might not.

3. Inheritance: Lombok classes can extend other classes. Records cannot.

4. JPA entities: Records cannot be JPA entities because JPA requires a no-arg constructor and mutable state. Use Lombok for your @Entity classes, records for your DTO/response classes.

5. Builder: Records don't have a built-in builder — Lombok's @Builder is still useful when you have many optional fields.

My pattern in Spring Boot: Records for request/response DTOs. Lombok on JPA entities. This gives me the best of both worlds.`,
      code: `// Lombok @Value (immutable POJO) — needs dependency
@Value
public class UserDTO {
    Long id;
    String name;
    String email;
    // generates: constructor, getName(), equals(), hashCode(), toString()
}
userDTO.getName(); // Lombok style

// Java 17 Record — no dependency, built-in
public record UserDTO(Long id, String name, String email) {}
userDTO.name(); // Record style — no "get" prefix

// Lombok still needed for JPA entity (mutable, no-arg constructor)
@Entity
@Data
@NoArgsConstructor
public class User {
    @Id @GeneratedValue
    private Long id;
    private String name;
    private String email;
}

// Record for DTO, Lombok for entity
@Service
public class UserService {
    public UserDTO findUser(Long id) {
        User entity = userRepo.findById(id)  // Lombok entity from DB
            .orElseThrow(() -> new UserNotFoundException(id));
        return new UserDTO(entity.getId(), entity.getName(), entity.getEmail()); // Record DTO
    }
}

// Lombok @Builder still useful for records with many optional fields
// Records don't have a builder — need workaround
public record SearchCriteria(String name, String email, Integer minAge, Integer maxAge, Status status) {}
// Creating: new SearchCriteria("Alice", null, 18, null, Status.ACTIVE)  — nulls for optional
// With Lombok builder: SearchCriteria.builder().name("Alice").minAge(18).build()`,
      tip: 'Use Records for DTOs (request/response). Use Lombok for JPA entities (mutable, need @NoArgsConstructor). This is the clean separation in a Spring Boot 3.x project.',
    },

    {
      id: 22,
      question: 'What is Structured Concurrency in Java 21?',
      difficulty: 'advanced',
      asked: true,
      tags: ['Java 21', 'Structured Concurrency', 'Virtual Threads'],
      answer: `Structured Concurrency is a preview feature in Java 21 that treats a group of concurrent tasks as a unit of work. The idea is borrowed from structured programming — just like an if-block or for-loop has a clear entry and exit, a structured concurrent task group has a clear start and end.

The problem it solves: with CompletableFuture.allOf(), if one task fails, the other tasks don't automatically cancel. You end up with "orphaned" threads doing work that no one will use — wasting resources and potentially causing issues.

With StructuredTaskScope, you open a scope, fork subtasks into it, wait for them, and when the scope closes, everything is cleaned up. If you use ShutdownOnFailure, as soon as one subtask throws an exception, all other subtasks are cancelled automatically. If you use ShutdownOnSuccess, it returns as soon as the first subtask succeeds and cancels the rest.

This is cleaner than CompletableFuture for "do these N things in parallel and fail fast if any one fails" — which is a very common pattern in microservices when calling multiple downstream services.

It's still a preview feature in Java 21 — meaning it could change in future versions — but it's direction Java is clearly heading.`,
      code: `// Without StructuredTaskScope — orphaned tasks problem
CompletableFuture<User>  userF  = CompletableFuture.supplyAsync(() -> fetchUser(id));
CompletableFuture<Order> orderF = CompletableFuture.supplyAsync(() -> fetchOrder(id));

CompletableFuture.allOf(userF, orderF).join();
// If fetchUser throws, fetchOrder keeps running — wasted work, no cleanup!

// With StructuredTaskScope.ShutdownOnFailure — fail fast, clean up
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    StructuredTaskScope.Subtask<User>  userTask  = scope.fork(() -> fetchUser(id));
    StructuredTaskScope.Subtask<Order> orderTask = scope.fork(() -> fetchOrder(id));

    scope.join();           // wait for all subtasks
    scope.throwIfFailed();  // if any threw, re-throw here

    // Both completed successfully
    return new Dashboard(userTask.resultNow(), orderTask.resultNow());
}
// Scope auto-closes — any incomplete subtasks are cancelled

// ShutdownOnSuccess — race multiple sources, take the fastest
try (var scope = new StructuredTaskScope.ShutdownOnSuccess<User>()) {
    scope.fork(() -> fetchFromPrimaryDB(id));
    scope.fork(() -> fetchFromCache(id));
    scope.fork(() -> fetchFromReplica(id));

    scope.join();
    return scope.result(); // whichever finished first
}`,
      tip: 'Structured Concurrency is still preview in Java 21 — mention this. It solves orphaned thread leaks that CompletableFuture allOf() has. The ShutdownOnFailure scope is the most common pattern.',
    },

    {
      id: 23,
      question: 'What is Pattern Matching for switch in Java 21? How does it combine with sealed classes?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java 21', 'Pattern Matching', 'Switch', 'Sealed Classes'],
      answer: `Pattern Matching for switch lets you match on the TYPE of an object in a switch statement, not just its value. This was finalized in Java 21.

Before this, if I wanted to handle different subtypes of a hierarchy, I had to use a chain of if-instanceof-cast blocks. Now I can use a clean switch where each case checks the type and binds a typed variable — all in one step.

The combination with sealed classes is where it really shines. Because sealed classes restrict exactly which subtypes exist, the compiler knows when the switch is exhaustive. If I forget a case, the compiler warns me. I don't need a default case — the compiler proves I've covered every possible type.

You can also add guard conditions using when — like case Circle c when c.radius() > 10 -> ... — to filter within a type case.

This is perfect for processing polymorphic domain objects — payments, shapes, events — where you need different behavior per subtype.`,
      code: `// Before Java 21 — if-instanceof chain
Object shape = getShape();
double area;
if (shape instanceof Circle c) {
    area = Math.PI * c.radius() * c.radius();
} else if (shape instanceof Rectangle r) {
    area = r.width() * r.height();
} else if (shape instanceof Triangle t) {
    area = 0.5 * t.base() * t.height();
} else {
    throw new IllegalArgumentException("Unknown shape");
}

// Java 21 — Pattern Matching for switch
double area = switch (shape) {
    case Circle c    -> Math.PI * c.radius() * c.radius();
    case Rectangle r -> r.width() * r.height();
    case Triangle t  -> 0.5 * t.base() * t.height();
    case null        -> throw new NullPointerException("Shape cannot be null");
};

// With sealed classes — exhaustive switch (no default needed!)
sealed interface Payment permits CreditCardPayment, UPIPayment, NetBankingPayment {}

String process(Payment payment) {
    return switch (payment) {
        case CreditCardPayment cc -> "CC charge: " + cc.getAmount() * 0.98;
        case UPIPayment upi       -> "UPI: " + upi.getAmount() + " via " + upi.upiId();
        case NetBankingPayment nb -> "NB: " + nb.getAmount() + " from " + nb.bankCode();
        // No default — compiler knows these are ALL possible types!
    };
}

// Guard conditions with 'when'
String classify(Object obj) {
    return switch (obj) {
        case Integer i when i < 0    -> "Negative number";
        case Integer i when i == 0   -> "Zero";
        case Integer i               -> "Positive: " + i;
        case String s when s.isBlank() -> "Blank string";
        case String s                -> "String: " + s;
        default                      -> "Other: " + obj.getClass().getSimpleName();
    };
}`,
      tip: 'Sealed classes + Pattern Matching switch = exhaustive, compiler-checked type dispatching. No default case needed when all subtypes are covered — the compiler enforces it.',
    },

    {
      id: 24,
      question: 'Which Java version would you use for a new project in 2024 and why?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java 21', 'Java 17', 'Architecture', 'Production'],
      answer: `For any new project starting today, I'd choose Java 21 — no question.

Here's my reasoning:

It's an LTS release — supported until at least 2028, so long-term production stability is guaranteed.

Virtual Threads are a game changer for microservices. If we're building a REST API or Kafka consumer that does I/O — database calls, external API calls — virtual threads let us handle tens of thousands of concurrent requests without complex reactive programming. We get the scalability of async code with the readability of blocking code.

Records mean our DTOs are one-liners instead of needing Lombok or 30 lines of boilerplate. This alone saves significant code volume in a REST API project with many request/response types.

Sealed classes give us better domain modeling — we can define closed type hierarchies and get exhaustive pattern matching in switch expressions.

Spring Boot 3.2+ supports Java 21 fully, including virtual threads with a single property flag.

The only reason I'd choose Java 17 instead of 21 is if the team is using a framework that hasn't certified Java 21 support yet — some older enterprise tools are only tested on Java 17. But for a typical Spring Boot microservice, Java 21 is the clear choice.

I'd avoid Java 11 for new projects — it's approaching end of free Oracle support and lacks Records, Virtual Threads, and all the Java 17+ improvements.`,
      followUp: [
        { question: 'What if the team is still on Java 8 and you need to migrate?', answer: `Migration strategy: First, upgrade to Java 11 — it's source-compatible with Java 8 code (with minor exceptions around removed APIs like javax.xml). Then Java 17 — some JVM flags and internal APIs changed (strong encapsulation), so run with --add-opens as needed, then fix the underlying issues. Then Java 21. The hardest step is usually Java 9+ module system changes — many libraries that used JDK internals via reflection had to be updated. Using libraries that are maintained and up-to-date (Spring, Hibernate, Kafka) makes this smooth. Always upgrade incrementally, not in one jump from 8 to 21.` },
      ],
      tip: 'For interviews: "Java 21 for new projects — LTS, Virtual Threads for scalability, Records for conciseness, sealed classes for domain modeling, Spring Boot 3.2 support." Have a concrete reason for each point.',
    },

    {
      id: 25,
      question: 'What are common Java interview traps and mistakes you should avoid?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Interview Tips', 'Common Mistakes', 'Java 8', 'Java 17', 'Java 21'],
      answer: `Here are the ones that trip people up most often in interviews:

Trap 1 — "this" in a lambda: People say "this refers to the lambda." Wrong. "this" in a lambda refers to the ENCLOSING CLASS. In an anonymous inner class, "this" refers to the anonymous class itself. This is a classic distinction.

Trap 2 — Optional.get() without check: Using opt.get() can throw NoSuchElementException just like NPE can throw. The whole point of Optional is to use orElse, orElseGet, orElseThrow, ifPresent — not get().

Trap 3 — orElse vs orElseGet: orElse(createExpensiveObject()) — createExpensiveObject() is ALWAYS called, even if the Optional has a value. For expensive defaults, always use orElseGet(() -> createExpensiveObject()).

Trap 4 — Stream reuse: A stream can only be consumed once. Calling count() and then collect() on the same stream throws IllegalStateException. Create the stream again from the source.

Trap 5 — Record accessors: People call user.getName() on a record. Records generate name(), not getName(). No "get" prefix.

Trap 6 — Virtual threads for CPU work: Virtual threads solve I/O-bound scalability. If the thread is doing computation — not blocking — virtual threads offer zero benefit. Use a fixed thread pool sized to CPU cores for CPU-intensive work.

Trap 7 — synchronized + I/O with virtual threads: In Java 21, if you have I/O inside a synchronized block, the virtual thread gets pinned to the carrier thread — defeating the purpose. Use ReentrantLock instead.`,
      code: `// TRAP 1: this in lambda
class OrderService {
    String name = "OrderService";
    void setup() {
        Runnable r = () -> System.out.println(this.name); // "OrderService" — enclosing class
        // vs anonymous class:
        Runnable r2 = new Runnable() {
            String name = "Anonymous";
            public void run() {
                System.out.println(this.name); // "Anonymous" — the anonymous class
            }
        };
    }
}

// TRAP 2: Never use Optional.get() without isPresent()
Optional<User> opt = userRepo.findById(id);
User user = opt.get(); // DANGEROUS — throws NoSuchElementException if empty!
User user = opt.orElseThrow(() -> new UserNotFoundException(id)); // SAFE

// TRAP 3: orElse is always evaluated
User u = opt.orElse(new User("default")); // new User() called EVERY TIME — even if opt has value!
User u = opt.orElseGet(() -> new User("default")); // only called if opt is empty

// TRAP 4: Stream reuse
Stream<String> stream = list.stream().filter(s -> s.length() > 3);
long count = stream.count();           // OK
List<String> result = stream.collect(...); // THROWS IllegalStateException!

// TRAP 5: Record accessor naming
record User(String name, int age) {}
User u = new User("Alice", 30);
u.name();      // CORRECT
u.getName();   // COMPILE ERROR — records don't generate getX()

// TRAP 6: VT for CPU work — doesn't help
try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
    exec.submit(() -> compressFile(file));  // CPU-bound — VT gives NO benefit here!
}
// For CPU work: Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors())

// TRAP 7: synchronized + I/O in virtual threads
synchronized (this) {
    result = db.query(sql); // virtual thread PINNED here — bad!
}
// Fix:
lock.lock(); try { result = db.query(sql); } finally { lock.unlock(); }`,
      tip: 'Knowing the traps separates a good candidate from a great one. Mentioning the orElse/orElseGet distinction unprompted shows you understand performance implications, not just syntax.',
    },
  ],
}

export default javaVersions
