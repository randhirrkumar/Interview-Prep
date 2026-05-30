import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const COMPANIES = [
  {
    id: 'tcs',
    name: 'TCS',
    type: 'Service',
    difficulty: 'Medium',
    focus: 'Fundamentals, Java basics, SQL, Spring Boot basics',
    style: 'Panel interview. Multiple rounds. Structured. Focus on fundamentals.',
    questions: [
      {
        question: 'What is the difference between abstract class and interface?',
        answer: `Abstract class can have both abstract and concrete methods, constructors, instance variables, and access modifiers. Interface (pre-Java 8) could only have abstract methods; from Java 8 onwards interfaces support default and static methods; Java 9 added private methods.

Key differences:
- A class can implement multiple interfaces but extend only one abstract class (single inheritance constraint)
- Abstract class is used when classes share a common base with some shared implementation
- Interface is used to define a contract/capability that unrelated classes can implement

TCS angle: They love this question. Say "use abstract class for IS-A with shared state, use interface for CAN-DO capabilities." Example: Animal (abstract) → Dog extends Animal. Flyable (interface) → Bird implements Flyable.`,
      },
      {
        question: 'Explain Spring Boot auto-configuration.',
        answer: `Spring Boot auto-configuration automatically configures Spring beans based on what's on the classpath and what beans are already defined.

How it works:
1. @SpringBootApplication includes @EnableAutoConfiguration
2. Spring Boot reads META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports (or spring.factories in older versions)
3. Each AutoConfiguration class is annotated with @ConditionalOnClass, @ConditionalOnMissingBean, etc.
4. If conditions are met, the configuration is applied

Example: If spring-boot-starter-data-jpa is on classpath, DataSourceAutoConfiguration fires and creates a DataSource bean — you don't need to configure it yourself.

You can override by defining your own bean (auto-config backs off via @ConditionalOnMissingBean).`,
      },
      {
        question: 'Write a SQL query to find the second highest salary.',
        answer: `-- Method 1: Using subquery (most common)
SELECT MAX(salary) AS second_highest
FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);

-- Method 2: Using LIMIT/OFFSET (MySQL)
SELECT salary FROM employees
ORDER BY salary DESC
LIMIT 1 OFFSET 1;

-- Method 3: Using DENSE_RANK (handles ties correctly)
SELECT salary FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
  FROM employees
) ranked
WHERE rnk = 2;

TCS tip: They usually ask Method 1 (subquery). If asked about Nth highest salary, use Method 3 with DENSE_RANK — it handles duplicate salaries correctly.`,
      },
      {
        question: 'What is microservices? What are the benefits?',
        answer: `Microservices is an architectural style where an application is built as a collection of small, independently deployable services. Each service owns its data, runs in its own process, and communicates via APIs (REST or messaging).

Benefits:
- Independent deployment: Update one service without touching others
- Technology flexibility: Each service can use a different tech stack
- Scalability: Scale only the services under load, not the whole app
- Fault isolation: One service failing doesn't bring down everything
- Smaller teams: Each team owns one service end-to-end
- Easier to understand: Each codebase is small and focused

Trade-offs (mention these to show maturity): distributed system complexity, network latency, data consistency challenges, more DevOps overhead.`,
      },
      {
        question: 'How does HashMap work internally?',
        answer: `HashMap uses an array of buckets (Node[] table). Each bucket is a linked list (or red-black tree for large chains).

Put operation:
1. Calls key.hashCode(), then applies a secondary hash (spreads bits)
2. index = hash & (capacity - 1) — finds the bucket
3. If bucket is empty, place the node there
4. If collision, traverse the linked list: if same key (equals()), update value; else append

Get operation: same hash → same bucket → traverse list comparing keys with equals()

Important details:
- Default initial capacity: 16, load factor: 0.75
- When size > capacity × 0.75, rehash occurs (double capacity, re-bucket all entries)
- Java 8+: if a bucket chain exceeds 8 nodes, it converts to a red-black tree (O(log n) instead of O(n))
- HashMap is not thread-safe — use ConcurrentHashMap for multithreading`,
      },
      {
        question: 'What is SOLID principles?',
        answer: `SOLID is 5 object-oriented design principles:

S — Single Responsibility: A class should have only one reason to change. Don't mix business logic with persistence logic in the same class.

O — Open/Closed: Open for extension, closed for modification. Use abstraction/inheritance to add behavior without changing existing code.

L — Liskov Substitution: Subclasses should be substitutable for their parent without breaking correctness. If Bird has fly(), a Penguin subclass breaks LSP.

I — Interface Segregation: Don't force classes to implement interfaces they don't use. Split fat interfaces into smaller, focused ones.

D — Dependency Inversion: High-level modules shouldn't depend on low-level modules. Both should depend on abstractions. (Spring DI achieves this via constructor injection.)

TCS tip: Give one real example per principle. For D, mention @Autowired / constructor injection in Spring.`,
      },
      {
        question: 'Difference between @RestController and @Controller',
        answer: `@Controller is a stereotype annotation marking a class as a Spring MVC controller. By default, methods return view names (templates like Thymeleaf/JSP).

@RestController = @Controller + @ResponseBody. Every method's return value is automatically serialized (to JSON/XML) and written directly to the HTTP response body — no view resolution.

Use @Controller when building web apps with server-side rendering.
Use @RestController when building REST APIs.

If you use @Controller and want one method to return JSON: annotate that method with @ResponseBody. @RestController just applies @ResponseBody to all methods by default.`,
      },
      {
        question: 'What is the purpose of @Transactional?',
        answer: `@Transactional wraps a method (or class) in a database transaction. Spring creates a proxy that opens a transaction before the method runs and commits it on success, or rolls back on an unchecked exception (RuntimeException and subclasses by default).

Key attributes:
- propagation: REQUIRED (default, join or create), REQUIRES_NEW (always new), NESTED, etc.
- isolation: READ_COMMITTED, REPEATABLE_READ, SERIALIZABLE — controls concurrent access behavior
- rollbackFor: specify which checked exceptions should also trigger rollback
- readOnly: true for read-only queries (can optimize performance)

Common pitfall: @Transactional doesn't work when you call the method from within the same class (self-invocation bypasses the proxy). Always call transactional methods from outside the bean.`,
      },
    ],
    tip: 'TCS focuses on Java fundamentals and basics heavily. Be thorough on OOP, Collections, Spring Boot basics, SQL joins. System design is usually high-level only.',
    color: 'border-blue-700',
  },
  {
    id: 'cognizant',
    name: 'Cognizant',
    type: 'Service',
    difficulty: 'Medium',
    focus: 'Java, Spring Boot, Microservices, SQL, project discussion',
    style: 'Technical + manager round. Project-focused. Good culture discussion.',
    questions: [
      {
        question: 'Tell me about your current project architecture.',
        answer: `Structure your answer as: Context → Architecture → Your Role → Challenges solved.

Template: "I worked on [project name] — a [domain] application. The backend was built with Spring Boot microservices. We had [N] services: [list key services]. They communicated via [REST/Kafka]. Data was stored in [MySQL/Redis/etc.]. The application was containerized with Docker and deployed on [Azure/AWS]. I was responsible for [your specific services/modules]."

For EPLMS (Adani): "EPLMS was a logistics management system for Adani's operations. We had a Spring Boot monolith with modules for [vehicle tracking / permit management / etc.]. The backend exposed REST APIs consumed by an Angular frontend. Data was stored in MySQL. I was responsible for the permit lifecycle module including workflow management and document generation."

Cognizant tip: They want to hear you can explain YOUR part clearly. Don't just describe the system — say what YOU built, what problems YOU solved.`,
      },
      {
        question: 'How do you handle exceptions in Spring Boot?',
        answer: `Three-layer approach:

1. @ExceptionHandler in a controller — handles exceptions for that specific controller only
2. @ControllerAdvice / @RestControllerAdvice — global exception handler across all controllers
3. Custom exception classes — throw meaningful exceptions from service layer

Standard pattern:
\`\`\`java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse(404, ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse(500, "Something went wrong"));
    }
}
\`\`\`

Also mention: never expose stack traces to clients, always log the exception server-side, use problem+json format for REST APIs.`,
      },
      {
        question: 'What is REST API best practices?',
        answer: `Key REST best practices:

Resource naming: Use nouns, not verbs. /users not /getUsers. Plural nouns: /users/{id}/orders

HTTP methods: GET (read), POST (create), PUT (full update), PATCH (partial update), DELETE (remove)

Status codes: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error

Versioning: /api/v1/users — always version your APIs from day 1

Response consistency: Always return a structured response with status, message, data fields

Security: Use HTTPS always. Validate all inputs. Use JWT/OAuth2. Don't expose internal IDs if possible.

Pagination: For list endpoints, support ?page=0&size=20. Return total count in response.

Idempotency: GET, PUT, DELETE should be idempotent. POST is not.`,
      },
      {
        question: 'What are Kafka topics and partitions?',
        answer: `Topic: A named stream of messages. Think of it as a category/feed — producers publish to topics, consumers subscribe from topics.

Partition: A topic is divided into N partitions for parallelism and scalability. Each partition is an ordered, immutable log of messages. Messages within a partition are ordered, but ordering is NOT guaranteed across partitions.

Key concepts:
- Partition key: determines which partition a message goes to (same key → same partition → ordered delivery for that key)
- Offset: position of a message within a partition. Consumers track their offset per partition.
- Replication: each partition has a leader and follower replicas for fault tolerance
- Consumer group: multiple consumers sharing a topic. Each partition is consumed by exactly one consumer in the group — this enables horizontal scaling

Rule of thumb: number of partitions = max desired parallelism. If you have 3 consumer instances, you need at least 3 partitions.`,
      },
      {
        question: 'How did you improve performance in your project?',
        answer: `Structure as: Problem → Analysis → Solution → Result (with numbers).

Example scenarios to prepare:

Database optimization: "We had a report query taking 8+ seconds. I analyzed the execution plan with EXPLAIN, added composite indexes on frequently-joined columns, reduced N+1 queries using JOIN FETCH in JPQL. Query time dropped from 8s to 300ms."

Caching: "The dashboard API was hitting the DB on every call. I added Spring Cache with Redis for frequently-read reference data with 5-minute TTL. API response time reduced by 70%."

API pagination: "A list endpoint was loading 5000 records at once. Added pagination with Spring Data Pageable — reduced response time from 3s to 120ms."

Cognizant tip: They love numbers. Never say "it became faster" — say "reduced from X to Y" or "improved by Z%". Pick one real or realistic story and rehearse it well.`,
      },
      {
        question: 'What is the difference between monolith and microservices?',
        answer: `Monolith: Single deployable unit. All modules (auth, orders, payments, notifications) are in one codebase, one database, deployed together.

Pros: Simple to develop initially, easy to test, no network overhead, transactions are easy.
Cons: Hard to scale individual parts, one bug can bring down everything, deployment is all-or-nothing, large codebase becomes hard to manage.

Microservices: Each business capability is a separate service with its own database, deployed independently.

Pros: Independent scaling and deployment, technology flexibility, fault isolation, smaller focused codebases.
Cons: Distributed systems complexity, network latency, data consistency challenges (no ACID across services), more DevOps overhead.

When to choose: Start with monolith for small teams/early stage. Move to microservices when you have clear domain boundaries, multiple teams, and scaling needs justify the complexity.`,
      },
      {
        question: 'How do you handle authentication in Spring Boot?',
        answer: `Standard approach: Spring Security + JWT

Flow:
1. User POSTs credentials to /auth/login
2. Validate against DB, generate JWT (signed with secret key, contains userId, roles, expiry)
3. Return JWT to client
4. Client sends JWT in Authorization: Bearer <token> header on every request
5. JwtAuthenticationFilter intercepts requests, validates token, sets SecurityContext
6. Controller methods protected with @PreAuthorize("hasRole('ADMIN')") or security config

Key Spring Security config:
- SecurityFilterChain bean — define which routes are protected
- JwtAuthenticationFilter extends OncePerRequestFilter
- UserDetailsService — loads user from DB
- BCryptPasswordEncoder — for password hashing (never store plain text)

For SSO/SAML or OAuth2 (like "Login with Google"): Spring Security OAuth2 client starter handles the OAuth2 flow. You configure the provider in application.yml.`,
      },
      {
        question: 'Explain SOLID principles with examples.',
        answer: `S — Single Responsibility: UserService should handle user business logic only. Don't add email sending there — create EmailService.

O — Open/Closed: Payment processing via interface: PaymentProcessor. Add PaypalProcessor, StripeProcessor without changing existing code.

L — Liskov Substitution: Square extending Rectangle breaks LSP if setWidth() also sets height. Prefer composition or separate classes.

I — Interface Segregation: Don't put print(), scan(), fax() all in one Printer interface. Split into Printable, Scannable, Faxable.

D — Dependency Inversion: OrderService shouldn't create new MySQLOrderRepository(). Inject OrderRepository interface via constructor — Spring wires the implementation.

\`\`\`java
// Good — DIP applied
@Service
public class OrderService {
    private final OrderRepository repo; // interface, not impl
    public OrderService(OrderRepository repo) { this.repo = repo; }
}
\`\`\`

Cognizant tip: They want examples, not just definitions. The code snippet for D always impresses.`,
      },
    ],
    tip: 'Cognizant values project depth. Prepare to explain your architecture clearly. They love performance improvement stories with numbers.',
    color: 'border-purple-700',
  },
  {
    id: 'capgemini',
    name: 'Capgemini',
    type: 'Service',
    difficulty: 'Medium',
    focus: 'Java, Spring, Microservices, Cloud basics, Agile',
    style: 'Technical screening + technical interview + manager round.',
    questions: [
      {
        question: 'How does Spring Boot handle application.properties vs environment variables?',
        answer: `Spring Boot uses a property source hierarchy (higher priority overrides lower):

1. Command-line arguments (--server.port=8081)
2. OS environment variables (SERVER_PORT=8081)
3. application-{profile}.properties (e.g., application-prod.properties)
4. application.properties / application.yml
5. @PropertySource annotations
6. Default values in @Value("\${prop:default}")

Environment variables override properties files — this is key for 12-factor app / cloud deployment. You set DB passwords and secrets as environment variables (or Kubernetes secrets), not in committed properties files.

Spring Boot auto-converts: SERVER_PORT → server.port (uppercase with underscore → lowercase with dot).

Capgemini angle: They want to hear you know about externalizing config for cloud deployment. Mention: "In production on Azure, we set sensitive values as environment variables / Azure Key Vault secrets, not in application.properties."`,
      },
      {
        question: 'What is the difference between synchronous and asynchronous communication?',
        answer: `Synchronous: Caller waits for the response before proceeding. HTTP REST is synchronous — the client blocks until the server responds.

Asynchronous: Caller sends a message and continues. Response comes later (or never). Kafka/RabbitMQ messaging is asynchronous — producer publishes to a topic and moves on; consumer processes when ready.

When to use sync: When you need an immediate response (user login, payment confirmation), when data is needed to continue the flow.

When to use async: Long-running tasks (report generation, email sending), decoupling services so a slow downstream doesn't block upstream, high-throughput event streams.

In microservices: Use REST for synchronous queries, Kafka/messaging for events and commands that don't need an immediate response. Example: Order service publishes "OrderPlaced" event → Inventory service consumes it asynchronously.`,
      },
      {
        question: 'Explain your experience with Kafka.',
        answer: `Use the STAR format: Situation → Task → Action → Result.

Template: "In [project], we used Kafka for [purpose]. I was responsible for [specific part]. The challenge was [X]. I solved it by [Y]. The outcome was [Z]."

Example: "We used Kafka in our microservices to decouple order processing from notifications and inventory updates. I implemented the producer in the Order Service using Spring Kafka's KafkaTemplate and the consumer in Notification Service with @KafkaListener. We had 3 partitions for the orders topic. The challenge was ensuring idempotent processing — we tracked processed message IDs in Redis to prevent duplicate notifications. This reduced order processing time since we no longer waited synchronously for downstream services."

Key topics to know: producer/consumer config, @KafkaListener, consumer groups, offset management, error handling (dead letter topic), idempotency.`,
      },
      {
        question: 'What is Docker? How have you used it?',
        answer: `Docker is a containerization platform that packages an application and all its dependencies into a container image. Containers are lightweight, portable, and run consistently across environments.

Key concepts:
- Dockerfile: instructions to build an image
- Image: read-only snapshot of the app
- Container: running instance of an image
- Docker Hub / registry: stores and distributes images

Basic Dockerfile for Spring Boot:
\`\`\`dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
\`\`\`

How I've used it: "We dockerized our Spring Boot services for consistent local development and deployment. docker-compose.yml defined all services + MySQL + Redis so developers could spin up the full stack with one command. In CI/CD, we built Docker images and pushed to Azure Container Registry, then deployed to AKS."`,
      },
      {
        question: 'How do you handle distributed transactions?',
        answer: `Distributed transactions (spanning multiple services/databases) can't use traditional ACID transactions. Main patterns:

1. Saga Pattern: Break a distributed transaction into a sequence of local transactions, each publishing an event. If one step fails, compensating transactions undo previous steps.
   - Choreography: each service reacts to events and publishes next event
   - Orchestration: a central saga orchestrator directs each step

2. Two-Phase Commit (2PC): Coordinator asks all participants to prepare, then commits if all agree. Problematic in microservices — blocking, coordinator single point of failure.

3. Eventual Consistency: Accept that data across services will be consistent eventually, not immediately. Use idempotent operations and compensating actions.

Practical answer: "We avoided distributed transactions by designing service boundaries carefully so most operations were within one service. For cross-service flows like order+inventory+payment, we used the Saga pattern with Kafka events and compensating transactions (e.g., 'PaymentFailed' triggers an 'OrderCancelled' event)."`,
      },
      {
        question: 'What is the purpose of API Gateway?',
        answer: `API Gateway is the single entry point for all client requests to microservices. It sits in front of all services and handles cross-cutting concerns.

Responsibilities:
- Routing: route /orders/** to Order Service, /users/** to User Service
- Load balancing: distribute traffic across service instances
- Authentication/Authorization: validate JWT once at the gateway, not in each service
- Rate limiting: prevent abuse
- SSL termination: handle HTTPS at the gateway
- Request/Response transformation: add headers, transform payloads
- Circuit breaking: stop forwarding requests to failing services

Common implementations: Spring Cloud Gateway, Kong, AWS API Gateway, NGINX.

Spring Cloud Gateway example: configured via routes in application.yml with predicates (Path=/orders/**) and filters (AddRequestHeader, CircuitBreaker).

Without API Gateway: every client would need to know each service's address, auth would be duplicated in every service, CORS/SSL handled everywhere.`,
      },
      {
        question: 'How do you implement logging across microservices?',
        answer: `Key challenge: a single user request spans multiple services — you need to correlate logs.

Solution: Distributed Tracing with Correlation IDs

1. At API Gateway: generate a unique traceId (UUID) per request, add as X-Trace-Id header
2. Each service: extract the traceId from request header, include in all log entries, pass to downstream service calls
3. Use MDC (Mapped Diagnostic Context) in SLF4J to automatically include traceId in all logs within a thread

Spring Sleuth (now Micrometer Tracing): auto-generates traceId/spanId and propagates them via HTTP headers. Integrates with Zipkin or Jaeger for distributed trace visualization.

Centralized logging: Ship logs from all services to ELK Stack (Elasticsearch + Logstash + Kibana) or Azure Monitor. Query by traceId to see the full request journey.

Log levels: ERROR for exceptions, WARN for degraded behavior, INFO for business events, DEBUG for dev only. Never log passwords or PII.`,
      },
      {
        question: 'What is Circuit Breaker pattern?',
        answer: `Circuit Breaker prevents cascading failures in distributed systems. Like an electrical circuit breaker — when too many failures occur, it "trips" and stops sending requests to the failing service, giving it time to recover.

States:
- Closed (normal): requests flow through, failure count tracked
- Open (tripped): requests fail immediately (fallback returned), no calls to downstream
- Half-Open (testing recovery): let a few requests through; if they succeed, close the circuit; if they fail, stay open

Implementation with Resilience4j (common in Spring Boot):
\`\`\`java
@CircuitBreaker(name = "inventoryService", fallbackMethod = "fallbackInventory")
public InventoryResponse checkStock(String productId) {
    return inventoryClient.getStock(productId);
}

public InventoryResponse fallbackInventory(String productId, Exception ex) {
    return new InventoryResponse(productId, false); // assume out of stock
}
\`\`\`

Configure thresholds in application.yml: failure rate percentage, wait duration in open state, permitted calls in half-open. Pair with retry and timeout for full resilience.`,
      },
    ],
    tip: 'Capgemini focuses on modern cloud-native practices. Be prepared to discuss Docker, CI/CD, and cloud deployment. Mention Azure or AWS experience.',
    color: 'border-cyan-700',
  },
  {
    id: 'infosys',
    name: 'Infosys',
    type: 'Service',
    difficulty: 'Medium',
    focus: 'Java OOP, Spring Boot, Microservices, SQL, Data Structures, project discussion',
    style: 'Online test (coding + aptitude) → Technical interview(s) → HR round. Project-heavy discussion.',
    questions: [
      {
        question: 'What are the four pillars of OOP and how have you applied them in your project?',
        answer: `The four pillars are Encapsulation, Inheritance, Polymorphism, and Abstraction.

Encapsulation: Wrapping data and methods together, restricting direct access via private fields + getters/setters. In my project, every entity class encapsulates its fields — no direct field access outside the class.

Inheritance: IS-A relationship. A subclass inherits fields and methods from its parent. Example: BaseEntity (id, createdAt, updatedAt) extended by all domain entities — avoids repeating audit fields everywhere.

Polymorphism: One interface, many implementations. Runtime polymorphism via method overriding. Example: PaymentProcessor interface implemented by CreditCardProcessor and UpiProcessor — the service layer calls process() without caring which one is injected.

Abstraction: Hiding implementation details. Service interfaces expose WHAT, not HOW. Repository interfaces abstract DB access — business logic doesn't know if it's MySQL or any other DB.

Infosys tip: They love real project examples. Don't give textbook answers. For each pillar, say one line about where you used it in your actual project.`,
      },
      {
        question: 'What is the difference between ArrayList and LinkedList? When would you use each?',
        answer: `ArrayList: backed by a dynamic array. Index-based access is O(1). Insert/delete in the middle is O(n) because elements need to be shifted. More cache-friendly (contiguous memory).

LinkedList: doubly linked list. Index-based access is O(n) (must traverse). Insert/delete at head/tail is O(1). Higher memory overhead (each node stores prev/next pointers).

When to use ArrayList:
- Frequent random access by index
- Mostly read-heavy operations
- Default choice for most use cases

When to use LinkedList:
- Frequent insertions/deletions at the beginning or middle
- Implementing a queue or deque (use ArrayDeque in practice — faster than LinkedList for most queue operations)

Practical reality: ArrayList is almost always the right choice. LinkedList is rarely used in production Java code due to poor cache performance and higher memory overhead. ArrayDeque is preferred even for queue use cases.

Infosys tip: Mention time complexities for each operation. They frequently ask "which is faster for X operation."`,
      },
      {
        question: 'Explain the Spring Boot request lifecycle — what happens from HTTP request to response?',
        answer: `Step-by-step flow:

1. HTTP request arrives at the embedded Tomcat server
2. DispatcherServlet receives the request (the "front controller")
3. HandlerMapping finds the matching controller method based on URL and HTTP method
4. HandlerInterceptors run preHandle() — auth checks, logging, etc.
5. Argument resolvers convert request params/body to method parameters (@RequestBody deserialized via Jackson)
6. Controller method executes — calls service layer
7. Service calls repository, repository hits DB via JPA/Hibernate
8. Controller returns response object or ResponseEntity
9. HandlerInterceptors run postHandle()
10. Return value is processed: @ResponseBody → Jackson serializes to JSON
11. ExceptionHandler/ControllerAdvice intercepts if an exception was thrown
12. Response is written back to the client

Filters (e.g., Spring Security's JwtAuthenticationFilter) run before DispatcherServlet — they operate at the Servlet level, not Spring MVC level.

Infosys tip: Draw this as a flow when explaining it. Even verbally, saying "first X, then Y" in order shows you deeply understand the framework, not just how to use annotations.`,
      },
      {
        question: 'What is normalization? Explain 1NF, 2NF, 3NF with examples.',
        answer: `Normalization is the process of organizing a relational database to reduce data redundancy and improve data integrity.

1NF (First Normal Form):
- Each column contains atomic (indivisible) values
- No repeating groups or arrays in a column
- Violation: storing "Java, Spring, SQL" in a single skills column
- Fix: separate Skills table with one row per skill

2NF (Second Normal Form):
- Must be in 1NF
- Every non-key column is fully dependent on the entire primary key (eliminates partial dependencies)
- Applies when you have a composite primary key
- Violation: Order table with (OrderId, ProductId) as PK, but ProductName only depends on ProductId (not the full key)
- Fix: Move ProductName to a separate Products table

3NF (Third Normal Form):
- Must be in 2NF
- No transitive dependencies — non-key columns must not depend on other non-key columns
- Violation: Employee table has DepartmentId and DepartmentName — DepartmentName depends on DepartmentId, not the primary key (EmployeeId)
- Fix: Move DepartmentName to a Departments table

In practice: normalize to 3NF for OLTP systems. Selective denormalization is acceptable for read-heavy reporting queries where joins are expensive.`,
      },
      {
        question: 'How do you manage application configuration in different environments (dev, staging, prod)?',
        answer: `Spring Boot profile-based configuration:

1. application.properties — shared/default config
2. application-dev.properties — dev overrides
3. application-staging.properties — staging overrides
4. application-prod.properties — prod overrides

Activate profile:
- Via env variable: SPRING_PROFILES_ACTIVE=prod
- In application.properties: spring.profiles.active=dev (for local)
- Command line: --spring.profiles.active=prod

What goes where:
- Dev: H2 in-memory DB, debug logging, mock external services
- Staging: real DB (clone of prod), info logging, real integrations
- Prod: production DB (credentials from env variables, not files), warn/error logging only

Secret management: NEVER commit passwords/API keys to application-prod.properties. Use:
- Environment variables (Kubernetes secrets, Azure Key Vault, AWS Secrets Manager)
- @Value("\${DB_PASSWORD}") reads from env variable at runtime

Spring Cloud Config (optional): centralized config server for all microservices — single place to update config across services.

Infosys tip: They often ask "how do you handle secrets?" — always say environment variables or a secrets manager, never hardcoded in properties files.`,
      },
      {
        question: 'Write a Java program to find duplicates in an array.',
        answer: `// Method 1: Using HashSet — O(n) time, O(n) space
public List<Integer> findDuplicates(int[] arr) {
    Set<Integer> seen = new HashSet<>();
    List<Integer> duplicates = new ArrayList<>();
    for (int num : arr) {
        if (!seen.add(num)) {  // add() returns false if already present
            duplicates.add(num);
        }
    }
    return duplicates;
}

// Method 2: Using HashMap to count frequencies — O(n) time, O(n) space
public List<Integer> findDuplicatesWithCount(int[] arr) {
    Map<Integer, Integer> freq = new HashMap<>();
    for (int num : arr) freq.merge(num, 1, Integer::sum);
    return freq.entrySet().stream()
        .filter(e -> e.getValue() > 1)
        .map(Map.Entry::getKey)
        .collect(Collectors.toList());
}

// Method 3: Sorting — O(n log n) time, O(1) extra space
public List<Integer> findDuplicatesSorted(int[] arr) {
    Arrays.sort(arr);
    List<Integer> duplicates = new ArrayList<>();
    for (int i = 1; i < arr.length; i++) {
        if (arr[i] == arr[i - 1] && (i < 2 || arr[i] != arr[i - 2])) {
            duplicates.add(arr[i]);
        }
    }
    return duplicates;
}

Infosys tip: Always mention the time and space complexity of your solution. They expect you to know multiple approaches and explain trade-offs. HashSet method is the preferred interview answer.`,
      },
      {
        question: 'What is the difference between checked and unchecked exceptions in Java?',
        answer: `Checked exceptions: subclasses of Exception (but not RuntimeException). The compiler forces you to either catch them or declare them with throws. Represent recoverable conditions that the caller should handle.
Examples: IOException, SQLException, FileNotFoundException

Unchecked exceptions: subclasses of RuntimeException. Compiler doesn't enforce handling. Represent programming errors or unrecoverable conditions.
Examples: NullPointerException, IllegalArgumentException, ArrayIndexOutOfBoundsException

\`\`\`java
// Checked — must handle or declare
public void readFile(String path) throws IOException {
    FileReader fr = new FileReader(path); // throws checked IOException
}

// Unchecked — no forced handling
public void divide(int a, int b) {
    if (b == 0) throw new ArithmeticException("Division by zero"); // unchecked
}
\`\`\`

Custom exceptions:
- Extend Exception for checked (use when caller can meaningfully recover)
- Extend RuntimeException for unchecked (use for programming errors or when recovery is unlikely)

Spring convention: Spring wraps most checked exceptions (like SQLException) into unchecked DataAccessException subclasses — you don't need try-catch everywhere in service code.

Infosys tip: They often follow up with "when would you create a custom exception?" — say "when you need to convey domain-specific error information that existing exceptions don't capture."`,
      },
      {
        question: 'Explain your most challenging project module and how you handled it.',
        answer: `This is the key Infosys question. They want depth on your actual work. Structure as:

Module → Challenge → Technical decisions → Outcome

Template: "The most challenging module I built was [X] in [project]. The challenge was [specific technical/business problem]. The complexity came from [what made it hard — scale, edge cases, integration, performance, requirement ambiguity].

My approach: [what you analyzed, what options you considered, what you chose and why]. I used [specific technologies/patterns]. The key decision was [one important technical decision and why you made it].

The result: [measurable outcome — reduced time, fixed bug, improved performance, enabled feature].

What I'd do differently: [show maturity — one thing you'd change with hindsight]."

For EPLMS example: "The permit lifecycle module was the most complex. Permits had 8+ states and different approval workflows per permit type. The challenge was designing the state machine cleanly without a mass of if-else conditions. I used the State pattern — each permit state was a class implementing a common interface with handle() method. Adding new states or transitions required adding a class, not modifying existing ones. This made the code far easier to test and extend when new permit types were added."

Infosys tip: They probe deep once you start talking — be ready to answer "why did you use that approach over X?" and "what were the trade-offs?"`,
      },
    ],
    tip: 'Infosys interviews are structured — online test first, then technical rounds. They go deep on Java fundamentals, OOP, and your project. Have clear stories ready for your project modules. SQL and basic DS questions are common.',
    color: 'border-orange-700',
  },
  {
    id: 'product',
    name: 'Product Companies',
    type: 'Product',
    difficulty: 'Hard',
    focus: 'DSA, System Design, Deep Java, Concurrency, Scale',
    style: 'Multiple technical rounds. DSA rounds. System design. Deep technical discussion.',
    questions: [
      {
        question: 'Design a real-time notification system for 10M users.',
        answer: `Requirements clarification: Push notifications (mobile/web)? In-app? Email/SMS? Latency requirement? Notification types?

High-level design:

Notification Service: receives requests (from other services or schedules) via REST or Kafka events.

Fan-out: for sending to 10M users, don't process synchronously. Publish to Kafka topic. Multiple consumer workers pull and dispatch.

Delivery channels:
- Push: FCM (Android), APNS (iOS), Web Push — use a library/provider
- WebSocket/SSE: for real-time in-app (user is online)
- Email: SES/SendGrid
- SMS: Twilio

Storage: Notification history in Cassandra or DynamoDB (write-heavy, time-series access). User preferences in MySQL.

Key design decisions:
- Idempotency: deduplicate notifications (same event, same user)
- Priority queues: critical (OTP) vs. marketing (promotions)
- Throttling: respect per-user opt-out preferences
- Retry with exponential backoff for failed deliveries
- Dead letter queue for undeliverable notifications`,
      },
      {
        question: 'Implement an LRU cache in Java.',
        answer: `LRU (Least Recently Used) evicts the least recently accessed item when capacity is reached.

Optimal implementation: HashMap + Doubly Linked List = O(1) get and put.

\`\`\`java
class LRUCache {
    private final int capacity;
    private final Map<Integer, Node> map = new HashMap<>();
    private final Node head = new Node(0, 0); // dummy head
    private final Node tail = new Node(0, 0); // dummy tail

    LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail; tail.prev = head;
    }

    public int get(int key) {
        if (!map.containsKey(key)) return -1;
        Node node = map.get(key);
        moveToFront(node);
        return node.val;
    }

    public void put(int key, int val) {
        if (map.containsKey(key)) {
            Node node = map.get(key);
            node.val = val;
            moveToFront(node);
        } else {
            if (map.size() == capacity) {
                Node lru = tail.prev;
                remove(lru);
                map.remove(lru.key);
            }
            Node node = new Node(key, val);
            addToFront(node);
            map.put(key, node);
        }
    }

    private void moveToFront(Node n) { remove(n); addToFront(n); }
    private void remove(Node n) { n.prev.next = n.next; n.next.prev = n.prev; }
    private void addToFront(Node n) { n.next = head.next; n.prev = head; head.next.prev = n; head.next = n; }

    static class Node { int key, val; Node prev, next; Node(int k, int v) { key=k; val=v; } }
}
\`\`\`

Java alternative: LinkedHashMap with accessOrder=true and overriding removeEldestEntry.`,
      },
      {
        question: 'What are the guarantees of @Transactional in Spring?',
        answer: `@Transactional provides ACID guarantees at the method boundary, but with important nuances:

Guarantees:
- Atomicity: all DB operations in the method succeed or all roll back
- Consistency: DB moves from one valid state to another
- Isolation: controlled by isolation attribute (default is DB default, usually READ_COMMITTED)
- Durability: committed data persists

What it does NOT guarantee:
1. Self-invocation: calling a @Transactional method from within the same bean bypasses the proxy — no transaction!
2. Checked exceptions: by default, only RuntimeException triggers rollback. Use rollbackFor=Exception.class for checked exceptions.
3. Thread safety: transaction is bound to the current thread via ThreadLocal. If you spawn new threads inside, they don't share the transaction.
4. Nested transactions: REQUIRES_NEW creates a truly independent transaction. NESTED uses savepoints (DB-dependent).

Propagation levels matter: REQUIRED (default) joins existing or creates new. REQUIRES_NEW always creates new (separate commit/rollback). SUPPORTS runs without transaction if none exists.`,
      },
      {
        question: 'How do you handle exactly-once processing in Kafka?',
        answer: `Exactly-once is the hardest delivery guarantee. Kafka provides it via the Exactly-Once Semantics (EOS) feature introduced in Kafka 0.11.

Producer side (idempotent producer):
- enable.idempotence=true: Kafka deduplicates duplicate produce requests using sequence numbers per partition
- Prevents duplicate records on retries

Transactions (producer + consumer):
- Producer uses beginTransaction(), send(), commitTransaction() / abortTransaction()
- Consumer sets isolation.level=read_committed to only read committed messages
- This gives atomic read-process-write: read from topic A, process, write to topic B — all or nothing

Spring Kafka config:
\`\`\`java
@Bean
public KafkaTransactionManager<String, String> transactionManager(ProducerFactory<String, String> pf) {
    return new KafkaTransactionManager<>(pf);
}
\`\`\`

Practical approach: For most use cases, at-least-once + idempotent consumers (check if already processed using a DB record or Redis) is simpler and sufficient. True EOS adds complexity — use when exactly-once is a hard business requirement (financial transactions, billing).`,
      },
      {
        question: 'How does G1GC work? When would you tune GC?',
        answer: `G1GC (Garbage First Garbage Collector) is the default GC since Java 9. Designed for large heaps with predictable pause times.

How it works:
- Heap divided into equal-sized regions (not fixed young/old generations)
- Regions are dynamically assigned as Eden, Survivor, Old, or Humongous (large objects)
- Young GC: evacuates live objects from Eden/Survivor regions (stop-the-world, short pause)
- Mixed GC: collects young + some old regions — prioritizes regions with most garbage ("garbage first")
- Concurrent marking: runs in background while app runs, identifies live objects
- Pause time goal: -XX:MaxGCPauseMillis=200 (default) — G1 tries to meet this target

When to tune:
1. GC pauses are too long: lower MaxGCPauseMillis, but may increase GC frequency
2. OutOfMemoryError: increase heap size (-Xmx), check for memory leaks
3. Humongous allocations: objects > 50% of region size skip young gen — avoid by reducing large object creation
4. High allocation rate: more Eden regions, consider reducing object creation

Monitoring: -Xlog:gc* for GC logs. JVM tools: VisualVM, JConsole, async-profiler.`,
      },
      {
        question: 'Design a distributed rate limiter.',
        answer: `Rate limiter prevents abuse by limiting requests per user/IP within a time window.

Algorithms:
- Token Bucket: tokens added at fixed rate, consumed per request. Allows bursts up to bucket size.
- Fixed Window: count requests per time window (e.g., 100 req/minute). Simple but boundary spike problem.
- Sliding Window Log: store timestamps of each request, count in last N seconds. Accurate but memory-heavy.
- Sliding Window Counter: hybrid — interpolates between two windows. Accurate and memory-efficient.

Distributed implementation (using Redis):

\`\`\`
// Token bucket in Redis using Lua script (atomic)
// key: rate_limit:{userId}
// INCR + EXPIRE for fixed window
\`\`\`

Redis-based fixed window:
1. INCR rate:userId:window_timestamp
2. If count == 1, set EXPIRE to window size
3. If count > limit, reject with 429

For sliding window: use Redis Sorted Set with timestamp as score. ZADD on each request, ZREMRANGEBYSCORE to drop old, ZCOUNT to check.

Production: Nginx rate limiting for simple cases. Redis + Lua for custom distributed logic. Bucket4j (Java library) for application-level rate limiting.`,
      },
      {
        question: 'Explain the CAP theorem with examples.',
        answer: `CAP theorem: A distributed system can guarantee at most 2 of 3 properties:

C — Consistency: Every read returns the most recent write (or an error). All nodes see the same data at the same time.

A — Availability: Every request receives a response (not an error), though it may not be the latest data.

P — Partition Tolerance: System continues operating despite network partitions (messages between nodes dropped or delayed).

In real distributed systems, network partitions WILL happen — so P is not optional. The real choice is C vs. A during a partition:

CP systems (sacrifice availability): MySQL with synchronous replication, HBase, Zookeeper. During partition, refuse requests to stay consistent.

AP systems (sacrifice consistency): Cassandra, DynamoDB, CouchDB. During partition, serve potentially stale data to stay available. Eventual consistency.

CA systems: Only possible without partitions — single-node databases like SQLite.

Real-world: Cassandra is AP — during a split, both sides accept writes, merged later. ZooKeeper is CP — during a partition, the minority partition refuses writes.

Choose based on business need: banking → CP (consistent balance). Social media feed → AP (slightly stale is fine).`,
      },
      {
        question: 'How would you debug a memory leak in a Spring Boot app?',
        answer: `Step-by-step approach:

1. Identify: Monitor heap usage over time. Symptoms: gradually increasing heap, frequent Full GC, eventual OutOfMemoryError.

2. Get a heap dump:
   - JVM flag: -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/
   - On-demand: jmap -dump:live,format=b,file=heap.hprof <pid>
   - Via Actuator: /actuator/heapdump endpoint

3. Analyze with Eclipse MAT or VisualVM:
   - Look for objects with unexpectedly high retained heap
   - Check the "dominator tree" — who is keeping what alive
   - Find GC roots holding references to large object graphs

Common Spring Boot leak causes:
- Static collections holding references: static List/Map that grows forever
- Event listeners not unregistered: @EventListener in prototype-scoped beans
- ThreadLocal not cleaned up: MDC variables, security context in thread pools
- Cache without eviction: Caffeine/Ehcache without size limit or TTL
- Hibernate session caching too much in a batch operation
- Connection pool exhaustion (not exactly heap but causes hangs)

Fix: remove the root cause (the thing keeping the reference alive), add eviction policies to caches, use WeakReference for caches where appropriate.`,
      },
      {
        question: 'Implement a custom thread pool executor.',
        answer: `\`\`\`java
public class CustomThreadPoolExecutor {
    private final int poolSize;
    private final BlockingQueue<Runnable> taskQueue;
    private final List<WorkerThread> workers;
    private volatile boolean shutdown = false;

    public CustomThreadPoolExecutor(int poolSize, int queueSize) {
        this.poolSize = poolSize;
        this.taskQueue = new LinkedBlockingQueue<>(queueSize);
        this.workers = new ArrayList<>();
        for (int i = 0; i < poolSize; i++) {
            WorkerThread worker = new WorkerThread();
            workers.add(worker);
            worker.start();
        }
    }

    public void submit(Runnable task) {
        if (shutdown) throw new IllegalStateException("Pool is shut down");
        try {
            taskQueue.put(task); // blocks if queue full
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    public void shutdown() {
        shutdown = true;
        workers.forEach(Thread::interrupt);
    }

    private class WorkerThread extends Thread {
        public void run() {
            while (!shutdown || !taskQueue.isEmpty()) {
                try {
                    Runnable task = taskQueue.poll(1, TimeUnit.SECONDS);
                    if (task != null) task.run();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
    }
}
\`\`\`

In production use Java's ThreadPoolExecutor directly — it has rejection policies, graceful shutdown, monitoring hooks, and is battle-tested. Implement custom only for specific requirements.`,
      },
      {
        question: 'How does CompletableFuture work? When would you use it?',
        answer: `CompletableFuture is Java 8's async programming model. It represents a future result that can be composed, chained, and combined.

Basic usage:
\`\`\`java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    // runs in ForkJoinPool.commonPool() by default
    return fetchUserFromDB(userId);
});

// Chain transformations (non-blocking)
future
    .thenApply(user -> user.getEmail())          // transform result
    .thenAccept(email -> sendNotification(email)) // consume result
    .exceptionally(ex -> { log.error(ex); return null; }); // error handling
\`\`\`

Combining futures:
\`\`\`java
// Run two async tasks in parallel, combine results
CompletableFuture<User> userFuture = CompletableFuture.supplyAsync(() -> getUser(id));
CompletableFuture<Orders> ordersFuture = CompletableFuture.supplyAsync(() -> getOrders(id));

CompletableFuture.allOf(userFuture, ordersFuture).thenRun(() -> {
    User user = userFuture.join();
    Orders orders = ordersFuture.join();
    // both available
});
\`\`\`

When to use: parallel API calls (don't wait for each sequentially), non-blocking I/O chains, fire-and-forget tasks, aggregating results from multiple services.

When NOT to use: simple sequential logic (overkill), when you need to block anyway (defeats the purpose), in reactive stacks (use Mono/Flux instead).`,
      },
    ],
    tip: 'Product companies go deep. LeetCode medium/hard level DSA. System design at scale. Deep Spring internals. Prepare for "why" questions — they want you to justify every decision.',
    color: 'border-yellow-700',
  },
  {
    id: 'startup',
    name: 'Startups',
    type: 'Startup',
    difficulty: 'Medium-Hard',
    focus: 'Versatility, ownership, practical problem-solving, culture fit',
    style: 'Practical coding + system design + culture fit. Fast-paced interviews.',
    questions: [
      {
        question: 'How would you design the backend from scratch for our feature?',
        answer: `Framework for any "design from scratch" question:

1. Clarify requirements: "Can I ask a few clarifying questions?" — understand scale, users, main use case, constraints

2. Define the data model: What entities? What relationships? SQL vs NoSQL decision.

3. Define the API contract: what endpoints? What request/response?

4. Service structure: one service or split? What does each own?

5. Non-functional requirements: expected load? Latency SLA? Availability?

6. Infrastructure: where deployed? Containerized? Any cloud services?

Template answer: "I'd start by defining the core domain entities and their relationships. Then I'd design a RESTful API with clearly defined contracts. For the tech stack, I'd use Spring Boot for the API layer, MySQL for relational data (or Postgres), Redis for caching frequently-read data. I'd containerize with Docker for consistent deployments. I'd ensure the design allows horizontal scaling from day one — stateless services, no session stored in memory. Monitoring via structured logging and metrics from the start."

Startup tip: They want to see you think end-to-end and make pragmatic decisions fast. Don't over-engineer. Say "start simple, scale when needed."`,
      },
      {
        question: 'Tell me about a time you owned a problem end-to-end.',
        answer: `Use STAR format: Situation → Task → Action → Result

Strong answer structure:
- Problem discovered (not assigned to you — you identified it or took ownership)
- What "end-to-end" meant: from diagnosis through fix through monitoring
- Decisions you made independently
- Impact with numbers

Example: "In [project], I noticed our API latency had spiked for the reporting module during month-end processing. No one was assigned to it yet. I took ownership — profiled the queries, found we were loading entire datasets into memory and sorting in Java instead of the DB. I rewrote the queries with proper ORDER BY and pagination, added a composite index, and implemented caching for frequently-requested date ranges. Response time dropped from 12s to under 800ms. I also added a monitoring alert so we'd catch similar regressions early."

Key elements: show initiative (you didn't wait to be asked), show full-cycle ownership (diagnose → fix → prevent recurrence), show impact (numbers).`,
      },
      {
        question: 'How do you handle ambiguous requirements?',
        answer: `Framework:
1. Ask focused clarifying questions (not "tell me everything" — ask specific, high-value questions)
2. State your assumptions explicitly before building
3. Build for the core case first, design for extensibility
4. Check in early rather than building the wrong thing for 2 weeks

What to ask when requirements are ambiguous:
- Who is the end user and what's their primary goal?
- What does "success" look like? Is there a metric?
- What are the hard constraints (deadline, performance, budget)?
- Are there edge cases that would fundamentally change the design?

Good example answer: "In my current project, requirements would sometimes come in as 'we need a report for managers.' I'd sit with the product owner for 20 minutes to understand what decisions managers need to make from this report, what data they have access to, and what format they prefer. Better to spend 20 minutes clarifying than 2 weeks building the wrong thing. I'd also share a quick wireframe or API draft before full implementation to validate direction early."

Startup angle: Startups especially value this — they move fast and requirements change. Show you can operate with incomplete information without being paralyzed.`,
      },
      {
        question: 'What databases have you worked with? When would you choose NoSQL?',
        answer: `Worked with: MySQL (primary), sometimes Redis for caching.

When to choose NoSQL over SQL:

Choose NoSQL (e.g., MongoDB, Cassandra, DynamoDB) when:
- Schema is dynamic or varies per record (e.g., product catalog with different attributes per category)
- Massive scale with high write throughput (Cassandra for time-series, IoT data)
- Horizontal scaling is a priority and you can tolerate eventual consistency
- Data access pattern is clear and simple (lookup by key, not complex joins)
- Unstructured/semi-structured data (logs, documents, social media posts)

Stick with SQL (MySQL, PostgreSQL) when:
- Data is relational with complex queries and joins
- ACID transactions are required (financial data, order management)
- Schema is stable and well-defined
- Team is more familiar with SQL (lower operational risk)

Redis specifically: not a primary DB — use for caching, session storage, rate limiting, leaderboards, pub/sub. In-memory so data loss risk on restart (configure persistence if needed).

Practical answer: "I've primarily used MySQL. I'd choose NoSQL when the data access pattern is clearly key-based without complex joins, or when we need to handle genuinely schema-less data at scale. For most startup backend services, MySQL + proper indexing handles a lot before you need to reach for NoSQL."`,
      },
      {
        question: 'How do you approach API design?',
        answer: `My API design process:

1. Define resources and actions: what are the nouns? (users, orders, products) What are the operations? Map to HTTP methods.

2. URL conventions:
   - Plural nouns: /users, /orders
   - Nested for ownership: /users/{id}/orders
   - Actions as sub-resources: /orders/{id}/cancel (POST)

3. Response consistency: standard envelope
\`\`\`json
{ "status": "success", "data": {...}, "message": null }
{ "status": "error", "data": null, "message": "User not found" }
\`\`\`

4. Version from day 1: /api/v1/... — even if you never need v2, breaking changes become much easier

5. Status codes: use them correctly. 201 for created, 204 for no-content DELETE, 422 for validation errors

6. Pagination for lists: ?page=0&size=20, return total count

7. Document with OpenAPI/Swagger: self-documenting APIs reduce integration friction

8. Error messages: be helpful to developers but don't leak internal details to end users

Startup tip: "Move fast but don't break things" applies to API design. Versioning and consistent response format save you from painful client migrations later.`,
      },
      {
        question: 'Tell me about a time you failed and what you learned.',
        answer: `This question tests self-awareness and growth mindset. Don't deflect. Pick a real failure.

Structure: What happened → Why it happened (your part in it) → Impact → What you learned → What changed after

Strong example: "Early in my career, I was tasked with a DB migration for a feature launch. I tested it in the staging environment and it worked fine. But I didn't account for a difference in data volume — staging had 10K records, production had 2M. The migration ran a full-table ALTER TABLE in production during business hours, causing a 15-minute outage. I hadn't consulted a senior engineer or researched zero-downtime migration techniques.

What I learned: always test with production-equivalent data volumes. For schema changes on large tables, use pt-online-schema-change or equivalent. Never run long-running DDL during peak hours. I now write a migration runbook with rollback plan for any DB change before touching production.

The failure stuck with me — since then I've never shipped a DB change without a reviewed runbook."

Key: own it fully, don't blame tools or teammates, and show concrete behavioral change.`,
      },
      {
        question: 'How do you balance speed and code quality under deadline pressure?',
        answer: `Honest answer — show maturity, not platitudes like "I always maintain quality."

Framework: distinguish between technical debt you choose and technical debt you incur accidentally.

Under deadline pressure, I prioritize:
1. Correctness over elegance — working code ships, refactoring can follow
2. Tests for critical paths — skip tests on UI wiring, keep them on business logic and edge cases
3. Document shortcuts explicitly — leave a TODO or issue ticket, don't let it silently rot
4. No security shortcuts — auth, input validation, SQL injection prevention are non-negotiable under pressure

What I cut: code comments, perfect variable naming, premature abstraction, non-critical error handling scenarios.

What I never cut: core business logic tests, security checks, logging for debuggability, error handling on external API calls.

After the deadline: schedule the cleanup sprint. "Move fast and fix it later" only works if you actually fix it later. If you never pay back the debt, it compounds.

Startup answer: "Startups need speed. I've shipped pragmatic code under pressure — but I make the shortcuts explicit, scope the debt, and push to pay it back in the next cycle. What I don't compromise on is correctness in the core domain and security."`,
      },
      {
        question: 'What monitoring would you set up for a new service?',
        answer: `Minimum viable monitoring for any production service:

1. Health checks: /actuator/health endpoint. Liveness + readiness probes for Kubernetes.

2. Metrics (USE method):
   - Utilization: CPU, memory, thread pool usage
   - Saturation: queue depth, request backlog
   - Errors: error rate, 4xx/5xx rates

3. Application metrics via Micrometer (Spring Boot):
   - Request count, response time (p50/p95/p99) per endpoint
   - Custom business metrics (orders processed/minute)
   - JVM metrics: heap, GC pause time

4. Logging:
   - Structured JSON logs with traceId, userId, duration
   - ERROR logs alert immediately
   - Centralized (ELK / Azure Monitor)

5. Distributed tracing: Micrometer Tracing + Zipkin/Jaeger for cross-service request tracing

6. Alerting:
   - Error rate > 1% → page on-call
   - p99 latency > SLA → alert
   - Disk/memory approaching limit → warn

7. Dashboards: Grafana or Azure Dashboard — latency, error rate, throughput (RED metrics)

Startup tip: "You can't fix what you can't see. I set up basic monitoring before or at launch, not after the first incident."`,
      },
    ],
    tip: 'Startups want problem-solvers who can move fast. Show ownership, not just execution. Demonstrate you can think end-to-end — from API design to deployment to monitoring.',
    color: 'border-green-700',
  },
]

