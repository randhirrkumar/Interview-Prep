import { useState } from 'react'
import { ChevronDown, ChevronUp, Bookmark, BookmarkCheck, CheckCircle2, Code2, MessageSquare, AlertCircle } from 'lucide-react'
import { markCompleted, isCompleted, toggleBookmark, isBookmarked } from '../../utils/storage'

function FollowUpItem({ index, item }) {
  const [open, setOpen] = useState(false)
  const isObj = typeof item === 'object' && item !== null
  const question = isObj ? item.question : item
  const answer = isObj ? item.answer : null

  return (
    <div className="bg-gray-800/50 rounded-lg overflow-hidden">
      <button
        className={`w-full flex items-start gap-2 p-2.5 text-left transition-colors ${answer ? 'hover:bg-gray-800 cursor-pointer' : 'cursor-default'}`}
        onClick={() => answer && setOpen(!open)}
      >
        <span className="text-blue-400 font-bold text-xs mt-0.5 flex-shrink-0">Q{index + 1}</span>
        <span className="text-sm text-gray-300 flex-1">{question}</span>
        {answer && (open
          ? <ChevronUp size={14} className="text-gray-500 flex-shrink-0 mt-0.5" />
          : <ChevronDown size={14} className="text-gray-500 flex-shrink-0 mt-0.5" />
        )}
      </button>
      {open && answer && (
        <div className="px-4 pb-3 pt-2 text-sm text-gray-400 leading-relaxed border-t border-gray-700/50 whitespace-pre-wrap">
          {answer}
        </div>
      )}
    </div>
  )
}

export default function QuestionCard({ q, topicId }) {
  const id = `${topicId}_${q.id}`
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(() => isCompleted(id))
  const [saved, setSaved] = useState(() => isBookmarked(id))
  const [tab, setTab] = useState('answer')

  const toggleDone = (e) => {
    e.stopPropagation()
    markCompleted(id)
    setDone(true)
  }

  const toggleSave = (e) => {
    e.stopPropagation()
    toggleBookmark(id)
    setSaved(!saved)
  }

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${done ? 'border-green-800/50 bg-green-950/10' : 'border-gray-800 bg-gray-900'}`}>
      {/* Header */}
      <div className="flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-800/40 transition-colors" onClick={() => setOpen(!open)}>
        <div className="flex-shrink-0 mt-0.5">
          {done
            ? <CheckCircle2 size={18} className="text-green-500" />
            : <div className="w-[18px] h-[18px] border-2 border-gray-600 rounded-full" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {q.difficulty && (
              <span className={`diff-badge diff-${q.difficulty}`}>{q.difficulty}</span>
            )}
            {q.tags?.map(tag => (
              <span key={tag} className="tag bg-gray-800 text-gray-400">{tag}</span>
            ))}
            {q.asked && (
              <span className="tag bg-red-900/40 text-red-300">🔥 Frequently Asked</span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-200">{q.question}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={toggleSave} className="text-gray-600 hover:text-yellow-400 transition-colors">
            {saved ? <BookmarkCheck size={16} className="text-yellow-400" /> : <Bookmark size={16} />}
          </button>
          {open ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
        </div>
      </div>

      {/* Expanded content */}
      {open && (
        <div className="border-t border-gray-800 animate-fade-in">
          {/* Tabs */}
          <div className="flex gap-1 px-4 pt-3">
            {[
              { key: 'answer', label: 'Answer', icon: MessageSquare },
              ...(q.code ? [{ key: 'code', label: 'Code', icon: Code2 }] : []),
              ...(q.followUp ? [{ key: 'followup', label: 'Follow-ups', icon: AlertCircle }] : []),
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${tab === t.key ? 'bg-blue-900/50 text-blue-300' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
              >
                <t.icon size={12} />
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {tab === 'answer' && (
              <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{q.answer}</div>
            )}
            {tab === 'code' && q.code && (
              <pre className="code-block text-sm overflow-x-auto">{q.code}</pre>
            )}
            {tab === 'followup' && q.followUp && (
              <div className="space-y-2">
                {q.followUp.map((f, i) => (
                  <FollowUpItem key={i} index={i} item={f} />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 pb-3 pt-1 border-t border-gray-800/50">
            {q.tip && (
              <div className="flex items-start gap-2 text-xs text-yellow-600/80">
                <span>💡</span>
                <span>{q.tip}</span>
              </div>
            )}
            {!done && (
              <button onClick={toggleDone} className="ml-auto flex items-center gap-1.5 text-xs btn-primary py-1.5">
                <CheckCircle2 size={12} />
                Mark Done
              </button>
            )}
            {done && <span className="ml-auto text-xs text-green-500">Completed ✓</span>}
          </div>
        </div>
      )}
    </div>
  )
}
