# Feature Specification: Single Cell Selection

**Feature Branch**: `004-single-cell-selection`

**Created**: 2026-05-23

**Status**: Draft

**Input**: User description: "Change: Only one cell can be selected across both grids. Also, when user clicks on an empty cell in a grid where the cell is not selected, clear the selection. Is it mobile friendly to allow removal of selection of both grids by clicking on anywhere in the page except for the grid and buttons?"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Global Single Selection (Priority: P1)

A player selects a cell in one grid. When they then click a non-empty cell in the other grid, the original selection is cleared and the new cell becomes selected — only one cell is ever highlighted across the entire game board.

**Why this priority**: The global selection constraint is the root change that all other stories depend on. It prevents ambiguous game states (e.g., one cell selected in Numbers Grid and another in Generators Grid simultaneously) and simplifies the interaction model.

**Independent Test**: Select a Numbers Grid cell, then click a non-empty Generators Grid cell. Verify the Numbers Grid cell is no longer highlighted and the Generators Grid cell is now highlighted. Repeat in the opposite direction.

**Acceptance Scenarios**:

1. **Given** a Numbers Grid cell is selected (highlighted), **When** the player clicks a non-empty Generators Grid cell, **Then** the Numbers Grid selection is cleared and the Generators Grid cell becomes selected.
2. **Given** a Generators Grid cell is selected (highlighted), **When** the player clicks a non-empty Numbers Grid cell, **Then** the Generators Grid selection is cleared and the Numbers Grid cell becomes selected.
3. **Given** a cell is selected in either grid, **When** the player clicks the same cell again, **Then** the existing behavior for that grid applies (deselect for Numbers Grid; Generate Number if Generators Grid and conditions are met).
4. **Given** no cell is selected, **When** the player clicks a non-empty cell in either grid, **Then** that cell becomes selected and nothing else changes.

---

### User Story 2 - Empty Cell in Non-Selected Grid Clears Selection (Priority: P2)

A player has a cell selected in one grid. They click an empty cell in the other grid (the one with no selection). The selection clears entirely, leaving no cell selected anywhere.

**Why this priority**: Clicking empty space in the opposite grid signals the player's intent to "go somewhere else" but nothing actionable can happen there. Clearing the selection is the least surprising response and avoids leaving a stale highlight.

**Independent Test**: Select a Generators Grid cell. Click an empty cell in the Numbers Grid. Verify the Generators Grid cell is no longer highlighted and no other cell is highlighted.

**Acceptance Scenarios**:

1. **Given** a Generators Grid cell is selected and the Numbers Grid has at least one empty cell, **When** the player clicks an empty Numbers Grid cell, **Then** the Generators Grid selection clears and no cell is selected.
2. **Given** a Numbers Grid cell is selected and the Generators Grid has at least one empty cell, **When** the player clicks an empty Generators Grid cell, **Then** the Numbers Grid selection clears and no cell is selected.
3. **Given** a Numbers Grid cell is selected and the player clicks an empty cell in the same Numbers Grid, **Then** the existing Cell Movement behavior applies (selected value moves to the empty cell, selection clears, Action Score does not increment) — this story does not alter same-grid empty-cell behavior.
4. **Given** no cell is currently selected and the player clicks any empty cell in either grid, **Then** nothing changes.

---

### User Story 3 - Tap Outside to Deselect (Priority: P3)

A player taps or clicks anywhere on the screen that is not a grid cell or a button. Any current cell selection clears immediately.

**Why this priority**: Dismissing a selection by tapping outside is a standard mobile interaction pattern. Given the game targets mobile screens (720×1280), this provides an ergonomic escape hatch without requiring the player to tap a specific deselect target. It is mobile-friendly: the full game fits in one screen, so there is no scrolling surface to confuse with an intentional tap-outside gesture.

**Independent Test**: Select any grid cell. Tap the background area between grids or below the button row. Verify no cell is highlighted after the tap.

**Acceptance Scenarios**:

