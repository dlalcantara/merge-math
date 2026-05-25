# Data Model: Share Game URL

**Feature**: `007-share-url` | **Date**: 2026-05-25

## Overview

This feature introduces no new persistent data structures. It adds two pure transformations over the existing `Target[]` type and URL strings, encapsulated in `src/utils/shareUrl.ts`.

---

## Entities

### ShareConfig (value object, not stored)

Represents the game configuration encoded in a shareable URL. Not stored anywhere — it is derived on-the-fly from `Target[]` when sharing, and parsed from `window.location.hash` on load.

| Field     | Type       | Constraint                                      |
|-----------|------------|-------------------------------------------------|
| `targets` | `number[]` | Exactly 8 elements; each a finite integer       |

**Derivation from game state**: `ShareConfig.targets = current.targets.map(t => t.value)`

---

## URL Structure

```
<scheme>://<host><path>#targets=<value>,<value>,...,<value>
```

**Example**:
```
https://example.com/#targets=1,2,5,12,25,67,69,-420
```

- **Scheme + host + path**: Taken verbatim from `window.location.href` (minus any existing hash), so the URL always points to the same page.
- **Hash key**: `targets` (literal string).
- **Hash value**: 8 integers separated by commas. Negative integers include their sign (`-420`). No spaces. No URL-encoding needed for commas or minus signs in the fragment.

---

## Transformations

### `encodeTargets(targets: number[]): string`

Produces the hash fragment string.

```
Input:  [1, 2, 5, 12, 25, 67, 69, -420]
Output: "#targets=1,2,5,12,25,67,69,-420"
```

### `parseTargets(hash: string): number[] | null`

Parses and validates a hash fragment. Returns `null` on any validation failure.

**Validation sequence**:
1. Hash must start with `#targets=`.
2. After stripping the prefix, split on `,` — must yield exactly 8 parts.
3. Each part must parse to a finite integer (`Number(part)` is an integer and finite).
4. Return the 8 numbers on success; `null` on any failure.

### `buildShareUrl(targets: number[]): string`

Constructs the full shareable URL.

```
Input:  current.targets.map(t => t.value)
Output: window.location.origin + window.location.pathname + encodeTargets(targets)
```

Note: `window.location.origin + window.location.pathname` strips any existing hash cleanly.

### `copyToClipboard(text: string): Promise<'success' | 'fallback'>`

Wraps `navigator.clipboard.writeText`. Returns `'success'` if the write succeeds; `'fallback'` if the Clipboard API is unavailable or throws. The caller renders the appropriate confirmation UI.

---

## State Changes

### `ScoreRow` local state addition

```ts
const [copyState, setCopyState] = useState<'idle' | 'copied' | 'fallback'>('idle')
```

- `'idle'`: Default; share button shows share icon.
- `'copied'`: Clipboard write succeeded; button shows "Copied!" for 2 s, then reverts to `'idle'`.
- `'fallback'`: Clipboard API unavailable; a textarea showing the URL is rendered inline until the user dismisses it.

### `App.tsx` initialisation logic

```ts
const parsed = parseTargets(window.location.hash)
const [phase, setPhase] = useState<'setup' | 'playing'>(parsed ? 'playing' : 'setup')
const [confirmedTargets, setConfirmedTargets] = useState<Target[] | null>(
  parsed ? parsed.map(value => ({ value, accomplished: false })) : null
)
```

No other state changes. The hash is read once at mount via `useState` initialisers; no `useEffect` needed.
