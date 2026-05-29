const designPatterns = {
  title: 'Design Patterns',
  description: 'Gang of Four patterns — Creational, Structural, and Behavioral — with Java examples.',
  tags: ['Creational', 'Structural', 'Behavioral', 'GOF', 'Java'],
  questions: [
    {
      id: 1,
      question: 'What is the Singleton pattern and how do you implement it thread-safely in Java?',
      difficulty: 'intermediate',
      tags: ['Creational', 'Singleton'],
      answer: `Singleton ensures a class has only one instance and provides a global access point to it. The naive implementation is not thread-safe. In Java, the best approach is using the enum or double-checked locking.

The enum-based singleton is the simplest and handles serialization automatically. Double-checked locking uses volatile to prevent instruction reordering.

I used Singleton in my MetLife project for the configuration manager — one instance reads properties file at startup and serves all threads.`,
      code: `// Best approach: Enum Singleton
public enum ConfigManager {
    INSTANCE;
    private final Properties props = new Properties();

    ConfigManager() {
        try { props.load(getClass().getResourceAsStream("/app.properties")); }
        catch (Exception e) { throw new RuntimeException(e); }
    }

    public String get(String key) { return props.getProperty(key); }
}

// Usage
String url = ConfigManager.INSTANCE.get("db.url");

// Double-checked locking (if enum not suitable)
public class DatabasePool {
    private static volatile DatabasePool instance;

    private DatabasePool() {}

    public static DatabasePool getInstance() {
        if (instance == null) {
            synchronized (DatabasePool.class) {
                if (instance == null) instance = new DatabasePool();
            }
        }
        return instance;
    }
}`,
    },
    {
      id: 2,
      question: 'Explain the Factory Method and Abstract Factory patterns with examples.',
      difficulty: 'intermediate',
      tags: ['Creational', 'Factory'],
      answer: `Factory Method defines an interface for creating an object but lets subclasses decide which class to instantiate. It delegates instantiation to subclasses.

Abstract Factory provides an interface for creating families of related objects without specifying concrete classes.

In Spring, BeanFactory and ApplicationContext are classic examples. I used Factory Method in EPLMS for creating different notification types — Email, SMS, Push.`,
      code: `// Factory Method
public interface NotificationFactory {
    Notification createNotification();
}

public class EmailNotificationFactory implements NotificationFactory {
    @Override
    public Notification createNotification() {
        return new EmailNotification();
    }
}

public class SMSNotificationFactory implements NotificationFactory {
    @Override
    public Notification createNotification() {
        return new SMSNotification();
    }
}

// Abstract Factory — family of related objects
public interface UIFactory {
    Button createButton();
    TextField createTextField();
}

public class DarkThemeFactory implements UIFactory {
    public Button createButton() { return new DarkButton(); }
    public TextField createTextField() { return new DarkTextField(); }
}

public class LightThemeFactory implements UIFactory {
    public Button createButton() { return new LightButton(); }
    public TextField createTextField() { return new LightTextField(); }
}`,
    },
    {
      id: 3,
      question: 'What is the Builder pattern? When should you use it?',
      difficulty: 'beginner',
      tags: ['Creational', 'Builder'],
      answer: `Builder separates the construction of a complex object from its representation. Use it when an object has many optional parameters (avoids telescoping constructors) or when construction needs to happen step-by-step.

Lombok's @Builder annotation generates this automatically. I use it for domain objects in Spring Boot — like building a Request/Response DTO with many optional fields.`,
      code: `// Without builder — telescoping constructor problem
public Policy(String id, String type, double premium, Date start, Date end, boolean active) { }

// With builder
public class Policy {
    private final String id;
    private final String type;
    private final double premium;
    private final Date startDate;
    private final Date endDate;
    private final boolean active;

    private Policy(Builder b) {
        this.id = b.id; this.type = b.type;
        this.premium = b.premium; this.startDate = b.startDate;
        this.endDate = b.endDate; this.active = b.active;
    }

    public static class Builder {
        private String id, type;
        private double premium;
        private Date startDate, endDate;
        private boolean active = true;

        public Builder id(String id) { this.id = id; return this; }
        public Builder type(String type) { this.type = type; return this; }
        public Builder premium(double p) { this.premium = p; return this; }
        public Builder startDate(Date d) { this.startDate = d; return this; }
        public Builder endDate(Date d) { this.endDate = d; return this; }
        public Builder active(boolean a) { this.active = a; return this; }
        public Policy build() { return new Policy(this); }
    }
}

// Usage
Policy p = new Policy.Builder()
    .id("POL-001").type("Life").premium(5000.0)
    .startDate(new Date()).active(true).build();

// With Lombok
@Builder
@Data
public class Policy {
    private String id, type;
    private double premium;
    private Date startDate, endDate;
    private boolean active;
}`,
    },
    {
      id: 4,
      question: 'Explain the Proxy pattern. How does Spring AOP use it?',
      difficulty: 'advanced',
      tags: ['Structural', 'Proxy', 'Spring AOP'],
      answer: `Proxy provides a surrogate or placeholder for another object to control access to it. Types: Virtual Proxy (lazy loading), Protection Proxy (access control), Remote Proxy (remote object), Logging Proxy (cross-cutting concerns).

Spring AOP uses JDK Dynamic Proxy (for interface-based beans) or CGLIB proxy (for class-based beans). When you use @Transactional, @Cacheable, or @Async, Spring wraps your bean in a proxy that intercepts the method call and adds the cross-cutting behavior.

This is why self-invocation doesn't work with Spring AOP — calling this.myMethod() bypasses the proxy.`,
      code: `// Manual Proxy example
public interface OrderService {
    Order placeOrder(OrderRequest req);
}

// Real implementation
public class OrderServiceImpl implements OrderService {
    public Order placeOrder(OrderRequest req) {
        // actual logic
    }
}

// Logging proxy
public class LoggingOrderServiceProxy implements OrderService {
    private final OrderService delegate;
    private final Logger log = LoggerFactory.getLogger(getClass());

    public LoggingOrderServiceProxy(OrderService delegate) {
        this.delegate = delegate;
    }

    public Order placeOrder(OrderRequest req) {
        log.info("Placing order: {}", req);
        long start = System.currentTimeMillis();
        Order result = delegate.placeOrder(req);
        log.info("Order placed in {}ms", System.currentTimeMillis() - start);
        return result;
    }
}

// Spring AOP does this automatically
@Aspect
@Component
public class LoggingAspect {
    @Around("execution(* com.example.service.*.*(..))")
    public Object logAround(ProceedingJoinPoint jp) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = jp.proceed();
        log.info("{} took {}ms", jp.getSignature(), System.currentTimeMillis() - start);
        return result;
    }
}`,
    },
    {
      id: 5,
      question: 'What is the Observer pattern? How is it used in Spring events?',
      difficulty: 'intermediate',
      tags: ['Behavioral', 'Observer', 'Spring Events'],
      answer: `Observer defines a one-to-many dependency so that when one object changes state, all its dependents are notified automatically. Subject (publisher) maintains a list of observers (subscribers) and notifies them on state change.

Spring's ApplicationEventPublisher is built on Observer. You publish an event and all listeners react. This decouples components — the order service doesn't need to know about email, inventory, or analytics services.

I used Spring Events in MetLife to trigger downstream actions after policy creation — send welcome email, update audit log, notify agents.`,
      code: `// Spring Events — Observer pattern built-in
// 1. Define event
public class PolicyCreatedEvent extends ApplicationEvent {
    private final Policy policy;
    public PolicyCreatedEvent(Object source, Policy policy) {
        super(source);
        this.policy = policy;
    }
    public Policy getPolicy() { return policy; }
}

// 2. Publisher (Subject)
@Service
public class PolicyService {
    @Autowired
    private ApplicationEventPublisher publisher;

    public Policy createPolicy(PolicyRequest req) {
        Policy policy = policyRepository.save(new Policy(req));
        publisher.publishEvent(new PolicyCreatedEvent(this, policy));
        return policy;
    }
}

// 3. Listeners (Observers) — completely decoupled
@Component
public class EmailListener {
    @EventListener
    public void onPolicyCreated(PolicyCreatedEvent event) {
        emailService.sendWelcome(event.getPolicy());
    }
}

@Component
public class AuditListener {
    @EventListener
    @Async  // runs in separate thread
    public void onPolicyCreated(PolicyCreatedEvent event) {
        auditService.log("Policy created: " + event.getPolicy().getId());
    }
}`,
    },
    {
      id: 6,
      question: 'Explain Strategy pattern with a real example.',
      difficulty: 'intermediate',
      tags: ['Behavioral', 'Strategy'],
      answer: `Strategy defines a family of algorithms, encapsulates each one, and makes them interchangeable. It lets the algorithm vary independently from clients that use it. Replaces if-else/switch chains with polymorphism.

Classic use case: payment processing, sorting algorithms, discount calculation. In Spring, it's used heavily — PasswordEncoder has BCryptPasswordEncoder, SCryptPasswordEncoder, etc.`,
      code: `// Strategy pattern for payment processing
public interface PaymentStrategy {
    void pay(double amount);
}

public class CreditCardStrategy implements PaymentStrategy {
    private String cardNumber;
    public CreditCardStrategy(String cardNumber) { this.cardNumber = cardNumber; }
    public void pay(double amount) {
        System.out.println("Paid " + amount + " via credit card " + cardNumber);
    }
}

public class UPIStrategy implements PaymentStrategy {
    private String upiId;
    public UPIStrategy(String upiId) { this.upiId = upiId; }
    public void pay(double amount) {
        System.out.println("Paid " + amount + " via UPI " + upiId);
    }
}

// Context
public class PaymentContext {
    private PaymentStrategy strategy;

    public void setStrategy(PaymentStrategy strategy) {
        this.strategy = strategy;
    }

    public void executePayment(double amount) {
        strategy.pay(amount);
    }
}

// Usage — no if-else needed
PaymentContext ctx = new PaymentContext();
ctx.setStrategy(new UPIStrategy("randhir@upi"));
ctx.executePayment(5000.0);

// In Spring Boot with @Qualifier or Map injection
@Service
public class PaymentService {
    private final Map<String, PaymentStrategy> strategies;

    public PaymentService(List<PaymentStrategy> strategyList) {
        strategies = strategyList.stream()
            .collect(Collectors.toMap(s -> s.getClass().getSimpleName(), s -> s));
    }

    public void pay(String type, double amount) {
        strategies.get(type).pay(amount);
    }
}`,
    },
    {
      id: 7,
      question: 'What is the Decorator pattern? How does Java I/O use it?',
      difficulty: 'intermediate',
      tags: ['Structural', 'Decorator'],
      answer: `Decorator attaches additional responsibilities to an object dynamically. It provides a flexible alternative to subclassing for extending functionality. Wraps the original object and adds behavior before/after delegating.

Java I/O is the classic example: InputStream, BufferedInputStream, GZIPInputStream all wrap each other. Spring Security's filter chain is also a decorator chain.`,
      code: `// Java I/O — Decorator in action
InputStream raw = new FileInputStream("file.txt");
InputStream buffered = new BufferedInputStream(raw);       // adds buffering
InputStream gzipped = new GZIPInputStream(buffered);       // adds decompression

// Custom Decorator
public interface TextProcessor {
    String process(String text);
}

public class PlainTextProcessor implements TextProcessor {
    public String process(String text) { return text; }
}

public abstract class TextProcessorDecorator implements TextProcessor {
    protected final TextProcessor wrapped;
    public TextProcessorDecorator(TextProcessor wrapped) { this.wrapped = wrapped; }
}

public class UpperCaseDecorator extends TextProcessorDecorator {
    public UpperCaseDecorator(TextProcessor w) { super(w); }
    public String process(String text) { return wrapped.process(text).toUpperCase(); }
}

public class TrimDecorator extends TextProcessorDecorator {
    public TrimDecorator(TextProcessor w) { super(w); }
    public String process(String text) { return wrapped.process(text).trim(); }
}

// Chain decorators
TextProcessor processor = new UpperCaseDecorator(new TrimDecorator(new PlainTextProcessor()));
processor.process("  hello world  "); // "HELLO WORLD"`,
    },
    {
      id: 8,
      question: 'Explain Template Method pattern. How does Spring use it?',
      difficulty: 'intermediate',
      tags: ['Behavioral', 'Template Method', 'Spring'],
      answer: `Template Method defines the skeleton of an algorithm in a base class and lets subclasses override specific steps without changing the structure. The base class calls abstract methods that subclasses implement.

Spring uses this extensively: JdbcTemplate, RestTemplate, JmsTemplate — the "Template" in their names is literal. The base class handles connection management, exception handling, resource cleanup. You just provide the SQL/callback.`,
      code: `// Custom Template Method
public abstract class DataExporter {
    // Template method — defines the algorithm skeleton
    public final void export(String destination) {
        connect();
        List<Object> data = fetchData();
        List<String> formatted = formatData(data);
        writeToDestination(formatted, destination);
        disconnect();
    }

    protected abstract void connect();
    protected abstract List<Object> fetchData();
    protected abstract List<String> formatData(List<Object> data);
    protected abstract void writeToDestination(List<String> data, String dest);
    protected abstract void disconnect();
}

public class CSVExporter extends DataExporter {
    protected void connect() { /* connect to DB */ }
    protected List<Object> fetchData() { return jdbcTemplate.queryForList("SELECT * FROM policies"); }
    protected List<String> formatData(List<Object> data) { return data.stream().map(Object::toString).collect(toList()); }
    protected void writeToDestination(List<String> data, String path) { /* write CSV */ }
    protected void disconnect() { /* close connection */ }
}

// Spring's JdbcTemplate — you only write the SQL
jdbcTemplate.query("SELECT * FROM users WHERE id = ?",
    (rs, rowNum) -> new User(rs.getLong("id"), rs.getString("name")),
    userId);
// Spring handles: connection, prepared statement, result set iteration, exception translation, cleanup`,
    },
    {
      id: 9,
      question: 'What is the Chain of Responsibility pattern? Where is it used in Spring?',
      difficulty: 'advanced',
      tags: ['Behavioral', 'Chain of Responsibility', 'Spring Security'],
      answer: `Chain of Responsibility passes a request along a chain of handlers. Each handler decides to process or pass it to the next. Decouples sender from receiver.

Spring Security's FilterChain is the most prominent example. Each filter (AuthenticationFilter, AuthorizationFilter, CorsFilter) processes the request and calls chain.doFilter() to pass it forward. Servlet filters in general follow this pattern.`,
      code: `// Custom Chain of Responsibility
public abstract class RequestHandler {
    private RequestHandler next;

    public RequestHandler setNext(RequestHandler next) {
        this.next = next;
        return next;
    }

    public abstract void handle(HttpRequest request);

    protected void passToNext(HttpRequest request) {
        if (next != null) next.handle(request);
    }
}

public class AuthHandler extends RequestHandler {
    public void handle(HttpRequest request) {
        if (request.getHeader("Authorization") == null) {
            throw new UnauthorizedException("No auth token");
        }
        passToNext(request);
    }
}

public class RateLimitHandler extends RequestHandler {
    public void handle(HttpRequest request) {
        if (rateLimiter.isExceeded(request.getClientIp())) {
            throw new TooManyRequestsException();
        }
        passToNext(request);
    }
}

public class LoggingHandler extends RequestHandler {
    public void handle(HttpRequest request) {
        log.info("Request: {} {}", request.getMethod(), request.getPath());
        passToNext(request);
    }
}

// Wire the chain
RequestHandler chain = new AuthHandler();
chain.setNext(new RateLimitHandler()).setNext(new LoggingHandler());
chain.handle(request);

// Spring Security filter chain equivalent
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http
        .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
}`,
    },
    {
      id: 10,
      question: 'What is the Command pattern? Give a real-world use case.',
      difficulty: 'intermediate',
      tags: ['Behavioral', 'Command'],
      answer: `Command encapsulates a request as an object, allowing you to parameterize clients, queue operations, log requests, and support undo/redo. It decouples the object that invokes the operation from the one that knows how to perform it.

Real use cases: undo/redo in editors, job queues, transaction rollback, REST API command objects.`,
      code: `// Command pattern for order management
public interface Command {
    void execute();
    void undo();
}

public class PlaceOrderCommand implements Command {
    private final OrderService orderService;
    private final OrderRequest request;
    private Order createdOrder;

    public PlaceOrderCommand(OrderService service, OrderRequest req) {
        this.orderService = service; this.request = req;
    }

    public void execute() { createdOrder = orderService.place(request); }
    public void undo() { if (createdOrder != null) orderService.cancel(createdOrder.getId()); }
}

// Invoker — can queue, log, or batch commands
public class CommandExecutor {
    private final Deque<Command> history = new ArrayDeque<>();

    public void execute(Command cmd) {
        cmd.execute();
        history.push(cmd);
    }

    public void undoLast() {
        if (!history.isEmpty()) history.pop().undo();
    }
}

// Usage
CommandExecutor executor = new CommandExecutor();
executor.execute(new PlaceOrderCommand(orderService, req));
executor.undoLast(); // cancels the order`,
    },
    {
      id: 11,
      question: 'Explain Adapter and Facade patterns — what is the difference?',
      difficulty: 'intermediate',
      tags: ['Structural', 'Adapter', 'Facade'],
      answer: `Adapter converts an interface into another interface that clients expect. It makes incompatible interfaces work together — like an electrical plug adapter. You use it when integrating a third-party library whose interface doesn't match your code.

Facade provides a simplified interface to a complex subsystem. It doesn't change interfaces — it creates a higher-level interface that makes the subsystem easier to use.

Key difference: Adapter makes things work together that couldn't before. Facade makes a complex system simpler.`,
      code: `// Adapter — third-party payment gateway has different interface
// Third-party (can't change this)
public class LegacyPaymentGateway {
    public boolean processPaymentXML(String xmlPayload) { /* legacy XML API */ return true; }
}

// Your interface
public interface PaymentGateway {
    boolean pay(PaymentRequest request);
}

// Adapter wraps the legacy
public class LegacyPaymentAdapter implements PaymentGateway {
    private final LegacyPaymentGateway legacy;

    public LegacyPaymentAdapter(LegacyPaymentGateway legacy) { this.legacy = legacy; }

    public boolean pay(PaymentRequest request) {
        String xml = "<payment><amount>" + request.getAmount() + "</amount></payment>";
        return legacy.processPaymentXML(xml);
    }
}

// Facade — simplify a complex subsystem
public class OrderFacade {
    private final InventoryService inventory;
    private final PaymentService payment;
    private final ShippingService shipping;
    private final NotificationService notification;

    // Clients call one method instead of orchestrating 4 services
    public OrderConfirmation placeOrder(OrderRequest req) {
        inventory.reserve(req.getItems());
        PaymentResult paid = payment.charge(req.getPayment());
        Shipment shipment = shipping.schedule(req.getAddress());
        notification.sendConfirmation(req.getEmail(), shipment.getTrackingId());
        return new OrderConfirmation(paid.getTransactionId(), shipment.getTrackingId());
    }
}`,
    },
    {
      id: 12,
      question: 'What is the Repository pattern? How does Spring Data JPA implement it?',
      difficulty: 'intermediate',
      tags: ['Structural', 'Repository', 'Spring Data'],
      answer: `Repository mediates between the domain and data mapping layers using a collection-like interface for accessing domain objects. It abstracts the data store and provides a cleaner API for domain-layer code.

Spring Data JPA implements Repository via JpaRepository. You define the interface, Spring generates the implementation at runtime using reflection and proxy. Method names are parsed to generate JPQL — findByEmailAndActive becomes SELECT u FROM User u WHERE u.email = ? AND u.active = ?.`,
      code: `// Spring Data JPA Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Spring generates SQL from method name
    Optional<User> findByEmail(String email);
    List<User> findByActiveTrue();
    List<User> findByDepartmentAndSalaryGreaterThan(String dept, double salary);

    // Custom query
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.active = true")
    List<User> findActiveByRole(@Param("role") String role);

    // Native query
    @Query(value = "SELECT * FROM users WHERE last_login < NOW() - INTERVAL 30 DAY",
           nativeQuery = true)
    List<User> findInactiveUsers();

    // Pagination
    Page<User> findByDepartment(String dept, Pageable pageable);
}

// Service layer — no SQL, no JDBC
@Service
public class UserService {
    @Autowired
    private UserRepository repo;

    public User getUser(Long id) {
        return repo.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));
    }

    public Page<User> getUsersByDept(String dept, int page, int size) {
        return repo.findByDepartment(dept, PageRequest.of(page, size, Sort.by("name")));
    }
}`,
    },
    {
      id: 13,
      question: 'What are the SOLID principles? Give Java examples.',
      difficulty: 'intermediate',
      tags: ['SOLID', 'OOP Design'],
      answer: `SOLID is an acronym for 5 design principles that make software more maintainable and extensible:

S — Single Responsibility: A class should have only one reason to change.
O — Open/Closed: Open for extension, closed for modification. Add new behavior via new classes, not by editing existing ones.
L — Liskov Substitution: Subclasses should be substitutable for their parent class.
I — Interface Segregation: Clients should not be forced to implement interfaces they don't use.
D — Dependency Inversion: Depend on abstractions, not concretions.`,
      code: `// S — Single Responsibility
// Bad: one class does too much
class UserService { save(); sendEmail(); generateReport(); }

// Good: split responsibilities
class UserRepository { save(); }
class UserEmailService { sendWelcome(); }
class UserReportService { generateReport(); }

// O — Open/Closed
// Bad: modify existing class for new discount type
class DiscountCalculator {
    double calc(String type, double price) {
        if (type.equals("STUDENT")) return price * 0.8;
        if (type.equals("SENIOR")) return price * 0.7;
        // must edit this class for every new type
    }
}
// Good: extend via new class
interface DiscountStrategy { double apply(double price); }
class StudentDiscount implements DiscountStrategy { public double apply(double p) { return p * 0.8; } }
class SeniorDiscount implements DiscountStrategy { public double apply(double p) { return p * 0.7; } }

// L — Liskov Substitution
// Bad: subclass breaks contract
class Bird { void fly() {} }
class Penguin extends Bird { void fly() { throw new UnsupportedOperationException(); } }
// Good: separate interfaces
interface FlyingBird { void fly(); }
class Sparrow implements FlyingBird { public void fly() {} }
class Penguin { void swim() {} } // doesn't implement FlyingBird

// I — Interface Segregation
// Bad: fat interface
interface Worker { void work(); void eat(); void sleep(); }
// Good: split
interface Workable { void work(); }
interface Eatable { void eat(); }

// D — Dependency Inversion
// Bad: depends on concrete class
class OrderService { private MySQLOrderRepo repo = new MySQLOrderRepo(); }
// Good: depends on abstraction
class OrderService {
    private final OrderRepository repo; // interface
    public OrderService(OrderRepository repo) { this.repo = repo; } // injected
}`,
    },
    {
      id: 14,
      question: 'What is the Circuit Breaker pattern? How does Resilience4j implement it?',
      difficulty: 'advanced',
      tags: ['Behavioral', 'Resilience', 'Microservices'],
      answer: `Circuit Breaker prevents an application from repeatedly trying to execute an operation that's likely to fail. Like an electrical circuit breaker, it has three states: Closed (normal), Open (failing, fast-fail), Half-Open (testing recovery).

When failure rate exceeds a threshold, it trips to Open state — all calls fail immediately without hitting the downstream service. After a wait duration, it goes Half-Open to test if the service recovered.

Resilience4j implements this via annotations or programmatic API. I used it in EPLMS for third-party vehicle verification API calls.`,
      code: `// Resilience4j Circuit Breaker
// application.yml
resilience4j.circuitbreaker:
  instances:
    vehicleService:
      failure-rate-threshold: 50       # open if 50% of calls fail
      wait-duration-in-open-state: 10s # wait 10s before trying again
      sliding-window-size: 10          # evaluate last 10 calls

// Service
@Service
public class VehicleVerificationService {

    @CircuitBreaker(name = "vehicleService", fallbackMethod = "verifyFallback")
    @Retry(name = "vehicleService")
    @TimeLimiter(name = "vehicleService")
    public CompletableFuture<VerificationResult> verify(String registrationNo) {
        return CompletableFuture.supplyAsync(() ->
            externalApiClient.verify(registrationNo)
        );
    }

    // Fallback when circuit is open
    public CompletableFuture<VerificationResult> verifyFallback(
            String registrationNo, Exception ex) {
        log.warn("Circuit open for vehicle verification, using fallback");
        return CompletableFuture.completedFuture(
            VerificationResult.pending(registrationNo)
        );
    }
}`,
    },
    {
      id: 15,
      question: 'Explain Prototype pattern and when to use it in Java.',
      difficulty: 'intermediate',
      tags: ['Creational', 'Prototype'],
      answer: `Prototype creates new objects by copying an existing object (prototype). Use it when object creation is expensive and a similar object already exists, or when you want to avoid building a class hierarchy of factories.

Java supports this via the Cloneable interface and clone() method, but deep cloning requires care. Spring's prototype scope is named after this pattern — each bean request gets a new instance.`,
      code: `// Implementing Prototype with deep copy
public class QueryConfig implements Cloneable {
    private String sql;
    private List<Object> params;  // mutable — needs deep copy
    private Map<String, Object> hints;

    @Override
    public QueryConfig clone() {
        try {
            QueryConfig copy = (QueryConfig) super.clone();
            copy.params = new ArrayList<>(this.params);  // deep copy
            copy.hints = new HashMap<>(this.hints);
            return copy;
        } catch (CloneNotSupportedException e) {
            throw new RuntimeException(e);
        }
    }
}

// Usage — clone a base config and customize
QueryConfig baseConfig = new QueryConfig("SELECT * FROM orders WHERE status = ?", List.of("ACTIVE"));
QueryConfig paginatedConfig = baseConfig.clone();
paginatedConfig.setSql(paginatedConfig.getSql() + " LIMIT ? OFFSET ?");
paginatedConfig.getParams().addAll(List.of(20, 0));

// Spring Prototype Scope
@Bean
@Scope("prototype")  // new instance for every getBean() call
public ReportGenerator reportGenerator() {
    return new ReportGenerator();
}`,
    },
  ]
}

export default designPatterns
