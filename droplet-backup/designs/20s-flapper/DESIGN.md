---
name: "Brutalist Deco"
accent: "#888888"
style: "20S FLAPPER"
constitution_version: "2"
token_colors: "bg: oklch(15% 0.02 85), text: oklch(90% 0.02 85), accent: oklch(75% 0.15 85), surface: oklch(20% 0.02 85), rule: oklch(40% 0.05 85)"
token_typography: "display: 'Antonio', 'Oswald', sans-serif, body: 'JetBrains Mono', monospace, scale: fluid clamp from 14px to 120px"
token_spacing: "xs: 4px, sm: 8px, md: 16px, lg: 32px, xl: 64px, touch: 44px minimum"
signature_gesture: "Mechanical Brass Drawer: Hovering over metadata or badges triggers a native anchor-positioned top-layer element that slides out horizontally with a distinct, rigid easing curve, revealing secondary technical details like an antique cash register or filing cabinet."
---

# Design System

tokens: color: bg: oklch(15% 0.02 85) text: oklch(90% 0.02 85) accent: oklch(75% 0.15 85) typography: display: 'Antonio', sans-serif body: 'JetBrains Mono', monospace spacing: section_y: clamp(60px, 8vw, 120px) grid_gap: 1px layout: max_width: 1440px border_radius: 0px

## Locked Design Constitution

