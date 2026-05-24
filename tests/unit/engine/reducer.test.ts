import { describe, it, expect } from 'vitest'
import { gameReducer } from '../../../src/engine/reducer'
import type { GameStore, GameState } from '../../../src/engine/types'

function makeStore(overrides: Partial<GameState> = {}): GameStore {
  const base: GameState = {
    numbersGrid: Array(9).fill(null),
    generatorsGrid: [1, null, null, null],
    targets: [
      { value: 1, accomplished: false },
      { value: 2, accomplished: false },
      { value: 5, accomplished: false },
      { value: 12, accomplished: false },
      { value: 25, accomplished: false },
      { value: 67, accomplished: false },
      { value: 69, accomplished: false },
      { value: -420, accomplished: false },
    ],
    activeOperator: '+',
    actionScore: 0,
    selectedNumbersIdx: null,
    selectedGeneratorsIdx: null,
  }
  return { current: { ...base, ...overrides }, history: [] }
}

describe('GENERATE_NUMBER', () => {
  it('copies selected generator value to first null numbersGrid slot', () => {
    const store = makeStore({ generatorsGrid: [5, null, null, null], selectedGeneratorsIdx: 0 })
    const next = gameReducer(store, { type: 'GENERATE_NUMBER' })
    expect(next.current.numbersGrid[0]).toBe(5)
  })

  it('increments actionScore by 1', () => {
    const store = makeStore({ generatorsGrid: [5, null, null, null], selectedGeneratorsIdx: 0 })
    const next = gameReducer(store, { type: 'GENERATE_NUMBER' })
    expect(next.current.actionScore).toBe(1)
  })

  it('pushes to history', () => {
    const store = makeStore({ generatorsGrid: [5, null, null, null], selectedGeneratorsIdx: 0 })
    const next = gameReducer(store, { type: 'GENERATE_NUMBER' })
    expect(next.history).toHaveLength(1)
  })

  it('returns unchanged store when numbersGrid is full', () => {
    const store = makeStore({
      numbersGrid: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      generatorsGrid: [5, null, null, null],
      selectedGeneratorsIdx: 0,
    })
    const next = gameReducer(store, { type: 'GENERATE_NUMBER' })
    expect(next).toBe(store)
  })

  it('returns unchanged store when no generator is selected', () => {
    const store = makeStore({ generatorsGrid: [5, null, null, null], selectedGeneratorsIdx: null })
    const next = gameReducer(store, { type: 'GENERATE_NUMBER' })
    expect(next).toBe(store)
  })

  it('preserves selectedGeneratorsIdx after GENERATE_NUMBER', () => {
    const store = makeStore({ generatorsGrid: [5, null, null, null], selectedGeneratorsIdx: 0 })
    const next = gameReducer(store, { type: 'GENERATE_NUMBER' })
    expect(next.current.selectedGeneratorsIdx).toBe(0)
  })
})

describe('MERGE_CELLS (generators grid)', () => {
  it('applies + operator and places result on target, clears source', () => {
    const store = makeStore({ generatorsGrid: [3, 5, null, null], selectedGeneratorsIdx: 0 })
    const next = gameReducer(store, { type: 'MERGE_CELLS', sourceGrid: 'generators', sourceIdx: 0, targetIdx: 1 })
    expect(next.current.generatorsGrid[1]).toBe(8)
    expect(next.current.generatorsGrid[0]).toBeNull()
  })

  it('applies * operator', () => {
    const store = makeStore({ generatorsGrid: [3, 5, null, null], activeOperator: '*', selectedGeneratorsIdx: 0 })
    const next = gameReducer(store, { type: 'MERGE_CELLS', sourceGrid: 'generators', sourceIdx: 0, targetIdx: 1 })
    expect(next.current.generatorsGrid[1]).toBe(15)
  })

  it('increments actionScore by 1', () => {
    const store = makeStore({ generatorsGrid: [3, 5, null, null] })
    const next = gameReducer(store, { type: 'MERGE_CELLS', sourceGrid: 'generators', sourceIdx: 0, targetIdx: 1 })
    expect(next.current.actionScore).toBe(1)
  })

  it('clears generators selection after merge', () => {
    const store = makeStore({ generatorsGrid: [3, 5, null, null], selectedGeneratorsIdx: 0 })
    const next = gameReducer(store, { type: 'MERGE_CELLS', sourceGrid: 'generators', sourceIdx: 0, targetIdx: 1 })
    expect(next.current.selectedGeneratorsIdx).toBeNull()
  })

  it('pushes to history', () => {
    const store = makeStore({ generatorsGrid: [3, 5, null, null] })
    const next = gameReducer(store, { type: 'MERGE_CELLS', sourceGrid: 'generators', sourceIdx: 0, targetIdx: 1 })
    expect(next.history).toHaveLength(1)
  })

  it('undo restores both generator cells', () => {
    const store = makeStore({ generatorsGrid: [3, 5, null, null] })
    const merged = gameReducer(store, { type: 'MERGE_CELLS', sourceGrid: 'generators', sourceIdx: 0, targetIdx: 1 })
    const undone = gameReducer(merged, { type: 'UNDO' })
    expect(undone.current.generatorsGrid[0]).toBe(3)
    expect(undone.current.generatorsGrid[1]).toBe(5)
  })
})

