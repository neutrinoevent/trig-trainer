import { useEffect, useState } from 'react'
import type { FlatIdentity } from '../data/identities'
import { resolveOptionCount } from '../lib/adapt'
import { tierFor, TIER_LABEL } from '../lib/mastery'
import { buildQuestion, pickIdentity, type Question } from '../lib/pick'
import { statsFor, type ProgressState } from '../store/progress'
import type { Settings } from '../store/settings'
import { ScopePicker } from './ScopePicker'
import { Tex } from './Tex'

interface Props {
  progress: ProgressState
  settings: Settings
  scope: string[] | null
  onScope: (scope: string[] | null) => void
  onAnswer: (id: string, correct: boolean) => void
}

type Serve =
  | { kind: 'intro'; identity: FlatIdentity }
  | { kind: 'question'; q: Question }

interface SessionState {
  asked: number
  correct: number
  recent: boolean[]
  introduced: string[]
}

const freshSession = (): SessionState => ({ asked: 0, correct: 0, recent: [], introduced: [] })

function serveFor(
  progress: ProgressState,
  settings: Settings,
  scope: string[] | null,
  excludeId: string | null,
  session: SessionState,
): Serve {
  const identity = pickIdentity(progress, scope, excludeId)
  const stats = statsFor(progress, identity.id)
  if (settings.introduceFirst && stats.attempts === 0 && !session.introduced.includes(identity.id)) {
    return { kind: 'intro', identity }
  }
  const count = resolveOptionCount(settings, tierFor(stats), session.recent)
  return { kind: 'question', q: buildQuestion(identity, count) }
}

export function Drill({ progress, settings, scope, onScope, onAnswer }: Props) {
  const [session, setSession] = useState<SessionState>(freshSession)
  const [serve, setServe] = useState<Serve>(() =>
    serveFor(progress, settings, scope, null, freshSession()),
  )
  const [picked, setPicked] = useState<number | null>(null)

  const currentIdentity = serve.kind === 'intro' ? serve.identity : serve.q.identity

  const advance = (nextSession: SessionState, exclude: string | null) => {
    setServe(serveFor(progress, settings, scope, exclude, nextSession))
    setPicked(null)
  }

  const changeScope = (next: string[] | null) => {
    onScope(next)
    setServe(serveFor(progress, settings, next, null, session))
    setPicked(null)
  }

  /** After a worked-example intro, quiz the same identity immediately: example → problem. */
  const acknowledgeIntro = () => {
    const identity = currentIdentity
    const nextSession = { ...session, introduced: [...session.introduced, identity.id] }
    setSession(nextSession)
    const count = resolveOptionCount(settings, 'new', nextSession.recent)
    setServe({ kind: 'question', q: buildQuestion(identity, count) })
    setPicked(null)
  }

  const choose = (i: number) => {
    if (serve.kind !== 'question' || picked !== null) return
    setPicked(i)
    const correct = i === serve.q.correctIndex
    setSession((s) => ({
      ...s,
      asked: s.asked + 1,
      correct: s.correct + (correct ? 1 : 0),
      recent: [...s.recent, correct].slice(-20),
    }))
    onAnswer(serve.q.identity.id, correct)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (serve.kind === 'intro') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          acknowledgeIntro()
        }
        return
      }
      if (e.key >= '1' && e.key <= String(serve.q.options.length) && picked === null) {
        choose(Number(e.key) - 1)
      } else if ((e.key === 'Enter' || e.key === ' ') && picked !== null) {
        e.preventDefault()
        advance(session, serve.q.identity.id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const stats = statsFor(progress, currentIdentity.id)
  const tier = TIER_LABEL[tierFor(stats)]

  if (serve.kind === 'intro') {
    return (
      <div>
        <ScopePicker scope={scope} onChange={changeScope} />
        <div className="card problem-card">
          <div className="problem-meta">
            <span className="badge">{serve.identity.familyName}</span>
            <span className="badge badge-new">new identity</span>
            <span className="meta-note">read it — it enters rotation next</span>
          </div>
          <div className="problem-tex">
            <Tex tex={`${serve.identity.prompt} \\;=\\; ${serve.identity.answer}`} block />
          </div>
          {serve.identity.note ? <div className="hint">{serve.identity.note}</div> : null}
          <div className="actions">
            <button className="btn btn-primary" onClick={acknowledgeIntro}>
              Got it — quiz me ⏎
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { q } = serve
  const correct = picked !== null && picked === q.correctIndex

  return (
    <div>
      <ScopePicker scope={scope} onChange={changeScope} />

      <div className="card problem-card">
        <div className="problem-meta">
          <span className="badge">{q.identity.familyName}</span>
          <span className="meta-note">
            {session.asked > 0
              ? `session ${session.correct}/${session.asked} · streak ${progress.currentStreak} · ${tier.toLowerCase()}`
              : `keys 1–${q.options.length} answer, Enter advances`}
          </span>
        </div>

        <div className="problem-tex">
          <Tex tex={`${q.identity.prompt} \\;=\\; ?`} block />
        </div>

        <div className="options" role="listbox" aria-label="Answer choices">
          {q.options.map((opt, i) => {
            let cls = 'option'
            if (picked !== null) {
              if (i === q.correctIndex) cls += ' option-correct'
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
              <span className="feedback-mastery"> {tier.toLowerCase()}</span>
            </div>
            {q.identity.note ? <div className="hint">{q.identity.note}</div> : null}
            <div className="actions">
              <button
                className="btn btn-primary"
                onClick={() => advance(session, q.identity.id)}
              >
                Next ⏎
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
