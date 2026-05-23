# Research: Fix Generator Bugs

**Date**: 2026-05-23 | **Branch**: `003-fix-generator-bugs`

---

## Decision 1: Root cause of Bug 1 — Generators Grid merge uses wrong target value

**Decision**: Fix the `MERGE_CELLS` case in `src/engine/reducer.ts` by reading `targetVal` from `sourceGrid` (the generators grid) rather than `targetGrid` (the numbers grid).

**Rationale**: In the `MERGE_CELLS` reducer case, two local variables are created:
- `sourceGrid` — a copy of the grid the action originates from (generators grid when `action.sourceGrid === 'generators'`)
- `targetGrid` — always the *other* grid (numbers grid when source is generators)

The line computing `targetVal` is:
```typescript
const targetVal = (action.sourceGrid === 'numbers' ? sourceGrid : targetGrid)[action.targetIdx] as number
```
When source is `'generators'`, this resolves to `targetGrid[action.targetIdx]` = `numbersGrid[action.targetIdx]`, which is almost always `null` for an index that refers to a generators cell. The correct value is `sourceGrid[action.targetIdx]` = `generatorsGrid[action.targetIdx]`. The fix is to replace `targetGrid` with `sourceGrid` in the ternary, making both branches resolve to `sourceGrid`:
```typescript
const targetVal = sourceGrid[action.targetIdx] as number
```

**Alternatives considered**:
- Restructure the entire MERGE_CELLS case into two separate branches (one for numbers, one for generators) — rejected as unnecessarily verbose for a one-line fix.
- Add a third grid variable `mergeTargetGrid` that always equals `sourceGrid` — rejected as redundant; the fix is simpler.

---

## Decision 2: Root cause of Bug 2 — GENERATE_NUMBER clears generator selection

**Decision**: Remove `selectedGeneratorsIdx: null` from the `GENERATE_NUMBER` return value in `src/engine/reducer.ts`, allowing `{ ...current, numbersGrid: nums }` to spread the existing `selectedGeneratorsIdx` from `current`.

**Rationale**: The `GENERATE_NUMBER` case (triggered when the player clicks an already-selected generator) currently ends with:
```typescript
return scored(store, { ...current, numbersGrid: nums, selectedGeneratorsIdx: null })
```
The explicit `selectedGeneratorsIdx: null` was likely included for symmetry with `MERGE_CELLS` (which clears selection after a merge), but it contradicts the spec: the generator should remain selected so the player can generate again immediately. The fix is to omit the override:
```typescript
return scored(store, { ...current, numbersGrid: nums })
```
Since `{ ...current, numbersGrid: nums }` spreads `current`, `selectedGeneratorsIdx` retains its current value (the index of the selected generator).

**Alternatives considered**:
- Keep `selectedGeneratorsIdx: current.selectedGeneratorsIdx` explicitly — equivalent but more verbose; the spread already handles it.
- Add a UI-level workaround (re-dispatch SELECT_CELL after GENERATE_NUMBER) — rejected because it adds complexity and splits an atomic state update across two dispatches.

---

## Decision 3: Test strategy

**Decision**: Follow TDD — write failing unit tests for both bugs first, then apply the two-line fix, then verify integration tests.

**Rationale**: The constitution mandates test-first development. The existing `reducer.test.ts` has no test for generators-grid merges or for `GENERATE_NUMBER` preserving selection. Two new `describe` blocks are added:
1. `MERGE_CELLS (generators grid)` — verifies correct value, source cleared, score incremented, undo works
2. `GENERATE_NUMBER preserves selection` — verifies `selectedGeneratorsIdx` is not null after the action

Integration test additions in `story1-grid-interaction.test.tsx` verify the full user flows described in the spec's acceptance scenarios.

**Alternatives considered**:
- Only integration tests — rejected because unit tests provide faster feedback and directly document the reducer contract.
- Only unit tests — insufficient; integration tests confirm the UI wiring (click handler in `GameBoard.tsx`) routes correctly to `MERGE_CELLS` with the right arguments.
