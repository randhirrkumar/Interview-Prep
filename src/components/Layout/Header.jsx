import { useState, useEffect } from 'react'
import { Menu, Search, Flame } from 'lucide-react'
import { getItem, STORAGE_KEYS } from '../../utils/storage'

export default function Header({ onMenuClick }) {
  const [streak, setStreak] = useState(0)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setStreak(getItem(STORAGE_KEYS.STREAK, 0))
  }, [])

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
          value={search}
          onChange={e => setSearch(e.target.value)}
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
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">RK</div>
      </div>
    </header>
  )
}
