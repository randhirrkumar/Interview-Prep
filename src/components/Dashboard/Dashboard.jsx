import { Link } from 'react-router-dom'
import { Flame, Target, BookOpen, TrendingUp, Clock, CheckCircle2, AlertTriangle, Zap, ArrowRight, ChevronRight } from 'lucide-react'
import { useProgress } from '../../hooks/useProgress'
import { useAuth } from '../../contexts/AuthContext'

const TOPIC_ITEMS = [
  { id: 'java-core',    label: 'Java Core & OOP',  to: '/topics/java-core',    icon: '☕', total: 40,
    gradient: 'linear-gradient(135deg,#f59e0b,#ea580c)', glow: 'rgba(245,158,11,0.25)', prog: 'linear-gradient(90deg,#f59e0b,#ea580c)' },
  { id: 'java8',        label: 'Java 8 & Streams',  to: '/topics/java8',        icon: '🌊', total: 30,
    gradient: 'linear-gradient(135deg,#10b981,#059669)', glow: 'rgba(16,185,129,0.25)', prog: 'linear-gradient(90deg,#10b981,#059669)' },
  { id: 'spring-boot',  label: 'Spring Boot',        to: '/topics/spring-boot',  icon: '🌱', total: 35,
    gradient: 'linear-gradient(135deg,#22c55e,#14b8a6)', glow: 'rgba(34,197,94,0.25)',  prog: 'linear-gradient(90deg,#22c55e,#14b8a6)' },
  { id: 'microservices',label: 'Microservices',      to: '/topics/microservices',icon: '🔗', total: 30,
    gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)', glow: 'rgba(99,102,241,0.25)', prog: 'linear-gradient(90deg,#3b82f6,#6366f1)' },
  { id: 'kafka',        label: 'Apache Kafka',        to: '/topics/kafka',        icon: '📨', total: 20,
    gradient: 'linear-gradient(135deg,#a855f7,#7c3aed)', glow: 'rgba(168,85,247,0.25)', prog: 'linear-gradient(90deg,#a855f7,#7c3aed)' },
  { id: 'sql',          label: 'SQL & MySQL',         to: '/topics/sql',          icon: '🗄️', total: 25,
    gradient: 'linear-gradient(135deg,#38bdf8,#0284c7)', glow: 'rgba(56,189,248,0.25)', prog: 'linear-gradient(90deg,#38bdf8,#0284c7)' },
  { id: 'azure',        label: 'Azure Basics',        to: '/topics/azure',        icon: '☁️', total: 20,
    gradient: 'linear-gradient(135deg,#22d3ee,#0891b2)', glow: 'rgba(34,211,238,0.25)', prog: 'linear-gradient(90deg,#22d3ee,#0891b2)' },
  { id: 'sso',          label: 'SSO / SAML',          to: '/topics/sso',          icon: '🔐', total: 15,
    gradient: 'linear-gradient(135deg,#fb7185,#e11d48)', glow: 'rgba(251,113,133,0.25)',prog: 'linear-gradient(90deg,#fb7185,#e11d48)' },
]

const WEAK_AREAS = [
  'Explaining project architecture clearly',
  'Kafka partition strategy & consumer groups',
  'System Design — scaling decisions',
  'Answering career gap questions confidently',
  'Transaction management & distributed transactions',
]

const TODAY_FOCUS = [
  { task: 'Java 8 Streams — 30 Q&A',                          type: 'study',   to: '/topics/java8' },
  { task: 'EPLMS project deep dive — architecture explanation', type: 'project', to: '/projects/eplms' },
  { task: 'Mock Interview — 15 min timed',                     type: 'mock',    to: '/mock-interview' },
  { task: 'HR: "Tell me about yourself" practice',             type: 'hr',      to: '/hr-questions' },
  { task: 'Revision: Spring Boot auto-configuration',          type: 'revision',to: '/topics/spring-boot' },
]

const QUICK_WINS = [
  { label: 'Java 8 Streams', to: '/topics/java8',      emoji: '🌊' },
  { label: 'EPLMS Project',  to: '/projects/eplms',    emoji: '🚛' },
  { label: 'HR Questions',   to: '/hr-questions',      emoji: '🤝' },
  { label: 'Flash Cards',    to: '/flashcards',        emoji: '🃏' },
  { label: 'Mock Interview', to: '/mock-interview',    emoji: '🎤' },
  { label: 'System Design',  to: '/system-design',     emoji: '🏗️' },
]

const TYPE_META = {
  study:    { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',   border: 'rgba(96,165,250,0.2)'   },
  project:  { color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.2)' },
  mock:     { color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)'  },
  hr:       { color: '#f472b6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.2)' },
  revision: { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.2)'  },
}

const TOTAL_QUESTIONS = 215

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { streak, completed, startDate } = useProgress()
  const { user } = useAuth()
  const firstName = user?.displayName?.split(' ')[0] || 'there'

  const daysLeft = startDate
    ? Math.max(0, 30 - Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000))
    : 30

  const readiness = Math.min(100, Math.round((completed.length / TOTAL_QUESTIONS) * 100))

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">

      {/* ── Hero Banner ───────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden p-7"
        style={{
          background: 'linear-gradient(135deg, rgba(20,18,60,0.9) 0%, rgba(30,16,60,0.85) 50%, rgba(10,20,50,0.9) 100%)',
          border: '1px solid rgba(99,102,241,0.25)',
          boxShadow: '0 0 60px rgba(99,102,241,0.08)',
        }}>
        {/* decorative orbs */}
        <div className="absolute animate-pulse-glow pointer-events-none"
          style={{ top: '-60px', right: '-60px', width: '280px', height: '280px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 65%)' }} />
        <div className="absolute animate-pulse-glow pointer-events-none"
          style={{ bottom: '-40px', right: '30%', width: '180px', height: '180px',
            background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 65%)',
            animationDelay: '1s' }} />

        <div className="relative z-10">
          {/* Greeting pill */}
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 text-xs font-medium"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" style={{ display: 'inline-block' }} />
            {getGreeting()}, {firstName}
          </div>

          <h1 className="text-3xl font-bold leading-tight mb-2" style={{ letterSpacing: '-0.03em' }}>
            <span className="gradient-text">Your Interview Command Center</span>
          </h1>
          <p className="text-sm max-w-lg" style={{ color: '#64748b' }}>
            Java Backend Engineer · Targeting Product &amp; Service Companies ·&nbsp;
            <span style={{ color: '#818cf8' }}>30-Day Mission to Crack It 🚀</span>
          </p>
        </div>
      </div>

      {/* ── Stat Cards ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Flame size={18} />}
          label="Day Streak" value={streak} unit="days"
          topGrad="linear-gradient(90deg,#f97316,#ef4444)"
          iconColor="rgba(251,146,60,0.2)" fg="#fb923c"
          to="/analytics"
        />
        <StatCard
          icon={<CheckCircle2 size={18} />}
          label="Completed" value={completed.length} unit="items"
          topGrad="linear-gradient(90deg,#22c55e,#16a34a)"
          iconColor="rgba(34,197,94,0.2)" fg="#4ade80"
          to="/analytics"
        />
        <StatCard
          icon={<Clock size={18} />}
          label="Days Left" value={daysLeft} unit="days"
          topGrad="linear-gradient(90deg,#38bdf8,#6366f1)"
          iconColor="rgba(56,189,248,0.2)" fg="#7dd3fc"
          to="/roadmap"
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Readiness" value={readiness} unit="%"
          topGrad="linear-gradient(90deg,#a855f7,#ec4899)"
          iconColor="rgba(168,85,247,0.2)" fg="#d8b4fe"
          to="/analytics"
        />
      </div>

      {/* ── Readiness Meter ───────────────────────────── */}
      <div className="card">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-base font-semibold text-slate-100">Interview Readiness Meter</div>
            <div className="text-xs mt-0.5" style={{ color: '#475569' }}>Based on questions completed across all topics</div>
          </div>
          <div className="text-3xl font-bold gradient-text">{readiness}%</div>
        </div>
        <div className="progress-bar" style={{ height: '8px' }}>
          <div className="progress-fill" style={{ width: `${readiness}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs" style={{ color: '#374151' }}>
          <span>0% — Not started</span>
          <span style={{ color: '#ca8a04' }}>50% — Good progress</span>
          <span style={{ color: '#16a34a' }}>100% — Interview Ready</span>
        </div>
      </div>

      {/* ── Today's Focus + Weak Areas ────────────────── */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} style={{ color: '#818cf8' }} />
            <span className="font-semibold text-slate-100">Today's Focus</span>
          </div>
          <div className="space-y-2">
            {TODAY_FOCUS.map((t, i) => {
              const meta = TYPE_META[t.type] || {}
              return (
                <Link key={i} to={t.to}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 group transition-all"
                  style={{ background: meta.bg, border: `1px solid ${meta.border}`, textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.25)'; e.currentTarget.style.transform = 'translateX(3px)' }}
                  onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)';    e.currentTarget.style.transform = 'translateX(0)' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                  <span className="text-sm flex-1" style={{ color: '#cbd5e1' }}>{t.task}</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
                    {t.type}
                  </span>
                  <ChevronRight size={13} style={{ color: meta.color, flexShrink: 0, opacity: 0.6 }} />
                </Link>
              )
            })}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} style={{ color: '#fbbf24' }} />
            <span className="font-semibold text-slate-100">Weak Areas</span>
          </div>
          <div className="space-y-2.5">
            {WEAK_AREAS.map((area, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm"
                style={{ color: '#64748b' }}>
                <span className="flex-shrink-0 mt-0.5" style={{ color: '#ca8a04' }}>⚠</span>
                <span>{area}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick Access ──────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap size={14} style={{ color: '#fbbf24' }} />
          <span className="text-sm font-semibold" style={{ color: '#94a3b8' }}>Quick Access</span>
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
          {QUICK_WINS.map((q, i) => (
            <Link key={i} to={q.to}
              className="card-hover flex flex-col items-center gap-2 rounded-xl py-4 text-center"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <span className="text-2xl">{q.emoji}</span>
              <span className="text-xs leading-tight" style={{ color: '#94a3b8' }}>{q.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Topics Progress ───────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen size={14} style={{ color: '#818cf8' }} />
            <span className="text-sm font-semibold" style={{ color: '#94a3b8' }}>Topics Progress</span>
          </div>
          <Link to="/analytics" className="flex items-center gap-1 text-xs"
            style={{ color: '#6366f1' }}
            onMouseEnter={e => e.currentTarget.style.color = '#a5b4fc'}
            onMouseLeave={e => e.currentTarget.style.color = '#6366f1'}>
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TOPIC_ITEMS.map((t) => {
            const done = completed.filter(c => c.startsWith(t.id + '_')).length
            const pct  = Math.round((done / t.total) * 100)
            return (
              <Link key={t.id} to={t.to}
                className="card card-hover group relative overflow-hidden"
                style={{ padding: '16px' }}
              >
                {/* per-topic glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 50% 0%, ${t.glow} 0%, transparent 60%)` }} />

                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3 shadow-lg"
                    style={{ background: t.gradient }}>
                    {t.icon}
                  </div>
                  <div className="text-sm font-semibold mb-0.5 group-hover:text-indigo-300 transition-colors"
                    style={{ color: '#e2e8f0' }}>
                    {t.label}
                  </div>
                  <div className="text-xs mb-3" style={{ color: '#475569' }}>{done}/{t.total} done</div>
                  <div className="progress-bar" style={{ height: '4px' }}>
                    <div style={{ height: '100%', borderRadius: '999px', background: t.prog,
                      width: `${pct}%`, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
                  </div>
                  <div className="text-xs mt-1.5 text-right" style={{ color: '#374151' }}>{pct}%</div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── Daily Motivation ──────────────────────────── */}
      <div className="rounded-2xl p-5 flex items-start gap-4"
        style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderLeft: '4px solid #6366f1',
        }}>
        <div className="text-2xl flex-shrink-0">💡</div>
        <div>
          <div className="text-sm font-semibold mb-1.5" style={{ color: '#a5b4fc' }}>Daily Reminder</div>
          <div className="text-sm italic leading-relaxed" style={{ color: '#475569' }}>
            "Consistency beats talent. One focused hour daily for 30 days is better than 10 unfocused hours in one day.
            {firstName !== 'there' ? ` ${firstName} —` : ''} you have the experience, you just need to structure it well. Let's go!"
          </div>
        </div>
      </div>

    </div>
  )
}

/* ── Sub-components ──────────────────────────────────── */

function StatCard({ icon, label, value, unit, topGrad, iconColor, fg, to }) {
  return (
    <Link to={to}
      className="card card-hover relative overflow-hidden block group"
      style={{ padding: '18px', textDecoration: 'none' }}
    >
      {/* colored top bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: topGrad }} />
      {/* icon pill */}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{ background: iconColor, color: fg }}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-slate-100 leading-none">
        {value}
        <span className="text-xs font-normal ml-1" style={{ color: '#475569' }}>{unit}</span>
      </div>
      <div className="flex items-center justify-between mt-1">
        <div className="text-xs" style={{ color: '#475569' }}>{label}</div>
        <ChevronRight size={12} style={{ color: '#374151' }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  )
}
