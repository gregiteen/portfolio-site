---
name: "Wasteland Scavenger"
accent: "#ffffff"
style: "MAD MAX"
constitution_version: "2"
token_colors: "Primary Background: oklch(15% 0.02 50) Scorched Asphalt. Surface: oklch(20% 0.03 45) Rusted Iron. Text: oklch(90% 0.02 80) Sun-bleached Bone. Accent: oklch(55% 0.20 35) Oxidized Orange."
token_typography: "Display: 'Tourney', sans-serif (Weights 700-900, variable width). Body: 'Khand', sans-serif (Weight 400, 600 for emphasis). Both exist on fonts.google.com."
token_spacing: "Mathematical, engine-block spacing. Base unit 8px. Grid gaps: 24px (mobile) to 48px (desktop). Padding relies on thick 32px inset blocks."
signature_gesture: "Scroll-driven 'Wasteland Wind' effect: An embedded SVG noise texture pseudo-element anchored to animation-timeline: view() that shifts laterally and increases in opacity as the user scrolls deeper into the page, mimicking a sandstorm hitting a windshield."
---

# Design System

tokens: colors: bg: '#080605' text: '#DED8D1' accent: '#D94814' chrome: '#8A8D91' typography: display: '"Tourney", sans-serif' body: '"Khand", sans-serif' spacing: section_y: 'clamp(64px, 10vw, 120px)' grid_gap: 'clamp(16px, 3vw, 32px)' layout: max_width: '1200px' borders: thick_weld: '4px solid #D94814' radius: '0px' rationale: The design token framework enforces a harsh, sun-scorched environment. Tourney provides a meshed, industrial radiator-grille aesthetic for display text, while Khand allows for ultra-dense, HUD-like readouts. All containers avoid standard border-radii in favor of chamfered clip-paths.

## Locked Design Constitution

