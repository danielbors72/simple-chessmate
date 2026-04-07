// stockfishEngine.ts — Stockfish 18 via Web Worker (protocol UCI)
// Motorul principal, cel mai puternic — folosit implicit

import type { ChessEngine } from './engines'

class StockfishEngineImpl implements ChessEngine {
  name = 'Stockfish 18'
  author = 'Tord Romstad, Marco Costalba, Joona Kiiski et al.'
  year = 2024
  description = 'Cel mai puternic motor open-source din lume'
  difficulty = [
    { label: 'Ușor', value: 3 },
    { label: 'Mediu', value: 8 },
    { label: 'Greu', value: 15 },
  ]

  private worker: Worker | null = null

  async init(): Promise<void> {
    if (this.worker) return

    this.worker = new Worker('/stockfish.js')

    // Așteptăm ca Stockfish să fie gata
    await new Promise<void>((resolve) => {
      const handler = (e: MessageEvent) => {
        if (typeof e.data === 'string' && e.data.includes('readyok')) {
          this.worker!.removeEventListener('message', handler)
          resolve()
        }
      }
      this.worker!.addEventListener('message', handler)
      this.send('uci')
      this.send('isready')
    })
  }

  private send(cmd: string) {
    this.worker?.postMessage(cmd)
  }

  findBestMove(fen: string, depth: number): Promise<string> {
    return new Promise((resolve) => {
      if (!this.worker) throw new Error('Stockfish not initialized')

      const handler = (e: MessageEvent) => {
        const line = typeof e.data === 'string' ? e.data : ''
        if (line.startsWith('bestmove')) {
          this.worker!.removeEventListener('message', handler)
          resolve(line.split(' ')[1])
        }
      }
      this.worker.addEventListener('message', handler)
      this.send('position fen ' + fen)
      this.send('go depth ' + depth)
    })
  }

  destroy() {
    this.worker?.terminate()
    this.worker = null
  }
}

export const stockfishEngine = new StockfishEngineImpl()
