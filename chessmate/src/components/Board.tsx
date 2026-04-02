// Board.tsx — Tabla de șah interactivă cu AI
// Albul = jucătorul, Negrul = Stockfish

import { useState, useCallback, useEffect } from 'react'
import { Chess, type Square as Sq } from 'chess.js'
import engine from '../engine/stockfish'
import Square from './Square'
import GameInfo from './GameInfo'
import './Board.css'

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1]

// Nivelele de dificultate — depth = cât de adânc gândește Stockfish
const DIFFICULTY: Record<string, number> = {
  easy: 3,      // ~800 ELO — face greșeli evidente
  medium: 8,    // ~1400 ELO — joc decent
  hard: 15,     // ~2000+ ELO — foarte puternic
}

function toPieceCode(piece: { color: string; type: string }): string {
  return piece.color + piece.type.toUpperCase()
}

function findKingSquare(game: Chess): string | null {
  const turn = game.turn()
  for (const rank of RANKS) {
    for (const file of FILES) {
      const pos = `${file}${rank}`
      const piece = game.get(pos as Sq)
      if (piece && piece.type === 'k' && piece.color === turn) return pos
    }
  }
  return null
}

function Board() {
  const [game, setGame] = useState(new Chess())
  const [selected, setSelected] = useState<string | null>(null)
  const [legalMoves, setLegalMoves] = useState<string[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState<string>('medium')
  const [thinking, setThinking] = useState(false)

  const gameOver = game.isGameOver()
  const inCheck = game.inCheck()
  const kingSquare = inCheck ? findKingSquare(game) : null
  const isPlayerTurn = game.turn() === 'w'

  // Pornește motorul la prima încărcare
  useEffect(() => {
    engine.init()
    return () => engine.destroy()
  }, [])

  // Când e rândul negrului (AI), cere mutare de la Stockfish
  useEffect(() => {
    if (!isPlayerTurn && !gameOver) {
      setThinking(true)
      const depth = DIFFICULTY[difficulty]
      engine.findBestMove(game.fen(), depth, (bestMove) => {
        // bestMove vine ca "e7e5" — trebuie split în from/to
        const from = bestMove.slice(0, 2)
        const to = bestMove.slice(2, 4)
        const promotion = bestMove.length > 4 ? bestMove[4] : undefined

        const fenBefore = game.fen()
        const move = game.move({ from, to, promotion })
        if (move) {
          setHistory(prev => [...prev, fenBefore])
          setGame(new Chess(game.fen()))
        }
        setThinking(false)
      })
    }
  }, [game, isPlayerTurn, gameOver, difficulty])

  const handleSquareClick = useCallback((position: string) => {
    // Nu acceptăm click-uri când e rândul AI-ului sau jocul s-a terminat
    if (gameOver || !isPlayerTurn || thinking) return

    if (selected && legalMoves.includes(position)) {
      const fenBefore = game.fen()
      const move = game.move({ from: selected, to: position, promotion: 'q' })
      if (move) {
        setHistory(prev => [...prev, fenBefore])
        setGame(new Chess(game.fen()))
      }
      setSelected(null)
      setLegalMoves([])
      return
    }

    const piece = game.get(position as Sq)
    if (piece && piece.color === 'w') {
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
  }, [game, selected, legalMoves, gameOver, isPlayerTurn, thinking])

  const handleNewGame = useCallback(() => {
    setGame(new Chess())
    setSelected(null)
    setLegalMoves([])
    setHistory([])
    setThinking(false)
  }, [])

  const handleUndo = useCallback(() => {
    // La Undo, dăm înapoi 2 mutări (mutarea AI + mutarea jucătorului)
    if (history.length < 2) return
    const prevFen = history[history.length - 2]
    setGame(new Chess(prevFen))
    setHistory(prev => prev.slice(0, -2))
    setSelected(null)
    setLegalMoves([])
  }, [history])

  return (
    <div className="board-wrapper">
      <div className="board">
        {RANKS.map((rank) =>
          FILES.map((file) => {
            const position = `${file}${rank}`
            const fileIndex = FILES.indexOf(file)
            const rankIndex = RANKS.indexOf(rank)
            const isLight = (fileIndex + rankIndex) % 2 === 0
            const chessPiece = game.get(position as Sq)
            const pieceCode = chessPiece ? toPieceCode(chessPiece) : undefined

            return (
              <Square
                key={position}
                isLight={isLight}
                position={position}
                piece={pieceCode}
                isSelected={position === selected}
                isLegalMove={legalMoves.includes(position)}
                isInCheck={position === kingSquare}
                onClick={() => handleSquareClick(position)}
              />
            )
          })
        )}
      </div>
      <GameInfo
        game={game}
        canUndo={history.length >= 2 && isPlayerTurn}
        onNewGame={handleNewGame}
        onUndo={handleUndo}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        thinking={thinking}
      />
    </div>
  )
}

export default Board
