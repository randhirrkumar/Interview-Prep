import { useState } from 'react'
import { RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'

const CARDS = [
  { front: 'What are the 4 pillars of OOP?', back: 'Encapsulation (data hiding), Inheritance (IS-A), Polymorphism (many forms), Abstraction (hiding complexity via interfaces)', topic: 'Java' },
  { front: 'What is the difference between == and .equals()?', back: '== compares references (memory address). .equals() compares content/value. For String literals, == may work due to pooling, but use .equals() always.', topic: 'Java' },
  { front: 'What does @SpringBootApplication include?', back: '@Configuration + @EnableAutoConfiguration + @ComponentScan', topic: 'Spring Boot' },
  { front: 'What is @Transactional default rollback behavior?', back: 'Rolls back on RuntimeException (unchecked) ONLY. Does NOT rollback on checked exceptions unless rollbackFor = {Exception.class} specified.', topic: 'Spring Boot' },
  { front: 'What is the N+1 problem?', back: 'Loading N entities + N separate queries for related entities. Fix with JOIN FETCH or @EntityGraph.', topic: 'Hibernate' },
  { front: 'What is a Kafka Consumer Group?', back: 'A group of consumers that collectively consume a topic. Each partition is assigned to exactly 1 consumer. Adding consumers beyond partition count = idle consumers.', topic: 'Kafka' },
  { front: 'What is the difference between SAML and OAuth2?', back: 'SAML = Authentication (who are you?), XML-based, enterprise SSO. OAuth2 = Authorization (what can you access?), JSON-based, API access. OIDC = OAuth2 + identity layer.', topic: 'Security' },
  { front: 'What is idempotency in REST APIs?', back: 'Same request made multiple times has same effect as making it once. GET, PUT, DELETE are idempotent. POST is NOT.', topic: 'REST' },
  { front: 'What is the Circuit Breaker pattern?', back: 'CLOSED (normal) → OPEN (failing, fast-fail) → HALF-OPEN (testing recovery). Prevents cascading failures in microservices.', topic: 'Microservices' },
  { front: 'What is flatMap vs map in Java streams?', back: 'map() = 1-to-1 transformation. flatMap() = 1-to-many then flatten. Use flatMap when each element produces a stream.', topic: 'Java 8' },
  { front: 'What is HashMap internal structure?', back: 'Array of buckets (Node[]) + linked list/red-black tree for collisions. hashCode() determines bucket. equals() for key comparison. Resizes at 75% load.', topic: 'Java' },
  { front: 'Difference between ArrayList and LinkedList?', back: 'ArrayList: O(1) random access, backed by array. LinkedList: O(1) head/tail add/remove, O(n) random access. Use ArrayList 95% of the time.', topic: 'Java' },
  { front: 'What is ACID in databases?', back: 'Atomicity (all or nothing), Consistency (valid state), Isolation (concurrent tx don\'t interfere), Durability (persisted after commit)', topic: 'Database' },
  { front: 'What is lazy loading in Hibernate?', back: 'Related entities loaded only when accessed (not at initial fetch). Default for @OneToMany, @ManyToMany. Use JOIN FETCH to avoid N+1.', topic: 'Hibernate' },
  { front: 'What is constructor injection vs field injection?', back: 'Constructor injection: explicit, immutable, testable without Spring. Field injection (@Autowired on field): implicit, hard to unit test. Constructor injection is recommended.', topic: 'Spring Boot' },
  { front: 'What is Kafka partition key for?', back: 'Same key → same partition → ordering guaranteed for that key. Use business key (e.g., customerId, vehicleId) to ensure ordered processing per entity.', topic: 'Kafka' },
  { front: 'What is Dead Letter Topic (DLT) in Kafka?', back: 'Topic for messages that failed processing after all retries. Instead of blocking consumer, send to DLT for manual review. Prevents message loss.', topic: 'Kafka' },
  { front: 'What is JWT structure?', back: 'Header.Payload.Signature (3 parts, base64 encoded, dot-separated). Header: algorithm. Payload: claims (sub, exp, roles). Signature: HMAC(header+payload, secret).', topic: 'Security' },
  { front: 'What is Service Discovery?', back: 'Services register themselves with a registry (Eureka). Other services query registry instead of hardcoding IPs. Handles dynamic scaling, instance failures.', topic: 'Microservices' },
  { front: 'What is the Saga pattern?', back: 'Manages distributed transactions across microservices using a sequence of local transactions with compensating transactions for rollback. Choreography (events) or Orchestration (coordinator).', topic: 'Microservices' },
  { front: 'What is Azure App Service?', back: 'PaaS for hosting web apps. Deploy JAR directly, Azure manages OS, scaling, SSL. Listens on 80/443, proxies to your app\'s port (8080). Supports deployment slots for zero-downtime.', topic: 'Azure' },
  { front: 'What is SAML Assertion?', back: 'XML document from IdP to SP after authentication. Contains: NameID (user identity), Attributes (roles, email), validity window (NotBefore/NotOnOrAfter), digital signature.', topic: 'SSO' },
  { front: 'Difference between @Component, @Service, @Repository?', back: 'All are @Component specializations. @Repository: data access layer, exception translation. @Service: business logic. @Component: generic. Functionally same, differ in semantics.', topic: 'Spring Boot' },
  { front: 'What is Spring AOP proxy type?', back: 'JDK dynamic proxy (for interfaces), CGLIB proxy (for classes). AOP doesn\'t work for self-invocation (calling @Transactional from same bean — proxy bypassed).', topic: 'Spring Boot' },
  { front: 'What does volatile keyword do in Java?', back: 'Guarantees visibility: changes to volatile variable are immediately visible to all threads. Does NOT guarantee atomicity. Use AtomicInteger for atomic operations.', topic: 'Java' },
]

const TOPICS = ['All', ...new Set(CARDS.map(c => c.topic))]

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5)

