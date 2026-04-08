// GameInfo.tsx — Panou control joc: status, mod, motoare, acțiuni, istoric

import { Chess } from 'chess.js'
import type { ChessEngine } from '../engine/engines'
import type { GameMode } from '../hooks/useChessGame'
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
  gameMode: GameMode
  onModeChange: (mode: GameMode) => void
  engineWhite: ChessEngine
  onEngineWhiteChange: (name: string) => void
  diffWhiteIndex: number
  onDiffWhiteChange: (i: number) => void
  playing: boolean
  onPlayToggle: () => void
  onStep: () => void
  onUndoAiVsAi: () => void
  canUndoAiVsAi: boolean
  autoPlaySpeed: number
  onSpeedChange: (ms: number) => void
}

function getStatus(game: Chess, thinking: boolean, engineName: string, gameMode: GameMode, engineWhiteName: string, playing: boolean): string {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? 'Șah mat — negrul câștigă' : 'Șah mat — albul câștigă'
  }
  if (game.isStalemate()) return 'Remiză — pat'
  if (game.isThreefoldRepetition()) return 'Remiză — repetiție triplă'
  if (game.isInsufficientMaterial()) return 'Remiză — material insuficient'
  if (game.isDraw()) return 'Remiză'

  if (gameMode === 'ai-vs-ai') {
    if (!playing && game.history().length === 0 && !thinking) {
      return 'alege motoarele și apasă start'
    }
    const name = game.turn() === 'w' ? engineWhiteName : engineName
    if (thinking) return `${name} gândește...`
    if (!playing) return 'pauză'
    return game.turn() === 'w' ? `${engineWhiteName} (alb) la mutare` : `${engineName} (negru) la mutare`
  }

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

// Selector motor + dificultate (reutilizabil)
function EngineSelector({ label, engine, engines, diffIndex, onEngineChange, onDiffChange, disabled }: {
  label?: string
  engine: ChessEngine
  engines: ChessEngine[]
  diffIndex: number
  onEngineChange: (name: string) => void
  onDiffChange: (i: number) => void
  disabled: boolean
}) {
  return (
    <div className="engine-row">
      {label && <span className="engine-label">{label}</span>}
      <select value={engine.name} onChange={e => onEngineChange(e.target.value)} disabled={disabled}>
        {engines.map(e => (
          <option key={e.name} value={e.name}>{e.name} ({e.year})</option>
        ))}
      </select>
      {engine.difficulty.length > 1 && (
        <select value={diffIndex} onChange={e => onDiffChange(Number(e.target.value))} disabled={disabled}>
          {engine.difficulty.map((d, i) => (
            <option key={i} value={i}>{d.label}</option>
          ))}
        </select>
      )}
    </div>
  )
}

function GameInfo({
  game, canUndo, onNewGame, onUndo,
  engine, engines, onEngineChange,
  difficultyIndex, onDifficultyChange,
  thinking,
  gameMode, onModeChange,
  engineWhite, onEngineWhiteChange,
  diffWhiteIndex, onDiffWhiteChange,
  playing, onPlayToggle, onStep,
  onUndoAiVsAi, canUndoAiVsAi,
  autoPlaySpeed, onSpeedChange,
}: GameInfoProps) {
  const status = getStatus(game, thinking, engine.name, gameMode, engineWhite.name, playing)
  const moves = formatMoveHistory(game)
  const isAiVsAi = gameMode === 'ai-vs-ai'
  const gameOver = game.isGameOver()
  const engineDisabled = thinking || (isAiVsAi && playing)

  return (
    <div className="game-info">

      {/* ── Secțiunea 1: Status ── */}
      <div className="status">{status}</div>

      {/* ── Secțiunea 2: Mod de joc (toggle) ── */}
      <div className="mode-selector">
        <button
          className={`mode-btn ${!isAiVsAi ? 'active' : ''}`}
          onClick={() => onModeChange('human-vs-ai')}
          disabled={thinking}
        >
          Om vs Motor
        </button>
        <button
          className={`mode-btn ${isAiVsAi ? 'active' : ''}`}
          onClick={() => onModeChange('ai-vs-ai')}
          disabled={thinking}
        >
          Motor vs Motor
        </button>
      </div>

      {/* ── Secțiunea 3: Motoare ── */}
      <div className="engine-selectors">
        {isAiVsAi && (
          <EngineSelector
            label="alb"
            engine={engineWhite}
            engines={engines}
            diffIndex={diffWhiteIndex}
            onEngineChange={onEngineWhiteChange}
            onDiffChange={onDiffWhiteChange}
            disabled={engineDisabled}
          />
        )}
        <EngineSelector
          label={isAiVsAi ? 'negru' : undefined}
          engine={engine}
          engines={engines}
          diffIndex={difficultyIndex}
          onEngineChange={onEngineChange}
          onDiffChange={onDifficultyChange}
          disabled={engineDisabled}
        />
      </div>

      {/* ── Secțiunea 4: Acțiuni ── */}
      {isAiVsAi ? (
        <div className="controls-group">
          {/* Rând 1: transport (play/pause, pas, înapoi) */}
          <div className="transport">
            <button className="transport-btn" onClick={onUndoAiVsAi} disabled={!canUndoAiVsAi || playing} title="Înapoi o mutare">
              ⏮
            </button>
            <button className="transport-btn primary" onClick={onPlayToggle} disabled={gameOver} title={playing ? 'Pauză' : 'Start'}>
              {playing ? '⏸' : '▶'}
            </button>
            <button className="transport-btn" onClick={onStep} disabled={gameOver} title="Următoarea mutare (sau Space / click pe tablă)">
              ⏭
            </button>
          </div>

          {/* Rând 2: slider viteză */}
          <div className="speed-control">
            <span className="speed-label">lent</span>
            <input
              type="range"
              min={0}
              max={3000}
              step={100}
              value={3000 - autoPlaySpeed}
              onChange={(e) => onSpeedChange(3000 - Number(e.target.value))}
            />
            <span className="speed-label">rapid</span>
          </div>

          {/* Rând 3: joc nou */}
          <div className="controls">
            <button onClick={onNewGame}>Joc nou</button>
          </div>

          {/* Hint */}
          {!playing && !gameOver && (
            <div className="keyboard-hint">click pe tablă sau spațiu = următoarea mutare</div>
          )}
        </div>
      ) : (
        <div className="controls">
          <button onClick={onUndo} disabled={!canUndo || thinking}>Undo</button>
          <button onClick={onNewGame}>Joc nou</button>
        </div>
      )}

      {/* ── Secțiunea 5: Istoric mutări ── */}
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
