// engines.ts — Interfață comună + registru pentru toate motoarele de șah
// Orice motor nou trebuie să implementeze ChessEngine și să fie adăugat în ENGINES

export interface ChessEngine {
  name: string
  author: string
  year: number
  description: string  // scurt, în română
  difficulty: { label: string; value: number }[]  // nivelele disponibile
  init(): Promise<void>
  findBestMove(fen: string, level: number): Promise<string>
  destroy(): void
}

// Importăm motoarele disponibile (lazy — fiecare fișier exportă o instanță)
import { stockfishEngine } from './stockfishEngine'
import { randomEngine } from './randomEngine'

// Registrul motoarelor — ordinea din array = ordinea în UI
export const ENGINES: ChessEngine[] = [
  stockfishEngine,
  randomEngine,
]

// Engine-ul implicit
export const DEFAULT_ENGINE = stockfishEngine
