const springCloud = {
  title: 'Spring Cloud',
  description: 'Spring Cloud ecosystem for microservices — Config Server, Service Discovery, Feign Client, API Gateway, Circuit Breaker with Resilience4j, and distributed tracing.',
  tags: ['Spring Cloud', 'Config Server', 'Feign', 'Resilience4j', 'API Gateway', 'Tracing'],
  questions: [
    {
      id: 'springcloud_q1',
      question: 'What is Spring Cloud and which of its components do you use in a microservices architecture?',
      difficulty: 'beginner',
      tags: ['Spring Cloud', 'Overview'],
      answer: `Spring Cloud is an umbrella project that provides a set of tools for common patterns in distributed systems — configuration management, service discovery, circuit breaking, routing, and distributed tracing. It builds on Spring Boot and integrates these concerns so microservices can focus on business logic rather than infrastructure plumbing.

Core components I work with:

Spring Cloud Config — externalized configuration server. All microservices pull their application.yml from a central Git repository at startup, enabling configuration changes without rebuilding Docker images.

Spring Cloud Netflix Eureka — service registry. Each microservice registers itself on startup; clients discover other services by name rather than hardcoded IP:port.

Spring Cloud OpenFeign — declarative HTTP client. Define an interface, add @FeignClient, and Spring generates the implementation. Eliminates boilerplate RestTemplate or WebClient code for inter-service calls.

Spring Cloud Gateway — API Gateway. Single entry point for all external requests — handles routing, authentication, rate limiting, and SSL termination.

Resilience4j — circuit breaker, retry, rate limiter, and bulkhead patterns for fault tolerance. Prevents cascading failures across services.

Spring Cloud Sleuth / Micrometer Tracing — distributed tracing. Injects trace and span IDs into every request so you can trace a request through multiple services in Zipkin or Jaeger.

Spring Cloud Bus — broadcasts configuration changes across all instances via a message broker (Kafka/RabbitMQ) so you don't have to restart services for config updates.`,
      followUp: {
        question: 'Is Eureka still relevant in modern Kubernetes deployments?',
        answer: `In a Kubernetes environment, service discovery is handled natively by Kubernetes DNS and Services — you don't need Eureka. order-service.production.svc.cluster.local resolves automatically. Eureka is most valuable in non-containerized Spring Boot deployments or AWS ECS without Kubernetes. For green-field microservices on Kubernetes, use Kubernetes native service discovery instead. Spring Cloud Kubernetes integrates with the Kubernetes API for configuration (reading ConfigMaps) and service discovery, replacing Eureka and Spring Cloud Config in a Kubernetes-first setup. Many legacy systems still run Eureka, so knowing it is valuable for existing-system interviews.`
      }
    },
    {
      id: 'springcloud_q2',
      question: 'How does Spring Cloud Config Server work and how do you set it up?',
      difficulty: 'intermediate',
      tags: ['Spring Cloud', 'Config Server'],
      answer: `Spring Cloud Config Server serves configuration from a central location (typically a Git repository) to all microservices. The microservices pull their configuration at startup (and can refresh without restart using Spring Cloud Bus).

Config Server setup:

@SpringBootApplication
@EnableConfigServer
public class ConfigServerApplication {
    public static void main(String[] args) { SpringApplication.run(ConfigServerApplication.class, args); }
}

# config-server application.yml
server:
  port: 8888
spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/myorg/config-repo
          default-label: main
          search-paths: '{application}'  # folder per service

Git repository structure:
config-repo/
├── application.yml           # shared config for ALL services
├── order-service/
│   ├── application.yml       # order-service defaults
│   ├── application-dev.yml   # dev overrides
│   └── application-prod.yml  # production overrides
└── payment-service/
    └── application.yml

Client microservice (order-service):

# bootstrap.yml (loads before application context)
spring:
  application:
    name: order-service
  config:
    import: configserver:http://config-server:8888
  cloud:
    config:
      profile: \${SPRING_PROFILES_ACTIVE:dev}

The client fetches: http://config-server:8888/order-service/prod
Response merges: application.yml → order-service/application.yml → order-service/application-prod.yml

Encryption — sensitive values (DB passwords) are encrypted in the Git repo with {cipher}AES_ENCRYPTED_VALUE. The config server decrypts them before sending to clients, so the Git repo doesn't contain plaintext secrets.

Security — secure the config server with Spring Security basic auth or OAuth2. All service-to-config-server calls use credentials.`,
      followUp: {
        question: 'How do you refresh configuration in running microservices without restart?',
        answer: `Two mechanisms. @RefreshScope annotation on beans that hold configuration values — when /actuator/refresh is called via POST, Spring rebuilds those beans with fresh config. But calling /actuator/refresh on 20 running instances manually is impractical. Spring Cloud Bus solves this — when configuration changes in Git, call POST /actuator/busrefresh on any one instance (or the config server). Spring Cloud Bus publishes a refresh event to a Kafka or RabbitMQ topic; all instances subscribed to the topic receive it and refresh their @RefreshScope beans simultaneously. This is the elegant solution for fleet-wide config updates without restarts. Note: not all beans can be @RefreshScope — datasource, connection pools, and other infrastructure beans are typically not refreshable and require a restart.`
      }
    },
    {
      id: 'springcloud_q3',
      question: 'What is OpenFeign and how do you use it for inter-service communication?',
      difficulty: 'intermediate',
      tags: ['Spring Cloud', 'Feign', 'HTTP Client'],
      answer: `OpenFeign is a declarative HTTP client. You define an interface annotated with @FeignClient that mirrors the API contract of a downstream service; Spring generates the implementation at runtime, handling serialization, error mapping, and retry.

Setup:

// Dependency: spring-cloud-starter-openfeign
@SpringBootApplication
@EnableFeignClients
public class OrderServiceApplication { ... }

// Feign client interface
@FeignClient(name = "inventory-service", url = "\${inventory.service.url}")
public interface InventoryClient {

    @GetMapping("/api/inventory/{productId}")
    InventoryResponse checkStock(@PathVariable String productId);

    @PostMapping("/api/inventory/reserve")
    ReservationResponse reserve(@RequestBody ReservationRequest request);
}

// Usage in service layer — call like a local method
@Service
public class OrderService {
    private final InventoryClient inventoryClient;

    public Order createOrder(OrderRequest request) {
        InventoryResponse stock = inventoryClient.checkStock(request.getProductId());
        if (stock.getAvailableQty() < request.getQty()) {
            throw new InsufficientStockException("Not enough stock");
        }
        // ...
    }
}

With Eureka, set name = "inventory-service" (the registered service name) and omit url — Feign resolves the URL through service discovery + load balancing.

Error decoding:

@Component
public class FeignErrorDecoder implements ErrorDecoder {
    @Override
    public Exception decode(String methodKey, Response response) {
        return switch (response.status()) {
            case 404 -> new ResourceNotFoundException("Resource not found");
            case 409 -> new ConflictException("Conflict");
            default  -> new ServiceUnavailableException("Downstream error: " + response.status());
        };
    }
}

Retry with Resilience4j + Feign:

@FeignClient(name = "inventory-service",
             configuration = FeignRetryConfiguration.class)
public interface InventoryClient { ... }

@Configuration
public class FeignRetryConfiguration {
    @Bean
    public Retryer retryer() {
        return new Retryer.Default(100, 1000, 3); // 100ms, max 1s, 3 attempts
    }
}`,
      followUp: {
        question: 'When would you use Feign vs WebClient in a Spring Boot microservice?',
        answer: `Feign is synchronous and blocking — each call occupies a thread for the full duration. WebClient is reactive and non-blocking — a thread can handle many concurrent requests because it doesn't block waiting for the response. Use Feign when: your service uses traditional Spring MVC (servlet model), simplicity is a priority, and expected concurrency is moderate. Use WebClient when: your service already uses Spring WebFlux (reactive), you need to make concurrent downstream calls without blocking threads, or you need fine-grained control over request/response handling (streaming, SSE). For Spring Boot 3.x traditional services with moderate load, Feign is cleaner. For high-concurrency reactive services or when making many parallel downstream calls in a single request, WebClient with flatMap() parallelism is significantly more efficient.`
      }
    },
    {
      id: 'springcloud_q4',
      question: 'Explain Resilience4j Circuit Breaker — how does it work and how do you configure it?',
      difficulty: 'intermediate',
      tags: ['Resilience4j', 'Circuit Breaker', 'Fault Tolerance'],
      answer: `A circuit breaker prevents cascading failures in a microservices call chain. If service A calls service B and B is consistently failing, without a circuit breaker A's threads pile up waiting for B's timeouts, eventually causing A to fail too. The circuit breaker detects B's failure rate and stops making calls to B for a recovery period, returning fast failures or fallback responses instead.

Circuit breaker states:
- Closed — normal operation. Calls go through. Failure rate is tracked.
- Open — failure threshold exceeded. All calls immediately fail (no actual call to B). Fallback is returned. Recovery timer starts.
- Half-Open — after the wait duration, allows a limited number of probe calls through. If they succeed, transitions back to Closed. If they fail, returns to Open.

Configuration in Spring Boot:

# application.yml
resilience4j:
  circuitbreaker:
    instances:
      inventory-service:
        slidingWindowSize: 10           # evaluate last 10 calls
        failureRateThreshold: 50        # open when 50%+ fail
        waitDurationInOpenState: 10s    # stay open for 10 seconds
        permittedNumberOfCallsInHalfOpenState: 3
        minimumNumberOfCalls: 5         # need 5 calls before evaluating
        slowCallRateThreshold: 50       # also open on slow calls
        slowCallDurationThreshold: 2s   # calls >2s considered slow

Usage with @CircuitBreaker:

@Service
public class OrderService {
    private final InventoryClient inventoryClient;

    @CircuitBreaker(name = "inventory-service", fallbackMethod = "checkStockFallback")
    public InventoryResponse checkStock(String productId) {
        return inventoryClient.checkStock(productId);
    }

    // Fallback — same signature + exception parameter
    public InventoryResponse checkStockFallback(String productId, Exception ex) {
        log.warn("Circuit open for inventory-service, returning cached/default", ex);
        return InventoryResponse.assumeAvailable(productId);  // or read from Redis cache
    }
}

Expose circuit breaker state via Actuator:

management.endpoint.health.show-details: always
management.health.circuitbreakers.enabled: true
# GET /actuator/health → shows circuitBreakers: { inventory-service: { state: CLOSED, ... } }`,
      followUp: {
        question: 'What is the difference between Circuit Breaker, Retry, and Bulkhead in Resilience4j?',
        answer: `These are three different fault tolerance patterns. Circuit Breaker monitors failure rate and stops calls to a failing service — it's about preventing calls when failure is consistently occurring. Retry attempts the operation again after a failure — useful for transient errors (network hiccup, momentary overload) where the next attempt will likely succeed. Combine with exponential backoff to avoid hammering an already-overloaded service. Never retry non-idempotent operations (like a payment debit) without idempotency keys. Bulkhead limits the number of concurrent calls to a service — isolates resources so one slow dependency can't consume all threads and starve other dependencies. Bulkhead is like physical ship compartments — flooding one compartment doesn't sink the ship. Use ThreadPoolBulkhead for strong isolation (separate thread pool per downstream) or SemaphoreBulkhead for concurrency limiting with less overhead. A robust service uses all three: retry transient errors, circuit break persistent failures, bulkhead to isolate resource pools.`
      }
    },
    {
      id: 'springcloud_q5',
      question: 'What is Spring Cloud Gateway and how do you configure routing and filters?',
      difficulty: 'intermediate',
      tags: ['Spring Cloud', 'API Gateway', 'Routing'],
      answer: `Spring Cloud Gateway is a reactive API Gateway built on Spring WebFlux. It acts as the single entry point for all client requests, handling cross-cutting concerns — routing, authentication, rate limiting, request/response transformation, and SSL termination — before forwarding to downstream services.

Configuration-based routing:

# application.yml
spring:
  cloud:
    gateway:
      routes:
      - id: order-service
        uri: lb://order-service          # lb:// = load-balanced via Eureka
        predicates:
        - Path=/api/orders/**
        filters:
        - StripPrefix=1                  # removes /api prefix before forwarding
        - name: CircuitBreaker
          args:
            name: order-service
            fallbackUri: forward:/fallback/orders
        - name: RequestRateLimiter
          args:
            redis-rate-limiter.replenishRate: 100
            redis-rate-limiter.burstCapacity: 200
            key-resolver: "#{@userKeyResolver}"

      - id: payment-service
        uri: lb://payment-service
        predicates:
        - Path=/api/payments/**
        - Header=X-Api-Version, 2

      default-filters:
      - AddResponseHeader=X-Gateway, MyGateway
      - name: Retry
        args:
          retries: 2
          methods: GET

Custom global filter for JWT authentication:

@Component
public class AuthenticationFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String token = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (token == null || !jwtUtil.validate(token)) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        // Enrich request with user info for downstream services
        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
            .header("X-User-Id", jwtUtil.extractUserId(token))
            .build();
        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    @Override
    public int getOrder() { return -1; }  // execute before other filters
}

Built-in predicates: Path, Method, Header, Host, Query, Before/After/Between (time-based). Built-in filters: StripPrefix, AddRequestHeader, AddResponseHeader, RewritePath, RedirectTo, RequestRateLimiter (uses Redis), CircuitBreaker, Retry.`,
      followUp: {
        question: 'How does the Gateway rate limiter work and how do you key it per user?',
        answer: `Spring Cloud Gateway's RequestRateLimiter filter uses Redis token bucket under the hood (via Lua scripts for atomicity). replenishRate is the number of tokens added per second; burstCapacity is the maximum the bucket can hold. A KeyResolver bean determines what to rate limit by — per IP, per user ID, per API key. A user-based resolver extracts the user from the request (JWT claim, header): the bean implementing KeyResolver returns a Mono<String> key. Requests exceeding the limit receive HTTP 429 Too Many Requests with RateLimit-Remaining and RateLimit-Reset headers. For anonymous users, key by IP (ServerWebExchange.getRequest().getRemoteAddress()). For authenticated users, key by user ID from the JWT to apply per-user quotas.`
      }
    },
    {
      id: 'springcloud_q6',
      question: 'How do you implement distributed tracing with Micrometer and Zipkin in Spring Boot?',
      difficulty: 'intermediate',
      tags: ['Spring Cloud', 'Tracing', 'Zipkin', 'Micrometer'],
      answer: `Distributed tracing tracks a request across multiple microservices, recording timing for each service call. A trace is the full journey; a span is one unit of work within the trace.

Micrometer Tracing (Spring Boot 3.x replacement for Spring Cloud Sleuth) auto-instruments all HTTP requests, Feign calls, Kafka messages, and database queries.

Dependencies:

<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-otel</artifactId>
</dependency>
<dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-exporter-zipkin</artifactId>
</dependency>

Configuration:

# application.yml
management:
  tracing:
    sampling:
      probability: 1.0    # 100% sampling (use 0.1 in production for 10%)
  zipkin:
    tracing:
      endpoint: http://zipkin:9411/api/v2/spans

What happens automatically:
- Every incoming HTTP request gets a traceId (new) or propagates the incoming traceId (from X-B3-TraceId header)
- A spanId is created for each service's processing
- Feign clients propagate traceId/spanId in outgoing request headers automatically
- Kafka producer adds traceId to message headers; consumer picks it up

The traceId and spanId are injected into MDC (Mapped Diagnostic Context) so all log statements automatically include them:

# logback-spring.xml
<pattern>%d{ISO8601} [%X{traceId},%X{spanId}] %-5level %logger — %msg%n</pattern>

Logs across all services with the same traceId can be correlated in a log aggregator (ELK, CloudWatch Logs Insights) to reconstruct the full request timeline.

Zipkin UI: enter a traceId and see a waterfall diagram — order-service (50ms) → inventory-service call (20ms) → database query (15ms) → response. Immediately shows which service or DB call caused latency.

For production, use sampling probability 0.1 (10%) or 0.01 (1%) to reduce overhead and Zipkin storage requirements.`,
      followUp: {
        question: 'What is the difference between Zipkin and Jaeger for distributed tracing?',
        answer: `Both are distributed tracing backends that visualize trace data. Zipkin is older, simpler to deploy (single JAR), uses B3 propagation headers by default, and stores traces in-memory, MySQL, Cassandra, or Elasticsearch. Jaeger was developed by Uber, uses OpenTelemetry propagation natively, has better UI for large-scale trace data, support for adaptive sampling, and integrates better with the OpenTelemetry ecosystem. For modern Spring Boot 3.x applications using Micrometer Tracing with OpenTelemetry bridge, Jaeger is the preferred choice for new setups. Both are CNCF projects. Spring Boot applications can export to either using the appropriate exporter dependency — the application code doesn't change, only the exporter configuration.`
      }
    },
  ],
}

export default springCloud
