import { useEffect, useState } from 'react'
import { FAMILIES, type FlatIdentity } from '../data/identities'
import { buildQuestion, pickIdentity, type Question } from '../lib/pick'
import { statsFor, type ProgressState } from '../store/progress'
import { Tex } from './Tex'

interface Props {
  progress: ProgressState
  scope: string | null
  onScope: (scope: string | null) => void
  onAnswer: (id: string, correct: boolean) => void
}

export function Drill({ progress, scope, onScope, onAnswer }: Props) {
  const [question, setQuestion] = useState<Question>(() =>
    buildQuestion(pickIdentity(progress, scope, null)),
  )
  const [picked, setPicked] = useState<number | null>(null)
  const [session, setSession] = useState({ asked: 0, correct: 0 })

  const nextQuestion = (from: FlatIdentity | null) => {
    setQuestion(buildQuestion(pickIdentity(progress, scope, from?.id ?? null)))
    setPicked(null)
  }

  const changeScope = (next: string | null) => {
    onScope(next)
    setQuestion(buildQuestion(pickIdentity(progress, next, null)))
    setPicked(null)
  }

  const choose = (i: number) => {
    if (picked !== null) return
    setPicked(i)
    const correct = i === question.correctIndex
    setSession((s) => ({ asked: s.asked + 1, correct: s.correct + (correct ? 1 : 0) }))
    onAnswer(question.identity.id, correct)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= String(question.options.length) && picked === null) {
        choose(Number(e.key) - 1)
      } else if ((e.key === 'Enter' || e.key === ' ') && picked !== null) {
        e.preventDefault()
        nextQuestion(question.identity)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const correct = picked !== null && picked === question.correctIndex
  const mastery = Math.round(statsFor(progress, question.identity.id).ema * 100)

  return (
    <div>
      <div className="mode-bar">
        <button
          className={scope === null ? 'chip chip-active' : 'chip'}
          onClick={() => changeScope(null)}
        >
          All families
        </button>
        {FAMILIES.map((f) => (
          <button
            key={f.id}
            className={scope === f.id ? 'chip chip-active' : 'chip'}
            onClick={() => changeScope(f.id)}
          >
            {f.name}
          </button>
        ))}
      </div>

      <div className="card problem-card">
        <div className="problem-meta">
          <span className="badge">{question.identity.familyName}</span>
          <span className="meta-note">
            {session.asked > 0
              ? `session ${session.correct}/${session.asked} · streak ${progress.currentStreak}`
              : 'keys 1–4 answer, Enter advances'}
          </span>
        </div>

        <div className="problem-tex">
          <Tex tex={`${question.identity.prompt} \\;=\\; ?`} block />
        </div>

        <div className="options" role="listbox" aria-label="Answer choices">
          {question.options.map((opt, i) => {
            let cls = 'option'
            if (picked !== null) {
              if (i === question.correctIndex) cls += ' option-correct'
              else if (i === picked) cls += ' option-wrong'
              else cls += ' option-dim'
            }
            return (
              <button key={opt} className={cls} onClick={() => choose(i)} disabled={picked !== null}>
                <span className="option-key">{i + 1}</span>
                <span className="option-tex">
                  <Tex tex={opt} />
                </span>
              </button>
            )
          })}
        </div>

        {picked !== null ? (
          <>
            <div className={correct ? 'feedback feedback-good' : 'feedback feedback-bad'}>
              {correct ? 'Correct.' : 'Not this time — the boxed answer is the identity.'}
              <span className="feedback-mastery"> mastery {mastery}%</span>
            </div>
            {question.identity.note ? <div className="hint">{question.identity.note}</div> : null}
            <div className="actions">
              <button className="btn btn-primary" onClick={() => nextQuestion(question.identity)}>
                Next ⏎
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
