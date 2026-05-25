# Implementation Plan: Share Game URL

**Branch**: `007-share-url` | **Date**: 2026-05-25 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/007-share-url/spec.md`

## Summary

Add a share icon to the ScoreRow that copies a URL encoding the current target numbers to the player's clipboard, and make App.tsx parse that URL on load to bypass the setup screen when valid targets are present. The URL uses the hash fragment (`#targets=…`) so no server round-trip is needed. All logic is encapsulated in a new `src/utils/shareUrl.ts` module; `ScoreRow`, `GameBoard`, and `App` receive minimal, focused changes.

## Technical Context

**Language/Version**: TypeScript ~6.0 / React 19

**Primary Dependencies**: React 19, Vite 8 (build), Vitest 3 + @testing-library/react 16 (tests)

**Storage**: N/A — client-side URL hash fragment only; no server storage

**Testing**: Vitest + @testing-library/react; `npm test` / `npm run test:coverage`

**Target Platform**: Browser (mobile-first, 720×1280 single-viewport)

**Project Type**: Browser-based game (single-page application)

**Performance Goals**: Share URL construction and clipboard write are effectively instantaneous (<5 ms). URL parsing on load is O(n) where n is the number of target values (always 8); negligible overhead on page initialisation.

**Constraints**: No new runtime dependencies; coverage must remain ≥ 80%. Clipboard API is async and may be unavailable — graceful fallback required.

**Scale/Scope**: 1 new utility file, 3 modified source files, 1 new test file, 2 modified test files; no new packages.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality — single responsibility, no dead code | ✅ Pass | `shareUrl.ts` is a pure utility with a single concern; share prop flows are minimal; no dead code introduced |
| II. Testing Standards — TDD, ≥80% coverage, integration tests per story | ✅ Pass | Failing tests written before implementation; one integration test block per user story (US1 share, US2 URL load) |
| III. UX Consistency — new interaction patterns require justification | ⚠️ See Complexity Tracking | Share + clipboard-copy-confirmation is a new interaction pattern; documented below |
| IV. Performance Requirements — measurable goals recorded, p95 < 200 ms | ✅ Pass | Both operations are sub-millisecond; documented above |
| Dev Workflow — feature branch `###-feature-name` | ✅ Pass | Branch `007-share-url` |

**Post-design re-check**: No new external dependencies. Confirmation feedback uses a short-lived CSS state change (no overlay), consistent with the game's minimal UI. Complexity Tracking entry added for Principle III.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| New interaction pattern: share icon + clipboard copy + inline "Copied!" confirmation | Sharing a game configuration is a fundamentally social action with no existing analog in the game. Copy-to-clipboard with transient confirmation is the dominant platform-native pattern for this use case across web, iOS, and Android — users expect it. | A modal dialog or manual text selection would require extra user steps; a server-generated short URL would add unnecessary infrastructure. The pattern is universally understood and requires no learning. |

## Project Structure

### Documentation (this feature)

```text
specs/007-share-url/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── utils/
│   └── shareUrl.ts          # NEW — encode/decode/clipboard logic (pure functions)
├── components/
│   ├── ScoreRow.tsx          # MODIFIED — add share button + onShare prop
│   └── GameBoard.tsx         # MODIFIED — pass onShare handler to ScoreRow
└── App.tsx                   # MODIFIED — parse hash on mount; skip setup if valid

tests/
├── unit/
│   ├── utils/
│   │   └── shareUrl.test.ts  # NEW — unit tests for URL encoding, decoding, validation
│   └── components/
│       └── ScoreRow.test.tsx  # MODIFIED — add share button tests
└── integration/
    └── story6-share-url.test.tsx  # NEW — US1 share flow; US2 URL-load flow
```

**Structure Decision**: Single-project SPA; `src/utils/` already the natural home for framework-agnostic pure functions. No new projects or packages needed.
