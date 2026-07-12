---
name: "Basalt & Emerald"
accent: "#888888"
style: "IRISH"
constitution_version: "2"
token_colors: "bg: oklch(20% 0.02 260); surface: oklch(25% 0.02 260); text: oklch(90% 0.01 260); accent: oklch(75% 0.25 150); border: oklch(35% 0.02 260);"
token_typography: "display: 'Cinzel', 'Playfair Display', serif; body: 'Inter', sans-serif; mono: 'JetBrains Mono', monospace;"
token_spacing: "xs: 0.5rem; sm: 1rem; md: 1.5rem; lg: 3rem; xl: 6rem; grid_gap: 1px;"
signature_gesture: "Staggered, scroll-driven entry animations where bento cards rise into place at different depths, mimicking the uneven, interlocking columns of the Giant's Causeway."
---

# Design System

A dark, geological technical theme. Backgrounds are deep, overcast slate-blacks. Layouts are strictly locked into staggered bento grids that evoke columnar jointing. Edges are sharp (0px radius) to mimic chiseled stone. Typography pairs a sharp, commanding serif for structural headings with a dense, highly legible monospace for technical data. The visual hierarchy is heavily weighted by the striking contrast of vivid emerald green against the desaturated stone UI.

## Locked Design Constitution

```json
{
  "name": "Basalt & Emerald",
  "accent": "oklch(75% 0.25 150)",
  "signatureGesture": "Staggered, scroll-driven entry animations where bento cards rise into place at different depths, mimicking the uneven, interlocking columns of the Giant's Causeway.",
  "mobileStrategy": "Single-column fluid layout with touch targets strictly inflated to 44px. The bento grid flattens into a continuous scroll of stark, full-width blocks separated by 1px emerald borders. The navigation wraps into a visible, tactile bottom bar to avoid hidden menus.",
  "imageTreatment": "Desaturated, moody, high-contrast overcast aesthetics (classic Irish coastal weather) punctuated by vivid, glowing emerald data streams or UI elements.",
  "tokens": {
    "colors": "bg: oklch(20% 0.02 260); surface: oklch(25% 0.02 260); text: oklch(90% 0.01 260); accent: oklch(75% 0.25 150); border: oklch(35% 0.02 260);",
    "typography": "display: 'Cinzel', 'Playfair Display', serif; body: 'Inter', sans-serif; mono: 'JetBrains Mono', monospace;",
    "spacing": "xs: 0.5rem; sm: 1rem; md: 1.5rem; lg: 3rem; xl: 6rem; grid_gap: 1px;",
    "shape": "radius_none: 0px; radius_subtle: 2px;",
    "motion": "easing_stone: cubic-bezier(0.2, 0, 0, 1); duration_base: 400ms;"
  },
  "classVocabulary": [
    {
      "name": "shell-root",
      "owner": "shell",
      "purpose": "Main wrapper for the entire application"
    },
    {
      "name": "shell-nav",
      "owner": "shell",
      "purpose": "Global navigation container"
    },
    {
      "name": "shell-main",
      "owner": "shell",
      "purpose": "Primary content region"
    },
    {
      "name": "shell-footer",
      "owner": "shell",
      "purpose": "Global footer container"
    },
    {
      "name": "home-root",
      "owner": "home",
      "purpose": "Root layout for the homepage"
    },
    {
      "name": "home-hero",
      "owner": "home",
      "purpose": "Hero section requiring background-image"
    },
    {
      "name": "home-hero-content",
      "owner": "home",
      "purpose": "Typography and actions within the hero"
    },
    {
      "name": "home-featured",
      "owner": "home",
      "purpose": "Bento grid container for featured projects"
    },
    {
      "name": "projects-root",
      "owner": "projects_index",
      "purpose": "Root layout for the projects index"
    },
    {
      "name": "projects-header",
      "owner": "projects_index",
      "purpose": "Header region for projects"
    },
    {
      "name": "projects-grid",
      "owner": "projects_index",
      "purpose": "Masonry/Bento container for project items"
    },
    {
      "name": "project-card",
      "owner": "project_item",
      "purpose": "Individual project bento card"
    },
    {
      "name": "project-title",
      "owner": "project_item",
      "purpose": "Title of the project"
    },
    {
      "name": "project-meta",
      "owner": "project_item",
      "purpose": "Metadata and tags for the project"
    },
    {
      "name": "designs-root",
      "owner": "designs_index",
      "purpose": "Root layout for the designs gallery"
    },
    {
      "name": "designs-gallery",
      "owner": "designs_index",
      "purpose": "Grid container for design items"
    },
    {
      "name": "design-card",
      "owner": "design_item",
      "purpose": "Individual design bento card"
    },
    {
      "name": "design-media",
      "owner": "design_item",
      "purpose": "Image container for the design preview"
    },
    {
      "name": "project-detail-root",
      "owner": "project_detail",
      "purpose": "Root layout for a specific project"
    },
    {
      "name": "project-detail-header",
      "owner": "project_detail",
      "purpose": "Header metadata for the project detail"
    },
    {
      "name": "project-detail-body",
      "owner": "project_detail",
      "purpose": "Content body for the project detail"
    },
    {
      "name": "design-detail-root",
      "owner": "design_detail",
      "purpose": "Root layout for a specific design"
    },
    {
      "name": "design-detail-canvas",
      "owner": "design_detail",
      "purpose": "Main image presentation area"
    },
    {
      "name": "page-root",
      "owner": "page",
      "purpose": "Root layout for generic pages"
    },
    {
      "name": "page-content",
      "owner": "page",
      "purpose": "Markdown content container for generic pages"
    },
    {
      "name": "nav-item-root",
      "owner": "nav_item",
      "purpose": "Wrapper for a single navigation link"
    },
    {
      "name": "nav-item-link",
      "owner": "nav_item",
      "purpose": "The anchor tag for the navigation item"
    },
    {
      "name": "badge",
      "owner": "css",
      "purpose": "Injected runtime class for tags/labels"
    },
    {
      "name": "src",
      "owner": "css",
      "purpose": "Injected runtime class for source links"
    },
    {
      "name": "backlink",
      "owner": "css",
      "purpose": "Injected runtime class for return navigation"
    },
    {
      "name": "btn",
      "owner": "css",
      "purpose": "Injected runtime class for primary actions"
    },
    {
      "name": "md-img",
      "owner": "css",
      "purpose": "Injected runtime class for markdown images"
    }
  ],
  "layoutBlueprints": {
    "shell": {
      "rootClass": "shell-root",
      "composition": "A persistent, structural frame. The shell-nav spans the top edge, featuring stark typography and explicit 1px emerald borders. On mobile, the nav items wrap cleanly into a dense block. The shell-main holds all injected content. The shell-footer acts as the baseline."
    },
    "home": {
      "rootClass": "home-root",
      "composition": "The home-hero dominates the viewport, applying the dramatic Irish landscape asset. The home-hero-content is bottom-anchored, featuring a massive chiseled headline. Below, the home-featured section uses a native Bento grid with varying track sizes to mimic basalt columns."
    },
    "projects_index": {
      "rootClass": "projects-root",
      "composition": "A strictly ordered, highly technical index. The projects-header introduces the category. The projects-grid uses native subgrid and staggered columnar joints, ensuring cards stack seamlessly with a 1px emerald gap."
    },
    "designs_index": {
      "rootClass": "designs-root",
      "composition": "A visual masonry layout. The designs-gallery allows design-cards to span multiple rows natively, echoing the organic but rigid structure of the Giant's Causeway. Images are heavily desaturated until hovered."
    },
    "project_detail": {
      "rootClass": "project-detail-root",
      "composition": "An editorial deep-dive. The project-detail-header is a stark bento block detailing metadata. The project-detail-body is a single, central column restricted by max-width for optimal reading, utilizing pretty text-wrapping."
    },
    "design_detail": {
      "rootClass": "design-detail-root",
      "composition": "Immersive and cinematic. The design-detail-canvas expands the visual work edge-to-edge on mobile, and bounds it within a sharp, stone-like border on desktop. Minimal interference from UI chrome."
    },
    "page": {
      "rootClass": "page-root",
      "composition": "A utilitarian layout for text. The page-content centers the typography, prioritizing the high-contrast pairing of the chiseled serif headers and the technical monospace body."
    },
    "project_item": {
      "rootClass": "project-card",
      "composition": "A stark, unrounded block. The project-title sits at the top in a sharp serif. The project-meta anchors the bottom, styled as small technical monospace badges. Hovering triggers a subtle compositor-thread reveal of a glowing emerald border."
    },
    "design_item": {
      "rootClass": "design-card",
      "composition": "A container for visual media. The design-media fills the block completely. The relational state (:has) allows sibling cards to dim slightly when one is hovered, focusing attention."
    },
    "nav_item": {
      "rootClass": "nav-item-root",
      "composition": "A highly tactile, explicitly sized hit area (min 44px). The nav-item-link displays crisp monospace text, turning vivid emerald on hover."
    }
  }
}
```

