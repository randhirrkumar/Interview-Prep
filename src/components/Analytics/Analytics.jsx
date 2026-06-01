import { useMemo } from 'react'
import { TrendingUp, CheckCircle, BookOpen, Target, Award, Calendar } from 'lucide-react'
import { useProgress } from '../../hooks/useProgress'

import javaCore from '../../data/javaCore'
import java8 from '../../data/java8Streams'
import springBoot from '../../data/springBoot'
import microservices from '../../data/microservices'
import kafka from '../../data/kafka'
import sql from '../../data/sql'
import azure from '../../data/azure'
import sso from '../../data/sso'
import multithreading from '../../data/multithreading'
import collections from '../../data/collections'
import hibernate from '../../data/hibernate'
import security from '../../data/security'
import designPatterns from '../../data/designPatterns'
import docker from '../../data/docker'
import testing from '../../data/testing'
import dsaProblems from '../../data/dsaProblems'

const TOPICS = [
  { id: 'java-core', data: javaCore, color: 'bg-blue-500' },
  { id: 'java8', data: java8, color: 'bg-cyan-500' },
  { id: 'multithreading', data: multithreading, color: 'bg-purple-500' },
  { id: 'collections', data: collections, color: 'bg-indigo-500' },
  { id: 'spring-boot', data: springBoot, color: 'bg-green-500' },
  { id: 'microservices', data: microservices, color: 'bg-teal-500' },
  { id: 'hibernate', data: hibernate, color: 'bg-orange-500' },
  { id: 'kafka', data: kafka, color: 'bg-red-500' },
  { id: 'sql', data: sql, color: 'bg-yellow-500' },
  { id: 'azure', data: azure, color: 'bg-sky-500' },
  { id: 'sso', data: sso, color: 'bg-pink-500' },
  { id: 'security', data: security, color: 'bg-rose-500' },
  { id: 'design-patterns', data: designPatterns, color: 'bg-violet-500' },
  { id: 'docker', data: docker, color: 'bg-blue-400' },
  { id: 'testing', data: testing, color: 'bg-lime-500' },
]

function BarChart({ percent, color }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-full h-2">
        <div className={`h-2 rounded-full ${color} transition-all duration-700`} style={{ width: `${percent}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-10 text-right">{percent}%</span>
    </div>
  )
}

export default function Analytics() {
  const { completed, streak, startDate } = useProgress()

  const stats = useMemo(() => {
    const topicStats = TOPICS.map(({ id, data, color }) => {
      const total = data.questions.length
      const done = data.questions.filter(q => completed.includes(id + '_' + q.id)).length
      const pct = total ? Math.round((done / total) * 100) : 0
      return { id, title: data.title, total, done, pct, color }
    })

    const dsaDone = dsaProblems.filter(p => completed.includes('dsa_' + p.id)).length

    const totalQuestions = topicStats.reduce((s, t) => s + t.total, 0) + dsaProblems.length
    const totalDone = topicStats.reduce((s, t) => s + t.done, 0) + dsaDone
    const overallPct = totalQuestions ? Math.round((totalDone / totalQuestions) * 100) : 0

    const strong = topicStats.filter(t => t.pct >= 70).sort((a, b) => b.pct - a.pct)
    const weak = topicStats.filter(t => t.pct < 40 && t.total > 0).sort((a, b) => a.pct - b.pct)

    const daysStudying = startDate
      ? Math.max(1, Math.ceil((Date.now() - new Date(startDate).getTime()) / 86400000))
      : 1

    return { topicStats, dsaDone, totalQuestions, totalDone, overallPct, strong, weak, daysStudying }
  }, [completed])

  const readinessLevel = stats.overallPct >= 80 ? { label: 'Interview Ready', color: 'text-green-500 dark:text-green-400' }
    : stats.overallPct >= 50 ? { label: 'Good Progress', color: 'text-yellow-500 dark:text-yellow-400' }
    : stats.overallPct >= 25 ? { label: 'Building Up', color: 'text-orange-500 dark:text-orange-400' }
    : { label: 'Just Started', color: 'text-red-500 dark:text-red-400' }

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card">
        <h1 className="section-title">Progress Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Your study progress across all topics at a glance.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: CheckCircle, label: 'Completed', value: stats.totalDone, sub: `/ ${stats.totalQuestions}`, color: 'text-green-500 dark:text-green-400' },
          { icon: TrendingUp, label: 'Overall', value: stats.overallPct + '%', sub: readinessLevel.label, color: readinessLevel.color },
          { icon: Calendar, label: 'Day Streak', value: streak, sub: 'days', color: 'text-orange-500 dark:text-orange-400' },
          { icon: Award, label: 'Days Studying', value: stats.daysStudying, sub: 'total', color: 'text-purple-500 dark:text-purple-400' },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="card text-center py-4">
            <Icon size={20} className={`${color} mx-auto mb-2`} />
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
            <div className="text-xs text-gray-400 dark:text-gray-600">{sub}</div>
          </div>
        ))}
      </div>

      {/* Overall readiness bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-gray-900 dark:text-white">Overall Readiness</div>
          <div className={`text-lg font-bold ${readinessLevel.color}`}>{stats.overallPct}%</div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 transition-all duration-700"
            style={{ width: `${stats.overallPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0% — Just Started</span>
          <span>50% — Good Progress</span>
          <span>100% — Ready</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Strong topics */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Award size={16} className="text-green-400" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Strong Topics</h2>
            <span className="text-xs text-gray-500">({stats.strong.length})</span>
          </div>
          {stats.strong.length === 0 ? (
            <div className="text-sm text-gray-400 dark:text-gray-600 text-center py-4">Complete 70%+ of any topic to see it here.</div>
          ) : (
            <div className="space-y-3">
              {stats.strong.map(t => (
                <div key={t.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500 dark:text-gray-400">{t.title}</span>
                    <span className="text-green-500 dark:text-green-400">{t.done}/{t.total}</span>
                  </div>
                  <BarChart percent={t.pct} color="bg-green-500" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weak topics */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-red-400" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Needs Attention</h2>
            <span className="text-xs text-gray-500">({stats.weak.length})</span>
          </div>
          {stats.weak.length === 0 ? (
            <div className="text-sm text-gray-400 dark:text-gray-600 text-center py-4">No weak topics yet. Keep studying!</div>
          ) : (
            <div className="space-y-3">
              {stats.weak.map(t => (
                <div key={t.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500 dark:text-gray-400">{t.title}</span>
                    <span className="text-red-400">{t.done}/{t.total}</span>
                  </div>
                  <BarChart percent={t.pct} color="bg-red-500" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All topics breakdown */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={16} className="text-blue-400" />
          <h2 className="font-semibold text-gray-900 dark:text-white">All Topics Breakdown</h2>
        </div>
        <div className="space-y-3">
          {stats.topicStats.map(t => (
            <div key={t.id}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500 dark:text-gray-400">{t.title}</span>
                <span className="text-gray-500">{t.done}/{t.total}</span>
              </div>
              <BarChart percent={t.pct} color={t.color} />
            </div>
          ))}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500 dark:text-gray-400">DSA Problems</span>
              <span className="text-gray-500">{stats.dsaDone}/{dsaProblems.length}</span>
            </div>
            <BarChart percent={dsaProblems.length ? Math.round((stats.dsaDone / dsaProblems.length) * 100) : 0} color="bg-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  )
}