```json
{
  "name": "Brutalist Deco",
  "accent": "oklch(75% 0.15 85)",
  "signatureGesture": "Mechanical Brass Drawer: Hovering over metadata or badges triggers a native anchor-positioned top-layer element that slides out horizontally with a distinct, rigid easing curve, revealing secondary technical details like an antique cash register or filing cabinet.",
  "mobileStrategy": "Single-column bento stacking with rigid 1px brass borders separating all modules. Touch targets are strictly inflated via internal padding to a minimum of 44px. Navigation remains a visible, wrap-friendly typographic list at the top of the shell, avoiding hidden hamburger menus. Expansion to multi-column bento grids occurs exclusively via min-width media queries.",
  "imageTreatment": "Deep monochrome or sepia-toned with high-contrast, metallic specular highlights. SVG turbulence filters applied via CSS data URIs will provide a subtle, tactile film grain over all images, grounding them in the 1920s era.",
  "tokens": {
    "colors": "bg: oklch(15% 0.02 85), text: oklch(90% 0.02 85), accent: oklch(75% 0.15 85), surface: oklch(20% 0.02 85), rule: oklch(40% 0.05 85)",
    "typography": "display: 'Antonio', 'Oswald', sans-serif, body: 'JetBrains Mono', monospace, scale: fluid clamp from 14px to 120px",
    "spacing": "xs: 4px, sm: 8px, md: 16px, lg: 32px, xl: 64px, touch: 44px minimum",
    "shape": "radius: 0px (strict brutalist corners), border: 1px solid var(--rule), nested inner frames: 1px solid var(--accent)",
    "motion": "easing: cubic-bezier(0.76, 0, 0.24, 1) (mechanical snap), duration: 400ms, scroll-timeline: view() entry 10% cover 30%"
  },
  "classVocabulary": [
    {
      "name": "deco-shell",
      "owner": "shell",
      "purpose": "Main layout wrapper with 1px geometric borders"
    },
    {
      "name": "deco-nav",
      "owner": "shell",
      "purpose": "Top navigation container"
    },
    {
      "name": "nav-list",
      "owner": "shell",
      "purpose": "Flex container for navigation items"
    },
    {
      "name": "nav-item-link",
      "owner": "nav_item",
      "purpose": "Interactive link with 44px touch target"
    },
    {
      "name": "deco-hero",
      "owner": "home",
      "purpose": "Hero container with background image injection"
    },
    {
      "name": "hero-title",
      "owner": "home",
      "purpose": "Ultra-condensed display typography"
    },
    {
      "name": "hero-marquee",
      "owner": "home",
      "purpose": "Scrolling technical ticker"
    },
    {
      "name": "bento-grid",
      "owner": "home",
      "purpose": "Native grid container with 1px gaps"
    },
    {
      "name": "bento-cell",
      "owner": "home",
      "purpose": "Individual bento card with inner frame"
    },
    {
      "name": "projects-grid",
      "owner": "projects_index",
      "purpose": "Grid lanes layout for index"
    },
    {
      "name": "project-card",
      "owner": "project_item",
      "purpose": "Container for individual project"
    },
    {
      "name": "project-title",
      "owner": "project_item",
      "purpose": "Project heading"
    },
    {
      "name": "designs-masonry",
      "owner": "designs_index",
      "purpose": "Native masonry grid for visual work"
    },
    {
      "name": "design-card",
      "owner": "design_item",
      "purpose": "Wrapper for visual design items"
    },
    {
      "name": "design-visual",
      "owner": "design_item",
      "purpose": "Image container with SVG grain overlay"
    },
    {
      "name": "detail-header",
      "owner": "project_detail",
      "purpose": "Project detail typographic intro"
    },
    {
      "name": "detail-body",
      "owner": "project_detail",
      "purpose": "Markdown content container for projects"
    },
    {
      "name": "visual-header",
      "owner": "design_detail",
      "purpose": "Design detail title area"
    },
    {
      "name": "visual-body",
      "owner": "design_detail",
      "purpose": "Full-bleed visual asset container"
    },
    {
      "name": "page-layout",
      "owner": "page",
      "purpose": "Standard page structural wrapper"
    },
    {
      "name": "page-content",
      "owner": "page",
      "purpose": "Text-heavy page content formatting"
    },
    {
      "name": "badge",
      "owner": "css",
      "purpose": "Injected metadata pill with brass styling"
    },
    {
      "name": "src",
      "owner": "css",
      "purpose": "Injected source code link styling"
    },
    {
      "name": "backlink",
      "owner": "css",
      "purpose": "Injected contextual return link"
    },
    {
      "name": "btn",
      "owner": "css",
      "purpose": "Injected standard action button"
    },
    {
      "name": "md-img",
      "owner": "css",
      "purpose": "Injected markdown image formatting"
    },
    {
      "name": "brass-rule",
      "owner": "css",
      "purpose": "1px horizontal separator"
    },
    {
      "name": "deco-frame",
      "owner": "css",
      "purpose": "Nested concentric border utility"
    },
    {
      "name": "tarnished-bg",
      "owner": "css",
      "purpose": "Dark background utility with noise"
    },
    {
      "name": "radium-text",
      "owner": "css",
      "purpose": "Highlight text color utility"
    }
  ],
  "layoutBlueprints": {
    "shell": {
      "rootClass": "deco-shell",
      "composition": "A rigid, full-viewport container featuring a concentric 1px brass border setup. The deco-nav sits at the very top, flowing naturally into a wrap-friendly nav-list. Global chrome uses strict physical bounds with no overlapping absolute positioning. Touch targets are preserved on mobile."
    },
    "home": {
      "rootClass": "deco-hero",
      "composition": "The deco-hero occupies the top viewport segment, carrying the background-image URL and overlaid with hero-title typography. Below the hero, a bento-grid organizes featured capabilities and projects into strict geometric bento-cells, utilizing CSS subgrid to align interior data seamlessly across the parent tracks."
    },
    "projects_index": {
      "rootClass": "projects-grid",
      "composition": "A disciplined grid layout relying on minmax columns to flow project items. Uses scroll-driven entry animations to reveal each track sequentially. The layout is bounded by deco-frame utilities to maintain the architectural 1920s aesthetic."
    },
    "designs_index": {
      "rootClass": "designs-masonry",
      "composition": "Utilizes native CSS masonry (with fallback grid lanes) to tightly pack visual assets. Images are treated with SVG turbulence filters to feel tactile and printed, avoiding modern glossy web aesthetics. Minimal textual chrome, letting the visuals dominate."
    },
    "project_detail": {
      "rootClass": "detail-header",
      "composition": "Opens with a massive, ultra-condensed typographic lockup detailing the system architecture. Transitions into the detail-body, which strictly bounds markdown content, code snippets, and md-img tags within a central, highly readable column framed by brass-rules."
    },
    "design_detail": {
      "rootClass": "visual-header",
      "composition": "A stark visual-header provides context via geometric typography, leading directly into a massive, edge-to-edge visual-body container. The layout emphasizes the artifact itself, using mechanical easing for any interactive panning or zooming."
    },
    "page": {
      "rootClass": "page-layout",
      "composition": "A single-column page-layout utilizing text-wrap: pretty for the page-content. Designed for austere, business-focused text like About or Contact. Uses inset deco-frames to block out different sections of copy without relying on generic whitespace alone."
    },
    "project_item": {
      "rootClass": "project-card",
      "composition": "An interactive block representing a single technical project. Contains a project-title and metadata. Uses :has() to dim sibling project-cards when one is hovered, focusing the user's attention. Structured with internal 1px borders."
    },
    "design_item": {
      "rootClass": "design-card",
      "composition": "A tactile container for a visual preview. The design-visual houses the image, while the surrounding card provides a strict geometric frame. Hovering triggers a compositor-thread scale animation on the inner image, constrained strictly by the parent's overflow."
    },
    "nav_item": {
      "rootClass": "nav-item-link",
      "composition": "A purely functional typographic link inside the global navigation. Enforces a strict 44px minimum touch area via padding. Active states are indicated by an underline that animates in using a mechanical, zero-delay step function rather than a smooth slide."
    }
  }
}
```

