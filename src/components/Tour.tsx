import { useEffect, useLayoutEffect, useState, type CSSProperties } from 'react'

export const TOUR_KEY = 'trig-trainer-tour-done'

const STEPS: { sel: string | null; title: string; body: string }[] = [
  {
    sel: null,
    title: 'Welcome to Trig Trainer',
    body: 'Every identity you need for calculus and differential equations, drilled until it is reflex. A one-minute tour of where things are.',
  },
  {
    sel: '[data-tour="learn"]',
    title: 'Learn',
    body: 'The identity library, grouped into families — Pythagorean through Weierstrass. Each family has a short note on where it earns its keep, and a button to drill just that family.',
  },
  {
    sel: '[data-tour="drill"]',
    title: 'Drill',
    body: 'Rapid-fire multiple choice. The wrong options are the classic sign errors, and questions adapt: identities you miss come back more often. Keys 1–4 answer, Enter advances.',
  },
  {
    sel: '[data-tour="challenge"]',
    title: 'Challenge',
    body: 'Think-on-your-feet modes: identities served rearranged and factored, curves to name from their graphs, a unit-circle quiz across all four quadrants, and a matching board. Same progress tracking underneath.',
  },
  {
    sel: '[data-tour="cards"]',
    title: 'Cards',
    body: 'Spaced-repetition flashcards. A few new cards a day plus whatever is due; right answers push a card further out, misses bring it back.',
  },
  {
    sel: '[data-tour="progress"]',
    title: 'Progress',
    body: "Accuracy, streaks, and per-family mastery. Everything is stored in this browser — JSON backups live here too. That's the tour.",
  },
]

interface Props {
  onDone: (goLearn: boolean) => void
}

export function Tour({ onDone }: Props) {
  const [step, setStep] = useState(0)
  const [, setTick] = useState(0)

  const finish = (goLearn: boolean) => {
    try {
      localStorage.setItem(TOUR_KEY, '1')
    } catch {
      // fine — the tour just reappears next visit
    }
    onDone(goLearn)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish(false)
      if (e.key === 'Enter' || e.key === 'ArrowRight')
        setStep((s) => {
          if (s === STEPS.length - 1) {
            finish(true)
            return s
          }
          return s + 1
        })
      if (e.key === 'ArrowLeft') setStep((s) => Math.max(0, s - 1))
    }
    const onResize = () => setTick((t) => t + 1)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [spotStyle, setSpotStyle] = useState<CSSProperties>({})
  const [popStyle, setPopStyle] = useState<CSSProperties>({})

  useLayoutEffect(() => {
    const s = STEPS[step]
    const target = s.sel ? document.querySelector(s.sel) : null
    const pop = document.getElementById('tour-pop')
    const pw = pop?.offsetWidth ?? 330
    const ph = pop?.offsetHeight ?? 180
    if (target) {
      const r = target.getBoundingClientRect()
      setSpotStyle({ left: r.left - 6, top: r.top - 6, width: r.width + 12, height: r.height + 12 })
      let left = r.right + 18
      let top = r.top - 8
      if (left + pw > window.innerWidth - 12) {
        left = Math.min(r.left, window.innerWidth - pw - 12)
        top = r.bottom + 14
      }
      setPopStyle({
        left: Math.max(12, left),
        top: Math.max(12, Math.min(top, window.innerHeight - ph - 12)),
      })
    } else {
      setSpotStyle({ left: '50%', top: '38%', width: 0, height: 0 })
      setPopStyle({
        left: Math.max(12, (window.innerWidth - pw) / 2),
        top: Math.max(12, window.innerHeight * 0.35 - ph / 2),
      })
    }
  }, [step])

  const s = STEPS[step]
  const last = step === STEPS.length - 1

  return (
    <div className="tour-root">
      <div className="tour-spot" style={spotStyle} />
      <div className="tour-pop" id="tour-pop" style={popStyle} role="dialog" aria-label="Interface tour">
        <div className="tour-title">{s.title}</div>
        <div className="tour-body">{s.body}</div>
        <div className="tour-dots">
          {STEPS.map((_, i) => (
            <i key={i} className={i === step ? 'on' : ''} />
          ))}
        </div>
        <div className="tour-row">
          <button className="btn" onClick={() => finish(false)}>
            Skip
          </button>
          <span className="tour-spacer" />
          {step > 0 ? (
            <button className="btn" onClick={() => setStep((v) => Math.max(0, v - 1))}>
              Back
            </button>
          ) : null}
          <button
            className="btn btn-primary"
            onClick={() => (last ? finish(true) : setStep((v) => v + 1))}
          >
            {last ? 'Start learning' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
