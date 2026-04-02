// PuzzleBoard.tsx — Tabla de puzzle: jucătorul face mutarea corectă
// Logica: jucătorul face mutările impare din soluție (index 0, 2, 4...)
// După fiecare mutare corectă, adversarul răspunde automat (index 1, 3, 5...)

import { useState, useCallback, useEffect, useRef } from 'react'
import { Chess, type Square as Sq } from 'chess.js'
import type { Puzzle } from '../puzzles/puzzleData'
import { tacticTypes, difficultyLabels } from '../puzzles/puzzleData'
import Square from './Square'
import './PuzzleBoard.css'

type Props = {
  puzzle: Puzzle
  isSolved: boolean
  onSolved: () => void
  onBack: () => void
  onNext: () => void
  hasNext: boolean
}

// Determinăm cine e la mutare din FEN (al cărui jucător e puzzle-ul)
function playerColor(fen: string): 'w' | 'b' {
  return fen.split(' ')[1] as 'w' | 'b'
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS_WHITE = [8, 7, 6, 5, 4, 3, 2, 1]
const RANKS_BLACK = [1, 2, 3, 4, 5, 6, 7, 8]

function toPieceCode(piece: { color: string; type: string }): string {
  return piece.color + piece.type.toUpperCase()
}

type FeedbackState = 'none' | 'correct' | 'wrong' | 'completed'

function PuzzleBoard({ puzzle, isSolved, onSolved, onBack, onNext, hasNext }: Props) {
  const [game, setGame] = useState(() => new Chess(puzzle.fen))
  const [moveIndex, setMoveIndex] = useState(0)  // Indexul curent în soluție
  const [selected, setSelected] = useState<string | null>(null)
  const [legalMoves, setLegalMoves] = useState<string[]>([])
  const [feedback, setFeedback] = useState<FeedbackState>(isSolved ? 'completed' : 'none')
  const [hintLevel, setHintLevel] = useState(0)   // 0=fără, 1=piesa, 2=pătratul
  const [wrongSquare, setWrongSquare] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const color = playerColor(puzzle.fen)
  // Orientarea tablei: dacă jucătorul e negru, inversăm
  const ranks = color === 'w' ? RANKS_WHITE : RANKS_BLACK
  const files = color === 'w' ? FILES : [...FILES].reverse()

  // Reset la schimbarea puzzle-ului
  useEffect(() => {
    setGame(new Chess(puzzle.fen))
    setMoveIndex(0)
    setSelected(null)
    setLegalMoves([])
    setFeedback(isSolved ? 'completed' : 'none')
    setHintLevel(0)
    setWrongSquare(null)
  }, [puzzle.id, isSolved])

  // Cleanup timer
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  // Hint: care piesă trebuie mutată (from) și unde (to)
  const currentSolutionMove = puzzle.solution[moveIndex]
  const hintFrom = hintLevel >= 1 && currentSolutionMove ? currentSolutionMove.slice(0, 2) : null
  const hintTo = hintLevel >= 2 && currentSolutionMove ? currentSolutionMove.slice(2, 4) : null

  // Răspunsul adversarului (mutarea automată după mutarea corectă a jucătorului)
  const playOpponentMove = useCallback((g: Chess, nextIndex: number) => {
    const opponentUci = puzzle.solution[nextIndex]
    if (!opponentUci) return // Nu mai sunt mutări de adversar

    timerRef.current = setTimeout(() => {
      const from = opponentUci.slice(0, 2)
      const to = opponentUci.slice(2, 4)
      const promotion = opponentUci.length > 4 ? opponentUci[4] : undefined
      g.move({ from, to, promotion })
      setGame(new Chess(g.fen()))
      setMoveIndex(nextIndex + 1)
    }, 400) // Mică pauză ca să vezi mutarea ta înainte de răspuns
  }, [puzzle.solution])

  const handleSquareClick = useCallback((position: string) => {
    if (feedback === 'completed' || feedback === 'wrong') return

    const expectedUci = puzzle.solution[moveIndex]
    if (!expectedUci) return

    const expectedFrom = expectedUci.slice(0, 2)
    const expectedTo = expectedUci.slice(2, 4)
    const expectedPromo = expectedUci.length > 4 ? expectedUci[4] : undefined

    // Dacă avem piesă selectată și click-ul e pe o mutare legală
    if (selected && legalMoves.includes(position)) {
      const from = selected
      const to = position

      // Verificăm dacă mutarea e corectă
      if (from === expectedFrom && to === expectedTo) {
        // Mutare corectă!
        game.move({ from, to, promotion: expectedPromo || 'q' })
        setGame(new Chess(game.fen()))
        setSelected(null)
        setLegalMoves([])
        setHintLevel(0)
        setWrongSquare(null)

        const nextIndex = moveIndex + 1

        // Verificăm dacă puzzle-ul e complet
        if (nextIndex >= puzzle.solution.length) {
          setFeedback('completed')
          setMoveIndex(nextIndex)
          onSolved()
        } else {
          // Flash verde scurt
          setFeedback('correct')
          timerRef.current = setTimeout(() => setFeedback('none'), 600)
          // Adversarul răspunde
          playOpponentMove(game, nextIndex)
        }
      } else {
        // Mutare greșită — flash roșu
        setWrongSquare(to)
        setFeedback('wrong')
        timerRef.current = setTimeout(() => {
          setFeedback('none')
          setWrongSquare(null)
        }, 800)
        setSelected(null)
        setLegalMoves([])
      }
      return
    }

    // Selectare piesă — doar piesele culorii jucătorului
    const piece = game.get(position as Sq)
    if (piece && piece.color === color) {
      const moves = game.moves({ square: position as Sq, verbose: true })
      if (moves.length > 0) {
        setSelected(position)
        setLegalMoves(moves.map(m => m.to))
      } else {
        setSelected(null)
        setLegalMoves([])
      }
    } else {
      setSelected(null)
      setLegalMoves([])
    }
  }, [game, selected, legalMoves, moveIndex, puzzle.solution, color, feedback, playOpponentMove, onSolved])

  const handleHint = () => {
    if (hintLevel < 2) setHintLevel(prev => prev + 1)
  }

  const handleRetry = () => {
    setGame(new Chess(puzzle.fen))
    setMoveIndex(0)
    setSelected(null)
    setLegalMoves([])
    setFeedback('none')
    setHintLevel(0)
    setWrongSquare(null)
  }

  // Status text
  let statusText = ''
  if (feedback === 'completed') statusText = 'rezolvat!'
  else if (feedback === 'correct') statusText = 'corect — continuă...'
  else if (feedback === 'wrong') statusText = 'greșit — încearcă altă mutare'
  else statusText = color === 'w' ? 'albul la mutare' : 'negrul la mutare'

  const tacticLabel = tacticTypes.find(t => t.value === puzzle.type)?.label || ''

  return (
    <div className="puzzle-board-wrapper">
      <div className="puzzle-header">
        <button className="puzzle-back" onClick={onBack}>← înapoi</button>
        <span className="puzzle-info">
          #{puzzle.id} · {tacticLabel} · {difficultyLabels[puzzle.difficulty]}
        </span>
      </div>

      <div className="puzzle-title-bar">{puzzle.title}</div>

      <div className={`board puzzle-feedback-${feedback}`}>
        {ranks.map((rank) =>
          files.map((file) => {
            const position = `${file}${rank}`
            const fileIndex = FILES.indexOf(file)
            const rankIndex = RANKS_WHITE.indexOf(rank)
            const isLight = (fileIndex + rankIndex) % 2 === 0
            const chessPiece = game.get(position as Sq)
            const pieceCode = chessPiece ? toPieceCode(chessPiece) : undefined

            const isHintFrom = position === hintFrom
            const isHintTo = position === hintTo
            const isWrong = position === wrongSquare

            let extraClass = ''
            if (isHintFrom) extraClass += ' hint-from'
            if (isHintTo) extraClass += ' hint-to'
            if (isWrong) extraClass += ' wrong-move'

            return (
              <div key={position} className={extraClass}>
                <Square
                  isLight={isLight}
                  position={position}
                  piece={pieceCode}
                  isSelected={position === selected}
                  isLegalMove={legalMoves.includes(position)}
                  onClick={() => handleSquareClick(position)}
                />
              </div>
            )
          })
        )}
      </div>

      <div className={`puzzle-status ${feedback}`}>{statusText}</div>

      <div className="puzzle-controls">
        {feedback !== 'completed' && (
          <>
            <button onClick={handleHint} disabled={hintLevel >= 2}>
              {hintLevel === 0 ? 'Hint' : hintLevel === 1 ? 'Hint +' : 'Max hint'}
            </button>
            <button onClick={handleRetry}>Retry</button>
          </>
        )}
        {feedback === 'completed' && hasNext && (
          <button onClick={onNext}>Următorul →</button>
        )}
        {feedback === 'completed' && !hasNext && (
          <button onClick={onBack}>← la listă</button>
        )}
      </div>
    </div>
  )
}

export default PuzzleBoard
