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

### User Story 2 - Generate Action Preserves Generator Selection (Priority: P1)

A player selects a generator in the Generators Grid and clicks "Generate Generator" to add a new generator. The previously selected generator should remain selected so the player can immediately continue using it to populate the Numbers Grid without re-selecting.

**Why this priority**: Losing selection after Generate forces the player to re-select their generator every time they want to generate a new number, creating unnecessary friction in the core gameplay loop.

**Independent Test**: Select a generator in the Generators Grid. Click "Generate Generator". Verify the selected generator is still visually highlighted and remains selected, while the new generator appears in an empty slot.

**Acceptance Scenarios**:

1. **Given** a generator cell is selected in the Generators Grid, **When** the player clicks "Generate Generator", **Then** a new generator (value 1) appears in an empty Generators Grid slot, the previously selected generator remains selected, and the Action Score increments by 1.
2. **Given** a generator cell is selected, **When** "Generate Generator" is clicked and there is no empty slot in the Generators Grid, **Then** no new generator is added, and the selection is preserved unchanged.
3. **Given** no generator cell is selected, **When** the player clicks "Generate Generator", **Then** a new generator appears in an empty slot and no selection is created (existing behavior is unchanged).
4. **Given** a generator cell is selected and "Generate Generator" is clicked, **When** the action completes, **Then** the player can immediately click the still-selected generator again to copy its value into the Numbers Grid without any additional interaction.

---

### Edge Cases

- What happens when "Generate Generator" is clicked while the Generators Grid is full? No new generator is added; selection is preserved.
- What happens if a merge in the Generators Grid results in a value of 0 (e.g., 3 - 3)? The cell receives value 0, consistent with Numbers Grid merge behavior.
- What happens if the player performs a merge in the Generators Grid and then clicks Undo? The Generators Grid reverts to the state before the merge, and the Action Score decrements by 1.
- What happens if "Generate Generator" is undone while the original generator was selected? The added generator is removed; the original selected generator remains selected.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Generators Grid MUST support the same merge operation as the Numbers Grid — selecting one generator then clicking another applies the active operator and produces a single merged generator.
- **FR-002**: A merge in the Generators Grid MUST increment the Action Score by 1.
- **FR-003**: A merge in the Generators Grid MUST be undoable, reverting the Generators Grid cells and Action Score to their pre-merge state.
- **FR-004**: Moving a generator to an empty Generators Grid cell MUST NOT increment the Action Score (consistent with Numbers Grid movement behavior).
- **FR-005**: The "Generate Generator" action MUST preserve the currently selected generator in the Generators Grid — the selection must remain active after the action completes.
- **FR-006**: When no generator is selected and "Generate Generator" is clicked, existing behavior (no selection created) MUST remain unchanged.
- **FR-007**: All existing Generators Grid interactions (selection, copy-to-Numbers-Grid, move) MUST continue to work correctly after these fixes.

### Key Entities

- **Generator Cell**: An occupied cell in the Generators Grid with a numeric value. Can be selected, merged, moved, or used to populate Numbers Grid cells.
- **Generators Grid**: The 2×2 grid holding generator cells. Now supports merge operations between its cells.
- **Selection State**: The currently selected cell (if any) across either grid. Must persist through the "Generate Generator" action when a Generators Grid cell is selected.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player can successfully merge two generator cells in the Generators Grid in 100% of attempts when the operator is + or *.
- **SC-002**: After clicking "Generate Generator" with a generator selected, the selection is preserved in 100% of cases — the player never needs to re-select before using the generator.
- **SC-003**: All existing gameplay scenarios (Numbers Grid merge, generate-to-Numbers-Grid, undo, target claiming) continue to work without regression.
- **SC-004**: Undo correctly reverses Generators Grid merges, restoring both grid state and score.

## Assumptions

- The Generators Grid merge uses the same operator and scoring logic as the Numbers Grid merge — no separate merge rules are needed for generators.
- The active math operator applies to Generators Grid merges exactly as it does for Numbers Grid merges (including the existing restriction that - and / operators may or may not be allowed — the fix does not change operator behavior, only adds support for the merge interaction in that grid).
- "Deselect" in the bug description means the generator's visual selected state is lost after clicking "Generate Generator"; the fix is to retain that state.
- The fix applies only to the described bugs; no other behavior changes are introduced.
