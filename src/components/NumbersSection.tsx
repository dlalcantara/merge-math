import { Grid } from './Grid'

interface NumbersSectionProps {
  cells: (number | null)[]
  selectedIdx: number | null
  onCellClick: (idx: number) => void
  onMergeAll: () => void
  onClearNumbers: () => void
  mergeAllDisabled: boolean
}

export function NumbersSection({
  cells,
  selectedIdx,
  onCellClick,
  onMergeAll,
  onClearNumbers,
  mergeAllDisabled,
}: NumbersSectionProps) {
  return (
    <section aria-label="Numbers Grid section" data-testid="numbers-section">
      <h2>Numbers Grid</h2>
      <Grid
        cells={cells}
        cols={3}
        label="Numbers Grid"
        selectedIdx={selectedIdx}
        onCellClick={onCellClick}
      />
      <div className="action-buttons" style={{ marginTop: 'var(--spacing-sm)' }}>
        <button
          onClick={onMergeAll}
          disabled={mergeAllDisabled}
          aria-disabled={mergeAllDisabled}
        >
          Merge All Numbers
        </button>
        <button onClick={onClearNumbers}>Clear Numbers Grid</button>
      </div>
    </section>
  )
}
