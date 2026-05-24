# Quickstart: v0.3.0 Game Enhancements

**Feature**: `005-v030-game-enhancements` | **Date**: 2026-05-24

## Overview

Five mechanics land in this release: Convert Number to Generator, simplified generator re-selection (no merge), Reset Generators Grid (with undo), three-state target display, and 8 curated tutorial targets with a Randomize button.

## Dev Setup

```bash
npm install          # if not already done
npm test             # run all existing tests — must stay green throughout
npm run dev          # start dev server for manual verification
npm run test:coverage  # verify coverage stays ≥ 80%
```

## File Map

| File | Change |
|------|--------|
| `src/engine/types.ts` | Add `Target` interface; add `CONVERT_TO_GENERATOR`, `RESET_GENERATORS_GRID`; remove `GENERATE_GENERATOR`, `CLEAR_GENERATORS_GRID`; change `targets: number[]` → `targets: Target[]` |
| `src/engine/reducer.ts` | Add `historical()` helper; `CONVERT_TO_GENERATOR` case; `RESET_GENERATORS_GRID` case; updated `CLAIM_TARGET`; remove `GENERATE_GENERATOR` case |
| `src/engine/gameState.ts` | Fixed 8-target default; `generateRandomTargets()`; remove old `generateTargets()` |
| `src/components/NumbersSection.tsx` | Add Convert to Generator button + `onConvertToGenerator` / `convertDisabled` props |
| `src/components/GeneratorsSection.tsx` | Remove Generate Generator button and related props |
| `src/components/TargetList.tsx` | Three-state rendering; add `numbersGrid` prop |
| `src/components/GameBoard.tsx` | Updated handlers; win condition; prop wiring |
| `src/components/SetupScreen.tsx` | 8 inputs; fixed defaults; Randomize button |

## Implementation Order (TDD)

Follow this sequence — each step has a failing test first.

### Step 1 — Engine types (`types.ts`)
1. Write failing tests in `reducer.test.ts` for `CONVERT_TO_GENERATOR` and `RESET_GENERATORS_GRID`
2. Update `types.ts`: add `Target`, add new actions, remove old actions, change `targets` field
3. Fix compile errors across all files that reference `targets` or removed action types

### Step 2 — `gameState.ts`
1. Write failing tests in `gameState.test.ts`: fixed default list, `generateRandomTargets()` range/count
2. Replace `generateTargets()` with `generateRandomTargets()` and `DEFAULT_TARGETS`
3. Update `generateInitialState()` to produce `Target[]`

### Step 3 — Reducer
1. Write failing unit tests for each new/modified case
2. Add `historical()` helper
3. Implement `CONVERT_TO_GENERATOR`, `RESET_GENERATORS_GRID`, updated `CLAIM_TARGET`
4. Remove `GENERATE_GENERATOR` case

### Step 4 — `TargetList.tsx`
1. Write failing unit tests for three-state rendering and click behaviour
2. Update `TargetList` props to accept `Target[]` and `numbersGrid`
3. Derive `status` at render; apply CSS classes; make only `available` targets clickable

### Step 5 — `NumbersSection.tsx`
1. Write failing unit tests for Convert to Generator button presence and disabled state
2. Add `onConvertToGenerator` and `convertDisabled` props; add button in correct toolbar position

### Step 6 — `GeneratorsSection.tsx`
1. Write failing unit tests asserting no Generate Generator button
2. Remove `onGenerateGenerator` / `generateDisabled` props and button from render

### Step 7 — `GameBoard.tsx`
1. Write failing integration tests for each user story
2. Update `handleGeneratorsCellClick` (re-select instead of merge)
3. Update `handleClearGenerators` → `handleResetGenerators` (RESET_GENERATORS_GRID)
4. Add `handleConvertToGenerator` (CONVERT_TO_GENERATOR, disabled when no selection)
5. Update win condition; update all prop passing; pass `numbersGrid` to `TargetList`

### Step 8 — `SetupScreen.tsx`
1. Write failing unit tests: 8 inputs, fixed defaults, Randomize button
2. Change array size to 8, change initial values, add Randomize button

### Step 9 — Full suite
```bash
npm test             # all tests green
npm run test:coverage  # coverage ≥ 80%
npm run typecheck    # no type errors
npm run lint         # no lint errors
```

## Key Behaviours to Verify Manually

After `npm run dev`, open the game and confirm:

| Action | Expected result |
|--------|----------------|
| Load game fresh | Exactly 8 targets displayed: 1, 2, 5, 12, 25, 67, 69, −420 |
| Click Randomize on setup screen | 8 new random targets replace the list |
| Select a number, click "Convert to Generator" | Number disappears from Numbers Grid; appears in Generator Grid; action score +1 |
| No number selected — inspect "Convert to Generator" | Button is visually disabled |
| Undo after Convert to Generator | Number returns to Numbers Grid; generator removed; score −1 |
| Select Generator A, click Generator B | Selection moves to B; no merge; score unchanged |
| Click "Reset Generators Grid" | Confirmation prompt appears |
| Confirm reset | All generators cleared; one generator (value 1) created; score +1 |
| Cancel reset | Generator Grid unchanged |
| Undo after reset | Prior generators restored; score −1 |
| Add a number matching a target | That target displays in "Available" style |
| Click an Available target | Target moves to Accomplished; number stays in grid; score unchanged |
| Undo after clicking target | Target reverts to Available (if number still present) |
| All targets Accomplished | Win modal appears |
| "Generate Generator" button | NOT present anywhere in the UI |

## Invariants to Assert

- `selectedNumbersIdx` and `selectedGeneratorsIdx` cannot both be non-null (unchanged invariant from 004).
- `targets` always has exactly 8 entries; none are ever removed, only `.accomplished` changes.
- `generatorsGrid` always has at least one non-null slot after a `RESET_GENERATORS_GRID` (value 1 at index 0).
- `CONVERT_TO_GENERATOR` is a no-op when `selectedNumbersIdx` is null or generatorsGrid is full.
