import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit3, Save, X, ChevronDown, ChevronUp } from 'lucide-react'
import { getItem, setItem } from '../../utils/storage'

const STAR_KEY = 'prep_star_stories'

const SAMPLE_QUESTIONS = [
  'Tell me about a time you handled a conflict in your team.',
  'Describe a challenging project and how you overcame obstacles.',
  'Tell me about a time you took ownership beyond your role.',
  'Give an example of when you improved a process.',
  'Tell me about a time you failed and what you learned.',
  'Describe a situation where you had to meet a tight deadline.',
  'Tell me about a time you disagreed with your manager.',
]

const EMPTY_STORY = { question: '', situation: '', task: '', action: '', result: '' }

export default function STARBuilder() {
  const [stories, setStories] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_STORY)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    setStories(getItem(STAR_KEY, []))
  }, [])

  const save = () => {
    if (!form.question.trim()) return
    let updated
    if (editing !== null) {
      updated = stories.map((s, i) => i === editing ? { ...form, id: s.id } : s)
    } else {
      updated = [...stories, { ...form, id: Date.now() }]
    }
    setStories(updated)
    setItem(STAR_KEY, updated)
    setEditing(null)
    setForm(EMPTY_STORY)
  }

  const remove = (idx) => {
    const updated = stories.filter((_, i) => i !== idx)
    setStories(updated)
    setItem(STAR_KEY, updated)
  }

  const startEdit = (idx) => {
    setEditing(idx)
    setForm(stories[idx])
    setExpanded(null)
  }

  const cancel = () => {
    setEditing(null)
    setForm(EMPTY_STORY)
  }

  const isFormOpen = editing !== null || form.question !== ''

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card">
        <h1 className="section-title">STAR Story Builder</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Write your behavioral answers in STAR format — Situation, Task, Action, Result.
          Saved locally for your interview preparation.
        </p>
        <div className="flex gap-2 mt-3 flex-wrap">
          {['Situation', 'Task', 'Action', 'Result'].map(s => (
            <span key={s} className="tag bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">{s}</span>
          ))}
        </div>
      </div>

      {/* Add new story button */}
      {!isFormOpen && (
        <button
          onClick={() => setForm({ ...EMPTY_STORY, question: '' })}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 rounded-xl py-4 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          <Plus size={18} />
          <span className="text-sm font-medium">Add New STAR Story</span>
        </button>
      )}

      {/* Form */}
      {isFormOpen && (
        <div className="card border-blue-300 dark:border-blue-800/50">
          <h2 className="text-sm font-semibold text-blue-600 dark:text-blue-300 mb-4">{editing !== null ? 'Edit Story' : 'New STAR Story'}</h2>

          {/* Question */}
          <div className="space-y-1 mb-4">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Interview Question</label>
            <input
              value={form.question}
              onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
              placeholder="e.g. Tell me about a time you handled a conflict..."
              className="w-full bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-blue-500"
            />
            <div className="flex flex-wrap gap-1 mt-1">
              {SAMPLE_QUESTIONS.slice(0, 3).map((q, i) => (
                <button key={i} onClick={() => setForm(f => ({ ...f, question: q }))}
                  className="text-xs text-gray-400 dark:text-gray-600 hover:text-blue-500 dark:hover:text-blue-400 underline transition-colors">
                  {q.slice(0, 40)}...
                </button>
              ))}
            </div>
          </div>

          {/* STAR fields */}
          {[
            { key: 'situation', label: 'S — Situation', placeholder: 'Set the scene. What was the context, project, or background?', color: 'border-l-blue-500' },
            { key: 'task', label: 'T — Task', placeholder: 'What was your responsibility? What needed to be done?', color: 'border-l-yellow-500' },
            { key: 'action', label: 'A — Action', placeholder: 'What specific steps did YOU take? Use "I", not "we".', color: 'border-l-orange-500' },
            { key: 'result', label: 'R — Result', placeholder: 'What was the outcome? Quantify if possible (%, time saved, revenue).', color: 'border-l-green-500' },
          ].map(({ key, label, placeholder, color }) => (
            <div key={key} className="space-y-1 mb-4">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{label}</label>
              <textarea
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                rows={3}
                className={`w-full bg-white border border-gray-200 border-l-4 ${color} dark:bg-gray-800 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 outline-none resize-none focus:border-r-blue-500 focus:border-t-blue-500 focus:border-b-blue-500`}
              />
            </div>
          ))}

          <div className="flex gap-2 justify-end">
            <button onClick={cancel} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
              <X size={14} /> Cancel
            </button>
            <button onClick={save} disabled={!form.question.trim()}
              className="flex items-center gap-1 text-sm text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors">
              <Save size={14} /> Save Story
            </button>
          </div>
        </div>
      )}

      {/* Stories list */}
      {stories.length === 0 && !isFormOpen && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-600">
          <div className="text-4xl mb-3">📝</div>
          <div>No stories yet. Add your first STAR story above.</div>
        </div>
      )}

      <div className="space-y-3">
        {stories.map((story, idx) => (
          <div key={story.id} className="card">
            <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpanded(expanded === idx ? null : idx)}>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{story.question}</div>
                {expanded !== idx && (
                  <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{story.situation}</div>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={e => { e.stopPropagation(); startEdit(idx) }}
                  className="p-1.5 text-gray-400 hover:text-blue-500 rounded transition-colors">
                  <Edit3 size={14} />
                </button>
                <button onClick={e => { e.stopPropagation(); remove(idx) }}
                  className="p-1.5 text-gray-400 hover:text-red-400 rounded transition-colors">
                  <Trash2 size={14} />
                </button>
                {expanded === idx
                  ? <ChevronUp size={16} className="text-gray-400" />
                  : <ChevronDown size={16} className="text-gray-400" />
                }
              </div>
            </div>

            {expanded === idx && (
              <div className="mt-4 space-y-3 border-t border-gray-200 dark:border-gray-800 pt-4">
                {[
                  { key: 'situation', label: 'Situation', color: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10' },
                  { key: 'task', label: 'Task', color: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' },
                  { key: 'action', label: 'Action', color: 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10' },
                  { key: 'result', label: 'Result', color: 'border-l-green-500 bg-green-50 dark:bg-green-900/10' },
                ].map(({ key, label, color }) => story[key] && (
                  <div key={key} className={`border-l-4 ${color} rounded-r-lg p-3`}>
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">{label}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{story[key]}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
