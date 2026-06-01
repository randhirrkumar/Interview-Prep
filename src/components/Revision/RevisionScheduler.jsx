import { useState, useEffect } from 'react'
import { CalendarClock, CheckCircle, Plus, Trash2, Bell } from 'lucide-react'
import { getItem, setItem } from '../../utils/storage'
import { NavLink } from 'react-router-dom'

const REVISION_KEY = 'prep_revisions'

const ALL_TOPICS = [
  { id: 'java-core', label: 'Java Core & OOP' },
  { id: 'java8', label: 'Java 8 & Streams' },
  { id: 'multithreading', label: 'Multithreading' },
  { id: 'collections', label: 'Collections & DS' },
  { id: 'spring-boot', label: 'Spring Boot' },
  { id: 'microservices', label: 'Microservices' },
  { id: 'hibernate', label: 'Hibernate & JPA' },
  { id: 'kafka', label: 'Kafka' },
  { id: 'sql', label: 'SQL & MySQL' },
  { id: 'azure', label: 'Azure Basics' },
  { id: 'sso', label: 'SSO / SAML' },
  { id: 'security', label: 'Spring Security' },
  { id: 'design-patterns', label: 'Design Patterns' },
  { id: 'docker', label: 'Docker & Kubernetes' },
  { id: 'testing', label: 'Testing (JUnit & Mockito)' },
]

const INTERVALS = [
  { label: 'Tomorrow', days: 1 },
  { label: '3 days', days: 3 },
  { label: '1 week', days: 7 },
  { label: '2 weeks', days: 14 },
]

function daysUntil(dateStr) {
  const diff = new Date(dateStr).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)
  return Math.ceil(diff / 86400000)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function RevisionScheduler() {
  const [revisions, setRevisions] = useState([])
  const [selectedTopic, setSelectedTopic] = useState('')
  const [selectedDays, setSelectedDays] = useState(7)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    setRevisions(getItem(REVISION_KEY, []))
  }, [])

  const addRevision = () => {
    if (!selectedTopic) return
    const dueDate = new Date(Date.now() + selectedDays * 86400000).toISOString().split('T')[0]
    const topic = ALL_TOPICS.find(t => t.id === selectedTopic)
    const entry = { id: Date.now(), topicId: selectedTopic, topicLabel: topic.label, dueDate, done: false }
    const updated = [...revisions, entry]
    setRevisions(updated)
    setItem(REVISION_KEY, updated)
    setShowForm(false)
    setSelectedTopic('')
  }

  const markDone = (id) => {
    const updated = revisions.map(r => r.id === id ? { ...r, done: true } : r)
    setRevisions(updated)
    setItem(REVISION_KEY, updated)
  }

  const remove = (id) => {
    const updated = revisions.filter(r => r.id !== id)
    setRevisions(updated)
    setItem(REVISION_KEY, updated)
  }

  const due = revisions.filter(r => !r.done && daysUntil(r.dueDate) <= 0)
  const upcoming = revisions.filter(r => !r.done && daysUntil(r.dueDate) > 0).sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate))
  const completed = revisions.filter(r => r.done)

  const inactiveBtn = 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white'

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="section-title">Revision Scheduler</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Schedule topics for spaced repetition. Review at the right time to retain better.</p>
          </div>
          <button
            onClick={() => setShowForm(f => !f)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-2 rounded-lg transition-colors flex-shrink-0"
          >
            <Plus size={14} /> Schedule Revision
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card border-blue-400 dark:border-blue-800/50">
          <h2 className="text-sm font-semibold text-blue-600 dark:text-blue-300 mb-4">Schedule a Revision</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase block mb-2">Topic</label>
              <select
                value={selectedTopic}
                onChange={e => setSelectedTopic(e.target.value)}
                className="w-full bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-blue-600"
              >
                <option value="">Select a topic...</option>
                {ALL_TOPICS.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase block mb-2">Revise in</label>
              <div className="flex gap-2 flex-wrap">
                {INTERVALS.map(({ label, days }) => (
                  <button key={days} onClick={() => setSelectedDays(days)}
                    className={`text-sm px-4 py-2 rounded-lg transition-colors ${selectedDays === days ? 'bg-blue-700 text-white' : inactiveBtn}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)}
                className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                Cancel
              </button>
              <button onClick={addRevision} disabled={!selectedTopic}
                className="text-sm text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 px-4 py-2 rounded-lg transition-colors">
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Due today */}
      {due.length > 0 && (
        <div className="card border-orange-400 dark:border-orange-800/50">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={16} className="text-orange-400" />
            <h2 className="font-semibold text-orange-500 dark:text-orange-300">Due for Revision ({due.length})</h2>
          </div>
          <div className="space-y-2">
            {due.map(r => (
              <div key={r.id} className="flex items-center gap-3 bg-orange-50 border border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/30 rounded-lg p-3">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{r.topicLabel}</div>
                  <div className="text-xs text-orange-500 dark:text-orange-400">Due {formatDate(r.dueDate)}</div>
                </div>
                <NavLink to={`/topics/${r.topicId}`} className="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 underline">
                  Review
                </NavLink>
                <button onClick={() => markDone(r.id)} className="text-gray-400 hover:text-green-400 transition-colors">
                  <CheckCircle size={16} />
                </button>
                <button onClick={() => remove(r.id)} className="text-gray-400 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <CalendarClock size={16} className="text-blue-400" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Upcoming Revisions</h2>
          </div>
          <div className="space-y-2">
            {upcoming.map(r => {
              const days = daysUntil(r.dueDate)
              return (
                <div key={r.id} className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg p-3">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{r.topicLabel}</div>
                    <div className="text-xs text-gray-500">{formatDate(r.dueDate)}</div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    days <= 3
                      ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    in {days} day{days !== 1 ? 's' : ''}
                  </div>
                  <button onClick={() => remove(r.id)} className="text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="card opacity-60">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} className="text-green-400" />
            <h2 className="font-semibold text-gray-500 dark:text-gray-400">Completed ({completed.length})</h2>
          </div>
          <div className="space-y-1">
            {completed.map(r => (
              <div key={r.id} className="flex items-center gap-3 p-2">
                <div className="text-sm text-gray-400 line-through flex-1">{r.topicLabel}</div>
                <button onClick={() => remove(r.id)} className="text-gray-300 dark:text-gray-700 hover:text-red-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {revisions.length === 0 && !showForm && (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600">
          <div className="text-4xl mb-3">📅</div>
          <div className="text-sm">No revisions scheduled yet.</div>
          <div className="text-xs mt-1">After finishing a topic, schedule it for revision in a few days.</div>
        </div>
      )}
    </div>
  )
}
