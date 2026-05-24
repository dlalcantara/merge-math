# Research: v0.3.0 Game Enhancements

**Feature**: `005-v030-game-enhancements` | **Phase**: 0 | **Date**: 2026-05-24

## Summary

No external dependencies or new technology are introduced. All decisions concern how to extend the existing engine patterns. Three design questions were resolved by reading the codebase.

---

## Decision 1: Undoable-but-not-scored actions

**Question**: How to make "Accomplish Target" undoable without incrementing the action score?

**Context**: The existing `scored()` helper always both increments `actionScore` and pushes to history:

```ts
function scored(store, next): GameStore {
  return { current: { ...next, actionScore: next.actionScore + 1 }, history: [...store.history, store.current] }
}
```

Actions that only mutate state (no score) currently skip history entirely (e.g. `SELECT_CELL`, `DESELECT_ALL`). There is no helper for "push to history, don't score."

**Decision**: Add a `historical()` helper alongside `scored()`:

```ts
function historical(store: GameStore, next: GameState): GameStore {
  return { current: next, history: [...store.history, store.current] }
}
```

Use `historical()` for `CLAIM_TARGET` (accomplish target). The undo mechanism (`UNDO` case) is unchanged — it pops `history` regardless of how the state was pushed.

**Rationale**: Minimal, consistent with the existing helper pattern. No change to `GameStore` shape or undo logic.

**Alternatives considered**:
- Add an `undoable: boolean` flag to every action — rejected, adds boilerplate to all unrelated actions.
- Store target accomplishment outside undo history — rejected, spec explicitly requires undo to revert accomplishment.

---

## Decision 2: Target data model — stored vs. derived state

**Question**: Should `available` status be stored in `GameState` or derived at render time?

**Context**: The spec defines three target states: `pending`, `available`, `accomplished`. `available` is true when the target value exists in `numbersGrid`. `accomplished` is set by player action and must survive state changes independently.

**Decision**: Store only a boolean `accomplished` flag per target. Derive `available` from `numbersGrid` at render time in `TargetList`:

```ts
// src/engine/types.ts
interface Target {
  value: number
  accomplished: boolean
}

// TargetList.tsx — derived at render
const status = target.accomplished
  ? 'accomplished'
  : numbersGrid.includes(target.value)
    ? 'available'
    : 'pending'
```

**Rationale**: Storing `available` would duplicate data already in `numbersGrid`, creating a consistency risk. The derived approach means undo automatically produces the correct `available` state — no extra reducer logic needed.

**Alternatives considered**:
- Store all three states as a string enum — rejected, `available` would then need to be updated every time `numbersGrid` changes, adding reducer complexity.

---

## Decision 3: `CLAIM_TARGET` action semantics and naming

**Question**: Should the existing `CLAIM_TARGET` action be repurposed or a new action added?

**Context**: Currently `CLAIM_TARGET` removes the number from `numbersGrid` and removes the target from the `targets` array. Both behaviours change: number stays in grid, target is marked accomplished rather than removed.

**Decision**: Reuse `CLAIM_TARGET` with new semantics. The action payload (`targetValue: number`) is identical. The reducer implementation changes from:

```ts
// old: remove number + remove target
```

to:

```ts
// new: mark target.accomplished = true; number stays; use historical()
```

**Rationale**: The action name still accurately describes the intent. Renaming would require updating all dispatch call sites and tests unnecessarily.

---

## Decision 4: Target count and default list

**Question**: How many targets and what defaults?

**Decision**: 8 targets. Default list: `[1, 2, 5, 12, 25, 67, 69, -420]` (fixed tutorial values per spec). Random generation uses the existing algorithm adjusted to 8 values, range −1023 to 1024 inclusive (matches current `generateTargets()` range).

The existing sort-by-absolute-value is dropped for the fixed list (the tutorial list is already in a meaningful play order). The sort is retained for `generateRandomTargets()` for readability.

**Rationale**: Straightforward spec compliance. The existing range formula (`Math.floor(Math.random() * 2048) - 1023`) already covers −1023..1024; only the count changes from 10 to 8.

---

## Decision 5: `GENERATE_GENERATOR` action removal

**Question**: Should the `GENERATE_GENERATOR` action type be retained in `types.ts` even after removing its button?

**Decision**: Remove entirely — action type, reducer case, and button. Keeping a dead action type with no dispatch site violates Constitution I (no dead code).

**Rationale**: Nothing dispatches `GENERATE_GENERATOR` after the button is removed. Removing it also removes the reducer case, keeping the switch exhaustive and clean.
