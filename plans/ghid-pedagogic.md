# ChessMate — Ghid de Construcție Pas cu Pas

## Introducere

### Ce construim și de ce

ChessMate este o aplicație de șah funcțională care rulează direct în browserul tău. Joci cu piesele albe, iar calculatorul (Stockfish) joacă cu piesele negre la 3 niveluri de dificultate.

De ce am ales să construim asta? Pentru că un joc de șah îți arată cum lucrează **laolaltă**:
- Interfața (cum se vede pe ecran)
- Logica (regulile jocului)
- Inteligența artificială (cum gândește computerul)
- Serviciile externe (Stockfish ca motor)

Nu doar o pagină simplu, ci o aplicație cu stare, calcule, AI.

### Pentru cine e acest ghid

Ești antreprenor B2B care dorești să înțelegi cum se construiește un produs software. Nu trebuie să devii programator — vrei să înțelegi procesul, deciziile tehnice, compromisurile.

După ce termini acest ghid, vei putea să:
- Citești codul unei aplicații React și să înțelegi cum funcționează
- Să explicii unui developer de ce ai nevoie de un anumit lucru
- Să apreciezi munca unui engineering team
- Să iei decizii informate despre tehnologie în propriul business

### Ce vei învăța

1. **Fundația** — Cum e setat up un proiect modern de web
2. **Componente** — LEGO-ul digital: cum se construiesc interfețe din piese mici
3. **Stare și Fluxul de Date** — Cum "gândește" o aplicație (memory, state, reacție)
4. **Integrări Externe** — Cum comunici cu servicii externe (chess.js, Stockfish)
5. **AI și Web Workers** — Cum ruleaza calcule complicate fără să blocheze interfața

---

## Faza 0: Fundația

Înainte de a scrie o singură linie de cod, trebuie să setup-ezi "atelierul".

### Ce am folosit și de why

#### Node.js — Runtime-ul JavaScript

**Ce e:** JavaScript normal rulează doar în browser. Node.js permite JavaScript să ruleze pe calculator tău (ca Python sau Ruby).

**Analogie:** Dacă browserul e o scenă, Node.js e studiourile de production în spate. Aici creem codul, descărcam librării, construim aplicația.

**În ChessMate:** Folosim Node.js să:
- Instalăm librării (chess.js, Stockfish, React)
- Rulăm comanda `npm install` care descarcă dependențele
- Rulăm `npm run dev` care "pregătește" codul pentru browser

#### Vite — Build Tool (Linia de Asamblare)

**Ce e:** Un build tool e ca linia de asamblare a unei fabrici. Vite ia miile de linii de cod din codul sursă, le optimizează, le transformă și le "ambalează" într-un format gata de browser.

**Analogie B2B:** Dacă CoD sursă e schițe și componente, Vite e linia care asambleaza produsul final gata de transport. Fără linia asta, ai schițe, nu ai produs.

**În ChessMate:**
- Vite vede pe `src/App.tsx` → incare importez `Board.tsx` → care importa `Square.tsx`
- Vite urmăreste TOȚI acesti "dependency-i" si ii transforma intr-un singur fișier eficient
- Când rulezi `npm run dev`, Vite vede schimbările instantaneu si actualizeaza browserul (hot reload)

#### TypeScript — Tipuri (Contractele Documentelor)

**Ce e:** JavaScript normal e foarte flexibil — prea flexibil. O funcție care asteapta un număr poate primi un text, și nu o să-ți zică neapărat că e greșit până nu testezi.

TypeScript e JavaScript cu "contracte" — tu declari: "Funcția mea primește o variabilă de tip `number`". Dacă cineva încearcă să-i trimită un text, editorul tău strigă "EROARE" înainte ca tu să rulezi codul.

**Analogie B2B:** În contractele tale, tu specifici exact ce plătești, ce primești, termenii. TypeScript e la fel — specifică tipurile pentru a evita surprize.

**În ChessMate:**
```
type SquareProps = {
  isLight: boolean    // "true" sau "false", nimic altceva
  position: string    // "a1", "e4", etc.
  piece?: string      // opțional (? înseamnă "poate fi undefined")
}
```

