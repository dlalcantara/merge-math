import { useState, useRef, useCallback } from 'react'
import { useGame } from '../hooks/useGame'
import { OperatorSelector } from './OperatorSelector'
import { TargetList } from './TargetList'
import { WinModal } from './WinModal'
import { ScoreRow } from './ScoreRow'
import { NumbersSection } from './NumbersSection'
import { GeneratorsSection } from './GeneratorsSection'
import { buildShareUrl, copyToClipboard } from '../utils/shareUrl'
import type { Operator, Target } from '../engine/types'

interface GameBoardProps {
  initialTargets?: Target[]
}

export function GameBoard({ initialTargets }: GameBoardProps) {
  const { store, dispatch } = useGame(initialTargets)
  const { current } = store
  const isWon = current.targets.every(t => t.accomplished)

  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'fallback'>('idle')
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleShare = useCallback(async () => {
    const url = buildShareUrl(current.targets.map(t => t.value))
    const result = await copyToClipboard(url)
    if (result === 'success') {
      setCopyState('copied')
      setFallbackUrl(null)
      if (resetTimer.current) clearTimeout(resetTimer.current)
      resetTimer.current = setTimeout(() => setCopyState('idle'), 2000)
    } else {
      setCopyState('fallback')
      setFallbackUrl(url)
    }
  }, [current.targets])

  function canMergeAll(): boolean {
    return (
      (current.activeOperator === '+' || current.activeOperator === '*') &&
      current.numbersGrid.filter(v => v !== null).length >= 2
    )
  }

  function handleNumbersCellClick(idx: number) {
    const cell = current.numbersGrid[idx]
    const selIdx = current.selectedNumbersIdx

    if (selIdx === null) {
      if (current.selectedGeneratorsIdx !== null) {
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

    dispatch({ type: 'SELECT_CELL', grid: 'generators', cellIdx: idx })
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

  function handleResetGenerators() {
    if (window.confirm('Reset the Generators Grid?')) {
      dispatch({ type: 'RESET_GENERATORS_GRID' })
    }
  }

  function handleConvertToGenerator() {
    dispatch({ type: 'CONVERT_TO_GENERATOR' })
  }

  return (
    <div className="game-board" onClick={handleBoardClick}>
      <ScoreRow
        score={current.actionScore}
        onUndo={() => dispatch({ type: 'UNDO' })}
        undoDisabled={store.history.length === 0}
        onShare={handleShare}
        copyState={copyState}
        fallbackUrl={fallbackUrl}
      />

      <TargetList targets={current.targets} />

      <NumbersSection
        cells={current.numbersGrid}
        selectedIdx={current.selectedNumbersIdx}
        onCellClick={handleNumbersCellClick}
        onMergeAll={() => dispatch({ type: 'MERGE_ALL_NUMBERS' })}
        onClearNumbers={handleClearNumbers}
        onConvertToGenerator={handleConvertToGenerator}
        convertDisabled={current.selectedNumbersIdx === null}
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
        onResetGenerators={handleResetGenerators}
      />

      {isWon && <WinModal score={current.actionScore} dispatch={dispatch} />}
    </div>
  )
}
