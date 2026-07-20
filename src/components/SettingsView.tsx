import { levelPreset, type Level, type OptionCount, type Settings } from '../store/settings'

interface Props {
  settings: Settings
  onChange: (settings: Settings) => void
}

const LEVELS: { id: Level; label: string; blurb: string }[] = [
  {
    id: 'beginner',
    label: 'Starting out',
    blurb: 'New identities shown before they are quizzed, 2–3 choices, a gentle card pace, and a starting batch of the basics.',
  },
  {
    id: 'intermediate',
    label: 'Comfortable',
    blurb: 'Adaptive choices and pacing across everything — difficulty follows your accuracy.',
  },
  {
    id: 'advanced',
    label: 'Expert',
    blurb: 'Four choices everywhere, no previews, fast card intake. The traps carry the difficulty.',
  },
]

const OPTION_COUNTS: { id: OptionCount; label: string }[] = [
  { id: 'auto', label: 'Auto' },
  { id: 2, label: '2' },
  { id: 3, label: '3' },
  { id: 4, label: '4' },
]

const NEW_PER_DAY = [4, 10, 20, 40]

export function SettingsView({ settings, onChange }: Props) {
  const set = (patch: Partial<Settings>) => onChange({ ...settings, ...patch })

  return (
    <div className="settings">
      <div className="card">
        <h2 className="section-title">Experience level</h2>
        <p className="muted settings-blurb">
          Sets the defaults below — the guidance that helps a novice slows down an expert, so
          pick honestly and adjust anything individually afterward.
        </p>
        <div className="level-row">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              className={settings.level === l.id ? 'level-tile level-active' : 'level-tile'}
              onClick={() => set(levelPreset(l.id))}
            >
              <span className="level-name">{l.label}</span>
              <span className="level-blurb">{l.blurb}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Questions</h2>
        <div className="setting-row">
          <div>
            <div className="setting-name">Choices per question</div>
            <div className="muted setting-note">
              Auto starts new identities at 2 and widens to 4 as they reach Proficient.
            </div>
          </div>
          <div className="setting-chips">
            {OPTION_COUNTS.map((o) => (
              <button
                key={String(o.id)}
                className={settings.optionCount === o.id ? 'chip chip-active' : 'chip'}
                onClick={() => set({ optionCount: o.id })}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-name">Hold difficulty to your accuracy</div>
            <div className="muted setting-note">
              Keeps recent success near 85% — easier after a rough patch, harder on a hot streak.
            </div>
          </div>
          <div className="setting-chips">
            <button
              className={settings.autoAdapt ? 'chip chip-active' : 'chip'}
              onClick={() => set({ autoAdapt: !settings.autoAdapt })}
            >
              {settings.autoAdapt ? 'On' : 'Off'}
            </button>
          </div>
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-name">Introduce new identities first</div>
            <div className="muted setting-note">
              Show a brand-new identity in full before quizzing it — worked example, then problem.
            </div>
          </div>
          <div className="setting-chips">
            <button
              className={settings.introduceFirst ? 'chip chip-active' : 'chip'}
              onClick={() => set({ introduceFirst: !settings.introduceFirst })}
            >
              {settings.introduceFirst ? 'On' : 'Off'}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Flashcards</h2>
        <div className="setting-row">
          <div>
            <div className="setting-name">New cards per day</div>
            <div className="muted setting-note">
              Reviews always come first; this only paces how fast new material enters rotation.
            </div>
          </div>
          <div className="setting-chips">
            {NEW_PER_DAY.map((n) => (
              <button
                key={n}
                className={settings.newPerDay === n ? 'chip chip-active' : 'chip'}
                onClick={() => set({ newPerDay: n })}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <p className="muted setting-note">
          Progress data, backups, and reset live under the Progress tab.
        </p>
      </div>
    </div>
  )
}
