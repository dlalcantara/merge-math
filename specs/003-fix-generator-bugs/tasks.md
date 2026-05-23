# Tasks: Fix Generator Bugs

**Input**: Design documents from `specs/003-fix-generator-bugs/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

**Tests**: Included — constitution mandates TDD. Failing tests MUST be written and confirmed failing before implementation.

**Organization**: Tasks are grouped by user story. Both stories are P1 and independent; either can be implemented first.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1 or US2)

---

## Phase 1: Setup (Baseline Verification)

**Purpose**: Confirm the existing test suite is green before touching any code.

- [ ] T001 Run `npm test` from repo root and confirm all 91 tests pass before any changes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No new infrastructure is needed — both fixes are one-line changes in `src/engine/reducer.ts`. This phase is skipped; user stories can begin immediately after T001.

**Checkpoint**: Baseline confirmed → user story work can begin.

---

## Phase 3: User Story 1 — Merge Generators in the Generators Grid (Priority: P1) 🎯

**Goal**: Two generators in the Generators Grid can be merged using the active operator, producing a single merged generator, incrementing the score, and remaining undoable.

**Independent Test**: With two generator cells (e.g., 3 and 5) and operator `+`, select one generator and click the other. Verify the result cell shows 8, the source cell is empty, and the score incremented by 1.

### Tests for User Story 1

> **Write these tests FIRST and confirm they FAIL before implementing T005.**

- [ ] T002 [P] [US1] Add `describe('MERGE_CELLS (generators grid)')` block to `tests/unit/engine/reducer.test.ts` with tests for: correct merged value placed on target, source cell cleared, score incremented, generators selection cleared, history pushed, undo restores both cells
- [ ] T003 [P] [US1] Add integration test scenario "merges two generators using active operator" to `tests/integration/story1-grid-interaction.test.tsx` covering: select generator, click second generator, verify merged value, score, and that source cell is removed

### Implementation for User Story 1

- [ ] T004 [US1] Confirm T002 and T003 tests fail (run `npm test` and check for red)
- [ ] T005 [US1] Fix `MERGE_CELLS` in `src/engine/reducer.ts` line 64: change `const targetVal = (action.sourceGrid === 'numbers' ? sourceGrid : targetGrid)[action.targetIdx] as number` to `const targetVal = sourceGrid[action.targetIdx] as number`
- [ ] T006 [US1] Run `npm test` and confirm T002 and T003 now pass and no existing tests regress

**Checkpoint**: User Story 1 fully functional — generators can be merged in the Generators Grid.

---

## Phase 4: User Story 2 — Generate Number Preserves Generator Selection (Priority: P1)

**Goal**: After a player clicks an already-selected generator to copy its value to the Numbers Grid, the generator remains selected so they can copy again without re-selecting.

**Independent Test**: Select a generator. Click it to copy its value to an empty Numbers Grid cell. Verify the generator cell is still highlighted. Click it again — the value copies a second time without re-selecting.

### Tests for User Story 2

> **Write these tests FIRST and confirm they FAIL before implementing T010.**

- [ ] T007 [P] [US2] Add test `'preserves selectedGeneratorsIdx after GENERATE_NUMBER'` to the existing `describe('GENERATE_NUMBER')` block in `tests/unit/engine/reducer.test.ts`: assert `next.current.selectedGeneratorsIdx === 0` (not null) after dispatching `GENERATE_NUMBER` with `selectedGeneratorsIdx: 0`
- [ ] T008 [P] [US2] Add integration test scenario "generator remains selected after copying value to Numbers Grid" to `tests/integration/story1-grid-interaction.test.tsx`: click selected generator twice, verify two Numbers Grid cells are populated and the generator is still selected

### Implementation for User Story 2

- [ ] T009 [US2] Confirm T007 and T008 tests fail (run `npm test` and check for red)
- [ ] T010 [US2] Fix `GENERATE_NUMBER` in `src/engine/reducer.ts` line 57: remove `selectedGeneratorsIdx: null` from the return, changing `return scored(store, { ...current, numbersGrid: nums, selectedGeneratorsIdx: null })` to `return scored(store, { ...current, numbersGrid: nums })`
- [ ] T011 [US2] Run `npm test` and confirm T007 and T008 now pass and no existing tests regress

**Checkpoint**: User Story 2 fully functional — generator stays selected after each copy action.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and coverage check.

- [ ] T012 Run `npm run test:coverage` and confirm overall coverage remains ≥ 80%
- [ ] T013 [P] Run `npm run typecheck` and confirm zero TypeScript errors
- [ ] T014 [P] Run `npm run lint` and confirm zero lint errors
- [ ] T015 Manually verify both fixes using `npm run dev` following the steps in `specs/003-fix-generator-bugs/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 3)**: Depends on T001 (baseline green); independent of US2
- **US2 (Phase 4)**: Depends on T001 (baseline green); independent of US1
- **Polish (Phase 5)**: Depends on T006 and T011 both passing

### User Story Dependencies

- **US1** and **US2** are fully independent — they touch different lines in `reducer.ts` and can be implemented in either order or in parallel by different developers.

### Within Each User Story

1. Write failing tests ([P] tasks T002+T003 or T007+T008) in parallel
2. Confirm tests fail (T004 or T009)
3. Apply one-line fix (T005 or T010)
4. Run tests to confirm green (T006 or T011)

### Parallel Opportunities

- T002 and T003 can run in parallel (different test files)
- T007 and T008 can run in parallel (different test files)
- T013 and T014 can run in parallel (typecheck and lint are independent)
- Once T001 completes, all of Phase 3 and Phase 4 can proceed in parallel

---

## Parallel Example: Both User Stories

```bash
# After T001 (baseline confirmed), launch both stories in parallel:
# Developer A (or Agent A): Phase 3 — US1 (reducer.ts line 64)
Task: "T002 — Write failing unit test for generators grid merge"
Task: "T003 — Write failing integration test for generators grid merge"
→ T004 (confirm fail) → T005 (fix) → T006 (confirm green)

# Developer B (or Agent B): Phase 4 — US2 (reducer.ts line 57)
Task: "T007 — Write failing unit test for GENERATE_NUMBER selection preservation"
Task: "T008 — Write failing integration test for repeated generate"
→ T009 (confirm fail) → T010 (fix) → T011 (confirm green)
```

---

## Implementation Strategy

### MVP First (Either Story First)

Both user stories are P1 and independent. Recommended order based on mechanical simplicity:

1. Complete T001 (baseline)
2. Complete Phase 3 (US1 — merge fix)
3. **STOP and VALIDATE**: `npm test` green, manually verify merge in Generators Grid
4. Complete Phase 4 (US2 — selection fix)
5. **STOP and VALIDATE**: manually verify generator stays selected after copy
6. Complete Phase 5 (coverage, typecheck, lint, manual QA)

### Incremental Delivery

- After T006: Generators Grid merge works → shippable for Bug 1
- After T011: Generator stays selected → shippable for Bug 2
- After T015: Full QA complete → ready to merge to main

---

## Notes

- Both production code changes are in `src/engine/reducer.ts` only — no component, type, or CSS changes
- US1 fix: line 64 (`targetVal` reads wrong grid)
- US2 fix: line 57 (`selectedGeneratorsIdx: null` removed)
- Verify tests fail (red) before applying any fix — this confirms the test is actually exercising the bug
- Commit after each story's checkpoint to keep history clean
