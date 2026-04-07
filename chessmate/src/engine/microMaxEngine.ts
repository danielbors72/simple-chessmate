// microMaxEngine.ts — Micro-Max (2005) reimplementat în TypeScript
// Original: H.G. Muller — cel mai mic motor C cu tehnici avansate
// Algoritm: negamax + alpha-beta + quiescence search + hash-like move ordering
// Reprezentare: folosim chess.js, dar evaluarea urmează stilul 0x88 al lui Muller

import { Chess, type Move } from 'chess.js'
import type { ChessEngine } from './engines'

// Valori piese Micro-Max (standard centipioni)
const PIECE_VALUE: Record<string, number> = {
  p: 100, n: 325, b: 350, r: 500, q: 975, k: 10000,
}

// Piece-square tables — Micro-Max calculează prin distanța față de centru
// Noi precalculăm tabelele în stilul 0x88 al lui Muller
const PST: Record<string, number[]> = {
  p: [
     0,  0,  0,  0,  0,  0,  0,  0,
     2,  4,  4,-10,-10,  4,  4,  2,
     2, -2, -5,  5,  5, -5, -2,  2,
     0,  0,  0, 18, 18,  0,  0,  0,
     2,  2,  8, 22, 22,  8,  2,  2,
     4,  8, 16, 28, 28, 16,  8,  4,
    50, 50, 50, 50, 50, 50, 50, 50,
     0,  0,  0,  0,  0,  0,  0,  0,
  ],
  n: [
    -40,-25,-20,-20,-20,-20,-25,-40,
    -25,-10,  0,  5,  5,  0,-10,-25,
    -20,  0, 12, 16, 16, 12,  0,-20,
    -20,  5, 16, 20, 20, 16,  5,-20,
    -20,  5, 16, 20, 20, 16,  5,-20,
    -20,  0, 12, 16, 16, 12,  0,-20,
    -25,-10,  0,  5,  5,  0,-10,-25,
    -40,-25,-20,-20,-20,-20,-25,-40,
  ],
  b: [
    -15, -5, -5, -5, -5, -5, -5,-15,
     -5,  8,  0,  0,  0,  0,  8, -5,
     -5,  0,  8,  6,  6,  8,  0, -5,
     -5,  4,  4, 10, 10,  4,  4, -5,
     -5,  0,  8, 10, 10,  8,  0, -5,
     -5,  6,  6,  6,  6,  6,  6, -5,
     -5,  4,  0,  0,  0,  0,  4, -5,
    -15, -5, -5, -5, -5, -5, -5,-15,
  ],
  r: [
     0,  0,  4,  8,  8,  4,  0,  0,
    -4,  0,  0,  0,  0,  0,  0, -4,
    -4,  0,  0,  0,  0,  0,  0, -4,
    -4,  0,  0,  0,  0,  0,  0, -4,
    -4,  0,  0,  0,  0,  0,  0, -4,
    -4,  0,  0,  0,  0,  0,  0, -4,
     4,  8,  8,  8,  8,  8,  8,  4,
     0,  0,  4,  8,  8,  4,  0,  0,
  ],
  q: [
    -15, -5, -5, -2, -2, -5, -5,-15,
     -5,  0,  2,  0,  0,  0,  0, -5,
     -5,  2,  4,  4,  4,  4,  2, -5,
     -2,  0,  4,  5,  5,  4,  0, -2,
     -2,  0,  4,  5,  5,  4,  0, -2,
     -5,  0,  4,  4,  4,  4,  0, -5,
     -5,  0,  0,  0,  0,  0,  0, -5,
    -15, -5, -5, -2, -2, -5, -5,-15,
  ],
  k: [
     15, 25,  5,  0,  0,  5, 25, 15,
     15, 15,  0, -5, -5,  0, 15, 15,
    -10,-15,-20,-20,-20,-20,-15,-10,
    -20,-25,-25,-30,-30,-25,-25,-20,
    -30,-35,-35,-40,-40,-35,-35,-30,
    -30,-35,-35,-40,-40,-35,-35,-30,
    -30,-35,-35,-40,-40,-35,-35,-30,
    -30,-35,-35,-40,-40,-35,-35,-30,
  ],
}