describe('MERGE_CELLS', () => {
  it('applies + operator and clears source', () => {
    const store = makeStore({
      numbersGrid: [3, 4, null, null, null, null, null, null, null],
      selectedNumbersIdx: 0,
    })
    const next = gameReducer(store, { type: 'MERGE_CELLS', sourceGrid: 'numbers', sourceIdx: 0, targetIdx: 1 })
    expect(next.current.numbersGrid[1]).toBe(7)
    expect(next.current.numbersGrid[0]).toBeNull()
  })

  it('applies - operator', () => {
    const store = makeStore({
      numbersGrid: [10, 3, null, null, null, null, null, null, null],
      activeOperator: '-',
      selectedNumbersIdx: 0,
    })
    const next = gameReducer(store, { type: 'MERGE_CELLS', sourceGrid: 'numbers', sourceIdx: 0, targetIdx: 1 })
    expect(next.current.numbersGrid[1]).toBe(7)
  })

  it('applies * operator', () => {
    const store = makeStore({
      numbersGrid: [4, 5, null, null, null, null, null, null, null],
      activeOperator: '*',
      selectedNumbersIdx: 0,
    })
    const next = gameReducer(store, { type: 'MERGE_CELLS', sourceGrid: 'numbers', sourceIdx: 0, targetIdx: 1 })
    expect(next.current.numbersGrid[1]).toBe(20)
  })

  it('applies / operator with truncation', () => {
    const store = makeStore({
      numbersGrid: [10, 3, null, null, null, null, null, null, null],
      activeOperator: '/',
      selectedNumbersIdx: 0,
    })
    const next = gameReducer(store, { type: 'MERGE_CELLS', sourceGrid: 'numbers', sourceIdx: 0, targetIdx: 1 })
    expect(next.current.numbersGrid[1]).toBe(3)
  })

  it('division by zero returns 0', () => {
    const store = makeStore({
      numbersGrid: [5, 0, null, null, null, null, null, null, null],
      activeOperator: '/',
      selectedNumbersIdx: 0,
    })
    const next = gameReducer(store, { type: 'MERGE_CELLS', sourceGrid: 'numbers', sourceIdx: 0, targetIdx: 1 })
    expect(next.current.numbersGrid[1]).toBe(0)
  })

  it('increments actionScore by 1', () => {
    const store = makeStore({
      numbersGrid: [3, 4, null, null, null, null, null, null, null],
      selectedNumbersIdx: 0,
    })
    const next = gameReducer(store, { type: 'MERGE_CELLS', sourceGrid: 'numbers', sourceIdx: 0, targetIdx: 1 })
    expect(next.current.actionScore).toBe(1)
  })

  it('pushes to history', () => {
    const store = makeStore({
      numbersGrid: [3, 4, null, null, null, null, null, null, null],
      selectedNumbersIdx: 0,
    })
    const next = gameReducer(store, { type: 'MERGE_CELLS', sourceGrid: 'numbers', sourceIdx: 0, targetIdx: 1 })
    expect(next.history).toHaveLength(1)
  })

  it('clears selection after merge', () => {
    const store = makeStore({
      numbersGrid: [3, 4, null, null, null, null, null, null, null],
      selectedNumbersIdx: 0,
    })
    const next = gameReducer(store, { type: 'MERGE_CELLS', sourceGrid: 'numbers', sourceIdx: 0, targetIdx: 1 })
    expect(next.current.selectedNumbersIdx).toBeNull()
  })
})

