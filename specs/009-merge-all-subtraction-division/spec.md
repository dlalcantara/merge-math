# Feature Specification: Merge All Numbers — Subtraction & Division Support

**Feature Branch**: `009-merge-all-subtraction-division`

**Created**: 2026-05-30

**Status**: Draft

**Input**: User description: "Allow 'Merge All Numbers' to also work for subtraction and division."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Merge All with Subtraction (Priority: P1)

A player has several numbers on the grid and the active operator is subtraction. They click "Merge All Numbers" and the game combines all numbers by subtracting them in left-to-right, top-to-bottom grid order, leaving a single result in the first grid cell.

**Why this priority**: Subtraction is a core operator in the game. Blocking "Merge All" for subtraction is inconsistent and limits player strategy.

**Independent Test**: With 2+ numbers on the grid and subtraction active, click "Merge All Numbers" and verify a single result appears equal to sequentially subtracting each subsequent number from the first.

**Acceptance Scenarios**:

1. **Given** the active operator is subtraction and two or more numbers are on the grid, **When** the player clicks "Merge All Numbers", **Then** the button is enabled and all numbers are merged into a single result using sequential subtraction in positional order.
2. **Given** the active operator is subtraction and only one number is on the grid, **When** the player views the button, **Then** the "Merge All Numbers" button is disabled.
3. **Given** the active operator is subtraction and zero numbers are on the grid, **When** the player views the button, **Then** the "Merge All Numbers" button is disabled.

---

### User Story 2 - Merge All with Division (Priority: P2)

A player has several numbers on the grid and the active operator is division. They click "Merge All Numbers" and the game combines all numbers by dividing them in left-to-right, top-to-bottom grid order, leaving a single result.

**Why this priority**: Division is a core operator in the game. Blocking "Merge All" for division is inconsistent and limits player strategy.

**Independent Test**: With 2+ numbers on the grid and division active, click "Merge All Numbers" and verify a single result appears equal to sequentially dividing from the first number onward.

**Acceptance Scenarios**:

1. **Given** the active operator is division and two or more numbers are on the grid, **When** the player clicks "Merge All Numbers", **Then** the button is enabled and all numbers are merged into a single result using sequential division in positional order.
2. **Given** a grid contains the values [12, 3, 2] (in positions 0, 1, 2) and division is active, **When** the player clicks "Merge All Numbers", **Then** the result is 2 (12 ÷ 3 = 4, then 4 ÷ 2 = 2).
3. **Given** a divisor value of 0 appears anywhere in the merge sequence, **When** the merge is performed, **Then** the result of that division step is treated as 0 and merging continues with any remaining numbers.

---

### User Story 3 - Consistent Button Enable/Disable State (Priority: P3)

The "Merge All Numbers" button enables and disables consistently across all four operators: enabled when any operator is active and at least two numbers are present, disabled otherwise.

**Why this priority**: Consistent UI behavior reduces player confusion. Players should not need to know that certain operators are "special."

**Independent Test**: Cycle through all four operators with 2+ numbers on the grid and verify the button is enabled for each; verify it disables when fewer than 2 numbers are present for each operator.

**Acceptance Scenarios**:

1. **Given** any of the four operators is active and two or more numbers are on the grid, **When** the player views the button, **Then** "Merge All Numbers" is enabled.
2. **Given** any of the four operators is active and fewer than two numbers are on the grid, **When** the player views the button, **Then** "Merge All Numbers" is disabled.

---

### Edge Cases

- What happens when exactly two numbers are on the grid with subtraction? The result is the first minus the second.
- What happens when exactly two numbers are on the grid with division? The result is the first divided by the second (truncated to an integer).
- What happens when a zero appears as a divisor in a multi-number merge? That division step produces 0, and 0 is carried forward into any remaining steps.
- What is the order when numbers occupy non-contiguous cells? Grid positional order is used (cell 0 through cell 8), skipping empty cells.
- What happens with addition and multiplication after this change? No change — existing behavior is preserved.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The "Merge All Numbers" action MUST be enabled when the active operator is subtraction and at least two numbers are on the grid.
- **FR-002**: The "Merge All Numbers" action MUST be enabled when the active operator is division and at least two numbers are on the grid.
- **FR-003**: The "Merge All Numbers" button MUST remain disabled when fewer than two numbers are present, regardless of the active operator.
- **FR-004**: When merging with subtraction, the system MUST combine numbers in grid positional order (left-to-right, top-to-bottom), subtracting each subsequent number from the running total.
- **FR-005**: When merging with division, the system MUST combine numbers in grid positional order (left-to-right, top-to-bottom), dividing the running total by each subsequent number.
- **FR-006**: After a successful "Merge All Numbers" action, the grid MUST contain a single result value and all other cells MUST be empty.
- **FR-007**: The result of any division step where the divisor is zero MUST be treated as zero, consistent with existing single-cell division behavior.
- **FR-008**: Division results MUST be truncated to integers (no decimal fractions), consistent with how all other division operations work in the game.
- **FR-009**: The "Merge All Numbers" action with subtraction or division MUST be reversible via the existing undo function.
- **FR-010**: After merging with subtraction or division, the system MUST check whether any game targets are now accomplished, consistent with how addition and multiplication merges behave.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can activate "Merge All Numbers" with all four operators when 2+ numbers are present — 0 cases where the button is incorrectly disabled.
- **SC-002**: The computed result for subtraction and division merges is correct 100% of the time, matching the expected sequential positional calculation.
- **SC-003**: The button enable/disable state for subtraction and division is visually and functionally identical to the existing behavior for addition and multiplication.
- **SC-004**: No regression: "Merge All Numbers" with addition and multiplication continues to produce correct results and behaves identically to before this change.

## Assumptions

- The merge order for subtraction and division is positional: numbers are combined in the order they appear in the 9-cell grid (left-to-right, top-to-bottom), skipping empty cells. This is consistent with how the existing addition and multiplication merges iterate.
- Truncated integer division is the correct behavior for division merges, consistent with every other division operation in the game.
- No new UI elements are introduced; the existing "Merge All Numbers" button is reused for all four operators.
- The feature does not change the visual appearance of the button or the grid beyond updating the enable/disable logic.
