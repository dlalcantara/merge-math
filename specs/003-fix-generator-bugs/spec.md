# Feature Specification: Fix Generator Bugs

**Feature Branch**: `003-fix-generator-bugs`

**Created**: 2026-05-23

**Status**: Draft

**Input**: User description: "Merge action should work in the Generators Grid. Generate action should not deselect the currently selected Generator"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Merge Generators in the Generators Grid (Priority: P1)

A player has two or more generators in the Generators Grid and wants to merge them together using the active math operator to create a more powerful generator — the same way numbers are merged in the Numbers Grid.

**Why this priority**: Merging generators is a core strategic action that allows players to build higher-value generators. Without it, the Generators Grid is limited to only placement operations, reducing strategic depth.

**Independent Test**: Place two generators in the Generators Grid (e.g., values 3 and 5). Set operator to +. Select one generator cell, then click the other. Verify the two cells are replaced by a single cell with value 8, and the Action Score increments by 1.

**Acceptance Scenarios**:

1. **Given** two generator cells (values 3 and 5) are in the Generators Grid and the active operator is +, **When** the player selects one generator and clicks the other, **Then** the selected generator is removed, the clicked generator's value becomes 8, the selection is cleared, and the Action Score increments by 1.
2. **Given** two generator cells are in the Generators Grid and the active operator is *, **When** the player merges them, **Then** the resulting cell holds the product of their values and the Action Score increments by 1.
3. **Given** only one generator cell exists in the Generators Grid, **When** the player selects it and clicks another generator cell (none exists), **Then** no merge occurs.
4. **Given** a generator cell is selected and the player clicks an empty Generators Grid cell, **When** the move occurs, **Then** the selected generator moves to the empty cell, the original cell becomes empty, and the Action Score does NOT increment (movement, not merge).
5. **Given** the active operator is - or /, **When** two generators are merged in the Generators Grid, **Then** the merge applies the active operator and the Action Score increments by 1.

---

### User Story 2 - Generate Number Preserves Generator Selection (Priority: P1)

A player selects a generator in the Generators Grid and clicks it again to copy its value into the Numbers Grid. After copying, the generator should remain selected so the player can immediately click it again to keep populating the Numbers Grid without re-selecting.

**Why this priority**: Losing selection after copying a generator's value forces the player to re-select the same generator every time they want to generate another number, creating unnecessary friction in the core gameplay loop.

**Independent Test**: Select a generator in the Generators Grid. Click it again to copy its value into an empty Numbers Grid cell. Verify the generator is still visually highlighted and remains selected. Click it a third time to copy the value again — it should work without any re-selection.

**Acceptance Scenarios**:

1. **Given** a generator cell (value 5) is selected and the Numbers Grid has an empty cell, **When** the player clicks the already-selected generator, **Then** the value 5 appears in the first empty Numbers Grid cell, the generator cell remains selected, and the Action Score increments by 1.
2. **Given** a generator cell is selected and the player copies its value multiple times, **When** each copy completes, **Then** the generator remains selected after each copy until the Numbers Grid is full or the player explicitly deselects.
3. **Given** a generator cell is selected and the Numbers Grid is full, **When** the player clicks the already-selected generator, **Then** nothing happens and the generator remains selected (no deselect occurs).
4. **Given** a generator cell is selected and its value has been copied to the Numbers Grid, **When** the action completes, **Then** the player can immediately click the still-selected generator again to copy its value into the next empty Numbers Grid cell without any additional interaction.

---

### Edge Cases

- What happens when the player copies a generator value and the Numbers Grid is full? Nothing changes; the generator remains selected.
- What happens if a merge in the Generators Grid results in a value of 0 (e.g., 3 - 3)? The cell receives value 0, consistent with Numbers Grid merge behavior.
- What happens if the player performs a merge in the Generators Grid and then clicks Undo? The Generators Grid reverts to the state before the merge, and the Action Score decrements by 1.
- What happens if a "copy generator value" action is undone? The Numbers Grid cell is removed, and the original selected generator remains selected (undo restores the prior state, which had the generator selected).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Generators Grid MUST support the same merge operation as the Numbers Grid — selecting one generator then clicking another applies the active operator and produces a single merged generator.
- **FR-002**: A merge in the Generators Grid MUST increment the Action Score by 1.
- **FR-003**: A merge in the Generators Grid MUST be undoable, reverting the Generators Grid cells and Action Score to their pre-merge state.
- **FR-004**: Moving a generator to an empty Generators Grid cell MUST NOT increment the Action Score (consistent with Numbers Grid movement behavior).
- **FR-005**: The "copy generator value to Numbers Grid" action (clicking the already-selected generator cell) MUST preserve the currently selected generator — the selection must remain active after the value is copied.
- **FR-006**: When no generator is selected and the player attempts to copy a value, existing behavior (no action taken) MUST remain unchanged.
- **FR-007**: All existing Generators Grid interactions (selection, copy-to-Numbers-Grid, move) MUST continue to work correctly after these fixes.

### Key Entities

- **Generator Cell**: An occupied cell in the Generators Grid with a numeric value. Can be selected, merged, moved, or used to populate Numbers Grid cells.
- **Generators Grid**: The 2×2 grid holding generator cells. Now supports merge operations between its cells.
- **Selection State**: The currently selected cell (if any) across either grid. Must persist through the "copy generator value to Numbers Grid" action — deselection should only occur via explicit deselect or a merge operation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player can successfully merge two generator cells in the Generators Grid in 100% of attempts when the operator is + or *.
- **SC-002**: After a generator's value is copied to the Numbers Grid, the generator remains selected in 100% of cases — the player never needs to re-select the same generator to copy its value again.
- **SC-003**: All existing gameplay scenarios (Numbers Grid merge, generate-to-Numbers-Grid, undo, target claiming) continue to work without regression.
- **SC-004**: Undo correctly reverses Generators Grid merges, restoring both grid state and score.

## Assumptions

- The Generators Grid merge uses the same operator and scoring logic as the Numbers Grid merge — no separate merge rules are needed for generators.
- The active math operator applies to Generators Grid merges exactly as it does for Numbers Grid merges (including the existing restriction that - and / operators may or may not be allowed — the fix does not change operator behavior, only adds support for the merge interaction in that grid).
- "Generate action" in the bug description refers to clicking the already-selected generator to copy its value to the Numbers Grid (not the "Generate Generator" button which adds a new generator). The "Generate Generator" button already preserves selection correctly.
- The fix applies only to the described bugs; no other behavior changes are introduced.
