import { useRef } from 'react'
import { FAMILIES } from '../data/identities'
import {
  dueCount,
  exportProgress,
  statsFor,
  type ProgressState,
} from '../store/progress'

interface Props {
  progress: ProgressState
  onReset: () => void
  onImport: (json: string) => boolean
}

export function ProgressView({ progress, onReset, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const accuracy =
    progress.totalAttempts > 0
      ? Math.round((progress.totalCorrect / progress.totalAttempts) * 100)
      : 0
  let learned = 0
  for (const s of Object.values(progress.byId)) {
    if (s.reps > 0) learned++
  }

  const download = () => {
    const blob = new Blob([exportProgress(progress)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'trig-trainer-progress.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const pickFile = (file: File | undefined) => {
    if (!file) return
    file.text().then((text) => {
      if (!onImport(text)) alert('That file is not a Trig Trainer backup.')
    })
  }

  return (
    <div>
      <div className="stat-row">
        <div className="card stat-tile">
          <div className="stat-value">{progress.totalAttempts}</div>
          <div className="stat-label">Answered</div>
        </div>
        <div className="card stat-tile">
          <div className="stat-value">{accuracy}%</div>
          <div className="stat-label">Accuracy</div>
        </div>
        <div className="card stat-tile">
          <div className="stat-value">{progress.currentStreak}</div>
          <div className="stat-label">Streak</div>
        </div>
        <div className="card stat-tile">
          <div className="stat-value">{progress.bestStreak}</div>
          <div className="stat-label">Best streak</div>
        </div>
        <div className="card stat-tile">
          <div className="stat-value">{learned}</div>
          <div className="stat-label">Cards learned</div>
        </div>
        <div className="card stat-tile">
          <div className="stat-value">{dueCount(progress)}</div>
          <div className="stat-label">Due now</div>
        </div>
      </div>

      <div className="card technique-table-card">
        <p className="table-caption muted">
          Mastery is a moving average of your recent answers per identity, averaged across each
          family. It drives which questions the drill favors.
        </p>
        <table className="technique-table">
          <thead>
            <tr>
              <th>Family</th>
              <th className="num">Seen</th>
              <th className="num">Correct</th>
              <th>Mastery</th>
            </tr>
          </thead>
          <tbody>
            {FAMILIES.map((f) => {
              let attempts = 0
              let correct = 0
              let ema = 0
              let seen = 0
              for (const ident of f.identities) {
                const s = statsFor(progress, ident.id)
                attempts += s.attempts
                correct += s.correct
                ema += s.ema
                if (s.attempts > 0 || s.reps > 0) seen++
              }
              const mastery = f.identities.length ? ema / f.identities.length : 0
              return (
                <tr key={f.id}>
                  <td>
                    <div className="tech-name">{f.name}</div>
                    <div className="tech-blurb muted">{f.group}</div>
                  </td>
                  <td className="num">
                    {seen}/{f.identities.length}
                  </td>
                  <td className="num">
                    {attempts > 0 ? `${Math.round((correct / attempts) * 100)}%` : '—'}
                  </td>
                  <td className="meter-col">
                    <span className="meter">
                      <span className="meter-fill" style={{ width: `${Math.round(mastery * 100)}%` }} />
                    </span>
                    <span className="meter-num">{Math.round(mastery * 100)}%</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="reset-row">
          <button className="btn" onClick={download}>
            Export backup
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            Import backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden-input"
            onChange={(e) => {
              pickFile(e.target.files?.[0])
              e.target.value = ''
            }}
          />
          <button
            className="btn btn-danger"
            onClick={() => {
              if (confirm('Erase all progress in this browser? Export a backup first if unsure.'))
                onReset()
            }}
          >
            Reset progress
          </button>
        </div>
      </div>
    </div>
  )
}
