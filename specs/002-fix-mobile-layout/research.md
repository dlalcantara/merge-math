# Research: Mobile Layout Fix & Target Number Input

**Date**: 2026-05-23 | **Branch**: `002-fix-mobile-layout`

---

## Decision 1: Mobile viewport containment strategy

**Decision**: Keep `max-width: 480 px` on `#root` and rely on the existing `body { justify-content: center; align-items: flex-start }` for desktop centering. Reduce vertical spacing and cell sizes so the full game fits in 1280 px height on a 720 px device without scrolling.

**Rationale**: The current `game.css` already sets `max-width: 480 px` — the 720 px budget mobile screen will show the game centred with ~120 px margins on each side, which is acceptable and consistent with the spec requirement ("center horizontally with space to the left and right"). The primary fix needed is *vertical* compression: smaller grid cells, tighter spacing, and reorganised layout so no section is duplicated or spread apart.

**Alternatives considered**:
- `max-width: 360 px` — too narrow; targets and operator buttons would wrap unreadably.
- `max-width: 720 px` (full bleed on mobile) — defeats the centred-card aesthetic on desktop; not consistent with existing design intent.

---

## Decision 2: Component layout order implementation

**Decision**: Restructure `GameBoard.tsx` into five vertical sections in this order: `ScoreRow` → `TargetList` → `NumbersSection` → `OperatorSelector` → `GeneratorsSection`. `ScoreRow` contains the action score and Undo button side by side. `NumbersSection` wraps the Numbers grid plus "Merge All Numbers" and "Clear Numbers Grid" buttons. `GeneratorsSection` wraps the Generators grid plus "Generate Generator" and "Clear Generators Grid" buttons.

**Rationale**: Collocating action buttons with the grid they operate on reduces visual scanning distance and follows the principle of spatial proximity (related controls near their data). Extracting three wrapper components (`ScoreRow`, `NumbersSection`, `GeneratorsSection`) maintains single-responsibility. `OperatorSelector` is unchanged and placed between the two grids as it applies an operation that spans both.

**Alternatives considered**:
- Keep single `ActionButtons` component but reorder it in the DOM — rejected because it mixes concerns (all buttons in one block regardless of which grid they affect).
- CSS absolute positioning to move buttons — rejected because it breaks document flow and accessibility/focus order.

---

## Decision 3: Grid cell size reduction

**Decision**: Reduce cell size via CSS. Change `#root max-width` from 480 px to 400 px and reduce `--spacing-lg` from `1rem` to `0.75rem` within the game context. Set an explicit `max-height` on cells (e.g., `min(12vw, 56px)`) so they scale with viewport width but never become too large.

**Rationale**: The Numbers grid is 3 columns × 3 rows (9 cells) and Generators grid is 2 columns × 2 rows (4 cells). Each cell has `aspect-ratio: 1` and fills its grid column. On a 480 px root with 3 columns and gaps, each Number cell is ~152 px tall — this alone consumes 456 px vertically, leaving too little room for score, targets, operators, and generator section. Reducing root max-width to 400 px and capping cell height brings Numbers grid height to ~380 px and the full layout fits in ~1000 px.

**Alternatives considered**:
- Keep 480 px root, reduce only `font-size` — insufficient; cells remain tall due to `aspect-ratio: 1`.
- Remove `aspect-ratio: 1` and set fixed `height: 48px` — simpler but loses the square visual identity that the game design relies on.

---

## Decision 4: Pre-game setup screen

**Decision**: Render a `SetupScreen` component in `App.tsx` when `targets === null` (no confirmed targets yet). `SetupScreen` shows a numeric text input per target slot, pre-filled with randomly generated values (same `generateTargets()` function). On "Start Game" the screen passes the confirmed array to `useGame` which initialises `GameState` with those targets.

**Rationale**: A conditional render at the `App` level (before `GameBoard` mounts) is the simplest approach — no routing, no modal layered over a game that doesn't exist yet. `generateTargets()` is already pure and side-effect-free; reusing it for defaults avoids duplicating randomisation logic.

**Alternatives considered**:
- Modal dialog on top of an already-initialised game — rejected because the game would start with random targets that get overwritten; wasteful and potentially confusing.
- URL query params for targets — over-engineered for a local game; no sharing requirement in spec.
- Separate route — requires adding a router dependency; not justified for a two-screen flow.

---

## Decision 5: Target input validation

**Decision**: Validate that each target field is an integer within −9999 to 9999 on form submission. Display an inline error message below the invalid field(s). Prevent "Start Game" until all fields are valid.

**Rationale**: The current `generateTargets()` uses the range −1023 to 1024. Allowing a slightly wider range (−9999–9999) gives players flexibility without game-breaking values. Integers only because the game arithmetic is integer-based.

**Alternatives considered**:
- Restrict to exact −1023–1024 range — too restrictive for user custom input; spec says "allow users to specify", implying freedom.
- Allow any number including floats — rejected; game engine uses integer arithmetic and float targets could never be hit.
