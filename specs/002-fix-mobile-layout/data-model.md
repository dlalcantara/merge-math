# Data Model: Mobile Layout Fix & Target Number Input

**Date**: 2026-05-23 | **Branch**: `002-fix-mobile-layout`

---

## Existing Entities (unchanged)

### GameState

Defined in `src/engine/types.ts`. No field changes required.

| Field | Type | Description |
|-------|------|-------------|
| `numbersGrid` | `CellValue[]` (length 9) | 3×3 Numbers grid cells |
| `generatorsGrid` | `CellValue[]` (length 4) | 2×2 Generators grid cells |
| `targets` | `number[]` | Remaining target numbers to claim |
| `activeOperator` | `Operator` | Currently selected arithmetic operator |
| `actionScore` | `number` | Count of actions taken |
| `selectedNumbersIdx` | `number \| null` | Index of selected Numbers cell |
| `selectedGeneratorsIdx` | `number \| null` | Index of selected Generators cell |

### GameStore

| Field | Type | Description |
|-------|------|-------------|
| `current` | `GameState` | Current game state |
| `history` | `GameState[]` | Undo stack |

---

## New / Modified Entities

### SetupConfig

Client-side transient state held in `App` component (not in `GameStore`). Disappears once the game starts.

| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| `targets` | `string[]` | Each must parse to integer, −9999 ≤ value ≤ 9999, array length matches `generateTargets()` default length (10) | Raw user-entered strings from the setup form |

**State transitions**:
```
App mounts
  → phase = 'setup'
     SetupScreen renders with default random targets (strings)
     User may edit fields
     User clicks "Start Game"
       → validate all fields
          if invalid: show per-field error, remain in 'setup'
          if valid:   phase = 'playing', GameBoard mounts with confirmed targets
```

### Modified: `generateInitialState`

`src/engine/gameState.ts` — add optional `targets` parameter:

```
generateInitialState(targets?: number[]): GameState
```

- If `targets` is provided: use it.
- If omitted: call `generateTargets()` (existing behaviour preserved).

---

## Validation Rules

| Entity | Field | Rule |
|--------|-------|------|
| SetupConfig | each `targets[i]` | Must be parseable as an integer (no decimals, no blank) |
| SetupConfig | each `targets[i]` | −9999 ≤ value ≤ 9999 |
| SetupConfig | `targets` length | Must equal the default target count (10) — fields are pre-filled; users cannot add or remove slots |

---

## No New Persistence

All state remains in React component memory. No `localStorage`, `sessionStorage`, or network calls are introduced by this feature.
