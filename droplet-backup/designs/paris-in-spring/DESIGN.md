---
name: "L'Heure Bleue"
accent: "#888888"
style: "Paris in spring"
constitution_version: "2"
token_colors: "--twilight-base: oklch(18% 0.04 260); --twilight-surface: oklch(24% 0.05 260); --iron-grid: oklch(12% 0.02 260); --text-primary: oklch(95% 0.02 260); --text-muted: oklch(75% 0.04 260); --spring-blush: oklch(80% 0.12 350); --lamp-gold: oklch(85% 0.15 80);"
token_typography: "--font-display: 'Ogg', 'Playfair Display', serif; --font-body: 'JetBrains Mono', 'Geist Mono', monospace; --font-weight-display: 400; --font-weight-body: 400;"
token_spacing: "--space-4: 0.25rem; --space-8: 0.5rem; --space-16: 1rem; --space-24: 1.5rem; --space-48: 3rem; --space-96: 6rem; --grid-gap: 1px; --touch-target: 44px;"
signature_gesture: "Scroll-Driven Twilight Emergence. As the user scrolls down the bento grid, structural elements and project cards fade upward with a slight, hardware-accelerated scale effect driven directly by `animation-timeline: view()`. The staggered reveal mimics the turning on of city streetlamps as dusk settles over the grid."
---

# Design System

A high-end, editorial interpretation of a Parisian spring twilight mapped onto a dark, austere technical portfolio. The system relies on a deep indigo baseline cut by precise, 1px wrought-iron structural grids. Lighting is simulated via OKLCH color variables, producing a 'blue hour' glow accented by soft spring pinks and streetlamp golds. The aesthetic balances the romanticism of the subject with the rigid, mathematical reality of AI engineering. Typography juxtaposes classic European editorial serifs with stark, functional monospace data points.

## Locked Design Constitution