## section:css

```css
:root { --bg: oklch(20% 0.02 260); --surface: oklch(25% 0.02 260); --text: oklch(90% 0.01 260); --accent: oklch(75% 0.25 150); --border: oklch(35% 0.02 260); --font-display: 'Cinzel', 'Playfair Display', serif; --font-body: 'Inter', sans-serif; --font-mono: 'JetBrains Mono', monospace; --sp-none: 0px; --sp-xs: 0.5rem; --sp-sm: 1rem; --sp-md: 1.5rem; --sp-lg: 3rem; --sp-xl: 6rem; --grid-gap: 1px; --rad-none: 0px; --rad-subtle: 2px; --ease-stone: cubic-bezier(0.2, 0, 0, 1); --dur-base: 400ms; } *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { background-color: var(--bg); color: var(--text); font-family: var(--font-body); line-height: 1.5; -webkit-font-smoothing: antialiased; } img { display: block; max-width: 100%; height: auto; } a { color: inherit; text-decoration: none; } .shell-root { display: flex; flex-direction: column; min-height: 100vh; } .shell-nav { order: 3; position: sticky; bottom: 0; background-color: var(--bg); border-top: var(--grid-gap) solid var(--accent); display: flex; flex-wrap: wrap; padding: var(--sp-xs); gap: var(--sp-xs); z-index: 100; } .shell-main { order: 2; flex: 1; display: flex; flex-direction: column; } .shell-footer { order: 4; padding: var(--sp-lg) var(--sp-sm); text-align: center; font-family: var(--font-mono); font-size: 0.875rem; border-top: var(--grid-gap) solid var(--border); } @media (min-width: 768px) { .shell-nav { order: 1; top: 0; bottom: auto; border-top: none; border-bottom: var(--grid-gap) solid var(--accent); } } .home-root { display: flex; flex-direction: column; } .home-hero { position: relative; min-height: 80vh; background-image: url('assets/hero.jpg'); background-size: cover; background-position: center; background-color: var(--surface); filter: grayscale(80%) contrast(120%); display: flex; align-items: flex-end; padding: var(--sp-md); border-bottom: var(--grid-gap) solid var(--accent); transition: filter var(--dur-base) var(--ease-stone); } .home-hero:hover { filter: grayscale(20%) contrast(110%); } .home-hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, var(--bg) 0%, transparent 60%); } .home-hero-content { position: relative; z-index: 2; width: 100%; } .home-hero-content h1, .home-hero-content h2 { font-family: var(--font-display); text-transform: uppercase; line-height: 1.1; letter-spacing: -0.02em; } .home-hero-content h1 { font-size: clamp(2.5rem, 8vw, 5rem); } .home-hero-content p { font-family: var(--font-mono); color: var(--accent); margin-top: var(--sp-sm); } .home-featured { display: grid; gap: var(--grid-gap); background-color: var(--accent); padding: var(--grid-gap); } @media (min-width: 768px) { .home-featured { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); } } .projects-root { display: flex; flex-direction: column; } .projects-header { padding: var(--sp-lg) var(--sp-sm); border-bottom: var(--grid-gap) solid var(--accent); } .projects-header h1 { font-family: var(--font-display); font-size: 2.5rem; text-transform: uppercase; } .projects-grid { display: grid; gap: var(--grid-gap); background-color: var(--accent); padding: var(--grid-gap); } @media (min-width: 768px) { .projects-grid { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); } } .designs-root { display: flex; flex-direction: column; } .designs-gallery { display: grid; gap: var(--grid-gap); background-color: var(--accent); padding: var(--grid-gap); } @media (min-width: 768px) { .designs-gallery { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); grid-auto-rows: 250px; } .design-card:nth-child(3n) { grid-row: span 2; } } .project-detail-root, .design-detail-root { display: flex; flex-direction: column; } .project-detail-header { padding: var(--sp-lg) var(--sp-sm); background-color: var(--surface); border-bottom: var(--grid-gap) solid var(--accent); display: grid; gap: var(--sp-md); } .project-detail-body { max-width: 800px; margin: 0 auto; padding: var(--sp-lg) var(--sp-sm); width: 100%; } .design-detail-canvas { width: 100%; padding: var(--sp-none); background-color: var(--surface); } @media (min-width: 768px) { .design-detail-canvas { padding: var(--sp-lg); border-bottom: var(--grid-gap) solid var(--border); } } .page-root { display: flex; flex-direction: column; } .page-content { max-width: 800px; margin: 0 auto; padding: var(--sp-lg) var(--sp-sm); width: 100%; font-family: var(--font-mono); } .page-content h1, .page-content h2, .page-content h3 { font-family: var(--font-display); margin-bottom: var(--sp-md); color: var(--text); } .project-card, .design-card { background-color: var(--bg); display: flex; flex-direction: column; position: relative; min-height: 200px; transition: background-color var(--dur-base) var(--ease-stone); } .project-card:hover { background-color: var(--surface); } .project-card::after { content: ''; position: absolute; inset: 0; border: 1px solid transparent; transition: border-color var(--dur-base) var(--ease-stone); pointer-events: none; } .project-card:hover::after { border-color: var(--accent); } .project-title { font-family: var(--font-display); font-size: 1.5rem; padding: var(--sp-md); flex: 1; } .project-meta { padding: var(--sp-sm) var(--sp-md); font-family: var(--font-mono); font-size: 0.75rem; display: flex; flex-wrap: wrap; gap: var(--sp-xs); border-top: var(--grid-gap) solid var(--border); } .design-card { overflow: hidden; } .design-media { width: 100%; height: 100%; object-fit: cover; filter: grayscale(100%); transition: filter var(--dur-base) var(--ease-stone), transform var(--dur-base) var(--ease-stone); } .design-card:hover .design-media { filter: grayscale(0%); transform: scale(1.05); } .designs-gallery:has(.design-card:hover) .design-card:not(:hover) .design-media { opacity: 0.5; } .nav-item-root { display: flex; } .nav-item-link { display: flex; align-items: center; justify-content: center; min-width: 44px; min-height: 44px; padding: var(--sp-xs) var(--sp-sm); font-family: var(--font-mono); font-size: 0.875rem; text-transform: uppercase; transition: color var(--dur-base) var(--ease-stone); } .nav-item-link:hover, .nav-item-link:active { color: var(--accent); } .badge { display: inline-block; padding: 0.25rem 0.5rem; background-color: var(--surface); border: var(--grid-gap) solid var(--border); font-family: var(--font-mono); font-size: 0.75rem; text-transform: uppercase; border-radius: var(--rad-subtle); color: var(--accent); } .src, .backlink { display: inline-flex; align-items: center; min-height: 44px; font-family: var(--font-mono); color: var(--accent); text-decoration: underline; text-underline-offset: 4px; transition: opacity var(--dur-base) var(--ease-stone); } .src:hover, .backlink:hover { opacity: 0.7; } .btn { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 var(--sp-md); background-color: var(--accent); color: var(--bg); font-family: var(--font-mono); text-transform: uppercase; font-weight: bold; border-radius: var(--rad-none); transition: background-color var(--dur-base) var(--ease-stone); } .btn:hover { background-color: var(--text); color: var(--bg); } .md-img { display: block; max-width: 100%; border: var(--grid-gap) solid var(--border); margin: var(--sp-md) 0; filter: grayscale(80%); transition: filter var(--dur-base) var(--ease-stone); } .md-img:hover { filter: grayscale(0%); } .gi-reveal { opacity: 0; transform: translateY(40px) scale(0.98); transition: opacity var(--dur-base) var(--ease-stone), transform var(--dur-base) var(--ease-stone); } .gi-reveal.gi-in { opacity: 1; transform: translateY(0) scale(1); } .home-featured > :nth-child(2n), .projects-grid > :nth-child(2n), .designs-gallery > :nth-child(2n) { transition-delay: 100ms; } .home-featured > :nth-child(3n), .projects-grid > :nth-child(3n), .designs-gallery > :nth-child(3n) { transition-delay: 200ms; } .home-featured > :nth-child(4n), .projects-grid > :nth-child(4n), .designs-gallery > :nth-child(4n) { transition-delay: 300ms; } @media (prefers-reduced-motion: reduce) { .gi-reveal { opacity: 1; transform: none; transition: none; } *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; } }

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
.designs-gallery { grid-auto-rows: auto !important; } .design-card { display: flex !important; flex-direction: column !important; height: auto !important; min-height: max-content !important; overflow: visible !important; } .design-media { position: relative !important; height: auto !important; max-height: 400px !important; overflow: hidden !important; } .design-media img { width: 100% !important; height: auto !important; max-height: 100% !important; object-fit: cover !important; } @media (max-width: 768px) { .home-hero { background-image: linear-gradient(180deg, rgba(20, 22, 25, 0.75) 0%, oklch(20% 0.02 260) 100%), url('assets/hero.jpg') !important; } .home-hero-content { background-color: oklch(20% 0.02 260 / 0.92) !important; backdrop-filter: blur(12px) !important; -webkit-backdrop-filter: blur(12px) !important; padding: 2rem 1.5rem !important; border: 1px solid oklch(35% 0.02 260) !important; text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8) !important; } }
```

