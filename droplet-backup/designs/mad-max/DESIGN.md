---
name: "Scorched Earth Engineering"
accent: "#888888"
style: "MAD MAX"
constitution_version: "2"
token_colors: "Base: oklch(20% 0.02 45) [Asphalt Ash], Surface: oklch(25% 0.03 40) [Oxidized Metal], Text: oklch(90% 0.05 85) [Bleached Bone], Accent: oklch(65% 0.22 35) [Rusted Chrome], Border: oklch(35% 0.05 45) [Scorched Steel]"
token_typography: "Display: 'Anton' or 'Oswald' (Heavily condensed, uppercase, tracking-tight). Body: 'JetBrains Mono' (Mechanical, precise, tabular lining)."
token_spacing: "Base unit: 0.5rem. Grid gaps scale fluidly: clamp(1rem, 2vw, 2rem). Dense padding for internal card content to reflect scavenged efficiency."
signature_gesture: "Scroll-driven 'Velocity Throttle': As the user scrolls down, section headers dynamically skew and scale up slightly, linked directly to the scrollbar's physical pixel offset via animation-timeline: view(), simulating the acceleration of a high-powered engine."
---

# Design System

---
name: Scorched Earth Engineering
description: A high-end, post-apocalyptic technical visual system for an AI engineer, blending scavenged mechanics with precision layout.
tokens:
  color:
    bg: 'oklch(20% 0.02 45)'
    surface: 'oklch(25% 0.03 40)'
    text: 'oklch(90% 0.05 85)'
    accent: 'oklch(65% 0.22 35)'
    border: 'oklch(35% 0.05 45)'
  typography:
    display: '"Anton", "Oswald", sans-serif'
    body: '"JetBrains Mono", "IBM Plex Mono", monospace'
  spacing:
    gap: 'clamp(1rem, 2vw, 2rem)'
    section: 'clamp(4rem, 10vw, 8rem)'
  shape:
    radius: '0px'
    border_width: '2px'
---

# Scorched Earth Engineering

## Thematic Integration
This design approaches the portfolio of an AI systems engineer through the lens of a high-octane, post-apocalyptic wasteland. The engineer is not a generic developer, but a mechanic building complex, locally-run AI engines from raw parts. The aesthetic is serious, industrial, and high-performance. 

## Typography & Layout
The typographic scale uses an extremely condensed, aggressive display font for headings, providing the structural weight of engine blocks. This is paired with a strictly monospaced body font to retain the technical reality of the work. The layout avoids brutalist chaos by enforcing a rigid, high-end editorial bento grid, mimicking an expertly engineered survival rig where every component has a critical function.

## Motion & Physicality
Motion is tied directly to scroll velocity using native CSS animation timelines, creating a sense of forward momentum. Components enter the viewport with a slight scale and opacity shift, resembling dust clearing from a landscape. Borders are sharp and heavy, avoiding soft radii to project a hardened, scavenged aesthetic.

## Locked Design Constitution

