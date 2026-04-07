// App.tsx — Componenta principală cu navigare între Joacă și Puzzle-uri

import { useState } from 'react'
import Board from './components/Board'
import PuzzleView from './components/PuzzleView'
import EngineGallery from './components/EngineGallery'
import './App.css'

type View = 'play' | 'puzzles' | 'engines'

function App() {
  const [view, setView] = useState<View>('play')

  return (
    <div className="app">
      {view === 'play' && <Board />}
      {view === 'puzzles' && <PuzzleView />}
      {view === 'engines' && <EngineGallery />}

      <nav className="nav-tabs">
        <button
          className={`nav-tab ${view === 'play' ? 'active' : ''}`}
          onClick={() => setView('play')}
        >
          Joacă
        </button>
        <button
          className={`nav-tab ${view === 'puzzles' ? 'active' : ''}`}
          onClick={() => setView('puzzles')}
        >
          Puzzle-uri
        </button>
        <button
          className={`nav-tab ${view === 'engines' ? 'active' : ''}`}
          onClick={() => setView('engines')}
        >
          Motoare
        </button>
      </nav>

      <footer className="app-footer">
        <a href="https://darbun.pro" target="_blank" rel="noopener noreferrer">
          darbun.pro
        </a>
      </footer>
    </div>
  )
}

export default App
