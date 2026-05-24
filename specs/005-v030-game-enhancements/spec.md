# Feature Specification: v0.3.0 Game Enhancements

**Feature Branch**: `005-v030-game-enhancements`

**Created**: 2026-05-24

**Status**: Draft

**Input**: User description: "v030spec.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Convert Number to Generator (Priority: P1)

A player has a number in the Numbers Grid that they want to use as the starting value for a Generator. They click "Convert to Generator" while the number is selected, the number moves to the Generator Grid, and the action count increments.

**Why this priority**: Core new mechanic that bridges the Numbers and Generator systems; affects undo history and is foundational to the other generator changes.

**Independent Test**: Can be fully tested by selecting a number, clicking "Convert to Generator," and verifying the number disappears from Numbers Grid and appears in Generator Grid with the action count incremented.

**Acceptance Scenarios**:

1. **Given** a number is selected in the Numbers Grid, **When** the player clicks "Convert to Generator," **Then** a new Generator is created in the Generator Grid with that number's value, the number is removed from the Numbers Grid, and the action count increases by one.
2. **Given** no number is selected, **When** the player clicks "Convert to Generator," **Then** nothing happens (button is disabled or click is ignored).
3. **Given** the player converts a number and then undoes, **When** undo is triggered, **Then** the number returns to the Numbers Grid and the Generator is removed from the Generator Grid, and the action count returns to its prior value.

---

### User Story 2 - Simplified Generator Selection (Priority: P2)

A player who already has a Generator selected clicks another Generator. Instead of merging, the selection simply moves to the newly clicked Generator with no action cost.

**Why this priority**: Changes a key interaction model in the Generator Grid; removing merge prevents accidental irreversible actions.

**Independent Test**: Can be tested by selecting one Generator, clicking a second Generator, and confirming the selection switches without any merge or action count change.

**Acceptance Scenarios**:

1. **Given** Generator A is selected, **When** the player clicks Generator B, **Then** Generator B becomes selected, Generator A is deselected, and the action count does not change.
2. **Given** a Generator is selected, **When** the player clicks the Move or Generate action, **Then** those actions still function as before.
3. **Given** no Generator is selected, **When** the player clicks a Generator, **Then** that Generator becomes selected.

---

### User Story 3 - Reset Generators Grid (Priority: P2)

A player wants to reset the Generator Grid. They click the renamed "Reset Generators Grid" button. All generators are cleared and a new Generator with value 1 is created automatically.

**Why this priority**: Replaces the "Clear Generators" function with a consistent starting state, ensuring the Generator Grid is never left empty.

**Independent Test**: Can be tested by clicking "Reset Generators Grid" with multiple generators present and verifying only one Generator (value = 1) remains.

**Acceptance Scenarios**:

1. **Given** the Generator Grid has multiple generators, **When** the player clicks "Reset Generators Grid," **Then** all generators are removed and a single Generator with value 1 is added.
2. **Given** the Generator Grid is already empty, **When** the player clicks "Reset Generators Grid," **Then** a single Generator with value 1 is created.

---

### User Story 4 - Three-State Target Display (Priority: P1)

Targets are permanently displayed and cycle through three visual states: "Not yet accomplished," "Available in Numbers Grid," and "Accomplished." Players can click an "Available" target to mark it Accomplished without consuming the number or spending actions.

**Why this priority**: Fundamentally changes how the game's win condition is tracked and how players interact with targets; central to progression feedback.

**Independent Test**: Can be tested by having a target number appear in the Numbers Grid, observing the target display update to "Available," clicking it, and confirming it becomes "Accomplished" with no change to action count or Numbers Grid contents.

**Acceptance Scenarios**:

1. **Given** a target number is not present in the Numbers Grid, **When** the game state is observed, **Then** the target appears in "Not yet accomplished" state.
2. **Given** a target number exists in the Numbers Grid, **When** the game state is observed, **Then** the target appears in "Available in Numbers Grid" state with a visually distinct, clickable appearance.
3. **Given** a target in "Available" state, **When** the player clicks it, **Then** the target moves to "Accomplished" state, the action count does not change, and the number remains in the Numbers Grid.
4. **Given** all targets are "Accomplished," **When** the game state is observed, **Then** the game ends.
5. **Given** a target is already "Accomplished," **When** the corresponding number appears in the Numbers Grid, **Then** the target remains "Accomplished" (no regression).

---

### User Story 5 - Curated Starting Target List (Priority: P3)

New players start with a fixed tutorial target list of 8 numbers: 1, 2, 5, 12, 25, 67, 69, −420. On the first screen, a Randomize button lets players opt into a randomly generated list instead.

**Why this priority**: Improves the new-player experience without affecting core mechanics; the randomize option preserves the original play style.

**Independent Test**: Can be tested by launching the game fresh and confirming the eight tutorial targets appear, then clicking Randomize and verifying a new set of random targets (−1023 to 1024 inclusive) replaces them.

**Acceptance Scenarios**:

1. **Given** the game starts fresh, **When** the first screen loads, **Then** the target list displays exactly: 1, 2, 5, 12, 25, 67, 69, −420.
2. **Given** the first screen is displayed, **When** the player clicks "Randomize," **Then** the target list is replaced with 8 random numbers in the range −1023 to 1024 inclusive.
3. **Given** the player has randomized targets, **When** they start the game, **Then** the randomized targets are used throughout the session.

