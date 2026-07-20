import { useState } from 'react'
import { IDENTITY_BY_ID } from '../data/identities'
import { pickVariant, variantOptions, type Variant } from '../data/variants'
import { resolveOptionCount } from '../lib/adapt'
import { tierFor } from '../lib/mastery'
import { statsFor, type ProgressState } from '../store/progress'
import type { Settings } from '../store/settings'
import { QuizCard } from './QuizCard'

interface Props {
  progress: ProgressState
  settings: Settings
  scope: string[] | null
  onAnswer: (id: string, correct: boolean) => void
}

interface Served {
  variant: Variant
  options: string[]
  correctIndex: number
}

function serve(
  progress: ProgressState,
  settings: Settings,
  scope: string[] | null,
  excludeId: string | null,
  recent: boolean[],
): Served {
  const variant = pickVariant(progress, scope, excludeId)
  const count = resolveOptionCount(settings, tierFor(statsFor(progress, variant.baseId)), recent)
  return { variant, ...variantOptions(variant, count) }
}

export function Rearrange({ progress, settings, scope, onAnswer }: Props) {
  const [recent, setRecent] = useState<boolean[]>([])
  const [q, setQ] = useState<Served>(() => serve(progress, settings, scope, null, []))

  const family = IDENTITY_BY_ID.get(q.variant.baseId)?.familyName ?? ''

  return (
    <div>
      <p className="mode-blurb muted">
        The identities you know, wearing different clothes — factored, divided through, read
        right-to-left, or evaluated at a concrete angle. Answers feed the mastery of the
        underlying identity.
      </p>
      <QuizCard
        key={q.variant.id + q.options.length}
        badge={family}
        extraBadge="rearranged"
        promptTex={`${q.variant.prompt} \\;=\\; ?`}
        options={q.options}
        correctIndex={q.correctIndex}
        note={q.variant.note}
        onAnswer={(correct) => {
          setRecent((r) => [...r, correct].slice(-20))
          onAnswer(q.variant.baseId, correct)
        }}
        onNext={() => setQ(serve(progress, settings, scope, q.variant.id, recent))}
      />
    </div>
  )
}