## section:layout:shell

```html
<div class="shell-root"><nav class="shell-nav">{{NAV_LINKS}}</nav><main class="shell-main">{{CONTENT}}</main><footer class="shell-footer">{{THEME_PILLS}}{{SOURCE_PATH}}</footer></div>
```

## section:layout:home

```html
<div class="home-root"><div class="home-hero"><div class="home-hero-content">{{HEADLINE}}{{TAGLINE}}{{INTRO}}{{FEATURED_COUNT}}</div></div><div class="home-featured">{{FEATURED_PROJECTS}}</div></div>
```

## section:layout:projects_index

```html
<div class="projects-root"><div class="projects-header">{{PROJECT_COUNT}}</div><div class="projects-grid">{{PROJECT_LIST}}</div></div>
```

## section:layout:designs_index

```html
<section class="designs-root"><span class="badge">{{DESIGN_COUNT}}</span><div class="designs-gallery">{{DESIGN_CARDS}}</div></section>
```

## section:layout:project_detail

```html
<div class="project-detail-root"><div class="project-detail-header">{{BACKLINK}}{{LOGO}}<h1>{{NAME}}</h1><p>{{DESCRIPTION}}</p><div><span>{{ROLE}}</span><span>{{YEAR}}</span></div><div>{{TECH_BADGES}}</div><div>{{PROJECT_LINK}}{{REPO_LINK}}{{SOURCE_PATH}}</div></div><div class="project-detail-body">{{CONTENT}}</div></div>
```

