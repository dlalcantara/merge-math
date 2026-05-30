# Research: Merge All Numbers — Subtraction & Division Support

**Date**: 2026-05-30
**Branch**: `009-merge-all-subtraction-division`

## Overview

This feature has no external unknowns. All decisions are determined by the existing codebase. This document records confirmed design decisions and the evidence base for each.

---

## Decision 1: Merge order for non-commutative operators

**Decision**: Numbers are merged left-to-right in grid positional order (cell 0 through cell 8), skipping null cells.

**Rationale**: The existing `MERGE_ALL_NUMBERS` reducer path already does this via:
```
const values = current.numbersGrid.filter(v => v !== null) as number[]
const result = values.reduce((acc, v) => applyOperator(acc, v, op))
```
`Array.filter` preserves index order, and `Array.reduce` without an initial value uses the first element as the accumulator. This means the element at the lowest index is the "starting" value. No change to this iteration logic is required.

**Alternatives considered**:
- Sorted by value (ascending/descending): Rejected — would change existing behavior for + and × (even though those are commutative, the sort would be a behavior change in principle) and introduces an arbitrary ordering policy.
- User-selectable order: Rejected — out of scope; adds UI complexity not requested.

---

## Decision 2: Division result type (integer vs. fractional)

**Decision**: Division results are truncated to integers (`Math.trunc`), consistent with all existing division operations.

**Rationale**: `applyOperator` in `src/engine/operators.ts` uses `Math.trunc(a / b)` for the `/` operator. Since `MERGE_ALL_NUMBERS` calls `applyOperator` for each step, truncation is automatic and requires no additional logic.

**Alternatives considered**:
- Floating-point results: Rejected — the rest of the game operates on integers; introducing floats would break target matching and display consistency.

---

## Decision 3: Division by zero handling

**Decision**: A division step where the divisor is 0 produces 0, and the result (0) is carried forward as the accumulator for any remaining steps.

**Rationale**: `applyOperator` already handles this: `b === 0 ? 0 : Math.trunc(a / b)`. No guard is needed in the reducer.

**Example**: Grid [12, 0, 3] with `/` → `12 ÷ 0 = 0`, then `0 ÷ 3 = 0`, final result = 0.

---

## Decision 4: Minimum number count

**Decision**: The 2-number minimum for "Merge All Numbers" applies to all four operators identically.

**Rationale**: `canMergeAll` currently enforces `numbersGrid.filter(v => v !== null).length >= 2`. This check is operator-agnostic and will remain so after removing the operator restriction.

---

## Decision 5: Files requiring changes

**Confirmed affected files** (read from source):

| File | Change |
|------|--------|
| `src/components/ActionButtons.tsx` | `canMergeAll`: remove `state.activeOperator === '+' \|\| state.activeOperator === '*'` check |
| `src/components/GameBoard.tsx` | Same `canMergeAll` predicate update |
| `src/engine/reducer.ts` | Remove `if (op !== '+' && op !== '*') return store` guard |
| `tests/integration/story4-bulk-operations.test.tsx` | Update two tests that expect disabled for `-`/`/`; add two new tests |
| `tests/unit/engine/reducer.test.ts` | Add subtraction and division cases to `MERGE_ALL_NUMBERS` describe block |

**No changes needed**:
- `src/engine/operators.ts` — `applyOperator` already supports all four operators correctly
- `src/engine/types.ts` — `Operator` type and `MERGE_ALL_NUMBERS` action type are already correct
- Any other component or hook — the change is self-contained in the two `canMergeAll` helper functions and the one reducer guard
