import { describe, expect, it } from 'vitest'
import { ALL_IDENTITIES } from '../data/identities'
import {
  cardQueue,
  emptyProgress,
  importProgress,
  exportProgress,
  NEW_PER_DAY,
  recordDrill,
  recordGrade,
  statsFor,
} from './progress'

const DAY_MS = 24 * 60 * 60 * 1000
const someId = ALL_IDENTITIES[0].id

describe('drill recording', () => {
  it('tracks attempts, accuracy, and streaks', () => {
    let s = emptyProgress()
    s = recordDrill(s, someId, true)
    s = recordDrill(s, someId, true)
    s = recordDrill(s, someId, false)
    expect(s.totalAttempts).toBe(3)
    expect(s.totalCorrect).toBe(2)
    expect(s.currentStreak).toBe(0)
    expect(s.bestStreak).toBe(2)
    const st = statsFor(s, someId)
    expect(st.attempts).toBe(3)
    expect(st.ema).toBeGreaterThan(0)
    expect(st.ema).toBeLessThan(1)
  })

  it('pulls a far-scheduled card forward on a drill miss', () => {
    let s = emptyProgress()
    s = recordGrade(s, someId, 'easy') // due in 3 days
    s = recordGrade(s, someId, 'easy')
    expect(statsFor(s, someId).due! - Date.now()).toBeGreaterThan(2 * DAY_MS)
    s = recordDrill(s, someId, false)
    expect(statsFor(s, someId).due! - Date.now()).toBeLessThanOrEqual(DAY_MS)
  })
})

describe('flashcard scheduling', () => {
  it('reschedules by grade', () => {
    let s = emptyProgress()
    s = recordGrade(s, someId, 'good')
    let st = statsFor(s, someId)
    expect(st.intervalDays).toBe(1)
    expect(st.due).not.toBeNull()

    s = recordGrade(s, someId, 'good')
    st = statsFor(s, someId)
    expect(st.intervalDays).toBeGreaterThan(1)

    s = recordGrade(s, someId, 'again')
    st = statsFor(s, someId)
    expect(st.intervalDays).toBe(0)
    expect(st.due! - Date.now()).toBeLessThan(11 * 60 * 1000)
    expect(st.lapses).toBe(1)
  })

  it('caps new cards per day and serves due cards first', () => {
    let s = emptyProgress()
    const q0 = cardQueue(s, null)
    expect(q0.due.length).toBe(0)
    expect(q0.fresh.length).toBe(NEW_PER_DAY)

    for (const id of q0.fresh) s = recordGrade(s, id, 'again')
    const q1 = cardQueue(s, null)
    expect(q1.fresh.length).toBe(0) // daily cap reached
    expect(q1.due.length).toBe(0) // "again" cards return in 10 minutes, not immediately
  })

  it('scopes the queue to a family', () => {
    const s = emptyProgress()
    const q = cardQueue(s, [ALL_IDENTITIES[0].familyId])
    for (const id of q.fresh) {
      expect(ALL_IDENTITIES.find((i) => i.id === id)?.familyId).toBe(ALL_IDENTITIES[0].familyId)
    }
  })
})

describe('backup', () => {
  it('round-trips through export/import and drops unknown ids', () => {
    let s = emptyProgress()
    s = recordDrill(s, someId, true)
    const json = exportProgress(s)
    const withJunk = json.replace('"byId": {', '"byId": {"no-such-identity": {"attempts": 3},')
    const restored = importProgress(withJunk)
    expect(restored).not.toBeNull()
    expect(statsFor(restored!, someId).attempts).toBe(1)
    expect(restored!.byId['no-such-identity']).toBeUndefined()
  })

  it('rejects garbage', () => {
    expect(importProgress('not json')).toBeNull()
    expect(importProgress('{"hello": 1}')).toBeNull()
  })
})
