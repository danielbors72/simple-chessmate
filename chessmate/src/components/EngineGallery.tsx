// EngineGallery.tsx — Galerie de motoare cu timeline și cards informative

import { ENGINES } from '../engine/engines'
import './EngineGallery.css'

// Detalii extinse per motor — poveste, dimensiune, fapte
const ENGINE_STORIES: Record<string, { size: string; fact: string }> = {
  'Stockfish 18': {
    size: '~150 MB (WASM)',
    fact: 'Cel mai puternic motor open-source. Evaluare cu rețea neuronală NNUE, milioane de poziții pe secundă.',
  },
  'Sargon I': {
    size: '~4 KB Assembly Z-80',
    fact: 'În 1978, a învins supercalculatorul Amdahl 470 — un eveniment care a făcut prima pagină a ziarelor.',
  },
  '1K ZX Chess': {
    size: '672 bytes',
    fact: 'Tot programul, inclusiv interfața, încape în 672 bytes. ZX81 avea doar 1KB RAM în total.',
  },
  'p4wn': {
    size: '~5 KB JavaScript',
    fact: 'Creat pentru concursul "5K web page". Licență CC0 (public domain). Stil: sacrificii nesăbuite.',
  },
  'Toledo Nanochess': {
    size: '2.258 bytes JavaScript',
    fact: 'Câștigător IOCCC 2005 și JS1K 2010. Oscar Toledo a scris o carte de 326 pagini explicând codul.',
  },
  'Micro-Max': {
    size: '~2.000 caractere C',
    fact: 'Hash tables, quiescence search și LMR — tehnici avansate comprimate în cod minimal. Portat pe microcontrolere.',
  },
  'Random': {
    size: '~20 linii',
    fact: 'Alege o mutare legală la întâmplare. Surprinzător de greu de bătut dacă nu ești atent.',
  },
}

// Timeline dots — ani distincte pentru motoare, sortate cronologic
const timelineEngines = [...ENGINES]
  .filter(e => e.name !== 'Random')
  .sort((a, b) => a.year - b.year)

function EngineGallery() {
  return (
    <div className="engine-gallery">
      <h2 className="gallery-title">motoare de șah</h2>
      <p className="gallery-subtitle">de la 672 bytes la rețele neuronale — 47 ani de evoluție</p>

      {/* Timeline vizual */}
      <div className="timeline">
        <div className="timeline-line" />
        {timelineEngines.map((engine) => (
          <div key={engine.name} className="timeline-dot-wrapper">
            <div className="timeline-dot" />
            <span className="timeline-year">{engine.year}</span>
            <span className="timeline-name">{engine.name}</span>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div className="engine-cards">
        {ENGINES.filter(e => e.name !== 'Random').map((engine) => {
          const story = ENGINE_STORIES[engine.name]
          return (
            <div key={engine.name} className="engine-card">
              <div className="card-header">
                <span className="card-name">{engine.name}</span>
                <span className="card-year">{engine.year}</span>
              </div>
              <div className="card-author">{engine.author}</div>
              {story && (
                <>
                  <div className="card-size">{story.size}</div>
                  <p className="card-fact">{story.fact}</p>
                </>
              )}
              <div className="card-diff">
                {engine.difficulty.map(d => d.label).join(' · ')}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default EngineGallery
