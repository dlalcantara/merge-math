# Phase 1 Data Model: Help Modal & AI Disclaimer

**Feature**: 008-help-modal-disclaimer
**Date**: 2026-05-30

## Overview

This feature introduces no persistent data, no game-state entities, no reducer actions, and no network payloads. The only modeled "data" is static UI copy and a single piece of transient component state.

## Static Content Entity: HelpContent

Stored in `src/content/helpContent.ts` as plain exported string constants.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `helpIntroTitle` | `string` | Heading shown above the "How to Play" section. | Short, ≤ 30 chars. Used as `aria-labelledby` target. |
| `helpIntroBody` | `string` | Plain-language introduction explaining the goal and how to make a basic move. Paragraphs separated by `\n\n`. | 80–150 words (per SC-003). |
| `helpDisclaimerTitle` | `string` | Heading for the AI/attribution section. | Short, ≤ 30 chars. |
| `helpDisclaimerBody` | `string` | Disclaimer text. Must convey: (a) Claude was used for programming only, (b) design is original, (c) no AI-generated art assets. | One short paragraph, ≤ 60 words. |

**Validation**: Compile-time only — TypeScript ensures all four exports exist and are strings. There is no runtime validation; copy is authored, not user-supplied.

**State transitions**: None. Content is immutable at runtime.

## Transient UI State: ScoreRow.isHelpOpen

Local React state inside `ScoreRow.tsx`.

| Field | Type | Initial | Purpose |
|-------|------|---------|---------|
| `isHelpOpen` | `boolean` | `false` | Controls whether `<HelpModal>` is mounted/visible. |

**Transitions**:

| From | Event | To |
|------|-------|-----|
| `false` | User clicks `?` button or activates it via keyboard | `true` |
| `true` | User clicks close button | `false` |
| `true` | User presses Escape inside dialog | `false` |
| `true` | User clicks on the dialog backdrop | `false` |

No persistence — state resets to `false` on any full page reload.

## Relationships

`HelpModal` consumes `HelpContent` directly via import. `ScoreRow` owns `isHelpOpen` and conditionally renders `HelpModal`. There are no other consumers and no shared state.

```text
helpContent.ts ──imports──> HelpModal.tsx ──rendered by──> ScoreRow.tsx
                                                           (owns isHelpOpen)
```

## Key Entities Cross-Reference (from spec)

| Spec entity | Implementation |
|-------------|----------------|
| **Help Content** | `helpContent.ts` exports (four string constants). |
| **Help Modal** | `HelpModal.tsx` component using native `<dialog>` element. |
