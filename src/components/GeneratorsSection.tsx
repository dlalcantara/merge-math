import { Grid } from './Grid'

interface GeneratorsSectionProps {
  cells: (number | null)[]
  selectedIdx: number | null
  onCellClick: (idx: number) => void
  onResetGenerators: () => void
}

export function GeneratorsSection({
  cells,
  selectedIdx,
  onCellClick,
  onResetGenerators,
}: GeneratorsSectionProps) {
  return (
    <section aria-label="Generators Grid section" data-testid="generators-section">
      <h2>Generators Grid</h2>
      <Grid
        cells={cells}
        cols={2}
        label="Generators Grid"
        selectedIdx={selectedIdx}
        onCellClick={onCellClick}
      />
      <div className="action-buttons" style={{ marginTop: 'var(--spacing-sm)' }}>
        <button onClick={onResetGenerators}>Reset Generators Grid</button>
      </div>
    </section>
  )
}
