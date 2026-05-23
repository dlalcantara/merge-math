# Feature Specification: Merge Math Game MVP

**Feature Branch**: `001-merge-math-game`

**Created**: 2026-05-23

**Status**: Draft

**Input**: User description: mvp-spec.md

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Core Grid Interaction (Priority: P1)

A player starts the game and sees two grids (Numbers 3×3, Generators 2×2) and a list of 10 sorted target numbers. They generate a generator, then use it to populate the Numbers Grid with values, and select and merge cells using math operations to build new numbers.

**Why this priority**: The fundamental interaction loop — generating, selecting, and merging numbers — is the entire game. Without it, nothing else is playable.

**Independent Test**: Start the game — a generator with value 1 is already present in the Generators Grid. Select it (first click), then click it again to copy its value into an empty Numbers Grid cell. Repeat to place a second 1. Select a Numbers Grid cell, then click another non-empty cell to merge them using the active operator. Verify the values update correctly and the selection clears.

**Acceptance Scenarios**:

1. **Given** the Generators Grid has an empty cell, **When** the player clicks "Generate Generator", **Then** a cell with value 1 appears in an empty slot of the Generators Grid and the Action Score increments by 1.
2. **Given** a generator cell is selected in the Generators Grid and the Numbers Grid has an empty cell, **When** the player clicks the already-selected generator cell again, **Then** the generator's value appears in an empty Numbers Grid cell, the generator cell remains selected, and the Action Score increments by 1.
3. **Given** a Numbers Grid cell with value 3 is selected and operator + is active, **When** the player clicks another Numbers Grid cell with value 5, **Then** the selected cell is removed, the clicked cell's value becomes 8, the selection is cleared, and the Action Score increments by 1.
4. **Given** a Numbers Grid cell is selected and the player clicks an empty Numbers Grid cell, **When** the move occurs, **Then** the selected cell's value moves to the empty cell, the original cell becomes empty, the selection is cleared, and the Action Score does NOT increment.

---

### User Story 2 - Target Completion and Win (Priority: P2)

A player builds numbers in the Numbers Grid that match entries on the Target List and claims them by clicking the matching target, working toward clearing all 10 targets to win the game.

**Why this priority**: Claiming targets is the goal of the game. Without it there is no win condition and no progress feedback.

**Independent Test**: With a Numbers Grid cell containing a value that matches a target, click that target in the Target List. Verify the Numbers Grid cell and the target are both removed and the Action Score increments by 1. Repeat until all targets are cleared and verify a win message appears.

**Acceptance Scenarios**:

1. **Given** a Numbers Grid cell contains value 42 and 42 appears in the Target List, **When** the player clicks 42 in the Target List, **Then** the Numbers Grid cell is removed, 42 is removed from the Target List, and the Action Score increments by 1.
2. **Given** the last target is claimed and the Target List becomes empty, **When** the removal completes, **Then** the game ends and a win state is displayed to the player.
3. **Given** no Numbers Grid cell contains the value of the clicked target, **When** the player clicks a target number, **Then** nothing changes.
4. **Given** the Target List has multiple entries, **When** the player claims one target, **Then** only that target is removed and the rest remain in sorted order.

---

### User Story 3 - Score Tracking and Undo (Priority: P3)

A player tracks their efficiency via the Action Score and can undo any scored action to recover from mistakes.

**Why this priority**: The score gives players a way to measure and improve; undo prevents frustrating dead-ends. Both are critical to game feel.

**Independent Test**: Perform a merge action, verify the score increments by 1. Click Undo, verify the grids, Target List, and score all revert to the state immediately before the merge.

**Acceptance Scenarios**:

1. **Given** the player performs any scored action (Merging, Generation, Target Reached, Merge All, Generate Generator, Clear Numbers/Generators), **When** the action completes, **Then** the Action Score increments by 1.
2. **Given** the player performs a Cell Movement, **When** the move completes, **Then** the Action Score does NOT change.
3. **Given** at least one scored action has been performed, **When** the player clicks Undo, **Then** the Numbers Grid, Generators Grid, Target List, and Action Score all revert to their state immediately before that action.
4. **Given** multiple scored actions have been performed, **When** the player clicks Undo repeatedly, **Then** each click reverts one additional step back through the full history.
5. **Given** no actions have been performed (or all have been undone), **When** the player clicks Undo, **Then** nothing changes (button is inactive or produces no effect).

---

