---
name: "Avant-Garde Pierrot"
accent: "#000"
style: "CLOWNS"
constitution_version: "2"
token_colors: "Background: oklch(15% 0 0). Text: oklch(95% 0 0). Accent/Interactive: oklch(45% 0.25 29). Surface: oklch(20% 0 0)."
token_typography: "Display: 'Playfair Display', serif (stark, theatrical contrast). Body: 'Inter', sans-serif (austere, technical readability)."
token_spacing: "Base touch target: 44px minimum. Section gaps scale fluidly: clamp(4rem, 8vw, 8rem). Grid gaps: 1px (using surface color to create hairline borders) or 2rem for floating bento items."
signature_gesture: "Theatrical Spotlight Reveal: Using native CSS animation-timeline: view(), content cards and case studies fade in with a sweeping linear gradient mask that mimics a circus ringmaster's spotlight passing over them as they enter the viewport."
---

# Design System

---
tokens:
  color:
    bg: 'oklch(15% 0 0)'
    text: 'oklch(95% 0 0)'
    accent: 'oklch(45% 0.25 29)'
    surface: 'oklch(20% 0 0)'
  typography:
    display: '"Playfair Display", serif'
    body: '"Inter", sans-serif'
  spacing:
    mobile_gap: '1rem'
    desktop_gap: 'clamp(1.5rem, 3vw, 3rem)'
    touch_target: '44px'
  shape:
    radius: '0px'
---
# Avant-Garde Pierrot Design Constitution

This design merges the literal subject matter of CLOWNS with a highly technical, dark editorial portfolio. We avoid cheap carnival tropes by treating the clown aesthetic as high fashion: stark black-and-white greasepaint, rigid ruffled collars, and dramatic spotlighting. 

The layout uses strict mobile-first uncollapsed navigation and stark mathematical bento grids on desktop. No borders are rounded. All interactivity uses a signature greasepaint crimson accent to draw the eye, mirroring a clown's red nose or painted smile in an otherwise austere landscape.

## Locked Design Constitution

