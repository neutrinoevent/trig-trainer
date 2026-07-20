import { describe, expect, it } from 'vitest'
import katex from 'katex'
import { ALL_IDENTITIES, FAMILIES } from './identities'
import { buildQuestion } from '../lib/pick'

const render = (tex: string) => katex.renderToString(tex, { throwOnError: true, strict: false })
const norm = (tex: string) => tex.replace(/\s|\\,|\\;|\\!/g, '')

describe('identity corpus', () => {
  it('has unique ids', () => {
    const ids = ALL_IDENTITIES.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('renders every prompt, answer, and trap without KaTeX errors', () => {
    for (const ident of ALL_IDENTITIES) {
      expect(() => render(ident.prompt), ident.id).not.toThrow()
      expect(() => render(ident.answer), ident.id).not.toThrow()
      for (const trap of ident.traps ?? []) {
        expect(() => render(trap), `${ident.id} trap`).not.toThrow()
      }
    }
  })

  it('never uses a correct answer as a trap for the same prompt', () => {
    const answersByPrompt = new Map<string, Set<string>>()
    for (const ident of ALL_IDENTITIES) {
      const set = answersByPrompt.get(norm(ident.prompt)) ?? new Set()
      set.add(norm(ident.answer))
      answersByPrompt.set(norm(ident.prompt), set)
    }
    for (const ident of ALL_IDENTITIES) {
      const equivalents = answersByPrompt.get(norm(ident.prompt))!
      for (const trap of ident.traps ?? []) {
        expect(equivalents.has(norm(trap)), `${ident.id}: trap is a correct form`).toBe(false)
      }
    }
  })

  it('builds 4 distinct options with exactly one correct', () => {
    for (const ident of ALL_IDENTITIES) {
      for (let round = 0; round < 5; round++) {
        const q = buildQuestion(ident)
        expect(q.options.length, ident.id).toBe(4)
        expect(new Set(q.options.map(norm)).size, ident.id).toBe(4)
        expect(q.options[q.correctIndex], ident.id).toBe(ident.answer)
      }
    }
  })

  it('every family has a blurb and at least two identities', () => {
    for (const fam of FAMILIES) {
      expect(fam.blurb.length, fam.id).toBeGreaterThan(40)
      expect(fam.identities.length, fam.id).toBeGreaterThanOrEqual(2)
    }
  })
})
