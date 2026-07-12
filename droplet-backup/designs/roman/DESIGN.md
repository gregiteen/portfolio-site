---
name: "Imperial Dark Technica"
accent: "#fff"
style: "ROMAN"
constitution_version: "2"
token_colors: "oklch(20% 0.02 260) (obsidian base), oklch(28% 0.01 260) (basalt surface), oklch(75% 0.15 80) (aged brass accent)"
token_typography: "Display: Marcellus (monumental serif). Body: JetBrains Mono (technical AI context). Text-wrap: balance for display."
token_spacing: "Base unit 4px. Structural gaps use clamp(16px, 2vw, 32px). Sections padded heavily with clamp(64px, 10vw, 120px) to simulate architectural voids."
signature_gesture: "The 'Colonnade Reveal'. As users scroll, bento grid items in the projects index utilize native CSS scroll-driven animations (`animation-timeline: view()`) to perform a heavy, physical translation upward, scaling from 0.95 to 1.0, paired with an opacity fade. This simulates walking past massive stone monoliths emerging from shadow."
---

# Design System

---
color:
  base_obsidian: 'oklch(20% 0.02 260)'
  surface_basalt: 'oklch(28% 0.01 260)'
  text_alabaster: 'oklch(95% 0.01 90)'
  accent_brass: 'oklch(75% 0.15 80)'
  interactive_porphyry: 'oklch(45% 0.18 20)'
typography:
  display: '"Marcellus", "Trajan Pro", serif'
  body: '"JetBrains Mono", monospace'
  scale_base: '16px'
  scale_h1: 'clamp(2.5rem, 8vw, 6rem)'
spacing:
  colonnade_gap: 'clamp(16px, 2vw, 32px)'
  section_pad: 'clamp(64px, 10vw, 120px)'
shape:
  roman_arch_radius: '400px 400px 0 0'
  chiseled_edge: '0px'
---
# Design Intent
This system projects monumental authority. The stark contrast between the classic Roman display face and the rigid monospace body reflects the intersection of ancient empire and modern AI engineering. Shapes alternate between rigid architectural blocks and distinct Roman arches to frame imagery.

## Locked Design Constitution

