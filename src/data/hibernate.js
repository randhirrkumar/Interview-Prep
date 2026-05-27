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
        'What is the difference between @Entity and @Table?',
        'What is the difference between FetchType.LAZY and FetchType.EAGER?',
        'What are cascade types in JPA?',
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
        'When would you use EntityGraph vs JOIN FETCH?',
        'What is Hibernate statistics and how do you enable it?',
        'What is the Open Session in View anti-pattern?',
      ],
      tip: 'Open Session in View pattern keeps Hibernate session open during the entire HTTP request. Avoids LazyInitializationException but causes N+1 hidden in the view layer. Disable with spring.jpa.open-in-view=false in production.',
    },
  ],
}

export default hibernate
