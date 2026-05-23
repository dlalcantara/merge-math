# Contract: Game Engine ↔ React UI

**Branch**: `001-merge-math-game` | **Date**: 2026-05-23

---

## Boundary

The game engine (`src/engine/`) is a collection of **pure TypeScript functions** with no React dependency. The React layer (`src/hooks/useGame.ts`, `src/components/`) consumes the engine exclusively through the interfaces defined here.

This separation ensures:
- Engine logic is unit-testable without rendering.
- UI components never contain game rules.
- Future changes to rendering (e.g., animations, alternative UIs) cannot break game correctness.

---

## 1. `generateInitialState(): GameState`

Produces the canonical starting state for a new game.

```typescript
function generateInitialState(): GameState
```

**Post-conditions**:
- `numbersGrid` is all-null (9 elements).
- `generatorsGrid[0] === 1`; indices 1–3 are null.
- `targets` is an array of 10 unique integers from [−1023, 1024], sorted ascending by `|value|`.
- `activeOperator === '+'`.
- `actionScore === 0`.
- Both selection indices are null.

---

## 2. `gameReducer(store: GameStore, action: GameAction): GameStore`

The single state transition function. Always returns a new `GameStore`; never mutates.

```typescript
function gameReducer(store: GameStore, action: GameAction): GameStore
```

**Input**: current `GameStore` + a `GameAction` (see data-model.md for the full union type).

**Output**: new `GameStore` with `current` updated and `history` modified if the action was scored.

**Guarantees**:
- All invariants on `GameState` (see data-model.md) hold in the returned state.
- Scored actions: `newStore.history` has one more entry than `store.history` (the pre-action snapshot).
- Unscored actions: `newStore.history === store.history` (no copy, referential equality).
- `UNDO` with empty history: returns `store` unchanged.
- Any action that produces no state change (e.g., clicking an empty cell, `GENERATE_GENERATOR` when grid is full) returns `store` unchanged.

---

## 3. `applyOperator(a: number, b: number, op: Operator): number`

Applies an arithmetic operator to two integers.

```typescript
function applyOperator(a: number, b: number, op: Operator): number
```

| `op` | Returns |
|------|---------|
| `'+'` | `a + b` |
| `'-'` | `a - b` |
| `'*'` | `a * b` |
| `'/'` | `b === 0 ? 0 : Math.trunc(a / b)` |

All inputs and outputs are safe integers (within JS `Number.MAX_SAFE_INTEGER`). No floating-point values are produced.

---

## 4. `generateTargets(): number[]`

Generates a shuffled, unique list of target integers for a new game.

```typescript
function generateTargets(): number[]
```

**Post-conditions**:
- Returns exactly 10 integers.
- All values are unique and in [−1023, 1024].
- Array is sorted by ascending `Math.abs(value)`; ties ordered positive before negative.

---

## 5. `isWon(state: GameState): boolean`

Pure predicate — no side effects.

```typescript
function isWon(state: GameState): boolean
// Returns true iff state.targets.length === 0
```

---

## UI Responsibilities (not part of the engine contract)

The React layer is responsible for:

- **Confirmation dialogs**: "Clear Numbers Grid" / "Clear Generators Grid" prompts are shown by the UI *before* dispatching `CLEAR_NUMBERS_GRID` / `CLEAR_GENERATORS_GRID`. The reducer never prompts.
- **Button disabled state**: The UI derives disabled/enabled from current `GameState` using the predicates below.
- **Win modal**: Rendered when `isWon(current)` is true.

### Derived UI State Predicates

These are computed by the UI from `GameState`; they are NOT stored in state.

```typescript
// Undo button enabled
canUndo(store: GameStore): boolean => store.history.length > 0

// Merge All Numbers button enabled
canMergeAll(state: GameState): boolean =>
  (state.activeOperator === '+' || state.activeOperator === '*')
  && state.numbersGrid.filter(v => v !== null).length >= 2

// Generate Generator button enabled
canGenerateGenerator(state: GameState): boolean =>
  state.generatorsGrid.some(v => v === null)

// Generate Number (second-click on selected generator) enabled
canGenerateNumber(state: GameState): boolean =>
  state.selectedGeneratorsIdx !== null
  && state.numbersGrid.some(v => v === null)
```

---

## Contract Test Requirements

Per Constitution §II, contract tests MUST be maintained for this boundary. Each function above requires at least:

- One test per documented post-condition.
- One test per edge-case row in the operator table (especially division by zero).
- Reducer tests covering every `GameAction` variant (see `tests/unit/engine/reducer.test.ts`).