Dacă un developer încearcă să pase `isLight={5}`, TypeScript zice: "Frate, trebuie boolean, nu număr."

#### Git — Version Control (Dosarele cu Versiuni)

**Ce e:** Git e ca Dropbox pentru cod. Salvează fiecare versiune a codului tău, cine a schimbat ce, și permite să mergi înapoi la orice versiune anterioară.

**Analogie:** Scrii o propunere, faci draft v1, draft v2, final. Cu Git, toate versiunile sunt salvate cu note despre cine a schimbat ce și de ce. Nu pierzi niciodată ceva.

**În ChessMate:**
- Fiecare schimbare e un "commit" cu mesajul "Board: add legal move highlighting"
- Dacă ceva se rupe, du-te înapoi la versiunea de ieri
- Dacă faci o greșeală, vezi exact ce s-a schimbat

---

## Structura Proiectului

Iată cum sunt organizate fișierele în `/src`:

```
src/
├── components/        # Piesele LEGO — componentele React
│   ├── Board.tsx      # Tabla de șah
│   ├── Square.tsx     # Un pătrat pe tablă
│   ├── Piece.tsx      # O piesă de șah (imagini SVG)
│   └── GameInfo.tsx   # Status, butoane, dificultate
├── engine/            # Integrarea cu Stockfish (AI-ul)
│   └── stockfish.ts   # Comunicare cu motorul
├── assets/            # Imagini și resurse
│   └── pieces/        # SVG-urile pieselor de șah
├── App.tsx            # Componenta principal (entry point)
└── main.tsx           # Unde React se pornește
```

**Analogie de birou:** Dacă un birou e bine organizat, ai un dosar pentru Contracte, unu pentru Facturi, unu pentru HR. În cod, `components/` e dosarul cu Piesele UI-ului, `engine/` e dosarul cu AI-ul.

---

## Faza 1: Tabla de Șah

Scopul: Arăta tabla cu 64 de pătrate și 16 piese de șah.

### Componente React — Conceptul de LEGO

**Ce e o componentă:** O bucată refolosibilă de interfață care se comportă independent. E ca o piesă de LEGO — conectezi piese mici să faci ceva mai mare.

**Ierarhia în ChessMate:**
```
<Board />                          ← Tabla mare
├── <Square />                     ← Un pătrat (64 ori)
│   └── <Piece />                  ← O piesă (doar dacă e ocupat patra)
└── <GameInfo />                   ← Panelul cu status și butoane
```

**Cum comunică componentele — Props:**

Componentele comunică prin "props" (proprietăți). E ca parametrii unei funcții în matematică.

În `Square.tsx`:
```tsx
type SquareProps = {
  isLight: boolean     // Pătrat alb sau negru?
  position: string     // "a1", "e4", etc
  piece?: string       // Care piesă e pe acest pătrat?
  isSelected?: boolean // E selectat?
  isLegalMove?: boolean // E mutare legală?
  onClick?: () => void // Ce se întâmplă la click
}

function Square({ isLight, position, piece, isSelected, isLegalMove, onClick }: SquareProps) {
  // Componentă simplă — doar afișează
  return (
    <div className={isLight ? 'light' : 'dark'} onClick={onClick}>
      {piece && <Piece type={piece} />}
    </div>
  )
}
```

`Board.tsx` ține logica (starea jocului), iar `Square` e "dumb" — doar afișează ce îi spune Board.

### CSS Grid — De la Lista la Tablă

Tabla are 64 de pătrate. Cum faci să arate ca o tablă 8x8?

**Răspuns:** CSS Grid.

În `Board.tsx`, avem în JSX:
```tsx
<div className="board">
  {RANKS.map((rank) =>
    FILES.map((file) => (
      <Square key={position} ... />
    ))
  )}
</div>
```

Asta creează 64 de `<div>` pe rând. CSS-ul zice: "Aranjează-i în 8 coloane și 8 rânduri":

```css
.board {
  display: grid;
  grid-template-columns: repeat(8, 1fr);  /* 8 coloane egale */
  gap: 0;
}
```

