import type { GameState, Target } from './types'

export const DEFAULT_TARGETS: number[] = [1, 2, 5, 12, 25, 67, 69, -420]

export function generateRandomTargets(): number[] {
  const set = new Set<number>()
  while (set.size < 8) {
    set.add(Math.floor(Math.random() * 2048) - 1023)
  }
  return [...set].sort((a, b) => {
    const diff = Math.abs(a) - Math.abs(b)
    if (diff !== 0) return diff
    return b - a
  })
}

export function generateInitialState(targets?: Target[]): GameState {
  return {
    numbersGrid: Array(9).fill(null),
    generatorsGrid: [1, null, null, null],
    targets: targets ?? DEFAULT_TARGETS.map(value => ({ value, accomplished: false })),
    activeOperator: '+',
    actionScore: 0,
    selectedNumbersIdx: null,
    selectedGeneratorsIdx: null,
  }
}
