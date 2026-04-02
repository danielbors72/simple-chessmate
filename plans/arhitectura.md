# ChessMate — Arhitectura Proiectului

## Prezentare generală

ChessMate este o aplicație web de șah interactivă construită cu React + TypeScript + Vite. Jucătorul (alb) se confruntă cu un adversar AI (Stockfish) disponibil la 3 nivele de dificultate. Faze completate: 0 (Setup), 1 (Board UI), 2 (Logica jocului), 3 (AI cu Stockfish).

## Tech Stack

| Tehnologie | Rol | Versiune |
|---|---|---|
| React | Interfață și state management | 19.2.4 |
| TypeScript | Tipizare statică a codului | ~5.9.3 |
| Vite | Build tool și dev server | 8.0.1 |
| chess.js | Logica jocului de șah (validare mutări, detectare mat) | 1.4.0 |
| Stockfish | Engine AI pentru mutări computerului | 18.0.5 |
| Web Workers | Execuție asincronă a Stockfish în background | Standard DOM |

## Structura fișierelor

```
src/
├── App.tsx                    Componenta rădăcină — renderizează Board
├── main.tsx                   Entry point React DOM
├── components/
│   ├── Board.tsx              Tabla de șah — state management + logica jocului
│   ├── Square.tsx             Un singur pătrat (64 de pătrate = tabla)
│   ├── Piece.tsx              Imagine SVG pentru o piesă
│   ├── GameInfo.tsx           Status joc, butoane, selector dificultate
│   └── Board.css, GameInfo.css  Stiluri
├── engine/
│   └── stockfish.ts           Wrapper pentru comunicarea cu Stockfish worker
└── assets/
    └── pieces/                12 SVG-uri (piese albe și negre)
```

## Fluxul de date

```
                          App (rădăcină)
                            |
                          Board (state manager)
                         /  |  |  \
                    /       |  |    \
               Chess.js   GameInfo  Stockfish
                 |          |         |
             Board state  UI status  AI moves
                 |
            Square × 64
                 |
              Piece (SVG)

Fluxuri principale:

1. Click pe pătrat → Board.handleSquareClick()
   ↓
   Validează mutare cu chess.js
   ↓
   Actualizează state (game, history)
   ↓
   Re-render Square + GameInfo

2. Rândul negru (AI) → Board.useEffect detectează isPlayerTurn=false
   ↓
   Apelează engine.findBestMove(fen, depth)
   ↓
   Stockfish worker trimite răspuns "bestmove x"
   ↓
   callback() actualizează state
   ↓
   Re-render tabla + GameInfo
```

## Componente

### App.tsx
Componenta rădăcină. Renderizează Board în container CSS.

**Props:** (niciuna — componenta container)

**Conținut:** `<div class="app"> <Board /> </div>`

### Board.tsx
Stocă starea jocului și logica interactivității. Coordonează mutările jucătorului cu răspunsurile AI. Singura componentă cu state React propriu (game, selected, legalMoves, history, difficulty, thinking).

**Props:** (niciuna)

**State gestionat:**
| State | Tip | Semnificație |
|---|---|---|
| `game` | Chess | Poziția curentă a tablei (obiect chess.js) |
| `selected` | string \| null | Pătrat selectat pentru a muta piesă (ex: "e2") |
| `legalMoves` | string[] | Pătratele disponibile pentru piesa selectată |
| `history` | string[] | FEN-uri anterioare pentru undo |
| `difficulty` | string | "easy" \| "medium" \| "hard" |
| `thinking` | boolean | Jocul e în așteptare pentru mutarea AI |

**Callbacks:**
- `handleSquareClick(position)` — Gestionează click-ul jucătorului pe pătrat
- `handleNewGame()` — Resetează starea, pornește joc nou
- `handleUndo()` — Dă înapoi 2 mutări (AI + jucător)

**Logică AI:** În `useEffect`, dacă `!isPlayerTurn && !gameOver`, apelează `engine.findBestMove()` cu depth bazat pe dificultate.

### Square.tsx
Desenează un singur pătrat (8×8 = 64 de pătrate). Afișează piesa (dacă există) și indicatori vizuali (culoare selectare, mișcare legală, șah).

