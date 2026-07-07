# PORTFOLIO_PROJECT_PRD

## 1. Goal
Provide a local, file-native portfolio site that is infinitely re-skinnable via an AI design engine.

## 2. Core Features
- **AI Theme Generator**: Generates a single, global theme consisting of a `DESIGN.md` spec and a set of core assets (logo, favicon, hero, portrait).
- **Stateless Infrastructure**: Zero databases. Everything is driven by markdown files in the `vault/pages` directory.
- **Drip Campaign Daemon**: An integrated daemon running within `serve.mjs` to auto-dispatch sequence emails using SMTP2GO/Mailcow without external crons.
- **Lead Generation**: A 2FA code verification system (`/api/send-code`) that captures opt-ins for the marketing loop.

## 3. Strict Constraints
- Generate an isolated folder for each requested theme (e.g., `designs/[slug]/`).
- Inside that folder, compile exactly one set of HTML files, one logo, one favicon, one hero image, and one portrait image.
- **Image Generation Constraints**: The generation pipeline MUST run a planning phase to generate bespoke image prompts for logos and heroes that match the design brief. Do NOT use generic monogram fallbacks.
- **Bio Photo Constraints**: The portrait generation MUST strictly use the canonical `assets/greg-portrait-source.png` high-res photo, enforcing identity preservation via the A/B tested prompt formula. NEVER use `assets/greg-portrait-base.jpg`.
- Drop a `DESIGN.md` (the Google Standard) directly into that folder. It must use standard frontmatter (`name`, `accent`, `style`) and a `# Design System` markdown body.
- Do NOT use or generate `theme-[id]` or `design-[id]` files. The site relies entirely on isolated folders, not global CSS hot-swapping or theme pills.
