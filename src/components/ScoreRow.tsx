interface ScoreRowProps {
  score: number
  onUndo: () => void
  undoDisabled: boolean
}

export function ScoreRow({ score, onUndo, undoDisabled }: ScoreRowProps) {
  return (
    <div
      data-testid="score-row"
      className="action-buttons"
      style={{ justifyContent: 'space-between', alignItems: 'center' }}
    >
      <p aria-live="polite" className="score" style={{ textAlign: 'left' }}>
        Action Score: {score}
      </p>
      <button onClick={onUndo} disabled={undoDisabled} aria-disabled={undoDisabled}>
        Undo
      </button>
    </div>
  )
}
