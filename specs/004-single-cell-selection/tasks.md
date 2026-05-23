# Tasks: Single Cell Selection

**Input**: Design documents from `specs/004-single-cell-selection/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Included — TDD is mandatory per constitution (Tests MUST be written before implementation; failing test MUST exist before production code).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependency)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (Baseline Verification)

**Purpose**: Confirm the environment is green before touching anything.

- [x] T001 Run full test suite and record baseline pass count: `npm test` (must show 100 passing)

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Add the `DESELECT_ALL` action type — required by reducer and component changes in every user story.

**⚠️ CRITICAL**: No user story implementation can begin until T002 is complete.

- [x] T002 Add `{ type: 'DESELECT_ALL' }` to the `GameAction` union in `src/engine/types.ts`

**Checkpoint**: Type system updated — user story work can begin.

---

## Phase 3: User Story 1 — Global Single Selection (Priority: P1) 🎯 MVP

**Goal**: Selecting a cell in one grid automatically clears any selection in the other grid. At most one cell is highlighted across both grids at any time.

**Independent Test**: Select a Numbers Grid cell, then click a non-empty Generators Grid cell — only the Generators cell is highlighted. Reverse direction and confirm the same.

### Tests for User Story 1 ⚠️ Write FIRST — must FAIL before implementation

- [x] T003 [US1] Write failing unit test: `SELECT_CELL 'numbers'` with generators selected → `selectedGeneratorsIdx` becomes null, in `tests/unit/engine/reducer.test.ts`
- [x] T004 [US1] Write failing unit test: `SELECT_CELL 'generators'` with numbers selected → `selectedNumbersIdx` becomes null, in `tests/unit/engine/reducer.test.ts`
- [x] T005 [US1] Write failing unit test: `DESELECT_ALL` sets both `selectedNumbersIdx` and `selectedGeneratorsIdx` to null, in `tests/unit/engine/reducer.test.ts`
- [x] T006 [US1] Write failing integration test: select Generators cell, click non-empty Numbers cell → Generators cell deselects and Numbers cell selects, in `tests/integration/story1-grid-interaction.test.tsx`

### Implementation for User Story 1

- [x] T007 [US1] Update `SELECT_CELL 'numbers'` case in `src/engine/reducer.ts` to also set `selectedGeneratorsIdx: null`
- [x] T008 [US1] Update `SELECT_CELL 'generators'` case in `src/engine/reducer.ts` to also set `selectedNumbersIdx: null`
- [x] T009 [US1] Add `DESELECT_ALL` case to `src/engine/reducer.ts` setting both selection fields to null
- [x] T010 [US1] Update `handleNumbersCellClick` in `src/components/GameBoard.tsx`: when `selectedNumbersIdx === null` and `selectedGeneratorsIdx !== null` and clicked cell is non-null, dispatch `SELECT_CELL 'numbers'` (reducer auto-clears generators)
- [x] T011 [US1] Update `handleGeneratorsCellClick` in `src/components/GameBoard.tsx`: when `selectedGeneratorsIdx === null` and `selectedNumbersIdx !== null` and clicked cell is non-null, dispatch `SELECT_CELL 'generators'` (reducer auto-clears numbers)
- [x] T012 [US1] Verify US1 tests pass: `npm test tests/unit/engine/reducer.test.ts tests/integration/story1-grid-interaction.test.tsx`

**Checkpoint**: US1 is independently testable. Global single-selection constraint is enforced.

---

## Phase 4: User Story 2 — Empty Cell in Non-Selected Grid Clears Selection (Priority: P2)

**Goal**: Clicking an empty cell in the grid that does not hold the current selection clears the selection entirely — no movement, no action scored.

**Independent Test**: Select a Generators Grid cell. Click any empty Numbers Grid cell. No cell is highlighted afterwards.

### Tests for User Story 2 ⚠️ Write FIRST — must FAIL before implementation

- [x] T013 [US2] Write failing integration test: select Generators cell, click empty Numbers cell → no cell selected, in `tests/integration/story1-grid-interaction.test.tsx`
- [x] T014 [US2] Write failing integration test: select Numbers cell, click empty Generators cell → no cell selected, in `tests/integration/story1-grid-interaction.test.tsx`

### Implementation for User Story 2

- [x] T015 [US2] Update `handleNumbersCellClick` in `src/components/GameBoard.tsx`: when `selectedNumbersIdx === null` and `selectedGeneratorsIdx !== null` and clicked cell is null, dispatch `DESELECT_ALL`
- [x] T016 [US2] Update `handleGeneratorsCellClick` in `src/components/GameBoard.tsx`: when `selectedGeneratorsIdx === null` and `selectedNumbersIdx !== null` and clicked cell is null, dispatch `DESELECT_ALL`
- [x] T017 [US2] Verify US2 tests pass: `npm test tests/integration/story1-grid-interaction.test.tsx`

**Checkpoint**: US2 is independently testable. Empty-cell cross-grid click clears selection.

---

## Phase 5: User Story 3 — Tap Outside to Deselect (Priority: P3)

**Goal**: Tapping or clicking anywhere on the page that is not a grid cell, operator control, or button clears the selection immediately. Works on mobile (720×1280, no scroll).

**Independent Test**: Select any grid cell. Click the background area of the `.game-board` div. No cell is highlighted afterwards.

### Tests for User Story 3 ⚠️ Write FIRST — must FAIL before implementation

- [x] T018 [US3] Write failing integration test: select a cell, fire click on `.game-board` root element → no cell selected, in `tests/integration/story1-grid-interaction.test.tsx`

### Implementation for User Story 3

- [x] T019 [US3] Add `handleBoardClick(e: React.MouseEvent<HTMLDivElement>)` function to `src/components/GameBoard.tsx`: if `(e.target as HTMLElement).closest('button')` is null, dispatch `DESELECT_ALL`
- [x] T020 [US3] Wire `onClick={handleBoardClick}` to the root `<div className="game-board">` in `src/components/GameBoard.tsx`
- [x] T021 [US3] Verify US3 test passes: `npm test tests/integration/story1-grid-interaction.test.tsx`

**Checkpoint**: All three user stories are independently functional and tested.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Full regression check and manual verification.

- [x] T022 Run complete test suite to confirm no regressions: `npm test` (must show 100 + 6 new = 106 passing)
- [ ] T023 [P] Manual verification: run `npm run dev` and step through every row of the quickstart.md verification table

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 (needs `DESELECT_ALL` type)
- **User Story 2 (Phase 4)**: Depends on Phase 3 (handler structure established in T010/T011)
- **User Story 3 (Phase 5)**: Depends on Phase 2 (needs `DESELECT_ALL`); independent of US2
- **Polish (Phase 6)**: Depends on all desired stories being complete

### User Story Dependencies

- **US1**: Blocks US2 (US2 builds on the same `handleNumbersCellClick` / `handleGeneratorsCellClick` code paths established in US1)
- **US2**: Independent of US3
- **US3**: Independent of US2; only needs T002 (DESELECT_ALL type) and T009 (DESELECT_ALL reducer case)

### Within Each Story

1. Failing tests written and confirmed failing
2. Reducer changes (types + reducer.ts)
3. Component changes (GameBoard.tsx)
4. Tests verified green
5. Full suite verified green before moving to next story

---

## Parallel Opportunities

Within this feature, parallelism is limited because all changes converge on three files. Genuine parallel opportunities:

```bash
# T003, T004, T005 are sequential (same file: reducer.test.ts)
# T013 and T014 can be written together (same file: story1-grid-interaction.test.tsx, distinct test cases)
# T022 and T023 can run simultaneously (different activities: automated vs. manual)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Baseline verification (T001)
2. Complete Phase 2: Add `DESELECT_ALL` type (T002)
3. Complete Phase 3: User Story 1 (T003–T012)
4. **STOP and VALIDATE**: Only one cell ever highlighted — global constraint works
5. Ship or demo; US2 and US3 can follow

### Incremental Delivery

1. Phase 1 + 2 → environment ready
2. Phase 3 (US1) → global selection constraint enforced → demo
3. Phase 4 (US2) → empty-cell cross-grid deselection → demo
4. Phase 5 (US3) → tap-outside deselection → demo
5. Phase 6 → regression-free ship

---

## Notes

- `Cell.tsx` renders every grid cell as a `<button>`, so `target.closest('button')` in `handleBoardClick` correctly excludes ALL interactive elements (grid cells, action buttons, operator buttons) in one check
- `DESELECT_ALL` is not a scored action and must NOT push to `store.history`; the reducer returns `{ ...store, current: { ... } }` without calling `scored()`
- Same-grid empty-cell click (Cell Movement, FR-007 from spec 001) is untouched — the cross-grid empty-cell logic only fires when the clicked grid does NOT hold the current selection
- Undo does not restore cleared selections — undo only reverts scored game state; deselection is unscored
