# Feature Specification: Help Modal & AI Disclaimer

**Feature Branch**: `008-help-modal-disclaimer`

**Created**: 2026-05-30

**Status**: Draft

**Input**: User description: "Create a short and easy to read introduction to the game so that casual players can understand how to play. Make this available as a ? icon that players can click and then it will display a modal containing the text. Also add an AI disclaimer. Claude was used for only programming. Design is original. No art assets used"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - First-Time Player Learns How to Play (Priority: P1)

A casual player opens the game for the first time and isn't sure what to do. They notice a clearly visible "?" icon on the game screen. Clicking it opens a modal that explains the rules and goal in plain, friendly language. After reading, they close the modal and feel confident enough to begin playing.

**Why this priority**: Onboarding is the single biggest barrier to retention for a new player. Without a quick introduction, casual players who don't intuit the rules will abandon the game. This story delivers the core value of the feature on its own.

**Independent Test**: Load the game as a brand-new player. Locate the "?" icon, click it, read the introduction, dismiss the modal, and then play a turn applying what was just read. The test passes if a casual reader can describe the goal and basic move after reading the modal once.

**Acceptance Scenarios**:

1. **Given** the player is on the main game screen, **When** they look at the interface, **Then** a "?" help icon is visible and identifiable as a help control.
2. **Given** the player clicks the "?" icon, **When** the modal opens, **Then** it displays a short introduction covering the goal of the game and how to make a basic move.
3. **Given** the help modal is open, **When** the player chooses to dismiss it (close button, clicking outside the modal, or pressing the Escape key), **Then** the modal closes and the game state is unchanged.
4. **Given** the player has already opened the help modal once, **When** they reopen it later in the same session, **Then** the same introduction is displayed without errors.

---

### User Story 2 - Player Sees AI & Attribution Disclaimer (Priority: P2)

A player who is curious about how the game was made wants to know whether AI was involved. Inside the same help modal (or a clearly linked section of it), they see a short disclaimer stating that Claude was used only for programming, the design is original, and no AI-generated art assets were used.

**Why this priority**: Disclosing AI involvement builds trust and meets a growing expectation among players for honest attribution. It does not block gameplay, but it is important for the project's credibility. It can be delivered together with Story 1 or as a follow-up.

**Independent Test**: Open the help modal and confirm the disclaimer text is present, readable, and accurately states the AI usage and the originality of the design and absence of AI art.

**Acceptance Scenarios**:

1. **Given** the help modal is open, **When** the player scrolls or reads through it, **Then** they see a disclaimer that includes: (a) AI (Claude) was used for programming only, (b) the design is original, and (c) no AI-generated art assets were used.
2. **Given** the disclaimer is shown, **When** the player reads it, **Then** the wording is unambiguous and does not imply AI involvement in design or art.

---

### Edge Cases

- What happens on very small screens (mobile portrait) where the modal must remain readable and dismissible without overlapping critical game UI?
- What happens if the player opens the help modal mid-game? The game must pause or remain in a safe state and not lose progress when the modal is dismissed.
- What happens if the player tries to interact with the game (tap a tile, drag) while the modal is open? Game inputs should be blocked while the modal is visible.
- What happens for keyboard-only or assistive-technology users? They must be able to open the modal, read it, and dismiss it without a pointing device.
- What happens if the introduction text grows longer than the viewport? The modal content should remain scrollable while controls (close button) remain reachable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The game screen MUST display a "?" help icon that is recognizable as a help/information control and reachable from the main play area at all times.
- **FR-002**: Activating the help icon (click, tap, or keyboard activation) MUST open a modal overlay containing the help content.
- **FR-003**: The help modal MUST contain a short, plain-language introduction that explains the goal of the game and how a casual player makes a basic move, written so that a first-time player can grasp it in under one minute of reading.
- **FR-004**: The help modal MUST contain an AI disclaimer stating that Claude was used only for programming, that the design is original, and that no AI-generated art assets were used.
- **FR-005**: The help modal MUST be dismissible via a visible close control, by clicking/tapping outside the modal, and by pressing the Escape key.
- **FR-006**: While the help modal is open, the underlying game MUST NOT advance state or accept gameplay input; closing the modal MUST restore normal interaction without altering game progress.
- **FR-007**: The help modal MUST be operable by keyboard alone (focus moves to the modal on open, focus is trapped within the modal while it is open, focus returns to the help icon on close) and MUST expose appropriate semantics so screen readers announce it as a dialog with a title.
- **FR-008**: The help modal layout MUST remain legible and fully usable on the smallest supported mobile viewport as well as on desktop, including when the content requires scrolling.
- **FR-009**: The help content (introduction and disclaimer) MUST be maintainable as plain text in a single location so that copy edits do not require code changes elsewhere in the UI.

### Key Entities

- **Help Content**: The static body of text shown inside the modal. Comprises two logical sections — a short "How to Play" introduction and an "AI & Attribution" disclaimer.
- **Help Modal**: A transient UI surface that overlays the game, displays Help Content, and can be opened from the help icon and dismissed by the player.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time casual player can locate the help icon within 10 seconds of seeing the game screen for the first time.
- **SC-002**: After reading the help modal once, at least 90% of test players can correctly describe the goal of the game and perform a valid first move without further guidance.
- **SC-003**: Players can read the entire introduction in under 60 seconds at a casual reading pace (target length ≈ 80–150 words for the intro section).
- **SC-004**: Opening and closing the help modal completes in a single interaction each, and the player returns to the same game state they left, in 100% of sessions.
- **SC-005**: The help modal is fully readable and dismissible on viewports as small as 320 px wide without horizontal scrolling or clipped controls.
- **SC-006**: 100% of players who open the help modal see the AI disclaimer in the same view (no extra navigation required).

## Assumptions

- The help icon will be placed within the existing main game screen chrome; no new top-level navigation is being introduced.
- The help modal is informational only — it does not collect input, link out to external sites, or persist any per-player state (no "don't show again" preference is required in v1).
- The introduction copy will be written in English only for v1; localization is out of scope.
- The disclaimer wording is fixed by the user request and will be incorporated verbatim in intent: Claude used for programming only, original design, no AI art assets.
- The feature does not need to auto-open on first launch; discovery via the visible "?" icon is sufficient for v1.
- Existing styling primitives (colors, typography, spacing) from the game's current design will be reused so the modal feels native to the game.
