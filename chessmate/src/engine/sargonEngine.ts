// sargonEngine.ts — Inspirat de Sargon I (Dan & Kathe Spracklen, 1977)
// Primul program de șah comercial de succes pentru microcomputere
// A învins un supercalculator Amdahl 470 în 1978!
// Algoritm: alpha-beta 2-ply + SOMA exchange evaluation (Swapping Off Material Analyzer)

import { Chess } from 'chess.js'
import type { ChessEngine } from './engines'

// Valori piese — stilul Sargon (identice cu standardul)
const PIECE_VALUE: Record<string, number> = {
  p: 100, n: 300, b: 300, r: 500, q: 900, k: 10000,
}

// Limită noduri pentru a preveni blocarea main thread-ului
const MAX_NODES = 50_000
let nodeCount = 0
let searchAborted = false

// Evaluare Sargon: material + controlul centrului
// SOMA original (game.moves() la fiecare frunză) eliminat — prea scump pentru browser
function evaluate(game: Chess): number {
  const board = game.board()
  const turn = game.turn()
  let score = 0

  // Material simplu
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file]
      if (!piece) continue
      const val = PIECE_VALUE[piece.type]
      score += piece.color === turn ? val : -val
    }
  }

  // Bonus mic pentru controlul centrului (Sargon I avea asta rudimentar)
  const center = ['d4', 'd5', 'e4', 'e5']
  for (const sq of center) {
    const piece = game.get(sq as any)
    if (piece) {
      score += piece.color === turn ? 10 : -10
    }
  }

  return score
}

// Alpha-beta 2-ply — exact ca Sargon I
function alphabeta(game: Chess, depth: number, alpha: number, beta: number): number {
  if (searchAborted) return 0

  nodeCount++
  if (nodeCount > MAX_NODES) {
    searchAborted = true
    return 0
  }

  if (depth === 0) return evaluate(game)
  if (game.isCheckmate()) return -99999
  if (game.isDraw()) return 0

  const moves = game.moves({ verbose: true })

  // Sargon ordona capturile primele
  moves.sort((a, b) => {
    const sa = a.captured ? PIECE_VALUE[a.captured] : 0
    const sb = b.captured ? PIECE_VALUE[b.captured] : 0
    return sb - sa
  })

  for (const move of moves) {
    if (searchAborted) return alpha
    game.move(move)
    const score = -alphabeta(game, depth - 1, -beta, -alpha)
    game.undo()

    if (score >= beta) return beta
    if (score > alpha) alpha = score
  }
  return alpha
}

class SargonEngineImpl implements ChessEngine {
  name = 'Sargon I'
  author = 'Dan & Kathe Spracklen'
  year = 1977
  description = 'Primul motor comercial — a învins un supercalculator în 1978'
  difficulty = [
    { label: 'Original (3 ply)', value: 3 },
  ]

  async init(): Promise<void> {}

  async findBestMove(fen: string, depth: number): Promise<string> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          nodeCount = 0
          searchAborted = false

          const game = new Chess(fen)
          const moves = game.moves({ verbose: true })
          if (moves.length === 0) throw new Error('No legal moves')

          // Sortare inițială — capturi primele
          moves.sort((a, b) => {
            const sa = a.captured ? PIECE_VALUE[a.captured] : 0
            const sb = b.captured ? PIECE_VALUE[b.captured] : 0
            return sb - sa
          })

          let bestMove = moves[0]
          let bestScore = -Infinity

          for (const move of moves) {
            if (searchAborted) break
            game.move(move)
            const score = -alphabeta(game, depth - 1, -Infinity, Infinity)
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

export const sargonEngine = new SargonEngineImpl()
