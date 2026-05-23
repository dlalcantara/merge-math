<!-- SYNC IMPACT REPORT
Version Change: 0.0.0 → 1.0.0 (initial population — MAJOR: first concrete definition of all principles)
Modified Principles: N/A (first authored version)
Added Sections:
  - Core Principles: I. Code Quality, II. Testing Standards,
    III. User Experience Consistency, IV. Performance Requirements
  - Development Workflow
  - Governance
Removed Sections: N/A
Templates:
  - .specify/templates/plan-template.md ✅ aligns — Constitution Check gate references principle compliance; no edits required
  - .specify/templates/spec-template.md ✅ aligns — Success Criteria section supports measurable performance/UX outcomes; no edits required
  - .specify/templates/tasks-template.md ✅ aligns — test-first task ordering matches Testing Standards; performance/polish phases match Performance Requirements and Code Quality; no edits required
Deferred TODOs: none — ratification date defaulted to 2026-05-23 (first population date)
-->

# merge-math Constitution

## Core Principles

### I. Code Quality

All code MUST be readable, maintainable, and consistent with the project's established style.
Every function, module, and component MUST have a single, well-defined responsibility.
Dead code, commented-out blocks, and unused imports MUST NOT be committed to any branch.
All public interfaces MUST be documented with concise, accurate descriptions.
Code reviews are mandatory before merging; reviewers MUST explicitly verify compliance with
this principle.

**Rationale**: Readable code reduces onboarding time, lowers defect rates, and prevents technical
debt from compounding. Consistency across the codebase ensures changes remain predictable and
reviewable.

### II. Testing Standards

Tests MUST be written before implementation (TDD). A failing test MUST exist before any
production code is written for that behavior.
Every user story MUST have at least one integration test covering the primary acceptance scenario.
Unit test coverage MUST remain at or above 80% for all modules; drops below this threshold block
merging.
Tests MUST be deterministic — flaky tests MUST be fixed or removed before any branch is merged.
Contract tests MUST be maintained for all inter-service or inter-module boundaries.

**Rationale**: Test-first discipline prevents regressions, documents intent, and ensures each
feature is independently verifiable. A failing test is a specification, not a failure.

### III. User Experience Consistency

All user-facing interactions MUST follow established UI/UX patterns defined in the project's
design system or quickstart guide.
Error messages MUST be actionable — they MUST tell the user what went wrong and how to recover.
All features with a UI surface MUST meet WCAG 2.1 AA accessibility requirements.
Input validation feedback MUST appear in-context and MUST NOT be deferred to form submission
alone.
New interaction patterns MUST NOT be introduced without explicit justification documented in
the relevant `plan.md` Complexity Tracking table.

**Rationale**: Consistency lowers cognitive load. Users encountering familiar patterns make fewer
errors, require less support, and retain higher confidence in the product.

### IV. Performance Requirements

Each feature MUST define measurable performance goals before implementation begins (recorded in
`plan.md` Technical Context → Performance Goals).
p95 response time for any user-facing operation MUST remain under 200 ms under expected load.
Memory allocations MUST NOT grow unbounded; every long-running operation MUST have a defined
resource ceiling documented in the spec.
Performance regressions of more than 10% versus the prior release MUST be investigated and
resolved before shipping.
Load and stress testing MUST be part of the acceptance criteria for any feature affecting
critical paths.

**Rationale**: Undefined performance requirements invite regressions. Explicit, measurable targets
make performance a first-class deliverable rather than an afterthought discovered in production.

## Development Workflow

All work MUST originate from a feature branch following the naming convention `###-feature-name`.
Features MUST pass all linting, formatting, and test gates before a pull request is opened.
The Constitution Check in `plan.md` MUST be completed before Phase 0 research begins and
re-verified after Phase 1 design.
Complexity deviations from these principles MUST be documented in the Complexity Tracking table
of the relevant `plan.md` with a clear justification.
Every merge to `main` requires at least one approving review that explicitly confirms principle
compliance.

## Governance

This constitution supersedes all other documented practices. Where a conflict exists between
this document and any other guide, this constitution takes precedence.

Amendments require:

1. A documented rationale explaining why the change is necessary.
2. Approval from at least one other contributor.
3. A migration plan for any existing features that would be affected by the change.
4. A version bump following the semantic versioning policy below.

**Versioning policy**:
- MAJOR: Principle removed, redefined, or made incompatible with prior guidance.
- MINOR: New principle or section added; existing guidance materially expanded.
- PATCH: Clarifications, wording fixes, non-semantic refinements.

All pull requests and reviews MUST use `.specify/memory/constitution.md` as the authoritative
compliance reference. Compliance is non-negotiable; complexity MUST be justified, not assumed.

**Version**: 1.0.0 | **Ratified**: 2026-05-23 | **Last Amended**: 2026-05-23
