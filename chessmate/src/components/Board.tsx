// Board.tsx — Tabla de șah interactivă cu motoare selectabile
// Albul = jucătorul, Negrul = motorul ales

import { useState, useCallback, useEffect, useRef } from 'react'
import { Chess, type Square as Sq } from 'chess.js'
import { ENGINES, DEFAULT_ENGINE, type ChessEngine } from '../engine/engines'
import Square from './Square'
import GameInfo from './GameInfo'
import './Board.css'

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1]

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
  const [thinking, setThinking] = useState(false)

  // Motor curent + nivel de dificultate
  const [engine, setEngine] = useState<ChessEngine>(DEFAULT_ENGINE)
  const [difficultyIndex, setDifficultyIndex] = useState(1) // index în engine.difficulty[]
  const engineRef = useRef(engine)

  const gameOver = game.isGameOver()
  const inCheck = game.inCheck()
  const kingSquare = inCheck ? findKingSquare(game) : null
  const isPlayerTurn = game.turn() === 'w'

  // Pornește motorul la prima încărcare + la schimbare motor
  useEffect(() => {
    engineRef.current = engine
    engine.init()
    return () => engine.destroy()
  }, [engine])

  // Când e rândul negrului (AI), cere mutare de la motor
  useEffect(() => {
    if (!isPlayerTurn && !gameOver) {
      setThinking(true)
      const currentEngine = engineRef.current
      const level = currentEngine.difficulty[difficultyIndex]?.value ?? currentEngine.difficulty[0].value

      currentEngine.findBestMove(game.fen(), level).then((bestMove) => {
        // Verificăm că nu s-a schimbat motorul între timp
        if (engineRef.current !== currentEngine) return

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
  }, [game, isPlayerTurn, gameOver, difficultyIndex])

  // Schimbă motorul — resetează jocul pentru consistență
  const handleEngineChange = useCallback((engineName: string) => {
    const newEngine = ENGINES.find(e => e.name === engineName)
    if (!newEngine || newEngine === engine) return

    // Oprim motorul vechi
    engine.destroy()

    setEngine(newEngine)
    setDifficultyIndex(0)
    setGame(new Chess())
    setSelected(null)
    setLegalMoves([])
    setHistory([])
    setThinking(false)
  }, [engine])

  const handleSquareClick = useCallback((position: string) => {
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
        engine={engine}
        engines={ENGINES}
        onEngineChange={handleEngineChange}
        difficultyIndex={difficultyIndex}
        onDifficultyChange={setDifficultyIndex}
        thinking={thinking}
      />
    </div>
  )
}

export default Board
