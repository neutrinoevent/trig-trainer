import type { Family } from '../data/identities'
import { statsFor, type ProgressState } from '../store/progress'

/** Khan-style criterion tiers, derived from the per-identity moving average. */
export type Tier = 'new' | 'learning' | 'familiar' | 'proficient' | 'mastered'

export const TIER_LABEL: Record<Tier, string> = {
  new: 'New',
  learning: 'Learning',
  familiar: 'Familiar',
  proficient: 'Proficient',
  mastered: 'Mastered',
}

export function tierFor(s: { attempts: number; reps: number; ema: number }): Tier {
  if (s.attempts === 0 && s.reps === 0) return 'new'
  if (s.ema < 0.55) return 'learning'
  if (s.ema < 0.75) return 'familiar'
  if (s.ema < 0.9 || s.attempts < 5) return 'proficient'
  return 'mastered'
}

export function familyTier(progress: ProgressState, family: Family): Tier {
  let attempts = 0
  let reps = 0
  let ema = 0
  for (const ident of family.identities) {
    const s = statsFor(progress, ident.id)
    attempts += s.attempts
    reps += s.reps
    ema += s.ema
  }
  return tierFor({
    attempts,
    reps,
    ema: family.identities.length ? ema / family.identities.length : 0,
  })
}

/**
 * Scaffolding that fades: recognition among 2 choices while an identity is new,
 * widening as mastery grows. Applied when option count is set to 'auto'.
 */
export function autoOptionCount(tier: Tier): 2 | 3 | 4 {
  if (tier === 'new') return 2
  if (tier === 'learning' || tier === 'familiar') return 3
  return 4
}
