# Feature Specification: Share Game URL

**Feature Branch**: `007-share-url`

**Created**: 2026-05-25

**Status**: Draft

**Input**: User description: "Create a share button or icon available near the Action Score. This generates a URL and copies it to the user's clipboard for copy pasting. The URL should point to the current page URL, but with added client-side parameters indicating the target numbers. Also, enhance the game such that if the URL contains client-side parameters it starts the game with the specified target numbers."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Share Current Game Configuration (Priority: P1)

A player has set up a game with specific target numbers they enjoy and wants to share that exact configuration with a friend. While the game is in progress, they tap a share icon displayed near the Action Score. The game generates a URL containing the current target numbers as query parameters, copies it to their clipboard, and shows a brief confirmation. The player pastes the URL into a message and sends it.

**Why this priority**: This is the core value of the feature — the ability to share a game configuration. Without it, the URL-loading story has nothing to load.

**Independent Test**: Can be fully tested by starting a game, tapping the share icon, and verifying that the clipboard contains a URL with the correct target number parameters appended.

**Acceptance Scenarios**:

1. **Given** a game is in progress with specific target numbers, **When** the player taps the share icon near the Action Score, **Then** a URL is copied to the clipboard that includes all current target numbers as URL parameters.
2. **Given** the share icon is tapped, **When** the URL is copied, **Then** a brief visual confirmation (e.g., tooltip or icon change) appears to confirm success.
3. **Given** the game is on any page/route, **When** the share URL is generated, **Then** it points to the same page with target numbers appended as client-side parameters (fragment or query string).

---

### User Story 2 - Load Shared Game from URL (Priority: P2)

A player receives a shared URL containing target numbers. When they open the URL in their browser, the game skips the setup screen and immediately starts with the target numbers encoded in the URL.

**Why this priority**: This delivers the full round-trip value. Without it, the shared URL is just informational and the recipient still has to manually enter targets.

**Independent Test**: Can be tested independently by navigating to a URL with valid target parameters and verifying the game starts directly with those targets (no setup screen shown).

**Acceptance Scenarios**:

1. **Given** a URL with valid target number parameters, **When** the player opens that URL, **Then** the game starts immediately with those target numbers, bypassing the setup screen.
2. **Given** a URL with invalid or malformed target parameters (e.g., non-numeric, empty), **When** the player opens that URL, **Then** the game falls back to the normal setup screen.
3. **Given** a URL with no target parameters, **When** the player opens that URL, **Then** the game behaves as normal (shows setup screen).
4. **Given** a URL with target numbers outside the valid range or count, **When** the player opens that URL, **Then** the game falls back to the normal setup screen.

---

### Edge Cases

- What happens when the browser does not support the Clipboard API (e.g., insecure context, old browser)? A graceful fallback must be provided (see FR-004).
- What happens when the URL contains duplicate target numbers? The game should apply them as-is, since the normal setup allows duplicates.
- What happens when the URL contains more or fewer target numbers than expected? Treat as invalid and fall back to setup screen.
- What happens when the share button is tapped multiple times rapidly? Each tap should overwrite the clipboard with the same URL; no adverse effects.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A share icon or button MUST be displayed in close proximity to the Action Score during active gameplay.
- **FR-002**: When the share control is activated, the system MUST construct a URL from the current page address plus client-side parameters encoding the current target numbers.
- **FR-003**: The constructed URL MUST be automatically copied to the player's clipboard upon activation.
- **FR-004**: If clipboard access is unavailable, the system MUST display the shareable URL in a visible, selectable text area or modal so the player can copy it manually.
- **FR-005**: The system MUST display a brief confirmation to the player after the URL has been successfully copied to the clipboard.
- **FR-006**: On game load, the system MUST check the URL for client-side parameters encoding target numbers.
- **FR-007**: If valid target number parameters are detected in the URL, the system MUST start the game immediately with those target numbers, bypassing the setup screen.
- **FR-008**: If target number parameters are absent, malformed, non-numeric, or out of the valid range or count, the system MUST fall back to the normal setup screen flow.
- **FR-009**: The share control MUST be accessible (operable by keyboard and screen reader, with a descriptive label).

### Key Entities

- **Shareable Game Configuration**: The set of target numbers for the current game, encoded as a list of integers in the URL parameters.
- **Share URL**: The current page URL augmented with client-side parameters (hash fragment or query string) representing the target numbers.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player can generate and copy a share URL in under 2 taps/clicks with no additional steps.
- **SC-002**: A recipient opening a valid share URL reaches an active game with the correct targets in under 3 seconds (same as a normal game load time).
- **SC-003**: 100% of valid shared URLs load the correct target configuration without requiring manual input from the recipient.
- **SC-004**: Invalid or malformed share URLs never cause an error state — they always fall back gracefully to the setup screen.
- **SC-005**: The share control is visible and reachable without scrolling on mobile viewports (720×1280).

## Assumptions

- The game is a single-page application with no server-side routing; client-side URL parameters (hash fragment preferred to avoid server round-trips) are sufficient for encoding targets.
- Target numbers are integers within the range already enforced by the existing setup screen; the same validation rules apply when loading from URL.
- The number of target numbers per game is fixed by the existing game rules (as defined by `DEFAULT_TARGETS` / setup screen); URLs with a different count are treated as invalid.
- The share control is shown only during an active game (not on the setup screen or win modal), since the setup screen already captures target configuration before the game starts.
- No server-side URL shortening or analytics tracking is required for this feature.
- The clipboard API is the primary copy mechanism; a visible fallback covers environments where it is unavailable.
