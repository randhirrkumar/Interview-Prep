const hibernate = {
  title: 'Hibernate & JPA',
  description: 'JPA, Hibernate ORM, entity relationships, JPQL, and N+1 problem.',
  tags: ['Hibernate', 'JPA', 'ORM', 'Spring Data JPA'],
  questions: [
    {
      id: 1,
      question: 'What is JPA and Hibernate? What is the difference?',
      difficulty: 'beginner',
      asked: true,
      tags: ['JPA', 'Hibernate'],
      answer: `JPA (Jakarta Persistence API) is a specification — a set of interfaces and annotations that define how ORM should work in Java. It's like an interface with no implementation.

Hibernate is an implementation of the JPA specification. It's the most popular JPA provider. EclipseLink, OpenJPA are other implementations.

Spring Data JPA is a further abstraction on top of JPA — it auto-generates repository implementations, so I just define an interface and Spring creates the SQL-executing code automatically.

I work with Spring Data JPA in my projects, which uses Hibernate underneath. Most of the time I don't interact with Hibernate directly — Spring Data JPA handles it. But I need to understand Hibernate to debug lazy loading issues, N+1 problems, and performance optimization.`,
      code: `// JPA Entity
@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "registration_no", nullable = false, unique = true, length = 15)
    private String registrationNo;

    @Column(nullable = false)
    private String vehicleType;

    @Enumerated(EnumType.STRING)  // store as "ACTIVE", not 0/1
    private VehicleStatus status;

    @ManyToOne(fetch = FetchType.LAZY)  // LAZY: don't load driver until accessed
    @JoinColumn(name = "driver_id")
    private Driver driver;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VehicleEvent> events = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

// Spring Data JPA Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    // Spring generates: SELECT * FROM vehicles WHERE registration_no = ?
    Optional<Vehicle> findByRegistrationNo(String regNo);

    // SELECT * FROM vehicles WHERE status = ? AND vehicle_type = ?
    List<Vehicle> findByStatusAndVehicleType(VehicleStatus status, String type);

    // Custom JPQL
    @Query("SELECT v FROM Vehicle v WHERE v.driver.id = :driverId AND v.status = 'ACTIVE'")
    List<Vehicle> findActiveVehiclesByDriver(@Param("driverId") Long driverId);

    // Native SQL
    @Query(value = "SELECT * FROM vehicles WHERE status = :status LIMIT :limit",
           nativeQuery = true)
    List<Vehicle> findTopByStatus(@Param("status") String status, @Param("limit") int limit);
}`,
      followUp: [
        { question: 'What is the difference between @Entity and @Table?', answer: `@Entity marks a Java class as a JPA-managed entity — without it, Hibernate ignores the class entirely. @Table is optional and specifies mapping details: the exact table name (name attribute), schema, unique constraints, and indexes. Without @Table, the table name defaults to the class name. Example: @Entity on class Policy maps to "Policy" table by default. @Table(name="insurance_policies") maps it to "insurance_policies" instead. You can have @Entity without @Table (uses defaults), but not @Table without @Entity.` },
        { question: 'What is the difference between FetchType.LAZY and FetchType.EAGER?', answer: `LAZY (recommended default): the associated entity/collection is NOT loaded from the database until you access it. Hibernate creates a proxy object. When you call getDriver(), it fires the SQL at that moment. EAGER: the associated entity is always loaded in the same query as the parent — even if you never access it. Defaults: @ManyToOne and @OneToOne default to EAGER (bad — always load). @OneToMany and @ManyToMany default to LAZY (good). Best practice: always declare FetchType.LAZY explicitly on all associations and use JOIN FETCH when you need the data.` },
        { question: 'What are cascade types in JPA?', answer: `CascadeType.PERSIST: saving parent also saves children. CascadeType.MERGE: updating parent also updates children. CascadeType.REMOVE: deleting parent also deletes children. CascadeType.REFRESH: refreshing parent also refreshes children. CascadeType.DETACH: detaching parent also detaches children. CascadeType.ALL: all of the above. orphanRemoval=true: removes a child entity from the database when it's removed from the parent's collection (even without an explicit delete call). Use cascade=PERSIST,MERGE for owned relationships; be careful with REMOVE as it can cause unintended deletes.` },
      ],
      tip: 'Use FetchType.LAZY by default — always. Eager loading fetches related entities even when you don\'t need them. LAZY loads only when accessed. Fix N+1 with JOIN FETCH, not EAGER.',
    },
    {
      id: 2,
      question: 'What is the N+1 problem? How do you solve it?',
      difficulty: 'advanced',
      asked: true,
      tags: ['Hibernate', 'N+1', 'Performance'],
      answer: `The N+1 problem is one of the most common performance issues in Hibernate. It happens when you load N entities and then Hibernate issues N additional queries to load related entities.

Example: Load 100 policies (1 query). For each policy, access policy.getCustomer() — Hibernate fires 100 separate queries. Total: 101 queries for what should be 1.

The root cause: LAZY loading is good (don't load what you don't need), but if you iterate and access lazy collections, you get N+1.

Solutions:
1. JOIN FETCH in JPQL — fetch the relationship in one query
2. @EntityGraph — declarative way to specify what to fetch
3. Batch fetching — hibernate.default_batch_fetch_size
4. DTO projection — fetch only the columns you need

In my MetLife project, I fixed an N+1 issue where loading policy list for a customer was firing 1+N queries. Changed to JOIN FETCH — reduced from 200ms to 15ms.`,
      code: `// N+1 Problem
List<Policy> policies = policyRepository.findAll();  // 1 query
for (Policy p : policies) {
    System.out.println(p.getCustomer().getName());  // N queries! 1 per policy
}

// Solution 1: JPQL with JOIN FETCH
@Query("SELECT p FROM Policy p JOIN FETCH p.customer WHERE p.status = :status")
List<Policy> findByStatusWithCustomer(@Param("status") PolicyStatus status);
// Now: 1 query with JOIN — no N+1!

// Solution 2: @EntityGraph (declarative)
@EntityGraph(attributePaths = {"customer", "items"})
List<Policy> findByStatus(PolicyStatus status);
// Spring Data adds JOIN FETCH automatically

// Solution 3: Batch fetching (Hibernate config)
spring.jpa.properties.hibernate.default_batch_fetch_size=20
// Hibernate will load 20 related entities at a time instead of 1

// Solution 4: DTO Projection (fetch only what you need)
@Query("SELECT new com.metlife.dto.PolicySummary(p.id, p.policyNumber, c.name) " +
       "FROM Policy p JOIN p.customer c WHERE p.status = :status")
List<PolicySummary> findPolicySummaries(@Param("status") PolicyStatus status);

// Enable SQL logging to detect N+1 issues
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql=TRACE`,
      followUp: [
        { question: 'When would you use EntityGraph vs JOIN FETCH?', answer: `JOIN FETCH is written directly in the JPQL query string — it's static but very clear about what's being fetched. @EntityGraph is declarative: defined on the entity or as an attributePaths inline — Spring adds the JOIN FETCH automatically. Use EntityGraph when: the same fetch strategy is reused across multiple repository methods (define it once with @NamedEntityGraph), or when you want to avoid writing JPQL for simple cases. Use JOIN FETCH when: you need fine control over complex multi-level joins, or when the query has specific ordering or filtering that interacts with the join. For deep nested graphs (policy → customer → address), EntityGraph with subgraphs is cleaner. Key caveat: both can cause a Cartesian product with multiple OneToMany collections — for that, use batch fetching.` },
        { question: 'What is Hibernate statistics and how do you enable it?', answer: `Enable with spring.jpa.properties.hibernate.generate_statistics=true. Logs: query count, query execution time, second-level cache hits/misses, connections used. Very useful during development/testing to catch N+1. Also exposed via Spring Boot Actuator: GET /actuator/metrics/hibernate.queries (with micrometer-registry dependency). Check during load testing: if query count grows linearly with data size, you have N+1.` },
        { question: 'What is the Open Session in View anti-pattern?', answer: `Spring Boot enables spring.jpa.open-in-view=true by default — this keeps the Hibernate EntityManager (session) open for the entire HTTP request, including view rendering and JSON serialization by Jackson. Purpose: allows lazy loading to work during serialization without LazyInitializationException. Problem: N+1 queries hidden in the view/serialization layer are invisible in the service layer — they're hard to detect and appear in production under load. Best practice: set spring.jpa.open-in-view=false in production. Load exactly what you need in the service layer using JOIN FETCH or @EntityGraph. Use DTOs (not entities) as API responses to prevent accidental lazy loading.` },
      ],
      tip: 'Open Session in View pattern keeps Hibernate session open during the entire HTTP request. Avoids LazyInitializationException but causes N+1 hidden in the view layer. Disable with spring.jpa.open-in-view=false in production.',
    },
    {
      id: 3,
      question: 'What is Criteria Builder in JPA? When do you use it over JPQL?',
      difficulty: 'intermediate',
      asked: false,
      tags: ['JPA', 'Criteria Builder', 'Dynamic Queries'],
      answer: `Criteria Builder is a programmatic, type-safe API to build JPA queries dynamically at runtime, without writing query strings.

When to use Criteria Builder:
- Dynamic queries: search forms where the user may or may not filter by name, status, date — you don't know at compile time which criteria will be applied
- Type safety: compile-time checking of field names (less risk of typos than JPQL strings)
- Complex predicates: AND/OR combinations built programmatically

When to use JPQL instead:
- Fixed queries that don't change at runtime → JPQL is much more readable
- Simple filtering → use Spring Data JPA derived query methods (findByStatusAndCity)

Criteria Builder is verbose. For simpler dynamic queries, Querydsl or Spring Data Specifications are cleaner alternatives.`,
      code: `// Dynamic search — filter by status (optional) and city (optional)
public List<Vehicle> search(String status, String city) {
    CriteriaBuilder cb = entityManager.getCriteriaBuilder();
    CriteriaQuery<Vehicle> query = cb.createQuery(Vehicle.class);
    Root<Vehicle> root = query.from(Vehicle.class);

    List<Predicate> predicates = new ArrayList<>();

    if (status != null) {
        predicates.add(cb.equal(root.get("status"), status));
    }
    if (city != null) {
        predicates.add(cb.like(root.get("city"), "%" + city + "%"));
    }

    query.where(cb.and(predicates.toArray(new Predicate[0])));
    query.orderBy(cb.desc(root.get("createdAt")));

    return entityManager.createQuery(query)
        .setMaxResults(100)
        .getResultList();
}

// Spring Data Specification (cleaner alternative to Criteria Builder)
public interface VehicleRepository extends JpaRepository<Vehicle, Long>,
    JpaSpecificationExecutor<Vehicle> { }

Specification<Vehicle> spec = (root, query, cb) -> {
    List<Predicate> predicates = new ArrayList<>();
    if (status != null) predicates.add(cb.equal(root.get("status"), status));
    return cb.and(predicates.toArray(new Predicate[0]));
};
vehicleRepo.findAll(spec, PageRequest.of(0, 20));`,
    },
    {
      id: 4,
      question: 'What is @EntityGraph in JPA? How does it solve performance problems?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['JPA', 'EntityGraph', 'Performance', 'N+1'],
      answer: `@EntityGraph specifies which associations should be eagerly fetched for a specific query, without changing the global FetchType on the entity.

Problem it solves:
- FetchType.LAZY (default): associations loaded only when accessed → N+1 problem
- FetchType.EAGER (global): always loads associations → slow for queries that don't need them
- @EntityGraph: per-query control — eager only where you need it

Two ways to define:
1. @NamedEntityGraph on the entity class + @EntityGraph on the repository method
2. Dynamic/ad-hoc EntityGraph with attributePaths in the repository method

The resulting SQL uses a JOIN FETCH — loads the parent and children in ONE query instead of N+1.

When to use:
- You have a query that ALWAYS needs the association → use EntityGraph
- You sometimes need it → use EntityGraph on specific repository methods
- You always need it everywhere → EAGER (but think carefully)`,
      code: `// Entity with named entity graph
@Entity
@NamedEntityGraph(
    name = "Policy.withClaims",
    attributeNodes = @NamedAttributeNode("claims")  // fetch claims eagerly
)
public class Policy {
    @Id
    private Long id;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "policy")
    private List<Claim> claims;

    @ManyToOne(fetch = FetchType.LAZY)
    private Customer customer;
}

// Repository — use EntityGraph for specific queries
public interface PolicyRepository extends JpaRepository<Policy, Long> {

    // Uses named entity graph — fetches claims with JOIN
    @EntityGraph("Policy.withClaims")
    List<Policy> findByCustomerId(Long customerId);

    // Ad-hoc EntityGraph — fetch both claims AND customer
    @EntityGraph(attributePaths = {"claims", "customer"})
    Optional<Policy> findWithDetailById(Long id);

    // Without EntityGraph — lazy (fine for simple lookups)
    Optional<Policy> findById(Long id);
}

// Result: findByCustomerId generates:
// SELECT p.*, c.* FROM policy p LEFT JOIN claim c ON c.policy_id = p.id
// (one query vs N+1)`,
    },
    {
      id: 5,
      question: 'What is HikariCP? How do you configure a connection pool in Spring Boot?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Database', 'HikariCP', 'Connection Pool', 'Performance'],
      answer: `HikariCP is the default connection pool in Spring Boot (since 2.0). It's the fastest Java connection pool.

Why connection pooling matters:
Creating a database connection is expensive (network handshake, authentication, thread allocation — 20-100ms). Without pooling, every request creates + destroys a connection. With pooling, connections are pre-created and reused.

Key HikariCP parameters:
- maximumPoolSize: max connections in pool. Rule of thumb for PostgreSQL/MySQL: connections = (CPU cores * 2) + effective_spindle_count. For most apps: 10-20.
- minimumIdle: min connections kept alive. Set equal to maximumPoolSize for best performance (avoid pool resizing overhead).
- connectionTimeout: how long to wait for a free connection (default 30s). If exceeded → exception.
- idleTimeout: how long idle connections are kept (default 10 min).
- maxLifetime: max lifetime of a connection (default 30 min). Forces rotation before DB closes them.
- connectionTestQuery: validation query (SELECT 1). Detects stale connections.

Too many connections is worse than too few — DB server gets overwhelmed. Start with 10, tune from there.`,
      code: `# application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/mydb
spring.datasource.username=app_user
spring.datasource.password=secret
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# HikariCP tuning
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=10
spring.datasource.hikari.connection-timeout=30000      # 30s max wait for connection
spring.datasource.hikari.idle-timeout=600000           # 10min idle before closed
spring.datasource.hikari.max-lifetime=1800000          # 30min max connection life
spring.datasource.hikari.pool-name=VehicleServicePool

// Programmatic configuration
@Bean
public DataSource dataSource() {
    HikariConfig config = new HikariConfig();
    config.setJdbcUrl("jdbc:mysql://localhost:3306/mydb");
    config.setUsername("app_user");
    config.setPassword("secret");
    config.setMaximumPoolSize(10);
    config.setConnectionTestQuery("SELECT 1");
    return new HikariDataSource(config);
}

// Monitor pool via Actuator
// GET /actuator/metrics/hikaricp.connections.active
// GET /actuator/metrics/hikaricp.connections.pending`,
    },
    {
      id: 6,
      question: 'How do you handle database replica synchronization and read/write splitting?',
      difficulty: 'advanced',
      asked: false,
      tags: ['Database', 'Replication', 'Read Replica', 'Scaling'],
      answer: `Database replication: one PRIMARY (write) + one or more REPLICAS (read-only). Primary syncs changes to replicas asynchronously.

Why read/write splitting:
- Reads are 80-90% of most app traffic
- Send reads to replicas, writes to primary
- Primary handles only writes → less load
- Replicas can be scaled independently

Replication lag: replicas lag behind primary by milliseconds to seconds. After a write, immediately reading from a replica might return stale data. For consistency-critical reads after writes, read from primary.

Spring Boot implementation options:

1. Two separate DataSources with @Transactional(readOnly=true) routing:
   - readOnly=true → route to replica DataSource
   - readOnly=false → route to primary DataSource
   - Use AbstractRoutingDataSource to switch

2. AWS RDS Proxy / PgBouncer: handles routing transparently at infrastructure level (preferred).

3. Spring Data with read replicas: configure multiple datasources in application.yml.`,
      code: `// AbstractRoutingDataSource — routes based on readOnly flag
public class RoutingDataSource extends AbstractRoutingDataSource {
    @Override
    protected Object determineCurrentLookupKey() {
        return TransactionSynchronizationManager.isCurrentTransactionReadOnly()
            ? "replica"
            : "primary";
    }
}

@Configuration
public class DataSourceConfig {

    @Bean
    public DataSource dataSource(
        @Qualifier("primaryDs") DataSource primary,
        @Qualifier("replicaDs") DataSource replica) {

        RoutingDataSource routing = new RoutingDataSource();
        routing.setTargetDataSources(Map.of("primary", primary, "replica", replica));
        routing.setDefaultTargetDataSource(primary);
        return routing;
    }
}

// Usage — @Transactional(readOnly=true) routes to replica
@Service
public class ReportService {

    @Transactional(readOnly = true)   // → replica
    public List<PolicySummary> getMonthlyReport(YearMonth month) { ... }

    @Transactional                    // → primary
    public Policy createPolicy(PolicyRequest req) { ... }
}

// application.yml — two data sources
app.datasource.primary.url=jdbc:mysql://primary-db:3306/mydb
app.datasource.replica.url=jdbc:mysql://replica-db:3306/mydb`,
    },
    {
      id: 7,
      question: 'How do you optimize slow database queries in a Spring Boot application?',
      difficulty: 'advanced',
      asked: true,
      tags: ['Database', 'Performance', 'Query Optimization', 'Indexes'],
      answer: `Step 1: Find the slow queries.
- Enable Spring Boot slow query logging (Hibernate show_sql)
- Use database slow query log (MySQL: slow_query_log, threshold = 1s)
- Production: APM tool (Datadog, New Relic) shows p99 query times

Step 2: EXPLAIN the query.
EXPLAIN ANALYZE your slow query. Look for: Sequential Scan on large tables (needs index), Nested Loop with large row counts (may need JOIN optimization).

Common fixes:

1. Missing index:
Add indexes on columns used in WHERE, JOIN, and ORDER BY.
Composite index: column order matters — most selective first.

2. Selecting too many columns (SELECT *):
Use DTO projections — only select needed columns.

3. N+1 query: JOIN FETCH or @EntityGraph.

4. Large result set: add pagination (Pageable).

5. Inefficient LIKE queries: LIKE '%search%' can't use indexes. Use full-text search (MySQL FULLTEXT, Elasticsearch).

6. Locks: long transactions hold locks. Keep transactions short.

7. Connection pool: ensure pool size matches concurrency needs.`,
      code: `-- Step 1: Find slow queries
-- MySQL slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

-- Step 2: EXPLAIN
EXPLAIN ANALYZE
SELECT p.id, p.policy_no, c.claim_no
FROM policy p
JOIN claim c ON c.policy_id = p.id
WHERE p.customer_id = 1001 AND p.status = 'ACTIVE';

-- Look for: "Seq Scan" on large table → needs index

-- Step 3: Add composite index
CREATE INDEX idx_policy_customer_status ON policy(customer_id, status);

// Spring Boot: DTO projection (avoid SELECT *)
public interface PolicySummaryProjection {
    Long getId();
    String getPolicyNo();
    String getStatus();
}

@Query("SELECT p.id, p.policyNo, p.status FROM Policy p WHERE p.customerId = :id")
List<PolicySummaryProjection> findSummaries(@Param("id") Long id);

// Pagination — never load unbounded result sets
@GetMapping("/policies")
public Page<PolicyDto> list(Pageable pageable) {
    return policyRepo.findAll(pageable).map(mapper::toDto);
}
// GET /policies?page=0&size=20&sort=createdAt,desc`,
    },
  ],
}

export default hibernate
