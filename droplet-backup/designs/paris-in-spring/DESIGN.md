---
name: "Overcast Magnolia"
accent: "#888888"
style: "Paris in spring"
constitution_version: "2"
token_colors: "bg-slate: oklch(22% 0.01 260), bg-surface: oklch(28% 0.015 260), text-limestone: oklch(95% 0.01 100), accent-magnolia: oklch(70% 0.18 350), border-iron: oklch(35% 0.01 260)"
token_typography: "display: 'Bodoni Moda', serif, body: 'Commissioner', sans-serif, weight-display: 400, weight-body: 300"
token_spacing: "xs: 0.5rem, sm: 1rem, md: 2rem, lg: 4rem, xl: 8rem, grid-gap: 1px, tap-target: 44px"
signature_gesture: "A scroll-driven 'lifting fog' reveal. As the user scrolls down the page, elements utilize animation-timeline: view() and @starting-style to fade up from a lower opacity and slight physical depression, mimicking visibility cutting through a dense, overcast spring morning. Hover states on bento grid items trigger an OKLCH chroma shift on the borders, glowing faintly with magnolia pink while sibling elements dim via the :has() selector."
---

# Design System

--- tokens: color: bg-slate: 'oklch(22% 0.01 260)', bg-surface: 'oklch(28% 0.015 260)', text-limestone: 'oklch(95% 0.01 100)', accent-magnolia: 'oklch(70% 0.18 350)', border-iron: 'oklch(35% 0.01 260)' typography: display: '"Bodoni Moda", serif', body: '"Commissioner", sans-serif' spacing: section-y: 'clamp(64px, 10vw, 128px)', grid-gap: 'clamp(16px, 3vw, 32px)', shape: radius: '0px', border: '1px solid var(--border-iron)' --- This design strictly avoids the warm cream or neon cyber tropes. The visual identity of this AI engineering portfolio is rooted in a specific physical environment: Paris during a spring downpour. The interface functions as an austere ledger. We utilize Bodoni Moda to evoke high-end Parisian editorial design, grounding the technical subject matter in history and elegance. The complete absence of border radius mimics cut stone and forged iron. All structural dividers carry semantic meaning, mapping the technical data like an architectural schematic. The voice is dry, precise, and authoritative, letting the stark floral imagery provide the only emotional contrast.

## Locked Design Constitution

