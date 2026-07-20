import { statsFor, type ProgressState } from '../store/progress'
import { inScope, shuffle } from '../lib/pick'
import { IDENTITY_BY_ID } from './identities'

const r = String.raw

/**
 * A known identity served in a non-standard configuration — rearranged, factored,
 * read right-to-left, or evaluated — so recognition can't lean on the memorized layout.
 * Results feed the mastery stats of the base identity (`baseId`).
 * Every variant carries exactly 3 authored traps: distractors are never drawn from the
 * global pool, where an algebraically equivalent form could masquerade as "wrong".
 */
export interface Variant {
  id: string
  baseId: string
  prompt: string
  answer: string
  traps: [string, string, string]
  note?: string
}

export const VARIANTS: Variant[] = [
  // -- Pythagorean, reshaped ------------------------------------------------
  {
    id: 'v-one-minus-sin2',
    baseId: 'pyth-sincos',
    prompt: r`1 - \sin^2 x`,
    answer: r`\cos^2 x`,
    traps: [r`-\cos^2 x`, r`\sin^2 x`, r`\sec^2 x`],
  },
  {
    id: 'v-one-minus-cos2',
    baseId: 'pyth-sincos',
    prompt: r`1 - \cos^2 x`,
    answer: r`\sin^2 x`,
    traps: [r`-\sin^2 x`, r`\cos^2 x`, r`\csc^2 x`],
  },
  {
    id: 'v-sec2-minus-tan2',
    baseId: 'pyth-sec-minus',
    prompt: r`\sec^2 x - \tan^2 x`,
    answer: r`1`,
    traps: [r`-1`, r`\cos 2x`, r`2`],
  },
  {
    id: 'v-csc2-minus-cot2',
    baseId: 'pyth-csc-minus',
    prompt: r`\csc^2 x - \cot^2 x`,
    answer: r`1`,
    traps: [r`-1`, r`2`, r`\cot 2x`],
  },
  {
    id: 'v-conjugate',
    baseId: 'pyth-sincos',
    prompt: r`(1 - \sin x)(1 + \sin x)`,
    answer: r`\cos^2 x`,
    traps: [r`\sin^2 x`, r`-\cos^2 x`, r`1 + \sin^2 x`],
    note: 'Difference of squares — the standard move for rationalizing 1 ± sin x denominators.',
  },
  {
    id: 'v-fourth-powers',
    baseId: 'dbl-cos',
    prompt: r`\sin^4 x - \cos^4 x`,
    answer: r`-\cos 2x`,
    traps: [r`\cos 2x`, r`\sin 2x`, r`1`],
    note: 'Factor: (sin² + cos²)(sin² − cos²) = −(cos² − sin²) = −cos 2x.',
  },
  {
    id: 'v-sincos-square',
    baseId: 'dbl-sin',
    prompt: r`(\sin x + \cos x)^2`,
    answer: r`1 + \sin 2x`,
    traps: [r`1`, r`1 - \sin 2x`, r`1 + \cos 2x`],
    note: 'The cross term 2 sin x cos x is sin 2x; the squares sum to 1.',
  },
  {
    id: 'v-tan-plus-cot',
    baseId: 'pyth-sincos',
    prompt: r`\tan x + \cot x`,
    answer: r`\sec x\csc x`,
    traps: [r`1`, r`\sec x + \csc x`, r`\sec^2 x\csc^2 x`],
    note: 'Common denominator sin x cos x; the numerator collapses to 1. Also written 2/sin 2x.',
  },
  {
    id: 'v-sec-minus-cos',
    baseId: 'pyth-sincos',
    prompt: r`\sec x - \cos x`,
    answer: r`\sin x\tan x`,
    traps: [r`\cos x\tan x`, r`\sin x\cot x`, r`\tan x`],
    note: '(1 − cos²)/cos = sin²/cos. Peeling a sec into sin·tan is a recurring integrand cleanup.',
  },
  {
    id: 'v-csc-minus-sin',
    baseId: 'pyth-sincos',
    prompt: r`\csc x - \sin x`,
    answer: r`\cos x\cot x`,
    traps: [r`\sin x\cot x`, r`\cos x\tan x`, r`\cot x`],
  },
  {
    id: 'v-sec2cos2',
    baseId: 'pyth-tan',
    prompt: r`\left(1 + \tan^2 x\right)\cos^2 x`,
    answer: r`1`,
    traps: [r`\sec^2 x`, r`\tan^2 x`, r`\cos 2x`],
  },
  {
    id: 'v-sin2-over',
    baseId: 'pyth-sincos',
    prompt: r`\frac{\sin^2 x}{1 - \cos x}`,
    answer: r`1 + \cos x`,
    traps: [r`1 - \cos x`, r`\cos x - 1`, r`\sin x`],
    note: 'sin² = (1 − cos)(1 + cos). The conjugate factorization that tames 1 − cos x.',
  },

  // -- Double angle & power reduction, read right-to-left -------------------
  {
    id: 'v-rtl-sin2x',
    baseId: 'dbl-sin',
    prompt: r`2\sin x\cos x`,
    answer: r`\sin 2x`,
    traps: [r`\cos 2x`, r`\frac{\sin 2x}{2}`, r`2\sin 2x`],
    note: 'Right-to-left is the direction integration needs: spot the double angle inside the product.',
  },
  {
    id: 'v-rtl-cos2x',
    baseId: 'dbl-cos',
    prompt: r`\cos^2 x - \sin^2 x`,
    answer: r`\cos 2x`,
    traps: [r`\sin 2x`, r`-\cos 2x`, r`1`],
  },
  {
    id: 'v-rtl-cos2x-sin',
    baseId: 'dbl-cos-sin',
    prompt: r`1 - 2\sin^2 x`,
    answer: r`\cos 2x`,
    traps: [r`-\cos 2x`, r`\sin 2x`, r`1 - \sin 2x`],
  },
  {
    id: 'v-rtl-cos2x-cos',
    baseId: 'dbl-cos-cos',
    prompt: r`2\cos^2 x - 1`,
    answer: r`\cos 2x`,
    traps: [r`-\cos 2x`, r`\sin 2x`, r`2\cos 2x`],
  },
  {
    id: 'v-oneplus-cos2x',
    baseId: 'dbl-cos-cos',
    prompt: r`1 + \cos 2x`,
    answer: r`2\cos^2 x`,
    traps: [r`2\sin^2 x`, r`\cos^2 x`, r`1 + \cos^2 x`],
  },
  {
    id: 'v-oneminus-cos2x',
    baseId: 'dbl-cos-sin',
    prompt: r`1 - \cos 2x`,
    answer: r`2\sin^2 x`,
    traps: [r`2\cos^2 x`, r`\sin^2 x`, r`-2\sin^2 x`],
  },
  {
    id: 'v-tan2-ratio',
    baseId: 'pow-sin2',
    prompt: r`\frac{1 - \cos 2x}{1 + \cos 2x}`,
    answer: r`\tan^2 x`,
    traps: [r`\cot^2 x`, r`\tan x`, r`\sec^2 x`],
    note: '2sin²x over 2cos²x. Ratios of power-reduction forms collapse fast.',
  },
  {
    id: 'v-sin2x-over-sinx',
    baseId: 'dbl-sin',
    prompt: r`\frac{\sin 2x}{2\sin x}`,
    answer: r`\cos x`,
    traps: [r`\sin x`, r`2\cos x`, r`\cos 2x`],
  },
  {
    id: 'v-halftan-at-2x',
    baseId: 'half-tan-b',
    prompt: r`\frac{\sin 2x}{1 + \cos 2x}`,
    answer: r`\tan x`,
    traps: [r`\cot x`, r`\tan 2x`, r`\sec x`],
    note: 'The tan(x/2) formula read at doubled argument.',
  },
  {
    id: 'v-halftan-rtl',
    baseId: 'half-tan-a',
    prompt: r`\frac{1 - \cos x}{\sin x}`,
    answer: r`\tan\frac{x}{2}`,
    traps: [r`\cot\frac{x}{2}`, r`\tan x`, r`2\tan x`],
  },
  {
    id: 'v-halfsin-rtl',
    baseId: 'half-sin',
    prompt: r`2\sin^2\frac{x}{2}`,
    answer: r`1 - \cos x`,
    traps: [r`1 + \cos x`, r`\cos x - 1`, r`1 - \sin x`],
    note: 'Power reduction at half argument — how 1 − cos x integrands get rationalized.',
  },
  {
    id: 'v-halfcos-rtl',
    baseId: 'half-cos',
    prompt: r`2\cos^2\frac{x}{2}`,
    answer: r`1 + \cos x`,
    traps: [r`1 - \cos x`, r`1 + \sin x`, r`\cos x - 1`],
  },

  // -- Sum & difference, right-to-left and evaluated -------------------------
  {
    id: 'v-rtl-sinsum',
    baseId: 'sd-sin-plus',
    prompt: r`\sin a\cos b + \cos a\sin b`,
    answer: r`\sin(a + b)`,
    traps: [r`\sin(a - b)`, r`\cos(a + b)`, r`\cos(a - b)`],
  },
  {
    id: 'v-rtl-sindiff',
    baseId: 'sd-sin-minus',
    prompt: r`\sin a\cos b - \cos a\sin b`,
    answer: r`\sin(a - b)`,
    traps: [r`\sin(a + b)`, r`\cos(a - b)`, r`\cos(a + b)`],
  },
  {
    id: 'v-rtl-cossum',
    baseId: 'sd-cos-plus',
    prompt: r`\cos a\cos b - \sin a\sin b`,
    answer: r`\cos(a + b)`,
    traps: [r`\cos(a - b)`, r`\sin(a + b)`, r`\sin(a - b)`],
  },
  {
    id: 'v-rtl-cosdiff',
    baseId: 'sd-cos-minus',
    prompt: r`\cos a\cos b + \sin a\sin b`,
    answer: r`\cos(a - b)`,
    traps: [r`\cos(a + b)`, r`\sin(a - b)`, r`\sin(a + b)`],
  },
  {
    id: 'v-eval-cos15',
    baseId: 'sd-cos-minus',
    prompt: r`\cos\tfrac{\pi}{12}`,
    answer: r`\tfrac{\sqrt{6} + \sqrt{2}}{4}`,
    traps: [r`\tfrac{\sqrt{6} - \sqrt{2}}{4}`, r`\tfrac{\sqrt{3} + \sqrt{2}}{4}`, r`\tfrac{\sqrt{2}}{4}`],
    note: 'π/12 = π/3 − π/4: build it from angles you know.',
  },
  {
    id: 'v-eval-sin15',
    baseId: 'sd-sin-minus',
    prompt: r`\sin\tfrac{\pi}{12}`,
    answer: r`\tfrac{\sqrt{6} - \sqrt{2}}{4}`,
    traps: [r`\tfrac{\sqrt{6} + \sqrt{2}}{4}`, r`\tfrac{\sqrt{3} - \sqrt{2}}{4}`, r`\tfrac{\sqrt{2}}{4}`],
  },
  {
    id: 'v-eval-tan15',
    baseId: 'sd-tan-minus',
    prompt: r`\tan\tfrac{\pi}{12}`,
    answer: r`2 - \sqrt{3}`,
    traps: [r`2 + \sqrt{3}`, r`\sqrt{3} - 1`, r`\tfrac{\sqrt{3}}{3}`],
    note: 'tan(π/3 − π/4) through the difference formula, then rationalize.',
  },

  // -- Product/sum bridges, right-to-left ------------------------------------
  {
    id: 'v-rtl-ps-sincos',
    baseId: 'ps-sincos',
    prompt: r`\sin(a + b) + \sin(a - b)`,
    answer: r`2\sin a\cos b`,
    traps: [r`2\cos a\sin b`, r`2\sin a\sin b`, r`\sin a\cos b`],
  },
  {
    id: 'v-rtl-ps-sinsin',
    baseId: 'ps-sinsin',
    prompt: r`\cos(a - b) - \cos(a + b)`,
    answer: r`2\sin a\sin b`,
    traps: [r`-2\sin a\sin b`, r`2\cos a\cos b`, r`\sin a\sin b`],
  },
  {
    id: 'v-rtl-ps-coscos',
    baseId: 'ps-coscos',
    prompt: r`\cos(a + b) + \cos(a - b)`,
    answer: r`2\cos a\cos b`,
    traps: [r`2\sin a\sin b`, r`-2\cos a\cos b`, r`\cos a\cos b`],
  },

  // -- Calculus, reshaped ----------------------------------------------------
  {
    id: 'v-d-neg-cos',
    baseId: 'd-cos',
    prompt: r`\frac{d}{dx}\left(-\cos x\right)`,
    answer: r`\sin x`,
    traps: [r`-\sin x`, r`\cos x`, r`-\cos x`],
  },
  {
    id: 'v-d-chain-sin2x',
    baseId: 'd-sin',
    prompt: r`\frac{d}{dx}\,\sin 2x`,
    answer: r`2\cos 2x`,
    traps: [r`\cos 2x`, r`2\cos x`, r`-2\cos 2x`],
    note: 'Chain rule: the inner 2 comes out front, the argument stays doubled.',
  },
  {
    id: 'v-d-tan-squared',
    baseId: 'd-tan',
    prompt: r`\frac{d}{dx}\,\tan^2 x`,
    answer: r`2\tan x\sec^2 x`,
    traps: [r`2\tan x`, r`\sec^4 x`, r`2\sec^2 x`],
  },
  {
    id: 'v-d-sec-squared',
    baseId: 'd-sec',
    prompt: r`\frac{d}{dx}\,\sec^2 x`,
    answer: r`2\sec^2 x\tan x`,
    traps: [r`2\sec x\tan x`, r`\sec^2 x\tan^2 x`, r`2\sec x\tan^2 x`],
  },
  {
    id: 'v-d-arcsin-xa',
    baseId: 'id-arcsin',
    prompt: r`\frac{d}{dx}\,\arcsin\frac{x}{a}`,
    answer: r`\frac{1}{\sqrt{a^2 - x^2}}`,
    traps: [r`\frac{a}{\sqrt{a^2 - x^2}}`, r`\frac{1}{\sqrt{1 - x^2}}`, r`\frac{1}{a\sqrt{a^2 - x^2}}`],
    note: 'The inner 1/a cancels against the a pulled out of the root — which is why the integral table has no stray constant.',
  },
  {
    id: 'v-d-lnsec',
    baseId: 'i-tan',
    prompt: r`\frac{d}{dx}\,\ln|\sec x|`,
    answer: r`\tan x`,
    traps: [r`\sec x\tan x`, r`\cot x`, r`\frac{1}{\sec x}`],
    note: 'Differentiating the answer is why ∫tan x dx = ln|sec x|.',
  },
  {
    id: 'v-i-2sincos',
    baseId: 'dbl-sin',
    prompt: r`\int 2\sin x\cos x\,dx`,
    answer: r`\sin^2 x + C`,
    traps: [r`\sin 2x + C`, r`\frac{\sin^2 x}{2} + C`, r`-2\cos x + C`],
    note: '−cos²x + C and −½cos 2x + C are the same antiderivative in disguise — they differ by constants.',
  },
  {
    id: 'v-i-sin2',
    baseId: 'pow-sin2',
    prompt: r`\int \sin^2 x\,dx`,
    answer: r`\frac{x}{2} - \frac{\sin 2x}{4} + C`,
    traps: [r`\frac{x}{2} + \frac{\sin 2x}{4} + C`, r`\frac{\sin^3 x}{3} + C`, r`x - \sin 2x + C`],
    note: 'Power reduction carried through: ∫(1 − cos 2x)/2.',
  },
  {
    id: 'v-i-cos2',
    baseId: 'pow-cos2',
    prompt: r`\int \cos^2 x\,dx`,
    answer: r`\frac{x}{2} + \frac{\sin 2x}{4} + C`,
    traps: [r`\frac{x}{2} - \frac{\sin 2x}{4} + C`, r`\frac{\cos^3 x}{3} + C`, r`x + \sin 2x + C`],
  },
  {
    id: 'v-i-tan2',
    baseId: 'pyth-sec-minus',
    prompt: r`\int \tan^2 x\,dx`,
    answer: r`\tan x - x + C`,
    traps: [r`\frac{\tan^3 x}{3} + C`, r`\sec^2 x + C`, r`\tan x + x + C`],
    note: 'tan² = sec² − 1: one term integrates to tan x, the other to x.',
  },
  {
    id: 'v-i-onepluscos',
    baseId: 'half-cos',
    prompt: r`\int \frac{dx}{1 + \cos x}`,
    answer: r`\tan\frac{x}{2} + C`,
    traps: [r`\ln|1 + \cos x| + C`, r`\arctan x + C`, r`\cot\frac{x}{2} + C`],
    note: '1 + cos x = 2cos²(x/2), so the integrand is ½sec²(x/2).',
  },

  // -- Trig substitution: triangle back-substitution -------------------------
  {
    id: 'v-ts-sin-triangle',
    baseId: 'ts-sin',
    prompt: r`\text{If } x = a\sin\theta:\quad \tan\theta`,
    answer: r`\frac{x}{\sqrt{a^2 - x^2}}`,
    traps: [r`\frac{\sqrt{a^2 - x^2}}{x}`, r`\frac{x}{a}`, r`\frac{\sqrt{a^2 - x^2}}{a}`],
    note: 'Draw the triangle: opposite x, hypotenuse a, adjacent √(a² − x²). Back-substitution is reading it off.',
  },
  {
    id: 'v-ts-tan-triangle',
    baseId: 'ts-tan',
    prompt: r`\text{If } x = a\tan\theta:\quad \sin\theta`,
    answer: r`\frac{x}{\sqrt{a^2 + x^2}}`,
    traps: [r`\frac{a}{\sqrt{a^2 + x^2}}`, r`\frac{x}{a}`, r`\frac{\sqrt{a^2 + x^2}}{x}`],
  },
  {
    id: 'v-ts-sec-triangle',
    baseId: 'ts-sec',
    prompt: r`\text{If } x = a\sec\theta:\quad \sin\theta`,
    answer: r`\frac{\sqrt{x^2 - a^2}}{x}`,
    traps: [r`\frac{x}{\sqrt{x^2 - a^2}}`, r`\frac{a}{x}`, r`\frac{\sqrt{x^2 - a^2}}{a}`],
  },

  // -- Hyperbolic & Euler, reshaped ------------------------------------------
  {
    id: 'v-cosh-plus-sinh',
    baseId: 'h-sinh',
    prompt: r`\cosh x + \sinh x`,
    answer: r`e^{x}`,
    traps: [r`e^{-x}`, r`2e^{x}`, r`1`],
    note: 'The halves recombine. This is the cleanest way to remember both definitions at once.',
  },
  {
    id: 'v-cosh-minus-sinh',
    baseId: 'h-cosh',
    prompt: r`\cosh x - \sinh x`,
    answer: r`e^{-x}`,
    traps: [r`e^{x}`, r`-e^{-x}`, r`1`],
  },
  {
    id: 'v-euler-sum',
    baseId: 'eu-cos',
    prompt: r`e^{ix} + e^{-ix}`,
    answer: r`2\cos x`,
    traps: [r`2\sin x`, r`\cos x`, r`2i\sin x`],
  },
  {
    id: 'v-euler-diff',
    baseId: 'eu-sin',
    prompt: r`e^{ix} - e^{-ix}`,
    answer: r`2i\sin x`,
    traps: [r`2\sin x`, r`2i\cos x`, r`i\sin x`],
  },
  {
    id: 'v-euler-square',
    baseId: 'eu-demoivre',
    prompt: r`\left(e^{ix}\right)^2`,
    answer: r`\cos 2x + i\sin 2x`,
    traps: [r`\cos^2 x + i\sin^2 x`, r`\cos 2x - i\sin 2x`, r`2\cos x + 2i\sin x`],
    note: 'Exponent rules do the double-angle work: e^{2ix}, unpacked by Euler.',
  },
]