```json
{
  "name": "Wasteland Scavenger",
  "accent": "oklch(55% 0.20 35)",
  "signatureGesture": "Scroll-driven 'Wasteland Wind' effect: An embedded SVG noise texture pseudo-element anchored to animation-timeline: view() that shifts laterally and increases in opacity as the user scrolls deeper into the page, mimicking a sandstorm hitting a windshield.",
  "mobileStrategy": "Thick, finger-friendly 'welded' armor-plate buttons with strict 44px minimum heights. Full-width cards with deep bottom borders to imply physical weight and machinery. Global navigation is a persistent, thick top-bar with horizontal overflow scrolling for items, ensuring no hidden hamburger menus.",
  "imageTreatment": "High-contrast, crushed shadow 'Fury Road' color grade. Warm, desolate orange-teal split toning applied via CSS mix-blend-mode. Images are housed inside clip-path: polygon() shapes to look like bolted-on metal viewports.",
  "tokens": {
    "colors": "Primary Background: oklch(15% 0.02 50) Scorched Asphalt. Surface: oklch(20% 0.03 45) Rusted Iron. Text: oklch(90% 0.02 80) Sun-bleached Bone. Accent: oklch(55% 0.20 35) Oxidized Orange.",
    "typography": "Display: 'Tourney', sans-serif (Weights 700-900, variable width). Body: 'Khand', sans-serif (Weight 400, 600 for emphasis). Both exist on fonts.google.com.",
    "spacing": "Mathematical, engine-block spacing. Base unit 8px. Grid gaps: 24px (mobile) to 48px (desktop). Padding relies on thick 32px inset blocks.",
    "shape": "Zero border radius. Heavy use of clip-path: polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px) to create angled, machined steel cuts.",
    "motion": "Heavy, physical snaps. Hardware-accelerated transforms using @starting-style. Drop-in animations simulate the weight of falling scrap metal with fast entry and rigid stops."
  },
  "classVocabulary": [
    {
      "name": "site-root",
      "owner": "shell",
      "purpose": "Main layout wrapper and wasteland background context"
    },
    {
      "name": "global-nav",
      "owner": "shell",
      "purpose": "Thick tactical top bar for site traversal"
    },
    {
      "name": "nav-list",
      "owner": "shell",
      "purpose": "Horizontal flex container for navigation links"
    },
    {
      "name": "main-content",
      "owner": "shell",
      "purpose": "Primary engine block housing page views"
    },
    {
      "name": "footer-region",
      "owner": "shell",
      "purpose": "Bottom baseline signature and contact"
    },
    {
      "name": "nav-item",
      "owner": "nav_item",
      "purpose": "Individual routing control unit"
    },
    {
      "name": "hero-section",
      "owner": "home",
      "purpose": "Monumental entry viewport showcasing the wasteland thesis"
    },
    {
      "name": "bento-grid",
      "owner": "home",
      "purpose": "Dense grid mapping featured salvage and projects"
    },
    {
      "name": "bento-cell",
      "owner": "home",
      "purpose": "Individual armored plate within the home grid"
    },
    {
      "name": "project-grid",
      "owner": "projects_index",
      "purpose": "Native masonry container for the project inventory"
    },
    {
      "name": "section-header",
      "owner": "projects_index",
      "purpose": "Industrial stamped text declaring the page scope"
    },
    {
      "name": "design-grid",
      "owner": "designs_index",
      "purpose": "Strict structural matrix for visual artifacts"
    },
    {
      "name": "project-card",
      "owner": "project_item",
      "purpose": "Chamfered casing for an individual project"
    },
    {
      "name": "project-thumb",
      "owner": "project_item",
      "purpose": "Media viewport with split-tone overlays"
    },
    {
      "name": "project-meta",
      "owner": "project_item",
      "purpose": "Technical telemetry and data readout for the project"
    },
    {
      "name": "design-card",
      "owner": "design_item",
      "purpose": "Heavy-bordered artifact frame"
    },
    {
      "name": "page-header",
      "owner": "page",
      "purpose": "Standardized utilitarian title block for text pages"
    },
    {
      "name": "page-body",
      "owner": "page",
      "purpose": "Reading environment with restricted line lengths"
    },
    {
      "name": "detail-hero",
      "owner": "project_detail",
      "purpose": "Massive immersive header for project teardowns"
    },
    {
      "name": "detail-body",
      "owner": "project_detail",
      "purpose": "Technical documentation layout for project internals"
    },
    {
      "name": "design-focus",
      "owner": "design_detail",
      "purpose": "Singular massive media display for isolated designs"
    },
    {
      "name": "badge",
      "owner": "css",
      "purpose": "Injected runtime class for tiny metadata pills"
    },
    {
      "name": "src",
      "owner": "css",
      "purpose": "Injected runtime class for code blocks or source references"
    },
    {
      "name": "backlink",
      "owner": "css",
      "purpose": "Injected runtime class for utility return links"
    },
    {
      "name": "btn",
      "owner": "css",
      "purpose": "Injected runtime class for interactive triggers"
    },
    {
      "name": "md-img",
      "owner": "css",
      "purpose": "Injected runtime class for markdown image formatting"
    }
  ],
  "layoutBlueprints": {
    "shell": {
      "rootClass": "site-root",
      "composition": "A full viewport grid defining top navigation (global-nav > nav-list), main-content area, and footer-region. Built to constrain maximum width to 1200px while centering the content on large screens, utilizing a heavy dust-textured SVG background."
    },
    "home": {
      "rootClass": "hero-section",
      "composition": "Opens with hero-section containing a massive Tourney display title. Below it, the bento-grid takes over, defining an auto-fit dense matrix where bento-cell elements showcase top technical builds like scavenged car parts."
    },
    "projects_index": {
      "rootClass": "project-grid",
      "composition": "Begins with section-header for the title, followed by project-grid utilizing CSS native masonry (grid-template-rows: masonry) to stack various sized project units efficiently."
    },
    "designs_index": {
      "rootClass": "design-grid",
      "composition": "A rigid, auto-fill bento grid (design-grid) prioritizing large image thumbs over text, giving a gallery effect reminiscent of a parts catalog."
    },
    "project_detail": {
      "rootClass": "detail-hero",
      "composition": "Starts with detail-hero, utilizing scroll-driven timelines to fade and scale the cover image. Flows into detail-body, structured as a single-column technical read with generous margin for code blocks and md-img injections."
    },
    "design_detail": {
      "rootClass": "design-focus",
      "composition": "A highly minimal, screen-filling layout (design-focus) that pushes text to the absolute bottom, letting the visual design artifact dominate the viewport with a crushed-black backdrop."
    },
    "page": {
      "rootClass": "page-header",
      "composition": "Stacks page-header above page-body. Typography in page-body uses text-wrap: pretty and max-width: 65ch to ensure maximum legibility for long-form technical prose."
    },
    "project_item": {
      "rootClass": "project-card",
      "composition": "A tactile component (project-card) utilizing clip-path for cut corners. Contains project-thumb at the top, and project-meta at the bottom displaying tags via the badge class."
    },
    "design_item": {
      "rootClass": "design-card",
      "composition": "A thick-bordered container (design-card) that focuses entirely on an image viewport, with a kinetic hover effect that shifts the image scale and color grading."
    },
    "nav_item": {
      "rootClass": "nav-item",
      "composition": "A robust, block-level anchor (nav-item) with a strict 44px height, featuring an oxidized orange bottom border indicator on current state or hover."
    }
  }
}
```

