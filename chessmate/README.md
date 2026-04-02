# Simple ChessMate

O aplicatie de sah construita pas cu pas cu **Claude Code** — ghid practic de vibecoding.

## Despre ce e vorba

Acest repo este un **manual de dezvoltare** in stilul vibecoding. Scopul nu este doar aplicatia finala, ci **procesul**: cum gandesti, cum ceri, cum iterezi cu un AI coding assistant (Claude Code) ca sa ajungi de la zero la un produs functional.

Fiecare commit din istoria git-ului reprezinta un pas concret — poti urmari cronologic cum s-a construit totul.

## Ce inveti urmarind acest repo

- Cum setezi un proiect web modern de la zero (Vite + React + TypeScript)
- Cum construiesti o interfata din componente (tabla, piese, butoane)
- Cum integrezi logica complexa (regulile sahului via chess.js)
- Cum adaugi un motor AI (Stockfish WASM in browser)
- Cum gandesti in faze si cum planifici inainte de a scrie cod
- Cum validezi corectitudinea (puzzle-uri testate programatic, nu manual)

## Cum sa folosesti repo-ul

1. **Citeste istoria git-ului** — `git log --oneline` iti arata pasii in ordine
2. **Urmareste fazele** — fiecare faza adauga un strat nou de complexitate
3. **Citeste codul** — comentariile sunt in romana, codul e simplu si direct
4. **Incearca local** — cloneaza, instaleaza, joaca

## Faze de dezvoltare

| Faza | Ce adauga | Status |
|------|-----------|--------|
| 0 | Setup proiect (Vite + React + TypeScript + Git) | Done |
| 1 | Tabla de sah — grid 8x8, piese SVG, responsive | Done |
| 2 | Logica jocului — chess.js, mutari legale, sah vizual | Done |
| 3 | Adversar AI — Stockfish 18 WASM, 3 nivele de dificultate | Done |
| 4 | Puzzle-uri tactice — 44 puzzle-uri validate, hints, progres | Done |
| 5 | PWA — instalare pe telefon, offline | In lucru |
| 6 | Polish + Deploy — design final, Vercel | Planificat |

## Tech stack

- **React 19** + **TypeScript** — UI framework
- **Vite 8** — build tool rapid
- **chess.js** — regulile sahului (mutari legale, sah, mat, remiza)
- **Stockfish 18 WASM** — motor AI, ruleaza direct in browser

## Rulare locala

```bash
git clone git@github.com:danielbors72/simple-chessmate.git
cd simple-chessmate
npm install
npm run dev
```

Deschide `http://localhost:5173` in browser.

## Ghid pedagogic complet

In directorul `plans/` gasesti documentatia detaliata:
- **ghid-pedagogic.md** — explicatii pas cu pas, analogii B2B, fiecare decizie justificata
- **arhitectura.md** — cum sunt organizate componentele si de ce

## Construit cu

Intreaga aplicatie a fost construita folosind [Claude Code](https://claude.com/claude-code) — un AI coding assistant in terminal. Repo-ul demonstreaza ce poate face vibecoding-ul: de la idee la produs, ghidat de conversatie.
