# Implementation Plan: Auto-Accomplish Targets

**Branch**: `006-auto-accomplish-targets` | **Date**: 2026-05-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/006-auto-accomplish-targets/spec.md`

## Summary

Replace the three-state target lifecycle (`pending → available → accomplished via click`) with a two-state model (`pending → accomplished automatically`). When a number matching an unaccomplished target first appears in the Numbers Grid, the reducer immediately marks that target accomplished as part of the same state snapshot — no player click required and no separate undo step. The `CLAIM_TARGET` action and the "Available" state are removed entirely. `TargetList` becomes a non-interactive display component. All changes are confined to `src/engine/reducer.ts`, `src/engine/types.ts`, `src/components/TargetList.tsx`, `src/components/GameBoard.tsx`, and their tests.

## Technical Context

**Language/Version**: TypeScript ~6.0 / React 19

**Primary Dependencies**: React 19, Vite 8 (build), Vitest 3 + @testing-library/react 16 (tests)

**Storage**: N/A — client-side session state only

**Testing**: Vitest + @testing-library/react; `npm test` / `npm run test:coverage`

**Target Platform**: Browser (mobile-first, 720×1280 single-viewport — no scrolling)

**Project Type**: Browser-based game (single-page application)

**Performance Goals**: Auto-accomplish check is O(n×m) where n ≤ 9 (grid cells) and m ≤ 8 (targets); effectively O(1) at this scale. All interactions remain < 100 ms perceived.

**Constraints**: Must not break existing passing tests (after migration); coverage must remain ≥ 80%.

**Scale/Scope**: 4 source files changed; 3–4 test files changed; no new dependencies; no new files needed.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality — single responsibility, no dead code | ✅ Pass | `CLAIM_TARGET` and `TargetStatus` type removed entirely; no dead code left behind |
| II. Testing Standards — TDD, ≥80% coverage, integration tests per story | ✅ Pass | Failing tests written before each implementation task; one integration test block per user story |
| III. UX Consistency — new interaction patterns require justification | ✅ Pass | This change REMOVES a non-standard interaction pattern (click-to-accomplish). Targets become standard passive display elements — no new pattern introduced |
| IV. Performance Requirements — measurable goals recorded, p95 < 200 ms | ✅ Pass | Auto-accomplish is O(n×m) ≤ O(72) — effectively free; documented above |
| Dev Workflow — feature branch `###-feature-name` | ✅ Pass | Branch `006-auto-accomplish-targets` |

**Post-design re-check**: No new interaction patterns introduced. Existing three-state interaction pattern removed. No Complexity Tracking entry required.

## Project Structure

### Documentation (this feature)

```text
specs/006-auto-accomplish-targets/
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
    ├── types.ts         # Remove CLAIM_TARGET from GameAction union; no other changes to Target type
    └── reducer.ts       # Add withAutoAccomplish() helper; apply to GENERATE_NUMBER, MERGE_CELLS (numbers), MERGE_ALL_NUMBERS; remove CLAIM_TARGET case
└── components/
    ├── TargetList.tsx   # Remove numbersGrid + dispatch props; remove getStatus(); render non-interactive <li>; two CSS classes only (target-pending, target-accomplished)
    └── GameBoard.tsx    # Remove numbersGrid + dispatch props from <TargetList> JSX

tests/
├── unit/engine/
│   └── reducer.test.ts  # Remove CLAIM_TARGET tests; add auto-accomplish tests for GENERATE_NUMBER, MERGE_CELLS, MERGE_ALL_NUMBERS; add undo-reverts-auto-accomplish test
├── unit/components/
│   └── TargetList.test.tsx  # Rewrite: two-state only; no button/click tests; no available-state tests
└── integration/
    └── story2-target-completion.test.tsx  # Rewrite: auto-accomplish on generate; undo reverts; win condition
```

**Structure Decision**: Single-project SPA; no new projects, packages, or files added.
