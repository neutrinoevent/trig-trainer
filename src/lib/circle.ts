import { shuffle } from './pick'

/**
 * Unit-circle quiz: an angle drawn on the circle, evaluate sin/cos/tan of it.
 * Extends the Special values family into all four quadrants — reference angle
 * plus sign is exactly the spatial reasoning the circle trains.
 */
export interface CircleEntry {
  key: string
  theta: number
  angleTex: string
  fn: 'sin' | 'cos' | 'tan'
  valueTex: string
  baseId: string
}

export interface CircleQuestion extends CircleEntry {
  options: string[]
  correctIndex: number
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))

function angleTex(num: number, den: number): string {
  if (num === 0) return '0'
  const g = gcd(num, den)
  const n = num / g
  const d = den / g
  if (d === 1) return n === 1 ? '\\pi' : `${n}\\pi`
  return `\\tfrac{${n === 1 ? '' : n}\\pi}{${d}}`
}

// Reference-angle magnitudes, indexed in π/6 units (0, π/6, π/3, π/2)
const SIN_MAG = ['0', '\\tfrac{1}{2}', '\\tfrac{\\sqrt{3}}{2}', '1']
const COS_MAG = ['1', '\\tfrac{\\sqrt{3}}{2}', '\\tfrac{1}{2}', '0']
const TAN_MAG = ['0', '\\tfrac{\\sqrt{3}}{3}', '\\sqrt{3}', null]
const SIN_BASE = ['val-sin-0', 'val-sin-pi6', 'val-sin-pi3', 'val-sin-pi2']
const COS_BASE = ['val-cos-0', 'val-cos-pi6', 'val-cos-pi3', 'val-cos-pi2']
const TAN_BASE = ['val-tan-0', 'val-tan-pi6', 'val-tan-pi3', null]

function signed(mag: string, value: number): string {
  if (mag === '0' || Math.abs(value) < 1e-9) return '0'
  return value < 0 ? `-${mag}` : mag
}

function buildBank(): CircleEntry[] {
  const bank: CircleEntry[] = []

  // Multiples of π/6 around the full circle
  for (let i = 0; i < 12; i++) {
    const theta = (i * Math.PI) / 6
    const tex = angleTex(i, 6)
    const ref = Math.min(i, Math.abs(i - 6), 12 - i) // distance to the x-axis, in π/6 units
    const sin = Math.sin(theta)
    const cos = Math.cos(theta)
    bank.push({
      key: `${i}pi6-sin`, theta, angleTex: tex, fn: 'sin',
      valueTex: signed(SIN_MAG[ref], sin), baseId: SIN_BASE[ref],
    })
    bank.push({
      key: `${i}pi6-cos`, theta, angleTex: tex, fn: 'cos',
      valueTex: signed(COS_MAG[ref], cos), baseId: COS_BASE[ref],
    })
    if (TAN_MAG[ref] !== null) {
      bank.push({
        key: `${i}pi6-tan`, theta, angleTex: tex, fn: 'tan',
        valueTex: signed(TAN_MAG[ref]!, Math.tan(theta)), baseId: TAN_BASE[ref]!,
      })
    }
  }

  // Odd multiples of π/4 (the diagonals)
  for (const i of [1, 3, 5, 7]) {
    const theta = (i * Math.PI) / 4
    const tex = angleTex(i, 4)
    const sin = Math.sin(theta)
    const cos = Math.cos(theta)
    bank.push({
      key: `${i}pi4-sin`, theta, angleTex: tex, fn: 'sin',
      valueTex: signed('\\tfrac{\\sqrt{2}}{2}', sin), baseId: 'val-sin-pi4',
    })
    bank.push({
      key: `${i}pi4-cos`, theta, angleTex: tex, fn: 'cos',
      valueTex: signed('\\tfrac{\\sqrt{2}}{2}', cos), baseId: 'val-cos-pi4',
    })
    bank.push({
      key: `${i}pi4-tan`, theta, angleTex: tex, fn: 'tan',
      valueTex: signed('1', Math.tan(theta)), baseId: 'val-tan-pi4',
    })
  }

  return bank
}

export const CIRCLE_BANK: CircleEntry[] = buildBank()

const SIN_COS_POOL = [
  '0', '\\tfrac{1}{2}', '-\\tfrac{1}{2}', '\\tfrac{\\sqrt{2}}{2}', '-\\tfrac{\\sqrt{2}}{2}',
  '\\tfrac{\\sqrt{3}}{2}', '-\\tfrac{\\sqrt{3}}{2}', '1', '-1',
]
const TAN_POOL = ['0', '\\tfrac{\\sqrt{3}}{3}', '-\\tfrac{\\sqrt{3}}{3}', '1', '-1', '\\sqrt{3}', '-\\sqrt{3}']

export function makeCircleQuestion(excludeKey: string | null, optionCount = 4): CircleQuestion {
  let pool = CIRCLE_BANK
  if (excludeKey) pool = pool.filter((e) => e.key !== excludeKey)
  const entry = pool[Math.floor(Math.random() * pool.length)]

  const wanted = Math.max(1, optionCount - 1)
  const valuePool = entry.fn === 'tan' ? TAN_POOL : SIN_COS_POOL
  const distractors: string[] = []
  const flipped = entry.valueTex.startsWith('-') ? entry.valueTex.slice(1) : `-${entry.valueTex}`
  if (entry.valueTex !== '0' && valuePool.includes(flipped)) distractors.push(flipped)
  for (const v of shuffle(valuePool)) {
    if (distractors.length >= wanted) break
    if (v !== entry.valueTex && !distractors.includes(v)) distractors.push(v)
  }

  const options = shuffle([entry.valueTex, ...distractors])
  return { ...entry, options, correctIndex: options.indexOf(entry.valueTex) }
}
