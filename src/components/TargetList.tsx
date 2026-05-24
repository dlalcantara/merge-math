import type { GameAction, Target } from '../engine/types'

interface TargetListProps {
  targets: Target[]
  numbersGrid: (number | null)[]
  dispatch: (action: GameAction) => void
}

type TargetStatus = 'pending' | 'available' | 'accomplished'

function getStatus(target: Target, numbersGrid: (number | null)[]): TargetStatus {
  if (target.accomplished) return 'accomplished'
  if (numbersGrid.includes(target.value)) return 'available'
  return 'pending'
}

export function TargetList({ targets, numbersGrid, dispatch }: TargetListProps) {
  return (
    <ol className="target-list" aria-label="Targets">
      {targets.map(target => {
        const status = getStatus(target, numbersGrid)
        return (
          <li key={target.value}>
            <button
              className={`target-${status}`}
              aria-label={`Claim target ${target.value}`}
              onClick={
                status === 'available'
                  ? () => dispatch({ type: 'CLAIM_TARGET', targetValue: target.value })
                  : undefined
              }
            >
              {target.value}
            </button>
          </li>
        )
      })}
    </ol>
  )
}
