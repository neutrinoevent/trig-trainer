import { FAMILIES } from '../data/identities'
import { dueCount, statsFor, type ProgressState } from '../store/progress'

export interface Suggestion {
  text: string
  go: 'learn' | 'drill' | 'cards' | 'challenge'
  goLabel: string
  scope?: string[] | null
}

/** One concrete next step, mastery-first: reviews, then weak spots, then stretch. */
export function suggest(progress: ProgressState): Suggestion {
  const due = dueCount(progress)
  if (due > 0) {
    return {
      text: `${due} flashcard${due === 1 ? '' : 's'} due — reviews first, while they're cheap.`,
      go: 'cards',
      goLabel: 'Review',
    }
  }

  if (progress.totalAttempts === 0) {
    return {
      text: 'New here: skim one family in Learn, then drill just that family.',
      go: 'learn',
      goLabel: 'Open Learn',
    }
  }

  let weakest: { id: string; name: string; ema: number } | null = null
  let strongest: { id: string; name: string; ema: number } | null = null
  for (const fam of FAMILIES) {
    let attempts = 0
    let ema = 0
    for (const ident of fam.identities) {
      const s = statsFor(progress, ident.id)
      attempts += s.attempts
      ema += s.ema
    }
    const avg = fam.identities.length ? ema / fam.identities.length : 0
    if (attempts >= 5 && avg < 0.55 && (!weakest || avg < weakest.ema)) {
      weakest = { id: fam.id, name: fam.name, ema: avg }
    }
    if (attempts >= 8 && avg >= 0.8 && (!strongest || avg > strongest.ema)) {
      strongest = { id: fam.id, name: fam.name, ema: avg }
    }
  }

  if (weakest) {
    return {
      text: `${weakest.name} is wobbling — a short focused drill will set it.`,
      go: 'drill',
      goLabel: 'Drill it',
      scope: [weakest.id],
    }
  }
  if (strongest) {
    return {
      text: `${strongest.name} looks solid — pressure-test it with rearranged forms in Challenge.`,
      go: 'challenge',
      goLabel: 'Challenge',
      scope: [strongest.id],
    }
  }
  return {
    text: 'Nothing urgent. Mixed drilling across your batches beats re-running what you already know.',
    go: 'drill',
    goLabel: 'Drill',
  }
}
