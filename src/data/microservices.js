const microservices = {
  title: 'Microservices',
  description: 'Microservices patterns, API Gateway, Service Discovery, Circuit Breaker, and distributed systems.',
  tags: ['Microservices', 'Spring Cloud', 'Docker', 'API Gateway'],
  questions: [
    {
      id: 1,
      question: 'What are microservices? What are the benefits and challenges compared to monolith?',
      difficulty: 'beginner',
      asked: true,
      tags: ['Microservices', 'Architecture'],
      answer: `Microservices architecture breaks a large application into small, independently deployable services. Each service owns its own business capability, codebase, and data.

Benefits:
- Independent deployability: deploy the Kafka consumer service without touching the REST API service
- Independent scalability: scale only the high-load services (e.g., 10 instances of tracking service vs 2 instances of billing)
- Technology flexibility: different services can use different DB, language, framework
- Smaller codebases: easier to understand and maintain
- Fault isolation: one service failing doesn't bring down everything

Challenges:
- Distributed system complexity: network failures, latency, eventual consistency
- Service discovery: how does Service A find Service B?
- Inter-service communication: REST vs message queue, handling failures
- Data consistency: distributed transactions are hard
- Operational overhead: need to manage many services, containers, health checks

In my EPLMS project, we had separate services for Vehicle Management, Event Processing, Tracking, Billing, and Notifications. Each could be deployed and scaled independently.

**Distributed transactions / Saga pattern:** Traditional ACID transactions don't span multiple services/databases. The Saga pattern solves this by breaking a distributed transaction into local transactions. Each step publishes an event or calls the next service. If a step fails, compensating transactions undo previous steps (e.g., cancel order, release inventory, refund payment). Two types: Choreography (event-driven, no coordinator) and Orchestration (central coordinator directs steps). See the dedicated Saga question for full detail.

**CAP Theorem:** In a distributed system, you can guarantee at most 2 of 3: Consistency (every read gets the latest write), Availability (every request gets a response, though it may be stale), Partition tolerance (system keeps working even if network partitions occur). Since network partitions always happen in real distributed systems, you must choose between CP (consistent, may reject requests during partition) or AP (available, may return stale data). Kafka-based event systems are AP: highly available, eventually consistent.

**Eventual consistency:** The system guarantees that all replicas/services will EVENTUALLY converge to the same state if no new updates are made. There's a window where different services see different states. Example: after creating an order, the billing service might take 100ms to process the event — during that time, order status is PENDING in billing. This is acceptable for non-critical reads. For critical consistency (bank balance), read from the primary source of truth, not from eventually-consistent replicas.`,
      code: `// Microservices communication patterns in EPLMS:
/*
  ┌─────────────────────────────────────────────┐
  │              API Gateway                     │
  │          (routing + auth)                   │
  └──────┬─────────┬──────────┬─────────────────┘
         │         │          │
  ┌──────▼──┐ ┌────▼────┐ ┌──▼───────────┐
  │ Vehicle │ │Tracking │ │  Billing     │
  │ Service │ │ Service │ │  Service     │
  │  :8081  │ │  :8082  │ │    :8083     │
  └──────┬──┘ └────┬────┘ └──────────────┘
         │         │
         └────┬────┘
         ┌────▼────────────────┐
         │   Apache Kafka      │
         │ (event streaming)   │
         └─────────────────────┘
*/

// Service 1: Vehicle Service exposes REST API
// Service 2: Tracking Service consumes Kafka events
// Service 3: Billing Service consumes Kafka events
// Services communicate via Kafka (async) or REST (sync)`,
      followUp: [
        'How do you handle distributed transactions in microservices (Saga pattern)?',
        'What is the CAP theorem?',
        'What is eventual consistency?',
      ],
      tip: 'Know the CAP theorem: in a distributed system, you can only guarantee 2 of 3: Consistency, Availability, Partition tolerance. Kafka-based systems typically favor AP.',
    },
    {
      id: 2,
      question: 'Explain API Gateway pattern. How does Spring Cloud Gateway work?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['API Gateway', 'Spring Cloud', 'Routing'],
      answer: `API Gateway is the single entry point for all client requests. Instead of clients knowing about 10 different microservice URLs, they know only one — the gateway.

What API Gateway does:
- Routing: forwards requests to the correct microservice based on URL/headers
- Authentication: validates JWT tokens before forwarding to services
- Rate limiting: prevents API abuse
- Load balancing: distributes requests across service instances
- SSL termination: handles HTTPS
- Request/response transformation
- Circuit breaking: stops routing to unhealthy services

In my EPLMS project, we had an API Gateway (using Spring Cloud Gateway) that handled auth token validation. Backend services didn't need to implement auth — they trusted that the gateway already validated it. This kept backend code simpler.

**API Gateway vs Load Balancer:** Load Balancer operates at layer 4 (TCP/transport) or layer 7 (HTTP) and distributes traffic across instances. It doesn't understand business logic. API Gateway operates at layer 7 and handles application-level concerns: routing based on URL patterns, authentication, rate limiting, request transformation, circuit breaking. They often work together: Load Balancer in front of multiple API Gateway instances.

**BFF (Backend for Frontend) pattern:** Instead of one API Gateway, you have multiple gateways — one per client type (mobile app, web app, third-party). Each BFF is optimized for its specific client: mobile BFF returns smaller payloads, web BFF returns more data. Benefits: reduces over-fetching, client-specific auth flows, independently deployable. Used when different clients have very different data needs.

**Auth in microservices without API Gateway:** Each service validates the JWT token independently. This means: every service needs the JWT secret/public key, security code is duplicated across services, and if you change the auth mechanism, you update every service. API Gateway centralizes this — much cleaner. For internal service-to-service calls, use service accounts or mutual TLS (mTLS).`,
      code: `// Spring Cloud Gateway Configuration
@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}

// application.yml
spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      routes:
        - id: vehicle-service
          uri: lb://vehicle-service    # lb:// = load-balanced via Eureka
          predicates:
            - Path=/api/v1/vehicles/**
          filters:
            - AuthenticationFilter     # custom auth filter
            - name: CircuitBreaker
              args:
                name: vehicleCircuitBreaker
                fallbackUri: forward:/fallback/vehicles

        - id: tracking-service
          uri: lb://tracking-service
          predicates:
            - Path=/api/v1/tracking/**
          filters:
            - name: RateLimiter
              args:
                redis-rate-limiter.replenishRate: 100
                redis-rate-limiter.burstCapacity: 200

// Custom Authentication Filter
@Component
public class AuthenticationFilter implements GatewayFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        String authHeader = request.getHeaders().getFirst("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.isValid(token)) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        // Add userId to header for downstream services
        ServerHttpRequest modifiedRequest = request.mutate()
            .header("X-User-Id", jwtUtil.getUserId(token))
            .header("X-User-Role", jwtUtil.getRole(token))
            .build();

        return chain.filter(exchange.mutate().request(modifiedRequest).build());
    }
}`,
      followUp: [
        'What is the difference between API Gateway and Load Balancer?',
        'What is the BFF (Backend for Frontend) pattern?',
        'How do you handle authentication in microservices without API Gateway?',
      ],
      tip: 'API Gateway is about application-level routing and cross-cutting concerns. Load Balancer is about distributing TCP/HTTP traffic. They often work together.',
    },
    {
      id: 3,
      question: 'What is Service Discovery? Explain Eureka.',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Service Discovery', 'Eureka', 'Spring Cloud'],
      answer: `In microservices, services need to call each other. But with dynamic environments (containers auto-scaling, instances coming up/down), you can't hardcode IPs.

Service Discovery solves this: services register themselves with a Service Registry (Eureka). When Service A needs to call Service B, it asks Eureka "where is Service B?" and gets the current healthy instances.

Eureka has:
- Eureka Server: the registry (Spring Cloud Netflix)
- Eureka Client: every microservice registers here and queries it

Two types:
- Client-side discovery: service asks registry, then calls directly (Eureka + Ribbon/LoadBalancer)
- Server-side discovery: route through a server that does the lookup (API Gateway)

In cloud deployments (Kubernetes), you don't need Eureka — Kubernetes has built-in service discovery via DNS. I used Eureka in on-premise deployments and K8s service discovery in containerized environments.

**Feign Client vs RestTemplate:** RestTemplate is imperative — you build URLs, handle responses, deserialize manually. Feign Client is declarative — you define an interface with @FeignClient and Spring generates the HTTP client implementation. Much less boilerplate. Feign integrates with Ribbon (load balancing), Hystrix/Resilience4j (circuit breaking), and Eureka (service discovery) automatically. The downside: less control over low-level details.

**If Eureka Server goes down:** Eureka clients cache the registry locally. For a configurable period (default 90s), they continue using the cached instance list. New services can't register and registry changes aren't visible, but existing service-to-service calls continue working. This is by design — Eureka is AP (available, eventually consistent) not CP.

**Kubernetes service discovery vs Eureka:** In K8s, each service gets a DNS name (serviceName.namespace.svc.cluster.local). When you call http://vehicle-service:8080, K8s DNS resolves it and kube-proxy routes to healthy pods. No Eureka needed. K8s also handles health checks and removes unhealthy pods automatically. For K8s deployments, use Spring Cloud Kubernetes instead of Eureka.`,
      code: `// Eureka Server
@SpringBootApplication
@EnableEurekaServer
public class ServiceRegistryApplication {
    public static void main(String[] args) {
        SpringApplication.run(ServiceRegistryApplication.class, args);
    }
}

// application.yml (Eureka Server)
server:
  port: 8761
eureka:
  client:
    register-with-eureka: false
    fetch-registry: false

// Eureka Client (every microservice)
@SpringBootApplication
@EnableDiscoveryClient
public class VehicleServiceApplication { }

// application.yml (Vehicle Service)
spring:
  application:
    name: vehicle-service  # This is the service name registered in Eureka

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    prefer-ip-address: true
    health-check-url-path: /actuator/health

// Service-to-service call using load-balanced RestTemplate
@Configuration
public class RestTemplateConfig {

    @Bean
    @LoadBalanced  // enables Eureka-based load balancing
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

@Service
public class TrackingService {
    @Autowired
    private RestTemplate restTemplate;

    public VehicleDetails getVehicle(String vehicleId) {
        // Uses service name, not IP — Eureka resolves it!
        return restTemplate.getForObject(
            "http://vehicle-service/api/v1/vehicles/" + vehicleId,
            VehicleDetails.class
        );
    }
}

// Modern: use Spring Cloud OpenFeign (cleaner)
@FeignClient(name = "vehicle-service")
public interface VehicleServiceClient {

    @GetMapping("/api/v1/vehicles/{id}")
    VehicleDetails getVehicle(@PathVariable String id);
}`,
      followUp: [
        'What is Feign Client? How is it better than RestTemplate?',
        'What happens if Eureka Server goes down?',
        'How does Kubernetes service discovery differ from Eureka?',
      ],
      tip: 'Feign Client is a declarative HTTP client — you define an interface and Spring generates the implementation. Much cleaner than RestTemplate. Pair it with Resilience4j for circuit breaking.',
    },
    {
      id: 4,
      question: 'What is Circuit Breaker pattern? How do you implement it with Resilience4j?',
      difficulty: 'advanced',
      asked: true,
      tags: ['Circuit Breaker', 'Resilience4j', 'Fault Tolerance'],
      answer: `Circuit Breaker is a fault tolerance pattern for microservices. Named after electrical circuit breakers — it "trips" (opens) when too many failures are detected, preventing cascading failures.

States:
- CLOSED (normal): requests pass through
- OPEN (failed): requests fail fast (no actual call made), returns fallback
- HALF_OPEN (testing): lets some requests through to test if service recovered

Without circuit breaker: if Payment Service is down, Order Service keeps trying, threads accumulate, Order Service itself becomes slow/unresponsive, the failure cascades.

With circuit breaker: after 5 failures, circuit opens. Order Service immediately returns cached data or error message. System stays responsive. After a wait, circuit tries again.

In my EPLMS project, we had a circuit breaker on external third-party API calls (vehicle registration verification). If the external API was down, we'd fail gracefully and allow the operation with manual review flag.

**Circuit Breaker vs Retry pattern:** Retry pattern retries a failed operation N times with backoff, hoping for a transient failure. Circuit Breaker STOPS retrying after a threshold — it "opens" and fails fast without hitting the downstream service. They complement each other: Retry handles transient blips; Circuit Breaker handles sustained outages. In Resilience4j, combine both: @Retry + @CircuitBreaker on the same method.

**Bulkhead pattern:** Isolates thread pools for different downstream services so one slow service can't exhaust ALL threads. Example: if Vehicle Registry Service is slow and using a shared thread pool, it could consume all threads and block unrelated services. With bulkhead: Vehicle Registry gets a dedicated pool of 10 threads; if all 10 are busy, requests fail fast — the main service thread pool is unaffected.

**Monitoring circuit breaker state:** Resilience4j integrates with Micrometer → Spring Boot Actuator. Metrics: resilience4j.circuitbreaker.state, .calls, .failed.calls. Add Prometheus + Grafana to visualize. Spring Cloud Gateway also exposes circuit breaker metrics. Set up alerts when circuit opens in production.`,
      code: `<!-- pom.xml -->
<dependency>
    <groupId>io.github.resilience4j</groupId>
    <artifactId>resilience4j-spring-boot3</artifactId>
</dependency>

// application.yml
resilience4j:
  circuitbreaker:
    instances:
      vehicle-registry-service:
        sliding-window-size: 10            # evaluate last 10 calls
        failure-rate-threshold: 50         # open if 50% fail
        wait-duration-in-open-state: 30s   # stay open for 30s
        permitted-calls-in-half-open-state: 3
        automatic-transition-from-open-to-half-open-enabled: true

  retry:
    instances:
      vehicle-registry-service:
        max-attempts: 3
        wait-duration: 1s
        retry-exceptions:
          - java.io.IOException
          - java.util.concurrent.TimeoutException

  timelimiter:
    instances:
      vehicle-registry-service:
        timeout-duration: 5s

// Service with Circuit Breaker
@Service
@Slf4j
public class VehicleRegistryService {

    @CircuitBreaker(name = "vehicle-registry-service", fallbackMethod = "getVehicleInfoFallback")
    @Retry(name = "vehicle-registry-service")
    @TimeLimiter(name = "vehicle-registry-service")
    public CompletableFuture<VehicleInfo> getVehicleInfo(String regNo) {
        return CompletableFuture.supplyAsync(() ->
            externalRegistryClient.fetchVehicleInfo(regNo)
        );
    }

    // Fallback method (signature must match, plus Throwable)
    public CompletableFuture<VehicleInfo> getVehicleInfoFallback(String regNo, Throwable t) {
        log.warn("Circuit breaker triggered for vehicle {}: {}", regNo, t.getMessage());

        // Return cached data or partial data
        return CompletableFuture.supplyAsync(() ->
            VehicleInfo.builder()
                .regNo(regNo)
                .status("UNVERIFIED")
                .source("FALLBACK")
                .build()
        );
    }
}`,
      followUp: [
        'What is the difference between Circuit Breaker and Retry pattern?',
        'What is bulkhead pattern?',
        'How do you monitor circuit breaker state in production?',
      ],
      tip: 'Resilience4j provides: @CircuitBreaker, @Retry, @TimeLimiter, @RateLimiter, @Bulkhead. They can be combined. Use with Spring Boot Actuator for metrics.',
    },
    {
      id: 5,
      question: 'How do you handle distributed transactions in microservices? What is the Saga pattern?',
      difficulty: 'advanced',
      asked: true,
      tags: ['Saga', 'Distributed Transactions', 'Microservices'],
      answer: `Traditional ACID transactions don't work across microservices — you can't use a single database transaction that spans multiple services with separate databases.

The Saga pattern breaks a distributed transaction into a sequence of local transactions, each with a compensating transaction for rollback.

Two types:
1. Choreography-based Saga: services react to events and publish events. No central coordinator. Good for simple flows.

2. Orchestration-based Saga: a central "saga orchestrator" tells each service what to do. Better for complex flows with error handling.

Example: Order placement flow:
1. Create Order (status: PENDING)
2. Reserve Inventory
3. Process Payment
4. Confirm Order

If Payment fails: run compensating transactions — release inventory, cancel order.

In MetLife, our policy creation had a saga: create policy → calculate premium → set up payment schedule → activate policy. If payment setup failed, we'd mark policy as PENDING with notification to customer.

**Outbox Pattern:** The core problem: after a local DB write, publishing to Kafka can fail — you have inconsistent state (DB updated but no event published). The Outbox pattern: write the event to an "outbox" table IN THE SAME DB TRANSACTION as the business data. A separate "outbox processor" reads from the outbox table and publishes to Kafka. If the processor fails, it retries — the event was already safely in the DB. Guarantees at-least-once delivery with no lost events.

**Saga vs 2PC (Two-Phase Commit):** 2PC is the traditional distributed transaction protocol: Phase 1 (Prepare) — coordinator asks all participants to prepare. Phase 2 (Commit/Abort) — if all say OK, commit; else abort all. Problem: blocking protocol — participants hold locks during the entire process. If coordinator crashes, participants are stuck (blocking). Doesn't scale well. Saga is non-blocking — each local transaction commits independently. Better scalability, but only eventual consistency and requires compensating transactions.

**Idempotency in Saga:** Each saga step must be idempotent — if retried, same result. Use unique event IDs and check for duplicates before processing. Store processed event IDs in DB. Each compensating transaction must also be idempotent — calling "release inventory" twice should not release it twice.`,
      code: `// Choreography-based Saga (event-driven)
// Each service publishes domain events, others react

// Order Service
@Service
public class OrderService {

    @Transactional
    public Order createOrder(CreateOrderRequest req) {
        Order order = new Order(req, OrderStatus.PENDING);
        orderRepository.save(order);

        // Publish event — other services react
        kafkaTemplate.send("order-events",
            new OrderCreatedEvent(order.getId(), order.getItems()));

        return order;
    }

    // React to payment result
    @KafkaListener(topics = "payment-events")
    public void handlePaymentResult(PaymentResultEvent event) {
        Order order = orderRepository.findById(event.getOrderId()).orElseThrow();

        if (event.isSuccessful()) {
            order.setStatus(OrderStatus.CONFIRMED);
        } else {
            order.setStatus(OrderStatus.CANCELLED);
            // Publish compensation event
            kafkaTemplate.send("inventory-commands",
                new ReleaseInventoryCommand(order.getId()));
        }
        orderRepository.save(order);
    }
}

// Orchestration-based Saga (more control)
@Service
public class OrderSagaOrchestrator {

    @Transactional
    public void processOrderSaga(Long orderId) {
        SagaState state = new SagaState(orderId);

        try {
            // Step 1: Reserve inventory
            inventoryService.reserve(state);
            state.addStep(SagaStep.INVENTORY_RESERVED);

            // Step 2: Process payment
            paymentService.charge(state);
            state.addStep(SagaStep.PAYMENT_PROCESSED);

            // Step 3: Confirm order
            orderService.confirm(orderId);
            state.complete();

        } catch (Exception e) {
            // Compensate in reverse order
            state.getCompletedSteps().descendingIterator().forEachRemaining(step -> {
                switch (step) {
                    case PAYMENT_PROCESSED -> paymentService.refund(state);
                    case INVENTORY_RESERVED -> inventoryService.release(state);
                }
            });
            orderService.cancel(orderId);
        }
    }
}`,
      followUp: [
        'What is an outbox pattern? How does it ensure reliable event publishing?',
        'What is the difference between Saga and 2PC (Two-Phase Commit)?',
        'How do you handle idempotency in a Saga?',
      ],
      tip: 'The Outbox Pattern: save the event to a local DB table in the same transaction as the business data. A separate process reads from the outbox and publishes to Kafka. Ensures no lost messages.',
    },
    {
      id: 6,
      question: 'How do microservices communicate? Synchronous vs Asynchronous — when to use which?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Microservices', 'Communication', 'Kafka', 'REST'],
      answer: `Two communication styles:

Synchronous (REST / gRPC):
- Caller waits for response before continuing
- Use when: you need an immediate result (e.g., validating a user's JWT before serving a request)
- Tools: Spring RestTemplate, WebClient, Feign Client
- Risk: tight coupling — if Service B is down, Service A fails too

Asynchronous (Message Queue — Kafka, RabbitMQ):
- Caller publishes a message and continues. Consumer processes it independently.
- Use when: response is not needed immediately (e.g., sending an email after order placement)
- Benefit: loose coupling, resilience — if consumer is down, messages queue up
- Risk: eventual consistency — you can't immediately query the result

My rule of thumb:
- User-facing, needs instant response → REST (synchronous)
- Background processing, notifications, event pipelines → Kafka (asynchronous)

In EPLMS: vehicle check-in REST call is synchronous (operator needs instant confirmation). But event processing (billing, notifications) flows through Kafka asynchronously.`,
      code: `// Synchronous — Feign Client
@FeignClient(name = "vehicle-service", url = "http://vehicle-service")
public interface VehicleClient {
    @GetMapping("/vehicles/{id}")
    VehicleDto getVehicle(@PathVariable Long id);
}

// Asynchronous — Kafka Producer
@Autowired
private KafkaTemplate<String, VehicleEvent> kafkaTemplate;

public void publishEvent(VehicleEvent event) {
    kafkaTemplate.send("vehicle-events", event.getVehicleId(), event);
    // returns immediately — doesn't wait for consumer to process
}`,
    },
    {
      id: 7,
      question: 'What is a Load Balancer? How does it work in microservices?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Load Balancer', 'Microservices', 'Scalability'],
      answer: `A Load Balancer distributes incoming traffic across multiple instances of a service so no single instance is overwhelmed.

Types:
1. Server-side Load Balancer (e.g., AWS ALB, Nginx): sits in front of services, traffic hits LB first, LB routes to one instance. Client doesn't know about individual instances.

2. Client-side Load Balancer (e.g., Spring Cloud LoadBalancer, Ribbon): client fetches the list of service instances from Service Registry (Eureka) and decides which instance to call. Logic is in the client.

Algorithms:
- Round Robin: requests go to instances in rotation (1→2→3→1→2→3...)
- Least Connections: route to instance with fewest active connections
- IP Hash: same client IP always goes to same instance (useful for session affinity)
- Weighted Round Robin: send more traffic to more powerful instances

In microservices: Spring Cloud LoadBalancer (replaces deprecated Ribbon) does client-side load balancing. Feign Client + Eureka automatically load-balances across all registered instances.`,
      code: `// Spring Cloud LoadBalancer — automatic with Feign + Eureka
// Just register services in Eureka and use service name instead of IP
@FeignClient(name = "vehicle-service")  // Spring resolves this to one of many instances
public interface VehicleClient {
    @GetMapping("/vehicles/{id}")
    VehicleDto getVehicle(@PathVariable Long id);
}

// application.yml
spring:
  cloud:
    loadbalancer:
      ribbon:
        enabled: false  # use Spring Cloud LoadBalancer

// Manual use of LoadBalancerClient
@Autowired
private LoadBalancerClient loadBalancer;

ServiceInstance instance = loadBalancer.choose("vehicle-service");
String url = instance.getUri() + "/vehicles/" + id;`,
    },
    {
      id: 8,
      question: 'What is CORS? How do you handle it in Spring Boot microservices?',
      difficulty: 'beginner',
      asked: false,
      tags: ['CORS', 'Spring Boot', 'Security'],
      answer: `CORS (Cross-Origin Resource Sharing) is a browser security feature that blocks HTTP requests made from a different origin (domain/port/protocol) than the server.

Example: Your React frontend at http://localhost:3000 calls your Spring Boot API at http://localhost:8080. The browser blocks this by default — different ports = different origins.

The server must include CORS headers in its response to tell the browser: "This origin is allowed to call me."

Key headers:
- Access-Control-Allow-Origin: which origins are allowed
- Access-Control-Allow-Methods: which HTTP methods (GET, POST, etc.)
- Access-Control-Allow-Headers: which request headers are allowed

In microservices: handle CORS at the API Gateway level — one place, not in every service. Spring Cloud Gateway has built-in CORS configuration.`,
      code: `// Option 1: Global CORS config in Spring Boot
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("https://yourfrontend.com", "http://localhost:3000")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}

// Option 2: @CrossOrigin on controller
@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class VehicleController { ... }

// Option 3: API Gateway CORS (recommended for microservices)
// application.yml (Spring Cloud Gateway)
spring:
  cloud:
    gateway:
      globalcors:
        corsConfigurations:
          '[/**]':
            allowedOrigins: "http://localhost:3000"
            allowedMethods: "*"
            allowedHeaders: "*"`,
    },
    {
      id: 9,
      question: 'How do you approach migrating a Monolith to Microservices?',
      difficulty: 'advanced',
      asked: true,
      tags: ['Microservices', 'Migration', 'Architecture'],
      answer: `Don't rewrite everything at once — use the Strangler Fig Pattern: gradually replace pieces of the monolith with microservices, routing traffic to the new service while the monolith still handles the rest.

Step-by-step approach:
1. Identify boundaries: Find natural seams in the monolith — which modules are independently deployable? Use Domain-Driven Design to identify bounded contexts.

2. Extract the least dependent service first: Pick a module with minimal dependencies on the rest of the monolith (e.g., Notification Service).

3. Set up API Gateway: Route traffic — new microservice handles some routes, monolith handles the rest.

4. Database decomposition (hardest part): Start with separate schemas within the same DB (logical separation), then move to separate databases. Never share a database between microservice and monolith long-term.

5. Introduce async communication: Replace direct method calls with events (Kafka) between the extracted service and the monolith.

6. Repeat for next service.

Common mistake: extracting services too granularly too early. Start with coarse-grained services, split further only when needed.`,
      code: `// Strangler Fig Pattern flow:
/*
Phase 1 (Monolith handles everything):
  Client → Monolith

Phase 2 (API Gateway added, Notification extracted):
  Client → API Gateway → /notifications/** → Notification Microservice
                       → everything else  → Monolith

Phase 3 (more services extracted):
  Client → API Gateway → /vehicles/**  → Vehicle Microservice
                       → /tracking/**  → Tracking Microservice
                       → /billing/**   → Billing Microservice
                       → (nothing left in monolith)
*/

// Database: start with schema-per-service in same DB
// vehicle_service_db.vehicles
// billing_service_db.invoices
// Later: move to separate database servers`,
    },
    {
      id: 10,
      question: 'How do you handle service downtime during inter-service communication?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Resilience', 'Circuit Breaker', 'Retry', 'Fallback'],
      answer: `Several patterns to handle service downtime:

1. Circuit Breaker (Resilience4j):
After N failures, circuit "opens" — further calls immediately fail without hitting the down service. After a timeout, circuit goes half-open to test if the service recovered.

2. Retry with Backoff:
Retry failed calls with exponential backoff (wait 1s, 2s, 4s...). Add jitter to avoid thundering herd.

3. Fallback:
When service is unavailable, return a default response (cached data, empty list, etc.) instead of propagating the failure.

4. Timeout:
Always set a timeout. Without it, slow responses hold threads indefinitely and cascade into a full outage.

5. Bulkhead:
Limit concurrent calls to a service so one slow service can't exhaust all threads.

In EPLMS: if the vehicle registration authority API (external) was down, we used a Circuit Breaker + fallback — we'd process the event with available data and queue the enrichment for retry instead of blocking the entire pipeline.`,
      code: `@Service
public class VehicleRegistryService {

    // Circuit Breaker: open after 5 failures in 10 calls, half-open after 10s
    @CircuitBreaker(name = "vehicleRegistry", fallbackMethod = "fallbackVehicleInfo")
    @Retry(name = "vehicleRegistry")  // retry 3 times before opening circuit
    @TimeLimiter(name = "vehicleRegistry")  // timeout after 2 seconds
    public VehicleInfo fetchVehicleInfo(String regNo) {
        return registryClient.get(regNo);
    }

    // Fallback: called when circuit is open or all retries exhausted
    public VehicleInfo fallbackVehicleInfo(String regNo, Exception ex) {
        log.warn("Registry unavailable for {}, using cached data", regNo);
        return cache.getOrDefault(regNo, VehicleInfo.unknown(regNo));
    }
}

# application.yml
resilience4j:
  circuitbreaker:
    instances:
      vehicleRegistry:
        slidingWindowSize: 10
        failureRateThreshold: 50
        waitDurationInOpenState: 10s`,
    },
    {
      id: 11,
      question: 'How is authentication handled in an API Gateway?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['API Gateway', 'Authentication', 'JWT', 'Security'],
      answer: `The API Gateway is the best place to centralize authentication — validate the token once at the gateway, pass the user identity to downstream services. Downstream services trust the gateway and don't re-validate tokens.

Flow:
1. Client sends request with JWT in Authorization header
2. API Gateway intercepts every request via a Global Filter
3. Gateway validates JWT (checks signature, expiry, issuer)
4. If invalid → return 401 immediately, don't forward to downstream
5. If valid → extract user info (userId, roles) and add as request headers
6. Forward request to downstream service with headers: X-User-Id, X-User-Roles
7. Downstream service reads headers — no need to validate JWT again

Benefits of centralizing at gateway:
- Single place to update auth logic
- Downstream services are simpler (no security code)
- Easy to add new services without repeating auth

In MetLife: JWT for external users (mobile/web), SAML SSO for enterprise users. Both validated at gateway.`,
      code: `// Spring Cloud Gateway — Global JWT Filter
@Component
public class AuthFilter implements GlobalFilter, Ordered {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        try {
            String token = authHeader.substring(7);
            Claims claims = jwtUtil.validateAndExtract(token);

            // Add user info as headers for downstream services
            ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .header("X-User-Id", claims.getSubject())
                .header("X-User-Roles", claims.get("roles", String.class))
                .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());

        } catch (JwtException e) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }

    @Override
    public int getOrder() { return -1; }  // run before other filters
}`,
    },
    {
      id: 12,
      question: 'How do you implement Rate Limiting in an API Gateway?',
      difficulty: 'intermediate',
      asked: false,
      tags: ['API Gateway', 'Rate Limiting', 'Redis'],
      answer: `Rate limiting controls how many requests a client can make in a time window. Protects backend services from abuse and DoS attacks.

Common algorithms:
1. Fixed Window: count requests in a fixed time window (e.g., 100 req/minute). Simple but allows burst at window boundary.
2. Sliding Window: more accurate — tracks requests in a rolling window.
3. Token Bucket: bucket holds N tokens, each request consumes 1 token, tokens refill at a rate. Allows short bursts up to bucket size.
4. Leaky Bucket: requests processed at a fixed rate, excess queued or dropped.

Spring Cloud Gateway has built-in Redis-based rate limiting using Token Bucket algorithm.

Rate limiting can be per:
- IP address: prevent single IP from flooding
- User ID: each authenticated user has a quota
- API key: different quotas for different plans (free vs paid)

In production: store counters in Redis (distributed, survives restarts). Never in-memory (doesn't work with multiple gateway instances).`,
      code: `// Spring Cloud Gateway Rate Limiter (Redis-based)
// build.gradle: spring-boot-starter-data-redis-reactive

@Bean
public KeyResolver userKeyResolver() {
    // Rate limit per user ID from JWT header
    return exchange -> Mono.justOrEmpty(
        exchange.getRequest().getHeaders().getFirst("X-User-Id")
    ).defaultIfEmpty("anonymous");
}

// application.yml
spring:
  cloud:
    gateway:
      routes:
        - id: vehicle-service
          uri: lb://vehicle-service
          predicates:
            - Path=/api/vehicles/**
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10   # tokens added per second
                redis-rate-limiter.burstCapacity: 20   # max burst size
                redis-rate-limiter.requestedTokens: 1  # tokens per request
                key-resolver: "#{@userKeyResolver}"

// Response headers tell client their quota:
// X-RateLimit-Remaining: 9
// X-RateLimit-Replenish-Rate: 10`,
    },
    {
      id: 13,
      question: 'Kafka vs RabbitMQ — when do you use which?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Kafka', 'RabbitMQ', 'Messaging'],
      answer: `Both are message brokers but designed for different use cases.

Kafka:
- Log-based, append-only. Messages are retained for a configurable period (e.g., 7 days), not deleted after consumption.
- Pull-based: consumers pull messages at their own pace
- Consumer groups + offsets: each consumer group tracks its own position in the log
- Extremely high throughput (millions of msgs/sec)
- Messages are ordered within a partition
- Great for: event sourcing, audit logs, stream processing, event-driven microservices, replaying events

RabbitMQ:
- Traditional message queue. Messages deleted after acknowledged.
- Push-based: broker pushes to consumer
- Better for: task queues, RPC-style messaging, complex routing (exchange/binding rules)
- Lower throughput but lower latency for small messages
- Better for: job queues (image processing, email sending), request-reply patterns

When I use Kafka:
- Event-driven microservices (EPLMS: vehicle events)
- Any time I need replay/reprocessing capability
- High throughput pipelines
- When multiple consumers need the same event (fan-out)

When I'd use RabbitMQ:
- Simple job/task queues
- Need complex routing logic
- Request-reply patterns`,
      code: `// Key difference: message retention

// Kafka — messages retained, can be replayed
// Consumer A reads at offset 0, Consumer B reads at offset 0 independently
// If Consumer B was down, it picks up from last committed offset

// RabbitMQ — message deleted after acknowledgement
// Once consumed and ACK'd, gone forever

// Kafka partition key = message ordering guarantee
kafkaTemplate.send("vehicle-events",
    vehicleId,    // partition key — same vehicle always goes to same partition
    event
);

// RabbitMQ routing — flexible exchange types
// Direct exchange: route by exact routing key
// Topic exchange: route by pattern (vehicles.#, *.entry)
// Fanout exchange: broadcast to all queues`,
    },
    {
      id: 14,
      question: 'How do you handle the same request being processed by multiple service instances?',
      difficulty: 'advanced',
      asked: true,
      tags: ['Idempotency', 'Distributed Systems', 'Microservices'],
      answer: `This is the idempotency problem in distributed systems. When a request might be processed by any of N instances, you need to ensure:
1. Exactly one instance processes it (for operations that must run once)
2. Processing is idempotent (running it twice gives the same result)

Solutions:

1. Idempotency Keys: Client sends a unique request ID. Server stores processed IDs in a shared store (Redis). Before processing, check if ID already exists. If yes, return cached response. All instances share the same Redis — guaranteed deduplication.

2. Database Unique Constraints: Store requestId with a UNIQUE constraint. Only the first insert succeeds. Others get a duplicate key exception → return the existing result.

3. Distributed Lock (Redisson): Use Redis distributed lock with the request ID as the key. Only one instance acquires the lock and processes the request.

4. Kafka Partitioning: If using Kafka, use a business key (e.g., orderId) as the partition key. Kafka guarantees one consumer per partition in a consumer group — same order always processed by same consumer instance.

In EPLMS: vehicle check-in events use vehicleId as Kafka partition key — same vehicle's events always go to the same consumer instance, maintaining order and preventing duplicate processing.`,
      code: `// Idempotency Key pattern
@PostMapping("/orders")
public ResponseEntity<OrderResponse> createOrder(
    @RequestHeader("X-Idempotency-Key") String idempotencyKey,
    @RequestBody OrderRequest request) {

    // Check if already processed (shared Redis)
    String cached = redisTemplate.opsForValue().get("idem:" + idempotencyKey);
    if (cached != null) {
        return ResponseEntity.ok(deserialize(cached));  // return same result
    }

    // Process (only one instance will win the race — DB unique constraint protects)
    OrderResponse response = orderService.createOrder(request);

    // Store result with TTL
    redisTemplate.opsForValue().set("idem:" + idempotencyKey,
        serialize(response), Duration.ofHours(24));

    return ResponseEntity.ok(response);
}`,
    },
  ],
}

export default microservices
