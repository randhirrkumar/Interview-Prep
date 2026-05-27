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

In my EPLMS project, we had separate services for Vehicle Management, Event Processing, Tracking, Billing, and Notifications. Each could be deployed and scaled independently.`,
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

In my EPLMS project, we had an API Gateway (using Spring Cloud Gateway) that handled auth token validation. Backend services didn't need to implement auth — they trusted that the gateway already validated it. This kept backend code simpler.`,
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

In cloud deployments (Kubernetes), you don't need Eureka — Kubernetes has built-in service discovery via DNS. I used Eureka in on-premise deployments and K8s service discovery in containerized environments.`,
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

In my EPLMS project, we had a circuit breaker on external third-party API calls (vehicle registration verification). If the external API was down, we'd fail gracefully and allow the operation with manual review flag.`,
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

In MetLife, our policy creation had a saga: create policy → calculate premium → set up payment schedule → activate policy. If payment setup failed, we'd mark policy as PENDING with notification to customer.`,
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
  ],
}

export default microservices
