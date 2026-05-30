# Quickstart: Merge All Numbers — Subtraction & Division Support

**Branch**: `009-merge-all-subtraction-division`

## What changed

"Merge All Numbers" now works with all four operators. Previously it was disabled (and a no-op in the reducer) when the active operator was `-` or `/`.

## Running the tests

```bash
# Run the full test suite
npm test

# Watch mode during development
npm run test:watch

# Coverage report (must stay ≥ 80%)
npm run test:coverage
```

## Verifying the feature manually

```bash
npm run dev
```

1. Open the app in your browser.
2. Generate some numbers onto the Numbers Grid (e.g., generate 12, 3, 2).
3. Switch the operator to **÷** using the operator selector.
4. Click **Merge All Numbers** — the button should now be **enabled** and the grid should collapse to a single result (12 ÷ 3 = 4, then 4 ÷ 2 = 2 → result: **2**).
5. Press **Undo** — the three numbers should reappear.
6. Switch to **−** and click **Merge All Numbers** — result should be 12 − 3 = 9, then 9 − 2 = 7 → **7**.
7. Verify addition and multiplication still work as before.

## Key files

| File | Role |
|------|------|
| `src/engine/reducer.ts` | `MERGE_ALL_NUMBERS` case — operator guard removed |
| `src/components/ActionButtons.tsx` | `canMergeAll` — operator restriction removed |
| `src/components/GameBoard.tsx` | `canMergeAll` — operator restriction removed |
| `tests/unit/engine/reducer.test.ts` | Unit tests for all four operator paths |
| `tests/integration/story4-bulk-operations.test.tsx` | Integration tests for button state and merge results |

## Edge cases to verify

- **Single number on grid**: "Merge All Numbers" remains disabled regardless of operator.
- **Division by zero in sequence**: e.g., grid [10, 0, 5] with `/` → result is 0 (not an error).
- **Negative results with subtraction**: e.g., grid [2, 10] with `-` → result is −8.