function QuestionItem({ index, q }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-gray-800/50 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-start gap-2.5 p-3 text-left hover:bg-gray-800 transition-colors cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span className="text-blue-400 font-bold text-xs mt-0.5 flex-shrink-0">Q{index + 1}</span>
        <span className="text-sm text-gray-300 flex-1">{q.question}</span>
        {open
          ? <ChevronUp size={14} className="text-gray-500 flex-shrink-0 mt-0.5" />
          : <ChevronDown size={14} className="text-gray-500 flex-shrink-0 mt-0.5" />
        }
      </button>
      {open && (
        <div className="px-4 pb-3 pt-2 text-sm text-gray-400 leading-relaxed border-t border-gray-700/50 whitespace-pre-wrap">
          {q.answer}
        </div>
      )}
    </div>
  )
}

export default function CompanyPrep() {
  const [selected, setSelected] = useState(null)
  const company = selected ? COMPANIES.find(c => c.id === selected) : null

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      <div className="card">
        <h1 className="section-title">Company-Specific Preparation</h1>
        <p className="text-sm text-gray-400">Interview style, focus areas, and common questions with answers tailored for each company type.</p>
      </div>

      {!company ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COMPANIES.map(c => (
            <button key={c.id} onClick={() => setSelected(c.id)} className={`card text-left hover:opacity-90 transition-all border-l-4 ${c.color}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-white text-lg">{c.name}</div>
                <span className={`text-xs px-2 py-0.5 rounded ${c.type === 'Product' ? 'bg-yellow-900/40 text-yellow-300' : c.type === 'Startup' ? 'bg-green-900/40 text-green-300' : 'bg-blue-900/40 text-blue-300'}`}>{c.type}</span>
              </div>
              <div className="text-xs text-gray-500 mb-1">Difficulty: <span className="text-gray-300">{c.difficulty}</span></div>
              <div className="text-xs text-gray-400 line-clamp-2">{c.focus}</div>
              <div className="text-xs text-gray-600 mt-2">{c.questions.length} questions with answers</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <button onClick={() => setSelected(null)} className="text-sm text-gray-400 hover:text-white">← Back to companies</button>

          <div className={`card border-l-4 ${company.color}`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold text-white">{company.name}</h2>
              <span className={`text-sm px-3 py-1 rounded-full ${company.type === 'Product' ? 'bg-yellow-900/40 text-yellow-300' : 'bg-blue-900/40 text-blue-300'}`}>{company.type}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Interview Style</div>
                <p className="text-gray-300">{company.style}</p>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Focus Areas</div>
                <p className="text-gray-300">{company.focus}</p>
              </div>
            </div>
          </div>

          <div className="card border-yellow-800/50 bg-yellow-950/10">
            <div className="text-xs text-yellow-400 uppercase mb-2">Strategy Tip</div>
            <p className="text-sm text-gray-300">{company.tip}</p>
          </div>

          <div className="card">
            <div className="text-sm font-semibold text-white mb-1">Common Interview Questions</div>
            <div className="text-xs text-gray-500 mb-3">Click any question to see the answer</div>
            <div className="space-y-2">
              {company.questions.map((q, i) => (
                <QuestionItem key={i} index={i} q={q} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
