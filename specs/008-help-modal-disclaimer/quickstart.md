# Quickstart: Help Modal & AI Disclaimer

**Feature**: 008-help-modal-disclaimer
**Date**: 2026-05-30

## Prerequisites

- Node + npm already installed for the project (see root `package.json`).
- Branch `008-help-modal-disclaimer` is checked out.

## Run the test suite

From the repo root:

```bash
npm test                  # Vitest, single run
npm run test:watch        # Vitest, watch mode while iterating
npm run test:coverage     # Coverage report — must stay ≥ 80%
```

The feature's tests live in:
- `tests/unit/components/HelpModal.test.tsx`
- `tests/unit/components/ScoreRow.test.tsx` (modified)
- `tests/integration/story7-help-modal.test.tsx`

## Run the app locally

```bash
npm run dev               # Vite dev server, default http://localhost:5173
```

## Manual verification checklist

Open the dev server in a browser and run through this list:

1. **Discoverability (SC-001)**: On the main game screen, a `?` button is visible in the score row alongside the Share and Undo buttons.
2. **Open via mouse**: Click `?` — the help modal appears, centered, with the close button focused.
3. **Open via keyboard**: Reload the page. Tab to the `?` button (it should be reachable via Tab). Press `Enter` — the modal opens and focus moves inside.
4. **Content (US1)**: The modal shows a short heading ("How to Play" or equivalent) and a body explaining the goal and basic move in ≤ 150 words.
5. **Disclaimer (US2)**: Scroll/read the same modal — a disclaimer section is present stating Claude was used for programming only, design is original, and no AI-generated art assets were used.
6. **Close via button**: Click the close button — modal closes, focus returns to the `?` button.
7. **Close via Escape**: Reopen the modal, press `Esc` — modal closes, focus returns to the `?` button.
8. **Close via backdrop**: Reopen the modal, click on the dimmed area outside the dialog — modal closes.
9. **Game state preserved (FR-006)**: Play a few moves, note the score. Open and close the help modal. Score and grid state are unchanged.
10. **Inputs blocked while open (Edge Case)**: Open the help modal, try clicking on a number cell behind the backdrop — clicks must not affect the game grid.
11. **Mobile viewport (SC-005)**: In browser dev tools, set viewport to 320 × 568. The modal must be fully readable, with no horizontal scrolling. The close button must remain reachable even if the body scrolls.
12. **Screen reader (Principle III)**: With a screen reader (VoiceOver on macOS, NVDA on Windows), activate `?` — the dialog should be announced with its heading title.

## Build verification

```bash
npm run lint              # Must pass
npm run typecheck         # Must pass
npm run build             # Must succeed
```

## Done criteria for the feature

- All automated tests green; coverage ≥ 80%.
- Every item in the manual checklist above passes.
- No new runtime dependencies in `package.json`.
- `helpContent.ts` is the only place copy lives; editing it changes the modal text with no other code changes.
