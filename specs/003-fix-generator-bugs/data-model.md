# Data Model: Fix Generator Bugs

**Date**: 2026-05-23 | **Branch**: `003-fix-generator-bugs`

---

No data model changes. The existing `GameState` type and all related types remain unchanged.

## Existing entities (unchanged)

| Entity | Type | Notes |
|--------|------|-------|
| `GameState.generatorsGrid` | `CellValue[]` (length 4) | Holds generator cell values; merge behavior corrected in reducer |
| `GameState.selectedGeneratorsIdx` | `number \| null` | Index of selected generator; now preserved after GENERATE_NUMBER |
| `GameState.numbersGrid` | `CellValue[]` (length 9) | Unchanged |
| `GameState.actionScore` | `number` | Incremented by both fixed actions as before |

## State transition corrections

### MERGE_CELLS (sourceGrid: 'generators')

| Field | Before (buggy) | After (fixed) |
|-------|----------------|---------------|
| `generatorsGrid[sourceIdx]` | set to `null` ✓ | set to `null` ✓ |
| `generatorsGrid[targetIdx]` | `applyOperator(sourceVal, numbersGrid[targetIdx])` ❌ | `applyOperator(sourceVal, generatorsGrid[targetIdx])` ✓ |
| `selectedGeneratorsIdx` | `null` ✓ | `null` ✓ |
| `actionScore` | `+1` ✓ | `+1` ✓ |

### GENERATE_NUMBER

| Field | Before (buggy) | After (fixed) |
|-------|----------------|---------------|
| `numbersGrid[firstEmptyIdx]` | generator value ✓ | generator value ✓ |
| `selectedGeneratorsIdx` | `null` ❌ | preserved (current value) ✓ |
| `actionScore` | `+1` ✓ | `+1` ✓ |