```json
{
  "name": "Scorched Earth Engineering",
  "accent": "oklch(65% 0.22 35)",
  "signatureGesture": "Scroll-driven 'Velocity Throttle': As the user scrolls down, section headers dynamically skew and scale up slightly, linked directly to the scrollbar's physical pixel offset via animation-timeline: view(), simulating the acceleration of a high-powered engine.",
  "mobileStrategy": "The mobile architecture relies on a single-column, strictly linear bento grid. The navigation is a persistent, wrap-enabled mechanical dashboard locked to the bottom of the screen on mobile for optimal thumb reach (touch targets > 44px), scaling to a top-anchored alignment on desktop.",
  "imageTreatment": "Desaturated base imagery with a harsh, high-contrast curve. Applied natively via CSS filters: sepia(30%) contrast(120%) saturate(70%), simulating the harsh sun and dust of a post-apocalyptic wasteland.",
  "tokens": {
    "colors": "Base: oklch(20% 0.02 45) [Asphalt Ash], Surface: oklch(25% 0.03 40) [Oxidized Metal], Text: oklch(90% 0.05 85) [Bleached Bone], Accent: oklch(65% 0.22 35) [Rusted Chrome], Border: oklch(35% 0.05 45) [Scorched Steel]",
    "typography": "Display: 'Anton' or 'Oswald' (Heavily condensed, uppercase, tracking-tight). Body: 'JetBrains Mono' (Mechanical, precise, tabular lining).",
    "spacing": "Base unit: 0.5rem. Grid gaps scale fluidly: clamp(1rem, 2vw, 2rem). Dense padding for internal card content to reflect scavenged efficiency.",
    "shape": "Zero border-radius. Absolute sharp corners. Borders are consistently 2px solid Scorched Steel, giving elements a bolted-together weight.",
    "motion": "Compositor-thread entry animations using @starting-style. Scroll-driven timelines for subtle parallax and reveal mechanics. No JS layout shifts."
  },
  "classVocabulary": [
    {
      "name": "app-shell",
      "owner": "shell",
      "purpose": "Root layout container maintaining the global mechanical structure"
    },
    {
      "name": "nav-bar",
      "owner": "shell",
      "purpose": "Global navigation dashboard containing all routing links"
    },
    {
      "name": "site-footer",
      "owner": "shell",
      "purpose": "Global footer for baseline technical metadata"
    },
    {
      "name": "nav-item-wrap",
      "owner": "nav_item",
      "purpose": "Wrapper for individual navigation links enforcing touch target size"
    },
    {
      "name": "nav-link",
      "owner": "nav_item",
      "purpose": "Interactive routing text with kinetic hover state"
    },
    {
      "name": "hero-section",
      "owner": "home",
      "purpose": "Primary landing viewport establishing the engine and wasteland thesis"
    },
    {
      "name": "hero-title",
      "owner": "home",
      "purpose": "Massive, condensed typographic lockup for the engineer's name"
    },
    {
      "name": "feature-grid",
      "owner": "home",
      "purpose": "Bento grid for highlighted systems and technical achievements"
    },
    {
      "name": "project-feed",
      "owner": "projects_index",
      "purpose": "Masonry container for the archive of engineered systems"
    },
    {
      "name": "project-card",
      "owner": "project_item",
      "purpose": "Individual bento container for a project overview"
    },
    {
      "name": "project-title",
      "owner": "project_item",
      "purpose": "Condensed heading for the project name"
    },
    {
      "name": "project-meta",
      "owner": "project_item",
      "purpose": "Monospaced technical specifications and tooling data"
    },
    {
      "name": "design-feed",
      "owner": "designs_index",
      "purpose": "Grid lanes layout for visual architectural diagrams"
    },
    {
      "name": "design-card",
      "owner": "design_item",
      "purpose": "Framed container for visual design artifacts"
    },
    {
      "name": "design-media",
      "owner": "design_item",
      "purpose": "Image wrapper applying the harsh wasteland filter treatment"
    },
    {
      "name": "detail-header",
      "owner": "project_detail",
      "purpose": "Full-width structural header for project specifications"
    },
    {
      "name": "detail-body",
      "owner": "project_detail",
      "purpose": "Constrained reading column for linear technical documentation"
    },
    {
      "name": "design-detail-view",
      "owner": "design_detail",
      "purpose": "Immersive, edge-to-edge layout for reviewing visual schematics"
    },
    {
      "name": "page-container",
      "owner": "page",
      "purpose": "Standardized wrapper for generic content pages"
    },
    {
      "name": "page-content",
      "owner": "page",
      "purpose": "Flow container for linear text and markdown elements"
    },
    {
      "name": "badge",
      "owner": "css",
      "purpose": "Injected component: pill-shaped technical marker in rusted chrome"
    },
    {
      "name": "src",
      "owner": "css",
      "purpose": "Injected component: raw monospaced source code display"
    },
    {
      "name": "backlink",
      "owner": "css",
      "purpose": "Injected component: return navigation with mechanical arrow"
    },
    {
      "name": "btn",
      "owner": "css",
      "purpose": "Injected component: solid, sharp-edged interactive trigger"
    },
    {
      "name": "md-img",
      "owner": "css",
      "purpose": "Injected component: markdown image wrapped in heavy steel borders"
    },
    {
      "name": "section-header",
      "owner": "css",
      "purpose": "Global utility for dividing distinct functional areas"
    }
  ],
  "layoutBlueprints": {
    "shell": {
      "rootClass": "app-shell",
      "composition": "The outer hull of the application. Renders a persistent `nav-bar` containing navigation links at the top on desktop, moving to a safe-area anchored bottom bar on mobile. Encapsulates the main document flow and a minimal `site-footer` for baseline system status."
    },
    "home": {
      "rootClass": "hero-section",
      "composition": "Opens with `hero-section` displaying a massive `hero-title` over a generative wasteland engine background. Followed by a tightly packed `feature-grid` (Bento layout) highlighting recent project cards and technical specs, driven by scroll-linked velocity animations."
    },
    "projects_index": {
      "rootClass": "project-feed",
      "composition": "A strictly mathematical Native Masonry `project-feed` where all items align to fluid grid lanes. Features a `section-header` defining the archive scope. Items are sequenced with entry-range view timelines."
    },
    "designs_index": {
      "rootClass": "design-feed",
      "composition": "A dense grid layout maximizing visual density. `design-card` elements are locked into subgrid rows to ensure metadata and heavy `design-media` borders align perfectly across the horizontal axis."
    },
    "project_detail": {
      "rootClass": "detail-header",
      "composition": "A highly structural documentation view. Begins with a `detail-header` containing the title and `badge` metadata. Transitions into a single-column `detail-body` restricted to a maximum width to prevent text collision, displaying `md-img` and `src` with sharp, bolted borders."
    },
    "design_detail": {
      "rootClass": "design-detail-view",
      "composition": "An immersive review interface. The media is expanded to near edge-to-edge bounds with extreme contrast applied. Technical metadata is stacked neatly in a monospace grid directly below or alongside the artifact."
    },
    "page": {
      "rootClass": "page-container",
      "composition": "A utilitarian layout for standard text (About, Contact). Uses `page-content` to enforce a linear, readable flow with fluid typography, avoiding multi-column complexities. Text wrap is set to pretty for optimal reading."
    },
    "project_item": {
      "rootClass": "project-card",
      "composition": "A sharp-edged bento fragment. Contains a condensed `project-title` and a monospaced `project-meta` block. Hover states trigger kinetic text weight shifts and a subtle translation effect simulating mechanical engagement."
    },
    "design_item": {
      "rootClass": "design-card",
      "composition": "A sturdy frame holding `design-media`. The image treatment enforces the desaturated wasteland look. Interaction causes the border color to heat up to the rusted chrome accent color via OKLCH interpolation."
    },
    "nav_item": {
      "rootClass": "nav-item-wrap",
      "composition": "A structural wrapper ensuring a minimum 44x44px touch area. Contains the `nav-link` which features a monospace mechanical label. When active or hovered, uses relational DOM state (:has) to dim sibling navigation items."
    }
  }
}
```

