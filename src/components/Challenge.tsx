import { useState } from 'react'
import type { ProgressState } from '../store/progress'
import type { Settings } from '../store/settings'
import { ScopePicker } from './ScopePicker'
import { Rearrange } from './Rearrange'
import { Graphs } from './Graphs'
import { CircleQuiz } from './CircleQuiz'
import { MatchBoard } from './MatchBoard'

type Mode = 'rearrange' | 'graphs' | 'circle' | 'match'

const MODES: { id: Mode; label: string }[] = [
  { id: 'rearrange', label: 'Rearrange' },
  { id: 'graphs', label: 'Graphs' },
  { id: 'circle', label: 'Unit circle' },
  { id: 'match', label: 'Match' },
]

interface Props {
  progress: ProgressState
  settings: Settings
  scope: string[] | null
  onScope: (scope: string[] | null) => void
  onAnswer: (id: string, correct: boolean) => void
}

export function Challenge({ progress, settings, scope, onScope, onAnswer }: Props) {
  const [mode, setMode] = useState<Mode>('rearrange')

  return (
    <div>
      <div className="mode-bar">
        {MODES.map((m) => (
          <button
            key={m.id}
            className={mode === m.id ? 'chip chip-active' : 'chip'}
            onClick={() => setMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>
      {mode !== 'circle' ? <ScopePicker scope={scope} onChange={onScope} /> : null}
      {mode === 'rearrange' ? (
        <Rearrange progress={progress} settings={settings} scope={scope} onAnswer={onAnswer} />
      ) : null}
      {mode === 'graphs' ? <Graphs scope={scope} onAnswer={onAnswer} /> : null}
      {mode === 'circle' ? (
        <CircleQuiz progress={progress} settings={settings} onAnswer={onAnswer} />
      ) : null}
      {mode === 'match' ? (
        <MatchBoard progress={progress} settings={settings} scope={scope} onAnswer={onAnswer} />
      ) : null}
    </div>
  )
}
