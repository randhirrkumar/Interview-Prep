const roadmap = {
  weeks: [
    {
      week: 1,
      title: 'Java Core + Java Versions 8–21 + Stream API',
      theme: 'Solidify the Basics',
      days: [
        { day: 1, date: 'Day 1', topics: ['Java OOP: 4 Pillars', 'Abstract vs Interface', 'final/finally/finalize'], revision: ['String, StringBuilder'], mock: false, duration: '2.5h' },
        { day: 2, date: 'Day 2', topics: ['Java Collections: HashMap internals', 'ArrayList vs LinkedList', 'ConcurrentHashMap'], revision: ['OOP concepts'], mock: false, duration: '2.5h' },
        { day: 3, date: 'Day 3', topics: ['Java Versions 8–21: Lambda expressions', 'Functional Interfaces (Predicate/Function/Consumer/Supplier)', 'Method References (4 types)', 'Optional, Date/Time API, CompletableFuture (Q1–Q8)'], revision: ['Collections'], mock: false, duration: '3h' },
        { day: 4, date: 'Day 4', topics: ['Java Versions 8–21: Java 11 (String methods, HttpClient)', 'Java 17 (Records, Sealed Classes, Pattern Matching)', 'Java 21 (Virtual Threads, Sequenced Collections)', 'Comparison Q&A (Q9–Q25)'], revision: ['Java 8 features'], mock: false, duration: '3h' },
        { day: 5, date: 'Day 5', topics: ['Stream API Coding: Q1–Q15', 'filter, map, collect, reduce patterns', 'Comparator vs Comparable'], revision: ['Java Versions 8–21'], mock: false, duration: '3h' },
        { day: 6, date: 'Day 6', topics: ['Stream API Coding: Q16–Q30', 'Multithreading: Thread creation, synchronized', 'ExecutorService, ReentrantLock, CompletableFuture vs Virtual Threads'], revision: ['Stream API Q1–Q15'], mock: false, duration: '3h' },
        { day: 7, date: 'Day 7', topics: ['Week 1 Full Revision', 'Practice 20 Java Q&A', 'Mini mock interview'], revision: ['Week 1 all'], mock: true, duration: '3h' },
      ],
    },
    {
      week: 2,
      title: 'Spring Boot + Hibernate + SQL + Testing',
      theme: 'Core Framework Mastery',
      days: [
        { day: 8, date: 'Day 8', topics: ['Spring Boot: auto-configuration', 'DI types (Constructor/Setter/Field)', 'Bean lifecycle'], revision: ['Java fundamentals'], mock: false, duration: '2.5h' },
        { day: 9, date: 'Day 9', topics: ['Spring MVC: REST API best practices', 'Exception handling (@ControllerAdvice)', '@Transactional internals', 'API Versioning: strategies + Spring Boot 4.0 @ApiVersion, Deprecation Hints'], revision: ['Spring Boot basics'], mock: false, duration: '3.5h' },
        { day: 10, date: 'Day 10', topics: ['Hibernate: JPA annotations', 'N+1 problem & fix', 'Query optimization, Caching'], revision: ['Spring MVC'], mock: false, duration: '3h' },
        { day: 11, date: 'Day 11', topics: ['SQL: Joins, subqueries', 'Window functions (ROW_NUMBER, RANK)', 'Indexing & query plan'], revision: ['Hibernate'], mock: false, duration: '2.5h' },
        { day: 12, date: 'Day 12', topics: ['Spring Security: JWT implementation', 'Filter chain', 'RBAC, SSO/SAML vs OAuth2'], revision: ['SQL'], mock: false, duration: '2.5h' },
        { day: 13, date: 'Day 13', topics: ['Design Patterns: Singleton, Factory, Builder, Strategy, Observer', 'Testing: JUnit 5, Mockito basics', '@MockBean, @WebMvcTest, Integration vs Unit tests'], revision: ['Spring Security'], mock: false, duration: '3h' },
        { day: 14, date: 'Day 14', topics: ['Week 2 Revision', 'Spring Boot mock interview', 'SQL coding problems'], revision: ['Week 2 all'], mock: true, duration: '3.5h' },
      ],
    },
    {
      week: 3,
      title: 'Microservices + Kafka + RabbitMQ + Spring Cloud',
      theme: 'Distributed Systems Mastery',
      days: [
        { day: 15, date: 'Day 15', topics: ['Microservices patterns', 'API Gateway', 'Service Discovery (Eureka)', 'Load balancing'], revision: ['Spring Boot'], mock: false, duration: '3h' },
        { day: 16, date: 'Day 16', topics: ['Circuit Breaker (Resilience4j)', 'Saga pattern', 'CQRS', 'Distributed tracing (Sleuth/Zipkin)'], revision: ['Microservices patterns'], mock: false, duration: '3h' },
        { day: 17, date: 'Day 17', topics: ['Kafka: Core concepts', 'Partitions & Consumer Groups', 'Offsets & delivery guarantees', 'Replication'], revision: ['Microservices'], mock: false, duration: '3h' },
        { day: 18, date: 'Day 18', topics: ['Kafka: Spring Kafka producer/consumer', 'Error handling, Dead Letter Topic (DLT)', 'RabbitMQ: Exchanges, Queues, Spring AMQP, DLQ'], revision: ['Kafka core'], mock: false, duration: '3.5h' },
        { day: 19, date: 'Day 19', topics: ['Spring Cloud: Config Server, Feign Client', 'Spring Cloud Gateway: routing, filters, rate limiting', 'Resilience4j: Circuit Breaker, Retry, Bulkhead'], revision: ['Kafka + RabbitMQ'], mock: false, duration: '3.5h' },
        { day: 20, date: 'Day 20', topics: ['Week 3 Revision — Microservices architecture round', 'Design a Notification Service', 'Microservices failure scenarios Q&A'], revision: ['Week 3 all'], mock: true, duration: '3.5h' },
      ],
    },
    {
      week: 4,
      title: 'Databases + Caching + Observability',
      theme: 'Data Layer & Production Readiness',
      days: [
        { day: 21, date: 'Day 21', topics: ['MongoDB: Document modeling, embedded vs references', 'Spring Data MongoDB, Aggregation Pipeline', 'Indexing (compound, TTL, text), Sharding basics'], revision: ['SQL & Hibernate'], mock: false, duration: '3h' },
        { day: 22, date: 'Day 22', topics: ['Redis & Caching: Data structures, TTL, eviction policies', 'Spring Cache (@Cacheable, @CacheEvict)', 'Distributed locking, Rate limiting with Redis', 'Redis Cluster vs Sentinel'], revision: ['MongoDB'], mock: false, duration: '3.5h' },
        { day: 23, date: 'Day 23', topics: ['Observability: Spring Boot Actuator deep dive', 'Micrometer metrics: Counter, Gauge, Timer', 'Prometheus + Grafana setup, PromQL queries', 'Structured logging with ELK Stack, Distributed Tracing'], revision: ['Redis'], mock: false, duration: '3.5h' },
        { day: 24, date: 'Day 24', topics: ['Week 4 Revision: Data + Caching + Monitoring', 'Mock: "Debug a production memory issue"', 'Mock: "Design cache strategy for X system"'], revision: ['Week 4 all'], mock: true, duration: '3h' },
      ],
    },
    {
      week: 5,
      title: 'Cloud + Docker + Kubernetes + CI/CD',
      theme: 'Cloud-Native & DevOps',
      days: [
        { day: 25, date: 'Day 25', topics: ['AWS Core: EC2, S3, RDS, SQS/SNS, Lambda', 'IAM roles, VPC, Security Groups, ECS vs EKS', 'Spring Boot on AWS: deployment, secrets, CloudWatch'], revision: ['Docker basics'], mock: false, duration: '3.5h' },
        { day: 26, date: 'Day 26', topics: ['Azure: App Service, CI/CD with Azure DevOps', 'Azure Service Bus, Azure Key Vault, AKS', 'SSO/SAML: Protocol deep dive, Spring Security SAML'], revision: ['AWS'], mock: false, duration: '3h' },
        { day: 27, date: 'Day 27', topics: ['Kubernetes: Pods, Deployments, Services, ConfigMaps, Secrets', 'Health probes (liveness/readiness/startup), HPA', 'Helm charts, Zero-downtime deployments, PodDisruptionBudget'], revision: ['AWS + Azure'], mock: false, duration: '3.5h' },
        { day: 28, date: 'Day 28', topics: ['CI/CD: GitHub Actions full pipeline (build/test/scan/push/deploy)', 'Jenkins pipeline (Declarative Jenkinsfile)', 'GitOps with ArgoCD, SonarQube quality gates, Blue-Green & Canary'], revision: ['Kubernetes'], mock: false, duration: '3.5h' },
        { day: 29, date: 'Day 29', topics: ['Week 5 Revision: Cloud + DevOps round', 'Mock: "Design CI/CD pipeline for 20 microservices"', 'Mock: "K8s deployment troubleshooting scenarios"'], revision: ['Week 5 all'], mock: true, duration: '3h' },
      ],
    },
    {
      week: 6,
      title: 'System Design + Modern APIs + Spring AI',
      theme: 'Senior-Level Architecture',
      days: [
        { day: 30, date: 'Day 30', topics: ['System Design framework: Requirements → Estimation → HLD → Deep Dive', 'Design URL Shortener (HLD + LLD)', 'CAP theorem, Consistent Hashing, Database Sharding'], revision: ['Microservices + Databases'], mock: false, duration: '4h' },
        { day: 31, date: 'Day 31', topics: ['System Design: Notification Service (Kafka fan-out, retry, DLQ)', 'CQRS + Event Sourcing in-depth', 'Design Rate Limiter (token bucket, sliding window)', 'High Availability & Disaster Recovery (RPO/RTO)'], revision: ['System Design fundamentals'], mock: false, duration: '4h' },
        { day: 32, date: 'Day 32', topics: ['System Design: Real-time Chat System (WebSocket, Redis Pub/Sub)', 'System Design: Social Media Feed (fan-out on write vs read)', 'Non-functional requirements: Scalability, Availability, Consistency trade-offs'], revision: ['System Design Day 30–31'], mock: false, duration: '3.5h' },
        { day: 33, date: 'Day 33', topics: ['GraphQL: Schema, @QueryMapping, @BatchMapping (DataLoader)', 'gRPC: Protobuf, 4 streaming types, interceptors, TLS', 'REST vs GraphQL vs gRPC — when to choose which'], revision: ['Spring Boot + Microservices'], mock: false, duration: '3h' },
        { day: 34, date: 'Day 34', topics: ['Spring AI: ChatClient, PromptTemplate, Structured Output', 'RAG pattern: Embeddings, Vector Store, Retrieval', 'Prompt engineering, function calling, token cost management'], revision: ['Spring Boot + Cloud'], mock: false, duration: '3h' },
        { day: 35, date: 'Day 35', topics: ['Week 6 Revision: System Design + Modern APIs', 'Mock System Design Interview (60 minutes)', 'Senior-level Q&A: trade-offs, architecture decisions'], revision: ['Week 6 all'], mock: true, duration: '4h' },
      ],
    },
    {
      week: 7,
      title: 'Projects + HR + Full Mock Interviews',
      theme: 'Interview Simulation Week',
      days: [
        { day: 36, date: 'Day 36', topics: ['EPLMS project: Full deep dive', 'Architecture explanation', 'Kafka flow, real challenges faced'], revision: ['Projects'], mock: false, duration: '3.5h' },
        { day: 37, date: 'Day 37', topics: ['MetLife project: Full deep dive', 'Security implementation (SSO/SAML)', 'Performance wins, async processing'], revision: ['EPLMS'], mock: false, duration: '3.5h' },
        { day: 38, date: 'Day 38', topics: ['HR: Tell me about yourself', 'Gap handling (confidence, upskilling)', 'Why job switch, Salary discussion'], revision: ['Projects'], mock: true, duration: '2h' },
        { day: 39, date: 'Day 39', topics: ['Full Mock Interview Round 1 (Technical)', '60-minute simulation', 'Java + Spring + Microservices questions'], revision: ['Everything'], mock: true, duration: '3h' },
        { day: 40, date: 'Day 40', topics: ['Full Mock Interview Round 2 (System Design + HR)', 'Feedback review', 'Final weak area revision'], revision: ['Everything'], mock: true, duration: '4h' },
        { day: 41, date: 'Day 41', topics: ['Company-specific prep: Infosys, TCS, Wipro, Capgemini', 'Behavioral + situational questions', 'Final confidence round'], revision: ['HR + Projects'], mock: true, duration: '3h' },
        { day: 42, date: 'Day 42', topics: ['Final 360° Revision: All 28 topics', 'Top 50 most-asked Q&A speed round', 'You are ready. Go crack it!'], revision: ['All topics'], mock: true, duration: '4h' },
      ],
    },
  ],
}

export default roadmap
