// stockfish.ts — Interfața cu motorul Stockfish
// Comunicăm prin mesaje text (protocol UCI) cu un Web Worker

type BestMoveCallback = (bestMove: string) => void

class StockfishEngine {
  private worker: Worker | null = null
  private onBestMove: BestMoveCallback | null = null

  // Pornește motorul
  init() {
    if (this.worker) return

    // Încărcăm Stockfish ca Web Worker din folderul public
    this.worker = new Worker('/stockfish.js')

    this.worker.onmessage = (e: MessageEvent) => {
      const line = typeof e.data === 'string' ? e.data : ''
      // Stockfish răspunde "bestmove e2e4" când a terminat de gândit
      if (line.startsWith('bestmove') && this.onBestMove) {
        const move = line.split(' ')[1]
        this.onBestMove(move)
        this.onBestMove = null
      }
    }

    // Inițializare UCI (protocolul standard de comunicare cu engine-uri)
    this.send('uci')
    this.send('isready')
  }

  // Trimite o comandă text la Stockfish
  private send(cmd: string) {
    this.worker?.postMessage(cmd)
  }

  // Cere cea mai bună mutare pentru o poziție
  // fen = poziția curentă, depth = cât de adânc gândește (mai mare = mai puternic)
  findBestMove(fen: string, depth: number, callback: BestMoveCallback) {
    if (!this.worker) {
      this.init()
    }
    this.onBestMove = callback
    this.send('position fen ' + fen)
    this.send('go depth ' + depth)
  }

  // Oprește motorul
  destroy() {
    this.worker?.terminate()
    this.worker = null
  }
}

// O singură instanță partajată în toată aplicația
const engine = new StockfishEngine()
export default engine
