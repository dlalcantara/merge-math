# Implementation Plan: Help Modal & AI Disclaimer

**Branch**: `008-help-modal-disclaimer` | **Date**: 2026-05-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/008-help-modal-disclaimer/spec.md`

## Summary

Add a `?` help icon to the existing `ScoreRow` (next to the Share button) that opens a modal dialog containing a short "How to Play" introduction and an AI/attribution disclaimer. The modal reuses the existing `<dialog>`-element pattern already established by `WinModal` (showModal, focus trap, Escape-to-close), so no new dependencies, no new interaction primitives, and no overlay framework are required. Copy lives in a single small content module so future edits don't touch UI code.

## Technical Context

**Language/Version**: TypeScript ~6.0 / React 19

**Primary Dependencies**: React 19, Vite 8 (build), Vitest 3 + @testing-library/react 16 (tests)

**Storage**: N/A — modal is informational only; no per-player preferences persisted (v1 does not include a "don't show again" option)

**Testing**: Vitest + @testing-library/react + @testing-library/user-event; `npm test` / `npm run test:coverage`

**Target Platform**: Browser (mobile-first, 320 px minimum viewport per spec SC-005; desktop also supported)

**Project Type**: Browser-based game (single-page application)

**Performance Goals**: Modal open/close interactions complete in a single frame (<16 ms) — well under the constitution's 200 ms p95 ceiling. No background work, network, or storage triggered.

**Constraints**:
- No new runtime dependencies.
- Coverage must remain ≥ 80% (constitution Principle II).
- WCAG 2.1 AA: keyboard-only operation, focus trap on open, focus restoration on close, dialog semantics for screen readers (constitution Principle III).
- Layout must remain usable at 320 px viewport width with no horizontal scrolling.

**Scale/Scope**: 1 new component file, 1 new content module, 1 modified component file (`ScoreRow.tsx`), CSS additions to `src/styles/game.css`, 1 new unit test file, 1 new integration test file, 1 modified unit test file.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality — single responsibility, no dead code | ✅ Pass | `HelpModal.tsx` has one concern (render help dialog); `helpContent.ts` holds copy only; no commented-out blocks introduced. |
| II. Testing Standards — TDD, ≥80% coverage, integration test per story | ✅ Pass | Failing tests authored before implementation; integration test covers US1 (open/read/dismiss) and US2 (disclaimer visible); unit test covers focus trap, escape, click-outside, and aria semantics. |
| III. UX Consistency — new interaction patterns require justification | ✅ Pass | Reuses the existing `<dialog>` + focus-trap pattern already used by `WinModal`. No new interaction pattern introduced — no Complexity Tracking entry required. |
| IV. Performance Requirements — measurable goals recorded, p95 < 200 ms | ✅ Pass | Open/close are sub-frame; no async work, no network, no storage. Documented above. |
| Dev Workflow — feature branch `###-feature-name` | ✅ Pass | Branch `008-help-modal-disclaimer`. |

**Post-design re-check**: No new dependencies. The accessibility approach (native `<dialog>` with focus trap mirroring `WinModal`) preserves consistency. No constitutional violations; Complexity Tracking section intentionally omitted.

## Project Structure

### Documentation (this feature)

```text
specs/008-help-modal-disclaimer/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── help-modal.md    # Phase 1 output — UI interaction contract
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── content/
│   └── helpContent.ts          # NEW — exported strings: introTitle, introBody, disclaimerTitle, disclaimerBody
├── components/
│   ├── HelpModal.tsx           # NEW — <dialog> wrapper rendering helpContent, focus trap, escape/close
│   └── ScoreRow.tsx            # MODIFIED — add "?" help button + local isHelpOpen state; render <HelpModal>
└── styles/
    └── game.css                # MODIFIED — add .help-modal rules mirroring .win-modal sizing & 320px responsiveness

tests/
├── unit/
│   └── components/
│       ├── HelpModal.test.tsx  # NEW — focus trap, escape, click-outside, aria-modal, content presence
│       └── ScoreRow.test.tsx   # MODIFIED — assert help button renders, click opens modal
└── integration/
    └── story7-help-modal.test.tsx  # NEW — US1 open/read/dismiss; US2 disclaimer visible in same view
```

**Structure Decision**: Single-project SPA. Components live in `src/components/`; styles in `src/styles/game.css`. A new `src/content/` directory is introduced to host plain-text copy (`helpContent.ts`) — this satisfies FR-009 ("maintainable as plain text in a single location") and keeps copy out of JSX so future copy edits or localization don't ripple into UI components.

## Complexity Tracking

> **No entries** — the design reuses the existing `WinModal` interaction pattern and introduces no constitutional deviations.
