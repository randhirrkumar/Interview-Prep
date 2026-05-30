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
  ecommerce: {
    id: 'ecommerce',
    name: 'E-Commerce Order Management Platform',
    period: 'Sample Project',
    tagline: 'Microservices-based order processing system with Kafka event pipeline',
    techStack: ['Java', 'Spring Boot', 'Microservices', 'Apache Kafka', 'MySQL', 'Redis', 'Spring Security', 'Docker', 'RESTful APIs'],
    overview: `An E-Commerce Order Management Platform built with a microservices architecture. The system handles the full order lifecycle — from cart checkout, inventory reservation, payment processing, to order fulfilment and delivery tracking.

Key design goals:
• High throughput: handle 50,000+ orders per day
• Strong consistency: no overselling inventory even under concurrent traffic
• Resilience: payment failures, inventory holds, and service outages handled gracefully
• Event-driven: loosely coupled services communicating via Kafka

This is one of the most common system design interview questions. Understanding how to build this system — and the tradeoffs involved — is essential for senior Java backend roles.`,

    architecture: `Microservices breakdown:

1. API Gateway: Single entry point. JWT validation, rate limiting, routing to downstream services.
2. Product Service: Product catalog, pricing. Heavily cached with Redis (read-heavy).
3. Inventory Service: Stock management. Critical — must handle concurrent reservation atomically.
4. Cart Service: Session-based cart, persisted in Redis with TTL.
5. Order Service: Creates and tracks orders. Orchestrates the order-placed → fulfilled pipeline via Kafka.
6. Payment Service: Integrates with payment gateway. Idempotency keys prevent double charging.
7. Notification Service: Emails/SMS via Kafka subscription (order-confirmed, order-shipped, etc.).

Data stores:
- MySQL: Orders, inventory (source of truth for stock counts)
- Redis: Product catalog cache, cart sessions, idempotency key store
- Kafka: Event bus between services

API Gateway → (REST) → Order Service → (Kafka) → Inventory, Payment, Notification Services`,

    kafkaFlow: `Order Event Pipeline:

1. Customer clicks "Place Order" → POST /orders → Order Service
2. Order Service:
   - Creates order record with status = PENDING
   - Publishes event to 'order-placed' Kafka topic (key = orderId)

3. Inventory Service consumes 'order-placed':
   - Reserves stock (UPDATE inventory SET reserved = reserved + qty WHERE available >= qty)
   - If stock available → publishes 'inventory-reserved' event
   - If out of stock → publishes 'inventory-failed' event

4. Payment Service consumes 'inventory-reserved':
   - Charges customer using stored payment method
   - Uses idempotency key = orderId to prevent double charge
   - If success → publishes 'payment-completed' event
   - If failed → publishes 'payment-failed' event

5. Order Service consumes 'payment-completed':
   - Updates order status to CONFIRMED
   - Publishes 'order-confirmed' event

6. Notification Service consumes 'order-confirmed':
   - Sends confirmation email + SMS to customer

Failure/Saga Compensation:
- 'payment-failed' → Inventory Service releases the reservation
- 'inventory-failed' → Order Service marks order as CANCELLED, triggers refund if payment already taken`,

    challenges: [
      {
        title: 'Inventory Overselling Under Concurrent Load',
        desc: `Problem: During a flash sale, the same product was being sold to 50 customers simultaneously even though only 10 items were in stock.

Root cause: Race condition. Multiple threads read inventory = 10, all passed the "available > 0" check, all decremented. Result: inventory went negative.

Fix Option 1 (Pessimistic Lock): SELECT ... FOR UPDATE on the inventory row. Ensures only one transaction reads and updates at a time. Simple but reduces concurrency.

Fix Option 2 (Optimistic Lock + Retry): Add a version column. UPDATE inventory SET stock = stock - qty, version = version + 1 WHERE id = ? AND version = ? AND stock >= qty. If 0 rows updated → retry. No blocking, high concurrency, handles conflicts gracefully.

Fix Option 3 (Redis atomic operations): Use DECRBY in Redis for inventory counts (atomic in single-threaded Redis). Sync to MySQL asynchronously. Fastest option but adds complexity.

We went with Option 2 (optimistic locking) — good balance of correctness and performance.`,
      },
      {
        title: 'Distributed Transaction — Saga Pattern',
        desc: `Problem: How do you guarantee that inventory reservation + payment + order confirmation either all succeed or all get rolled back? You can't use a single DB transaction across multiple services.

Solution: Saga Pattern (Choreography-based).

Each service does its local transaction and publishes an event. If a downstream step fails, a compensating event is published to undo the previous steps.

Compensation chain:
- payment-failed → Inventory Service listens and releases reservation
- inventory-failed → Order Service listens and cancels order

Idempotency is critical: if a compensation event is delivered twice, the result must be the same (don't release inventory twice). We solve this with unique event IDs stored in a processed_events table — if event already processed, skip.`,
      },
      {
        title: 'Redis Cache Stampede on Product Page',
        desc: `Problem: When a popular product cache key expired, 1,000 concurrent requests all hit MySQL simultaneously to rebuild the cache. MySQL spiked to 100% CPU.

Root cause: Classic cache stampede (thundering herd problem).

Fix: Probabilistic Early Expiration — slightly before TTL expires, a few requests proactively refresh the cache instead of waiting for it to expire. Combined with a mutex lock (Redis SETNX) so only one request rebuilds the cache; others wait and then read the freshly cached value.

Result: Zero cache stampedes on high-traffic product pages.`,
      },
    ],

    deepDiveQA: [
      {
        q: 'How would you design the inventory service to prevent overselling?',
        a: `I would use optimistic locking at the database level.

The inventory table has a version column. When reserving stock, I do:
UPDATE inventory SET stock = stock - qty, version = version + 1
WHERE product_id = ? AND version = ? AND stock >= qty

If this updates 0 rows, it means either stock was insufficient or another transaction already changed the version. In that case I retry (with a finite max retry count) or return "out of stock."

Why optimistic over pessimistic locking? Pessimistic locking (SELECT FOR UPDATE) blocks concurrent readers. For read-heavy inventory pages, this kills performance. Optimistic locking only conflicts on writes, and conflicts during flash sales are expected and handled with retries.

For extreme scale (millions of concurrent users), I would use Redis DECRBY which is atomic in Redis's single-threaded model — set inventory count in Redis, decrement atomically, only persist to MySQL asynchronously. Much faster, but adds eventual consistency complexity.`,
      },
      {
        q: 'Why Kafka instead of REST calls between services?',
        a: `Several reasons:

1. Decoupling: Order Service doesn't need to know if Inventory Service is up. It publishes to a topic and Kafka guarantees delivery. With REST, if Inventory Service is down, Order Service either fails or needs complex retry logic.

2. Resilience: Kafka persists messages. If a consumer goes down, when it comes back it resumes from where it left off. Zero message loss.

3. Fan-out: 'order-placed' event is consumed by Inventory, Payment, and Notification services simultaneously. With REST, Order Service would need to call all three — complex orchestration.

4. Audit trail: Kafka topic is an immutable log of all events. Perfect for debugging production issues — you can replay events.

The tradeoff: eventual consistency. The order is PENDING for a few hundred milliseconds while inventory and payment are processed asynchronously. This is acceptable for e-commerce. For banking (money transfer), you'd want stronger consistency guarantees.`,
      },
      {
        q: 'How do you handle payment failures after inventory is already reserved?',
        a: `This is the distributed transaction / Saga problem.

When payment fails:
1. Payment Service publishes a 'payment-failed' event with orderId
2. Order Service consumes it → marks order CANCELLED
3. Inventory Service consumes it → releases the reservation (stock += qty)

The key challenge is: what if the compensation itself fails? E.g., what if Inventory Service crashes while processing 'payment-failed'?

Answer: Kafka's at-least-once delivery guarantees the event will be redelivered. So Inventory Service will eventually process it. But this means compensation logic must be IDEMPOTENT — running it twice must produce the same result.

Implementation: Before releasing stock, check a processed_compensations table. If this orderId's compensation is already recorded, skip. This prevents double-releasing inventory.`,
      },
    ],
  },

  urlshortener: {
    id: 'urlshortener',
    name: 'URL Shortener Service',
    period: 'Sample Project',
    tagline: 'High-throughput URL shortening with Redis caching and analytics',
    techStack: ['Java', 'Spring Boot', 'MySQL', 'Redis', 'RESTful APIs', 'Base62 Encoding', 'Docker'],
    overview: `A URL Shortener service (similar to bit.ly or TinyURL) that converts long URLs into short 6-8 character codes and redirects users when the short URL is accessed.

Simpler on the surface than e-commerce, but a rich system design problem because it requires:
• Efficient unique ID generation at scale
• Very low latency redirects (sub-10ms)
• High read:write ratio (100:1) — cache-heavy design
• Analytics: click tracking, geo data, referrers

This is extremely common as a system design interview question. The interviewer wants to see how you handle ID generation, collision avoidance, caching strategy, and scale.`,

    architecture: `Core components:

1. URL Shortening API (POST /shorten):
   - Accepts long URL
   - Generates unique short code (Base62 encoding of auto-increment ID)
   - Stores mapping in MySQL
   - Returns short URL (e.g., https://short.ly/aB3xKm)

2. Redirect Service (GET /{code}):
   - Looks up short code → long URL
   - Redis cache first (L1), MySQL fallback (L2)
   - Returns HTTP 301 (permanent) or 302 (temporary) redirect
   - Async analytics event published

3. Analytics Service:
   - Consumes click events from Kafka
   - Tracks: total clicks, unique visitors, referrer, country, device
   - Stored in MySQL time-series table

ID Generation strategy (critical design decision):
- Use database auto-increment ID as the base number
- Encode to Base62 (a-z, A-Z, 0-9) for the short code
- ID 12345 → Base62 → "dnh" (3 chars)
- 6-char code supports 62^6 = 56 billion unique URLs

Read/write ratio: ~100 reads per write
- Redis TTL: 24 hours for popular URLs, shorter for one-time links
- MySQL: source of truth for all mappings`,

    kafkaFlow: `Click Event Pipeline:

1. User hits GET /aB3xKm → Redirect Service
2. Redirect Service:
   - Checks Redis cache first (O(1))
   - On cache miss: queries MySQL, populates Redis
   - Returns 302 redirect to long URL
   - Publishes 'url-clicked' event to Kafka ASYNCHRONOUSLY (non-blocking)

3. Analytics Service consumes 'url-clicked':
   - Parses User-Agent for device/browser
   - Resolves IP to country (MaxMind GeoLite)
   - Inserts into click_events table
   - Updates aggregated stats (daily_clicks table)

Why async analytics?
- Redirect must be < 10ms. Synchronous DB write for analytics would add 20-50ms.
- Analytics is non-critical path. Slight delay is acceptable.
- If Analytics Service is down, Kafka buffers the events. No click data is lost.`,

    challenges: [
      {
        title: 'Cache Penetration — Non-existent Short Codes',
        desc: `Problem: Bots and scrapers were hitting random short codes that don't exist. Every request missed Redis and hit MySQL, which returned nothing. This added unnecessary load to MySQL.

Root cause: Cache only stores hits, not misses. So non-existent URLs always bypass cache.

Fix: Bloom Filter. A Bloom Filter is a probabilistic data structure that can tell you "definitely not in the set" or "probably in the set."

On startup, load all existing short codes into a Bloom Filter (in-memory or Redis-based). Before Redis or MySQL lookup, check the Bloom Filter. If it says "definitely not in set" → return 404 immediately without touching the database.

Tradeoff: Bloom Filter has a small false positive rate (~1%) — some non-existent URLs will still pass through. That's acceptable.

Result: ~90% reduction in DB load from invalid code lookups.`,
      },
      {
        title: 'Hot Key Problem — Viral URLs',
        desc: `Problem: A viral tweet contained one of our short URLs. 500,000 users clicked it in 2 minutes. All requests hit the same Redis key. Redis CPU spiked; single-threaded Redis became a bottleneck.

Root cause: Redis is single-threaded. One extremely hot key can saturate it.

Fix 1: Local in-process cache (Caffeine) as L0 cache. Each app instance caches the top 1,000 hot URLs locally. Most requests never reach Redis.

Fix 2: Key replication — store the same mapping under multiple keys (aB3xKm_1, aB3xKm_2, etc.) and randomly select one on read. Spreads load across Redis slots.

Fix 3 (long-term): Move to Redis Cluster — hot key traffic is distributed across multiple nodes.

We implemented Fix 1 first (fastest to ship) and it reduced Redis load by 80%.`,
      },
    ],

    deepDiveQA: [
      {
        q: 'How do you generate unique short codes? What if two users shorten the same URL?',
        a: `ID generation: I use MySQL auto-increment as the base ID, then encode it to Base62.

Why Base62? It uses only alphanumeric characters (a-z, A-Z, 0-9), so the short code is URL-safe. A 6-character Base62 code gives 62^6 = ~56 billion unique codes. That's enough for any foreseeable scale.

For duplicate URLs: I have two options:
Option 1 (Dedup): Check if the long URL already has a short code using a unique index on long_url. Return the existing code. Saves storage, but makes a DB query on every shorten request.
Option 2 (No dedup): Always generate a new code for each request. Simpler, but the same long URL gets multiple short codes.

I typically implement dedup with a UNIQUE INDEX on long_url. The DB query on insert either creates a new row or throws a duplicate key exception (which means the URL already exists — return the existing short code).

For custom short codes: user picks their own code (e.g., /my-blog). Store in the same table with a is_custom flag.`,
      },
      {
        q: 'Should you use 301 or 302 redirect?',
        a: `This is a classic interview question because it has real business impact.

301 (Permanent Redirect): Browser caches the redirect. On subsequent visits, the browser goes directly to the long URL without hitting your server.
✓ Better for user experience (faster)
✗ Bad for analytics — you lose click data after the first visit
✗ Can't update the mapping (browser is caching it)

302 (Temporary Redirect): Browser always hits your server first before redirecting.
✓ Every click is trackable
✓ You can update or deactivate short URLs
✗ Slightly slower (one extra round trip to your server)

For a URL shortener with analytics, 302 is almost always the right choice. The analytics value outweighs the slight latency penalty — and with Redis caching, even the server lookup is sub-millisecond.

Only use 301 if you're doing a permanent redirect with no need to track clicks (e.g., migrating old URLs permanently).`,
      },
      {
        q: 'How would you scale this to handle 100,000 redirects per second?',
        a: `Layer by layer:

1. Application layer: REST API is stateless, so horizontal scaling is easy. Add more instances behind a load balancer. Each instance runs the same Redirect Service.

2. Cache layer: Redis for URL mappings. At this scale, add local in-process cache (Caffeine) on each app instance to reduce Redis calls. The top 1% of URLs serve 80% of traffic — cache them locally.

3. Database: MySQL can handle reads at scale with read replicas. Write throughput is less critical since new URL creation is far less frequent than redirects (100:1 ratio). Read replicas handle lookup load.

4. CDN: For global users, edge-cache redirects at CDN level (Cloudflare, AWS CloudFront). The CDN can serve the 301 or 302 directly for cached URLs. Eliminates origin server calls entirely for hot URLs.

5. Async analytics: All click tracking is non-blocking via Kafka. Analytics doesn't impact redirect latency.

At 100k RPS, the bottleneck would likely be the Redis cluster. Use Redis Cluster with key-based sharding across multiple nodes.`,
      },
    ],
  },

  banking: {
    id: 'banking',
    name: 'Banking Transaction System',
    period: 'Sample Project',
    tagline: 'Concurrent account transfers with ACID guarantees and fraud detection',
    techStack: ['Java', 'Spring Boot', 'Spring Data JPA', 'MySQL', 'Apache Kafka', 'Redis', 'Spring Security', 'RESTful APIs'],
    overview: `A Banking Transaction System that handles account creation, deposits, withdrawals, and fund transfers with strict ACID guarantees.

Banking is the hardest domain for backend systems because:
• Correctness is non-negotiable — losing money or double-crediting is a production disaster
• Concurrency is high — thousands of users transact simultaneously
• Auditability is mandatory — every state change must be logged
• Idempotency is critical — retried API calls must not create duplicate transactions

Understanding how to build this correctly — handling concurrent transfers, preventing race conditions, ensuring idempotency — demonstrates strong Java backend fundamentals.`,

    architecture: `Core services:

1. Account Service: Account CRUD, balance queries, account validation
2. Transaction Service: The heart — handles transfers, deposits, withdrawals. Enforces business rules and ACID guarantees.
3. Fraud Detection Service: Async, consumes transaction events. Flags suspicious patterns (large amounts, unusual geography, rapid sequential transactions).
4. Notification Service: Async, sends transaction alerts via email/SMS.
5. Audit Service: Async, writes immutable audit log for every state change.

Database design (critical for correctness):
- accounts table: id, account_number, balance, version (for optimistic lock), status
- transactions table: id, from_account_id, to_account_id, amount, status, idempotency_key, created_at
- audit_log table: id, entity_type, entity_id, action, old_value, new_value, actor, timestamp

The transactions table is append-only — never updated, never deleted. The balance in accounts is the materialized state derived from all transactions.`,

    kafkaFlow: `Fund Transfer Pipeline:

1. Client sends POST /transactions/transfer with idempotency key in header
2. Transaction Service:
   - Checks idempotency_key in Redis — if seen before, return cached response (prevent duplicate)
   - Validates both accounts exist and are active
   - Checks sender has sufficient balance
   - Within a DB transaction:
     a. Debit sender: UPDATE accounts SET balance = balance - amount WHERE id = ? AND balance >= amount
     b. Credit receiver: UPDATE accounts SET balance = balance + amount WHERE id = ?
     c. Insert transaction record with status = COMPLETED
   - Returns transaction ID and new balance

3. After DB commit, publishes 'transaction-completed' event to Kafka

4. Fraud Detection Service consumes event:
   - Runs fraud rules (amount thresholds, velocity checks, geo-anomaly detection)
   - If flagged → publishes 'transaction-flagged', account gets temporarily locked

5. Notification Service consumes event:
   - Sends "You've sent ₹X to [Name]" to sender
   - Sends "₹X received from [Name]" to receiver

6. Audit Service consumes ALL events:
   - Writes immutable audit trail regardless of outcome`,

    challenges: [
      {
        title: 'Concurrent Transfer — Deadlock Between Two Accounts',
        desc: `Problem: User A transfers to User B while simultaneously User B transfers to User A. Both transactions lock Account A and Account B in opposite orders:

Thread 1: LOCK Account A → waiting for Account B
Thread 2: LOCK Account B → waiting for Account A
→ Classic deadlock.

Fix: Always acquire account locks in a consistent order — lock the account with the SMALLER ID first, regardless of who is sender/receiver.

Code:
long firstLockId = Math.min(fromAccountId, toAccountId);
long secondLockId = Math.max(fromAccountId, toAccountId);
// Always lock firstLockId before secondLockId

This breaks the circular wait condition. No deadlock possible.

Result: Zero deadlocks in concurrent transfer tests. This is a common interview follow-up — the fix is elegant and shows deep concurrency understanding.`,
      },
      {
        title: 'Idempotency — Preventing Duplicate Transactions',
        desc: `Problem: Mobile client retried a transfer request due to network timeout. The first request had already succeeded. The retry created a second debit — customer lost money twice.

Root cause: No idempotency mechanism. Each API call was treated as a new transaction.

Fix: Idempotency keys. Client generates a unique key (UUID) and sends it in the request header: X-Idempotency-Key.

On the server:
1. Check Redis for this idempotency key
2. If found → return the cached response from the original request (do NOT process again)
3. If not found → process the transaction, store result in Redis with TTL (24 hours), return result

The TTL ensures the cache doesn't grow unboundedly. After 24 hours, retries would be treated as new requests (acceptable — user is unlikely to retry a day-old transaction).

Result: Zero duplicate transactions from client retries. This is standard practice in any fintech system.`,
      },
      {
        title: 'Optimistic vs Pessimistic Lock — Which for Balance Update?',
        desc: `This was a key design decision. Here is the analysis:

Pessimistic locking (SELECT FOR UPDATE):
✓ Simple and always correct
✓ No retry logic needed
✗ Blocks other transactions on the same account
✗ Low throughput under high concurrency for popular accounts

Optimistic locking (version column):
✓ No blocking — transactions proceed without locking
✓ High throughput for most cases
✗ Needs retry logic when version conflict detected
✗ Under very high contention (many transfers to same account), retry storms possible

Decision: We use OPTIMISTIC locking with a retry (max 3 attempts). For banking, conflicts are actually rare — most accounts don't have dozens of concurrent transfers happening simultaneously.

The version column: when we read an account, we get version = 5. Our UPDATE includes WHERE version = 5. If someone else updated it first, version is now 6, our update affects 0 rows → we retry with fresh data.

For high-contention accounts (corporate salary disbursement), we switch to pessimistic locking just for those transactions.`,
      },
    ],

    deepDiveQA: [
      {
        q: 'How do you ensure a transfer is atomic — balance debited AND credited together?',
        a: `By wrapping both operations in a single database transaction using Spring's @Transactional annotation.

@Transactional
public TransactionResult transfer(Long fromId, Long toId, BigDecimal amount) {
    Account from = accountRepo.findByIdWithLock(fromId); // SELECT FOR UPDATE or optimistic lock
    Account to = accountRepo.findByIdWithLock(toId);

    if (from.getBalance().compareTo(amount) < 0) {
        throw new InsufficientFundsException();
    }

    from.setBalance(from.getBalance().subtract(amount));
    to.setBalance(to.getBalance().add(amount));

    accountRepo.save(from);
    accountRepo.save(to);

    Transaction tx = new Transaction(fromId, toId, amount, COMPLETED);
    return transactionRepo.save(tx);
}

If any step throws an exception, Spring rolls back the entire transaction. The debit and credit are always committed together or not at all.

The tricky part is locking order — always lock the account with the smaller ID first to prevent deadlocks when two concurrent transfers involve the same pair of accounts in opposite directions.`,
      },
      {
        q: 'How do you design the transaction history / audit trail?',
        a: `The transactions table is APPEND-ONLY — records are never updated or deleted. This is non-negotiable for financial systems (regulatory requirement).

Each row has:
- Unique transaction ID
- from_account_id, to_account_id
- amount, currency
- status (PENDING, COMPLETED, FAILED, REVERSED)
- idempotency_key (unique constraint — prevents duplicates at DB level too)
- created_at timestamp

The account balance is a derived value — it's the sum of all credits minus debits for that account. However, recomputing balance from transaction history every time is O(n). So we store a materialized balance in the accounts table and update it on each transaction.

For auditing: a separate audit_log table captures every state change across the system — who changed what, when, old value vs new value. This is written by the Audit Service which consumes Kafka events. The audit log is in a separate schema/database so even if the main DB has issues, audit records are safe.`,
      },
      {
        q: 'What happens if the server crashes AFTER debiting but BEFORE crediting?',
        a: `This is the most important question for financial systems.

The answer: within a single database transaction, this cannot happen. If the server crashes mid-transaction, MySQL automatically rolls back the incomplete transaction on recovery. ACID guarantees atomicity — either both the debit and credit commit, or neither does.

But what if we have two different databases (microservices)? Then we have a distributed transaction problem:
- Option 1: Saga Pattern with compensating transactions (same as e-commerce). If credit fails, a compensation event triggers a debit reversal.
- Option 2: Outbox Pattern — write the transaction intent to an outbox table in the same local transaction as the debit. A separate process reads the outbox and applies the credit. This guarantees at-least-once delivery of the credit operation.

In practice, for a monolith or single-database setup, @Transactional is sufficient and the crash scenario is handled by the database's WAL (Write-Ahead Log) and rollback mechanism. The distributed case requires more careful design.`,
      },
    ],
  },
}

export default projects
