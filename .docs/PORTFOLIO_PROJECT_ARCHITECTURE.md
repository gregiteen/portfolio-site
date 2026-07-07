# PORTFOLIO_PROJECT_ARCHITECTURE

## Core Topology
- **Static Generation (`scripts/build-site.mjs`)**: Parses `vault/pages/**/*.md` and constructs the raw HTML in `dist/site/`. Supports a `--design [slug]` flag to build completely isolated, standalone copies of the entire website using a generated layout.
- **Stateless Node Daemon (`scripts/serve.mjs`)**: Directly serves the `dist/site/` folder. Handles the `/generate-theme` POST endpoint and the `/generate-status` polling logic, returning the exact `latestUrl` for redirects.
- **Theme Generation (`scripts/compile-theme.mjs`)**: Ingests prompts, executes a critique-and-planning phase to generate bespoke design specs and image prompts, and generates a dedicated `DESIGN.md` inside `vault/pages/designs/`. Afterwards, it automatically triggers an asynchronous background rebuild of the main site and an isolated build of the new design site. Portrait image styling strictly enforces the `greg-portrait-source.png` canonical identity base.
- **Arrow Flipper UI**: A sticky Javascript-powered navigation bar (`id="ai-design-flipper"`) injected into the top of every generated HTML page. It dynamically traverses `window.location.pathname` to hyperlink visitors seamlessly between the root index and all isolated AI-generated design folders.
- **Google Standard `DESIGN.md`**: Governed explicitly by the local project skill `.agent/skills/frontend-design/SKILL.md`. This is the sole source of truth for a theme (see [Google DESIGN.md Spec](file:///Users/greg/Github/portfolio-site/.docs/google_design_md_spec.md)). The format strictly enforces frontmatter (`name`, `accent`, `style`) and a `# Design System` markdown body.

## Deployment Pipeline
- **Sync Method**: Deployment runs via `rsync -avz --delete dist/site/ root@$DROPLET_IP:/var/www/gregiteen.xyz/`.
- **Absolute Source of Truth**: Because of the `--delete` flag, the local `dist/site/` folder is the strict source of truth for the live production droplet.

## Key Subsystems
- **Marketing / Email**: Governed by `/email` and `/marketing` skills. Routes through SMTP2GO and Mailcow.
- **Project Management**: Managed locally in `.docs/` per the `/project-management` skill.
- **The Portfolio Vault**: Found in `vault/pages/projects/`. Holds static showcase content. **Do not overwrite.**
