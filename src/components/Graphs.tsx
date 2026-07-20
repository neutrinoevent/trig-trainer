import { useState } from 'react'
import { CURVES, type Curve } from '../data/curves'
import { inScope, shuffle } from '../lib/pick'
import { QuizCard } from './QuizCard'

interface Props {
  scope: string[] | null
  onAnswer: (id: string, correct: boolean) => void
}

const W = 560
const H = 240
const X_MAX = 2 * Math.PI
const Y_MAX = 3

const px = (x: number) => ((x + X_MAX) / (2 * X_MAX)) * W
const py = (y: number) => H / 2 - (y / Y_MAX) * (H / 2)

function pathFor(fn: (x: number) => number): string {
  const N = 480
  let d = ''
  let pen = false
  for (let i = 0; i <= N; i++) {
    const x = -X_MAX + (2 * X_MAX * i) / N
    const y = fn(x)
    if (!Number.isFinite(y) || Math.abs(y) > Y_MAX * 1.15) {
      pen = false
      continue
    }
    d += `${pen ? 'L' : 'M'}${px(x).toFixed(1)} ${py(y).toFixed(1)}`
    pen = true
  }
  return d
}

function CurvePlot({ fn }: { fn: (x: number) => number }) {
  const xticks = [-2 * Math.PI, -Math.PI, Math.PI, 2 * Math.PI]
  const xlabels = ['−2π', '−π', 'π', '2π']
  return (
    <svg
      className="curve-plot"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Plotted curve to identify"
    >
      {[1, 2, -1, -2].map((y) => (
        <g key={y}>
          <line className="plot-grid" x1={0} y1={py(y)} x2={W} y2={py(y)} />
          <text className="plot-label" x={px(0) + 6} y={py(y) - 3}>
            {y}
          </text>
        </g>
      ))}
      <line className="plot-axis" x1={0} y1={py(0)} x2={W} y2={py(0)} />
      <line className="plot-axis" x1={px(0)} y1={0} x2={px(0)} y2={H} />
      {xticks.map((x, i) => (
        <g key={x}>
          <line className="plot-axis" x1={px(x)} y1={py(0) - 4} x2={px(x)} y2={py(0) + 4} />
          <text className="plot-label" x={px(x)} y={py(0) + 16} textAnchor="middle">
            {xlabels[i]}
          </text>
        </g>
      ))}
      <path className="plot-curve" d={pathFor(fn)} />
    </svg>
  )
}

interface Served {
  curve: Curve
  options: string[]
  correctIndex: number
}

function serve(scope: string[] | null, excludeId: string | null): Served {
  let pool = CURVES.filter((c) => inScope(c.familyId, scope))
  if (pool.length === 0) pool = CURVES
  if (excludeId && pool.length > 1) pool = pool.filter((c) => c.id !== excludeId)
  const curve = pool[Math.floor(Math.random() * pool.length)]
  const options = shuffle([curve.answer, ...curve.traps])
  return { curve, options, correctIndex: options.indexOf(curve.answer) }
}

export function Graphs({ scope, onAnswer }: Props) {
  const [q, setQ] = useState<Served>(() => serve(scope, null))

  return (
    <div>
      <p className="mode-blurb muted">
        Name the curve. Read amplitude, period, symmetry, poles, and asymptotes — the graph is
        the identity drawn instead of written.
      </p>
      <QuizCard
        key={q.curve.id + q.options.join('')}
        badge="Graph"
        visual={<CurvePlot fn={q.curve.fn} />}
        options={q.options}
        correctIndex={q.correctIndex}
        note={q.curve.note}
        onAnswer={(correct) => {
          if (q.curve.baseId) onAnswer(q.curve.baseId, correct)
        }}
        onNext={() => setQ(serve(scope, q.curve.id))}
      />
    </div>
  )
}
