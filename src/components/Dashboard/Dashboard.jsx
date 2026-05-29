import { Link } from 'react-router-dom'
import { Flame, Target, BookOpen, TrendingUp, Clock, CheckCircle2, AlertTriangle, Zap } from 'lucide-react'
import { useProgress } from '../../hooks/useProgress'

const TOPIC_ITEMS = [
  { id: 'java-core', label: 'Java Core & OOP', to: '/topics/java-core', color: 'from-blue-600 to-blue-800', icon: '☕', total: 40 },
  { id: 'java8', label: 'Java 8 & Streams', to: '/topics/java8', color: 'from-green-600 to-green-800', icon: '🌊', total: 30 },
  { id: 'spring-boot', label: 'Spring Boot', to: '/topics/spring-boot', color: 'from-purple-600 to-purple-800', icon: '🌱', total: 35 },
  { id: 'microservices', label: 'Microservices', to: '/topics/microservices', color: 'from-pink-600 to-pink-800', icon: '🔗', total: 30 },
  { id: 'kafka', label: 'Apache Kafka', to: '/topics/kafka', color: 'from-orange-600 to-orange-800', icon: '📨', total: 20 },
  { id: 'sql', label: 'SQL & MySQL', to: '/topics/sql', color: 'from-cyan-600 to-cyan-800', icon: '🗄️', total: 25 },
  { id: 'azure', label: 'Azure Basics', to: '/topics/azure', color: 'from-sky-600 to-sky-800', icon: '☁️', total: 20 },
  { id: 'sso', label: 'SSO / SAML', to: '/topics/sso', color: 'from-red-600 to-red-800', icon: '🔐', total: 15 },
]

const WEAK_AREAS = [
  'Explaining project architecture clearly',
  'Kafka partition strategy & consumer groups',
  'System Design — scaling decisions',
  'Answering career gap questions confidently',
  'Transaction management & distributed transactions',
]

const TODAY_FOCUS = [
  { task: 'Java 8 Streams — 30 Q&A', type: 'study' },
  { task: 'EPLMS project deep dive — architecture explanation', type: 'project' },
  { task: 'Mock Interview — 15 min timed', type: 'mock' },
  { task: 'HR: "Tell me about yourself" practice', type: 'hr' },
  { task: 'Revision: Spring Boot auto-configuration', type: 'revision' },
]

const QUICK_WINS = [
  { label: 'Java 8 Streams', to: '/topics/java8', emoji: '🌊' },
  { label: 'EPLMS Project', to: '/projects/eplms', emoji: '🚛' },
  { label: 'HR Questions', to: '/hr-questions', emoji: '🤝' },
  { label: 'Flash Cards', to: '/flashcards', emoji: '🃏' },
  { label: 'Mock Interview', to: '/mock-interview', emoji: '🎤' },
  { label: 'System Design', to: '/system-design', emoji: '🏗️' },
]

const TOTAL_QUESTIONS = 215

