# Tasks: v0.3.0 Game Enhancements

**Input**: Design documents from `specs/005-v030-game-enhancements/`

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · quickstart.md ✅

**Tests**: Included — Constitution II mandates TDD (failing test before each implementation task).

**Organization**: Tasks grouped by user story. Five stories: US1 (P1), US4 (P1), US2 (P2), US3 (P2), US5 (P3).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no dependency on in-progress tasks)
- **[Story]**: User story this task belongs to (US1–US5 from spec.md)

---

## Phase 1: Setup (Baseline Verification)

**Purpose**: Confirm the existing test suite is green before any changes land.

- [ ] T001 Run `npm test` and record the passing count — no changes yet; this count is the floor that must never drop

---

## Phase 2: Foundational — Engine & Type System

**Purpose**: Engine changes that every user story depends on. **No user story work can begin until this phase is complete.**

**⚠️ CRITICAL**: Changing `targets: number[]` → `targets: Target[]` in `src/engine/types.ts` will immediately cause compile errors in `TargetList.tsx`, `GameBoard.tsx`, and existing integration tests. Tasks T007 and T008 repair those errors before feature work begins.

- [ ] T002 [P] Write failing unit tests for `CONVERT_TO_GENERATOR` (creates generator, removes number, increments score, undoable), `RESET_GENERATORS_GRID` (resets to [1,null,null,null], increments score, undoable), updated `CLAIM_TARGET` (marks accomplished without removing number, no score change, uses `historical()`, undoable), and `historical()` helper in `tests/unit/engine/reducer.test.ts`
- [ ] T003 [P] Write failing unit tests asserting `generateRandomTargets()` returns exactly 8 numbers each in range −1023..1024, and `generateInitialState()` produces `targets` as `Target[]` with values [1,2,5,12,25,67,69,−420] and `accomplished: false` in `tests/unit/engine/gameState.test.ts`
- [ ] T004 Update `src/engine/types.ts`: add `Target { value: number; accomplished: boolean }` interface; change `GameState.targets` from `number[]` to `Target[]`; add `CONVERT_TO_GENERATOR` and `RESET_GENERATORS_GRID` to `GameAction`; remove `GENERATE_GENERATOR` and `CLEAR_GENERATORS_GRID` from `GameAction`
- [ ] T005 Update `src/engine/gameState.ts`: add `DEFAULT_TARGETS` constant `[1,2,5,12,25,67,69,-420]`; add `generateRandomTargets()` (8 unique values, −1023..1024, sorted by absolute value); update `generateInitialState()` to produce `targets: Target[]` from DEFAULT_TARGETS; remove old `generateTargets()` (depends on T004)
- [ ] T006 Update `src/engine/reducer.ts`: add `historical()` helper; implement `CONVERT_TO_GENERATOR` case (find first empty generator slot, move value, use `scored()`); implement `RESET_GENERATORS_GRID` case (reset to `[1,null,null,null]`, use `scored()`); update `CLAIM_TARGET` to mark `target.accomplished = true` using `historical()` (no number removal, no score change); remove `GENERATE_GENERATOR` case (depends on T004, T005)
- [ ] T007 Fix compile errors from `Target[]` change: update `src/components/TargetList.tsx` — change props to accept `targets: Target[]` and `numbersGrid: (number|null)[]`; render `target.value`; dispatch `CLAIM_TARGET` with `targetValue: target.value` on click (full three-state styling is US4); update `src/components/GameBoard.tsx` — change `isWon` to `current.targets.every(t => t.accomplished)`; pass `numbersGrid={current.numbersGrid}` to `TargetList` (depends on T004, T006)
- [ ] T008 Update existing integration tests that break due to `Target[]` change: in `tests/integration/story2-target-completion.test.tsx` replace `targets: number[]` with `targets: Target[]` format, update assertions that previously checked targets were removed from the array (they are now marked `accomplished: true` instead) (depends on T006, T007)

**Checkpoint**: `npm test` — T002 and T003 unit tests pass; all previously-passing tests still pass; `npm run typecheck` reports no errors.

