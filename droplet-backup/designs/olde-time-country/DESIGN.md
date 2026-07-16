---
name: "Mercantile Ledger"
accent: "#888888"
style: "OLDE TIME COUNTRY"
constitution_version: "2"
token_colors: "--bg: oklch(92% 0.02 85); --text: oklch(25% 0.02 85); --accent: oklch(45% 0.15 30); --line: oklch(80% 0.02 85); --glass: oklch(92% 0.02 85 / 0.8);"
token_typography: "--font-display: 'Vast Shadow', serif; --font-body: 'Cutive Mono', monospace; font-synthesis: none; text-rendering: optimizeLegibility;"
token_spacing: "--gap-sm: 0.5rem; --gap-md: 1.5rem; --gap-lg: 3rem; --tap-target: 44px;"
signature_gesture: "Scroll-driven 'ink stamp' reveals. As the user scrolls, badges, dates, and project metadata are animated via animation-timeline: view(), scaling down and fading in abruptly as if being stamped onto the ledger page by a heavy mercantile stamp."
---

# Design System

A high-end technical portfolio themed as an 1890s general store ledger. The design is highly structured, relying on strict CSS grids with visible 1px borders to mimic ruled paper. Copy is dry, precise, and authoritative. NO emojis, NO buzzwords. We treat the digital products as physical inventory cataloged in a historical archive. The aesthetic relies on tactile materiality achieved through CSS SVG noise filters and vintage typography.

## Locked Design Constitution

