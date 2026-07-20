import type { FlatIdentity } from '../data/identities'
import type { Level } from '../store/settings'
import { statsFor, type ProgressState } from '../store/progress'
import { norm, scopedIdentities, shuffle } from './pick'

/** Short, symbol-only identities render as readable tiles. */
function tileable(i: FlatIdentity): boolean {
  if (i.prompt.includes('\\text') || i.answer.includes('\\text')) return false
  return i.prompt.length + i.answer.length <= 88
}

/**
 * Pick identities for a matching board. Novice boards lean on material the
 * learner has already met (retrieval that can succeed); advanced boards hunt
 * weak and unseen identities. Boards are always unambiguous: no repeated
 * prompt/answer forms, and no tile that could truthfully pair across identities.
 */
export function pickBoardIdentities(
  progress: ProgressState,
  scope: string[] | null,
  pairCount: number,
  level: Level,
): FlatIdentity[] {
  const attempt = (pool: FlatIdentity[]): FlatIdentity[] => {
    const scored = pool
      .filter(tileable)
      .map((ident) => {
        const s = statsFor(progress, ident.id)
        let score = Math.random() * 0.4
        if (level === 'beginner') score += s.ema + (s.attempts > 0 ? 1 : 0)
        else if (level === 'advanced') score += 1 - s.ema
        return { ident, score }
      })
      .sort((a, b) => b.score - a.score)

    const usedPrompts = new Set<string>()
    const usedAnswers = new Set<string>()
    const chosen: FlatIdentity[] = []
    for (const { ident } of scored) {
      if (chosen.length >= pairCount) break
      const p = norm(ident.prompt)
      const a = norm(ident.answer)
      if (usedPrompts.has(p) || usedAnswers.has(a)) continue
      if (usedPrompts.has(a) || usedAnswers.has(p)) continue
      usedPrompts.add(p)
      usedAnswers.add(a)
      chosen.push(ident)
    }
    return chosen
  }

  let chosen = attempt(scopedIdentities(scope))
  if (chosen.length < pairCount && scope !== null) chosen = attempt(scopedIdentities(null))
  return chosen
}

export interface MatchTile {
  identId: string
  kind: 'prompt' | 'answer'
  tex: string
}

export function boardTiles(identities: FlatIdentity[]): MatchTile[] {
  return shuffle(
    identities.flatMap((i): MatchTile[] => [
      { identId: i.id, kind: 'prompt', tex: i.prompt },
      { identId: i.id, kind: 'answer', tex: i.answer },
    ]),
  )
}