CSS Grid = metoda modernă de a face layout-uri în 2D (ca o tablă de șah).

### SVG — Imagini Vectoriale

Piesele de șah sunt imagini SVG. De ce nu PNG sau JPG?

**PNG/JPG:** Pixeli. Dacă marești, se pixelează.
**SVG:** Forme matematice. Oricât de mult marești, rămâne curat.

În `Piece.tsx`:
```tsx
import wK from '../assets/pieces/wK.svg'  // SVG de rege alb

function Piece({ type }: PieceProps) {
  return <img src={PIECE_IMAGES[type]} alt={type} />
}
```

Vite transformă SVG-ul în URL și componenta just-o afișează. Rezultat: piese care arată perfect pe orice dimensiune.

---

## Faza 2: Logica Jocului

Scopul: Jucătorul poți să selecteze o piesă, să vede mutările legale, și să mute.

### chess.js — De ce nu reinventezi roata

**Ce-i chess.js:** O librărie JavaScript care implementează TOATE regulile șahului.

- Mutări legale pentru fiecare piesă (pion se mișcă 1-2 pătrate înainte, turn merge în linie dreaptă, etc.)
- Detectează șah, șah mat, remiză
- En passant (mutare specială cu pioni)
- Rocadă (mutare specială cu rege și turn)
- Detectează repetiție triplă și material insuficient

**Analogie B2B:** Dacă faci o aplicație pentru gestionarea fiscală, nu rescrii legea fiscală. Folosești un motor legal testat. chess.js e la fel — e testat de mii de oameni.

**Cum se folosește:**
```ts
import { Chess } from 'chess.js'

const game = new Chess()  // Poziție inițială

// Vrei mutări legale din patra e2?
const moves = game.moves({ square: 'e2', verbose: true })
// Rezultat: [ { from: 'e2', to: 'e4', ... }, { from: 'e2', to: 'e3', ... } ]

// Fă o mutare
game.move({ from: 'e2', to: 'e4' })

// Verifică stare
game.inCheck()       // true/false
game.isCheckmate()   // true/false
game.isGameOver()    // true/false
game.turn()          // 'w' (white) sau 'b' (black)
```

### State Management — Cum "Gândește" React

**Ce-i state:** Memoria aplicației. Datele care se schimbă în timp (poziția pieselor, cine e la mutare, etc.).

În `Board.tsx`:
```ts
const [game, setGame] = useState(new Chess())  // Stare: poziția jocului
const [selected, setSelected] = useState<string | null>(null)  // Care piesă e selectată?
const [legalMoves, setLegalMoves] = useState<string[]>([])  // Ce mutări sunt legale?
const [history, setHistory] = useState<string[]>([])  // Istoricul mutărilor (pentru Undo)
const [difficulty, setDifficulty] = useState<string>('medium')  // Nivelul AI
```

**Cum funcționează:**

1. `useState(new Chess())` creează o variabilă `game` cu valoarea inițială (poziția standard).
2. Când cineva apasă un buton sau click-ează pe o piesă, apelezi `setGame(newGame)`.
3. React vede că `game` s-a schimbat → **redraw-ează** toate componentele care depind de `game`.
4. Ecranul se actualizează instantaneu.

**Analogie:** Gândești-te la un tablou digital. Tu schimbi datele, tabloul se actualizează. State e datele, setters sunt pensulele.

### Fluxul de Interacțiune — Click pe Piesă

1. **User click-ează pe e2:** Apelează `handleSquareClick('e2')`
2. **Verifică:** E piesa albă (jucător), are mutări legale?
3. **Calculează mutări:** `game.moves({ square: 'e2', verbose: true })` din chess.js
4. **Salvează:** `setSelected('e2')` și `setLegalMoves([...])` — acum React re-randează și afișează punctele pe pătrate
5. **User click-ează pe e4:** Apelează `handleSquareClick('e4')`
6. **E mutare legală?** Da. Apelează `game.move({ from: 'e2', to: 'e4' })`
7. **Salvează:** `setGame(new Chess(game.fen()))` — React re-randează cu noua poziție

---

