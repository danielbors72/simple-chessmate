// puzzleData.ts — Colecția de puzzle-uri tactice (verificate cu chess.js)
// Fiecare puzzle: poziție FEN + soluție (secvență mutări UCI)
// Mutările alternează: jucător, adversar, jucător...

export type TacticType = 'fork' | 'pin' | 'skewer' | 'mate1' | 'mate2'
export type Difficulty = 1 | 2 | 3  // 1=ușor, 2=mediu, 3=greu

export type Puzzle = {
  id: number
  fen: string           // Poziția de start
  solution: string[]    // Mutări UCI: ["e2e4", "d7d5", "e4d5"]
  type: TacticType      // Tipul tacticii
  difficulty: Difficulty
  title: string         // Descriere scurtă în română
}

// ════════════════════════════════════════════
// MAT ÎN 1 — o singură mutare câștigătoare
// ════════════════════════════════════════════

const mate1Puzzles: Puzzle[] = [
  {
    id: 1,
    fen: '6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1',
    solution: ['e1e8'],
    type: 'mate1',
    difficulty: 1,
    title: 'Mat pe ultima linie cu tura',
  },
  {
    id: 2,
    fen: '6k1/5ppp/8/8/8/8/6Q1/6K1 w - - 0 1',
    solution: ['g2a8'],
    type: 'mate1',
    difficulty: 1,
    title: 'Dama pe a8 — diagonala mortală',
  },
  {
    id: 3,
    fen: '6k1/pppp1ppp/8/8/8/8/PPPPQPPP/6K1 w - - 0 1',
    solution: ['e2e8'],
    type: 'mate1',
    difficulty: 1,
    title: 'Dama străpunge pe linia 8',
  },
  {
    id: 4,
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
    solution: ['f3f7'],
    type: 'mate1',
    difficulty: 1,
    title: 'Matul ciobanului — Scholar\'s Mate',
  },
  {
    id: 5,
    fen: '6k1/5ppp/8/8/1B6/8/5PPP/R5K1 w - - 0 1',
    solution: ['a1a8'],
    type: 'mate1',
    difficulty: 1,
    title: 'Tura pe linia 8, nebunul blochează fuga',
  },
  {
    id: 6,
    fen: '6rk/6pp/7N/8/8/8/8/6K1 w - - 0 1',
    solution: ['h6f7'],
    type: 'mate1',
    difficulty: 2,
    title: 'Mat sufocat cu calul',
  },
  {
    id: 7,
    fen: '2k5/8/2K5/8/8/8/8/R7 w - - 0 1',
    solution: ['a1a8'],
    type: 'mate1',
    difficulty: 1,
    title: 'Rege + tură — mat pe coloana a',
  },
  {
    id: 8,
    fen: 'k7/2R5/1K6/8/8/8/8/8 w - - 0 1',
    solution: ['c7c8'],
    type: 'mate1',
    difficulty: 1,
    title: 'Tura închide pe linia 8',
  },
  {
    id: 9,
    fen: '3k4/R7/3K4/8/8/8/8/8 w - - 0 1',
    solution: ['a7a8'],
    type: 'mate1',
    difficulty: 1,
    title: 'Opoziție + tură = mat',
  },
  {
    id: 10,
    fen: '6k1/4Rppp/8/8/8/8/5PPP/6K1 w - - 0 1',
    solution: ['e7e8'],
    type: 'mate1',
    difficulty: 1,
    title: 'Tura de pe linia 7 urcă pe 8',
  },
  {
    id: 11,
    fen: 'k1K5/8/8/8/8/8/8/R7 w - - 0 1',
    solution: ['c8c7'],
    type: 'mate1',
    difficulty: 1,
    title: 'Regele taie fuga, tura dă mat',
  },
  {
    id: 12,
    fen: '1k6/8/1K6/8/8/8/8/7R w - - 0 1',
    solution: ['h1h8'],
    type: 'mate1',
    difficulty: 1,
    title: 'Tura pe h8 — mat la distanță',
  },
  {
    id: 13,
    fen: '7k/5Q1P/8/8/8/8/8/6K1 w - - 0 1',
    solution: ['f7g8'],
    type: 'mate1',
    difficulty: 2,
    title: 'Dama și pionul — mat în colț',
  },
  {
    id: 14,
    fen: '5k2/4Q3/5K2/8/8/8/8/8 w - - 0 1',
    solution: ['e7d8'],
    type: 'mate1',
    difficulty: 1,
    title: 'Dama pe d8 — rege fără scăpare',
  },
]

// ════════════════════════════════════════════
// MAT ÎN 2 — sacrificiu de damă + mat sufocat cu calul
// Pattern: Dg8+ Txg8 Cf7# (tura blochează fuga regelui)
// ════════════════════════════════════════════

