// Square.tsx — Un singur pătrat de pe tablă

import Piece from './Piece'

type SquareProps = {
  isLight: boolean
  position: string
  piece?: string
  isSelected?: boolean
  isLegalMove?: boolean
  isInCheck?: boolean
  isLifted?: boolean
  onClick?: () => void
}

function Square({ isLight, position, piece, isSelected, isLegalMove, isInCheck, isLifted, onClick }: SquareProps) {
  let className = `square ${isLight ? 'light' : 'dark'}`
  if (isSelected) className += ' selected'
  if (isLegalMove) className += ' legal-move'
  if (isInCheck) className += ' in-check'

  const file = position[0]  // a-h
  const rank = position[1]  // 1-8
  const showRank = file === 'a'  // coloana A: numere în dreapta-jos
  const showFile = rank === '1'  // rândul 1: litere în stânga-sus

  return (
    <div
      className={className}
      data-position={position}
      onClick={onClick}
    >
      {showRank && <span className="coord coord-rank">{rank}</span>}
      {showFile && <span className="coord coord-file">{file}</span>}
      {piece && <Piece type={piece} isLifted={isLifted} />}
      {isLegalMove && !piece && <div className="move-dot" />}
      {isLegalMove && piece && <div className="capture-ring" />}
    </div>
  )
}

export default Square
