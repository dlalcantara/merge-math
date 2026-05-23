# Quickstart: Merge Math Development

**Branch**: `003-fix-generator-bugs`

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

## Run tests

```bash
npm test
```

## Run tests with coverage

```bash
npm run test:coverage
# Coverage report written to ./coverage/
```

## Verify the fixes manually

1. Start the dev server (`npm run dev`).
2. **Bug 1 — Generators Grid merge**: Place two generators (use "Generate Generator" twice). Select one, click the other. Verify the result cell shows the sum (with operator `+`) and the source cell disappears.
3. **Bug 2 — Selection preserved after generate**: Select a generator. Click it to copy its value to the Numbers Grid. Verify the generator cell is still highlighted (selected). Click it again — it should copy the value again without requiring a re-select.

## Lint

```bash
npm run lint
```

## Type check

```bash
npm run typecheck
```