```json
{
  "name": "Imperial Dark Technica",
  "accent": "oklch(75% 0.15 80)",
  "signatureGesture": "The 'Colonnade Reveal'. As users scroll, bento grid items in the projects index utilize native CSS scroll-driven animations (`animation-timeline: view()`) to perform a heavy, physical translation upward, scaling from 0.95 to 1.0, paired with an opacity fade. This simulates walking past massive stone monoliths emerging from shadow.",
  "mobileStrategy": "Single-column monolithic stacking. The layout acts as a vertical stele. Navigation links wrap tightly into a touch-friendly (44px min-height) block list without ever collapsing into a hamburger menu. Hover states are bypassed in favor of high-contrast active states.",
  "imageTreatment": "Deep chiaroscuro lighting. Images are treated with high-contrast low-key exposure, emphasizing deep shadows and metallic/stone textures. A subtle CSS `mix-blend-mode: luminosity` or OKLCH color matrix will unify the portfolio images into the dark, brass-tinted visual language.",
  "tokens": {
    "colors": "oklch(20% 0.02 260) (obsidian base), oklch(28% 0.01 260) (basalt surface), oklch(75% 0.15 80) (aged brass accent)",
    "typography": "Display: Marcellus (monumental serif). Body: JetBrains Mono (technical AI context). Text-wrap: balance for display.",
    "spacing": "Base unit 4px. Structural gaps use clamp(16px, 2vw, 32px). Sections padded heavily with clamp(64px, 10vw, 120px) to simulate architectural voids.",
    "shape": "Zero border-radius for technical bento cards. 'roman_arch_radius' (400px 400px 0 0) used exclusively for hero images and prominent portraits.",
    "motion": "Exclusively compositor-thread. Scroll-driven timelines using view() for monolithic card entrances. @starting-style for modal interactions."
  },
  "classVocabulary": [
    {
      "name": "app-shell",
      "owner": "shell",
      "purpose": "Root layout container governing global structure and positioning"
    },
    {
      "name": "global-nav",
      "owner": "shell",
      "purpose": "Primary site navigation bar"
    },
    {
      "name": "nav-list",
      "owner": "shell",
      "purpose": "Wrapped list of navigation items"
    },
    {
      "name": "site-footer",
      "owner": "shell",
      "purpose": "Monumental baseline footer"
    },
    {
      "name": "home-layout",
      "owner": "home",
      "purpose": "Orchestrates the home page bento and hero"
    },
    {
      "name": "hero-monument",
      "owner": "home",
      "purpose": "The primary hero container featuring the roman arch background image"
    },
    {
      "name": "featured-grid",
      "owner": "home",
      "purpose": "Bento grid for top tier projects"
    },
    {
      "name": "projects-layout",
      "owner": "projects_index",
      "purpose": "Container for the full project listing stele"
    },
    {
      "name": "colonnade-grid",
      "owner": "projects_index",
      "purpose": "The masonry/grid layout for project cards with scroll timelines"
    },
    {
      "name": "designs-layout",
      "owner": "designs_index",
      "purpose": "Container for the visual design portfolio"
    },
    {
      "name": "gallery-masonry",
      "owner": "designs_index",
      "purpose": "Native CSS masonry layout for design assets"
    },
    {
      "name": "project-view",
      "owner": "project_detail",
      "purpose": "Root for an individual project's deep dive"
    },
    {
      "name": "project-header",
      "owner": "project_detail",
      "purpose": "Typographic monumental header for project title"
    },
    {
      "name": "project-content",
      "owner": "project_detail",
      "purpose": "Article container for project details and markdown"
    },
    {
      "name": "design-view",
      "owner": "design_detail",
      "purpose": "Root for a specific visual design piece"
    },
    {
      "name": "design-asset",
      "owner": "design_detail",
      "purpose": "Wrapper for the main design image ensuring strict containment"
    },
    {
      "name": "design-meta",
      "owner": "design_detail",
      "purpose": "Data table for design specs"
    },
    {
      "name": "standard-page",
      "owner": "page",
      "purpose": "Root layout for about and contact"
    },
    {
      "name": "page-body",
      "owner": "page",
      "purpose": "Centered reading column for prose"
    },
    {
      "name": "project-card",
      "owner": "project_item",
      "purpose": "Individual physical card for a project"
    },
    {
      "name": "project-title",
      "owner": "project_item",
      "purpose": "Chiseled title typography inside project card"
    },
    {
      "name": "design-card",
      "owner": "design_item",
      "purpose": "Individual frameless card for a design thumbnail"
    },
    {
      "name": "nav-link",
      "owner": "nav_item",
      "purpose": "Interactive navigation anchor"
    },
    {
      "name": "badge",
      "owner": "css",
      "purpose": "Runtime injected class for technical tags"
    },
    {
      "name": "src",
      "owner": "css",
      "purpose": "Runtime injected class for source links"
    },
    {
      "name": "backlink",
      "owner": "css",
      "purpose": "Runtime injected class for return navigation"
    },
    {
      "name": "btn",
      "owner": "css",
      "purpose": "Runtime injected class for action buttons"
    },
    {
      "name": "md-img",
      "owner": "css",
      "purpose": "Runtime injected class for markdown imagery"
    }
  ],
  "layoutBlueprints": {
    "shell": {
      "rootClass": "app-shell",
      "composition": "Provides a flex column wrapping the entire viewport. Top contains 'global-nav' utilizing 'nav-list' to horizontally wrap 'nav-link' elements with no hidden states. The main content flows below. The 'site-footer' anchors the bottom."
    },
    "home": {
      "rootClass": "home-layout",
      "composition": "Opens with 'hero-monument', a massive top-rounded section that accepts background-image: url(assets/hero.jpg). It contains kinetic typography. Below it flows the 'featured-grid', a dense bento layout."
    },
    "projects_index": {
      "rootClass": "projects-layout",
      "composition": "A monumental vertical layout. Houses the 'colonnade-grid' which utilizes CSS Grid subgrid lanes to align 'project-card' elements perfectly. Triggers scroll-driven reveals."
    },
    "designs_index": {
      "rootClass": "designs-layout",
      "composition": "A highly dense gallery layout. Uses 'gallery-masonry' to orchestrate 'design-card' elements into a seamless stone wall of imagery."
    },
    "project_detail": {
      "rootClass": "project-view",
      "composition": "A deep dive layout starting with a massive 'project-header' for the title, flowing into 'project-content' where prose and code snippets are bounded by strict readable line lengths (max-width 65ch)."
    },
    "design_detail": {
      "rootClass": "design-view",
      "composition": "Focuses heavily on the 'design-asset' expanding to fill optimal viewport space, with a rigid 'design-meta' sidebar or block underneath detailing the specifics in monospace."
    },
    "page": {
      "rootClass": "standard-page",
      "composition": "A centered, symmetrical layout. The 'page-body' handles text with algorithmic text-wrap balancing, perfect for the About and Contact views."
    },
    "project_item": {
      "rootClass": "project-card",
      "composition": "A brutal, chiseled container. Holds the 'project-title' in serif, followed by technical metadata injected as 'badge' and 'src' elements."
    },
    "design_item": {
      "rootClass": "design-card",
      "composition": "An image-first container with zero padding. Hovering over it utilizes :has() to dim sibling cards in the grid."
    },
    "nav_item": {
      "rootClass": "nav-link",
      "composition": "A strictly sized anchor ensuring a 44px touch target. High contrast active states without relying on hover effects for mobile."
    }
  }
}
```