## Faza 3: Adversarul AI

Scopul: Calculatorul se gândește și face o mutare după ce tu faci mutarea.

### Ce-i un Chess Engine

**Ce face:** Evaluează milioane de poziții pe secundă și alege mutarea cea mai bună.

Gândirea motoarelor e sistemată:
1. Analizează toate mutările posibile din poziția curentă
2. Pentru fiecare, se gândește 2-3 mutări în avans (depth)
3. Evaluează fiecare poziție: e bună pentru mine sau pentru adversar?
4. Alege mutarea care îi dă cel mai bun scor

**Depth = cât de adânc gândește.** Depth 3 = 3 mutări în avans (AI mutare, tu muți, AI muți din nou). Depth 15 = 15 mutări în avans. Mai mare = mai puternic, dar mai lent.

**Evaluare:** Motorul dă scor: +2 (albul e mai bun), -5 (negrul e mai bun), 0 (egal).

### Stockfish + WebAssembly

**Stockfish:** Cel mai puternic engine de șah open-source din lume. Gratis, deschis, testat de milioane.

**WebAssembly (WASM):** Cod compilat care rulează **aproape nativ** în browser. E ca diferența dintre a interpreta dintr-o carte (JavaScript slow) și a vorbî limba direct (WASM fast).

**Cum funcționează în ChessMate:**
1. Importez `stockfish.js` din npm
2. Cand aplicația se pornește, creez un Web Worker care încarcă Stockfish
3. Comunic cu Stockfish prin mesaje text (protocol UCI):
   ```
   position fen [poziția curentă]
   go depth 8
   ```
4. Stockfish răspunde cu cea mai bună mutare: `bestmove e7e5`

### Nivelurile de Dificultate

```ts
const DIFFICULTY = {
  easy: 3,      // ~800 ELO — face greșeli evidente, joacă lent
  medium: 8,    // ~1400 ELO — joc solid, gândeste 2-3 secunde
  hard: 15,     // ~2000+ ELO — foarte puternic, gândeste mai mult
}
```

ELO e o scală de rating în șah. 1200 = jucător mediu club, 2000+ = grandmaster.

### Web Worker — Gândire fără să Blochezi Interfața

**Problema:** Dacă Stockfish gândește 5 secunde pe thread-ul principal, interfața inghetă. Nu poți click-a pe nimic.

**Soluție:** Web Worker. Un "asistent" care lucrează în paralel.

**Analogie:** Tu ești pe telefon cu clientul (UI thread). Asistentul tău calculează rapoarte în altă cameră (Web Worker). Când termină, ti le aduce.

În `Board.tsx`:
```ts
useEffect(() => {
  if (!isPlayerTurn && !gameOver) {
    setThinking(true)  // "Ai, stai, se gândește"
    const depth = DIFFICULTY[difficulty]
    engine.findBestMove(game.fen(), depth, (bestMove) => {
      // Când Web Worker-ul termină, callback-ul se apelează
      const move = game.move({ from: bestMove.slice(0, 2), to: bestMove.slice(2, 4) })
      setGame(new Chess(game.fen()))
      setThinking(false)  // "Gata, tu la rând"
    })
  }
}, [game, isPlayerTurn, gameOver])
```

---

## Concepte Cheie — Rezumat

Iată o listă cu toate conceptele pe care le-ai învățat:

