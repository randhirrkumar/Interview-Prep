import { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronUp, Lightbulb, XCircle } from 'lucide-react'
import hrQuestions from '../../data/hrQuestions'

const TYPE_COLORS = {
  intro:      'border-blue-400 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/20',
  switch:     'border-green-400 bg-green-50 dark:border-green-700 dark:bg-green-950/20',
  gap:        'border-yellow-400 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-950/20',
  pressure:   'border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950/20',
  behavioral: 'border-purple-400 bg-purple-50 dark:border-purple-700 dark:bg-purple-950/20',
  salary:     'border-pink-400 bg-pink-50 dark:border-pink-700 dark:bg-pink-950/20',
  notice:     'border-cyan-400 bg-cyan-50 dark:border-cyan-700 dark:bg-cyan-950/20',
  closing:    'border-orange-400 bg-orange-50 dark:border-orange-700 dark:bg-orange-950/20',
}

export default function HRQuestions() {
  const [activeSection, setActiveSection] = useState('gap')
  const [openId, setOpenId] = useState(null)

  const section = hrQuestions.sections.find(s => s.id === activeSection) || hrQuestions.sections[0]

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card border-l-4 border-yellow-500">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="text-yellow-400" size={24} />
          <h1 className="section-title mb-0">HR & Behavioral Questions</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Conversational, natural answers — especially crafted for career gap, job switch, and pressure questions. Read and practice until it sounds natural.</p>
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-2">
        {hrQuestions.sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`text-sm px-4 py-2 rounded-lg transition-colors ${
              activeSection === s.id
                ? 'bg-blue-700 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {section.questions.map(q => (
          <QuestionItem key={q.id} q={q} open={openId === q.id} toggle={() => setOpenId(openId === q.id ? null : q.id)} />
        ))}
      </div>
    </div>
  )
}

function QuestionItem({ q, open, toggle }) {
  const border = TYPE_COLORS[q.type] || 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-transparent'
  const [tab, setTab] = useState('answer')

  return (
    <div className={`border rounded-xl overflow-hidden ${border}`}>
      <div className="flex items-start gap-3 p-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors" onClick={toggle}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${typeLabel(q.type)}`}>{q.type}</span>
          </div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{q.question}</p>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0 mt-1" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0 mt-1" />}
      </div>

      {open && (
        <div className="border-t border-gray-200 dark:border-gray-800 animate-fade-in">
          {/* Tabs */}
          <div className="flex gap-1 px-4 pt-3 flex-wrap">
            {[
              { key: 'answer', label: 'Model Answer' },
              ...(q.followUp ? [{ key: 'followup', label: 'Follow-up Q' }] : []),
              ...(q.recovery ? [{ key: 'recovery', label: 'Recovery' }] : []),
              ...(q.mistakes ? [{ key: 'mistakes', label: 'Avoid These' }] : []),
              ...(q.tip ? [{ key: 'tip', label: 'Tip' }] : []),
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`text-xs px-3 py-1.5 rounded-lg mb-1 transition-colors ${
                  tab === t.key
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-4 pt-2">
            {tab === 'answer' && (
              <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-gray-950/50 rounded-lg p-4 border-l-2 border-blue-600">
                {q.answer}
              </div>
            )}
            {tab === 'followup' && q.followUp && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-2">The interviewer might ask these follow-up questions:</p>
                {q.followUp.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 bg-yellow-50 border border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800/30 rounded-lg">
                    <span className="text-yellow-500 dark:text-yellow-400 text-xs font-bold mt-0.5">Q{i+1}</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{f}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === 'recovery' && q.recovery && (
              <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border-l-2 border-blue-500">
                {q.recovery}
              </div>
            )}
            {tab === 'mistakes' && q.mistakes && (
              <div className="space-y-2">
                <p className="text-xs text-red-500 dark:text-red-400 mb-2 flex items-center gap-1"><XCircle size={12} /> Common mistakes to avoid:</p>
                {q.mistakes.map((m, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-800/30 rounded-lg">
                    <XCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{m}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === 'tip' && q.tip && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800/40 rounded-lg">
                <Lightbulb size={16} className="text-yellow-500 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{q.tip}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function typeLabel(type) {
  const m = {
    gap:       'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
    pressure:  'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    behavioral:'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    salary:    'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
    intro:     'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    switch:    'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    notice:    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
    closing:   'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  }
  return m[type] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
}
