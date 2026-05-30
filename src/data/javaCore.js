const javaCore = {
  title: 'Java Core & OOP',
  description: 'Core Java concepts, OOP principles, Exception Handling, JVM, and Memory Management.',
  tags: ['Java', 'OOP', 'JVM', 'Exception Handling', 'Memory'],
  questions: [
    {
      id: 1,
      question: 'Explain the 4 pillars of OOP with practical examples',
      difficulty: 'beginner',
      asked: true,
      tags: ['OOP'],
      answer: `So the four pillars are Encapsulation, Inheritance, Polymorphism, and Abstraction. Let me explain each with practical examples from my projects.

Encapsulation: Hiding internal state and providing controlled access through getters/setters. In my MetLife project, the Policy class had private fields and you could only access them through methods — this prevented invalid data from being set directly.

Inheritance: "IS-A" relationship. In EPLMS, I had a base Vehicle class and specific subclasses like Truck, Car. They inherited common behavior like registration validation.

Polymorphism: Same method name, different behavior. Method overriding is runtime polymorphism — a Truck and Car both override the calculateLoadCapacity() method differently.

Abstraction: Hiding complexity. In Spring Boot, we use interfaces everywhere — a NotificationService interface with EmailNotificationService and SMSNotificationService implementations. The caller doesn't care which one is being used.`,
      code: `// Encapsulation
public class Policy {
    private String policyNumber;
    private double premium;

    public double getPremium() { return premium; }
    public void setPremium(double premium) {
        if (premium < 0) throw new IllegalArgumentException("Premium cannot be negative");
        this.premium = premium;
    }
}

// Inheritance
class Vehicle {
    protected String registrationNo;
    public void validate() { /* common validation */ }
}

class Truck extends Vehicle {
    private double loadCapacity;

    @Override
    public void validate() {
        super.validate();
        // additional truck validation
    }
}

// Polymorphism (runtime)
interface NotificationService {
    void send(String message, String recipient);
}

class EmailService implements NotificationService {
    @Override
    public void send(String message, String recipient) {
        // send email
    }
}

// Abstraction via interface
// Caller only knows NotificationService, not the implementation
@Autowired
private NotificationService notificationService;`,
      followUp: [
        { question: 'What is the difference between abstraction and encapsulation?', answer: `Abstraction is about WHAT — it hides the complexity of what a class does by exposing only the interface. Encapsulation is about HOW — it protects the internal state using access modifiers (private fields). Abstraction is a design concept; encapsulation is an implementation technique. Example: a Vehicle interface is abstraction (you know it can move()). The Vehicle class's private engine field with a getter is encapsulation.` },
        { question: 'What is method overloading vs method overriding?', answer: `Overloading is compile-time polymorphism — same method name, different parameter types/count in the SAME class. Overriding is runtime polymorphism — subclass provides its own implementation of a method already defined in the parent class with the SAME signature. @Override annotation confirms it's overriding.` },
        { question: 'Can you override a static method in Java?', answer: `No. Static methods are resolved at compile time based on the reference type, not the actual object. If a subclass defines a static method with the same name, it's called "method hiding" — not overriding. Instance methods are resolved at runtime (runtime polymorphism).` },
      ],
      tip: 'No, you cannot override a static method. Static methods are resolved at compile time (method hiding). This is a classic trap question.',
    },
    {
      id: 2,
      question: 'What is the difference between == and .equals() in Java?',
      difficulty: 'beginner',
      asked: true,
      tags: ['Java basics', 'String'],
      answer: `== compares references — it checks if two variables point to the same object in memory. .equals() compares the content/value.

For primitives, == compares values. For objects, == compares memory addresses.

String is special because Java maintains a String pool. String literals go into the pool, but new String("x") creates a new object in heap. This is why two string literals with the same value are == equal, but a literal and a new String() are not.

I had a production bug once where someone used == to compare status strings from a database. Since they came as new String objects (not from pool), the comparison always failed.`,
      code: `// Primitives: == compares values
int a = 5, b = 5;
System.out.println(a == b);  // true

// Object references
String s1 = "Java";          // String pool
String s2 = "Java";          // same pool object
String s3 = new String("Java"); // new heap object

System.out.println(s1 == s2);      // true (same pool reference)
System.out.println(s1 == s3);      // FALSE (different memory)
System.out.println(s1.equals(s3)); // true (same content)

// Integer cache: -128 to 127
Integer x = 127, y = 127;
System.out.println(x == y);  // true (cached!)

Integer p = 128, q = 128;
System.out.println(p == q);  // FALSE (outside cache range)
System.out.println(p.equals(q));  // true`,
      followUp: [
        { question: 'What is the String pool / String intern pool?', answer: `Java maintains a special area in the heap (Metaspace in Java 8+) called the String pool where string literals are stored. When you write String s = "hello", Java checks if "hello" already exists in the pool — if yes, it reuses it. This saves memory. String.intern() forces a heap string into the pool. Two interned strings with the same value are == equal.` },
        { question: 'What is the Integer cache? What is its range?', answer: `Java caches Integer objects from -128 to 127. Integer.valueOf(127) returns the cached instance. Integer.valueOf(128) creates a new object. So Integer x = 127; Integer y = 127; x == y is TRUE (same cached object). But Integer p = 128; Integer q = 128; p == q is FALSE. Always use .equals() for Integer comparison.` },
        { question: 'What happens when you use == with null?', answer: `Completely safe. null == null is true. anyObjectRef == null is safe even if the variable is null — no NullPointerException. NPE only happens when you call a method on null.` },
      ],
      tip: 'The Integer cache covers -128 to 127. This is a famous interview gotcha. Always use .equals() for object comparisons.',
    },
    {
      id: 3,
      question: 'Explain abstract class vs interface. When do you use which?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['OOP', 'Java'],
      answer: `This is a design question, not just a syntax question. Let me explain both.

Abstract class: can have both abstract and concrete methods, can have instance variables, can have constructors, supports single inheritance only.

Interface: prior to Java 8, only abstract methods. Java 8 added default and static methods. Java 9 added private methods. An interface cannot have instance state (only static final constants).

When I use which:
- Abstract class when I have a template method pattern — like a base workflow class where steps are fixed but individual steps can be overridden
- Interface when I want to define a contract that multiple unrelated classes can implement — like Serializable, Runnable, Comparable

In my projects, I use interfaces for service layer contracts. Spring Boot beans wire implementations, not implementations. That's the key.`,
      code: `// Abstract class: base behavior + template
abstract class KafkaEventProcessor {
    // Template method — fixed algorithm
    public final void process(Event event) {
        validate(event);
        transform(event);
        persist(event);
        notify(event);
    }

    protected abstract void validate(Event event);
    protected abstract void transform(Event event);

    // Default behavior — can be overridden
    protected void persist(Event event) {
        eventRepository.save(event);
    }

    protected void notify(Event event) {
        // default: do nothing
    }
}

// Interface: contract with default method (Java 8+)
public interface VehicleService {
    Vehicle findById(Long id);
    List<Vehicle> findAll();

    // Default method — optional override
    default boolean isActive(Vehicle v) {
        return v.getStatus() == Status.ACTIVE;
    }
}

// A class can implement multiple interfaces
class TruckService implements VehicleService, AuditableService {
    // implements both
}`,
      followUp: [
        { question: 'Can an abstract class have a constructor?', answer: `Yes! Abstract classes can have constructors. The constructor cannot be called directly with new (since abstract classes can't be instantiated), but it IS called by the subclass via super(). This is useful for initializing common fields that all subclasses need. Example: abstract class Animal { String name; Animal(String name) { this.name = name; } }` },
        { question: 'Can you instantiate an abstract class?', answer: `No. You cannot do new AbstractClass(). However, you can create an anonymous class that extends it inline — like new AbstractClass() { @Override void method() {} }. But that's an anonymous subclass, not the abstract class itself.` },
        { question: 'What are default methods in interfaces? Why were they added?', answer: `Added in Java 8 to allow backward compatibility — you can add new methods to existing interfaces without breaking all implementing classes. Before Java 8, adding a method to an interface would break every class that implements it. Default methods provide a base implementation that existing classes inherit automatically.` },
      ],
      tip: 'Default methods in interfaces were added to allow backward compatibility — adding new methods to existing interfaces without breaking all implementing classes.',
    },
    {
      id: 4,
      question: 'Explain String, StringBuilder, and StringBuffer. When do you use each?',
      difficulty: 'beginner',
      asked: true,
      tags: ['Java', 'String'],
      answer: `String is immutable — every "modification" creates a new String object. This means concatenating strings in a loop with + is O(n²) — very expensive.

StringBuilder is mutable and NOT thread-safe. Use it in single-threaded code for string building.

StringBuffer is mutable and thread-safe (synchronized). Use it in multi-threaded code.

In my projects, I almost always use StringBuilder for building dynamic SQL queries or constructing Kafka message payloads in single-threaded code. I've never had a real need for StringBuffer because I design concurrent code without shared mutable state.`,
      code: `// String: immutable — BAD for loop concatenation
String result = "";
for (int i = 0; i < 1000; i++) {
    result += i;  // Creates 1000 new String objects!
}

// StringBuilder: mutable, fast, NOT thread-safe
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) {
    sb.append(i);  // Modifies in-place: O(1) amortized
}
String result2 = sb.toString();

// StringBuilder useful methods
sb.append(" text")
  .insert(0, "prefix: ")
  .delete(0, 7)
  .reverse()
  .replace(0, 4, "JAVA");

// StringBuffer: thread-safe (synchronized)
StringBuffer safeSB = new StringBuffer();
// Multiple threads can safely append to this

// String methods (immutable — returns new String)
String s = "Hello World";
s.substring(6)          // "World"
s.toUpperCase()         // "HELLO WORLD"
s.replace("World","Java")  // "Hello Java"
s.trim()               // removes whitespace`,
      followUp: [
        { question: 'What is string interning? What does String.intern() do?', answer: `intern() forces a heap string to use the String pool. After calling str.intern(), if an equal string exists in the pool, the pool's reference is returned. This allows == comparison instead of equals(). Rarely needed in modern code — just use equals() for safety.` },
        { question: 'What is the String constant pool in JVM?', answer: `Part of heap memory (moved from PermGen to heap in Java 7, and metaspace manages it in Java 8+). When JVM loads a class with string literals, it stores unique strings in the pool to avoid duplicates. Constant expressions like "Hello" + "World" are resolved at compile time and pooled.` },
        { question: 'Why is String immutable in Java?', answer: `Three reasons: (1) Thread safety — immutable objects are inherently safe to share between threads. (2) Security — class names, file paths, DB URLs are strings; if mutable, malicious code could change them after validation. (3) Caching hashCode — String is commonly used as HashMap key; immutability means hashCode can be computed once and cached (computed lazily and cached in the hash field).` },
      ],
      tip: 'String is immutable for thread safety, security (ClassLoader uses String), and to enable String pooling. Mention all 3 reasons.',
    },
    {
      id: 5,
      question: 'What is the difference between checked and unchecked exceptions?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Exception Handling', 'Java'],
      answer: `Checked exceptions are compile-time exceptions — you MUST handle them with try-catch or declare them in the method signature with throws. IOException, SQLException are examples.

Unchecked exceptions are runtime exceptions — you don't have to handle them explicitly. NullPointerException, IllegalArgumentException, ArrayIndexOutOfBoundsException extend RuntimeException.

In my Spring Boot services, I create custom runtime exceptions (extending RuntimeException) and let them propagate to a global exception handler (@ControllerAdvice). This is cleaner than checked exceptions which pollute method signatures.`,
      code: `// Checked exception — must handle or declare
public void readFile(String path) throws IOException {
    Files.readAllLines(Paths.get(path));  // throws checked IOException
}

// Unchecked (RuntimeException) — no forced handling
public String findUser(Long id) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new UserNotFoundException("User not found: " + id));
    return user.getName();
}

// Custom exceptions in Spring Boot
@ResponseStatus(HttpStatus.NOT_FOUND)
public class PolicyNotFoundException extends RuntimeException {
    public PolicyNotFoundException(String message) {
        super(message);
    }
}

// Global exception handler
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PolicyNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(PolicyNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse("An unexpected error occurred"));
    }
}`,
      followUp: [
        { question: 'What is the exception hierarchy? (Throwable → Error, Exception → RuntimeException)', answer: `Throwable is at the top. It has two branches: Error (JVM-level problems — OutOfMemoryError, StackOverflowError — not meant to be caught) and Exception. Exception branches into checked exceptions (IOException, SQLException, ClassNotFoundException) and RuntimeException (NullPointerException, IllegalArgumentException, IndexOutOfBoundsException — unchecked).` },
        { question: 'What is the finally block? When does it NOT execute?', answer: `finally always executes EXCEPT: (1) if System.exit() is called inside try/catch — JVM shuts down immediately. (2) if the JVM process is forcefully killed (kill -9). (3) if the thread running the code is interrupted/killed. Note: finally executes even if a return statement is in the try block.` },
        { question: 'What is try-with-resources? When was it introduced?', answer: `Introduced in Java 7. Any class implementing the AutoCloseable interface (which has a close() method) can be used in try(). When the try block exits — normally or via exception — close() is automatically called. No need for a finally block to close connections/streams. Multiple resources can be declared: try(A a = new A(); B b = new B()) — closed in reverse order (B first, then A).` },
      ],
      tip: 'finally does NOT execute if System.exit() is called or if the JVM crashes. Also know that try-with-resources (Java 7) auto-closes AutoCloseable resources.',
    },
    {
      id: 6,
      question: 'Explain JVM architecture and how Java code runs',
      difficulty: 'advanced',
      tags: ['JVM', 'Java'],
      answer: `Java code first gets compiled by javac into bytecode (.class files). Then the JVM executes this bytecode.

JVM architecture has:
1. Class Loader Subsystem: loads, links, and initializes classes
2. Runtime Memory: Heap (objects), Stack (method calls, local vars), Method Area/Metaspace (class metadata), PC Registers, Native Method Stack
3. Execution Engine: Interpreter (initially), JIT Compiler (optimizes hot code), Garbage Collector

The JIT compiler is what makes Java fast — it identifies "hot spots" (frequently executed code) and compiles them to native machine code. That's literally where the name HotSpot JVM comes from.

In production, I've seen JVM tuning flags like -Xmx (max heap), -Xms (initial heap), and GC tuning make a significant difference in application performance.`,
      code: `// JVM Memory Areas
/*
  Heap:
    - Young Gen: Eden + Survivor0 + Survivor1
    - Old Gen (Tenured)
    - Objects live here

  Stack (per thread):
    - Each method call creates a stack frame
    - Local variables + operand stack
    - StackOverflowError = too many nested calls

  Metaspace (Java 8+, replaced PermGen):
    - Class metadata, static variables, method code
    - Grows dynamically (unlike PermGen with fixed size)
    - OutOfMemoryError: Metaspace = leak of class loaders
*/

// Common JVM flags
// java -Xmx512m -Xms256m -XX:+UseG1GC -jar app.jar

// Checking heap usage programmatically
Runtime runtime = Runtime.getRuntime();
long totalMemory = runtime.totalMemory();  // current heap size
long freeMemory = runtime.freeMemory();    // free in heap
long maxMemory = runtime.maxMemory();      // max heap (-Xmx)

System.out.println("Used: " + (totalMemory - freeMemory) / 1024 / 1024 + " MB");`,
      followUp: [
        { question: 'What is the difference between heap and stack memory?', answer: `Stack is per-thread, LIFO, stores method call frames and local primitives/references. Very fast, auto-managed — frame popped when method returns. Stack overflow if too many nested calls. Heap is shared across all threads, stores all objects. GC-managed. Objects live until no references point to them. Heap is much larger than stack.` },
        { question: 'What is Metaspace? How is it different from PermGen?', answer: `Before Java 8, class metadata (class definitions, method bytecode, static variables) lived in PermGen (Permanent Generation) — part of the heap with a FIXED maximum size (-XX:MaxPermSize). PermGen was a common source of OutOfMemoryError in apps that loaded many classes dynamically. Java 8 replaced PermGen with Metaspace — it's in NATIVE memory (not heap) and grows dynamically. You can still cap it with -XX:MaxMetaspaceSize.` },
        { question: 'What is a memory leak in Java? Can it happen with garbage collection?', answer: `Yes, despite GC, memory leaks CAN happen. Common causes: (1) Static collections that grow indefinitely — static Map<String, Object> cache that's never evicted. (2) Event listeners/callbacks registered but never removed — the listener holds a reference to the object, preventing GC. (3) Unclosed resources (Connection, InputStream) — though try-with-resources prevents this. (4) ThreadLocal variables not cleaned up after request. (5) Inner class holding outer class reference. Use VisualVM or heap dump analysis to find them.` },
      ],
      tip: 'Yes, memory leaks CAN happen in Java. Classic examples: unclosed resources, static collections that grow indefinitely, listener/callback registrations that are never removed.',
    },
    {
      id: 7,
      question: 'What is Garbage Collection in Java? Explain different GC algorithms.',
      difficulty: 'advanced',
      asked: true,
      tags: ['JVM', 'GC', 'Memory'],
      answer: `Garbage Collection automatically reclaims heap memory that is no longer reachable. Java uses generational GC based on the observation that most objects are short-lived.

The generations:
- Young Generation: new objects (Eden + two Survivor spaces). Minor GC runs frequently here.
- Old Generation: objects that survived multiple GCs. Major GC runs here — it's expensive.

GC algorithms:
- Serial GC: single-threaded, small apps
- Parallel GC (default pre-Java 9): multiple threads, throughput-focused
- CMS (deprecated): low pause but fragmentation issues
- G1 GC (default Java 9+): divides heap into regions, better predictable pause times
- ZGC (Java 15+): ultra-low pause (<10ms), scales to multi-terabyte heaps

In my EPLMS project we used G1 GC with 4GB heap. We tuned the GC pause target to 200ms which balanced throughput and latency for our Kafka event processing.`,
      code: `// Triggering GC (not guaranteed)
System.gc();           // suggestion to JVM
Runtime.getRuntime().gc();

// GC logging flags
// -XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:gc.log
// Modern: -Xlog:gc*:file=gc.log:time:filecount=5,filesize=20m

// G1GC tuning
// -XX:+UseG1GC
// -XX:MaxGCPauseMillis=200     (target pause time)
// -XX:G1HeapRegionSize=16m     (region size)
// -XX:ParallelGCThreads=4

// Detecting memory leaks
// Use: VisualVM, JProfiler, or Heap dump analysis
// jmap -heap <pid>             (heap summary)
// jmap -dump:format=b,file=heap.hprof <pid>  (heap dump)

// WeakReference — GC can collect it
WeakReference<BigObject> weakRef = new WeakReference<>(new BigObject());
// After GC: weakRef.get() may return null

// Making object eligible for GC
Object obj = new Object();
obj = null;  // eligible for GC now`,
      followUp: [
        { question: 'What is a Stop-the-World pause?', answer: `When GC runs, it needs to pause all application threads momentarily to ensure no objects are modified during collection (prevents corrupted state). This is called Stop-the-World (STW). Minor GC STW is typically 10-50ms (young gen is small). Full GC STW can be seconds on large heaps. ZGC and Shenandoah minimize STW to under 10ms by doing most work concurrently with application threads.` },
        { question: 'What is the difference between Minor GC and Major GC?', answer: `Minor GC collects only the Young Generation (Eden + Survivors). It's fast because young gen is small and most objects are short-lived. Major GC (Full GC) collects the entire heap including Old Generation. Much slower (seconds on large heaps). Major GC is triggered when Old Gen is nearly full or explicitly by System.gc(). In G1GC, "mixed" collections partially collect Old Gen without full stop.` },
        { question: 'How do you analyze a heap dump?', answer: `Take heap dump with: jmap -dump:format=b,file=heap.hprof <pid>. Open with Eclipse Memory Analyzer (MAT) or VisualVM. Look for: (1) Dominator tree — objects that retain the most memory. (2) Histogram — which classes have the most instances. (3) Unreachable objects leaking through GC roots. Classic signs: growing Map/List in static fields, Class objects held by ClassLoaders, connection objects not closed.` },
      ],
      tip: 'In interviews, mention that G1GC is the default from Java 9. ZGC/Shenandoah are for low-latency requirements. Don\'t recommend Serial GC for production.',
    },
    {
      id: 8,
      question: 'What is the final, finally, and finalize in Java?',
      difficulty: 'beginner',
      asked: true,
      tags: ['Java', 'Exception Handling'],
      answer: `These three are completely different things despite the similar name.

final: a keyword. final variable = constant (can't reassign). final method = can't override. final class = can't extend. String is final — that's why it's immutable.

finally: a block in try-catch-finally. It always executes (almost) regardless of exception — perfect for cleanup like closing DB connections. Java 7's try-with-resources mostly replaced the need for finally for resource cleanup.

finalize(): a method on Object that used to be called by GC before collecting an object. It's deprecated in Java 9 and removed usage discouraged. It's unreliable — you don't know when or if GC will call it.`,
      code: `// final keyword
final int MAX = 100;          // constant
// MAX = 200;                 // CompileError

final class ImmutableConfig { }  // can't extend
// class MyConfig extends ImmutableConfig { }  // Error

// final method
class Parent {
    final void compute() { /* can't override */ }
}

// finally block
try {
    Connection conn = dataSource.getConnection();
    // database work
} catch (SQLException e) {
    log.error("DB error", e);
} finally {
    // ALWAYS runs — cleanup here
    connection.close();  // old style
}

// try-with-resources (Java 7+) — better way
try (Connection conn = dataSource.getConnection()) {
    // conn auto-closed when block exits
} catch (SQLException e) {
    log.error("DB error", e);
}

// finalize() — DEPRECATED, don't use
@Override
@Deprecated
protected void finalize() throws Throwable {
    // Called before GC — unreliable, don't rely on this!
    super.finalize();
}`,
      followUp: [
        { question: 'When does finally NOT execute?', answer: `Three cases: (1) System.exit() is called — JVM shuts down before finally runs. (2) JVM is forcefully terminated (kill -9 on Linux, End Task). (3) An infinite loop or deadlock in the try block — finally never gets a chance to run. Important: if an exception is thrown in the finally block itself, the original exception is suppressed (swallowed). Be careful with code that can throw in finally.` },
        { question: 'What is AutoCloseable? How does try-with-resources work?', answer: `AutoCloseable is an interface with a single close() method. Any resource that implements it (Connection, InputStream, ResultSet, etc.) can be used in try-with-resources. Java generates the equivalent of a finally block calling close() — even if close() itself throws. If both the body and close() throw, the exception from the body is propagated and the close() exception is "suppressed" (accessible via Throwable.getSuppressed()).` },
        { question: 'Can you have try without catch? (yes, with finally or with try-with-resources)', answer: `Perfectly valid. You can have try-finally (no catch) for cleanup-only scenarios. You can also have try-with-resources without catch — the resource is still closed. This is common when you want to let the exception propagate up but still ensure cleanup.` },
      ],
    },
    {
      id: 9,
      question: 'Explain static keyword in Java — variables, methods, blocks, nested classes',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java', 'OOP'],
      answer: `static means "belonging to the class, not to any instance".

Static variable: shared across all instances. Memory allocated once when class loads. I use static for constants (static final) and for counters/registries.

Static method: can be called without creating an object. Can only access static members. Factory methods are often static — like Integer.parseInt() or Arrays.asList().

Static block: runs once when the class loads. Used for initialization that needs to happen before any instance is created.

Static nested class: a nested class that doesn't need a reference to the outer class. Used for builder patterns and utility classes.`,
      code: `public class DatabaseConfig {
    // Static variable: shared across all instances
    private static int connectionCount = 0;
    public static final String DEFAULT_SCHEMA = "prod";  // constant

    // Static block: runs once when class is loaded
    static {
        System.out.println("DatabaseConfig class loaded");
        // Can do complex initialization here
    }

    // Static method: no need to create instance
    public static DatabaseConfig create() {
        return new DatabaseConfig();
    }

    // Static nested class: used for Builder pattern
    public static class Builder {
        private String host;
        private int port;

        public Builder host(String host) { this.host = host; return this; }
        public Builder port(int port) { this.port = port; return this; }

        public DatabaseConfig build() { return new DatabaseConfig(); }
    }
}

// Usage
DatabaseConfig config = DatabaseConfig.Builder()
    .host("localhost")
    .port(3306)
    .build();`,
      followUp: [
        { question: 'Can you override a static method?', answer: `No. Static methods are resolved at compile time based on the reference type, not the actual object type. If a subclass defines a static method with the same signature, it's called "method hiding" — not overriding. Polymorphism doesn't apply. Instance methods are resolved at runtime (dynamic dispatch).` },
        { question: 'What is the difference between static nested class and inner class?', answer: `Static nested class has no implicit reference to the outer class. It can be instantiated independently: new Outer.StaticNested(). It can only access static members of the outer class. Inner class (non-static nested) has an implicit reference to the outer instance — it can access all private members of the outer class. To instantiate: outer.new Inner(). Prefer static nested classes for helpers/builders since they don't hold an outer reference (prevents memory leaks).` },
        { question: 'Can a static method access instance variables?', answer: `No. Static methods don't have a "this" reference — they have no object context. They can only access static variables and call other static methods. To access instance variables from a static method, you must pass an object reference as a parameter.` },
      ],
    },
    {
      id: 10,
      question: 'What is a design pattern? Explain Singleton, Factory, and Builder.',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Design Patterns', 'OOP'],
      answer: `Design patterns are proven solutions to common problems in software design. Let me explain the three most asked ones.

Singleton: ensures only one instance exists. Used for database connection pools, config managers, caches. In Spring, all @Service/@Component beans are singletons by default — this is why we must be careful about shared mutable state in services.

Factory: decouples object creation from usage. When you need to create different types but the caller doesn't know which type at compile time.

Builder: for constructing complex objects step by step. I use Lombok's @Builder extensively in Spring Boot for DTOs and entity builders.`,
      code: `// Singleton (Thread-safe with enum — best practice)
public enum AppConfig {
    INSTANCE;
    private final String configFile = "application.properties";

    public String getConfigFile() { return configFile; }
}

// Double-checked locking Singleton
public class ConnectionPool {
    private static volatile ConnectionPool instance;

    private ConnectionPool() {}

    public static ConnectionPool getInstance() {
        if (instance == null) {
            synchronized (ConnectionPool.class) {
                if (instance == null) {  // double-check inside sync
                    instance = new ConnectionPool();
                }
            }
        }
        return instance;
    }
}

// Factory Pattern
public interface NotificationSender {
    void send(String message, String to);
}

public class NotificationFactory {
    public static NotificationSender create(String type) {
        return switch (type) {
            case "EMAIL" -> new EmailSender();
            case "SMS" -> new SmsSender();
            case "PUSH" -> new PushSender();
            default -> throw new IllegalArgumentException("Unknown type: " + type);
        };
    }
}

// Builder Pattern (with Lombok in Spring Boot)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleEvent {
    private String vehicleId;
    private String eventType;
    private LocalDateTime timestamp;
    private double latitude;
    private double longitude;
}

// Usage
VehicleEvent event = VehicleEvent.builder()
    .vehicleId("TRK-001")
    .eventType("CHECK_IN")
    .timestamp(LocalDateTime.now())
    .latitude(28.6139)
    .longitude(77.2090)
    .build();`,
      followUp: [
        { question: 'What is the problem with Singleton in multi-threaded environments?', answer: `Without synchronization, two threads can simultaneously check "is instance null?" and both see null, then both create instances — breaking the singleton. Fix: use double-checked locking with volatile (as shown in the code), or use enum-based singleton (JVM guarantees single instance), or use static inner holder class (lazy and thread-safe via class loading guarantee).` },
        { question: 'What is the difference between Factory Method and Abstract Factory?', answer: `Factory Method is a single method that creates ONE type of object — subclasses override it to change the type. Abstract Factory is a family of related methods that together create a complete set of related objects. Example: Factory Method = createButton(). Abstract Factory = UIFactory with createButton(), createCheckbox(), createDialog() — everything for a specific UI theme (Windows vs Mac).` },
        { question: 'When would you use Builder over constructor?', answer: `Use Builder when: (1) You have many optional parameters (avoids telescoping constructors with 7 overloads). (2) You want named parameters for readability — VehicleEvent.builder().vehicleId("X").eventType("CHECK_IN") is clearer than new VehicleEvent("X", null, "CHECK_IN", null, null). (3) Construction requires multiple steps or validation. (4) You want immutable objects without a huge constructor. Simple objects with 2-3 required params are fine with a constructor.` },
      ],
      tip: 'In Spring context — all @Bean methods are Factory pattern. @Component beans are Singleton. This real-world connection impresses interviewers.',
    },
    {
      id: 11,
      question: 'What are Generics in Java? Why are they used?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java', 'Generics', 'Type Safety'],
      answer: `Generics allow you to write classes, interfaces, and methods that work with any type while providing compile-time type safety. Without generics, you'd use Object and cast manually — risky (ClassCastException at runtime).

Key benefits:
1. Type safety: compiler catches type errors at compile time, not runtime
2. No casting needed
3. Code reuse: one List<T> implementation works for List<String>, List<Integer>, etc.

Type erasure: generics are a compile-time feature. At runtime, the JVM removes type information — List<String> and List<Integer> are both just List. This means you can't do new T() or get the type of T at runtime without extra work.

Bounded type parameters:
- <T extends Comparable<T>>: T must implement Comparable
- <? super Integer>: any type that is Integer or a superclass (lower bound)
- <? extends Number>: any type that is Number or a subclass (upper bound — for reading)`,
      code: `// Generic class
public class ApiResponse<T> {
    private T data;
    private String message;
    private int status;

    public ApiResponse(T data, String message, int status) {
        this.data = data;
        this.message = message;
        this.status = status;
    }
}

// Usage — type-safe, no casting
ApiResponse<VehicleDto> vehicleResponse = new ApiResponse<>(vehicle, "OK", 200);
ApiResponse<List<OrderDto>> ordersResponse = new ApiResponse<>(orders, "OK", 200);

// Generic method
public <T extends Comparable<T>> T findMax(List<T> list) {
    return list.stream().max(Comparator.naturalOrder()).orElseThrow();
}

// Wildcards
public void printList(List<? extends Number> list) {  // read: any Number subtype
    list.forEach(System.out::println);
}

public void addNumbers(List<? super Integer> list) {  // write: Integer or parent
    list.add(42);
}`,
    },
    {
      id: 12,
      question: 'What is Reflection API in Java? When would you use it?',
      difficulty: 'advanced',
      asked: false,
      tags: ['Java', 'Reflection', 'Internals'],
      answer: `Reflection API lets you inspect and manipulate classes, methods, fields, and constructors at runtime — even private ones — without knowing them at compile time.

What you can do:
- Get class info: Class.forName("com.app.Vehicle")
- Inspect methods/fields: clazz.getDeclaredMethods()
- Invoke methods: method.invoke(object, args)
- Access private fields: field.setAccessible(true); field.get(object)
- Create instances: clazz.getDeclaredConstructor().newInstance()

When frameworks use it:
- Spring: uses reflection to inject dependencies, invoke @PostConstruct methods, process annotations
- Jackson: uses reflection to serialize/deserialize objects to/from JSON
- JUnit: discovers @Test methods via reflection and invokes them
- Hibernate: reads @Column, @Table annotations at runtime

When you should use it:
- Building frameworks/libraries
- Testing private methods (though better to test via public API)
- Plugins that load classes by name at runtime

Downsides: slow (bypasses JIT optimizations), breaks encapsulation, fails at compile-time errors only visible at runtime.`,
      code: `// Basic reflection
Class<?> clazz = Class.forName("com.app.VehicleService");

// Get all methods (including private)
Method[] methods = clazz.getDeclaredMethods();
for (Method m : methods) {
    System.out.println(m.getName() + " - " + m.getReturnType());
}

// Invoke a private method (for testing — not production use)
Method privateMethod = clazz.getDeclaredMethod("calculateFare", double.class);
privateMethod.setAccessible(true);  // bypass private access
Object result = privateMethod.invoke(serviceInstance, 10.5);

// Read a private field
Field field = clazz.getDeclaredField("baseRate");
field.setAccessible(true);
double rate = (double) field.get(serviceInstance);

// Create instance without knowing class at compile time
Object instance = clazz.getDeclaredConstructor().newInstance();

// How Spring uses it (simplified):
// @Autowired on a field? Spring does:
// field.setAccessible(true);
// field.set(beanInstance, injectedDependency);`,
    },
    {
      id: 13,
      question: 'Aggregation vs Composition — what is the difference?',
      difficulty: 'beginner',
      asked: true,
      tags: ['OOP', 'Java', 'Design'],
      answer: `Both are "has-a" relationships (one object contains another), but they differ in the lifecycle dependency.

Composition — STRONG ownership:
- The contained object CANNOT exist without the container.
- When the container is destroyed, the contained object is too.
- Example: House has Rooms. If the House is demolished, the Rooms cease to exist.
- In code: the contained object is created inside the parent's constructor/class.

Aggregation — WEAK ownership:
- The contained object CAN exist independently of the container.
- Container and contained have independent lifecycles.
- Example: Department has Employees. If the Department is closed, the Employees still exist.
- In code: the contained object is passed in from outside (constructor injection).

Rule of thumb: if the child makes no sense without the parent → Composition. If the child can live on its own → Aggregation.

In Spring: Dependency Injection is technically Aggregation — the injected service can exist independently.`,
      code: `// Composition — Room cannot exist without House
class House {
    private List<Room> rooms;

    public House(int numRooms) {
        // House CREATES its rooms — owns their lifecycle
        rooms = new ArrayList<>();
        for (int i = 0; i < numRooms; i++) {
            rooms.add(new Room("Room-" + i));  // Room created here
        }
    }
}
// House destroyed → Rooms are garbage collected

// Aggregation — Employee exists independently of Department
class Department {
    private List<Employee> employees;

    public Department(List<Employee> employees) {
        // Department RECEIVES employees — doesn't own their lifecycle
        this.employees = employees;  // employees created externally
    }
}
// Department deleted, but Employee objects still referenced elsewhere

// Spring DI = Aggregation:
@Service
public class OrderService {
    private final PaymentService paymentService;  // injected from outside

    @Autowired
    public OrderService(PaymentService paymentService) {
        this.paymentService = paymentService;  // not created here
    }
}`,
    },
    {
      id: 14,
      question: 'Explain the internal working of HashMap — before and after Java 8.',
      difficulty: 'advanced',
      asked: true,
      tags: ['Java', 'HashMap', 'Collections', 'Internals'],
      answer: `HashMap stores key-value pairs in an array of buckets. The bucket index is determined by: index = hash(key) % capacity.

Before Java 8:
- Each bucket was a singly-linked list
- Collision: multiple keys with same bucket index → linked list grows
- Worst case (many collisions): O(n) for get/put
- Critical issue: in concurrent resize (rehashing), linked list could form a cycle → infinite loop (not thread-safe)

After Java 8 (improved):
- Buckets are still linked lists, BUT when a bucket's list length exceeds TREEIFY_THRESHOLD (8), it converts to a Red-Black Tree
- After treeification: get/put is O(log n) even in worst case for that bucket
- When elements reduce below UNTREEIFY_THRESHOLD (6), converts back to linked list

Key details:
- Default initial capacity: 16
- Load factor: 0.75 (resize when 75% full)
- On resize: capacity doubles, all entries rehashed
- hashCode() + equals() must be consistent: objects that are equal must have same hashCode

HashMap is NOT thread-safe. Use ConcurrentHashMap for concurrent access.`,
      code: `// HashMap internal structure (simplified)
// Node<K,V>[] table — array of buckets
// Each bucket: LinkedList<Node> (before Java 8) or TreeNode (after Java 8 when many collisions)

// How put() works:
// map.put("vehicle-001", vehicleDto)
// 1. key.hashCode() → hash → bucket index
// 2. If bucket empty → create new Node, place it
// 3. If bucket has nodes → check each for key equality (equals())
//    - Key found: update value
//    - Key not found: add to list (Java 8: add to tree if bucket size >= 8)
// 4. If size > capacity * loadFactor (0.75) → resize (double capacity, rehash all)

HashMap<String, Integer> map = new HashMap<>(16, 0.75f); // default

// hashCode + equals contract (always override both)
@Override
public int hashCode() {
    return Objects.hash(vehicleId, registrationNo);
}

@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof Vehicle v)) return false;
    return Objects.equals(vehicleId, v.vehicleId) &&
           Objects.equals(registrationNo, v.registrationNo);
}`,
    },
    {
      id: 15,
      question: 'HashMap vs ConcurrentHashMap vs LinkedHashMap vs TreeMap',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java', 'Collections', 'Thread Safety'],
      answer: `HashMap:
- Not thread-safe. Fast O(1) get/put average.
- No ordering guarantee.
- Allows one null key, multiple null values.
- Use in single-threaded contexts.

ConcurrentHashMap:
- Thread-safe without synchronizing the entire map.
- In Java 8+: uses CAS (Compare-And-Swap) and synchronized per-bucket instead of locking the whole map.
- Does NOT allow null keys or null values (throws NullPointerException).
- Use for concurrent access from multiple threads.

LinkedHashMap:
- Maintains INSERTION ORDER (by default) or ACCESS ORDER (LRU cache).
- Slightly slower than HashMap due to extra linked list maintenance.
- Use when you need predictable iteration order.
- Classic use: LRU Cache (access-order LinkedHashMap with removeEldestEntry override).

TreeMap:
- Maintains keys in SORTED ORDER (natural ordering or custom Comparator).
- O(log n) for get/put (Red-Black Tree underneath).
- Use when you need sorted keys or range queries (subMap, headMap, tailMap).`,
      code: `// HashMap — fastest, no ordering
Map<String, VehicleDto> map = new HashMap<>();

// ConcurrentHashMap — thread-safe, no null keys
ConcurrentHashMap<String, VehicleDto> concurrentMap = new ConcurrentHashMap<>();
concurrentMap.computeIfAbsent("vehicle-001", k -> loadFromDb(k));  // atomic

// LinkedHashMap — preserves insertion order
Map<String, Integer> orderedMap = new LinkedHashMap<>();

// LRU Cache using access-order LinkedHashMap
Map<String, VehicleDto> lruCache = new LinkedHashMap<>(100, 0.75f, true) {
    @Override
    protected boolean removeEldestEntry(Map.Entry<String, VehicleDto> eldest) {
        return size() > 100;  // evict oldest access when > 100 entries
    }
};

// TreeMap — sorted by key
Map<String, VehicleDto> sortedMap = new TreeMap<>();  // alphabetical order
Map<String, VehicleDto> reverseMap = new TreeMap<>(Comparator.reverseOrder());

// Range query — all keys between "A" and "M"
SortedMap<String, VehicleDto> range = ((TreeMap<String, VehicleDto>) sortedMap)
    .subMap("A", "M");`,
    },
    {
      id: 16,
      question: 'What is the String Pool in Java? How does String interning work?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java', 'String', 'Memory'],
      answer: `String Pool (String Intern Pool) is a special area in the heap (part of metaspace since Java 8) where Java stores string literals to avoid creating duplicate String objects.

When you write String s = "hello", Java:
1. Checks if "hello" already exists in the pool
2. If yes → returns reference to existing object
3. If no → creates new String in pool, returns reference

So two string literals with same value share the same object:
String a = "hello";  // creates in pool
String b = "hello";  // returns SAME object from pool
a == b → TRUE (same reference)

new String("hello") BYPASSES the pool — always creates a new object on the heap.
a == new String("hello") → FALSE (different object, same content)

String.intern() forces a string to use the pool:
String c = new String("hello").intern(); // now uses pool object
a == c → TRUE

Why strings are immutable:
- Security (passwords, file paths can't be modified after passing)
- Thread safety (immutable = safe to share between threads)
- Caching hashCode (computed once, reused — important since String is common Map key)
- Enables String Pool (mutable strings couldn't be safely shared)`,
      code: `String a = "hello";        // pool
String b = "hello";        // same pool object
String c = new String("hello");  // new heap object, NOT pool

System.out.println(a == b);          // true  — same reference
System.out.println(a == c);          // false — different object
System.out.println(a.equals(c));     // true  — same content
System.out.println(a == c.intern()); // true  — intern() puts c in pool

// String concatenation with + creates new objects
String s1 = "Hello";
String s2 = "World";
String s3 = s1 + s2;  // new object on heap (not pooled)

// BUT compile-time constants are pooled:
String s4 = "Hello" + "World";  // compiler resolves to "HelloWorld" → pooled

// StringBuilder is better for repeated concatenation in loops
StringBuilder sb = new StringBuilder();
for (String item : items) {
    sb.append(item).append(",");  // no new String per iteration
}
String result = sb.toString();`,
    },
    {
      id: 17,
      question: 'How do you make a class immutable in Java?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java', 'Immutability', 'Thread Safety'],
      answer: `An immutable class is one whose state cannot be changed after construction. All instances are effectively final. Examples in JDK: String, Integer, LocalDate.

Rules to make a class immutable:
1. Declare class as final (prevents subclassing that could override methods and break immutability)
2. All fields must be private and final
3. No setters
4. Initialize all fields via constructor
5. Defensive copying for mutable fields:
   - In constructor: copy incoming mutable objects (don't store reference directly)
   - In getters: return copies of mutable fields (don't expose internal reference)

Why immutability is valuable:
- Thread safety: immutable objects can be shared freely between threads without synchronization
- Safe as HashMap keys: hashCode never changes
- Predictable behavior: no side effects`,
      code: `// Immutable Vehicle class
public final class Vehicle {  // 1. final class

    private final String regNo;       // 2. private final fields
    private final String owner;
    private final List<String> documents;  // mutable field — needs defensive copy

    public Vehicle(String regNo, String owner, List<String> documents) {
        this.regNo = regNo;
        this.owner = owner;
        // 5a. Defensive copy in constructor (don't store the caller's reference)
        this.documents = List.copyOf(documents);  // unmodifiable copy
    }

    // 3. No setters

    // 4. Getters only
    public String getRegNo() { return regNo; }
    public String getOwner() { return owner; }

    // 5b. Defensive copy in getter (don't expose internal mutable reference)
    public List<String> getDocuments() {
        return List.copyOf(documents);  // caller can't modify our list
    }
}

// Java 16+ Record — automatically immutable
public record VehicleRecord(String regNo, String owner, List<String> documents) {
    // Compact constructor for validation
    public VehicleRecord {
        documents = List.copyOf(documents);  // defensive copy
    }
}`,
    },
  ],
}

export default javaCore
