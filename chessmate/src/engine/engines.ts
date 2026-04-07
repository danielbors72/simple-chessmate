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
import { microchessEngine } from './microchessEngine'
import { sargonEngine } from './sargonEngine'
import { spectrumEngine } from './spectrumEngine'
import { tscpEngine } from './tscpEngine'
import { p4wnEngine } from './p4wnEngine'
import { toledoEngine } from './toledoEngine'
import { microMaxEngine } from './microMaxEngine'
import { randomEngine } from './randomEngine'

// Registrul motoarelor — ordinea cronologică = ordinea în UI
export const ENGINES: ChessEngine[] = [
  stockfishEngine,
  microchessEngine,
  sargonEngine,
  spectrumEngine,
  tscpEngine,
  p4wnEngine,
  toledoEngine,
  microMaxEngine,
  randomEngine,
]

// Engine-ul implicit
export const DEFAULT_ENGINE = stockfishEngine
