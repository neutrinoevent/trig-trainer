import { ALL_IDENTITIES, FAMILIES } from '../data/identities'
import { VARIANTS } from '../data/variants'

export function About() {
  return (
    <div className="about">
      <div className="card">
        <h2 className="section-title">About</h2>
        <p>
          Trig Trainer exists because trig identities are the vocabulary of calculus: trig
          substitution, power reduction, and half the closed-form solutions in differential
          equations are one identity-recognition away. The goal here is not to look them up
          faster — it is to not need to look them up at all.
        </p>
        <p>
          {ALL_IDENTITIES.length} identities in {FAMILIES.length} families, plus{' '}
          {VARIANTS.length} rearranged forms, graph and unit-circle challenges, and a matching
          board — all feeding one adaptive schedule: drills favor what you miss, flashcards
          space what you know.
        </p>
      </div>

      <div className="card">
        <h2 className="section-title">Attribution</h2>
        <p>
          Built by <strong>Alexander Nichols</strong>, Old Dominion University.
        </p>
        <p>
          Contact: <a href="mailto:alnichols97@gmail.com">alnichols97@gmail.com</a> · Source:{' '}
          <a href="https://github.com/neutrinoevent/trig-trainer">
            github.com/neutrinoevent/trig-trainer
          </a>{' '}
          (MIT license)
        </p>
        <p>
          Companion project:{' '}
          <a href="https://github.com/neutrinoevent/integral-trainer">Integral Trainer</a> — the
          same idea applied to integration techniques.
        </p>
      </div>

      <div className="card">
        <h2 className="section-title">Privacy & data</h2>
        <p>
          Local-first by design: no server, no accounts, no analytics. All progress lives in
          this browser&rsquo;s storage and can be exported or erased from the Progress tab.
        </p>
        <p className="muted">Built with Vite, React, TypeScript, and KaTeX.</p>
      </div>
    </div>
  )
}