## section:layout:design_detail

```html
<section class="design-detail-root"><div class="design-detail-canvas"><img class="md-img" src="{{PREVIEW}}" /></div><div><h1>{{NAME}}</h1><p>{{DESCRIPTION}}</p><span>{{CLIENT}}</span><span>{{ROLE}}</span><span>{{YEAR}}</span><div class="badge">{{TAG_BADGES}}</div><div>{{CONTENT}}</div><a class="btn" href="{{LINK_URL}}">{{NAME}}</a><a class="src" href="{{SOURCE_PATH}}">{{NAME}}</a></div><div class="backlink">{{BACKLINK}}</div></section>
```

## section:layout:page

```html
<section class="page-root"><header><h1>{{NAME}}</h1><div class="src">{{SOURCE_PATH}}</div></header><div class="page-content">{{CONTENT}}</div></section>
```

## section:layout:project_item

```html
<article class="project-card"><h3 class="project-title"><a href="{{URL}}">{{NAME}}</a></h3>{{LOGO}}<div class="project-meta">{{INDEX}}{{YEAR}}{{DESCRIPTION}}{{TECH_BADGES}}</div></article>
```

## section:layout:design_item

```html
<section class="design-card"><a href="{{URL}}" class="design-media"><img src="{{PREVIEW}}" alt="{{NAME}}" /></a><h3>{{NAME}}</h3><p>{{DESCRIPTION}}</p><span>{{CLIENT}}</span><time>{{YEAR}}</time><div>{{TAG_BADGES}}</div></section>
```

## section:layout:nav_item

```html
<div class="nav-item-root {{NAV_ACTIVE_CLASS}}"><a href="{{NAV_URL}}" class="nav-item-link">{{NAV_NAME}}</a></div>
```
