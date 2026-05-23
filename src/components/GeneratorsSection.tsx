import { Grid } from './Grid'

interface GeneratorsSectionProps {
  cells: (number | null)[]
  selectedIdx: number | null
  onCellClick: (idx: number) => void
  onGenerateGenerator: () => void
  onClearGenerators: () => void
  generateDisabled: boolean
}

export function GeneratorsSection({
  cells,
  selectedIdx,
  onCellClick,
  onGenerateGenerator,
  onClearGenerators,
  generateDisabled,
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
        <button
          onClick={onGenerateGenerator}
          disabled={generateDisabled}
          aria-disabled={generateDisabled}
        >
          Generate Generator
        </button>
        <button onClick={onClearGenerators}>Clear Generators Grid</button>
      </div>
    </section>
  )
}
