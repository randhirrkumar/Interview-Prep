import { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle, Code2 } from 'lucide-react'
import dsaProblems from '../../data/dsaProblems'
import { useProgress } from '../../hooks/useProgress'

const CATEGORIES = ['All', 'Arrays & Hashing', 'Arrays', 'Linked List', 'Stack', 'Trees', 'Strings', 'Dynamic Programming', 'Binary Search']
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard']

const DIFF_COLOR = {
  Easy:   'text-green-600 bg-green-100 border-green-300 dark:text-green-400 dark:bg-green-900/30 dark:border-green-800/50',
  Medium: 'text-yellow-600 bg-yellow-100 border-yellow-300 dark:text-yellow-400 dark:bg-yellow-900/30 dark:border-yellow-800/50',
  Hard:   'text-red-600 bg-red-100 border-red-300 dark:text-red-400 dark:bg-red-900/30 dark:border-red-800/50',
}

export default function DSAProblems() {
  const [category, setCategory] = useState('All')
  const [difficulty, setDifficulty] = useState('All')
  const [expanded, setExpanded] = useState(null)
  const [showSolution, setShowSolution] = useState({})
  const { isCompleted, complete } = useProgress()

  const filtered = dsaProblems.filter(p => {
    const matchCat = category === 'All' || p.category === category
    const matchDiff = difficulty === 'All' || p.difficulty === difficulty
    return matchCat && matchDiff
  })

  const solved = dsaProblems.filter(p => isCompleted('dsa_' + p.id)).length

  const toggle = (id) => setExpanded(prev => prev === id ? null : id)
  const toggleSolution = (id) => setShowSolution(prev => ({ ...prev, [id]: !prev[id] }))

  const inactiveBtn = 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white'

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="section-title">DSA Coding Problems</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Practice Java solutions for common data structures and algorithm problems.</p>
            <div className="flex gap-2 flex-wrap">
              {['Arrays', 'LinkedList', 'DP', 'Trees', 'Stack'].map(t => (
                <span key={t} className="tag bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">{t}</span>
              ))}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-green-500 dark:text-green-400">{solved}</div>
            <div className="text-xs text-gray-500">/{dsaProblems.length} solved</div>
          </div>
        </div>
        <div className="mt-3 w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-green-600 to-blue-600 transition-all"
            style={{ width: `${dsaProblems.length ? (solved / dsaProblems.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${category === c ? 'bg-blue-700 text-white' : inactiveBtn}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {DIFFICULTIES.map(d => (
            <button key={d} onClick={() => setDifficulty(d)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${difficulty === d ? 'bg-purple-700 text-white' : inactiveBtn}`}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Problems */}
      <div className="space-y-3">
        {filtered.map(problem => {
          const done = isCompleted('dsa_' + problem.id)
          const isOpen = expanded === problem.id
          return (
            <div key={problem.id} className={`card transition-all ${done ? 'border-green-800/40' : ''}`}>
              {/* Problem header */}
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggle(problem.id)}>
                <button
                  onClick={e => { e.stopPropagation(); complete('dsa_' + problem.id) }}
                  className={`flex-shrink-0 ${done ? 'text-green-400' : 'text-gray-400 dark:text-gray-600 hover:text-green-400'} transition-colors`}
                >
                  <CheckCircle size={18} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400"># {problem.id}</span>
                    <span className={`font-medium text-sm ${done ? 'text-green-400 dark:text-green-300' : 'text-gray-900 dark:text-white'}`}>{problem.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${DIFF_COLOR[problem.difficulty]}`}>{problem.difficulty}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{problem.category}</span>
                  </div>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
              </div>

              {/* Expanded content */}
              {isOpen && (
                <div className="mt-4 space-y-4 border-t border-gray-200 dark:border-gray-800 pt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">{problem.description}</p>

                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Examples</div>
                    <div className="space-y-2">
                      {problem.examples.map((ex, i) => (
                        <div key={i} className="bg-gray-100 dark:bg-gray-800/60 rounded-lg p-3 text-xs font-mono">
                          <div><span className="text-gray-500">Input: </span><span className="text-blue-600 dark:text-blue-300">{ex.input}</span></div>
                          <div><span className="text-gray-500">Output: </span><span className="text-green-600 dark:text-green-300">{ex.output}</span></div>
                          {ex.explanation && <div><span className="text-gray-500">Explanation: </span><span className="text-gray-600 dark:text-gray-400">{ex.explanation}</span></div>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/30 rounded-lg px-3 py-2 text-xs">
                      <span className="text-gray-500">Time: </span><span className="text-blue-600 dark:text-blue-300 font-mono">{problem.complexity.time}</span>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 dark:bg-purple-900/20 dark:border-purple-800/30 rounded-lg px-3 py-2 text-xs">
                      <span className="text-gray-500">Space: </span><span className="text-purple-600 dark:text-purple-300 font-mono">{problem.complexity.space}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Approach</div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{problem.approach}</p>
                  </div>

                  <div>
                    <button
                      onClick={() => toggleSolution(problem.id)}
                      className="flex items-center gap-2 text-xs font-semibold text-yellow-500 dark:text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300 transition-colors mb-2"
                    >
                      <Code2 size={14} />
                      {showSolution[problem.id] ? 'Hide Solution' : 'Show Java Solution'}
                    </button>
                    {showSolution[problem.id] && (
                      <pre className="bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-700 rounded-lg p-4 text-xs text-green-700 dark:text-green-300 overflow-x-auto font-mono leading-relaxed">
                        {problem.solution}
                      </pre>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-600">No problems match your filter.</div>
        )}
      </div>
    </div>
  )
}