export default function Dashboard() {
  const { streak, completed, startDate } = useProgress()

  const daysLeft = startDate
    ? Math.max(0, 30 - Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000))
    : 30

  const readiness = Math.min(100, Math.round((completed.length / TOTAL_QUESTIONS) * 100))

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">

      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-blue-900/60 to-purple-900/40 border border-blue-800/50 rounded-2xl p-6 overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">Good {getGreeting()}, Randhir</div>
          <h1 className="text-2xl font-bold text-white mb-1">Your Interview Prep Dashboard</h1>
          <p className="text-gray-400 text-sm max-w-xl">Java Backend Engineer · 4+ Years · Targeting Product & Service Companies · Let's crack it in 30 days 🚀</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Flame className="text-orange-400" size={20} />} label="Day Streak" value={streak} unit="days" bg="bg-orange-900/20 border-orange-800/40" />
        <StatCard icon={<CheckCircle2 className="text-green-400" size={20} />} label="Completed" value={completed.length} unit="topics" bg="bg-green-900/20 border-green-800/40" />
        <StatCard icon={<Clock className="text-blue-400" size={20} />} label="Days Left" value={daysLeft} unit="days" bg="bg-blue-900/20 border-blue-800/40" />
        <StatCard icon={<TrendingUp className="text-purple-400" size={20} />} label="Readiness" value={readiness} unit="%" bg="bg-purple-900/20 border-purple-800/40" />
      </div>

      {/* Interview Readiness Meter */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-semibold text-white">Interview Readiness Meter</div>
            <div className="text-xs text-gray-500">Based on topics completed</div>
          </div>
          <div className="text-2xl font-bold text-blue-400">{readiness}%</div>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 mb-2">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
            style={{ width: `${readiness}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>0% — Not started</span>
          <span className="text-yellow-600">50% — Good progress</span>
          <span className="text-green-600">100% — Interview Ready</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Today's Focus */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} className="text-blue-400" />
            <span className="font-semibold text-white">Today's Focus</span>
          </div>
          <div className="space-y-2">
            {TODAY_FOCUS.map((t, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-800/50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${typeColor(t.type)}`} />
                <span className="text-sm text-gray-300 flex-1">{t.task}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${typeBadge(t.type)}`}>{t.type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Areas */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-yellow-400" />
            <span className="font-semibold text-white">Weak Areas</span>
          </div>
          <div className="space-y-2">
            {WEAK_AREAS.map((area, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-400">
                <span className="text-yellow-500 mt-0.5 flex-shrink-0">⚠</span>
                <span>{area}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-yellow-400" />
          <span className="text-sm font-semibold text-gray-300">Quick Access</span>
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
          {QUICK_WINS.map((q, i) => (
            <Link key={i} to={q.to} className="flex flex-col items-center gap-1.5 p-3 bg-gray-900 border border-gray-800 rounded-xl hover:border-blue-700 hover:bg-gray-800 transition-all text-center">
              <span className="text-xl">{q.emoji}</span>
              <span className="text-xs text-gray-400">{q.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Topic Cards */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={16} className="text-blue-400" />
          <span className="text-sm font-semibold text-gray-300">Topics Progress</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TOPIC_ITEMS.map((t) => {
            const done = completed.filter(c => c.startsWith(t.id + '_')).length
            const pct = Math.round((done / t.total) * 100)
            return (
              <Link key={t.id} to={t.to} className="card hover:border-gray-600 transition-all group">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center text-xl mb-3`}>
                  {t.icon}
                </div>
                <div className="font-medium text-sm text-white mb-1 group-hover:text-blue-300">{t.label}</div>
                <div className="text-xs text-gray-500 mb-2">{done}/{t.total} completed</div>
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-blue-600 transition-all" style={{ width: `${pct}%` }} />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Motivation */}
      <div className="card bg-gradient-to-r from-gray-900 to-gray-900 border-l-4 border-blue-500">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <div className="text-sm font-semibold text-blue-300 mb-1">Daily Reminder</div>
            <div className="text-sm text-gray-400 italic">"Consistency beats talent. One focused hour daily for 30 days is better than 10 unfocused hours on one day. Randhir — you have the experience, you just need to structure it well. Let's go!"</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, unit, bg }) {
  return (
    <div className={`card flex items-center gap-3 border ${bg}`}>
      {icon}
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-xl font-bold text-white">{value}<span className="text-xs text-gray-500 ml-1">{unit}</span></div>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function typeColor(t) {
  const m = { study: 'bg-blue-500', project: 'bg-purple-500', mock: 'bg-green-500', hr: 'bg-pink-500', revision: 'bg-yellow-500' }
  return m[t] || 'bg-gray-500'
}

function typeBadge(t) {
  const m = { study: 'bg-blue-900/50 text-blue-300', project: 'bg-purple-900/50 text-purple-300', mock: 'bg-green-900/50 text-green-300', hr: 'bg-pink-900/50 text-pink-300', revision: 'bg-yellow-900/50 text-yellow-300' }
  return m[t] || ''
}
