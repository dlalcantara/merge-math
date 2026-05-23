import { useGame } from '../hooks/useGame'
import { OperatorSelector } from './OperatorSelector'
import { TargetList } from './TargetList'
import { WinModal } from './WinModal'
import { ScoreRow } from './ScoreRow'
import { NumbersSection } from './NumbersSection'
import { GeneratorsSection } from './GeneratorsSection'
import type { Operator } from '../engine/types'

interface GameBoardProps {
  initialTargets?: number[]
}

export function GameBoard({ initialTargets }: GameBoardProps) {
  const { store, dispatch } = useGame(initialTargets)
  const { current } = store
  const isWon = current.targets.length === 0

  function canMergeAll(): boolean {
    return (
      (current.activeOperator === '+' || current.activeOperator === '*') &&
      current.numbersGrid.filter(v => v !== null).length >= 2
    )
  }

  function canGenerateGenerator(): boolean {
    return current.generatorsGrid.some(v => v === null)
  }

  function handleNumbersCellClick(idx: number) {
    const cell = current.numbersGrid[idx]
    const selIdx = current.selectedNumbersIdx

    if (selIdx === null) {
      if (current.selectedGeneratorsIdx !== null) {
        // Selection lives in the other grid — cross-grid click
        if (cell !== null) {
          dispatch({ type: 'SELECT_CELL', grid: 'numbers', cellIdx: idx })
        } else {
          dispatch({ type: 'DESELECT_ALL' })
        }
        return
      }
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
      if (current.selectedNumbersIdx !== null) {
        // Selection lives in the other grid — cross-grid click
        if (cell !== null) {
          dispatch({ type: 'SELECT_CELL', grid: 'generators', cellIdx: idx })
        } else {
          dispatch({ type: 'DESELECT_ALL' })
        }
        return
      }
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

  function handleBoardClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!(e.target as HTMLElement).closest('button')) {
      dispatch({ type: 'DESELECT_ALL' })
    }
  }

  function handleClearNumbers() {
    if (window.confirm('Clear the Numbers Grid?')) {
      dispatch({ type: 'CLEAR_NUMBERS_GRID' })
    }
  }

  function handleClearGenerators() {
    if (window.confirm('Clear the Generators Grid?')) {
      dispatch({ type: 'CLEAR_GENERATORS_GRID' })
    }
  }

  return (
    <div className="game-board" onClick={handleBoardClick}>
      <ScoreRow
        score={current.actionScore}
        onUndo={() => dispatch({ type: 'UNDO' })}
        undoDisabled={store.history.length === 0}
      />

      <TargetList targets={current.targets} dispatch={dispatch} />

      <NumbersSection
        cells={current.numbersGrid}
        selectedIdx={current.selectedNumbersIdx}
        onCellClick={handleNumbersCellClick}
        onMergeAll={() => dispatch({ type: 'MERGE_ALL_NUMBERS' })}
        onClearNumbers={handleClearNumbers}
        mergeAllDisabled={!canMergeAll()}
      />

      <OperatorSelector
        activeOperator={current.activeOperator}
        onSelect={(op: Operator) => dispatch({ type: 'SET_OPERATOR', operator: op })}
      />

      <GeneratorsSection
        cells={current.generatorsGrid}
        selectedIdx={current.selectedGeneratorsIdx}
        onCellClick={handleGeneratorsCellClick}
        onGenerateGenerator={() => dispatch({ type: 'GENERATE_GENERATOR' })}
        onClearGenerators={handleClearGenerators}
        generateDisabled={!canGenerateGenerator()}
      />

      {isWon && <WinModal score={current.actionScore} dispatch={dispatch} />}
    </div>
  )
}
