# PORTFOLIO_PROJECT_PRD

## 1. Goal
Provide a local, file-native portfolio site that is infinitely re-skinnable via an AI design engine.

## 2. Core Features
- **AI Theme Generator**: Generates a single, global theme consisting of a `DESIGN.md` spec and a set of core assets (logo, favicon, hero, portrait).
- **Stateless Infrastructure**: Zero databases. Everything is driven by markdown files in the `vault/pages` directory.
- **B&W Agency Splash Page**: High-contrast, Archivo Black display, grayscale/contrast hero with film-grain overlay, acting as the primary entry point.
- **Drip Campaign Daemon**: An integrated daemon running within `serve.mjs` to auto-dispatch sequence emails using SMTP2GO/Mailcow without external crons.
- **UI-Matched Email Suite**: All outbound emails (2FA, confirmation, owner alerts) must visually match the B&W UI via a shared `emailShell()` template.
- **Lead Generation & Visitor Memory**: A 2FA code verification system (`/api/send-code`) that captures opt-ins for the marketing loop. Uses local atomic JSON and 30-day tokens to track sessions, ensuring first-visit-only triggers for the welcome email.
- **3D Design Transitions**: Uses the View Transitions API for 3D cross-page morphs (rotateX/blur) when flipping between generated themes.

## 3. Strict Constraints
- Generate an isolated folder for each requested theme (e.g., `designs/[slug]/`).
- Inside that folder, compile exactly one set of HTML files, one logo, one favicon, one hero image, and one portrait image.
- **Image Generation Constraints**: The generation pipeline MUST run a planning phase to generate bespoke image prompts for logos and heroes that match the design brief. Do NOT use generic monogram fallbacks.
- **Bio Photo Constraints**: The portrait generation MUST strictly use the canonical `assets/greg-portrait-source.png` high-res photo, enforcing identity preservation via the A/B tested prompt formula. NEVER use `assets/greg-portrait-base.jpg`.
- **Design Philosophy**: EVERYTHING MUST BE COMPLETELY DIFFERENT. Themes must not look generic or similar. Each theme must be generated using a unique `DESIGN.md` spec to enforce radically different aesthetics, layouts, and typography across generations.
- Drop a `DESIGN.md` (the Google Standard) directly into that folder. It must use standard frontmatter (`name`, `accent`, `style`) and a `# Design System` markdown body.
- Do NOT use or generate `theme-[id]` or `design-[id]` files. The site relies entirely on isolated folders, not global CSS hot-swapping or theme pills.
- **Vault Namespace Separation**: The AI Theme Generator outputs its spec files to `vault/pages/designs/`. However, the user's ACTUAL manual HTML graphic design projects (e.g. `high-stakes-field-day.md`) also reside in this exact directory. The system MUST NEVER overwrite, delete, or mistake the user's manual showcase projects for AI-generated themes.
- **Full Site Builds**: When the AI builds an isolated theme (`--design [slug]`), it MUST rebuild the ENTIRE portfolio site, perfectly carrying over all copy, metadata, and files from both `vault/pages/projects` and the manual entries in `vault/pages/designs`. An isolated theme is a full reskin of the entire application, not a single page.