```json
{
  "name": "L'Heure Bleue",
  "accent": "oklch(80% 0.12 350)",
  "signatureGesture": "Scroll-Driven Twilight Emergence. As the user scrolls down the bento grid, structural elements and project cards fade upward with a slight, hardware-accelerated scale effect driven directly by `animation-timeline: view()`. The staggered reveal mimics the turning on of city streetlamps as dusk settles over the grid.",
  "mobileStrategy": "Strict mobile-first linear bento tracks. The navigation is permanently visible at the top, wrapping naturally into a compact configuration below 768px with explicit 44px touch targets. All grids default to a single fluid column `minmax(0, 1fr)` to prevent multi-column text collision, expanding via `min-width` media queries to multi-lane bento grids on desktop.",
  "imageTreatment": "Photography is treated with a moody, high-contrast twilight grade. Shadows are crushed into deep blues, while highlights retain a warm, low-angle spring light. A subtle SVG noise overlay encodes texture directly into the CSS, removing the sterile digital feel without compromising performance.",
  "tokens": {
    "colors": "--twilight-base: oklch(18% 0.04 260); --twilight-surface: oklch(24% 0.05 260); --iron-grid: oklch(12% 0.02 260); --text-primary: oklch(95% 0.02 260); --text-muted: oklch(75% 0.04 260); --spring-blush: oklch(80% 0.12 350); --lamp-gold: oklch(85% 0.15 80);",
    "typography": "--font-display: 'Ogg', 'Playfair Display', serif; --font-body: 'JetBrains Mono', 'Geist Mono', monospace; --font-weight-display: 400; --font-weight-body: 400;",
    "spacing": "--space-4: 0.25rem; --space-8: 0.5rem; --space-16: 1rem; --space-24: 1.5rem; --space-48: 3rem; --space-96: 6rem; --grid-gap: 1px; --touch-target: 44px;",
    "shape": "--radius-zero: 0px; --radius-sm: 2px;",
    "motion": "--timing-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275); --duration-fast: 200ms; --duration-slow: 600ms;"
  },
  "classVocabulary": [
    {
      "name": "badge",
      "owner": "css",
      "purpose": "Injected runtime class for metadata labels"
    },
    {
      "name": "src",
      "owner": "css",
      "purpose": "Injected runtime class for source links"
    },
    {
      "name": "backlink",
      "owner": "css",
      "purpose": "Injected runtime class for navigation return paths"
    },
    {
      "name": "btn",
      "owner": "css",
      "purpose": "Injected runtime class for interactive triggers"
    },
    {
      "name": "md-img",
      "owner": "css",
      "purpose": "Injected runtime class for markdown imagery"
    },
    {
      "name": "shell-root",
      "owner": "shell",
      "purpose": "Main layout wrapper and global context provider"
    },
    {
      "name": "global-header",
      "owner": "shell",
      "purpose": "Top navigation container, wraps on mobile"
    },
    {
      "name": "primary-nav",
      "owner": "shell",
      "purpose": "Visible site routing links"
    },
    {
      "name": "main-content",
      "owner": "shell",
      "purpose": "Viewport container for injected layouts"
    },
    {
      "name": "global-footer",
      "owner": "shell",
      "purpose": "Bottom metadata and closing information"
    },
    {
      "name": "home-root",
      "owner": "home",
      "purpose": "Landing page wrapper"
    },
    {
      "name": "hero-twilight",
      "owner": "home",
      "purpose": "Primary visual entry containing the background-image"
    },
    {
      "name": "intro-thesis",
      "owner": "home",
      "purpose": "Typographic block for the main structural statement"
    },
    {
      "name": "featured-work",
      "owner": "home",
      "purpose": "Bento grid container for highlighted items"
    },
    {
      "name": "projects-root",
      "owner": "projects_index",
      "purpose": "Index wrapper for all engineering work"
    },
    {
      "name": "project-grid",
      "owner": "projects_index",
      "purpose": "Native masonry container for project cards"
    },
    {
      "name": "designs-root",
      "owner": "designs_index",
      "purpose": "Index wrapper for visual design work"
    },
    {
      "name": "design-gallery",
      "owner": "designs_index",
      "purpose": "Grid layout for visual previews"
    },
    {
      "name": "project-detail-root",
      "owner": "project_detail",
      "purpose": "Wrapper for individual engineering case studies"
    },
    {
      "name": "project-header",
      "owner": "project_detail",
      "purpose": "Title and high-level architectural metadata"
    },
    {
      "name": "project-body",
      "owner": "project_detail",
      "purpose": "Main markdown content container"
    },
    {
      "name": "tech-specs",
      "owner": "project_detail",
      "purpose": "Sidebar or structured area for stack details"
    },
    {
      "name": "design-detail-root",
      "owner": "design_detail",
      "purpose": "Wrapper for individual design studies"
    },
    {
      "name": "design-showcase",
      "owner": "design_detail",
      "purpose": "Container for full-bleed or large-format imagery"
    },
    {
      "name": "design-meta",
      "owner": "design_detail",
      "purpose": "Context and specification data for the design"
    },
    {
      "name": "page-root",
      "owner": "page",
      "purpose": "Wrapper for standard text pages (about, contact)"
    },
    {
      "name": "page-prose",
      "owner": "page",
      "purpose": "Constrained reading column for standard text"
    },
    {
      "name": "contact-grid",
      "owner": "page",
      "purpose": "Structured layout for communication channels"
    },
    {
      "name": "project-card",
      "owner": "project_item",
      "purpose": "Individual bento item representing a project"
    },
    {
      "name": "project-title",
      "owner": "project_item",
      "purpose": "Typography for project name"
    },
    {
      "name": "project-meta",
      "owner": "project_item",
      "purpose": "Container for project badges and dates"
    },
    {
      "name": "design-card",
      "owner": "design_item",
      "purpose": "Individual gallery item for a visual piece"
    },
    {
      "name": "design-visual",
      "owner": "design_item",
      "purpose": "Image container within the design card"
    },
    {
      "name": "nav-link",
      "owner": "nav_item",
      "purpose": "Interactive link element with 44px touch target"
    },
    {
      "name": "nav-indicator",
      "owner": "nav_item",
      "purpose": "Visual mark denoting active state"
    }
  ],
  "layoutBlueprints": {
    "shell": {
      "rootClass": "shell-root",
      "composition": "A rigid full-height flex column. 'global-header' sits at the top, housing 'primary-nav' with wrapping flex items to ensure mobile legibility. Below is 'main-content', expanding to fill space, and finally 'global-footer'."
    },
    "home": {
      "rootClass": "home-root",
      "composition": "Opens with 'hero-twilight' occupying the top section (receives the exact background-image). 'intro-thesis' overlays or sits immediately below with stark editorial typography. 'featured-work' follows as a CSS Grid bento layout with 1px gaps."
    },
    "projects_index": {
      "rootClass": "projects-root",
      "composition": "A linear flow starting with a bold typographic header. 'project-grid' establishes a responsive bento/masonry grid where 'project_item' fragments are injected."
    },
    "designs_index": {
      "rootClass": "designs-root",
      "composition": "Similar to projects, but 'design-gallery' uses a denser grid structure optimized for visual aspect ratios rather than text metadata."
    },
    "project_detail": {
      "rootClass": "project-detail-root",
      "composition": "A split-pane or clearly delineated vertical flow. 'project-header' holds the title and 'tech-specs'. 'project-body' contains the injected markdown in a constrained, single-column reading width."
    },
    "design_detail": {
      "rootClass": "design-detail-root",
      "composition": "Focuses heavily on 'design-showcase' to let the visuals breathe, with 'design-meta' anchoring the bottom or side in a strict monospace readout."
    },
    "page": {
      "rootClass": "page-root",
      "composition": "A simple, highly legible structure. 'page-prose' handles text paragraphs with 'text-wrap: pretty', while 'contact-grid' (if applicable) structures links in a neat bento row."
    },
    "project_item": {
      "rootClass": "project-card",
      "composition": "A single block with strict padding. Contains 'project-title' and 'project-meta', utilizing view-timeline scroll animations to fade up."
    },
    "design_item": {
      "rootClass": "design-card",
      "composition": "A container focused on 'design-visual' (the image), with minimal text overlay or below-image text to keep focus on the asset."
    },
    "nav_item": {
      "rootClass": "nav-link",
      "composition": "A text node combined with an optional 'nav-indicator'. Styled to ensure minimum 44px tap area via padding."
    }
  }
}
```

