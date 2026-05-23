# Implementation Plan: Fix Generator Bugs

**Branch**: `003-fix-generator-bugs` | **Date**: 2026-05-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-fix-generator-bugs/spec.md`

## Summary

Two bugs in `src/engine/reducer.ts` prevent correct Generators Grid behavior. Bug 1: `MERGE_CELLS` reads the target cell's value from the wrong grid when both cells are in the Generators Grid, producing incorrect merge results. Bug 2: `GENERATE_NUMBER` explicitly nulls out `selectedGeneratorsIdx` after copying a generator's value, but the spec requires the selection to persist so the player can generate again without re-selecting. Both fixes are one-line changes in the reducer; no components, types, or state shape change.

## Technical Context

**Language/Version**: TypeScript ~6.0 / React 19

**Primary Dependencies**: React 19, Vite 8 (build), Vitest 3 + @testing-library/react 16 (tests)

**Storage**: N/A — client-side session state only

**Testing**: Vitest + @testing-library/react; `npm test` / `npm run test:coverage`

**Target Platform**: Browser (same as existing game)

**Project Type**: Browser-based game (single-page application)

**Performance Goals**: No measurable performance impact — both fixes are single-line reducer changes with O(1) cost.

**Constraints**: Must not break any of the 91 existing passing tests; coverage must remain ≥ 80%.

**Scale/Scope**: Two one-line changes in one file; two new unit-test blocks; two new integration-test scenarios.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality — single responsibility, no dead code | ✅ Pass | Only the reducer changes; no new abstractions introduced |
| II. Testing Standards — TDD, ≥80% coverage, integration tests per story | ✅ Pass | Failing tests written first; see Phase 1 test plan |
| III. UX Consistency — no new interaction patterns without justification | ✅ Pass | Fixing to match already-specified behavior; no new patterns |
| IV. Performance Requirements — measurable goals recorded above, p95 < 200 ms | ✅ Pass | No runtime cost change; goals documented above |
| Dev Workflow — feature branch `###-feature-name` | ✅ Pass | Branch `003-fix-generator-bugs` |

**Post-design re-check**: Confirmed — no new interaction patterns, no complexity deviations.

## Project Structure

### Documentation (this feature)

```text
specs/003-fix-generator-bugs/
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
    └── reducer.ts       # Two one-line fixes (MERGE_CELLS targetVal + GENERATE_NUMBER selection)

tests/
├── unit/engine/
│   └── reducer.test.ts  # Add: MERGE_CELLS generators block + GENERATE_NUMBER preserves selection
└── integration/
    └── story1-grid-interaction.test.tsx  # Add: generator merge scenario + repeated generate scenario
```

**Structure Decision**: Single-project SPA (Option 1). Only the reducer and its tests change.

## Complexity Tracking

> No constitution violations.