## section:css

```css
:root { --bg: oklch(15% 0.02 85); --text: oklch(90% 0.02 85); --accent: oklch(75% 0.15 85); --surface: oklch(20% 0.02 85); --rule: oklch(40% 0.05 85); --ease-snap: cubic-bezier(0.76, 0, 0.24, 1); --dur: 400ms; }

body { background-color: var(--bg); color: var(--text); font-family: 'JetBrains Mono', monospace; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }

.tarnished-bg { background-color: var(--surface); background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E"); }

.brass-rule { height: 1px; background-color: var(--rule); width: 100%; border: none; margin: 0; }

.deco-frame { border: 1px solid var(--rule); padding: 16px; position: relative; }
.deco-frame::before { content: ""; position: absolute; inset: 4px; border: 1px solid var(--accent); pointer-events: none; }

.radium-text { color: var(--accent); }

.deco-shell { min-height: 100vh; display: flex; flex-direction: column; border: 1px solid var(--rule); margin: 8px; position: relative; }

.deco-nav { border-bottom: 1px solid var(--rule); padding: 16px; }

.nav-list { display: flex; flex-wrap: wrap; gap: 16px; list-style: none; margin: 0; padding: 0; }

.nav-item-link { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; min-width: 44px; padding: 0 16px; color: var(--text); text-decoration: none; font-family: 'Antonio', 'Oswald', sans-serif; text-transform: uppercase; font-size: 1.2rem; letter-spacing: 0.05em; position: relative; }
.nav-item-link.active, .nav-item-link:active { text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 4px; text-decoration-color: var(--accent); transition: none; }

.deco-hero { position: relative; min-height: 50vh; background-image: url('assets/hero.jpg'); background-size: cover; background-position: center; display: flex; flex-direction: column; justify-content: center; align-items: center; border-bottom: 1px solid var(--rule); }
.deco-hero::before { content: ""; position: absolute; inset: 0; background-color: var(--bg); opacity: 0.8; }

.hero-title { position: relative; z-index: 1; font-family: 'Antonio', 'Oswald', sans-serif; font-size: clamp(32px, 8vw, 120px); text-transform: uppercase; color: var(--accent); margin: 0; text-align: center; line-height: 1; letter-spacing: -0.02em; }

.hero-marquee { width: 100%; overflow: hidden; white-space: nowrap; border-top: 1px solid var(--rule); padding: 8px 0; font-size: 0.9rem; background: var(--surface); color: var(--accent); }

.bento-grid { display: grid; grid-template-columns: 1fr; gap: 1px; background-color: var(--rule); }
@media (min-width: 768px) { .bento-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1024px) { .bento-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

.bento-cell { background-color: var(--bg); padding: 24px; position: relative; border: 1px solid transparent; }
.bento-cell::after { content: ""; position: absolute; inset: 8px; border: 1px solid var(--accent); opacity: 0.3; pointer-events: none; }

.projects-grid { display: grid; grid-template-columns: 1fr; gap: 1px; background-color: var(--rule); }
@media (min-width: 768px) { .projects-grid { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); } }

.project-card { background-color: var(--bg); padding: 24px; position: relative; transition: opacity var(--dur) var(--ease-snap); border: 1px solid transparent; }
.projects-grid:has(.project-card:hover) .project-card:not(:hover) { opacity: 0.5; }

.project-title { font-family: 'Antonio', 'Oswald', sans-serif; font-size: 1.5rem; color: var(--text); margin: 0 0 16px 0; text-transform: uppercase; }

.designs-masonry { display: grid; grid-template-columns: 1fr; gap: 1px; background-color: var(--rule); }
@media (min-width: 768px) { .designs-masonry { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); grid-auto-rows: minmax(200px, auto); } }

.design-card { background-color: var(--bg); padding: 16px; position: relative; overflow: hidden; }

.design-visual { position: relative; width: 100%; height: 100%; overflow: hidden; }
.design-visual img, .design-visual svg { width: 100%; height: 100%; object-fit: cover; filter: sepia(0.8) contrast(1.2); transition: transform var(--dur) var(--ease-snap); }
.design-card:hover .design-visual img { transform: scale(1.05); }
.design-visual::after { content: ""; position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15' mix-blend-mode='overlay'/%3E%3C/svg%3E"); pointer-events: none; }

.detail-header, .visual-header { padding: 32px 16px; border-bottom: 1px solid var(--rule); text-align: center; }
.detail-header h1, .visual-header h1 { font-family: 'Antonio', 'Oswald', sans-serif; font-size: clamp(2rem, 5vw, 4rem); text-transform: uppercase; margin: 0; color: var(--accent); }

.detail-body { max-width: 800px; margin: 0 auto; padding: 32px 16px; border-left: 1px solid var(--rule); border-right: 1px solid var(--rule); }

.visual-body { width: 100%; padding: 16px; box-sizing: border-box; }

.page-layout { padding: 32px 16px; }
.page-content { max-width: 680px; margin: 0 auto; line-height: 1.6; text-wrap: pretty; }

.badge, .src, .backlink, .btn { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 16px; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; text-transform: uppercase; color: var(--text); border: 1px solid var(--rule); background: var(--surface); text-decoration: none; position: relative; cursor: pointer; overflow: hidden; transition: border-color 0.2s; }
.badge:hover, .src:hover, .backlink:hover, .btn:hover { border-color: var(--accent); }
.badge::after, .src::after, .backlink::after, .btn::after { content: ""; position: absolute; top: 0; left: -100%; height: 100%; width: 100%; background-color: var(--accent); transition: transform var(--dur) var(--ease-snap); z-index: -1; }
.badge:hover::after, .src:hover::after, .backlink:hover::after, .btn:hover::after { transform: translateX(100%); }
.badge:hover, .src:hover, .backlink:hover, .btn:hover { color: var(--bg); }

.md-img { display: block; max-width: 100%; height: auto; border: 1px solid var(--rule); margin: 32px 0; filter: sepia(0.5) contrast(1.1); }

.gi-reveal { opacity: 0; transform: translateY(20px); transition: opacity var(--dur) var(--ease-snap), transform var(--dur) var(--ease-snap); }
.gi-reveal.gi-in { opacity: 1; transform: translateY(0); }

@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; } }

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


/* review-board fix layer (pass 1) */
.bento-cell, .project-card { overflow: hidden; } .project-card img, .bento-cell img { max-width: 100% !important; max-height: 160px !important; width: auto !important; height: auto !important; object-fit: contain !important; display: block !important; margin: 16px auto !important; } .deco-hero { background-image: linear-gradient(to bottom, rgba(32, 28, 25, 0.35), rgba(32, 28, 25, 0.65)), url('assets/hero.jpg') !important; background-blend-mode: normal !important; }

/* review-board fix layer (pass 2) */
.deco-hero p, .deco-hero h2, .deco-hero h3, .deco-hero h4, .deco-hero .tagline, .deco-hero [class*="tagline"], .deco-hero [class*="intro"] { color: oklch(85% 0.04 85) !important; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.9); }
```

