import { useState } from 'react'
import { CheckCircle2, Clock, MessageSquare } from 'lucide-react'
import roadmapData from '../../data/roadmap'
import { useProgress } from '../../contexts/ProgressContext'

export default function Roadmap() {
  const [activeWeek, setActiveWeek] = useState(1)
  const week = roadmapData.weeks.find(w => w.week === activeWeek)

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      <div className="card">
        <h1 className="section-title">30-Day Interview Preparation Roadmap</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Structured daily plan to crack Java Backend Developer interviews in 1 month. Consistent daily effort beats random preparation.</p>
      </div>

      {/* Week tabs */}
      <div className="flex gap-2 flex-wrap">
        {roadmapData.weeks.map(w => (
          <button
            key={w.week}
            onClick={() => setActiveWeek(w.week)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              activeWeek === w.week
                ? 'bg-blue-700 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Week {w.week}: {w.title}
          </button>
        ))}
      </div>

      {week && (
        <div className="space-y-4 animate-fade-in">
          {/* Week header */}
          <div className="card border-l-4 border-blue-500">
            <div className="text-xs text-blue-400 uppercase tracking-wider mb-1">Week {week.week}</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{week.title}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{week.theme}</div>
          </div>

          {/* Days */}
          <div className="space-y-3">
            {week.days.map((day) => (
              <DayCard key={day.day} day={day} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DayCard({ day }) {
  const id = `roadmap_day_${day.day}`
  const { isCompleted, complete, uncomplete } = useProgress()
  const done = isCompleted(id)

  const toggle = () => {
    if (done) uncomplete(id)
    else complete(id)
  }

  return (
    <div className={`card transition-all ${done ? 'border-green-800/50 opacity-70' : 'border-gray-200 dark:border-gray-800'}`}>
      <div className="flex items-start gap-3">
        <button onClick={toggle} className="flex-shrink-0 mt-1">
          {done
            ? <CheckCircle2 size={20} className="text-green-500" />
            : <div className="w-5 h-5 border-2 border-gray-400 dark:border-gray-600 rounded-full hover:border-blue-500 transition-colors" />
          }
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-semibold text-gray-900 dark:text-white text-sm">{day.date}</span>
            <span className="flex items-center gap-1 text-xs text-gray-500"><Clock size={11} />{day.duration}</span>
            {day.mock && (
              <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 px-2 py-0.5 rounded">
                <MessageSquare size={10} />Mock Interview
              </span>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-blue-400 mb-1">TODAY'S TOPICS</div>
              <div className="space-y-1">
                {day.topics.map((t, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                    <span className="text-blue-500">▸</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-yellow-400 mb-1">REVISION</div>
              <div className="space-y-1">
                {day.revision.map((r, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <span className="text-yellow-500">↺</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {!done && (
          <button onClick={toggle} className="btn-primary text-xs py-1 flex-shrink-0">Done</button>
        )}
      </div>
    </div>
  )
}