### User Story 4 - Bulk Operations (Priority: P4)

A player uses bulk action buttons — Merge All Numbers, Generate Generator, Clear Numbers Grid, and Clear Generators Grid — to manage grid state efficiently without merging cells one at a time.

**Why this priority**: Bulk operations add strategic depth and efficiency, but the core game is playable without them.

**Independent Test**: Populate the Numbers Grid with multiple values, set operator to +, click "Merge All Numbers". Verify all values are replaced by their sum in a single cell and the Action Score increments by 1.

**Acceptance Scenarios**:

1. **Given** the Numbers Grid contains values [3, 5, 7] and operator is +, **When** "Merge All Numbers" is clicked, **Then** all cells are cleared, a single cell with value 15 appears, the selection is cleared, and the Action Score increments by 1.
2. **Given** the Numbers Grid contains values and operator is *, **When** "Merge All Numbers" is clicked, **Then** all cells are cleared and a single cell with the product of all values appears.
3. **Given** the active operator is - or /, **When** the player views the screen, **Then** the "Merge All Numbers" button is visually disabled and clicking it has no effect.
4. **Given** the Numbers Grid has cells and the player clicks "Clear Numbers Grid", **When** the confirmation dialog appears and the player confirms, **Then** all Numbers Grid cells are emptied, the selection is cleared, and the Action Score increments by 1.
5. **Given** the player clicks "Clear Numbers Grid" or "Clear Generators Grid" and the confirmation dialog appears, **When** the player cancels, **Then** no change occurs and the Action Score does not change.
6. **Given** the Generators Grid has at least one empty cell, **When** the player clicks "Generate Generator", **Then** a new cell with value 1 appears in an empty Generators Grid slot and the Action Score increments by 1.

---

### Edge Cases

- What happens when the Generators Grid is full and the player clicks "Generate Generator"? → Nothing happens; no empty slot is available.  Action counter should not increase.  No change to action history
- What happens when the Numbers Grid is full and the player clicks an already-selected generator? → Nothing happens; generation requires at least one empty Numbers Grid cell.  Action counter should not increase.  No change to action history
- What happens when "Merge All Numbers" is used with only one number in the Numbers Grid? → Disable Merge All Numbers when there is only one number in the Numbers Grid
- What happens when dividing by zero during a Cell Merge? → The result is treated as 0.
- What happens when Undo is pressed with no action history? → Disable Undo when no action history.
- What happens when the player attempts to click the same cell twice to select and then deselect? → The second click on an already-selected cell deselects it (treated as clicking the same cell while it is selected — no merge/move occurs; for the Generators Grid this triggers generation if conditions are met).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a 3×3 Numbers Grid and a 2×2 Generators Grid; cells in each grid are either empty or contain a single integer value.
- **FR-002**: System MUST generate and display a sorted list of 10 target integers between -1023 and 1024 (inclusive) at game start, ordered from smallest to largest absolute value.
- **FR-003**: System MUST display four operator controls (+, *, -, /) and visually highlight the currently active operator; only one operator may be active at a time; + is active by default.
- **FR-004**: System MUST allow the player to toggle the active operator without this being counted as a scored action and without clearing any cell selection.
- **FR-005**: System MUST track at most one selected cell per grid; empty cells cannot be selected.
- **FR-006**: System MUST support Cell Selection: clicking a non-empty cell in a grid when no cell is currently selected in that grid selects it with a visual highlight; this does NOT increment the Action score.
- **FR-007**: System MUST support Cell Movement: when a cell is selected in a grid and the player clicks a different empty cell in the same grid, the selected cell's value transfers to the empty cell, the original cell becomes empty, and the selection clears; this does NOT increment the Action Score.
- **FR-008**: System MUST support Cell Merging: when a cell is selected in a grid and the player clicks a different non-empty cell in the same grid, the active operator is applied (selected value OP clicked value), the result replaces the clicked cell's value, the selected cell is cleared, the selection clears, and the Action Score increments by 1.
- **FR-009**: System MUST support Generate Number: when a generator cell is already selected (highlighted) in the Generators Grid and the player clicks that same selected cell again, and at least one Numbers Grid cell is empty, the generator's value is copied into an empty Numbers Grid cell; the generator cell remains selected; the Action Score increments by 1.
- **FR-010**: System MUST support Target Reached: when the player clicks a target entry in the Target List and a Numbers Grid cell contains that exact value, both the Numbers Grid cell and the target entry are removed and the Action Score increments by 1; if no matching Numbers Grid cell exists, nothing happens.
- **FR-011**: System MUST support Merge All Numbers: clicking "Merge All Numbers" applies the active operator (+ or *) cumulatively across all values in the Numbers Grid, replaces all cells with a single cell containing the result, clears the selection, and increments the Action Score by 1; the button is disabled and unclickable when the active operator is - or /, or when the Numbers Grid contains fewer than 2 numbers.
- **FR-012**: System MUST support Generate Generator: clicking "Generate Generator" places a new cell with value 1 in an empty Generators Grid cell (if one exists) and increments the Action Score by 1; if the Generators Grid is full, nothing happens.
- **FR-013**: System MUST support Clear Numbers Grid: clicking the button prompts the player for confirmation; if confirmed, all Numbers Grid cells are emptied, the selection is cleared, and the Action Score increments by 1; if cancelled, nothing changes.
- **FR-014**: System MUST support Clear Generators Grid: clicking the button prompts the player for confirmation; if confirmed, all Generators Grid cells are emptied, the selection is cleared, and the Action Score increments by 1; if cancelled, nothing changes.
- **FR-015**: System MUST support Undo: clicking Undo reverts the Numbers Grid, Generators Grid, Target List, and Action Score to the state immediately before the most recent scored action; all scored actions in the session are undoable; the Undo button is disabled when no action history exists.
- **FR-016**: System MUST display an Action Score counter, initialized to 0, that increments by 1 for each scored action and decrements correctly on Undo.
- **FR-017**: System MUST detect when the Target List becomes empty and display a win state to the player.
- **FR-018**: The division operator (/) MUST use truncating integer division, discarding any remainder.
- **FR-019**: At game start, the Generators Grid MUST contain exactly one pre-placed cell with value 1; all Numbers Grid cells and all remaining Generators Grid cells begin empty.

