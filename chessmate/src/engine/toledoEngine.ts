// toledoEngine.ts — Toledo Nanochess (2005) reimplementat în TypeScript
// Original: Oscar Toledo Gutiérrez — cel mai mic motor de șah funcțional din lume
// Algoritm: minimax cu alpha-beta pruning, ~4 ply, evaluare material + pozițional
// Folosim chess.js doar pentru validarea mutărilor, AI-ul e propriu

import { Chess } from 'chess.js'
import type { ChessEngine } from './engines'

// Valori piese Toledo: pion=100, cal=300, nebun=350, turn=500, regină=900, rege=10000
const PIECE_VALUE: Record<string, number> = {
  p: 100, n: 300, b: 350, r: 500, q: 900, k: 10000,
}

// Tabele poziționale simplificate (bonus centru + avansare pioni)
// Toledo folosea o formulă bazată pe zona tablei — noi o aproximăm cu tabele mici
const CENTER_BONUS: Record<string, number[]> = {
  p: [
     0,  0,  0,  0,  0,  0,  0,  0,
     5, 10, 10,-20,-20, 10, 10,  5,
     5, -5,-10,  0,  0,-10, -5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5,  5, 10, 25, 25, 10,  5,  5,
    10, 10, 20, 30, 30, 20, 10, 10,
    50, 50, 50, 50, 50, 50, 50, 50,
     0,  0,  0,  0,  0,  0,  0,  0,
  ],
  n: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
  ],
  b: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
  ],
  r: [
     0,  0,  0,  5,  5,  0,  0,  0,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     5, 10, 10, 10, 10, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0,
  ],
  q: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -10,  5,  5,  5,  5,  5,  0,-10,
      0,  0,  5,  5,  5,  5,  0, -5,
     -5,  0,  5,  5,  5,  5,  0, -5,
    -10,  0,  5,  5,  5,  5,  0,-10,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20,
  ],
  k: [
     20, 30, 10,  0,  0, 10, 30, 20,
     20, 20,  0,  0,  0,  0, 20, 20,
    -10,-20,-20,-20,-20,-20,-20,-10,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
  ],
}

// Evaluare statică a poziției (din perspectiva celui la mutare)
function evaluate(game: Chess): number {
  const board = game.board()
  const turn = game.turn()
  let score = 0

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file]
      if (!piece) continue

      const value = PIECE_VALUE[piece.type]
      // Index în tabelul pozițional — alb vede tabla normal, negru oglindit
      const idx = piece.color === 'w' ? rank * 8 + file : (7 - rank) * 8 + file
      const positional = CENTER_BONUS[piece.type]?.[idx] ?? 0
      const total = value + positional

      score += piece.color === turn ? total : -total
    }
  }
  return score
}

// Limită noduri pentru a preveni blocarea main thread-ului
const MAX_NODES = 80_000
let nodeCount = 0
let searchAborted = false

// Minimax cu alpha-beta pruning — algoritmul central Toledo
function minimax(game: Chess, depth: number, alpha: number, beta: number): number {
  if (searchAborted) return 0

  nodeCount++
  if (nodeCount > MAX_NODES) {
    searchAborted = true
    return 0
  }

  if (depth === 0) return evaluate(game)

  if (game.isCheckmate()) return -99999
  if (game.isDraw()) return 0

  const moves = game.moves()
  for (const move of moves) {
    if (searchAborted) return alpha
    game.move(move)
    const score = -minimax(game, depth - 1, -beta, -alpha)
    game.undo()

    if (score >= beta) return beta  // beta cutoff
    if (score > alpha) alpha = score
  }
  return alpha
}

class ToledoEngineImpl implements ChessEngine {
  name = 'Toledo Nanochess'
  author = 'Oscar Toledo Gutiérrez'
  year = 2005
  description = 'Cel mai mic motor de șah din lume — minimax clasic'
  difficulty = [
    { label: 'Original (4 ply)', value: 4 },
  ]

  async init(): Promise<void> {}

  async findBestMove(fen: string, depth: number): Promise<string> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const game = new Chess(fen)
          const moves = game.moves({ verbose: true })
          if (moves.length === 0) throw new Error('No legal moves')

          nodeCount = 0
          searchAborted = false

          let bestMove = moves[0]
          let bestScore = -Infinity

          for (const move of moves) {
            if (searchAborted) break
            game.move(move)
            const score = -minimax(game, depth - 1, -Infinity, Infinity)
            game.undo()

            if (score > bestScore) {
              bestScore = score
              bestMove = move
            }
          }

          resolve(bestMove.from + bestMove.to + (bestMove.promotion || ''))
        } catch (e) {
          reject(e)
        }
      }, 0)
    })
  }

  destroy() {}
}

export const toledoEngine = new ToledoEngineImpl()
