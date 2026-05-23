# Data Model: Single Cell Selection

**Feature**: `004-single-cell-selection` | **Phase**: 1 | **Date**: 2026-05-23

## State Shape (unchanged fields)

No fields are added or removed from `GameState`. The two existing selection fields are retained and continue to carry the same meaning; the new invariant is that they cannot both be non-null simultaneously.

```ts
// src/engine/types.ts — existing fields, new invariant
interface GameState {
  // ... other fields unchanged ...
  selectedNumbersIdx: number | null     // index into numbersGrid (0-8), or null
  selectedGeneratorsIdx: number | null  // index into generatorsGrid (0-3), or null
  // INVARIANT: at most one of these may be non-null at any time
}
```

## New Action Type

```ts
// src/engine/types.ts — addition
type GameAction =
  | ... // all existing action types unchanged
  | { type: 'DESELECT_ALL' }  // clears both selectedNumbersIdx and selectedGeneratorsIdx
```

## Reducer Changes

### `SELECT_CELL` — enforce mutual exclusivity

```ts
case 'SELECT_CELL': {
  if (action.grid === 'numbers') {
    // Clear generators selection before setting numbers selection
    return { ...store, current: { ...current, selectedNumbersIdx: action.cellIdx, selectedGeneratorsIdx: null } }
  }
  // Clear numbers selection before setting generators selection
  return { ...store, current: { ...current, selectedGeneratorsIdx: action.cellIdx, selectedNumbersIdx: null } }
}
```

### `DESELECT_ALL` — new case

```ts
case 'DESELECT_ALL':
  return { ...store, current: { ...current, selectedNumbersIdx: null, selectedGeneratorsIdx: null } }
```

## Component Changes

### `GameBoard.tsx` — `handleNumbersCellClick`

The existing per-grid logic is preserved. A new cross-grid branch is added at the top:

```
if (numbersSelIdx === null) {
  if (generatorsSelIdx !== null) {
    // There is a selection in the OTHER grid
    if (cell === null) → dispatch DESELECT_ALL
    else               → dispatch SELECT_CELL 'numbers' idx   (reducer auto-clears generators)
  } else {
    // No selection anywhere — existing behaviour
    if (cell !== null) → dispatch SELECT_CELL 'numbers' idx
  }
  return
}
// numbersSelIdx !== null — existing same-grid logic unchanged
```

### `GameBoard.tsx` — `handleGeneratorsCellClick`

Mirror of the above:

```
if (generatorsSelIdx === null) {
  if (numbersSelIdx !== null) {
    // There is a selection in the OTHER grid
    if (cell === null) → dispatch DESELECT_ALL
    else               → dispatch SELECT_CELL 'generators' idx   (reducer auto-clears numbers)
  } else {
    // No selection anywhere — existing behaviour
    if (cell !== null) → dispatch SELECT_CELL 'generators' idx
  }
  return
}
// generatorsSelIdx !== null — existing same-grid logic unchanged
```

### `GameBoard.tsx` — `handleBoardClick` (new)

```tsx
function handleBoardClick(e: React.MouseEvent<HTMLDivElement>) {
  const target = e.target as HTMLElement
  if (!target.closest('button')) {
    dispatch({ type: 'DESELECT_ALL' })
  }
}
// Attached as onClick on the .game-board root div
```

Note: `Cell.tsx` renders each grid cell as a `<button>`, so `target.closest('button')` correctly excludes all grid cells, operator buttons, and action buttons in one check.

## State Transition Summary

| Trigger | Before | After |
|---------|--------|-------|
| SELECT_CELL 'numbers' idx | any sel state | numbersIdx=idx, generatorsIdx=null |
| SELECT_CELL 'generators' idx | any sel state | generatorsIdx=idx, numbersIdx=null |
| DESELECT_ALL | any sel state | numbersIdx=null, generatorsIdx=null |
| Click empty cell in non-selected grid | one grid selected | DESELECT_ALL dispatched |
| Click background (non-button area) | any sel state | DESELECT_ALL dispatched |
| All existing clear-selection actions | unchanged | unchanged |
