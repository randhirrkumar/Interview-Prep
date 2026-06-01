import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Flame, LogIn, LogOut, X, Sun, Moon } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useProgress } from '../../hooks/useProgress'
import { useTheme } from '../../contexts/ThemeContext'
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
  topic: { bg: 'rgba(99,102,241,0.18)', color: '#a5b4fc' },
  dsa:   { bg: 'rgba(20,184,166,0.18)', color: '#5eead4' },
  hr:    { bg: 'rgba(236,72,153,0.18)', color: '#f9a8d4' },
}

function SearchDropdown({ results, query, onSelect }) {
  return (
    <div
      className="absolute top-full left-0 right-0 mt-1.5 rounded-xl overflow-hidden"
      style={{
        background: 'var(--dropdown-bg)',
        border: '1px solid var(--border-dim)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
        zIndex: 9999,
      }}
    >
      {results.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <Search size={22} style={{ color: 'var(--text-dimmer)', margin: '0 auto 8px' }} />
          <p className="text-sm" style={{ color: 'var(--text-dim)' }}>No results for "{query}"</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-dimmer)' }}>Try a topic name, tag, or keyword</p>
        </div>
      ) : (
        <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => onSelect(r.route)}
              className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors"
              style={{ borderBottom: '1px solid var(--border-dimmer)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span
                className="text-xs px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 font-medium"
                style={{
                  background: TYPE_BADGE[r.type]?.bg,
                  color: TYPE_BADGE[r.type]?.color,
                  whiteSpace: 'nowrap',
                  maxWidth: '90px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {r.topicTitle}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug" style={{ color: 'var(--text-body)' }}>{r.text}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {r.difficulty && (
                    <span className="text-xs" style={{ color: DIFF_COLOR[r.difficulty] ?? 'var(--text-muted)' }}>
                      {r.difficulty}
                    </span>
                  )}
                  {r.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs" style={{ color: 'var(--text-dimmer)' }}>#{tag}</span>
                  ))}
                </div>
              </div>
            </button>
          ))}
          <div className="px-4 py-2 text-center text-xs" style={{ color: 'var(--text-dimmer)', borderTop: '1px solid var(--border-dimmer)' }}>
            {results.length} result{results.length !== 1 ? 's' : ''} · tap to open
          </div>
        </div>
      )}
    </div>
  )
}

export default function Header({ onMenuClick }) {
  const { user, login, logout } = useAuth()
  const { streak } = useProgress()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [query, setQuery]           = useState('')
  const [results, setResults]       = useState([])
  const [focused, setFocused]       = useState(false)
  const [mobileSearch, setMobile]   = useState(false)
  const searchRef     = useRef(null)
  const mobileRef     = useRef(null)
  const mobileInput   = useRef(null)

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  })

  useEffect(() => { setResults(searchAll(query)) }, [query])

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setFocused(false)
      if (mobileRef.current && !mobileRef.current.contains(e.target)) closeMobile()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(route) {
    navigate(route)
    setQuery('')
    setFocused(false)
    closeMobile()
  }

  function openMobile() {
    setMobile(true)
    setQuery('')
    setTimeout(() => mobileInput.current?.focus(), 50)
  }

  function closeMobile() {
    setMobile(false)
    setQuery('')
  }

  const showDropdown = focused && query.length >= 2
  const showMobileDropdown = mobileSearch && query.length >= 2

  return (
    <header
      className="flex items-center gap-3 px-4 py-3"
      style={{
        position: 'relative',
        zIndex: 100,
        background: 'var(--header-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* ── Mobile search overlay (full-width bar) ── */}
      {mobileSearch ? (
        <div className="flex-1 relative sm:hidden" ref={mobileRef}>
          <div className="flex items-center gap-2 px-3 py-2 glass-input">
            <Search size={13} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
            <input
              ref={mobileInput}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Escape') closeMobile()
                if (e.key === 'Enter' && results.length > 0) handleSelect(results[0].route)
              }}
              placeholder="Search topics, questions…"
              className="flex-1 bg-transparent outline-none"
              style={{ color: 'var(--text-input)', fontSize: '0.875rem' }}
            />
            <button onClick={closeMobile} style={{ color: 'var(--text-dim)' }}>
              <X size={15} />
            </button>
          </div>
          {showMobileDropdown && (
            <SearchDropdown results={results} query={query} onSelect={handleSelect} />
          )}
        </div>
      ) : (
        /* ── Normal mobile header ── */
        <>
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <Menu size={19} />
          </button>

          {/* Search icon — mobile only */}
          <button
            onClick={openMobile}
            className="sm:hidden p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <Search size={19} />
          </button>
        </>
      )}

      {/* ── Desktop search bar ── */}
      <div className="flex-1 max-w-sm hidden sm:block relative" ref={searchRef}>
        <div className="flex items-center gap-2 px-3 py-2 glass-input">
          <Search size={13} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
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
            style={{ color: 'var(--text-input)', fontSize: '0.8125rem' }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ color: 'var(--text-dim)' }}>
              <X size={12} />
            </button>
          )}
        </div>
        {showDropdown && (
          <SearchDropdown results={results} query={query} onSelect={handleSelect} />
        )}
      </div>

      {/* ── Right side — hidden while mobile search is open ── */}
      {!mobileSearch && (
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs hidden md:block" style={{ color: 'var(--text-dimmer)' }}>{today}</span>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-body)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

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
              <span className="hidden sm:inline">{streak} day streak</span>
              <span className="sm:hidden">{streak}</span>
            </div>
          )}

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
                style={{ color: 'var(--text-dim)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
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
              <span className="hidden sm:inline">Sign in with Google</span>
              <span className="sm:hidden">Sign in</span>
            </button>
          )}
        </div>
      )}
    </header>
  )
}
