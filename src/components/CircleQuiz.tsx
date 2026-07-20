import { useState } from 'react'
import { FAMILY_BY_ID } from '../data/identities'
import { resolveOptionCount } from '../lib/adapt'
import { makeCircleQuestion, type CircleQuestion } from '../lib/circle'
import { familyTier } from '../lib/mastery'
import type { ProgressState } from '../store/progress'
import type { Settings } from '../store/settings'
import { QuizCard } from './QuizCard'

interface Props {
  progress: ProgressState
  settings: Settings
  onAnswer: (id: string, correct: boolean) => void
}

const S = 240
const C = S / 2
const R = 92
const ARC_R = 26

function CircleFigure({ theta }: { theta: number }) {
  const x = C + R * Math.cos(theta)
  const y = C - R * Math.sin(theta)
  const largeArc = theta > Math.PI ? 1 : 0
  const arcX = C + ARC_R * Math.cos(theta)
  const arcY = C - ARC_R * Math.sin(theta)
  return (
    <svg
      className="circle-figure"
      viewBox={`0 0 ${S} ${S}`}
      role="img"
      aria-label="Angle marked on the unit circle"
    >
      <line className="plot-axis" x1={0} y1={C} x2={S} y2={C} />
      <line className="plot-axis" x1={C} y1={0} x2={C} y2={S} />
      <circle className="circle-ring" cx={C} cy={C} r={R} />
      <text className="plot-label" x={C + R + 4} y={C + 14}>1</text>
      <text className="plot-label" x={C - R - 16} y={C + 14}>−1</text>
      {theta > 0 ? (
        <path
          className="circle-arc"
          d={`M${C + ARC_R} ${C} A${ARC_R} ${ARC_R} 0 ${largeArc} 0 ${arcX.toFixed(1)} ${arcY.toFixed(1)}`}
        />
      ) : null}
      <line className="circle-drop" x1={x} y1={y} x2={x} y2={C} />
      <line className="circle-drop" x1={x} y1={y} x2={C} y2={y} />
      <line className="circle-radius" x1={C} y1={C} x2={x} y2={y} />
      <circle className="circle-point" cx={x} cy={y} r={4.5} />
    </svg>
  )
}

export function CircleQuiz({ progress, settings, onAnswer }: Props) {
  const [recent, setRecent] = useState<boolean[]>([])
  const countFor = (r: boolean[]) =>
    resolveOptionCount(settings, familyTier(progress, FAMILY_BY_ID.get('values')!), r)
  const [q, setQ] = useState<CircleQuestion>(() => makeCircleQuestion(null, countFor([])))

  const next = () => setQ(makeCircleQuestion(q.key, countFor(recent)))

  return (
    <div>
      <p className="mode-blurb muted">
        Read the circle: reference angle from the picture, sign from the quadrant. This is the
        Special values family extended to all four quadrants.
      </p>
      <QuizCard
        key={q.key + q.options.join('')}
        badge="Unit circle"
        visual={<CircleFigure theta={q.theta} />}
        promptTex={`\\theta = ${q.angleTex},\\qquad \\${q.fn}\\theta \\;=\\; ?`}
        options={q.options}
        correctIndex={q.correctIndex}
        onAnswer={(correct) => {
          setRecent((r) => [...r, correct].slice(-20))
          onAnswer(q.baseId, correct)
        }}
        onNext={next}
      />
    </div>
  )
}