**Props:**
| Prop | Tip | Semnificație |
|---|---|---|
| `isLight` | boolean | Pătrat deschis (true) sau închis (false) |
| `position` | string | Coordonata (ex: "e4") |
| `piece` | string \| undefined | Codul piesei (ex: "wK", "bP") sau undefined |
| `isSelected` | boolean | Pătrat selectat de jucător |
| `isLegalMove` | boolean | Mișcare disponibilă pentru piesa selectată |
| `isInCheck` | boolean | Regele pe acest pătrat e în șah |
| `onClick` | function | Callback la click |

**Rendering:**
- Pătrat colorat (light/dark) cu clasă CSS dynamică
- `<Piece>` dacă `piece` e definit
- Dot indicator dacă mișcare legală fără captură
- Ring indicator dacă mișcare legală cu captură

### Piece.tsx
Componentă simplă care afișează SVG pentru o piesă. Nicio logică, doar rendering.

**Props:**
| Prop | Tip | Semnificație |
|---|---|---|
| `type` | string | Cod piesă: "wK" (white King), "bP" (black Pawn), etc. |

**Logică:** Mapează cod → imagine SVG din `PIECE_IMAGES`.

### GameInfo.tsx
Afișează status curent (a cui rând, șah, mat, remiză), butoane de control (Joc nou, Undo), selector dificultate, și istoric de mutări în notație algebrică.

**Props:**
| Prop | Tip | Semnificație |
|---|---|---|
| `game` | Chess | Obiect chess.js pentru a genera status |
| `canUndo` | boolean | Dacă undo e disponibil |
| `onNewGame` | function | Callback la clic "Joc nou" |
| `onUndo` | function | Callback la clic "Undo" |
| `difficulty` | string | Dificultate curentă |
| `onDifficultyChange` | function | Callback la schimbare selector |
| `thinking` | boolean | Flag pentru a dezactiva butoane în timp ce AI gândește |

**Status generat:**
- "Șah mat — negrul câștigă" / "... albul câștigă"
- "Remiză — pat" / "repetiție triplă" / "material insuficient"
- "Stockfish gândește..."
- "Albul e în șah" / "Negrul e în șah"
- "Albul la mutare" / "Negrul la mutare"

## Engine AI (Stockfish)

### Inițializare
1. `Board.useEffect` apelează `engine.init()` la prima încărcare
2. `init()` pornește un Web Worker care încarcă `/stockfish.js`
3. Se trimit comenzile UCI: `uci` și `isready`
4. Worker-ul rămâne activ pentru toată viața aplicației

### Protocul UCI
UCI (Universal Chess Interface) este standardul industrial pentru a comunica cu engine-uri de șah.

**Fluxul:**
```
Board trimite:  "position fen <fen-string>"
                "go depth <n>"

Stockfish Worker calculează în background

Stockfish răspunde: "bestmove e2e4"

engine.onmessage() parsează răspunsul și apelează callback()
```

### Nivelele de dificultate (Depth Mapping)
Parametrul `depth` controlează cât de adânc gândește motorul (mai mare = mai puternic):

| Dificultate | Depth | ELO estimat | Comportament |
|---|---|---|---|
| easy | 3 | ~800 | Face greșeli evidente, joc pentru începători |
| medium | 8 | ~1400 | Joc decent, strategie elementară |
| hard | 15 | ~2000+ | Foarte puternic, variante complexe |

### Callback asincron
`findBestMove(fen, depth, callback)` este asincronă. Stocarea callback-ului în `this.onBestMove`:
1. Callback e apelat când Stockfish răspunde "bestmove"
2. Board reîncarcă `game` state cu noua poziție
3. Re-render ocazie cu mutare AI

## State Management

### Starea locală a jocului

Toată starea jocului e stocată în componentul **Board** prin React hooks (`useState`, `useEffect`). Nu e necesară o bibliotecă globală (Redux, Zustand) deoarece o singură componentă cere acces la state.

**De ce sunt necesare 6 state-uri separate:**

