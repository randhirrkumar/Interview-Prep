import { useState, useEffect } from 'react'
import { getItem, setItem, STORAGE_KEYS, updateStreak, markCompleted, isCompleted, toggleBookmark, isBookmarked } from '../utils/storage'

export function useProgress() {
  const [streak, setStreak] = useState(0)
  const [completed, setCompleted] = useState([])
  const [bookmarks, setBookmarks] = useState([])

  useEffect(() => {
    const s = updateStreak()
    setStreak(s)
    setCompleted(getItem(STORAGE_KEYS.COMPLETED, []))
    setBookmarks(getItem(STORAGE_KEYS.BOOKMARKS, []))
  }, [])

  const complete = (id) => {
    markCompleted(id)
    setCompleted(getItem(STORAGE_KEYS.COMPLETED, []))
  }

  const bookmark = (id) => {
    const updated = toggleBookmark(id)
    setBookmarks(updated)
  }

  const getCompletionPercent = (ids) => {
    if (!ids || ids.length === 0) return 0
    const done = ids.filter(id => completed.includes(id)).length
    return Math.round((done / ids.length) * 100)
  }

  return { streak, completed, bookmarks, complete, bookmark, isCompleted: (id) => completed.includes(id), isBookmarked: (id) => bookmarks.includes(id), getCompletionPercent }
}
