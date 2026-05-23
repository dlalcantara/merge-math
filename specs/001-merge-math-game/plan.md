# Implementation Plan: Merge Math Game MVP

**Branch**: `001-merge-math-game` | **Date**: 2026-05-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-merge-math-game/spec.md`

## Summary

Build a single-player browser puzzle game where players generate, merge, and combine numbers across two grids (3×3 Numbers, 2×2 Generators) using four arithmetic operators to match a set of 10 target values. The implementation uses Vite + React (functional components + `useReducer`), a pure-function game engine separated from the UI layer for testability, and a snapshot-based undo system.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 18+

**Primary Dependencies**: React 18, Vite 5, `@vitejs/plugin-react`, Vitest 1.x, `@testing-library/react`, `@testing-library/user-event`

**Storage**: No cross-session persistence (each page load starts fresh); undo history held in-memory as an array of `GameState` snapshots for the session lifetime

**Testing**: Vitest (unit), React Testing Library (component + integration); TDD per constitution

**Target Platform**: Modern evergreen browsers (Chrome, Firefox, Safari, Edge); GitHub Pages subdirectory deployment; basic mobile support

**Project Type**: Single-page browser game (static SPA, zero backend)

**Performance Goals**: All user-facing interactions respond within 200 ms (per SC-003 and Constitution §IV); initial page load under 3 s on a median mobile connection

**Constraints**: Must deploy to `https://<user>.github.io/<repo>` with correct asset paths (Vite `base` config); works offline after first load; mobile-responsive layout

**Scale/Scope**: Single-player, ephemeral session; grids fixed at 3×3 and 2×2; 10 targets per game; undo history bounded in practice by game length (see Complexity Tracking)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality — single responsibility, no dead code, documented public interfaces | ✅ PASS | Game engine (pure functions) and React UI are separate modules; all public engine functions will be documented |
| II. Testing Standards — TDD, 80% unit coverage, integration tests per user story | ✅ PASS | Four integration test files map directly to the four user stories; unit coverage target is enforced via Vitest coverage threshold |
| III. UX Consistency — WCAG 2.1 AA, in-context feedback, no new patterns without justification | ✅ PASS | Standard grid/button patterns; ARIA roles and labels required; no novel interaction paradigms introduced |
| IV. Performance Requirements — measurable goals defined, p95 < 200 ms, no unbounded memory | ⚠️ CONDITIONAL | Undo history has no depth cap per spec; see Complexity Tracking below for justification |

## Project Structure

### Documentation (this feature)

```text
specs/001-merge-math-game/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── game-engine.md   # Phase 1 output — engine ↔ UI boundary
└── tasks.md             # Phase 2 output (/speckit-tasks command — NOT created here)
```

### Source Code (repository root)

```text
src/
├── engine/
│   ├── types.ts          # Shared type definitions (CellValue, Operator, GameState, etc.)
│   ├── gameState.ts      # Initial state factory, target generation
│   ├── operators.ts      # Pure arithmetic functions
│   └── reducer.ts        # Pure game state reducer (all action handlers)
├── hooks/
│   └── useGame.ts        # React hook — wraps GameStore, exposes dispatch
├── components/
│   ├── GameBoard.tsx     # Root game component, wires hook → child components
│   ├── Grid.tsx          # Reusable grid renderer (used for both grids)
│   ├── Cell.tsx          # Single cell — displays value, handles click
│   ├── OperatorSelector.tsx
│   ├── TargetList.tsx
│   ├── ScoreDisplay.tsx
│   ├── ActionButtons.tsx # Merge All, Generate Generator, Clear buttons
│   └── WinModal.tsx
├── styles/
│   └── game.css
└── main.tsx

tests/
├── unit/
│   ├── engine/
│   │   ├── reducer.test.ts
│   │   ├── operators.test.ts
│   │   └── gameState.test.ts
│   └── components/
│       ├── Cell.test.tsx
│       └── Grid.test.tsx
└── integration/
    ├── story1-grid-interaction.test.tsx
    ├── story2-target-completion.test.tsx
    ├── story3-score-undo.test.tsx
    └── story4-bulk-operations.test.tsx
```

**Structure Decision**: Single project (no backend). Game logic isolated under `src/engine/` as pure TypeScript functions; React UI under `src/components/` and `src/hooks/`. This boundary is the primary contract surface (see `contracts/game-engine.md`).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Undo history with no depth cap (Constitution §IV — unbounded memory) | Spec FR-015 / Assumption explicitly requires "entire session with no depth limit" | A capped history (e.g., 50 steps) would violate the spec's explicit requirement; in practice, each `GameState` snapshot is O(1) bytes (13 nullable integers + 10 targets + 3 scalar fields), so even 10 000 actions total ≈ 400 KB — well within browser memory limits for a short-session game |
