import { useEffect, useState, type ReactNode } from 'react'
import { Tex } from './Tex'

interface Props {
  badge: string
  extraBadge?: string
  meta?: string
  /** Optional figure (plot, unit circle) shown above the prompt. */
  visual?: ReactNode
  promptTex?: string
  options: string[]
  correctIndex: number
  note?: string
  onAnswer: (correct: boolean) => void
  onNext: () => void
}

/**
 * Shared multiple-choice card for the Challenge modes: same interaction contract
 * as Drill (1–4 answers, Enter advances), with room for a visual.
 * Remount with a `key` per question to reset the picked state.
 */
export function QuizCard({
  badge,
  extraBadge,
  meta,
  visual,
  promptTex,
  options,
  correctIndex,
  note,
  onAnswer,
  onNext,
}: Props) {
  const [picked, setPicked] = useState<number | null>(null)

  const choose = (i: number) => {
    if (picked !== null) return
    setPicked(i)
    onAnswer(i === correctIndex)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= String(options.length) && picked === null) {
        choose(Number(e.key) - 1)
      } else if ((e.key === 'Enter' || e.key === ' ') && picked !== null) {
        e.preventDefault()
        onNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const correct = picked !== null && picked === correctIndex

  return (
    <div className="card problem-card">
      <div className="problem-meta">
        <span className="badge">{badge}</span>
        {extraBadge ? <span className="badge badge-new">{extraBadge}</span> : null}
        {meta ? <span className="meta-note">{meta}</span> : null}
      </div>

      {visual ? <div className="quiz-visual">{visual}</div> : null}
      {promptTex ? (
        <div className="problem-tex">
          <Tex tex={promptTex} block />
        </div>
      ) : null}

      <div className="options" role="listbox" aria-label="Answer choices">
        {options.map((opt, i) => {
          let cls = 'option'
          if (picked !== null) {
            if (i === correctIndex) cls += ' option-correct'
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
            {correct ? 'Correct.' : 'Not this time — the boxed answer is the one.'}
          </div>
          {note ? <div className="hint">{note}</div> : null}
          <div className="actions">
            <button className="btn btn-primary" onClick={onNext}>
              Next ⏎
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}