## section:css

```css
@import url("https://fonts.googleapis.com/css2?family=Khand:wght@400;600&family=Tourney:wght@700;900&display=swap"); :root { --bg: oklch(15% 0.02 50); --surface: oklch(20% 0.03 45); --text: oklch(90% 0.02 80); --accent: oklch(55% 0.20 35); --font-display: 'Tourney', sans-serif; --font-body: 'Khand', sans-serif; --space-1: 8px; --space-2: 16px; --space-3: 24px; --space-4: 32px; --space-5: 48px; --space-6: 64px; --clip-chamfer: polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px); --clip-heavy: polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px); } *, *::before, *::after { box-sizing: border-box; } body { margin: 0; background-color: var(--bg); color: var(--text); font-family: var(--font-body); font-weight: 400; line-height: 1.5; -webkit-font-smoothing: antialiased; overflow-x: hidden; } h1, h2, h3, h4, h5, h6 { font-family: var(--font-display); font-weight: 900; text-transform: uppercase; margin-top: 0; margin-bottom: var(--space-2); line-height: 1.1; letter-spacing: 0.02em; } a { color: var(--accent); text-decoration: none; } img { max-width: 100%; height: auto; display: block; } @keyframes wasteland-wind { from { opacity: 0.02; transform: translateX(0); } to { opacity: 0.25; transform: translateX(-100px); } } .site-root { min-height: 100vh; display: flex; flex-direction: column; position: relative; } .site-root::before { content: ''; position: fixed; inset: -200px; pointer-events: none; z-index: 50; background-image: url('data:image/svg+xml;utf8,%3Csvg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)" opacity="1"/%3E%3C/svg%3E'); mix-blend-mode: overlay; opacity: 0.05; } @supports (animation-timeline: scroll()) { .site-root::before { animation: wasteland-wind linear both; animation-timeline: scroll(root); } } .global-nav { background-color: var(--surface); border-bottom: 4px solid var(--accent); overflow-x: auto; -webkit-overflow-scrolling: touch; position: sticky; top: 0; z-index: 100; box-shadow: 0 8px 16px rgba(0,0,0,0.5); } .nav-list { display: flex; gap: var(--space-3); padding: 0 var(--space-3); margin: 0; list-style: none; min-width: max-content; } .nav-item { min-height: 44px; display: flex; align-items: center; color: var(--text); font-family: var(--font-display); font-weight: 700; font-size: 1.1rem; padding: 0 var(--space-1); border-bottom: 4px solid transparent; transition: border-color 0.2s, color 0.2s; } .nav-item:hover, .nav-item:focus { border-bottom-color: var(--accent); color: #ffffff; } .main-content { flex: 1; width: 100%; max-width: 1200px; margin: 0 auto; padding: var(--space-3) var(--space-2); display: flex; flex-direction: column; gap: var(--space-5); } @media (min-width: 768px) { .main-content { padding: var(--space-5) var(--space-4); gap: var(--space-6); } } .footer-region { border-top: 2px solid var(--surface); padding: var(--space-4) var(--space-2); text-align: center; font-family: var(--font-display); font-size: 0.9rem; color: var(--text); opacity: 0.7; } .hero-section { position: relative; background-color: var(--surface); background-image: url('assets/hero.jpg'); background-size: cover; background-position: center; clip-path: var(--clip-heavy); padding: var(--space-5) var(--space-3); min-height: 60vh; display: flex; flex-direction: column; justify-content: flex-end; border-bottom: 12px solid #000; overflow: hidden; } .hero-section::before { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 100%); z-index: 1; } .hero-section > * { position: relative; z-index: 2; } .hero-section h1 { font-size: clamp(2.5rem, 8vw, 6rem); color: var(--accent); text-shadow: 4px 4px 0 #000; margin-bottom: var(--space-2); line-height: 0.9; } .bento-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-3); } @media (min-width: 768px) { .bento-grid { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--space-4); } } .bento-cell { background-color: var(--surface); clip-path: var(--clip-chamfer); padding: var(--space-3); border-bottom: 6px solid #000; display: flex; flex-direction: column; gap: var(--space-2); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); } .bento-cell:hover { transform: translateY(-4px); } .project-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-4); } @media (min-width: 768px) { .project-grid { grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); align-items: start; } } .section-header { font-size: clamp(2rem, 5vw, 4rem); color: var(--text); border-left: 8px solid var(--accent); padding-left: var(--space-2); background: linear-gradient(90deg, rgba(255,255,255,0.05) 0%, transparent 100%); } .design-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-3); } @media (min-width: 768px) { .design-grid { grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: var(--space-4); } } .project-card { background-color: var(--surface); clip-path: var(--clip-chamfer); border-bottom: 8px solid #000; display: flex; flex-direction: column; height: 100%; transition: filter 0.3s; } .project-card:hover { filter: brightness(1.2); } .project-thumb { width: 100%; aspect-ratio: 16/9; background-color: var(--accent); overflow: hidden; position: relative; } .project-thumb img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(100%) contrast(150%); mix-blend-mode: multiply; transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); } .project-card:hover .project-thumb img { transform: scale(1.05); } .project-meta { padding: var(--space-3); flex: 1; display: flex; flex-direction: column; gap: var(--space-2); } .project-meta h3 { margin: 0; font-size: 1.5rem; color: var(--text); } .design-card { background: #000; padding: var(--space-1); border: 4px solid var(--surface); clip-path: var(--clip-chamfer); position: relative; cursor: pointer; } .design-card img { width: 100%; height: auto; clip-path: var(--clip-chamfer); filter: sepia(0.8) hue-rotate(340deg) saturate(1.5) contrast(1.2); transition: filter 0.4s, transform 0.4s; } .design-card:hover img { filter: sepia(0) hue-rotate(0) saturate(1) contrast(1); transform: scale(1.02); } .page-header { background-color: var(--surface); padding: var(--space-4) var(--space-3); clip-path: var(--clip-chamfer); border-bottom: 6px solid var(--accent); margin-bottom: var(--space-4); } .page-body { max-width: 65ch; margin: 0 auto; text-wrap: pretty; font-size: 1.1rem; } .detail-hero { min-height: 50vh; display: flex; flex-direction: column; justify-content: flex-end; padding: var(--space-4); background-color: var(--surface); clip-path: var(--clip-heavy); border-bottom: 12px solid var(--accent); margin-bottom: var(--space-5); position: relative; overflow: hidden; } .detail-body { max-width: 800px; margin: 0 auto; width: 100%; } .design-focus { min-height: 80vh; display: flex; flex-direction: column; justify-content: flex-end; padding: var(--space-4); background-color: #050505; position: relative; border: 1px solid var(--surface); } .design-focus img { max-height: 70vh; object-fit: contain; margin-bottom: var(--space-4); } .badge { display: inline-flex; align-items: center; min-height: 28px; padding: 0 var(--space-2); background-color: var(--bg); color: var(--accent); font-family: var(--font-display); font-size: 0.8rem; text-transform: uppercase; border: 1px solid var(--surface); border-left: 4px solid var(--accent); clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px); white-space: nowrap; } .src { display: block; font-family: 'Courier New', Courier, monospace; background-color: #000; color: var(--accent); padding: var(--space-3); border: 2px solid var(--surface); overflow-x: auto; clip-path: var(--clip-chamfer); margin: var(--space-3) 0; font-size: 0.9rem; } .backlink { display: inline-flex; align-items: center; min-height: 44px; color: var(--text); font-family: var(--font-display); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 0 var(--space-2); transition: color 0.2s; } .backlink::before { content: '< '; color: var(--accent); margin-right: 8px; } .backlink:hover { color: var(--accent); } .btn { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 var(--space-4); background-color: var(--accent); color: #000; font-family: var(--font-display); font-size: 1.1rem; font-weight: 900; text-transform: uppercase; border: none; clip-path: var(--clip-chamfer); cursor: pointer; transition: background-color 0.2s, transform 0.1s; border-bottom: 4px solid #000; } .btn:hover, .btn:focus { background-color: #ff6a00; transform: translateY(2px); border-bottom-width: 2px; margin-bottom: 2px; } .md-img { border: 4px solid var(--surface); clip-path: var(--clip-chamfer); margin: var(--space-4) 0; filter: contrast(1.1) drop-shadow(0 8px 16px rgba(0,0,0,0.8)); } .gi-reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); } .gi-reveal.gi-in { opacity: 1; transform: translateY(0); } @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; } .site-root::before { animation: none !important; } }

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
.hero-section { position: relative; background-blend-mode: overlay; background-color: oklch(15% 0.02 50 / 85%); } .hero-section::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, oklch(15% 0.02 50 / 75%) 0%, oklch(15% 0.02 50 / 95%) 100%); z-index: 0; pointer-events: none; } .hero-section * { position: relative; z-index: 1; } .hero-section h1, .hero-section h2, .hero-section p { color: oklch(90% 0.02 80) !important; text-shadow: 0 2px 8px oklch(15% 0.02 50), 0 4px 20px oklch(15% 0.02 50); } .hero-section p { background: oklch(20% 0.03 45 / 90%); padding: 16px 24px; border-left: 4px solid oklch(55% 0.20 35); clip-path: polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px); }
```

