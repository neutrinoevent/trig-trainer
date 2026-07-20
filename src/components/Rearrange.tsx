import { useState } from 'react'
import { IDENTITY_BY_ID } from '../data/identities'
import { pickVariant, variantOptions, type Variant } from '../data/variants'
import type { ProgressState } from '../store/progress'
import { QuizCard } from './QuizCard'

interface Props {
  progress: ProgressState
  onAnswer: (id: string, correct: boolean) => void
}

interface Served {
  variant: Variant
  options: string[]
  correctIndex: number
}

function serve(progress: ProgressState, excludeId: string | null): Served {
  const variant = pickVariant(progress, excludeId)
  return { variant, ...variantOptions(variant) }
}

export function Rearrange({ progress, onAnswer }: Props) {
  const [q, setQ] = useState<Served>(() => serve(progress, null))

  const family = IDENTITY_BY_ID.get(q.variant.baseId)?.familyName ?? ''

  return (
    <div>
      <p className="mode-blurb muted">
        The identities you know, wearing different clothes — factored, divided through, read
        right-to-left, or evaluated at a concrete angle. Answers feed the mastery of the
        underlying identity.
      </p>
      <QuizCard
        key={q.variant.id}
        badge={family}
        extraBadge="rearranged"
        promptTex={`${q.variant.prompt} \\;=\\; ?`}
        options={q.options}
        correctIndex={q.correctIndex}
        note={q.variant.note}
        onAnswer={(correct) => onAnswer(q.variant.baseId, correct)}
        onNext={() => setQ(serve(progress, q.variant.id))}
      />
    </div>
  )
}
