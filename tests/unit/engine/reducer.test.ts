import { describe, it, expect } from 'vitest'
import { gameReducer } from '../../../src/engine/reducer'
import type { GameStore, GameState } from '../../../src/engine/types'

function makeStore(overrides: Partial<GameState> = {}): GameStore {
  const base: GameState = {
    numbersGrid: Array(9).fill(null),
    generatorsGrid: [1, null, null, null],
    targets: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    activeOperator: '+',
    actionScore: 0,
    selectedNumbersIdx: null,
    selectedGeneratorsIdx: null,
  }
  return { current: { ...base, ...overrides }, history: [] }
}

describe('GENERATE_GENERATOR', () => {
  it('places 1 in the first null slot of generatorsGrid', () => {
    const store = makeStore({ generatorsGrid: [1, null, null, null] })
    const next = gameReducer(store, { type: 'GENERATE_GENERATOR' })
    expect(next.current.generatorsGrid[1]).toBe(1)
  })

  it('increments actionScore by 1', () => {
    const store = makeStore({ generatorsGrid: [1, null, null, null] })
    const next = gameReducer(store, { type: 'GENERATE_GENERATOR' })
    expect(next.current.actionScore).toBe(1)
  })

  it('pushes a deep copy to history', () => {
    const store = makeStore({ generatorsGrid: [1, null, null, null] })
    const next = gameReducer(store, { type: 'GENERATE_GENERATOR' })
    expect(next.history).toHaveLength(1)
    expect(next.history[0]).not.toBe(next.current)
  })

  it('returns unchanged store when generatorsGrid is full', () => {
    const store = makeStore({ generatorsGrid: [1, 2, 3, 4] })
    const next = gameReducer(store, { type: 'GENERATE_GENERATOR' })
    expect(next).toBe(store)
  })
})

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
