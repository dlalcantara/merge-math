# Implementation Plan: Merge All Numbers — Subtraction & Division Support

**Branch**: `009-merge-all-subtraction-division` | **Date**: 2026-05-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/009-merge-all-subtraction-division/spec.md`

## Summary

Remove the operator restriction in "Merge All Numbers" so it works for all four operators (+, -, ×, ÷). The reducer currently short-circuits for `-` and `/`; removing that guard and updating the two `canMergeAll` helper functions is the entire change. No new UI elements or data model changes are required.

## Technical Context

**Language/Version**: TypeScript 6.0

**Primary Dependencies**: React 19, Vite 8, Vitest 3 + Testing Library 16

**Storage**: N/A — all game state is in-memory (React reducer pattern)

**Testing**: Vitest (unit + integration via Testing Library + jsdom)

**Target Platform**: Browser (modern desktop and mobile)

**Project Type**: Single-page web application

**Performance Goals**: Operation is O(n) where n ≤ 9 — imperceptible; p95 well under 200 ms

**Constraints**: No regressions to existing + and × merge behavior; must integrate with existing undo and auto-accomplish systems

**Scale/Scope**: 3 source files modified, 2 test files updated/extended

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality | ✅ Pass | Change is surgical: one guard removed from the reducer, one predicate updated in two components. No dead code introduced. |
| II. Testing Standards | ✅ Pass (TDD required) | Failing tests must be written first. Existing tests in `story4-bulk-operations.test.tsx` assert the button is disabled for `-` and `/` — these become the initial failing tests once the implementation guard is removed. New unit tests for reducer subtraction/division paths required before production code changes. |
| III. UX Consistency | ✅ Pass | No new interaction patterns introduced. The change makes button behavior consistent across all four operators, which is the explicit goal. |
| IV. Performance | ✅ Pass | Merge-all is O(9) regardless of operator. Easily within the 200 ms p95 requirement. |

*Post-design re-check*: No design artifacts introduce new complexity — no new components, no new state shape, no new contracts. All gates remain green.

## Project Structure

### Documentation (this feature)

```text
specs/009-merge-all-subtraction-division/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── quickstart.md        # Phase 1 output
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
src/
├── engine/
│   ├── reducer.ts           ← remove operator guard in MERGE_ALL_NUMBERS
│   └── operators.ts         (no change — applyOperator already handles all four)
└── components/
    ├── ActionButtons.tsx    ← update canMergeAll to allow '-' and '/'
    └── GameBoard.tsx        ← update canMergeAll to allow '-' and '/'

tests/
├── integration/
│   └── story4-bulk-operations.test.tsx  ← update two existing disabled-button tests; add two new enabled+result tests
└── unit/
    └── engine/
        └── reducer.test.ts  ← add MERGE_ALL_NUMBERS subtraction and division test cases
```

**Structure Decision**: Single-project layout. All changes are in the existing `src/` and `tests/` trees — no new directories needed.
