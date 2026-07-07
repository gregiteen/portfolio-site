# System Architecture

## Core Topology
- **Static Generation (`scripts/build-site.mjs`)**: Parses `vault/pages/**/*.md` and constructs the raw HTML in `dist/site/`.
- **Stateless Node Daemon (`scripts/serve.mjs`)**: Directly serves the `dist/site/` folder, managing the Drip Campaign automation loop in memory, dispatching emails on intervals based on transient visitor profile state.
- **Theme Generation (`scripts/compile-theme.mjs`)**: Ingests prompts and generates an isolated, self-contained mini-site for that design. It creates a dedicated folder (e.g. `designs/[slug]/`). Inside this folder, it places all generated HTML files, the isolated generated image assets (logo, favicon, hero, portrait), and the Google Standard `DESIGN.md`.
- **Google Standard `DESIGN.md`**: The sole source of truth for a theme (see [Google DESIGN.md Spec](file:///Users/greg/Github/portfolio-site/.docs/google_design_md_spec.md)). It sits inside the isolated folder. The format strictly enforces frontmatter (`name`, `accent`, `style`) and a `# Design System` markdown body. No `theme-[id]` or `design-[id]` files are used.

## Deployment Pipeline & Legacy Architecture
- **Sync Method**: Deployment runs via `rsync -avz --delete dist/site/ root@$DROPLET_IP:/var/www/gregiteen.xyz/`.
- **Absolute Source of Truth**: Because of the `--delete` flag, the `dist/site/` folder is the strict source of truth for the live droplet.
- **Legacy Purge**: Any old `.html` files (like `nostalgia.html` or `high-stakes-field-day.html`) that existed on the droplet from a previous architecture (before the July 3rd SSSS-native migration) were permanently purged during the sync because they were never migrated into the `vault/pages/` markdown structure in this git repository.

## Key Subsystems
- **Marketing / Email**: Governed by `/email` and `/marketing` skills. Routes through SMTP2GO and Mailcow.
- **Project Management**: Managed locally in `.docs/` per the `/project-management` skill.
- **The Portfolio Vault**: Found in `vault/pages/projects/`. Holds static showcase content. **Do not overwrite.**
