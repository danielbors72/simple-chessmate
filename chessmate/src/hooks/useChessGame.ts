// useChessGame.ts — Hook care gestionează toată logica jocului de șah
// Separă state + effects + handlers de componenta vizuală Board

import { useState, useCallback, useEffect, useRef } from 'react'
import { Chess, type Square as Sq } from 'chess.js'
import { ENGINES, DEFAULT_ENGINE, type ChessEngine } from '../engine/engines'

// Tipuri exportate — folosite de Board.tsx și GameInfo.tsx
export type GameMode = 'human-vs-ai' | 'ai-vs-ai'

export type LastMove = { from: string; to: string } | null

export type AnimatingPiece = {
  pieceCode: string
  fromCol: number; fromRow: number
  toCol: number; toRow: number
  duration: number
} | null

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

// Convertește o poziție algebrică ("e4") în coordonate grid (col, row)
export function posToGrid(pos: string): { col: number; row: number } {
  return {
    col: FILES.indexOf(pos[0]),
    row: RANKS.indexOf(Number(pos[1])),
  }
}

export function useChessGame() {
  const [game, setGame] = useState(new Chess())
  const [selected, setSelected] = useState<string | null>(null)
  const [legalMoves, setLegalMoves] = useState<string[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [moveHistory, setMoveHistory] = useState<LastMove[]>([])
  const [thinking, setThinking] = useState(false)
  const [lastMove, setLastMove] = useState<LastMove>(null)
  const [animating, setAnimating] = useState<AnimatingPiece>(null)

  // Mod de joc: om vs motor sau motor vs motor
  const [gameMode, setGameMode] = useState<GameMode>('human-vs-ai')

  // Motor negru (existent) + motor alb (AI vs AI)
  const [engine, setEngine] = useState<ChessEngine>(DEFAULT_ENGINE)
  const [difficultyIndex, setDifficultyIndex] = useState(1)
  const [engineWhite, setEngineWhite] = useState<ChessEngine>(DEFAULT_ENGINE)
  const [diffWhiteIndex, setDiffWhiteIndex] = useState(1)
  const engineRef = useRef(engine)
  const engineWhiteRef = useRef(engineWhite)

  // Controluri AI vs AI
  const [playing, setPlaying] = useState(false)
  const [stepRequested, setStepRequested] = useState(false)
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(1500)
  const autoPlaySpeedRef = useRef(autoPlaySpeed)
  autoPlaySpeedRef.current = autoPlaySpeed

  // Contor generație — invalidează rezultatele de gândire stale după reset/schimbare mod
  const thinkingGenRef = useRef(0)

  // Derived values
  const gameOver = game.isGameOver()
  const inCheck = game.inCheck()
  const kingSquare = inCheck ? findKingSquare(game) : null
  const isPlayerTurn = game.turn() === 'w'

  // Execută o mutare cu animație
  const executeMove = useCallback((from: string, to: string, promotion?: string, isPlayer = false) => {
    const fromGrid = posToGrid(from)
    const toGrid = posToGrid(to)

    const piece = game.get(from as Sq)
    if (!piece) return false

    const promoType = promotion || (piece.type === 'p' && (to[1] === '8' || to[1] === '1') ? 'q' : undefined)
    const pieceCode = promoType
      ? piece.color + promoType.toUpperCase()
      : toPieceCode(piece)

    const fenBefore = game.fen()
    const move = game.move({ from, to, promotion: promoType })
    if (!move) return false

    const duration = isPlayer ? 1000 : 500

    setAnimating({
      pieceCode,
      fromCol: fromGrid.col, fromRow: fromGrid.row,
      toCol: toGrid.col, toRow: toGrid.row,
      duration,
    })

    const arrow: LastMove = { from, to }
    setHistory(prev => [...prev, fenBefore])
    setMoveHistory(prev => [...prev, lastMove])
    setLastMove(arrow)
    setGame(new Chess(game.fen()))

    setTimeout(() => setAnimating(null), duration)
    return true
  }, [game])

  // Pornește motorul negru la prima încărcare + la schimbare motor
  useEffect(() => {
    engineRef.current = engine
    engine.init()
    return () => engine.destroy()
  }, [engine])

  // Pornește motorul alb (doar pentru AI vs AI)
  // Dacă engineWhite e aceeași instanță ca engineBlack (e.g. ambele Stockfish la start),
  // nu inițializăm/distrugem separat — efectul engine-ului negru deja le gestionează
  useEffect(() => {
    engineWhiteRef.current = engineWhite
    if (gameMode === 'ai-vs-ai' && engineWhite !== engineRef.current) {
      engineWhite.init()
      return () => engineWhite.destroy()
    }
  }, [engineWhite, gameMode])

  // Când e rândul negrului (AI) — doar în modul Human vs AI
  useEffect(() => {
    if (gameMode !== 'human-vs-ai') return
    if (!isPlayerTurn && !gameOver) {
      setThinking(true)
      const currentEngine = engineRef.current
      const level = currentEngine.difficulty[difficultyIndex]?.value ?? currentEngine.difficulty[0].value

      currentEngine.findBestMove(game.fen(), level).then((bestMove) => {
        if (engineRef.current !== currentEngine) return

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
  }, [game, gameMode, isPlayerTurn, gameOver, difficultyIndex, executeMove])

  // AI vs AI: pregătește mutarea (motorul gândește), apoi așteaptă trigger
  const pendingMoveRef = useRef<string | null>(null)

  // Pas 1: când e tura cuiva, cere motorului să gândească
  useEffect(() => {
    if (gameMode !== 'ai-vs-ai' || gameOver) return
    if (pendingMoveRef.current) return

    const turn = game.turn()
    const currentEngine = turn === 'w' ? engineWhiteRef.current : engineRef.current
    const level = turn === 'w'
      ? currentEngine.difficulty[diffWhiteIndex]?.value ?? currentEngine.difficulty[0].value
      : currentEngine.difficulty[difficultyIndex]?.value ?? currentEngine.difficulty[0].value

    setThinking(true)
    const gen = thinkingGenRef.current

    currentEngine.findBestMove(game.fen(), level).then((bestMove) => {
      // Ignoră rezultat stale (după reset, schimbare motor sau mod)
      if (thinkingGenRef.current !== gen) return
      const stillCurrent = turn === 'w'
        ? engineWhiteRef.current === currentEngine
        : engineRef.current === currentEngine
      if (!stillCurrent) return

      pendingMoveRef.current = bestMove
      // Forțează re-render ca efectul auto-play (Pas 3) să detecteze mutarea
      setThinking(false)
    })
  }, [game, gameMode, gameOver, difficultyIndex, diffWhiteIndex])

  // Aplică mutarea pregătită
  const applyPendingMove = useCallback(() => {
    const bestMove = pendingMoveRef.current
    if (!bestMove) return

    pendingMoveRef.current = null
    const from = bestMove.slice(0, 2)
    const to = bestMove.slice(2, 4)
    const promotion = bestMove.length > 4 ? bestMove[4] : undefined

    executeMove(from, to, promotion)
    setStepRequested(false)
  }, [executeMove])

  // Pas 2: step manual — execută mutarea pregătită imediat
  // `thinking` în deps: dacă motorul termina gânditul DUPĂ ce userul a apăsat Pas,
  // efectul se re-rulează și aplică mutarea acum gata
  useEffect(() => {
    if (!stepRequested || !pendingMoveRef.current) return
    applyPendingMove()
  }, [stepRequested, thinking, applyPendingMove])

  // Pas 3: auto-play continuu — thinking în deps ca trigger de re-render
  useEffect(() => {
    if (gameMode !== 'ai-vs-ai' || !playing || gameOver) return
    if (!pendingMoveRef.current) return

    const timer = setTimeout(() => {
      if (pendingMoveRef.current) {
        applyPendingMove()
      }
    }, autoPlaySpeedRef.current)

    return () => clearTimeout(timer)
  }, [game, gameMode, playing, gameOver, thinking, applyPendingMove])

  // Resetare state helper
  const resetState = useCallback(() => {
    thinkingGenRef.current++  // invalidează orice gând în curs
    pendingMoveRef.current = null
    setGame(new Chess())
    setSelected(null)
    setLegalMoves([])
    setHistory([])
    setMoveHistory([])
    setThinking(false)
    setLastMove(null)
    setAnimating(null)
  }, [])

  // Wake Lock — ecranul rămâne activ în AI vs AI (ca la un video YouTube)
  useEffect(() => {
    if (gameMode !== 'ai-vs-ai' || !playing || gameOver) return

    let wakeLock: WakeLockSentinel | null = null

    navigator.wakeLock?.request('screen').then(lock => {
      wakeLock = lock
    }).catch(() => {
      // Wake Lock indisponibil — ignorăm silențios
    })

    return () => {
      wakeLock?.release()
    }
  }, [gameMode, playing, gameOver])

  // Schimbă modul de joc (Human vs AI ↔ AI vs AI)
  const handleModeChange = useCallback((mode: GameMode) => {
    if (mode === gameMode) return
    setGameMode(mode)
    resetState()
    setPlaying(false)
    setStepRequested(false)
  }, [gameMode, resetState])

  // Schimbă motorul alb (AI vs AI)
  const handleEngineWhiteChange = useCallback((engineName: string) => {
    const newEngine = ENGINES.find(e => e.name === engineName)
    if (!newEngine || newEngine === engineWhite) return

    // Nu distruge dacă e aceeași instanță cu motorul negru — ar distruge și negrul
    if (engineWhite !== engine) engineWhite.destroy()
    setEngineWhite(newEngine)
    setDiffWhiteIndex(0)
    resetState()
  }, [engineWhite, engine, resetState])

  const handleEngineChange = useCallback((engineName: string) => {
    const newEngine = ENGINES.find(e => e.name === engineName)
    if (!newEngine || newEngine === engine) return

    // Nu distruge dacă e aceeași instanță cu motorul alb
    if (engine !== engineWhite) engine.destroy()
    setEngine(newEngine)
    setDifficultyIndex(0)
    resetState()
  }, [engine, engineWhite, resetState])

  // Undo în AI vs AI — revine o mutare, păstrează săgeata
  const handleUndoAiVsAi = useCallback(() => {
    if (history.length < 1 || thinking) return
    const prevFen = history[history.length - 1]
    thinkingGenRef.current++  // invalidează orice gând în curs pentru poziția anterioară
    setGame(new Chess(prevFen))
    setHistory(prev => prev.slice(0, -1))
    setMoveHistory(prev => prev.slice(0, -1))
    setAnimating(null)
    setPlaying(false)
    setStepRequested(false)
    pendingMoveRef.current = null

    const restoredArrow = moveHistory.length >= 1 ? moveHistory[moveHistory.length - 1] : null
    setLastMove(restoredArrow)
  }, [history, moveHistory, thinking])

  // Următoarea mutare (step manual)
  const handleStep = useCallback(() => {
    if (gameOver) return
    setStepRequested(true)
  }, [gameOver])

  // Tastatura: Space = next move în AI vs AI
  useEffect(() => {
    if (gameMode !== 'ai-vs-ai') return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        if (!gameOver) setStepRequested(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [gameMode, gameOver])

  const handleSquareClick = useCallback((position: string) => {
    // În AI vs AI, click pe tablă = următoarea mutare
    if (gameMode === 'ai-vs-ai') {
      if (!gameOver) setStepRequested(true)
      return
    }
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
    resetState()
  }, [resetState])

  const handleUndo = useCallback(() => {
    if (history.length < 2) return
    const prevFen = history[history.length - 2]
    setGame(new Chess(prevFen))
    setHistory(prev => prev.slice(0, -2))
    setMoveHistory(prev => prev.slice(0, -2))
    setSelected(null)
    setLegalMoves([])
    setAnimating(null)

    const restoredArrow = moveHistory.length >= 2 ? moveHistory[moveHistory.length - 2] : null
    setLastMove(restoredArrow)
  }, [history, moveHistory])

  return {
    // State pentru render
    game,
    selected,
    legalMoves,
    thinking,
    lastMove,
    animating,
    gameMode,
    gameOver,
    inCheck,
    kingSquare,
    isPlayerTurn,

    // Engine state (pentru GameInfo)
    engine,
    engines: ENGINES,
    engineWhite,
    difficultyIndex,
    diffWhiteIndex,
    playing,
    autoPlaySpeed,
    canUndo: history.length >= 2 && isPlayerTurn,
    canUndoAiVsAi: history.length >= 1 && !thinking,

    // Handlers
    handleSquareClick,
    handleNewGame,
    handleUndo,
    handleUndoAiVsAi,
    handleEngineChange,
    handleEngineWhiteChange,
    handleModeChange,
    handleStep,
    setDifficultyIndex,
    setDiffWhiteIndex,
    setPlaying,
    setAutoPlaySpeed,
  }
}