export default function FlashCards() {
  const [topic, setTopic] = useState('All')
  const [cards, setCards] = useState(() => shuffle(CARDS))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState([])
  const [unknown, setUnknown] = useState([])

  const filteredCards = topic === 'All' ? cards : cards.filter(c => c.topic === topic)
  const card = filteredCards[index]
  const total = filteredCards.length

  const next = (result) => {
    if (result === 'know') setKnown(k => [...k, index])
    else setUnknown(u => [...u, index])
    setFlipped(false)
    setTimeout(() => {
      if (index + 1 < total) setIndex(i => i + 1)
      else setIndex(0)
    }, 150)
  }

  const reset = () => {
    setCards(shuffle(CARDS))
    setIndex(0)
    setFlipped(false)
    setKnown([])
    setUnknown([])
  }

  if (!card) return null

  const inactiveBtn = 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white'

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="card">
        <h1 className="section-title">Flash Cards</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Quick revision — flip to see the answer. Track what you know and what needs more work.</p>
      </div>

      {/* Topic filter */}
      <div className="flex flex-wrap gap-2">
        {TOPICS.map(t => (
          <button key={t} onClick={() => { setTopic(t); setIndex(0); setFlipped(false) }}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${topic === t ? 'bg-blue-700 text-white' : inactiveBtn}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-500">{index + 1} / {total}</span>
        <span className="text-green-500 dark:text-green-400">✓ {known.length} known</span>
        <span className="text-red-500 dark:text-red-400">✗ {unknown.length} review</span>
        <button onClick={reset} className="ml-auto flex items-center gap-1.5 text-xs btn-ghost py-1">
          <RotateCcw size={12} />Shuffle
        </button>
      </div>

      {/* Card */}
      <div
        className="cursor-pointer h-64 perspective-1000"
        onClick={() => setFlipped(!flipped)}
      >
        <div className={`relative w-full h-full transition-all duration-500 ${flipped ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
          {/* Front */}
          <div className="absolute inset-0 card flex flex-col items-center justify-center text-center border-blue-400 dark:border-blue-700" style={{ backfaceVisibility: 'hidden' }}>
            <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded mb-4">{card.topic}</span>
            <p className="text-lg font-semibold text-gray-900 dark:text-white px-4">{card.front}</p>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-4">Click to reveal answer</p>
          </div>
          {/* Back */}
          <div className="absolute inset-0 card flex flex-col items-center justify-center text-center bg-green-50 border-green-400 dark:bg-green-950/20 dark:border-green-700" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 px-2 py-0.5 rounded mb-4">Answer</span>
            <p className="text-sm text-gray-700 dark:text-gray-300 px-4 leading-relaxed">{card.back}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      {flipped && (
        <div className="flex gap-3 animate-fade-in">
          <button onClick={() => next('review')} className="flex-1 py-3 bg-red-50 border border-red-300 text-red-600 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-sm font-medium">
            Need Review
          </button>
          <button onClick={() => next('know')} className="flex-1 py-3 bg-green-50 border border-green-300 text-green-600 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors text-sm font-medium">
            I Know This
          </button>
        </div>
      )}

      {!flipped && (
        <div className="flex justify-between">
          <button onClick={() => { setFlipped(false); setIndex(i => Math.max(0, i - 1)) }} className="btn-ghost flex items-center gap-1.5 text-sm">
            <ChevronLeft size={16} />Prev
          </button>
          <button onClick={() => { setFlipped(false); setIndex(i => Math.min(total - 1, i + 1)) }} className="btn-ghost flex items-center gap-1.5 text-sm">
            Next<ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