```json
{
  "name": "Avant-Garde Pierrot",
  "accent": "oklch(45% 0.25 29)",
  "signatureGesture": "Theatrical Spotlight Reveal: Using native CSS animation-timeline: view(), content cards and case studies fade in with a sweeping linear gradient mask that mimics a circus ringmaster's spotlight passing over them as they enter the viewport.",
  "mobileStrategy": "Strictly mobile-first. Navigation is permanently visible (no hamburger menus) and stacked vertically on mobile devices with padded 44px minimum touch targets. Content flows in a single linear column. Media queries using min-width expand these single columns into dense bento grids for larger viewports. Text uses text-wrap: pretty to prevent awkward ragging on narrow screens.",
  "imageTreatment": "Monochromatic high-contrast photography with a single vivid crimson element (a nose, a lip, a button). Literal clown attire (ruffles, hats, greasepaint) framed in extreme close-up, utilizing stark studio lighting against pitch-black voids.",
  "tokens": {
    "colors": "Background: oklch(15% 0 0). Text: oklch(95% 0 0). Accent/Interactive: oklch(45% 0.25 29). Surface: oklch(20% 0 0).",
    "typography": "Display: 'Playfair Display', serif (stark, theatrical contrast). Body: 'Inter', sans-serif (austere, technical readability).",
    "spacing": "Base touch target: 44px minimum. Section gaps scale fluidly: clamp(4rem, 8vw, 8rem). Grid gaps: 1px (using surface color to create hairline borders) or 2rem for floating bento items.",
    "shape": "Absolute zero border radius. Razor-sharp corners. Brutal rectangular intersections that contrast with the organic nature of the clown imagery.",
    "motion": "Exclusively GPU-composited. starting-style for instant initial renders. Scroll-driven timelines for all reveals. No JavaScript layout recalculations."
  },
  "classVocabulary": [
    {
      "name": "badge",
      "owner": "css",
      "purpose": "Injected runtime class for metadata tags"
    },
    {
      "name": "src",
      "owner": "css",
      "purpose": "Injected runtime class for code sources"
    },
    {
      "name": "backlink",
      "owner": "css",
      "purpose": "Injected runtime class for return navigation"
    },
    {
      "name": "btn",
      "owner": "css",
      "purpose": "Injected runtime class for interactive buttons"
    },
    {
      "name": "md-img",
      "owner": "css",
      "purpose": "Injected runtime class for markdown images"
    },
    {
      "name": "shell-root",
      "owner": "shell",
      "purpose": "Main layout wrapper and stacking context"
    },
    {
      "name": "global-nav",
      "owner": "shell",
      "purpose": "Header container for navigation links"
    },
    {
      "name": "nav-list",
      "owner": "shell",
      "purpose": "Unordered list wrapping navigation items"
    },
    {
      "name": "home-root",
      "owner": "home",
      "purpose": "Root container for the home page"
    },
    {
      "name": "hero-section",
      "owner": "home",
      "purpose": "Theatrical hero section with background image"
    },
    {
      "name": "spotlight-grid",
      "owner": "home",
      "purpose": "Bento grid for featured content"
    },
    {
      "name": "projects-root",
      "owner": "projects_index",
      "purpose": "Root container for projects list"
    },
    {
      "name": "masonry-list",
      "owner": "projects_index",
      "purpose": "Native CSS masonry container for project cards"
    },
    {
      "name": "project-card",
      "owner": "project_item",
      "purpose": "Individual project container"
    },
    {
      "name": "project-meta",
      "owner": "project_item",
      "purpose": "Technical metadata for a project"
    },
    {
      "name": "project-title",
      "owner": "project_item",
      "purpose": "Display heading for a project"
    },
    {
      "name": "project-doc",
      "owner": "project_detail",
      "purpose": "Root container for project case study"
    },
    {
      "name": "doc-header",
      "owner": "project_detail",
      "purpose": "Theatrical header for the document"
    },
    {
      "name": "doc-content",
      "owner": "project_detail",
      "purpose": "Prose and markdown content wrapper"
    },
    {
      "name": "designs-root",
      "owner": "designs_index",
      "purpose": "Root container for visual designs"
    },
    {
      "name": "bento-gallery",
      "owner": "designs_index",
      "purpose": "Bento grid for visual design items"
    },
    {
      "name": "design-card",
      "owner": "design_item",
      "purpose": "Container for a single design preview"
    },
    {
      "name": "design-figure",
      "owner": "design_item",
      "purpose": "Image wrapper inside a design card"
    },
    {
      "name": "design-doc",
      "owner": "design_detail",
      "purpose": "Root container for design detail view"
    },
    {
      "name": "showcase-frame",
      "owner": "design_detail",
      "purpose": "Large viewport for design assets"
    },
    {
      "name": "page-root",
      "owner": "page",
      "purpose": "Standard text page container"
    },
    {
      "name": "page-body",
      "owner": "page",
      "purpose": "Content wrapper for standard pages"
    },
    {
      "name": "nav-link",
      "owner": "nav_item",
      "purpose": "Individual anchor tag in the navigation"
    }
  ],
  "layoutBlueprints": {
    "shell": {
      "rootClass": "shell-root",
      "composition": "Provides a dark, theatrical backdrop. Contains the global-nav which stacks vertically on mobile for large touch targets, expanding into a stark horizontal bar on desktop via min-width. Injects the main content via router outlet below the navigation."
    },
    "home": {
      "rootClass": "home-root",
      "composition": "Opens with hero-section applying the main theatrical clown imagery. Below, the spotlight-grid organizes featured capabilities into a dense, severe bento layout that reveals via scroll-driven spotlights."
    },
    "projects_index": {
      "rootClass": "projects-root",
      "composition": "Displays a strict masonry-list of technical systems. Single column on mobile, expanding to a native CSS masonry layout on desktop using grid-template-rows: masonry."
    },
    "designs_index": {
      "rootClass": "designs-root",
      "composition": "A visually aggressive bento-gallery of visual work. Items are tightly packed with 1px hairline gaps, utilizing object-fit to maintain strict geometric boundaries."
    },
    "project_detail": {
      "rootClass": "project-doc",
      "composition": "Begins with a doc-header establishing the technical context, followed by a single-column doc-content area optimized for reading. Images and code blocks span full width."
    },
    "design_detail": {
      "rootClass": "design-doc",
      "composition": "Centers the visual work in a massive showcase-frame spanning the full viewport, with technical rationale trailing below in a stark, legible format."
    },
    "page": {
      "rootClass": "page-root",
      "composition": "A minimal, austere reading environment. Centers page-body content with a strict max-width for line lengths, heavily utilizing text-wrap: pretty."
    },
    "project_item": {
      "rootClass": "project-card",
      "composition": "A severe rectangular card. Contains project-title in a dramatic serif and project-meta in an austere monospace. Hover states use :has() to dim siblings and illuminate the hovered card."
    },
    "design_item": {
      "rootClass": "design-card",
      "composition": "A container dominated by a design-figure. Metadata is hidden on mobile to maximize image space, revealing on desktop via kinetic hover states."
    },
    "nav_item": {
      "rootClass": "nav-link",
      "composition": "A stark, unadorned anchor link ensuring a minimum 44px hit area. Uses the crimson accent color on active/focus states."
    }
  }
}
```

