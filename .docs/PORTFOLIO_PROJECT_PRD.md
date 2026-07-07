# PORTFOLIO_PROJECT_PRD

## 1. Goal
Provide a local, file-native portfolio site that showcases real software and design projects, while featuring a highly engaging "Design Aesthetic" gimmick that allows visitors to completely re-skin the active site into bespoke aesthetic universes. The system must remain entirely stateless and database-free.

## 2. Core Architecture & Concepts
- **The Vault (Source of Truth)**: The entire core portfolio application lives inside `vault/pages/`.
  - `vault/pages/projects/` contains manual software engineering projects.
  - `vault/pages/designs/` contains manual HTML graphic design projects.
- **The Base Build**: `scripts/build-site.mjs` parses the vault and builds the raw HTML into `dist/site/`. The default root site is the **B&W Agency Splash Page**—a high-contrast, Archivo Black display, grayscale/contrast hero with film-grain overlay.
- **The Design Aesthetic Engine (Gimmick)**: An interactive feature strictly restricted to the standalone `splash.html` page where visitors can submit a prompt to re-skin the active site. The engine outputs its spec (`DESIGN.md`) and newly generated assets into an isolated folder at `designs/[slug]/`. It NEVER touches the vault.
- **Full Site Rebuilds**: When a new design is generated, `build-site.mjs` rebuilds the *entire* portfolio site (retaining all the real vault content) but renders it through the lens of the generated layout. The output of this full rebuild is saved inside `dist/site/designs/[slug]/`.
- **The UI Flipper**: A sticky Javascript navigation bar (`ai-design-flipper`) injected into the top of every generated HTML page. It dynamically traverses `window.location.pathname` to hyperlink visitors seamlessly between the root index and all isolated AI-generated design folders, preserving their current reading path (e.g., flipping from `/projects/festech.html` on the B&W site directly to `/designs/[slug]/projects/festech.html` on the reskinned site).
- **Stateless Node Daemon (`serve.mjs`)**: Directly serves the `dist/site/` folder, handles the AI generation endpoints, and manages the marketing/visitor loop.
- **Deployment**: Synchronizes the local `dist/site/` folder to a DigitalOcean droplet via `rsync -avz --delete`. The local `dist/site/` is the absolute strict source of truth for production.

## 3. The User Journey Walkthrough

### Phase 1: Arrival & The B&W Baseline
1. The user navigates to the standalone `splash.html` page, which is the sole location for the design aesthetic prompt box.
2. They are greeted by a stark, high-contrast, film-grain aesthetic.
3. If they skip the prompt, they proceed to the homepage (`index.html`) and navigate through `/projects` and `/designs`, reading the authentic portfolio content compiled from the vault.

### Phase 2: Generation & Lead Capture
1. The user submits a design prompt (e.g., "A hyper-modern cyberpunk UI").
2. The site requires email verification via a 2FA code before generating (`/api/send-code`).
3. The user enters their email. `serve.mjs` dispatches a visually matched B&W 2FA email using the `emailShell()` template.
4. The user verifies the code. The system issues a 30-day session token stored in atomic local JSON (`.data/sessions.json`).
5. A first-visit-only welcome drip campaign email is immediately scheduled/sent.
6. The backend (`compile-theme.mjs`) runs a multi-agent critique-and-planning phase to generate bespoke image prompts (logo, hero) and a Google Standard `DESIGN.md` spec.
7. The system creates the isolated `designs/[slug]/` folder, saves the assets and spec, and triggers a full site rebuild using `--design [slug]`.

### Phase 3: The Gimmick & 3D Transitions
1. The generation completes, and the user is redirected to the newly generated URL: `/designs/[slug]/index.html`.
2. The user sees their prompt realized: the exact same portfolio content, but wrapped in a radically different layout, typography, and color palette.
3. At the top of the screen sits the **UI Flipper** bar.
4. The user clicks "Next Design" or "Prev Design" to jump to other previously generated aesthetic universes.
5. **The Magic Moment**: When they click the flipper, the browser executes a 3D rotateX/blur morph using the CSS View Transitions API. The site smoothly morphs into the next theme without a hard flash.
6. Because the flipper tracks their exact path (`subPath`), if they are reading the "Total Recall" project page and click "Next Design", they land perfectly on the "Total Recall" project page of the *next* aesthetic universe.

## 4. Strict Constraints
- **Absolute Vault Isolation**: The design engine MUST NEVER write files into `vault/pages/`. It must exclusively dump its output into `designs/[slug]/`. The manual portfolio items in the vault must never be polluted by generated skins.
- **No Theme Pills**: Do NOT use or generate `theme-[id]` or `design-[id]` files in the vault. The site relies entirely on isolated folders compiled via `--design [slug]`, not global CSS hot-swapping or theme pills.
- **Image Generation Constraints**: The generation pipeline MUST run a planning phase to generate bespoke image prompts for logos and heroes that match the design brief. Do NOT use generic monogram fallbacks.
- **Bio Photo Constraints**: The portrait generation MUST strictly use the canonical `assets/greg-portrait-source.png` high-res photo, enforcing identity preservation via the A/B tested prompt formula. NEVER use `assets/greg-portrait-base.jpg`.
- **Design Philosophy**: EVERYTHING MUST BE COMPLETELY DIFFERENT. Themes must not look generic or similar. Each isolated theme must enforce radically different aesthetics, layouts, and typography across generations.
- **UI-Matched Email Suite**: All outbound emails (2FA, confirmation, owner alerts) must visually match the B&W UI via the shared `emailShell()` template.
- **Google Standard `DESIGN.md`**: The AI spec must use standard frontmatter (`name`, `accent`, `style`) and a `# Design System` markdown body.