## section:css

```css
:root { --twilight-base: oklch(18% 0.04 260); --twilight-surface: oklch(24% 0.05 260); --iron-grid: oklch(12% 0.02 260); --text-primary: oklch(95% 0.02 260); --text-muted: oklch(75% 0.04 260); --spring-blush: oklch(80% 0.12 350); --lamp-gold: oklch(85% 0.15 80); --font-display: 'Ogg', 'Playfair Display', serif; --font-body: 'JetBrains Mono', 'Geist Mono', monospace; --font-weight-display: 400; --font-weight-body: 400; --space-4: 0.25rem; --space-8: 0.5rem; --space-16: 1rem; --space-24: 1.5rem; --space-48: 3rem; --space-96: 6rem; --grid-gap: 1px; --touch-target: 44px; --radius-zero: 0px; --radius-sm: 2px; --timing-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275); --duration-fast: 200ms; --duration-slow: 600ms; } *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { background-color: var(--twilight-base); color: var(--text-primary); font-family: var(--font-body); font-weight: var(--font-weight-body); line-height: 1.5; -webkit-font-smoothing: antialiased; position: relative; } body::before { content: ''; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 9999; opacity: 0.04; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E"); } h1, h2, h3, h4 { font-family: var(--font-display); font-weight: var(--font-weight-display); font-style: normal; } img, picture, video, canvas, svg { display: block; max-width: 100%; height: auto; } a { color: inherit; text-decoration: none; } .badge { display: inline-flex; align-items: center; justify-content: center; padding: 0 var(--space-8); height: 24px; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; background: var(--twilight-surface); color: var(--spring-blush); border: 1px solid var(--iron-grid); border-radius: var(--radius-sm); } .src, .backlink { display: inline-flex; align-items: center; min-height: var(--touch-target); padding: var(--space-8) 0; font-size: 0.875rem; color: var(--text-muted); transition: color var(--duration-fast) ease; } .src:hover, .backlink:hover { color: var(--lamp-gold); } .btn { display: inline-flex; align-items: center; justify-content: center; min-height: var(--touch-target); min-width: var(--touch-target); padding: var(--space-8) var(--space-16); background: var(--text-primary); color: var(--twilight-base); font-family: var(--font-body); text-transform: uppercase; font-size: 0.875rem; letter-spacing: 0.05em; border-radius: var(--radius-sm); cursor: pointer; transition: transform var(--duration-fast) var(--timing-spring), background var(--duration-fast) ease; } .btn:hover { background: var(--lamp-gold); transform: translateY(-2px); } .md-img { width: 100%; border: 1px solid var(--iron-grid); border-radius: var(--radius-sm); margin: var(--space-24) 0; } .gi-reveal { opacity: 0; transform: translateY(20px); transition: opacity var(--duration-slow) ease, transform var(--duration-slow) var(--timing-spring); } .gi-reveal.gi-in { opacity: 1; transform: translateY(0); } .shell-root { display: flex; flex-direction: column; min-height: 100vh; } .global-header { padding: var(--space-16); border-bottom: 1px solid var(--iron-grid); display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-16); background: var(--twilight-base); position: sticky; top: 0; z-index: 100; } .primary-nav { display: flex; flex-wrap: wrap; gap: var(--space-8); } .main-content { flex: 1 1 auto; width: 100%; display: flex; flex-direction: column; } .global-footer { padding: var(--space-24) var(--space-16); border-top: 1px solid var(--iron-grid); text-align: center; font-size: 0.875rem; color: var(--text-muted); } .home-root, .projects-root, .designs-root, .project-detail-root, .design-detail-root, .page-root { display: flex; flex-direction: column; width: 100%; } .hero-twilight { min-height: 60vh; display: flex; align-items: flex-end; padding: var(--space-24) var(--space-16); background: linear-gradient(to bottom, rgba(30,30,40,0.2) 0%, var(--twilight-base) 100%), url('assets/hero.jpg') center/cover no-repeat; border-bottom: 1px solid var(--iron-grid); } .intro-thesis { padding: var(--space-48) var(--space-16); font-family: var(--font-display); font-size: 2rem; line-height: 1.2; max-width: 30ch; color: var(--text-primary); } .featured-work, .project-grid, .design-gallery, .contact-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--grid-gap); background: var(--iron-grid); border-top: 1px solid var(--iron-grid); border-bottom: 1px solid var(--iron-grid); } .project-card, .design-card { background: var(--twilight-base); padding: var(--space-24) var(--space-16); display: flex; flex-direction: column; gap: var(--space-16); text-decoration: none; position: relative; overflow: hidden; } .design-card { padding: 0; } .project-title { font-family: var(--font-display); font-size: 1.5rem; color: var(--text-primary); margin-bottom: var(--space-4); } .project-meta { display: flex; flex-wrap: wrap; gap: var(--space-8); font-size: 0.875rem; color: var(--text-muted); } .design-visual { width: 100%; aspect-ratio: 4/3; object-fit: cover; border-bottom: 1px solid var(--iron-grid); filter: contrast(1.1) brightness(0.9); transition: filter var(--duration-fast) ease; } .design-card:hover .design-visual { filter: contrast(1.2) brightness(1.1); } .project-header, .design-showcase { padding: var(--space-48) var(--space-16); border-bottom: 1px solid var(--iron-grid); } .tech-specs, .design-meta { padding: var(--space-24) var(--space-16); background: var(--twilight-surface); font-size: 0.875rem; border-bottom: 1px solid var(--iron-grid); display: flex; flex-direction: column; gap: var(--space-8); } .project-body, .page-prose { padding: var(--space-48) var(--space-16); max-width: 65ch; margin: 0 auto; width: 100%; font-size: 1rem; color: var(--text-primary); } .project-body p, .page-prose p { margin-bottom: var(--space-24); text-wrap: pretty; } .project-body h2, .page-prose h2 { font-size: 1.5rem; margin: var(--space-48) 0 var(--space-16) 0; color: var(--lamp-gold); } .nav-link { display: inline-flex; align-items: center; justify-content: center; min-height: var(--touch-target); min-width: var(--touch-target); padding: 0 var(--space-16); font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); position: relative; transition: color var(--duration-fast) ease; } .nav-link:hover { color: var(--text-primary); } .nav-indicator { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; border-radius: 50%; background: var(--spring-blush); } @media (min-width: 768px) { .intro-thesis { font-size: 3rem; padding: var(--space-96) var(--space-24); } .featured-work, .project-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .design-gallery { grid-template-columns: repeat(3, minmax(0, 1fr)); } .global-header, .global-footer, .hero-twilight { padding-left: var(--space-24); padding-right: var(--space-24); } .project-card, .tech-specs, .design-meta { padding: var(--space-48) var(--space-24); } .project-detail-root { flex-direction: row; flex-wrap: wrap; } .project-header { width: 100%; padding-left: var(--space-24); padding-right: var(--space-24); } .tech-specs { width: 300px; border-bottom: none; border-right: 1px solid var(--iron-grid); } .project-body { width: calc(100% - 300px); margin: 0; padding: var(--space-48) var(--space-24); } } @media (min-width: 1024px) { .featured-work { grid-template-columns: repeat(3, minmax(0, 1fr)); } } @supports (animation-timeline: view()) { @media (prefers-reduced-motion: no-preference) { .project-card, .design-card { opacity: 0; transform: translateY(40px) scale(0.98); animation: twilight-emerge linear both; animation-timeline: view(); animation-range: entry 10% cover 25%; } } } @keyframes twilight-emerge { to { opacity: 1; transform: translateY(0) scale(1); } }

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


/* review-board fix layer (pass 2) */
:root{--twilight-base:oklch(18% 0.04 260);--twilight-surface:oklch(24% 0.05 260);--iron-grid:oklch(12% 0.02 260);--text-primary:oklch(95% 0.02 260);--text-muted:oklch(75% 0.04 260);--spring-blush:oklch(80% 0.12 350);--lamp-gold:oklch(85% 0.15 80);--grid-gap:1px;--font-display:'Ogg','Playfair Display',serif;--font-body:'JetBrains Mono','Geist Mono',monospace;}.featured-work,.project-grid,.design-gallery{display:grid !important;gap:var(--grid-gap,1px) !important;background-color:var(--iron-grid) !important;padding:var(--grid-gap,1px) !important;border:1px solid var(--iron-grid) !important;}.project-card,.design-card{background-color:var(--twilight-surface) !important;color:var(--text-primary) !important;margin:0 !important;height:100% !important;display:flex !important;flex-direction:column !important;justify-content:space-between !important;transition:background-color 200ms cubic-bezier(0.175,0.885,0.32,1.275);}.project-card:hover,.design-card:hover{background-color:oklch(28% 0.06 260) !important;}.badge{background-color:var(--iron-grid) !important;color:var(--spring-blush) !important;border:1px solid var(--spring-blush) !important;padding:0.25rem 0.5rem !important;font-family:var(--font-body) !important;font-size:0.75rem !important;text-transform:uppercase !important;letter-spacing:0.05em !important;}.btn,.src,.backlink{min-height:44px !important;display:inline-flex !important;align-items:center !important;padding:0 1rem !important;font-family:var(--font-body) !important;color:var(--lamp-gold) !important;text-decoration:none !important;transition:color 200ms ease !important;}.btn:hover,.src:hover,.backlink:hover{color:var(--spring-blush) !important;}.design-visual img,.md-img{max-width:100% !important;height:auto !important;object-fit:cover !important;display:block !important;}
```

