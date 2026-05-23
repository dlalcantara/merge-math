# Feature Specification: Mobile Layout Fix & Target Number Input

**Feature Branch**: `002-fix-mobile-layout`

**Created**: 2026-05-23

**Status**: Draft

**Input**: User description: "Fix the App screen to fit in a budget mobile screen resolution (720x1280). When on desktop or a window with larger screen resolution: center the application horizontally with space to the left and right, orient it upward vertically. Fix the layout: Targets are displayed at the top after Action score; Numbers and Generators Grid cell sizes can be smaller; Merge All Numbers and Clear All numbers should be near the Numbers grid; Operators should be between numbers and generators grids; Undo button should be next to the action score; Generate generator and clear generator should be near the Generators grid. On Application load, allow users to specify target numbers. Populate by default with randomly generated numbers."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Play Game on Mobile Device (Priority: P1)

A user opens the Merge Math game on a budget Android phone (720×1280 resolution). The full game interface is visible without horizontal scrolling, and all interactive controls are reachable with one thumb.

**Why this priority**: The primary use case is mobile play. If the layout breaks at 720×1280, the app is unusable for the core audience.

**Independent Test**: Open the app in a 720×1280 viewport; confirm the full game screen is visible, no horizontal scroll exists, and all buttons are tappable.

**Acceptance Scenarios**:

1. **Given** the app is opened on a 720×1280 screen, **When** the game loads, **Then** all UI elements fit within the viewport with no horizontal overflow and no need to scroll to access controls.
2. **Given** the app is opened on a 720×1280 screen, **When** the user plays a full round, **Then** every button and grid cell is accessible without pinching or zooming.

---

### User Story 2 - Correct Component Layout Order (Priority: P1)

A user sees game components arranged in a logical, grouped order: action score and undo button at the top, targets below them, operators between the Numbers and Generators grids, and action buttons (Merge All, Clear All, Generate, Clear Generator) adjacent to their respective grids.

**Why this priority**: Misplaced controls create confusion and errors during play; correct spatial grouping is essential for usability.

**Independent Test**: Load the app and verify the visual order top-to-bottom matches: Action Score + Undo → Targets → Numbers Grid + (Merge All / Clear All) → Operators → Generators Grid + (Generate Generator / Clear Generator).

**Acceptance Scenarios**:

1. **Given** the game is loaded, **When** the user views the screen, **Then** the Action Score and Undo button appear together at the top of the game area.
2. **Given** the game is loaded, **When** the user views the screen, **Then** Targets are displayed directly below the Action Score row.
3. **Given** the game is loaded, **When** the user views the screen, **Then** the Operators section appears between the Numbers grid and the Generators grid.
4. **Given** the game is loaded, **When** the user views the screen, **Then** "Merge All Numbers" and "Clear All Numbers" buttons are positioned adjacent to the Numbers grid.
5. **Given** the game is loaded, **When** the user views the screen, **Then** "Generate Generator" and "Clear Generator" buttons are positioned adjacent to the Generators grid.
6. **Given** the game is loaded, **When** the user views the screen, **Then** grid cells in both the Numbers and Generators grids are visually smaller than before, freeing vertical space.

---

### User Story 3 - Desktop Centered Layout (Priority: P2)

A user opens the app on a desktop browser with a wide window. The game content is centered horizontally with empty space on both sides, and the game is aligned toward the top of the viewport (not vertically centered).

**Why this priority**: Desktop users should see a clean, mobile-frame presentation without stretched or mis-aligned content.

**Independent Test**: Open the app in a viewport wider than 720 px; confirm the game content is horizontally centered and anchored to the top of the page.

**Acceptance Scenarios**:

1. **Given** the viewport width is greater than 720 px, **When** the page loads, **Then** the game content is horizontally centered with visible whitespace on both sides.
2. **Given** the viewport width is greater than 720 px, **When** the page loads, **Then** the game content is aligned to the top, not vertically centered in the viewport.

---

### User Story 4 - Specify Target Numbers on Load (Priority: P2)

