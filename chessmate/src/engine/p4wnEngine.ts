// p4wnEngine.ts — p4wn (2002) reimplementat în TypeScript
// Original: Douglas Bagnall — motor agresiv, public domain
// Stil: preferă atacul, face sacrificii când e în avantaj
// Algoritm: alpha-beta cu evaluare dinamică orientată pe atac

import { Chess, type Move } from 'chess.js'
import type { ChessEngine } from './engines'

// Valori piese (raport p4wn: pion=20, turn=100, cal=60, nebun=61, regină=180)
// Scalate la centipioni standard
const PIECE_VALUE: Record<string, number> = {
  p: 100, n: 300, b: 305, r: 500, q: 900, k: 10000,
}

// Bonus centralizare — calculat ca în p4wn: 6 - (dx²+dy²)^0.6
// Precalculat pentru fiecare pătrat (perspectiva albului, rank 0 = rândul 8)
function buildCentralWeights(): number[] {
  const w: number[] = []
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const dx = Math.abs(file - 3.5)
      const dy = Math.abs(rank - 3.5)
      w.push(Math.round((6 - Math.pow((dx * dx + dy * dy) * 1.5, 0.6)) * 8))
    }
  }
  return w
}

const CENTRAL = buildCentralWeights()

// Bonus cal — platou central ca în p4wn
function buildKnightWeights(): number[] {
  const w: number[] = []
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const dx = Math.abs(file - 3.5)
      const dy = Math.abs(rank - 3.5)
      const v = ((dx < 2 ? 1 : 0) + (dy < 2 ? 1.5 : 0) + (dx < 3 ? 1 : 0) + (dy < 3 ? 1 : 0)) - 2
      w.push(Math.round(v * 12))
    }
  }
  return w
}

const KNIGHT_POS = buildKnightWeights()

// Bonus pioni — avansare (perspectiva albului: rank 0 = rândul 8)
const PAWN_ADVANCE = [0, 0, 0, 5, 10, 20, 35, 70]

// Evaluare agresivă — stilul p4wn
// Favorează: piese active, atac spre rege, sacrificii când e în avantaj
function evaluate(game: Chess): number {
  const board = game.board()
  const turn = game.turn()
  let score = 0
  let myMaterial = 0
  let theirMaterial = 0
  let theirKingRank = 0, theirKingFile = 0

  // Prima trecere: material + găsește regele adversarului
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file]
      if (!piece) continue
      const val = PIECE_VALUE[piece.type]
      if (piece.color === turn) {
        myMaterial += val
      } else {
        theirMaterial += val
        if (piece.type === 'k') { theirKingRank = rank; theirKingFile = file }
      }
    }
  }

  // A doua trecere: evaluare completă
  const advantage = myMaterial - theirMaterial
  // p4wn devine mai agresiv când e în avantaj
  const attackBonus = advantage > 200 ? 1.5 : advantage > 0 ? 1.2 : 1.0

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file]
      if (!piece) continue

      const isMine = piece.color === turn
      const idx = piece.color === 'w' ? rank * 8 + file : (7 - rank) * 8 + file
      const pawnRank = piece.color === 'w' ? 7 - rank : rank
      let value = PIECE_VALUE[piece.type]

      // Bonus pozițional per tip piesă
      switch (piece.type) {
        case 'n':
          value += KNIGHT_POS[idx]
          break
        case 'b':
        case 'r':
        case 'q':
          value += CENTRAL[idx]
          break
        case 'p':
          value += PAWN_ADVANCE[pawnRank]
          break
        case 'k':
          break
      }

      // Bonus atac — piese apropiate de regele adversar (stilul p4wn)
      if (isMine && piece.type !== 'k' && piece.type !== 'p') {
        const dkr = Math.abs(rank - theirKingRank)
        const dkf = Math.abs(file - theirKingFile)
        const kingProximity = 7 - Math.max(dkr, dkf)
        value += Math.round(kingProximity * 3 * attackBonus)
      }

      score += isMine ? value : -value
    }
  }

  // Bonus mobilitate — p4wn apreciază opțiunile
  // Folosim numărul de mutări legale ca proxy
  score += game.moves().length * 2

  return score
}

// Sortare mutări — capturi și șahuri primele (face alpha-beta mai eficient)
function sortMoves(moves: Move[]): Move[] {
  return moves.sort((a, b) => {
    const scoreA = (a.captured ? PIECE_VALUE[a.captured] * 10 : 0) + (a.san.includes('+') ? 50 : 0)
    const scoreB = (b.captured ? PIECE_VALUE[b.captured] * 10 : 0) + (b.san.includes('+') ? 50 : 0)
    return scoreB - scoreA
  })
}

function minimax(game: Chess, depth: number, alpha: number, beta: number): number {
  if (depth === 0) return evaluate(game)
  if (game.isCheckmate()) return -99999
  if (game.isDraw()) return 0

  const moves = sortMoves(game.moves({ verbose: true }))
  for (const move of moves) {
    game.move(move)
    const score = -minimax(game, depth - 1, -beta, -alpha)
    game.undo()

    if (score >= beta) return beta
    if (score > alpha) alpha = score
  }
  return alpha
}

class P4wnEngineImpl implements ChessEngine {
  name = 'p4wn'
  author = 'Douglas Bagnall'
  year = 2002
  description = 'Motor agresiv — face sacrificii nesăbuite când e în avantaj'
  difficulty = [
    { label: 'Agresiv (4 ply)', value: 4 },
  ]

  async init(): Promise<void> {}

  async findBestMove(fen: string, depth: number): Promise<string> {
    const game = new Chess(fen)
    const moves = sortMoves(game.moves({ verbose: true }))
    if (moves.length === 0) throw new Error('No legal moves')

    let bestMove = moves[0]
    let bestScore = -Infinity

    for (const move of moves) {
      game.move(move)
      const score = -minimax(game, depth - 1, -Infinity, Infinity)
      game.undo()

      // p4wn adaugă puțină randomizare la scoruri egale
      if (score > bestScore || (score === bestScore && Math.random() < 0.3)) {
        bestScore = score
        bestMove = move
      }
    }

    return bestMove.from + bestMove.to + (bestMove.promotion || '')
  }

  destroy() {}
}

export const p4wnEngine = new P4wnEngineImpl()
