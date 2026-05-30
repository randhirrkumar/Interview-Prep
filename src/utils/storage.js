export const STORAGE_KEYS = {
  STREAK: 'prep_streak',
  LAST_VISIT: 'prep_last_visit',
  LAST_STUDY_DATE: 'prep_last_study_date',
  COMPLETED: 'prep_completed',
  BOOKMARKS: 'prep_bookmarks',
  NOTES: 'prep_notes',
  MOCK_SCORES: 'prep_mock_scores',
  START_DATE: 'prep_start_date',
}

export function getItem(key, defaultValue = null) {
  try {
    const val = localStorage.getItem(key)
    return val !== null ? JSON.parse(val) : defaultValue
  } catch { return defaultValue }
}

export function setItem(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export function updateStreak() {
  const today = new Date().toDateString()
  const lastVisit = getItem(STORAGE_KEYS.LAST_VISIT)
  const streak = getItem(STORAGE_KEYS.STREAK, 0)
  if (lastVisit === today) return streak
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  const newStreak = lastVisit === yesterday ? streak + 1 : 1
  setItem(STORAGE_KEYS.STREAK, newStreak)
  setItem(STORAGE_KEYS.LAST_VISIT, today)
  if (!getItem(STORAGE_KEYS.START_DATE)) setItem(STORAGE_KEYS.START_DATE, today)
  return newStreak
}

export function markCompleted(id) {
  const completed = getItem(STORAGE_KEYS.COMPLETED, [])
  if (!completed.includes(id)) {
    setItem(STORAGE_KEYS.COMPLETED, [...completed, id])
  }
}

export function unmarkCompleted(id) {
  const completed = getItem(STORAGE_KEYS.COMPLETED, [])
  setItem(STORAGE_KEYS.COMPLETED, completed.filter(c => c !== id))
}

export function isCompleted(id) {
  return getItem(STORAGE_KEYS.COMPLETED, []).includes(id)
}

export function toggleBookmark(id) {
  const bookmarks = getItem(STORAGE_KEYS.BOOKMARKS, [])
  const updated = bookmarks.includes(id) ? bookmarks.filter(b => b !== id) : [...bookmarks, id]
  setItem(STORAGE_KEYS.BOOKMARKS, updated)
  return updated
}

export function isBookmarked(id) {
  return getItem(STORAGE_KEYS.BOOKMARKS, []).includes(id)
}

export function getNote(id) {
  const notes = getItem(STORAGE_KEYS.NOTES, {})
  return notes[id] || ''
}

export function saveNote(id, text) {
  const notes = getItem(STORAGE_KEYS.NOTES, {})
  setItem(STORAGE_KEYS.NOTES, { ...notes, [id]: text })
}
