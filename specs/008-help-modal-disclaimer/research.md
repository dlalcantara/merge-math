# Phase 0 Research: Help Modal & AI Disclaimer

**Feature**: 008-help-modal-disclaimer
**Date**: 2026-05-30
**Status**: Complete — no unresolved `NEEDS CLARIFICATION` markers remain

## Unknowns Extracted from Technical Context

None. Every field in the plan's Technical Context is concretely populated from the existing codebase (React 19, Vite 8, Vitest 3, browser SPA, 320 px min viewport).

## Research Topics

### R1. Modal implementation approach (native `<dialog>` vs. custom overlay)

**Decision**: Use the native HTML `<dialog>` element with `dialog.showModal()`, exactly mirroring `src/components/WinModal.tsx`.

**Rationale**:
- The project already ships a working dialog pattern in `WinModal.tsx` — focus trap, Escape-to-close, top-layer rendering, `::backdrop` styling, `aria-modal="true"`. Reusing it satisfies constitution Principle III (UX Consistency) without introducing a new interaction pattern.
- `<dialog>` provides browser-native modality (inert background, top-layer, backdrop) — no JavaScript-based scroll lock or portal layer required.
- Browser support across the project's target platforms (modern mobile + desktop, the same surface that already runs `WinModal`) is universal.
- Zero new dependencies — meets the "no new runtime dependencies" constraint.

**Alternatives considered**:
- **Custom `<div role="dialog">` with portal**: Rejected — would require hand-rolled focus management, scroll lock, and backdrop, duplicating what `<dialog>` provides natively and diverging from the existing `WinModal` pattern.
- **Headless UI / Radix Dialog**: Rejected — adds a runtime dependency for behavior the project already has. The constitution flags adding dependencies as needing justification, and there is none here.

### R2. Where the help icon lives

**Decision**: Add the `?` button inside the existing `ScoreRow`, positioned next to the existing Share (`🔗`) and Undo buttons. `ScoreRow` owns the `isHelpOpen` boolean state and renders the `<HelpModal>` adjacent to its buttons.

**Rationale**:
- `ScoreRow` is the natural home for game-chrome controls — it already contains Share and Undo (see [ScoreRow.tsx](../../src/components/ScoreRow.tsx)).
- The help button is visually paired with other meta-controls (Share/Undo), reinforcing discoverability (SC-001: locate within 10 s).
- Local state in `ScoreRow` keeps `GameBoard` unchanged for this feature — minimum blast radius. The modal does not need cross-component state.
- `<dialog>.showModal()` renders into the browser top-layer regardless of DOM nesting, so rendering inside `ScoreRow` does not impose any layout coupling.

**Alternatives considered**:
- **Lift state to `GameBoard`**: Rejected — no other component needs to know whether the help modal is open; lifting adds prop drilling for no benefit.
- **Place the help icon outside `ScoreRow` (e.g., page corner)**: Rejected — would introduce a new chrome surface and break the established control grouping in `ScoreRow`.

### R3. How help copy is stored

**Decision**: Export plain string constants from a new `src/content/helpContent.ts` module:
- `helpIntroTitle`, `helpIntroBody` (the "How to Play" section)
- `helpDisclaimerTitle`, `helpDisclaimerBody` (the AI / attribution section)

`HelpModal.tsx` imports these and renders them.

**Rationale**:
- Satisfies FR-009: copy is in a single location, and edits do not touch UI code.
- Plain TS module is the lightest viable approach — no JSON parsing, no build-step indirection.
- Centralizing copy in `src/content/` leaves a clean future seam for localization (out of scope for v1, per Assumptions).
- Body text is paragraph-level prose; storing it as a string (with `\n\n` between paragraphs) keeps the module trivial. The component splits paragraphs at render time.

**Alternatives considered**:
- **Inline JSX in `HelpModal.tsx`**: Rejected — couples copy edits to component edits, working against FR-009.
- **Markdown file + parser**: Rejected — overkill for ~150 words of static copy; would require a markdown dependency.

### R4. Accessibility approach

**Decision**: Follow the `WinModal` pattern verbatim — `<dialog aria-modal="true">` with `aria-labelledby` pointing at the intro heading, an explicit close button as the first focusable element, focus moved to the modal on open, focus restored to the `?` trigger on close, Escape closes, click-outside (on the backdrop) closes.

**Rationale**:
- Mirrors an existing accessible component in the same codebase, so reviewers can verify by comparison.
- Native `<dialog>` plus `aria-modal="true"` gives screen readers correct dialog semantics.
- Focus restoration to the trigger is a WCAG 2.1 AA expectation (constitution Principle III).
- The intro heading provides a stable label for screen reader announcement, avoiding a generic "dialog" label.

**Alternatives considered**:
- **`aria-label` on the dialog with no heading**: Rejected — providing a visible labelled heading is better practice and helps sighted users too.
- **Auto-open on first launch**: Rejected per spec Assumptions — discovery via the visible `?` icon is sufficient for v1; auto-open would require persistence state which is explicitly out of scope.

### R5. Mobile responsiveness at 320 px

**Decision**: Reuse the `.win-modal` CSS sizing approach in `src/styles/game.css` (max-width with viewport-relative units, vertical scroll inside the dialog when content overflows). Confirm with manual viewport resize to 320 × 568 during verification.

**Rationale**:
- `WinModal` already renders correctly on the project's smallest supported viewport — copying its sizing rules is the lowest-risk path.
- `<dialog>` content scrolls naturally when given `max-height` plus `overflow: auto`; no JS needed.
- The close button stays in the static modal chrome (outside the scrollable content region) so it remains reachable when content overflows (edge case from spec).

**Alternatives considered**:
- **Bottom-sheet variant on mobile**: Rejected — introduces a second presentation pattern for the same component; the consistent centered dialog is already proven for `WinModal`.

## Open Questions

None.

## Summary

All design questions resolve to "reuse the existing `WinModal` pattern with new content," which is the minimum-risk, constitution-aligned path. Phase 1 can proceed directly to data-model, contracts, and quickstart.
