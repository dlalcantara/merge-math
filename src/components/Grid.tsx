import type { CellValue } from '../engine/types'
import { Cell } from './Cell'

interface GridProps {
  cells: CellValue[]
  cols: number
  label: string
  selectedIdx: number | null
  onCellClick: (index: number) => void
}

export function Grid({ cells, cols, label, selectedIdx, onCellClick }: GridProps) {
  return (
    <div
      role="grid"
      aria-label={label}
      className="grid"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {cells.map((value, i) => (
        <Cell
          key={i}
          value={value}
          index={i}
          selected={selectedIdx === i}
          onClick={onCellClick}
          gridLabel={label}
        />
      ))}
    </div>
  )
}
