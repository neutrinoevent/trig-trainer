import { useState } from 'react'
import { boardTiles, pickBoardIdentities, type MatchTile } from '../lib/match'
import type { ProgressState } from '../store/progress'
import type { Settings } from '../store/settings'
import { Tex } from './Tex'

interface Props {
  progress: ProgressState
  settings: Settings
  scope: string[] | null
  onAnswer: (id: string, correct: boolean) => void
}

const PAIR_CHOICES = [3, 4, 6]

function defaultPairs(settings: Settings): number {
  if (settings.level === 'beginner') return 3
  if (settings.level === 'advanced') return 6
  return 4
}

interface Board {
  tiles: MatchTile[]
  pairTexById: Map<string, { prompt: string; answer: string; family: string }>
}

function makeBoard(
  progress: ProgressState,
  scope: string[] | null,
  pairCount: number,
  settings: Settings,
): Board {
  const identities = pickBoardIdentities(progress, scope, pairCount, settings.level)
  return {
    tiles: boardTiles(identities),
    pairTexById: new Map(
      identities.map((i) => [i.id, { prompt: i.prompt, answer: i.answer, family: i.familyName }]),
    ),
  }
}

export function MatchBoard({ progress, settings, scope, onAnswer }: Props) {
  const [pairCount, setPairCount] = useState<number>(() => defaultPairs(settings))
  const [board, setBoard] = useState<Board>(() => makeBoard(progress, scope, defaultPairs(settings), settings))
  const [studying, setStudying] = useState<boolean>(settings.level === 'beginner')
  const [selected, setSelected] = useState<number | null>(null)
  const [matched, setMatched] = useState<Set<string>>(() => new Set())
  const [missed, setMissed] = useState<Set<string>>(() => new Set())
  const [flash, setFlash] = useState<[number, number] | null>(null)

  const totalPairs = board.pairTexById.size
  const untouched = matched.size === 0 && missed.size === 0

  const reset = (nextPairs: number) => {
    setBoard(makeBoard(progress, scope, nextPairs, settings))
    setStudying(settings.level === 'beginner')
    setSelected(null)
    setMatched(new Set())
    setMissed(new Set())
    setFlash(null)
  }

  const changePairs = (n: number) => {
    setPairCount(n)
    reset(n)
  }

  const click = (i: number) => {
    const tile = board.tiles[i]
    if (matched.has(tile.identId) || flash !== null) return
    if (selected === null) {
      setSelected(i)
      return
    }
    if (selected === i) {
      setSelected(null)
      return
    }
    const prev = board.tiles[selected]
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

  const done = totalPairs > 0 && matched.size === totalPairs

  return (
    <div>
      <p className="mode-blurb muted">
        Pair each left side with its identity. A pair matched with no misses counts as a correct
        answer for that identity; a fumbled pair counts as a miss.
      </p>
      <div className="mode-bar">
        <span className="scope-label">Pairs</span>
        {PAIR_CHOICES.map((n) => (
          <button
            key={n}
            className={pairCount === n ? 'chip chip-active' : 'chip'}
            onClick={() => changePairs(n)}
          >
            {n}
          </button>
        ))}
        {!studying && untouched ? (
          <button className="chip" onClick={() => setStudying(true)}>
            Study pairs first
          </button>
        ) : null}
      </div>

      {studying ? (
        <div className="card">
          <p className="table-caption muted">
            Read the pairs, then match them from memory — study first, retrieve second.
          </p>
          <ul className="identity-list">
            {[...board.pairTexById.entries()].map(([id, pair]) => (
              <li key={id} className="identity-row">
                <div className="identity-tex">
                  <Tex tex={`${pair.prompt} \\;=\\; ${pair.answer}`} />
                </div>
                <div className="identity-note muted">{pair.family}</div>
              </li>
            ))}
          </ul>
          <div className="actions">
            <button className="btn btn-primary" onClick={() => setStudying(false)}>
              Shuffle & match
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className={totalPairs <= 4 ? 'match-grid match-grid-small' : 'match-grid'}>
            {board.tiles.map((tile, i) => {
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
                Board cleared — {totalPairs - [...missed].filter((id) => matched.has(id)).length}/
                {totalPairs} clean.
              </div>
              <button className="btn btn-primary" onClick={() => reset(pairCount)}>
                New board
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