## section:css

```css
:root { --bg: oklch(15% 0 0); --text: oklch(95% 0 0); --accent: oklch(45% 0.25 29); --surface: oklch(20% 0 0); --font-display: 'Playfair Display', serif; --font-body: 'Inter', sans-serif; --gap-section: clamp(4rem, 8vw, 8rem); } * { box-sizing: border-box; margin: 0; padding: 0; } body { background-color: var(--bg); color: var(--text); font-family: var(--font-body); line-height: 1.6; -webkit-font-smoothing: antialiased; } h1, h2, h3, h4, .project-title, .doc-header h1 { font-family: var(--font-display); font-weight: 400; text-transform: uppercase; letter-spacing: 0.05em; text-wrap: balance; } p, li, blockquote { text-wrap: pretty; } img { max-width: 100%; height: auto; display: block; border-radius: 0; } a { color: inherit; text-decoration: none; } .shell-root { display: flex; flex-direction: column; min-height: 100vh; background-image: url('assets/logo.png'); background-repeat: no-repeat; background-position: center bottom 2rem; background-size: 44px auto; } .global-nav { background-color: var(--bg); border-bottom: 1px solid var(--surface); padding: 1rem 2rem; display: flex; flex-direction: column; } .nav-list { list-style: none; display: flex; flex-direction: column; gap: 0; } .nav-link { display: flex; align-items: center; min-height: 44px; color: var(--text); font-family: var(--font-body); font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.1em; transition: color 0.3s ease; } .nav-link:hover, .nav-link:focus, .nav-link.active { color: var(--accent); } .home-root { display: flex; flex-direction: column; gap: var(--gap-section); padding-bottom: var(--gap-section); } .hero-section { min-height: 80vh; background: var(--bg) url('assets/hero.jpg') no-repeat center top / cover; position: relative; display: flex; align-items: flex-end; padding: 2rem; border-bottom: 1px solid var(--surface); } .hero-section::before { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, var(--bg) 0%, transparent 70%); } .hero-section > * { position: relative; z-index: 2; max-width: 800px; } .spotlight-grid { display: grid; gap: 2rem; padding: 0 2rem; } .projects-root { padding: var(--gap-section) 2rem; } .masonry-list { display: grid; grid-template-columns: minmax(0, 1fr); gap: 2rem; } .project-card { display: flex; flex-direction: column; gap: 1rem; padding: 2rem; background-color: var(--bg); border: 1px solid var(--surface); transition: border-color 0.4s ease, opacity 0.4s ease; text-decoration: none; } .masonry-list:has(.project-card:hover) .project-card:not(:hover) { opacity: 0.3; filter: grayscale(100%); } .project-card:hover { border-color: var(--accent); } .project-title { font-size: 1.75rem; color: var(--text); line-height: 1.1; } .project-meta { font-family: monospace; font-size: 0.75rem; color: var(--accent); text-transform: uppercase; letter-spacing: 0.05em; } .project-doc, .page-root { padding: var(--gap-section) 2rem; max-width: 800px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 4rem; } .doc-header { display: flex; flex-direction: column; gap: 1rem; border-bottom: 4px solid var(--accent); padding-bottom: 2rem; } .doc-content, .page-body { display: flex; flex-direction: column; gap: 2rem; } .designs-root { padding: var(--gap-section) 2rem; background-color: var(--surface); } .bento-gallery { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1px; background-color: var(--surface); border: 1px solid var(--surface); } .design-card { background-color: var(--bg); position: relative; display: flex; overflow: hidden; aspect-ratio: 1; } .design-figure { width: 100%; height: 100%; margin: 0; overflow: hidden; } .design-figure img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(100%) contrast(1.2); transition: filter 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); } .design-card:hover .design-figure img { filter: grayscale(0) contrast(1.1); transform: scale(1.05); } .design-doc { display: flex; flex-direction: column; width: 100%; } .showcase-frame { width: 100%; height: 80vh; background-color: #000; display: flex; justify-content: center; align-items: center; overflow: hidden; padding: 2rem; } .showcase-frame img { max-width: 100%; max-height: 100%; object-fit: contain; box-shadow: 0 0 40px rgba(0,0,0,0.8); } .badge { display: inline-flex; align-items: center; justify-content: center; min-height: 24px; padding: 0 0.75rem; border: 1px solid var(--accent); color: var(--accent); font-family: monospace; font-size: 0.65rem; text-transform: uppercase; white-space: nowrap; } .src { font-family: monospace; font-size: 0.85em; color: var(--accent); background-color: var(--surface); padding: 0.2em 0.4em; } .backlink, .btn { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 2rem; background-color: var(--surface); color: var(--text); border: 1px solid transparent; font-family: var(--font-body); font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; transition: all 0.3s ease; } .btn:hover, .backlink:hover { background-color: transparent; border-color: var(--accent); color: var(--accent); } .md-img { width: 100%; border: 1px solid var(--surface); margin: 2rem 0; } .gi-reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.8s ease, transform 0.8s ease; } .gi-reveal.gi-in { opacity: 1; transform: translateY(0); } @starting-style { .gi-reveal.gi-in { opacity: 0; transform: translateY(20px); } } @supports (animation-timeline: view()) { .project-card, .design-card { opacity: 0; animation: theatricalSpotlight linear both; animation-timeline: view(); animation-range: entry 5% cover 30%; } } @keyframes theatricalSpotlight { 0% { opacity: 0; clip-path: inset(0 100% 0 0); filter: brightness(0.2) sepia(1) hue-rotate(-50deg); transform: scale(0.98); } 100% { opacity: 1; clip-path: inset(0 0 0 0); filter: brightness(1) sepia(0) hue-rotate(0); transform: scale(1); } } @media (prefers-reduced-motion: reduce) { *, *::before, *::after, .project-card, .design-card { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; opacity: 1 !important; clip-path: none !important; transform: none !important; } } @media (min-width: 768px) { .global-nav { position: sticky; top: 0; z-index: 100; flex-direction: row; justify-content: space-between; align-items: center; padding: 1rem 4rem; } .nav-list { flex-direction: row; gap: 3rem; } .spotlight-grid { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); padding: 0 4rem; } .projects-root { padding: var(--gap-section) 4rem; } .masonry-list { grid-template-columns: repeat(2, minmax(0, 1fr)); } .bento-gallery { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); } .hero-section, .showcase-frame { padding: 4rem; } } @media (min-width: 1200px) { .masonry-list { grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: masonry; align-items: start; } .bento-gallery { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

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
.hero-section { display: flex !important; flex-direction: column !important; justify-content: center !important; align-items: flex-start !important; gap: 1.5rem !important; height: auto !important; min-height: 50vh !important; padding: 4rem 1.5rem !important; box-sizing: border-box !important; } .hero-section h1, .hero-section h2, .hero-section p, .hero-section .headline, .hero-section .tagline { position: static !important; display: block !important; margin: 0 !important; padding: 0 !important; line-height: 1.3 !important; transform: none !important; } .hero-section p, .hero-section .tagline { line-height: 1.6 !important; margin-top: 0.5rem !important; } .nav-list { display: flex !important; flex-direction: column !important; width: 100% !important; padding: 0 !important; margin: 0 !important; list-style: none !important; } .nav-link { display: flex !important; align-items: center !important; min-height: 44px !important; width: 100% !important; padding: 12px 0 !important; box-sizing: border-box !important; } @media (min-width: 768px) { .nav-list { flex-direction: row !important; gap: 2rem !important; } .nav-link { width: auto !important; min-height: auto !important; padding: 8px 0 !important; } } .project-card, .project-card p, .project-meta, .project-meta *, .badge, .src { color: oklch(90% 0 0) !important; } .project-card p, .project-card .description { color: oklch(85% 0 0) !important; } .project-meta span, .project-meta time { color: oklch(85% 0 0) !important; } .badge, .src { background-color: oklch(25% 0 0) !important; color: oklch(95% 0.03 29) !important; border: 1px solid oklch(45% 0.25 29) !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; }

/* review-board fix layer (pass 2) */
@media (min-width: 768px) { .promo-banner, [class*="banner"], [role="banner"] { position: relative !important; top: 0 !important; left: 0 !important; transform: none !important; margin-bottom: 2rem !important; width: 100% !important; display: block !important; z-index: 10 !important; } .shell-root { display: flex; flex-direction: column; } } @media (max-width: 767px) { .hero-section { background-blend-mode: multiply; background-color: oklch(15% 0 0 / 0.6) !important; } .hero-section h1, .hero-section .headline, .hero-section .tagline, .hero-section .intro, .hero-section > div { background-color: oklch(15% 0 0 / 0.95) !important; padding: 1.5rem !important; border-left: 3px solid oklch(45% 0.25 29) !important; box-shadow: 0 10px 30px oklch(15% 0 0 / 0.5) !important; text-wrap: pretty !important; } }
```

