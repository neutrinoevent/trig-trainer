import { ALL_IDENTITIES, type FlatIdentity } from '../data/identities'
import { statsFor, type ProgressState } from '../store/progress'

export const norm = (tex: string) => tex.replace(/\s|\\,|\\;|\\!/g, '')

/** All correct answers per prompt, so equivalent forms never appear as distractors. */
const answersByPrompt = new Map<string, Set<string>>()
for (const ident of ALL_IDENTITIES) {
  const key = norm(ident.prompt)
  const set = answersByPrompt.get(key) ?? new Set()
  set.add(norm(ident.answer))
  answersByPrompt.set(key, set)
}

export function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Weight for adaptive selection: weak identities dominate, unseen ones trickle in,
 * mastered ones still resurface occasionally.
 */
function weight(state: ProgressState, ident: FlatIdentity): number {
  const s = statsFor(state, ident.id)
  if (s.attempts === 0) return 0.55
  return 0.12 + 1.6 * (1 - s.ema) * (1 - s.ema)
}

export function pickIdentity(
  state: ProgressState,
  scope: string | null,
  excludeId: string | null,
): FlatIdentity {
  let pool = scope ? ALL_IDENTITIES.filter((i) => i.familyId === scope) : ALL_IDENTITIES
  if (pool.length > 1 && excludeId) pool = pool.filter((i) => i.id !== excludeId)
  let total = 0
  const weights = pool.map((i) => {
    const w = weight(state, i)
    total += w
    return w
  })
  let roll = Math.random() * total
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i]
    if (roll <= 0) return pool[i]
  }
  return pool[pool.length - 1]
}

export interface Question {
  identity: FlatIdentity
  /** Rendered answer options; exactly one is correct. */
  options: string[]
  correctIndex: number
}

export function buildQuestion(identity: FlatIdentity, optionCount = 4): Question {
  const equivalents = answersByPrompt.get(norm(identity.prompt)) ?? new Set([norm(identity.answer)])
  const chosen: string[] = []
  const seen = new Set<string>([norm(identity.answer)])

  const consider = (tex: string) => {
    const key = norm(tex)
    if (chosen.length >= optionCount - 1) return
    if (seen.has(key) || equivalents.has(key)) return
    seen.add(key)
    chosen.push(tex)
  }

  for (const trap of shuffle(identity.traps ?? [])) consider(trap)
  const siblings = ALL_IDENTITIES.filter(
    (i) => i.familyId === identity.familyId && i.id !== identity.id,
  )
  for (const sib of shuffle(siblings)) consider(sib.answer)
  for (const other of shuffle(ALL_IDENTITIES)) consider(other.answer)

  const options = shuffle([identity.answer, ...chosen])
  return { identity, options, correctIndex: options.indexOf(identity.answer) }
}
