import type { CellValue } from '../engine/types'

interface CellProps {
  value: CellValue
  index: number
  selected: boolean
  onClick: (index: number) => void
  gridLabel: string
}

export function Cell({ value, index, selected, onClick, gridLabel }: CellProps) {
  return (
    <button
      aria-label={value !== null ? `${gridLabel} cell ${index + 1}, value ${value}` : `${gridLabel} cell ${index + 1}, empty`}
      aria-pressed={selected ? 'true' : 'false'}
      className={`cell${selected ? ' cell--selected' : ''}${value === null ? ' cell--empty' : ''}`}
      onClick={() => onClick(index)}
    >
      {value !== null ? value : ''}
    </button>
  )
}
