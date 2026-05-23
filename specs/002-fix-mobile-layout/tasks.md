---

description: "Task list for Mobile Layout Fix & Target Number Input"
---

# Tasks: Mobile Layout Fix & Target Number Input

**Feature Branch**: `002-fix-mobile-layout`
**Input**: Design documents from `specs/002-fix-mobile-layout/`

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

Single-project SPA: `src/` at repository root

---

## Phase 1: Setup (Baseline Verification)

**Purpose**: Confirm the existing test suite is green before any changes land

- [ ] T001 Verify existing test suite passes by running `npm test` before making any changes

---

## Phase 2: Foundational (Engine Changes)

**Purpose**: Extend the game engine to accept custom target numbers. US1, US2, and US3 can proceed in parallel with this phase; US4 cannot start until it is complete.

**⚠️ CRITICAL**: Phase 6 (US4) cannot begin until T002 and T003 are done

- [ ] T002 Add optional `targets?: number[]` parameter to `generateInitialState` in `src/engine/gameState.ts`; use provided array when given, otherwise call existing `generateTargets()`
- [ ] T003 Update `src/hooks/useGame.ts` to accept an optional `initialTargets?: number[]` parameter and forward it to `generateInitialState`

**Checkpoint**: Engine changes complete — US1, US2, and US3 can proceed independently; US4 may now begin

---

## Phase 3: User Story 1 — Play Game on Mobile Device (Priority: P1) 🎯 MVP

**Goal**: The full game UI fits within a 720×1280 viewport with no horizontal overflow and no need to scroll to reach any control.

**Independent Test**: Open the app in Chrome DevTools Device Toolbar at 720×1280; confirm no horizontal scrollbar appears and all UI elements are visible without vertical scrolling.

- [ ] T004 [P] [US1] Update `src/styles/game.css` — set `#root { max-width: 400px }`, add `max-height: min(12vw, 56px)` to grid cells so they scale with viewport width, reduce `--spacing-lg` to `0.75rem`; these three changes together compress the layout to fit in 1280 px height (satisfies FR-001, FR-009)

**Checkpoint**: Mobile viewport constraint met — verify manually in Chrome DevTools at 720×1280 before proceeding

---

## Phase 4: User Story 2 — Correct Component Layout Order (Priority: P1)

**Goal**: Controls are grouped adjacent to the grids they affect, in the correct top-to-bottom visual order: Score+Undo → Targets → Numbers grid + Merge/Clear → Operators → Generators grid + Generate/Clear.

**Independent Test**: Load the app and verify the DOM order matches ScoreRow → TargetList → NumbersSection → OperatorSelector → GeneratorsSection.

### Tests for User Story 2

> **NOTE: Write these tests FIRST and ensure they FAIL before any implementation begins**

- [ ] T005 [P] [US2] Write failing test verifying GameBoard renders sections in the correct DOM order in `src/components/__tests__/GameBoard.test.tsx` — assert ScoreRow appears before TargetList, TargetList before NumbersSection, etc.
- [ ] T006 [P] [US2] Write failing unit tests for ScoreRow in `src/components/__tests__/ScoreRow.test.tsx` — renders action score value and Undo button in the same row
- [ ] T007 [P] [US2] Write failing unit tests for NumbersSection in `src/components/__tests__/NumbersSection.test.tsx` — renders Numbers grid, "Merge All Numbers" button, and "Clear Numbers Grid" button grouped together
- [ ] T008 [P] [US2] Write failing unit tests for GeneratorsSection in `src/components/__tests__/GeneratorsSection.test.tsx` — renders Generators grid, "Generate Generator" button, and "Clear Generators Grid" button grouped together

### Implementation for User Story 2

- [ ] T009 [P] [US2] Create `src/components/ScoreRow.tsx` — renders the action score display and the Undo button side by side in a single flex row
- [ ] T010 [P] [US2] Create `src/components/NumbersSection.tsx` — renders the Numbers Grid component followed by "Merge All Numbers" and "Clear Numbers Grid" buttons in a grouped section
- [ ] T011 [P] [US2] Create `src/components/GeneratorsSection.tsx` — renders the Generators Grid component followed by "Generate Generator" and "Clear Generators Grid" buttons in a grouped section
- [ ] T012 [US2] Refactor `src/components/GameBoard.tsx` to import and render sections in order: ScoreRow → TargetList → NumbersSection → OperatorSelector → GeneratorsSection; remove the standalone ActionButtons dependency (depends on T009, T010, T011)

