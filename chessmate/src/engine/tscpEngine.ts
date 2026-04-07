// tscpEngine.ts — Inspirat de TSCP (Tom Kerrigan, 1997)
// Tom Kerrigan's Simple Chess Program — cel mai folosit motor educativ din istorie
// ~1.000 linii C curat, comentat — a învățat o generație de programatori
// Algoritm: alpha-beta + iterative deepening + quiescence + MVV-LVA ordering

import { Chess, type Move } from 'chess.js'
import type { ChessEngine } from './engines'

// Valori piese TSCP (standard centipioni)
const PIECE_VALUE: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 10000,
}

// Piece-square tables TSCP — stil Michniewski, mai detaliate decât Toledo/Micro-Max
// Aceste tabele au fost standardul de referință în educația chess programming
const PST: Record<string, number[]> = {
  p: [
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0,
  ],
  n: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
  ],
  b: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
  ],
  r: [
     0,  0,  0,  0,  0,  0,  0,  0,
     5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     0,  0,  0,  5,  5,  0,  0,  0,
  ],
  q: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20,
  ],
  // Regele în middlegame — stai la margine, departe de acțiune
  k: [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20,
  ],
}

// Regele în endgame — activează-te spre centru
const PST_KING_ENDGAME = [
  -50,-40,-30,-20,-20,-30,-40,-50,
  -30,-20,-10,  0,  0,-10,-20,-30,
  -30,-10, 20, 30, 30, 20,-10,-30,
  -30,-10, 30, 40, 40, 30,-10,-30,
  -30,-10, 30, 40, 40, 30,-10,-30,
  -30,-10, 20, 30, 30, 20,-10,-30,
  -30,-30,  0,  0,  0,  0,-30,-30,
  -50,-30,-30,-30,-30,-30,-30,-50,
]

// Detectare endgame (fără regine sau material redus)
function isEndgame(game: Chess): boolean {
  const board = game.board()
  let queens = 0
  let minors = 0
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file]
      if (!piece || piece.type === 'p' || piece.type === 'k') continue
      if (piece.type === 'q') queens++
      else minors++
    }
  }
  // Endgame: fără regine, sau fiecare parte are maxim regină + 1 piesă minoră
  return queens === 0 || (queens <= 2 && minors <= 2)
}

// Evaluare TSCP: material + PST + bonus pereche nebuni
function evaluate(game: Chess): number {
  const board = game.board()
  const turn = game.turn()
  const endgame = isEndgame(game)
  let score = 0
  let whiteBishops = 0
  let blackBishops = 0

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file]
      if (!piece) continue

      const idx = piece.color === 'w' ? rank * 8 + file : (7 - rank) * 8 + file

      // Tabel special pentru rege în endgame
      let positional: number
      if (piece.type === 'k' && endgame) {
        positional = PST_KING_ENDGAME[idx]
      } else {
        positional = PST[piece.type]?.[idx] ?? 0
      }

      const value = PIECE_VALUE[piece.type] + positional

      // Numărăm nebunii pentru bonus pereche
      if (piece.type === 'b') {
        if (piece.color === 'w') whiteBishops++
        else blackBishops++
      }

      score += piece.color === turn ? value : -value
    }
  }

  // Bonus pereche de nebuni (TSCP clasic: +30 centipioni)
  const myBishops = turn === 'w' ? whiteBishops : blackBishops
  const oppBishops = turn === 'w' ? blackBishops : whiteBishops
  if (myBishops >= 2) score += 30
  if (oppBishops >= 2) score -= 30

  return score
}

// MVV-LVA move ordering — sortează capturile: victimă valoroasă cu atacator ieftin primele
function orderMoves(moves: Move[]): Move[] {
  return moves.sort((a, b) => {
    let sa = 0, sb = 0

    // Capturi: scor MVV-LVA
    if (a.captured) sa += PIECE_VALUE[a.captured] * 10 - PIECE_VALUE[a.piece]
    if (b.captured) sb += PIECE_VALUE[b.captured] * 10 - PIECE_VALUE[b.piece]

    // Promoții
    if (a.promotion) sa += 900
    if (b.promotion) sb += 900

    // Șahuri — bonus mic
    if (a.san.includes('+')) sa += 50
    if (b.san.includes('+')) sb += 50

    return sb - sa
  })
}

// Quiescence search — continuă căutarea pe capturi pentru a evita horizon effect
function quiescence(game: Chess, alpha: number, beta: number): number {
  const stand = evaluate(game)
  if (stand >= beta) return beta
  if (stand > alpha) alpha = stand

  const captures = game.moves({ verbose: true }).filter(m => m.captured || m.promotion)
  const sorted = orderMoves(captures)

  for (const move of sorted) {
    game.move(move)
    const score = -quiescence(game, -beta, -alpha)
    game.undo()

    if (score >= beta) return beta
    if (score > alpha) alpha = score
  }
  return alpha
}

// Alpha-beta cu negamax — algoritmul central TSCP
function alphabeta(game: Chess, depth: number, alpha: number, beta: number): number {
  if (depth === 0) return quiescence(game, alpha, beta)
  if (game.isCheckmate()) return -99999
  if (game.isDraw()) return 0

  const moves = orderMoves(game.moves({ verbose: true }))

  for (const move of moves) {
    game.move(move)
    const score = -alphabeta(game, depth - 1, -beta, -alpha)
    game.undo()

    if (score >= beta) return beta  // beta cutoff
    if (score > alpha) alpha = score
  }
  return alpha
}

class TscpEngineImpl implements ChessEngine {
  name = 'TSCP'
  author = 'Tom Kerrigan'
  year = 1997
  description = 'Cel mai cunoscut motor educativ — alpha-beta cu iterative deepening'
  difficulty = [
    { label: 'Ușor (3 ply)', value: 3 },
    { label: 'Mediu (5 ply)', value: 5 },
    { label: 'Greu (7 ply)', value: 7 },
  ]

  async init(): Promise<void> {}

  async findBestMove(fen: string, maxDepth: number): Promise<string> {
    const game = new Chess(fen)
    const moves = orderMoves(game.moves({ verbose: true }))
    if (moves.length === 0) throw new Error('No legal moves')

    let bestMove = moves[0]

    // Iterative deepening: căutăm de la 1 la maxDepth
    // La fiecare adâncime, cea mai bună mutare devine prima candidată la adâncimea următoare
    for (let depth = 1; depth <= maxDepth; depth++) {
      let depthBestMove = moves[0]
      let depthBestScore = -Infinity

      for (const move of moves) {
        game.move(move)
        const score = -alphabeta(game, depth - 1, -Infinity, Infinity)
        game.undo()

        if (score > depthBestScore) {
          depthBestScore = score
          depthBestMove = move
        }
      }

      bestMove = depthBestMove

      // Mutăm cea mai bună mutare la începutul listei pentru adâncimea următoare
      // Asta îmbunătățește cutoff-urile alpha-beta la adâncimi mai mari
      const idx = moves.indexOf(bestMove)
      if (idx > 0) {
        moves.splice(idx, 1)
        moves.unshift(bestMove)
      }
    }

    return bestMove.from + bestMove.to + (bestMove.promotion || '')
  }

  destroy() {}
}

export const tscpEngine = new TscpEngineImpl()
