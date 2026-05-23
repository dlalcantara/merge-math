import type { GameAction } from '../engine/types'

interface TargetListProps {
  targets: number[]
  dispatch: (action: GameAction) => void
}

export function TargetList({ targets, dispatch }: TargetListProps) {
  return (
    <ol className="target-list" aria-label="Targets">
      {targets.map(value => (
        <li key={value}>
          <button
            aria-label={`Claim target ${value}`}
            onClick={() => dispatch({ type: 'CLAIM_TARGET', targetValue: value })}
          >
            {value}
          </button>
        </li>
      ))}
    </ol>
  )
}
