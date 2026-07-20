import { TRACKS } from '../data/tracks'
import { FAMILY_BY_ID } from '../data/identities'

export type Level = 'beginner' | 'intermediate' | 'advanced'
export type OptionCount = 'auto' | 2 | 3 | 4

export interface Settings {
  version: 1
  level: Level
  /** Choices per question; 'auto' scales 2→4 with per-identity mastery. */
  optionCount: OptionCount
  /** Nudge difficulty to keep rolling success in the ~85% band. */
  autoAdapt: boolean
  /** Show a brand-new identity as a worked example before quizzing it. */
  introduceFirst: boolean
  newPerDay: number
  /** Sticky family scope shared by Drill, Cards, and Challenge. null = everything. */
  scope: string[] | null
  placementDone: boolean
}

const KEY = 'trig-trainer-settings-v1'

export const DEFAULT_SETTINGS: Settings = {
  version: 1,
  level: 'intermediate',
  optionCount: 'auto',
  autoAdapt: true,
  introduceFirst: false,
  newPerDay: 10,
  scope: null,
  placementDone: false,
}

/**
 * Defaults per experience level, per the expertise-reversal effect: heavy
 * scaffolding for novices (worked examples, small option sets, a narrow starting
 * batch, gentle card pace), none of it for experts.
 */
export function levelPreset(level: Level): Partial<Settings> {
  switch (level) {
    case 'beginner':
      return {
        level,
        optionCount: 'auto',
        autoAdapt: true,
        introduceFirst: true,
        newPerDay: 4,
        scope: [...(TRACKS.find((t) => t.id === 'basics')?.families ?? [])],
      }
    case 'intermediate':
      return {
        level,
        optionCount: 'auto',
        autoAdapt: true,
        introduceFirst: false,
        newPerDay: 10,
        scope: null,
      }
    case 'advanced':
      return {
        level,
        optionCount: 4,
        autoAdapt: false,
        introduceFirst: false,
        newPerDay: 20,
        scope: null,
      }
  }
}

function sanitizeScope(scope: unknown): string[] | null {
  if (!Array.isArray(scope)) return null
  const valid = scope.filter((f): f is string => typeof f === 'string' && FAMILY_BY_ID.has(f))
  return valid.length > 0 ? valid : null
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Settings
    if (parsed.version !== 1) return DEFAULT_SETTINGS
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      scope: sanitizeScope(parsed.scope),
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings))
  } catch {
    // storage unavailable — settings just won't persist
  }
}
