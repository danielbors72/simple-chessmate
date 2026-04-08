// GameInfo.tsx — Status joc, selector mod, motoare, dificultate, controls AI vs AI, istoric

import { Chess } from 'chess.js'
import type { ChessEngine } from '../engine/engines'
import './GameInfo.css'

type GameMode = 'human-vs-ai' | 'ai-vs-ai'

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
  // AI vs AI
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
    // Jocul nu a început încă
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

  return (
    <div className="game-info">
      <div className="status">{status}</div>

      {/* Selector mod de joc */}
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

      {/* Selectoare motoare */}
      <div className="engine-selectors">
        {isAiVsAi && (
          <div className="engine-row">
            <span className="engine-label">alb</span>
            <select
              value={engineWhite.name}
              onChange={(e) => onEngineWhiteChange(e.target.value)}
              disabled={thinking || playing}
            >
              {engines.map(e => (
                <option key={e.name} value={e.name}>{e.name} ({e.year})</option>
              ))}
            </select>
            {engineWhite.difficulty.length > 1 && (
              <select
                value={diffWhiteIndex}
                onChange={(e) => onDiffWhiteChange(Number(e.target.value))}
                disabled={thinking || playing}
              >
                {engineWhite.difficulty.map((d, i) => (
                  <option key={i} value={i}>{d.label}</option>
                ))}
              </select>
            )}
          </div>
        )}
        <div className="engine-row">
          {isAiVsAi && <span className="engine-label">negru</span>}
          <select
            value={engine.name}
            onChange={(e) => onEngineChange(e.target.value)}
            disabled={thinking || (isAiVsAi && playing)}
          >
            {engines.map(e => (
              <option key={e.name} value={e.name}>{e.name} ({e.year})</option>
            ))}
          </select>
          {engine.difficulty.length > 1 && (
            <select
              value={difficultyIndex}
              onChange={(e) => onDifficultyChange(Number(e.target.value))}
              disabled={thinking || (isAiVsAi && playing)}
            >
              {engine.difficulty.map((d, i) => (
                <option key={i} value={i}>{d.label}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        {isAiVsAi ? (
          <>
            <button onClick={onPlayToggle} disabled={gameOver}>
              {playing ? '⏸ Pauză' : '▶ Start'}
            </button>
            <button onClick={onStep} disabled={gameOver || thinking || playing}>
              ⏭ Pas
            </button>
            <button onClick={onUndoAiVsAi} disabled={!canUndoAiVsAi || playing}>
              ↩ Înapoi
            </button>
            <button onClick={onNewGame}>Joc nou</button>
          </>
        ) : (
          <>
            <button onClick={onUndo} disabled={!canUndo || thinking}>Undo</button>
            <button onClick={onNewGame}>Joc nou</button>
          </>
        )}
      </div>

      {/* Slider viteză — doar în AI vs AI */}
      {isAiVsAi && (
        <div className="speed-control">
          <label>Viteză auto-play</label>
          <input
            type="range"
            min={300}
            max={3000}
            step={100}
            value={autoPlaySpeed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
          />
        </div>
      )}

      {/* Hint tastatură */}
      {isAiVsAi && !playing && !gameOver && (
        <div className="keyboard-hint">click pe tablă sau spațiu = următoarea mutare</div>
      )}

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
