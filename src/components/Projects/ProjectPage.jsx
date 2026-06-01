import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ChevronDown, ChevronUp, AlertTriangle, Zap, Code2 } from 'lucide-react'
import projects from '../../data/projects'

const TWO_MIN_PITCH = {
  eplms: `"In my current role at Adani Groups, I'm working on EPLMS — a real-time vehicle tracking and logistics automation system.

The system uses a microservices architecture with 5 core services communicating via Apache Kafka. My role has been building the REST APIs for vehicle event processing, designing the Kafka-based event pipeline, and optimizing system performance.

One thing I'm particularly proud of is the Kafka partition key strategy I implemented — using vehicle ID as the key ensures events for the same vehicle are processed in order. This was critical for correct billing calculations.

We process 10,000+ events per day and I personally improved API response time by 30% through caching and query optimization."`,

  metlife: `"At Cognizant, I worked on the MetLife Insurance project — building the policy and claims management system that handles 10,000+ daily transactions.

My core responsibility was building REST APIs using Spring Boot and Java for policy creation, premium calculation, and claims processing workflows.

I also implemented the authentication layer using Spring Security with JWT for most users and SAML-based SSO for enterprise users authenticating through their corporate Active Directory.

One of my key contributions was identifying and fixing an N+1 query problem that reduced a critical report API from 8 seconds to under 200ms — a 95% improvement."`,

  ecommerce: `Start with: "Let me walk you through how I'd design an e-commerce order management system."

1. Requirements: Handle 50k+ orders/day. Support concurrent users, no overselling. Track order status in real time.

2. Core services: Product, Inventory, Cart, Order, Payment, Notification — each owning its own database.

3. Order flow: Customer places order → Order Service publishes 'order-placed' to Kafka → Inventory Service reserves stock → Payment Service charges card → Order confirmed. Saga pattern handles failures with compensating events.

4. Key design decisions to highlight:
   — Optimistic locking on inventory to prevent overselling without blocking reads
   — Idempotency keys on payment API to prevent double charges
   — Redis caching for product catalog (read-heavy)
   — Kafka fan-out for inventory + payment + notification in parallel

5. Wrap up with a tradeoff: "This design gives eventual consistency — the order is PENDING for a short time while async processing completes. For e-commerce that's acceptable. For banking, I'd need stronger guarantees."`,

  urlshortener: `Start with: "A URL shortener has deceptively simple requirements but interesting scaling challenges."

1. Core APIs: POST /shorten (returns short code), GET /{code} (redirects to original URL).

2. ID generation: Use MySQL auto-increment ID encoded to Base62 (a-z, A-Z, 0-9). 6 characters → 56 billion unique codes.

3. Read path (most important): GET /{code} must be < 10ms.
   — Check local in-process cache (Caffeine) first
   — Then Redis cache
   — MySQL only on cache miss
   — 301 vs 302: use 302 so every click is tracked (analytics)

4. Analytics: Click events published to Kafka asynchronously — never on the critical redirect path.

5. Scaling challenges to mention:
   — Hot key problem: viral URLs → local cache per instance
   — Cache penetration: random codes → Bloom Filter
   — At 100k RPS: stateless app servers + Redis cluster + CDN edge caching`,

  banking: `Start with: "Banking is where correctness matters more than performance — you can't lose a single rupee."

1. Core requirement: Fund transfers must be atomic — debit and credit together, or neither.

2. @Transactional in Spring: wraps both the debit and credit in a single DB transaction. If anything fails, MySQL rolls back both. This handles the server-crash-mid-transfer scenario.

3. Concurrency: Two users transferring between the same accounts simultaneously → deadlock risk. Solution: always lock accounts in consistent order (smaller ID first) to break circular wait.

4. Idempotency: Mobile client retries on timeout → duplicate transfer. Solution: client sends UUID idempotency key in header. Server checks Redis — if key seen before, return cached result without processing again.

5. Audit trail: transactions table is append-only (never updated/deleted). Every state change goes to an immutable audit_log via Kafka. Regulatory requirement.

6. Wrap up: "The hardest part of banking systems isn't the happy path — it's all the failure modes. What happens when payment succeeds but notification fails? What if we crash after debit but before credit? Designing for these edge cases is what separates a good backend engineer."`,
}

export default function ProjectPage() {
  const { projectId } = useParams()
  const project = projects[projectId]

  if (!project) return <div className="text-gray-500 text-center py-20">Project not found</div>

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-blue-300 dark:border-blue-800/50" style={{ background: undefined }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-blue-500 dark:text-blue-400 font-semibold uppercase tracking-wider mb-1">{project.period}</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{project.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{project.tagline}</p>
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map(t => (
                <span key={t} className="tag bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-xs">{t}</span>
              ))}
            </div>
          </div>
          <div className="text-5xl opacity-20">🏗️</div>
        </div>
      </div>

      {/* Overview */}
      <SectionCard title="Project Overview" icon="📋">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{project.overview}</p>
      </SectionCard>

      {/* Architecture */}
      {project.architecture && (
        <SectionCard title="Architecture Deep Dive" icon="🏛️">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{project.architecture}</p>
        </SectionCard>
      )}

      {/* Kafka Flow */}
      {project.kafkaFlow && (
        <SectionCard title="Kafka Event Flow" icon="📨">
          <pre className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{project.kafkaFlow}</pre>
        </SectionCard>
      )}

      {/* Challenges */}
      {project.challenges && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-yellow-400" />
            <span className="font-semibold text-gray-900 dark:text-white">Real Production Challenges</span>
          </div>
          <div className="space-y-3">
            {project.challenges.map((c, i) => (
              <div key={i} className="card border-l-4 border-yellow-500 dark:border-yellow-600">
                <div className="font-semibold text-yellow-600 dark:text-yellow-300 mb-2">🔥 {c.title}</div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deep Dive Q&A */}
      {project.deepDiveQA && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} className="text-blue-400" />
            <span className="font-semibold text-gray-900 dark:text-white">Interview Q&A — Project Deep Dive</span>
          </div>
          <div className="space-y-3">
            {project.deepDiveQA.map((qa, i) => (
              <DeepDiveCard key={i} qa={qa} />
            ))}
          </div>
        </div>
      )}

      {/* How to Explain */}
      <div className="card border-blue-300 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-950/10">
        <div className="flex items-center gap-2 mb-3">
          <Code2 size={16} className="text-blue-500 dark:text-blue-400" />
          <span className="font-semibold text-blue-600 dark:text-blue-300">
            {['eplms','metlife'].includes(projectId) ? 'How to Explain the Project in 2 Minutes' : 'How to Discuss This in a System Design Interview'}
          </span>
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
          {TWO_MIN_PITCH[projectId] || project.overview}
        </div>
      </div>
    </div>
  )
}

function SectionCard({ title, icon, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="card">
      <div className="flex items-center justify-between cursor-pointer mb-3" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          <span>{icon}</span>
          <span>{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </div>
      {open && children}
    </div>
  )
}

function DeepDiveCard({ qa }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3 cursor-pointer" onClick={() => setOpen(!open)}>
        <p className="text-sm font-medium text-blue-600 dark:text-blue-300 flex-1">{qa.q}</p>
        {open ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
      </div>
      {open && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 animate-fade-in">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{qa.a}</p>
        </div>
      )}
    </div>
  )
}
