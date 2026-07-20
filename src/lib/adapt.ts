import type { Settings } from '../store/settings'
import { autoOptionCount, type Tier } from './mastery'

/**
 * Resolve how many choices a question gets, holding rolling success near the
 * ~85% band the retrieval-practice literature targets: too easy teaches
 * nothing, too hard breaks retrieval entirely.
 */
export function resolveOptionCount(settings: Settings, tier: Tier, recent: boolean[]): number {
  let n: number = settings.optionCount === 'auto' ? autoOptionCount(tier) : settings.optionCount
  if (settings.autoAdapt && recent.length >= 6) {
    const window = recent.slice(-10)
    const acc = window.filter(Boolean).length / window.length
    if (acc > 0.9) n = Math.min(4, n + 1)
    else if (acc < 0.7) n = Math.max(2, n - 1)
  }
  return n
}
