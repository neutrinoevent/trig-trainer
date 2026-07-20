import { ALL_IDENTITIES, IDENTITY_BY_ID } from '../data/identities'

export interface IdStats {
  attempts: number
  correct: number
  streak: number
  /** Exponential moving average of recent drill results, 0..1 — the mastery score. */
  ema: number
  lastSeen: number | null
  // Flashcard scheduling (SM-2 style)
  reps: number
  lapses: number
  ease: number
  intervalDays: number
  /** Next review timestamp; null until the card is first studied. */
  due: number | null
}

export interface ProgressState {
  version: 1
  byId: Record<string, IdStats>
  totalAttempts: number
  totalCorrect: number
  currentStreak: number
  bestStreak: number
  /** New-card introductions today, to pace the flashcard queue. */
  newDay: string
  newToday: number
}

export type Grade = 'again' | 'good' | 'easy'

const KEY = 'trig-trainer-progress-v1'
const EMA_ALPHA = 0.2
export const NEW_PER_DAY = 10
const MIN_EASE = 1.3
const MAX_EASE = 3.0
const DAY_MS = 24 * 60 * 60 * 1000
const AGAIN_DELAY_MS = 10 * 60 * 1000

export function emptyStats(): IdStats {
  return {
    attempts: 0,
    correct: 0,
    streak: 0,
    ema: 0,
    lastSeen: null,
    reps: 0,
    lapses: 0,
    ease: 2.3,
    intervalDays: 0,
    due: null,
  }
}

export function emptyProgress(): ProgressState {
  return {
    version: 1,
    byId: {},
    totalAttempts: 0,
    totalCorrect: 0,
    currentStreak: 0,
    bestStreak: 0,
    newDay: dayKey(Date.now()),
    newToday: 0,
  }
}

function dayKey(t: number): string {
  const d = new Date(t)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyProgress()
    const parsed = JSON.parse(raw) as ProgressState
    if (parsed.version !== 1 || typeof parsed.totalAttempts !== 'number') return emptyProgress()
    return parsed
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(state: ProgressState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // storage unavailable (private mode etc.) — training still works, just untracked
  }
}

export function statsFor(state: ProgressState, id: string): IdStats {
  return state.byId[id] ?? emptyStats()
}

/** Record a drill answer. A miss on a far-scheduled card also pulls its review forward. */
export function recordDrill(state: ProgressState, id: string, correct: boolean): ProgressState {
  const prev = statsFor(state, id)
  const now = Date.now()
  const streak = correct ? prev.streak + 1 : 0
  const stats: IdStats = {
    ...prev,
    attempts: prev.attempts + 1,
    correct: prev.correct + (correct ? 1 : 0),
    streak,
    ema: prev.ema + EMA_ALPHA * ((correct ? 1 : 0) - prev.ema),
    lastSeen: now,
  }
  if (!correct && stats.due !== null && stats.due > now + DAY_MS) {
    stats.due = now + DAY_MS
    stats.intervalDays = 1
  }
  const currentStreak = correct ? state.currentStreak + 1 : 0
  const next: ProgressState = {
    ...state,
    byId: { ...state.byId, [id]: stats },
    totalAttempts: state.totalAttempts + 1,
    totalCorrect: state.totalCorrect + (correct ? 1 : 0),
    currentStreak,
    bestStreak: Math.max(state.bestStreak, currentStreak),
  }
  saveProgress(next)
  return next
}

/** Record a flashcard self-grade and reschedule the card. */
export function recordGrade(state: ProgressState, id: string, grade: Grade): ProgressState {
  const prev = statsFor(state, id)
  const now = Date.now()
  const wasNew = prev.due === null
  const stats: IdStats = { ...prev, lastSeen: now }

  if (grade === 'again') {
    stats.lapses = prev.reps > 0 ? prev.lapses + 1 : prev.lapses
    stats.ease = Math.max(MIN_EASE, prev.ease - 0.2)
    stats.intervalDays = 0
    stats.due = now + AGAIN_DELAY_MS
    stats.ema = prev.ema + EMA_ALPHA * (0 - prev.ema)
  } else {
    const growth = grade === 'easy' ? prev.ease * 1.4 : prev.ease
    const first = grade === 'easy' ? 3 : 1
    stats.intervalDays =
      prev.intervalDays < 1 ? first : Math.max(prev.intervalDays + 1, Math.round(prev.intervalDays * growth))
    stats.due = now + stats.intervalDays * DAY_MS
    stats.reps = prev.reps + 1
    if (grade === 'easy') stats.ease = Math.min(MAX_EASE, prev.ease + 0.05)
    stats.ema = prev.ema + EMA_ALPHA * (1 - prev.ema)
  }

  const today = dayKey(now)
  const next: ProgressState = {
    ...state,
    byId: { ...state.byId, [id]: stats },
    newDay: today,
    newToday: (state.newDay === today ? state.newToday : 0) + (wasNew ? 1 : 0),
  }
  saveProgress(next)
  return next
}

export interface CardQueue {
  due: string[]
  fresh: string[]
  freshRemaining: number
}

/** Cards to study now: everything due, then unseen cards up to the daily cap. */
export function cardQueue(state: ProgressState, scope: string | null): CardQueue {
  const now = Date.now()
  const pool = scope ? ALL_IDENTITIES.filter((i) => i.familyId === scope) : ALL_IDENTITIES
  const due: { id: string; at: number }[] = []
  const fresh: string[] = []
  for (const ident of pool) {
    const s = state.byId[ident.id]
    if (!s || s.due === null) fresh.push(ident.id)
    else if (s.due <= now) due.push({ id: ident.id, at: s.due })
  }
  due.sort((a, b) => a.at - b.at)
  const usedToday = state.newDay === dayKey(now) ? state.newToday : 0
  const freshRemaining = Math.max(0, NEW_PER_DAY - usedToday)
  return { due: due.map((d) => d.id), fresh: fresh.slice(0, freshRemaining), freshRemaining }
}

export function dueCount(state: ProgressState): number {
  const now = Date.now()
  let n = 0
  for (const s of Object.values(state.byId)) {
    if (s.due !== null && s.due <= now) n++
  }
  return n
}

export function resetProgress(): ProgressState {
  const next = emptyProgress()
  saveProgress(next)
  return next
}

export function exportProgress(state: ProgressState): string {
  return JSON.stringify(state, null, 2)
}

/** Parse a backup, keeping only stats for identities that still exist. */
export function importProgress(json: string): ProgressState | null {
  try {
    const parsed = JSON.parse(json) as ProgressState
    if (parsed.version !== 1 || typeof parsed.byId !== 'object' || parsed.byId === null) return null
    const byId: Record<string, IdStats> = {}
    for (const [id, s] of Object.entries(parsed.byId)) {
      if (IDENTITY_BY_ID.has(id) && typeof s.attempts === 'number') byId[id] = { ...emptyStats(), ...s }
    }
    const next: ProgressState = { ...emptyProgress(), ...parsed, byId, version: 1 }
    saveProgress(next)
    return next
  } catch {
    return null
  }
}
