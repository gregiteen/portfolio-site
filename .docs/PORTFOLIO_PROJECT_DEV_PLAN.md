# PORTFOLIO_PROJECT_DEV_PLAN

## Phase 1: Re-stabilize System Integrations
1. Complete system reset: restore `scripts/compile-theme.mjs` to strict generation limits.
2. Document architectural constraints securely within the `.docs/` repository and Total Recall invariants.
3. Lock down `vault/pages/designs/` to prevent auto-overwrites.

## Phase 2: Engine Refactor
1. **Refactor `compile-theme.mjs`**: Remove the global file overwriting. Route all generative output into isolated `designs/[slug]/` folders.
2. **Implement Google Standard**: Ensure the engine outputs the canonical `DESIGN.md` spec file inside each isolated folder.
3. **Asset Isolation**: Save `logo.png`, `favicon.png`, `hero.jpg`, and `portrait.jpg` directly into the generated `designs/[slug]/` directory.
4. **Bespoke Asset Prompts**: Refactor `compile-theme.mjs` to include a critique-and-plan pass before image generation to construct unique logo/hero prompts.
5. **Portrait Identity Preservation**: Hardcode the canonical `greg-portrait-source.png` reference and lock the portrait prompt to the strict A/B tested identity-preserving formula.

## Phase 3: B&W Agency Splash + Verify
1. Build B&W treatment (grayscale/contrast filter + SVG film-grain).
2. Rebuild `splash.html` and `verify.html` in B&W Archivo Black style.
3. Restyle cookie bar and error states to monochrome.
4. Finalize mobile (375px) and desktop (1280px+) passes.
5. Create monochrome logo/favicon treatment.

## Phase 4: Email Suite (Matches UI)
1. Establish `emailShell()` shared B&W template in `serve.mjs`.
2. Restyle 2FA email, confirmation email, and owner-alert email.
3. Perform deliverability check (Gmail + one other client, light/dark, DMARC aligned).

## Phase 5: Visitor Memory + Workflows
1. Establish `.data/sessions.json` and 30-day token persistence.
2. Build visitor profile tracking (style/visits) and first-visit email gates.
3. Wire `serve.mjs` steps to the `on-visitor.md` workflow doc.

## Phase 6: 3D Design Transitions
1. Implement `@view-transition` cross-page fades with perspective.
2. Wrap theme-pill switches in `startViewTransition` with 3D rotateX/blur morphs.
3. Build designs gallery animated switching.

## Phase 7: Analyze & Improve Gates
1. Gate A (pre-submit): `npm test` green, full build clean, fix findings.
2. Gate B (post-deploy): silent refresh, console/network audit, fix findings.
3. Final sweep: broken links, meta/OG tags, 404s.