```json
{
  "name": "Mercantile Ledger",
  "accent": "Tobacco Red",
  "signatureGesture": "Scroll-driven 'ink stamp' reveals. As the user scrolls, badges, dates, and project metadata are animated via animation-timeline: view(), scaling down and fading in abruptly as if being stamped onto the ledger page by a heavy mercantile stamp.",
  "mobileStrategy": "Mobile-first single-column ledger rows. Content is stacked vertically with continuous horizontal borders. Interactive touch targets are artificially inflated to 44px using padding within the ledger cells. Navigation wraps naturally without hiding behind a hamburger menu.",
  "imageTreatment": "Cabinet Card aesthetic. Images are constrained within stiff, border-heavy containers with a slight sepia filter (sepia(0.4) contrast(1.1)) and a faint inner shadow to mimic aged, thick cardboard photographs.",
  "tokens": {
    "colors": "--bg: oklch(92% 0.02 85); --text: oklch(25% 0.02 85); --accent: oklch(45% 0.15 30); --line: oklch(80% 0.02 85); --glass: oklch(92% 0.02 85 / 0.8);",
    "typography": "--font-display: 'Vast Shadow', serif; --font-body: 'Cutive Mono', monospace; font-synthesis: none; text-rendering: optimizeLegibility;",
    "spacing": "--gap-sm: 0.5rem; --gap-md: 1.5rem; --gap-lg: 3rem; --tap-target: 44px;",
    "shape": "--radius: 4px; --border: 1px solid var(--line); --border-thick: 3px solid var(--text);",
    "motion": "--easing: cubic-bezier(0.25, 1, 0.5, 1); --stamp-duration: 0.3s;"
  },
  "classVocabulary": [
    {
      "name": "app-shell",
      "owner": "shell",
      "purpose": "Main layout wrapper and texture provider"
    },
    {
      "name": "ledger-nav",
      "owner": "shell",
      "purpose": "Global navigation constrained by ruled lines"
    },
    {
      "name": "ledger-hero",
      "owner": "home",
      "purpose": "Home page hero section with cabinet card background"
    },
    {
      "name": "inventory-grid",
      "owner": "home",
      "purpose": "Bento grid for featured projects"
    },
    {
      "name": "archive-index",
      "owner": "projects_index",
      "purpose": "Root layout for the projects archive"
    },
    {
      "name": "visual-index",
      "owner": "designs_index",
      "purpose": "Root layout for the design archive"
    },
    {
      "name": "dossier-root",
      "owner": "project_detail",
      "purpose": "Root layout for detailed project dossiers"
    },
    {
      "name": "blueprint-root",
      "owner": "design_detail",
      "purpose": "Root layout for detailed design blueprints"
    },
    {
      "name": "document-root",
      "owner": "page",
      "purpose": "Root layout for standard text pages"
    },
    {
      "name": "ledger-entry",
      "owner": "project_item",
      "purpose": "Individual project list item resembling a ledger row"
    },
    {
      "name": "cabinet-card",
      "owner": "design_item",
      "purpose": "Individual design list item resembling a vintage photo"
    },
    {
      "name": "nav-link",
      "owner": "nav_item",
      "purpose": "Navigation anchor with 44px touch target"
    },
    {
      "name": "badge",
      "owner": "css",
      "purpose": "Injected metadata tag styled like an ink stamp"
    },
    {
      "name": "src",
      "owner": "css",
      "purpose": "Injected image source class"
    },
    {
      "name": "backlink",
      "owner": "css",
      "purpose": "Injected return link styled as a ledger reference"
    },
    {
      "name": "btn",
      "owner": "css",
      "purpose": "Injected button styled as a mercantile label"
    },
    {
      "name": "md-img",
      "owner": "css",
      "purpose": "Injected markdown image with sepia treatment"
    },
    {
      "name": "typewriter-text",
      "owner": "css",
      "purpose": "Monospace typography utility"
    },
    {
      "name": "ruled-container",
      "owner": "css",
      "purpose": "Container with strict borders and subgrid alignment"
    },
    {
      "name": "stamp-reveal",
      "owner": "css",
      "purpose": "Scroll-driven animation utility class"
    },
    {
      "name": "hero-title",
      "owner": "css",
      "purpose": "Display typography for main headings"
    },
    {
      "name": "meta-data",
      "owner": "css",
      "purpose": "Small technical text for dates and roles"
    },
    {
      "name": "ink-block",
      "owner": "css",
      "purpose": "High contrast inverted block for emphasis"
    },
    {
      "name": "dust-overlay",
      "owner": "css",
      "purpose": "SVG noise filter utility"
    }
  ],
  "layoutBlueprints": {
    "shell": {
      "rootClass": "app-shell",
      "composition": "A full-viewport container with a fixed SVG noise overlay. The ledger-nav spans the top edge with a thick bottom border, housing flex-wrapped nav-links. The main content area sits below, constrained by a max-width and centered."
    },
    "home": {
      "rootClass": "ledger-hero",
      "composition": "A massive header region featuring the background-image hero asset, heavily tinted with a dark scrim to ensure text legibility. Contains a hero-title and typewriter-text introduction. Followed by the inventory-grid utilizing native CSS grid-lanes to display featured project-items."
    },
    "projects_index": {
      "rootClass": "archive-index",
      "composition": "A stacked, single-column list of ledger-entry elements. Each entry acts as a subgrid row, aligning the title, date, and badges precisely across vertical ruled lines."
    },
    "designs_index": {
      "rootClass": "visual-index",
      "composition": "A native masonry or bento grid of cabinet-card items. Thick borders separate the items, and images use the md-img class for vintage filtering."
    },
    "project_detail": {
      "rootClass": "dossier-root",
      "composition": "Opens with an ink-block header containing the project title and meta-data badges. The main body uses a ruled-container with max-width text-wrap: pretty constraints for readable typewriter-text paragraphs."
    },
    "design_detail": {
      "rootClass": "blueprint-root",
      "composition": "A large immersive view of the design asset using md-img, followed by a strict two-column grid (on desktop) detailing the specifications and context in typewriter-text."
    },
    "page": {
      "rootClass": "document-root",
      "composition": "A simple, centralized ruled-container for standard markdown content like the About or Contact pages, mimicking a typed letter on general store stationery."
    },
    "project_item": {
      "rootClass": "ledger-entry",
      "composition": "A horizontal flex or subgrid row containing the project title, a stamp-reveal badge, and a brief typewriter-text description. Borders divide each row."
    },
    "design_item": {
      "rootClass": "cabinet-card",
      "composition": "A vertically stacked card with a thick border, containing a constrained md-img and a small meta-data caption bar below it."
    },
    "nav_item": {
      "rootClass": "nav-link",
      "composition": "A simple anchor element with explicit 44px minimum height padding and typewriter-text styling. Displays a kinetic hover effect that underlines the text with a thick tobacco-red line."
    }
  }
}
```

## section:css

