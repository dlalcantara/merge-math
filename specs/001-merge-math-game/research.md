# Research: Merge Math Game MVP

**Branch**: `001-merge-math-game` | **Date**: 2026-05-23

---

## 1. Build Tooling & GitHub Pages Deployment

**Decision**: Vite 5 + `@vitejs/plugin-react`, deployed to GitHub Pages via GitHub Actions using the official `peaceiris/actions-gh-pages` action (or Vite's built-in `build` + manual push to `gh-pages` branch).

**Rationale**: Vite is the fastest dev/build tool for React SPAs and has first-class support for subdirectory base paths via the `base` config field. Setting `base: '/<repo-name>/'` in `vite.config.ts` ensures all asset URLs are correct on GitHub Pages.

**Alternatives considered**:
- Create React App: deprecated, much slower HMR, no longer maintained.
- Next.js: overkill for a static game; SSR/routing complexity adds no value.
- Parcel: similar speed to Vite but less ecosystem support for GitHub Pages patterns.

---

## 2. State Management

**Decision**: React `useReducer` hook with a custom `useGame` hook wrapping a `GameStore` object.

**Rationale**: The game state is a pure finite state machine — all transitions are deterministic given `(state, action)`. `useReducer` maps directly to this model. No async operations, no cross-component subscriptions, and no derived server state mean external libraries (Redux, Zustand, Jotai) add complexity without benefit. The game is contained in a single component tree rooted at `GameBoard`.

**Alternatives considered**:
- Zustand: good fit but unnecessary external dependency for this scope.
- Redux Toolkit: excellent for large apps; overkill here; boilerplate overhead.
- `useState` per field: fragile — coordinating multi-field updates (e.g., grid + score + history) across renders risks stale closures.

---

## 3. Undo / Redo Pattern

**Decision**: Snapshot-based undo — before each scored action, push a deep copy of the current `GameState` onto a history stack. Undo pops the most recent snapshot and replaces current state.

**Rationale**: Snapshot approach is simple, correct-by-construction, and requires no inverse-action logic. Each `GameState` snapshot is extremely small (≤ ~300 bytes), so even a full-session history of hundreds of actions remains well under 1 MB. Redo is out of scope for the MVP (the spec only mentions Undo).

**Alternatives considered**:
- Command pattern with inverse actions: more memory-efficient for large states, but requires writing and testing inverse logic for every action type — significant complexity for no benefit at this scale.
- Immer + structural sharing: reduces snapshot size further, but the savings are negligible given state size.

---

## 4. Testing Setup

**Decision**: Vitest (test runner, coverage), `@testing-library/react` (component and integration rendering), `@testing-library/user-event` (realistic event simulation), `@testing-library/jest-dom` (DOM matchers).

**Rationale**: Vitest integrates natively with Vite (shares config, no babel bridging). React Testing Library encourages testing from the user's perspective — ideal for acceptance-scenario-driven integration tests. `jsdom` provides the DOM environment.

**Coverage threshold**: 80% statements/lines/branches enforced in `vitest.config.ts` via `coverage.thresholds`.

**Test file layout**:
- `tests/unit/engine/` — pure function tests (no React, fast, deterministic)
- `tests/unit/components/` — isolated component rendering tests
- `tests/integration/` — one file per user story; renders full `GameBoard`, drives via `userEvent`

**Alternatives considered**:
- Jest + babel: slower cold start, requires extra Vite bridging config.
- Playwright / Cypress: E2E tools are appropriate for browser automation but heavyweight for unit/integration coverage; reserved for a future QA pass.

---

## 5. Responsive Layout & Accessibility

**Decision**: CSS Grid for game grids (native `grid-template-columns`), Flexbox for overall page layout. CSS custom properties (`--color-*`, `--spacing-*`) for theming. No CSS-in-JS, no Tailwind for MVP (avoids build-time setup complexity).

**WCAG 2.1 AA compliance**:
- All interactive elements (`button`, clickable cells) receive `aria-label` or visible text.
- Selected cell state communicated via `aria-pressed` / `aria-selected`.
- Color contrast ≥ 4.5:1 for text on all backgrounds.
- Keyboard navigation: cells are `<button>` elements so they receive focus and respond to Enter/Space natively.
- Win modal traps focus and is announced via `role="dialog"` + `aria-modal="true"`.

**Alternatives considered**:
- Tailwind CSS: fast prototyping, but adds a build step and the atomic-class verbosity is high for a game with many dynamic states.
- CSS Modules: good option; plain CSS is simpler for a single-page game with no naming conflicts.

---

## 6. Target Generation

**Decision**: At game start, generate 10 unique integers in the range [−1023, 1024] sorted by ascending absolute value (ties broken by sign — positive before negative). Use `Math.random()` seeded implicitly by the browser.

**Rationale**: No reproducibility requirement in the spec; browser `Math.random()` is sufficient. The range [−1023, 1024] fits the spec constraint (FR-002). Uniqueness ensured by rejection sampling (extremely unlikely to need more than 15 draws for 10 values in a range of 2048).

**Alternatives considered**:
- Seeded PRNG (e.g., mulberry32): needed only if reproducibility or replay is required — out of scope for MVP.
- Pre-authored target lists: removes randomness, making the game repetitive on replay.

---

## All NEEDS CLARIFICATION Items: Resolved

| Item | Resolution |
|------|-----------|
| State management library | `useReducer` — no external library needed |
| Undo pattern | Snapshot stack |
| Test runner | Vitest |
| CSS approach | Plain CSS + custom properties |
| GitHub Pages deployment | Vite `base` config + `gh-pages` branch |
| Target generation | Browser `Math.random()`, rejection-sample for uniqueness |
