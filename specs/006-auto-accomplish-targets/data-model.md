# Data Model: Auto-Accomplish Targets

**Feature**: `006-auto-accomplish-targets` | **Phase**: 1 | **Date**: 2026-05-24

## `Target` — unchanged

```ts
// src/engine/types.ts — no change to this type
interface Target {
  value: number
  accomplished: boolean
}
```

`available` status is not stored and is no longer derived. There are exactly two observable states: `accomplished === false` (pending) and `accomplished === true` (accomplished).

## `GameAction` — removal

```ts
// src/engine/types.ts — before
type GameAction =
  | ...
  | { type: 'CLAIM_TARGET'; targetValue: number }   // REMOVE
  | ...

// src/engine/types.ts — after
// CLAIM_TARGET variant removed entirely
```

No other `GameAction` variants change.

## Reducer — new helper

```ts
// src/engine/reducer.ts — new helper
function withAutoAccomplish(state: GameState): GameState {
  const targets = state.targets.map(t =>
    !t.accomplished && state.numbersGrid.includes(t.value)
      ? { ...t, accomplished: true }
      : t
  )
  return { ...state, targets }
}
```

## Reducer — modified cases

### `GENERATE_NUMBER` — apply auto-accomplish

```ts
case 'GENERATE_NUMBER': {
  if (current.selectedGeneratorsIdx === null) return store
  const emptyIdx = current.numbersGrid.indexOf(null)
  if (emptyIdx === -1) return store
  const nums = [...current.numbersGrid]
  nums[emptyIdx] = current.generatorsGrid[current.selectedGeneratorsIdx]
  return scored(store, withAutoAccomplish({ ...current, numbersGrid: nums }))
}
```

### `MERGE_CELLS` (numbers grid) — apply auto-accomplish

```ts
// Inside the numbers branch of MERGE_CELLS:
return scored(store, withAutoAccomplish({
  ...current,
  numbersGrid: sourceGrid,
  selectedNumbersIdx: null,
  selectedGeneratorsIdx: null,
}))
```

### `MERGE_ALL_NUMBERS` — apply auto-accomplish

```ts
case 'MERGE_ALL_NUMBERS': {
  // ...existing logic to compute result and build nums array...
  return scored(store, withAutoAccomplish({ ...current, numbersGrid: nums, selectedNumbersIdx: null }))
}
```

### `CLAIM_TARGET` — removed

The entire `case 'CLAIM_TARGET':` block is deleted.

## `TargetList` component — simplified interface

```ts
// src/components/TargetList.tsx — before
interface TargetListProps {
  targets: Target[]
  numbersGrid: (number | null)[]
  dispatch: (action: GameAction) => void
}

// src/components/TargetList.tsx — after
interface TargetListProps {
  targets: Target[]
}
```

Render output: non-interactive `<span>` (or `<li>` text) with `className="target-pending"` or `className="target-accomplished"` — no `<button>`, no `onClick`.

## State transitions

```
Target states:
  pending (accomplished: false)
    → accomplished (accomplished: true)
       Trigger: withAutoAccomplish() detects target.value in numbersGrid
       during GENERATE_NUMBER | MERGE_CELLS (numbers) | MERGE_ALL_NUMBERS
    ← pending
       Trigger: UNDO restores prior GameState snapshot
       (only mechanism — no player action can revert)
```

## Win condition (unchanged)

```ts
// src/components/GameBoard.tsx — unchanged
const isWon = current.targets.every(t => t.accomplished)
```
