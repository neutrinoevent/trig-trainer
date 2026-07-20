import { describe, expect, it } from 'vitest'
import { ALL_IDENTITIES, FAMILY_BY_ID } from '../data/identities'
import { TRACKS } from '../data/tracks'
import { resolveOptionCount } from '../lib/adapt'
import { autoOptionCount, tierFor } from '../lib/mastery'
import { pickBoardIdentities } from '../lib/match'
import { suggest } from '../lib/coach'
import { inScope, norm, pickIdentity, scopedIdentities } from '../lib/pick'
import { pickVariant } from '../data/variants'
import { IDENTITY_BY_ID } from '../data/identities'
import { cardQueue, emptyProgress, emptyStats, recordDrill, recordGrade } from './progress'
import { DEFAULT_SETTINGS, levelPreset, type Settings } from './settings'

describe('tracks and scope', () => {
  it('every track references real families', () => {
    for (const t of TRACKS) {
      expect(t.families.length).toBeGreaterThan(2)
      for (const f of t.families) expect(FAMILY_BY_ID.has(f), `${t.id}: ${f}`).toBe(true)
    }
  })

  it('scoped picks stay inside a multi-family scope', () => {
    const scope = ['pythagorean', 'deriv']
    for (let i = 0; i < 30; i++) {
      const ident = pickIdentity(emptyProgress(), scope, null)
      expect(scope).toContain(ident.familyId)
      const v = pickVariant(emptyProgress(), scope, null)
      expect(scope).toContain(IDENTITY_BY_ID.get(v.baseId)!.familyId)
    }
    expect(scopedIdentities(['no-such-family']).length).toBe(ALL_IDENTITIES.length)
    expect(inScope('anything', null)).toBe(true)
  })

  it('card queue respects multi-family scope and custom daily pace', () => {
    const q = cardQueue(emptyProgress(), ['values', 'ratio'], 4)
    expect(q.fresh.length).toBe(4)
    for (const id of q.fresh) {
      expect(['values', 'ratio']).toContain(IDENTITY_BY_ID.get(id)!.familyId)
    }
  })
})

describe('mastery tiers', () => {
  it('walks New → Learning → Proficient/Mastered with results', () => {
    expect(tierFor(emptyStats())).toBe('new')
    let s = emptyProgress()
    s = recordDrill(s, 'pyth-sincos', false)
    expect(tierFor(s.byId['pyth-sincos'])).toBe('learning')
    for (let i = 0; i < 20; i++) s = recordDrill(s, 'pyth-sincos', true)
    expect(tierFor(s.byId['pyth-sincos'])).toBe('mastered')
  })

  it('auto option count widens with tier', () => {
    expect(autoOptionCount('new')).toBe(2)
    expect(autoOptionCount('learning')).toBe(3)
    expect(autoOptionCount('mastered')).toBe(4)
  })

  it('rolling accuracy nudges difficulty inside 2..4', () => {
    const auto: Settings = { ...DEFAULT_SETTINGS, optionCount: 'auto', autoAdapt: true }
    const hot = Array(10).fill(true)
    const cold = Array(10).fill(false)
    expect(resolveOptionCount(auto, 'learning', hot)).toBe(4)
    expect(resolveOptionCount(auto, 'learning', cold)).toBe(2)
    expect(resolveOptionCount(auto, 'mastered', cold)).toBe(3)
    expect(resolveOptionCount({ ...auto, autoAdapt: false }, 'learning', hot)).toBe(3)
    expect(resolveOptionCount({ ...auto, optionCount: 2 }, 'mastered', [])).toBe(2)
  })
})

describe('level presets', () => {
  it('scaffolds novices and strips scaffolding for experts', () => {
    const b = levelPreset('beginner')
    expect(b.introduceFirst).toBe(true)
    expect(b.newPerDay).toBeLessThan(10)
    expect(b.scope?.every((f) => FAMILY_BY_ID.has(f))).toBe(true)
    const a = levelPreset('advanced')
    expect(a.introduceFirst).toBe(false)
    expect(a.optionCount).toBe(4)
    expect(a.scope).toBeNull()
  })
})

describe('match boards', () => {
  it('honors pair count, scope, and unambiguity at every size', () => {
    for (const pairs of [3, 4, 6]) {
      const board = pickBoardIdentities(emptyProgress(), ['sum-diff', 'double'], pairs, 'intermediate')
      expect(board.length).toBe(pairs)
      const prompts = new Set(board.map((i) => norm(i.prompt)))
      const answers = new Set(board.map((i) => norm(i.answer)))
      expect(prompts.size).toBe(pairs)
      expect(answers.size).toBe(pairs)
      for (const p of prompts) expect(answers.has(p)).toBe(false)
    }
  })

  it('beginner boards prefer material the learner has met', () => {
    let s = emptyProgress()
    const seen = ALL_IDENTITIES.slice(0, 12)
    for (const ident of seen) {
      for (let i = 0; i < 4; i++) s = recordDrill(s, ident.id, true)
    }
    const seenIds = new Set(seen.map((i) => i.id))
    let onBoard = 0
    for (const ident of pickBoardIdentities(s, null, 6, 'beginner')) {
      if (seenIds.has(ident.id)) onBoard++
    }
    expect(onBoard).toBeGreaterThanOrEqual(4)
  })

  it('falls back beyond a too-small scope', () => {
    const board = pickBoardIdentities(emptyProgress(), ['triple'], 6, 'advanced')
    expect(board.length).toBe(6)
  })
})

describe('coach', () => {
  it('prioritizes due reviews, then onboarding, then weak spots', () => {
    let s = emptyProgress()
    expect(suggest(s).go).toBe('learn')

    for (let i = 0; i < 6; i++) s = recordDrill(s, 'pyth-sincos', false)
    expect(suggest(s).go).toBe('drill')
    expect(suggest(s).scope).toEqual(['pythagorean'])

    s = recordGrade(s, 'ratio-tan', 'again')
    // "again" cards come due in 10 minutes, not immediately — still the weak-spot suggestion
    expect(suggest(s).go).toBe('drill')
  })
})
