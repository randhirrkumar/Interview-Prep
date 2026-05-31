import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Flame, LogIn, LogOut, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useProgress } from '../../hooks/useProgress'
import { searchAll } from '../../utils/searchIndex'

const DIFF_COLOR = {
  beginner:     '#4ade80',
  intermediate: '#fbbf24',
  advanced:     '#f87171',
  Easy:         '#4ade80',
  Medium:       '#fbbf24',
  Hard:         '#f87171',
}

const TYPE_BADGE = {
  topic: { bg: 'rgba(99,102,241,0.18)',  color: '#a5b4fc' },
  dsa:   { bg: 'rgba(20,184,166,0.18)',  color: '#5eead4' },
  hr:    { bg: 'rgba(236,72,153,0.18)',  color: '#f9a8d4' },
}

export default function Header({ onMenuClick }) {
  const { user, login, logout } = useAuth()
  const { streak } = useProgress()
  const navigate = useNavigate()

  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [focused, setFocused] = useState(false)
  const searchRef = useRef(null)

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  })

  useEffect(() => {
    setResults(searchAll(query))
  }, [query])

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(route) {
    navigate(route)
    setQuery('')
    setFocused(false)
  }

  const showDropdown = focused && query.length >= 2

  return (
    <header
      className="flex items-center gap-3 px-4 py-3"
      style={{
        position: 'relative',
        zIndex: 100,
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
      <div className="flex-1 max-w-sm hidden sm:block relative" ref={searchRef}>
        <div className="flex items-center gap-2 px-3 py-2 glass-input">
          <Search size={13} style={{ color: '#475569', flexShrink: 0 }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={e => {
              if (e.key === 'Escape') { setFocused(false); setQuery('') }
              if (e.key === 'Enter' && results.length > 0) handleSelect(results[0].route)
            }}
            placeholder="Search topics, questions…"
            className="flex-1 bg-transparent outline-none"
            style={{ color: '#cbd5e1', fontSize: '0.8125rem' }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ color: '#475569' }}>
              <X size={12} />
            </button>
          )}
        </div>

        {/* Results dropdown */}
        {showDropdown && (
          <div
            className="absolute top-full left-0 right-0 mt-1.5 rounded-xl overflow-hidden"
            style={{
              background: '#0b0e1f',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
              zIndex: 9999,
            }}
          >
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Search size={22} style={{ color: '#374151', margin: '0 auto 8px' }} />
                <p className="text-sm" style={{ color: '#475569' }}>No results for "{query}"</p>
                <p className="text-xs mt-1" style={{ color: '#374151' }}>Try a topic name, tag, or keyword</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {results.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(r.route)}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span
                      className="text-xs px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 font-medium"
                      style={{
                        background: TYPE_BADGE[r.type]?.bg,
                        color: TYPE_BADGE[r.type]?.color,
                        whiteSpace: 'nowrap',
                        maxWidth: '100px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {r.topicTitle}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug" style={{ color: '#e2e8f0' }}>
                        {r.text}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {r.difficulty && (
                          <span className="text-xs" style={{ color: DIFF_COLOR[r.difficulty] ?? '#64748b' }}>
                            {r.difficulty}
                          </span>
                        )}
                        {r.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs" style={{ color: '#374151' }}>#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
                <div className="px-4 py-2 text-center text-xs" style={{ color: '#374151', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  {results.length} result{results.length !== 1 ? 's' : ''} · Enter to open first · Esc to close
                </div>
              </div>
            )}
          </div>
        )}
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
