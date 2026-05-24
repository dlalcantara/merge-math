# Research: Auto-Accomplish Targets

**Feature**: `006-auto-accomplish-targets` | **Phase**: 0 | **Date**: 2026-05-24

## Summary

No external dependencies or new technology are introduced. All decisions concern how to remove the `CLAIM_TARGET` action, eliminate the intermediate "available" state, and wire auto-accomplish into the existing reducer pattern. Three design questions were resolved by reading the codebase.

---

## Decision 1: Where to run the auto-accomplish check

**Question**: Should auto-accomplish be applied in the reducer (engine layer) or as a React effect (component layer)?

**Context**: Auto-accomplish must be bundled with the same undo step as the action that added the matching number. The existing `UNDO` case restores `history[history.length - 1]` verbatim — if target state is modified in a separate React effect after the fact, it would produce a second independent history entry, requiring two undos to fully revert.

**Decision**: Implement auto-accomplish entirely inside the reducer via a `withAutoAccomplish` helper applied before calling `scored()` or `historical()` for any action that adds new values to `numbersGrid`:

```ts
function withAutoAccomplish(state: GameState): GameState {
  const targets = state.targets.map(t =>
    !t.accomplished && state.numbersGrid.includes(t.value)
      ? { ...t, accomplished: true }
      : t
  )
  return { ...state, targets }
}
```

Apply in: `GENERATE_NUMBER`, `MERGE_CELLS` (when `sourceGrid === 'numbers'`), `MERGE_ALL_NUMBERS`.

**Rationale**: Bundling target state with the triggering action ensures a single `UNDO` always restores the exact prior game state — targets and grid together. No React effect, no extra dispatch, no race condition.

**Alternatives considered**:
- React `useEffect` watching `numbersGrid` + dispatch `AUTO_ACCOMPLISH` — rejected: creates a second history entry; two undos required to fully revert; harder to test.
- Middleware / reducer enhancer wrapping all actions — rejected: over-engineered; direct call inside each relevant case is simpler and more explicit.

---

## Decision 2: Which actions trigger auto-accomplish

**Question**: Which reducer cases must call `withAutoAccomplish`?

**Context**: Only actions that **add new numeric values** to `numbersGrid` can cause a previously-unmatched target to become matched. Actions that only remove or move numbers cannot cause a new accomplishment.

**Decision**:

| Action | Modifies numbersGrid? | Can add new value? | Call withAutoAccomplish? |
|---|---|---|---|
| `GENERATE_NUMBER` | Yes | Yes — adds generator value | ✅ Yes |
| `MERGE_CELLS` (numbers) | Yes | Yes — produces result | ✅ Yes |
| `MERGE_ALL_NUMBERS` | Yes | Yes — produces result | ✅ Yes |
| `CLEAR_NUMBERS_GRID` | Yes | No — removes all | ❌ No |
| `CONVERT_TO_GENERATOR` | Yes | No — removes one | ❌ No |
| `MOVE_CELL` (numbers) | Yes | No — value unchanged | ❌ No |

**Rationale**: Calling `withAutoAccomplish` only where needed keeps the code explicit and avoids unnecessary array scans (even though they are O(72) and free in practice).

**Alternatives considered**:
- Call `withAutoAccomplish` in all cases — rejected: valid but obscures intent; a reader would wonder why clearing the grid might accomplish targets.
- Wrap `scored()` / `historical()` to always call `withAutoAccomplish` — rejected: accomplishment should only trigger on number additions, not on every state push (e.g. generator selection, operator change).

---

## Decision 3: CLAIM_TARGET removal and CSS class cleanup

**Question**: What happens to `CLAIM_TARGET` in `GameAction`, the `TargetStatus` derived type, and the CSS classes `target-available` / `target-pending`?

**Context**: `CLAIM_TARGET` is currently a named action in `types.ts` dispatched by `TargetList`. The derived `TargetStatus` type (`'pending' | 'available' | 'accomplished'`) lives only in `TargetList.tsx`. CSS classes `target-pending` and `target-available` exist in the stylesheet.

**Decision**:
- **Remove** `{ type: 'CLAIM_TARGET'; targetValue: number }` from the `GameAction` union in `types.ts`.
- **Remove** the `CLAIM_TARGET` case from `reducer.ts`.
- **Remove** the `TargetStatus` type and `getStatus()` function from `TargetList.tsx`.
- **Remove** the `numbersGrid` and `dispatch` props from `TargetList` (no longer needed).
- **Keep** `target-pending` and `target-accomplished` CSS classes; **remove** `target-available` CSS class from the stylesheet (dead style).
- Render targets as non-interactive `<span>` elements inside `<li>` (or plain `<li>` text) — no `<button>`.

**Rationale**: Dead code must not be committed (Constitution I). Removing `CLAIM_TARGET` from the type union gives a compile-time guarantee that no code can accidentally dispatch it. Removing `target-available` from CSS eliminates an unused rule.

**Alternatives considered**:
- Keep `CLAIM_TARGET` as a no-op — rejected: dead code violates Constitution I; TypeScript callers would still compile with it, masking accidental usage.
- Keep `TargetList` as a button-rendering component with `onClick` set to `undefined` — rejected: semantically incorrect; non-interactive items should not be `<button>` elements (accessibility concern).
