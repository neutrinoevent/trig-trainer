import { levelPreset, type Level, type Settings } from '../store/settings'

interface Props {
  settings: Settings
  onDone: (settings: Settings) => void
}

const CHOICES: { id: Level; label: string; blurb: string }[] = [
  {
    id: 'beginner',
    label: 'New to trig',
    blurb: 'Start with the basics batch, see each identity before it is quizzed, small answer sets.',
  },
  {
    id: 'intermediate',
    label: 'Taking calculus',
    blurb: 'Everything available, difficulty adapts to how you are doing.',
  },
  {
    id: 'advanced',
    label: 'Refreshing as an expert',
    blurb: 'Full difficulty everywhere, fast flashcard intake, no training wheels.',
  },
]

/** One-time placement, per the Duolingo/Khan onboarding pattern. Changeable later in Settings. */
export function Placement({ settings, onDone }: Props) {
  const pick = (level: Level) =>
    onDone({ ...settings, ...levelPreset(level), placementDone: true })

  return (
    <div className="placement-root">
      <div className="placement-card" role="dialog" aria-label="Choose your starting level">
        <div className="tour-title">Where are you starting from?</div>
        <div className="tour-body">
          This tunes difficulty, pacing, and guidance. Change it anytime under Settings (⚙).
        </div>
        <div className="placement-choices">
          {CHOICES.map((c) => (
            <button key={c.id} className="level-tile" onClick={() => pick(c.id)}>
              <span className="level-name">{c.label}</span>
              <span className="level-blurb">{c.blurb}</span>
            </button>
          ))}
        </div>
        <div className="tour-row">
          <button
            className="btn"
            onClick={() => onDone({ ...settings, placementDone: true })}
          >
            Decide later
          </button>
        </div>
      </div>
    </div>
  )
}
