# Research: Single Cell Selection

**Feature**: `004-single-cell-selection` | **Phase**: 0 | **Date**: 2026-05-23

## Current Selection Model

**Decision**: Keep the two existing state fields (`selectedNumbersIdx`, `selectedGeneratorsIdx`) and enforce mutual exclusivity at the reducer level rather than collapsing them into a single `selectedCell` field.

**Rationale**: All 15 existing test files reference `selectedNumbersIdx` or `selectedGeneratorsIdx` via component props or reducer state assertions. Collapsing to a single field would require updating those references in ~10 test files. Enforcing mutual exclusivity via the reducer (clearing the opposite field on `SELECT_CELL`) achieves identical runtime behaviour with three-line changes instead of a broad refactor. `Grid.tsx`, `NumbersSection.tsx`, and `GeneratorsSection.tsx` all accept `selectedIdx: number | null` per-grid — this interface remains valid.

**Alternatives considered**:
- Single `selectedCell: { grid: GridType; idx: number } | null` — cleaner state shape but higher test-file churn; deferred as a future refactor.
- Boolean flag `singleSelectionMode` to gate new behaviour — rejected; the spec replaces the old behaviour entirely, no toggle needed.

---

## Cross-Grid Empty-Cell Click Handling

**Decision**: Cross-grid empty-cell clicks are handled in `GameBoard.tsx` click handlers, NOT in the reducer. When the active selection is in Grid A and the user clicks an empty cell in Grid B, the handler dispatches `DESELECT_ALL` (a new action added to the reducer).

**Rationale**: The existing reducer already handles same-grid empty-cell clicks via `MOVE_CELL`. The new cross-grid case needs no game-state mutation beyond clearing both selection fields — `DESELECT_ALL` is the right abstraction. Keeping this in the reducer (not in the component) means the behaviour is testable at the unit level.

**Alternatives considered**:
- Dispatching `DESELECT_CELL` for the specific grid — would leave a residual "empty click" in GameBoard that has no effect on the other grid; cleaner to use a single `DESELECT_ALL`.
- Handling in the reducer via a new `CLICK_EMPTY_CELL` action — unnecessary; the click handler already knows the context, so no new action type is needed beyond `DESELECT_ALL`.

---

## Tap-Outside Mechanism

**Decision**: Attach a single `onClick` handler to the `.game-board` root `<div>` in `GameBoard.tsx`. Inside the handler, check whether `event.target` is (or is inside) a grid cell or a `<button>`. If not, dispatch `DESELECT_ALL`.

```tsx
function handleBoardClick(e: React.MouseEvent<HTMLDivElement>) {
  const target = e.target as HTMLElement
  if (!target.closest('[role="gridcell"]') && !target.closest('button')) {
    dispatch({ type: 'DESELECT_ALL' })
  }
}
```

**Rationale**: 
- A single bubbling handler on the root div covers all taps — mouse, touch, and pointer events — without needing `useEffect` or document-level listeners.
- Grid cells rendered by `Cell.tsx` use `<button>` elements, so `target.closest('button')` catches both grid-cell taps and action-button taps in one check.
- `OperatorSelector` buttons are also `<button>` elements, so they are automatically excluded.
- No scroll conflict: the game is a single-viewport layout with no scrollable container, per spec 002-fix-mobile-layout.

**Alternatives considered**:
- `document.addEventListener('pointerdown', ...)` in a `useEffect` — more code, harder to test with `@testing-library/react` (requires firing events at the document level), no benefit over the bubbling approach.
- `onPointerDown` instead of `onClick` — fires before `onClick` on cells, could cause ordering issues (deselect fires before cell-select). `onClick` is safer.
- Wrapping each grid in a `stopPropagation` call — inverts the model (opt-in stop vs. opt-in allow), fragile when new components are added.

---

## DESELECT_ALL Action

**Decision**: Add `{ type: 'DESELECT_ALL' }` to `GameAction` in `types.ts` and handle it in `reducer.ts` by setting both `selectedNumbersIdx` and `selectedGeneratorsIdx` to `null`.

**Rationale**: A dedicated action makes the intent explicit and keeps it independently testable. It is also reusable by future features that need to clear all selection state.

**Alternatives considered**:
- Dispatching `DESELECT_CELL` twice (once for each grid) — two round-trips through the reducer for a single logical operation; also, the second dispatch sees the state produced by the first (wrong history snapshot if scored, though deselect is not scored).
- Inline state mutation in the click handler — bypasses the reducer, breaks the unidirectional data-flow contract.

---

## Test Strategy

**Decision**: Write failing tests first (TDD per constitution), then implement.

**Unit tests** (reducer.test.ts):
1. `SELECT_CELL 'numbers'` while generators is selected → `selectedGeneratorsIdx` becomes null
2. `SELECT_CELL 'generators'` while numbers is selected → `selectedNumbersIdx` becomes null
3. `DESELECT_ALL` → both fields become null

**Integration tests** (story1-grid-interaction.test.tsx):
1. User Story 1 — click non-empty cell in other grid while one is selected → only new cell highlighted
2. User Story 2 — click empty cell in non-selected grid → no cell highlighted
3. User Story 3 — click game-board background → no cell highlighted

**Existing tests**: No changes expected. All existing reducer tests use scenarios within a single grid; all existing component tests do not assert cross-grid selection state.