---

## Phase 3: User Story 1 — Convert Number to Generator (Priority: P1) 🎯 MVP

**Goal**: Player can move a selected number into the Generator Grid via a dedicated button; action is scored and undoable.

**Independent Test**: Select a number → click "Convert to Generator" → number absent from Numbers Grid, generator present in Generators Grid, action score +1. Undo → number restored, generator gone, score −1.

- [ ] T009 Write failing unit tests for `NumbersSection` in `tests/unit/components/NumbersSection.test.tsx`: "Convert to Generator" button is rendered between Merge All Numbers and Clear Numbers Grid; button has `disabled` attribute when `convertDisabled` is true
- [ ] T010 Write failing integration test for US1 in `tests/integration/story5-v030-enhancements.test.tsx`: select a number, click "Convert to Generator", assert number removed and generator created with correct value and score incremented; then undo and assert revert
- [ ] T011 [P] Update `src/components/NumbersSection.tsx`: add `onConvertToGenerator: () => void` and `convertDisabled: boolean` props; insert "Convert to Generator" button between "Merge All Numbers" and "Clear Numbers Grid" in the toolbar; apply `disabled` and `aria-disabled` from `convertDisabled` (depends on T009)
- [ ] T012 Update `src/components/GameBoard.tsx`: add `handleConvertToGenerator` dispatching `CONVERT_TO_GENERATOR`; compute `convertDisabled = current.selectedNumbersIdx === null`; pass `onConvertToGenerator` and `convertDisabled` to `NumbersSection` (depends on T006, T011)

**Checkpoint**: `npm test` — T010 integration test passes; all prior tests still pass.

---

## Phase 4: User Story 4 — Three-State Target Display (Priority: P1)

**Goal**: Targets persist permanently and display three distinct visual states; clicking an Available target marks it Accomplished without consuming the number or spending an action; game ends when all targets are Accomplished.

**Independent Test**: Have a number matching a target → target shows Available style → click it → target shows Accomplished style, number remains in grid, score unchanged. Undo → target reverts. All Accomplished → win modal appears.

- [ ] T013 Write failing unit tests for `TargetList` three-state rendering in `tests/unit/components/TargetList.test.tsx`: pending target renders without interactive affordance; available target renders with an inviting style and is clickable; accomplished target renders as done and click is a no-op; only available targets dispatch `CLAIM_TARGET`
- [ ] T014 Write failing integration test for US4 in `tests/integration/story5-v030-enhancements.test.tsx`: add number matching target → target becomes available → click target → accomplished, score unchanged, number remains → undo → target reverts → make all targets accomplished → game ends
- [ ] T015 Update `src/components/TargetList.tsx`: derive `status` per target (`accomplished` → `'accomplished'`; `numbersGrid.includes(target.value)` → `'available'`; else `'pending'`); apply per-status CSS class; wrap click handler so only `'available'` targets dispatch `CLAIM_TARGET`; non-available targets render as non-interactive (depends on T013, T007)
- [ ] T016 [P] Add CSS rules for three target states in `src/styles/game.css` or `src/index.css`: `.target-pending` (default muted), `.target-available` (highlighted/inviting, cursor pointer), `.target-accomplished` (strikethrough/muted, cursor default) (depends on T015)

**Checkpoint**: `npm test` — T013 and T014 tests pass; game ends when all targets accomplished; all prior tests still pass.

---

## Phase 5: User Story 2 — Simplified Generator Selection (Priority: P2)

**Goal**: Clicking a second generator when one is already selected changes the selection rather than merging; no action cost.

**Independent Test**: Select Generator A → click Generator B → B is selected, A is deselected, score unchanged. No merge occurs.

