# Tasks: Share Game URL

**Input**: Design documents from `specs/007-share-url/`

**Prerequisites**: [plan.md](plan.md) | [spec.md](spec.md) | [research.md](research.md) | [data-model.md](data-model.md) | [quickstart.md](quickstart.md)

**Tests**: Included — TDD is mandatory per project constitution (Principle II). All test tasks must be completed and **confirmed failing** before their implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the new utility module skeleton. Downstream tasks depend on this file existing.

- [ ] T001 Create `src/utils/shareUrl.ts` with empty exported function stubs: `encodeTargets`, `parseTargets`, `buildShareUrl`, `copyToClipboard` (stub bodies may throw `Error('not implemented')`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement the core `shareUrl` utility — the pure, framework-agnostic module both user stories depend on. No story work begins until this phase is complete.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T002 Write failing unit tests for all four `shareUrl` functions in `tests/unit/utils/shareUrl.test.ts`:
  - `encodeTargets([1,2,5,12,25,67,69,-420])` → `"#targets=1,2,5,12,25,67,69,-420"`
  - `parseTargets("#targets=1,2,5,12,25,67,69,-420")` → `[1,2,5,12,25,67,69,-420]`
  - `parseTargets("")` / `parseTargets("#targets=abc")` / `parseTargets("#targets=1,2")` → `null`
  - `buildShareUrl(targets)` → full URL ending with `#targets=…`
  - `copyToClipboard(text)` → `'success'` when `navigator.clipboard.writeText` resolves; `'fallback'` when clipboard is unavailable
  - Mock `navigator.clipboard.writeText` with `vi.fn()` and `window.location` as needed
- [ ] T003 Implement `encodeTargets(targets: number[]): string` in `src/utils/shareUrl.ts` — joins values with commas, prefixes with `"#targets="` — make T002 tests for this function pass
- [ ] T004 Implement `parseTargets(hash: string): number[] | null` in `src/utils/shareUrl.ts` — validates prefix, splits on comma, checks count is exactly 8, checks each part is a finite integer — make T002 tests for this function pass
- [ ] T005 Implement `buildShareUrl(targets: number[]): string` in `src/utils/shareUrl.ts` — constructs `window.location.origin + window.location.pathname + encodeTargets(targets)` — make T002 tests for this function pass
- [ ] T006 Implement `copyToClipboard(text: string): Promise<'success' | 'fallback'>` in `src/utils/shareUrl.ts` — calls `navigator.clipboard.writeText(text)`, catches all errors/unavailability and returns `'fallback'` — make T002 tests for this function pass

**Checkpoint**: Run `npm test tests/unit/utils/shareUrl.test.ts` — all tests must pass before proceeding.

---

## Phase 3: User Story 1 — Share Current Game Configuration (Priority: P1) 🎯 MVP

**Goal**: A share icon button appears in the score row; tapping it copies a URL with target numbers to the clipboard and shows brief confirmation. Clipboard unavailability shows a selectable textarea fallback.

**Independent Test**: Start a game, click the share icon, verify clipboard contains a URL ending in `#targets=…` with the 8 current target values.

### Tests for User Story 1

> **Write these tests FIRST and confirm they FAIL before implementing T009–T010.**

- [ ] T007 [P] [US1] Write failing share-button unit tests in `tests/unit/components/ScoreRow.test.tsx`:
  - Share button renders with accessible label (e.g., `aria-label="Share"`)
  - Clicking share button calls the `onShare` prop
  - When `copyState` prop is `'copied'`, the button area shows "Copied!" text
  - When `copyState` prop is `'fallback'`, a textarea containing the fallback URL is rendered
  - Share button and Undo button are in the same `data-testid="score-row"` container
- [ ] T008 [P] [US1] Write failing US1 integration test in `tests/integration/story6-share-url.test.tsx` (describe block "US1 – Share button"):
  - Start a game with known targets; click the share icon; verify `navigator.clipboard.writeText` was called with a URL containing those target values
  - Mock `navigator.clipboard.writeText` with `vi.fn()` that resolves
  - Verify "Copied!" confirmation text appears briefly

### Implementation for User Story 1

- [ ] T009 [US1] Add `onShare: () => Promise<void>` prop, share icon `<button>` (with `aria-label="Share"`), `copyState: 'idle' | 'copied' | 'fallback'` prop (or local state), conditional "Copied!" text and fallback `<textarea>` rendering to `src/components/ScoreRow.tsx` — make T007 tests pass
- [ ] T010 [US1] Add `handleShare` handler to `src/components/GameBoard.tsx` that builds the share URL from `current.targets`, calls `copyToClipboard`, manages a `copyState` local state with 2 s auto-reset, passes `onShare` and `copyState` to `<ScoreRow>` — make T008 integration test pass

**Checkpoint**: Run `npm test -- --reporter=verbose`; US1 unit and integration tests must pass. Manually verify: start game → click share → clipboard contains correct URL → "Copied!" appears for ≈2 s.

---

## Phase 4: User Story 2 — Load Shared Game from URL (Priority: P2)

**Goal**: Opening a URL with a valid `#targets=…` hash bypasses the setup screen and starts the game immediately with those target numbers.

**Independent Test**: Navigate to `/#targets=1,2,5,12,25,67,69,-420` — game starts directly with no setup screen, target list shows those 8 values.

### Tests for User Story 2

> **Write these tests FIRST and confirm they FAIL before implementing T012.**

- [ ] T011 [US2] Write failing US2 integration tests in `tests/integration/story6-share-url.test.tsx` (describe block "US2 – URL load"):
  - Set `window.location.hash = '#targets=1,2,5,12,25,67,69,-420'` before rendering `<App>`; assert setup screen is NOT shown and the numbers grid IS shown
  - Set an invalid hash (`#targets=abc`); assert setup screen IS shown
  - Set a hash with wrong count (`#targets=1,2,3`); assert setup screen IS shown
  - Reset `window.location.hash` in `afterEach` to avoid test pollution

### Implementation for User Story 2

- [ ] T012 [US2] Update `src/App.tsx` to call `parseTargets(window.location.hash)` inside `useState` initialisers: if result is non-null, initialise `phase` to `'playing'` and `confirmedTargets` to the parsed integers mapped to `Target[]`; otherwise keep existing `'setup'`/`null` defaults — make T011 tests pass

**Checkpoint**: Run `npm test -- --reporter=verbose`; US2 integration tests must pass. Manually open `http://localhost:5173/#targets=1,2,5,12,25,67,69,-420` and confirm game starts without setup screen.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Verify quality gates; no new functionality.

- [ ] T013 [P] Run `npm run typecheck` — fix any TypeScript errors in `src/utils/shareUrl.ts`, `src/components/ScoreRow.tsx`, `src/components/GameBoard.tsx`, `src/App.tsx`
- [ ] T014 [P] Run `npm test` — confirm all existing tests still pass alongside new tests (no regressions in `app-setup-to-game.test.tsx`, `ScoreRow.test.tsx`, etc.)
- [ ] T015 Run `npm run test:coverage` — confirm overall coverage remains ≥ 80%; add targeted tests in `tests/unit/utils/shareUrl.test.ts` if any branch is uncovered

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on T001; BLOCKS all user story work
- **US1 (Phase 3)**: Depends on Phase 2 completion
- **US2 (Phase 4)**: Depends on Phase 2 completion; can run in parallel with Phase 3 if desired (different files: `App.tsx` vs `ScoreRow.tsx`/`GameBoard.tsx`)
- **Polish (Phase 5)**: Depends on all user stories complete

### User Story Dependencies

- **US1**: Requires `shareUrl.ts` (`buildShareUrl`, `copyToClipboard`) — provided by Phase 2
- **US2**: Requires `shareUrl.ts` (`parseTargets`) — provided by Phase 2
- **US1 and US2 are independent of each other** — different source files, different test describe blocks

### Within Each User Story

- Test tasks (T007, T008 / T011) MUST be written and confirmed failing before implementation tasks (T009, T010 / T012)
- T009 (ScoreRow UI) before T010 (GameBoard wiring) — `GameBoard` imports `ScoreRow`
- T011 (test) before T012 (implementation)

### Parallel Opportunities

- T007 and T008 can run in parallel (different files)
- T003, T004, T005 are independent pure functions; can be written in one pass or sequentially
- T013 and T014 can run in parallel (read-only checks)
- US1 (Phase 3) and US2 (Phase 4) can run in parallel after Phase 2 completes (different source files)

---

## Parallel Example: US1 Tests

```bash
# Both can be written simultaneously (different files):
Task T007: "Failing share-button unit tests in tests/unit/components/ScoreRow.test.tsx"
Task T008: "Failing US1 integration test in tests/integration/story6-share-url.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T006)
3. Complete Phase 3: User Story 1 (T007–T010)
4. **STOP and VALIDATE**: Share button copies correct URL → "Copied!" appears → fallback textarea works
5. Ship US1 independently if needed

### Incremental Delivery

1. Phase 1 + 2 → `shareUrl.ts` utility ready
2. Phase 3 → Share button works end-to-end (MVP!)
3. Phase 4 → URL loading works; recipients land directly in the game
4. Phase 5 → Quality gates green

---

## Notes

- `[P]` tasks touch different files or are truly independent writes
- Each user story is independently completable: US1 delivers value even without US2, and vice-versa
- `copyToClipboard` fallback path is tested via `vi.fn()` rejecting — ensure both branches are covered
- `window.location.hash` in jsdom is writable; reset in `afterEach` to prevent test pollution
- The `copyState` 2 s timeout (`setTimeout`) should be cleared on unmount in `ScoreRow` to avoid React act() warnings in tests
