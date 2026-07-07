# Development Plan

## Phase 1: Re-stabilize System Integrations
1. Complete system reset: restore `scripts/compile-theme.mjs` to strict generation limits.
2. Document architectural constraints securely within the `.docs/` repository and Total Recall invariants.
3. Lock down `vault/pages/designs/` to prevent auto-overwrites.

## Phase 2: Engine Refactor
1. **Refactor `compile-theme.mjs`**: Remove the global file overwriting. Route all generative output into isolated `designs/[slug]/` folders.
2. **Implement Google Standard**: Ensure the engine outputs the canonical `DESIGN.md` spec file inside each isolated folder.
3. **Asset Isolation**: Save `logo.png`, `favicon.png`, `hero.jpg`, and `portrait.jpg` directly into the generated `designs/[slug]/` directory.
