import { Menu, Search, Flame, LogIn, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useProgress } from '../../hooks/useProgress'

export default function Header({ onMenuClick }) {
  const { user, login, logout } = useAuth()
  const { streak } = useProgress()

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short'
  })

  return (
    <header
      className="flex items-center gap-3 px-4 py-3"
      style={{
        background: 'rgba(8,11,20,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.055)',
      }}
    >
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-lg transition-colors"
        style={{ color: '#64748b' }}
        onMouseEnter={e => e.currentTarget.style.color = '#e2e8f0'}
        onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
      >
        <Menu size={19} />
      </button>

      {/* Search */}
      <div
        className="flex-1 max-w-sm hidden sm:flex items-center gap-2 px-3 py-2 glass-input"
      >
        <Search size={13} style={{ color: '#475569', flexShrink: 0 }} />
        <input
          placeholder="Search topics, questions…"
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: '#cbd5e1', fontSize: '0.8125rem' }}
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Date */}
        <span className="text-xs hidden md:block" style={{ color: '#374151' }}>{today}</span>

        {/* Streak badge */}
        {streak > 0 && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: 'rgba(251,146,60,0.12)',
              border: '1px solid rgba(251,146,60,0.25)',
              color: '#fb923c',
              boxShadow: '0 0 12px rgba(249,115,22,0.2)',
            }}
          >
            <Flame size={13} className="animate-pulse-glow" />
            <span>{streak} day streak</span>
          </div>
        )}

        {/* Auth */}
        {user ? (
          <div className="flex items-center gap-2">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-8 h-8 rounded-full"
                style={{ border: '2px solid rgba(99,102,241,0.4)', boxShadow: '0 0 12px rgba(99,102,241,0.25)' }}
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
              >
                {user.displayName?.[0] ?? 'U'}
              </div>
            )}
            <button
              onClick={logout}
              title="Sign out"
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#475569' }}
              onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
              onMouseLeave={e => e.currentTarget.style.color = '#475569'}
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={login}
            className="btn-primary"
            style={{ padding: '7px 14px', fontSize: '0.8rem' }}
          >
            <LogIn size={13} />
            Sign in with Google
          </button>
        )}
      </div>
    </header>
  )
}
