# Quickstart: Merge Math Game MVP

**Branch**: `001-merge-math-game` | **Date**: 2026-05-23

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18 LTS or newer | https://nodejs.org |
| npm | 9+ (bundled with Node 18) | — |
| Git | any recent version | — |

---

## Local Development

```bash
# 1 — Install dependencies
npm install

# 2 — Start the dev server (hot module replacement enabled)
npm run dev
# Opens at http://localhost:5173
```

The dev server uses Vite's default HMR. Changes to `src/` reload instantly without a full page refresh.

---

## Running Tests

```bash
# Run all tests once
npm test

# Watch mode (re-runs affected tests on save)
npm run test:watch

# Generate a coverage report (HTML output in ./coverage/)
npm run test:coverage
```

Coverage thresholds (enforced — CI fails if not met):
- Statements: 80%
- Branches: 80%
- Lines: 80%

Test layout:
```
tests/
├── unit/engine/         — pure reducer, operator, and target-generation logic
├── unit/components/     — isolated component snapshot / behaviour tests
└── integration/         — full GameBoard render tests, one file per user story
```

---

## Building for Production

```bash
npm run build
# Output in ./dist/
```

The build sets `base: '/merge-math/'` in `vite.config.ts` so all asset paths are correct for GitHub Pages deployment at `https://<user>.github.io/merge-math/`. Change this value if the repo name differs.

To preview the production build locally:
```bash
npm run preview
# Serves ./dist/ at http://localhost:4173/merge-math/
```

---

## Deploying to GitHub Pages

### Automatic (GitHub Actions — recommended)

Push to `main`. The workflow at `.github/workflows/deploy.yml` runs `npm run build` and publishes `./dist` to the `gh-pages` branch automatically.

### Manual

```bash
npm run build
npx gh-pages -d dist
```

Then enable GitHub Pages in the repo Settings → Pages → Source: `gh-pages` branch, `/` (root).

---

## Project Layout (quick reference)

```
src/
├── engine/
│   ├── types.ts          # All shared TypeScript types
│   ├── gameState.ts      # Initial state factory + target generation
│   ├── operators.ts      # Pure arithmetic functions
│   └── reducer.ts        # Pure game state reducer
├── hooks/
│   └── useGame.ts        # React hook — GameStore + dispatch
├── components/
│   ├── GameBoard.tsx     # Root game component
│   ├── Grid.tsx          # Reusable grid renderer
│   ├── Cell.tsx          # Single cell
│   ├── OperatorSelector.tsx
│   ├── TargetList.tsx
│   ├── ScoreDisplay.tsx
│   ├── ActionButtons.tsx
│   └── WinModal.tsx
├── styles/game.css
└── main.tsx
```

---

## Key Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server at `localhost:5173` |
| `npm test` | Run all tests once |
| `npm run test:watch` | Test watch mode |
| `npm run test:coverage` | Tests + coverage report |
| `npm run build` | Production build → `./dist` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript type check (no emit) |
