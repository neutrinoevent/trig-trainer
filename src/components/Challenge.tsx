import { useState } from 'react'
import type { ProgressState } from '../store/progress'
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
  onAnswer: (id: string, correct: boolean) => void
}

export function Challenge({ progress, onAnswer }: Props) {
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
      {mode === 'rearrange' ? <Rearrange progress={progress} onAnswer={onAnswer} /> : null}
      {mode === 'graphs' ? <Graphs onAnswer={onAnswer} /> : null}
      {mode === 'circle' ? <CircleQuiz onAnswer={onAnswer} /> : null}
      {mode === 'match' ? <MatchBoard onAnswer={onAnswer} /> : null}
    </div>
  )
}
