# Tasks: Auto-Accomplish Targets

**Input**: Design documents from `specs/006-auto-accomplish-targets/`

**Branch**: `006-auto-accomplish-targets`

**Organization**: Tasks are grouped by user story to enable independent implementation and testing. All three user stories are P1 and sequentially dependent: US1 (auto-accomplish logic) → US2 (undo verification) → US3 (display layer cleanup). No new files are created — all changes are targeted edits to 4 source files and 3 test files.

**TDD**: Failing tests are written before implementation (Constitution II). Each "Write failing tests" task must be run and confirmed red before the corresponding implementation task begins.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Setup

No new project structure needed — all changes target existing files.

- [ ] T001 Confirm all existing tests pass before any changes: `npm test` in project root

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Remove the `CLAIM_TARGET` action from the type contract. This causes compile-time errors that drive all subsequent implementation tasks and ensures no dead code remains.

**⚠️ CRITICAL**: All user story tasks depend on this change.

- [ ] T002 Remove `{ type: 'CLAIM_TARGET'; targetValue: number }` variant from `GameAction` union in `src/engine/types.ts`

**Checkpoint**: TypeScript should now error on any remaining `CLAIM_TARGET` usages — those errors mark the exact lines to fix in Phase 3.

---

## Phase 3: User Story 1 — Target Auto-Accomplishes on Number Match (Priority: P1) 🎯 MVP

**Goal**: When a number equal to an unaccomplished target appears in the Numbers Grid as a result of `GENERATE_NUMBER`, `MERGE_CELLS` (numbers), or `MERGE_ALL_NUMBERS`, the target immediately and automatically transitions to "accomplished" — no player click required.

**Independent Test**: Generate a number matching a target; confirm the target shows "accomplished" without any click, the number remains in the grid, and the action count is unchanged.

### Tests for User Story 1 (TDD — write first, confirm red, then implement)

- [ ] T003 [US1] Write failing unit tests covering `withAutoAccomplish` behaviour inside `GENERATE_NUMBER` (target auto-accomplishes; already-accomplished target stays accomplished; no action-count change) in `tests/unit/engine/reducer.test.ts`
- [ ] T004 [P] [US1] Write failing unit tests covering auto-accomplish inside `MERGE_CELLS` for the numbers grid (result value matches a target → auto-accomplished) in `tests/unit/engine/reducer.test.ts`
- [ ] T005 [P] [US1] Write failing unit tests covering auto-accomplish inside `MERGE_ALL_NUMBERS` (result matches a target → auto-accomplished) in `tests/unit/engine/reducer.test.ts`

### Implementation for User Story 1

- [ ] T006 [US1] Add `withAutoAccomplish(state: GameState): GameState` pure helper function to `src/engine/reducer.ts` (maps targets: if `!accomplished && numbersGrid.includes(value)` → mark accomplished)
- [ ] T007 [US1] Apply `withAutoAccomplish` in the `GENERATE_NUMBER` case — wrap next state before passing to `scored()` in `src/engine/reducer.ts`
- [ ] T008 [P] [US1] Apply `withAutoAccomplish` in the `MERGE_CELLS` (numbers branch) case — wrap next state before passing to `scored()` in `src/engine/reducer.ts`
- [ ] T009 [P] [US1] Apply `withAutoAccomplish` in the `MERGE_ALL_NUMBERS` case — wrap next state before passing to `scored()` in `src/engine/reducer.ts`
- [ ] T010 [US1] Remove the `case 'CLAIM_TARGET':` block entirely from `src/engine/reducer.ts`

**Checkpoint**: T003–T005 tests must now be green. TypeScript compile errors from T002 must be resolved. `npm test` passes (some TargetList and integration tests will still fail — that is expected).

---

## Phase 4: User Story 2 — Undo Reverts an Accomplished Target (Priority: P1)

**Goal**: Undoing the action that caused a target to auto-accomplish reverts the target to "Not yet accomplished." Undo is the only path back.

**Independent Test**: Generate a matching number (target auto-accomplishes), trigger undo, confirm target returns to "Not yet accomplished" and action count decrements.

### Tests for User Story 2 (TDD — write first, confirm red, then implement)

- [ ] T011 [US2] Write failing unit test: `GENERATE_NUMBER` auto-accomplishes a target → `UNDO` reverts target to `accomplished: false` (one undo step, not two) in `tests/unit/engine/reducer.test.ts`
- [ ] T012 [P] [US2] Write failing unit test: multiple targets auto-accomplished by a single `MERGE_CELLS` action → single `UNDO` reverts all of them simultaneously in `tests/unit/engine/reducer.test.ts`

### Implementation for User Story 2

- [ ] T013 [US2] Verify the `UNDO` case in `src/engine/reducer.ts` — no code change required; confirm that restoring `history[history.length - 1]` automatically reverts auto-accomplished targets since target state is bundled in `scored()`. Add a one-line comment in the reducer only if the bundling is non-obvious to a future reader.

**Checkpoint**: T011–T012 tests must now be green. All reducer tests pass.

---

## Phase 5: User Story 3 — Two-State Target Display (Priority: P1)

**Goal**: The target list shows only "Not yet accomplished" (`target-pending`) and "Accomplished" (`target-accomplished`) — no "available" state, no interactive buttons. `TargetList` becomes a pure display component.

