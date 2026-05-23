import { useReducer } from 'react'
import { gameReducer } from '../engine/reducer'
import { generateInitialState } from '../engine/gameState'
import type { GameAction, GameStore } from '../engine/types'

export function useGame(): { store: GameStore; dispatch: (action: GameAction) => void } {
  const [store, dispatch] = useReducer(gameReducer, undefined, () => ({
    current: generateInitialState(),
    history: [],
  }))
  return { store, dispatch }
}
