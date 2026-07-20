import { useState } from 'react'
import { IDENTITY_BY_ID } from '../data/identities'
import {
  cardQueue,
  statsFor,
  NEW_PER_DAY,
  type Grade,
  type ProgressState,
} from '../store/progress'
import { Tex } from './Tex'

interface Props {
  progress: ProgressState
  scope: string | null
  onGrade: (id: string, grade: Grade) => void
}

function goodInterval(days: number, ease: number): number {
  return days < 1 ? 1 : Math.max(days + 1, Math.round(days * ease))
}

export function Cards({ progress, scope, onGrade }: Props) {
  const [revealed, setRevealed] = useState(false)

  const queue = cardQueue(progress, scope)
  const currentId = queue.due[0] ?? queue.fresh[0] ?? null
  const identity = currentId ? IDENTITY_BY_ID.get(currentId) : undefined

  if (!identity) {
    return (
      <div className="card empty-state">
        <p className="empty-title">All caught up.</p>
        <p className="muted">
          No cards are due{scope ? ' in this family' : ''} and today&rsquo;s{' '}
          {NEW_PER_DAY} new cards are done. Reviews return as they come due — or switch to Drill
          for open-ended practice.
        </p>
      </div>
    )
  }

  const stats = statsFor(progress, identity.id)
  const isNew = stats.due === null
  const goodDays = goodInterval(stats.intervalDays, stats.ease)
  const easyDays = stats.intervalDays < 1 ? 3 : Math.max(goodDays + 1, Math.round(stats.intervalDays * stats.ease * 1.4))

  const grade = (g: Grade) => {
    onGrade(identity.id, g)
    setRevealed(false)
  }

  return (
    <div>
      <div className="mode-bar">
        <span className="meta-note">
          due {queue.due.length} · new today {queue.fresh.length}
          {isNew ? ' · this card is new' : ''}
        </span>
      </div>

      <div className="card problem-card">
        <div className="problem-meta">
          <span className="badge">{identity.familyName}</span>
          {isNew ? <span className="badge badge-new">new</span> : null}
        </div>

        <div className="problem-tex">
          <Tex tex={`${identity.prompt} \\;=\\; ?`} block />
        </div>

        {revealed ? (
          <>
            <div className="card-answer">
              <Tex tex={`${identity.prompt} \\;=\\; ${identity.answer}`} block />
            </div>
            {identity.note ? <div className="hint">{identity.note}</div> : null}
            <div className="actions grade-row">
              <button className="btn btn-danger" onClick={() => grade('again')}>
                Again · 10 min
              </button>
              <button className="btn" onClick={() => grade('good')}>
                Good · {goodDays}d
              </button>
              <button className="btn" onClick={() => grade('easy')}>
                Easy · {easyDays}d
              </button>
            </div>
          </>
        ) : (
          <div className="actions">
            <button className="btn btn-primary" onClick={() => setRevealed(true)}>
              Show answer
            </button>
          </div>
        )}
      </div>

      <p className="muted cards-note">
        Grade yourself honestly — the schedule adapts to it. Misses in Drill also pull a
        card&rsquo;s next review forward.
      </p>
    </div>
  )
}