**Independent Test**: Observe the target list in any game state; confirm only two visual styles appear and clicking a target element has no effect.

### Tests for User Story 3 (TDD — write first, confirm red, then implement)

- [ ] T014 [US3] Rewrite `tests/unit/components/TargetList.test.tsx` with failing tests: pending target renders with `target-pending` class; accomplished target renders with `target-accomplished` class; no `<button>` element present; no `target-available` class appears; `numbersGrid` and `dispatch` props are gone
- [ ] T015 [US3] Rewrite `tests/integration/story2-target-completion.test.tsx` with failing tests covering: (a) generate matching number → target auto-accomplishes, number stays in grid, score unchanged; (b) undo after auto-accomplish → target reverts; (c) all targets accomplished → win modal appears

### Implementation for User Story 3

- [ ] T016 [US3] Rewrite `src/components/TargetList.tsx` — remove `numbersGrid`, `dispatch`, and `TargetStatus` type; remove `getStatus()`; render non-interactive `<span className={target.accomplished ? 'target-accomplished' : 'target-pending'}>` inside `<li>` for each target
- [ ] T017 [US3] Update `src/components/GameBoard.tsx` — remove `numbersGrid` and `dispatch` props from the `<TargetList>` JSX element

**Checkpoint**: All 5 test files pass. `npm test` exits green.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Remove dead CSS; confirm full coverage gate.

- [ ] T018 Remove the `.target-available { ... }` CSS rule from `src/styles/game.css` (dead style — no component emits this class after T016)
- [ ] T019 Run `npm run test:coverage` and confirm all tests pass and coverage remains ≥ 80%

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Confirm baseline)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion — **blocks all user stories**
- **Phase 3 (US1)**: Depends on Phase 2 — write tests first, then implement
- **Phase 4 (US2)**: Depends on Phase 3 completion (withAutoAccomplish must exist)
- **Phase 5 (US3)**: Depends on Phase 2 (types updated); can begin test-writing in parallel with Phase 4 implementation, but implementation (T016–T017) requires Phase 3 complete to avoid prop-type conflicts
- **Phase 6 (Polish)**: Depends on Phase 5 completion

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2 — core engine logic
- **US2 (P1)**: Starts after US1 complete — undo tests require withAutoAccomplish to be wired
- **US3 (P1)**: Test-writing (T014–T015) can start after Phase 2; implementation (T016–T017) starts after US1 complete

### Within Each User Story

1. Write failing tests (confirm red)
2. Implement
3. Confirm tests green
4. Move to next story

### Parallel Opportunities

- T004 and T005 (test-writing) are parallel — same file is safe because they add separate `describe` blocks
- T008 and T009 (implementation) are parallel — each modifies a different `case` in the same file; coordinate to avoid conflicts or sequence them
- T011 and T012 (undo test-writing) are parallel — same file, separate `describe` blocks

---

## Parallel Example: User Story 1 Tests

```text
# T003, T004, T005 can all be drafted simultaneously (different describe blocks in reducer.test.ts):
Task T003: "Add describe('GENERATE_NUMBER auto-accomplish', ...) block to reducer.test.ts"
Task T004: "Add describe('MERGE_CELLS auto-accomplish', ...) block to reducer.test.ts"
Task T005: "Add describe('MERGE_ALL_NUMBERS auto-accomplish', ...) block to reducer.test.ts"

# T008 and T009 implementation can be parallelized (different case blocks in reducer.ts):
Task T008: "Wrap next state with withAutoAccomplish in MERGE_CELLS numbers branch"
Task T009: "Wrap next state with withAutoAccomplish in MERGE_ALL_NUMBERS case"
```

---

## Implementation Strategy

### MVP (All Stories Are P1 — Complete Sequentially)

1. **Phase 1**: Confirm baseline green (`npm test`)
2. **Phase 2**: Remove `CLAIM_TARGET` from types (T002) — triggers compile errors that guide implementation
3. **Phase 3**: Write failing reducer tests → add `withAutoAccomplish` → apply to 3 cases → remove `CLAIM_TARGET` case
4. **Phase 4**: Write failing undo tests → verify undo path (no new code) → green
5. **Phase 5**: Rewrite TargetList tests + integration test → simplify TargetList → update GameBoard
6. **Phase 6**: Remove dead CSS → coverage check
7. **STOP and VALIDATE**: `npm run test:coverage` confirms all green, coverage ≥ 80%

### Key Risk

The existing `TargetList.test.tsx` and `story2-target-completion.test.tsx` tests will fail after T002 (type removal) because they reference `CLAIM_TARGET` and the three-state model. This is expected and intentional — they are replaced in T014–T015 (Phase 5). Do not attempt to keep old tests green during Phases 3–4; focus on new tests passing.

---

## Notes

- All changes are in 4 source files (`types.ts`, `reducer.ts`, `TargetList.tsx`, `GameBoard.tsx`) and 3 test files
- No new files created
- `[P]` marks tasks that touch independent sections of the same file — coordinate or sequence if working solo
- The `UNDO` case in `reducer.ts` requires no code change (T013 is verification only)
- `target-available` CSS class removal (T018) is safe after T016 — no component emits that class
