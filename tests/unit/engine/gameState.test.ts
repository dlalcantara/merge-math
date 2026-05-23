import { describe, it, expect } from 'vitest'
import { generateTargets, generateInitialState } from '../../../src/engine/gameState'

describe('generateTargets', () => {
  it('returns exactly 10 values', () => {
    expect(generateTargets()).toHaveLength(10)
  })

  it('returns unique values', () => {
    const targets = generateTargets()
    const unique = new Set(targets)
    expect(unique.size).toBe(10)
  })

  it('returns values in range [-1023, 1024]', () => {
    const targets = generateTargets()
    targets.forEach(v => {
      expect(v).toBeGreaterThanOrEqual(-1023)
      expect(v).toBeLessThanOrEqual(1024)
    })
  })

  it('sorts by ascending |value|', () => {
    const targets = generateTargets()
    for (let i = 1; i < targets.length; i++) {
      expect(Math.abs(targets[i])).toBeGreaterThanOrEqual(Math.abs(targets[i - 1]))
    }
  })

  it('places positive before negative when |value| is tied', () => {
    // Run multiple times to catch tie-breaking
    for (let run = 0; run < 20; run++) {
      const targets = generateTargets()
      for (let i = 1; i < targets.length; i++) {
        if (Math.abs(targets[i]) === Math.abs(targets[i - 1])) {
          expect(targets[i - 1]).toBeGreaterThan(targets[i])
        }
      }
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

  it('targets has 10 entries', () => {
    expect(generateInitialState().targets).toHaveLength(10)
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
