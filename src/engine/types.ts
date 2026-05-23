export type CellValue = number | null

export type Operator = '+' | '-' | '*' | '/'

export type GridType = 'numbers' | 'generators'

export interface GameState {
  numbersGrid: CellValue[]
  generatorsGrid: CellValue[]
  targets: number[]
  activeOperator: Operator
  actionScore: number
  selectedNumbersIdx: number | null
  selectedGeneratorsIdx: number | null
}

export interface GameStore {
  current: GameState
  history: GameState[]
}

export type GameAction =
  | { type: 'GENERATE_GENERATOR' }
  | { type: 'GENERATE_NUMBER' }
  | { type: 'MERGE_CELLS'; sourceGrid: GridType; sourceIdx: number; targetIdx: number }
  | { type: 'CLAIM_TARGET'; targetValue: number }
  | { type: 'MERGE_ALL_NUMBERS' }
  | { type: 'CLEAR_NUMBERS_GRID' }
  | { type: 'CLEAR_GENERATORS_GRID' }
  | { type: 'SELECT_CELL'; grid: GridType; cellIdx: number }
  | { type: 'DESELECT_CELL'; grid: GridType }
  | { type: 'MOVE_CELL'; grid: GridType; sourceIdx: number; targetIdx: number }
  | { type: 'SET_OPERATOR'; operator: Operator }
  | { type: 'DESELECT_ALL' }
  | { type: 'UNDO' }
  | { type: 'NEW_GAME' }
