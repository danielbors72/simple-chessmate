// spectrumEngine.ts — Inspirat de 1K ZX Chess (David Horne, 1982)
// Original: 672 bytes Z80 Assembly pe ZX81 cu 1KB RAM
// Algoritm: search 2-ply, evaluare doar material — exact cum gândea un ZX81
// Reimplementare educațională — "cum juca un calculator cu 1KB de memorie"

import { Chess } from 'chess.js'
import type { ChessEngine } from './engines'

// Valori piese — simplificate ca pe ZX81 (fără zecimale, fără nuanțe)
const PIECE_VALUE: Record<string, number> = {
  p: 1, n: 3, b: 3, r: 5, q: 9, k: 100,
}

// Evaluare ultra-simplă: material + bonus minimal centru
// ZX81 avea o preferință rudimentară pentru controlul centrului
function evaluate(game: Chess): number {
  const board = game.board()
  const turn = game.turn()
  let score = 0

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file]
      if (!piece) continue
      let val = PIECE_VALUE[piece.type]
      // Bonus minimal centru — 3-4 bytes pe ZX81 pentru asta
      if (piece.type !== 'k') {
        const dc = Math.abs(file - 3.5) + Math.abs(rank - 3.5)
        val += (7 - dc) * 0.05
      }
      score += piece.color === turn ? val : -val
    }
  }
  return score
}

// Search 2-ply — un singur nivel de "gândire" + răspuns adversar
// ZX81 nu avea putere pentru mai mult
function search2ply(game: Chess): { move: string; score: number } {
  const moves = game.moves({ verbose: true })
  if (moves.length === 0) throw new Error('No legal moves')

  let bestMove = moves[0]
  let bestScore = -Infinity

  for (const move of moves) {
    game.move(move)

    let score: number
    if (game.isCheckmate()) {
      score = 999
    } else if (game.isDraw()) {
      score = 0
    } else {
      // Ply 2: adversarul răspunde cu cea mai bună mutare
      const responses = game.moves({ verbose: true })
      let worstResponse = Infinity
      for (const resp of responses) {
        game.move(resp)
        // Evaluăm din perspectiva noastră (negăm)
        const respScore = -evaluate(game)
        game.undo()
        if (respScore < worstResponse) worstResponse = respScore
      }
      score = responses.length > 0 ? worstResponse : evaluate(game)
    }

    game.undo()

    // Pe ZX81 — dacă scoruri egale, ia prima mutare găsită (fără random)
    // Asta dădea un stil previzibil și "mecanic"
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }

  return { move: bestMove.from + bestMove.to + (bestMove.promotion || ''), score: bestScore }
}

class SpectrumEngineImpl implements ChessEngine {
  name = '1K ZX Chess'
  author = 'David Horne'
  year = 1982
  description = '672 bytes pe ZX81 — doar material, search 2-ply'
  difficulty = [
    { label: '1KB (2 ply)', value: 2 },
  ]

  async init(): Promise<void> {}

  async findBestMove(fen: string): Promise<string> {
    const game = new Chess(fen)
    const result = search2ply(game)
    return result.move
  }

  destroy() {}
}

export const spectrumEngine = new SpectrumEngineImpl()
