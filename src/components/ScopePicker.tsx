import { FAMILIES } from '../data/identities'
import { TRACKS } from '../data/tracks'

interface Props {
  scope: string[] | null
  onChange: (scope: string[] | null) => void
}

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && a.every((x) => b.includes(x))

/**
 * Batch selection shared by Drill, Cards, and Challenge: everything, a curated
 * track, or any hand-picked combination of families.
 */
export function ScopePicker({ scope, onChange }: Props) {
  const toggleFamily = (id: string) => {
    if (scope === null) {
      onChange([id])
      return
    }
    const next = scope.includes(id) ? scope.filter((f) => f !== id) : [...scope, id]
    onChange(next.length === 0 ? null : next)
  }

  return (
    <div className="scope-picker">
      <div className="mode-bar">
        <span className="scope-label">Batch</span>
        <button
          className={scope === null ? 'chip chip-active' : 'chip'}
          onClick={() => onChange(null)}
        >
          Everything
        </button>
        {TRACKS.map((t) => (
          <button
            key={t.id}
            className={
              scope !== null && sameSet(scope, t.families)
                ? 'chip chip-track chip-active'
                : 'chip chip-track'
            }
            onClick={() => onChange([...t.families])}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mode-bar scope-families">
        <span className="scope-label">Families</span>
        {FAMILIES.map((f) => (
          <button
            key={f.id}
            className={scope !== null && scope.includes(f.id) ? 'chip chip-active' : 'chip'}
            onClick={() => toggleFamily(f.id)}
          >
            {f.name}
          </button>
        ))}
      </div>
    </div>
  )
}