// Evaluare statică — stilul Micro-Max: material + PST + penalizări structurale
function evaluate(game: Chess): number {
  const board = game.board()
  const turn = game.turn()
  let score = 0

  // Detectăm pioni dubli (penalizare Micro-Max)
  const pawnFiles = { w: new Array(8).fill(0), b: new Array(8).fill(0) }

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file]
      if (!piece) continue

      const idx = piece.color === 'w' ? rank * 8 + file : (7 - rank) * 8 + file
      let value = PIECE_VALUE[piece.type] + (PST[piece.type]?.[idx] ?? 0)

      // Penalizare pioni dubli
      if (piece.type === 'p') {
        pawnFiles[piece.color][file]++
        if (pawnFiles[piece.color][file] > 1) value -= 15
      }

      score += piece.color === turn ? value : -value
    }
  }

  return score
}

// MVV-LVA move ordering (Most Valuable Victim - Least Valuable Attacker)
// Tehnica folosită de Micro-Max pentru cutoff-uri alpha-beta mai rapide
function orderMoves(moves: Move[]): Move[] {
  return moves.sort((a, b) => {
    let sa = 0, sb = 0
    // Capturi: scor = valoare victimă - valoare atacator/10
    if (a.captured) sa += PIECE_VALUE[a.captured] * 10 - PIECE_VALUE[a.piece]
    if (b.captured) sb += PIECE_VALUE[b.captured] * 10 - PIECE_VALUE[b.piece]
    // Promoții
    if (a.promotion) sa += 800
    if (b.promotion) sb += 800
    // Șahuri
    if (a.san.includes('+')) sa += 60
    if (b.san.includes('+')) sb += 60
    return sb - sa
  })
}

// Quiescence search — continuă căutarea doar pe capturi
// Tehnica cheie a lui Micro-Max: evită "horizon effect"
function quiescence(game: Chess, alpha: number, beta: number): number {
  const stand = evaluate(game)
  if (stand >= beta) return beta
  if (stand > alpha) alpha = stand

  const captures = game.moves({ verbose: true }).filter(m => m.captured)
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

// Negamax cu alpha-beta + quiescence — algoritmul central Micro-Max
function negamax(game: Chess, depth: number, alpha: number, beta: number): number {
  if (depth === 0) return quiescence(game, alpha, beta)
  if (game.isCheckmate()) return -99999
  if (game.isDraw()) return 0

  const moves = orderMoves(game.moves({ verbose: true }))
  for (const move of moves) {
    game.move(move)
    const score = -negamax(game, depth - 1, -beta, -alpha)
    game.undo()

    if (score >= beta) return beta
    if (score > alpha) alpha = score
  }
  return alpha
}

class MicroMaxEngineImpl implements ChessEngine {
  name = 'Micro-Max'
  author = 'H.G. Muller'
  year = 2005
  description = '2000 caractere C — negamax cu quiescence search'
  difficulty = [
    { label: 'Standard (4 ply)', value: 4 },
  ]

  async init(): Promise<void> {}

  async findBestMove(fen: string, depth: number): Promise<string> {
    const game = new Chess(fen)
    const moves = orderMoves(game.moves({ verbose: true }))
    if (moves.length === 0) throw new Error('No legal moves')

    let bestMove = moves[0]
    let bestScore = -Infinity

    for (const move of moves) {
      game.move(move)
      const score = -negamax(game, depth - 1, -Infinity, Infinity)
      game.undo()

      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }

    return bestMove.from + bestMove.to + (bestMove.promotion || '')
  }

  destroy() {}
}

export const microMaxEngine = new MicroMaxEngineImpl()
