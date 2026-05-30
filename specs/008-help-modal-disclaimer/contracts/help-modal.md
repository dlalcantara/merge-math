# UI Interaction Contract: HelpModal

**Feature**: 008-help-modal-disclaimer
**Date**: 2026-05-30

This feature exposes no network API, CLI, or library API. The only contract is the UI surface that the feature presents to players and to integration tests. This document captures that contract so it can be tested against deterministically.

## Trigger: Help Button

**Selector (test handle)**: `aria-label="Help"` (button)
**Visible glyph**: `?`
**Location**: Inside `[data-testid="score-row"]`, adjacent to the existing Share (`aria-label="Share"`) and Undo buttons.

**Behavior**:
- Activating it via mouse click, touch tap, `Enter`, or `Space` opens the help modal.
- The button retains DOM focus until the modal opens, at which point focus moves into the modal. When the modal closes, focus returns to this button.

## Modal: HelpModal

**Root element**: `<dialog>` with attributes:
- `role="dialog"` (default for `<dialog>`, but set explicitly for clarity)
- `aria-modal="true"`
- `aria-labelledby` referencing the id of the intro heading (e.g., `help-modal-title`)
- `className="help-modal"`

**Test handles**:
- `data-testid="help-modal"` on the root `<dialog>` element
- Close button: `aria-label="Close help"`

### Visible content (required, in order)

1. Intro heading — text equal to `helpIntroTitle` from `helpContent.ts`. Element carries `id="help-modal-title"` so `aria-labelledby` resolves.
2. Intro body — text containing `helpIntroBody`, with `\n\n`-separated paragraphs rendered as separate `<p>` elements.
3. Disclaimer heading — text equal to `helpDisclaimerTitle`.
4. Disclaimer body — text equal to `helpDisclaimerBody`. Must reference Claude (programming only), original design, and no AI art assets.
5. Close button — text `Close` (or visually equivalent), with `aria-label="Close help"`.

### Open contract

| Precondition | Trigger | Postcondition |
|--------------|---------|---------------|
| `isHelpOpen === false`; help button has focus | User clicks/taps/activates help button | `isHelpOpen === true`; dialog is open via `showModal()`; first focusable element inside dialog (close button) has focus; underlying page is inert |

### Close contract

The modal MUST close (`isHelpOpen → false`, focus returned to the help button) on any of:

| Event | Source |
|-------|--------|
| Click / tap on the close button | Pointer |
| `Enter` or `Space` on the focused close button | Keyboard |
| `Escape` key while focus is anywhere inside the dialog | Keyboard |
| Click / tap on the dialog backdrop (outside the dialog content) | Pointer |

On every close path, game state MUST be unchanged (no dispatched game actions).

### Focus management contract

- On open: focus moves to the close button (or the first focusable element, which by spec ordering is the close button).
- Tab cycles only within the dialog (focus trap). Shift+Tab from the first focusable wraps to the last; Tab from the last wraps to the first.
- On close: focus returns to the help button (the original trigger).

### Game interaction contract while modal is open

While `isHelpOpen === true`:
- The underlying page is inert (handled natively by `dialog.showModal()`); pointer events do not reach game grids, buttons, or the `handleBoardClick` deselect handler.
- No game reducer action MAY be dispatched as a side effect of opening, interacting with, or closing the help modal.

## Test surface summary

Integration tests target the following DOM queries (Testing Library):
- `screen.getByRole('button', { name: /help/i })`
- `screen.getByRole('dialog', { name: helpIntroTitle })` (after open)
- `screen.getByRole('button', { name: /close help/i })`
- `screen.getByText(/claude/i)` and `screen.getByText(/no ai/i)` to assert disclaimer content
