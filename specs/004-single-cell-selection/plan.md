# Implementation Plan: Single Cell Selection

**Branch**: `004-single-cell-selection` | **Date**: 2026-05-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/004-single-cell-selection/spec.md`

## Summary

Three selection-model changes in the existing Merge Math game: (1) enforce a global single-cell selection — selecting a cell in one grid clears any selection in the other; (2) clicking an empty cell in the grid that does NOT hold the current selection clears it entirely; (3) tapping or clicking anywhere outside all grid cells and buttons clears the selection. All changes are confined to `src/engine/types.ts`, `src/engine/reducer.ts`, and `src/components/GameBoard.tsx`; no state shape fields are added or removed, and no other component is touched.

## Technical Context

**Language/Version**: TypeScript ~6.0 / React 19

**Primary Dependencies**: React 19, Vite 8 (build), Vitest 3 + @testing-library/react 16 (tests)

**Storage**: N/A — client-side session state only

**Testing**: Vitest + @testing-library/react; `npm test` / `npm run test:coverage`

**Target Platform**: Browser (mobile-first, 720×1280 single-viewport — no scrolling)

**Project Type**: Browser-based game (single-page application)

**Performance Goals**: All deselection interactions must resolve in < 100 ms as perceived by the user; all changes are O(1) state operations, well within this target.

**Constraints**: Must not break any of the 100 existing passing tests; coverage must remain ≥ 80%.

**Scale/Scope**: Three files changed in source; three new unit-test blocks and three new integration-test scenarios.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality — single responsibility, no dead code | ✅ Pass | Each change has one reason to exist; no code is duplicated or left unused |
| II. Testing Standards — TDD, ≥80% coverage, integration tests per story | ✅ Pass | Failing tests written before implementation; one integration test per user story |
| III. UX Consistency — new interaction patterns require justification in Complexity Tracking | ⚠ See Complexity Tracking | Tap-outside deselection is a new interaction pattern — justified below |
| IV. Performance Requirements — measurable goals recorded, p95 < 200 ms | ✅ Pass | O(1) state updates; goals documented above |
| Dev Workflow — feature branch `###-feature-name` | ✅ Pass | Branch `004-single-cell-selection` |

**Post-design re-check**: Confirmed — tap-outside is the only new pattern; justified in Complexity Tracking. No other new patterns introduced.

## Project Structure

### Documentation (this feature)

```text
specs/004-single-cell-selection/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
└── engine/
    ├── types.ts         # Add DESELECT_ALL action type
    └── reducer.ts       # SELECT_CELL clears other grid; add DESELECT_ALL case
└── components/
    └── GameBoard.tsx    # Cross-grid click logic + tap-outside handler

tests/
├── unit/engine/
│   └── reducer.test.ts  # Add: SELECT_CELL mutual exclusivity + DESELECT_ALL
└── integration/
    └── story1-grid-interaction.test.tsx  # Add: cross-grid selection + tap-outside scenarios
```

**Structure Decision**: Single-project SPA (Option 1). Only types, reducer, and GameBoard change.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Tap-outside deselection (new interaction pattern — Constitution III) | Spec FR-004/FR-005 explicitly requires it; mobile users need an ergonomic escape hatch to clear accidental selections without tapping a specific target | Requiring the player to tap the same cell again to deselect is cumbersome on mobile and less discoverable; no simpler standard-pattern alternative exists for this use case |
