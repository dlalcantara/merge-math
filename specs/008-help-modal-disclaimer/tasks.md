---

description: "Task list for feature 008-help-modal-disclaimer"
---

# Tasks: Help Modal & AI Disclaimer

**Input**: Design documents from `/specs/008-help-modal-disclaimer/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/help-modal.md, quickstart.md

**Tests**: Test tasks ARE included — the project constitution (Principle II) mandates TDD with ≥ 80% coverage. Failing tests MUST exist before any production code in this feature.

**Organization**: Tasks are grouped by user story so each story can be implemented, tested, and shipped independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2). Setup, Foundational, and Polish phases have no story label.
- All paths are relative to the repository root.

## Path Conventions

- Source: `src/` at repo root
- Tests: `tests/unit/`, `tests/integration/` at repo root
- Styles: `src/styles/game.css`
- Project type: single-project React 19 + TypeScript SPA (per plan.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the directories and shared files both user stories will depend on.

- [X] T001 Create the new content directory at `src/content/` (no file yet; `mkdir -p src/content`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Land the minimal shared content module that both user stories import. Until this is in place, neither US1 nor US2 can render the help text.

**⚠️ CRITICAL**: No user story work may begin until this phase is complete.

- [X] T002 Create skeleton content module at `src/content/helpContent.ts` exporting four `string` constants — `helpIntroTitle`, `helpIntroBody`, `helpDisclaimerTitle`, `helpDisclaimerBody` — initialised to empty strings. Stories will fill the bodies. This guarantees the import surface is stable.

**Checkpoint**: Both user stories can now begin against a stable content interface.

---

## Phase 3: User Story 1 — First-Time Player Learns How to Play (Priority: P1) 🎯 MVP

**Goal**: Casual players see a `?` icon, click it to open a modal containing the "How to Play" introduction, and can dismiss the modal via close button, Escape, or backdrop click without affecting game state.

**Independent Test**: Load the game, locate the `?` button in the score row, click it, read the intro inside the opened dialog, dismiss it three different ways (close button / Escape / backdrop click). Game state before and after must be identical.

### Tests for User Story 1 (write FIRST, ensure they FAIL before implementation) ⚠️

- [X] T003 [P] [US1] Write failing unit tests for `HelpModal` in `tests/unit/components/HelpModal.test.tsx` covering: (a) renders with `role="dialog"` and `aria-modal="true"`, (b) is labelled by the intro heading via `aria-labelledby`, (c) close button has `aria-label="Close help"` and receives focus on open, (d) Escape key closes (invokes `onClose`), (e) clicking the backdrop closes, (f) Tab/Shift+Tab traps focus within the dialog, (g) intro heading and body render from `helpContent.ts` exports.
- [X] T004 [P] [US1] Extend `tests/unit/components/ScoreRow.test.tsx` with failing tests asserting: (a) a button with `aria-label="Help"` and visible text `?` is rendered inside `[data-testid="score-row"]`, (b) clicking that button opens an element with `role="dialog"`, (c) closing the dialog returns focus to the help button.
- [X] T005 [P] [US1] Create failing integration test at `tests/integration/story7-help-modal.test.tsx` covering US1 only: render `<App />` past the setup screen (use existing test helpers from `tests/integration/app-setup-to-game.test.tsx` as reference), find the help button, open the modal, assert the intro title and intro body text are visible, dismiss via the close button, then via Escape, then via backdrop click — each path returns focus to the help button. Include a sub-test that makes a game move before opening the modal and asserts the action score is unchanged after dismissal.

### Implementation for User Story 1

- [X] T006 [US1] Fill in `helpIntroTitle` and `helpIntroBody` in `src/content/helpContent.ts` with the casual-player introduction (80–150 words per SC-003). Body uses `\n\n` to separate paragraphs.
- [X] T007 [US1] Create `src/components/HelpModal.tsx` modelled on `src/components/WinModal.tsx`: a `<dialog ref aria-modal="true" aria-labelledby="help-modal-title" data-testid="help-modal" className="help-modal">` with `dialog.showModal()` in `useEffect`, focus moved to the close button on mount, Escape and backdrop-click both invoking the `onClose` prop, Tab/Shift+Tab focus trap. Render an `<h2 id="help-modal-title">{helpIntroTitle}</h2>` followed by `helpIntroBody` split into `<p>` elements. Render a single `<button aria-label="Close help" onClick={onClose}>Close</button>`. Props: `{ onClose: () => void }`.
- [X] T008 [US1] Modify `src/components/ScoreRow.tsx` to add a `useState<boolean>` named `isHelpOpen` (initial `false`), render a `<button aria-label="Help">?</button>` next to the existing Share/Undo buttons that sets `isHelpOpen` to `true`, and conditionally render `<HelpModal onClose={() => { setIsHelpOpen(false); helpButtonRef.current?.focus(); }} />`. Use a `useRef` on the help button so focus restoration works.
- [X] T009 [US1] Add `.help-modal` rules to `src/styles/game.css` mirroring the existing `.win-modal` and `.win-modal::backdrop` rules. Ensure `max-width` and inner `overflow: auto` keep the dialog usable at 320 px viewport width; keep the close button outside the scrollable region so it remains reachable on overflow.
- [X] T010 [US1] Run `npm test` and confirm all US1 tests from T003–T005 now pass. Run `npm run lint` and `npm run typecheck` and fix any issues.

**Checkpoint**: US1 is fully functional. The `?` button opens a modal showing the "How to Play" intro, dismissible three ways, with game state preserved. This is the MVP.

---

## Phase 4: User Story 2 — Player Sees AI & Attribution Disclaimer (Priority: P2)

**Goal**: Add the AI / attribution disclaimer section to the same modal so a player who opens help also sees, in one view, that Claude was used only for programming, the design is original, and no AI-generated art assets were used.

**Independent Test**: Open the help modal and confirm the disclaimer section is present in the same view as the intro (no extra navigation), with text that names Claude, calls out programming-only usage, asserts original design, and asserts no AI art.

### Tests for User Story 2 (write FIRST, ensure they FAIL before implementation) ⚠️

- [X] T011 [P] [US2] Extend `tests/unit/components/HelpModal.test.tsx` with failing tests asserting that the dialog renders the disclaimer heading (`helpDisclaimerTitle`) and disclaimer body (`helpDisclaimerBody`), and that the body text matches `/claude/i`, `/programming/i`, `/original/i`, and `/no .* (ai|art) assets?/i` (or equivalent case-insensitive checks for "no AI-generated art assets").
- [X] T012 [P] [US2] Add a US2 block to `tests/integration/story7-help-modal.test.tsx`: after opening the help modal (reusing the helper from T005), assert that the disclaimer heading and a snippet of disclaimer body text are both visible in the same `getByRole('dialog')` subtree — no further click required.

### Implementation for User Story 2

- [X] T013 [US2] Fill in `helpDisclaimerTitle` (≤ 30 chars, e.g. "AI & Attribution") and `helpDisclaimerBody` (one short paragraph, ≤ 60 words) in `src/content/helpContent.ts`. The body MUST mention: (a) Claude was used only for programming, (b) the design is original, (c) no AI-generated art assets were used.
- [X] T014 [US2] Update `src/components/HelpModal.tsx` to render the disclaimer section below the intro: an `<h2>{helpDisclaimerTitle}</h2>` followed by `<p>{helpDisclaimerBody}</p>`. Keep the close button as the last element in the dialog so it remains the last focusable item in the trap.
- [X] T015 [US2] Run `npm test` and confirm all US2 tests from T011–T012 now pass alongside the existing US1 tests. Run `npm run lint` and `npm run typecheck` and fix any issues.

**Checkpoint**: US1 + US2 both work. One modal, two clearly labelled sections, single view.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Verify constitutional gates, accessibility, mobile, and full build before declaring the feature done.

- [X] T016 Run `npm run test:coverage` and confirm overall coverage remains ≥ 80% (constitution Principle II). If any new file is under 80%, add targeted unit tests until it reaches the threshold.
- [X] T017 Run the manual verification checklist from `specs/008-help-modal-disclaimer/quickstart.md` end-to-end in `npm run dev`. Specifically confirm steps 11 (320 px viewport — no horizontal scroll, close button reachable on overflow) and 12 (screen-reader announces the dialog with its title). Note any failures and file fixes in the same branch.
- [X] T018 Run `npm run lint`, `npm run typecheck`, and `npm run build` from the repo root. All three must succeed with no errors.
- [X] T019 Audit `package.json` to confirm no new runtime or devDependencies were added by this feature (plan.md constraint).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 — no dependencies.
- **Foundational (Phase 2)**: T002 — depends on T001. **Blocks all user stories.**
- **User Story 1 (Phase 3)**: Depends on Phase 2. Tests (T003–T005) first; then T006 → T007 → T008 → T009 → T010.
- **User Story 2 (Phase 4)**: Depends on Phase 2. Independent of US1 in principle, but in practice US2 modifies files US1 created — sequence US1 first if a single developer is working the feature.
- **Polish (Phase 5)**: Depends on US1 and US2 being complete.

### Within Each User Story

- Tests MUST be written and failing before implementation begins (constitution Principle II).
- Content (`helpContent.ts`) before component changes that depend on it.
- Component changes before style additions (so styles can be visually verified against the mounted DOM).
- Lint/typecheck pass before declaring the story checkpoint reached.

### Parallel Opportunities

- T003, T004, T005 (US1 tests) all touch different files and can be authored in parallel.
- T011 and T012 (US2 tests) touch different files and can be authored in parallel.
- T006 (content) and the test files above are in different files — content can be drafted while tests are being written, but tests must be authored to fail first against the *empty-string* content from T002, then T006 fills the values to make body assertions pass; sequence accordingly within US1.
- Multiple developers: US1 and US2 can in principle be split across two people if T007 (`HelpModal.tsx`) is checkpointed before US2 begins editing it; otherwise serialize US1 → US2.

---

## Parallel Example: User Story 1 (tests)

```bash
# Authored in parallel (different files):
Task: "Write HelpModal unit tests in tests/unit/components/HelpModal.test.tsx"
Task: "Extend ScoreRow unit tests in tests/unit/components/ScoreRow.test.tsx"
Task: "Create story7 integration test in tests/integration/story7-help-modal.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (T001) and Phase 2 (T002).
2. Complete Phase 3 (T003–T010).
3. **STOP and VALIDATE**: Manually open/close the help modal in `npm run dev`, confirm game state preserved. This is shippable on its own.

### Incremental Delivery

1. Phase 1 + Phase 2 → stable foundation.
2. Phase 3 (US1) → ship MVP: help icon + intro.
3. Phase 4 (US2) → ship disclaimer addition.
4. Phase 5 → polish, verify constitutional gates, mark feature done.

### Single-Developer Strategy

Sequence: T001 → T002 → T003–T005 (in parallel) → T006 → T007 → T008 → T009 → T010 → T011–T012 (in parallel) → T013 → T014 → T015 → T016 → T017 → T018 → T019.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks.
- [Story] label maps task to user story (US1 / US2) for traceability; Setup, Foundational, and Polish tasks have no story label.
- Each user story must be independently functional at its checkpoint.
- Tests must be written and observed failing before the matching implementation task.
- Commit after each task or logical group (auto-commit hooks will handle this between Spec Kit commands).
- Avoid editing `helpContent.ts` and `HelpModal.tsx` in parallel branches — they are touched by both US1 and US2.
