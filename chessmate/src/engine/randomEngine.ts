// randomEngine.ts — Motor trivial: alege o mutare legală la întâmplare
// Util pentru testare și ca adversar relaxat

import { Chess } from 'chess.js'
import type { ChessEngine } from './engines'

class RandomEngineImpl implements ChessEngine {
  name = 'Random'
  author = 'ChessMate'
  year = 2026
  description = 'Alege o mutare la întâmplare — pentru relaxare'
  difficulty = [
    { label: 'Aleatoriu', value: 0 },
  ]

  async init(): Promise<void> {
    // Nu necesită inițializare
  }

  async findBestMove(fen: string): Promise<string> {
    const game = new Chess(fen)
    const moves = game.moves({ verbose: true })
    if (moves.length === 0) throw new Error('No legal moves')

    const move = moves[Math.floor(Math.random() * moves.length)]
    // Returnăm în format UCI: "e2e4" sau "e7e8q" (cu promoție)
    return move.from + move.to + (move.promotion || '')
  }

  destroy() {
    // Nu are resurse de eliberat
  }
}

export const randomEngine = new RandomEngineImpl()
