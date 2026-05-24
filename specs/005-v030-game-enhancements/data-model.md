# Data Model: v0.3.0 Game Enhancements

**Feature**: `005-v030-game-enhancements` | **Phase**: 1 | **Date**: 2026-05-24

## New Type: `Target`

```ts
// src/engine/types.ts — new
interface Target {
  value: number
  accomplished: boolean
}
```

`available` status is not stored — it is derived at render time from `numbersGrid`.

## `GameState` — changed field

```ts
// src/engine/types.ts — before
interface GameState {
  // ...
  targets: number[]
  // ...
}

// src/engine/types.ts — after
interface GameState {
  // ...
  targets: Target[]           // changed: number[] → Target[]
  // ...
}
```

All other `GameState` fields are unchanged.

## `GameAction` — additions and removals

```ts
// src/engine/types.ts — after
type GameAction =
  | { type: 'GENERATE_NUMBER' }                                          // unchanged
  | { type: 'MERGE_CELLS'; sourceGrid: GridType; sourceIdx: number; targetIdx: number }  // unchanged
  | { type: 'CLAIM_TARGET'; targetValue: number }                        // unchanged signature, new semantics
  | { type: 'MERGE_ALL_NUMBERS' }                                        // unchanged
  | { type: 'CLEAR_NUMBERS_GRID' }                                       // unchanged
  | { type: 'RESET_GENERATORS_GRID' }                                    // replaces CLEAR_GENERATORS_GRID
  | { type: 'CONVERT_TO_GENERATOR' }                                     // new
  | { type: 'SELECT_CELL'; grid: GridType; cellIdx: number }             // unchanged
  | { type: 'DESELECT_CELL'; grid: GridType }                            // unchanged
  | { type: 'MOVE_CELL'; grid: GridType; sourceIdx: number; targetIdx: number }  // unchanged
  | { type: 'SET_OPERATOR'; operator: Operator }                         // unchanged
  | { type: 'DESELECT_ALL' }                                             // unchanged
  | { type: 'UNDO' }                                                     // unchanged
  | { type: 'NEW_GAME' }                                                 // unchanged
// REMOVED: { type: 'GENERATE_GENERATOR' }
// REMOVED: { type: 'CLEAR_GENERATORS_GRID' }
```

## Reducer — new helper

```ts
// src/engine/reducer.ts — new helper alongside existing scored()
function historical(store: GameStore, next: GameState): GameStore {
  return {
    current: next,
    history: [...store.history, store.current],
  }
}
```

## Reducer — changed and new cases

### `CLAIM_TARGET` — new semantics

```ts
case 'CLAIM_TARGET': {
  const idx = current.targets.findIndex(t => t.value === action.targetValue && !t.accomplished)
  if (idx === -1) return store
  const available = current.numbersGrid.some(v => v === action.targetValue)
  if (!available) return store
  const targets = current.targets.map((t, i) =>
    i === idx ? { ...t, accomplished: true } : t
  )
  return historical(store, { ...current, targets })
  // No score increment; number stays in numbersGrid
}
```

### `CONVERT_TO_GENERATOR` — new

```ts
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
```

### `RESET_GENERATORS_GRID` — replaces `CLEAR_GENERATORS_GRID`

```ts
case 'RESET_GENERATORS_GRID':
  return scored(store, {
    ...current,
    generatorsGrid: [1, null, null, null],
    selectedGeneratorsIdx: null,
  })
```

### `MERGE_CELLS` (generators branch) — removed

The generators-merge branch in `MERGE_CELLS` is removed. `handleGeneratorsCellClick` in `GameBoard.tsx` now dispatches `SELECT_CELL` instead of `MERGE_CELLS` when a second non-null generator is clicked.

### `GENERATE_GENERATOR` — removed entirely

No reducer case, no action type.

## `gameState.ts` — changes

```ts
// Fixed tutorial default (8 targets)
const DEFAULT_TARGETS: number[] = [1, 2, 5, 12, 25, 67, 69, -420]

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
    targets: (targets ?? DEFAULT_TARGETS.map(value => ({ value, accomplished: false }))),
    activeOperator: '+',
    actionScore: 0,
    selectedNumbersIdx: null,
    selectedGeneratorsIdx: null,
  }
}
```

Note: `generateTargets()` is removed (or renamed to `generateRandomTargets()`); `SetupScreen` calls `generateRandomTargets()` for the Randomize button.

## Component interface changes

### `NumbersSection` — new props

```ts
interface NumbersSectionProps {
  // existing props unchanged
  onConvertToGenerator: () => void   // new
  convertDisabled: boolean           // new — true when selectedNumbersIdx === null
}
```

Button order in toolbar: **Merge All Numbers** | **Convert to Generator** | **Clear Numbers Grid**

### `GeneratorsSection` — removed props

```ts
// REMOVED from interface:
//   onGenerateGenerator: () => void
//   generateDisabled: boolean
```

The "Generate Generator" button is removed from the rendered output.

### `TargetList` — new props and rendering

```ts
interface TargetListProps {
  targets: Target[]                    // changed: number[] → Target[]
  numbersGrid: (number | null)[]       // new — for deriving 'available' status
  dispatch: (action: GameAction) => void
}
```

Each target renders with a derived `status`:
- `accomplished` → styled as accomplished (e.g., strikethrough + muted)
- `available` → styled as clickable invitation (e.g., highlighted, pulse/glow)
- `pending` → default style

Clicking an `available` target dispatches `CLAIM_TARGET`. Clicking an `accomplished` or `pending` target is a no-op.

### `GameBoard` — win condition

```ts
// before
const isWon = current.targets.length === 0

// after
const isWon = current.targets.every(t => t.accomplished)
```

### `GameBoard` — generator click handler

```ts
// handleGeneratorsCellClick: when selIdx !== null and cell !== null and selIdx !== idx
// before: dispatch MERGE_CELLS
// after:  dispatch SELECT_CELL (re-select)
if (selIdx !== idx && cell !== null) {
  dispatch({ type: 'SELECT_CELL', grid: 'generators', cellIdx: idx })
  return
}
```

### `SetupScreen` — 8 inputs + Randomize

- Array size changes from 10 to 8.
- Initial `values` state is `DEFAULT_TARGETS.map(String)` instead of `generateTargets().map(String)`.
- A "Randomize" button calls `generateRandomTargets()` and replaces `values` state.
- Validation range stays at −9999..9999 (generous user-editable range); random generation stays within −1023..1024.

## State Transition Summary

| Action | Score | History | numbersGrid | generatorsGrid | targets |
|--------|-------|---------|-------------|----------------|---------|
| `CLAIM_TARGET` | unchanged | pushed | unchanged | unchanged | target.accomplished = true |
| `CONVERT_TO_GENERATOR` | +1 | pushed | selected cell → null | first empty slot ← value | unchanged |
| `RESET_GENERATORS_GRID` | +1 | pushed | unchanged | [1, null, null, null] | unchanged |
| `UNDO` after any above | reverted | popped | reverted | reverted | reverted |
