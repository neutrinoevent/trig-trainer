// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import App from '../App'

;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

// Node's experimental localStorage global is non-functional under vitest; use an in-memory stand-in
const store = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  },
  writable: true,
  configurable: true,
})

function clickButton(label: string) {
  const btn = [...document.querySelectorAll('button')].find((b) =>
    b.textContent?.trim().startsWith(label),
  )
  expect(btn, `button "${label}"`).toBeTruthy()
  act(() => btn!.click())
}

describe('app shell', () => {
  it('shows the tour on first use, then drills through every tab', () => {
    localStorage.clear()
    const div = document.createElement('div')
    document.body.appendChild(div)
    act(() => createRoot(div).render(<App />))

    // first use: the guided tour is up
    expect(document.querySelector('.tour-root')).toBeTruthy()
    clickButton('Skip')
    expect(document.querySelector('.tour-root')).toBeNull()
    expect(localStorage.getItem('trig-trainer-tour-done')).toBe('1')

    // placement follows the tour; picking a level closes it and stores settings
    expect(document.querySelector('.placement-root')).toBeTruthy()
    clickButton('Taking calculus')
    expect(document.querySelector('.placement-root')).toBeNull()
    expect(JSON.parse(localStorage.getItem('trig-trainer-settings-v1')!).level).toBe('intermediate')

    // Learn: family library renders KaTeX with mastery tier dots
    expect(document.querySelector('.learn-nav')).toBeTruthy()
    expect(document.querySelectorAll('.identity-row').length).toBeGreaterThan(2)
    expect(document.querySelector('.katex')).toBeTruthy()
    expect(document.querySelector('.tier-dot')).toBeTruthy()

    // Drill: a brand-new identity gets the scaffolded 2-choice question
    clickButton('Drill')
    expect(document.querySelector('.scope-picker')).toBeTruthy()
    const options = [...document.querySelectorAll<HTMLButtonElement>('.option')]
    expect(options.length).toBe(2)
    act(() => options[0].click())
    expect(document.querySelector('.feedback')).toBeTruthy()
    expect(JSON.parse(localStorage.getItem('trig-trainer-progress-v1')!).totalAttempts).toBe(1)
    clickButton('Next')
    expect(document.querySelector('.feedback')).toBeNull()

    // Cards: reveal and grade a card
    clickButton('Cards')
    clickButton('Show answer')
    expect(document.querySelector('.card-answer')).toBeTruthy()
    clickButton('Good')
    expect(document.querySelector('.card-answer')).toBeNull()

    // Challenge: rearranged forms answer and record against the base identity
    clickButton('Challenge')
    const attemptsBefore = JSON.parse(
      localStorage.getItem('trig-trainer-progress-v1')!,
    ).totalAttempts
    const rearranged = [...document.querySelectorAll<HTMLButtonElement>('.option')]
    expect(rearranged.length).toBeGreaterThanOrEqual(2)
    act(() => rearranged[0].click())
    expect(
      JSON.parse(localStorage.getItem('trig-trainer-progress-v1')!).totalAttempts,
    ).toBe(attemptsBefore + 1)

    // Graphs and Unit circle render their figures; Match lays out 12 tiles
    clickButton('Graphs')
    expect(document.querySelector('.curve-plot')).toBeTruthy()
    clickButton('Unit circle')
    expect(document.querySelector('.circle-figure')).toBeTruthy()
    clickButton('Match')
    expect(document.querySelectorAll('.match-tile').length).toBe(8) // 4-pair default at this level

    // Settings: level tiles and per-setting chips render
    clickButton('⚙')
    expect(document.querySelectorAll('.level-tile').length).toBe(3)
    expect(document.body.textContent).toContain('New cards per day')

    // About: attribution present
    clickButton('About')
    expect(document.body.textContent).toContain('Alexander Nichols')
    expect(document.body.textContent).toContain('Old Dominion University')

    // Progress: stats reflect the answers above
    clickButton('Progress')
    expect(document.querySelectorAll('.stat-tile').length).toBe(6)
    expect(document.querySelector('.technique-table')).toBeTruthy()
  })
})
