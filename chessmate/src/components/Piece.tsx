// Piece.tsx — Afișează o piesă de șah
// Primește tipul piesei (ex: "wK" = white King, "bP" = black Pawn)

// Importăm toate SVG-urile — Vite le transformă automat în URL-uri
import wK from '../assets/pieces/wK.svg'
import wQ from '../assets/pieces/wQ.svg'
import wR from '../assets/pieces/wR.svg'
import wB from '../assets/pieces/wB.svg'
import wN from '../assets/pieces/wN.svg'
import wP from '../assets/pieces/wP.svg'
import bK from '../assets/pieces/bK.svg'
import bQ from '../assets/pieces/bQ.svg'
import bR from '../assets/pieces/bR.svg'
import bB from '../assets/pieces/bB.svg'
import bN from '../assets/pieces/bN.svg'
import bP from '../assets/pieces/bP.svg'

// Harta: cod piesă → imagine SVG
const PIECE_IMAGES: Record<string, string> = {
  wK, wQ, wR, wB, wN, wP,
  bK, bQ, bR, bB, bN, bP,
}

type PieceProps = {
  type: string  // "wK", "bP", etc.
}

function Piece({ type }: PieceProps) {
  const src = PIECE_IMAGES[type]
  if (!src) return null

  return (
    <img
      className="piece"
      src={src}
      alt={type}
      draggable={false}
    />
  )
}

export default Piece
