const projects = {
  eplms: {
    id: 'eplms',
    name: 'EPLMS — Adani Groups',
    period: 'Sep 2024 – Present',
    tagline: 'Real-time Vehicle Tracking & Logistics Automation System',
    techStack: ['Java', 'Spring Boot', 'Microservices', 'Apache Kafka', 'MySQL', 'RESTful APIs', 'Swagger', 'Postman'],
    overview: `EPLMS (Enterprise Parking & Logistics Management System) is a real-time vehicle tracking and logistics automation platform built for Adani Groups. The system manages the entry, inspection, loading, and exit of commercial vehicles across logistics hubs.

Before this system, the process was largely manual — paper-based check-ins, phone calls between gate and warehouse, manual billing calculations. The system replaced all of this with automated, real-time digital workflows.

Key outcomes I delivered:
• Reduced manual effort by 40%
• Processing 10,000+ vehicle events per day
• API response time improved by 30%
• System throughput improved by 25%`,

    architecture: `The system uses a microservices architecture with event-driven communication via Kafka.

Core microservices:
1. Vehicle Service: manages vehicle master data, registration, compliance
2. Event Processing Service: validates and enriches vehicle events
3. Tracking Service: real-time location and status updates
4. Billing Service: computes charges based on loading/unloading duration
5. Notification Service: SMS/email alerts to drivers and operators
6. API Gateway: routes requests, handles authentication

Communication:
- Synchronous (REST): for user-facing operations (check-in API, dashboard queries)
- Asynchronous (Kafka): for event processing pipeline (check-in → track → bill → notify)`,

    kafkaFlow: `Vehicle Event Flow:
1. Operator scans vehicle QR code → mobile app calls REST API
2. API Gateway validates JWT token → routes to Event Processing Service
3. Event Processing Service:
   - Validates event data
   - Enriches with vehicle master data from DB
   - Publishes to Kafka topic 'vehicle-raw-events' (key = vehicleId)
4. Tracking Service consumes from 'vehicle-raw-events':
   - Updates vehicle location and status
   - Stores event history
5. Billing Service consumes same events:
   - Calculates duration-based charges
   - Updates billing records
6. Notification Service triggers:
   - SMS to driver on check-in/checkout
   - Alert to supervisor for overloaded vehicles`,

    challenges: [
      {
        title: 'Silent Kafka Message Drop',
        desc: `Problem: 2-3% of vehicle check-in events were being silently dropped. Billing records were inconsistent.

Investigation: Consumer was catching deserialization exceptions (caused by a mobile app version mismatch) and logging a warning but committing the offset — effectively losing the message.

Fix: Implemented Dead Letter Topic (DLT) for failed messages. Added schema validation before publishing. Reprocessed all failed events from DLT.

Lesson: Never silently discard messages in event-driven systems. Always have a failure path.`,
      },
      {
        title: 'Consumer Lag Spike',
        desc: `Problem: Kafka consumer lag occasionally spiked to 5,000+ messages during peak hours, causing real-time tracking delays.

Root cause: Database queries in the consumer were slow during peak — fetching vehicle master data on every event.

Fix: Added in-memory cache (ConcurrentHashMap) for vehicle master data with @PostConstruct initialization and 5-minute TTL refresh. Consumer processing time dropped from 200ms to 15ms per event.

Result: Consumer lag stayed under 100 messages even at peak.`,
      },
      {
        title: 'API Performance Optimization',
        desc: `Problem: Dashboard API loading vehicle event history was taking 3-4 seconds.

Root cause: Loading all VehicleEvent fields (including large metadata JSON column) for a 30-day report.

Fix: Changed to DTO projection — only selected columns needed by UI. Added pagination. Added composite index on (vehicle_id, event_type, timestamp).

Result: 3-4 seconds → 150ms. 95% improvement.`,
      },
    ],

    deepDiveQA: [
      {
        q: 'Walk me through the architecture of EPLMS',
        a: `EPLMS is a microservices-based system with 5 core services. The user-facing layer is a REST API Gateway that handles routing and JWT authentication.

The core event pipeline is Kafka-based: when a vehicle scans in, the API publishes a raw event to Kafka. The Event Processing Service consumes this, enriches it with vehicle data, and publishes a processed event. Three downstream services — Tracking, Billing, and Notification — each independently consume the processed events.

For the database, each service has its own MySQL schema (microservices independence). The Vehicle Service owns the master data tables. The Billing Service has its own billing tables. No cross-service database queries.

I specifically designed the Kafka partition key strategy — using vehicleId as the key ensures all events for the same vehicle go to the same partition, guaranteeing processing order for each vehicle.`,
      },
      {
        q: 'How did you ensure high availability and fault tolerance?',
        a: `Several layers:

First, Kafka itself has replication — all topics have replication factor 3, so if one broker goes down, no data is lost.

Second, each microservice has 2+ instances behind a load balancer. If one instance dies, traffic routes to the others.

Third, Circuit Breakers (Resilience4j) on any external API calls — if the vehicle registration authority API is down, we fail gracefully and mark the event for manual review instead of blocking the entire flow.

Fourth, the Kafka consumer is idempotent — if an event is processed twice (at-least-once delivery), the processing is safe because we check for duplicate event IDs before writing to DB.

Fifth, dead letter topics for failed processing — nothing gets silently lost.`,
      },
      {
        q: 'How did you scale the system?',
        a: `Scaling in Kafka-based microservices is straightforward if you design it right.

For producers: REST API services are stateless, so we just add more instances behind the load balancer. We used autoscaling rules based on CPU usage.

For consumers: We had 6 partitions for vehicle-events topic and 6 consumer instances (1:1 ratio). When load doubled, we increased to 12 partitions and scaled to 12 consumer instances.

The key design decision that made this scaling possible: vehicleId as partition key. This means we can freely add partitions without breaking the ordering guarantee per vehicle.

The entire scaling operation was done with zero downtime — added new partitions, gradually spun up new consumer instances, and the consumer group rebalanced automatically.`,
      },
    ],
  },

  metlife: {
    id: 'metlife',
    name: 'MetLife Insurance',
    period: 'June 2022 – Mar 2024',
    tagline: 'Policy & Claims Management System',
    techStack: ['Java', 'Spring Boot', 'Microservices', 'MySQL', 'RESTful APIs', 'Swagger', 'Postman', 'Spring Security'],
    overview: `The MetLife Insurance project was an enterprise-grade policy and claims management system handling 10,000+ daily transactions. The system managed the full lifecycle of insurance policies — from creation, premium calculation, payment scheduling, claims processing, to settlement.

My role was developing RESTful APIs for policy management and claims processing, improving system performance, and implementing Spring Security for authentication and authorization.

Key outcomes:
• Built REST APIs handling 10,000+ daily transactions
• Improved performance by 20-30% through query optimization
• Reduced production defects by 25% using JUnit testing
• Implemented Spring Security authentication & authorization`,

    architecture: `Standard layered microservices architecture:

Controller Layer → Service Layer → Repository Layer → Database

Microservices:
1. Policy Service: CRUD for policies, premium calculations
2. Claims Service: claim submission, status tracking, document management
3. Customer Service: customer profile management
4. Payment Service: premium collection, payment scheduling
5. Notification Service: email/SMS for policy events

Authentication: Spring Security with JWT. SSO via SAML for enterprise users connecting through corporate Active Directory.`,

    deepDiveQA: [
      {
        q: 'Explain the claims processing workflow',
        a: `When a claim is submitted, it goes through a multi-step workflow:

1. Submission: customer submits claim via API with supporting documents
2. Registration: claim is registered with a unique claim number, status set to UNDER_REVIEW
3. Document Verification: documents are checked for completeness
4. Assessment: claims assessor evaluates the claim against policy terms
5. Decision: APPROVED or REJECTED
6. Settlement: if approved, payment processing is triggered
7. Notification: customer is notified at each status change

Each status change is audited (who changed it, when, why). The audit trail was critical for compliance and dispute resolution.

I built the API layer for this workflow. The state machine pattern was used — only valid status transitions are allowed. E.g., you can't go from UNDER_REVIEW to SETTLED without going through APPROVED first.`,
      },
      {
        q: 'How did you implement Spring Security in MetLife?',
        a: `We had two authentication mechanisms:
1. JWT-based auth for external API clients (mobile app, web portal)
2. SAML-based SSO for enterprise users authenticating through corporate AD

For JWT, I built the standard filter chain — JwtAuthFilter validates the token on every request, extracts user ID and roles, sets up SecurityContext.

For authorization, I used @PreAuthorize annotations on service methods. For example, only users with ROLE_CLAIMS_ASSESSOR could approve or reject claims. Regular customers could only view their own claims.

Method-level security was important because even if a customer somehow got the right URL, they couldn't access another customer's claims — the @PreAuthorize annotation ensured the userId matched the resource's owner.`,
      },
    ],
  },
}

export default projects
