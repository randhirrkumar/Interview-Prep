import { Menu, Search, Flame, LogIn, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useProgress } from '../../hooks/useProgress'

export default function Header({ onMenuClick }) {
  const { user, login, logout } = useAuth()
  const { streak } = useProgress()

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <header className="bg-gray-900/80 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center gap-3">
      <button onClick={onMenuClick} className="lg:hidden text-gray-400 hover:text-white">
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md hidden sm:flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5">
        <Search size={14} className="text-gray-500" />
        <input
          placeholder="Search topics, questions…"
          className="flex-1 bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="text-xs text-gray-500 hidden md:block">{today}</div>
        {streak > 0 && (
          <div className="flex items-center gap-1 bg-orange-900/30 border border-orange-800/50 rounded-full px-3 py-1">
            <Flame size={14} className="text-orange-400" />
            <span className="text-xs font-bold text-orange-300">{streak} day streak</span>
          </div>
        )}

        {user ? (
          <div className="flex items-center gap-2">
            {user.photoURL
              ? <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full" />
              : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                  {user.displayName?.[0] || 'U'}
                </div>
            }
            <button
              onClick={logout}
              title="Sign out"
              className="text-gray-500 hover:text-red-400 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={login}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogIn size={14} />
            Sign in
          </button>
        )}
      </div>
    </header>
  )
}
