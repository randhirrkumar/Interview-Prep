const systemDesign = {
  title: 'System Design',
  description: 'In-depth system design for senior Java developers — HLD & LLD, CAP theorem, consistent hashing, CQRS, event sourcing, rate limiting, URL shortener, notification service, and real-world design trade-offs.',
  tags: ['System Design', 'HLD', 'CAP Theorem', 'CQRS', 'Scalability', 'Consistent Hashing'],
  questions: [
    {
      id: 'sd_q1',
      question: 'How do you approach a system design interview question? Walk me through your framework.',
      difficulty: 'beginner',
      tags: ['System Design', 'Interview Framework'],
      answer: `A systematic approach separates senior candidates from juniors. I follow a 4-step framework.

Step 1: Clarify Requirements (5 minutes)
Never design without asking. Key questions:
- Scale: DAU (daily active users), requests per second, data volume
- Functional requirements: core features to design (don't design everything)
- Non-functional requirements: latency SLA, availability SLA, consistency vs availability trade-off
- Constraints: read-heavy vs write-heavy, data retention period, geographic distribution

Example for "Design a URL shortener":
- QPS: 1000 read/sec, 100 write/sec?
- URL expiration required?
- Custom short URLs?
- Analytics (click tracking) needed?

Step 2: Capacity Estimation (3 minutes)
Back-of-envelope math shows you think in terms of scale:
- Storage: 100 writes/sec × 500 bytes per URL × 86400 sec × 365 days × 5 years ≈ 8TB
- Read QPS: 100 writes × 10:1 read:write ratio = 1000 reads/sec — cache-able
- Peak: 3x average = 3000 reads/sec at peak

Step 3: High-Level Design (15 minutes)
Draw the main components:
- Client → Load Balancer → API Servers → Cache → Database
- Identify which services/components are needed
- Choose between monolith, microservices, or serverless based on scale
- Define APIs (REST endpoints, gRPC contracts)
- Choose databases based on data shape, query patterns, scale

Step 4: Deep Dive (15 minutes)
Pick 1–2 challenging components to go deep:
- How does the hash algorithm work for URL shortener?
- How do you scale reads? (Replication, caching)
- How do you handle failures? (Circuit breaker, retry, DLQ)
- Trade-offs you made and alternatives considered

Always close with: "If I had more time, I would also address..."

The interviewer evaluates: structured thinking, ability to make trade-offs, knowledge of distributed systems concepts, communication clarity. One deep well-designed component beats a shallow design of everything.`,
      followUp: {
        question: 'What is the difference between HLD (High-Level Design) and LLD (Low-Level Design)?',
        answer: `HLD defines the overall architecture — which services exist, how they communicate, which databases and queues are used, data flow, API contracts. It answers "what are the components and how do they fit together?" HLD diagrams show boxes (services, DBs, caches) connected by arrows. LLD defines the implementation within a component — class diagrams, database schema, API endpoint specifications, algorithm details, data structures. It answers "how does one specific component work internally?" In system design interviews, HLD is always required. LLD is discussed for the most interesting 1–2 components after the HLD is agreed upon. For a URL shortener: HLD shows API server → cache → database. LLD shows the hash algorithm, the URL table schema (id, short_code, original_url, user_id, expires_at, click_count), and the redirect logic.`
      }
    },
    {
      id: 'sd_q2',
      question: 'Design a URL Shortener system.',
      difficulty: 'intermediate',
      tags: ['System Design', 'URL Shortener', 'HLD'],
      answer: `Requirements clarification: 100 writes/sec, 10,000 reads/sec (100:1 read-heavy), URLs expire in 5 years, custom short codes optional, click analytics needed, 99.9% availability.

Capacity estimation:
- 100 writes/sec × 86400 × 365 × 5 = ~15B URLs over 5 years
- Average URL: 500 bytes → 15B × 500B = 7.5TB storage
- Short code: 7 alphanumeric chars → 62^7 ≈ 3.5 trillion unique codes (sufficient)
- Cache: 10,000 reads/sec, 20% of URLs are 80% of traffic → cache top 20% = 1.5TB × 0.2 = 300GB

API design:
- POST /urls { original_url, custom_code?, expires_in_days? } → { short_code, short_url }
- GET /{short_code} → HTTP 301 redirect to original_url
- GET /urls/{short_code}/stats → { clicks, unique_visitors, top_countries }

Short code generation strategies:
Option A: MD5/SHA256 hash of URL + user_id → take first 7 chars → collision risk, need retry
Option B: Counter-based with Base62 encoding — global counter (Snowflake ID or database sequence), encode to Base62. Deterministic, no collisions, but sequential codes reveal volume.
Option C: UUID + random → low collision probability, unpredictable (preferred for security)

I use Option B with distributed ID generation (Twitter Snowflake — 64-bit: timestamp + machine ID + sequence) then Base62 encode. Unique, sortable by creation time, no DB roundtrip for uniqueness check.

Database schema (PostgreSQL):
CREATE TABLE urls (
    id BIGINT PRIMARY KEY,              -- Snowflake ID
    short_code VARCHAR(10) UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    user_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_short_code ON urls(short_code);    -- main lookup index
CREATE INDEX idx_user_id ON urls(user_id);           -- for user's URL list

HLD architecture:
Client → CDN (cache redirects at edge) → Load Balancer → Shortener API Cluster → Redis Cache → PostgreSQL (primary-replica)

Click analytics: API server publishes click events to Kafka → ClickstreamConsumer writes to ClickHouse (columnar DB for analytics) → Analytics API reads from ClickHouse.

Read path (fast): short_code → Redis lookup (sub-millisecond) → if miss: DB query → cache for 1 hour → 301 redirect. 95%+ cache hit rate expected.

Cache eviction: LRU with TTL matching URL expiry. Expired URLs automatically evicted.`,
      followUp: {
        question: 'Why use HTTP 301 vs HTTP 302 for the redirect?',
        answer: `HTTP 301 (Permanent Redirect) — the browser caches this redirect permanently. On subsequent visits to the short URL, the browser redirects directly without contacting your server. This reduces load dramatically for popular URLs but means you cannot track clicks from cached redirects (the server never sees repeated visits). HTTP 302 (Temporary Redirect) — the browser always re-contacts your server for the redirect. Every click is traceable for analytics. Higher server load. If analytics/click tracking is important, use 302. If minimizing server load is the priority and click tracking can be approximated (or done via JavaScript after redirect), use 301. Many URL shorteners use 302 by default (analytics) and offer 301 as an option for power users who want edge-cached performance.`
      }
    },
    {
      id: 'sd_q3',
      question: 'Design a Notification Service that sends emails, SMS, and push notifications at scale.',
      difficulty: 'intermediate',
      tags: ['System Design', 'Notification Service', 'Event-Driven'],
      answer: `Requirements: 10 million notifications/day (email + SMS + push), sub-10-second delivery P99, at-least-once delivery, retry on failure, template-based notifications, unsubscribe/preference management.

Core components:

1. Notification API Service
POST /notifications {
  userId: "u123",
  type: "ORDER_SHIPPED",
  channels: ["email", "push"],   // or let preference service decide
  templateId: "order_shipped",
  templateData: { orderId: "ord456", trackingUrl: "..." }
}

2. User Preference Service — stores per-user channel preferences, unsubscribes, quiet hours. Called before dispatching to filter channels the user has opted out of.

3. Template Service — resolves templateId + templateData → rendered HTML email body, SMS text, push notification payload. Stores templates per language/locale.

4. Channel Workers — separate services per channel (EmailWorker, SMSWorker, PushWorker). Each consumes from its own Kafka topic.

Message flow:
Caller → Notification API → validate + fetch preferences + render template → publish to Kafka topics (notifications.email, notifications.sms, notifications.push) → Channel Workers consume → call 3rd party APIs (AWS SES for email, Twilio for SMS, Firebase FCM for push) → publish result to notifications.delivery-results

Retry handling:
- Kafka consumer with DLT (Dead Letter Topic) after 3 retries
- Exponential backoff per channel: 1min, 5min, 30min
- Idempotency key (notification ID) stored in Redis to prevent duplicate delivery on retry

Rate limiting per channel:
- Email: AWS SES has sending limits per second → use SQS with SQS-based rate limiting (maximum message visibility)
- SMS: Twilio rate limits per account → token bucket per Twilio account
- Push: FCM handles millions/sec natively

Database schema:
notifications(id, user_id, type, template_id, status, created_at, sent_at)
delivery_attempts(notification_id, channel, attempt_num, status, error, attempted_at)
user_preferences(user_id, channel, is_enabled, quiet_hours_start, quiet_hours_end)

Monitoring: notification queue depth per channel (alert if growing), delivery success rate per channel (alert if < 95%), P99 delivery latency per channel.`,
      followUp: {
        question: 'How do you handle the case where a user switches from one device to another and has multiple push tokens?',
        answer: `A user can have multiple push tokens — one per device (phone, tablet, secondary phone). Store all active tokens per user in a device_tokens table (user_id, token, platform, last_active_at). When sending push: fetch all tokens for the user and send to each. FCM and APNs return specific error codes when a token is invalid or stale (Unregistered, InvalidRegistration). Remove invalid tokens immediately on these error responses. Handle token rotation — mobile apps refresh push tokens periodically. The app should call your API to update the token; use upsert logic (user_id + device_id → update token). This prevents accumulation of stale tokens. For very active users, a user could have 2–5 valid tokens across devices — sending to all is correct for notifications like "your order shipped."`
      }
    },
    {
      id: 'sd_q4',
      question: 'What is the CAP theorem and how does it influence your database and architecture choices?',
      difficulty: 'intermediate',
      tags: ['System Design', 'CAP Theorem', 'Distributed Systems'],
      answer: `CAP theorem states that a distributed system can guarantee at most two of these three properties simultaneously:

Consistency (C) — every read receives the most recent write or an error. All nodes see the same data at the same time.

Availability (A) — every request receives a non-error response (though it may not contain the most recent write). The system always responds.

Partition Tolerance (P) — the system continues to operate even when network partitions occur (nodes cannot communicate with each other).

In reality, network partitions are not optional — they happen in any distributed system (cable cut, node crash, network congestion). Therefore the practical choice is between CP or AP during a partition.

CP systems (Consistency + Partition Tolerance): during a partition, the system refuses to serve requests rather than risk returning stale data. Example: HBase, Zookeeper, etcd, traditional RDBMS with synchronous replication.
- Use when: data correctness is critical and you cannot tolerate stale reads — financial transactions, inventory management, distributed locks.

AP systems (Availability + Partition Tolerance): during a partition, all nodes continue serving requests but may serve stale data. Nodes synchronize when the partition heals (eventual consistency). Example: DynamoDB, Cassandra, CouchDB, Elasticsearch.
- Use when: high availability and low latency matter more than perfect consistency — user profiles, product catalogs, shopping carts, social media feeds.

Practical application: in a microservices architecture, you often mix databases by domain. Orders service uses PostgreSQL (CP — you can't lose a payment record). Product catalog uses DynamoDB (AP — a slightly stale product name is acceptable). User sessions use Redis (AP — availability matters more than perfect consistency).

PACELC extends CAP: during normal operation (no partition), you still face a trade-off between Latency and Consistency — even without failures, achieving strong consistency requires coordination that adds latency.`,
      followUp: {
        question: 'What is eventual consistency and how do you handle it in application code?',
        answer: `Eventual consistency means that if no new updates are made, all replicas will eventually converge to the same value — but they may temporarily diverge. A user updates their profile on replica A; replica B still serves the old profile for a few hundred milliseconds. Application-level patterns for handling it: (1) Read-your-writes consistency — after a write, route the user's subsequent reads to the same node that accepted the write. DynamoDB supports this with ConsistentRead option. (2) Monotonic reads — ensure a user never reads a value older than one they've already seen. Use versioned responses and the client tracks the last seen version. (3) Accept the window — for many use cases, eventual consistency is fine. The user's profile update propagates in < 1 second; the user likely won't refresh immediately. (4) Compensating actions — in financial systems, use idempotency keys and compensating transactions rather than strong consistency, to maintain availability while detecting and correcting inconsistencies asynchronously.`
      }
    },
    {
      id: 'sd_q5',
      question: 'Explain CQRS and Event Sourcing. When would you apply them?',
      difficulty: 'advanced',
      tags: ['System Design', 'CQRS', 'Event Sourcing', 'Architecture'],
      answer: `CQRS (Command Query Responsibility Segregation) separates the write model (commands that change state) from the read model (queries that return data). Instead of one data model serving both reads and writes, you have dedicated models optimized for each.

Without CQRS: a single ORDER table serves both write operations (insert, update) and read operations (order list, order details, analytics). Optimization for one (normalization for writes) harms the other (joins for reads).

With CQRS:
- Command side: handles CreateOrder, UpdateOrderStatus, CancelOrder. Writes to the command DB (normalized RDBMS). Events are published when commands succeed.
- Query side: separate read model (denormalized views, possibly different DB — Elasticsearch, Redis, materialized views) updated by consuming the events. Read queries hit the optimized read model.

When to apply CQRS:
- Read and write workloads scale differently (10,000 reads/sec, 100 writes/sec) → scale them independently
- Complex domain logic on writes, complex projections for reads
- Multiple consumers needing different views of the same data

Event Sourcing — instead of storing the current state (one row per entity), store the full history of events that led to the current state. The current state is derived by replaying events.

Traditional: ORDER table has status="SHIPPED" — you know the current state but not the history.
Event Sourced: OrderCreated → PaymentReceived → InventoryReserved → OrderShipped — full audit trail, temporal queries ("what was the order state 3 days ago?"), event replay.

Event store implementation (append-only):

INSERT INTO order_events (order_id, event_type, event_data, occurred_at)
VALUES ('ord123', 'OrderShipped', '{"trackingId": "TRK001"}', NOW());

// Reconstitute current state
List<Event> events = eventStore.loadEvents("ord123");
Order order = events.stream().reduce(new Order(), Order::apply, (a, b) -> b);

When to apply Event Sourcing:
- Audit requirements (financial, compliance, healthcare) — every state change is recorded immutably
- Temporal queries — what was the order status at 2PM yesterday?
- Event-driven architecture where events are the primary integration mechanism
- Complex domain with many concurrent writers (events are more conflict-friendly than row locking)

CQRS + Event Sourcing often go together: commands produce events, query projectors consume events to update read models. But they're independent patterns — CQRS without Event Sourcing is common; Event Sourcing without CQRS is possible but unusual.`,
      followUp: {
        question: 'What is a projection in Event Sourcing and how do you rebuild it?',
        answer: `A projection is a read model built by consuming and processing events. Example: for an order management system, you might have projections for "all open orders" (fast list view), "customer order history" (sorted by date), and "revenue by product" (analytics). Each projection is a materialized view optimized for its query pattern. When you add a new projection or fix a bug in an existing one, you can rebuild it by replaying all events from the beginning of the event store — this is one of Event Sourcing's most powerful features. Rebuilding is offline initially (replay into a new projection table/index), then switch the read model over. No data is lost because the event store is the source of truth. This also means you can introduce new query requirements months after launch without having stored the right data — replay the existing events with a new projection logic.`
      }
    },
    {
      id: 'sd_q6',
      question: 'What is consistent hashing and how does it help scale distributed systems?',
      difficulty: 'advanced',
      tags: ['System Design', 'Consistent Hashing', 'Distributed Systems'],
      answer: `Consistent hashing is a distributed hashing technique that minimizes remapping of keys when nodes are added or removed. It's used in distributed caches (Redis Cluster, Memcached), distributed databases (Cassandra, DynamoDB), and load balancing.

The problem with modulo hashing:
With N = 3 servers, key → server = hash(key) % 3. Works fine until a server is added or removed — N changes to 4, and hash(key) % 4 redistributes almost every key to a different server. A cache populated over weeks is invalidated and all traffic hits the DB until it warms up again.

Consistent hashing solution:
Arrange a logical ring of hash space (0 to 2^32). Each server node is placed at one or more points on the ring (using hash of the server's ID). To find which server handles a key: hash(key) → position on ring → walk clockwise to find the nearest server node. Adding a server only affects keys that were previously handled by its clockwise successor — typically 1/N of keys. Removing a server only affects the keys it was handling, which transfer to its clockwise successor.

Virtual nodes (vnodes) — place each physical server at multiple positions on the ring (e.g., 150 virtual nodes per server). This distributes load more evenly when servers have different capacities, and when a node fails, its keys distribute to all remaining nodes rather than just one successor.

Java implementation sketch:

TreeMap<Integer, String> ring = new TreeMap<>();

// Add server
void addServer(String serverName) {
    for (int i = 0; i < VNODES_PER_SERVER; i++) {
        int hash = hash(serverName + "-" + i);
        ring.put(hash, serverName);
    }
}

// Find responsible server for a key
String getServer(String key) {
    int hash = hash(key);
    Map.Entry<Integer, String> entry = ring.ceilingEntry(hash);
    return entry != null ? entry.getValue() : ring.firstEntry().getValue();
}

Real-world usage: Redis Cluster uses hash slots (16,384 slots mapped to nodes) rather than consistent hashing, but the principle is similar. Cassandra uses consistent hashing with vnodes for token distribution. Spring Cloud LoadBalancer uses a round-robin strategy by default but can be configured with consistent hashing for session affinity (always route the same userId to the same server instance).`,
      followUp: {
        question: 'What is database sharding and how is consistent hashing related to it?',
        answer: `Sharding splits data across multiple database instances (shards) so each shard holds a subset of the data. Without sharding, a single database instance is the bottleneck — limited by one machine's storage, CPU, and IOPS. With sharding, you distribute both data and query load. Consistent hashing is one sharding strategy — hash(customer_id) → shard. Advantages: even data distribution, minimal redistribution when adding shards. Alternative: range-based sharding (customers A-M on shard 1, N-Z on shard 2) — enables range queries but risks hot spots if names aren't evenly distributed. Alternative: directory-based sharding (a lookup table maps customer_id → shard) — most flexible, supports arbitrary redistribution, but the lookup table is a single point of failure and adds a network hop. Cross-shard queries (a query that needs data from multiple shards) are expensive — must be executed against all shards and results merged in the application layer. Design schemas to minimize cross-shard queries by choosing a shard key that co-locates related data (shard by customer_id means all of a customer's orders are on the same shard).`
      }
    },
    {
      id: 'sd_q7',
      question: 'Design a Rate Limiter that can handle 10 million requests per day.',
      difficulty: 'advanced',
      tags: ['System Design', 'Rate Limiter', 'Redis', 'Algorithms'],
      answer: `Requirements: 10M requests/day ≈ 116 RPS average, peak 5x = 580 RPS. Rate limit per user: 1000 requests/minute. Enforce at the API gateway. Distributed (multiple gateway instances must share state).

Why rate limiting: prevent DDoS, API abuse, ensure fair usage among tenants, protect downstream services.

Algorithm comparison:

Fixed Window: count requests in a fixed time window per key. Simple, but allows 2x burst at window boundaries.

Sliding Window Log: store timestamps of all requests in a sorted set; remove old ones; count current window. Accurate, but O(1) memory per request is O(requests_per_window) per user.

Sliding Window Counter: approximate sliding window by weighting the current and previous window counts by their time overlap. More memory-efficient, accurate within ~0.1%.

Token Bucket: tokens fill at a constant rate up to a maximum. Each request consumes one token. Allows natural bursting up to bucket capacity. Most intuitive for "requests per second with burst."

Leaky Bucket: requests fill a queue (bucket); the queue processes at a fixed rate. Smooth output rate. Less suited for bursty legitimate traffic.

I implement Sliding Window Counter with Redis:

Redis keys: ratelimit:{userId}:{current_window_start}
TTL: 2 × window size

// Lua script for atomic sliding window check
String lua = """
    local current_key = KEYS[1]
    local prev_key = KEYS[2]
    local current_count = tonumber(redis.call('GET', current_key) or 0)
    local prev_count = tonumber(redis.call('GET', prev_key) or 0)
    local elapsed_fraction = tonumber(ARGV[1])
    local limit = tonumber(ARGV[2])
    local sliding_count = current_count + prev_count * (1 - elapsed_fraction)
    if sliding_count >= limit then
        return -1
    end
    redis.call('INCR', current_key)
    redis.call('EXPIRE', current_key, ARGV[3])
    return limit - math.floor(sliding_count) - 1  -- remaining
    """;

API Gateway integration:

@Component
public class RateLimitFilter implements GlobalFilter {
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String userId = extractUserId(exchange);
        return rateLimiter.isAllowed(userId, 1000, Duration.ofMinutes(1))
            .flatMap(allowed -> {
                if (!allowed) {
                    exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                    exchange.getResponse().getHeaders().add("Retry-After", "60");
                    return exchange.getResponse().setComplete();
                }
                return chain.filter(exchange);
            });
    }
}

Monitoring: expose rate limit hit count as a Prometheus metric (ratelimit_exceeded_total by userId/service). Alert when a specific user consistently hits the limit — potential abuse or a bug in their integration.`,
      followUp: {
        question: 'How would you implement different rate limits for different user tiers?',
        answer: `Store tier information in JWT claims or in a user profile cache. The rate limit key includes the tier identifier, or the limit parameter is looked up by tier: FREE → 100 req/min, PRO → 1000 req/min, ENTERPRISE → 10000 req/min. In Spring Cloud Gateway, define separate rate limiter beans per tier or use a KeyResolver that returns a compound key (userId + tier) and a custom RateLimiterPolicy that looks up the limit for the resolved key. For very large enterprise clients, whitelist them from rate limiting entirely (their contracts and pricing justify it). Track per-tier rate limit hit rates in Prometheus to understand if limits are too restrictive (causing customer complaints) or too permissive (allowing abuse).`
      }
    },
    {
      id: 'sd_q8',
      question: 'How do you design for high availability and disaster recovery?',
      difficulty: 'advanced',
      tags: ['System Design', 'High Availability', 'Disaster Recovery'],
      answer: `High Availability (HA) means the system remains operational during component failures. Disaster Recovery (DR) means the system can be restored after a catastrophic failure (data center loss, region outage).

HA patterns:

Redundancy — no single points of failure. Every component runs with N+1 or 2N instances:
- Multiple application instances behind a load balancer
- Database primary-replica (synchronous replication for zero RPO)
- Multi-AZ deployments (instances spread across availability zones — physically separate data centers in the same region)

Health checks and automatic failover:
- Load balancer health checks remove unhealthy instances from rotation in < 10 seconds
- RDS Multi-AZ automatic failover in ~60 seconds
- Kubernetes pod restart on liveness probe failure in < 30 seconds

Graceful degradation — when a dependency fails, serve reduced functionality rather than complete failure:
- If recommendation service is down, show generic "popular items" instead of personalized recommendations
- If payment gateway is slow, queue the payment and confirm asynchronously
- Circuit breaker prevents cascade failures

DR patterns:

RPO (Recovery Point Objective) — maximum acceptable data loss in time. RPO=0 means no data loss; RPO=1hr means you can tolerate losing up to 1 hour of data.

RTO (Recovery Time Objective) — maximum acceptable downtime. RTO=30min means the system must be operational within 30 minutes of a disaster.

DR strategies (by cost vs RTO/RPO):
1. Backup and Restore (cheapest): daily backups to another region. RTO: hours. RPO: hours. For dev/test environments.
2. Pilot Light: minimal infrastructure running in DR region (database replication active, no application servers). On disaster: start application servers. RTO: 30–60 minutes.
3. Warm Standby: reduced-scale replica in DR region actively handling traffic. On disaster: scale up. RTO: minutes.
4. Multi-Region Active-Active (most expensive): full traffic in both regions simultaneously. On disaster: remove failed region from DNS/load balancer. RTO: near-zero. RPO: near-zero.

For a typical enterprise Spring Boot application: Multi-AZ Active-Active within one region (covers AZ failures, most common), plus RDS cross-region read replica promoted manually for region-level disasters. This gives RTO=1hr, RPO=minutes for region-level events at a fraction of full Active-Active cost.`,
      followUp: {
        question: 'What is a chaos engineering approach to testing HA?',
        answer: `Chaos engineering deliberately introduces failures into a production (or production-like) system to test its resilience and verify that HA mechanisms actually work. Netflix pioneered this with Chaos Monkey, which randomly terminates production instances. Tools: Chaos Monkey, Gremlin, Chaos Toolkit, AWS Fault Injection Simulator. Examples of chaos experiments for a Spring Boot microservice: terminate a random pod during business hours — does the load balancer route away within 30 seconds? Inject 500ms latency into calls to the database — does the circuit breaker open? Terminate the Redis instance — does the application fall back to the database gracefully? Block network traffic to one AZ — does the multi-AZ load balancer route away from the affected AZ? The key principle: start small in non-production, define a hypothesis and expected steady state, measure the blast radius, and run experiments during business hours when engineers can respond. Chaos engineering reveals gaps in monitoring, alerting, and HA configuration before a real incident does.`
      }
    },
    {
      id: 'sd_q9',
      question: 'Design a real-time chat system like WhatsApp for 50 million daily active users.',
      difficulty: 'advanced',
      tags: ['System Design', 'Chat System', 'WebSocket', 'Scalability'],
      answer: `Requirements: 50M DAU, 100 messages/user/day = 5B messages/day ≈ 60K messages/second, message delivery < 100ms, 1:1 and group chats (max 256 members), message history, online/offline status.

Capacity:
- Messages: 60K msg/sec, each 1KB → 60MB/sec → ~5TB/day
- Storage: 5TB/day × 365 × 3 years = ~5PB (use tiered storage: hot for 90 days, cold after)
- Active connections: 50M DAU × 0.3 concurrent fraction = 15M WebSocket connections

Architecture:

Connection Layer (Chat Servers):
- Each client maintains a persistent WebSocket connection to one chat server
- 15M connections ÷ 20K connections/server = 750 chat servers
- Challenge: if sender's chat server is different from receiver's, how does the message cross?

Message routing via Pub/Sub (Redis):
- Each user subscribes to their personal channel: user:{userId}
- Sender → Chat Server A → publishes to Redis channel "user:{recipientId}"
- Recipient's Chat Server B is subscribed to "user:{recipientId}" → delivers over WebSocket

Message persistence:
- Chat Server → Kafka (message ingestion topic) → Message Storage Service → Cassandra
- Cassandra schema optimized for chat: partition key = (chat_id), clustering key = (created_at DESC, message_id)
- Enables fast fetch of last N messages per chat

Offline message delivery:
- If recipient is offline (no WebSocket connection), message is stored in Cassandra
- On reconnection: client sends last_seen_timestamp; server fetches missed messages from Cassandra

Group chats:
- Fan-out: when a message is sent to a group, the Chat Server fetches all member IDs from the Group Service and publishes to each member's Redis channel
- For large groups (1000+ members), fan-out at write time is expensive → hybrid: publish once to group channel; members pull when they come online

Online/offline status:
- Each Chat Server maintains a heartbeat map: {userId → lastSeen}
- Status stored in Redis with 60s TTL: SET user:{userId}:online 1 EX 60
- Client sends heartbeat every 30s to refresh

User Service → Group Service → Message Service → Notification Service (for push when offline)

Database choices:
- User/Group metadata: PostgreSQL (relational, ACID)
- Messages: Cassandra (wide-column, append-only, time-series, scales to PB)
- Sessions/routing state: Redis (in-memory, ephemeral)
- Message search: Elasticsearch (full-text search of message history)`,
      followUp: {
        question: 'How do you handle message ordering and exactly-once delivery in a distributed chat system?',
        answer: `Message ordering: within a 1:1 chat, both users should see messages in the same order. Assign a monotonically increasing sequence number per chat_id from a distributed counter (Redis INCR or a dedicated sequence service). Clients display messages sorted by sequence number, not arrival time — this handles out-of-order delivery due to network reordering. For group chats, total ordering is expensive — use vector clocks or accept causal ordering (a reply appears after the message it replies to, but concurrent messages may appear in different order to different users). Exactly-once delivery: true exactly-once is very expensive in distributed systems. Instead, implement at-least-once delivery with client-side deduplication. Each message has a unique client-generated message_id (UUID). The server and client both track received message IDs in a short-lived window. On duplicate detection (same message_id received twice), silently drop the duplicate. This gives effectively-exactly-once behavior at much lower cost.`
      }
    },
    {
      id: 'sd_q10',
      question: 'What are the key non-functional requirements and how do you address them in architecture?',
      difficulty: 'intermediate',
      tags: ['System Design', 'NFR', 'Architecture'],
      answer: `Non-functional requirements (NFRs) define quality attributes — they describe HOW the system works, not WHAT it does. They often drive architectural decisions more than functional requirements.

Scalability — the ability to handle growing load.
Horizontal scaling (add more instances) is preferred over vertical (bigger instances) — use stateless services, externalize state to Redis/DB. Design for a 10x growth: if 100 RPS today, architect for 1000 RPS without redesign.

Performance — latency and throughput SLAs.
Define P50/P99 targets: "95% of requests < 200ms, 99.9% < 1s." Achieve via: caching (L1 in-process Caffeine, L2 Redis), database indexing, async processing for non-critical operations, CDN for static content.

Availability — uptime SLA.
99.9% = 8.7 hours downtime/year, 99.99% = 52 minutes/year, 99.999% = 5 minutes/year. Cost increases dramatically with each 9. Achieve via: redundancy (multi-AZ), circuit breakers, graceful degradation, chaos testing.

Consistency — agreement on data across nodes.
Choose based on business requirements: financial transactions demand strong consistency (CP systems). User preferences can tolerate eventual consistency (AP systems). Explicitly document consistency guarantees per API endpoint.

Security — authentication, authorization, data protection.
TLS everywhere, JWT for stateless auth, OAuth2 for delegated access, RBAC for authorization, data encryption at rest (AWS KMS), secrets management (Vault, Secrets Manager), audit logging for compliance.

Maintainability — ease of change, debugging, and operation.
Structured logging with correlation IDs, distributed tracing, health checks, runbooks for common incidents, CI/CD for safe deployments, feature flags for controlled rollouts.

Observability — ability to understand internal state from external signals.
Logs + Metrics + Traces (the three pillars). Alert on SLO breaches, not raw metrics. Dashboards per service for oncall.

In a system design interview, proactively address the 3–4 NFRs most critical for the system you're designing. For a payment system: consistency and security are paramount. For a social media feed: performance and eventual consistency are the trade-offs. Showing awareness of NFRs and making explicit trade-offs distinguishes a senior-level answer.`,
      followUp: {
        question: 'How do you estimate system capacity and what formulas do you use?',
        answer: `Back-of-envelope estimation follows a consistent process. Step 1: establish the scale — DAU (daily active users), requests per user per day. Step 2: compute RPS — (DAU × requests/user) / 86400 seconds/day. Apply a peak multiplier (typically 2–5x average). Step 3: storage — new data per second × retention period. Step 4: bandwidth — requests/sec × average request/response size. Common constants to memorize: 1KB = 10^3 bytes, 1MB = 10^6, 1GB = 10^9, 1TB = 10^12. 86,400 seconds/day. 2.5 million seconds/month. Average web request ~1-10KB. Image ~1MB. Video ~5MB/minute. Memory read: 100ns. SSD read: 100μs. Network round trip within datacenter: 500μs. Disk seek: 10ms. These numbers help you identify where bottlenecks will be — if a component needs 10ms and your SLA is 200ms, you have a 20× margin; if it needs 100ms, that's your critical path.`
      }
    },
  ],
}

export default systemDesign
