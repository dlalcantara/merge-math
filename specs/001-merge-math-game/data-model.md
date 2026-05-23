# Data Model: Merge Math Game MVP

**Branch**: `001-merge-math-game` | **Date**: 2026-05-23

---

## Core Types

### `CellValue`

```typescript
type CellValue = number | null;
// null = empty cell; number = any integer (may be negative after subtraction/division)
```

### `Operator`

```typescript
type Operator = '+' | '-' | '*' | '/';
// / is truncating integer division (Math.trunc(a / b)); division by zero yields 0
```

### `GridType`

```typescript
type GridType = 'numbers' | 'generators';
```

---

## Primary Entities

### `GameState`

The complete, serialisable snapshot of the game at any moment. All state transitions produce a new `GameState` (immutable updates).

```typescript
interface GameState {
  numbersGrid: CellValue[];      // length 9 — row-major 3×3; index = row*3 + col
  generatorsGrid: CellValue[];   // length 4 — row-major 2×2; index = row*2 + col
  targets: number[];             // 0–10 entries; sorted ascending by |value|
  activeOperator: Operator;      // default '+' at game start
  actionScore: number;           // non-negative; counts scored actions
  selectedNumbersIdx: number | null;    // index into numbersGrid, or null
  selectedGeneratorsIdx: number | null; // index into generatorsGrid, or null
}
```

**Invariants**:
- `numbersGrid.length === 9` at all times.
- `generatorsGrid.length === 4` at all times.
- `targets` contains only integers in [−1023, 1024].
- `actionScore >= 0` at all times.
- `selectedNumbersIdx`, if non-null, points to a non-null cell in `numbersGrid`.
- `selectedGeneratorsIdx`, if non-null, points to a non-null cell in `generatorsGrid`.

**Initial state** (FR-019):
```
numbersGrid:    [null, null, null, null, null, null, null, null, null]
generatorsGrid: [1, null, null, null]   // pre-placed generator at index 0
targets:        [<10 generated integers sorted by |value|>]
activeOperator: '+'
actionScore:    0
selectedNumbersIdx:    null
selectedGeneratorsIdx: null
```

---

### `GameStore`

The root object held by the `useGame` hook. Separates mutable UI state from the undo history.

```typescript
interface GameStore {
  current: GameState;
  history: GameState[]; // states captured *before* each scored action; index 0 = oldest
}
```

**Invariants**:
- `history` entries are deep copies — mutating `current` never affects history.
- Undo pops `history[history.length - 1]` and sets it as `current`.
- Only scored actions push onto `history` (see Scored Actions below).

---

## Actions

All user interactions are modelled as discriminated union `GameAction`. The reducer handles every case.

### Scored Actions (push to history, increment `actionScore`)

| Action type | Payload | Triggered by |
|---|---|---|
| `GENERATE_GENERATOR` | — | "Generate Generator" button |
| `GENERATE_NUMBER` | — | Second click on already-selected generator cell (FR-009) |
| `MERGE_CELLS` | `{ sourceGrid: GridType; sourceIdx: number; targetIdx: number }` | Click non-empty cell when same-grid cell is selected (FR-008) |
| `CLAIM_TARGET` | `{ targetValue: number }` | Click a target entry in the Target List (FR-010) |
| `MERGE_ALL_NUMBERS` | — | "Merge All Numbers" button (FR-011) |
| `CLEAR_NUMBERS_GRID` | — | "Clear Numbers Grid" confirmed (FR-013) |
| `CLEAR_GENERATORS_GRID` | — | "Clear Generators Grid" confirmed (FR-014) |

### Unscored Actions (no history push, no `actionScore` change)

| Action type | Payload | Triggered by |
|---|---|---|
| `SELECT_CELL` | `{ grid: GridType; cellIdx: number }` | Click non-empty cell when nothing selected in that grid |
| `DESELECT_CELL` | `{ grid: GridType }` | Click already-selected cell (when generation conditions not met) |
| `MOVE_CELL` | `{ grid: GridType; sourceIdx: number; targetIdx: number }` | Click empty cell when a cell is selected in the same grid (FR-007) |
| `SET_OPERATOR` | `{ operator: Operator }` | Click operator button (FR-004) |

### Special Actions

| Action type | Payload | Triggered by |
|---|---|---|
| `UNDO` | — | Undo button (FR-015) |
| `NEW_GAME` | — | "New Game" / page reload |

---

## Cell Interaction State Machine

The following transitions govern a single click on `cellIdx` in `grid`:

```
[No selection in grid]
  + click non-empty cell  → SELECT_CELL (unscored)
  + click empty cell      → no-op

[Cell selected at selectedIdx]
  + click selectedIdx (same cell)
      → if grid = generators AND Numbers Grid has empty cell → GENERATE_NUMBER (scored)
      → otherwise → DESELECT_CELL (unscored)
  + click different non-empty cell → MERGE_CELLS (scored)
  + click empty cell               → MOVE_CELL (unscored)
```

---

## Operator Semantics

| Operator | Formula | Notes |
|---|---|---|
| `+` | `a + b` | |
| `-` | `a - b` | `a` is the selected cell value, `b` is the clicked cell value |
| `*` | `a * b` | |
| `/` | `Math.trunc(a / b)` | Returns `0` when `b === 0` |

The selected cell is always the *source* (`a`); the clicked cell is the *target* (`b`). Result replaces the target cell. Source cell becomes `null`.

---

## Target Generation

```
generateTargets(): number[]
```

- Draws 10 unique integers uniformly at random from [−1023, 1024] using rejection sampling.
- Returns them sorted by ascending `|value|`; ties in absolute value are ordered positive-first.
- Called once at game start; the list is immutable thereafter.

---

## Validation Rules

| Rule | Enforcement |
|---|---|
| Cannot select an empty cell | `SELECT_CELL` only dispatched when `grid[cellIdx] !== null` |
| `GENERATE_NUMBER` requires at least one empty Numbers Grid cell | Checked before dispatch; no-op if all 9 cells occupied |
| `GENERATE_GENERATOR` requires at least one empty Generators Grid cell | Checked before dispatch; no-op if all 4 cells occupied |
| `MERGE_ALL_NUMBERS` requires operator `+` or `*` and ≥ 2 numbers | Button rendered disabled; reducer guards as well |
| `CLAIM_TARGET` requires a Numbers Grid cell with the exact target value | Reducer checks; no state change if no match |
| Division by zero | Reducer returns `0`; no error state emitted |
| Undo with empty history | Button rendered disabled; reducer is a no-op |

---

## Win Condition

After any action that modifies `targets`, the reducer checks `targets.length === 0`. If true, the game transitions to a **win state**. The win state is represented by a derived boolean — it is not a separate `GameState` field; consumers compute it as `current.targets.length === 0 && gameHasStarted`.
