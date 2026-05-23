---

description: "Task list for Merge Math Game MVP implementation"
---

# Tasks: Merge Math Game MVP

**Input**: Design documents from `/specs/001-merge-math-game/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/game-engine.md ✅, quickstart.md ✅

**Tests**: Included — constitution §II mandates TDD, 80% unit coverage, and one integration test file per user story.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- File paths are relative to repository root

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize the Vite + React + TypeScript project with all tooling, test configuration, and deployment workflow.

- [ ] T001 Initialize Vite 5 + React 18 + TypeScript 5 project with `npm create vite@latest . -- --template react-ts` and install runtime + dev dependencies: `react@18`, `@vitejs/plugin-react`, `vitest@1`, `@vitest/coverage-v8`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom` in package.json
- [ ] T002 Configure tsconfig.json with `strict: true`, `lib: ["DOM", "ES2022"]`, `jsx: "react-jsx"`, and `types: ["vitest/globals", "@testing-library/jest-dom"]`
- [ ] T003 [P] Configure vite.config.ts with `base: '/merge-math/'`, Vitest `environment: 'jsdom'`, `globals: true`, and `coverage.thresholds` enforcing 80% statements/branches/lines
- [ ] T004 [P] Add npm scripts to package.json: `dev` (vite), `test` (vitest run), `test:watch` (vitest), `test:coverage` (vitest run --coverage), `build` (vite build), `preview` (vite preview), `lint` (eslint src), `typecheck` (tsc --noEmit)
- [ ] T005 [P] Create directory scaffold with placeholder `.gitkeep` files: `src/engine/`, `src/hooks/`, `src/components/`, `src/styles/`, `tests/unit/engine/`, `tests/unit/components/`, `tests/integration/`
- [ ] T006 Create GitHub Actions workflow in `.github/workflows/deploy.yml` that runs `npm ci && npm run build` on push to `main` and publishes `./dist` to the `gh-pages` branch using `peaceiris/actions-gh-pages`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core engine types, pure functions, and React wiring that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T007 Create `src/engine/types.ts` with all shared type definitions: `CellValue` (number | null), `Operator` ('+' | '-' | '*' | '/'), `GridType` ('numbers' | 'generators'), `GameState` interface (7 fields per data-model.md), `GameStore` interface (current + history), and `GameAction` discriminated union with all 12 action types (GENERATE_GENERATOR, GENERATE_NUMBER, MERGE_CELLS, CLAIM_TARGET, MERGE_ALL_NUMBERS, CLEAR_NUMBERS_GRID, CLEAR_GENERATORS_GRID, SELECT_CELL, DESELECT_CELL, MOVE_CELL, SET_OPERATOR, UNDO) and their payloads per data-model.md
- [ ] T008 Write unit tests for `applyOperator()` in `tests/unit/engine/operators.test.ts` — one test per operator (+, -, *, /), truncating integer division, divide-by-zero returning 0, negative operands; tests must fail before T009 is complete
- [ ] T009 Create `src/engine/operators.ts` implementing `applyOperator(a: number, b: number, op: Operator): number` for all four operators per contracts/game-engine.md (`Math.trunc(a / b)` for `/`, `b === 0 ? 0 : …`)
- [ ] T010 Write unit tests for `generateTargets()` and `generateInitialState()` in `tests/unit/engine/gameState.test.ts` — test array length (10), uniqueness, range [-1023, 1024], sort by ascending |value|, initial state invariants (numbersGrid length 9, generatorsGrid[0] === 1, actionScore 0, operator '+', null selections); tests must fail before T011 is complete
- [ ] T011 Create `src/engine/gameState.ts` implementing `generateTargets(): number[]` (rejection-sample 10 unique integers from [-1023, 1024], sort by Math.abs ascending, positive before negative on ties) and `generateInitialState(): GameState` (all-null numbersGrid, generatorsGrid[0]=1 rest null, targets from generateTargets(), operator '+', score 0, null selections)
- [ ] T012 Create `src/engine/reducer.ts` skeleton with `gameReducer(store: GameStore, action: GameAction): GameStore` — implement SET_OPERATOR (update activeOperator, no history push), SELECT_CELL (set selectedIdx for grid, no history), DESELECT_CELL (null selectedIdx, no history), MOVE_CELL (move value to empty slot, null source, no history, no score), NEW_GAME (return fresh store with generateInitialState()); leave scored action cases as no-ops returning store unchanged
- [ ] T013 Create `src/hooks/useGame.ts` exporting a `useGame()` hook that wraps `useReducer(gameReducer, { current: generateInitialState(), history: [] })` and returns `{ store, dispatch }` with typed `dispatch: (action: GameAction) => void`
- [ ] T014 [P] Create `src/main.tsx` entry point (`ReactDOM.createRoot(document.getElementById('root')!).render(<App />)`) and `src/App.tsx` placeholder rendering `<div className="app"><h1>Merge Math</h1></div>`
- [ ] T015 [P] Create `src/styles/game.css` with CSS custom properties (`--color-cell-bg`, `--color-selected`, `--color-operator-active`, `--color-disabled`, `--color-target`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`) and base reset styles; import in `src/main.tsx`

**Checkpoint**: Foundation ready — `npm run typecheck` passes, `npm test` passes for engine unit tests

---

## Phase 3: User Story 1 — Core Grid Interaction (Priority: P1) 🎯 MVP

**Goal**: Players can see both grids (3×3 Numbers, 2×2 Generators), select cells, copy generator values into the Numbers Grid, and merge Numbers Grid cells using the active arithmetic operator.

**Independent Test**: Start the game — a generator with value 1 is pre-placed at index 0 of the Generators Grid. Click it to select it (first click), click it again to copy its value into an empty Numbers Grid cell (GENERATE_NUMBER). Repeat to place a second 1. Select a Numbers Grid cell containing 1, then click the other Numbers Grid cell containing 1 — with operator + active, the clicked cell becomes 2 and the source clears. Verify actionScore is 3 (1 generate + 1 generate + 1 merge).

> **NOTE: Write all test tasks (T016–T019) FIRST; ensure they FAIL before implementing T020–T026**

### Tests for User Story 1

- [ ] T016 Write integration test for US1 in `tests/integration/story1-grid-interaction.test.tsx` covering all 4 acceptance scenarios: (1) generate generator places value 1 in generators grid and increments score; (2) clicking an already-selected generator cell copies its value to numbers grid; (3) merging two numbers grid cells applies active operator and increments score; (4) moving a selected cell to an empty slot does NOT increment score
- [ ] T017 Write unit tests for GENERATE_GENERATOR, GENERATE_NUMBER, and MERGE_CELLS reducer actions in `tests/unit/engine/reducer.test.ts` — cover happy path, no-op guards (full grid returns unchanged store), history push on each scored action, score increment, all four operators for MERGE_CELLS including division by zero
- [ ] T018 [P] Write unit tests for Cell component in `tests/unit/components/Cell.test.tsx` — renders cell value when non-null, renders empty when null, calls onClick handler on click, has correct aria-label, has aria-pressed="true" when selected
- [ ] T019 [P] Write unit tests for Grid component in `tests/unit/components/Grid.test.tsx` — renders exactly 9 cells for numbers grid, 4 cells for generators grid, passes correct CellValue to each Cell, click on cell index calls onCellClick with correct index

### Implementation for User Story 1

- [ ] T020 [US1] Implement GENERATE_GENERATOR action in `src/engine/reducer.ts`: find first null slot in generatorsGrid, place value 1, push deep copy of current state to history, increment actionScore by 1; return unchanged store if generatorsGrid has no null slot
- [ ] T021 [US1] Implement GENERATE_NUMBER action in `src/engine/reducer.ts`: find first null slot in numbersGrid, copy value from generatorsGrid[selectedGeneratorsIdx], push history, increment score; return unchanged store if numbersGrid has no null slot or selectedGeneratorsIdx is null
- [ ] T022 [US1] Implement MERGE_CELLS action in `src/engine/reducer.ts`: apply `applyOperator(sourceValue, targetValue, activeOperator)`, set source cell to null, set target cell to result, clear selection, push history, increment score — source is the currently selected cell in the grid specified by action.sourceGrid
- [ ] T023 [P] [US1] Create `src/components/Cell.tsx`: `<button>` element rendering the cell value (or empty string when null), onClick calls parent handler, `aria-label` describing value and position, `aria-pressed` when selected, CSS classes for `cell--selected` and `cell--empty`
- [ ] T024 [P] [US1] Create `src/components/Grid.tsx`: `<div role="grid">` using CSS Grid layout, maps CellValue[] to Cell components passing index-based selectedIdx and onCellClick; accepts `cols` prop (3 or 2) and `label` prop for aria-label
- [ ] T025 [P] [US1] Create `src/components/OperatorSelector.tsx`: four `<button aria-pressed>` elements for +, -, *, /; dispatches SET_OPERATOR on click; highlights active operator via CSS class and aria-pressed="true"
- [ ] T026 [US1] Create `src/components/GameBoard.tsx` wiring `useGame()` hook: renders numbers Grid (3×3), generators Grid (2×2), and OperatorSelector; implements the cell-click state machine from data-model.md (SELECT_CELL → DESELECT_CELL/MOVE_CELL/MERGE_CELLS/GENERATE_NUMBER based on selection state and cell contents); update `src/App.tsx` to render `<GameBoard />`

**Checkpoint**: US1 fully testable — `npm test tests/integration/story1-grid-interaction.test.tsx` passes

---

## Phase 4: User Story 2 — Target Completion and Win (Priority: P2)

**Goal**: Players claim targets by clicking matching Target List entries when the Numbers Grid contains that value; the game ends with a win message when all 10 targets are cleared.

**Independent Test**: Set up a Numbers Grid cell with a value that matches one of the 10 targets. Click that target in the Target List. Verify the Numbers Grid cell is removed, the target is removed from the list, and actionScore increments by 1. Continue until all targets are claimed and a win modal appears.

> **NOTE: Write T027 FIRST; ensure it FAILS before implementing T028–T031**

### Tests for User Story 2

- [ ] T027 [US2] Write integration test for US2 in `tests/integration/story2-target-completion.test.tsx` — (1) clicking a target with a matching numbers grid cell removes both and increments score; (2) clicking the last target triggers win state (modal visible); (3) clicking a target with no matching cell changes nothing; (4) remaining targets stay sorted after a claim

### Implementation for User Story 2

- [ ] T028 [US2] Implement CLAIM_TARGET action in `src/engine/reducer.ts`: find first numbersGrid cell with value === action.targetValue, set it to null, remove targetValue from targets array, push history, increment score; return unchanged store if no matching cell exists; after state update check targets.length === 0 (win condition is derived, not stored)
- [ ] T029 [US2] Create `src/components/TargetList.tsx`: `<ol>` of target values where each entry is a `<button>` with aria-label dispatching CLAIM_TARGET; targets are pre-sorted by |value| from state
- [ ] T030 [US2] Create `src/components/WinModal.tsx`: `<dialog role="dialog" aria-modal="true" aria-label="You won!">` rendered when `store.current.targets.length === 0`; traps focus on mount (Tab cycles within dialog); displays final actionScore; "New Game" button dispatches NEW_GAME
- [ ] T031 [US2] Wire TargetList and WinModal into `src/components/GameBoard.tsx`

**Checkpoint**: US2 fully testable — `npm test tests/integration/story2-target-completion.test.tsx` passes

---

## Phase 5: User Story 3 — Score Tracking and Undo (Priority: P3)

**Goal**: Players see an Action Score counter that accurately reflects all scored actions, and can click Undo to step back through the full session history one scored action at a time.

**Independent Test**: Perform a merge action — verify actionScore increments by 1. Click Undo — verify the Numbers Grid, Generators Grid, Target List, and actionScore all revert to the exact state before the merge. Verify the Undo button is disabled when no history exists.

> **NOTE: Write T032 FIRST; ensure it FAILS before implementing T033–T035**

### Tests for User Story 3

- [ ] T032 [US3] Write integration test for US3 in `tests/integration/story3-score-undo.test.tsx` — (1) actionScore increments for every scored action type; (2) MOVE_CELL does NOT change score; (3) Undo after one scored action restores grids, targets, and score; (4) repeated Undo steps back correctly through full history; (5) Undo button has disabled attribute when history is empty

### Implementation for User Story 3

- [ ] T033 [US3] Implement UNDO action in `src/engine/reducer.ts`: if history is non-empty, pop `history[history.length - 1]`, return `{ current: popped, history: history.slice(0, -1) }`; return store unchanged if history is empty
- [ ] T034 [P] [US3] Create `src/components/ScoreDisplay.tsx`: renders `<p aria-live="polite">Action Score: {store.current.actionScore}</p>` so screen readers announce score changes
- [ ] T035 [US3] Create `src/components/ActionButtons.tsx` with Undo button: `<button onClick={() => dispatch({ type: 'UNDO' })} disabled={store.history.length === 0} aria-disabled={store.history.length === 0}>Undo</button>`; wire ScoreDisplay and ActionButtons into `src/components/GameBoard.tsx`

**Checkpoint**: US3 fully testable — `npm test tests/integration/story3-score-undo.test.tsx` passes

---

## Phase 6: User Story 4 — Bulk Operations (Priority: P4)

**Goal**: Players can Merge All Numbers (only with + or *, and ≥ 2 numbers), Generate Generator, Clear Numbers Grid (with confirmation), and Clear Generators Grid (with confirmation) for efficient grid management.

**Independent Test**: Populate the Numbers Grid with values 3, 5, and 7, set operator to +, click "Merge All Numbers". Verify all three cells are cleared and a single cell with value 15 appears, actionScore increments by 1. Then set operator to -, verify "Merge All Numbers" is visually disabled and unclickable.

> **NOTE: Write T036 FIRST; ensure it FAILS before implementing T037–T041**

### Tests for User Story 4

- [ ] T036 [US4] Write integration test for US4 in `tests/integration/story4-bulk-operations.test.tsx` — (1) Merge All with + sums all values to single cell; (2) Merge All with * multiplies; (3) Merge All button is disabled for operator - and /; (4) Merge All disabled with < 2 numbers; (5) Clear Numbers Grid with confirm empties grid and increments score; (6) Clear Numbers Grid with cancel makes no change; (7) Clear Generators Grid with confirm empties generators grid and increments score; (8) Generate Generator adds a 1 to generators grid when slot available; (9) Generate Generator is no-op when generators grid is full

### Implementation for User Story 4

- [ ] T037 [US4] Implement MERGE_ALL_NUMBERS action in `src/engine/reducer.ts`: guard (operator must be '+' or '*', count of non-null numbersGrid values ≥ 2 — return unchanged store otherwise); filter non-null values, reduce with applyOperator, set numbersGrid to all-null then place result at index 0, clear selectedNumbersIdx, push history, increment score
- [ ] T038 [P] [US4] Implement CLEAR_NUMBERS_GRID action in `src/engine/reducer.ts`: set all numbersGrid cells to null, set selectedNumbersIdx to null, push history, increment actionScore
- [ ] T039 [P] [US4] Implement CLEAR_GENERATORS_GRID action in `src/engine/reducer.ts`: set all generatorsGrid cells to null, set selectedGeneratorsIdx to null, push history, increment actionScore
- [ ] T040 [US4] Add remaining buttons to `src/components/ActionButtons.tsx`: "Merge All Numbers" disabled per `canMergeAll(state)` predicate from contract (operator + or * AND ≥ 2 numbers); "Clear Numbers Grid" and "Clear Generators Grid" call `window.confirm()` before dispatching; "Generate Generator" disabled per `canGenerateGenerator(state)` (generatorsGrid has null slot)
- [ ] T041 [US4] Wire complete ActionButtons (all four bulk buttons + Undo) into `src/components/GameBoard.tsx`, replacing the Phase 5 placeholder

**Checkpoint**: US4 fully testable — `npm test tests/integration/story4-bulk-operations.test.tsx` passes

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility hardening, visual styling, build validation, and final QA across all user stories.

- [ ] T042 [P] Audit all `src/components/` for WCAG 2.1 AA compliance: add `role="grid"` and `role="gridcell"` to Grid.tsx, `aria-label` on each grid distinguishing "Numbers Grid" vs "Generators Grid", `aria-label` on OperatorSelector fieldset, `aria-label` on each target button in TargetList.tsx; verify color contrast ≥ 4.5:1 in game.css
- [ ] T043 [P] Implement full visual styling in `src/styles/game.css`: CSS Grid layout for 3×3 and 2×2 grids (`grid-template-columns`), operator highlight ring (`outline` or `box-shadow` on active operator button), selected cell highlight using `--color-selected`, disabled button opacity/cursor, win modal overlay (`position: fixed; inset: 0; backdrop-filter`), responsive layout for viewport < 600px
- [ ] T044 [P] Implement focus trap in `src/components/WinModal.tsx`: on mount, move focus to first focusable element inside dialog; intercept Tab/Shift+Tab to cycle within modal; Escape key dispatches NEW_GAME and closes modal
- [ ] T045 Run `npm test`, `npm run typecheck`, and `npm run lint` — fix all failing tests, type errors, and lint violations until all three commands exit 0; confirm coverage thresholds are met with `npm run test:coverage`
- [ ] T046 [P] Verify `src/main.tsx` imports `src/styles/game.css`; confirm `index.html` has correct `<title>Merge Math</title>` and viewport meta tag for mobile; add `manifest.json` or `favicon.ico` if missing
- [ ] T047 Run `npm run build` and verify `dist/` is produced with all assets referencing `/merge-math/` base path; confirm `.github/workflows/deploy.yml` is syntactically valid with `gh act` or by inspecting the YAML; push to main to trigger first GitHub Pages deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS all user stories**
- **User Story Phases (3–6)**: Each depends on Phase 2; stories proceed **in priority order** (US1 → US2 → US3 → US4) since later stories build on the same `GameBoard` and `reducer.ts`
- **Polish (Phase 7)**: Depends on all four user story phases being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Phase 2 — core reducer, Grid, Cell, GameBoard
- **User Story 2 (P2)**: Starts after US1 — extends reducer (CLAIM_TARGET), adds TargetList and WinModal to existing GameBoard
- **User Story 3 (P3)**: Starts after US2 — extends reducer (UNDO), adds ScoreDisplay and ActionButtons to existing GameBoard
- **User Story 4 (P4)**: Starts after US3 — extends reducer (MERGE_ALL_NUMBERS, CLEAR_*), completes ActionButtons

### Within Each User Story

1. Write integration test first (it will fail — that's correct)
2. Write unit tests for new reducer actions
3. Implement reducer actions until unit tests pass
4. Create/update components
5. Verify integration test now passes

### Parallel Opportunities

- Phase 1: T003, T004, T005 can run in parallel
- Phase 2: T008 (write operators tests) and T010 (write gameState tests) can be written in parallel; T014 and T015 are parallel
- US1: T018 and T019 (component unit tests) are parallel; T023, T024, T025 (component creation) are parallel
- US3: T034 (ScoreDisplay) can be created in parallel with T033 (UNDO reducer)
- US4: T038 and T039 (CLEAR actions) are parallel
- Phase 7: T042, T043, T044, T046 are all parallel

---

## Parallel Example: User Story 1

```bash
# Run all US1 tests in parallel (expect failures before implementation):
Task: "Write integration test in tests/integration/story1-grid-interaction.test.tsx" (T016)
Task: "Write reducer unit tests in tests/unit/engine/reducer.test.ts" (T017)
Task: "Write Cell unit tests in tests/unit/components/Cell.test.tsx" (T018)
Task: "Write Grid unit tests in tests/unit/components/Grid.test.tsx" (T019)

# Implement components in parallel once reducer actions are done:
Task: "Create Cell.tsx" (T023)
Task: "Create Grid.tsx" (T024)
Task: "Create OperatorSelector.tsx" (T025)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (TDD — tests fail → implement → tests pass)
4. **STOP and VALIDATE**: `npm test tests/integration/story1-grid-interaction.test.tsx`
5. Deploy to GitHub Pages and demo

### Incremental Delivery

1. Setup + Foundational → engine types, pure functions, and React hook ready
2. User Story 1 → Numbers Grid, Generators Grid, cell selection, merging — fully playable loop
3. User Story 2 → Target List, win state — now completable
4. User Story 3 → Score display, Undo — strategic depth added
5. User Story 4 → Bulk operations — efficiency layer added
6. Polish → Accessible, styled, deployed

### Single-Developer Sequence

With one developer, the recommended sequence follows task IDs T001 → T047 in order.
The first deployable milestone (MVP) is T001–T026 (end of User Story 1).

---

## Notes

- `[P]` tasks modify different files and have no unmet dependencies — safe to parallelize
- `[US1]`–`[US4]` labels map tasks to user stories for traceability
- All reducer actions share `src/engine/reducer.ts` — coordinate carefully when parallelizing across stories
- Constitution §II: write and run tests BEFORE implementing — a failing test proves the contract exists
- Commit after each phase checkpoint
- `npm run typecheck` must pass at every checkpoint — TypeScript errors are blockers