### Key Entities

- **Cell**: A slot in a grid; either empty or containing a single integer value (may be negative as a result of subtraction or division operations).
- **Numbers Grid**: A 3×3 arrangement of cells used to hold and combine numbers toward target values.
- **Generators Grid**: A 2×2 arrangement of cells holding generator values; newly generated generators always start at value 1; generator cells follow the same selection and merging rules as Numbers Grid cells.
- **Target**: An integer between -1023 and 1024 representing a value the player must produce in the Numbers Grid and then claim; the 10 targets are sorted by ascending absolute value.
- **Operator**: One of four arithmetic operations (+, -, *, /) that controls how two cell values are combined during a merge; / is truncating integer division.
- **Action Score**: A non-negative integer tracking the number of scored player actions; lower scores reflect greater efficiency.
- **Undo History**: An ordered sequence of game states captured after each scored action, enabling step-by-step reversal.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player can complete a full game session from start to win (all 10 targets claimed) without encountering a broken or unresponsive state.
- **SC-002**: All 19 functional requirements produce correct, consistent outcomes across repeated play with no incorrect values, missing updates, or phantom state.
- **SC-003**: The game responds to every player interaction within 1 second under normal conditions.
- **SC-004**: A player can undo every scored action taken in a session and correctly restore the prior state, including the Action Score.
- **SC-005**: The "Merge All Numbers" button visually indicates its disabled state when the active operator is - or / and cannot be activated in that state.
- **SC-006**: The Action Score accurately reflects the count of scored actions at all times, including after Undo operations.

## Assumptions

- The game is single-player with no state persistence between browser sessions; each page load starts a fresh game.
- The Numbers Grid is fully empty at game start; the Generators Grid begins with exactly one pre-placed generator cell containing value 1.
- Generator cells in the Generators Grid follow the same Cell Selection and Cell Merging rules as Numbers Grid cells (they can be merged with each other using the active operator).
- Undo history is maintained for the entire session with no depth limit.
- When dividing by zero, the result is 0 (this edge case is assumed to be rare; no special error UI is required for MVP).
- "Clear Numbers Grid" and "Clear Generators Grid" are each counted as one scored action when the player confirms.
- The game is intended for modern desktop browsers; basic mobile support is necessary for the MVP.
- No persistent leaderboard, account system, or save/load functionality is included in the MVP.
- When "Generate Number" places a value in the Numbers Grid, it uses the first available empty cell (no player choice of placement position).
- The Target List is fixed at game start and cannot be regenerated or reshuffled mid-session.
