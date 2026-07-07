# Portfolio Site — System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  VISITOR FLOW                                                   │
│                                                                 │
│  splash.html → /api/send-code → verify.html → /api/verify-code │
│       │                                            │            │
│       │  style prompt + email                      │ gi_auth    │
│       │                                            │ cookie     │
│       ▼                                            ▼            │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  GENERATION PIPELINE (compile-theme.mjs)            │        │
│  │                                                     │        │
│  │  Plan → Review → Images ──┐                         │        │
│  │                    CSS+Home ──► SERVE HOME IMMEDIATELY│       │
│  │                    Layouts (parallel) ──► BUILD REST │        │
│  │                    Holistic Review ──► FINALIZE      │        │
│  └─────────────────────────────────────────────────────┘        │
│                          │                                      │
│                          ▼                                      │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  FLIPPER (View Transitions)                         │        │
│  │  Visitor flips → fetch() new design build →         │        │
│  │  startViewTransition() → full page swap             │        │
│  └─────────────────────────────────────────────────────┘        │
│                          │                                      │
│                          ▼                                      │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  CNA FORM (AI-powered)                              │        │
│  │  Needs analysis → Proposal PDF → Greg approval →    │        │
│  │  DocuSign alternative → Client                      │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                 │
│  BACKGROUND: Drip campaigns, visitor tracking, daily cron       │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: Vault → Build → Dist

```
vault/pages/*.md                          (Source of truth)
    │
    ├─ parseDocument() via @ssss/cli      (Frontmatter + body extraction)
    ├─ renderMarkdown(body) → HTML        (Built-in minimal renderer)
    ├─ Categorize by x_kind:
    │   ├─ "theme"   → CSS token maps
    │   ├─ "section" → nav pages (home, about, contact)
    │   ├─ "project" → project details
    │   └─ "design"  → real portfolio design work ONLY
    │
    ├─ If design layer active:
    │   designs/<slug>/DESIGN.md
    │   → extractSections()               (CSS + layouts from fenced blocks)
    │   → fillTemplate(layout, {VARS})    (Inject vault data into {{PLACEHOLDER}} slots)
    │
    └─ writeFile → dist/site/
```

## Key Components

### 1. Splash + Auth (`static/splash.html`, `static/verify.html`, `serve.mjs`)
- Splash collects style prompt + email
- Server sends 6-digit verification code via SMTP
- On verification: sets `gi_auth` cookie, logs visitor, emails Greg
- Rate limiting: IP-based, 10 requests/hour

### 2. Theme Generator (`scripts/compile-theme.mjs`)
- Takes style prompt, calls Gemini API (fallback: Antigravity → Claude → Codex CLI agents)
- Multi-pass pipeline producing JSON: `{ name, accent, css, layouts: {...} }`
- Validation via `validateThemePayload()` with one repair round
- Outputs: `designs/<slug>/DESIGN.md` + assets + standalone HTML build

### 3. Theme Validator (`scripts/lib/theme.mjs`)
- `LAYOUT_SPECS` — placeholder contract (required/optional slots per template)
- `validateThemePayload()` — checks CSS, accent, required placeholders
- `fillTemplate()` — replaces `{{KEY}}` with vault values; unknown slots → empty string
- `scopeCss()` — prefixes selectors with `html[data-theme="custom"]`
- `extractSections()` — parses `## section:<name>` fenced blocks from DESIGN.md

### 4. Build Script (`scripts/build-site.mjs`)
- Reads vault, reads optional design layer, fills templates, writes static HTML
- Dual-layer architecture: `.tl-default` / `.tl-custom` divs with CSS visibility toggle
- Standalone design build (`--design <slug>`): un-scoped CSS, rewritten links
- Auto-builds all design layers after main build

### 5. Dev Server (`scripts/serve.mjs`)
- `fs.watch()` on vault with 150ms debounce, queued rebuilds
- Live reload via `/dev-status` polling (800ms)
- Theme generation: `POST /generate-theme` → spawns `compile-theme.mjs`
- 2FA auth: email verification, sessions, rate limiting, visitor logging

### 6. Flipper (injected by `build-site.mjs`)
- Fixed bar at top of every page
- Prev/Next navigation between design builds
- `fetch()` + `DOMParser` + `document.startViewTransition()` for full page swap
- Preserves current sub-path across design switches

### 7. CNA Form (NOT YET IMPLEMENTED)
- AI-powered interactive needs assessment
- Compares prospect needs against services/pricing/timelines
- Generates PDF proposal
- Sends to Greg for approval before delivery via open-source DocuSign

### 8. Continuous Improvement (NOT YET IMPLEMENTED)
- Daily cron: `improve-theme.mjs`
- Picks a design, analyzes, scores, generates improved version
- Swaps in if score improves, stops at plateau
- Model rotation for fresh perspectives

## Placeholder Contract

| Template | Required | Optional |
|----------|----------|----------|
| `shell` | `{{CONTENT}}` | `{{NAV_LINKS}}`, `{{THEME_PILLS}}`, `{{SOURCE_PATH}}` |
| `home` | `{{FEATURED_PROJECTS}}` | `{{HEADLINE}}`, `{{TAGLINE}}`, `{{INTRO}}`, `{{FEATURED_COUNT}}`, `{{GENERATOR_FORM}}` |
| `projects_index` | `{{PROJECT_LIST}}` | `{{PROJECT_COUNT}}` |
| `designs_index` | `{{DESIGN_CARDS}}` | `{{DESIGN_COUNT}}`, `{{GENERATOR_FORM}}` |
| `project_detail` | `{{NAME}}`, `{{CONTENT}}` | `{{DESCRIPTION}}`, `{{ROLE}}`, `{{YEAR}}`, `{{TECH_BADGES}}`, `{{REPO_LINK}}`, `{{PROJECT_LINK}}`, `{{LOGO}}`, `{{SOURCE_PATH}}`, `{{BACKLINK}}` |
| `design_detail` | `{{NAME}}`, `{{CONTENT}}` | `{{DESCRIPTION}}`, `{{CLIENT}}`, `{{ROLE}}`, `{{YEAR}}`, `{{TAG_BADGES}}`, `{{PREVIEW}}`, `{{LINK_URL}}`, `{{SOURCE_PATH}}`, `{{BACKLINK}}` |
| `page` | `{{NAME}}`, `{{CONTENT}}` | `{{SOURCE_PATH}}` |
| `project_item` | `{{NAME}}`, `{{URL}}` | `{{DESCRIPTION}}`, `{{YEAR}}`, `{{TECH_BADGES}}`, `{{LOGO}}`, `{{INDEX}}`, `{{REPO_URL}}` |
| `design_item` | `{{NAME}}`, `{{URL}}` | `{{DESCRIPTION}}`, `{{YEAR}}`, `{{CLIENT}}`, `{{TAG_BADGES}}`, `{{PREVIEW}}` |
| `nav_item` | `{{NAV_URL}}`, `{{NAV_NAME}}` | `{{NAV_ACTIVE_CLASS}}` |
