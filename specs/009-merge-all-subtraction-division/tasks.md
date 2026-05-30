# Tasks: Merge All Numbers — Subtraction & Division Support

**Input**: Design documents from `specs/009-merge-all-subtraction-division/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, quickstart.md ✅

**Tests**: Included — the project constitution mandates TDD (failing tests before production code).

**Organization**: Because the production code change is a single atomic removal of an operator guard that simultaneously enables both US1 (subtraction) and US2 (division), all failing tests are written as a foundational phase before any implementation. This satisfies TDD for all user stories.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup

No new project structure, dependencies, or configuration required. All changes land in existing files.

**Checkpoint**: Immediately proceed to Phase 2.

---

## Phase 2: Foundational — TDD Failing Tests

**Purpose**: Write all failing tests for US1 and US2 before any production code changes. The implementation (Phase 3) is a single atomic change; writing both stories' tests here ensures TDD compliance for both.

**⚠️ CRITICAL**: Confirm each test FAILS before proceeding to Phase 3.

- [x] T001 [US1] Add unit test `MERGE_ALL_NUMBERS with - subtracts sequentially` to `tests/unit/engine/reducer.test.ts` — store with `activeOperator: '-'`, grid `[10, 3, 2, null×6]`, dispatch `MERGE_ALL_NUMBERS`, expect `numbersGrid[0]` to be `5` (10-3=7, 7-2=5) and all other cells null
- [x] T002 [P] [US2] Add unit test `MERGE_ALL_NUMBERS with / divides sequentially` to `tests/unit/engine/reducer.test.ts` — store with `activeOperator: '/'`, grid `[12, 3, 2, null×6]`, dispatch `MERGE_ALL_NUMBERS`, expect `numbersGrid[0]` to be `2` (12÷3=4, 4÷2=2)
- [x] T003 [P] [US1] Add unit test `MERGE_ALL_NUMBERS with / by zero yields 0` to `tests/unit/engine/reducer.test.ts` — grid `[10, 0, null×7]`, expect result `0`
- [x] T004 [P] [US1] Add unit test `MERGE_ALL_NUMBERS with - increments actionScore` to `tests/unit/engine/reducer.test.ts` — confirm `actionScore` increments to 1
- [x] T005 [P] [US1] Add unit test `MERGE_ALL_NUMBERS with - pushes to history (undo restores)` to `tests/unit/engine/reducer.test.ts` — dispatch then UNDO, confirm original grid restored
- [x] T006 [P] [US2] Add unit test `MERGE_ALL_NUMBERS with / pushes to history (undo restores)` to `tests/unit/engine/reducer.test.ts`
- [x] T007 [US1] Update integration test `'Merge All button is disabled for operator -'` in `tests/integration/story4-bulk-operations.test.tsx` — change assertion from `toBeDisabled()` to `not.toBeDisabled()` (the test description should also be updated to `'Merge All button is enabled for operator - with 2+ numbers'`)
- [x] T008 [P] [US2] Update integration test `'Merge All button is disabled for operator /'` in `tests/integration/story4-bulk-operations.test.tsx` — same inversion as T007
- [x] T009 [P] [US1] Add integration test `'Merge All with - subtracts values left-to-right'` to `tests/integration/story4-bulk-operations.test.tsx` — mock initial state with `[10, 3, null×7]` and `activeOperator: '-'`, click "Merge All Numbers", assert grid shows `7`
- [x] T010 [P] [US2] Add integration test `'Merge All with / divides values left-to-right'` to `tests/integration/story4-bulk-operations.test.tsx` — mock initial state with `[12, 3, null×7]` and `activeOperator: '/'`, click "Merge All Numbers", assert grid shows `4`

**Checkpoint**: Run `npm test` — T001–T010 MUST all fail (or the two updated tests T007/T008 must now fail due to assertion flip). No production code should be touched until confirmed.

---

## Phase 3: User Story 1 — Merge All with Subtraction (Priority: P1) 🎯 MVP

**Goal**: Remove the operator restriction that blocks "Merge All Numbers" for subtraction. This single implementation also enables US2 (division) — see US2 checkpoint in Phase 4.

**Independent Test**: With 2+ numbers on the grid and `-` active, "Merge All Numbers" is enabled and produces the correct sequential subtraction result.

### Implementation for User Story 1

- [x] T011 [US1] Remove operator guard from `MERGE_ALL_NUMBERS` in `src/engine/reducer.ts` — delete the line `if (op !== '+' && op !== '*') return store` (line ~110)
- [x] T012 [P] [US1] Update `canMergeAll` in `src/components/ActionButtons.tsx` — replace `state.activeOperator === '+' || state.activeOperator === '*'` with `true` (or simply remove the operator check, keeping only the `>= 2` count check)
- [x] T013 [P] [US1] Update `canMergeAll` in `src/components/GameBoard.tsx` — same change as T012

**Checkpoint**: Run `npm test` — all of T001–T010 should now pass. US1 is fully functional. Verify manually per `quickstart.md` subtraction scenario.

---

## Phase 4: User Story 2 — Merge All with Division (Priority: P2)

**Goal**: Confirm that the Phase 3 implementation also correctly handles division. No additional production code changes required.

**Independent Test**: With 2+ numbers on the grid and `÷` active, "Merge All Numbers" is enabled and produces the correct sequential division result (truncated integer).

### Verification for User Story 2

- [x] T014 [US2] Run `npm test` and confirm T002, T003, T006, T008, T010 all pass — these are the division-specific tests written in Phase 2
- [x] T015 [US2] Manually verify division in browser per `quickstart.md` — generate 12, 3, 2 onto grid, switch to `÷`, click "Merge All Numbers", confirm result is `2`
- [x] T016 [US2] Manually verify division-by-zero edge case — generate 10 and 0 onto grid, switch to `÷`, click "Merge All Numbers", confirm result is `0` (not an error)

**Checkpoint**: US2 is complete. Both subtraction and division work end-to-end.

---

## Phase 5: User Story 3 — Consistent Button Enable/Disable State (Priority: P3)

**Goal**: Confirm the button enable/disable state is identical for all four operators.

**Independent Test**: Cycle through all four operators with 0, 1, and 2+ numbers and verify the button state is correct for each combination.

### Verification for User Story 3

- [x] T017 [US3] Manually verify button state consistency per `quickstart.md` — with 2 numbers on the grid, cycle through `+`, `-`, `×`, `÷` and confirm "Merge All Numbers" is enabled for all four; then reduce to 1 number and confirm it's disabled for all four
- [x] T018 [US3] Run `npm test` and confirm no existing tests for `+` and `×` merge-all behavior regressed

**Checkpoint**: All three user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T019 [P] Run `npm run test:coverage` and confirm unit test coverage remains ≥ 80% for all modules
- [x] T020 [P] Run `npm run lint` and confirm no ESLint errors introduced
- [x] T021 [P] Run `npm run typecheck` and confirm TypeScript reports no errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all implementation
- **US1 Implementation (Phase 3)**: Depends on Phase 2 (tests written and confirmed failing)
- **US2 Verification (Phase 4)**: Depends on Phase 3 (implementation done)
- **US3 Verification (Phase 5)**: Depends on Phase 3
- **Polish (Phase 6)**: Depends on Phases 3–5

### User Story Dependencies

- **US1 (P1)**: Blocked by Phase 2; no dependency on US2 or US3
- **US2 (P2)**: Depends on US1 implementation (T011–T013) — the same code change enables both
- **US3 (P3)**: Depends on US1 implementation; validates across all operators

### Within Each Phase

- T001 must complete before T002–T010 can be parallelized (establishes the test file state)
- T007 must complete before T008 (same file, sequential edits)
- T011 must complete before T012–T013 (reducer and components can then update in parallel)

### Parallel Opportunities

- T002–T006 can all run in parallel (same file, different `describe` blocks — coordinate to avoid conflicts)
- T008–T010 can run in parallel after T007 (same file — coordinate)
- T012 and T013 can run in parallel (different files)
- T019, T020, T021 can all run in parallel (read-only checks)

---

## Parallel Example: Phase 2 (Test Writing)

```bash
# Sequential:
Task T001: Add subtraction unit test to tests/unit/engine/reducer.test.ts

# Then parallel (all touch different describe blocks or same file at different locations):
Task T002: Add division unit test to tests/unit/engine/reducer.test.ts
Task T004: Add subtraction actionScore unit test

# Then:
Task T007: Update disabled-for-minus integration test to assert enabled

# Then parallel:
Task T008: Update disabled-for-division integration test
Task T009: Add subtraction result integration test
Task T010: Add division result integration test
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Write all failing tests
2. Complete Phase 3: Remove guard + update predicates (3 lines of code total)
3. **STOP and VALIDATE**: `npm test` — all tests pass
4. Demo subtraction merge to stakeholder

### Incremental Delivery

1. Phase 2 + Phase 3 → Subtraction and division both work (one atomic change)
2. Phase 4 → Division verified
3. Phase 5 → Button consistency validated
4. Phase 6 → Quality gates pass → ready to merge

---

## Notes

- The entire production code change is ~3 lines across 3 files
- The bulk of the work is in the test layer (TDD — as required by the constitution)
- [P] tasks involve different files; coordinate on same-file edits (reducer.test.ts, story4-bulk-operations.test.tsx)
- Commit after Phase 2 (all tests written) and again after Phase 3 (implementation complete)
- The `operators.ts` and `types.ts` files require no changes
