const springBoot = {
  title: 'Spring Boot',
  description: 'Spring Boot, Spring Core, DI, Bean Lifecycle, REST APIs, AOP, Spring MVC, and API Versioning (Spring Boot 4.0).',
  tags: ['Spring Boot', 'Spring Core', 'DI', 'REST API', 'AOP', 'API Versioning'],
  questions: [
    {
      id: 1,
      question: 'What is Spring Boot? How is it different from Spring Framework?',
      difficulty: 'beginner',
      asked: true,
      tags: ['Spring Boot'],
      answer: `Spring Framework is the core framework for building Java apps — it provides dependency injection, AOP, data access, etc. But setting it up required a lot of XML or Java configuration — you had to configure every bean, every data source, every web setup manually.

Spring Boot is opinionated on top of Spring Framework. It gives you auto-configuration — it looks at your classpath and automatically configures what you have. If mysql-connector is in your dependencies, it auto-configures a DataSource. If spring-web is there, it sets up an embedded Tomcat.

The key Spring Boot features:
- Auto-configuration via @SpringBootApplication (@EnableAutoConfiguration inside)
- Embedded server (Tomcat/Jetty/Undertow) — no need to deploy WAR to external server
- Spring Initializr for project scaffolding
- Actuator for production monitoring
- Opinionated defaults (can be overridden)

In my projects, I used Spring Boot 2.x for MetLife and 3.x for EPLMS. The upgrade to 3.x was mainly for Java 17 support and the Jakarta namespace change.`,
      code: `// Minimal Spring Boot Application
@SpringBootApplication  // = @Configuration + @EnableAutoConfiguration + @ComponentScan
public class EplmsApplication {
    public static void main(String[] args) {
        SpringApplication.run(EplmsApplication.class, args);
    }
}

// @SpringBootApplication enables:
// 1. @Configuration: this class defines beans
// 2. @EnableAutoConfiguration: auto-configures based on classpath
// 3. @ComponentScan: scans for @Component, @Service, @Repository, @Controller

// Auto-configuration example: if spring.datasource.url is set,
// Spring Boot auto-creates DataSource, JdbcTemplate, Hibernate config

// application.properties
server.port=8080
spring.application.name=eplms-vehicle-service
spring.datasource.url=jdbc:mysql://localhost:3306/eplms
spring.datasource.username=root
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=validate  // NEVER use create/update in production!
spring.jpa.show-sql=false

# Actuator endpoints for monitoring
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoint.health.show-details=when-authorized`,
      followUp: [
        { question: 'What is @SpringBootApplication? What three annotations does it include?', answer: `It combines three annotations: @Configuration (marks this as a bean definition source), @EnableAutoConfiguration (activates auto-configuration based on classpath), and @ComponentScan (scans the current package and sub-packages for @Component, @Service, @Repository, @Controller beans).` },
        { question: 'How does Spring Boot auto-configuration work internally?', answer: `Spring Boot ships META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports listing hundreds of auto-config classes. Each is annotated with @Conditional annotations: @ConditionalOnClass (activates only if a class is on classpath), @ConditionalOnMissingBean (activates only if you haven't defined your own), @ConditionalOnProperty (activates only if a property is set). Run with debug=true in application.properties to see what was auto-configured and why.` },
        { question: 'What is the difference between spring.jpa.hibernate.ddl-auto options?', answer: `none — do nothing (use Liquibase/Flyway to manage schema). validate — verify DB schema matches entities, fail if mismatch. update — apply changes to DB schema (safe for dev, DANGEROUS for prod). create — drop and recreate schema on startup (LOSE ALL DATA). create-drop — create on startup, drop on shutdown. Production: use validate or none.` },
      ],
      tip: 'NEVER use ddl-auto=create or update in production. Use validate (schema must match entities) or none (manage schema with Liquibase/Flyway).',
    },
    {
      id: 2,
      question: 'Explain Dependency Injection in Spring. What are the types?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Spring', 'DI', 'IoC'],
      answer: `Dependency Injection (DI) is a design pattern where objects receive their dependencies from outside rather than creating them. Spring's IoC container manages this.

There are 3 types of DI in Spring:

1. Constructor Injection: dependencies passed through constructor. This is my preferred approach and Spring's recommendation. It makes dependencies explicit, supports immutability (final fields), and makes testing easier.

2. Setter Injection: dependencies set via setter methods. Useful for optional dependencies. Less preferred because object can exist in an incompletely initialized state.

3. Field Injection (@Autowired on field): easiest to write but considered bad practice. Hard to test (can't inject mock without reflection), hides dependencies, makes it look like the class manages its own dependencies.

I always use constructor injection in my projects. Lombok's @RequiredArgsConstructor makes it even cleaner.`,
      code: `// 1. Constructor Injection (PREFERRED)
@Service
@RequiredArgsConstructor  // Lombok generates constructor for final fields
public class VehicleService {
    private final VehicleRepository vehicleRepository;
    private final KafkaEventProducer eventProducer;
    private final NotificationService notificationService;

    // No @Autowired needed — Spring auto-detects single constructor
}

// Without Lombok:
@Service
public class VehicleService {
    private final VehicleRepository vehicleRepository;

    @Autowired  // Optional when there's only one constructor in Spring 4.3+
    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }
}

// 2. Setter Injection (optional dependencies)
@Service
public class ReportService {
    private EmailService emailService;

    @Autowired(required = false)  // optional - won't fail if bean not found
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }
}

// 3. Field Injection (AVOID in production code)
@Service
public class BadService {
    @Autowired  // bad practice - hard to test
    private UserRepository userRepository;
}

// Why constructor injection is better for testing:
// Test class can use new VehicleService(mockRepo, mockProducer, mockNotif)
// No Spring context needed for unit tests!
class VehicleServiceTest {
    @Test
    void testCheckIn() {
        VehicleRepository mockRepo = mock(VehicleRepository.class);
        KafkaEventProducer mockProducer = mock(KafkaEventProducer.class);
        NotificationService mockNotif = mock(NotificationService.class);

        VehicleService service = new VehicleService(mockRepo, mockProducer, mockNotif);
        // test without Spring context!
    }
}`,
      followUp: [
        { question: 'What is the difference between @Autowired, @Inject, and @Resource?', answer: `@Autowired is Spring-specific, matches by type first. @Inject is JSR-330 standard (javax.inject) — portable across DI frameworks, also matches by type. @Resource is JSR-250 (javax.annotation) — matches by name first, then type. In practice, @Autowired is used everywhere in Spring apps. @Inject is useful if you want your code to be portable to non-Spring DI containers (CDI, Guice).` },
        { question: 'How does Spring resolve circular dependencies?', answer: `If Bean A needs Bean B and Bean B needs Bean A — Spring throws BeanCurrentlyInCreationException. Fix options: (1) Redesign to eliminate the cycle (best option). (2) Use @Lazy on one injection point — defers bean creation. (3) Use setter injection instead of constructor injection (Spring resolves setter-based circular deps). (4) Use @PostConstruct to do initialization after both beans are created.` },
        { question: 'What is @Qualifier? When do you use it?', answer: `When multiple beans of the same type exist, @Autowired throws NoUniqueBeanDefinitionException. @Qualifier("beanName") specifies which one. @Primary marks a default bean (used when no @Qualifier is specified). @Qualifier overrides @Primary.` },
      ],
      tip: '@Autowired is Spring-specific. @Inject is JSR-330 standard (portable). @Resource is JSR-250 (Java EE). In practice, use @Autowired or constructor injection — the difference rarely matters.',
    },
    {
      id: 3,
      question: 'Explain Spring Bean lifecycle. What is @PostConstruct and @PreDestroy?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Spring', 'Bean', 'Lifecycle'],
      answer: `Spring Bean lifecycle:
1. Instantiation — Spring creates the bean instance
2. Populate properties — DI happens, setters called
3. BeanNameAware.setBeanName() — if implemented
4. BeanFactoryAware.setBeanFactory() — if implemented
5. ApplicationContextAware.setApplicationContext() — if implemented
6. @PostConstruct method called (initialization)
7. InitializingBean.afterPropertiesSet() — if implemented
8. Bean is ready to use
9. @PreDestroy method called (cleanup)
10. DisposableBean.destroy() — if implemented
11. Bean destroyed

@PostConstruct: runs after DI is done and bean is initialized. I use this for: loading config from DB, initializing caches, setting up connections that need injected dependencies.

@PreDestroy: runs before bean is destroyed (app shutdown). I use this for: closing connections, flushing caches, releasing resources.

In my EPLMS project, I used @PostConstruct to pre-load vehicle master data into an in-memory cache on startup, which significantly reduced DB queries during peak load.`,
      code: `@Service
public class VehicleCacheService {
    private Map<String, Vehicle> vehicleCache = new ConcurrentHashMap<>();

    @Autowired
    private VehicleRepository vehicleRepository;

    @PostConstruct  // runs after VehicleRepository is injected
    public void initCache() {
        log.info("Loading vehicle cache...");
        vehicleRepository.findAll().forEach(v ->
            vehicleCache.put(v.getRegistrationNo(), v));
        log.info("Vehicle cache loaded: {} vehicles", vehicleCache.size());
    }

    @PreDestroy  // runs on application shutdown
    public void cleanup() {
        log.info("Clearing vehicle cache...");
        vehicleCache.clear();
    }

    public Optional<Vehicle> getVehicle(String regNo) {
        return Optional.ofNullable(vehicleCache.get(regNo));
    }
}

// Custom init/destroy via @Bean
@Configuration
public class KafkaConfig {

    @Bean(initMethod = "start", destroyMethod = "close")
    public KafkaConnectionPool kafkaConnectionPool() {
        return new KafkaConnectionPool();
    }
}

// Bean scopes
@Service
@Scope("singleton")   // DEFAULT — one instance per container
public class SingletonService { }

@Service
@Scope("prototype")   // new instance every time @Autowired
public class PrototypeService { }

@Service
@Scope("request")     // web: one instance per HTTP request
public class RequestScopedService { }

@Service
@Scope("session")     // web: one instance per HTTP session
public class SessionScopedService { }`,
      followUp: [
        { question: 'What is BeanPostProcessor? How is it different from @PostConstruct?', answer: `BeanPostProcessor is a more powerful framework-level hook — it intercepts ALL beans and can modify them before/after initialization. It has postProcessBeforeInitialization() (called before @PostConstruct) and postProcessAfterInitialization() (called after). Spring uses BeanPostProcessor internally for things like AOP proxy creation and @Autowired injection. @PostConstruct is simpler — just for initialization logic of a SINGLE bean. Use BeanPostProcessor when you need to programmatically enhance every bean of a certain type.` },
        { question: 'What is the difference between singleton scope in Spring vs Singleton design pattern?', answer: `Spring singleton = one instance per ApplicationContext (IoC container). If you create two ApplicationContexts (rare, but possible in tests), you get two singleton instances. Singleton design pattern = one instance per JVM. They are conceptually similar but scoped differently. Spring's beans use IoC container as the scope boundary.` },
        { question: 'What happens if a singleton bean has a prototype-scoped dependency?', answer: `If a singleton bean @Autowires a prototype-scoped bean, the prototype is injected ONCE when the singleton is created — effectively making it a singleton too. To get a fresh prototype every time, use ObjectFactory<PrototypeBean>, ApplicationContext.getBean(), or annotate the method with @Lookup.` },
      ],
      tip: 'Spring singleton = one instance per ApplicationContext container, not per JVM. You CAN have multiple application contexts with multiple singleton instances.',
    },
    {
      id: 4,
      question: 'How do you build REST APIs in Spring Boot? Explain key annotations.',
      difficulty: 'beginner',
      asked: true,
      tags: ['Spring Boot', 'REST API', 'Spring MVC'],
      answer: `I've built REST APIs extensively in both my projects. Here's the setup I use:

@RestController = @Controller + @ResponseBody. Every method returns JSON/XML directly to the response, not a view name.

@RequestMapping on class sets the base URL. Method-level annotations: @GetMapping, @PostMapping, @PutMapping, @DeleteMapping, @PatchMapping.

For request data:
- @PathVariable: from URL path (/vehicles/{id})
- @RequestParam: from query string (?status=ACTIVE)
- @RequestBody: from request body (JSON payload)
- @RequestHeader: from HTTP headers

I follow REST conventions: GET for read, POST for create, PUT for full update, PATCH for partial update, DELETE for deletion. Use proper HTTP status codes.`,
      code: `@RestController
@RequestMapping("/api/v1/vehicles")
@RequiredArgsConstructor
@Validated
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    public ResponseEntity<Page<VehicleResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(vehicleService.findAll(status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleResponse> getById(@PathVariable @Min(1) Long id) {
        return vehicleService.findById(id)
            .map(ResponseEntity::ok)
            .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found: " + id));
    }

    @PostMapping
    public ResponseEntity<VehicleResponse> create(
            @RequestBody @Valid CreateVehicleRequest request) {

        VehicleResponse created = vehicleService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.getId())
            .toUri();
        return ResponseEntity.created(location).body(created);  // 201 Created
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleResponse> update(
            @PathVariable Long id,
            @RequestBody @Valid UpdateVehicleRequest request) {
        return ResponseEntity.ok(vehicleService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        vehicleService.delete(id);
        return ResponseEntity.noContent().build();  // 204 No Content
    }
}

// DTO with validation
@Data
@Builder
public class CreateVehicleRequest {
    @NotBlank(message = "Registration number is required")
    @Pattern(regexp = "[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}", message = "Invalid format")
    private String registrationNo;

    @NotNull
    @Size(min = 1, max = 50)
    private String vehicleType;

    @Positive
    private double loadCapacity;
}`,
      followUp: [
        { question: 'What is the difference between @Controller and @RestController?', answer: `@Controller is the base MVC controller — methods return view names (strings) that are resolved to HTML templates (Thymeleaf, JSP). For REST APIs, you add @ResponseBody to each method to say "write this directly to the response, don't look for a view." @RestController = @Controller + @ResponseBody applied to all methods. In Spring Boot REST APIs, almost always use @RestController.` },
        { question: 'What HTTP status code do you return for different operations?', answer: `200 OK (GET/PUT success), 201 Created (POST creates resource — include Location header), 204 No Content (DELETE success), 400 Bad Request (validation failure), 401 Unauthorized (not authenticated), 403 Forbidden (authenticated but not authorized), 404 Not Found, 409 Conflict (duplicate/state conflict), 422 Unprocessable Entity (semantic validation error), 500 Internal Server Error.` },
        { question: 'How do you handle validation errors and return meaningful error messages?', answer: `Add @Valid to the @RequestBody parameter. Spring validates JSR-380 annotations (@NotNull, @NotBlank, @Size, @Pattern, etc.) on the DTO. If validation fails, MethodArgumentNotValidException is thrown. In @RestControllerAdvice, handle it and map field errors to a structured error response: { "errors": [{"field": "registrationNo", "message": "Invalid format"}] }.` },
      ],
      tip: 'HTTP status codes: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Internal Server Error',
    },
    {
      id: 5,
      question: 'What is AOP (Aspect-Oriented Programming)? How do you use it in Spring?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Spring', 'AOP', 'Cross-cutting concerns'],
      answer: `AOP is about separating cross-cutting concerns from business logic. Cross-cutting concerns are things like logging, security, transaction management, performance monitoring — they're needed everywhere but shouldn't clutter your business logic.

Key AOP concepts:
- Aspect: the module containing the cross-cutting logic
- Join Point: any point in program execution (method call, exception)
- Pointcut: expression that selects which join points to apply the aspect to
- Advice: the code that runs at the join point (Before, After, Around, AfterReturning, AfterThrowing)

In my projects, I used AOP for:
1. Logging all API request/response times
2. Auditing which user called which method
3. Caching with custom annotations
4. Retry logic for external API calls`,
      code: `// Aspect for logging execution time of all service methods
@Aspect
@Component
@Slf4j
public class PerformanceLoggingAspect {

    // Pointcut: all methods in service package
    @Pointcut("within(com.eplms.service..*)")
    public void serviceLayer() {}

    // Around advice: runs before and after
    @Around("serviceLayer()")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        String methodName = joinPoint.getSignature().toShortString();

        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - start;

            if (duration > 1000) {
                log.warn("SLOW METHOD: {} took {}ms", methodName, duration);
            } else {
                log.debug("Method: {} completed in {}ms", methodName, duration);
            }

            return result;
        } catch (Exception e) {
            log.error("Exception in {}: {}", methodName, e.getMessage());
            throw e;
        }
    }
}

// Custom annotation-based AOP
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Audited {
    String action() default "";
}

@Aspect
@Component
public class AuditAspect {

    @AfterReturning("@annotation(audited)")
    public void auditMethod(JoinPoint jp, Audited audited) {
        String user = SecurityContextHolder.getContext()
            .getAuthentication().getName();
        auditRepository.save(new AuditLog(user, audited.action(), Instant.now()));
    }
}

// Using the annotation on service methods
@Service
public class VehicleService {

    @Audited(action = "VEHICLE_CHECK_IN")
    public CheckInResponse checkIn(CheckInRequest request) {
        // business logic — no audit code here!
    }
}`,
      followUp: [
        { question: 'What is the difference between @Before, @After, @Around, @AfterReturning, @AfterThrowing?', answer: `@Before runs BEFORE the method (for logging, validation). @After runs AFTER the method, regardless of success or exception (like finally). @AfterReturning runs only if the method returns SUCCESSFULLY (access the return value). @AfterThrowing runs only if the method throws an EXCEPTION (access the exception). @Around wraps the entire method — you have full control, can modify arguments and return value, decide whether to call the actual method at all (via joinPoint.proceed()).` },
        { question: 'What is a pointcut expression? Explain the syntax.', answer: `"execution(* com.app.service..*(..))" means: any method (*), in any class under com.app.service and sub-packages (..), with any arguments ((..)). Common designators: execution() for method matching, within() for class matching, @annotation() for annotation matching, args() for argument type matching.` },
        { question: 'How does Spring AOP work under the hood? (proxy-based)', answer: `Spring AOP uses JDK Dynamic Proxies (for classes that implement interfaces) or CGLIB proxies (for concrete classes — creates a subclass at runtime). The proxy intercepts method calls and applies aspects. This is WHY self-invocation doesn't work — when you call this.myMethod() from within the same bean, you're calling directly on the real object, bypassing the proxy. This is also why @Transactional doesn't work on private methods — the proxy can't override private methods.` },
      ],
      tip: 'Spring AOP uses JDK dynamic proxies (for interfaces) or CGLIB proxies (for classes). This means AOP does NOT work for self-invocation — calling a @Transactional method from within the same class bypasses the proxy!',
    },
    {
      id: 6,
      question: 'How does @Transactional work in Spring? What are transaction propagation levels?',
      difficulty: 'advanced',
      asked: true,
      tags: ['Spring', 'Transactions', 'Database'],
      answer: `@Transactional is one of the most powerful and most misunderstood Spring annotations. It wraps the method in a transaction using AOP proxy.

How it works:
1. Spring creates a proxy around the @Transactional bean
2. When you call the method, the proxy starts a transaction
3. If method completes normally, proxy commits
4. If unchecked exception is thrown, proxy rolls back
5. If checked exception is thrown, it does NOT rollback by default! (you need rollbackFor)

Key propagation behaviors:
- REQUIRED (default): use existing transaction, or start new one
- REQUIRES_NEW: always start a new transaction, suspend existing
- NESTED: run in nested transaction within existing (savepoint)
- SUPPORTS: use existing if present, else run without transaction
- NEVER: fail if transaction exists

The most common trap: @Transactional on a private method won't work (proxy can't intercept private methods). And self-invocation doesn't work (calling @Transactional method from same bean).`,
      code: `// Basic @Transactional usage
@Service
public class PolicyService {

    @Transactional  // REQUIRED propagation by default
    public Policy createPolicy(CreatePolicyRequest req) {
        Policy policy = policyRepository.save(convertToEntity(req));
        premiumCalculationService.calculate(policy);  // called within same transaction
        notificationService.sendWelcome(policy);
        return policy;
        // If any step throws RuntimeException → entire transaction rolls back
    }

    // Rollback on checked exception (not default!)
    @Transactional(rollbackFor = {IOException.class, BusinessException.class})
    public void processPayment(PaymentRequest req) throws IOException {
        // rolls back even for IOException (checked)
    }

    // Read-only transaction (performance optimization)
    @Transactional(readOnly = true)
    public List<Policy> getAllPolicies() {
        return policyRepository.findAll();
        // Hibernate can optimize: no dirty checking, no flush
    }

    // REQUIRES_NEW: always new transaction, independent of caller
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveAuditLog(AuditLog log) {
        // This transaction commits/rolls back independently!
        // Even if caller's transaction rolls back, audit log is saved
        auditRepository.save(log);
    }

    // COMMON TRAP: self-invocation — this does NOT work!
    public void outerMethod() {
        this.innerTransactionalMethod();  // proxy bypassed! No transaction!
    }

    @Transactional
    public void innerTransactionalMethod() {
        // Transaction WON'T start because called from same bean
    }
}

// Programmatic transaction management (when @Transactional isn't enough)
@Service
@RequiredArgsConstructor
public class BatchService {
    private final TransactionTemplate transactionTemplate;

    public void processBatch(List<Event> events) {
        events.forEach(event ->
            transactionTemplate.execute(status -> {
                try {
                    process(event);
                    return null;
                } catch (Exception e) {
                    status.setRollbackOnly();
                    return null;
                }
            })
        );
    }
}`,
      followUp: [
        { question: 'Why does @Transactional not work on private methods?', answer: `Spring AOP creates a proxy that wraps your bean. The proxy overrides public/protected methods to add transaction behavior. Private methods CANNOT be overridden (not visible to subclass/proxy), so the proxy can't intercept them. The transaction code never runs — the private method executes directly on the real object. Solution: make the method at least package-private (protected preferred), or move it to a separate bean.` },
        { question: 'What is the difference between REQUIRED and REQUIRES_NEW?', answer: `REQUIRED (default): if a transaction already exists, join it. If not, create a new one. All operations participate in the SAME transaction — if inner method rolls back, the outer transaction rolls back too. REQUIRES_NEW: always creates a NEW transaction, suspending the existing one if any. The inner transaction commits/rolls back INDEPENDENTLY. Use for: audit logs that must be saved even if the main transaction rolls back.` },
        { question: 'How do you handle transactions across multiple databases (distributed transactions)?', answer: `True distributed transactions (2PC — Two-Phase Commit) require JTA (Java Transaction API) and an XA-compliant transaction manager (Atomikos, Bitronix). Very complex and slow. Modern approach: use the Saga pattern — break into local transactions with compensating actions. For most Spring Boot apps, it's better to avoid cross-database transactions by design (same-database for critical operations, eventual consistency via events for others).` },
      ],
      tip: '@Transactional only rolls back on RuntimeException by default. If your method throws a checked exception and you don\'t specify rollbackFor, the transaction COMMITS even if an exception is thrown!',
    },
    {
      id: 7,
      question: 'What is @SpringBootApplication? Explain @EnableAutoConfiguration and SpringApplication.run() internals.',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Spring Boot', 'Auto-configuration', 'Internals'],
      answer: `@SpringBootApplication is a convenience annotation combining three annotations:
- @Configuration: marks this as a source of bean definitions
- @EnableAutoConfiguration: tells Spring Boot to auto-configure based on classpath
- @ComponentScan: scans current package and sub-packages for Spring components

@EnableAutoConfiguration internals:
Spring Boot ships with a list of auto-configuration classes in META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports. On startup, Spring loads these but only activates them based on @Conditional annotations.

Example: DataSourceAutoConfiguration activates ONLY if:
- spring-jdbc is on classpath (@ConditionalOnClass)
- No DataSource bean already defined (@ConditionalOnMissingBean)
- spring.datasource.url is set (@ConditionalOnProperty)

SpringApplication.run() sequence:
1. Determine app type (Servlet/Reactive/None)
2. Load ApplicationContext initializers
3. Prepare Environment (load application.properties)
4. Create and refresh ApplicationContext
5. Trigger auto-configuration, register all beans
6. Run @PostConstruct methods
7. Run CommandLineRunner/ApplicationRunner beans
8. Fire ApplicationReadyEvent — app ready to serve traffic`,
      code: `// @SpringBootApplication expands to:
@Configuration
@EnableAutoConfiguration
@ComponentScan
public class MyApp {
    public static void main(String[] args) {
        SpringApplication.run(MyApp.class, args);
    }
}

// Debug auto-configuration (shows what was applied and why)
// application.properties: debug=true

// Exclude unwanted auto-config
@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class })`,
    },
    {
      id: 8,
      question: '@Bean vs @Component vs @Qualifier — what is the difference?',
      difficulty: 'beginner',
      asked: true,
      tags: ['Spring Boot', 'Beans', 'DI'],
      answer: `@Component — annotation on a CLASS you own. Spring auto-detects via component scan.
@Bean — annotation on a METHOD inside @Configuration. Use when you don't own the class (third-party) or need custom construction logic.

Rule: own the class → @Component. Don't own it (RestTemplate, ObjectMapper, DataSource) → @Bean.

@Qualifier — when multiple beans of same type exist, Spring throws NoUniqueBeanDefinitionException. @Qualifier specifies which bean to inject by name. @Primary marks a default; @Qualifier overrides @Primary.`,
      code: `// @Component — your own class
@Service
public class VehicleService { }  // Spring creates via component scan

// @Bean — third-party class or needs custom config
@Configuration
public class AppConfig {
    @Bean("fastClient")
    public RestTemplate fastRestTemplate() {
        RestTemplate rt = new RestTemplate();
        rt.setReadTimeout(1000);
        return rt;
    }

    @Bean("slowClient")
    public RestTemplate slowRestTemplate() {
        RestTemplate rt = new RestTemplate();
        rt.setReadTimeout(30000);
        return rt;
    }
}

// @Qualifier — pick which bean
@Service
public class RegistryService {
    @Autowired
    @Qualifier("fastClient")
    private RestTemplate restTemplate;
}`,
    },
    {
      id: 9,
      question: 'What is the IOC Container? Explain Bean scopes.',
      difficulty: 'beginner',
      asked: true,
      tags: ['Spring', 'IOC', 'Bean Scopes'],
      answer: `IoC (Inversion of Control) Container is Spring's core. Instead of your code creating objects (new Service()), you declare dependencies and Spring creates and wires them. You invert the control of object creation to the framework.

ApplicationContext is the IoC container. It manages bean creation, dependency injection, and lifecycle.

Bean Scopes:
- Singleton (default): ONE instance per Spring container. Same bean returned every time. Best for stateless services/DAOs.
- Prototype: NEW instance every time the bean is requested. Use for stateful beans.
- Request: ONE instance per HTTP request. New for each incoming request.
- Session: ONE instance per HTTP session.

Most production beans are Singleton. Don't inject Prototype beans into Singleton beans directly — use ObjectFactory or @Lookup to get a fresh prototype each time.`,
      code: `@Component
@Scope("singleton")  // default — can omit
public class VehicleService { }

@Component
@Scope("prototype")
public class ReportGenerator {
    // New instance every time — safe to have mutable state
    private List<String> buffer = new ArrayList<>();
}

@Component
@Scope(value = WebApplicationContext.SCOPE_REQUEST,
       proxyMode = ScopedProxyMode.TARGET_CLASS)
public class RequestContext {
    private String requestId = UUID.randomUUID().toString();
}`,
    },
    {
      id: 10,
      question: '@PathVariable vs @RequestParam — what is the difference?',
      difficulty: 'beginner',
      asked: true,
      tags: ['Spring Boot', 'REST', 'Annotations'],
      answer: `@PathVariable extracts a value from the URL path itself.
@RequestParam extracts a value from the query string (after ?).

URL: GET /vehicles/123        → @PathVariable: id = 123
URL: GET /vehicles?status=ACTIVE → @RequestParam: status = "ACTIVE"

Use @PathVariable for resource identifiers (IDs that make the URL unique).
Use @RequestParam for optional filters, pagination, search parameters.

Key: @PathVariable values are mandatory (they're part of the URL pattern). @RequestParam can be optional with a defaultValue.`,
      code: `// @PathVariable — mandatory, part of URL path
@GetMapping("/vehicles/{id}")
public VehicleDto getVehicle(@PathVariable Long id) { ... }
// GET /vehicles/42 → id = 42

// @RequestParam — optional query parameters
@GetMapping("/vehicles")
public Page<VehicleDto> list(
    @RequestParam(required = false, defaultValue = "ACTIVE") String status,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size
) { ... }
// GET /vehicles                    → status=ACTIVE, page=0, size=20
// GET /vehicles?status=INACTIVE    → status=INACTIVE`,
    },
    {
      id: 11,
      question: 'What is DispatcherServlet? How does a Spring MVC request flow work?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Spring MVC', 'DispatcherServlet'],
      answer: `DispatcherServlet is the Front Controller in Spring MVC. Every HTTP request goes through it.

Request flow:
1. HTTP request → Tomcat → DispatcherServlet
2. HandlerMapping: finds which @Controller method maps to this URL
3. Pre-processing: Interceptors' preHandle() runs
4. HandlerAdapter: executes the controller method
5. Controller returns ModelAndView or ResponseEntity
6. Interceptors' postHandle() runs
7. For REST (@ResponseBody): HttpMessageConverter serializes return value to JSON
8. Response sent to client
9. Interceptors' afterCompletion() runs

For REST APIs (most common), view resolution is skipped — @ResponseBody directs the return value straight to Jackson → JSON.`,
      code: `// What happens for GET /vehicles/42:
// 1. DispatcherServlet receives request
// 2. HandlerMapping → finds VehicleController.getVehicle(@PathVariable Long id)
// 3. LoggingInterceptor.preHandle() runs
// 4. VehicleController.getVehicle(42) executes → returns VehicleDto
// 5. Jackson converts VehicleDto → JSON string
// 6. 200 OK response sent

// Custom Interceptor
@Component
public class LoggingInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
        log.info("{} {}", req.getMethod(), req.getRequestURI());
        return true;  // false = abort request
    }
}`,
    },
    {
      id: 12,
      question: 'Filters vs Interceptors — what is the difference and when to use each?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Spring Boot', 'Filter', 'Interceptor'],
      answer: `Filter (Servlet spec) — runs OUTSIDE Spring, before DispatcherServlet.
Interceptor (Spring MVC) — runs INSIDE Spring, after DispatcherServlet picks a handler.

Filter:
- Can't access Spring beans directly (unless obtained via WebApplicationContext)
- Applied to all requests including static resources
- Use for: raw request/response modification, authentication, CORS, request logging, gzip compression

Interceptor:
- Full access to Spring beans
- Only for requests handled by controllers
- Knows which controller method will be invoked (handler object)
- Use for: audit logging (you know which endpoint), role-based checks per endpoint, adding response metadata

Rule: modifying raw HTTP or need it before Spring? → Filter. Need Spring context or per-endpoint logic? → Interceptor.`,
      code: `// Filter — runs before DispatcherServlet
@Component
public class RequestIdFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                                    FilterChain chain) throws IOException, ServletException {
        res.setHeader("X-Request-Id", UUID.randomUUID().toString());
        chain.doFilter(req, res);
    }
}

// Interceptor — runs after handler is identified
@Component
public class AuditInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
        if (handler instanceof HandlerMethod m) {
            log.info("Entering {}.{}", m.getBeanType().getSimpleName(), m.getMethod().getName());
        }
        return true;
    }
}`,
    },
    {
      id: 13,
      question: 'How do you optimize slow APIs in Spring Boot?',
      difficulty: 'advanced',
      asked: true,
      tags: ['Performance', 'Optimization', 'Spring Boot'],
      answer: `Measure first — use Actuator metrics, APM tools, or @Timed. Know exactly where time is spent.

Common causes and fixes:

1. Database (most common):
   - N+1 queries → JOIN FETCH or @EntityGraph
   - Missing indexes → EXPLAIN the slow query, add composite indexes
   - Selecting all columns → DTO projections
   - No pagination → add Pageable

2. External API calls:
   - Serial calls → parallel with CompletableFuture.allOf()
   - No caching → add Redis cache for stable data

3. Caching: @Cacheable for read-heavy data that rarely changes

4. Async: @Async for fire-and-forget (email, audit logging)

5. Connection pools: ensure HikariCP pool size is tuned for concurrency

In MetLife: report API took 8s due to N+1 (fetching claims one-by-one for each policy). JOIN FETCH reduced it to 150ms — 95% improvement.`,
      code: `// N+1 fix — JOIN FETCH
@Query("SELECT p FROM Policy p LEFT JOIN FETCH p.claims WHERE p.customerId = :id")
List<Policy> findWithClaims(@Param("id") Long id);

// DTO projection — only needed columns
@Query("SELECT new com.app.PolicySummary(p.id, p.policyNo, p.status) FROM Policy p")
List<PolicySummary> findSummaries();

// Parallel external calls
CompletableFuture<VehicleInfo> v = CompletableFuture.supplyAsync(() -> vehicleClient.get(id));
CompletableFuture<DriverInfo> d = CompletableFuture.supplyAsync(() -> driverClient.get(driverId));
CompletableFuture.allOf(v, d).join(); // both run in parallel

// Caching
@Cacheable(value = "vehicleCache", key = "#id")
public VehicleDto getVehicle(Long id) {
    return vehicleRepo.findById(id).map(mapper::toDto).orElseThrow();
}`,
    },
    {
      id: 14,
      question: 'What is Idempotency? How do you implement it in REST APIs?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['REST', 'Idempotency', 'API Design'],
      answer: `An operation is idempotent if calling it multiple times produces the same result as calling it once.

HTTP spec: GET, PUT, DELETE are idempotent. POST is NOT (calling POST /orders twice creates two orders).

Why it matters: networks fail, clients retry. Without idempotency, retries cause duplicate orders, double charges, duplicate records.

Implementation — Idempotency Key:
Client generates a UUID and sends it as X-Idempotency-Key header. Server stores the result of the first successful processing in Redis. On retry, server finds the key → returns stored result without reprocessing.

Critical: the check-and-process must be atomic (use Redis SETNX + Lua script, or database unique constraint) to handle concurrent duplicate requests.`,
      code: `@PostMapping("/orders")
public ResponseEntity<OrderResponse> createOrder(
    @RequestHeader("X-Idempotency-Key") String idempotencyKey,
    @RequestBody OrderRequest request) {

    // Check if already processed
    String cached = redis.opsForValue().get("idem:" + idempotencyKey);
    if (cached != null) {
        return ResponseEntity.ok(json.readValue(cached, OrderResponse.class));
    }

    // Process
    OrderResponse response = orderService.createOrder(request);

    // Store with 24h TTL
    redis.opsForValue().set("idem:" + idempotencyKey,
        json.writeValueAsString(response), Duration.ofHours(24));

    return ResponseEntity.status(201).body(response);
}

// HTTP idempotency quick reference:
// GET    /orders     → safe + idempotent
// PUT    /orders/1   → idempotent (same PUT = same state)
// DELETE /orders/1   → idempotent (second delete = still deleted)
// POST   /orders     → NOT idempotent → add idempotency key`,
    },

    // ═══════════════════════════════════
    //  API VERSIONING — SPRING BOOT 4.0
    // ═══════════════════════════════════

    {
      id: 15,
      question: 'Why does API Versioning matter in REST APIs?',
      difficulty: 'beginner',
      asked: false,
      tags: ['API Versioning', 'REST API', 'Spring Boot'],
      answer: `API versioning is something every production REST API eventually needs, and I learned this the hard way in my MetLife project.

The core problem: once you publish an API and clients are using it, you cannot change it without breaking those clients. If I rename a field, remove a response property, change a type from String to List, or restructure the payload — any client relying on the old contract will fail.

Real scenarios where versioning saves you:

First — client diversity. My REST APIs in MetLife served both the mobile app team and the web team. Mobile apps can't be force-updated overnight — users might be running App v1.2 for months. The web team wanted v2 with a cleaner contract. Without versioning, I'd either be stuck with the old API forever or break mobile clients.

Second — breaking vs non-breaking changes. Adding a new field is non-breaking — old clients just ignore it. Removing a field, renaming it, or changing its type is breaking. Versioning gives me a safe path to make breaking changes without impacting existing consumers.

Third — deprecation path. With versioning I can say "v1 is deprecated, migrate to v2 by March 2025" and give clients time to migrate. Without it, breaking changes happen suddenly or never.

Before Spring Boot 4.0, there was no built-in framework support for versioning — we built it ourselves using path prefixes, custom interceptors, or Accept headers. Spring Boot 4.0 changes this by providing first-class versioning support at the framework level.`,
      code: `// Why versioning matters — a breaking change example

// v1 response — client built around this
{
  "id": 1001,
  "userName": "randhir.kumar",
  "emailAddress": "randhir@example.com"
}

// v2 — renamed fields + nested structure (BREAKING for v1 clients!)
{
  "id": 1001,
  "name": "Randhir Kumar",
  "contact": {
    "email": "randhir@example.com",
    "phone": "+91-9876543210"
  }
}

// WITHOUT versioning: you either break all v1 clients OR
// you maintain ugly backward-compatible bloat forever

// WITH versioning: v1 and v2 co-exist
// GET /api/users/1   + Header: X-API-Version: 1  → old contract
// GET /api/users/1   + Header: X-API-Version: 2  → new contract

// Non-breaking changes (safe, no version bump needed):
// ✅ Adding new optional fields
// ✅ Adding new endpoints
// ✅ Relaxing validation

// Breaking changes (require new version):
// ❌ Renaming fields
// ❌ Removing fields
// ❌ Changing field types (String → Number)
// ❌ Restructuring response shape
// ❌ Changing HTTP status codes`,
      followUp: [
        { question: 'What is semantic versioning and how does it apply to APIs?', answer: `Semantic versioning (SemVer) is MAJOR.MINOR.PATCH — but for APIs we typically only version on MAJOR breaking changes, not every minor or patch update. A MAJOR version (v1 → v2) means breaking changes exist and clients must migrate. MINOR and PATCH changes (new optional fields, bug fixes) are backward-compatible and don't require a new API version. This keeps versioning manageable — if every bug fix required a new version, you'd have v47 in a year.` },
      ],
      tip: 'In interviews: "We version APIs when we need to make breaking changes while keeping existing clients running. Non-breaking changes (adding optional fields) don\'t need a version bump." — shows you understand when versioning is actually needed.',
    },

    {
      id: 16,
      question: 'How was API versioning done before Spring Boot 4.0? What were the problems?',
      difficulty: 'intermediate',
      asked: false,
      tags: ['API Versioning', 'REST API', 'Spring Boot'],
      answer: `Before Spring Boot 4.0, there was no built-in versioning support. We had to implement it manually, and each approach had trade-offs.

Approach 1 — URL Path Versioning: /api/v1/users, /api/v2/users. This is the most common approach and the one I used in my EPLMS project. It's simple, visible, and easy to test in a browser. But it has a problem: it violates REST principles because the URL should identify a resource, not its version. Also, it leads to code duplication — you end up copying controllers and changing a few things.

Approach 2 — Request Header Versioning: X-API-Version: 1 header. Keeps URLs clean. But harder to test (can't just paste URL in browser), and you need custom HandlerMapping or interceptors to route based on headers.

Approach 3 — Accept Header (Media Type) Versioning: Accept: application/vnd.myapp.v1+json. Most REST-purist approach — the client declares what representation they want. But very verbose and complex to implement with custom content negotiation in Spring.

Approach 4 — Query Parameter: GET /users?version=1. Simple but pollutes the URL, and caching is harder (query params affect cache keys differently).

The real problem with all these: Spring had no built-in awareness of versions. You had to write custom HandlerMapping, interceptors, or duplicate controllers per version. Testing was purely manual — write your own MockMvc helpers. Deprecation notices had to be added manually to each response. Everything was boilerplate.

Spring Boot 4.0 solved all of this at the framework level.`,
      code: `// Approach 1 — URL Path Versioning (most common pre-4.0)
// Separate controller classes per version:
@RestController
@RequestMapping("/api/v1/users")
public class UserControllerV1 {
    @GetMapping("/{id}")
    public UserV1Response getUser(@PathVariable Long id) {
        // v1 contract
    }
}

@RestController
@RequestMapping("/api/v2/users")
public class UserControllerV2 {
    @GetMapping("/{id}")
    public UserV2Response getUser(@PathVariable Long id) {
        // v2 contract — duplicated controller, code smell!
    }
}

// Approach 2 — Header Versioning (manual routing)
@RestController
@RequestMapping("/api/users")
public class UserController {
    @GetMapping(value = "/{id}", headers = "X-API-Version=1")
    public UserV1Response getUserV1(@PathVariable Long id) { ... }

    @GetMapping(value = "/{id}", headers = "X-API-Version=2")
    public UserV2Response getUserV2(@PathVariable Long id) { ... }
}

// Approach 3 — Accept Header / Media Type Versioning
@GetMapping(value = "/{id}", produces = "application/vnd.myapp.v1+json")
public UserV1Response getUserV1(@PathVariable Long id) { ... }

@GetMapping(value = "/{id}", produces = "application/vnd.myapp.v2+json")
public UserV2Response getUserV2(@PathVariable Long id) { ... }

// Approach 4 — Query Parameter
@GetMapping("/users")
public ResponseEntity<?> getUser(
    @PathVariable Long id,
    @RequestParam(defaultValue = "1") int version) {
    return switch (version) {
        case 1 -> ResponseEntity.ok(userService.getUserV1(id));
        case 2 -> ResponseEntity.ok(userService.getUserV2(id));
        default -> ResponseEntity.badRequest().body("Unknown version: " + version);
    };
}

// Problems with all approaches:
// ❌ No framework support — all boilerplate
// ❌ No built-in deprecation headers
// ❌ No test helpers
// ❌ No client-side versioning utilities
// ❌ Version routing logic scattered across controllers`,
      followUp: [
        { question: 'Which versioning strategy did you prefer before Spring Boot 4.0 and why?', answer: `I preferred URL path versioning (/api/v1/, /api/v2/) for most projects because it's explicit, easy to test, and familiar to all API consumers — you can test it in a browser or curl without special headers. For internal APIs between microservices, I used header versioning (X-API-Version) because it keeps URLs clean and the consumers are controlled services that we can update. I avoided query param versioning because it complicates caching — some CDNs and proxies ignore query params in cache keys.` },
      ],
      tip: 'When asked which approach is best: "URL path is most widely used and easiest to work with. Header versioning is cleaner but harder to test. Media type versioning is most REST-pure but complex to implement. Spring Boot 4.0 supports all three natively."',
    },

    {
      id: 17,
      question: 'What is the new API Versioning support in Spring Boot 4.0? How do you configure it on the server side?',
      difficulty: 'intermediate',
      asked: false,
      tags: ['API Versioning', 'Spring Boot 4.0', 'Server Configuration'],
      answer: `Spring Boot 4.0 introduces first-class API versioning support — something the community has wanted for years. Instead of writing custom interceptors and routing logic, the framework now handles it natively.

The core idea: you declare a versioning strategy once, and then annotate your controllers with @HttpVersionMapping (or configure @ApiVersion on methods) to tell Spring which version each endpoint belongs to. Spring routes requests to the correct handler automatically.

There are three versioning strategies supported out of the box:

Header strategy — version sent in a request header (e.g., X-API-Version: 2). This is the cleanest approach because URLs stay stable. Best for internal service-to-service APIs where you control all consumers.

Media type strategy — version embedded in the Accept header (e.g., Accept: application/vnd.myapp.v2+json). The most REST-purist approach — you're negotiating content representation. More complex to set up but aligns with HTTP spec.

Path strategy — version in the URL path (/api/v2/users). Simple and backwards-compatible with existing Spring Boot 3.x patterns. Easy to test and most familiar.

You configure the strategy globally in application.properties or via WebMvcConfigurer, and then individual controllers/methods declare which versions they handle. The framework validates that the requested version is supported and returns 400 Bad Request or 406 Not Acceptable automatically if the version is unknown.`,
      code: `// ── application.properties (header strategy) ──────────────────
spring.mvc.api-versioning.enabled=true
spring.mvc.api-versioning.strategy=header
spring.mvc.api-versioning.header-name=X-API-Version
spring.mvc.api-versioning.default-version=1
spring.mvc.api-versioning.supported-versions=1,2,3

// ── application.properties (media-type strategy) ───────────────
spring.mvc.api-versioning.strategy=media-type
spring.mvc.api-versioning.media-type-prefix=application/vnd.myapp.v
spring.mvc.api-versioning.default-version=1

// ── Java-based configuration ───────────────────────────────────
@Configuration
public class ApiVersioningConfig implements WebMvcConfigurer {

    @Override
    public void configureApiVersioning(ApiVersionHandlerRegistry registry) {
        registry
            .useHeaderStrategy("X-API-Version")  // version comes from this header
            .setDefaultVersion("1")               // baseline: no header = v1
            .setSupportedVersions("1", "2", "3"); // 400 if unknown version requested
    }
}

// ── Request examples ───────────────────────────────────────────
// Header strategy:
// GET /api/users/1
// X-API-Version: 2
// → routed to v2 handler

// Media type strategy:
// GET /api/users/1
// Accept: application/vnd.myapp.v2+json
// → routed to v2 handler

// Path strategy:
// GET /api/v2/users/1
// → routed to v2 handler`,
      followUp: [
        { question: 'What happens if a client sends an unsupported version number?', answer: `With Spring Boot 4.0 native versioning, if a client requests version "5" and supported versions are "1", "2", "3", Spring automatically returns 400 Bad Request (for header/query-param strategies) or 406 Not Acceptable (for media-type strategy). You don't need to write any error handling code for this — the framework does it. Before Spring Boot 4.0, you had to write this validation yourself in an interceptor.` },
        { question: 'Can you mix versioning strategies in the same application?', answer: `Generally no — you pick one strategy and apply it globally. Mixing header and path versioning in the same app creates ambiguity: which takes precedence when both are present? If you're migrating from URL path versioning (old style) to header versioning (new style), you can keep the old controllers as-is and gradually migrate endpoints to the new @ApiVersion annotation. During transition, both work — just be explicit about which routing each controller uses.` },
      ],
      tip: 'Spring Boot 4.0 versioning is configured once globally — strategy, header name, supported versions — then controllers just declare which version they belong to. The framework handles routing, validation, and error responses automatically.',
    },

    {
      id: 18,
      question: 'How do you use @ApiVersion on controllers in Spring Boot 4.0? What are Baseline Versions?',
      difficulty: 'intermediate',
      asked: false,
      tags: ['API Versioning', 'Spring Boot 4.0', '@ApiVersion', 'Baseline Version'],
      answer: `Once the versioning strategy is configured, you annotate controllers and methods with @ApiVersion to declare what they serve. This is where it gets elegant.

Class-level @ApiVersion applies to all methods in the controller. Method-level @ApiVersion overrides the class-level one for that specific method. You can also declare a version range — from and to — so one method handles requests for v1, v2, and v3 without duplicating code.

This is a huge improvement over the old approach where you duplicated entire controller classes. Now you can have a single controller with methods that say "this handler serves v1 and v2, that handler serves v3 and above."

Baseline Versions — this is the concept of what version a client gets when they don't send a version at all. In the server config, you set a defaultVersion. When a client hits your API without any version header, Spring treats it as the baseline version request. This is critical for backward compatibility — existing clients that were never version-aware keep working because they implicitly get the baseline (usually v1).

I use baseline version as "v1 forever" for public APIs — it means old clients never break even if they never update their code.

The combination of class-level @ApiVersion + method-level overrides + baseline version gives you a clean way to evolve your API without code duplication.`,
      code: `// ── Class-level versioning — all methods serve v1 ─────────────
@RestController
@RequestMapping("/api/users")
@ApiVersion("1")
public class UserControllerV1 {

    @GetMapping("/{id}")
    public UserV1Response getUser(@PathVariable Long id) {
        return userService.getUserV1(id);
    }

    @PostMapping
    public UserV1Response createUser(@RequestBody @Valid CreateUserV1Request req) {
        return userService.createUserV1(req);
    }
}

// ── Class-level with method-level override ─────────────────────
@RestController
@RequestMapping("/api/users")
@ApiVersion("2")  // default for all methods: v2
public class UserControllerV2 {

    @GetMapping("/{id}")
    public UserV2Response getUser(@PathVariable Long id) {
        // handles X-API-Version: 2
        return userService.getUserV2(id);
    }

    @GetMapping("/{id}/summary")
    @ApiVersion("3")  // THIS method only: v3 (overrides class-level)
    public UserSummaryResponse getUserSummary(@PathVariable Long id) {
        return userService.getUserSummary(id);
    }
}

// ── Version ranges — one method handles multiple versions ──────
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    // Serves v1 and v2 (stable contract, no change needed)
    @GetMapping("/{id}")
    @ApiVersion(from = "1", to = "2")
    public OrderV1Response getOrderV1(@PathVariable Long id) {
        return orderService.getOrder(id);
    }

    // v3 onwards: new enriched response structure
    @GetMapping("/{id}")
    @ApiVersion(from = "3")
    public OrderV3Response getOrderV3(@PathVariable Long id) {
        return orderService.getOrderEnriched(id);
    }
}

// ── Baseline version — what unversioned clients get ───────────
// application.properties:
// spring.mvc.api-versioning.default-version=1

// Client A (new, version-aware):
// GET /api/users/1
// X-API-Version: 2   → served by UserControllerV2.getUser()

// Client B (old, never sent headers):
// GET /api/users/1
// (no X-API-Version header) → baseline kicks in → served by UserControllerV1.getUser()
// Old client keeps working without any code change!`,
      followUp: [
        { question: 'How do you handle shared logic between v1 and v2 controllers without duplication?', answer: `The version-specific controllers are thin — they handle request/response DTOs for that version. All business logic lives in the service layer, which is version-agnostic. So UserControllerV1.getUser() and UserControllerV2.getUser() both call userService.getUser(id), but map the result to different response DTOs (UserV1Response vs UserV2Response). The service itself never changes. Only the request/response shapes differ between versions.` },
        { question: 'What is the difference between @ApiVersion("2") and @ApiVersion(from="2")?', answer: `@ApiVersion("2") means EXACTLY version 2 — only requests with X-API-Version: 2 hit this handler. @ApiVersion(from="2") means version 2 AND ALL FUTURE VERSIONS — so v2, v3, v4 all route here until a more specific handler is registered. This is useful for endpoints that haven't changed since v2 — they don't need a new method per version, they just serve everything from v2 onwards.` },
      ],
      tip: '@ApiVersion(from="2") is the key to avoiding code duplication — it means "this handler serves v2 and all future versions unless something more specific is registered." Use it for stable endpoints that don\'t change between versions.',
    },

    {
      id: 19,
      question: 'How does Spring Boot 4.0 support API Versioning on the client side? What are Deprecation Hints?',
      difficulty: 'intermediate',
      asked: false,
      tags: ['API Versioning', 'Spring Boot 4.0', 'RestClient', 'Deprecation'],
      answer: `Spring Boot 4.0 API versioning support is not just server-side — the client-side HTTP clients (RestClient and WebClient) also get built-in versioning support.

Client-Side Support:
Before 4.0, if you wanted to set X-API-Version on every outgoing request from a service, you had to add a custom interceptor or default header to RestTemplate/RestClient. Now RestClient and WebClient have a native apiVersion() method that injects the version into every request according to the configured strategy.

This is very useful in microservice environments — Service A calls Service B's v2 API, and you declare that once in the client configuration rather than adding a header to every individual call.

Deprecation Hints:
This is my favourite feature in Spring Boot 4.0 versioning. When you mark an API version as deprecated using @ApiVersion(deprecated = true) or @DeprecatedSince("2"), Spring Boot automatically adds standard HTTP deprecation response headers:

Deprecation header — tells the client this version is deprecated. Can include the deprecation date.
Sunset header — tells the client WHEN this version will be removed. Clients can programmatically check this.

This is based on RFC 8594 (the Sunset HTTP Header). Before this, you had to manually add these headers in a filter or interceptor for every deprecated endpoint. Now you just annotate the controller method and Spring handles the headers.

In a real project, I'd mark v1 as deprecated with a sunset date 6 months out, and any client that inspects headers would get a clear signal to migrate before the cutoff.`,
      code: `// ── Client-side: RestClient with versioning ───────────────────
// Build a version-aware RestClient
RestClient userServiceClient = RestClient.builder()
    .baseUrl("https://user-service.internal")
    .apiVersion("2")  // all requests send X-API-Version: 2 automatically
    .build();

// Every call auto-sends X-API-Version: 2
UserV2Response user = userServiceClient
    .get()
    .uri("/api/users/{id}", userId)
    .retrieve()
    .body(UserV2Response.class);

// Override version for a specific request
UserV3Response enriched = userServiceClient
    .get()
    .uri("/api/users/{id}/summary", userId)
    .apiVersion("3")  // overrides the client-level default
    .retrieve()
    .body(UserV3Response.class);

// ── WebClient with versioning (reactive) ──────────────────────
WebClient webClient = WebClient.builder()
    .baseUrl("https://order-service.internal")
    .apiVersion("2")
    .build();

Mono<OrderV2Response> order = webClient
    .get()
    .uri("/api/orders/{id}", orderId)
    .retrieve()
    .bodyToMono(OrderV2Response.class);

// ── Deprecation Hints — server side ───────────────────────────
@RestController
@RequestMapping("/api/users")
public class UserController {

    // Mark v1 as deprecated — Spring auto-adds Deprecation + Sunset headers
    @GetMapping("/{id}")
    @ApiVersion(value = "1", deprecated = true)
    @DeprecatedSince(version = "1", sunset = "2026-06-01")
    public UserV1Response getUserV1(@PathVariable Long id) {
        return userService.getUserV1(id);
    }

    @GetMapping("/{id}")
    @ApiVersion(from = "2")
    public UserV2Response getUserV2(@PathVariable Long id) {
        return userService.getUserV2(id);
    }
}

// Response headers Spring Boot 4.0 adds automatically for deprecated version:
// HTTP/1.1 200 OK
// Deprecation: true
// Sunset: Sun, 01 Jun 2026 00:00:00 GMT
// Link: </api/users/{id}>; rel="successor-version"

// Client-side: detect deprecation and log warning
RestClient.ResponseSpec spec = client.get().uri("/api/users/1").retrieve();
spec.onStatus(HttpStatusCode::is2xxSuccessful, (request, response) -> {
    if (response.getHeaders().containsKey("Deprecation")) {
        String sunset = response.getHeaders().getFirst("Sunset");
        log.warn("API version deprecated. Sunset date: {}", sunset);
    }
});`,
      followUp: [
        { question: 'What is the Sunset HTTP header and why does it matter?', answer: `Sunset (RFC 8594) is a standard HTTP response header that tells clients the date after which a resource or API version will no longer be available. Format: Sunset: Thu, 01 Jan 2026 00:00:00 GMT. When Spring Boot 4.0 adds this header automatically on deprecated endpoints, API consumers can build tooling to scan their HTTP responses and alert teams when they're calling APIs with an upcoming sunset date. This turns deprecation from a "hope someone reads the release notes" situation into a machine-readable signal that can trigger automated alerts.` },
        { question: 'How do you communicate API deprecation to client teams in practice?', answer: `Three-layer approach I use: (1) Technical — HTTP Deprecation and Sunset headers on every response from deprecated endpoints (Spring Boot 4.0 adds these automatically). (2) Documentation — mark version as deprecated in OpenAPI/Swagger with the migration guide. (3) Operational — monitor which clients are still calling deprecated versions using Actuator metrics or API gateway logs — reach out to those teams directly before sunset date. Don't rely on teams self-discovering — proactively contact them when their calls show up in deprecation metrics.` },
      ],
      tip: 'Deprecation headers follow RFC 8594 — mention this in interviews. "Deprecation" header signals it\'s deprecated, "Sunset" header gives the removal date. Spring Boot 4.0 adds these automatically when you annotate with @DeprecatedSince — no filter boilerplate needed.',
    },

    {
      id: 20,
      question: 'How do you test versioned APIs in Spring Boot 4.0?',
      difficulty: 'intermediate',
      asked: false,
      tags: ['API Versioning', 'Spring Boot 4.0', 'Testing', 'MockMvc'],
      answer: `Testing versioned APIs properly was painful before Spring Boot 4.0 — you had to remember to add the right header to every test manually, and there were no utilities to help. Spring Boot 4.0 adds dedicated test support for API versioning that integrates with MockMvc and WebTestClient.

The main improvement: MockMvc gets an apiVersion() request post-processor that injects the version according to whatever strategy is configured (header, media type, or path). This means your tests don't need to know if the app uses X-API-Version header or Accept header — the same test helper works regardless of strategy. If you switch strategies in configuration, your tests still work.

For slice tests like @WebMvcTest, Spring Boot 4.0 also auto-configures the versioning strategy so you don't need to manually configure it in test context.

I'd also write specific tests to verify:
- Correct version routes to correct handler
- Deprecated version returns Deprecation and Sunset headers
- Unknown version returns 400 Bad Request
- Baseline version (no header) routes to default version handler

The last point is critical for regression testing — you must prove that existing clients (no version header) still get the baseline response unchanged. That's the contract you're protecting.`,
      code: `// ── @WebMvcTest with versioning ───────────────────────────────
@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    MockMvc mockMvc;

    // Test v1 endpoint
    @Test
    void getUser_v1_returnsV1Response() throws Exception {
        mockMvc.perform(get("/api/users/1")
                    .with(apiVersion("1")))  // Spring Boot 4.0 MockMvc helper
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.userName").exists())   // v1 field name
               .andExpect(jsonPath("$.contact").doesNotExist()); // v2 field not in v1
    }

    // Test v2 endpoint — different response shape
    @Test
    void getUser_v2_returnsV2Response() throws Exception {
        mockMvc.perform(get("/api/users/1")
                    .with(apiVersion("2")))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.name").exists())       // v2 field
               .andExpect(jsonPath("$.contact.email").exists()); // nested v2 structure
    }

    // Test baseline — no version header → default version (v1)
    @Test
    void getUser_noVersionHeader_routesToBaseline() throws Exception {
        mockMvc.perform(get("/api/users/1"))  // no apiVersion() — simulates old clients
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.userName").exists()); // v1 contract returned
    }

    // Test deprecated version returns deprecation headers
    @Test
    void getUser_v1_returnsDeprecationHeaders() throws Exception {
        mockMvc.perform(get("/api/users/1")
                    .with(apiVersion("1")))
               .andExpect(status().isOk())
               .andExpect(header().exists("Deprecation"))
               .andExpect(header().exists("Sunset"));
    }

    // Test unsupported version → 400 Bad Request
    @Test
    void getUser_unknownVersion_returns400() throws Exception {
        mockMvc.perform(get("/api/users/1")
                    .with(apiVersion("99")))  // not a supported version
               .andExpect(status().isBadRequest());
    }
}

// ── Integration test — full context ───────────────────────────
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class UserApiIntegrationTest {

    @Autowired
    TestRestTemplate restTemplate;

    @Test
    void v2_and_v1_coexist() {
        HttpHeaders headersV1 = new HttpHeaders();
        headersV1.set("X-API-Version", "1");

        HttpHeaders headersV2 = new HttpHeaders();
        headersV2.set("X-API-Version", "2");

        ResponseEntity<UserV1Response> v1 = restTemplate.exchange(
            "/api/users/1", HttpMethod.GET, new HttpEntity<>(headersV1), UserV1Response.class);

        ResponseEntity<UserV2Response> v2 = restTemplate.exchange(
            "/api/users/1", HttpMethod.GET, new HttpEntity<>(headersV2), UserV2Response.class);

        assertThat(v1.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(v1.getBody().getUserName()).isEqualTo("randhir.kumar"); // v1 field

        assertThat(v2.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(v2.getBody().getName()).isEqualTo("Randhir Kumar"); // v2 field
    }
}`,
      followUp: [
        { question: 'What is the most critical test to write for a versioned API?', answer: `The baseline/regression test — prove that old clients (no version header) still get exactly the same response they always did. This is the contract you cannot break. If this test fails after any change, you've broken backward compatibility. I always run these as part of CI with the exact JSON response structure captured as a snapshot — any change to the v1 response shape fails the build. The framework auto-configuring versioning in @WebMvcTest means these tests run fast without a full Spring context.` },
        { question: 'How do you ensure version-specific API documentation with Spring Boot 4.0?', answer: `SpringDoc OpenAPI (springdoc-openapi) integrates with Spring Boot 4.0 versioning — it can generate separate API specs per version automatically. You get /v3/api-docs/v1 and /v3/api-docs/v2 showing only the endpoints available for each version, including which ones are deprecated. Configure it with springdoc.api-version.enabled=true. This means Swagger UI shows version-specific documentation, and API consumers can clearly see what changed between v1 and v2.` },
      ],
      tip: 'Always test three scenarios for versioned APIs: (1) correct version routes to correct handler, (2) deprecated version returns Deprecation/Sunset headers, (3) no version header (old client) routes to baseline — this last one is the regression test you can never break.',
    },
  ],
}

export default springBoot