```css
@import url('https://fonts.googleapis.com/css2?family=Cutive+Mono&family=Vast+Shadow&display=swap'); :root { --bg: oklch(92% 0.02 85); --text: oklch(25% 0.02 85); --accent: oklch(45% 0.15 30); --line: oklch(80% 0.02 85); --glass: oklch(92% 0.02 85 / 0.8); --font-display: 'Vast Shadow', serif; --font-body: 'Cutive Mono', monospace; --gap-sm: 0.5rem; --gap-md: 1.5rem; --gap-lg: 3rem; --tap-target: 44px; --radius: 4px; --border: 1px solid var(--line); --border-thick: 3px solid var(--text); --easing: cubic-bezier(0.25, 1, 0.5, 1); --stamp-duration: 0.3s; } *, *::before, *::after { box-sizing: border-box; } html { font-size: 16px; scroll-behavior: smooth; } body { margin: 0; background-color: var(--bg); color: var(--text); font-family: var(--font-body); font-synthesis: none; text-rendering: optimizeLegibility; line-height: 1.5; overflow-x: hidden; } h1, h2, h3, h4, h5, h6 { font-family: var(--font-display); font-weight: normal; margin: 0 0 var(--gap-sm) 0; } a { color: inherit; text-decoration: none; } img, picture, svg { max-width: 100%; display: block; } .dust-overlay { position: fixed; inset: 0; pointer-events: none; z-index: 9999; background: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.05%22/%3E%3C/svg%3E'); } .app-shell { display: flex; flex-direction: column; min-height: 100vh; position: relative; } .ledger-nav { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; padding: var(--gap-sm) var(--gap-md); border-bottom: var(--border-thick); background: var(--glass); backdrop-filter: blur(8px); position: sticky; top: 0; z-index: 100; } .nav-link { display: inline-flex; align-items: center; justify-content: center; min-height: var(--tap-target); min-width: var(--tap-target); padding: 0 var(--gap-sm); font-family: var(--font-body); text-transform: uppercase; letter-spacing: 0.05em; position: relative; transition: color 0.2s ease; } .nav-link::after { content: ''; position: absolute; bottom: 8px; left: 0; width: 100%; height: 3px; background-color: var(--accent); transform: scaleX(0); transform-origin: right; transition: transform 0.3s var(--easing); } .nav-link:hover::after, .nav-link.active::after { transform: scaleX(1); transform-origin: left; } .ledger-hero { display: flex; flex-direction: column; justify-content: center; min-height: 70vh; padding: var(--gap-lg) var(--gap-md); position: relative; background-image: url('assets/hero.jpg'); background-size: cover; background-position: center; border-bottom: var(--border-thick); } .ledger-hero::before { content: ''; position: absolute; inset: 0; background: rgba(0,0,0,0.65); z-index: 1; } .ledger-hero > * { position: relative; z-index: 2; color: var(--bg); max-width: 800px; } .hero-title { font-size: clamp(2rem, 8vw, 4.5rem); line-height: 1.1; margin-bottom: var(--gap-md); text-shadow: 2px 2px 0px rgba(0,0,0,0.8); } .typewriter-text { font-family: var(--font-body); font-size: 1.125rem; } .inventory-grid { display: grid; grid-template-columns: 1fr; gap: var(--gap-md); padding: var(--gap-md); border-bottom: var(--border); } .archive-index { display: flex; flex-direction: column; padding: var(--gap-md); } .visual-index { display: grid; grid-template-columns: 1fr; gap: var(--gap-lg); padding: var(--gap-md); } .dossier-root { display: flex; flex-direction: column; padding: var(--gap-md); } .blueprint-root { display: flex; flex-direction: column; padding: var(--gap-md); } .document-root { display: flex; flex-direction: column; padding: var(--gap-md); max-width: 800px; margin: 0 auto; } .ledger-entry { display: flex; flex-direction: column; padding: var(--gap-md) 0; border-bottom: var(--border); position: relative; } .cabinet-card { border: var(--border-thick); padding: var(--gap-sm); background: var(--bg); box-shadow: inset 0 0 20px rgba(0,0,0,0.05); display: flex; flex-direction: column; gap: var(--gap-sm); } .badge { display: inline-flex; align-items: center; justify-content: center; padding: 0.25rem 0.5rem; font-size: 0.75rem; text-transform: uppercase; border: 2px solid var(--accent); color: var(--accent); font-weight: bold; transform-origin: center; } .src { display: block; margin-top: var(--gap-md); word-break: break-all; font-size: 0.875rem; color: var(--text); opacity: 0.7; } .backlink { display: inline-flex; align-items: center; min-height: var(--tap-target); text-decoration: underline; text-underline-offset: 4px; text-decoration-color: var(--accent); margin-bottom: var(--gap-md); } .btn { display: inline-flex; align-items: center; justify-content: center; min-height: var(--tap-target); padding: 0 var(--gap-md); border: var(--border-thick); background: transparent; color: var(--text); text-transform: uppercase; font-family: var(--font-body); font-weight: bold; cursor: pointer; transition: all 0.2s ease; } .btn:hover { background: var(--text); color: var(--bg); } .md-img { filter: sepia(0.4) contrast(1.1); border: var(--border); width: 100%; height: auto; object-fit: cover; } .ruled-container { border: var(--border-thick); padding: var(--gap-md); background: repeating-linear-gradient(to bottom, transparent, transparent 1.45rem, var(--line) 1.5rem); background-attachment: local; line-height: 1.5rem; } .meta-data { font-size: 0.875rem; text-transform: uppercase; opacity: 0.8; } .ink-block { background: var(--text); color: var(--bg); padding: var(--gap-lg) var(--gap-md); margin-bottom: var(--gap-lg); border-bottom: 4px solid var(--accent); } @supports (animation-timeline: view()) { .stamp-reveal { opacity: 0; transform: scale(1.5) rotate(-5deg); animation: ink-stamp var(--stamp-duration) var(--easing) forwards; animation-timeline: view(); animation-range: entry 10% cover 30%; } } @keyframes ink-stamp { to { opacity: 1; transform: scale(1) rotate(0deg); } } @media (min-width: 768px) { .inventory-grid { grid-template-columns: repeat(2, 1fr); } .archive-index .ledger-entry { flex-direction: row; align-items: center; justify-content: space-between; } .visual-index { grid-template-columns: repeat(2, 1fr); } .blueprint-root { display: grid; grid-template-columns: 2fr 1fr; gap: var(--gap-lg); align-items: start; } } @media (min-width: 1024px) { .inventory-grid { grid-template-columns: repeat(3, 1fr); } .visual-index { grid-template-columns: repeat(3, 1fr); } } .nav-bar img[src*='gi-logo-transparent'], header img[src*='gi-logo-transparent'], .nav-bar img[src*='assets/logo'], header img[src*='assets/logo'] { display: block; inline-size: min(11.25rem, 48vw) !important; block-size: 3.5rem !important; max-inline-size: 100% !important; max-block-size: 3.5rem !important; object-fit: contain !important; object-position: left center !important; } .verified-brand-mark { inline-size: min(11.25rem, 48vw) !important; block-size: 3.5rem !important; max-inline-size: 100% !important; max-block-size: 3.5rem !important; object-fit: contain !important; } .logo-tile { display: flex !important; align-items: center !important; justify-content: center !important; inline-size: 100% !important; min-inline-size: 0 !important; max-inline-size: 100% !important; overflow: hidden !important; } .logo-tile img { display: block !important; inline-size: 100% !important; min-inline-size: 0 !important; max-inline-size: 100% !important; block-size: auto !important; max-block-size: 18rem !important; object-fit: contain !important; } .nav-links { display: flex !important; flex-wrap: wrap !important; align-items: center !important; gap: .25rem 1rem !important; min-inline-size: 0 !important; } .nav-links a { display: inline-flex !important; align-items: center !important; min-block-size: 44px !important; white-space: nowrap !important; } .badge { margin: .2rem !important; } .tl-default { display: none !important; } .tl-custom { display: flex; flex-wrap: wrap; align-items: center; } @media (prefers-reduced-motion: no-preference) { .gi-reveal { opacity: 0; transform: translateY(28px); transition: opacity .7s ease, transform .7s cubic-bezier(.2,.7,.2,1); transition-delay: var(--gi-stagger, 0s); } .gi-reveal.gi-in { opacity: 1; transform: none; } } .ledger-entry { display: flex !important; flex-flow: row wrap !important; align-items: center !important; justify-content: space-between !important; gap: var(--gap-md, 1.5rem) !important; width: 100% !important; box-sizing: border-box !important; } .ledger-entry .typewriter-text, .ledger-entry p, .ledger-entry span:not(.badge) { flex: 1 1 280px !important; min-width: 0 !important; word-wrap: break-word !important; overflow-wrap: break-word !important; } .ledger-entry .badge { display: inline-flex !important; position: relative !important; flex-shrink: 0 !important; margin: 0.15rem !important; } @media (max-width: 767px) { .ledger-entry { flex-direction: column !important; align-items: flex-start !important; gap: var(--gap-sm, 0.5rem) !important; } .ledger-entry .typewriter-text, .ledger-entry p, .ledger-entry span:not(.badge) { flex: none !important; width: 100% !important; } } .document-root { background-color: var(--bg, oklch(92% 0.02 85)) !important; color: var(--text, oklch(25% 0.02 85)) !important; } .document-root p { color: var(--text, oklch(25% 0.02 85)) !important; } .document-root a { color: var(--accent, oklch(45% 0.15 30)) !important; text-decoration: underline !important; } .document-root a:hover { color: var(--text, oklch(25% 0.02 85)) !important; } .ink-block { background-color: var(--text, oklch(25% 0.02 85)) !important; color: var(--bg, oklch(92% 0.02 85)) !important; } .ink-block p { color: var(--bg, oklch(92% 0.02 85)) !important; } .ink-block a { color: var(--bg, oklch(92% 0.02 85)) !important; text-decoration: underline !important; } .ink-block a:hover { color: var(--line, oklch(80% 0.02 85)) !important; }
```

