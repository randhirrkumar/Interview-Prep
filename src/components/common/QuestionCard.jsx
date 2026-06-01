import { useState } from 'react'
import { ChevronDown, ChevronUp, Bookmark, BookmarkCheck, CheckCircle2, Code2, MessageSquare, AlertCircle } from 'lucide-react'
import { useProgress } from '../../contexts/ProgressContext'

function FollowUpItem({ index, item }) {
  const [open, setOpen] = useState(false)
  const isObj = typeof item === 'object' && item !== null
  const question = isObj ? item.question : item
  const answer   = isObj ? item.answer   : null

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
      <button
        className="w-full flex items-start gap-3 p-3 text-left transition-colors"
        style={{ cursor: answer ? 'pointer' : 'default' }}
        onClick={() => answer && setOpen(!open)}
      >
        <span className="text-xs font-bold flex-shrink-0 mt-0.5 px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
          Q{index + 1}
        </span>
        <span className="text-sm flex-1" style={{ color: 'var(--text-input)' }}>{question}</span>
        {answer && (open
          ? <ChevronUp size={14} style={{ color: 'var(--text-dim)', flexShrink: 0, marginTop: 2 }} />
          : <ChevronDown size={14} style={{ color: 'var(--text-dim)', flexShrink: 0, marginTop: 2 }} />
        )}
      </button>
      {open && answer && (
        <div className="px-4 pb-3 pt-2 text-sm leading-relaxed whitespace-pre-wrap"
          style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
          {answer}
        </div>
      )}
    </div>
  )
}

export default function QuestionCard({ q, topicId }) {
  const id   = `${topicId}_${q.id}`
  const [open, setOpen] = useState(false)
  const [tab,  setTab]  = useState('answer')
  const { isCompleted, isBookmarked, complete, uncomplete, bookmark } = useProgress()
  const done  = isCompleted(id)
  const saved = isBookmarked(id)

  const tabs = [
    { key: 'answer',   label: 'Answer',     icon: MessageSquare },
    ...(q.code     ? [{ key: 'code',     label: 'Code',       icon: Code2        }] : []),
    ...(q.followUp ? [{ key: 'followup', label: 'Follow-ups', icon: AlertCircle  }] : []),
  ]

  const diffBorderColor = {
    beginner:     'rgba(16,185,129,0.35)',
    intermediate: 'rgba(245,158,11,0.35)',
    advanced:     'rgba(239,68,68,0.35)',
  }[q.difficulty] ?? 'var(--border-dim)'

  return (
    <div
      className="overflow-hidden transition-all duration-200"
      style={{
        background: done ? 'var(--card-done-bg)' : 'var(--bg-surface)',
        border: `1px solid ${done ? 'var(--card-done-border)' : 'var(--border-dim)'}`,
        borderRadius: '14px',
        borderLeft: `3px solid ${done ? '#22c55e' : diffBorderColor}`,
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer select-none"
        style={{ transition: 'background 0.15s' }}
        onClick={() => setOpen(!open)}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {/* Done indicator */}
        <div className="flex-shrink-0 mt-0.5">
          {done
            ? <CheckCircle2 size={17} style={{ color: '#22c55e' }} />
            : <div style={{ width: 17, height: 17, borderRadius: '50%', border: '2px solid #334155' }} />
          }
        </div>

        {/* Question text + badges */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            {q.difficulty && <span className={`diff-badge diff-${q.difficulty}`}>{q.difficulty}</span>}
            {q.tags?.map(tag => <span key={tag} className="tag">{tag}</span>)}
            {q.asked && (
              <span className="tag" style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
                🔥 Frequently Asked
              </span>
            )}
          </div>
          <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-body)' }}>{q.question}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-1">
          <button
            onClick={e => { e.stopPropagation(); bookmark(id) }}
            className="p-1 rounded transition-colors"
            style={{ color: saved ? '#fbbf24' : '#334155' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fbbf24'}
            onMouseLeave={e => e.currentTarget.style.color = saved ? '#fbbf24' : '#334155'}
          >
            {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
          </button>
          <span style={{ color: '#334155' }}>
            {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </span>
        </div>
      </div>

      {/* ── Expanded body ── */}
      {open && (
        <div style={{ borderTop: '1px solid var(--border-dim)' }} className="animate-fade-in">
          {/* Tabs */}
          <div className="flex gap-1 px-4 pt-3">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
                style={tab === t.key
                  ? { background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }
                  : { background: 'transparent', color: '#475569', border: '1px solid transparent' }
                }
                onMouseEnter={e => { if (tab !== t.key) e.currentTarget.style.color = '#94a3b8' }}
                onMouseLeave={e => { if (tab !== t.key) e.currentTarget.style.color = '#475569' }}
              >
                <t.icon size={12} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4">
            {tab === 'answer' && (
              <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)', lineHeight: '1.75' }}>
                {q.answer}
              </div>
            )}
            {tab === 'code' && q.code && (
              <pre className="code-block text-sm overflow-x-auto">{q.code}</pre>
            )}
            {tab === 'followup' && q.followUp && (
              <div className="space-y-2">
                {q.followUp.map((f, i) => <FollowUpItem key={i} index={i} item={f} />)}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 pb-4 pt-1"
            style={{ borderTop: '1px solid var(--border-dimmer)' }}>
            {q.tip ? (
              <div className="flex items-start gap-2 text-xs max-w-xs" style={{ color: 'var(--text-muted)' }}>
                <span className="flex-shrink-0">💡</span>
                <span>{q.tip}</span>
              </div>
            ) : <div />}

            {done ? (
              <button
                onClick={e => { e.stopPropagation(); uncomplete(id) }}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all group"
                style={{ color: '#4ade80', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
                  e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'
                  e.currentTarget.style.color = '#f87171'
                  e.currentTarget.querySelector('span').textContent = 'Undo'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(34,197,94,0.08)'
                  e.currentTarget.style.borderColor = 'rgba(34,197,94,0.2)'
                  e.currentTarget.style.color = '#4ade80'
                  e.currentTarget.querySelector('span').textContent = 'Completed'
                }}
              >
                <CheckCircle2 size={13} />
                <span>Completed</span>
              </button>
            ) : (
              <button
                onClick={e => { e.stopPropagation(); complete(id) }}
                className="btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.75rem' }}
              >
                <CheckCircle2 size={12} />
                Mark Done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
