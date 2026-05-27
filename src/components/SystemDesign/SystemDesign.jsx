import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const DESIGNS = [
  {
    id: 'vehicle-tracking',
    title: 'Vehicle Tracking System (EPLMS)',
    difficulty: 'intermediate',
    icon: '🚛',
    context: 'Design a real-time vehicle tracking system for a logistics company. 10K+ events/day, multiple downstream consumers.',
    hld: `High-Level Design:

1. Client Layer: Mobile apps (drivers) + Web dashboard (operators)
2. API Gateway: JWT auth, routing, rate limiting
3. Event Processing Pipeline (Kafka-based):
   - Vehicle REST Service → Kafka Producer
   - Kafka: vehicle-events topic (6 partitions, key=vehicleId)
   - Event Processor: validates, enriches → publishes to processed-events
4. Downstream Services:
   - Tracking Service: updates real-time location DB
   - Billing Service: calculates charges
   - Notification Service: SMS/email to stakeholders
5. Data Layer:
   - MySQL: transactional data (vehicle master, events)
   - Redis: vehicle location cache (TTL 5 min)
   - Elasticsearch: event history search
6. Monitoring: Azure Monitor + Application Insights`,
    lld: `Key Classes/APIs:

// Kafka Event Structure
class VehicleEvent {
  vehicleId: String (partition key)
  eventType: CHECK_IN | CHECK_OUT | INSPECTION | LOADING
  timestamp: Instant
  location: GeoLocation
  driverId: String
  metadata: Map<String, Object>
}

// REST API
POST /api/v1/vehicle/check-in
GET  /api/v1/vehicle/{id}/events?from=&to=&limit=
GET  /api/v1/tracking/live          (returns all active vehicles)
GET  /api/v1/reports/vehicle/{id}   (event history report)

// Database Schema
TABLE vehicles: id, reg_no, type, owner, status, created_at
TABLE vehicle_events: id, vehicle_id(FK), event_type, timestamp, location, metadata
TABLE billing_records: id, vehicle_id, entry_time, exit_time, charges`,
    scaling: `Scaling Strategy:
- API Services: stateless → horizontal scaling (add instances)
- Kafka: 6 partitions → 6 parallel consumers
- Database: read replica for queries, primary for writes
- Cache: Redis for hot vehicle data (check-in status)
- When load 2x: increase partitions to 12, scale consumers
- CDN for web dashboard static assets`,
    tradeoffs: `Key Decisions:
✓ Kafka for event streaming: decouples services, handles traffic spikes, enables replay
✓ vehicleId as partition key: guarantees per-vehicle ordering
✓ Redis cache: reduces DB load for real-time tracking queries
✗ Not using: WebSockets (overkill for 10K/day), GraphQL (REST sufficient for this scale)`,
  },
  {
    id: 'insurance-system',
    title: 'Insurance Policy & Claims System',
    difficulty: 'intermediate',
    icon: '🏥',
    context: 'Design a policy management system handling 10K+ daily transactions. Needs strong consistency, audit trail, and role-based access.',
    hld: `High-Level Design:

1. API Gateway: JWT + SAML auth, routing
2. Core Services:
   - Policy Service: CRUD, lifecycle management
   - Claims Service: submission → assessment → settlement workflow
   - Customer Service: profile management
   - Payment Service: premium collection, scheduling
   - Notification Service: email/SMS
3. Data Layer:
   - MySQL: policy/claims data (ACID transactions required)
   - Redis: user session cache
   - S3/Blob: claim documents storage
4. Workflow Engine: state machine for claim status transitions
5. Audit Layer: every state change recorded with user + timestamp`,
    lld: `State Machine for Claims:

SUBMITTED → UNDER_REVIEW → APPROVED → SETTLED
                        ↓
                    REJECTED

// Valid transitions only
interface ClaimStateTransition {
  SUBMITTED → [UNDER_REVIEW]
  UNDER_REVIEW → [APPROVED, REJECTED]
  APPROVED → [SETTLED]
}

// Audit table
TABLE claim_audit: claim_id, old_status, new_status, changed_by, changed_at, reason`,
    scaling: `Scaling for 10K+ daily transactions:
- MySQL with read replicas: write to primary, read from replica
- Connection pooling (HikariCP): pool size based on (cores * 2) + spindle_count
- Caching: policy summaries cached in Redis, invalidated on update
- Async notifications: Kafka to decouple notification sending
- Database indexes: on (policy_number, customer_id, status)`,
    tradeoffs: `Key Decisions:
✓ RDBMS (MySQL): financial data needs ACID, not eventual consistency
✓ State machine pattern: explicit transitions prevent invalid state corruption
✓ Separate audit table: immutable audit trail for compliance
✓ Async notifications via Kafka: policy operations not blocked by notification failures`,
  },
  {
    id: 'url-shortener',
    title: 'URL Shortener (bit.ly)',
    difficulty: 'beginner',
    icon: '🔗',
    context: 'Design a URL shortener like bit.ly. 100M writes/day, 10B reads/day. Read-heavy system.',
    hld: `High-Level Design:

1. API: POST /shorten, GET /{shortCode} → 301 redirect
2. Shortening Service:
   - Generate unique short code (6-7 chars from base62)
   - Store: shortCode → longUrl + metadata
3. Redirect Service:
   - Lookup shortCode → longUrl
   - Return 301 (permanent) or 302 (trackable) redirect
4. Data Layer:
   - MySQL for writes (short code → long URL mapping)
   - Redis for cache (hot URLs → long URL) TTL 24h
5. Key Generation Service:
   - Pre-generates unique codes to avoid collision
   - Uses counter + base62 encoding`,
    lld: `Short code generation:
// Option 1: Hash + trim
md5(longUrl) → first 7 chars of base62 encoded hash
Problem: collision possible

// Option 2: Auto-increment ID + base62 encode (BEST)
id = atomicCounter.incrementAndGet()  // unique!
shortCode = base62(id)  // 1 → "1", 62 → "10", etc.

// Option 3: Pre-generated codes pool
// Background job generates codes, stores in ready pool
// Assign from pool on each request

// Database schema
TABLE urls: id(bigint), short_code(varchar 10, UNIQUE), long_url(text), created_at, clicks, expires_at`,
    scaling: `Scaling for 10B reads/day (115K reads/sec):
- Read cache (Redis): 99% of reads from cache
- Multiple redirect servers: stateless, scale horizontally
- CDN: for popular short codes
- DB sharding: by short_code for horizontal scale
- 302 vs 301: 302 allows click tracking (no browser caching), 301 reduces server load (browser caches)`,
    tradeoffs: `Key Decisions:
✓ Auto-increment + base62: no collisions, ordered, predictable
✓ Redis cache with high TTL: handles massive read volume
✓ 302 redirect for analytics tracking
✗ 301 is more SEO-friendly but we lose click data`,
  },
  {
    id: 'rate-limiter',
    title: 'Rate Limiter',
    difficulty: 'intermediate',
    icon: '⚡',
    context: 'Design a rate limiter for an API gateway. 1000 requests/user/minute. Should be distributed (multiple gateway nodes).',
    hld: `High-Level Design:

1. API Gateway intercepts each request
2. Rate Limiter middleware:
   - Identify user (from JWT or IP)
   - Check rate limit counter
   - Allow if under limit, reject with 429 if over
3. Algorithms:
   - Fixed Window: simple but burst at window boundary
   - Sliding Window Log: accurate but memory-heavy
   - Token Bucket: allows controlled bursts (recommended)
   - Leaky Bucket: smooth output rate
4. Distributed State:
   - Redis with atomic operations (INCR, EXPIRE)
   - Lua script for atomic check-and-increment`,
    lld: `// Token Bucket with Redis (distributed)
public boolean isAllowed(String userId) {
  String key = "rate:" + userId;

  // Lua script (atomic)
  String script = """
    local tokens = tonumber(redis.call('get', KEYS[1])) or ARGV[1]
    if tokens > 0 then
      redis.call('set', KEYS[1], tokens - 1)
      redis.call('expire', KEYS[1], ARGV[2])
      return 1
    end
    return 0
    """;

  Long result = (Long) redisTemplate.execute(
    RedisScript.of(script, Long.class),
    List.of(key),
    String.valueOf(maxTokens),
    String.valueOf(windowSeconds)
  );

  return result == 1L;
}

// HTTP Response headers
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 756
X-RateLimit-Reset: 1716826800`,
    scaling: `Scaling:
- Redis Cluster: distributed, fault-tolerant
- Lua scripts: atomic operations avoid race conditions
- Multiple gateway nodes all share Redis
- Sliding window preferred over fixed window to prevent burst at window boundary`,
    tradeoffs: `Key Decisions:
✓ Redis over local memory: distributed rate limiting across multiple API gateway nodes
✓ Lua scripts: atomic check-and-decrement, no race conditions
✓ Token bucket: allows reasonable burst (better UX) vs leaky bucket (strict rate)
✓ Return 429 with Retry-After header for good API UX`,
  },
]