**Checkpoint**: User Story 2 complete — layout order is correct and all component tests pass

---

## Phase 5: User Story 3 — Desktop Centered Layout (Priority: P2)

**Goal**: On viewports wider than 400 px the game card is horizontally centred with whitespace on both sides and anchored to the top of the viewport (not vertically centred).

**Independent Test**: Open the app in a viewport wider than 720 px; confirm game content is horizontally centred with equal whitespace on both sides and the card sits at the top, not the middle, of the page.

- [ ] T013 [P] [US3] Update `src/styles/game.css` — ensure `body` has `display: flex; flex-direction: column; align-items: center; justify-content: flex-start; min-height: 100vh` so the 400 px game card is centred horizontally and top-aligned on wide viewports (satisfies FR-002, FR-003; coordinate with T004 which also modifies this file)

**Checkpoint**: Desktop centering confirmed — verify in DevTools at a viewport wider than 720 px

---

## Phase 6: User Story 4 — Specify Target Numbers on Load (Priority: P2)

**Goal**: A SetupScreen appears on app load showing 10 pre-filled random target number inputs; users can edit any field and then confirm to start the game with those targets.

**Independent Test**: Load the app fresh; confirm SetupScreen appears with pre-filled random values; change one value, click Start Game; verify the game uses the custom target number.

### Tests for User Story 4

> **NOTE: Write these tests FIRST and ensure they FAIL before any implementation begins**

- [ ] T014 [P] [US4] Write failing unit tests for SetupScreen in `src/components/__tests__/SetupScreen.test.tsx` — covers: renders 10 pre-filled inputs, shows per-field `<span role="alert">` error for non-integer or out-of-range values (< −9999 or > 9999), disables Start Game button while any field is invalid, calls `onStart(targets)` with confirmed numbers on valid submission
- [ ] T015 [P] [US4] Write failing integration test for App setup-to-game flow in `src/App.test.tsx` — covers: SetupScreen is shown on initial load, completing setup (filling valid values and clicking Start Game) causes GameBoard to render

### Implementation for User Story 4

- [ ] T016 [US4] Create `src/components/SetupScreen.tsx` — renders 10 `<input type="text">` fields pre-filled by `generateTargets()`, validates each field as an integer in −9999–9999, displays an inline `<span role="alert">` error below each invalid field, renders a "Start Game" `<button>` that calls `onStart(targets: number[])` only when all fields are valid (depends on T002 for `generateTargets` signature)
- [ ] T017 [US4] Update `src/App.tsx` — add `phase: 'setup' | 'playing'` state and `confirmedTargets: number[] | null`, render `<SetupScreen onStart={handleStart}>` when phase is `'setup'`, pass `confirmedTargets` to `useGame` and render `<GameBoard>` when phase is `'playing'`; remove any existing app-level title element (depends on T016, T003)

**Checkpoint**: User Story 4 complete — SetupScreen appears on load, validation prevents bad targets, game starts with confirmed values

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates and final validation across all stories

- [ ] T018 [P] Run `npm run typecheck` and fix all TypeScript errors in new and modified files (`SetupScreen.tsx`, `ScoreRow.tsx`, `NumbersSection.tsx`, `GeneratorsSection.tsx`, `GameBoard.tsx`, `App.tsx`, `gameState.ts`, `useGame.ts`)
- [ ] T019 [P] Run `npm run lint` and fix all linting issues across new and modified files
- [ ] T020 Run `npm run test:coverage` and confirm the ≥80% lines/branches coverage threshold passes
- [ ] T021 Manually verify 720×1280 viewport in Chrome DevTools per `quickstart.md` — no horizontal scroll, full UI visible without vertical scrolling, all buttons reachable

