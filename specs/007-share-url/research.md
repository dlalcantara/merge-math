# Research: Share Game URL

**Feature**: `007-share-url` | **Date**: 2026-05-25

## Decision 1: Client-side URL parameter strategy — hash fragment vs. query string

**Decision**: Use the URL hash fragment (`#targets=1,2,5,12,25,67,69,-420`).

**Rationale**: This is a Vite SPA with no server routing. Query strings (`?targets=…`) are sent to the server on every request, which adds unnecessary noise and could break if the deployment origin strips unknown parameters. Hash fragments are 100% client-side — the browser never sends them to the server, they survive `window.location.href` reads unchanged, and they are idiomatic for SPA state that must survive a page load without server involvement.

**Alternatives considered**:
- `?targets=…` (query string): Works but sends parameters to the server; breaks the mental model for a purely client-side feature.
- `localStorage` with a stable key: Does not produce a shareable URL — the recipient would not benefit.
- Base64-encoded opaque blob in the hash: More compact but opaque to humans; harder to validate and debug; not needed at 8 numbers.

---

## Decision 2: Target number encoding in the hash

**Decision**: Comma-separated integers: `#targets=1,2,5,12,25,67,69,-420`.

**Rationale**: The target list is always exactly 8 integers in the range −1023 to +1024 (from `generateRandomTargets`). A comma-separated list is human-readable, trivially serialised with `Array.join(',')`, and trivially parsed with `String.split(',').map(Number)`. No library needed.

**Validation rules** (decoded from spec requirements):
- Exactly 8 comma-separated values.
- Each value must parse to a finite integer (`Number.isInteger` + `isFinite`).
- Values outside any explicit range are accepted (the game doesn't enforce range at the setup screen — the spec says same rules as setup screen, and setup accepts any integer).
- On any validation failure: fall back to the setup screen silently.

**Alternatives considered**:
- JSON array in the hash: More verbose (`[1,2,5]` vs `1,2,5`) with no benefit at this scale.
- URLSearchParams with repeated keys (`#targets=1&targets=2`): More standard but hash fragments are not parsed by `URLSearchParams` in all browsers without manual prefix stripping; comma-list is simpler.

---

## Decision 3: Clipboard API + fallback

**Decision**: Primary — `navigator.clipboard.writeText(url)` (async). Fallback — display the URL in a `<textarea>` inside a small modal/overlay that the user can manually select and copy.

**Rationale**: `navigator.clipboard` requires a secure context (HTTPS or localhost) and may require user permission in some browsers. The game is a static SPA deployed over HTTPS in production and `localhost` in development, so the primary path works in all expected environments. A simple textarea fallback covers the edge case (e.g., HTTP iframes, older browsers) without adding a library.

**Confirmation UX**: On success, the share button briefly shows "Copied!" text (or a checkmark state) for ~2 seconds via a local React `useState`, then reverts. This is implemented inside `ScoreRow` with a `setTimeout` — no external library, no global state.

**Alternatives considered**:
- `document.execCommand('copy')`: Deprecated; removed from modern browsers.
- A toast/snackbar library: Unnecessary overhead for a single use case; the inline confirmation is sufficient.
- No confirmation: Violates FR-005 (spec requirement).

---

## Decision 4: Share control placement and component responsibility

**Decision**: Add an `onShare: () => Promise<void>` prop to `ScoreRow`; render a share icon button (`<button aria-label="Share">`) inline with the Action Score and Undo button. `GameBoard` constructs the handler (reads `current.targets`, calls `shareUrl.buildAndCopy`). `ScoreRow` owns only the confirmation display state.

**Rationale**: `ScoreRow` is already the container for the Action Score and Undo button — it is the natural home for the share control. Keeping `ScoreRow` as a presentational component that receives `onShare` from `GameBoard` maintains the existing data-flow pattern (no component reaches up to parent state). The clipboard write and URL construction live in `src/utils/shareUrl.ts` — framework-agnostic and independently testable.

**Alternatives considered**:
- A separate `ShareButton` component: Adds a file and an abstraction boundary for a button that is trivially simple; rejected (YAGNI).
- Placing the share button outside `ScoreRow` (e.g., in `GameBoard` directly in JSX): Would visually separate it from the score row; inconsistent with spec requirement "near the Action Score".

---

## Decision 5: URL-load integration point

**Decision**: Parse `window.location.hash` inside `App.tsx` using a module-level call to `shareUrl.parseTargets(window.location.hash)` before the component renders. If valid, initialise `phase` to `'playing'` and `confirmedTargets` to the decoded targets; otherwise use the normal `'setup'` initial state.

**Rationale**: `App.tsx` already owns the `phase` / `confirmedTargets` state that determines which screen is shown. Reading the hash once at mount (via `useState` initialisers) is the simplest, most idiomatic React approach. No `useEffect` needed — the hash is stable at mount time.

**Alternatives considered**:
- `useEffect` on mount: Causes a setup-screen flash before transitioning to the game; poor UX.
- A router (React Router): Overkill; this app has one route and the feature only needs hash parsing.
- Reading the hash in `main.tsx` and passing props to `App`: Couples bootstrapping to feature logic; harder to test.