## section:css

```css
:root { --c-base: oklch(20% 0.02 45); --c-surface: oklch(25% 0.03 40); --c-text: oklch(90% 0.05 85); --c-accent: oklch(65% 0.22 35); --c-border: oklch(35% 0.05 45); --f-disp: 'Anton', 'Oswald', sans-serif; --f-body: 'JetBrains Mono', monospace; --gap: clamp(1rem, 2vw, 2rem); } * { box-sizing: border-box; margin: 0; padding: 0; border-radius: 0; } body { background: var(--c-base); color: var(--c-text); font-family: var(--f-body); line-height: 1.6; overflow-x: hidden; -webkit-font-smoothing: antialiased; } .app-shell { display: flex; flex-direction: column; min-height: 100vh; padding-bottom: 60px; } @media (min-width: 768px) { .app-shell { padding-bottom: 0; padding-top: 60px; } } .nav-bar { position: fixed; bottom: 0; left: 0; width: 100%; height: 60px; background: var(--c-surface); border-top: 2px solid var(--c-border); display: flex; align-items: center; padding: 0 1rem; z-index: 100; overflow-x: auto; gap: 1.5rem; } @media (min-width: 768px) { .nav-bar { bottom: auto; top: 0; border-top: none; border-bottom: 2px solid var(--c-border); justify-content: flex-end; } } .nav-bar:has(.nav-item-wrap:hover) .nav-item-wrap:not(:hover) { opacity: 0.3; } .site-footer { padding: 2rem 1rem; border-top: 2px solid var(--c-border); text-align: center; font-size: 0.8rem; text-transform: uppercase; margin-top: auto; color: var(--c-text); opacity: 0.6; } .nav-item-wrap { display: flex; align-items: center; min-height: 44px; min-width: 44px; transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1); } .nav-link { color: var(--c-text); text-decoration: none; font-weight: normal; text-transform: uppercase; transition: color 0.3s, font-weight 0.1s; display: inline-flex; align-items: center; } .nav-link:hover, .nav-link.active { color: var(--c-accent); font-weight: bold; } .hero-section { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 2rem 1rem; position: relative; border-bottom: 2px solid var(--c-border); background-color: var(--c-base); background-image: url('assets/hero.jpg'); background-size: cover; background-position: center; background-attachment: fixed; } .hero-section::before { content: ''; position: absolute; inset: 0; background: var(--c-base); opacity: 0.8; mix-blend-mode: multiply; } .hero-title { position: relative; font-family: var(--f-disp); font-size: clamp(3.5rem, 12vw, 10rem); color: var(--c-text); text-transform: uppercase; line-height: 0.85; z-index: 1; letter-spacing: -0.02em; text-shadow: 4px 4px 0 var(--c-border); margin-bottom: 1rem; } .hero-title::after { content: ''; display: block; width: 60px; height: 12px; background: var(--c-accent); margin-top: 1.5rem; } .feature-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--gap); padding: var(--gap) 1rem; position: relative; z-index: 1; } @media (min-width: 768px) { .feature-grid { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); } } .project-feed { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--gap); padding: var(--gap) 1rem; } @media (min-width: 768px) { .project-feed { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); } } .project-card { border: 2px solid var(--c-border); background: var(--c-surface); padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; transition: transform 0.2s linear, border-color 0.2s linear; text-decoration: none; color: inherit; min-width: 0; } .project-card:hover { transform: translateY(-4px); border-color: var(--c-accent); } .project-title { font-family: var(--f-disp); font-size: 2rem; text-transform: uppercase; color: var(--c-accent); letter-spacing: 0.02em; margin: 0; line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .project-meta { font-size: 0.85rem; color: var(--c-text); opacity: 0.8; display: flex; flex-wrap: wrap; gap: 0.5rem; } .design-feed { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--gap); padding: var(--gap) 1rem; } @media (min-width: 768px) { .design-feed { grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); } } .design-card { border: 2px solid var(--c-border); background: var(--c-surface); display: flex; flex-direction: column; text-decoration: none; color: inherit; transition: border-color 0.3s linear; min-width: 0; } .design-card:hover { border-color: var(--c-accent); } .design-media { width: 100%; aspect-ratio: 16/9; overflow: hidden; border-bottom: 2px solid var(--c-border); background: var(--c-base); } .design-media img { width: 100%; height: 100%; object-fit: cover; filter: sepia(30%) contrast(120%) saturate(70%); transition: filter 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); } .design-card:hover .design-media img { filter: sepia(0%) contrast(100%) saturate(100%); transform: scale(1.05); } .detail-header { padding: 4rem 1rem 2rem; border-bottom: 2px solid var(--c-border); background: var(--c-surface); display: flex; flex-direction: column; gap: 1rem; align-items: flex-start; } .detail-body { max-width: 800px; margin: 0 auto; padding: 2rem 1rem; display: flex; flex-direction: column; gap: 2rem; overflow-wrap: break-word; min-width: 0; } .design-detail-view { width: 100%; padding: 2rem 1rem; display: flex; flex-direction: column; align-items: center; gap: var(--gap); } .design-detail-view img { max-width: 100%; border: 2px solid var(--c-border); filter: sepia(30%) contrast(120%) saturate(70%); } .page-container { max-width: 800px; margin: 0 auto; padding: 4rem 1rem; } .page-content { display: flex; flex-direction: column; gap: 1.5rem; text-wrap: pretty; min-width: 0; } .badge { display: inline-flex; align-items: center; justify-content: center; padding: 0.25rem 0.75rem; background: var(--c-accent); color: var(--c-base); font-family: var(--f-disp); text-transform: uppercase; font-size: 0.9rem; letter-spacing: 0.05em; border: 2px solid var(--c-accent); white-space: nowrap; } .src { display: block; font-family: var(--f-body); background: var(--c-base); padding: 1.5rem; border: 2px solid var(--c-border); color: var(--c-accent); overflow-x: auto; font-size: 0.85rem; width: 100%; box-shadow: inset 0 0 20px rgba(0,0,0,0.5); } .backlink { display: inline-flex; align-items: center; min-height: 44px; color: var(--c-text); text-decoration: none; text-transform: uppercase; font-weight: bold; border: 2px solid transparent; transition: border-color 0.2s linear; padding-right: 1rem; } .backlink::before { content: '<-'; color: var(--c-accent); margin-right: 0.75rem; font-family: var(--f-disp); font-size: 1.2rem; } .backlink:hover { border-bottom-color: var(--c-accent); } .btn { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; min-width: 44px; padding: 0 1.5rem; background: transparent; color: var(--c-accent); border: 2px solid var(--c-border); font-family: var(--f-disp); text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; transition: all 0.2s linear; text-decoration: none; } .btn:hover { background: var(--c-accent); color: var(--c-base); border-color: var(--c-accent); } .md-img { max-width: 100%; height: auto; display: block; border: 2px solid var(--c-border); filter: sepia(30%) contrast(120%) saturate(70%); margin: 2rem 0; } .section-header { font-family: var(--f-disp); font-size: clamp(2rem, 5vw, 3.5rem); text-transform: uppercase; color: var(--c-text); border-bottom: 4px solid var(--c-border); padding-bottom: 0.5rem; margin-bottom: 2rem; width: 100%; display: flex; align-items: baseline; gap: 1rem; } @supports (animation-timeline: view()) { .section-header, .project-card, .design-card { animation: velocity-throttle linear both; animation-timeline: view(); animation-range: entry 5% cover 25%; } } @keyframes velocity-throttle { 0% { transform: translateY(60px) skewX(-8deg) scale(0.95); opacity: 0; } 100% { transform: translateY(0) skewX(0) scale(1); opacity: 1; } } @media (prefers-reduced-motion: reduce) { *, ::before, ::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; transform: none !important; } }

/* Release invariant: a generated skin may not let an untrusted logo asset take over the viewport. */
.nav-bar img[src*="gi-logo-transparent"], header img[src*="gi-logo-transparent"],
.nav-bar img[src*="assets/logo"], header img[src*="assets/logo"] {
  display: block;
  inline-size: min(11.25rem, 48vw) !important;
  block-size: 3.5rem !important;
  max-inline-size: 100% !important;
  max-block-size: 3.5rem !important;
  object-fit: contain !important;
  object-position: left center !important;
}
.verified-brand-mark {
  inline-size: min(11.25rem, 48vw) !important;
  block-size: 3.5rem !important;
  max-inline-size: 100% !important;
  max-block-size: 3.5rem !important;
  object-fit: contain !important;
}
/* Vault-injected project marks have their own stable wrapper regardless of
   the generated layout vocabulary. Bound them mechanically so intrinsic
   source dimensions can never escape a card or grid track. */
.logo-tile {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  inline-size: 100% !important;
  min-inline-size: 0 !important;
  max-inline-size: 100% !important;
  overflow: hidden !important;
}
.logo-tile img {
  display: block !important;
  inline-size: 100% !important;
  min-inline-size: 0 !important;
  max-inline-size: 100% !important;
  block-size: auto !important;
  max-block-size: 18rem !important;
  object-fit: contain !important;
}
/* Build-owned navigation wrapper and badge fragments need invariant spacing;
   aesthetic styling remains theme-owned. */
.nav-links {
  display: flex !important;
  flex-wrap: wrap !important;
  align-items: center !important;
  gap: .25rem 1rem !important;
  min-inline-size: 0 !important;
}
.nav-links a {
  display: inline-flex !important;
  align-items: center !important;
  min-block-size: 44px !important;
  white-space: nowrap !important;
}
.badge {
  margin: .2rem !important;
}
/* build-site emits both navigation layers; generated skins own the custom one. */
.tl-default { display: none !important; }
.tl-custom { display: flex; flex-wrap: wrap; align-items: center; }


@media (prefers-reduced-motion: no-preference) {
  .gi-reveal { opacity: 0; transform: translateY(28px); transition: opacity .7s ease, transform .7s cubic-bezier(.2,.7,.2,1); transition-delay: var(--gi-stagger, 0s); }
  .gi-reveal.gi-in { opacity: 1; transform: none; }
}


/* review-board fix layer (pass 1) */
.project-card,.project-feed,.design-card,.design-feed,.md-img,.design-media{max-width:100%;overflow:hidden;box-sizing:border-box}.project-card img,.project-feed img,.design-card img,.design-feed img,.md-img img,.design-media img{max-width:100%;height:auto;display:block;object-fit:cover;width:100%}.project-card,.design-card{display:flex;flex-direction:column}body,.app-shell,.hero-section,.project-feed,.design-feed,.page-container,.page-content,.detail-body,.project-meta,.design-card{color:oklch(95% 0.02 85)!important}.hero-section p,.project-feed p,.design-feed p,.page-content p,.detail-body p,.project-meta,.badge,.src{color:oklch(95% 0.02 85)!important}.nav-link,.backlink,.btn{color:oklch(95% 0.02 85)!important}.project-meta span,.design-card span,.site-footer{color:oklch(85% 0.03 85)!important}

/* review-board fix layer (pass 2) */
.hero-section { position: relative; background-image: linear-gradient(to bottom, rgba(15, 15, 15, 0.9), rgba(20, 20, 20, 0.95)), url('assets/hero.jpg') !important; } .hero-section::before { content: ""; position: absolute; inset: 0; background: rgba(0, 0, 0, 0.5); z-index: 1; } .hero-section > * { position: relative; z-index: 2; } .hero-section p, .hero-section .hero-title, .hero-section [class*="tagline"], .hero-section [class*="intro"], .hero-section [class*="headline"] { color: oklch(90% 0.05 85) !important; text-shadow: 0 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.5); } @media (min-width: 768px) { .nav-bar { position: sticky !important; top: 0 !important; bottom: auto !important; display: flex !important; background-color: oklch(25% 0.03 40) !important; border-bottom: 2px solid oklch(35% 0.05 45) !important; border-top: none !important; z-index: 1000 !important; } .nav-item-wrap { display: flex !important; visibility: visible !important; opacity: 1 !important; } .nav-link { display: inline-flex !important; visibility: visible !important; opacity: 1 !important; color: oklch(90% 0.05 85) !important; } }
```