describe('CONVERT_TO_GENERATOR', () => {
  it('moves selected number to first empty generator slot', () => {
    const store = makeStore({
      numbersGrid: [7, null, null, null, null, null, null, null, null],
      generatorsGrid: [1, null, null, null],
      selectedNumbersIdx: 0,
    })
    const next = gameReducer(store, { type: 'CONVERT_TO_GENERATOR' })
    expect(next.current.numbersGrid[0]).toBeNull()
    expect(next.current.generatorsGrid[1]).toBe(7)
  })

  it('increments actionScore by 1', () => {
    const store = makeStore({
      numbersGrid: [7, null, null, null, null, null, null, null, null],
      generatorsGrid: [1, null, null, null],
      selectedNumbersIdx: 0,
    })
    const next = gameReducer(store, { type: 'CONVERT_TO_GENERATOR' })
    expect(next.current.actionScore).toBe(1)
  })

  it('pushes to history', () => {
    const store = makeStore({
      numbersGrid: [7, null, null, null, null, null, null, null, null],
      generatorsGrid: [1, null, null, null],
      selectedNumbersIdx: 0,
    })
    const next = gameReducer(store, { type: 'CONVERT_TO_GENERATOR' })
    expect(next.history).toHaveLength(1)
  })

  it('undo restores the number and removes the generator', () => {
    const store = makeStore({
      numbersGrid: [7, null, null, null, null, null, null, null, null],
      generatorsGrid: [1, null, null, null],
      selectedNumbersIdx: 0,
    })
    const converted = gameReducer(store, { type: 'CONVERT_TO_GENERATOR' })
    const undone = gameReducer(converted, { type: 'UNDO' })
    expect(undone.current.numbersGrid[0]).toBe(7)
    expect(undone.current.generatorsGrid[1]).toBeNull()
  })

  it('clears selectedNumbersIdx after converting', () => {
    const store = makeStore({
      numbersGrid: [7, null, null, null, null, null, null, null, null],
      generatorsGrid: [1, null, null, null],
      selectedNumbersIdx: 0,
    })
    const next = gameReducer(store, { type: 'CONVERT_TO_GENERATOR' })
    expect(next.current.selectedNumbersIdx).toBeNull()
  })

  it('returns unchanged store when selectedNumbersIdx is null', () => {
    const store = makeStore({
      numbersGrid: [7, null, null, null, null, null, null, null, null],
      generatorsGrid: [1, null, null, null],
      selectedNumbersIdx: null,
    })
    const next = gameReducer(store, { type: 'CONVERT_TO_GENERATOR' })
    expect(next).toBe(store)
  })

  it('returns unchanged store when generatorsGrid is full', () => {
    const store = makeStore({
      numbersGrid: [7, null, null, null, null, null, null, null, null],
      generatorsGrid: [1, 2, 3, 4],
      selectedNumbersIdx: 0,
    })
    const next = gameReducer(store, { type: 'CONVERT_TO_GENERATOR' })
    expect(next).toBe(store)
  })
})

describe('RESET_GENERATORS_GRID', () => {
  it('resets generatorsGrid to [1, null, null, null]', () => {
    const store = makeStore({ generatorsGrid: [3, 5, 7, 9] })
    const next = gameReducer(store, { type: 'RESET_GENERATORS_GRID' })
    expect(next.current.generatorsGrid).toEqual([1, null, null, null])
  })

  it('increments actionScore by 1', () => {
    const store = makeStore({ generatorsGrid: [3, 5, 7, 9] })
    const next = gameReducer(store, { type: 'RESET_GENERATORS_GRID' })
    expect(next.current.actionScore).toBe(1)
  })

  it('pushes to history', () => {
    const store = makeStore({ generatorsGrid: [3, 5, 7, 9] })
    const next = gameReducer(store, { type: 'RESET_GENERATORS_GRID' })
    expect(next.history).toHaveLength(1)
  })

  it('undo restores previous generators', () => {
    const store = makeStore({ generatorsGrid: [3, 5, 7, 9] })
    const reset = gameReducer(store, { type: 'RESET_GENERATORS_GRID' })
    const undone = gameReducer(reset, { type: 'UNDO' })
    expect(undone.current.generatorsGrid).toEqual([3, 5, 7, 9])
  })

  it('clears selectedGeneratorsIdx', () => {
    const store = makeStore({ generatorsGrid: [3, 5, 7, 9], selectedGeneratorsIdx: 0 })
    const next = gameReducer(store, { type: 'RESET_GENERATORS_GRID' })
    expect(next.current.selectedGeneratorsIdx).toBeNull()
  })
})

