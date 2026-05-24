import type { GameStore, GameAction, GameState } from './types'
import { generateInitialState } from './gameState'
import { applyOperator } from './operators'

function scored(store: GameStore, next: GameState): GameStore {
  return {
    current: { ...next, actionScore: next.actionScore + 1 },
    history: [...store.history, store.current],
  }
}

function historical(store: GameStore, next: GameState): GameStore {
  return {
    current: next,
    history: [...store.history, store.current],
  }
}

export function gameReducer(store: GameStore, action: GameAction): GameStore {
  const { current, history } = store

  switch (action.type) {
    case 'SET_OPERATOR':
      return { ...store, current: { ...current, activeOperator: action.operator } }

    case 'SELECT_CELL': {
      if (action.grid === 'numbers') {
        return { ...store, current: { ...current, selectedNumbersIdx: action.cellIdx, selectedGeneratorsIdx: null } }
      }
      return { ...store, current: { ...current, selectedGeneratorsIdx: action.cellIdx, selectedNumbersIdx: null } }
    }

    case 'DESELECT_ALL':
      return { ...store, current: { ...current, selectedNumbersIdx: null, selectedGeneratorsIdx: null } }

    case 'DESELECT_CELL': {
      if (action.grid === 'numbers') {
        return { ...store, current: { ...current, selectedNumbersIdx: null } }
      }
      return { ...store, current: { ...current, selectedGeneratorsIdx: null } }
    }

    case 'MOVE_CELL': {
      const grid = action.grid === 'numbers' ? [...current.numbersGrid] : [...current.generatorsGrid]
      grid[action.targetIdx] = grid[action.sourceIdx]
      grid[action.sourceIdx] = null
      if (action.grid === 'numbers') {
        return { ...store, current: { ...current, numbersGrid: grid, selectedNumbersIdx: null } }
      }
      return { ...store, current: { ...current, generatorsGrid: grid, selectedGeneratorsIdx: null } }
    }

    case 'CONVERT_TO_GENERATOR': {
      if (current.selectedNumbersIdx === null) return store
      const selIdx = current.selectedNumbersIdx
      const value = current.numbersGrid[selIdx]
      if (value === null) return store
      const emptyGenIdx = current.generatorsGrid.indexOf(null)
      if (emptyGenIdx === -1) return store
      const nums = [...current.numbersGrid]
      nums[selIdx] = null
      const gens = [...current.generatorsGrid]
      gens[emptyGenIdx] = value
      return scored(store, {
        ...current,
        numbersGrid: nums,
        generatorsGrid: gens,
        selectedNumbersIdx: null,
      })
    }

    case 'GENERATE_NUMBER': {
      if (current.selectedGeneratorsIdx === null) return store
      const emptyIdx = current.numbersGrid.indexOf(null)
      if (emptyIdx === -1) return store
      const nums = [...current.numbersGrid]
      nums[emptyIdx] = current.generatorsGrid[current.selectedGeneratorsIdx]
      return scored(store, { ...current, numbersGrid: nums })
    }

    case 'MERGE_CELLS': {
      const sourceGrid = action.sourceGrid === 'numbers' ? [...current.numbersGrid] : [...current.generatorsGrid]
      const sourceVal = sourceGrid[action.sourceIdx] as number
      const targetVal = sourceGrid[action.targetIdx] as number
      const result = applyOperator(sourceVal, targetVal, current.activeOperator)
      if (action.sourceGrid === 'numbers') {
        sourceGrid[action.sourceIdx] = null
        sourceGrid[action.targetIdx] = result
        return scored(store, {
          ...current,
          numbersGrid: sourceGrid,
          selectedNumbersIdx: null,
          selectedGeneratorsIdx: null,
        })
      }
      sourceGrid[action.sourceIdx] = null
      sourceGrid[action.targetIdx] = result
      return scored(store, {
        ...current,
        generatorsGrid: sourceGrid,
        selectedNumbersIdx: null,
        selectedGeneratorsIdx: null,
      })
    }

    case 'CLAIM_TARGET': {
      const idx = current.targets.findIndex(t => t.value === action.targetValue && !t.accomplished)
      if (idx === -1) return store
      const available = current.numbersGrid.some(v => v === action.targetValue)
      if (!available) return store
      const targets = current.targets.map((t, i) =>
        i === idx ? { ...t, accomplished: true } : t
      )
      return historical(store, { ...current, targets })
    }

    case 'MERGE_ALL_NUMBERS': {
      const op = current.activeOperator
      if (op !== '+' && op !== '*') return store
      const values = current.numbersGrid.filter(v => v !== null) as number[]
      if (values.length < 2) return store
      const result = values.reduce((acc, v) => applyOperator(acc, v, op))
      const nums = Array(9).fill(null)
      nums[0] = result
      return scored(store, { ...current, numbersGrid: nums, selectedNumbersIdx: null })
    }

    case 'CLEAR_NUMBERS_GRID':
      return scored(store, {
        ...current,
        numbersGrid: Array(9).fill(null),
        selectedNumbersIdx: null,
      })

    case 'RESET_GENERATORS_GRID':
      return scored(store, {
        ...current,
        generatorsGrid: [1, null, null, null],
        selectedGeneratorsIdx: null,
      })

    case 'UNDO':
      if (history.length === 0) return store
      return { current: history[history.length - 1], history: history.slice(0, -1) }

    case 'NEW_GAME':
      return { current: generateInitialState(), history: [] }
  }
}
