// MoveArrow.tsx — Săgeată semi-transparentă pentru ultima mutare
// Se desenează pe un SVG overlay peste tablă

type MoveArrowProps = {
  from: { col: number; row: number }
  to: { col: number; row: number }
}

function MoveArrow({ from, to }: MoveArrowProps) {
  // Coordonate ca procente (centrul fiecărui pătrat)
  const x1 = (from.col + 0.5) * 12.5
  const y1 = (from.row + 0.5) * 12.5
  const x2 = (to.col + 0.5) * 12.5
  const y2 = (to.row + 0.5) * 12.5

  // Scurtăm săgeata ușor la capete (să nu înceapă/termine exact din centru)
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  const nx = dx / len
  const ny = dy / len

  // Offset de la centru: 15% din pătrat
  const offset = 1.8
  const sx = x1 + nx * offset
  const sy = y1 + ny * offset
  const ex = x2 - nx * offset
  const ey = y2 - ny * offset

  return (
    <svg className="move-arrow-svg" viewBox="0 0 100 100">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="3"
          markerHeight="3"
          refX="2.2"
          refY="1.5"
          orient="auto"
        >
          <polygon
            points="0 0, 3 1.5, 0 3"
            fill="rgba(240, 184, 40, 0.55)"
          />
        </marker>
      </defs>
      <line
        x1={sx}
        y1={sy}
        x2={ex}
        y2={ey}
        stroke="rgba(240, 184, 40, 0.55)"
        strokeWidth="1.8"
        strokeLinecap="round"
        markerEnd="url(#arrowhead)"
      />
    </svg>
  )
}

export default MoveArrow