describe('GENERATE_NUMBER auto-accomplish', () => {
  it('auto-accomplishes a target when generated number matches it', () => {
    const store = makeStore({ generatorsGrid: [1, null, null, null], selectedGeneratorsIdx: 0 })
    const next = gameReducer(store, { type: 'GENERATE_NUMBER' })
    expect(next.current.targets[0].accomplished).toBe(true)
  })

  it('leaves the number in numbersGrid after auto-accomplish', () => {
    const store = makeStore({ generatorsGrid: [1, null, null, null], selectedGeneratorsIdx: 0 })
    const next = gameReducer(store, { type: 'GENERATE_NUMBER' })
    expect(next.current.numbersGrid[0]).toBe(1)
  })

  it('does not increment actionScore for the auto-accomplish (score only increments once for the generate action)', () => {
    const store = makeStore({ generatorsGrid: [1, null, null, null], selectedGeneratorsIdx: 0 })
    const next = gameReducer(store, { type: 'GENERATE_NUMBER' })
    expect(next.current.actionScore).toBe(1)
  })

  it('does not auto-accomplish an already-accomplished target', () => {
    const store = makeStore({
      generatorsGrid: [1, null, null, null],
      selectedGeneratorsIdx: 0,
      targets: [{ value: 1, accomplished: true }, { value: 2, accomplished: false }],
    })
    const next = gameReducer(store, { type: 'GENERATE_NUMBER' })
    expect(next.current.targets[0].accomplished).toBe(true)
    expect(next.current.targets[1].accomplished).toBe(false)
  })

  it('does not auto-accomplish a target whose value is not generated', () => {
    const store = makeStore({ generatorsGrid: [3, null, null, null], selectedGeneratorsIdx: 0 })
    const next = gameReducer(store, { type: 'GENERATE_NUMBER' })
    expect(next.current.targets.every(t => !t.accomplished)).toBe(true)
  })
})

describe('MERGE_CELLS auto-accomplish', () => {
  it('auto-accomplishes a target when merge result matches it', () => {
    // 1 + 1 = 2; target value 2 should auto-accomplish
    const store = makeStore({
      numbersGrid: [1, 1, null, null, null, null, null, null, null],
      activeOperator: '+',
      selectedNumbersIdx: 0,
    })
    const next = gameReducer(store, { type: 'MERGE_CELLS', sourceGrid: 'numbers', sourceIdx: 0, targetIdx: 1 })
    const target2 = next.current.targets.find(t => t.value === 2)
    expect(target2?.accomplished).toBe(true)
  })

  it('does not auto-accomplish a target when merge result does not match', () => {
    // 3 + 3 = 6; no target with value 6
    const store = makeStore({
      numbersGrid: [3, 3, null, null, null, null, null, null, null],
      activeOperator: '+',
      selectedNumbersIdx: 0,
    })
    const next = gameReducer(store, { type: 'MERGE_CELLS', sourceGrid: 'numbers', sourceIdx: 0, targetIdx: 1 })
    expect(next.current.targets.every(t => !t.accomplished)).toBe(true)
  })
})

