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
        'What is the difference between abstraction and encapsulation?',
        'What is method overloading vs method overriding?',
        'Can you override a static method in Java?',
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
        'What is the String pool / String intern pool?',
        'What is the Integer cache? What is its range?',
        'What happens when you use == with null?',
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
        'Can an abstract class have a constructor?',
        'Can you instantiate an abstract class?',
        'What are default methods in interfaces? Why were they added?',
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
        'What is string interning? What does String.intern() do?',
        'What is the String constant pool in JVM?',
        'Why is String immutable in Java?',
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
        'What is the exception hierarchy? (Throwable → Error, Exception → RuntimeException)',
        'What is the finally block? When does it NOT execute?',
        'What is try-with-resources? When was it introduced?',
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
        'What is the difference between heap and stack memory?',
        'What is Metaspace? How is it different from PermGen?',
        'What is a memory leak in Java? Can it happen with garbage collection?',
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
        'What is a Stop-the-World pause?',
        'What is the difference between Minor GC and Major GC?',
        'How do you analyze a heap dump?',
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
        'When does finally NOT execute?',
        'What is AutoCloseable? How does try-with-resources work?',
        'Can you have try without catch? (yes, with finally or with try-with-resources)',
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
        'Can you override a static method?',
        'What is the difference between static nested class and inner class?',
        'Can a static method access instance variables?',
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
        'What is the problem with Singleton in multi-threaded environments?',
        'What is the difference between Factory Method and Abstract Factory?',
        'When would you use Builder over constructor?',
      ],
      tip: 'In Spring context — all @Bean methods are Factory pattern. @Component beans are Singleton. This real-world connection impresses interviewers.',
    },
  ],
}

export default javaCore