## section:layout:shell

```html
<div class="site-root"><nav class="global-nav"><div class="nav-list">{{NAV_LINKS}}</div></nav><main class="main-content">{{CONTENT}}</main><footer class="footer-region">{{THEME_PILLS}}{{SOURCE_PATH}}</footer></div>
```

## section:layout:home

```html
<header class="hero-section">{{HEADLINE}}{{TAGLINE}}{{INTRO}}</header><section class="bento-grid">{{FEATURED_PROJECTS}}</section>
```

## section:layout:projects_index

```html
<section class="project-grid"><div class="section-header">{{PROJECT_COUNT}}</div>{{PROJECT_LIST}}</section>
```

## section:layout:designs_index

```html
<div class="design-grid">{{DESIGN_CARDS}}</div>
```

## section:layout:project_detail

```html
<section class="detail-hero"><header><h1>{{NAME}}</h1><p>{{DESCRIPTION}} {{YEAR}} {{ROLE}}</p><div>{{TECH_BADGES}} {{PROJECT_LINK}} {{REPO_LINK}} {{LOGO}}</div></header><div class="detail-body">{{CONTENT}}<footer>{{SOURCE_PATH}} {{BACKLINK}}</footer></div></section>
```

## section:layout:design_detail

```html
<section class="design-focus"><img src="{{PREVIEW}}" class="md-img" alt="" /><div class="page-body"><h1 class="page-header">{{NAME}}</h1><span class="badge">{{YEAR}}</span><span class="badge">{{CLIENT}}</span><span class="badge">{{ROLE}}</span>{{TAG_BADGES}}<p>{{DESCRIPTION}}</p>{{CONTENT}}<a href="{{LINK_URL}}" class="btn">{{NAME}}</a><div class="src">{{SOURCE_PATH}}</div><div class="backlink">{{BACKLINK}}</div></div></section>
```

## section:layout:page

```html
<section class="page-header"><h1>{{NAME}}</h1><div class="src">{{SOURCE_PATH}}</div></section><article class="page-body">{{CONTENT}}</article>
```

## section:layout:project_item

```html
<article class="project-card"><figure class="project-thumb">{{LOGO}}</figure><div class="project-meta"><div class="badge">{{INDEX}}</div><a href="{{URL}}" class="btn">{{NAME}}</a><div class="badge">{{YEAR}}</div><p>{{DESCRIPTION}}</p><div>{{TECH_BADGES}}</div></div></article>
```

## section:layout:design_item

```html
<section class="design-card"><a href="{{URL}}"><img src="{{PREVIEW}}" alt="{{NAME}}" /></a><div><h2>{{NAME}}</h2><p>{{DESCRIPTION}}</p><span>{{CLIENT}}</span><time>{{YEAR}}</time><footer>{{TAG_BADGES}}</footer></div></section>
```

## section:layout:nav_item

```html
<a href="{{NAV_URL}}" class="nav-item {{NAV_ACTIVE_CLASS}}">{{NAV_NAME}}</a>
```
