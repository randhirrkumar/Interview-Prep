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
        { day: 9, date: 'Day 9', topics: ['Spring MVC: REST API best practices', 'Exception handling (@ControllerAdvice)', '@Transactional internals'], revision: ['Spring Boot basics'], mock: false, duration: '3h' },
        { day: 10, date: 'Day 10', topics: ['Hibernate: JPA annotations', 'N+1 problem & fix', 'Query optimization, Caching'], revision: ['Spring MVC'], mock: false, duration: '3h' },
        { day: 11, date: 'Day 11', topics: ['SQL: Joins, subqueries', 'Window functions (ROW_NUMBER, RANK)', 'Indexing & query plan'], revision: ['Hibernate'], mock: false, duration: '2.5h' },
        { day: 12, date: 'Day 12', topics: ['Spring Security: JWT implementation', 'Filter chain', 'RBAC, SSO/SAML vs OAuth2'], revision: ['SQL'], mock: false, duration: '2.5h' },
        { day: 13, date: 'Day 13', topics: ['Design Patterns: Singleton, Factory, Builder, Strategy, Observer', 'Testing: JUnit 5, Mockito basics', '@MockBean, @WebMvcTest, Integration vs Unit tests'], revision: ['Spring Security'], mock: false, duration: '3h' },
        { day: 14, date: 'Day 14', topics: ['Week 2 Revision', 'Spring Boot mock interview', 'SQL coding problems'], revision: ['Week 2 all'], mock: true, duration: '3.5h' },
      ],
    },
    {
      week: 3,
      title: 'Microservices + Kafka + Docker + System Design',
      theme: 'Architecture & Scale',
      days: [
        { day: 15, date: 'Day 15', topics: ['Microservices patterns', 'API Gateway', 'Service Discovery (Eureka)', 'Load balancing'], revision: ['Spring Boot'], mock: false, duration: '3h' },
        { day: 16, date: 'Day 16', topics: ['Circuit Breaker (Resilience4j)', 'Saga pattern', 'CQRS', 'Distributed tracing'], revision: ['Microservices patterns'], mock: false, duration: '3h' },
        { day: 17, date: 'Day 17', topics: ['Kafka: Core concepts', 'Partitions & Consumer Groups', 'Offsets & delivery guarantees', 'Replication'], revision: ['Microservices'], mock: false, duration: '3h' },
        { day: 18, date: 'Day 18', topics: ['Kafka: Spring Kafka producer/consumer', 'Error handling, Dead Letter Topic (DLT)', 'Docker: Dockerfile, docker-compose, multi-stage builds'], revision: ['Kafka core'], mock: false, duration: '3h' },
        { day: 19, date: 'Day 19', topics: ['System Design: Vehicle Tracking (EPLMS)', 'HLD + LLD', 'Kafka event flow, WebSocket, DB schema'], revision: ['Kafka + Docker'], mock: false, duration: '3.5h' },
        { day: 20, date: 'Day 20', topics: ['System Design: URL Shortener', 'Rate Limiter', 'Notification Service'], revision: ['System Design basics'], mock: false, duration: '3.5h' },
        { day: 21, date: 'Day 21', topics: ['Week 3 Revision', 'Full architecture mock', 'System design practice'], revision: ['Week 3 all'], mock: true, duration: '4h' },
      ],
    },
    {
      week: 4,
      title: 'Cloud + Docker + HR + Full Mock Interviews',
      theme: 'Interview Simulation Week',
      days: [
        { day: 22, date: 'Day 22', topics: ['Azure: App Service, CI/CD with Azure DevOps', 'Docker & Kubernetes: K8s Pods, Services, Deployments', 'Helm basics, container registry'], revision: ['System Design'], mock: false, duration: '3h' },
        { day: 23, date: 'Day 23', topics: ['SSO/SAML: Protocol deep dive', 'Spring Security SAML', 'OAuth2 vs SAML vs JWT'], revision: ['Azure + Docker'], mock: false, duration: '3h' },
        { day: 24, date: 'Day 24', topics: ['EPLMS project: Full deep dive', 'Architecture explanation', 'Kafka flow, real challenges faced'], revision: ['Projects'], mock: false, duration: '3.5h' },
        { day: 25, date: 'Day 25', topics: ['MetLife project: Full deep dive', 'Security implementation (SSO/SAML)', 'Performance wins, async processing'], revision: ['EPLMS'], mock: false, duration: '3.5h' },
        { day: 26, date: 'Day 26', topics: ['HR: Tell me about yourself', 'Gap handling (confidence, upskilling)', 'Why job switch, Salary discussion'], revision: ['Projects'], mock: true, duration: '2h' },
        { day: 27, date: 'Day 27', topics: ['Full Mock Interview Round 1 (Technical)', '60-minute simulation', 'Java + Spring + Microservices questions'], revision: ['Everything'], mock: true, duration: '3h' },
        { day: 28, date: 'Day 28', topics: ['Full Mock Interview Round 2 (System Design + HR)', 'Feedback review', 'Final weak area revision'], revision: ['Everything'], mock: true, duration: '4h' },
      ],
    },
  ],
}

export default roadmap