## section:css

```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Marcellus&display=swap'); :root { --c-obsidian: oklch(20% 0.02 260); --c-basalt: oklch(28% 0.01 260); --c-brass: oklch(75% 0.15 80); --font-display: 'Marcellus', serif; --font-body: 'JetBrains Mono', monospace; --gap-struct: clamp(16px, 2vw, 32px); --pad-section: clamp(64px, 10vw, 120px); --radius-arch: 400px 400px 0 0; } * { box-sizing: border-box; margin: 0; padding: 0; } body { background-color: var(--c-obsidian); color: #fff; font-family: var(--font-body); line-height: 1.6; min-width: 390px; } img, .md-img { max-width: 100%; display: block; mix-blend-mode: luminosity; filter: contrast(1.2) brightness(0.8) sepia(0.3) hue-rotate(35deg); } .app-shell { display: flex; flex-direction: column; min-height: 100vh; } .global-nav { padding: var(--gap-struct); background: var(--c-obsidian); border-bottom: 1px solid var(--c-basalt); } .nav-list { display: flex; flex-wrap: wrap; gap: var(--gap-struct); list-style: none; } .nav-link { min-height: 44px; display: flex; align-items: center; color: #fff; text-decoration: none; font-weight: bold; padding: 0 16px; text-transform: uppercase; letter-spacing: 1px; transition: color 0.2s; } .nav-link:active, .nav-link:focus, .nav-link.active { color: var(--c-brass); } .site-footer { padding: var(--pad-section) var(--gap-struct); text-align: center; border-top: 1px solid var(--c-basalt); font-size: 0.875rem; margin-top: auto; } .home-layout { display: flex; flex-direction: column; gap: var(--pad-section); } .hero-monument { border-radius: var(--radius-arch); background-image: url(assets/hero.jpg); background-size: cover; background-position: center; min-height: 60vh; display: flex; align-items: center; justify-content: center; padding: var(--pad-section); position: relative; margin: var(--gap-struct); overflow: hidden; } .hero-monument::before { content: ''; position: absolute; inset: 0; background: var(--c-obsidian); opacity: 0.7; mix-blend-mode: multiply; } .hero-monument > * { position: relative; z-index: 1; font-family: var(--font-display); font-size: clamp(2rem, 8vw, 5rem); text-align: center; color: var(--c-brass); text-wrap: balance; } .featured-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--gap-struct); padding: 0 var(--gap-struct); } @media (min-width: 768px) { .featured-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } } .projects-layout { padding: var(--pad-section) var(--gap-struct); } .colonnade-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--gap-struct); } @media (min-width: 768px) { .colonnade-grid { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); } } .project-card { background: var(--c-basalt); border: 1px solid rgba(255, 255, 255, 0.05); padding: 24px; display: flex; flex-direction: column; gap: 16px; border-radius: 0; text-decoration: none; color: inherit; } @supports (animation-timeline: view()) { .colonnade-grid .project-card { animation: colonnadeReveal linear both; animation-timeline: view(); animation-range: entry 10% cover 30%; } } @keyframes colonnadeReveal { from { transform: translateY(100px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } } .project-title { font-family: var(--font-display); font-size: 1.5rem; color: var(--c-brass); text-wrap: balance; } .designs-layout { padding: var(--pad-section) var(--gap-struct); } .gallery-masonry { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--gap-struct); } @media (min-width: 768px) { .gallery-masonry { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); } } .gallery-masonry:has(.design-card:hover) .design-card:not(:hover) { opacity: 0.3; transition: opacity 0.4s; } .design-card { padding: 0; background: var(--c-basalt); transition: opacity 0.4s; display: block; border-radius: 0; } .design-card img { width: 100%; height: auto; display: block; } .project-view { padding: var(--pad-section) var(--gap-struct); display: flex; flex-direction: column; align-items: center; } .project-header { font-family: var(--font-display); font-size: clamp(2.5rem, 6vw, 4rem); color: var(--c-brass); text-align: center; text-wrap: balance; margin-bottom: var(--pad-section); width: 100%; max-width: 65ch; } .project-content { width: 100%; max-width: 65ch; display: flex; flex-direction: column; gap: 24px; } .design-view { display: flex; flex-direction: column; min-height: 100vh; } .design-asset { flex: 1; padding: var(--gap-struct); display: flex; align-items: center; justify-content: center; background: #000; } .design-asset img { max-height: 80vh; object-fit: contain; } .design-meta { padding: var(--gap-struct); background: var(--c-basalt); font-family: var(--font-body); display: grid; gap: 16px; border-top: 1px solid var(--c-brass); } @media (min-width: 768px) { .design-meta { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); } } .standard-page { padding: var(--pad-section) var(--gap-struct); display: flex; justify-content: center; } .page-body { width: 100%; max-width: 65ch; font-family: var(--font-body); text-wrap: balance; } .badge, .src, .btn { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 16px; background: var(--c-basalt); border: 1px solid var(--c-brass); color: var(--c-brass); font-family: var(--font-body); text-transform: uppercase; font-size: 0.75rem; text-decoration: none; flex-wrap: wrap; } .backlink { display: inline-flex; align-items: center; min-height: 44px; color: #fff; text-decoration: none; border-bottom: 1px solid var(--c-brass); margin-bottom: var(--gap-struct); } .md-img { margin: var(--gap-struct) 0; border: 1px solid var(--c-basalt); } .gi-reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.6s, transform 0.6s; } .gi-reveal.gi-in { opacity: 1; transform: translateY(0); } @media (prefers-reduced-motion: reduce) { *, ::before, ::after { animation-delay: -1ms !important; animation-duration: 1ms !important; animation-iteration-count: 1 !important; background-attachment: initial !important; scroll-behavior: auto !important; transition-duration: 0s !important; transition-delay: 0s !important; } .colonnade-grid .project-card { animation: none !important; opacity: 1 !important; transform: none !important; } .gi-reveal { opacity: 1; transform: none; } }

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
```

