import type { GameState } from './types'

export function generateTargets(): number[] {
  const set = new Set<number>()
  while (set.size < 10) {
    set.add(Math.floor(Math.random() * 2048) - 1023)
  }
  return [...set].sort((a, b) => {
    const diff = Math.abs(a) - Math.abs(b)
    if (diff !== 0) return diff
    // positive before negative on ties
    return b - a
  })
}

export function generateInitialState(): GameState {
  return {
    numbersGrid: Array(9).fill(null),
    generatorsGrid: [1, null, null, null],
    targets: generateTargets(),
    activeOperator: '+',
    actionScore: 0,
    selectedNumbersIdx: null,
    selectedGeneratorsIdx: null,
  }
}
