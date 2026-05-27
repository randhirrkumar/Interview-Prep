import { createContext, useContext, useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'
import { getItem, setItem, STORAGE_KEYS, updateStreak, markCompleted, toggleBookmark } from '../utils/storage'

const ProgressContext = createContext(null)

async function loadFromFirestore(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

async function saveToFirestore(uid, data) {
  await setDoc(doc(db, 'users', uid), data, { merge: true })
}

function computeStreak(existing) {
  const today = new Date().toDateString()
  if (!existing) return { streak: 1, lastVisit: today, startDate: today }
  if (existing.lastVisit === today) return existing
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  const newStreak = existing.lastVisit === yesterday ? (existing.streak || 0) + 1 : 1
  return { ...existing, streak: newStreak, lastVisit: today, startDate: existing.startDate || today }
}

export function ProgressProvider({ children }) {
  const { user } = useAuth()
  const [streak, setStreak] = useState(0)
  const [completed, setCompleted] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user === undefined) return

    async function init() {
      setLoading(true)
      if (user) {
        const data = await loadFromFirestore(user.uid)
        const updated = computeStreak(data)
        if (updated !== data) {
          await saveToFirestore(user.uid, updated)
        }
        setStreak(updated.streak || 1)
        setCompleted(updated.completed || [])
        setBookmarks(updated.bookmarks || [])
      } else {
        const s = updateStreak()
        setStreak(s)
        setCompleted(getItem(STORAGE_KEYS.COMPLETED, []))
        setBookmarks(getItem(STORAGE_KEYS.BOOKMARKS, []))
      }
      setLoading(false)
    }

    init()
  }, [user])

  const complete = async (id) => {
    if (user) {
      const newCompleted = completed.includes(id) ? completed : [...completed, id]
      setCompleted(newCompleted)
      await saveToFirestore(user.uid, { completed: newCompleted })
    } else {
      markCompleted(id)
      setCompleted(getItem(STORAGE_KEYS.COMPLETED, []))
    }
  }

  const bookmark = async (id) => {
    if (user) {
      const newBookmarks = bookmarks.includes(id)
        ? bookmarks.filter(b => b !== id)
        : [...bookmarks, id]
      setBookmarks(newBookmarks)
      await saveToFirestore(user.uid, { bookmarks: newBookmarks })
    } else {
      const updated = toggleBookmark(id)
      setBookmarks(updated)
    }
  }

  const getCompletionPercent = (ids) => {
    if (!ids || ids.length === 0) return 0
    const done = ids.filter(id => completed.includes(id)).length
    return Math.round((done / ids.length) * 100)
  }

  return (
    <ProgressContext.Provider value={{
      streak, completed, bookmarks, loading,
      complete, bookmark,
      isCompleted: (id) => completed.includes(id),
      isBookmarked: (id) => bookmarks.includes(id),
      getCompletionPercent
    }}>
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgress = () => useContext(ProgressContext)