**Checkpoint**: All stories complete, all quality gates pass, manual verification done — ready to ship

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS Phase 6 (US4); Phases 3, 4, 5 are independent of Phase 2 (different files) and can start after Phase 1
- **Phase 3 (US1)**: Can start after Phase 1; touches `src/styles/game.css`
- **Phase 4 (US2)**: Can start after Phase 1; touches component files, independent of Phase 3
- **Phase 5 (US3)**: Can start after Phase 1; also touches `src/styles/game.css` — coordinate with Phase 3 (T004) to avoid file conflicts; easiest to complete T004 first then T013
- **Phase 6 (US4)**: REQUIRES Phase 2 complete (T002, T003); within phase: T014, T015 → T016 → T017
- **Phase 7 (Polish)**: Requires Phases 3–6 complete

### User Story Dependencies

- **US1 (P1)**: No story dependencies — can start after Phase 1
- **US2 (P1)**: No story dependencies — can run in parallel with US1 (different files)
- **US3 (P2)**: No story dependencies — coordinates on `game.css` with US1; complete US1 CSS task first
- **US4 (P2)**: Requires Phase 2 completion only; no other story dependencies

### Within Phase 4 (US2)

- T005–T008 (test tasks) are all [P] — write all four simultaneously
- T009–T011 (new components) are all [P] — create all three simultaneously after tests exist
- T012 (GameBoard refactor) MUST wait for T009, T010, T011 to be complete

### Parallel Opportunities

```bash
# After Phase 1 (T001 passes):
# Start Phase 2 and Phase 3 simultaneously:
Task T002: Parameterise generateInitialState in src/engine/gameState.ts
Task T004: Update src/styles/game.css for mobile viewport (US1, independent file)

# After T002 completes:
Task T003: Update src/hooks/useGame.ts (depends on T002)

# After Phase 2 complete, run Phase 4 test tasks in parallel:
Task T005: Write GameBoard layout order test
Task T006: Write ScoreRow unit tests
Task T007: Write NumbersSection unit tests
Task T008: Write GeneratorsSection unit tests

# After T005–T008 exist (tests written and failing), create components in parallel:
Task T009: Create ScoreRow.tsx
Task T010: Create NumbersSection.tsx
Task T011: Create GeneratorsSection.tsx
# Then sequentially:
Task T012: Refactor GameBoard.tsx (depends on T009, T010, T011)

# Phase 5 + Phase 6 test tasks can overlap:
Task T013: Update game.css desktop centering (US3, after T004)
Task T014: Write SetupScreen unit tests (US4)
Task T015: Write App integration test (US4)
# Then sequentially:
Task T016: Create SetupScreen.tsx (after T014, T015)
Task T017: Update App.tsx (after T016, T003)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Baseline verification (T001)
2. Complete Phase 2: Engine changes (T002, T003 — fast, two small changes)
3. Complete Phase 3: Mobile CSS (T004 — one task)
4. Complete Phase 4: Component layout (T005–T012)
5. **STOP and VALIDATE**: Manual 720×1280 test + layout order visual check
6. Deploy/demo if ready

### Incremental Delivery

1. Phase 1 + Phase 2 → Engine ready, baseline confirmed
2. Phase 3 (US1) → Game fits mobile screen
3. Phase 4 (US2) → Correct component layout
4. Phase 5 (US3) → Desktop presentation polished
5. Phase 6 (US4) → Personalised target number entry
6. Phase 7 (Polish) → Quality gates pass → Ship

### Single Developer Sequence

```
T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008
     → T009 → T010 → T011 → T012 → T013 → T014 → T015
     → T016 → T017 → T018 → T019 → T020 → T021
```

---

## Notes

- **[P] tasks** = different files, no shared state dependencies — safe to run simultaneously
- **[Story] label** maps each task to a specific user story for traceability and independent delivery
- **TDD**: Tests (T005–T008, T014–T015) MUST be written first and MUST FAIL before the corresponding implementation tasks start (constitution requirement)
- **game.css coordination**: T004 (US1) and T013 (US3) both modify `src/styles/game.css`; complete T004 before T013 to avoid conflicts
- **`generateTargets()`** in `src/engine/gameState.ts` is reused in `SetupScreen.tsx` for default pre-filled values — no new randomisation logic needed
- **Validation errors** use `<span role="alert">` per the existing UI pattern documented in `quickstart.md`
- **No new dependencies** are required; all changes use existing React, TypeScript, and CSS tooling
- Commit after each phase or logical group before moving to the next
- Verify stories independently at each Checkpoint before proceeding to the next phase
