import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ChevronDown, ChevronUp, AlertTriangle, Zap, Code2 } from 'lucide-react'
import projects from '../../data/projects'

export default function ProjectPage() {
  const { projectId } = useParams()
  const project = projects[projectId]

  if (!project) return <div className="text-gray-500 text-center py-20">Project not found</div>

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card bg-gradient-to-br from-gray-900 to-gray-950 border-blue-800/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">{project.period}</div>
            <h1 className="text-2xl font-bold text-white mb-1">{project.name}</h1>
            <p className="text-gray-400 text-sm mb-4">{project.tagline}</p>
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map(t => (
                <span key={t} className="tag bg-blue-900/40 text-blue-300 text-xs">{t}</span>
              ))}
            </div>
          </div>
          <div className="text-5xl opacity-20">🏗️</div>
        </div>
      </div>

      {/* Overview */}
      <SectionCard title="Project Overview" icon="📋">
        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{project.overview}</p>
      </SectionCard>

      {/* Architecture */}
      {project.architecture && (
        <SectionCard title="Architecture Deep Dive" icon="🏛️">
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{project.architecture}</p>
        </SectionCard>
      )}

      {/* Kafka Flow */}
      {project.kafkaFlow && (
        <SectionCard title="Kafka Event Flow" icon="📨">
          <pre className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{project.kafkaFlow}</pre>
        </SectionCard>
      )}

      {/* Challenges */}
      {project.challenges && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-yellow-400" />
            <span className="font-semibold text-white">Real Production Challenges</span>
          </div>
          <div className="space-y-3">
            {project.challenges.map((c, i) => (
              <div key={i} className="card border-l-4 border-yellow-600">
                <div className="font-semibold text-yellow-300 mb-2">🔥 {c.title}</div>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{c.desc}</p>
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
            <span className="font-semibold text-white">Interview Q&A — Project Deep Dive</span>
          </div>
          <div className="space-y-3">
            {project.deepDiveQA.map((qa, i) => (
              <DeepDiveCard key={i} qa={qa} />
            ))}
          </div>
        </div>
      )}

      {/* How to Explain Architecture */}
      <div className="card border-blue-800/50 bg-blue-950/10">
        <div className="flex items-center gap-2 mb-3">
          <Code2 size={16} className="text-blue-400" />
          <span className="font-semibold text-blue-300">How to Explain the Project in 2 Minutes</span>
        </div>
        <div className="text-sm text-gray-300 leading-relaxed">
          {projectId === 'eplms' ? `"In my current role at Adani Groups, I'm working on EPLMS — a real-time vehicle tracking and logistics automation system.

The system uses a microservices architecture with 5 core services communicating via Apache Kafka. My role has been building the REST APIs for vehicle event processing, designing the Kafka-based event pipeline, and optimizing the system performance.

One thing I'm particularly proud of is the Kafka partition key strategy I implemented — using vehicle ID as the key ensures events for the same vehicle are processed in order. This was critical for correct billing calculations.

We process 10,000+ events per day and I personally improved API response time by 30% through caching and query optimization."` :
`"At Cognizant, I worked on the MetLife Insurance project — building the policy and claims management system that handles 10,000+ daily transactions.

My core responsibility was building REST APIs using Spring Boot and Java for policy creation, premium calculation, and claims processing workflows.

I also implemented the authentication layer using Spring Security with JWT for most users and SAML-based SSO for enterprise users authenticating through their corporate Active Directory.

One of my key contributions was identifying and fixing an N+1 query problem that reduced a critical report API from 8 seconds to under 200ms — a 95% improvement."`}
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
        <div className="flex items-center gap-2 font-semibold text-white">
          <span>{icon}</span>
          <span>{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
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
        <p className="text-sm font-medium text-blue-300 flex-1">{qa.q}</p>
        {open ? <ChevronUp size={16} className="text-gray-500 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />}
      </div>
      {open && (
        <div className="mt-3 pt-3 border-t border-gray-800 animate-fade-in">
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{qa.a}</p>
        </div>
      )}
    </div>
  )
}
