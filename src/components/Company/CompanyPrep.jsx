import { useState } from 'react'
import { Building2 } from 'lucide-react'

const COMPANIES = [
  {
    id: 'tcs',
    name: 'TCS',
    type: 'Service',
    difficulty: 'Medium',
    focus: 'Fundamentals, Java basics, SQL, Spring Boot basics',
    style: 'Panel interview. Multiple rounds. Structured. Focus on fundamentals.',
    questions: [
      'What is the difference between abstract class and interface?',
      'Explain Spring Boot auto-configuration.',
      'Write a SQL query to find the second highest salary.',
      'What is microservices? What are the benefits?',
      'How does HashMap work internally?',
      'What is SOLID principles?',
      'Difference between @RestController and @Controller',
      'What is the purpose of @Transactional?',
    ],
    tip: 'TCS focuses on Java fundamentals and basics heavily. Be thorough on OOP, Collections, Spring Boot basics, SQL joins. System design is usually high-level only.',
    color: 'border-blue-700',
  },
  {
    id: 'cognizant',
    name: 'Cognizant',
    type: 'Service',
    difficulty: 'Medium',
    focus: 'Java, Spring Boot, Microservices, SQL, project discussion',
    style: 'Technical + manager round. Project-focused. Good culture discussion.',
    questions: [
      'Tell me about your current project architecture.',
      'How do you handle exceptions in Spring Boot?',
      'What is REST API best practices?',
      'What are Kafka topics and partitions?',
      'How did you improve performance in your project?',
      'What is the difference between monolith and microservices?',
      'How do you handle authentication in Spring Boot?',
      'Explain SOLID principles with examples.',
    ],
    tip: 'Cognizant values project depth. Prepare to explain your architecture clearly. They love performance improvement stories with numbers.',
    color: 'border-purple-700',
  },
  {
    id: 'capgemini',
    name: 'Capgemini',
    type: 'Service',
    difficulty: 'Medium',
    focus: 'Java, Spring, Microservices, Cloud basics, Agile',
    style: 'Technical screening + technical interview + manager round.',
    questions: [
      'How does Spring Boot handle application.properties vs environment variables?',
      'What is the difference between synchronous and asynchronous communication?',
      'Explain your experience with Kafka.',
      'What is Docker? How have you used it?',
      'How do you handle distributed transactions?',
      'What is the purpose of API Gateway?',
      'How do you implement logging across microservices?',
      'What is Circuit Breaker pattern?',
    ],
    tip: 'Capgemini focuses on modern cloud-native practices. Be prepared to discuss Docker, CI/CD, and cloud deployment. Mention Azure or AWS experience.',
    color: 'border-cyan-700',
  },
  {
    id: 'product',
    name: 'Product Companies',
    type: 'Product',
    difficulty: 'Hard',
    focus: 'DSA, System Design, Deep Java, Concurrency, Scale',
    style: 'Multiple technical rounds. DSA rounds. System design. Deep technical discussion.',
    questions: [
      'Design a real-time notification system for 10M users.',
      'Implement an LRU cache in Java.',
      'What are the guarantees of @Transactional in Spring?',
      'How do you handle exactly-once processing in Kafka?',
      'How does G1GC work? When would you tune GC?',
      'Design a distributed rate limiter.',
      'Explain the CAP theorem with examples.',
      'How would you debug a memory leak in a Spring Boot app?',
      'Implement a custom thread pool executor.',
      'How does CompletableFuture work? When would you use it?',
    ],
    tip: 'Product companies go deep. LeetCode medium/hard level DSA. System design at scale. Deep Spring internals. Prepare for "why" questions — they want you to justify every decision.',
    color: 'border-yellow-700',
  },
  {
    id: 'startup',
    name: 'Startups',
    type: 'Startup',
    difficulty: 'Medium-Hard',
    focus: 'Versatility, ownership, practical problem-solving, culture fit',
    style: 'Practical coding + system design + culture fit. Fast-paced interviews.',
    questions: [
      'How would you design the backend from scratch for our feature?',
      'Tell me about a time you owned a problem end-to-end.',
      'How do you handle ambiguous requirements?',
      'What databases have you worked with? When would you choose NoSQL?',
      'How do you approach API design?',
      'Tell me about a time you failed and what you learned.',
      'How do you balance speed and code quality under deadline pressure?',
      'What monitoring would you set up for a new service?',
    ],
    tip: 'Startups want problem-solvers who can move fast. Show ownership, not just execution. Demonstrate you can think end-to-end — from API design to deployment to monitoring.',
    color: 'border-green-700',
  },
]

export default function CompanyPrep() {
  const [selected, setSelected] = useState(null)
  const company = selected ? COMPANIES.find(c => c.id === selected) : null

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      <div className="card">
        <h1 className="section-title">Company-Specific Preparation</h1>
        <p className="text-sm text-gray-400">Interview style, focus areas, and common questions tailored for each company type.</p>
      </div>

      {!company ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COMPANIES.map(c => (
            <button key={c.id} onClick={() => setSelected(c.id)} className={`card text-left hover:opacity-90 transition-all border-l-4 ${c.color}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-white text-lg">{c.name}</div>
                <span className={`text-xs px-2 py-0.5 rounded ${c.type === 'Product' ? 'bg-yellow-900/40 text-yellow-300' : c.type === 'Startup' ? 'bg-green-900/40 text-green-300' : 'bg-blue-900/40 text-blue-300'}`}>{c.type}</span>
              </div>
              <div className="text-xs text-gray-500 mb-1">Difficulty: <span className="text-gray-300">{c.difficulty}</span></div>
              <div className="text-xs text-gray-400 line-clamp-2">{c.focus}</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <button onClick={() => setSelected(null)} className="text-sm text-gray-400 hover:text-white">← Back to companies</button>

          <div className={`card border-l-4 ${company.color}`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold text-white">{company.name}</h2>
              <span className={`text-sm px-3 py-1 rounded-full ${company.type === 'Product' ? 'bg-yellow-900/40 text-yellow-300' : 'bg-blue-900/40 text-blue-300'}`}>{company.type}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Interview Style</div>
                <p className="text-gray-300">{company.style}</p>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Focus Areas</div>
                <p className="text-gray-300">{company.focus}</p>
              </div>
            </div>
          </div>

          <div className="card border-yellow-800/50 bg-yellow-950/10">
            <div className="text-xs text-yellow-400 uppercase mb-2">Strategy Tip</div>
            <p className="text-sm text-gray-300">{company.tip}</p>
          </div>

          <div className="card">
            <div className="text-sm font-semibold text-white mb-3">Common Interview Questions</div>
            <div className="space-y-2">
              {company.questions.map((q, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 bg-gray-800/50 rounded-lg">
                  <span className="text-blue-500 text-xs font-bold mt-0.5 flex-shrink-0">Q{i+1}</span>
                  <span className="text-sm text-gray-300">{q}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
