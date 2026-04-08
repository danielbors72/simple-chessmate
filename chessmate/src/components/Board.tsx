// Board.tsx — Tabla de șah (doar render)
// Toată logica e în useChessGame hook

import { useRef, useEffect } from 'react'
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
    gameMode, gameOver, kingSquare, isPlayerTurn,
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

  return (
    <div className="board-wrapper">
      <div className={`board${gameMode === 'ai-vs-ai' ? ' spectator' : ''}`} ref={boardRef}>
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

        {/* Săgeată ultimă mutare — vizibilă și în timpul animației */}
        {lastMove && (
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