## section:layout:shell

```html
<div class="app-shell dust-overlay"><header class="ledger-nav ruled-container">{{NAV_LINKS}}{{THEME_PILLS}}</header><main class="ruled-container">{{CONTENT}}</main><footer class="ink-block meta-data">{{SOURCE_PATH}}</footer></div>
```

## section:layout:home

```html
<section class="ledger-hero"><header class="ink-block stamp-reveal"><h1 class="hero-title">{{HEADLINE}}</h1><p class="typewriter-text">{{TAGLINE}}</p><div class="meta-data">{{INTRO}}</div></header><div class="ruled-container"><div class="badge">{{FEATURED_COUNT}}</div><div class="inventory-grid">{{FEATURED_PROJECTS}}</div></div></section>
```

## section:layout:projects_index

```html
<div class="archive-index ruled-container"><div class="ink-block stamp-reveal"><span class="meta-data">{{PROJECT_COUNT}}</span></div><div class="typewriter-text">{{PROJECT_LIST}}</div></div>
```

## section:layout:designs_index

```html
<section class="visual-index ruled-container"><div class="ink-block stamp-reveal"><div class="meta-data typewriter-text">{{DESIGN_COUNT}}</div></div>{{DESIGN_CARDS}}</section>
```

## section:layout:project_detail

