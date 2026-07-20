import { useEffect, useState } from 'react'
import { About } from './components/About'
import { Cards } from './components/Cards'
import { Challenge } from './components/Challenge'
import { Drill } from './components/Drill'
import { Learn } from './components/Learn'
import { Placement } from './components/Placement'
import { ProgressView } from './components/ProgressView'
import { SettingsView } from './components/SettingsView'
import { Tour, TOUR_KEY } from './components/Tour'
import { suggest } from './lib/coach'
import {
  dueCount,
  importProgress,
  loadProgress,
  recordDrill,
  recordGrade,
  resetProgress,
  type Grade,
  type ProgressState,
} from './store/progress'
import { loadSettings, saveSettings, type Settings } from './store/settings'

type View = 'learn' | 'drill' | 'challenge' | 'cards' | 'progress' | 'about' | 'settings'
type Theme = 'light' | 'dark' | null

const THEME_KEY = 'trig-trainer-theme'

function initTheme(): Theme {
  try {
    const t = localStorage.getItem(THEME_KEY)
    return t === 'light' || t === 'dark' ? t : null
  } catch {
    return null
  }
}

function tourPending(): boolean {
  try {
    return localStorage.getItem(TOUR_KEY) !== '1'
  } catch {
    return false
  }
}

const VIEWS: { id: View; label: string }[] = [
  { id: 'learn', label: 'Learn' },
  { id: 'drill', label: 'Drill' },
  { id: 'challenge', label: 'Challenge' },
  { id: 'cards', label: 'Cards' },
  { id: 'progress', label: 'Progress' },
  { id: 'about', label: 'About' },
]

export default function App() {
  const [view, setView] = useState<View>('learn')
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress())
  const [settings, setSettings] = useState<Settings>(() => loadSettings())
  const [theme, setTheme] = useState<Theme>(() => initTheme())
  const [scope, setScope] = useState<string[] | null>(() => loadSettings().scope)
  const [showTour, setShowTour] = useState<boolean>(() => tourPending())
  const [coachDismissed, setCoachDismissed] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    if (theme) {
      root.setAttribute('data-theme', theme)
      try {
        localStorage.setItem(THEME_KEY, theme)
      } catch {
        // storage unavailable — theme just won't persist
      }
    } else {
      root.removeAttribute('data-theme')
    }
  }, [theme])

  const toggleTheme = () => {
    const dark =
      theme === 'dark' ||
      (theme === null && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setTheme(dark ? 'light' : 'dark')
  }

  const updateSettings = (next: Settings) => {
    setSettings(next)
    saveSettings(next)
    if (next.scope !== settings.scope) setScope(next.scope)
  }

  const updateScope = (next: string[] | null) => {
    setScope(next)
    const merged = { ...settings, scope: next }
    setSettings(merged)
    saveSettings(merged)
  }

  const onAnswer = (id: string, correct: boolean) =>
    setProgress((p) => recordDrill(p, id, correct))
  const onGrade = (id: string, grade: Grade) => setProgress((p) => recordGrade(p, id, grade))
  const onImport = (json: string): boolean => {
    const next = importProgress(json)
    if (next) setProgress(next)
    return next !== null
  }

  const due = dueCount(progress)
  const coach = suggest(progress)
  const showCoach =
    !coachDismissed && !showTour && settings.placementDone && view !== coach.go && view !== 'settings' && view !== 'about'

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            θ
          </span>
          <span className="brand-name">Trig Trainer</span>
        </div>
        <nav className="tabs" aria-label="Main">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              data-tour={v.id}
              className={view === v.id ? 'tab tab-active' : 'tab'}
              onClick={() => setView(v.id)}
            >
              {v.label}
              {v.id === 'cards' && due > 0 ? <span className="due-dot">{due}</span> : null}
            </button>
          ))}
        </nav>
        <button
          className={view === 'settings' ? 'btn theme-toggle btn-primary' : 'btn theme-toggle'}
          data-tour="settings"
          onClick={() => setView('settings')}
          aria-label="Settings"
          title="Settings"
        >
          ⚙
        </button>
        <button
          className="btn theme-toggle"
          onClick={() => setShowTour(true)}
          aria-label="Replay interface tour"
          title="Replay tour"
        >
          ?
        </button>
        <button className="btn theme-toggle" onClick={toggleTheme} aria-label="Toggle color theme">
          ◐
        </button>
      </header>

      {showCoach ? (
        <div className="coach-bar">
          <span className="coach-text">{coach.text}</span>
          <button
            className="btn coach-go"
            onClick={() => {
              if (coach.scope !== undefined) updateScope(coach.scope)
              setView(coach.go)
            }}
          >
            {coach.goLabel}
          </button>
          <button
            className="btn coach-dismiss"
            onClick={() => setCoachDismissed(true)}
            aria-label="Dismiss suggestion"
          >
            ×
          </button>
        </div>
      ) : null}

      <main className="main">
        {view === 'learn' ? (
          <Learn
            progress={progress}
            onDrillFamily={(id) => {
              updateScope([id])
              setView('drill')
            }}
          />
        ) : null}
        {view === 'drill' ? (
          <Drill
            progress={progress}
            settings={settings}
            scope={scope}
            onScope={updateScope}
            onAnswer={onAnswer}
          />
        ) : null}
        {view === 'challenge' ? (
          <Challenge
            progress={progress}
            settings={settings}
            scope={scope}
            onScope={updateScope}
            onAnswer={onAnswer}
          />
        ) : null}
        {view === 'cards' ? (
          <Cards
            progress={progress}
            settings={settings}
            scope={scope}
            onScope={updateScope}
            onGrade={onGrade}
          />
        ) : null}
        {view === 'about' ? <About /> : null}
        {view === 'settings' ? <SettingsView settings={settings} onChange={updateSettings} /> : null}
        {view === 'progress' ? (
          <ProgressView
            progress={progress}
            onReset={() => setProgress(resetProgress())}
            onImport={onImport}
          />
        ) : null}
      </main>

      <footer className="footer muted">
        Local-first — no server, no accounts. Progress lives in this browser; back it up under
        Progress.
      </footer>

      {showTour ? (
        <Tour
          onDone={(goLearn) => {
            setShowTour(false)
            if (goLearn) setView('learn')
          }}
        />
      ) : null}
      {!showTour && !settings.placementDone ? (
        <Placement settings={settings} onDone={updateSettings} />
      ) : null}
    </div>
  )
}
