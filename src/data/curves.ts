const r = String.raw

/**
 * Curves for the graph-reading mode: a plotted function and four candidate
 * expressions. Traps are functions that plausibly match the shape — never
 * algebraic equivalents of the answer. `baseId` (when set) feeds mastery stats.
 */
export interface Curve {
  id: string
  fn: (x: number) => number
  answer: string
  traps: [string, string, string]
  baseId?: string
  note?: string
}

export const CURVES: Curve[] = [
  {
    id: 'c-sin2x',
    fn: (x) => Math.sin(2 * x),
    answer: r`\sin 2x`,
    traps: [r`\sin x`, r`2\sin x`, r`\cos 2x`],
    baseId: 'dbl-sin',
    note: 'Doubling the angle halves the period — amplitude stays 1.',
  },
  {
    id: 'c-sinsq',
    fn: (x) => Math.sin(x) ** 2,
    answer: r`\sin^2 x`,
    traps: [r`|\sin x|`, r`\cos^2 x`, r`\tfrac{1}{2}\sin 2x`],
    baseId: 'pow-sin2',
    note: 'Never negative, period π, oscillating around ½ — the shape power reduction describes: (1 − cos 2x)/2.',
  },
  {
    id: 'c-cossq',
    fn: (x) => Math.cos(x) ** 2,
    answer: r`\cos^2 x`,
    traps: [r`\sin^2 x`, r`|\cos x|`, r`1 + \cos x`],
    baseId: 'pow-cos2',
    note: 'Same shape as sin²x shifted — starts at its maximum because cos 0 = 1.',
  },
  {
    id: 'c-abssin',
    fn: (x) => Math.abs(Math.sin(x)),
    answer: r`|\sin x|`,
    traps: [r`\sin^2 x`, r`\sin x`, r`\tfrac{1}{2}(1 - \cos 2x)`],
    note: 'The giveaway versus sin²x: sharp corners at the zeros. Squaring smooths; absolute value creases.',
  },
  {
    id: 'c-cos',
    fn: (x) => Math.cos(x),
    answer: r`\cos x`,
    traps: [r`\sin x`, r`\sin\left(x - \tfrac{\pi}{2}\right)`, r`-\cos x`],
    baseId: 'cofn-sin-quarter',
    note: 'Also sin(x + π/2) — cosine is sine a quarter turn ahead. sin(x − π/2) is −cos x, the trap.',
  },
  {
    id: 'c-tan',
    fn: (x) => Math.tan(x),
    answer: r`\tan x`,
    traps: [r`\cot x`, r`\tan 2x`, r`\sec x`],
    baseId: 'ratio-tan',
    note: 'Rising through every zero of cos x; cot x falls, and sec x never crosses zero at all.',
  },
  {
    id: 'c-sec',
    fn: (x) => 1 / Math.cos(x),
    answer: r`\sec x`,
    traps: [r`\csc x`, r`\tan x`, r`\cosh x`],
    baseId: 'ratio-sec',
    note: 'U-shapes riding on ±1 with poles where cos x = 0 — the geometry behind sec²’s role as tan’s derivative.',
  },
  {
    id: 'c-sinpluscos',
    fn: (x) => Math.sin(x) + Math.cos(x),
    answer: r`\sqrt{2}\,\sin\left(x + \tfrac{\pi}{4}\right)`,
    traps: [
      r`2\sin\left(x + \tfrac{\pi}{4}\right)`,
      r`\sqrt{2}\,\sin\left(x - \tfrac{\pi}{4}\right)`,
      r`\sin 2x`,
    ],
    baseId: 'lin-sin',
    note: 'This is sin x + cos x — read the amplitude √2 ≈ 1.41 and phase π/4 straight off the graph.',
  },
  {
    id: 'c-powerform',
    fn: (x) => 1 - 2 * Math.sin(x) ** 2,
    answer: r`1 - 2\sin^2 x`,
    traps: [r`1 + 2\sin^2 x`, r`2\sin^2 x - 1`, r`\sin 2x`],
    baseId: 'dbl-cos-sin',
    note: 'It’s cos 2x wearing its all-sine form — recognizing the identity is how you read the graph.',
  },
  {
    id: 'c-cosh',
    fn: (x) => Math.cosh(x),
    answer: r`\cosh x`,
    traps: [r`x^2 + 1`, r`e^{x}`, r`\sinh x`],
    baseId: 'h-cosh',
    note: 'The catenary. It matches x² + 1 to second order at 0, then exponential growth outruns the parabola — compare wall steepness.',
  },
  {
    id: 'c-sinh',
    fn: (x) => Math.sinh(x),
    answer: r`\sinh x`,
    traps: [r`x^3`, r`\tan x`, r`x`],
    baseId: 'h-sinh',
    note: 'Odd, increasing everywhere, no poles — tan x has poles, x³ is flatter at the origin (slope 0, not 1).',
  },
  {
    id: 'c-tanh',
    fn: (x) => Math.tanh(x),
    answer: r`\tanh x`,
    traps: [r`\arctan x`, r`x`, r`\sin x`],
    baseId: 'h-tanh',
    note: 'S-curve saturating at ±1. arctan saturates at ±π/2 ≈ 1.57 — check the asymptote height.',
  },
  {
    id: 'c-halfarg',
    fn: (x) => Math.sin(x / 2),
    answer: r`\sin\tfrac{x}{2}`,
    traps: [r`\sin 2x`, r`\tfrac{1}{2}\sin x`, r`\cos\tfrac{x}{2}`],
    baseId: 'half-sin',
    note: 'Halving the angle doubles the period: one full cycle across 4π. ½sin x would shrink the height, not stretch the width.',
  },
  {
    id: 'c-oneminuscos',
    fn: (x) => 1 - Math.cos(x),
    answer: r`1 - \cos x`,
    traps: [r`1 + \cos x`, r`2\sin^2 x`, r`\cos x - 1`],
    baseId: 'half-sin',
    note: 'Equals 2sin²(x/2): nonnegative, kissing zero at multiples of 2π. The trap 2sin²x has period π, not 2π.',
  },
]