## section:layout:shell

```html
<div class="app-shell"><nav class="nav-bar">{{NAV_LINKS}}</nav><main>{{CONTENT}}</main><footer class="site-footer">{{THEME_PILLS}}{{SOURCE_PATH}}</footer></div>
```

## section:layout:home

```html
<section class="hero-section"><h1 class="hero-title">{{HEADLINE}}</h1><div class="page-content"><p>{{TAGLINE}}</p><div>{{INTRO}}</div></div><div class="section-header">{{FEATURED_COUNT}}</div><div class="feature-grid">{{FEATURED_PROJECTS}}</div></section>
```

## section:layout:projects_index

```html
<section class="project-feed"><header class="section-header">{{PROJECT_COUNT}}</header>{{PROJECT_LIST}}</section>
```

## section:layout:designs_index

```html
<div class="design-feed"><div class="section-header">{{DESIGN_COUNT}}</div>{{DESIGN_CARDS}}</div>
```

## section:layout:project_detail

```html
<section class="detail-header"><div class="detail-body"><h1 class="section-header">{{NAME}}</h1><div>{{BACKLINK}} {{LOGO}} {{DESCRIPTION}} {{ROLE}} {{YEAR}} {{TECH_BADGES}} {{PROJECT_LINK}} {{REPO_LINK}} {{SOURCE_PATH}}</div><div>{{CONTENT}}</div></div></section>
```

