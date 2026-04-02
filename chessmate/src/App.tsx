// App.tsx — Componenta principală cu navigare între Joacă și Puzzle-uri

import { useState } from 'react'
import Board from './components/Board'
import PuzzleView from './components/PuzzleView'
import './App.css'

type View = 'play' | 'puzzles'

function App() {
  const [view, setView] = useState<View>('play')

  return (
    <div className="app">
      {view === 'play' ? <Board /> : <PuzzleView />}

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
      </nav>
    </div>
  )
}

export default App