## section:layout:shell

```html
<div class="deco-shell tarnished-bg"><div class="deco-frame"><header class="deco-nav"><nav class="nav-list">{{NAV_LINKS}}</nav></header><div class="brass-rule"></div><main>{{CONTENT}}</main><div class="brass-rule"></div><footer><div class="radium-text">{{SOURCE_PATH}}</div>{{THEME_PILLS}}</footer></div></div>
```

## section:layout:home

```html
<section class="deco-hero tarnished-bg"><h1 class="hero-title radium-text">{{HEADLINE}}</h1><div class="hero-marquee">{{TAGLINE}}</div><div class="bento-grid"><div class="bento-cell deco-frame">{{INTRO}}</div><div class="badge">{{FEATURED_COUNT}}</div>{{FEATURED_PROJECTS}}</div></section>
```

## section:layout:projects_index

```html
<section class="projects-grid deco-frame tarnished-bg">{{PROJECT_LIST}}</section>
```

## section:layout:designs_index

```html
<section class="designs-masonry deco-frame tarnished-bg"><div class="radium-text">{{DESIGN_COUNT}}</div><div class="deco-frame">{{DESIGN_CARDS}}</div></section>
```

## section:layout:project_detail

```html
<section class="detail-header deco-frame tarnished-bg"><div class="deco-frame">{{BACKLINK}}<h1 class="radium-text">{{NAME}}</h1>{{LOGO}}{{DESCRIPTION}}{{ROLE}}{{YEAR}}</div><div class="brass-rule"></div><div class="deco-frame">{{TECH_BADGES}}{{PROJECT_LINK}}{{REPO_LINK}}</div><div class="brass-rule"></div><div class="detail-body">{{CONTENT}}</div><div class="brass-rule"></div><div class="deco-frame">{{SOURCE_PATH}}</div></section>
```

