const springBoot = {
  title: 'Spring Boot',
  description: 'Spring Boot, Spring Core, DI, Bean Lifecycle, REST APIs, AOP, and Spring MVC.',
  tags: ['Spring Boot', 'Spring Core', 'DI', 'REST API', 'AOP'],
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
        'What is @SpringBootApplication? What three annotations does it include?',
        'How does Spring Boot auto-configuration work internally?',
        'What is the difference between spring.jpa.hibernate.ddl-auto options?',
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
        'What is the difference between @Autowired, @Inject, and @Resource?',
        'How does Spring resolve circular dependencies?',
        'What is @Qualifier? When do you use it?',
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
        'What is BeanPostProcessor? How is it different from @PostConstruct?',
        'What is the difference between singleton scope in Spring vs Singleton design pattern?',
        'What happens if a singleton bean has a prototype-scoped dependency?',
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
        'What is the difference between @Controller and @RestController?',
        'What HTTP status code do you return for different operations?',
        'How do you handle validation errors and return meaningful error messages?',
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
        'What is the difference between @Before, @After, @Around, @AfterReturning, @AfterThrowing?',
        'What is a pointcut expression? Explain the syntax.',
        'How does Spring AOP work under the hood? (proxy-based)',
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
        'Why does @Transactional not work on private methods?',
        'What is the difference between REQUIRED and REQUIRES_NEW?',
        'How do you handle transactions across multiple databases (distributed transactions)?',
      ],
      tip: '@Transactional only rolls back on RuntimeException by default. If your method throws a checked exception and you don\'t specify rollbackFor, the transaction COMMITS even if an exception is thrown!',
    },
  ],
}

export default springBoot
