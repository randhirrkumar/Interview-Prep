import { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronUp, Lightbulb, XCircle, CheckCircle } from 'lucide-react'
import hrQuestions from '../../data/hrQuestions'

const TYPE_COLORS = {
  intro: 'border-blue-700 bg-blue-950/20',
  switch: 'border-green-700 bg-green-950/20',
  gap: 'border-yellow-700 bg-yellow-950/20',
  pressure: 'border-red-700 bg-red-950/20',
  behavioral: 'border-purple-700 bg-purple-950/20',
  salary: 'border-pink-700 bg-pink-950/20',
  notice: 'border-cyan-700 bg-cyan-950/20',
  closing: 'border-orange-700 bg-orange-950/20',
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
        <p className="text-sm text-gray-400">Conversational, natural answers — especially crafted for career gap, job switch, and pressure questions. Read and practice until it sounds natural.</p>
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-2">
        {hrQuestions.sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`text-sm px-4 py-2 rounded-lg transition-colors ${activeSection === s.id ? 'bg-blue-700 text-white' : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white'}`}
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
  const border = TYPE_COLORS[q.type] || 'border-gray-700'
  const [tab, setTab] = useState('answer')

  return (
    <div className={`border rounded-xl overflow-hidden ${border}`}>
      <div className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={toggle}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${typeLabel(q.type)}`}>{q.type}</span>
          </div>
          <p className="text-sm font-medium text-gray-200">{q.question}</p>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-500 flex-shrink-0 mt-1" /> : <ChevronDown size={16} className="text-gray-500 flex-shrink-0 mt-1" />}
      </div>

      {open && (
        <div className="border-t border-gray-800 animate-fade-in">
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
                className={`text-xs px-3 py-1.5 rounded-lg mb-1 transition-colors ${tab === t.key ? 'bg-blue-900/50 text-blue-300' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-4 pt-2">
            {tab === 'answer' && (
              <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-950/50 rounded-lg p-4 border-l-2 border-blue-600">
                {q.answer}
              </div>
            )}
            {tab === 'followup' && q.followUp && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-2">The interviewer might ask these follow-up questions:</p>
                {q.followUp.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 bg-yellow-950/20 border border-yellow-800/30 rounded-lg">
                    <span className="text-yellow-400 text-xs font-bold mt-0.5">Q{i+1}</span>
                    <span className="text-sm text-gray-300">{f}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === 'recovery' && q.recovery && (
              <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap bg-blue-950/30 rounded-lg p-4 border-l-2 border-blue-500">
                {q.recovery}
              </div>
            )}
            {tab === 'mistakes' && q.mistakes && (
              <div className="space-y-2">
                <p className="text-xs text-red-400 mb-2 flex items-center gap-1"><XCircle size={12} /> Common mistakes to avoid:</p>
                {q.mistakes.map((m, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-red-950/20 border border-red-800/30 rounded-lg">
                    <XCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">{m}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === 'tip' && q.tip && (
              <div className="flex items-start gap-2 p-3 bg-yellow-950/20 border border-yellow-800/40 rounded-lg">
                <Lightbulb size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-300">{q.tip}</span>
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
    gap: 'bg-yellow-900/50 text-yellow-300',
    pressure: 'bg-red-900/50 text-red-300',
    behavioral: 'bg-purple-900/50 text-purple-300',
    salary: 'bg-pink-900/50 text-pink-300',
    intro: 'bg-blue-900/50 text-blue-300',
    switch: 'bg-green-900/50 text-green-300',
    notice: 'bg-cyan-900/50 text-cyan-300',
    closing: 'bg-orange-900/50 text-orange-300',
  }
  return m[type] || 'bg-gray-800 text-gray-400'
}