## section:layout:design_detail

```html
<section class="visual-header deco-frame"><header class="deco-frame"><div class="backlink">{{BACKLINK}}</div><h1 class="radium-text">{{NAME}}</h1><div class="badge">{{TAG_BADGES}}</div></header><div class="visual-body"><img class="design-visual md-img" src="{{PREVIEW}}" alt="" /><div class="tarnished-bg">{{CONTENT}}</div></div><footer class="brass-rule"><a href="{{LINK_URL}}" class="btn">{{NAME}}</a><div class="src">{{SOURCE_PATH}}</div></footer></section>
```

## section:layout:page

```html
<article class="page-layout"><div class="deco-frame"><h1 class="radium-text">{{NAME}}</h1><div class="badge">{{SOURCE_PATH}}</div></div><hr class="brass-rule"><div class="deco-frame"><div class="page-content tarnished-bg">{{CONTENT}}</div></div></article>
```

## section:layout:project_item

```html
<section class="project-card deco-frame tarnished-bg"><a href="{{URL}}"><h3 class="project-title radium-text">{{NAME}}</h3></a><div class="deco-frame">{{LOGO}}</div><div class="brass-rule"><span class="badge">{{YEAR}}</span>{{TECH_BADGES}}</div><a href="{{REPO_URL}}" class="src">{{INDEX}}</a></section>
```

## section:layout:design_item

```html
<section class="design-card deco-frame tarnished-bg"><a href="{{URL}}" class="design-visual"><img src="{{PREVIEW}}" alt="" /></a><h3 class="radium-text">{{NAME}}</h3></section>
```

## section:layout:nav_item

```html
<a href="{{NAV_URL}}" class="nav-item-link {{NAV_ACTIVE_CLASS}}">{{NAV_NAME}}</a>
```