---

### Edge Cases

- What happens when the player clicks "Convert to Generator" while the Numbers Grid is empty?
Disable the Convert to Generator button when nothing is selected in the Numbers Grid
- What happens if a target value appears multiple times in the Numbers Grid — does the first match satisfy the target? Yes
- What happens if Randomize is clicked multiple times before starting — does each click generate a fresh list? Yes
- What happens when a Generator with value 1 already exists and the player clicks "Reset Generators Grid"? Its ok
- What if undo is triggered after a target is marked Accomplished — does the target revert? Yes

## Requirements *(mandatory)*

### Functional Requirements

**Convert to Generator**

- **FR-001**: The Numbers Grid toolbar MUST include a "Convert to Generator" button positioned between the "Merge All Numbers" and "Clear Numbers" buttons.
- **FR-002**: When "Convert to Generator" is clicked and a number is selected, the system MUST create a new Generator in the Generator Grid with the selected number's value.
- **FR-003**: When "Convert to Generator" is clicked and a number is selected, the system MUST remove that number from the Numbers Grid.
- **FR-004**: When "Convert to Generator" is clicked and a number is selected, the action count MUST increase by one.
- **FR-005**: The "Convert to Generator" action MUST be undoable (action count decrements, generator is removed, number is restored).
- **FR-006**: When no number is selected, the "Convert to Generator" button MUST have no effect.

**Generator Grid Interaction**

- **FR-007**: The Generator Grid MUST NOT support merge between two generators.
- **FR-008**: When a generator is already selected and the player clicks another generator, the system MUST change the selection to the clicked generator without triggering any other action or changing the action count.
- **FR-009**: Move and Generate actions in the Generator Grid MUST remain functional as before.
- **FR-010**: The "Generate Generator" button MUST be removed from the UI.
- **FR-011**: The "Clear Generators" button MUST be renamed to "Reset Generators Grid."
- **FR-012**: When "Reset Generators Grid" is clicked, all existing generators MUST be removed and a single Generator with value 1 MUST be created.

**Targets Display**

- **FR-013**: Targets MUST NOT be removed from the target list when a matching number is achieved.
- **FR-014**: Each target MUST display one of three states: "Not yet accomplished," "Available in Numbers Grid," or "Accomplished."
- **FR-015**: A target MUST display as "Available in Numbers Grid" when a number equal to the target value exists in the Numbers Grid.
- **FR-016**: A target in "Available" state MUST be visually distinct and clickable in a way that invites player interaction.
- **FR-017**: When a player clicks an "Available" target, the target state MUST change to "Accomplished."
- **FR-018**: Clicking an "Available" target MUST NOT change the action count.
- **FR-019**: Clicking an "Available" target MUST NOT remove the matching number from the Numbers Grid.
- **FR-020**: The game MUST end when all targets reach the "Accomplished" state.

**Starting Target List**

- **FR-021**: The default starting target list MUST contain exactly 8 numbers: 1, 2, 5, 12, 25, 67, 69, −420.
- **FR-022**: The first screen MUST include a "Randomize" button for the target list.
- **FR-023**: When "Randomize" is clicked, the target list MUST be replaced with 8 randomly generated numbers, each in the range −1023 to 1024 inclusive.

### Key Entities

- **Number**: A value in the Numbers Grid; can be selected, merged, cleared, or converted to a Generator.
- **Generator**: A value in the Generator Grid; can be moved, used to generate, or reset. Now created from numbers.
- **Target**: A goal value; persists throughout the game; transitions through Not Accomplished → Available → Accomplished states.
- **Action Count**: A running total of player actions; incremented by Convert to Generator (and other existing actions); unchanged by target clicking.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The "Convert to Generator" button appears in its correct toolbar position in all game states.
- **SC-002**: Converting a number to a generator and undoing the action restores the exact prior game state in 100% of cases.
- **SC-003**: Targets correctly transition between all three states in response to Numbers Grid changes without manual player intervention beyond clicking.
- **SC-004**: The game-end condition triggers immediately and exclusively when all targets reach "Accomplished."
- **SC-005**: Fresh game sessions display the 8 tutorial targets by default.
- **SC-006**: The Randomize button produces a new valid 8-number list within the specified range on every click.
- **SC-007**: "Reset Generators Grid" leaves exactly one Generator (value 1) in the Generator Grid in all cases.

## Assumptions

- The existing undo/redo system is capable of recording the "Convert to Generator" action without architectural changes.
- A number in the Numbers Grid matching a target value means exact equality (no approximation or range matching).
- If multiple numbers in the Numbers Grid equal the same target, any one of them satisfies the "Available" state; the target tracks availability, not which specific number.
- The "Accomplished" state is not reversible by player action (no un-accomplish); undo of earlier game actions may cause a target to revert if the matching number is removed before it was clicked.
- The Randomize button is only available on the first/setup screen, not during active gameplay.
- The removal of the "Generate Generator" button does not affect any other game mechanics beyond removing that UI element.
- Existing Mobile layout requirements should still be handled in this version.
