# PORTFOLIO_PROJECT_ARCHITECTURE

## Core Topology
- **Static Generation (`scripts/build-site.mjs`)**: Parses `vault/pages/**/*.md` and constructs the raw HTML in `dist/site/`. Supports a `--design [slug]` flag to build completely isolated, standalone copies of the entire website. These isolated builds are FULL site compilations that perfectly retain all copy and layout from the user's manual software projects and graphic design portfolio items, rendered entirely through the lens of the AI-generated layout.
- **Stateless Node Daemon (`scripts/serve.mjs`)**: Directly serves the `dist/site/` folder. Handles the `/generate-theme` POST endpoint and the `/generate-status` polling logic, returning the exact `latestUrl` for redirects.
- **Theme Generation (`scripts/compile-theme.mjs`)**: Ingests prompts, executes a critique-and-planning phase to generate bespoke design specs and image prompts, and generates a dedicated `DESIGN.md` inside `vault/pages/designs/`. Afterwards, it automatically triggers an asynchronous background rebuild of the main site and an isolated build of the new design site. Portrait image styling strictly enforces the `greg-portrait-source.png` canonical identity base.
- **Arrow Flipper UI**: A sticky Javascript-powered navigation bar (`id="ai-design-flipper"`) injected into the top of every generated HTML page. It dynamically traverses `window.location.pathname` to hyperlink visitors seamlessly between the root index and all isolated AI-generated design folders.
- **Google Standard `DESIGN.md`**: Governed explicitly by the local project skill `.agent/skills/frontend-design/SKILL.md`. This is the sole source of truth for a theme (see [Google DESIGN.md Spec](file:///Users/greg/Github/portfolio-site/.docs/google_design_md_spec.md)). The format strictly enforces frontmatter (`name`, `accent`, `style`) and a `# Design System` markdown body.

## Deployment Pipeline
- **Sync Method**: Deployment runs via `rsync -avz --delete dist/site/ root@$DROPLET_IP:/var/www/gregiteen.xyz/`.
- **Absolute Source of Truth**: Because of the `--delete` flag, the local `dist/site/` folder is the strict source of truth for the live production droplet.

## Key Subsystems
- **Marketing / Email Suite**: Governed by `/email` and `/marketing` skills. Routes through SMTP2GO and Mailcow (DKIM/SPF/DMARC verified). Employs `emailShell()` inside `serve.mjs` to perfectly match the UI's B&W aesthetic.
- **Visitor Memory**: Atomic local storage via `.data/sessions.json` and 30-day tokens to ensure seamless auto-login, enabling first-visit-only email triggers and persistent visitor workflow context.
- **View Transitions**: Uses standard CSS `@view-transition` and JavaScript `startViewTransition()` to execute 3D rotateX/blur morphs across theme boundaries.
- **Project Management**: Managed locally in `.docs/` per the `/project-management` skill.
- **The Portfolio Vault**: Holds static showcase content in two directories: `vault/pages/projects/` (Software Engineering projects) and `vault/pages/designs/` (HTML Graphic Design projects). The AI generator also drops specs into the `designs/` folder. **Do not overwrite the user's manual markdown files in either directory.**
