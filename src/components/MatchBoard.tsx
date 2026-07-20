import { useState } from 'react'
import { ALL_IDENTITIES, type FlatIdentity } from '../data/identities'
import { norm, shuffle } from '../lib/pick'
import { Tex } from './Tex'

interface Props {
  onAnswer: (id: string, correct: boolean) => void
}

interface Tile {
  identId: string
  kind: 'prompt' | 'answer'
  tex: string
}

const PAIRS = 6

/**
 * Pick identities whose prompts and answers are short, tile-friendly, and
 * unambiguous on one board: no repeated prompt/answer forms, and no tile that
 * could truthfully pair with another identity's tile.
 */
function pickBoard(): Tile[] {
  const usedPrompts = new Set<string>()
  const usedAnswers = new Set<string>()
  const chosen: FlatIdentity[] = []
  for (const ident of shuffle(ALL_IDENTITIES)) {
    if (chosen.length >= PAIRS) break
    if (ident.prompt.includes('\\text') || ident.answer.includes('\\text')) continue
    if (ident.prompt.length + ident.answer.length > 88) continue
    const p = norm(ident.prompt)
    const a = norm(ident.answer)
    if (usedPrompts.has(p) || usedAnswers.has(a)) continue
    if (usedPrompts.has(a) || usedAnswers.has(p)) continue
    usedPrompts.add(p)
    usedAnswers.add(a)
    chosen.push(ident)
  }
  return shuffle(
    chosen.flatMap((i): Tile[] => [
      { identId: i.id, kind: 'prompt', tex: i.prompt },
      { identId: i.id, kind: 'answer', tex: i.answer },
    ]),
  )
}

export function MatchBoard({ onAnswer }: Props) {
  const [tiles, setTiles] = useState<Tile[]>(() => pickBoard())
  const [selected, setSelected] = useState<number | null>(null)
  const [matched, setMatched] = useState<Set<string>>(() => new Set())
  const [missed, setMissed] = useState<Set<string>>(() => new Set())
  const [flash, setFlash] = useState<[number, number] | null>(null)

  const newBoard = () => {
    setTiles(pickBoard())
    setSelected(null)
    setMatched(new Set())
    setMissed(new Set())
    setFlash(null)
  }

  const click = (i: number) => {
    const tile = tiles[i]
    if (matched.has(tile.identId) || flash !== null) return
    if (selected === null) {
      setSelected(i)
      return
    }
    if (selected === i) {
      setSelected(null)
      return
    }
    const prev = tiles[selected]
    if (prev.kind === tile.kind) {
      setSelected(i)
      return
    }
    if (prev.identId === tile.identId) {
      const next = new Set(matched)
      next.add(tile.identId)
      setMatched(next)
      setSelected(null)
      onAnswer(tile.identId, !missed.has(tile.identId))
    } else {
      const nextMissed = new Set(missed)
      nextMissed.add(prev.identId)
      nextMissed.add(tile.identId)
      setMissed(nextMissed)
      setFlash([selected, i])
      setSelected(null)
      setTimeout(() => setFlash(null), 450)
    }
  }

  const done = matched.size === PAIRS

  return (
    <div>
      <p className="mode-blurb muted">
        Pair each left side with its identity. A pair matched with no misses counts as a correct
        answer for that identity; a fumbled pair counts as a miss.
      </p>
      <div className="card">
        <div className="match-grid">
          {tiles.map((tile, i) => {
            let cls = 'match-tile'
            if (matched.has(tile.identId)) cls += ' match-done'
            else if (selected === i) cls += ' match-selected'
            else if (flash && (flash[0] === i || flash[1] === i)) cls += ' match-wrong'
            return (
              <button
                key={`${tile.identId}-${tile.kind}`}
                className={cls}
                onClick={() => click(i)}
                disabled={matched.has(tile.identId)}
              >
                <Tex tex={tile.tex} />
              </button>
            )
          })}
        </div>
        {done ? (
          <div className="actions match-actions">
            <div className="feedback feedback-good match-summary">
              Board cleared — {PAIRS - missed.size}/{PAIRS} clean.
            </div>
            <button className="btn btn-primary" onClick={newBoard}>
              New board
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
