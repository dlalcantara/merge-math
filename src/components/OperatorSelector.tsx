import type { Operator } from '../engine/types'

const OPERATORS: Operator[] = ['+', '-', '*', '/']

interface OperatorSelectorProps {
  activeOperator: Operator
  onSelect: (op: Operator) => void
}

export function OperatorSelector({ activeOperator, onSelect }: OperatorSelectorProps) {
  return (
    <fieldset className="operator-selector" aria-label="Arithmetic operator">
      <legend className="sr-only">Operator</legend>
      {OPERATORS.map(op => (
        <button
          key={op}
          aria-pressed={activeOperator === op ? 'true' : 'false'}
          className={`operator-btn${activeOperator === op ? ' operator-btn--active' : ''}`}
          onClick={() => onSelect(op)}
        >
          {op}
        </button>
      ))}
    </fieldset>
  )
}
