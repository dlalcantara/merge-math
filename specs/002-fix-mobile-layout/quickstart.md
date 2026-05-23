# Quickstart: Merge Math Development

**Branch**: `002-fix-mobile-layout`

---

## Prerequisites

- Node.js 20+
- npm 10+

## Install

```bash
npm install
```

## Run dev server

```bash
npm run dev
# → http://localhost:5173
```

## Test mobile viewport

In Chrome DevTools: open Device Toolbar, set custom size **720 × 1280**, confirm no horizontal scrollbar and all UI fits without vertical scrolling.

## Run tests

```bash
npm test                  # single run
npm run test:watch        # watch mode
npm run test:coverage     # with coverage report
```

Coverage threshold: 80% lines/branches across all modules (enforced in CI).

## Lint & type-check

```bash
npm run lint
npm run typecheck
```

## Build

```bash
npm run build
# output → dist/
```

---

## Key source files for this feature

| File | Purpose |
|------|---------|
| `src/styles/game.css` | All game-specific CSS — viewport, layout, cells |
| `src/App.tsx` | Top-level conditional: SetupScreen vs GameBoard |
| `src/components/SetupScreen.tsx` | Pre-game target number entry form |
| `src/components/GameBoard.tsx` | Reordered layout using new section components |
| `src/components/ScoreRow.tsx` | Score + Undo in one row |
| `src/components/NumbersSection.tsx` | Numbers grid + grid-local action buttons |
| `src/components/GeneratorsSection.tsx` | Generators grid + grid-local action buttons |
| `src/engine/gameState.ts` | `generateInitialState(targets?)` — accepts custom targets |
| `src/hooks/useGame.ts` | Passes confirmed targets to `generateInitialState` |

## UI Interaction Patterns (reused from existing design)

- **Buttons**: `<button>` with `.action-buttons button` class styling
- **Validation errors**: Inline `<span role="alert">` below invalid `<input>` fields
- **Disabled state**: `disabled` attribute + `opacity: 0.4` (existing pattern)
- **Grid cells**: `aspect-ratio: 1`, `width: 100%`, `background: var(--color-cell-bg)`
