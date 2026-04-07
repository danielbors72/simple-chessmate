// GameInfo.tsx — Status joc, selector motor, dificultate, butoane, istoric mutări

import { Chess } from 'chess.js'
import type { ChessEngine } from '../engine/engines'
import './GameInfo.css'

type GameInfoProps = {
  game: Chess
  canUndo: boolean
  onNewGame: () => void
  onUndo: () => void
  engine: ChessEngine
  engines: ChessEngine[]
  onEngineChange: (name: string) => void
  difficultyIndex: number
  onDifficultyChange: (i: number) => void
  thinking: boolean
}

function getStatus(game: Chess, thinking: boolean, engineName: string): string {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? 'Șah mat — negrul câștigă' : 'Șah mat — albul câștigă'
  }
  if (game.isStalemate()) return 'Remiză — pat'
  if (game.isThreefoldRepetition()) return 'Remiză — repetiție triplă'
  if (game.isInsufficientMaterial()) return 'Remiză — material insuficient'
  if (game.isDraw()) return 'Remiză'
  if (thinking) return `${engineName} gândește...`
  if (game.inCheck()) return game.turn() === 'w' ? 'Albul e în șah' : 'Negrul e în șah'
  return game.turn() === 'w' ? 'Albul la mutare' : 'Negrul la mutare'
}

function formatMoveHistory(game: Chess): string[] {
  const moves = game.history()
  const pairs: string[] = []
  for (let i = 0; i < moves.length; i += 2) {
    const num = Math.floor(i / 2) + 1
    const white = moves[i]
    const black = moves[i + 1] || ''
    pairs.push(`${num}. ${white} ${black}`)
  }
  return pairs
}

function GameInfo({
  game, canUndo, onNewGame, onUndo,
  engine, engines, onEngineChange,
  difficultyIndex, onDifficultyChange,
  thinking
}: GameInfoProps) {
  const status = getStatus(game, thinking, engine.name)
  const moves = formatMoveHistory(game)

  return (
    <div className="game-info">
      <div className="status">{status}</div>

      {/* Selector motor + info */}
      <div className="engine-selector">
        <select
          value={engine.name}
          onChange={(e) => onEngineChange(e.target.value)}
          disabled={thinking}
          className="engine-select"
        >
          {engines.map(e => (
            <option key={e.name} value={e.name}>
              {e.name} ({e.year})
            </option>
          ))}
        </select>
        <span className="engine-desc">{engine.description}</span>
      </div>

      <div className="controls">
        <button onClick={onUndo} disabled={!canUndo || thinking}>Undo</button>
        <button onClick={onNewGame}>Joc nou</button>

        {/* Dificultate — doar dacă motorul are mai mult de un nivel */}
        {engine.difficulty.length > 1 && (
          <select
            value={difficultyIndex}
            onChange={(e) => onDifficultyChange(Number(e.target.value))}
            disabled={thinking}
          >
            {engine.difficulty.map((d, i) => (
              <option key={i} value={i}>{d.label}</option>
            ))}
          </select>
        )}
      </div>

      {moves.length > 0 && (
        <div className="move-history">
          {moves.map((pair, i) => (
            <span key={i} className="move-pair">{pair}</span>
          ))}
        </div>
      )}
    </div>
  )
}

export default GameInfo