## section:layout:shell

```html
<div class="shell-root"><nav class="global-nav"><ul class="nav-list">{{NAV_LINKS}}</ul></nav><main>{{CONTENT}}</main><footer>{{THEME_PILLS}}<div class="src">{{SOURCE_PATH}}</div></footer></div>
```

## section:layout:home

```html
<section class="home-root"><div class="hero-section"><h1>{{HEADLINE}}</h1><h2>{{TAGLINE}}</h2><div>{{INTRO}}</div><span>{{FEATURED_COUNT}}</span></div><div class="spotlight-grid">{{FEATURED_PROJECTS}}</div></section>
```

## section:layout:projects_index

```html
<div class="projects-root"><div class="badge">{{PROJECT_COUNT}}</div><div class="masonry-list">{{PROJECT_LIST}}</div></div>
```

## section:layout:designs_index

```html
<section class="designs-root"><div class="bento-gallery">{{DESIGN_CARDS}}</div></section>
```

## section:layout:project_detail

```html
<article class="project-doc"><header class="doc-header"><nav class="backlink">{{BACKLINK}}</nav><figure class="md-img">{{LOGO}}</figure><h1>{{NAME}}</h1><div>{{DESCRIPTION}}</div><div><span>{{ROLE}}</span><span>{{YEAR}}</span></div><div class="badge">{{TECH_BADGES}}</div><div class="btn">{{PROJECT_LINK}}</div><div class="src">{{REPO_LINK}}</div><div class="src">{{SOURCE_PATH}}</div></header><div class="doc-content">{{CONTENT}}</div></article>
```

