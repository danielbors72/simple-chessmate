// microchessEngine.ts — Inspirat de Microchess (Peter Jennings, 1976)
// Primul joc comercial vândut pe microcomputer — KIM-1, 924 bytes, 6502 Assembly
// 50.000+ copii vândute prin poștă — a pornit industria jocurilor pe microcomputer
// Algoritm: 1-ply search, evaluare pur materială, preferă capturi favorabile

import { Chess } from 'chess.js'
import type { ChessEngine } from './engines'

// Valori piese — identice cu standardul anilor '70
const PIECE_VALUE: Record<string, number> = {
  p: 100, n: 300, b: 300, r: 500, q: 900, k: 10000,
}

// Evaluare Microchess: doar material — nicio tabelă pozițională
// Originalul de 924 bytes nu avea loc pentru PST
function evaluate(game: Chess): number {
  const board = game.board()
  const turn = game.turn()
  let score = 0

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file]
      if (!piece) continue
      score += piece.color === turn ? PIECE_VALUE[piece.type] : -PIECE_VALUE[piece.type]
    }
  }

  return score
}

// Scorare mutări — Microchess preferă capturi bune și mutări spre centru
function scoreMove(move: { from: string; to: string; captured?: string; piece: string }): number {
  let score = 0

  // Capturi: valoare victimă - valoare atacator (schimburi favorabile)
  if (move.captured) {
    score += PIECE_VALUE[move.captured] - PIECE_VALUE[move.piece] / 10
  }

  // Mic bonus pentru mutări spre centrul tablei (aproximare primitivă)
  const toFile = move.to.charCodeAt(0) - 97 // 0-7
  const toRank = parseInt(move.to[1]) - 1    // 0-7
  const centerDist = Math.abs(3.5 - toFile) + Math.abs(3.5 - toRank)
  score += (7 - centerDist) * 2

  return score
}

class MicrochessEngineImpl implements ChessEngine {
  name = 'Microchess'
  author = 'Peter Jennings'
  year = 1976
  description = 'Primul joc comercial pe microcomputer — 924 bytes pe KIM-1'
  difficulty = [
    { label: 'Original (1 ply)', value: 1 },
  ]

  async init(): Promise<void> {}

  async findBestMove(fen: string, _depth: number): Promise<string> {
    const game = new Chess(fen)
    const moves = game.moves({ verbose: true })
    if (moves.length === 0) throw new Error('No legal moves')

    // 1-ply search: evaluează fiecare mutare la adâncime 1
    let bestMove = moves[0]
    let bestScore = -Infinity

    for (const move of moves) {
      game.move(move)

      // Scor = evaluare poziție rezultată + bonus tip mutare
      let score = -evaluate(game)

      // Bonus suplimentar pentru capturi și centralizare (ca la Microchess original)
      score += scoreMove(move) * 0.5

      // Penalizare dacă mutarea ne pune în pericol (verificare simplă)
      if (game.inCheck()) score += 50 // am dat șah = bine

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

export const microchessEngine = new MicrochessEngineImpl()