## section:layout:shell

```html
<div class="app-shell"><header class="global-nav"><nav class="nav-list">{{NAV_LINKS}}</nav></header><main>{{CONTENT}}</main><footer class="site-footer"><div class="src">{{SOURCE_PATH}}</div>{{THEME_PILLS}}</footer></div>
```

## section:layout:home

```html
<div class="home-layout"><header class="hero-monument">{{HEADLINE}}{{TAGLINE}}{{INTRO}}</header><section class="featured-grid">{{FEATURED_PROJECTS}}</section></div>
```

## section:layout:projects_index

```html
<div class="projects-layout"><div class="badge">{{PROJECT_COUNT}}</div><div class="colonnade-grid">{{PROJECT_LIST}}</div></div>
```

## section:layout:designs_index

```html
<div class="designs-layout"><div class="badge">{{DESIGN_COUNT}}</div><div class="gallery-masonry">{{DESIGN_CARDS}}</div></div>
```

## section:layout:project_detail

```html
<section class="project-view"><div class="backlink">{{BACKLINK}}</div><div class="project-header">{{LOGO}}{{NAME}}{{DESCRIPTION}}{{ROLE}}{{YEAR}}<div class="badge">{{TECH_BADGES}}</div><div class="src">{{REPO_LINK}}{{PROJECT_LINK}}{{SOURCE_PATH}}</div></div><div class="project-content">{{CONTENT}}</div></section>
```

## section:layout:design_detail

```html
<section class="design-view"><nav class="backlink">{{BACKLINK}}</nav><figure class="design-asset"><img src="{{PREVIEW}}" class="md-img" /></figure><div class="design-meta"><h1>{{NAME}}</h1><p>{{DESCRIPTION}}</p><span class="badge">{{YEAR}}</span><span class="badge">{{ROLE}}</span><span class="badge">{{CLIENT}}</span>{{TAG_BADGES}}</div><div>{{CONTENT}}</div><a href="{{LINK_URL}}" class="btn">{{NAME}}</a><a href="{{SOURCE_PATH}}" class="src">{{NAME}}</a></section>
```

## section:layout:page

```html
<article class="standard-page"><h1>{{NAME}}</h1><div class="page-body">{{CONTENT}}</div>{{SOURCE_PATH}}</article>
```

## section:layout:project_item

```html
<section class="project-card"><a href="{{URL}}">{{LOGO}}<h3 class="project-title">{{NAME}}</h3></a><div><p>{{DESCRIPTION}}</p><time>{{YEAR}}</time><span>{{INDEX}}</span>{{TECH_BADGES}}</div><a href="{{REPO_URL}}" class="src"></a></section>
```

## section:layout:design_item

```html
<section class="design-card"><a href="{{URL}}"><img src="{{PREVIEW}}" /><span>{{NAME}} {{CLIENT}} {{YEAR}} {{DESCRIPTION}} {{TAG_BADGES}}</span></a></section>
```

## section:layout:nav_item

```html
<a href="{{NAV_URL}}" class="nav-link {{NAV_ACTIVE_CLASS}}">{{NAV_NAME}}</a>
```
