# ChessMate — Aplicație de Șah (React + PWA)

## Directorul de lucru
`/Users/danielbors/Projects/AI-Projects/CC/soft_uri/chess/`

Tot lucrul pe acest proiect se face EXCLUSIV în acest director.

## Structura
```
chess/
├── plans/                    # Documentație, mega-prompt, ghid pedagogic, arhitectură
├── chessmate/                # Proiectul React (Vite)
│   ├── src/
│   │   ├── components/       # Board, Square, Piece, GameInfo
│   │   ├── engine/           # Integrare Stockfish WASM
│   │   ├── hooks/            # (pregătit pentru faze viitoare)
│   │   ├── puzzles/          # (pregătit pentru Faza 4)
│   │   ├── styles/           # (pregătit)
│   │   ├── types/            # (pregătit)
│   │   └── utils/            # (pregătit)
│   └── public/               # Stockfish WASM + assets statice
└── CLAUDE.md                 # Acest fișier
```

## Proiect
Aplicație de șah funcțională pentru web și telefon (PWA). Scop principal: 70% învățare proces/workflow de development, 20% produs funcțional.

## Tech Stack (confirmat)
- **React 18+** + **TypeScript** + **Vite 8** — frontend framework + build tool
- **chess.js** — logica jocului (mutări legale, șah, mat, reguli speciale)
- **Stockfish 18 WASM** — engine AI, rulează în browser via Web Worker
- PWA (planificat — Faza 5)
- Deploy: Vercel (planificat — Faza 6)

## Progres faze
- [x] Faza 0: Setup & Tooling — proiect Vite, structură foldere, Git
- [x] Faza 1: Tabla de șah — grid 8x8, piese SVG cburnett, responsive
- [x] Faza 2: Logica jocului — chess.js, click-to-move, highlight mutări, șah vizual pe rege
- [x] Faza 3: Adversarul AI — Stockfish 18, 3 nivele (easy/medium/hard), undo, status, istoric
- [ ] Faza 4: Puzzle-uri tactice — colecție + tracking progres
- [ ] Faza 5: PWA — instalare pe telefon, offline
- [ ] Faza 6: Polish & Deploy — design final, Vercel, live

## Reguli de lucru
- Răspunde în română, termenii tehnici rămân în engleză cu explicație
- Explică DE CE înainte de CUM — fiecare decizie tehnic justificată
- Nu adăuga features nediscutate
- Nu sări pași fără să explici ce se pierde
- Înainte de a instala un pachet nou, întreabă
- Cod curat, comentat în română
- Rezultatele/outputurile se salvează în subdirectoare organizate

## Documentație
- Mega-prompt complet: `plans/2026-03-29-chess-app-prompt.md`
- Ghid pedagogic (construcție pas cu pas): `plans/ghid-pedagogic.md`
- Arhitectura proiectului: `plans/arhitectura.md`