1. **Given** a cell is selected, **When** the player taps or clicks any area of the page that is not a grid cell, not an operator control, and not a button, **Then** the selection clears immediately.
2. **Given** no cell is selected, **When** the player taps outside the grids and buttons, **Then** nothing changes (no error, no flicker).
3. **Given** the game is displayed on a 720×1280 mobile screen, **When** the player taps outside the interactive areas, **Then** the tap-outside gesture fires consistently and does not conflict with scrolling (the game fits in one viewport; no scroll surface exists).
4. **Given** a player taps outside to deselect and then immediately taps a grid cell, **Then** the correct single-tap selection behavior applies to the newly tapped cell.

---

### Edge Cases

- What happens when the selected Generators Grid cell is clicked again (Generate Number) after globally switching the selection from Numbers Grid? → The selected generator behaves normally: if a Numbers Grid cell is empty, it generates a number. The prior Numbers Grid selection was already cleared when the Generators Grid cell was first selected.
- What happens when a player taps outside on a scrollable element (if ever introduced)? → Tap-outside must not fire on interactive elements; it fires only on non-interactive background regions. Scroll events must not trigger deselection.  Scrolling must never be introduced
- What happens when the active operator is toggled while a cell is selected? → Operator toggle does not clear the selection (existing behavior preserved, unaffected by this feature).
- What happens when Cell Movement takes place (selected cell moves to an empty cell in the same grid)? → Selection clears as before; this feature does not change same-grid empty-cell behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The game MUST maintain at most one selected cell at any time across both the Numbers Grid and the Generators Grid combined (replacing the prior per-grid limit of one selection each).
- **FR-002**: When a non-empty cell in Grid A is clicked while a cell in Grid B is selected, the Grid B selection MUST clear before Grid A's cell becomes selected; the result is exactly one selected cell.
- **FR-003**: When a player clicks an empty cell in a grid that does not currently contain the selected cell, the current selection MUST clear; no Cell Movement or other action occurs.
- **FR-004**: When a player taps or clicks anywhere on the page that is not a grid cell, not an operator toggle, and not a button control, the current selection MUST clear.
- **FR-005**: Tap-outside deselection MUST work consistently on touch devices at 720×1280 resolution. The game MUST NOT introduce scrolling.
- **FR-006**: All existing interactions that already clear the selection (Cell Merge, Merge All, Cell Movement, Clear Grid confirmations, Generate Number auto-clear on generation) MUST continue to work without change.
- **FR-007**: Operator toggling MUST NOT affect the current selection (no selection change on operator click).
- **FR-008**: The visual highlight indicating a selected cell MUST be unambiguous — at most one cell may appear highlighted at any time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At no point during any play session is more than one cell visually highlighted simultaneously across both grids.
- **SC-002**: Clicking an empty cell in the non-selected grid always results in zero selected cells within one interaction (100% of cases).
- **SC-003**: Tapping outside grids and buttons deselects the current selection in under 100 ms as perceived by the user on a mid-range mobile device.
- **SC-004**: All 91 existing passing tests continue to pass after this change; no regression in any other interaction.
- **SC-005**: A first-time player on mobile can deselect an accidental selection without trial and error — the tap-outside gesture works on first attempt in user observation.

## Assumptions

- The game already fits within a 720×1280 viewport without scrolling (per spec 002-fix-mobile-layout), so tap-outside deselection does not risk conflicting with scroll gestures.
- The "tap outside" region includes the page background, spacing between grids, spacing between button rows, and any padding areas — in short, any rendered surface that is not itself interactive.
- Buttons and operator controls are explicitly excluded from the tap-outside region (tapping them retains the selection and performs their action as normal).
- The Action Score is not affected by any deselection-only action (clearing a selection via tap-outside or empty-cell click does not count as a scored action and is not undoable).
- Undo does not restore a cleared selection — undo only reverts scored game state changes.
- This change modifies the selection model but does not alter the Generate Number mechanic: a generator cell must still be the currently selected cell when clicked again to trigger number generation.
