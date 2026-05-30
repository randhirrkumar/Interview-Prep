import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Search, Filter } from 'lucide-react'
import QuestionCard from '../common/QuestionCard'
import { useProgress } from '../../contexts/ProgressContext'

import javaCore from '../../data/javaCore'
import java8 from '../../data/java8Streams'
import springBoot from '../../data/springBoot'
import microservices from '../../data/microservices'
import kafka from '../../data/kafka'
import sql from '../../data/sql'
import azure from '../../data/azure'
import sso from '../../data/sso'
import multithreading from '../../data/multithreading'
import collections from '../../data/collections'
import hibernate from '../../data/hibernate'
import security from '../../data/security'
import designPatterns from '../../data/designPatterns'
import docker from '../../data/docker'
import testing from '../../data/testing'

const TOPICS = {
  'java-core': javaCore,
  'java8': java8,
  'spring-boot': springBoot,
  'microservices': microservices,
  'kafka': kafka,
  'sql': sql,
  'azure': azure,
  'sso': sso,
  'multithreading': multithreading,
  'collections': collections,
  'hibernate': hibernate,
  'security': security,
  'design-patterns': designPatterns,
  'docker': docker,
  'testing': testing,
}

export default function TopicPage() {
  const { topicId } = useParams()
  const topicData = TOPICS[topicId] || { title: 'Topic', description: '', questions: [] }
  const [search, setSearch] = useState('')
  const [diffFilter, setDiffFilter] = useState('all')
  const { completed } = useProgress()

  const questions = useMemo(() => {
    return topicData.questions.filter(q => {
      const matchSearch = !search || q.question.toLowerCase().includes(search.toLowerCase())
      const matchDiff = diffFilter === 'all' || q.difficulty === diffFilter
      return matchSearch && matchDiff
    })
  }, [topicData, search, diffFilter])

  const done = completed.filter(c => c.startsWith(topicId + '_')).length
  const pct = topicData.questions.length ? Math.round((done / topicData.questions.length) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="section-title">{topicData.title}</h1>
            <p className="text-sm text-gray-400 mb-3">{topicData.description}</p>
            <div className="flex flex-wrap gap-2">
              {topicData.tags?.map(tag => (
                <span key={tag} className="tag bg-blue-900/40 text-blue-300">{tag}</span>
              ))}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-blue-400">{pct}%</div>
            <div className="text-xs text-gray-500">{done}/{topicData.questions.length}</div>
          </div>
        </div>
        <div className="mt-3 w-full bg-gray-800 rounded-full h-2">
          <div className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-green-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2">
          <Search size={14} className="text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="flex-1 bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none"
          />
        </div>
        <div className="flex gap-1">
          {['all', 'beginner', 'intermediate', 'advanced'].map(d => (
            <button
              key={d}
              onClick={() => setDiffFilter(d)}
              className={`text-xs px-3 py-2 rounded-lg capitalize transition-colors ${diffFilter === d ? 'bg-blue-700 text-white' : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white'}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {questions.length === 0 ? (
          <div className="text-center py-12 text-gray-600">No questions match your filter.</div>
        ) : (
          questions.map(q => (
            <QuestionCard key={q.id} q={q} topicId={topicId} />
          ))
        )}
      </div>
    </div>
  )
}
