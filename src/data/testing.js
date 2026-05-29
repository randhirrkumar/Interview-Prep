const testing = {
  title: 'Testing (JUnit 5 & Mockito)',
  description: 'Unit testing, integration testing, TDD, mocking with Mockito, and Spring Boot Test.',
  tags: ['JUnit 5', 'Mockito', 'TDD', 'Spring Boot Test', 'Integration Testing'],
  questions: [
    {
      id: 1,
      question: 'What is TDD (Test-Driven Development)? What are its benefits?',
      difficulty: 'beginner',
      tags: ['TDD'],
      answer: `TDD is a development approach where you write tests before writing the actual code. The cycle is: Red → Green → Refactor.

1. Red: Write a failing test for a small piece of functionality
2. Green: Write the minimum code to make the test pass
3. Refactor: Clean up the code while keeping tests green

Benefits:
- Forces you to think about design before implementation
- Built-in regression tests as the codebase grows
- Smaller, focused methods (hard to test = bad design signal)
- Documentation through tests — tests show how code is meant to be used
- Confidence to refactor without breaking things

I use TDD for service layer logic in Spring Boot — it's especially useful for complex business rules.`,
      code: `// TDD example: PolicyPremiumCalculator
// Step 1: RED — write test first
@Test
void shouldApply10PercentDiscountForSeniorCustomers() {
    PolicyPremiumCalculator calculator = new PolicyPremiumCalculator();
    double premium = calculator.calculate(10000.0, CustomerType.SENIOR);
    assertEquals(9000.0, premium, 0.01);
}
// Test fails — PolicyPremiumCalculator doesn't exist yet

// Step 2: GREEN — write minimum code to pass
public class PolicyPremiumCalculator {
    public double calculate(double basePremium, CustomerType type) {
        if (type == CustomerType.SENIOR) return basePremium * 0.9;
        return basePremium;
    }
}
// Test passes

// Step 3: REFACTOR — clean up
public class PolicyPremiumCalculator {
    private static final Map<CustomerType, Double> DISCOUNTS = Map.of(
        CustomerType.SENIOR, 0.10,
        CustomerType.STUDENT, 0.15,
        CustomerType.CORPORATE, 0.20
    );

    public double calculate(double basePremium, CustomerType type) {
        double discount = DISCOUNTS.getOrDefault(type, 0.0);
        return basePremium * (1 - discount);
    }
}`,
    },
    {
      id: 2,
      question: 'Explain JUnit 5 annotations. What changed from JUnit 4?',
      difficulty: 'beginner',
      tags: ['JUnit 5'],
      answer: `JUnit 5 is composed of 3 modules: JUnit Platform (launcher), JUnit Jupiter (new programming model), JUnit Vintage (run JUnit 4 tests).

Key annotation changes from JUnit 4:
@Test — same, but now from org.junit.jupiter.api
@Before/@After → @BeforeEach/@AfterEach
@BeforeClass/@AfterClass → @BeforeAll/@AfterAll (static)
@Ignore → @Disabled
@RunWith → @ExtendWith
@Rule → @ExtendWith

New in JUnit 5: @ParameterizedTest, @RepeatedTest, @TestFactory (dynamic tests), @Nested, @DisplayName, @Tag, assumptions.`,
      code: `@DisplayName("Policy Service Tests")
class PolicyServiceTest {

    private PolicyService service;

    @BeforeAll
    static void initDatabase() {
        // runs once before all tests in this class (must be static)
        TestDatabase.setup();
    }

    @BeforeEach
    void setup() {
        // runs before each test
        service = new PolicyService(new InMemoryPolicyRepository());
    }

    @AfterEach
    void cleanup() {
        // runs after each test
        service.clearAll();
    }

    @Test
    @DisplayName("Should create policy with valid data")
    void shouldCreatePolicy() {
        Policy policy = service.create(new PolicyRequest("Life", 5000.0));
        assertNotNull(policy.getId());
        assertEquals("Life", policy.getType());
    }

    @Test
    @Disabled("Pending business rule clarification")
    void shouldApplyGroupDiscount() { }

    @ParameterizedTest
    @ValueSource(doubles = {-1.0, 0.0, -100.0})
    @DisplayName("Should reject invalid premium amounts")
    void shouldRejectInvalidPremium(double invalidPremium) {
        assertThrows(InvalidPremiumException.class,
            () -> service.create(new PolicyRequest("Life", invalidPremium)));
    }

    @RepeatedTest(3)
    void shouldHandleConcurrentCreation() {
        // run 3 times
    }

    @Nested
    @DisplayName("When policy is expired")
    class ExpiredPolicyTests {
        @Test
        void shouldNotAllowRenewal() { }
        @Test
        void shouldShowExpiredStatus() { }
    }
}`,
    },
    {
      id: 3,
      question: 'How do you use Mockito? Explain @Mock, @InjectMocks, when/thenReturn.',
      difficulty: 'intermediate',
      tags: ['Mockito', 'Mocking'],
      answer: `Mockito is the most popular mocking framework for Java. It creates fake implementations of dependencies so you can test a class in isolation.

@Mock: Creates a mock object — all methods return default values (null, 0, false) unless stubbed.
@InjectMocks: Creates an instance of the class under test and injects mocks into it.
@Spy: Creates a real object but allows partial mocking.
@Captor: Captures arguments passed to mocks for assertions.

when().thenReturn() stubs method calls. verify() asserts that methods were called.`,
      code: `@ExtendWith(MockitoExtension.class)
class PolicyServiceTest {

    @Mock
    private PolicyRepository policyRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private PolicyService policyService;  // mocks injected automatically

    @Test
    void shouldCreatePolicyAndSendEmail() {
        // Arrange — stub the mock
        PolicyRequest req = new PolicyRequest("Life", 5000.0);
        Policy savedPolicy = new Policy("POL-001", "Life", 5000.0);
        when(policyRepository.save(any(Policy.class))).thenReturn(savedPolicy);

        // Act
        Policy result = policyService.create(req);

        // Assert
        assertEquals("POL-001", result.getId());
        verify(policyRepository, times(1)).save(any(Policy.class));
        verify(emailService, times(1)).sendWelcome(eq("POL-001"));
    }

    @Test
    void shouldThrowWhenPolicyNotFound() {
        when(policyRepository.findById("INVALID")).thenReturn(Optional.empty());

        assertThrows(PolicyNotFoundException.class,
            () -> policyService.getById("INVALID"));
    }

    @Test
    void shouldCaptureArgumentPassedToRepository() {
        ArgumentCaptor<Policy> captor = ArgumentCaptor.forClass(Policy.class);
        when(policyRepository.save(captor.capture())).thenReturn(any());

        policyService.create(new PolicyRequest("Health", 3000.0));

        Policy captured = captor.getValue();
        assertEquals("Health", captured.getType());
        assertEquals(3000.0, captured.getPremium());
    }

    @Test
    void shouldVerifyNoInteraction() {
        when(policyRepository.findById("POL-001")).thenReturn(Optional.empty());
        assertThrows(PolicyNotFoundException.class, () -> policyService.getById("POL-001"));

        // Email should never be called when policy not found
        verifyNoInteractions(emailService);
    }
}`,
    },
    {
      id: 4,
      question: 'How do you write integration tests for Spring Boot with @SpringBootTest?',
      difficulty: 'intermediate',
      tags: ['Spring Boot Test', 'Integration Testing'],
      answer: `@SpringBootTest loads the full application context. Use it for integration tests that test multiple layers together (Controller → Service → Repository → DB).

For database tests, use @DataJpaTest (loads only JPA slice) or use an in-memory H2 database or Testcontainers (real MySQL/PostgreSQL in Docker).

MockMvc lets you test controllers without starting a real HTTP server. @WebMvcTest loads only the web layer.`,
      code: `// Full integration test with MockMvc
@SpringBootTest
@AutoConfigureMockMvc
@Transactional  // rollback after each test
class PolicyControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldCreatePolicyViaAPI() throws Exception {
        PolicyRequest req = new PolicyRequest("Life", 5000.0);

        mockMvc.perform(post("/api/policies")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.type").value("Life"))
            .andExpect(jsonPath("$.premium").value(5000.0));
    }

    @Test
    void shouldReturn404WhenPolicyNotFound() throws Exception {
        mockMvc.perform(get("/api/policies/INVALID"))
            .andExpect(status().isNotFound());
    }
}

// JPA Slice test (faster — only loads JPA layer)
@DataJpaTest
class PolicyRepositoryTest {

    @Autowired
    private PolicyRepository repository;

    @Test
    void shouldFindActivePolicies() {
        repository.save(new Policy("POL-1", "Life", 5000.0, true));
        repository.save(new Policy("POL-2", "Health", 3000.0, false));

        List<Policy> active = repository.findByActiveTrue();
        assertEquals(1, active.size());
        assertEquals("POL-1", active.get(0).getId());
    }
}

// Web layer only
@WebMvcTest(PolicyController.class)
class PolicyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean  // mock the service
    private PolicyService policyService;

    @Test
    void shouldReturnPolicy() throws Exception {
        when(policyService.getById("POL-001"))
            .thenReturn(new Policy("POL-001", "Life", 5000.0));

        mockMvc.perform(get("/api/policies/POL-001"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value("POL-001"));
    }
}`,
    },
    {
      id: 5,
      question: 'What is Testcontainers? How does it improve integration tests?',
      difficulty: 'advanced',
      tags: ['Testcontainers', 'Integration Testing', 'Docker'],
      answer: `Testcontainers is a Java library that provides lightweight, throwaway instances of databases, message brokers, and other services in Docker containers for testing. Tests run against a real MySQL/Postgres/Kafka instead of H2 or mocks.

Benefits:
- Tests run against the same database you use in production
- No "works with H2 but breaks with MySQL" surprises
- No need to maintain a shared test database
- Each test run gets a fresh, isolated container

The @Container annotation manages container lifecycle. @DynamicPropertySource injects the container's URL/port into Spring's properties.`,
      code: `@SpringBootTest
@Testcontainers
class PolicyRepositoryIT {

    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureDataSource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
    }

    @Autowired
    private PolicyRepository repository;

    @Test
    void shouldPersistAndRetrievePolicy() {
        Policy saved = repository.save(new Policy("Life", 5000.0));
        Optional<Policy> found = repository.findById(saved.getId());

        assertTrue(found.isPresent());
        assertEquals(5000.0, found.get().getPremium());
    }
}

// Kafka Testcontainer
@Container
static KafkaContainer kafka = new KafkaContainer(
    DockerImageName.parse("confluentinc/cp-kafka:7.4.0"));

@DynamicPropertySource
static void kafkaProperties(DynamicPropertyRegistry registry) {
    registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
}

// pom.xml dependencies
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>junit-jupiter</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>mysql</artifactId>
    <scope>test</scope>
</dependency>`,
    },
    {
      id: 6,
      question: 'What are JUnit 5 Assertions? Explain assertAll, assertThrows, assertTimeout.',
      difficulty: 'intermediate',
      tags: ['JUnit 5', 'Assertions'],
      answer: `JUnit 5 provides rich assertion methods in org.junit.jupiter.api.Assertions:

assertAll: Groups multiple assertions — all are executed even if some fail (vs individual assertions that stop on first failure).
assertThrows: Asserts that a method throws a specific exception and returns the exception for further inspection.
assertTimeout: Asserts that execution completes within a time limit.
assertThatException (AssertJ): More fluent API, commonly used alongside JUnit 5.`,
      code: `import static org.junit.jupiter.api.Assertions.*;
import static org.assertj.core.api.Assertions.*;  // AssertJ

@Test
void shouldReturnCorrectPolicyDetails() {
    Policy policy = service.getById("POL-001");

    // assertAll — all assertions run, all failures reported together
    assertAll("policy fields",
        () -> assertEquals("POL-001", policy.getId()),
        () -> assertEquals("Life", policy.getType()),
        () -> assertEquals(5000.0, policy.getPremium(), 0.01),
        () -> assertTrue(policy.isActive()),
        () -> assertNotNull(policy.getCreatedAt())
    );
}

@Test
void shouldThrowWhenPremiumIsNegative() {
    // assertThrows — returns exception for further assertions
    InvalidPremiumException ex = assertThrows(
        InvalidPremiumException.class,
        () -> service.create(new PolicyRequest("Life", -100.0))
    );

    assertEquals("Premium must be positive", ex.getMessage());
    assertEquals(-100.0, ex.getInvalidValue());
}

@Test
void shouldCompleteWithinTimeLimit() {
    // assertTimeout — fails if exceeds duration
    assertTimeout(Duration.ofMillis(500),
        () -> service.generateReport(LocalDate.now()));
}

// AssertJ — more readable, fluent
@Test
void shouldReturnActivePoliciesOnly() {
    List<Policy> policies = service.getActive();

    assertThat(policies)
        .isNotEmpty()
        .hasSize(3)
        .extracting(Policy::getType)
        .containsExactlyInAnyOrder("Life", "Health", "Vehicle")
        .doesNotContain("Expired");
}

@Test
void shouldThrowWithMessage() {
    assertThatThrownBy(() -> service.getById("INVALID"))
        .isInstanceOf(PolicyNotFoundException.class)
        .hasMessageContaining("INVALID")
        .hasNoCause();
}`,
    },
    {
      id: 7,
      question: 'How do you test Spring Security in Spring Boot tests?',
      difficulty: 'advanced',
      tags: ['Spring Security', 'Testing', 'Spring Boot Test'],
      answer: `Testing secured endpoints requires either providing credentials or using Spring Security test support annotations.

@WithMockUser: Simulates a logged-in user with specified roles.
@WithUserDetails: Loads a real user from UserDetailsService.
SecurityMockMvcRequestPostProcessors.jwt(): For JWT-based auth.
@WithAnonymousUser: Tests as unauthenticated user.`,
      code: `@SpringBootTest
@AutoConfigureMockMvc
class SecuredPolicyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanAccessAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/policies"))
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "USER")
    void userCannotAccessAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/policies"))
            .andExpect(status().isForbidden());
    }

    @Test
    void unauthenticatedUserIsRedirectedToLogin() throws Exception {
        mockMvc.perform(get("/api/policies"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "randhir@test.com", roles = {"USER"})
    void userCanAccessOwnPolicies() throws Exception {
        mockMvc.perform(get("/api/policies/mine"))
            .andExpect(status().isOk());
    }

    // JWT-based security test
    @Test
    void shouldAcceptValidJwtToken() throws Exception {
        mockMvc.perform(get("/api/policies")
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER"))))
            .andExpect(status().isOk());
    }
}`,
    },
    {
      id: 8,
      question: 'What is code coverage? How do you measure it in Java projects?',
      difficulty: 'beginner',
      tags: ['Code Coverage', 'JaCoCo'],
      answer: `Code coverage measures what percentage of your code is executed by tests. Types: Line coverage (lines executed), Branch coverage (if/else paths), Method coverage, Class coverage.

JaCoCo is the standard tool for Java. It integrates with Maven/Gradle and generates HTML reports. Aim for 70-80% for business logic — 100% is unrealistic and unnecessary for getters/setters.

In CI/CD, you can configure JaCoCo to fail the build if coverage drops below a threshold.`,
      code: `<!-- pom.xml — JaCoCo setup -->
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.11</version>
    <executions>
        <execution>
            <goals><goal>prepare-agent</goal></goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals><goal>report</goal></goals>
        </execution>
        <!-- Fail build if coverage < threshold -->
        <execution>
            <id>check</id>
            <goals><goal>check</goal></goals>
            <configuration>
                <rules>
                    <rule>
                        <element>BUNDLE</element>
                        <limits>
                            <limit>
                                <counter>LINE</counter>
                                <value>COVEREDRATIO</value>
                                <minimum>0.70</minimum>
                            </limit>
                            <limit>
                                <counter>BRANCH</counter>
                                <value>COVEREDRATIO</value>
                                <minimum>0.60</minimum>
                            </limit>
                        </limits>
                    </rule>
                </rules>
            </configuration>
        </execution>
    </executions>
    <configuration>
        <!-- Exclude generated code -->
        <excludes>
            <exclude>**/dto/**</exclude>
            <exclude>**/config/**</exclude>
            <exclude>**/*Application.class</exclude>
        </excludes>
    </configuration>
</plugin>

# Run and generate report
mvn clean test jacoco:report
# Report at: target/site/jacoco/index.html`,
    },
  ]
}

export default testing
