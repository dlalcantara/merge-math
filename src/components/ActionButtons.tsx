import type { GameAction, GameState, GameStore } from '../engine/types'

interface ActionButtonsProps {
  store: GameStore
  state: GameState
  dispatch: (action: GameAction) => void
}

function canMergeAll(state: GameState): boolean {
  return state.numbersGrid.filter(v => v !== null).length >= 2
}

function canGenerateGenerator(state: GameState): boolean {
  return state.generatorsGrid.some(v => v === null)
}

export function ActionButtons({ store, state, dispatch }: ActionButtonsProps) {
  function handleClearNumbers() {
    if (window.confirm('Clear the Numbers Grid?')) {
      dispatch({ type: 'CLEAR_NUMBERS_GRID' })
    }
  }

  function handleClearGenerators() {
    if (window.confirm('Clear the Generators Grid?')) {
      dispatch({ type: 'RESET_GENERATORS_GRID' })
    }
  }

  return (
    <div className="action-buttons">
      <button
        onClick={() => dispatch({ type: 'UNDO' })}
        disabled={store.history.length === 0}
        aria-disabled={store.history.length === 0}
      >
        Undo
      </button>

      <button
        onClick={() => dispatch({ type: 'MERGE_ALL_NUMBERS' })}
        disabled={!canMergeAll(state)}
        aria-disabled={!canMergeAll(state)}
      >
        Merge All Numbers
      </button>

      <button
        onClick={() => dispatch({ type: 'CONVERT_TO_GENERATOR' })}
        disabled={!canGenerateGenerator(state)}
        aria-disabled={!canGenerateGenerator(state)}
      >
        Generate Generator
      </button>

      <button onClick={handleClearNumbers}>
        Clear Numbers Grid
      </button>

      <button onClick={handleClearGenerators}>
        Clear Generators Grid
      </button>
    </div>
  )
}