export const VARIANT_BY_ID: Map<string, Variant> = new Map(VARIANTS.map((v) => [v.id, v]))

/** Weight rearranged forms by mastery of the base identity, like the drill picker. */
export function pickVariant(
  state: ProgressState,
  scope: string[] | null,
  excludeId: string | null,
): Variant {
  let pool = VARIANTS.filter((v) =>
    inScope(IDENTITY_BY_ID.get(v.baseId)?.familyId ?? '', scope),
  )
  if (pool.length === 0) pool = VARIANTS
  if (excludeId && pool.length > 1) pool = pool.filter((v) => v.id !== excludeId)
  let total = 0
  const weights = pool.map((v) => {
    const s = statsFor(state, v.baseId)
    const w = s.attempts === 0 ? 0.55 : 0.12 + 1.6 * (1 - s.ema) * (1 - s.ema)
    total += w
    return w
  })
  let roll = Math.random() * total
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i]
    if (roll <= 0) return pool[i]
  }
  return pool[pool.length - 1]
}

export function variantOptions(
  v: Variant,
  optionCount = 4,
): { options: string[]; correctIndex: number } {
  const traps = shuffle([...v.traps]).slice(0, Math.max(1, optionCount - 1))
  const options = shuffle([v.answer, ...traps])
  return { options, correctIndex: options.indexOf(v.answer) }
}
