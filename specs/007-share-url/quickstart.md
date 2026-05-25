# Quickstart: Share Game URL

**Feature**: `007-share-url` | **Branch**: `007-share-url`

## Running the App

```bash
npm run dev        # start dev server (default: http://localhost:5173)
npm test           # run all tests (vitest)
npm run test:watch # watch mode
npm run test:coverage  # coverage report
npm run build      # production build
npm run typecheck  # TypeScript check without emit
npm run lint       # ESLint
```

## Testing the Share Feature Manually

### Testing the share button

1. Start the dev server (`npm run dev`).
2. Complete setup and start a game.
3. Look for the share icon in the score row (alongside "Action Score" and "Undo").
4. Click the share icon.
5. The button should briefly show "Copied!" (≈2 s), then revert.
6. Paste the clipboard contents — you should see a URL ending in `#targets=…` with 8 comma-separated integers matching the game's targets.

### Testing URL loading

1. Take any share URL from above (e.g., `http://localhost:5173/#targets=1,2,5,12,25,67,69,-420`).
2. Open it in a new tab.
3. The game should start immediately — no setup screen — with those exact 8 target numbers shown in the target list.
4. Test an invalid URL: `http://localhost:5173/#targets=abc` → should show the setup screen normally.

### Testing the clipboard fallback

To simulate clipboard unavailability, in the browser console before clicking share:
```js
Object.defineProperty(navigator, 'clipboard', { value: undefined, writable: true })
```
Click the share icon. A textarea with the share URL should appear for manual copying.

## Key Files

| File | Role |
|------|------|
| `src/utils/shareUrl.ts` | Pure URL encode/decode/clipboard functions |
| `src/components/ScoreRow.tsx` | Renders share button; owns `copyState` |
| `src/components/GameBoard.tsx` | Passes `onShare` handler to `ScoreRow` |
| `src/App.tsx` | Parses hash on mount to skip setup screen |
| `tests/unit/utils/shareUrl.test.ts` | Unit tests for all `shareUrl` functions |
| `tests/unit/components/ScoreRow.test.tsx` | Share button unit tests |
| `tests/integration/story6-share-url.test.tsx` | End-to-end integration tests (US1, US2) |

## Architecture Summary

```
URL hash on load
        │
        ▼
    App.tsx  ──── parseTargets() ────► skip setup? ──► GameBoard (with targets)
                                           │
                                           └──► SetupScreen (normal flow)

During gameplay:
    GameBoard.tsx
        │  current.targets
        ▼
    buildShareUrl() ──► copyToClipboard() ──► ScoreRow (shows "Copied!")
```

The `shareUrl.ts` module is a pure utility — no React, no side effects beyond `navigator.clipboard`. This makes it straightforwardly unit-testable with mocked globals.