```json
{
  "name": "Overcast Magnolia",
  "accent": "Magnolia Pink",
  "signatureGesture": "A scroll-driven 'lifting fog' reveal. As the user scrolls down the page, elements utilize animation-timeline: view() and @starting-style to fade up from a lower opacity and slight physical depression, mimicking visibility cutting through a dense, overcast spring morning. Hover states on bento grid items trigger an OKLCH chroma shift on the borders, glowing faintly with magnolia pink while sibling elements dim via the :has() selector.",
  "mobileStrategy": "Mobile layout is the foundation, enforcing a rigid single-column flow with explicit vertical gaps. The navigation is entirely visible and wraps cleanly, utilizing strict 44px touch targets enforced by padding, not just element size. Grids expand to bento and masonry structures exclusively via min-width media queries at 768px and 1024px. Deep hierarchies in project details stack logically, keeping metadata chips bounded in flex-wrap containers to prevent horizontal collisions.",
  "imageTreatment": "Photography must strictly adhere to high-contrast, desaturated environments (rain, iron, slate, fog) with isolated, highly saturated elements of spring flora (cherry blossoms, magnolias, pale green buds). Strict Subject-Context-Style constraints must maintain this dualism. Images should have 0px border radius and sit flush against the 1px iron grid borders.",
  "tokens": {
    "colors": "bg-slate: oklch(22% 0.01 260), bg-surface: oklch(28% 0.015 260), text-limestone: oklch(95% 0.01 100), accent-magnolia: oklch(70% 0.18 350), border-iron: oklch(35% 0.01 260)",
    "typography": "display: 'Bodoni Moda', serif, body: 'Commissioner', sans-serif, weight-display: 400, weight-body: 300",
    "spacing": "xs: 0.5rem, sm: 1rem, md: 2rem, lg: 4rem, xl: 8rem, grid-gap: 1px, tap-target: 44px",
    "shape": "radius-none: 0px, border-thin: 1px solid oklch(35% 0.01 260)",
    "motion": "easing-fog: cubic-bezier(0.2, 0, 0, 1), duration-slow: 800ms, duration-snap: 150ms"
  },
  "classVocabulary": [
    {
      "name": "shell-root",
      "owner": "shell",
      "purpose": "Establishes the global layout wrapper and viewport boundaries"
    },
    {
      "name": "site-nav",
      "owner": "shell",
      "purpose": "Contains the global navigation links and brand marker"
    },
    {
      "name": "site-footer",
      "owner": "shell",
      "purpose": "Anchors the bottom of the page with contact and legal data"
    },
    {
      "name": "home-root",
      "owner": "home",
      "purpose": "Wraps the entire home page composition"
    },
    {
      "name": "hero-section",
      "owner": "home",
      "purpose": "Contains the main thesis statement and atmospheric background"
    },
    {
      "name": "featured-grid",
      "owner": "home",
      "purpose": "Bento grid container for highlighted work"
    },
    {
      "name": "projects-root",
      "owner": "projects_index",
      "purpose": "Wraps the project index list layout"
    },
    {
      "name": "projects-ledger",
      "owner": "projects_index",
      "purpose": "Architectural grid for listing technical repositories"
    },
    {
      "name": "designs-root",
      "owner": "designs_index",
      "purpose": "Wraps the visual design gallery"
    },
    {
      "name": "masonry-gallery",
      "owner": "designs_index",
      "purpose": "Native CSS masonry container for visual outputs"
    },
    {
      "name": "project-detail-root",
      "owner": "project_detail",
      "purpose": "Wraps the case study layout"
    },
    {
      "name": "project-header",
      "owner": "project_detail",
      "purpose": "Contains the title and metadata for the project"
    },
    {
      "name": "project-body",
      "owner": "project_detail",
      "purpose": "Contains the long-form text and technical markdown content"
    },
    {
      "name": "design-detail-root",
      "owner": "design_detail",
      "purpose": "Wraps the high-resolution design inspection layout"
    },
    {
      "name": "design-showcase",
      "owner": "design_detail",
      "purpose": "Presents the primary visual asset in an isolated frame"
    },
    {
      "name": "page-root",
      "owner": "page",
      "purpose": "Standard wrapper for generic text pages"
    },
    {
      "name": "page-content",
      "owner": "page",
      "purpose": "Constrains readable width for about and contact text"
    },
    {
      "name": "project-card",
      "owner": "project_item",
      "purpose": "Interactive surface for individual project previews"
    },
    {
      "name": "project-meta",
      "owner": "project_item",
      "purpose": "Flex container for taxonomy chips within a card"
    },
    {
      "name": "design-card",
      "owner": "design_item",
      "purpose": "Interactive surface for visual design previews"
    },
    {
      "name": "nav-link",
      "owner": "nav_item",
      "purpose": "Interactive anchor enforcing 44px tap targets"
    },
    {
      "name": "badge",
      "owner": "css",
      "purpose": "Injected runtime class for technology tags"
    },
    {
      "name": "src",
      "owner": "css",
      "purpose": "Injected runtime class for source links"
    },
    {
      "name": "backlink",
      "owner": "css",
      "purpose": "Injected runtime class for navigational return links"
    },
    {
      "name": "btn",
      "owner": "css",
      "purpose": "Injected runtime class for primary actions"
    },
    {
      "name": "md-img",
      "owner": "css",
      "purpose": "Injected runtime class for bounding markdown imagery"
    }
  ],
  "layoutBlueprints": {
    "shell": {
      "rootClass": "shell-root",
      "composition": "A persistent, structural outer frame. The site-nav sits flush at the top with a 1px border-bottom, acting as an architectural header. The site-footer mirrors this at the bottom. The main content area sits between them, utilizing min-height: 100dvh."
    },
    "home": {
      "rootClass": "home-root",
      "composition": "Opens with the hero-section occupying 80vh, displaying the macro botanical background and a massive Bodoni Moda headline. Followed by the featured-grid, a dense bento layout applying strict 1px gaps."
    },
    "projects_index": {
      "rootClass": "projects-root",
      "composition": "A single-column architectural ledger (projects-ledger) that maps each item to a strict horizontal row. Border-top on each row creates a continuous tabular aesthetic."
    },
    "designs_index": {
      "rootClass": "designs-root",
      "composition": "Utilizes the masonry-gallery to pack variable-height design-card elements tightly. Governed by native CSS grid masonry where supported, falling back to standard grid tracks."
    },
    "project_detail": {
      "rootClass": "project-detail-root",
      "composition": "The project-header establishes the hierarchy with massive type and a flex-wrap row for metadata. The project-body strictly constrains text to 65ch to prevent multi-column collision, ensuring pristine reading ergonomics."
    },
    "design_detail": {
      "rootClass": "design-detail-root",
      "composition": "Centers the design-showcase in an expansive, minimally decorated frame. Uses deep slate margins to let the artwork breathe, with metadata pushed to the absolute bottom edge."
    },
    "page": {
      "rootClass": "page-root",
      "composition": "A refined reading environment. The page-content container is centrally aligned, utilizing generous clamp spacing and strict max-widths to maintain an editorial column feel."
    },
    "project_item": {
      "rootClass": "project-card",
      "composition": "A surface acting as a bento tile or ledger row. Contains a bold title, a brief abstract, and the project-meta container for badges. Uses :has() on the parent to dim non-hovered cards."
    },
    "design_item": {
      "rootClass": "design-card",
      "composition": "An image-first container. The image fills the track completely, with a thin 1px overlay border. Hovering triggers a kinetic color shift on the border and reveals a minimal label."
    },
    "nav_item": {
      "rootClass": "nav-link",
      "composition": "A discrete typography element. Employs padding to guarantee a 44px touch target on mobile without disrupting the austere visual alignment."
    }
  }
}
```

