// Square.tsx — Un singur pătrat de pe tablă

import Piece from './Piece'

type SquareProps = {
  isLight: boolean
  position: string
  piece?: string
  isSelected?: boolean
  isLegalMove?: boolean
  isInCheck?: boolean        // true = regele de pe acest pătrat e în șah
  onClick?: () => void
}

function Square({ isLight, position, piece, isSelected, isLegalMove, isInCheck, onClick }: SquareProps) {
  let className = `square ${isLight ? 'light' : 'dark'}`
  if (isSelected) className += ' selected'
  if (isLegalMove) className += ' legal-move'
  if (isInCheck) className += ' in-check'

  return (
    <div
      className={className}
      data-position={position}
      onClick={onClick}
    >
      {piece && <Piece type={piece} />}
      {isLegalMove && !piece && <div className="move-dot" />}
      {isLegalMove && piece && <div className="capture-ring" />}
    </div>
  )
}

export default Square