export default function SystemDesign() {
  const [selected, setSelected] = useState(null)

  if (selected) {
    const design = DESIGNS.find(d => d.id === selected)
    return <DesignDetail design={design} onBack={() => setSelected(null)} />
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      <div className="card">
        <h1 className="section-title">System Design</h1>
        <p className="text-sm text-gray-400">HLD + LLD for common backend system design questions. Tailored to Java/Spring Boot ecosystem.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {DESIGNS.map(d => (
          <button key={d.id} onClick={() => setSelected(d.id)} className="card text-left hover:border-blue-700 transition-all">
            <div className="text-3xl mb-3">{d.icon}</div>
            <div className="font-semibold text-white mb-1">{d.title}</div>
            <div className="text-xs text-gray-500 mb-2 line-clamp-2">{d.context}</div>
            <span className={`diff-badge diff-${d.difficulty}`}>{d.difficulty}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function DesignDetail({ design, onBack }) {
  const [tab, setTab] = useState('hld')
  const tabs = [
    { key: 'hld', label: 'HLD' },
    { key: 'lld', label: 'LLD' },
    { key: 'scaling', label: 'Scaling' },
    { key: 'tradeoffs', label: 'Trade-offs' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
      <button onClick={onBack} className="text-sm text-gray-400 hover:text-white flex items-center gap-1">← Back to System Design</button>

      <div className="card">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{design.icon}</span>
          <div>
            <h1 className="text-xl font-bold text-white">{design.title}</h1>
            <span className={`diff-badge diff-${design.difficulty}`}>{design.difficulty}</span>
          </div>
        </div>
        <p className="text-sm text-yellow-300/80 mt-2 p-3 bg-yellow-950/20 rounded-lg">📋 {design.context}</p>
      </div>

      <div className="flex gap-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`text-sm px-4 py-2 rounded-lg transition-colors ${tab === t.key ? 'bg-blue-700 text-white' : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white'}`}>{t.label}</button>
        ))}
      </div>

      <div className="card animate-fade-in">
        <pre className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">{design[tab]}</pre>
      </div>
    </div>
  )
}
