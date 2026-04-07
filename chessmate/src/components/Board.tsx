// Board.tsx — Tabla de șah interactivă cu motoare selectabile
// Albul = jucătorul, Negrul = motorul ales

import { useState, useCallback, useEffect, useRef } from 'react'
import { Chess, type Square as Sq } from 'chess.js'
import { ENGINES, DEFAULT_ENGINE, type ChessEngine } from '../engine/engines'
import Square from './Square'
import MoveArrow from './MoveArrow'
import GameInfo from './GameInfo'
import './Board.css'

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1]

// Convertește o poziție algebrică ("e4") în coordonate grid (col, row)
function posToGrid(pos: string): { col: number; row: number } {
  return {
    col: FILES.indexOf(pos[0]),
    row: RANKS.indexOf(Number(pos[1])),
  }
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

type LastMove = { from: string; to: string } | null
type AnimatingPiece = {
  pieceCode: string
  fromCol: number; fromRow: number
  toCol: number; toRow: number
  duration: number  // durata animației în ms
} | null

function Board() {
  const [game, setGame] = useState(new Chess())
  const [selected, setSelected] = useState<string | null>(null)
  const [legalMoves, setLegalMoves] = useState<string[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [moveHistory, setMoveHistory] = useState<LastMove[]>([]) // săgeți paralele cu history
  const [thinking, setThinking] = useState(false)
  const [lastMove, setLastMove] = useState<LastMove>(null)
  const [animating, setAnimating] = useState<AnimatingPiece>(null)

  // Motor curent + nivel de dificultate
  const [engine, setEngine] = useState<ChessEngine>(DEFAULT_ENGINE)
  const [difficultyIndex, setDifficultyIndex] = useState(1)
  const engineRef = useRef(engine)
  const boardRef = useRef<HTMLDivElement>(null)

  const gameOver = game.isGameOver()
  const inCheck = game.inCheck()
  const kingSquare = inCheck ? findKingSquare(game) : null
  const isPlayerTurn = game.turn() === 'w'

  // Execută o mutare cu animație
  // isPlayer = true → animație 1s, false (AI) → animație 0.5s
  const executeMove = useCallback((from: string, to: string, promotion?: string, isPlayer = false) => {
    const fromGrid = posToGrid(from)
    const toGrid = posToGrid(to)

    // Piesa care se mută (înainte de mutare)
    const piece = game.get(from as Sq)
    if (!piece) return false

    // Dacă e promoție, folosim piesa promovată
    const promoType = promotion || (piece.type === 'p' && (to[1] === '8' || to[1] === '1') ? 'q' : undefined)
    const pieceCode = promoType
      ? piece.color + promoType.toUpperCase()
      : toPieceCode(piece)

    const fenBefore = game.fen()
    const move = game.move({ from, to, promotion: promoType })
    if (!move) return false

    const duration = isPlayer ? 1000 : 500

    // Pornește animația
    setAnimating({
      pieceCode,
      fromCol: fromGrid.col, fromRow: fromGrid.row,
      toCol: toGrid.col, toRow: toGrid.row,
      duration,
    })

    const arrow: LastMove = { from, to }
    setHistory(prev => [...prev, fenBefore])
    setMoveHistory(prev => [...prev, lastMove]) // salvăm săgeata anterioară
    setLastMove(arrow)
    setGame(new Chess(game.fen()))

    // Oprește animația după durata completă
    setTimeout(() => setAnimating(null), duration)
    return true
  }, [game])

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
        if (engineRef.current !== currentEngine) return

        // Delay 1s înainte de mutarea AI — ca să pară că "gândește"
        setTimeout(() => {
          if (engineRef.current !== currentEngine) return

          const from = bestMove.slice(0, 2)
          const to = bestMove.slice(2, 4)
          const promotion = bestMove.length > 4 ? bestMove[4] : undefined

          executeMove(from, to, promotion)
          setThinking(false)
        }, 1000)
      })
    }
  }, [game, isPlayerTurn, gameOver, difficultyIndex, executeMove])

  const handleEngineChange = useCallback((engineName: string) => {
    const newEngine = ENGINES.find(e => e.name === engineName)
    if (!newEngine || newEngine === engine) return

    engine.destroy()
    setEngine(newEngine)
    setDifficultyIndex(0)
    setGame(new Chess())
    setSelected(null)
    setLegalMoves([])
    setHistory([])
    setMoveHistory([])
    setThinking(false)
    setLastMove(null)
    setAnimating(null)
  }, [engine])

  const handleSquareClick = useCallback((position: string) => {
    if (gameOver || !isPlayerTurn || thinking || animating) return

    if (selected && legalMoves.includes(position)) {
      executeMove(selected, position, undefined, true)
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
  }, [game, selected, legalMoves, gameOver, isPlayerTurn, thinking, animating, executeMove])

  const handleNewGame = useCallback(() => {
    setGame(new Chess())
    setSelected(null)
    setLegalMoves([])
    setHistory([])
    setMoveHistory([])
    setThinking(false)
    setLastMove(null)
    setAnimating(null)
  }, [])

  const handleUndo = useCallback(() => {
    if (history.length < 2) return
    const prevFen = history[history.length - 2]
    setGame(new Chess(prevFen))
    setHistory(prev => prev.slice(0, -2))
    setMoveHistory(prev => prev.slice(0, -2))
    setSelected(null)
    setLegalMoves([])
    setAnimating(null)

    // Restaurăm săgeata de dinainte de cele 2 mutări anulate
    const restoredArrow = moveHistory.length >= 2 ? moveHistory[moveHistory.length - 2] : null
    setLastMove(restoredArrow)
  }, [history, moveHistory])

  return (
    <div className="board-wrapper">
      <div className="board" ref={boardRef}>
        {RANKS.map((rank) =>
          FILES.map((file) => {
            const position = `${file}${rank}`
            const fileIndex = FILES.indexOf(file)
            const rankIndex = RANKS.indexOf(rank)
            const isLight = (fileIndex + rankIndex) % 2 === 0
            const chessPiece = game.get(position as Sq)
            const pieceCode = chessPiece ? toPieceCode(chessPiece) : undefined

            // Ascunde piesa la destinație în timpul animației (evită dublura)
            const hideForAnimation = animating && position === `${FILES[animating.toCol]}${RANKS[animating.toRow]}`

            return (
              <Square
                key={position}
                isLight={isLight}
                position={position}
                piece={hideForAnimation ? undefined : pieceCode}
                isSelected={position === selected}
                isLegalMove={legalMoves.includes(position)}
                isInCheck={position === kingSquare}
                onClick={() => handleSquareClick(position)}
              />
            )
          })
        )}

        {/* Săgeată ultimă mutare */}
        {lastMove && !animating && (
          <MoveArrow
            from={posToGrid(lastMove.from)}
            to={posToGrid(lastMove.to)}
          />
        )}

        {/* Piesa animată — zboară de la sursă la destinație */}
        {animating && (
          <AnimatedPiece
            pieceCode={animating.pieceCode}
            fromCol={animating.fromCol}
            fromRow={animating.fromRow}
            toCol={animating.toCol}
            toRow={animating.toRow}
            duration={animating.duration}
          />
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

// Componenta de animație — piesa care se mișcă
function AnimatedPiece({ pieceCode, fromCol, fromRow, toCol, toRow, duration }: {
  pieceCode: string
  fromCol: number; fromRow: number
  toCol: number; toRow: number
  duration: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.offsetHeight
    el.classList.add('animate-to')
  }, [])

  // Pozițiile ca procente (fiecare pătrat = 12.5%)
  const fromX = fromCol * 12.5
  const fromY = fromRow * 12.5
  const toX = toCol * 12.5
  const toY = toRow * 12.5

  return (
    <div
      ref={ref}
      className="animating-piece"
      style={{
        '--from-x': `${fromX}%`,
        '--from-y': `${fromY}%`,
        '--to-x': `${toX}%`,
        '--to-y': `${toY}%`,
        '--anim-duration': `${duration}ms`,
      } as React.CSSProperties}
    >
      <img
        className="piece"
        src={getPieceUrl(pieceCode)}
        alt={pieceCode}
        draggable={false}
      />
    </div>
  )
}

// Helper — obține URL-ul SVG pentru o piesă
// Importurile sunt statice în Piece.tsx, aici le accesăm dinamic
import wK from '../assets/pieces/wK.svg'
import wQ from '../assets/pieces/wQ.svg'
import wR from '../assets/pieces/wR.svg'
import wB from '../assets/pieces/wB.svg'
import wN from '../assets/pieces/wN.svg'
import wP from '../assets/pieces/wP.svg'
import bK from '../assets/pieces/bK.svg'
import bQ from '../assets/pieces/bQ.svg'
import bR from '../assets/pieces/bR.svg'
import bB from '../assets/pieces/bB.svg'
import bN from '../assets/pieces/bN.svg'
import bP from '../assets/pieces/bP.svg'

const PIECE_URLS: Record<string, string> = {
  wK, wQ, wR, wB, wN, wP, bK, bQ, bR, bB, bN, bP,
}

function getPieceUrl(code: string): string {
  return PIECE_URLS[code] || ''
}

export default Board
