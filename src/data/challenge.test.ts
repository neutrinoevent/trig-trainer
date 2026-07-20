import { describe, expect, it } from 'vitest'
import katex from 'katex'
import { VARIANTS, variantOptions } from './variants'
import { CURVES } from './curves'
import { CIRCLE_BANK, makeCircleQuestion } from '../lib/circle'
import { IDENTITY_BY_ID } from './identities'
import { norm } from '../lib/pick'

const render = (tex: string) => katex.renderToString(tex, { throwOnError: true, strict: false })

describe('rearranged variants', () => {
  it('has unique ids and valid base identities', () => {
    const ids = VARIANTS.map((v) => v.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const v of VARIANTS) {
      expect(IDENTITY_BY_ID.has(v.baseId), `${v.id} baseId ${v.baseId}`).toBe(true)
    }
  })

  it('renders every prompt, answer, and trap without KaTeX errors', () => {
    for (const v of VARIANTS) {
      expect(() => render(v.prompt), v.id).not.toThrow()
      expect(() => render(v.answer), v.id).not.toThrow()
      for (const trap of v.traps) expect(() => render(trap), `${v.id} trap`).not.toThrow()
    }
  })

  it('carries exactly 3 authored traps, all distinct from the answer', () => {
    for (const v of VARIANTS) {
      expect(v.traps.length, v.id).toBe(3)
      const texts = new Set([norm(v.answer), ...v.traps.map(norm)])
      expect(texts.size, `${v.id}: duplicate option text`).toBe(4)
    }
  })

  it('variants sharing a prompt never use each other’s answers as traps', () => {
    const answersByPrompt = new Map<string, Set<string>>()
    for (const v of VARIANTS) {
      const set = answersByPrompt.get(norm(v.prompt)) ?? new Set()
      set.add(norm(v.answer))
      answersByPrompt.set(norm(v.prompt), set)
    }
    for (const v of VARIANTS) {
      const equivalents = answersByPrompt.get(norm(v.prompt))!
      for (const trap of v.traps) {
        expect(equivalents.has(norm(trap)), `${v.id}: trap is a correct form`).toBe(false)
      }
    }
  })

  it('builds shuffled options containing the answer exactly once', () => {
    for (const v of VARIANTS) {
      const { options, correctIndex } = variantOptions(v)
      expect(options.length).toBe(4)
      expect(options[correctIndex]).toBe(v.answer)
    }
  })
})

describe('graph curves', () => {
  it('renders all option tex and points to real base identities', () => {
    const ids = CURVES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const c of CURVES) {
      expect(() => render(c.answer), c.id).not.toThrow()
      expect(c.traps.length, c.id).toBe(3)
      for (const trap of c.traps) expect(() => render(trap), `${c.id} trap`).not.toThrow()
      const texts = new Set([norm(c.answer), ...c.traps.map(norm)])
      expect(texts.size, `${c.id}: duplicate option`).toBe(4)
      if (c.baseId) expect(IDENTITY_BY_ID.has(c.baseId), `${c.id} baseId`).toBe(true)
    }
  })

  it('every curve is finite somewhere in the plotted window', () => {
    for (const c of CURVES) {
      let finite = 0
      for (let x = -2 * Math.PI; x <= 2 * Math.PI; x += 0.1) {
        if (Number.isFinite(c.fn(x))) finite++
      }
      expect(finite, c.id).toBeGreaterThan(50)
    }
  })
})

describe('unit circle bank', () => {
  it('agrees numerically with its own tex values', () => {
    const texValue = (tex: string): number => {
      const neg = tex.startsWith('-') ? -1 : 1
      const mag = tex.replace('-', '')
      const table: Record<string, number> = {
        '0': 0,
        '1': 1,
        '\\tfrac{1}{2}': 1 / 2,
        '\\tfrac{\\sqrt{2}}{2}': Math.SQRT2 / 2,
        '\\tfrac{\\sqrt{3}}{2}': Math.sqrt(3) / 2,
        '\\tfrac{\\sqrt{3}}{3}': Math.sqrt(3) / 3,
        '\\sqrt{3}': Math.sqrt(3),
      }
      expect(table, `unknown value tex ${tex}`).toHaveProperty([mag])
      return neg * table[mag]
    }
    for (const e of CIRCLE_BANK) {
      const actual = Math[e.fn](e.theta)
      expect(texValue(e.valueTex), `${e.key}`).toBeCloseTo(actual, 9)
      expect(IDENTITY_BY_ID.has(e.baseId), `${e.key} baseId`).toBe(true)
      expect(() => render(e.angleTex), e.key).not.toThrow()
    }
  })

  it('never asks tan at poles and covers all four quadrants', () => {
    expect(CIRCLE_BANK.some((e) => e.fn === 'tan' && Math.abs(Math.cos(e.theta)) < 1e-9)).toBe(false)
    const quadrants = new Set(CIRCLE_BANK.map((e) => Math.floor(e.theta / (Math.PI / 2)) % 4))
    expect(quadrants.size).toBe(4)
  })

  it('serves 4 unique options with the correct answer present', () => {
    for (let i = 0; i < 50; i++) {
      const q = makeCircleQuestion(null)
      expect(q.options.length).toBe(4)
      expect(new Set(q.options).size).toBe(4)
      expect(q.options[q.correctIndex]).toBe(q.valueTex)
    }
  })
})