const mate2Puzzles: Puzzle[] = [
  {
    id: 15,
    fen: '5r1k/6pp/8/4N3/8/8/Q5PP/6K1 w - - 0 1',
    solution: ['a2g8', 'f8g8', 'e5f7'],
    type: 'mate2',
    difficulty: 2,
    title: 'Sacrificiu de damă → mat sufocat cu calul',
  },
  {
    id: 16,
    fen: '5r1k/6pp/8/6N1/8/8/Q5PP/6K1 w - - 0 1',
    solution: ['a2g8', 'f8g8', 'g5f7'],
    type: 'mate2',
    difficulty: 2,
    title: 'Dama se sacrifică pe g8, calul finalizează',
  },
  {
    id: 17,
    fen: '5r1k/6pp/8/4N3/2Q5/8/6PP/6K1 w - - 0 1',
    solution: ['c4g8', 'f8g8', 'e5f7'],
    type: 'mate2',
    difficulty: 2,
    title: 'Dama de pe c4 — sacrificiu regal',
  },
  {
    id: 18,
    fen: '5r1k/6pp/8/3QN3/8/8/6PP/6K1 w - - 0 1',
    solution: ['d5g8', 'f8g8', 'e5f7'],
    type: 'mate2',
    difficulty: 2,
    title: 'Dama traversează diagonala spre g8',
  },
  {
    id: 19,
    fen: '5r1k/6pp/4Q3/4N3/8/8/6PP/6K1 w - - 0 1',
    solution: ['e6g8', 'f8g8', 'e5f7'],
    type: 'mate2',
    difficulty: 2,
    title: 'De pe e6 — damă pe g8, cal pe f7',
  },
  {
    id: 20,
    fen: '5r1k/6pp/8/4N3/8/1Q6/6PP/6K1 w - - 0 1',
    solution: ['b3g8', 'f8g8', 'e5f7'],
    type: 'mate2',
    difficulty: 2,
    title: 'Diagonala lungă — sacrificiu pe g8',
  },
  {
    id: 21,
    fen: '5r1k/6pp/8/6N1/8/1Q6/6PP/6K1 w - - 0 1',
    solution: ['b3g8', 'f8g8', 'g5f7'],
    type: 'mate2',
    difficulty: 2,
    title: 'Cal pe g5 — varianta cu diagonala lungă',
  },
  {
    id: 22,
    fen: '5r1k/6pp/7N/8/8/8/Q5PP/6K1 w - - 0 1',
    solution: ['a2g8', 'f8g8', 'h6f7'],
    type: 'mate2',
    difficulty: 2,
    title: 'Cal pe h6 sare pe f7 — mat elegant',
  },
]

// ════════════════════════════════════════════
// FORK / Furculiță — ataci 2+ piese simultan
// ════════════════════════════════════════════

const forkPuzzles: Puzzle[] = [
  {
    id: 23,
    fen: 'r1bqkb1r/pppppppp/2n2n2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 1',
    solution: ['d4d5'],
    type: 'fork',
    difficulty: 1,
    title: 'Pion central atacă doi cai',
  },
  {
    id: 24,
    fen: 'r3k2r/ppp2ppp/2n5/3q4/8/2N5/PPPN1PPP/R2QKB1R w KQkq - 0 1',
    solution: ['c3d5'],
    type: 'fork',
    difficulty: 1,
    title: 'Calul atacă dama din centru',
  },
  {
    id: 25,
    fen: 'r2qk2r/ppp2ppp/2n1b3/3pN3/3P4/8/PPP2PPP/R1BQKB1R w KQkq - 0 1',
    solution: ['e5c6'],
    type: 'fork',
    difficulty: 1,
    title: 'Cal pe c6 — furculiță pe dama și tura',
  },
  {
    id: 26,
    fen: '2r1k3/pp3ppp/4p3/3pN3/8/8/PPP2PPP/2KR4 w - - 0 1',
    solution: ['e5f7'],
    type: 'fork',
    difficulty: 2,
    title: 'Calul pe f7 — furculiță rege + tură',
  },
  {
    id: 27,
    fen: 'r3kb1r/ppp1pppp/2n2n2/3q4/3P4/4BN2/PPP2PPP/RN1QKB1R w KQkq - 0 1',
    solution: ['f3g5'],
    type: 'fork',
    difficulty: 2,
    title: 'Cal pe g5 — atacă dama și f7',
  },
  {
    id: 28,
    fen: '2q1k3/8/8/1N6/8/8/8/4K3 w - - 0 1',
    solution: ['b5d6'],
    type: 'fork',
    difficulty: 1,
    title: 'Cal pe d6 — furculiță rege + damă',
  },
  {
    id: 29,
    fen: 'r3k3/8/8/1N6/8/8/8/4K3 w - - 0 1',
    solution: ['b5c7'],
    type: 'fork',
    difficulty: 1,
    title: 'Cal pe c7+ — furculiță rege + tură',
  },
  {
    id: 30,
    fen: '3q4/4k3/8/4N3/8/8/8/4K3 w - - 0 1',
    solution: ['e5c6'],
    type: 'fork',
    difficulty: 1,
    title: 'Cal pe c6 — furculiță rege + damă',
  },
]

// ════════════════════════════════════════════
// PIN / Legare — o piesă imobilizată
// ════════════════════════════════════════════