```html
<section class="dossier-root"><header class="ink-block stamp-reveal"><div class="meta-data">{{BACKLINK}}</div><h1 class="hero-title">{{NAME}}</h1><div class="meta-data">{{ROLE}}</div><div class="meta-data">{{YEAR}}</div></header><div class="ruled-container"><div class="dust-overlay"></div><figure class="cabinet-card">{{LOGO}}</figure><div class="typewriter-text stamp-reveal">{{DESCRIPTION}}</div><div class="typewriter-text">{{CONTENT}}</div><div class="meta-data">{{TECH_BADGES}}</div><div class="meta-data stamp-reveal">{{PROJECT_LINK}} {{REPO_LINK}}</div></div><div class="meta-data">{{SOURCE_PATH}}</div></section>
```

## section:layout:design_detail

```html
<section class="blueprint-root dust-overlay"><header class="ink-block ruled-container stamp-reveal"><h1 class="hero-title">{{NAME}}</h1><span class="badge">{{YEAR}}</span><span class="badge">{{CLIENT}}</span><span class="badge">{{ROLE}}</span></header><figure class="cabinet-card ruled-container"><img src="{{PREVIEW}}" alt="{{NAME}}" class="md-img" /></figure><div class="ruled-container typewriter-text stamp-reveal"><span class="badge">{{TAG_BADGES}}</span><p>{{DESCRIPTION}}</p><a href="{{LINK_URL}}" class="btn">{{NAME}}</a></div><div class="ruled-container typewriter-text">{{CONTENT}}</div><footer class="ruled-container meta-data stamp-reveal"><span class="backlink">{{BACKLINK}}</span><span class="src">{{SOURCE_PATH}}</span></footer></section>
```

## section:layout:page

```html
<div class="document-root dust-overlay"><div class="ink-block stamp-reveal"><h1 class="hero-title">{{NAME}}</h1><span class="meta-data">{{SOURCE_PATH}}</span></div><div class="ruled-container typewriter-text">{{CONTENT}}</div></div>
```

## section:layout:project_item

```html
<article class="ledger-entry ruled-container"><span class="meta-data">{{INDEX}}</span><figure class="cabinet-card">{{LOGO}}</figure><div class="ink-block"><a href="{{URL}}" class="btn"><h3 class="hero-title">{{NAME}}</h3></a><time class="meta-data">{{YEAR}}</time></div><div class="typewriter-text">{{DESCRIPTION}}</div><div class="stamp-reveal badge">{{TECH_BADGES}}</div></article>
```

## section:layout:design_item

```html
<a href="{{URL}}" class="cabinet-card stamp-reveal"><img src="{{PREVIEW}}" alt="{{NAME}}" class="md-img src" /><div class="ruled-container"><h3 class="ink-block typewriter-text">{{NAME}}</h3><div class="meta-data"><span>{{CLIENT}}</span> <span>{{YEAR}}</span></div><p class="typewriter-text">{{DESCRIPTION}}</p><div class="stamp-reveal">{{TAG_BADGES}}</div></div></a>
```

## section:layout:nav_item

```html
<a href="{{NAV_URL}}" class="nav-link typewriter-text {{NAV_ACTIVE_CLASS}}">{{NAV_NAME}}</a>
```
