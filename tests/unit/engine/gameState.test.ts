import { describe, it, expect } from 'vitest'
import { generateInitialState, generateRandomTargets } from '../../../src/engine/gameState'

describe('generateRandomTargets', () => {
  it('returns exactly 8 values', () => {
    expect(generateRandomTargets()).toHaveLength(8)
  })

  it('returns unique values', () => {
    const targets = generateRandomTargets()
    expect(new Set(targets).size).toBe(8)
  })

  it('returns values in range [-1023, 1024]', () => {
    for (let run = 0; run < 10; run++) {
      generateRandomTargets().forEach(v => {
        expect(v).toBeGreaterThanOrEqual(-1023)
        expect(v).toBeLessThanOrEqual(1024)
      })
    }
  })
})

describe('generateInitialState', () => {
  it('numbersGrid has length 9 and is all-null', () => {
    const state = generateInitialState()
    expect(state.numbersGrid).toHaveLength(9)
    expect(state.numbersGrid.every(v => v === null)).toBe(true)
  })

  it('generatorsGrid has length 4 with 1 at index 0 and null elsewhere', () => {
    const state = generateInitialState()
    expect(state.generatorsGrid).toHaveLength(4)
    expect(state.generatorsGrid[0]).toBe(1)
    expect(state.generatorsGrid.slice(1).every(v => v === null)).toBe(true)
  })

  it('targets has 8 entries', () => {
    expect(generateInitialState().targets).toHaveLength(8)
  })

  it('targets use DEFAULT_TARGETS values [1,2,5,12,25,67,69,-420]', () => {
    const state = generateInitialState()
    expect(state.targets.map(t => t.value)).toEqual([1, 2, 5, 12, 25, 67, 69, -420])
  })

  it('targets have accomplished: false by default', () => {
    expect(generateInitialState().targets.every(t => t.accomplished === false)).toBe(true)
  })

  it('activeOperator is +', () => {
    expect(generateInitialState().activeOperator).toBe('+')
  })

  it('actionScore is 0', () => {
    expect(generateInitialState().actionScore).toBe(0)
  })

  it('both selection indices are null', () => {
    const state = generateInitialState()
    expect(state.selectedNumbersIdx).toBeNull()
    expect(state.selectedGeneratorsIdx).toBeNull()
  })
})
