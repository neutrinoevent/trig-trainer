import { useEffect, useState } from 'react'
import { About } from './components/About'
import { Cards } from './components/Cards'
import { Challenge } from './components/Challenge'
import { Drill } from './components/Drill'
import { Learn } from './components/Learn'
import { ProgressView } from './components/ProgressView'
import { Tour, TOUR_KEY } from './components/Tour'
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

type View = 'learn' | 'drill' | 'challenge' | 'cards' | 'progress' | 'about'
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
  const [theme, setTheme] = useState<Theme>(() => initTheme())
  const [scope, setScope] = useState<string | null>(null)
  const [showTour, setShowTour] = useState<boolean>(() => tourPending())

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

  const onAnswer = (id: string, correct: boolean) =>
    setProgress((p) => recordDrill(p, id, correct))
  const onGrade = (id: string, grade: Grade) => setProgress((p) => recordGrade(p, id, grade))
  const onImport = (json: string): boolean => {
    const next = importProgress(json)
    if (next) setProgress(next)
    return next !== null
  }

  const due = dueCount(progress)

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

      <main className="main">
        {view === 'learn' ? (
          <Learn
            progress={progress}
            onDrillFamily={(id) => {
              setScope(id)
              setView('drill')
            }}
          />
        ) : null}
        {view === 'drill' ? (
          <Drill progress={progress} scope={scope} onScope={setScope} onAnswer={onAnswer} />
        ) : null}
        {view === 'challenge' ? <Challenge progress={progress} onAnswer={onAnswer} /> : null}
        {view === 'cards' ? <Cards progress={progress} scope={scope} onGrade={onGrade} /> : null}
        {view === 'about' ? <About /> : null}
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
    </div>
  )
}
