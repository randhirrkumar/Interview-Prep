import { useState, useEffect, useRef } from 'react'
import { Play, RotateCcw, Clock, ChevronRight, CheckCircle, XCircle, MinusCircle } from 'lucide-react'
import java8 from '../../data/java8Streams'
import javaCore from '../../data/javaCore'
import springBoot from '../../data/springBoot'
import kafka from '../../data/kafka'
import microservices from '../../data/microservices'
import hrQuestions from '../../data/hrQuestions'
import { getItem, setItem, STORAGE_KEYS } from '../../utils/storage'

const ALL_QUESTIONS = [
  ...java8.questions.map(q => ({ ...q, topic: 'Java 8 & Streams' })),
  ...javaCore.questions.map(q => ({ ...q, topic: 'Java Core' })),
  ...springBoot.questions.map(q => ({ ...q, topic: 'Spring Boot' })),
  ...kafka.questions.map(q => ({ ...q, topic: 'Kafka' })),
  ...microservices.questions.map(q => ({ ...q, topic: 'Microservices' })),
].filter(q => q.difficulty === 'intermediate' || q.difficulty === 'advanced' || q.asked)

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5)

export default function MockInterview() {
  const [mode, setMode] = useState('select')
  const [type, setType] = useState('technical')
  const [difficulty, setDifficulty] = useState('mixed')
  const [questionCount, setQuestionCount] = useState(10)
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [scores, setScores] = useState([])
  const [timeLeft, setTimeLeft] = useState(120)
  const [timerActive, setTimerActive] = useState(false)
  const timerRef = useRef(null)

  const startInterview = () => {
    const pool = difficulty === 'mixed'
      ? ALL_QUESTIONS
      : ALL_QUESTIONS.filter(q => q.difficulty === difficulty)
    const selected = shuffle(pool).slice(0, questionCount)
    setQuestions(selected)
    setCurrent(0)
    setScores([])
    setShowAnswer(false)
    setMode('interview')
    startTimer()
  }

  const startTimer = () => {
    setTimeLeft(120)
    setTimerActive(true)
  }

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    } else if (timeLeft === 0) {
      setTimerActive(false)
      setShowAnswer(true)
    }
    return () => clearTimeout(timerRef.current)
  }, [timerActive, timeLeft])

  const score = (rating) => {
    const newScores = [...scores, { q: questions[current], rating }]
    setScores(newScores)
    if (current + 1 < questions.length) {
      setCurrent(c => c + 1)
      setShowAnswer(false)
      startTimer()
    } else {
      setMode('results')
    }
  }

  const scoreCount = (r) => scores.filter(s => s.rating === r).length

  if (mode === 'select') return <SelectScreen type={type} setType={setType} difficulty={difficulty} setDifficulty={setDifficulty} questionCount={questionCount} setQuestionCount={setQuestionCount} onStart={startInterview} />
  if (mode === 'results') return <ResultsScreen scores={scores} onRetry={() => setMode('select')} />

  const q = questions[current]

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">Question {current + 1} of {questions.length}</div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-mono font-bold ${timeLeft <= 30 ? 'bg-red-900/40 text-red-300' : 'bg-gray-800 text-gray-300'}`}>
            <Clock size={14} />
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
          <button onClick={() => { setTimerActive(false); setShowAnswer(true) }} className="text-xs btn-ghost py-1">Skip Timer</button>
        </div>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-1.5">
        <div className="h-1.5 rounded-full bg-blue-600 transition-all" style={{ width: `${((current) / questions.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="card border-l-4 border-blue-600">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded">{q.topic}</span>
          <span className={`diff-badge diff-${q.difficulty}`}>{q.difficulty}</span>
        </div>
        <p className="text-lg font-semibold text-white">{q.question}</p>
      </div>

      {/* Think pad */}
      {!showAnswer && (
        <div className="card border-dashed border-gray-700">
          <div className="text-xs text-gray-600 mb-2">Your thinking space (formulate your answer mentally)</div>
          <textarea
            className="w-full bg-transparent text-sm text-gray-400 outline-none resize-none min-h-[80px] placeholder-gray-700"
            placeholder="Type key points of your answer here..."
          />
          <button onClick={() => { setTimerActive(false); setShowAnswer(true) }} className="btn-primary text-sm mt-2">
            Show Answer
          </button>
        </div>
      )}

      {/* Answer reveal */}
      {showAnswer && (
        <div className="space-y-4 animate-fade-in">
          <div className="card bg-green-950/20 border-green-800/50">
            <div className="text-xs text-green-400 font-semibold mb-2">MODEL ANSWER</div>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{q.answer}</p>
          </div>

          {q.code && (
            <pre className="code-block text-xs">{q.code}</pre>
          )}

          {/* Self-assessment */}
          <div className="card">
            <div className="text-sm font-semibold text-white mb-3">How did you do?</div>
            <div className="flex gap-3">
              <button onClick={() => score('easy')} className="flex-1 flex flex-col items-center gap-1.5 p-3 bg-green-900/20 border border-green-700 rounded-xl hover:bg-green-900/40 transition-colors">
                <CheckCircle className="text-green-400" size={22} />
                <span className="text-xs text-green-300 font-medium">Nailed It</span>
              </button>
              <button onClick={() => score('medium')} className="flex-1 flex flex-col items-center gap-1.5 p-3 bg-yellow-900/20 border border-yellow-700 rounded-xl hover:bg-yellow-900/40 transition-colors">
                <MinusCircle className="text-yellow-400" size={22} />
                <span className="text-xs text-yellow-300 font-medium">Partially</span>
              </button>
              <button onClick={() => score('hard')} className="flex-1 flex flex-col items-center gap-1.5 p-3 bg-red-900/20 border border-red-700 rounded-xl hover:bg-red-900/40 transition-colors">
                <XCircle className="text-red-400" size={22} />
                <span className="text-xs text-red-300 font-medium">Missed It</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SelectScreen({ type, setType, difficulty, setDifficulty, questionCount, setQuestionCount, onStart }) {
  return (
    <div className="max-w-xl mx-auto space-y-5 animate-fade-in">
      <div className="card">
        <h1 className="section-title">Mock Interview Setup</h1>
        <p className="text-sm text-gray-400">Simulate a real interview. Timer runs for each question. Self-assess your answers.</p>
      </div>

      <div className="card space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">Interview Type</label>
          <div className="flex gap-2">
            {['technical', 'hr'].map(t => (
              <button key={t} onClick={() => setType(t)} className={`flex-1 py-2 rounded-lg text-sm capitalize transition-colors ${type === t ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>{t}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">Difficulty</label>
          <div className="flex gap-2 flex-wrap">
            {['mixed', 'beginner', 'intermediate', 'advanced'].map(d => (
              <button key={d} onClick={() => setDifficulty(d)} className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${difficulty === d ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>{d}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">Number of Questions: {questionCount}</label>
          <input type="range" min="5" max="20" value={questionCount} onChange={e => setQuestionCount(+e.target.value)} className="w-full accent-blue-500" />
          <div className="flex justify-between text-xs text-gray-600 mt-1"><span>5</span><span>20</span></div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg text-sm text-gray-400">
          <Clock size={14} className="text-blue-400" />
          <span>2 minutes per question. Timer visible on screen. You can skip the timer anytime.</span>
        </div>

        <button onClick={onStart} className="w-full btn-primary flex items-center justify-center gap-2 py-3">
          <Play size={16} />
          Start Interview
        </button>
      </div>
    </div>
  )
}

function ResultsScreen({ scores, onRetry }) {
  const easy = scores.filter(s => s.rating === 'easy').length
  const med = scores.filter(s => s.rating === 'medium').length
  const hard = scores.filter(s => s.rating === 'hard').length
  const pct = Math.round((easy * 100 + med * 50) / (scores.length * 100) * 100)

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-fade-in">
      <div className={`card text-center border-l-4 ${pct >= 70 ? 'border-green-500' : pct >= 50 ? 'border-yellow-500' : 'border-red-500'}`}>
        <div className="text-5xl mb-3">{pct >= 70 ? '🎉' : pct >= 50 ? '💪' : '📚'}</div>
        <div className="text-3xl font-bold text-white mb-1">{pct}%</div>
        <div className="text-gray-400 text-sm">{pct >= 70 ? 'Great performance!' : pct >= 50 ? 'Good, keep practicing weak areas' : 'Needs more revision — focus on marked topics'}</div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[['Nailed It', easy, 'text-green-400', 'bg-green-900/20'], ['Partially', med, 'text-yellow-400', 'bg-yellow-900/20'], ['Missed', hard, 'text-red-400', 'bg-red-900/20']].map(([label, count, color, bg]) => (
          <div key={label} className={`card ${bg} text-center`}>
            <div className={`text-2xl font-bold ${color}`}>{count}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {hard > 0 && (
        <div className="card">
          <div className="text-sm font-semibold text-red-300 mb-2">Review these — you missed them:</div>
          <div className="space-y-2">
            {scores.filter(s => s.rating === 'hard').map((s, i) => (
              <div key={i} className="text-xs text-gray-400 p-2 bg-gray-800 rounded">• {s.q.question}</div>
            ))}
          </div>
        </div>
      )}

      <button onClick={onRetry} className="w-full btn-primary flex items-center justify-center gap-2 py-3">
        <RotateCcw size={16} />
        Try Again
      </button>
    </div>
  )
}
