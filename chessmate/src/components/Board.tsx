// Board.tsx — Tabla de șah (render + drag-and-drop)
// Logica jocului e în useChessGame hook

import { useRef, useEffect, useState, useCallback } from 'react'
import type { Square as Sq } from 'chess.js'
import { useChessGame, posToGrid } from '../hooks/useChessGame'
import Square from './Square'
import MoveArrow from './MoveArrow'
import GameInfo from './GameInfo'
import './Board.css'

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1]

function Board() {
  const {
    game, selected, legalMoves, thinking, lastMove, animating,
    gameMode, kingSquare,
    lifted, liftPiece, placePiece,
    engine, engines, engineWhite,
    difficultyIndex, diffWhiteIndex,
    playing, autoPlaySpeed,
    canUndo, canUndoAiVsAi,
    handleSquareClick, handleNewGame, handleUndo, handleUndoAiVsAi,
    handleEngineChange, handleEngineWhiteChange, handleModeChange,
    handleStep, setDifficultyIndex, setDiffWhiteIndex,
    setPlaying, setAutoPlaySpeed,
  } = useChessGame()

  const boardRef = useRef<HTMLDivElement>(null)

  // === Drag state ===
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)
  const [returnAnim, setReturnAnim] = useState<{
    fromX: number; fromY: number; toX: number; toY: number
  } | null>(null)
  const pointerIdRef = useRef<number | null>(null)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)

  // Curăță starea drag când piesa e eliberată (new game, undo etc.)
  useEffect(() => {
    if (!lifted) {
      setDragPos(null)
      setReturnAnim(null)
      pointerIdRef.current = null
    }
  }, [lifted])

  // Codul piesei ridicate (pentru floating piece)
  const liftedPieceCode = (() => {
    if (!lifted) return ''
    const piece = game.get(lifted as Sq)
    return piece ? toPieceCode(piece) : ''
  })()

  // Centrul pătratului de origine (în % pe tablă)
  const originCenter = (() => {
    if (!lifted) return { x: 0, y: 0 }
    const g = posToGrid(lifted)
    return { x: g.col * 12.5 + 6.25, y: g.row * 12.5 + 6.25 }
  })()

  // Conversie client coords → % pe tablă
  const toBoardPct = useCallback((clientX: number, clientY: number) => {
    const rect = boardRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    }
  }, [])

  // Determină pătratul de sub cursor
  const getSquareAt = useCallback((clientX: number, clientY: number): string | null => {
    const rect = boardRef.current?.getBoundingClientRect()
    if (!rect) return null
    const col = Math.floor((clientX - rect.left) / (rect.width / 8))
    const row = Math.floor((clientY - rect.top) / (rect.height / 8))
    if (col < 0 || col > 7 || row < 0 || row > 7) return null
    return `${FILES[col]}${RANKS[row]}`
  }, [])

  const isPlayerMode = gameMode !== 'ai-vs-ai'
  const gameOver = game.isGameOver()
  const isPlayerTurn = game.turn() === 'w'

  // === Pointer events pentru drag ===
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isPlayerMode || gameOver || !isPlayerTurn || thinking || animating) return

    const sq = getSquareAt(e.clientX, e.clientY)
    if (!sq) return

    // Piesă ridicată + click pe mutare legală → amplasare directă
    if (lifted && legalMoves.includes(sq)) {
      placePiece(sq)
      setDragPos(null)
      setReturnAnim(null)
      return
    }

    // Ridică piesa (dacă nu e deja ridicată)
    if (!lifted) {
      if (!liftPiece(sq)) return
    }

    // Start drag — piesa urmărește cursorul
    const pos = toBoardPct(e.clientX, e.clientY)
    setDragPos(pos)
    setReturnAnim(null)
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    pointerIdRef.current = e.pointerId
    boardRef.current?.setPointerCapture(e.pointerId)
    e.preventDefault()
  }, [isPlayerMode, gameOver, isPlayerTurn, thinking, animating, lifted, legalMoves, liftPiece, placePiece, getSquareAt, toBoardPct])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (e.pointerId !== pointerIdRef.current) return
    setDragPos(toBoardPct(e.clientX, e.clientY))
  }, [toBoardPct])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (e.pointerId !== pointerIdRef.current) return
    pointerIdRef.current = null

    if (!lifted || !dragPos) {
      setDragPos(null)
      return
    }

    // Verifică dacă s-a mișcat cursorul (drag vs click)
    const start = dragStartRef.current
    const wasDragged = start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 5
    dragStartRef.current = null

    if (wasDragged) {
      const sq = getSquareAt(e.clientX, e.clientY)
      if (sq && legalMoves.includes(sq)) {
        // Mutare validă — amplasează
        placePiece(sq)
        setDragPos(null)
        setReturnAnim(null)
      } else {
        // Mutare invalidă — animație return la origine
        const from = toBoardPct(e.clientX, e.clientY)
        setReturnAnim({
          fromX: from.x, fromY: from.y,
          toX: originCenter.x, toY: originCenter.y,
        })
        setDragPos(null)
      }
    } else {
      // Click simplu — piesa rămâne ridicată la origine
      setDragPos(null)
    }
  }, [lifted, dragPos, legalMoves, originCenter, getSquareAt, toBoardPct, placePiece])

  // Când animația return se termină
  const handleReturnEnd = useCallback(() => {
    setReturnAnim(null)
  }, [])

  return (
    <div className="board-wrapper">
      <div
        className={`board${gameMode === 'ai-vs-ai' ? ' spectator' : ''}`}
        ref={boardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={lifted ? { touchAction: 'none' } : undefined}
      >
        {RANKS.map((rank) =>
          FILES.map((file) => {
            const position = `${file}${rank}`
            const fileIndex = FILES.indexOf(file)
            const rankIndex = RANKS.indexOf(rank)
            const isLight = (fileIndex + rankIndex) % 2 === 0
            const chessPiece = game.get(position as Sq)
            const pieceCode = chessPiece ? toPieceCode(chessPiece) : undefined

            // Ascunde piesa la destinație în timpul animației AI
            const hideForAnimation = animating && position === `${FILES[animating.toCol]}${RANKS[animating.toRow]}`
            // Ascunde piesa la origine când e trasă sau se întoarce
            const isLiftedOrigin = position === lifted
            const isBeingMoved = isLiftedOrigin && (dragPos !== null || returnAnim !== null)

            return (
              <Square
                key={position}
                isLight={isLight}
                position={position}
                piece={(hideForAnimation || isBeingMoved) ? undefined : pieceCode}
                isSelected={position === selected}
                isLegalMove={legalMoves.includes(position)}
                isInCheck={position === kingSquare}
                isLifted={isLiftedOrigin && !isBeingMoved}
                onClick={gameMode === 'ai-vs-ai' ? () => handleSquareClick(position) : undefined}
              />
            )
          })
        )}

        {/* Săgeată ultimă mutare */}
        {lastMove && (
          <MoveArrow
            from={posToGrid(lastMove.from)}
            to={posToGrid(lastMove.to)}
          />
        )}

        {/* Piesa animată AI */}
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

        {/* Piesa ridicată — urmărește cursorul în drag */}
        {lifted && dragPos && liftedPieceCode && (
          <div
            className="drag-piece"
            style={{ left: `${dragPos.x}%`, top: `${dragPos.y}%` }}
          >
            <img className="piece" src={getPieceUrl(liftedPieceCode)} alt="" draggable={false} />
          </div>
        )}

        {/* Piesa care se întoarce la origine (drop invalid) */}
        {lifted && returnAnim && liftedPieceCode && (
          <ReturningPiece
            pieceCode={liftedPieceCode}
            fromX={returnAnim.fromX}
            fromY={returnAnim.fromY}
            toX={returnAnim.toX}
            toY={returnAnim.toY}
            onEnd={handleReturnEnd}
          />
        )}
      </div>
      <GameInfo
        game={game}
        canUndo={canUndo}
        onNewGame={handleNewGame}
        onUndo={handleUndo}
        engine={engine}
        engines={engines}
        onEngineChange={handleEngineChange}
        difficultyIndex={difficultyIndex}
        onDifficultyChange={setDifficultyIndex}
        thinking={thinking}
        gameMode={gameMode}
        onModeChange={handleModeChange}
        engineWhite={engineWhite}
        onEngineWhiteChange={handleEngineWhiteChange}
        diffWhiteIndex={diffWhiteIndex}
        onDiffWhiteChange={setDiffWhiteIndex}
        playing={playing}
        onPlayToggle={() => setPlaying(p => !p)}
        onStep={handleStep}
        onUndoAiVsAi={handleUndoAiVsAi}
        canUndoAiVsAi={canUndoAiVsAi}
        autoPlaySpeed={autoPlaySpeed}
        onSpeedChange={setAutoPlaySpeed}
      />
    </div>
  )
}

// Componenta de animație — piesa care se mișcă (AI)
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

// Componenta return — piesa se întoarce la origine după drop invalid
function ReturningPiece({ pieceCode, fromX, fromY, toX, toY, onEnd }: {
  pieceCode: string
  fromX: number; fromY: number
  toX: number; toY: number
  onEnd: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.offsetHeight // force reflow
    el.classList.add('return-to')
  }, [])

  return (
    <div
      ref={ref}
      className="returning-piece"
      style={{
        '--from-x': `${fromX}%`,
        '--from-y': `${fromY}%`,
        '--to-x': `${toX}%`,
        '--to-y': `${toY}%`,
      } as React.CSSProperties}
      onTransitionEnd={onEnd}
    >
      <img className="piece" src={getPieceUrl(pieceCode)} alt="" draggable={false} />
    </div>
  )
}

function toPieceCode(piece: { color: string; type: string }): string {
  return piece.color + piece.type.toUpperCase()
}

// Importuri piese SVG
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
