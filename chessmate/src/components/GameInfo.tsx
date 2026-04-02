// GameInfo.tsx — Status joc, butoane, dificultate, istoric mutări

import { Chess } from 'chess.js'
import './GameInfo.css'

type GameInfoProps = {
  game: Chess
  canUndo: boolean
  onNewGame: () => void
  onUndo: () => void
  difficulty: string
  onDifficultyChange: (d: string) => void
  thinking: boolean
}

function getStatus(game: Chess, thinking: boolean): string {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? 'Șah mat — negrul câștigă' : 'Șah mat — albul câștigă'
  }
  if (game.isStalemate()) return 'Remiză — pat'
  if (game.isThreefoldRepetition()) return 'Remiză — repetiție triplă'
  if (game.isInsufficientMaterial()) return 'Remiză — material insuficient'
  if (game.isDraw()) return 'Remiză'
  if (thinking) return 'Stockfish gândește...'
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

function GameInfo({ game, canUndo, onNewGame, onUndo, difficulty, onDifficultyChange, thinking }: GameInfoProps) {
  const status = getStatus(game, thinking)
  const moves = formatMoveHistory(game)
  return (
    <div className="game-info">
      <div className="status">{status}</div>

      <div className="controls">
        <button onClick={onUndo} disabled={!canUndo || thinking}>Undo</button>
        <button onClick={onNewGame}>Joc nou</button>
        <select
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
          disabled={thinking}
        >
          <option value="easy">Ușor</option>
          <option value="medium">Mediu</option>
          <option value="hard">Greu</option>
        </select>
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