| Concept | Termen Tehnic | Explicație Simplă | Unde în ProiecT |
|---------|---------------|-------------------|-----------------|
| **Framework** | React | Librărie care construiește interfețe prin componente reutilizabile | App.tsx, Board.tsx, Square.tsx |
| **Component** | Component | Bucată mică de UI (piesă de LEGO) cu propriul cod și stiluri | Board, Square, Piece, GameInfo |
| **Props** | Props | Cum comunică componentele — parametrii ai unei componente | Square primește isLight, position, piece |
| **State** | State (useState) | Memoria aplicației — datele care se schimbă (stare joc, selectie, etc.) | game, selected, legalMoves în Board |
| **Hook** | Hook | Funcție specială React care adaugă funcții componentelor (useState, useEffect, useCallback) | useState, useEffect, useCallback |
| **Effect** | Effect (useEffect) | Cod care se rulează după ce componenta se randează — logic asincron | Inițializare Stockfish, gândire AI |
| **Callback** | Callback | Funcție care se pasează ca parametru și se apelează mai târziu | handleSquareClick, findBestMove |
| **Type** | TypeScript Type | Contract: variabila asta trebuie să fie de acest tip (number, string, boolean) | SquareProps, DIFFICULTY record |
| **CSS Grid** | CSS Grid | Sistem de layout 2D — aranjează elemente în rânduri și coloane | Tabla 8x8 în Board.css |
| **SVG** | SVG (Scalable Vector Graphics) | Imagini vectoriale (formule matematice) în loc de pixeli | Piesele de șah din assets/pieces |
| **Build Tool** | Vite | Prelucrează codul sursă și-l transformă în format gata pentru browser | npm run dev, npm run build |
| **Library** | chess.js | Cod gata din altcineva care implementează regulile șahului | game.moves(), game.move(), game.inCheck() |
| **Engine** | Chess Engine (Stockfish) | Program care calculează mutări bune prin evaluare poziții | engine.findBestMove() |
| **Web Worker** | Web Worker | "Asistent" care calculează în paralel, fără să blocheze interfața | stockfish.ts: new Worker('/stockfish.js') |
| **WebAssembly** | WebAssembly (WASM) | Cod compilat care rulează rapid în browser | Stockfish WASM pentru calcule rapide |
| **Protocol** | UCI (Universal Chess Interface) | Limbaj standard ca AI-urile de șah comunică | "position fen...", "go depth..." |
| **FEN** | FEN (Forsyth-Edwards Notation) | Reprezentare text compactă a unei poziții de șah | game.fen() salvează poziție |
| **Version Control** | Git | Sistem care salvează fiecare versiune a codului cu note | git commit, git log |
| **Runtime** | Node.js | Mediu care permite JavaScript să ruleze pe calculator (nu doar în browser) | npm install, npm run dev |
| **Render** | Render | Re-desenarea componentelor pe ecran când state se schimbă | React automatizează asta |

---

## Ce Urmează

Drumul continuă în 4 faze mai, dar acestea sunt mai ușoare acum că stii cum funcționează nucleul:

### Faza 4: Puzzle-uri Tactice
- Setări pre-gândite de poziții de șah (de obicei cu mat în 3 mutări)
- Player trebuie să găsească combinația câștigătoare
- Doar UI nou — logica de joc e aceeași

### Faza 5: PWA (Progressive Web App)
- Face aplicația instalabilă pe telefon
- Funcționează și offline
- Arată ca o aplicație nativă

### Faza 6: Polish & Deploy
- Animații și tranziții
- Responsive design (pe mobil, tablă, desktop)
- Deploy pe Vercel (hosting gratis)
- Share link cu prietenii

---

## Pentru a Aprofunda

Dacă vrei să mergi mai departe:

1. **Editează Board.tsx** — Schimbă `DIFFICULTY` la depth 20. De cât timp are nevoie AI-ul?
2. **Adaugă sunet** — Când se face o mutare, redă un sunet. Cauta `new Audio()` în docs React.
3. **Schimbă culori** — Editează Board.css pentru pătrate de alte culori.
4. **Opusul: tu ești negrul** — Modifică logica ca jucătorul să joace cu negrul, nu albul.
5. **Exportă la PGN** — PGN e formatul standard pentru partide de șah. Chess.js face asta ușor.

Fiecare dintre astea te-ar obliga să citești și să modifici cod — și asta e cum se învață development.

---

## Ghid Rapid: De la Zero la Running

1. **Instalează Node.js** de pe nodejs.org
2. În terminal, în folderul proiectului:
   ```bash
   npm install              # Descarcă dependențele
   npm run dev              # Pornește serverul local pe http://localhost:5173
   ```
3. Deschide browserul, joacă!
4. Pentru a vedea codul, deschide `src/Board.tsx` și citește comentariile

---

**Construiești. Înveți. Lansezi. Asta e development.**