const pinPuzzles: Puzzle[] = [
  {
    id: 31,
    fen: 'rn1qkbnr/ppp1pppp/8/3p4/4P1b1/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1',
    solution: ['f1e2'],
    type: 'pin',
    difficulty: 2,
    title: 'Nebunul pe e2 pregătește dezlegarea calului',
  },
  {
    id: 32,
    fen: 'r2qk2r/ppp1bppp/2n1pn2/3p4/3P1B2/2PB1N2/PP3PPP/RN1QK2R w KQkq - 0 1',
    solution: ['d3b5'],
    type: 'pin',
    difficulty: 2,
    title: 'Nebunul leagă calul de rege pe diagonală',
  },
  {
    id: 33,
    fen: 'r1bqk1nr/pppp1ppp/2n5/4p3/1bB1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1',
    solution: ['e1g1'],
    type: 'pin',
    difficulty: 2,
    title: 'Rocadă — regele la adăpost',
  },
  {
    id: 34,
    fen: 'r2qkbnr/ppp2ppp/2np4/4p3/2B1P1b1/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 1',
    solution: ['d2d3'],
    type: 'pin',
    difficulty: 2,
    title: 'Dezvoltare + contraatac la nebunul care leagă',
  },
  {
    id: 35,
    fen: 'r1b1kbnr/ppppqppp/2n5/4p3/4P3/5N2/PPPPBPPP/RNBQK2R w KQkq - 0 1',
    solution: ['e2b5'],
    type: 'pin',
    difficulty: 2,
    title: 'Nb5 leagă calul de rege',
  },
  {
    id: 36,
    fen: 'r2qk2r/ppp2ppp/2n1bn2/3pp3/4P3/1BN2N2/PPPP1PPP/R1BQ1RK1 w kq - 0 1',
    solution: ['f1e1'],
    type: 'pin',
    difficulty: 2,
    title: 'Tura pe e1 — leagă pionul de rege',
  },
  {
    id: 37,
    fen: 'rnbqk2r/pppp1ppp/5n2/4p3/1b2P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 0 1',
    solution: ['d1e2'],
    type: 'pin',
    difficulty: 2,
    title: 'Dama pe e2 — dezleagă calul și protejează e4',
  },
]

// ════════════════════════════════════════════
// SKEWER / Înțepătură — atacul trece prin piesa valoroasă
// ════════════════════════════════════════════

const skewerPuzzles: Puzzle[] = [
  {
    id: 38,
    fen: '6k1/8/8/8/8/8/R7/4K3 w - - 0 1',
    solution: ['a2a8'],
    type: 'skewer',
    difficulty: 1,
    title: 'Tura dă șah pe linia 8',
  },
  {
    id: 39,
    fen: '5k2/4q3/8/8/8/8/4R3/4K3 w - - 0 1',
    solution: ['e2e7'],
    type: 'skewer',
    difficulty: 2,
    title: 'Tura capturează dama neapărată',
  },
  {
    id: 40,
    fen: '2k5/3q4/8/8/8/3B4/8/4K3 w - - 0 1',
    solution: ['d3a6'],
    type: 'skewer',
    difficulty: 2,
    title: 'Nebunul pe a6 — înțepătură regală',
  },
  {
    id: 41,
    fen: '8/8/8/q3k3/8/8/8/6KR w - - 0 1',
    solution: ['h1h5'],
    type: 'skewer',
    difficulty: 2,
    title: 'Tura pe linia 5 — șah + damă în spate',
  },
  {
    id: 42,
    fen: '8/8/8/8/8/4k2q/8/R3K3 w - - 0 1',
    solution: ['a1a3'],
    type: 'skewer',
    difficulty: 2,
    title: 'Tura pe linia 3 — șah și damă pierdută',
  },
  {
    id: 43,
    fen: '8/8/8/8/q3k3/8/7R/5K2 w - - 0 1',
    solution: ['h2h4'],
    type: 'skewer',
    difficulty: 3,
    title: 'Tura pe linia 4 — șah și damă pierdută',
  },
  {
    id: 44,
    fen: '8/8/8/8/8/6K1/R7/1k1q4 w - - 0 1',
    solution: ['a2a1'],
    type: 'skewer',
    difficulty: 2,
    title: 'Tura pe a1 — rege fuge, damă cade',
  },
]

// Toate puzzle-urile combinate
export const puzzles: Puzzle[] = [
  ...mate1Puzzles,
  ...mate2Puzzles,
  ...forkPuzzles,
  ...pinPuzzles,
  ...skewerPuzzles,
]

// Helper-e pentru filtrare
export const tacticTypes: { value: TacticType; label: string }[] = [
  { value: 'mate1', label: 'Mat în 1' },
  { value: 'mate2', label: 'Mat în 2' },
  { value: 'fork', label: 'Furculiță' },
  { value: 'pin', label: 'Legare' },
  { value: 'skewer', label: 'Înțepătură' },
]

export const difficultyLabels: Record<Difficulty, string> = {
  1: '★',
  2: '★★',
  3: '★★★',
}
