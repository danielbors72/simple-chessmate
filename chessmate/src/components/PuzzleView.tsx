// PuzzleView.tsx — Ecranul de puzzle-uri: listă + rezolvare
// Când nu e selectat niciun puzzle → afișează lista cu filtre
// Când e selectat → afișează PuzzleBoard

import { useState, useMemo } from 'react'
import { puzzles, tacticTypes, difficultyLabels } from '../puzzles/puzzleData'
import type { Puzzle, TacticType, Difficulty } from '../puzzles/puzzleData'
import PuzzleBoard from './PuzzleBoard'
import './PuzzleView.css'

// Progresul se salvează în localStorage
function getSolved(): Set<number> {
  try {
    const raw = localStorage.getItem('chessmate_solved')
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch { return new Set() }
}

function saveSolved(ids: Set<number>) {
  localStorage.setItem('chessmate_solved', JSON.stringify([...ids]))
}

function PuzzleView() {
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null)
  const [filterType, setFilterType] = useState<TacticType | 'all'>('all')
  const [filterDiff, setFilterDiff] = useState<Difficulty | 0>(0) // 0 = toate
  const [solved, setSolved] = useState<Set<number>>(getSolved)

  // Filtrare puzzle-uri
  const filtered = useMemo(() => {
    return puzzles.filter(p => {
      if (filterType !== 'all' && p.type !== filterType) return false
      if (filterDiff !== 0 && p.difficulty !== filterDiff) return false
      return true
    })
  }, [filterType, filterDiff])

  // Statistici
  const totalSolved = solved.size
  const totalPuzzles = puzzles.length

  // Când jucătorul rezolvă un puzzle
  const handleSolved = (id: number) => {
    setSolved(prev => {
      const next = new Set(prev)
      next.add(id)
      saveSolved(next)
      return next
    })
  }

  // Navigare la următorul puzzle din lista filtrată
  const handleNext = () => {
    if (!activePuzzle) return
    const idx = filtered.findIndex(p => p.id === activePuzzle.id)
    const next = filtered[idx + 1]
    if (next) setActivePuzzle(next)
    else setActivePuzzle(null) // înapoi la listă dacă nu mai sunt
  }

  // Dacă e un puzzle activ, afișăm PuzzleBoard
  if (activePuzzle) {
    return (
      <PuzzleBoard
        puzzle={activePuzzle}
        isSolved={solved.has(activePuzzle.id)}
        onSolved={() => handleSolved(activePuzzle.id)}
        onBack={() => setActivePuzzle(null)}
        onNext={handleNext}
        hasNext={filtered.findIndex(p => p.id === activePuzzle.id) < filtered.length - 1}
      />
    )
  }

  // Lista de puzzle-uri cu filtre
  return (
    <div className="puzzle-view">
      <div className="puzzle-stats">
        {totalSolved}/{totalPuzzles} rezolvate
      </div>

      <div className="puzzle-filters">
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as TacticType | 'all')}
        >
          <option value="all">Toate tipurile</option>
          {tacticTypes.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <select
          value={filterDiff}
          onChange={e => setFilterDiff(Number(e.target.value) as Difficulty | 0)}
        >
          <option value={0}>Toate nivelurile</option>
          <option value={1}>★ Ușor</option>
          <option value={2}>★★ Mediu</option>
          <option value={3}>★★★ Greu</option>
        </select>
      </div>

      <div className="puzzle-list">
        {filtered.map(puzzle => (
          <button
            key={puzzle.id}
            className={`puzzle-card ${solved.has(puzzle.id) ? 'solved' : ''}`}
            onClick={() => setActivePuzzle(puzzle)}
          >
            <span className="puzzle-id">#{puzzle.id}</span>
            <span className="puzzle-title">{puzzle.title}</span>
            <span className="puzzle-meta">
              {difficultyLabels[puzzle.difficulty]}
              {' '}
              {tacticTypes.find(t => t.value === puzzle.type)?.label}
            </span>
            {solved.has(puzzle.id) && <span className="puzzle-check">✓</span>}
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="puzzle-empty">Niciun puzzle cu aceste filtre</div>
        )}
      </div>
    </div>
  )
}

export default PuzzleView