## section:css

```css
@import url("https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;1,6..96,400&family=Commissioner:wght@300&display=swap"); :root { --bg-slate: oklch(22% 0.01 260); --bg-surface: oklch(28% 0.015 260); --text-limestone: oklch(95% 0.01 100); --accent-magnolia: oklch(70% 0.18 350); --border-iron: oklch(35% 0.01 260); --font-display: "Bodoni Moda", serif; --font-body: "Commissioner", sans-serif; --weight-display: 400; --weight-body: 300; --space-xs: 0.5rem; --space-sm: 1rem; --space-md: 2rem; --space-lg: 4rem; --space-xl: 8rem; --grid-gap: 1px; --tap-target: 44px; --radius-none: 0px; --border-thin: 1px solid var(--border-iron); --easing-fog: cubic-bezier(0.2, 0, 0, 1); --duration-slow: 800ms; --duration-snap: 150ms; } * { box-sizing: border-box; margin: 0; padding: 0; } html, body { background: var(--bg-slate); color: var(--text-limestone); font-family: var(--font-body); font-weight: var(--weight-body); line-height: 1.6; -webkit-font-smoothing: antialiased; overflow-x: hidden; } h1, h2, h3, h4, h5, h6 { font-family: var(--font-display); font-weight: var(--weight-display); line-height: 1.1; margin-bottom: var(--space-sm); } p { margin-bottom: var(--space-md); } a { color: inherit; text-decoration: none; } img, video { max-width: 100%; height: auto; display: block; border-radius: var(--radius-none); } .shell-root { min-height: 100dvh; display: flex; flex-direction: column; } .site-nav { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; padding: var(--space-sm) var(--space-md); border-bottom: var(--border-thin); background: var(--bg-slate); position: sticky; top: 0; z-index: 100; gap: var(--space-sm); } .site-footer { margin-top: auto; padding: var(--space-md); border-top: var(--border-thin); font-size: 0.875rem; color: color-mix(in srgb, var(--text-limestone) 60%, transparent); } .nav-link { display: inline-flex; align-items: center; min-height: var(--tap-target); padding: 0 var(--space-xs); transition: color var(--duration-snap); } .nav-link:hover { color: var(--accent-magnolia); } .home-root { display: flex; flex-direction: column; } .hero-section { min-height: 80vh; display: flex; flex-direction: column; justify-content: center; padding: var(--space-md); background-image: linear-gradient(to bottom, color-mix(in srgb, var(--bg-slate) 40%, transparent), var(--bg-slate)), url('assets/hero.jpg'); background-size: cover; background-position: center; border-bottom: var(--border-thin); } .hero-section h1 { font-size: clamp(2.5rem, 8vw, 6rem); max-width: 16ch; } .featured-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--grid-gap); background: var(--border-iron); border-bottom: var(--border-thin); } @media (min-width: 768px) { .featured-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } } .projects-root, .designs-root, .page-root { padding: var(--space-md); display: flex; flex-direction: column; gap: var(--space-lg); min-width: 0; } .projects-ledger { display: flex; flex-direction: column; border-top: var(--border-thin); } .project-card { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-sm); padding: var(--space-md); background: var(--bg-slate); border-bottom: var(--border-thin); transition: border-color var(--duration-slow) var(--easing-fog), opacity var(--duration-slow); min-width: 0; overflow-wrap: break-word; } @media (min-width: 768px) { .project-card { grid-template-columns: 2fr 3fr 1fr; align-items: baseline; } } .featured-grid .project-card { border-bottom: none; } .featured-grid:has(.project-card:hover) .project-card:not(:hover), .projects-ledger:has(.project-card:hover) .project-card:not(:hover), .masonry-gallery:has(.design-card:hover) .design-card:not(:hover) { opacity: 0.3; } .project-card:hover { border-color: var(--accent-magnolia); } .project-meta { display: flex; flex-wrap: wrap; gap: var(--space-xs); } .masonry-gallery { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-md); } @media (min-width: 768px) { .masonry-gallery { grid-template-columns: repeat(2, minmax(0, 1fr)); } } @media (min-width: 1024px) { .masonry-gallery { grid-template-columns: repeat(3, minmax(0, 1fr)); } } .design-card { position: relative; background: var(--bg-surface); border: var(--border-thin); transition: border-color var(--duration-slow) var(--easing-fog), opacity var(--duration-slow); display: flex; flex-direction: column; } .design-card:hover { border-color: var(--accent-magnolia); } .design-card img { width: 100%; border-bottom: var(--border-thin); } .project-detail-root { padding: var(--space-lg) var(--space-md); display: flex; flex-direction: column; align-items: center; } .project-header { width: 100%; max-width: 65ch; margin-bottom: var(--space-xl); border-bottom: var(--border-thin); padding-bottom: var(--space-md); } .project-header h1 { font-size: clamp(2rem, 5vw, 4rem); word-break: break-word; } .project-body, .page-content { width: 100%; max-width: 65ch; margin: 0 auto; overflow-wrap: break-word; } .design-detail-root { padding: var(--space-md); display: flex; flex-direction: column; align-items: center; } .design-showcase { width: 100%; max-width: 90vw; margin-bottom: var(--space-lg); border: var(--border-thin); background: var(--bg-surface); } .badge { display: inline-flex; align-items: center; padding: 0.2rem 0.6rem; border: var(--border-thin); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-limestone); background: var(--bg-slate); white-space: nowrap; } .src, .backlink { display: inline-flex; align-items: center; min-height: var(--tap-target); font-size: 0.875rem; text-decoration: underline; text-underline-offset: 4px; padding: 0 var(--space-xs); } .btn { display: inline-flex; align-items: center; justify-content: center; min-height: var(--tap-target); padding: 0 var(--space-md); background: var(--text-limestone); color: var(--bg-slate); font-weight: 400; text-transform: uppercase; letter-spacing: 0.05em; border: none; cursor: pointer; transition: background var(--duration-snap); } .btn:hover { background: var(--accent-magnolia); } .md-img { margin: var(--space-md) 0; border: var(--border-thin); } @supports (animation-timeline: view()) { .project-card, .design-card, .design-showcase { opacity: 0; transform: translateY(30px) scale(0.98); animation: fog-lift both var(--easing-fog); animation-timeline: view(); animation-range: entry 5% cover 25%; } } @keyframes fog-lift { to { opacity: 1; transform: translateY(0) scale(1); } } .gi-reveal { opacity: 0; transform: translateY(20px); transition: opacity var(--duration-slow) var(--easing-fog), transform var(--duration-slow) var(--easing-fog); } .gi-reveal.gi-in { opacity: 1; transform: translateY(0); } @starting-style { .gi-reveal.gi-in { opacity: 0; transform: translateY(20px); } }

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
<div class="shell-root"><nav class="site-nav">{{NAV_LINKS}}</nav><main>{{CONTENT}}</main><footer class="site-footer">{{THEME_PILLS}}{{SOURCE_PATH}}</footer></div>
```