describe('MERGE_ALL_NUMBERS auto-accomplish', () => {
  it('auto-accomplishes a target when merge-all result matches it', () => {
    // 1 + 1 + 0 (filtered) = sums to 2; but simpler: just 1 + 1 = 2, target 2 accomplishes
    const store = makeStore({
      numbersGrid: [1, 1, null, null, null, null, null, null, null],
      activeOperator: '+',
    })
    const next = gameReducer(store, { type: 'MERGE_ALL_NUMBERS' })
    const target2 = next.current.targets.find(t => t.value === 2)
    expect(target2?.accomplished).toBe(true)
  })

  it('does not auto-accomplish when merge-all result does not match any target', () => {
    // 3 + 3 = 6; no target with value 6
    const store = makeStore({
      numbersGrid: [3, 3, null, null, null, null, null, null, null],
      activeOperator: '+',
    })
    const next = gameReducer(store, { type: 'MERGE_ALL_NUMBERS' })
    expect(next.current.targets.every(t => !t.accomplished)).toBe(true)
  })
})

describe('UNDO reverts auto-accomplished targets', () => {
  it('single UNDO after GENERATE_NUMBER reverts auto-accomplished target', () => {
    const store = makeStore({ generatorsGrid: [1, null, null, null], selectedGeneratorsIdx: 0 })
    const generated = gameReducer(store, { type: 'GENERATE_NUMBER' })
    expect(generated.current.targets[0].accomplished).toBe(true)
    const undone = gameReducer(generated, { type: 'UNDO' })
    expect(undone.current.targets[0].accomplished).toBe(false)
  })

  it('single UNDO after MERGE_CELLS reverts auto-accomplished target', () => {
    // 1 + 1 = 2 → target(2) accomplished
    const store = makeStore({
      numbersGrid: [1, 1, null, null, null, null, null, null, null],
      activeOperator: '+',
      selectedNumbersIdx: 0,
    })
    const merged = gameReducer(store, { type: 'MERGE_CELLS', sourceGrid: 'numbers', sourceIdx: 0, targetIdx: 1 })
    expect(merged.current.targets.find(t => t.value === 2)?.accomplished).toBe(true)
    const undone = gameReducer(merged, { type: 'UNDO' })
    expect(undone.current.targets.find(t => t.value === 2)?.accomplished).toBe(false)
  })

  it('removing a number after auto-accomplish does not revert the accomplished target', () => {
    const store = makeStore({ generatorsGrid: [1, null, null, null], selectedGeneratorsIdx: 0 })
    const generated = gameReducer(store, { type: 'GENERATE_NUMBER' })
    expect(generated.current.targets[0].accomplished).toBe(true)
    // Clear the number — target should remain accomplished (not rely on number being present)
    const cleared = gameReducer(generated, { type: 'CLEAR_NUMBERS_GRID' })
    expect(cleared.current.targets[0].accomplished).toBe(true)
  })
})

describe('SELECT_CELL mutual exclusivity', () => {
  it('SELECT_CELL numbers clears selectedGeneratorsIdx', () => {
    const store = makeStore({
      numbersGrid: [5, null, null, null, null, null, null, null, null],
      generatorsGrid: [1, null, null, null],
      selectedGeneratorsIdx: 0,
    })
    const next = gameReducer(store, { type: 'SELECT_CELL', grid: 'numbers', cellIdx: 0 })
    expect(next.current.selectedNumbersIdx).toBe(0)
    expect(next.current.selectedGeneratorsIdx).toBeNull()
  })

  it('SELECT_CELL generators clears selectedNumbersIdx', () => {
    const store = makeStore({
      numbersGrid: [5, null, null, null, null, null, null, null, null],
      generatorsGrid: [1, null, null, null],
      selectedNumbersIdx: 0,
    })
    const next = gameReducer(store, { type: 'SELECT_CELL', grid: 'generators', cellIdx: 0 })
    expect(next.current.selectedGeneratorsIdx).toBe(0)
    expect(next.current.selectedNumbersIdx).toBeNull()
  })

  it('DESELECT_ALL sets both selection fields to null', () => {
    const store = makeStore({
      numbersGrid: [5, null, null, null, null, null, null, null, null],
      generatorsGrid: [1, null, null, null],
      selectedNumbersIdx: 0,
    })
    const next = gameReducer(store, { type: 'DESELECT_ALL' })
    expect(next.current.selectedNumbersIdx).toBeNull()
    expect(next.current.selectedGeneratorsIdx).toBeNull()
  })
})
