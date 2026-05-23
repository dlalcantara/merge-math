interface ScoreDisplayProps {
  score: number
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  return (
    <p aria-live="polite" className="score">
      Action Score: {score}
    </p>
  )
}