## section:layout:design_detail

```html
<section class="design-detail-view"><div class="backlink">{{BACKLINK}}</div><div class="design-media"><img src="{{PREVIEW}}" /></div><header class="detail-header"><h1 class="project-title">{{NAME}}</h1></header><div class="project-meta">{{CLIENT}} {{ROLE}} {{YEAR}} {{DESCRIPTION}}</div><div class="badge">{{TAG_BADGES}}</div><div class="src">{{SOURCE_PATH}}</div><div class="page-content">{{CONTENT}}</div><a href="{{LINK_URL}}" class="btn">{{NAME}}</a></section>
```

## section:layout:page

```html
<section class="page-container"><header class="section-header"><h2>{{NAME}}</h2><div class="src">{{SOURCE_PATH}}</div></header><div class="page-content">{{CONTENT}}</div></section>
```

## section:layout:project_item

```html
<section class="project-card"><a href="{{URL}}">{{LOGO}}</a><h3 class="project-title"><a href="{{URL}}">{{NAME}}</a></h3><div class="project-meta">{{DESCRIPTION}}</div><div class="project-meta">{{TECH_BADGES}}</div><a href="{{REPO_URL}}" class="src">{{INDEX}}</a></section>
```

## section:layout:design_item

```html
<section class="design-card"><a href="{{URL}}" class="design-media"><img src="{{PREVIEW}}" alt="{{NAME}}"></a><div class="project-meta"><h3 class="project-title">{{NAME}}</h3><p>{{DESCRIPTION}}</p><span>{{CLIENT}}</span><span>{{YEAR}}</span><span>{{TAG_BADGES}}</span></div></section>
```

## section:layout:nav_item

```html
<div class="nav-item-wrap"><a href="{{NAV_URL}}" class="nav-link {{NAV_ACTIVE_CLASS}}">{{NAV_NAME}}</a></div>
```