- [ ] T017 Write failing unit tests in `tests/unit/components/GameBoard.test.tsx` for `handleGeneratorsCellClick`: when a generator is selected and a different non-null generator is clicked, `SELECT_CELL` is dispatched (not `MERGE_CELLS`) and action score does not change
- [ ] T018 Write failing integration test for US2 in `tests/integration/story5-v030-enhancements.test.tsx`: populate two generators, select first, click second, assert second is selected and score is unchanged
- [ ] T019 Update `src/components/GameBoard.tsx` `handleGeneratorsCellClick`: in the branch where `selIdx !== null` and `cell !== null` and `selIdx !== idx`, replace `dispatch({ type: 'MERGE_CELLS', ... })` with `dispatch({ type: 'SELECT_CELL', grid: 'generators', cellIdx: idx })` (depends on T017)

**Checkpoint**: `npm test` — T017 and T018 tests pass; generator-to-generator merge no longer occurs; all prior tests still pass.

---

## Phase 6: User Story 3 — Reset Generators Grid (Priority: P2)

**Goal**: "Reset Generators Grid" button (renamed from "Clear Generators Grid") shows a confirmation prompt; on confirm, clears all generators and creates one with value 1; action is scored and undoable.

**Independent Test**: Populate generators → click Reset Generators Grid → confirm → single generator (value 1) present, score +1. Undo → prior generators restored, score −1. Cancel → no change.

- [ ] T020 Write failing unit tests for `GeneratorsSection` in `tests/unit/components/GeneratorsSection.test.tsx`: "Generate Generator" button is NOT rendered; "Reset Generators Grid" button IS rendered (with correct label); `onGenerateGenerator`/`generateDisabled` props are absent from interface
- [ ] T021 Write failing integration test for US3 in `tests/integration/story5-v030-enhancements.test.tsx`: populate generators, click Reset Generators Grid, confirm, assert single generator value 1 and score +1; test cancel path leaves grid unchanged; test undo reverts reset
- [ ] T022 [P] Update `src/components/GeneratorsSection.tsx`: remove `onGenerateGenerator` and `generateDisabled` props entirely; remove "Generate Generator" button; button label "Clear Generators Grid" → "Reset Generators Grid" (depends on T020)
- [ ] T023 Update `src/components/GameBoard.tsx`: replace `handleClearGenerators` with `handleResetGenerators` dispatching `RESET_GENERATORS_GRID`; update `GeneratorsSection` props — remove `onGenerateGenerator` and `generateDisabled`, change `onClearGenerators` → `onResetGenerators`; remove `canGenerateGenerator()` function (depends on T006, T022)

**Checkpoint**: `npm test` — T020 and T021 tests pass; no Generate Generator button in UI; Reset Generators Grid works with confirmation and undo; all prior tests still pass.

---

## Phase 7: User Story 5 — Curated Starting Target List (Priority: P3)

**Goal**: New players see 8 fixed tutorial targets by default; a Randomize button replaces the list with 8 random targets; game uses whichever list was active at Start.

**Independent Test**: Load setup screen → 8 inputs with tutorial values (1, 2, 5, 12, 25, 67, 69, −420) → click Randomize → 8 new values in range −1023..1024 replace the list → click Start → game uses the randomized targets.

- [ ] T024 Write failing unit tests for `SetupScreen` in `tests/unit/components/SetupScreen.test.tsx`: renders exactly 8 input fields; default values match tutorial list; "Randomize" button is present; clicking Randomize replaces all 8 values with numbers in −1023..1024
- [ ] T025 Write failing integration test for US5 in `tests/integration/app-setup-to-game.test.tsx`: fresh render shows 8 tutorial targets; Randomize produces 8 different values; Start passes targets to game
- [ ] T026 Update `src/components/SetupScreen.tsx`: change array size from 10 to 8; set initial state from `DEFAULT_TARGETS.map(String)` (imported from `gameState.ts`); add "Randomize" button that calls `generateRandomTargets()` and replaces `values` state; update `touched` array size to 8 (depends on T024, T005)

**Checkpoint**: `npm test` — T024 and T025 tests pass; setup screen shows 8 tutorial targets by default; all prior tests still pass.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Ensure full suite health, coverage, and manual verification.

