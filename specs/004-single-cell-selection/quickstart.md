# Quickstart: Single Cell Selection

**Feature**: `004-single-cell-selection` | **Date**: 2026-05-23

## Overview

This feature enforces a global single-cell selection across both grids, adds cross-grid empty-cell deselection, and introduces tap-outside deselection. The changes touch three source files and two test files.

## Dev Setup

```bash
npm install          # if not already done
npm test             # run all 100 tests — must stay green throughout
npm run dev          # start dev server for manual verification
```

## File Map

| File | Change |
|------|--------|
| `src/engine/types.ts` | Add `{ type: 'DESELECT_ALL' }` to `GameAction` union |
| `src/engine/reducer.ts` | Mutually-exclusive `SELECT_CELL`; new `DESELECT_ALL` case |
| `src/components/GameBoard.tsx` | Cross-grid click logic; `handleBoardClick` tap-outside |
| `tests/unit/engine/reducer.test.ts` | 3 new unit tests for mutual exclusivity + DESELECT_ALL |
| `tests/integration/story1-grid-interaction.test.tsx` | 3 new integration tests (one per user story) |

## Implementation Order (TDD)

1. **Write failing unit tests** in `reducer.test.ts`
   - `SELECT_CELL 'numbers' clears selectedGeneratorsIdx`
   - `SELECT_CELL 'generators' clears selectedNumbersIdx`
   - `DESELECT_ALL clears both selection fields`
2. **Update `types.ts`** — add `DESELECT_ALL` to `GameAction`
3. **Update `reducer.ts`** — modify `SELECT_CELL`, add `DESELECT_ALL` case → unit tests go green
4. **Write failing integration tests** in `story1-grid-interaction.test.tsx`
5. **Update `GameBoard.tsx`** — cross-grid click handlers + `handleBoardClick` → integration tests go green
6. **Run full suite** — all 100 + 6 new tests pass; coverage ≥ 80%

## Key Behaviours to Verify Manually

After `npm run dev`, open the game and confirm:

| Action | Expected result |
|--------|----------------|
| Select Numbers cell, then click non-empty Generators cell | Numbers cell deselects; Generators cell selects |
| Select Generators cell, then click non-empty Numbers cell | Generators cell deselects; Numbers cell selects |
| Select Generators cell, then click empty Numbers cell | All selection clears |
| Select Numbers cell, then click empty Generators cell | All selection clears |
| Select any cell, then click background between grids | All selection clears |
| Select any cell, then click an operator button | Selection is preserved (operator changes) |
| Select a cell, then click Undo button | Selection is preserved; last scored action reverts |
| Select a generator cell, click it again | Generate Number fires (unchanged) |
| Select a Numbers cell, click empty Numbers cell | Cell moves (unchanged) |

## Invariant to Assert

At no point should `selectedNumbersIdx` and `selectedGeneratorsIdx` both be non-null. If this ever occurs, the reducer `SELECT_CELL` handler has a bug.
