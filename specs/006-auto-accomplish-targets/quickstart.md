# Quickstart: Auto-Accomplish Targets

**Feature**: `006-auto-accomplish-targets` | **Date**: 2026-05-24

## What changes

The target lifecycle is simplified from three states to two:

| Before | After |
|--------|-------|
| Not yet accomplished → Available (click) → Accomplished | Not yet accomplished → Accomplished (automatic) |
| `TargetList` renders clickable `<button>` elements | `TargetList` renders non-interactive `<span>` elements |
| `CLAIM_TARGET` action dispatched by player click | No player action; reducer auto-accomplishes on number match |
| `target-pending`, `target-available`, `target-accomplished` CSS | `target-pending`, `target-accomplished` CSS only |

## Running the project

```bash
npm install          # first time only
npm run dev          # start dev server (Vite)
npm test             # run all tests (Vitest)
npm run test:coverage
```

## Key files for this feature

| File | Change |
|------|--------|
| `src/engine/types.ts` | Remove `CLAIM_TARGET` from `GameAction` |
| `src/engine/reducer.ts` | Add `withAutoAccomplish()`; apply to 3 cases; remove `CLAIM_TARGET` case |
| `src/components/TargetList.tsx` | Remove `numbersGrid` + `dispatch` props; render non-interactive items |
| `src/components/GameBoard.tsx` | Remove `numbersGrid` + `dispatch` from `<TargetList>` JSX |

## Implementation pattern

### `withAutoAccomplish` (new helper in reducer)

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

Call it by wrapping the next state before passing to `scored()`:

```ts
// Example: GENERATE_NUMBER
return scored(store, withAutoAccomplish({ ...current, numbersGrid: nums }))
```

### Undo behaviour

No special undo handling needed. Auto-accomplish is bundled inside the same `scored()` call as the triggering action. `UNDO` restores `history[history.length - 1]`, which is the state **before** the action ran — so target reverts automatically.

### TargetList rendering (simplified)

```tsx
// After: no numbersGrid, no dispatch, no button, no available state
export function TargetList({ targets }: { targets: Target[] }) {
  return (
    <ol className="target-list" aria-label="Targets">
      {targets.map(target => (
        <li key={target.value}>
          <span className={target.accomplished ? 'target-accomplished' : 'target-pending'}>
            {target.value}
          </span>
        </li>
      ))}
    </ol>
  )
}
```

## Test strategy

Write failing tests first (TDD), then implement:

1. **`reducer.test.ts`** — unit tests for `withAutoAccomplish` behaviour inside `GENERATE_NUMBER`, `MERGE_CELLS`, `MERGE_ALL_NUMBERS`; undo reverts auto-accomplished target
2. **`TargetList.test.tsx`** — unit tests for two-state rendering; no button/click tests
3. **`story2-target-completion.test.tsx`** — integration test: generate number → target auto-accomplishes; undo reverts; all accomplished → win modal