## section:layout:shell

```html
<div class="shell-root"><header class="global-header"><nav class="primary-nav">{{NAV_LINKS}}</nav></header><main class="main-content">{{CONTENT}}</main><footer class="global-footer">{{THEME_PILLS}}{{SOURCE_PATH}}</footer></div>
```

## section:layout:home

```html
<section class="home-root"><header class="hero-twilight"><h1>{{HEADLINE}}</h1><p>{{TAGLINE}}</p></header><article class="intro-thesis"><p>{{INTRO}}</p><span>{{FEATURED_COUNT}}</span></article><div class="featured-work">{{FEATURED_PROJECTS}}</div></section>
```

## section:layout:projects_index

```html
<section class="projects-root"><div class="badge">{{PROJECT_COUNT}}</div><div class="project-grid">{{PROJECT_LIST}}</div></section>
```

## section:layout:designs_index

```html
<div class="designs-root"><div class="badge">{{DESIGN_COUNT}}</div><div class="design-gallery">{{DESIGN_CARDS}}</div></div>
```

## section:layout:project_detail

```html
<article class="project-detail-root"><header class="project-header"><div>{{BACKLINK}}</div><div>{{LOGO}}</div><h1>{{NAME}}</h1><div>{{DESCRIPTION}}</div><aside class="tech-specs"><div>{{ROLE}}</div><div>{{YEAR}}</div><div>{{TECH_BADGES}}</div><div>{{PROJECT_LINK}}</div><div>{{REPO_LINK}}</div><div>{{SOURCE_PATH}}</div></aside></header><section class="project-body">{{CONTENT}}</section></article>
```