- [ ] T027 [P] Run `npm test` — fix any remaining test failures across all files; target: all tests green
- [ ] T028 [P] Run `npm run test:coverage` — verify overall coverage ≥ 80%; add missing unit tests in `tests/unit/` if any module drops below threshold
- [ ] T029 [P] Run `npm run typecheck` and `npm run lint` — resolve any type errors or lint warnings
- [ ] T030 Manual verification per `specs/005-v030-game-enhancements/quickstart.md` — walk through all rows of the "Key Behaviours to Verify Manually" table with `npm run dev`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS all user story phases**
- **Phase 3 (US1, P1)**: Depends on Phase 2 — no dependency on other story phases
- **Phase 4 (US4, P1)**: Depends on Phase 2 — no dependency on other story phases (can run in parallel with Phase 3)
- **Phase 5 (US2, P2)**: Depends on Phase 2 — no dependency on US1 or US4
- **Phase 6 (US3, P2)**: Depends on Phase 2 — no dependency on US1, US4, or US2
- **Phase 7 (US5, P3)**: Depends on Phase 2 — no dependency on other story phases
- **Phase 8 (Polish)**: Depends on all desired story phases being complete

### User Story Dependencies

- **US1**: No dependency on other stories — isolated to `NumbersSection.tsx` and `GameBoard.tsx` additions
- **US4**: No dependency on other stories — isolated to `TargetList.tsx` and CSS additions; `GameBoard.tsx` wiring already done in T007
- **US2**: No dependency on other stories — single change in `GameBoard.tsx` click handler
- **US3**: No dependency on other stories — `GeneratorsSection.tsx` props and `GameBoard.tsx` handler
- **US5**: No dependency on other stories — isolated to `SetupScreen.tsx`

### Within Each Story

- Failing tests MUST be written before implementation tasks in the same story
- `GameBoard.tsx` is touched across multiple stories (T007, T012, T019, T023) — each touch is additive and confined to a distinct function or prop

### Parallel Opportunities

- T002 and T003 can run in parallel (different test files)
- Once Phase 2 completes: Phase 3 (US1) and Phase 4 (US4) can run in parallel — they touch different component files
- T011 (NumbersSection) and T016 (CSS) are [P] within their phases
- T022 (GeneratorsSection) can run in parallel with other US3 tasks
- All Phase 8 tasks (T027–T029) can run in parallel

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Run in parallel — different test files, no conflicts:
Task T002: "Write failing unit tests for reducer cases in tests/unit/engine/reducer.test.ts"
Task T003: "Write failing unit tests for gameState in tests/unit/engine/gameState.test.ts"

# Sequential after T002/T003:
Task T004 → T005 → T006 → T007 → T008
```

## Parallel Example: Phase 3 + Phase 4 (both P1)

```bash
# Run in parallel after Phase 2 completes — different files:
Developer A → Phase 3 (US1): NumbersSection.tsx + GameBoard.tsx (convert button)
Developer B → Phase 4 (US4): TargetList.tsx + game.css (three-state display)
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundational — CRITICAL)
3. Complete Phase 3 (US1 — Convert to Generator)
4. **STOP and VALIDATE**: Convert a number to a generator; undo; confirm score
5. Demo / ship US1

### Incremental Delivery

1. Setup + Foundational → engine ready
2. US1 → Convert to Generator working → demo
3. US4 → Three-state targets → demo (this is the big UX change)
4. US2 + US3 → Generator interaction cleanup → demo
5. US5 → Tutorial defaults + Randomize → final polish
6. Polish → full suite + coverage check → ship

---

## Notes

- `[P]` tasks touch different files from their sibling tasks in the same phase — safe to parallelize
- `GameBoard.tsx` is the most-touched file (T007, T012, T019, T023); each touch is a distinct, additive change — avoid concurrent edits
- `tests/integration/story2-target-completion.test.tsx` must be updated in Phase 2 (T008) since CLAIM_TARGET semantics change
- `tests/integration/story5-v030-enhancements.test.tsx` is a new file collecting integration scenarios for US1–US4; US5 goes in the existing `app-setup-to-game.test.tsx`
- Verify tests **fail** before implementing — if a test passes before its implementation task, the test is wrong
