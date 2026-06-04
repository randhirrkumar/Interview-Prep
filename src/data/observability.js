const observability = {
  title: 'Observability & Monitoring',
  description: 'Logging, metrics, and distributed tracing for production Spring Boot microservices — Actuator, Micrometer, Prometheus, Grafana, ELK Stack, and alerting strategies.',
  tags: ['Observability', 'Prometheus', 'Grafana', 'ELK', 'Actuator', 'Micrometer', 'Logging'],
  questions: [
    {
      id: 'obs_q1',
      question: 'What are the three pillars of observability and how do they apply to Spring Boot microservices?',
      difficulty: 'beginner',
      tags: ['Observability', 'Overview'],
      answer: `Observability is the ability to understand the internal state of a system from its external outputs. The three pillars are logs, metrics, and traces — each answers a different question about system behavior.

Logs — structured records of discrete events. Answer "What happened?" Error logs capture exceptions, audit logs capture business events, info logs capture state transitions. In Spring Boot, Logback or Log4j2 with Logstash encoder produces structured JSON logs that log aggregators can index and query.

Metrics — numerical measurements over time. Answer "How is the system behaving?" Request rate, error rate, latency (P50/P90/P99), JVM heap usage, database connection pool size. Spring Boot Actuator exposes these; Micrometer standardizes the metric format; Prometheus scrapes them; Grafana visualizes them.

Traces — records of causally-related events across services. Answer "Where is the time going?" For a slow request, a trace shows the entire path: API Gateway → Order Service (50ms) → Inventory Client call (200ms) → Database query (180ms). Micrometer Tracing with Zipkin or Jaeger provides this in Spring Boot.

Together they form a complete picture. Metrics tell you there's a problem (error rate spiked). Logs tell you what the error is (NullPointerException in PaymentService.processPayment). Traces tell you which path triggered it (the slow inventory call that preceded it).

Without all three, you're blind to different failure modes: metrics alone can't tell you why something is slow; logs alone can't correlate events across services; traces alone can't give system-wide health at a glance.`,
      followUp: {
        question: 'What is the difference between monitoring and observability?',
        answer: `Monitoring is watching known-unknowns — you define in advance what can go wrong and set up alerts for those specific conditions (CPU > 80%, error rate > 1%, disk > 90%). It tells you when something you predicted would break has broken. Observability is exploring unknown-unknowns — you instrument your system so richly that you can answer arbitrary questions about its behavior without having predicted the question in advance. When a weird production issue occurs that you've never seen before, observability means you can investigate it with the data you already collected. Monitoring is a subset of observability — good observability enables better monitoring, but monitoring dashboards alone don't give you observability.`
      }
    },
    {
      id: 'obs_q2',
      question: 'What is Spring Boot Actuator and which endpoints are most useful in production?',
      difficulty: 'beginner',
      tags: ['Actuator', 'Spring Boot'],
      answer: `Spring Boot Actuator provides production-ready endpoints for monitoring and managing a running application. Add spring-boot-starter-actuator to enable it.

Essential configuration:

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus,loggers,threaddump,heapdump
      base-path: /actuator
  endpoint:
    health:
      show-details: when-authorized  # expose component details to authorized users only
      probes:
        enabled: true                 # /health/liveness and /health/readiness for K8s
  metrics:
    export:
      prometheus:
        enabled: true

Most useful endpoints:

/actuator/health — overall application health, with sub-indicators: database connectivity, Redis connectivity, disk space, circuit breaker state. Returns UP/DOWN/OUT_OF_SERVICE.

/actuator/prometheus — exports all metrics in Prometheus text format. This is what the Prometheus scraper calls every 15 seconds.

/actuator/metrics — lists all available metrics. /actuator/metrics/http.server.requests?tag=status:500 shows 500 error request details.

/actuator/loggers — view and dynamically change log levels at runtime. POST to /actuator/loggers/com.myapp.service with {"configuredLevel": "DEBUG"} enables debug logging for that package without restart. POST with "null" restores default.

/actuator/threaddump — dumps all JVM threads with stack traces. Essential for diagnosing deadlocks or thread pool exhaustion.

/actuator/heapdump — downloads a heap dump for memory analysis with tools like Eclipse MAT or VisualVM.

/actuator/info — application info (version, git commit hash, build time from build-info.properties). Useful for confirming which version is deployed.

Security: expose Actuator on a separate management port (management.server.port: 9090) accessible only within the VPC, not the public load balancer. Or use Spring Security to require an ACTUATOR role for sensitive endpoints.`,
      followUp: {
        question: 'How do you add custom health indicators to Spring Boot Actuator?',
        answer: `Implement the HealthIndicator interface and register the bean: @Component class KafkaHealthIndicator implements HealthIndicator { @Override public Health health() { try { // try to produce a test message or check admin client adminClient.listTopics().names().get(3, TimeUnit.SECONDS); return Health.up().withDetail("broker", "reachable").build(); } catch (Exception e) { return Health.down().withDetail("error", e.getMessage()).build(); } } }. This appears in /actuator/health under the component name kafkaHealth. For status code mapping, Spring returns HTTP 200 when ALL indicators are UP, and 503 (Service Unavailable) when any are DOWN — important for load balancer health checks.`
      }
    },
    {
      id: 'obs_q3',
      question: 'How does Micrometer work with Prometheus and Grafana for metrics monitoring?',
      difficulty: 'intermediate',
      tags: ['Micrometer', 'Prometheus', 'Grafana'],
      answer: `Micrometer is a metrics facade — your code records metrics against the Micrometer API, and the backend (Prometheus, CloudWatch, Datadog) is pluggable via a registry dependency.

How the stack works:
1. Spring Boot application records metrics via Micrometer API (counters, gauges, timers, histograms)
2. /actuator/prometheus endpoint exposes metrics in Prometheus text format
3. Prometheus server scrapes /actuator/prometheus every 15 seconds and stores time series data
4. Grafana queries Prometheus via PromQL and renders dashboards

Prometheus scrape configuration:

# prometheus.yml
scrape_configs:
  - job_name: 'order-service'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['order-service:8080']
    # For Kubernetes: use kubernetes_sd_configs with annotation-based discovery

Custom metrics in Spring Boot:

@Service
public class OrderService {
    private final Counter ordersCreated;
    private final Timer orderProcessingTime;
    private final AtomicInteger pendingOrders;

    public OrderService(MeterRegistry registry) {
        this.ordersCreated = Counter.builder("orders.created")
            .description("Total orders created")
            .tag("region", "ap-south-1")
            .register(registry);

        this.orderProcessingTime = Timer.builder("orders.processing.time")
            .description("Order processing duration")
            .publishPercentiles(0.5, 0.90, 0.99)  // P50, P90, P99
            .register(registry);

        this.pendingOrders = registry.gauge(
            "orders.pending", new AtomicInteger(0)
        );
    }

    public Order createOrder(OrderRequest request) {
        return orderProcessingTime.record(() -> {
            pendingOrders.incrementAndGet();
            try {
                Order order = processOrder(request);
                ordersCreated.increment();
                return order;
            } finally {
                pendingOrders.decrementAndGet();
            }
        });
    }
}

Grafana dashboard panels:
- Request rate: rate(http_server_requests_seconds_count[5m])
- Error rate: rate(http_server_requests_seconds_count{status=~"5.."}[5m])
- P99 latency: histogram_quantile(0.99, rate(http_server_requests_seconds_bucket[5m]))
- JVM heap: jvm_memory_used_bytes{area="heap"}
- Custom: orders_created_total, orders_processing_time_seconds_max`,
      followUp: {
        question: 'What is the difference between a Counter, Gauge, and Timer in Micrometer?',
        answer: `Counter — monotonically increasing value. Only goes up. Records how many times something happened: total orders created, total HTTP requests, total errors. Rate of change is often more useful than the raw count: rate(orders_created_total[5m]). Gauge — current value at a point in time. Can go up and down: pending queue size, active connections, JVM heap used, number of cache entries. You read a gauge to see current state. Timer — measures durations and counts. Records how long operations take. Automatically captures count, total time, and (if configured) percentile histograms. Use for HTTP request duration, database query time, external API call time. A Timer with publishPercentiles gives you P50/P90/P99 latency percentiles which are much more useful than averages for understanding user experience.`
      }
    },
    {
      id: 'obs_q4',
      question: 'How do you set up structured logging in Spring Boot for production log analysis?',
      difficulty: 'intermediate',
      tags: ['Logging', 'ELK', 'Structured Logging'],
      answer: `Structured logging produces JSON log entries that log aggregators (Elasticsearch, CloudWatch Logs, Splunk) can index and query by field, rather than trying to parse unstructured text.

Setup with logstash-logback-encoder:

<dependency>
    <groupId>net.logstash.logback</groupId>
    <artifactId>logstash-logback-encoder</artifactId>
    <version>7.4</version>
</dependency>

# src/main/resources/logback-spring.xml
<configuration>
  <appender name="JSON_STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <encoder class="net.logstash.logback.encoder.LogstashEncoder">
      <customFields>{"service":"order-service","version":"${APP_VERSION}"}</customFields>
      <includeMdcKeyName>traceId</includeMdcKeyName>
      <includeMdcKeyName>spanId</includeMdcKeyName>
      <includeMdcKeyName>userId</includeMdcKeyName>
    </encoder>
  </appender>
  <root level="INFO">
    <appender-ref ref="JSON_STDOUT"/>
  </root>
</configuration>

Output:
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "ERROR",
  "logger": "com.myapp.service.OrderService",
  "message": "Payment failed for order",
  "service": "order-service",
  "version": "1.2.0",
  "traceId": "abc123def456",
  "spanId": "789xyz",
  "userId": "user_456",
  "orderId": "ord_789",
  "errorCode": "PAY_001",
  "stack_trace": "..."
}

Adding context fields with MDC:

@Aspect
@Component
public class LoggingAspect {
    @Around("execution(* com.myapp.service..*(..))")
    public Object addContext(ProceedingJoinPoint pjp) throws Throwable {
        // MDC is thread-local; Micrometer Tracing fills traceId/spanId automatically
        MDC.put("userId", SecurityContextHolder.getContext().getAuthentication().getName());
        try {
            return pjp.proceed();
        } finally {
            MDC.clear();
        }
    }
}

CloudWatch Logs Insights query:
fields @timestamp, level, message, userId, orderId, errorCode
| filter level = "ERROR"
| stats count(*) by errorCode
| sort count desc

This immediately shows which error codes are most frequent — impossible with unstructured text logs.`,
      followUp: {
        question: 'What is the ELK Stack and how does it work?',
        answer: `ELK stands for Elasticsearch, Logstash, and Kibana. Elasticsearch is the distributed search and analytics engine that stores and indexes log data. Logstash is the log ingestion pipeline — it receives logs (from Filebeat agents on each server, from application direct output, from Kafka), transforms them (parse, filter, enrich), and ships to Elasticsearch. Kibana is the UI for searching, visualizing, and building dashboards on top of Elasticsearch data. In modern deployments, Filebeat (lightweight agent) runs on each node or as a Kubernetes DaemonSet, tailing application log files and shipping to Logstash or directly to Elasticsearch. The full path: application writes JSON logs → stdout → Filebeat collects → Logstash pipeline → Elasticsearch index → Kibana dashboard. Alternatively on AWS, application writes to CloudWatch Logs → Lambda or Kinesis Firehose → Elasticsearch Service (OpenSearch).`
      }
    },
    {
      id: 'obs_q5',
      question: 'What is Prometheus alerting and how do you set up meaningful alerts for a Spring Boot service?',
      difficulty: 'intermediate',
      tags: ['Prometheus', 'Alerting', 'SLO'],
      answer: `Prometheus Alertmanager handles alert routing, deduplication, grouping, and notification delivery. Alert rules are defined in Prometheus and evaluated continuously against collected metrics.

alert_rules.yml:

groups:
  - name: order-service
    rules:
    # High error rate
    - alert: HighErrorRate
      expr: |
        rate(http_server_requests_seconds_count{job="order-service",status=~"5.."}[5m])
        / rate(http_server_requests_seconds_count{job="order-service"}[5m]) > 0.01
      for: 2m       # condition must hold for 2 minutes (avoids flapping)
      labels:
        severity: critical
        service: order-service
      annotations:
        summary: "Error rate {{ $value | humanizePercentage }} on order-service"
        runbook: "https://wiki.company.com/runbooks/order-service-errors"

    # High P99 latency
    - alert: SlowResponseTime
      expr: |
        histogram_quantile(0.99,
          rate(http_server_requests_seconds_bucket{job="order-service"}[5m])
        ) > 2
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "P99 latency is {{ $value }}s"

    # JVM memory pressure
    - alert: HighJvmHeap
      expr: |
        jvm_memory_used_bytes{job="order-service",area="heap"}
        / jvm_memory_max_bytes{job="order-service",area="heap"} > 0.85
      for: 10m
      labels:
        severity: warning

    # Service down
    - alert: ServiceDown
      expr: up{job="order-service"} == 0
      for: 1m
      labels:
        severity: critical

Alertmanager routes to Slack/PagerDuty:

route:
  group_by: ['alertname', 'service']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'slack-critical'
  routes:
  - match:
      severity: critical
    receiver: pagerduty-oncall

SLO-based alerting (more sophisticated):
Alert when error budget burns faster than allowed. For a 99.9% availability SLO, a 5-minute window with 5% error rate burns 1 hour of monthly error budget — alert immediately. Same 5% rate sustained — you'll exhaust your monthly budget in 2 days.`,
      followUp: {
        question: 'What is the difference between an SLA, SLO, and SLI?',
        answer: `SLI (Service Level Indicator) is a specific measurement of service behavior — error rate, latency P99, availability. It's the raw metric. SLO (Service Level Objective) is an internal target for an SLI — "P99 latency < 500ms" or "availability > 99.9%." It's your team's commitment to service quality, used internally for engineering goals and on-call decisions. SLA (Service Level Agreement) is a contractual commitment to customers — typically less stringent than internal SLOs to leave headroom for engineering response. If you breach the SLA, there are financial penalties or remedies. In practice: SLI is measured continuously, SLO determines when on-call is paged, SLA determines when you owe customers credit. Set SLOs tighter than SLAs — if SLO is 99.9% and SLA is 99.5%, breaching the SLO gives you time to recover before breaching the SLA.`
      }
    },
    {
      id: 'obs_q6',
      question: 'How do you identify and fix memory leaks in a Spring Boot application in production?',
      difficulty: 'advanced',
      tags: ['JVM', 'Memory', 'Monitoring', 'Performance'],
      answer: `Memory leak diagnosis follows a systematic process.

Step 1: Detect via metrics — monitor jvm_memory_used_bytes{area="heap"} in Grafana. A sawtooth pattern (GC periodically drops heap) is healthy. A gradually rising baseline that GC can't fully recover is a leak signature. Alert when heap > 85% sustained.

Step 2: Trigger GC — POST /actuator/gc (if exposed) or jcmd <pid> GC.run to force full GC. If memory drops significantly, the GC just hasn't run recently. If memory stays high after full GC, likely a real leak.

Step 3: Take heap dumps — GET /actuator/heapdump downloads a .hprof file. Take two dumps 30 minutes apart when heap is high.

Step 4: Analyze with Eclipse MAT (Memory Analyzer Tool) or VisualVM:
- Leak Suspects Report — identifies objects accumulating beyond expected count
- Histogram — lists all object types sorted by retained heap
- Dominator Tree — shows which object roots are keeping large object graphs alive

Common Spring Boot leak sources:
- Static caches without eviction (Collections.synchronizedMap or HashMap as static field filled indefinitely)
- ThreadLocal variables not cleared after request completion (filters/aspects that set ThreadLocal but don't call remove() in finally)
- Listener registrations not deregistered — Spring ApplicationEvent listeners, JMX registrations
- Hibernate first-level session cache on long-lived sessions
- Connection pool leaks — connections borrowed but not returned (missing try-with-resources on ResultSet/PreparedStatement in JDBC code)
- ClassLoader leaks in hot-deploy environments (Metaspace growing, not heap)

Step 5: Micrometer alerts for specific object counts (if you can instrument it) or GC metrics — gc_pause_seconds increasing indicates GC working harder to manage growing heap.`,
      followUp: {
        question: 'What is a metaspace leak and how is it different from a heap leak?',
        answer: `Heap stores object instances — your domain objects, collections, strings. Metaspace (since Java 8, replacing PermGen) stores class metadata — loaded class definitions, method bytecode. A metaspace leak occurs when classes are loaded continuously without being unloaded — typically in environments with class reloading (hot deploy, scripting engines like Groovy, code generation frameworks like ByteBuddy/CGLib). Each dynamic proxy or generated class adds to metaspace. JVM options -XX:MaxMetaspaceSize sets a cap; without it, metaspace can grow until the machine runs out of native memory and crashes. Diagnose with jcmd <pid> VM.class_histogram | head -50 to see which classes are loaded in the most instances. In production Spring Boot apps, unexpected growth in proxy classes ($$EnhancerBySpringCGLIB$$) or generated classes points to framework-level class generation issues.`
      }
    },
  ],
}

export default observability
