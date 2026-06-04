const redis = {
  title: 'Redis & Caching',
  description: 'Distributed caching, Redis data structures, Spring Cache abstraction, eviction strategies, and real-world caching patterns for senior Java developers.',
  tags: ['Redis', 'Caching', 'Spring Cache', 'Distributed Cache', 'Performance'],
  questions: [
    {
      id: 'redis_q1',
      question: 'What is Redis and why do we use it in enterprise Java applications?',
      difficulty: 'beginner',
      tags: ['Redis', 'Caching'],
      answer: `Redis is an in-memory data structure store that works as a database, cache, and message broker. In enterprise Java applications we use it for three primary reasons.

First, performance — reading from Redis is microseconds compared to milliseconds from a relational database. For frequently read, rarely changed data like product catalogs, configuration, or session tokens, caching in Redis removes repetitive database hits.

Second, scalability — when multiple application instances run behind a load balancer, local JVM cache (like Ehcache in heap) creates cache inconsistency because instance A's cache is not visible to instance B. Redis acts as a shared external cache that all instances read from and write to.

Third, atomic operations — Redis is single-threaded for command execution, so operations like INCR, SETNX, and GETSET are atomic without needing application-level locks. This makes it ideal for rate limiting, distributed counters, and distributed locking.

We keep Redis close in architecture: same VPC, low-latency network, so the network hop stays under 1ms.`,
      followUp: {
        question: 'What is the difference between Redis as a cache and Redis as a primary database?',
        answer: `When used as a cache, Redis holds a copy of data that lives authoritatively in the primary database. If Redis goes down, you fall back to the database — no data is lost. Data can be evicted when memory fills up.

When used as a primary database (Redis as DB), Redis is the source of truth. You configure AOF (Append Only File) or RDB snapshots for persistence so data survives restarts. Eviction must be disabled or carefully configured because evicting authoritative data causes data loss.

In most Spring Boot microservices, Redis is the cache layer, not the primary store.`
      }
    },
    {
      id: 'redis_q2',
      question: 'Explain the core Redis data structures and give a practical use case for each.',
      difficulty: 'intermediate',
      tags: ['Redis', 'Data Structures'],
      answer: `Redis provides five primary data structures, each purpose-built for different access patterns.

String is the simplest — a key maps to a single value (text, integer, or binary). Use case: caching a serialized JSON object of a product, or storing a session token with TTL.

Hash is a key that maps to a field-value map. Use case: storing a user profile where each field (name, email, role) is a separate hash field — you can fetch individual fields without deserializing the whole object.

List is an ordered linked list of strings. Use case: activity feed or job queue — LPUSH adds to head, RPOP removes from tail for FIFO queue behavior.

Set is an unordered collection of unique strings. Use case: tracking unique visitors per day — SADD userId to a key like visitors:2024-01-15 and SCARD gives count without duplicates.

Sorted Set (ZSet) is like Set but each member has a score, and members are ordered by score. Use case: leaderboard — ZADD leaderboard score userId, then ZRANGE leaderboard 0 9 REV WITHSCORES gives top 10.

Choosing the right structure avoids application-side aggregation and keeps operations O(1) or O(log N).`,
      followUp: {
        question: 'When would you use a Redis Sorted Set over a List for a queue?',
        answer: `For a priority queue where tasks have different urgency levels. In a List-based queue, RPOP always returns the oldest item — there is no priority ordering. In a Sorted Set, you use the score as priority and always ZPOPMIN to get the highest-priority (lowest score) item. This is how delayed job schedulers work — score is the Unix timestamp when the job should run, and a worker polls ZRANGEBYSCORE queue 0 <now> to find ready tasks.`
      }
    },
    {
      id: 'redis_q3',
      question: 'What is the cache-aside pattern and how do you implement it in Spring Boot?',
      difficulty: 'intermediate',
      tags: ['Caching', 'Spring Cache', 'Cache-aside'],
      answer: `Cache-aside (also called lazy loading) is the most common caching pattern. The application manages the cache explicitly — on a read, it first checks the cache; on a miss it reads from the database, writes the value to cache, then returns it.

The flow: Check cache → miss → read DB → write to cache → return data. On subsequent reads, the cache hit short-circuits the DB call.

Spring Boot implements this with @Cacheable on service methods:

@Service
public class ProductService {

    @Cacheable(value = "products", key = "#productId", unless = "#result == null")
    public Product getProduct(Long productId) {
        return productRepository.findById(productId).orElse(null);
    }

    @CacheEvict(value = "products", key = "#product.id")
    public Product updateProduct(Product product) {
        return productRepository.save(product);
    }

    @CachePut(value = "products", key = "#product.id")
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }
}

@Cacheable — return cached value if present, else execute method and cache result.
@CacheEvict — remove from cache on write/delete to prevent stale reads.
@CachePut — always executes method and updates the cache (used after create/update).

The spring.cache.type=redis in application.properties with RedisConnectionFactory configured in the auto-configuration wires Redis as the cache store automatically.`,
      followUp: {
        question: 'What is the difference between cache-aside and write-through caching?',
        answer: `In cache-aside, the application manages cache and database separately. On a write, you typically evict the cache and let the next read repopulate it — this avoids stale data at the cost of one cache miss after every update.

In write-through, every write goes to both cache and database atomically (or near-atomically). The cache is always in sync — no stale data. But every write has double latency (cache + DB), and you pay cache memory for data that might never be read.

Write-through suits read-heavy workloads where consistency is critical. Cache-aside suits read-heavy workloads where a brief stale window is acceptable after writes.`
      }
    },
    {
      id: 'redis_q4',
      question: 'What are TTL and eviction policies in Redis? Which ones have you used and why?',
      difficulty: 'intermediate',
      tags: ['Redis', 'TTL', 'Eviction'],
      answer: `TTL (Time To Live) is a per-key expiry. When a key's TTL expires, Redis deletes it on access (lazy expiry) or in background sweeps (active expiry). You set it with EXPIRE key seconds or at creation with SET key value EX seconds.

In our product catalog cache, we set a 30-minute TTL because product data changes infrequently but we want eventual consistency without manual eviction on every update.

Eviction policy kicks in when Redis runs out of memory and needs to free space. The main policies are:

noeviction — reject new writes when memory is full. Good when Redis is a primary store and data loss is unacceptable.

allkeys-lru — evict the Least Recently Used key from all keys. Most common choice for caches — keeps hot data, drops cold.

volatile-lru — evict LRU only among keys with a TTL set. Safe when you mix cached data (with TTL) and persistent data (without TTL) in the same Redis instance.

allkeys-lfu — Least Frequently Used. Better than LRU when access patterns have strong frequency skew (some keys accessed millions of times, most rarely).

allkeys-random — random eviction. Rarely used.

In most microservice setups I use volatile-lru with TTLs on all cached keys, which gives natural expiry plus graceful degradation under memory pressure.`,
      followUp: {
        question: 'How do you handle cache stampede when TTL expires on a heavily-accessed key?',
        answer: `Cache stampede (or thundering herd) happens when a popular key expires and simultaneously thousands of requests all miss cache, all hit the database, and all try to repopulate the cache. This can overwhelm the database.

Solutions:
1. Mutex lock — the first thread acquires a distributed lock (SETNX), fetches from DB, writes to cache, releases lock. Other threads wait and then get the cache hit. Spring's @Cacheable does NOT do this natively — you need a custom CacheManager.
2. Probabilistic early expiration — before the TTL actually expires, occasionally recompute the value based on remaining TTL and expected computation time. Redis has no built-in support; it's implemented in application code.
3. Stale-while-revalidate — serve the stale cached value immediately while refreshing asynchronously in the background using a scheduled job or @Scheduled with @CachePut.

I've used approach 3 most often — a @Scheduled method refreshes critical caches every 20 minutes, keeping TTL at 30 minutes so the cache never actually expires under normal operation.`
      }
    },
    {
      id: 'redis_q5',
      question: 'How do you implement distributed locking with Redis in a Spring Boot microservice?',
      difficulty: 'advanced',
      tags: ['Redis', 'Distributed Lock', 'Concurrency'],
      answer: `Distributed locking prevents race conditions when multiple service instances process the same resource simultaneously — for example, preventing double-processing of a payment.

The basic Redis lock uses SET key value NX PX ttl — SET only if Not eXists, with expiry in milliseconds. The value must be a unique token (UUID) per lock holder.

@Service
public class DistributedLockService {

    private final StringRedisTemplate redisTemplate;

    public boolean tryLock(String lockKey, String lockValue, long ttlMs) {
        Boolean acquired = redisTemplate.opsForValue()
            .setIfAbsent(lockKey, lockValue, Duration.ofMillis(ttlMs));
        return Boolean.TRUE.equals(acquired);
    }

    public void unlock(String lockKey, String lockValue) {
        // Lua script ensures we only delete our own lock (atomic check-and-delete)
        String luaScript = """
            if redis.call('get', KEYS[1]) == ARGV[1] then
                return redis.call('del', KEYS[1])
            else
                return 0
            end
            """;
        redisTemplate.execute(
            new DefaultRedisScript<>(luaScript, Long.class),
            List.of(lockKey), lockValue
        );
    }
}

// Usage in a service
public void processPayment(String paymentId) {
    String lockKey = "lock:payment:" + paymentId;
    String lockValue = UUID.randomUUID().toString();
    if (!lockService.tryLock(lockKey, lockValue, 5000)) {
        throw new ConflictException("Payment already being processed");
    }
    try {
        // critical section
    } finally {
        lockService.unlock(lockKey, lockValue);
    }
}

The Lua script for unlock is critical — it ensures you only release a lock you own. Without it, a timed-out lock could be released by a different process that re-acquired it, breaking mutual exclusion.

For production, use Redisson which implements the Redlock algorithm for multi-node Redis setups — a single Redis node is a single point of failure.`,
      followUp: {
        question: 'What are the risks of using distributed locks?',
        answer: `Three main risks. First, clock skew between nodes — Redlock requires that Redis node clocks are roughly synchronized; large skew can cause two clients to believe they hold the lock simultaneously. Second, GC pauses — a Java process paused by GC for longer than the lock TTL will believe it holds the lock but the TTL has already expired, allowing another process to acquire it. This is why the Lua unlock script checking the value before deleting is essential. Third, network partitions — if the lock holder can't reach Redis to extend the TTL, the lock expires even though the holder is still in the critical section. Martin Kleppmann wrote a detailed critique of Redlock arguing it is not safe under all failure scenarios. For truly critical operations, use a proper consensus system like ZooKeeper or etcd.`
      }
    },
    {
      id: 'redis_q6',
      question: 'How does Spring Boot configure Redis caching, and how do you set up multiple cache regions with different TTLs?',
      difficulty: 'intermediate',
      tags: ['Spring Cache', 'Redis', 'Configuration'],
      answer: `Spring Boot auto-configures Redis caching when spring-boot-starter-data-redis is on the classpath and spring.cache.type=redis is set. But the auto-configuration applies one global TTL — for different TTLs per cache region you need a custom RedisCacheManager.

// application.yml
spring:
  cache:
    type: redis
  data:
    redis:
      host: localhost
      port: 6379

// Custom CacheManager with per-cache TTL
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration
            .defaultCacheConfig()
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair
                    .fromSerializer(new GenericJackson2JsonRedisSerializer())
            )
            .entryTtl(Duration.ofMinutes(10));

        Map<String, RedisCacheConfiguration> cacheConfigs = Map.of(
            "products",    defaultConfig.entryTtl(Duration.ofMinutes(30)),
            "userSessions",defaultConfig.entryTtl(Duration.ofMinutes(60)),
            "rateLimits",  defaultConfig.entryTtl(Duration.ofSeconds(60))
        );

        return RedisCacheManager.builder(factory)
            .cacheDefaults(defaultConfig)
            .withInitialCacheConfigurations(cacheConfigs)
            .build();
    }
}

GenericJackson2JsonRedisSerializer stores values as JSON so they are human-readable in Redis CLI and survive application restarts without deserialization issues that JdkSerializationRedisSerializer causes when class versions change.`,
      followUp: {
        question: 'How do you handle cache key collisions when multiple services share the same Redis instance?',
        answer: `Use a key prefix per service or per cache region. RedisCacheConfiguration.computePrefixWith() lets you define the prefix format. I use the pattern serviceName:cacheName:key — for example, inventory-service:products:12345. This ensures the product ID 12345 in the inventory service never collides with product ID 12345 in the pricing service. Alternatively, use separate Redis logical databases (SELECT 0–15) per service, though that limits cross-service pub/sub. For large deployments, separate Redis instances per service namespace is cleanest — more infrastructure overhead but total isolation.`
      }
    },
    {
      id: 'redis_q7',
      question: 'Explain Redis Pub/Sub and how it differs from Kafka for event-driven communication.',
      difficulty: 'intermediate',
      tags: ['Redis', 'Pub/Sub', 'Messaging'],
      answer: `Redis Pub/Sub is a fire-and-forget messaging system. Publishers send messages to a channel; all current subscribers receive them. There is no persistence — if a subscriber is offline when a message is published, it misses that message permanently. There is no consumer group concept, no offset tracking, no replay.

In Spring Boot, you use RedisMessageListenerContainer:

@Configuration
public class RedisPubSubConfig {

    @Bean
    public RedisMessageListenerContainer container(
            RedisConnectionFactory factory,
            MessageListenerAdapter listenerAdapter) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(factory);
        container.addMessageListener(listenerAdapter, new PatternTopic("notifications:*"));
        return container;
    }

    @Bean
    public MessageListenerAdapter listenerAdapter(NotificationListener listener) {
        return new MessageListenerAdapter(listener, "handleMessage");
    }
}

// Publishing
redisTemplate.convertAndSend("notifications:user:123", "Your order shipped");

Kafka vs Redis Pub/Sub:
- Kafka persists messages for a configurable retention period (days/weeks). Missed messages can be replayed. Redis Pub/Sub has zero persistence.
- Kafka scales to millions of messages per second with consumer groups balancing load. Redis Pub/Sub broadcasts to all subscribers — no load balancing.
- Kafka guarantees at-least-once or exactly-once delivery. Redis Pub/Sub is best-effort.
- Kafka is for durable event streaming. Redis Pub/Sub is for real-time ephemeral notifications (cache invalidation broadcasts, presence updates, live dashboards).

I use Redis Pub/Sub for cache invalidation across service instances — when one instance updates a product, it publishes to products:invalidate, and all other instances evict that key from their local L1 cache.`,
      followUp: {
        question: 'What is Redis Streams and how is it different from Pub/Sub?',
        answer: `Redis Streams (introduced in Redis 5) is an append-only log structure — much closer to Kafka. Messages persist in the stream until explicitly deleted. Consumers use consumer groups with offsets, so a message is delivered to exactly one consumer in a group. Unacknowledged messages can be reclaimed. This makes Streams suitable for reliable task queues and event logs where delivery guarantees matter, while Pub/Sub remains appropriate for ephemeral broadcast notifications.`
      }
    },
    {
      id: 'redis_q8',
      question: 'What is Redis Cluster and how does it differ from Redis Sentinel?',
      difficulty: 'advanced',
      tags: ['Redis', 'Cluster', 'High Availability'],
      answer: `Redis Sentinel provides high availability for a single Redis master through automatic failover. Sentinels monitor the master; if it goes down, a replica is promoted. The cluster continues serving requests. Sentinel does NOT add horizontal write scalability — all writes go to one master.

Redis Cluster provides both high availability and horizontal scalability. Data is sharded across 16,384 hash slots distributed among multiple master nodes (minimum 3 masters recommended). Each master has replicas for failover. You can add nodes to scale write throughput.

Key differences:
- Sentinel: one master, multiple replicas, automatic failover. Simple setup.
- Cluster: multiple masters, each owning a slot range, each with replicas. Complex setup but scales writes horizontally.

Spring Boot Lettuce client (the default) supports both:

# Sentinel
spring.data.redis.sentinel.master=mymaster
spring.data.redis.sentinel.nodes=host1:26379,host2:26379

# Cluster
spring.data.redis.cluster.nodes=host1:7000,host2:7001,host3:7002

Cluster limitation: multi-key operations (MGET, pipeline, transactions) only work on keys that hash to the same slot. You force keys to the same slot using hash tags: {user:123}:profile and {user:123}:orders both go to the slot determined by user:123.

For most enterprise Spring Boot applications, Sentinel is sufficient. Cluster is needed when a single master's throughput (around 100k ops/sec) becomes the bottleneck.`,
      followUp: {
        question: 'How do you handle Redis connection failures gracefully in a Spring Boot application?',
        answer: `Configure a circuit breaker around Redis operations. If Redis is down, cache operations should degrade gracefully — fall through to the database — rather than throwing exceptions that propagate to the user. Spring Cache's @Cacheable by design falls back to the method execution if the cache throws an exception, but only if you configure the CacheErrorHandler. Implement a LoggingCacheErrorHandler that logs the error and returns null for gets (triggering method execution) and silently ignores put/evict failures. Also configure connection pool limits and timeouts so a Redis outage causes fast failures rather than thread pool exhaustion waiting for connections.`
      }
    },
    {
      id: 'redis_q9',
      question: 'How would you implement a rate limiter using Redis?',
      difficulty: 'advanced',
      tags: ['Redis', 'Rate Limiting', 'System Design'],
      answer: `A rate limiter prevents abuse by restricting how many requests a client can make in a time window. Redis is ideal because it provides atomic operations and fast expiry.

Two common algorithms:

Fixed Window Counter — count requests per time window using INCR and EXPIRE:

public boolean isAllowed(String userId, int limitPerMinute) {
    String key = "ratelimit:" + userId + ":" + (System.currentTimeMillis() / 60000);
    Long count = redisTemplate.opsForValue().increment(key);
    if (count == 1) {
        redisTemplate.expire(key, Duration.ofMinutes(1));
    }
    return count <= limitPerMinute;
}

Downside: allows burst at window boundaries — a client can make 100 requests at 0:59 and 100 more at 1:01, effectively 200 in 2 seconds.

Sliding Window Log — store request timestamps in a Sorted Set, score = timestamp:

public boolean isAllowed(String userId, int limit, long windowMs) {
    String key = "ratelimit:sliding:" + userId;
    long now = System.currentTimeMillis();
    long windowStart = now - windowMs;

    // Lua script for atomicity
    String lua = """
        redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, ARGV[1])
        local count = redis.call('ZCARD', KEYS[1])
        if count < tonumber(ARGV[3]) then
            redis.call('ZADD', KEYS[1], ARGV[2], ARGV[2])
            redis.call('PEXPIRE', KEYS[1], ARGV[4])
            return 1
        end
        return 0
        """;
    Long result = redisTemplate.execute(
        new DefaultRedisScript<>(lua, Long.class),
        List.of(key),
        String.valueOf(windowStart), String.valueOf(now),
        String.valueOf(limit), String.valueOf(windowMs)
    );
    return Long.valueOf(1).equals(result);
}

The Lua script makes the check-and-increment atomic, preventing race conditions. This gives a true sliding window — no boundary burst — at the cost of O(log N) per request and memory proportional to request count.

For production, Bucket4j with Redis backend or Spring Cloud Gateway's built-in RequestRateLimiter filter (backed by Redis) are production-grade solutions.`,
      followUp: {
        question: 'What is the token bucket algorithm and how is it different from fixed window?',
        answer: `Token bucket models a bucket that refills at a constant rate (e.g., 10 tokens per second, max 100). Each request consumes one token. If the bucket is empty, the request is rejected or queued. This allows bursts up to the bucket capacity while enforcing a long-term average rate. Fixed window simply counts requests in a time period with no burst concept. Token bucket is more natural for APIs where occasional bursts are acceptable — a user uploading 5 images at once should be allowed if they haven't made requests recently. Bucket4j is the standard Java library implementing token bucket with Redis as the distributed state store.`
      }
    },
    {
      id: 'redis_q10',
      question: 'What is the difference between @Cacheable, @CacheEvict, and @CachePut in Spring?',
      difficulty: 'beginner',
      tags: ['Spring Cache', 'Annotations'],
      answer: `These three annotations form the Spring Cache abstraction for declarative caching.

@Cacheable — checks the cache before executing the method. If a value exists for the computed key, it returns it without calling the method. If not, executes the method and stores the result in the cache. Use for read operations.

@CacheEvict — removes an entry from the cache. Call it on update and delete operations so stale data doesn't serve from cache. The allEntries=true attribute removes all keys in the cache region, useful when a bulk operation changes many records.

@CachePut — always executes the method and writes the result to cache. Never bypasses the method. Use after create/update operations when you want the cache to reflect the new value immediately rather than waiting for the next read to repopulate it.

@Caching — groups multiple cache operations on a single method (e.g., evict from one cache and put into another after an update).

Key difference between @Cacheable and @CachePut: @Cacheable may skip method execution (cache hit). @CachePut always executes. Using @CachePut on a read method makes no sense — you'd pay the DB cost every time and never get a cache hit. @Cacheable on a write method is dangerous — you might return stale cached data without actually writing.

The unless attribute on @Cacheable (unless = "#result == null") prevents caching null results, avoiding negative caching of records that don't exist.`,
      followUp: {
        question: 'How do you conditionally cache based on method arguments or results?',
        answer: `Use SpEL expressions in condition and unless attributes. condition is evaluated before the method executes (based on arguments); unless is evaluated after (based on result). For example, @Cacheable(value="products", key="#id", condition="#id > 0", unless="#result?.discontinued == true") caches only positive IDs and never caches discontinued products. The key attribute supports full SpEL — you can build composite keys like key="#userId + ':' + #productId" or reference method names with key="#root.methodName + #id".`
      }
    },
    {
      id: 'redis_q11',
      question: 'How would you use Redis for session management in a Spring Boot stateless microservice?',
      difficulty: 'intermediate',
      tags: ['Redis', 'Session', 'Spring Session'],
      answer: `Spring Session with Redis provides distributed session management so multiple application instances share session state. Without it, a load-balanced request hitting a different instance loses the session.

Add spring-session-data-redis dependency and configure:

# application.yml
spring:
  session:
    store-type: redis
    timeout: 30m
  data:
    redis:
      host: redis-host
      port: 6379

@Configuration
@EnableRedisHttpSession(maxInactiveIntervalInSeconds = 1800)
public class SessionConfig {}

That's all Spring Boot needs — HttpSession calls now transparently store data in Redis. The session ID is sent as a cookie (SESSION by default) or X-Auth-Token header.

For a true stateless JWT architecture (which I prefer for microservices), you don't use server-side sessions at all — the JWT carries the claim data and Redis is only used to store token blacklists for logout (since you can't invalidate a JWT before expiry without a server-side store).

// JWT blacklist on logout
public void logout(String jti, long expiryMs) {
    redisTemplate.opsForValue().set("blacklist:" + jti, "1", Duration.ofMillis(expiryMs));
}

public boolean isBlacklisted(String jti) {
    return redisTemplate.hasKey("blacklist:" + jti);
}

TTL matches the JWT expiry so the blacklist self-cleans.`,
      followUp: {
        question: 'What is the risk of storing session data in Redis without persistence?',
        answer: `If Redis restarts without AOF or RDB persistence enabled, all sessions are lost and all users are logged out. For session storage, always configure Redis with at least appendonly yes (AOF) so the session log survives restarts. With AOF fsync=everysec, you lose at most one second of writes. Another risk is Redis running out of memory and evicting session keys — use a volatile-lru policy so sessions with TTL get evicted before data without TTL, but monitor memory to avoid unexpected logouts during traffic spikes.`
      }
    },
    {
      id: 'redis_q12',
      question: 'How do you monitor and troubleshoot Redis performance issues in production?',
      difficulty: 'advanced',
      tags: ['Redis', 'Performance', 'Monitoring'],
      answer: `Redis provides several built-in monitoring tools.

INFO command — returns comprehensive statistics including memory usage, hit rate, connected clients, command count, replication lag. Run INFO stats and check keyspace_hits vs keyspace_misses for cache hit rate. A hit rate below 80% suggests keys are expiring too quickly or the cache is too small.

MONITOR command — streams all commands in real time. Useful for debugging but creates significant overhead — never leave it on in production.

SLOWLOG — logs commands exceeding a configurable threshold (slowlog-log-slower-than in microseconds). SLOWLOG GET shows recent slow commands.

Redis Latency Monitor — built-in latency event tracking. LATENCY HISTORY shows latency spikes correlated with events.

Redis Exporter + Prometheus + Grafana — the production standard. The redis-exporter binary scrapes Redis metrics and exposes them in Prometheus format. Key metrics to alert on:
- redis_memory_used_bytes / redis_memory_max_bytes > 80% — memory pressure
- redis_keyspace_hits_total / (hits + misses) < 0.85 — low hit rate
- redis_connected_clients near maxclients — connection exhaustion
- redis_rdb_last_bgsave_status != ok — persistence failure
- redis_replication_offset delta between master and replica — replication lag

Application-side: log cache miss rates per cache region using a custom CacheManager wrapper that increments a Micrometer counter on every hit and miss, then expose them to Prometheus.`,
      followUp: {
        question: 'You notice Redis memory is at 90% and hit rate has dropped. What do you do?',
        answer: `Immediate steps: Run INFO memory to see used_memory and maxmemory. Run redis-cli --bigkeys to find the largest keys — often one or two massive keys (like a Sorted Set with millions of entries) consume disproportionate memory. Run DBSIZE to count total keys. If a specific cache region is abnormally large, check if TTLs are set correctly — TTL of 0 means the key never expires and accumulates. Short-term: reduce TTLs on less critical caches, or SCAN + delete keys matching a pattern for a specific region. Long-term: increase Redis memory limit, move to Redis Cluster for horizontal scaling, or add a local L1 in-process cache (Caffeine) in front of Redis so fewer keys need to live in Redis.`
      }
    },
  ],
}

export default redis
