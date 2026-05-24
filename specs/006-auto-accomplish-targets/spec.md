# Feature Specification: Auto-Accomplish Targets

**Feature Branch**: `006-auto-accomplish-targets`

**Created**: 2026-05-24

**Status**: Draft

**Input**: User description: "Remove the 'Available' status for Targets. Users no longer need to click on the target. When the target number is first found in the Numbers Grid, go from 'Not yet accomplished' directly to 'Accomplished'. Only undo can change the status of a Target from Accomplished to 'Not Yet'"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Target Auto-Accomplishes on Number Match (Priority: P1)

When a player produces a number in the Numbers Grid that equals a target value, that target immediately and automatically moves from "Not yet accomplished" to "Accomplished" — no click required. The player does not need to interact with the target at all.

**Why this priority**: This is the core behavioral change; it replaces the previous two-step flow (Available → click → Accomplished) with a single automatic transition, directly affecting the win condition and how players experience progress.

**Independent Test**: Can be fully tested by producing a number that matches a target and observing the target instantly show as "Accomplished" without any click, while the Numbers Grid retains that number.

**Acceptance Scenarios**:

1. **Given** a target value is "Not yet accomplished" and that value does not exist in the Numbers Grid, **When** a player action causes that exact number to appear in the Numbers Grid, **Then** the target immediately transitions to "Accomplished" with no player interaction required.
2. **Given** a target value is already "Accomplished," **When** another number equal to the target appears in the Numbers Grid, **Then** the target remains "Accomplished" (no regression or double-trigger).
3. **Given** a target is "Accomplished," **When** the matching number is later removed from the Numbers Grid (e.g., by merge or clear), **Then** the target remains "Accomplished" — removal does not revert accomplishment.

---

### User Story 2 - Undo Reverts an Accomplished Target (Priority: P1)

A player undoes the action that caused a target to auto-accomplish. The target reverts to "Not yet accomplished."

**Why this priority**: Undo is the only mechanism that can revert an "Accomplished" target; correctness of undo is critical for game fairness and expected behavior.

**Independent Test**: Can be tested by producing a matching number (causing auto-accomplish), then undoing that action, and confirming the target returns to "Not yet accomplished."

**Acceptance Scenarios**:

1. **Given** a target was just auto-accomplished by a number appearing in the Numbers Grid, **When** the player triggers undo, **Then** the target reverts to "Not yet accomplished" and the action count returns to its prior value.
2. **Given** multiple targets were auto-accomplished in sequence, **When** the player undoes one step at a time, **Then** each undo reverts exactly the target(s) that were accomplished by that action.
3. **Given** a target is "Not yet accomplished," **When** the player triggers undo for any reason, **Then** the target remains "Not yet accomplished" (undo does not affect targets that were not accomplished by that action).

---

### User Story 3 - Two-State Target Display (Priority: P1)

The target list shows each target in exactly one of two states: "Not yet accomplished" or "Accomplished." There is no intermediate "Available" state or clickable target affordance.

**Why this priority**: Removes UI complexity and the need for an extra player action; the simplified display must correctly reflect game state at all times.

**Independent Test**: Can be tested by observing the target list throughout a game session and confirming only two visual states ever appear and targets are never interactive (non-clickable).

**Acceptance Scenarios**:

1. **Given** the game is in progress, **When** the target list is observed, **Then** each target shows only "Not yet accomplished" or "Accomplished" — no third state or intermediate display exists.
2. **Given** a target is in any state, **When** the player attempts to click on the target, **Then** nothing happens (targets are not interactive elements).
3. **Given** all targets are "Accomplished," **When** the game state is observed, **Then** the game ends.

---

### Edge Cases

- If multiple numbers in the Numbers Grid simultaneously equal the same target value (e.g., after a game reset or bulk operation), the target accomplishes on the first detection — it does not accomplish multiple times.
- If the same number is produced and removed multiple times (without undo), and the target was already accomplished on the first occurrence, it remains "Accomplished" on subsequent occurrences.
- Undo of an action that did not cause any target to accomplish has no effect on target states.
- If a single action causes multiple targets to auto-accomplish simultaneously (e.g., producing a number that matches two targets — which cannot happen since targets are unique values, but defensively: each matching target accomplishes independently), undoing that action reverts all of them.

## Requirements *(mandatory)*

### Functional Requirements

**Target State Model**

- **FR-001**: Each target MUST display exactly one of two states: "Not yet accomplished" or "Accomplished." The "Available in Numbers Grid" state MUST be removed entirely.
- **FR-002**: Targets MUST NOT be interactive (not clickable). No click or tap on a target element may change its state.

**Auto-Accomplish Behavior**

- **FR-003**: When a number equal to a target's value first appears in the Numbers Grid and that target is "Not yet accomplished," the system MUST immediately and automatically transition that target to "Accomplished" without any player interaction.
- **FR-004**: The auto-accomplish transition MUST occur at the moment the matching number is placed in the Numbers Grid, not on a subsequent player action.
- **FR-005**: Auto-accomplishing a target MUST NOT change the action count.
- **FR-006**: Auto-accomplishing a target MUST NOT remove or consume the matching number from the Numbers Grid.
- **FR-007**: If a target is already "Accomplished," a matching number appearing in the Numbers Grid MUST NOT alter the target's state.
- **FR-008**: If a matching number is removed from the Numbers Grid after a target was auto-accomplished, the target MUST remain "Accomplished."

**Undo Behavior**

- **FR-009**: Auto-accomplishing a target MUST be recorded as part of the undo history for the action that caused the matching number to appear.
- **FR-010**: When a player undoes an action that caused one or more targets to auto-accomplish, each affected target MUST revert to "Not yet accomplished."
- **FR-011**: Undo MUST be the only mechanism by which a target can transition from "Accomplished" back to "Not yet accomplished."

**Win Condition**

- **FR-012**: The game MUST end when all targets reach the "Accomplished" state.

### Key Entities

- **Target**: A goal value; exists in one of two states — "Not yet accomplished" or "Accomplished." Transitions automatically upon number match; reverts only via undo.
- **Number**: A value in the Numbers Grid; triggers auto-accomplish for any matching "Not yet accomplished" target when it first appears.
- **Action Count**: Unchanged by target auto-accomplish transitions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In every game session, targets transition from "Not yet accomplished" to "Accomplished" automatically with zero player clicks on the target — verified by end-to-end play observation.
- **SC-002**: The "Available" state and any target click affordance are absent from the UI in 100% of observed game states.
- **SC-003**: Undoing an accomplishing action reverts the correct target(s) to "Not yet accomplished" in 100% of tested cases, with no overshoot or undershoot.
- **SC-004**: The game-end condition triggers immediately and exclusively when all targets reach "Accomplished," with no delay or missed trigger.
- **SC-005**: After auto-accomplish, the matching number remains in the Numbers Grid unchanged in all tested cases.

## Assumptions

- Target values are unique within a game session; no two targets share the same value, so a single number can auto-accomplish at most one target.
- The existing undo/redo system can record auto-accomplish events bundled with the action that caused the number to appear, without architectural changes.
- "First appears in the Numbers Grid" means the moment the number is added as a result of any game action (merge, generate, convert, etc.) — not on re-evaluation of an already-present number.
- The removal of the "Available" state and target-click interactivity is a complete replacement of the three-state model described in the 005-v030-game-enhancements spec (FR-013 through FR-019, FR-024 in that spec are superseded by this feature).
- Existing mobile layout requirements continue to apply.
