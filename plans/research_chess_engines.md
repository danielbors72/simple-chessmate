# Cercetare: Motoare de Sah Istorice si Neobisnuite

> **Scop:** Referinta pentru reimplementare in JavaScript, in cadrul aplicatiei web ChessMate.
> **Data cercetarii:** 2026-04-03
> **Status:** Document de cercetare — informatii factuale verificate din surse publice.

---

## Cuprins

1. [Toledo Nanochess si familia Toledo](#1-toledo-nanochess-si-familia-toledo)
2. [Micro-Max](#2-micro-max)
3. [1K ZX Chess](#3-1k-zx-chess)
4. [Sargon](#4-sargon)
5. [ZX Spectrum Chess (Psion)](#5-zx-spectrum-chess-psion)
6. [Mephisto si era 68000](#6-mephisto-si-era-68000)
7. [Toledo Atomchess](#7-toledo-atomchess)
8. [Motoare JavaScript existente](#8-motoare-javascript-existente)
9. [Alte motoare istorice notabile](#9-alte-motoare-istorice-notabile)
10. [Analiza comparativa si recomandari](#10-analiza-comparativa-si-recomandari)

---

## 1. Toledo Nanochess si familia Toledo

### Date de baza
- **Autor:** Oscar Toledo Gutierrez (Mexic)
- **An:** 2005-2015 (diverse versiuni)
- **Limbaj:** C (original), JavaScript, Java, x86 Assembly
- **Dimensiune:** 1.257 caractere non-blank (versiunea Nanochess C)

### Versiuni ale familiei Toledo

| Versiune | Limbaj | Dimensiune | Note |
|----------|--------|-----------|------|
| Toledo Chess 1 | C | ~2.200 chars | Castigator IOCCC 2005 (18th), categoria Game |
| Toledo Chess 2 | C | mai mare | GUI X-Window/Windows, castigator IOCCC 19th |
| Toledo Nanochess | C | 1.257 chars non-blank | "Cel mai mic program de sah din lume in C" |
| Toledo Picochess | C | ~1K sursa | Fara en passant, rocada, promovare minora |
| Toledo JavaScript | JavaScript | 2.258 bytes | Port al Nanochess |
| Toledo JS1K | JavaScript | 1.023 bytes | Castigator al primului concurs JS1K (2010) |
| Toledo Java | Java | — | Port Java al Nanochess |
| Toledo Atomchess | x86 ASM | 326 bytes | Cea mai mica versiune |

### Cum functioneaza AI-ul

**Reprezentarea tablei:** Array 10x10 (`I[411]`) cu valori care codifica tipul si culoarea pieselor prin operatii bitwise.

**Algoritmul de cautare:**
- Minimax cu alpha-beta pruning
- Adancime standard: **6 ply** (6 semi-mutari)
- Functia recursiva `X()` gestioneaza atat generarea mutarilor cat si evaluarea

**Functia de evaluare:**
- Valori materiale: Cal=3, Nebun=4, Turn=5, Regina=6
- Evaluare pozitionala bazata pe zonele tablei
- Bonus tactic pentru avansarea pionilor, protectia pieselor, capturi
- Ponderare in functie de adancimea cautarii

**Versiunea JS1K (1.023 bytes):**
- Tabla vizuala HTML renderizata ca tabel cu celule clickabile
- AI cu minimax si cautare in adancime
- Date comprimate intr-un string: `"ECDFBDCEAAAAAAAAIIIIIIIIMKLNJLKM@G@TSb~?A6J57IKJT576,+-48HLSUmgukgg OJNMLK IDHGFE"`
- Raspuns AI cu delay de 75ms
- Highlight verde pentru ultima mutare

### Ce il face unic
- Cea mai mica implementare chess functionala din lume
- Castigator IOCCC si JS1K — doua competitii de prestigiu
- "A invins sute de jucatori incepatori" (conform autorului)
- **Exista deja in JavaScript** — cel mai direct candidat pentru reimplementare

### Cod sursa si referinte
- Site oficial: https://nanochess.org/chess.html
- Versiunea JS1K: https://js1k.com/2010-first/demo/750
- Carte: "Toledo Nanochess: The Commented Source Code" (2014)
- Licenta: open source

### Fezabilitate reimplementare JS: **EXCELENTA**
Exista deja versiunea Toledo JavaScript (2.258 bytes) si Toledo JS1K (1.023 bytes). Pot fi folosite direct sau extinse cu UI modern.

---

## 2. Micro-Max

### Date de baza
- **Autor:** Harm Geert Muller (H.G. Muller), Olanda
- **An:** ~2005-2010
- **Limbaj:** C portabil
- **Dimensiune:** ~2.000 caractere, 133 linii de cod sursa
- **Versiune minima cu reguli FIDE complete:** 1.433 caractere

### Cum functioneaza AI-ul

**Reprezentarea tablei:** 0x88 board representation — tehnica eficienta de validare a mutarilor prin manipulare de biti.

**Algoritmul de cautare:**
- **Recursive negamax** cu alpha-beta pruning
- **Quiescence search** cu extensii de recaptura
- **Hash transposition table** — stocheaza scoruri si cele mai bune mutari (16 milioane de intrari)
- **Iterative deepening** pentru managementul timpului
- **Late Move Reductions (LMR)** — optimizare avansata
- **Best-move-first sorting**

**Functia de evaluare:**
- Valori materiale standard
- Piece-square tables pozitionale calculate prin distanta fata de centru
- Penalizari pentru structura de pioni slaba
- Recunoastere sah mat si pat

**Reguli implementate:**
- Toate regulile FIDE (cu exceptia sub-promovarii in versiunea standard)
- Verificare legalitate mutari completa

### Ce il face unic
- "Cel mai mic program de sah in C" (inainte de Toledo Nanochess)
- Performanta surprinzator de buna: "bate Toledo cu usurinta" (conform autorului)
- Portat pe microcontrolere: Atmel ATmega88, computer de sah SHAH, Elektor ATM18
- Tehnici avansate (hash table, LMR, quiescence) comprimate in cod minimal

### Cod sursa si referinte
- Sursa comentata: https://home.hccnet.nl/h.g.muller/max-src2.html
- Wiki: https://www.chessprogramming.org/Micro-Max
- Licenta: open source

### Fezabilitate reimplementare JS: **FOARTE BUNA**
Codul C portabil se traduce relativ direct in JavaScript. Reprezentarea 0x88 si negamax sunt usor de implementat in JS. Ar oferi un motor mai puternic decat Toledo.

---

## 3. 1K ZX Chess

### Date de baza
- **Autor:** David Horne (UK)
- **An:** 1982 (publicat decembrie 1982 — februarie 1983)
- **Platforma:** Sinclair ZX81
- **Limbaj:** Z80 Assembly
- **Dimensiune:** 672 bytes (inclusiv interfata utilizator!)
- **RAM disponibil:** 1 KB

### Cum functioneaza AI-ul

**Limitari datorate dimensiunii:**
- Poate juca doar cu albul, incepand cu 1.e4 sau 1.d4
- **Nu implementeaza:** rocada, promovare, en passant
- Varianta extinsa pentru Timex Sinclair 1000 include aceste mutari

**Algoritm:**
- Cautare extrem de limitata in adancime (probabil 1-2 ply)
- Evaluare simplificata bazata pe material si pozitie de baza
- Optimizat agresiv pentru spatiu, nu pentru forta de joc

### Distributie
- Publicat in revista **Your Computer** (3 articole: dec 1982, ian 1983, feb 1983)
- Comercializat initial de autor, apoi de **Artic Computing** (Richard Turner si Chris Thornton)

### Ce il face unic
- **672 bytes** — probabil cel mai mic program de sah complet functional din istorie
- Demonstreaza ce se poate face cu 1KB de RAM
- Artefact istoric al erei microcomputerelor

### Cod sursa si referinte
- Listing Z80 Assembly disponibil online (copyright David Horne)
- Articole originale din Your Computer

### Fezabilitate reimplementare JS: **MEDIE-BUNA**
Logica este simpla, dar interesul vine din constrangerile hardware originale. In JS ar fi un exercitiu didactic — "cum gandea un computer cu 1KB." Ar trebui adaugata promovarea, rocada etc. pentru a fi complet.

---

## 4. Sargon

### Date de baza
- **Autori:** Dan Spracklen si Kathe Spracklen (SUA)
- **An:** 1977 (inceput), versiuni pana in ~1983
- **Platforma originala:** Wavemate Jupiter III (Z-80)
- **Limbaj:** Z-80 Assembly (Sargon I, II), 68000/8086/6502 (Sargon III)

### Versiuni si platforme

| Versiune | Procesor | Platforme |
|----------|----------|-----------|
| Sargon I | Z-80 | Wavemate Jupiter III, Apple II (port Gary Shannon) |
| Sargon II | Z-80, 6502 | Diverse home computers |
| Sargon III | 68000, 8086, 6502 | Mac, PC, Apple II, Amiga, Atari ST, Commodore, VIC-20 |

### Cum functioneaza AI-ul

**Sargon I:**
- Alpha-beta search pe 2 ply
- **Fara quiescence search** — foloseste evaluare de schimburi de tip SOMA (Swapping Off Material Analyzer)
- Evaluare statica a capturilor

**Sargon III (rewrite complet):**
- Quiescence search
- Transposition tables cu BCH hashing
- Cautare semnificativ mai profunda

### Istorie competitionala
- **1978:** Castigator al Second West Coast Computer Faire (scor perfect)
- **1978:** Loc 3 impartit la ACM 1978
- **1978:** A invins un supercalculator Amdahl 470 — eveniment cu mare acoperire mediatica
- Sargon III a fost baza programului din computerul de sah **Fidelity Excel** (68000)

### Cod sursa si referinte
- Listing-ul Z-80 Assembly, bine comentat, vandut initial ca document tiparit ($15)
- Publicat de **Hayden Books** cu explicatii complete si cod sursa
- Disponibil in arhive retro-computing online

### Ce il face unic
- Primul program de sah comercial de succes pentru microcomputere
- A demonstrat ca un microcomputer poate invinge un mainframe
- Cod sursa bine documentat — a servit ca manual de invatare pentru o generatie de programatori

### Fezabilitate reimplementare JS: **BUNA**
Algoritmii sunt bine documentati. Sargon I (2-ply + SOMA exchange eval) ar fi un exercitiu educativ excelent. Sargon III ar fi un motor competitiv.

---

## 5. ZX Spectrum Chess (Psion)

### Date de baza
- **Autor:** Anthony Adam (versiunea ZX Spectrum), Richard Lang (Psion/successorul)
- **An:** 1982 (ZX Spectrum Chess), 1983 (Psion)
- **Platforma:** ZX Spectrum (Adam), Sinclair QL/Mac/Atari ST/PC (Lang)
- **Limbaj:** Z80 Assembly (Spectrum), 68000 Assembly (Psion)
- **Distribuitor:** Psion Software / Mikro-Gen / Sinclair Research

### ZX Spectrum Chess de Anthony Adam
- Lansat 1982, distribuit cu/pentru ZX Spectrum
- Scris in Z80 Assembly
- Precursor al **Master Chess** (1984, Amstrad CPC)
- Detalii tehnice limitate in surse publice

### Psion de Richard Lang (succesorul spiritual)
- Successor al programului **Cyrus**
- **Nu a existat pe ZX Spectrum** — a fost pe Sinclair QL, Mac, Atari ST, MS-DOS

**Cum functioneaza AI-ul Psion:**
- Cautare hibrida: **4-5 ply brute force + 6-7 ply selective search**
- **Functie de evaluare asimetrica** — pune accent pe siguranta/defensiva
- **Piece-value-tables** strategice derivate din analiza de nivel master
- **Swap-off evaluation** (analiza statica a capturilor) in loc de cautare clasica de capturi
- ~4.000 noduri/secunda pe 68020 la 28 MHz

**Rezultate competitionale:**
- Co-castigator WMCCC 1984
- Castigator Software Event, WMCCC 1987
- Baza pentru programele Mephisto ale lui Richard Lang

### Fezabilitate reimplementare JS: **MEDIE**
Psion este complex si necesita cunostinte avansate. ZX Spectrum Chess de Adam are putina documentatie publica. Ideea de "selective search" este insa interesanta de implementat.

---

## 6. Mephisto si era 68000

### Date de baza
- **Producator:** Hegener & Glaser (Germania)
- **Programatori:** Richard Lang, Frans Morsch, Ulf Rathsman, Ed Schroeder, Johan de Koning
- **Procesor:** Motorola 68000 (16-bit) — de la Mephisto III-S in sus
- **Era:** 1980-1995
- **Tip:** Computere de sah dedicate (hardware + software)

### Cum functioneaza AI-ul

**Strategie de cautare pe trei niveluri:**

| Adancime | Comportament |
|----------|-------------|
| Shallow (1-3 ply) | Exploreaza larg, inclusiv sacrificii |
| Medium (4-8 ply) | Selecteaza mutari cu >30% probabilitate de succes |
| Deep (8+ ply) | Examineaza doar "completari clare" cu rata mare de succes |

Aceasta abordare crea arbori de cautare **mici si selectivi** comparativ cu competitorii brute-force — o strategie mai "umana."

### Istorie
- Mephisto I, II: procesoare 8-bit RCA CMOS
- Mephisto III-S: upgrade la 68000, castigator WMCCC 1984 Glasgow
- Mephisto Amsterdam (Richard Lang): castigator WMCCC 1985
- Mephisto Montreux (1995): ultimul competitor la WMCCC

### Legatura cu Sargon
Programul din computerul **Fidelity Excel** (68000) era bazat pe Sargon III al Spracklen-ilor.

### Ce il face unic
- Era de dominanta a computerelor de sah dedicate
- Demonstreaza ca selectivitatea poate invinge brute force
- Procesorul 68000 a permis cautare mai sofisticata decat Z80/6502

### Fezabilitate reimplementare JS: **SCAZUTA-MEDIE**
Conceptele (selective search, cautare pe niveluri) sunt interesante dar complexe. Mai potrivit ca sursa de inspiratie decat pentru reimplementare directa.

---

## 7. Toledo Atomchess

### Date de baza
- **Autor:** Oscar Toledo Gutierrez
- **An:** 2015, optimizat pana in 2019
- **Limbaj:** x86 Assembly, 6502 Assembly
- **Dimensiune:** 326 bytes (x86, versiunea finala), 1K (Atari 2600)

### Versiuni

| Versiune | Dimensiune | Platforma | Note |
|----------|-----------|-----------|------|
| Atomchess x86 (original) | 481 bytes | PC boot sector | — |
| Atomchess x86 (optimizat) | 326 bytes | PC boot sector | Dec 2019 |
| Atomchess Reloaded | 779-831 bytes | PC (2 boot sectors) | + rocada, en passant, promovare |
| Atomchess 6502 | 1K ROM | Atari VCS/2600 | Cu interfata grafica |

### Cum functioneaza AI-ul
- Cautare pe **3 ply**
- Reprezentarea tablei: **0x88** (array de 256 bytes)
- Valori piese: pion=1, cal/nebun=3, turn=5, regina=9
- Input in notatie algebrica
- Versiunea de baza: fara en passant, rocada, promovare

### Fezabilitate reimplementare JS: **BUNA (educational)**
Foarte simplu — 3 ply, evaluare materiala de baza. Perfect ca "Level 1" intr-o progresie de dificultate.

---

## 8. Motoare JavaScript existente

### 8.1 Toledo JavaScript Chess
- **Autor:** Oscar Toledo Gutierrez
- **Dimensiune:** 2.258 bytes
- **Sursa:** Port al Toledo Nanochess
- **Cautare:** Minimax cu alpha-beta, ~6 ply
- **Evaluare:** Material + pozitional
- **Licenta:** Open source
- **Verdict:** Cel mai direct candidat — deja functional in browser

### 8.2 Toledo JS1K Chess
- **Autor:** Oscar Toledo Gutierrez
- **Dimensiune:** 1.023 bytes
- **Sursa:** Castigator JS1K 2010
- **UI:** Tabel HTML clickabil
- **Verdict:** Demonstratie extrema de miniaturizare; prea limitat pentru uz practic

### 8.3 p4wn
- **Autor:** Douglas Bagnall
- **An:** 2002 (original), 2012 (rewrite)
- **Dimensiune:** Mic ("5k web page competition" entry)
- **Cautare:** Alpha-beta search (rescris din PVS in 2012 pentru claritate)
- **Evaluare:** Piece-square tables
- **Stil:** Agresiv — "face sacrificii nesabuite cand e in avantaj"
- **Reguli:** Toate regulile standard, ofera remize
- **Licenta:** CC0 / Public Domain
- **GitHub:** Disponibil
- **Verdict:** Excelent candidat — cod clar, licenta permisiva, deja in JS

### 8.4 Lozza
- **Autor:** Colin Jenkins
- **An:** 2014
- **Reprezentare:** Mailbox 12x12 cu piece lists
- **Cautare:** PVS cu iterative deepening, transposition table (Zobrist), null move pruning, LMR, IID
- **Evaluare:** "Simplified evaluation function" de Tomasz Michniewski
- **Ruleaza ca:** Web Worker in browser, sau UCI via Node.js
- **Licenta:** GPL v3.0
- **Verdict:** Motor puternic, dar complex. Bun ca referinta tehnica.

### 8.5 Wukong JS
- **Autor:** Maksim Korzh
- **Reprezentare:** 0x88 cu piece-lists
- **Cautare:** Iterative deepening + Negamax + PVS, Zobrist hashing, killer moves, history heuristic, null move pruning, razoring, futility pruning, LMR
- **Evaluare:** Tapered evaluation (PeSTO/RofChade), tuned cu Texel
- **Licenta:** Open source, GitHub
- **API:** Public API pentru integrare in site-uri terte
- **Verdict:** Motor modern si puternic, cu API documentat. Candidat serios.

### 8.6 Stockfish-js
- **Autor:** Diverse porturi (Emscripten)
- **Sursa:** Compilare Stockfish C++ -> JavaScript/WASM
- **Forta:** Nivel de grandmaster
- **Verdict:** Prea puternic si mare pentru scopuri educative/istorice. Deja folosit in ChessMate.

---

## 9. Alte motoare istorice notabile

### 9.1 Programul Bernstein (1957)
- **Autori:** Alex Bernstein, Michael Roberts, Timothy Arbuckle, Martin Belsky (IBM)
- **Platforma:** IBM 704
- **Semnificatie:** Primul program de sah complet functional din istorie
- **Nota:** Claude Shannon (creatorul teoriei informatiei) a aprobat abordarea
- **Fezabilitate JS:** Medie — importanta istorica enorma, dar documentatie tehnica limitata

### 9.2 Chess Challenger 1 (1977)
- **Creatori:** Sidney Samole si Ron Nelson
- **Producator:** Fidelity Electronics
- **Semnificatie:** Primul computer de sah dedicat comercial

### 9.3 Fidelity Excel (1987-1989)
- **Procesor:** Motorola 68000
- **Program:** Bazat pe Sargon III (Dan Spracklen)
- **Semnificatie:** Unul dintre cele mai populare computere de sah comerciale

---

## 10. Analiza comparativa si recomandari

### Tabel comparativ — candidati pentru reimplementare JS

| Motor | Dimensiune orig. | Dificultate reimpl. | Forta joc | Interes istoric | Exista in JS? |
|-------|------------------|---------------------|-----------|-----------------|---------------|
| Toledo JS | 2.258 B | Trivial (e deja JS) | Incepator+ | Foarte mare | **DA** |
| Toledo JS1K | 1.023 B | Trivial | Incepator | Foarte mare | **DA** |
| p4wn | ~5 KB | Trivial (e deja JS) | Mediu | Mare | **DA** |
| Micro-Max | ~2 KB C | Usoara | Mediu-bun | Foarte mare | Nu |
| Lozza | ~50 KB JS | Trivial (e deja JS) | Bun | Medie | **DA** |
| Wukong JS | ~30 KB JS | Trivial (e deja JS) | Bun | Medie | **DA** |
| Sargon I | ASM | Medie | Slab-mediu | Enorma | Nu |
| 1K ZX Chess | 672 B ASM | Medie | Slab | Enorma | Nu |
| Toledo Atomchess | 326 B ASM | Medie | Slab | Mare | Nu |

### Recomandari pentru ChessMate

**Tier 1 — Implementare directa (exista deja in JS):**
1. **Toledo JavaScript Chess** — cel mai mic motor functional, perfect pentru "retro mode"
2. **p4wn** — cod clar, CC0, stil agresiv interesant
3. **Wukong JS** — motor modern cu API, bun ca alternativa la Stockfish

**Tier 2 — Port din C (efort mic-mediu):**
4. **Micro-Max** — C portabil, cel mai bun raport forta/dimensiune cod
5. **Toledo Nanochess** — referinta clasica, bine documentat cu carte

**Tier 3 — Reimplementare inspirata (efort mediu, valoare educativa):**
6. **Sargon I** — algoritmul SOMA exchange evaluation e interesant didactic
7. **1K ZX Chess** — "cum juca un computer cu 1KB" — valoare nostalgica

**Abordare sugerata pentru ChessMate:**
- Integreaza **Toledo JS** sau **p4wn** ca motor "retro/clasic" alternativ la Stockfish
- Ofera nivele de dificultate bazate pe motoare diferite: Toledo (slab) -> p4wn (mediu) -> Stockfish (puternic)
- Adauga o sectiune "Istorie" care explica fiecare motor si contextul sau istoric

---

## Surse

- https://nanochess.org/chess.html — Site oficial Oscar Toledo
- https://home.hccnet.nl/h.g.muller/max-src2.html — Sursa Micro-Max
- https://www.chessprogramming.org/ — Wiki principal chess programming
- https://js1k.com/2010-first/demo/750 — Toledo JS1K entry
- "Toledo Nanochess: The Commented Source Code" (Oscar Toledo, 2014)
- "Sargon: A Computer Chess Program" (Dan & Kathe Spracklen, Hayden Books)
- Your Computer Magazine, dec 1982 — feb 1983 (articole 1K ZX Chess)
