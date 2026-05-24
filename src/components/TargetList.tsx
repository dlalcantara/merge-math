import type { Target } from '../engine/types'

interface TargetListProps {
  targets: Target[]
}

export function TargetList({ targets }: TargetListProps) {
  return (
    <ol className="target-list" aria-label="Targets">
      {targets.map(target => (
        <li key={target.value}>
          <span className={target.accomplished ? 'target-accomplished' : 'target-pending'}>
            {target.value}
          </span>
        </li>
      ))}
    </ol>
  )
}
