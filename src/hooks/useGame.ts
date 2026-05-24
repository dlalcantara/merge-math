import { useReducer } from 'react'
import { gameReducer } from '../engine/reducer'
import { generateInitialState } from '../engine/gameState'
import type { GameAction, GameStore, Target } from '../engine/types'

export function useGame(initialTargets?: Target[]): { store: GameStore; dispatch: (action: GameAction) => void } {
  const [store, dispatch] = useReducer(gameReducer, undefined, () => ({
    current: generateInitialState(initialTargets),
    history: [],
  }))
  return { store, dispatch }
}
