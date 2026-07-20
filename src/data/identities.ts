const r = String.raw

export type GroupName = 'Foundations' | 'Angle algebra' | 'Calculus' | 'Beyond'

export interface Identity {
  id: string
  /** LaTeX left side; rendered as `prompt = ?` in drills and `prompt = answer` in Learn. */
  prompt: string
  answer: string
  note?: string
  /** Hand-authored wrong answers (classic sign/reciprocal errors) used as distractors first. */
  traps?: string[]
}

export interface Family {
  id: string
  name: string
  group: GroupName
  blurb: string
  identities: Identity[]
}

export const FAMILIES: Family[] = [
  // ------------------------------------------------------------ Foundations
  {
    id: 'pythagorean',
    name: 'Pythagorean',
    group: 'Foundations',
    blurb:
      'The unit circle written as algebra. These three equations (and their rearrangements) are behind nearly every simplification in trig substitution: they turn a square root of a sum or difference of squares into a single trig function.',
    identities: [
      {
        id: 'pyth-sincos',
        prompt: r`\sin^2 x + \cos^2 x`,
        answer: r`1`,
        note: 'The unit circle itself. Everything else in this family is this equation divided by cos² or sin².',
        traps: [r`\cos 2x`, r`\sin 2x`, r`0`],
      },
      {
        id: 'pyth-tan',
        prompt: r`1 + \tan^2 x`,
        answer: r`\sec^2 x`,
        note: 'Divide sin² + cos² = 1 by cos². The reason x = a·tan θ tames a² + x².',
        traps: [r`\csc^2 x`, r`\cot^2 x`],
      },
      {
        id: 'pyth-cot',
        prompt: r`1 + \cot^2 x`,
        answer: r`\csc^2 x`,
        note: 'Divide sin² + cos² = 1 by sin².',
        traps: [r`\sec^2 x`, r`\tan^2 x`],
      },
      {
        id: 'pyth-sec-minus',
        prompt: r`\sec^2 x - 1`,
        answer: r`\tan^2 x`,
        note: 'The reason x = a·sec θ tames √(x² − a²): the radicand becomes a²·tan²θ.',
        traps: [r`\cot^2 x`, r`-\tan^2 x`],
      },
      {
        id: 'pyth-csc-minus',
        prompt: r`\csc^2 x - 1`,
        answer: r`\cot^2 x`,
        traps: [r`\tan^2 x`, r`-\cot^2 x`],
      },
    ],
  },
  {
    id: 'ratio',
    name: 'Reciprocal & quotient',
    group: 'Foundations',
    blurb:
      'Definitions of the four secondary functions. In practice: when an integrand mixes tan, sec, csc, or cot, rewriting everything as sin and cos is often the first productive move.',
    identities: [
      {
        id: 'ratio-tan',
        prompt: r`\tan x`,
        answer: r`\frac{\sin x}{\cos x}`,
        traps: [r`\frac{\cos x}{\sin x}`, r`\frac{1}{\sin x}`],
      },
      {
        id: 'ratio-cot',
        prompt: r`\cot x`,
        answer: r`\frac{\cos x}{\sin x}`,
        traps: [r`\frac{\sin x}{\cos x}`, r`\frac{1}{\cos x}`],
      },
      {
        id: 'ratio-sec',
        prompt: r`\sec x`,
        answer: r`\frac{1}{\cos x}`,
        traps: [r`\frac{1}{\sin x}`, r`\frac{1}{\tan x}`],
      },
      {
        id: 'ratio-csc',
        prompt: r`\csc x`,
        answer: r`\frac{1}{\sin x}`,
        traps: [r`\frac{1}{\cos x}`, r`\frac{1}{\cot x}`],
      },
      {
        id: 'ratio-cot-tan',
        prompt: r`\frac{1}{\tan x}`,
        answer: r`\cot x`,
        traps: [r`\sec x`, r`\csc x`],
      },
    ],
  },
  {
    id: 'parity',
    name: 'Even & odd',
    group: 'Foundations',
    blurb:
      'Cosine and secant are even; the other four are odd. This is what makes ∫ of an odd integrand over [−a, a] vanish instantly, and it governs every sign when you substitute −x or −u.',
    identities: [
      {
        id: 'parity-sin',
        prompt: r`\sin(-x)`,
        answer: r`-\sin x`,
        traps: [r`\sin x`, r`\cos x`],
      },
      {
        id: 'parity-cos',
        prompt: r`\cos(-x)`,
        answer: r`\cos x`,
        note: 'Cosine is even — the one everyone flips by mistake.',
        traps: [r`-\cos x`, r`\sin x`],
      },
      {
        id: 'parity-tan',
        prompt: r`\tan(-x)`,
        answer: r`-\tan x`,
        traps: [r`\tan x`, r`\cot x`],
      },
      {
        id: 'parity-sec',
        prompt: r`\sec(-x)`,
        answer: r`\sec x`,
        traps: [r`-\sec x`, r`\csc x`],
      },
      {
        id: 'parity-csc',
        prompt: r`\csc(-x)`,
        answer: r`-\csc x`,
        traps: [r`\csc x`, r`\sec x`],
      },
      {
        id: 'parity-cot',
        prompt: r`\cot(-x)`,
        answer: r`-\cot x`,
        traps: [r`\cot x`, r`\tan x`],
      },
    ],
  },
  {
    id: 'cofunction',
    name: 'Cofunction & shifts',
    group: 'Foundations',
    blurb:
      'How sin and cos trade places under reflections and quarter/half-turn shifts. These let you evaluate awkward angles, collapse phase shifts in ODE solutions, and see why ∫₀^{π/2} f(sin x) dx = ∫₀^{π/2} f(cos x) dx.',
    identities: [
      {
        id: 'cofn-sin',
        prompt: r`\sin\left(\tfrac{\pi}{2} - x\right)`,
        answer: r`\cos x`,
        traps: [r`-\cos x`, r`\sin x`],
      },
      {
        id: 'cofn-cos',
        prompt: r`\cos\left(\tfrac{\pi}{2} - x\right)`,
        answer: r`\sin x`,
        traps: [r`-\sin x`, r`\cos x`],
      },
      {
        id: 'cofn-tan',
        prompt: r`\tan\left(\tfrac{\pi}{2} - x\right)`,
        answer: r`\cot x`,
        traps: [r`-\cot x`, r`\tan x`],
      },
      {
        id: 'cofn-sin-supp',
        prompt: r`\sin(\pi - x)`,
        answer: r`\sin x`,
        note: 'Supplementary angles share a sine — the geometry behind the law of sines being well-defined.',
        traps: [r`-\sin x`, r`\cos x`],
      },
      {
        id: 'cofn-cos-supp',
        prompt: r`\cos(\pi - x)`,
        answer: r`-\cos x`,
        traps: [r`\cos x`, r`-\sin x`],
      },
      {
        id: 'cofn-sin-pi',
        prompt: r`\sin(x + \pi)`,
        answer: r`-\sin x`,
        traps: [r`\sin x`, r`\cos x`],
      },
      {
        id: 'cofn-cos-pi',
        prompt: r`\cos(x + \pi)`,
        answer: r`-\cos x`,
        traps: [r`\cos x`, r`\sin x`],
      },
      {
        id: 'cofn-sin-quarter',
        prompt: r`\sin\left(x + \tfrac{\pi}{2}\right)`,
        answer: r`\cos x`,
        note: 'A quarter turn ahead: sine becomes cosine. Differentiating sin is exactly this shift.',
        traps: [r`-\cos x`, r`-\sin x`],
      },
      {
        id: 'cofn-cos-quarter',
        prompt: r`\cos\left(x + \tfrac{\pi}{2}\right)`,
        answer: r`-\sin x`,
        traps: [r`\sin x`, r`\cos x`],
      },
    ],
  },
  {
    id: 'values',
    name: 'Special values',
    group: 'Foundations',
    blurb:
      'The five standard angles of the first quadrant. Evaluating definite integrals with trig bounds is instant when these are automatic — and every other quadrant follows from the shift identities.',
    identities: [
      { id: 'val-sin-0', prompt: r`\sin 0`, answer: r`0` },
      { id: 'val-sin-pi6', prompt: r`\sin\tfrac{\pi}{6}`, answer: r`\tfrac{1}{2}` },
      { id: 'val-sin-pi4', prompt: r`\sin\tfrac{\pi}{4}`, answer: r`\tfrac{\sqrt{2}}{2}` },
      { id: 'val-sin-pi3', prompt: r`\sin\tfrac{\pi}{3}`, answer: r`\tfrac{\sqrt{3}}{2}` },
      { id: 'val-sin-pi2', prompt: r`\sin\tfrac{\pi}{2}`, answer: r`1` },
      { id: 'val-cos-0', prompt: r`\cos 0`, answer: r`1` },
      { id: 'val-cos-pi6', prompt: r`\cos\tfrac{\pi}{6}`, answer: r`\tfrac{\sqrt{3}}{2}` },
      { id: 'val-cos-pi4', prompt: r`\cos\tfrac{\pi}{4}`, answer: r`\tfrac{\sqrt{2}}{2}` },
      { id: 'val-cos-pi3', prompt: r`\cos\tfrac{\pi}{3}`, answer: r`\tfrac{1}{2}` },
      { id: 'val-cos-pi2', prompt: r`\cos\tfrac{\pi}{2}`, answer: r`0` },
      { id: 'val-tan-0', prompt: r`\tan 0`, answer: r`0` },
      {
        id: 'val-tan-pi6',
        prompt: r`\tan\tfrac{\pi}{6}`,
        answer: r`\tfrac{\sqrt{3}}{3}`,
        note: 'Equivalently 1/√3.',
      },
      { id: 'val-tan-pi4', prompt: r`\tan\tfrac{\pi}{4}`, answer: r`1` },
      { id: 'val-tan-pi3', prompt: r`\tan\tfrac{\pi}{3}`, answer: r`\sqrt{3}` },
    ],
  },

  // ---------------------------------------------------------- Angle algebra
  {
    id: 'sum-diff',
    name: 'Sum & difference',
    group: 'Angle algebra',
    blurb:
      'The parent identities of this whole group — double angle, product-to-sum, and the amplitude form are all corollaries. Sine mixes the functions with a matching sign; cosine keeps them separated with a flipped sign.',
    identities: [
      {
        id: 'sd-sin-plus',
        prompt: r`\sin(a + b)`,
        answer: r`\sin a\cos b + \cos a\sin b`,
        traps: [r`\sin a\cos b - \cos a\sin b`, r`\cos a\cos b - \sin a\sin b`],
      },
      {
        id: 'sd-sin-minus',
        prompt: r`\sin(a - b)`,
        answer: r`\sin a\cos b - \cos a\sin b`,
        traps: [r`\sin a\cos b + \cos a\sin b`, r`\cos a\cos b + \sin a\sin b`],
      },
      {
        id: 'sd-cos-plus',
        prompt: r`\cos(a + b)`,
        answer: r`\cos a\cos b - \sin a\sin b`,
        note: 'The sign flips for cosine: plus on the left, minus on the right.',
        traps: [r`\cos a\cos b + \sin a\sin b`, r`\sin a\cos b + \cos a\sin b`],
      },
      {
        id: 'sd-cos-minus',
        prompt: r`\cos(a - b)`,
        answer: r`\cos a\cos b + \sin a\sin b`,
        traps: [r`\cos a\cos b - \sin a\sin b`, r`\sin a\cos b - \cos a\sin b`],
      },
      {
        id: 'sd-tan-plus',
        prompt: r`\tan(a + b)`,
        answer: r`\frac{\tan a + \tan b}{1 - \tan a\tan b}`,
        traps: [r`\frac{\tan a + \tan b}{1 + \tan a\tan b}`, r`\frac{\tan a - \tan b}{1 + \tan a\tan b}`],
      },
      {
        id: 'sd-tan-minus',
        prompt: r`\tan(a - b)`,
        answer: r`\frac{\tan a - \tan b}{1 + \tan a\tan b}`,
        traps: [r`\frac{\tan a - \tan b}{1 - \tan a\tan b}`, r`\frac{\tan a + \tan b}{1 - \tan a\tan b}`],
      },
    ],
  },
  {
    id: 'double',
    name: 'Double angle',
    group: 'Angle algebra',
    blurb:
      'Sum identities with a = b. The three faces of cos 2x are the workhorses: pick the form whose “wrong” term cancels against the rest of your expression. Read backwards, sin 2x = 2 sin x cos x rescues integrands like sin x cos x.',
    identities: [
      {
        id: 'dbl-sin',
        prompt: r`\sin 2x`,
        answer: r`2\sin x\cos x`,
        traps: [r`\sin x\cos x`, r`2\sin x`],
      },
      {
        id: 'dbl-cos',
        prompt: r`\cos 2x`,
        answer: r`\cos^2 x - \sin^2 x`,
        traps: [r`\sin^2 x - \cos^2 x`, r`\cos^2 x + \sin^2 x`],
      },
      {
        id: 'dbl-cos-cos',
        prompt: r`\cos 2x`,
        answer: r`2\cos^2 x - 1`,
        note: 'The all-cosine form — substitute sin² = 1 − cos².',
        traps: [r`1 - 2\cos^2 x`, r`2\cos^2 x + 1`],
      },
      {
        id: 'dbl-cos-sin',
        prompt: r`\cos 2x`,
        answer: r`1 - 2\sin^2 x`,
        note: 'The all-sine form. Solved for sin², this is exactly power reduction.',
        traps: [r`2\sin^2 x - 1`, r`1 + 2\sin^2 x`],
      },
      {
        id: 'dbl-tan',
        prompt: r`\tan 2x`,
        answer: r`\frac{2\tan x}{1 - \tan^2 x}`,
        traps: [r`\frac{2\tan x}{1 + \tan^2 x}`, r`\frac{\tan x}{1 - \tan^2 x}`],
      },
    ],
  },
  {
    id: 'triple',
    name: 'Triple angle',
    group: 'Angle algebra',
    blurb:
      'One more turn of the sum identities. Read right-to-left they de-power cubes: sin³ and cos³ become linear combinations you can integrate term by term.',
    identities: [
      {
        id: 'tri-sin',
        prompt: r`\sin 3x`,
        answer: r`3\sin x - 4\sin^3 x`,
        traps: [r`4\sin^3 x - 3\sin x`, r`3\cos x - 4\cos^3 x`],
      },
      {
        id: 'tri-cos',
        prompt: r`\cos 3x`,
        answer: r`4\cos^3 x - 3\cos x`,
        traps: [r`3\cos x - 4\cos^3 x`, r`4\sin^3 x - 3\sin x`],
      },
    ],
  },
  {
    id: 'half',
    name: 'Half angle',
    group: 'Angle algebra',
    blurb:
      'Double angle run in reverse: express functions of x/2 through cos x. The tan(x/2) forms need no ± sign and are the gateway to the Weierstrass substitution.',
    identities: [
      {
        id: 'half-sin',
        prompt: r`\sin\frac{x}{2}`,
        answer: r`\pm\sqrt{\frac{1 - \cos x}{2}}`,
        note: 'Sign chosen by the quadrant of x/2.',
        traps: [r`\pm\sqrt{\frac{1 + \cos x}{2}}`, r`\frac{1 - \cos x}{2}`],
      },
      {
        id: 'half-cos',
        prompt: r`\cos\frac{x}{2}`,
        answer: r`\pm\sqrt{\frac{1 + \cos x}{2}}`,
        traps: [r`\pm\sqrt{\frac{1 - \cos x}{2}}`, r`\frac{1 + \cos x}{2}`],
      },
      {
        id: 'half-tan-a',
        prompt: r`\tan\frac{x}{2}`,
        answer: r`\frac{1 - \cos x}{\sin x}`,
        note: 'No ± needed — the sign takes care of itself.',
        traps: [r`\frac{1 + \cos x}{\sin x}`, r`\frac{\sin x}{1 - \cos x}`],
      },
      {
        id: 'half-tan-b',
        prompt: r`\tan\frac{x}{2}`,
        answer: r`\frac{\sin x}{1 + \cos x}`,
        traps: [r`\frac{\sin x}{1 - \cos x}`, r`\frac{1 + \cos x}{\sin x}`],
      },
    ],
  },
  {
    id: 'power',
    name: 'Power reduction',
    group: 'Angle algebra',
    blurb:
      'The single most-used family in integral calculus: even powers of sin and cos cannot be integrated directly, but these rewrite them as first powers of multiple angles, which can. Also the standard trick for Fourier coefficients.',
    identities: [
      {
        id: 'pow-sin2',
        prompt: r`\sin^2 x`,
        answer: r`\frac{1 - \cos 2x}{2}`,
        traps: [r`\frac{1 + \cos 2x}{2}`, r`\frac{1 - \cos 2x}{4}`],
      },
      {
        id: 'pow-cos2',
        prompt: r`\cos^2 x`,
        answer: r`\frac{1 + \cos 2x}{2}`,
        traps: [r`\frac{1 - \cos 2x}{2}`, r`\frac{1 + \cos 2x}{4}`],
      },
      {
        id: 'pow-sincos',
        prompt: r`\sin x\cos x`,
        answer: r`\frac{\sin 2x}{2}`,
        traps: [r`\sin 2x`, r`\frac{\cos 2x}{2}`],
      },
      {
        id: 'pow-sin2cos2',
        prompt: r`\sin^2 x\cos^2 x`,
        answer: r`\frac{1 - \cos 4x}{8}`,
        note: 'Square sin x cos x = ½ sin 2x, then power-reduce again.',
        traps: [r`\frac{1 - \cos 4x}{4}`, r`\frac{1 + \cos 4x}{8}`],
      },
      {
        id: 'pow-sin3',
        prompt: r`\sin^3 x`,
        answer: r`\frac{3\sin x - \sin 3x}{4}`,
        traps: [r`\frac{3\sin x + \sin 3x}{4}`, r`\frac{3\cos x + \cos 3x}{4}`],
      },
      {
        id: 'pow-cos3',
        prompt: r`\cos^3 x`,
        answer: r`\frac{3\cos x + \cos 3x}{4}`,
        traps: [r`\frac{3\cos x - \cos 3x}{4}`, r`\frac{3\sin x - \sin 3x}{4}`],
      },
    ],
  },
  {
    id: 'prod-sum',
    name: 'Product to sum',
    group: 'Angle algebra',
    blurb:
      'Add or subtract two sum/difference identities and products fall out as sums. Essential for ∫ sin(mx) cos(nx) dx and the orthogonality relations underlying Fourier series.',
    identities: [
      {
        id: 'ps-sincos',
        prompt: r`\sin a\cos b`,
        answer: r`\tfrac{1}{2}\left[\sin(a+b) + \sin(a-b)\right]`,
        traps: [r`\tfrac{1}{2}\left[\sin(a+b) - \sin(a-b)\right]`, r`\tfrac{1}{2}\left[\cos(a+b) + \cos(a-b)\right]`],
      },
      {
        id: 'ps-cossin',
        prompt: r`\cos a\sin b`,
        answer: r`\tfrac{1}{2}\left[\sin(a+b) - \sin(a-b)\right]`,
        traps: [r`\tfrac{1}{2}\left[\sin(a+b) + \sin(a-b)\right]`, r`\tfrac{1}{2}\left[\cos(a-b) - \cos(a+b)\right]`],
      },
      {
        id: 'ps-coscos',
        prompt: r`\cos a\cos b`,
        answer: r`\tfrac{1}{2}\left[\cos(a+b) + \cos(a-b)\right]`,
        traps: [r`\tfrac{1}{2}\left[\cos(a+b) - \cos(a-b)\right]`, r`\tfrac{1}{2}\left[\sin(a+b) + \sin(a-b)\right]`],
      },
      {
        id: 'ps-sinsin',
        prompt: r`\sin a\sin b`,
        answer: r`\tfrac{1}{2}\left[\cos(a-b) - \cos(a+b)\right]`,
        note: 'Note the order: the difference angle comes first, or the sign is wrong.',
        traps: [r`\tfrac{1}{2}\left[\cos(a+b) - \cos(a-b)\right]`, r`\tfrac{1}{2}\left[\cos(a+b) + \cos(a-b)\right]`],
      },
    ],
  },
  {
    id: 'sum-prod',
    name: 'Sum to product',
    group: 'Angle algebra',
    blurb:
      'The reverse direction: sums become products, which factor. This is how you solve sin A + sin B = 0 exactly, and where beat frequencies in physics come from.',
    identities: [
      {
        id: 'sp-sin-plus',
        prompt: r`\sin a + \sin b`,
        answer: r`2\sin\tfrac{a+b}{2}\cos\tfrac{a-b}{2}`,
        traps: [r`2\cos\tfrac{a+b}{2}\sin\tfrac{a-b}{2}`, r`2\sin\tfrac{a+b}{2}\sin\tfrac{a-b}{2}`],
      },
      {
        id: 'sp-sin-minus',
        prompt: r`\sin a - \sin b`,
        answer: r`2\cos\tfrac{a+b}{2}\sin\tfrac{a-b}{2}`,
        traps: [r`2\sin\tfrac{a+b}{2}\cos\tfrac{a-b}{2}`, r`-2\sin\tfrac{a+b}{2}\sin\tfrac{a-b}{2}`],
      },
      {
        id: 'sp-cos-plus',
        prompt: r`\cos a + \cos b`,
        answer: r`2\cos\tfrac{a+b}{2}\cos\tfrac{a-b}{2}`,
        traps: [r`-2\sin\tfrac{a+b}{2}\sin\tfrac{a-b}{2}`, r`2\sin\tfrac{a+b}{2}\cos\tfrac{a-b}{2}`],
      },
      {
        id: 'sp-cos-minus',
        prompt: r`\cos a - \cos b`,
        answer: r`-2\sin\tfrac{a+b}{2}\sin\tfrac{a-b}{2}`,
        note: 'The only one with a leading minus — the classic exam slip.',
        traps: [r`2\sin\tfrac{a+b}{2}\sin\tfrac{a-b}{2}`, r`2\cos\tfrac{a+b}{2}\cos\tfrac{a-b}{2}`],
      },
    ],
  },
  {
    id: 'linear',
    name: 'Amplitude form',
    group: 'Angle algebra',
    blurb:
      'Any a·sin + b·cos of the same angle is a single sinusoid. This is how you read amplitude and phase off the steady-state solution of a driven oscillator, and how mx″ + kx solutions get their R and φ.',
    identities: [
      {
        id: 'lin-sin',
        prompt: r`a\sin x + b\cos x`,
        answer: r`\sqrt{a^2 + b^2}\,\sin(x + \varphi),\quad \tan\varphi = \tfrac{b}{a}`,
        traps: [
          r`\sqrt{a^2 + b^2}\,\sin(x + \varphi),\quad \tan\varphi = \tfrac{a}{b}`,
          r`(a + b)\sin(x + \varphi),\quad \tan\varphi = \tfrac{b}{a}`,
        ],
      },
      {
        id: 'lin-cos',
        prompt: r`a\sin x + b\cos x`,
        answer: r`\sqrt{a^2 + b^2}\,\cos(x - \psi),\quad \tan\psi = \tfrac{a}{b}`,
        note: 'Same amplitude, cosine phase form — the convention most ODE texts use.',
        traps: [r`\sqrt{a^2 + b^2}\,\cos(x - \psi),\quad \tan\psi = \tfrac{b}{a}`],
      },
    ],
  },

  // -------------------------------------------------------------- Calculus
  {
    id: 'deriv',
    name: 'Derivatives',
    group: 'Calculus',
    blurb:
      'All six, from the two you know: sin′ = cos, cos′ = −sin, and the quotient rule does the rest. Pattern worth internalizing — every co-function derivative carries a minus sign.',
    identities: [
      {
        id: 'd-sin',
        prompt: r`\frac{d}{dx}\,\sin x`,
        answer: r`\cos x`,
        traps: [r`-\cos x`, r`-\sin x`],
      },
      {
        id: 'd-cos',
        prompt: r`\frac{d}{dx}\,\cos x`,
        answer: r`-\sin x`,
        traps: [r`\sin x`, r`-\cos x`],
      },
      {
        id: 'd-tan',
        prompt: r`\frac{d}{dx}\,\tan x`,
        answer: r`\sec^2 x`,
        traps: [r`\csc^2 x`, r`\sec x\tan x`],
      },
      {
        id: 'd-sec',
        prompt: r`\frac{d}{dx}\,\sec x`,
        answer: r`\sec x\tan x`,
        traps: [r`\sec^2 x`, r`-\csc x\cot x`],
      },
      {
        id: 'd-csc',
        prompt: r`\frac{d}{dx}\,\csc x`,
        answer: r`-\csc x\cot x`,
        traps: [r`\csc x\cot x`, r`-\csc^2 x`],
      },
      {
        id: 'd-cot',
        prompt: r`\frac{d}{dx}\,\cot x`,
        answer: r`-\csc^2 x`,
        traps: [r`\csc^2 x`, r`-\sec^2 x`],
      },
    ],
  },
  {
    id: 'inv-deriv',
    name: 'Inverse trig derivatives',
    group: 'Calculus',
    blurb:
      'Where the algebraic integrands 1/√(1−x²) and 1/(1+x²) come from. Each co-inverse is just the negative of its partner (arccos′ = −arcsin′), so there are really only three to learn.',
    identities: [
      {
        id: 'id-arcsin',
        prompt: r`\frac{d}{dx}\,\arcsin x`,
        answer: r`\frac{1}{\sqrt{1 - x^2}}`,
        traps: [r`-\frac{1}{\sqrt{1 - x^2}}`, r`\frac{1}{1 + x^2}`],
      },
      {
        id: 'id-arccos',
        prompt: r`\frac{d}{dx}\,\arccos x`,
        answer: r`-\frac{1}{\sqrt{1 - x^2}}`,
        traps: [r`\frac{1}{\sqrt{1 - x^2}}`, r`-\frac{1}{1 + x^2}`],
      },
      {
        id: 'id-arctan',
        prompt: r`\frac{d}{dx}\,\arctan x`,
        answer: r`\frac{1}{1 + x^2}`,
        traps: [r`\frac{1}{1 - x^2}`, r`\frac{1}{\sqrt{1 + x^2}}`],
      },
      {
        id: 'id-arccot',
        prompt: r`\frac{d}{dx}\,\operatorname{arccot} x`,
        answer: r`-\frac{1}{1 + x^2}`,
        traps: [r`\frac{1}{1 + x^2}`, r`-\frac{1}{1 - x^2}`],
      },
      {
        id: 'id-arcsec',
        prompt: r`\frac{d}{dx}\,\operatorname{arcsec} x`,
        answer: r`\frac{1}{|x|\sqrt{x^2 - 1}}`,
        traps: [r`-\frac{1}{|x|\sqrt{x^2 - 1}}`, r`\frac{1}{x\sqrt{1 - x^2}}`],
      },
      {
        id: 'id-arccsc',
        prompt: r`\frac{d}{dx}\,\operatorname{arccsc} x`,
        answer: r`-\frac{1}{|x|\sqrt{x^2 - 1}}`,
        traps: [r`\frac{1}{|x|\sqrt{x^2 - 1}}`, r`-\frac{1}{x\sqrt{1 - x^2}}`],
      },
    ],
  },
  {
    id: 'integ',
    name: 'Integrals',
    group: 'Calculus',
    blurb:
      'The six derivative facts read backwards, plus the four log-form antiderivatives that require a trick (∫ sec is the famous one), and ∫ sec³ — the boss fight that trig substitution keeps sending you back to.',
    identities: [
      {
        id: 'i-sin',
        prompt: r`\int \sin x\,dx`,
        answer: r`-\cos x + C`,
        traps: [r`\cos x + C`, r`-\sin x + C`],
      },
      {
        id: 'i-cos',
        prompt: r`\int \cos x\,dx`,
        answer: r`\sin x + C`,
        traps: [r`-\sin x + C`, r`\cos x + C`],
      },
      {
        id: 'i-sec2',
        prompt: r`\int \sec^2 x\,dx`,
        answer: r`\tan x + C`,
        traps: [r`\sec x\tan x + C`, r`-\cot x + C`],
      },
      {
        id: 'i-csc2',
        prompt: r`\int \csc^2 x\,dx`,
        answer: r`-\cot x + C`,
        traps: [r`\cot x + C`, r`\tan x + C`],
      },
      {
        id: 'i-sectan',
        prompt: r`\int \sec x\tan x\,dx`,
        answer: r`\sec x + C`,
        traps: [r`\tan x + C`, r`-\sec x + C`],
      },
      {
        id: 'i-csccot',
        prompt: r`\int \csc x\cot x\,dx`,
        answer: r`-\csc x + C`,
        traps: [r`\csc x + C`, r`-\cot x + C`],
      },
      {
        id: 'i-tan',
        prompt: r`\int \tan x\,dx`,
        answer: r`\ln|\sec x| + C`,
        note: 'Equivalently −ln|cos x| + C, via u = cos x.',
        traps: [r`\sec^2 x + C`, r`\ln|\cos x| + C`],
      },
      {
        id: 'i-cot',
        prompt: r`\int \cot x\,dx`,
        answer: r`\ln|\sin x| + C`,
        traps: [r`-\ln|\sin x| + C`, r`\ln|\cos x| + C`],
      },
      {
        id: 'i-sec',
        prompt: r`\int \sec x\,dx`,
        answer: r`\ln\left|\sec x + \tan x\right| + C`,
        note: 'Multiply by (sec x + tan x)/(sec x + tan x) — the numerator becomes the derivative of the denominator.',
        traps: [r`\ln\left|\sec x - \tan x\right| + C`, r`\sec x\tan x + C`],
      },
      {
        id: 'i-csc',
        prompt: r`\int \csc x\,dx`,
        answer: r`-\ln\left|\csc x + \cot x\right| + C`,
        note: 'Equivalently ln|csc x − cot x| + C.',
        traps: [r`\ln\left|\csc x + \cot x\right| + C`, r`-\csc x\cot x + C`],
      },
      {
        id: 'i-sec3',
        prompt: r`\int \sec^3 x\,dx`,
        answer: r`\tfrac{1}{2}\left(\sec x\tan x + \ln|\sec x + \tan x|\right) + C`,
        note: 'Integration by parts plus a self-referential rearrangement. Appears in every arc length of a parabola.',
        traps: [r`\tfrac{1}{3}\sec^3 x\tan x + C`, r`\sec x\tan x + \ln|\sec x + \tan x| + C`],
      },
    ],
  },
  {
    id: 'inv-integ',
    name: 'Inverse-trig integral forms',
    group: 'Calculus',
    blurb:
      'The pattern-matching table: when a denominator has a² ± x² or x² − a², one of these applies directly — no substitution needed if you recognize the shape. The two log forms are what trig substitution produces for the remaining radicals.',
    identities: [
      {
        id: 'ii-arcsin',
        prompt: r`\int \frac{dx}{\sqrt{a^2 - x^2}}`,
        answer: r`\arcsin\frac{x}{a} + C`,
        traps: [r`\frac{1}{a}\arcsin\frac{x}{a} + C`, r`\arctan\frac{x}{a} + C`],
      },
      {
        id: 'ii-arctan',
        prompt: r`\int \frac{dx}{a^2 + x^2}`,
        answer: r`\frac{1}{a}\arctan\frac{x}{a} + C`,
        note: 'The 1/a factor is the classic omission — dimensional analysis catches it.',
        traps: [r`\arctan\frac{x}{a} + C`, r`\frac{1}{a}\arcsin\frac{x}{a} + C`],
      },
      {
        id: 'ii-arcsec',
        prompt: r`\int \frac{dx}{x\sqrt{x^2 - a^2}}`,
        answer: r`\frac{1}{a}\operatorname{arcsec}\frac{|x|}{a} + C`,
        traps: [r`\operatorname{arcsec}\frac{|x|}{a} + C`, r`\frac{1}{a}\arctan\frac{x}{a} + C`],
      },
      {
        id: 'ii-asinh',
        prompt: r`\int \frac{dx}{\sqrt{x^2 + a^2}}`,
        answer: r`\ln\left|x + \sqrt{x^2 + a^2}\right| + C`,
        note: 'Also written arcsinh(x/a) + C — same function, different clothes.',
        traps: [r`\arctan\frac{x}{a} + C`, r`\frac{1}{a}\ln\left|x + \sqrt{x^2 + a^2}\right| + C`],
      },
      {
        id: 'ii-acosh',
        prompt: r`\int \frac{dx}{\sqrt{x^2 - a^2}}`,
        answer: r`\ln\left|x + \sqrt{x^2 - a^2}\right| + C`,
        traps: [r`\operatorname{arcsec}\frac{|x|}{a} + C`, r`\arcsin\frac{x}{a} + C`],
      },
    ],
  },
  {
    id: 'trigsub',
    name: 'Trig substitution',
    group: 'Calculus',
    blurb:
      'Match the radical to the Pythagorean identity that collapses it. The mnemonic is the identity itself: a² − x² wants 1 − sin² = cos²; a² + x² wants 1 + tan² = sec²; x² − a² wants sec² − 1 = tan².',
    identities: [
      {
        id: 'ts-sin',
        prompt: r`\text{For } \sqrt{a^2 - x^2}:\quad x`,
        answer: r`a\sin\theta,\quad dx = a\cos\theta\,d\theta,\quad \sqrt{a^2 - x^2} = a\cos\theta`,
        traps: [
          r`a\tan\theta,\quad dx = a\sec^2\theta\,d\theta,\quad \sqrt{a^2 - x^2} = a\sec\theta`,
          r`a\sec\theta,\quad dx = a\sec\theta\tan\theta\,d\theta,\quad \sqrt{a^2 - x^2} = a\tan\theta`,
        ],
      },
      {
        id: 'ts-tan',
        prompt: r`\text{For } \sqrt{a^2 + x^2}:\quad x`,
        answer: r`a\tan\theta,\quad dx = a\sec^2\theta\,d\theta,\quad \sqrt{a^2 + x^2} = a\sec\theta`,
        traps: [
          r`a\sin\theta,\quad dx = a\cos\theta\,d\theta,\quad \sqrt{a^2 + x^2} = a\cos\theta`,
          r`a\sec\theta,\quad dx = a\sec\theta\tan\theta\,d\theta,\quad \sqrt{a^2 + x^2} = a\tan\theta`,
        ],
      },
      {
        id: 'ts-sec',
        prompt: r`\text{For } \sqrt{x^2 - a^2}:\quad x`,
        answer: r`a\sec\theta,\quad dx = a\sec\theta\tan\theta\,d\theta,\quad \sqrt{x^2 - a^2} = a\tan\theta`,
        traps: [
          r`a\tan\theta,\quad dx = a\sec^2\theta\,d\theta,\quad \sqrt{x^2 - a^2} = a\sec\theta`,
          r`a\sin\theta,\quad dx = a\cos\theta\,d\theta,\quad \sqrt{x^2 - a^2} = a\cos\theta`,
        ],
      },
    ],
  },
  {
    id: 'weier',
    name: 'Weierstrass substitution',
    group: 'Calculus',
    blurb:
      'The universal substitution t = tan(x/2) turns any rational function of sin x and cos x into an ordinary rational function of t — then partial fractions finishes the job. Last resort, but it always works.',
    identities: [
      {
        id: 'w-sin',
        prompt: r`\text{With } t = \tan\tfrac{x}{2}:\quad \sin x`,
        answer: r`\frac{2t}{1 + t^2}`,
        traps: [r`\frac{1 - t^2}{1 + t^2}`, r`\frac{2t}{1 - t^2}`],
      },
      {
        id: 'w-cos',
        prompt: r`\text{With } t = \tan\tfrac{x}{2}:\quad \cos x`,
        answer: r`\frac{1 - t^2}{1 + t^2}`,
        traps: [r`\frac{2t}{1 + t^2}`, r`\frac{1 + t^2}{1 - t^2}`],
      },
      {
        id: 'w-tan',
        prompt: r`\text{With } t = \tan\tfrac{x}{2}:\quad \tan x`,
        answer: r`\frac{2t}{1 - t^2}`,
        note: 'Consistent with tan 2θ at θ = x/2.',
        traps: [r`\frac{2t}{1 + t^2}`, r`\frac{1 - t^2}{2t}`],
      },
      {
        id: 'w-dx',
        prompt: r`\text{With } t = \tan\tfrac{x}{2}:\quad dx`,
        answer: r`\frac{2\,dt}{1 + t^2}`,
        traps: [r`\frac{dt}{1 + t^2}`, r`\frac{2\,dt}{1 - t^2}`],
      },
    ],
  },

  // ---------------------------------------------------------------- Beyond
  {
    id: 'euler',
    name: 'Complex exponentials',
    group: 'Beyond',
    blurb:
      'Euler’s formula makes every identity in this app a one-line consequence of exponent rules. In differential equations it is the bridge between e^{λt} solutions and oscillations; in Fourier analysis it is the whole alphabet.',
    identities: [
      {
        id: 'eu-euler',
        prompt: r`e^{ix}`,
        answer: r`\cos x + i\sin x`,
        traps: [r`\cos x - i\sin x`, r`\sin x + i\cos x`],
      },
      {
        id: 'eu-cos',
        prompt: r`\cos x`,
        answer: r`\frac{e^{ix} + e^{-ix}}{2}`,
        traps: [r`\frac{e^{ix} - e^{-ix}}{2}`, r`\frac{e^{ix} + e^{-ix}}{2i}`],
      },
      {
        id: 'eu-sin',
        prompt: r`\sin x`,
        answer: r`\frac{e^{ix} - e^{-ix}}{2i}`,
        note: 'The i in the denominator is the standard slip — check with x → small x.',
        traps: [r`\frac{e^{ix} - e^{-ix}}{2}`, r`\frac{e^{ix} + e^{-ix}}{2i}`],
      },
      {
        id: 'eu-demoivre',
        prompt: r`(\cos x + i\sin x)^n`,
        answer: r`\cos nx + i\sin nx`,
        note: 'De Moivre — expand the left side binomially and multiple-angle formulas fall out.',
        traps: [r`\cos^n x + i\sin^n x`, r`n(\cos x + i\sin x)`],
      },
    ],
  },
  {
    id: 'hyper',
    name: 'Hyperbolic',
    group: 'Beyond',
    blurb:
      'The trig functions of e^x. Same identities with sign twists (Osborn’s rule: flip the sign on any product of two sinh’s), and the derivatives lose their minus signs entirely. They parametrize x² − y² = 1 the way sin/cos parametrize the circle.',
    identities: [
      {
        id: 'h-pyth',
        prompt: r`\cosh^2 x - \sinh^2 x`,
        answer: r`1`,
        note: 'Minus where the circle has plus — this is the hyperbola.',
        traps: [r`-1`, r`\cosh 2x`],
      },
      {
        id: 'h-sinh',
        prompt: r`\sinh x`,
        answer: r`\frac{e^x - e^{-x}}{2}`,
        traps: [r`\frac{e^x + e^{-x}}{2}`, r`\frac{e^x - e^{-x}}{2i}`],
      },
      {
        id: 'h-cosh',
        prompt: r`\cosh x`,
        answer: r`\frac{e^x + e^{-x}}{2}`,
        traps: [r`\frac{e^x - e^{-x}}{2}`, r`\frac{e^x + e^{-x}}{2i}`],
      },
      {
        id: 'h-tanh',
        prompt: r`1 - \tanh^2 x`,
        answer: r`\operatorname{sech}^2 x`,
        traps: [r`\operatorname{csch}^2 x`, r`\coth^2 x`],
      },
      {
        id: 'h-sinh2x',
        prompt: r`\sinh 2x`,
        answer: r`2\sinh x\cosh x`,
        traps: [r`\sinh x\cosh x`, r`\cosh^2 x + \sinh^2 x`],
      },
      {
        id: 'h-cosh2x',
        prompt: r`\cosh 2x`,
        answer: r`\cosh^2 x + \sinh^2 x`,
        note: 'Plus, not minus — Osborn’s rule at work on the sinh² term.',
        traps: [r`\cosh^2 x - \sinh^2 x`, r`2\cosh^2 x + 1`],
      },
      {
        id: 'h-dsinh',
        prompt: r`\frac{d}{dx}\,\sinh x`,
        answer: r`\cosh x`,
        traps: [r`-\cosh x`, r`\operatorname{sech}^2 x`],
      },
      {
        id: 'h-dcosh',
        prompt: r`\frac{d}{dx}\,\cosh x`,
        answer: r`\sinh x`,
        note: 'No minus sign, unlike cos — the pair just swaps forever.',
        traps: [r`-\sinh x`, r`\cosh x`],
      },
      {
        id: 'h-dtanh',
        prompt: r`\frac{d}{dx}\,\tanh x`,
        answer: r`\operatorname{sech}^2 x`,
        traps: [r`-\operatorname{sech}^2 x`, r`\operatorname{csch}^2 x`],
      },
    ],
  },
]

export const GROUPS: GroupName[] = ['Foundations', 'Angle algebra', 'Calculus', 'Beyond']

export interface FlatIdentity extends Identity {
  familyId: string
  familyName: string
}

export const ALL_IDENTITIES: FlatIdentity[] = FAMILIES.flatMap((f) =>
  f.identities.map((i) => ({ ...i, familyId: f.id, familyName: f.name })),
)

export const IDENTITY_BY_ID: Map<string, FlatIdentity> = new Map(
  ALL_IDENTITIES.map((i) => [i.id, i]),
)

export const FAMILY_BY_ID: Map<string, Family> = new Map(FAMILIES.map((f) => [f.id, f]))