1. **`game: Chess`** — Obiect chess.js care ține poziția și validează mutări
2. **`selected: string | null`** — Pentru UI: ce pătrat a selectat jucătorul
3. **`legalMoves: string[]`** — Pătrate disponibile pentru piesa selectată (caching pentru viteză)
4. **`history: string[]`** — FEN-uri anterioare pentru undo (păstrare istoria pozițiilor)
5. **`difficulty: string`** — Controlul dificultății AI (persistent per sesiune)
6. **`thinking: boolean`** — Flag pentru a dezactiva butoane + UI update în timp ce Stockfish gândește

### Declanșarea re-render-ului de la AI

```typescript
useEffect(() => {
  if (!isPlayerTurn && !gameOver) {
    setThinking(true)
    engine.findBestMove(game.fen(), depth, (bestMove) => {
      // callback() rulează asincron
      game.move(...)
      setGame(new Chess(...))  // DECLANȘEAZĂ RE-RENDER
      setThinking(false)
    })
  }
}, [game, isPlayerTurn, gameOver, difficulty])
```

Când AI returnează `bestMove`:
1. Callback actualizează `game` prin `setGame()`
2. React re-render-ează Board
3. Noua poziție se afișează pe tablă
4. Rândul devine jucătorului din nou

## Dependențe externe

| Pachet | Ce face | De ce |
|---|---|---|
| **chess.js** | Logica completă a șahului: validare mutări, detectare mat/pat/șah, FEN parsing | Standard in industrie, lightweight, ~0 dependențe interne |
| **stockfish** | Engine WASM JavaScript care rulează local (offline) | Cea mai puternică opțiune open-source; nu necesită server |
| **React** | Rendering UI și state management | Standardul modern pentru SPA-uri |
| **Vite** | Build + dev server + HMR | Rapid, ES modules native, minim config |
| **TypeScript** | Tipizare statică | Siguritate tip, autocompletion IDE, refactoring ușor |

## Fluxul complet al unui joc (exemplu)

1. **Inițializare**
   - React mount: Board.useEffect apelează `engine.init()`
   - Chess.js creează poziție inițială (RNBQKBNR...)
   - GameInfo afișează "Albul la mutare"

2. **Jucătorul face o mutare**
   - Click pe e2 → setSelected("e2"), setLegalMoves(["e3", "e4"])
   - Click pe e4 → game.move(), setGame(new Chess()), setHistory([...])
   - Board re-render-ează
   - GameInfo afișează "Negrul la mutare"

3. **AI gândește**
   - Board.useEffect detectează isPlayerTurn = false
   - setThinking(true) → butoane dezactivate
   - engine.findBestMove(fen, 8, callback)
   - Worker-ul calculează timp 0.5-2s (depinde de dificultate)

4. **AI răspunde**
   - Callback primește "e7e5"
   - game.move({from: "e7", to: "e5"})
   - setGame() declanșează re-render
   - setThinking(false) → butoane reactivate
   - GameInfo afișează "Albul la mutare"

5. **Buclă până la mat/remiză**
   - Jucătorul + AI alternează până game.isGameOver() = true
   - GameInfo afișează rezultatul final

## Considerații de performanță

- **Web Worker:** Stockfish rulează în thread separat. Calculele AI nu blochează UI.
- **Caching legalMoves:** După selectare, pătratele legale sunt caching-ate în state pentru a evita recalculul la fiecare re-render.
- **Immutable state:** Crearile noi de `Chess()` și array-uri evită probleme de referință.
- **Conditional rendering:** Indicatori vizuali (selected, legal-move, in-check) sunt renderizați doar dacă sunt necesari.

## Considerații de design

- **Rata de dificultate:** Depth 3-15 oferă un spectru bun de ELO (800-2000+). Mai mare nu e necesar pentru un joc casual.
- **Undo:** Se dă înapoi 2 mutări (AI + jucător) pentru a menține simetria.
- **FEN pentru undo:** Salvarea FEN-ului permite undo instant fără a stoca întreg istoricul jocului.
- **Notație algebrică:** Mutările se afișează în format standard internațional pentru o mai bună înțelegere a jocului.

## Următoarele faze

**Faza 4:** Puzzle-uri tactice — bază de date cu probleme și sistem de rating
**Faza 5:** PWA — instalare pe telefon, service worker, offline support
**Faza 6:** Polish & Deploy — animații, sloturi de salvare, lansare pe Vercel