When the app first loads, a setup dialog or input area appears that lets the user enter custom target numbers. The fields are pre-populated with randomly generated numbers so the user can start immediately or override them.

**Why this priority**: Allowing custom targets before the game starts personalises gameplay without blocking the experience (defaults ensure zero friction).

**Independent Test**: Load the app fresh; confirm a target-number input screen appears with pre-filled random values; change one value, confirm, and verify the game starts with the custom target.

**Acceptance Scenarios**:

1. **Given** the app is opened, **When** the initial screen loads, **Then** an input area is shown that allows the user to enter or edit target numbers.
2. **Given** the input area is shown, **When** the user has not edited the fields, **Then** each field is pre-filled with a randomly generated number.
3. **Given** the user has edited one or more target number fields, **When** the user confirms and starts the game, **Then** the game uses the user-specified target numbers.
4. **Given** the user accepts the defaults without editing, **When** the user confirms and starts the game, **Then** the game uses the randomly generated numbers as targets.

---

### Edge Cases

- What happens when the user enters non-numeric or invalid values in the target number input fields?
- What happens when the device orientation changes (portrait ↔ landscape) during play?
- How does the layout adapt to screen widths between 720 px and typical desktop widths (e.g., 900–1200 px)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The game interface MUST render fully within a 720×1280 viewport with no horizontal overflow.
- **FR-002**: On viewports wider than 720 px, the game content MUST be horizontally centered with visible space on both sides.
- **FR-003**: On viewports wider than 720 px, the game content MUST be aligned to the top of the viewport, not vertically centered.
- **FR-004**: The Action Score and Undo button MUST be displayed together in the same row at the top of the game area.
- **FR-005**: Targets MUST be displayed below the Action Score row.
- **FR-006**: The Operators section MUST appear between the Numbers grid and the Generators grid.
- **FR-007**: "Merge All Numbers" and "Clear All Numbers" buttons MUST be positioned immediately adjacent to (near) the Numbers grid.
- **FR-008**: "Generate Generator" and "Clear Generator" buttons MUST be positioned immediately adjacent to (near) the Generators grid.
- **FR-009**: Grid cells in the Numbers and Generators grids MUST be visually smaller than the current implementation to conserve vertical space.
- **FR-010**: On application load, a target-number input area MUST be presented to the user before gameplay begins.
- **FR-011**: The target-number input fields MUST be pre-populated with randomly generated numbers by default.
- **FR-012**: The user MUST be able to edit any pre-populated target number before starting the game.
- **FR-013**: The game MUST use the user-confirmed target numbers (whether default or custom) when gameplay begins.
- **FR-014**: If the user enters an invalid value in the target number field, the system MUST display an error message and prevent the game from starting until valid values are provided.

### Key Entities

- **Target Numbers**: The numeric goals the player works toward; configurable per session, defaulting to randomly generated values.
- **Game Layout**: The visual arrangement of all game components (score, targets, grids, operators, action buttons).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of game UI elements are visible and accessible on a 720×1280 viewport without scrolling or zooming.
- **SC-002**: On viewports wider than 720 px, the game content is horizontally centered (equal whitespace on both sides, measurable in browser DevTools).
- **SC-003**: The correct top-to-bottom component order (Score+Undo → Targets → Numbers+actions → Operators → Generators+actions) is present on every page load.
- **SC-004**: On application load, a target-number input screen appears within 1 second with pre-filled random values.
- **SC-005**: Users can start a game with custom target numbers in under 30 seconds from app open.
- **SC-006**: Invalid target number entries are caught before gameplay starts, with a visible error message displayed within 1 second of the invalid submission.

## Assumptions

- The game already functions correctly at larger screen sizes; this feature addresses layout and mobile fit only.
- The number of target fields matches the current game design (not being changed as part of this feature).
- Random number generation for default targets uses the same range/logic already in use for gameplay numbers, or a sensible game-appropriate range.
- Landscape orientation support is out of scope; portrait (720×1280) is the target mobile form factor.
- No backend changes are required; target numbers are client-side state for the duration of a session.
