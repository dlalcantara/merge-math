# Implementation Plan: Mobile Layout Fix & Target Number Input

**Branch**: `002-fix-mobile-layout` | **Date**: 2026-05-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-fix-mobile-layout/spec.md`

## Summary

Reorganise the Merge Math game layout to fit a 720×1280 mobile viewport, place components in the correct spatial order, and add a pre-game setup screen where users can review and edit target numbers (pre-filled with random values) before play begins. All changes are purely client-side: CSS adjustments and React component restructuring with no backend or data-persistence requirements.

## Technical Context

**Language/Version**: TypeScript ~6.0 / React 19

**Primary Dependencies**: React 19, Vite 8 (build), Vitest 3 + @testing-library/react 16 (tests)

**Storage**: N/A — client-side session state only; no persistence

**Testing**: Vitest + @testing-library/react; `npm test` / `npm run test:coverage`

**Target Platform**: Browser (mobile-first: 720×1280 portrait; desktop: centered on wide viewports)

**Project Type**: Browser-based game (single-page application, no routing)

**Performance Goals**: Layout reflow completes in under 16 ms (single frame at 60 fps); initial paint under 200 ms; setup screen appears within 100 ms of page load.

**Constraints**: Must fit vertically in 1280 px without scrolling on a 720 px-wide device; cells can be smaller than the current implementation to achieve this.

**Scale/Scope**: Single-user client-side game; no concurrency concerns; ~10 components, ~5 CSS rule sets to update.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality — single responsibility, no dead code | ✅ Pass | Each component retains a single responsibility; `ActionButtons` will be split into grid-local button sets rather than a monolith |
| II. Testing Standards — TDD, ≥80% coverage, integration tests per story | ✅ Pass | See Phase 1 test contracts; failing tests must be written before implementation |
| III. UX Consistency — WCAG 2.1 AA, in-context validation, no new interaction patterns without justification | ✅ Pass | SetupScreen reuses existing button/input visual language; target input validation shows inline error |
| IV. Performance Requirements — measurable goals recorded above, p95 < 200 ms | ✅ Pass | Goals defined above; layout change is CSS-only so no runtime regression risk |
| Dev Workflow — feature branch `###-feature-name` | ✅ Pass | Branch `002-fix-mobile-layout` |

**Post-design re-check**: Required after Phase 1 — verify no new interaction patterns introduced without justification in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/002-fix-mobile-layout/
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
├── App.tsx                          # Add SetupScreen conditional; remove app-level title
├── App.css                          # No changes needed
├── components/
│   ├── Cell.tsx                     # No changes
│   ├── GameBoard.tsx                # Reorder layout; inline score+undo row; split action buttons
│   ├── Grid.tsx                     # No changes
│   ├── NumbersSection.tsx           # NEW — Numbers grid + Merge All + Clear Numbers
│   ├── GeneratorsSection.tsx        # NEW — Generators grid + Generate Generator + Clear Generators
│   ├── OperatorSelector.tsx         # No changes
│   ├── ScoreRow.tsx                 # NEW — Score display + Undo button in one row
│   ├── SetupScreen.tsx              # NEW — pre-game target number input
│   ├── TargetList.tsx               # No changes
│   └── WinModal.tsx                 # No changes
├── engine/
│   ├── gameState.ts                 # Parameterise generateInitialState(targets?: number[])
│   ├── operators.ts                 # No changes
│   ├── reducer.ts                   # No changes
│   └── types.ts                     # No changes
├── hooks/
│   └── useGame.ts                   # Accept optional initial targets param
├── styles/
│   └── game.css                     # Mobile viewport, layout, smaller cells, section grouping
├── index.css                        # No changes (not imported by main.tsx)
└── main.tsx                         # No changes
```

**Structure Decision**: Single-project SPA; Option 1 (single project). Existing structure is retained; three new component files are added to group related controls with their grids.

## Complexity Tracking

> No constitution violations.

---

*Phase 0 research and Phase 1 design artifacts follow below.*
