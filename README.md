# Trig Trainer

Internalize the trig identities that matter in calculus and differential equations — Pythagorean through Weierstrass — until they are reflex.

Serves beginners and experts alike: a one-time placement sets experience-level defaults, and everything is individually configurable — choices per question (fixed or mastery-scaled 2→4), accuracy-band difficulty adaptation, worked-example introductions for new identities, and flashcard pacing. Practice anywhere is scopeable to batches of interest: curated tracks (Trig basics, Calc I, Integration toolkit, ODE prep) or any hand-picked set of families. Mastery is tracked per identity in criterion tiers (New → Learning → Familiar → Proficient → Mastered), and a coach line suggests the next best action.

132 identities in 22 families, grouped by role:

- **Foundations** — Pythagorean, reciprocal & quotient, even/odd, cofunction & shifts, special values
- **Angle algebra** — sum & difference, double/triple/half angle, power reduction, product↔sum, amplitude form
- **Calculus** — derivatives, inverse trig derivatives, integrals, inverse-trig integral forms, trig substitution, Weierstrass substitution, first moves (which identity/substitution cracks a given integral or ODE)
- **Beyond** — complex exponentials, hyperbolic functions

## Modes

- **Learn** — the identity library with a short note per family on where it earns its keep, and calculus-relevant notes on individual identities.
- **Drill** — adaptive multiple choice. Distractors are the classic sign errors; identities you miss come back more often. Keys 1–4 answer, Enter advances.
- **Challenge** — think-on-your-feet modes, all feeding the same mastery stats:
  - *Rearrange* — 53 known identities served factored, divided through, read right-to-left, or evaluated at concrete angles (cos π/12, triangle back-substitution, …).
  - *Graphs* — name the plotted curve from amplitude, period, poles, and asymptotes.
  - *Unit circle* — evaluate sin/cos/tan of an angle drawn on the circle, across all four quadrants.
  - *Match* — pair left sides with right sides on a 3/4/6-pair board; novice boards draw on familiar material with an optional study-first phase, expert boards hunt weak and unseen identities.
- **Cards** — spaced-repetition flashcards (SM-2 style). A configurable number of new cards a day plus whatever is due. Drill misses pull a card's next review forward.
- **Progress** — accuracy, streaks, per-family mastery tiers, and JSON backup/restore.
- **Settings** — experience level presets plus individual overrides for all of the above.

Local-first: no server, no accounts. Progress lives in the browser's localStorage.

## Development

```sh
npm install
npm run dev      # local dev server
npm run test     # corpus + scheduler tests
npm run lint
npm run build    # type-check + production build to dist/
```

Built with Vite, React, TypeScript, and KaTeX.

## License

MIT
