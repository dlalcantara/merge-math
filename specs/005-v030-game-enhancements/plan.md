# Implementation Plan: v0.3.0 Game Enhancements

**Branch**: `005-v030-game-enhancements` | **Date**: 2026-05-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/005-v030-game-enhancements/spec.md`

## Summary

Five mechanics land in this release: (1) a "Convert to Generator" button that moves a selected number into the Generator Grid and increments the action score; (2) generator-to-generator re-selection replaces merge; (3) "Reset Generators Grid" replaces "Clear Generators Grid" with a seeded reset (value 1) plus undo support; (4) targets gain a three-state lifecycle (`pending → available → accomplished`) — clicking an available target marks it done without consuming the number or scoring; (5) the setup screen defaults to 8 curated tutorial targets with a Randomize button for random play. All changes are confined to the engine types/reducer, three section components, `GameBoard`, `SetupScreen`, and their tests.

## Technical Context

**Language/Version**: TypeScript ~6.0 / React 19

**Primary Dependencies**: React 19, Vite 8 (build), Vitest 3 + @testing-library/react 16 (tests)

**Storage**: N/A — client-side session state only

**Testing**: Vitest + @testing-library/react; `npm test` / `npm run test:coverage`

**Target Platform**: Browser (mobile-first, 720×1280 single-viewport — no scrolling)

**Project Type**: Browser-based game (single-page application)

**Performance Goals**: All button interactions resolve in < 100 ms as perceived by the user; all state changes are O(1) or O(n) over small bounded arrays (≤9 numbers, ≤4 generators, 8 targets).

**Constraints**: Must not break existing passing tests; coverage must remain ≥ 80%.

**Scale/Scope**: 8 source files changed; ~8 test files changed or extended; no new dependencies.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality — single responsibility, no dead code | ✅ Pass | Each change has one reason to exist; `GENERATE_GENERATOR` action type and button removed entirely to avoid dead code |
| II. Testing Standards — TDD, ≥80% coverage, integration tests per story | ✅ Pass | Failing tests written before each implementation task; one integration test block per user story |
| III. UX Consistency — new interaction patterns require justification | ⚠ See Complexity Tracking | Three-state target display and click-to-accomplish are new patterns; justified below |
| IV. Performance Requirements — measurable goals recorded, p95 < 200 ms | ✅ Pass | All operations are O(1) or O(n≤9); goals documented above |
| Dev Workflow — feature branch `###-feature-name` | ✅ Pass | Branch `005-v030-game-enhancements` |

**Post-design re-check**: Three-state target display is the only new interaction pattern; justified in Complexity Tracking with no simpler alternative. No other new patterns introduced.

## Project Structure

### Documentation (this feature)

```text
specs/005-v030-game-enhancements/
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
    ├── types.ts         # Target type; CONVERT_TO_GENERATOR action; RESET_GENERATORS_GRID action; remove GENERATE_GENERATOR
    ├── reducer.ts       # historical() helper; CONVERT_TO_GENERATOR; RESET_GENERATORS_GRID; modified CLAIM_TARGET
    └── gameState.ts     # Fixed default targets (8); generateRandomTargets(); updated generateInitialState()
└── components/
    ├── NumbersSection.tsx      # Add Convert to Generator button + convertDisabled prop
    ├── GeneratorsSection.tsx   # Remove Generate Generator button and related props
    ├── TargetList.tsx          # Three-state display; numbersGrid prop for availability derivation
    ├── GameBoard.tsx           # Updated handlers; win condition; prop wiring
    └── SetupScreen.tsx         # 8 inputs; fixed default values; Randomize button

tests/
├── unit/engine/
│   ├── reducer.test.ts         # CONVERT_TO_GENERATOR; RESET_GENERATORS_GRID; modified CLAIM_TARGET; historical()
│   └── gameState.test.ts       # generateTargets returns 8 fixed; generateRandomTargets generates 8 random in range
├── unit/components/
│   ├── NumbersSection.test.tsx # Convert to Generator button present + disabled state
│   ├── GeneratorsSection.test.tsx # No Generate Generator button
│   ├── SetupScreen.test.tsx    # 8 inputs; fixed defaults; Randomize button
│   └── (TargetList.test.tsx — new) # Three-state rendering; click behaviour
└── integration/
    ├── story2-target-completion.test.tsx   # Updated: accomplish without removing number
    └── story5-v030-enhancements.test.tsx   # New: convert-to-generator; reset generators; target states
```

**Structure Decision**: Single-project SPA (no new projects or packages added).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Three-state target display (new interaction pattern — Constitution III) | Spec requires targets to persist after accomplishment and to communicate three distinct states to players. The "Available" affordance needs to be visually inviting so players know they can click it; an un-differentiated static list would leave players stuck. | A simple checkbox or strikethrough (two states only) cannot express the "Available — click me now!" call-to-action that motivates the player to claim the target at the right moment. |
| Click-to-accomplish (changed interaction pattern — Constitution III) | Prior `CLAIM_TARGET` removed the number from the grid. New behaviour preserves the number, so the interaction *looks* the same (click the target) but has different consequences. The intent is that players can re-use numbers for multiple targets. | Keeping the old remove-on-claim would break the re-use scenario that motivated the spec change; no simpler model satisfies the requirement. |
