import { createContext, useContext, useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'
import { getItem, setItem, STORAGE_KEYS, markCompleted, unmarkCompleted, toggleBookmark } from '../utils/storage'

const ProgressContext = createContext(null)

async function loadFromFirestore(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

async function saveToFirestore(uid, data) {
  await setDoc(doc(db, 'users', uid), data, { merge: true })
}

// Returns the streak value to DISPLAY given lastStudyDate and stored streak.
// Streak is 0 if user missed more than 1 day (broken), otherwise shows stored value.
function resolveDisplayStreak(storedStreak, lastStudyDate) {
  if (!lastStudyDate) return 0
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  return (lastStudyDate === today || lastStudyDate === yesterday) ? (storedStreak || 0) : 0
}

// Computes new streak when user completes an activity today.
function computeActivityStreak(currentStreak, lastStudyDate) {
  const today = new Date().toDateString()
  if (lastStudyDate === today) return { streak: currentStreak, lastStudyDate } // already counted today
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  const newStreak = lastStudyDate === yesterday ? (currentStreak || 0) + 1 : 1
  return { streak: newStreak, lastStudyDate: today }
}

export function ProgressProvider({ children }) {
  const { user } = useAuth()
  const [streak, setStreak] = useState(0)
  const [lastStudyDate, setLastStudyDate] = useState(null)
  const [startDate, setStartDate] = useState(null)
  const [completed, setCompleted] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user === undefined) return

    async function init() {
      setLoading(true)
      if (user) {
        const data = await loadFromFirestore(user.uid) || {}
        const lsd = data.lastStudyDate || null
        setLastStudyDate(lsd)
        // Only trust startDate if user has actual study activity; discard legacy data written on visit
        setStartDate(lsd ? (data.startDate || null) : null)
        setStreak(resolveDisplayStreak(data.streak || 0, lsd))
        setCompleted(data.completed || [])
        setBookmarks(data.bookmarks || [])
      } else {
        const lsd = getItem(STORAGE_KEYS.LAST_STUDY_DATE, null)
        const stored = getItem(STORAGE_KEYS.STREAK, 0)
        setLastStudyDate(lsd)
        setStartDate(lsd ? getItem(STORAGE_KEYS.START_DATE, null) : null)
        setStreak(resolveDisplayStreak(stored, lsd))
        setCompleted(getItem(STORAGE_KEYS.COMPLETED, []))
        setBookmarks(getItem(STORAGE_KEYS.BOOKMARKS, []))
      }
      setLoading(false)
    }

    init()
  }, [user])

  const complete = async (id) => {
    if (completed.includes(id)) return

    const newCompleted = [...completed, id]
    setCompleted(newCompleted)

    // Compute updated streak on first completion of the day
    const { streak: newStreak, lastStudyDate: newLSD } = computeActivityStreak(streak, lastStudyDate)
    const today = new Date().toDateString()
    const newStartDate = startDate || today

    if (lastStudyDate !== today) {
      setStreak(newStreak)
      setLastStudyDate(newLSD)
    }
    if (!startDate) setStartDate(newStartDate)

    if (user) {
      await saveToFirestore(user.uid, {
        completed: newCompleted,
        streak: newStreak,
        lastStudyDate: newLSD,
        startDate: newStartDate,
      })
    } else {
      markCompleted(id)
      setItem(STORAGE_KEYS.STREAK, newStreak)
      setItem(STORAGE_KEYS.LAST_STUDY_DATE, newLSD)
      if (!startDate) setItem(STORAGE_KEYS.START_DATE, newStartDate)
      setCompleted(getItem(STORAGE_KEYS.COMPLETED, []))
    }
  }

  const uncomplete = async (id) => {
    const newCompleted = completed.filter(c => c !== id)
    setCompleted(newCompleted)
    if (user) {
      await saveToFirestore(user.uid, { completed: newCompleted })
    } else {
      unmarkCompleted(id)
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
      streak, completed, bookmarks, loading, startDate,
      complete, uncomplete, bookmark,
      isCompleted: (id) => completed.includes(id),
      isBookmarked: (id) => bookmarks.includes(id),
      getCompletionPercent
    }}>
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgress = () => useContext(ProgressContext)
