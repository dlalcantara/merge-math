import { useGame } from '../hooks/useGame'
import { Grid } from './Grid'
import { OperatorSelector } from './OperatorSelector'
import { TargetList } from './TargetList'
import { WinModal } from './WinModal'
import { ScoreDisplay } from './ScoreDisplay'
import { ActionButtons } from './ActionButtons'
import type { Operator } from '../engine/types'

export function GameBoard() {
  const { store, dispatch } = useGame()
  const { current } = store
  const isWon = current.targets.length === 0

  function handleNumbersCellClick(idx: number) {
    const cell = current.numbersGrid[idx]
    const selIdx = current.selectedNumbersIdx

    if (selIdx === null) {
      if (cell !== null) {
        dispatch({ type: 'SELECT_CELL', grid: 'numbers', cellIdx: idx })
      }
      return
    }

    if (selIdx === idx) {
      dispatch({ type: 'DESELECT_CELL', grid: 'numbers' })
      return
    }

    if (cell === null) {
      dispatch({ type: 'MOVE_CELL', grid: 'numbers', sourceIdx: selIdx, targetIdx: idx })
      return
    }

    dispatch({ type: 'MERGE_CELLS', sourceGrid: 'numbers', sourceIdx: selIdx, targetIdx: idx })
  }

  function handleGeneratorsCellClick(idx: number) {
    const cell = current.generatorsGrid[idx]
    const selIdx = current.selectedGeneratorsIdx

    if (selIdx === null) {
      if (cell !== null) {
        dispatch({ type: 'SELECT_CELL', grid: 'generators', cellIdx: idx })
      }
      return
    }

    if (selIdx === idx) {
      const hasEmptyNumber = current.numbersGrid.some(v => v === null)
      if (hasEmptyNumber) {
        dispatch({ type: 'GENERATE_NUMBER' })
      } else {
        dispatch({ type: 'DESELECT_CELL', grid: 'generators' })
      }
      return
    }

    if (cell === null) {
      dispatch({ type: 'MOVE_CELL', grid: 'generators', sourceIdx: selIdx, targetIdx: idx })
      return
    }

    dispatch({ type: 'MERGE_CELLS', sourceGrid: 'generators', sourceIdx: selIdx, targetIdx: idx })
  }

  return (
    <div className="game-board">
      <ScoreDisplay score={current.actionScore} />

      <section aria-label="Numbers Grid section">
        <h2>Numbers Grid</h2>
        <Grid
          cells={current.numbersGrid}
          cols={3}
          label="Numbers Grid"
          selectedIdx={current.selectedNumbersIdx}
          onCellClick={handleNumbersCellClick}
        />
      </section>

      <section aria-label="Generators Grid section">
        <h2>Generators Grid</h2>
        <Grid
          cells={current.generatorsGrid}
          cols={2}
          label="Generators Grid"
          selectedIdx={current.selectedGeneratorsIdx}
          onCellClick={handleGeneratorsCellClick}
        />
      </section>

      <OperatorSelector
        activeOperator={current.activeOperator}
        onSelect={(op: Operator) => dispatch({ type: 'SET_OPERATOR', operator: op })}
      />

      <TargetList targets={current.targets} dispatch={dispatch} />

      <ActionButtons store={store} state={current} dispatch={dispatch} />

      {isWon && <WinModal score={current.actionScore} dispatch={dispatch} />}
    </div>
  )
}