## section:layout:design_detail

```html
<section class="design-detail-root"><header class="design-meta"><a class="btn" href="{{LINK_URL}}">{{NAME}}</a><p>{{DESCRIPTION}}</p><span class="badge">{{TAG_BADGES}}</span><span class="src">{{SOURCE_PATH}}</span><span class="backlink">{{BACKLINK}}</span></header><figure class="design-showcase"><img class="md-img" src="{{PREVIEW}}" alt="" /></figure><div class="page-prose">{{CONTENT}}</div></section>
```

## section:layout:page

```html
<section class="page-root"><div class="page-prose"><h1 class="badge">{{NAME}}</h1>{{CONTENT}}</div><div class="contact-grid"><span class="src">{{SOURCE_PATH}}</span></div></section>
```

## section:layout:project_item

```html
<article class="project-card"><a href="{{URL}}">{{LOGO}}</a><h3 class="project-title"><a href="{{URL}}">{{NAME}}</a></h3><p>{{DESCRIPTION}}</p><div class="project-meta">{{INDEX}}{{YEAR}}{{TECH_BADGES}}<a href="{{REPO_URL}}" class="src"></a></div></article>
```

## section:layout:design_item

```html
<section class="design-card"><a href="{{URL}}" class="design-visual"><img class="md-img" src="{{PREVIEW}}" alt="{{NAME}}" /></a><div class="project-meta"><h3 class="project-title">{{NAME}}</h3>{{TAG_BADGES}}</div></section>
```

## section:layout:nav_item

```html
<a href="{{NAV_URL}}" class="nav-link {{NAV_ACTIVE_CLASS}}">{{NAV_NAME}}<span class="nav-indicator" aria-hidden="true"></span></a>
```