## section:layout:home

```html
<div class="home-root"><section class="hero-section"><h1>{{HEADLINE}}</h1><p>{{TAGLINE}}</p><div>{{INTRO}}</div></section><section><header><h2>{{FEATURED_COUNT}}</h2></header><div class="featured-grid">{{FEATURED_PROJECTS}}</div></section></div>
```

## section:layout:projects_index

```html
<section class="projects-root"><div class="badge">{{PROJECT_COUNT}}</div><div class="projects-ledger">{{PROJECT_LIST}}</div></section>
```

## section:layout:designs_index

```html
<section class="designs-root"><div class="masonry-gallery">{{DESIGN_CARDS}}</div></section>
```

## section:layout:project_detail

```html
<article class="project-detail-root"><header class="project-header">{{BACKLINK}}{{LOGO}}<h1>{{NAME}}</h1><p>{{DESCRIPTION}}</p><div>{{ROLE}}{{YEAR}}{{SOURCE_PATH}}</div><div>{{TECH_BADGES}}</div><div>{{PROJECT_LINK}}{{REPO_LINK}}</div></header><div class="project-body">{{CONTENT}}</div></article>
```

## section:layout:design_detail

```html
<section class="design-detail-root"><div>{{BACKLINK}}</div><div class="design-showcase"><img src="{{PREVIEW}}" alt="{{NAME}}" class="md-img"></div><header><h1>{{NAME}}</h1><p>{{DESCRIPTION}}</p></header><ul><li>{{CLIENT}}</li><li>{{ROLE}}</li><li>{{YEAR}}</li></ul><div>{{TAG_BADGES}}</div><article>{{CONTENT}}</article><footer><a href="{{LINK_URL}}" class="btn">{{NAME}}</a><span class="src">{{SOURCE_PATH}}</span></footer></section>
```

## section:layout:page

```html
<div class="page-root"><div class="page-content"><h1>{{NAME}}</h1>{{CONTENT}}<div class="src">{{SOURCE_PATH}}</div></div></div>
```

## section:layout:project_item

```html
<article class="project-card"><a href="{{URL}}"><figure>{{LOGO}}</figure><h2>{{INDEX}} {{NAME}}</h2><p>{{DESCRIPTION}}</p><time>{{YEAR}}</time></a><div class="project-meta">{{TECH_BADGES}}</div></article>
```

## section:layout:design_item

```html
<section class="design-card"><a href="{{URL}}"><img class="md-img" src="{{PREVIEW}}" alt="{{NAME}}" /></a><div><h3>{{NAME}}</h3></div></section>
```

## section:layout:nav_item

```html
<a href="{{NAV_URL}}" class="nav-link {{NAV_ACTIVE_CLASS}}">{{NAV_NAME}}</a>
```