## section:layout:design_detail

```html
<section class="design-doc">{{BACKLINK}}<figure class="showcase-frame"><img src="{{PREVIEW}}" class="md-img" alt="" /></figure><header class="doc-header"><h1 class="project-title">{{NAME}}</h1><div class="project-meta">{{DESCRIPTION}} {{CLIENT}} {{ROLE}} {{YEAR}}</div><div class="badge">{{TAG_BADGES}}</div><a href="{{LINK_URL}}" class="btn">{{NAME}}</a><div class="src">{{SOURCE_PATH}}</div></header><div class="doc-content">{{CONTENT}}</div></section>
```

## section:layout:page

```html
<article class="page-root"><h1>{{NAME}}</h1><div class="page-body">{{CONTENT}}</div><div class="src">{{SOURCE_PATH}}</div></article>
```

## section:layout:project_item

```html
<section class="project-card"><div>{{LOGO}}</div><a href="{{URL}}" class="btn"><h3 class="project-title">{{NAME}}</h3></a><div class="project-meta"><span>{{INDEX}}</span><span>{{YEAR}}</span><span class="badge">{{TECH_BADGES}}</span><p>{{DESCRIPTION}}</p><a href="{{REPO_URL}}" class="src"></a></div></section>
```

## section:layout:design_item

```html
<section class="design-card"><a href="{{URL}}" class="design-figure"><img src="{{PREVIEW}}" alt="{{NAME}}" class="md-img" /></a><a href="{{URL}}" class="btn">{{NAME}}</a></section>
```

## section:layout:nav_item

```html
<section class="nav-link {{NAV_ACTIVE_CLASS}}"><a href="{{NAV_URL}}">{{NAV_NAME}}</a></section>
```
