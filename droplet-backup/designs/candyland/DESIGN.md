---
name: "Confectionary Lab System"
accent: "#e5e0d8"
style: "candyland"
constitution_version: "2"
token_colors: "--bg-marshmallow: oklch(98% 0.01 90); --text-licorice: oklch(15% 0.02 300); --accent-mint: oklch(85% 0.1 160); --accent-bubblegum: oklch(80% 0.15 350); --accent-lemon: oklch(90% 0.12 100); --sugar-glass: color-mix(in oklch, var(--bg-marshmallow) 70%, transparent);"
token_typography: "--font-display: 'Shrikhand', serif; --font-body: 'Fredoka', sans-serif; --fw-body: 400; --fw-bold: 600; --text-balance: balance;"
token_spacing: "--gap-xs: 0.5rem; --gap-sm: 1rem; --gap-md: 2rem; --gap-lg: 4rem; --radius-candy: 1.5rem; --radius-pill: 999px; --touch-target: 48px;"
signature_gesture: "Taffy-pull elastic scroll reveals. As the user scrolls, bento cards stretch slightly on the Y-axis before snapping into their rigid grid formations, utilizing CSS animation-timeline: view() and native spring physics."
---

# Design System

A strict, bento-grid based architectural layout rendered in literal candyland materials. The interface operates like a high-end chocolatier's display case—each piece of engineering content is isolated in its own 'wrapper' or 'sugar-glass' container. The aesthetic avoids chaos by utilizing sterile, lab-like whitespace (marshmallow white) and dry, highly technical copy that juxtaposes the candy-colored visuals. Surfaces are matte, utilizing SVGs to render subtle powdered-sugar grain.

## Locked Design Constitution

```json
{
  "name": "Confectionary Lab System",
  "accent": "Mint & Bubblegum",
  "signatureGesture": "Taffy-pull elastic scroll reveals. As the user scrolls, bento cards stretch slightly on the Y-axis before snapping into their rigid grid formations, utilizing CSS animation-timeline: view() and native spring physics.",
  "mobileStrategy": "Single-column stacked bonbon boxes on mobile. The navigation is permanently visible but collapses into a compact, scrollable horizontal list of touch-optimized 48px pills. The Bento grid naturally unwraps to 1fr blocks below 768px.",
  "imageTreatment": "Photography is treated with a high-key, studio-lighting effect with subtle frosted-glass overlays (backdrop-filter: blur) around the captions, keeping the candy-colored imagery vivid but cleanly separated from text.",
  "tokens": {
    "colors": "--bg-marshmallow: oklch(98% 0.01 90); --text-licorice: oklch(15% 0.02 300); --accent-mint: oklch(85% 0.1 160); --accent-bubblegum: oklch(80% 0.15 350); --accent-lemon: oklch(90% 0.12 100); --sugar-glass: color-mix(in oklch, var(--bg-marshmallow) 70%, transparent);",
    "typography": "--font-display: 'Shrikhand', serif; --font-body: 'Fredoka', sans-serif; --fw-body: 400; --fw-bold: 600; --text-balance: balance;",
    "spacing": "--gap-xs: 0.5rem; --gap-sm: 1rem; --gap-md: 2rem; --gap-lg: 4rem; --radius-candy: 1.5rem; --radius-pill: 999px; --touch-target: 48px;",
    "shape": "Ultra-soft pillowy radii for all structural containers, mimicking the smooth surface of hard candies and fondants. Heavy reliance on border-radius: var(--radius-candy).",
    "motion": "--transition-taffy: 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); --starting-scale: scale(0.95); --starting-opacity: 0;"
  },
  "classVocabulary": [
    {
      "name": "badge",
      "owner": "css",
      "purpose": "Injected pill-shaped candy-colored metadata tag"
    },
    {
      "name": "src",
      "owner": "css",
      "purpose": "Injected source code link styling"
    },
    {
      "name": "backlink",
      "owner": "css",
      "purpose": "Injected navigation return link"
    },
    {
      "name": "btn",
      "owner": "css",
      "purpose": "Injected primary interactive action pill"
    },
    {
      "name": "md-img",
      "owner": "css",
      "purpose": "Injected markdown content image styling"
    },
    {
      "name": "shell-root",
      "owner": "shell",
      "purpose": "Top-level layout matrix"
    },
    {
      "name": "site-header",
      "owner": "shell",
      "purpose": "Persistent global navigation container"
    },
    {
      "name": "site-nav",
      "owner": "shell",
      "purpose": "Semantic navigation element housing links"
    },
    {
      "name": "site-main",
      "owner": "shell",
      "purpose": "Core viewport content container injecting CONTENT"
    },
    {
      "name": "site-footer",
      "owner": "shell",
      "purpose": "Global footer for baseline links"
    },
    {
      "name": "home-root",
      "owner": "home",
      "purpose": "Landing page wrapper"
    },
    {
      "name": "home-hero",
      "owner": "home",
      "purpose": "Massive display section with candy laboratory background image"
    },
    {
      "name": "home-grid",
      "owner": "home",
      "purpose": "Bento layout for featured confections (projects)"
    },
    {
      "name": "proj-idx-root",
      "owner": "projects_index",
      "purpose": "Index shell for engineering projects"
    },
    {
      "name": "proj-idx-grid",
      "owner": "projects_index",
      "purpose": "Native masonry grid for project items"
    },
    {
      "name": "des-idx-root",
      "owner": "designs_index",
      "purpose": "Visual works wrapper"
    },
    {
      "name": "des-idx-grid",
      "owner": "designs_index",
      "purpose": "Tight bento grid for visual design previews"
    },
    {
      "name": "proj-det-root",
      "owner": "project_detail",
      "purpose": "Wrapper for deep engineering case studies"
    },
    {
      "name": "proj-det-content",
      "owner": "project_detail",
      "purpose": "Formatted markdown and prose wrapper"
    },
    {
      "name": "des-det-root",
      "owner": "design_detail",
      "purpose": "Wrapper for high-fidelity visual assets"
    },
    {
      "name": "des-det-media",
      "owner": "design_detail",
      "purpose": "Container maximizing image display capabilities"
    },
    {
      "name": "page-root",
      "owner": "page",
      "purpose": "Standard wrapper for textual pages"
    },
    {
      "name": "page-content",
      "owner": "page",
      "purpose": "Single-column reading width container"
    },
    {
      "name": "proj-item-root",
      "owner": "project_item",
      "purpose": "Individual bento card for project summary"
    },
    {
      "name": "proj-item-meta",
      "owner": "project_item",
      "purpose": "Metadata ribbon within project card"
    },
    {
      "name": "des-item-root",
      "owner": "design_item",
      "purpose": "Visual card for design gallery"
    },
    {
      "name": "des-item-preview",
      "owner": "design_item",
      "purpose": "Image preview wrapper with sugar-glass hover"
    },
    {
      "name": "nav-item-root",
      "owner": "nav_item",
      "purpose": "List item for navigation menu"
    },
    {
      "name": "nav-item-link",
      "owner": "nav_item",
      "purpose": "Touch-target optimized navigation anchor"
    },
    {
      "name": "frosted-panel",
      "owner": "css",
      "purpose": "Global utility for backdrop-filter sugar-glass"
    },
    {
      "name": "candy-wrapper",
      "owner": "css",
      "purpose": "Global utility for pastel background assignments"
    }
  ],
  "layoutBlueprints": {
    "shell": {
      "rootClass": "shell-root",
      "composition": "A sticky site-header containing the logo and site-nav, followed by the site-main area which strictly orchestrates the {{CONTENT}} placeholder, ending with a minimal site-footer. Background is marshmallow white with subtle SVG sugar grain."
    },
    "home": {
      "rootClass": "home-root",
      "composition": "A home-hero header utilizing the designated laboratory image and Shrikhand typography, followed by a home-grid bento structure that organizes featured projects into pillowy, frosted-panel cards."
    },
    "projects_index": {
      "rootClass": "proj-idx-root",
      "composition": "A linear header outlining the engineering capability, dropping into a proj-idx-grid native bento layout. Each card relies on scroll-timeline for entry reveals."
    },
    "designs_index": {
      "rootClass": "des-idx-root",
      "composition": "A highly dense des-idx-grid displaying visual outputs as tightly packed, colorful candy tiles that expand via @starting-style on interaction."
    },
    "project_detail": {
      "rootClass": "proj-det-root",
      "composition": "A focused proj-det-content single column for dense, austere engineering documentation, framed by pastel accents and licorice-black headers."
    },
    "design_detail": {
      "rootClass": "des-det-root",
      "composition": "An edge-to-edge des-det-media presentation format allowing the generative assets to take full viewport width, overlaid with minimalistic frosted-panel metadata."
    },
    "page": {
      "rootClass": "page-root",
      "composition": "A stripped-back page-content linear flow for About or Contact, using text-wrap: pretty for maximum legibility of the dry, authoritative copy."
    },
    "project_item": {
      "rootClass": "proj-item-root",
      "composition": "A candy-wrapper accented card housing the title and proj-item-meta tags, styled as small mint or bubblegum pills."
    },
    "design_item": {
      "rootClass": "des-item-root",
      "composition": "A square or intrinsic ratio des-item-preview image container, utilizing :has() to dim sibling tiles when hovered."
    },
    "nav_item": {
      "rootClass": "nav-item-root",
      "composition": "A semantic wrapper for the nav-item-link, utilizing 48px padding for precise mobile touch reliability."
    }
  }
}
```

## section:css

```css
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600&family=Shrikhand&display=swap'); :root { --bg-marshmallow: oklch(98% 0.01 90); --text-licorice: oklch(15% 0.02 300); --accent-mint: oklch(85% 0.1 160); --accent-bubblegum: oklch(80% 0.15 350); --accent-lemon: oklch(90% 0.12 100); --sugar-glass: color-mix(in oklch, var(--bg-marshmallow) 70%, transparent); --font-display: 'Shrikhand', serif; --font-body: 'Fredoka', sans-serif; --fw-body: 400; --fw-bold: 600; --gap-xs: 0.5rem; --gap-sm: 1rem; --gap-md: 2rem; --gap-lg: 4rem; --radius-candy: 1.5rem; --radius-pill: 999px; --touch-target: 48px; --transition-taffy: 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); } *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: var(--font-body); font-weight: var(--fw-body); background-color: var(--bg-marshmallow); color: var(--text-licorice); line-height: 1.5; -webkit-font-smoothing: antialiased; position: relative; } body::before { content: ''; position: fixed; inset: 0; background-image: url('data:image/svg+xml;utf8,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noise)" opacity="0.02"/%3E%3C/svg%3E'); pointer-events: none; z-index: 0; } h1, h2, h3, h4, h5, h6 { font-family: var(--font-display); font-weight: 400; text-wrap: balance; line-height: 1.1; margin-bottom: var(--gap-sm); } a { color: inherit; text-decoration: none; transition: opacity var(--transition-taffy); } img, video, svg { max-width: 100%; height: auto; display: block; } .badge { display: inline-flex; align-items: center; justify-content: center; background-color: var(--accent-mint); color: var(--text-licorice); padding: 0.25rem 0.75rem; border-radius: var(--radius-pill); font-size: 0.875rem; font-weight: var(--fw-bold); } .btn { display: inline-flex; align-items: center; justify-content: center; min-height: var(--touch-target); padding: 0 1.5rem; background-color: var(--text-licorice); color: var(--bg-marshmallow); border-radius: var(--radius-pill); font-weight: var(--fw-bold); cursor: pointer; transition: transform var(--transition-taffy); } .btn:active { transform: scale(0.95); } .src, .backlink { display: inline-flex; align-items: center; min-height: var(--touch-target); color: var(--accent-bubblegum); font-weight: var(--fw-bold); padding: 0.5rem 0; } .md-img { border-radius: var(--radius-candy); margin: var(--gap-md) 0; overflow: hidden; } .shell-root { display: flex; flex-direction: column; min-height: 100vh; position: relative; z-index: 1; } .site-header { position: sticky; top: 0; z-index: 100; padding: var(--gap-sm); background: var(--sugar-glass); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 2px solid rgba(0,0,0,0.05); } .site-nav { display: flex; align-items: center; justify-content: space-between; overflow-x: auto; padding-bottom: 0.25rem; gap: var(--gap-sm); } .site-nav img { height: 40px; border-radius: var(--radius-pill); } .nav-item-root { list-style: none; flex-shrink: 0; } .nav-item-link { display: flex; align-items: center; min-height: var(--touch-target); padding: 0 1rem; border-radius: var(--radius-pill); font-weight: var(--fw-bold); background-color: rgba(0,0,0,0.03); } .site-main { flex: 1; display: flex; flex-direction: column; width: 100%; } .site-footer { padding: var(--gap-md); text-align: center; border-top: 2px solid rgba(0,0,0,0.05); margin-top: auto; } .home-root, .proj-idx-root, .des-idx-root, .proj-det-root, .des-det-root, .page-root { display: flex; flex-direction: column; gap: var(--gap-md); width: 100%; } .home-hero { min-height: 60vh; display: flex; flex-direction: column; justify-content: center; padding: var(--gap-lg) var(--gap-md); background-color: #e5e0d8; background-image: url('assets/hero.jpg'); background-size: cover; background-position: center; border-radius: 0 0 var(--radius-candy) var(--radius-candy); position: relative; overflow: hidden; } .home-hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, rgba(255,255,255,0.9), transparent); pointer-events: none; } .home-hero > * { position: relative; z-index: 2; } .home-grid, .proj-idx-grid, .des-idx-grid { display: grid; gap: var(--gap-md); padding: var(--gap-sm); grid-template-columns: minmax(0, 1fr); } .proj-item-root, .des-item-root { display: flex; flex-direction: column; background-color: var(--accent-lemon); border-radius: var(--radius-candy); overflow: hidden; padding: var(--gap-md); position: relative; text-decoration: none; color: var(--text-licorice); } .proj-item-meta { display: flex; flex-wrap: wrap; gap: var(--gap-xs); margin-top: auto; padding-top: var(--gap-sm); } .des-item-preview { position: relative; border-radius: var(--radius-candy); overflow: hidden; margin: calc(var(--gap-md) * -1); margin-bottom: var(--gap-sm); } .des-item-preview img { width: 100%; height: 100%; object-fit: cover; aspect-ratio: 1; } .proj-det-content, .page-content { padding: var(--gap-md); max-width: 800px; margin: 0 auto; width: 100%; } .des-det-media { width: 100%; position: relative; } .des-det-media img { width: 100%; max-height: 80vh; object-fit: cover; border-radius: var(--radius-candy); } .frosted-panel { background: var(--sugar-glass); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.5); border-radius: var(--radius-candy); padding: var(--gap-sm); } .candy-wrapper { background-color: var(--accent-bubblegum); border-radius: var(--radius-candy); padding: var(--gap-md); } @keyframes taffy-pull { 0% { opacity: 0; transform: scaleY(1.1) scaleX(0.95); } 100% { opacity: 1; transform: scale(1); } } @supports (animation-timeline: view()) { .proj-item-root, .des-item-root { animation: taffy-pull linear both; animation-timeline: view(); animation-range: entry 10% cover 25%; transform-origin: top center; } } @media (min-width: 768px) { .site-header { padding: var(--gap-sm) var(--gap-lg); } .site-nav { justify-content: flex-start; } .home-grid, .proj-idx-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); padding: var(--gap-lg); } .des-idx-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); padding: var(--gap-lg); } .proj-item-root, .des-item-root { padding: var(--gap-lg); } .des-item-preview { margin: calc(var(--gap-lg) * -1); margin-bottom: var(--gap-md); } .home-hero { border-radius: var(--radius-candy); margin: var(--gap-sm); min-height: 80vh; } .home-grid:has(.proj-item-root:hover) .proj-item-root:not(:hover), .des-idx-grid:has(.des-item-root:hover) .des-item-root:not(:hover) { opacity: 0.6; filter: saturate(50%); transition: all var(--transition-taffy); } .proj-item-root:hover, .des-item-root:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); transition: all var(--transition-taffy); z-index: 10; } }

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
```

## section:layout:shell

```html
<div class="shell-root candy-wrapper"><header class="site-header frosted-panel"><a href="/"><img class="verified-brand-mark" src="assets/logo.png"></a><nav class="site-nav">{{NAV_LINKS}}</nav></header><main class="site-main">{{CONTENT}}</main><footer class="site-footer">{{THEME_PILLS}}{{SOURCE_PATH}}</footer></div>
```

## section:layout:home

```html
<section class="home-root"><header class="home-hero candy-wrapper"><h1>{{HEADLINE}}</h1><p>{{TAGLINE}}</p><div class="frosted-panel">{{INTRO}}</div><span>{{FEATURED_COUNT}}</span></header><div class="home-grid">{{FEATURED_PROJECTS}}</div></section>
```

## section:layout:projects_index

```html
<section class="proj-idx-root"><div class="candy-wrapper frosted-panel"><span class="badge">{{PROJECT_COUNT}}</span></div><div class="proj-idx-grid">{{PROJECT_LIST}}</div></section>
```

## section:layout:designs_index

```html
<section class="des-idx-root"><div class="badge">{{DESIGN_COUNT}}</div><div class="des-idx-grid">{{DESIGN_CARDS}}</div></section>
```

## section:layout:project_detail

```html
<section class="proj-det-root"><header class="candy-wrapper frosted-panel">{{LOGO}}<h1>{{NAME}}</h1><p>{{DESCRIPTION}}</p><div class="proj-item-meta">{{ROLE}} {{YEAR}} {{TECH_BADGES}}</div><div class="frosted-panel">{{PROJECT_LINK}} {{REPO_LINK}} {{BACKLINK}} {{SOURCE_PATH}}</div></header><div class="proj-det-content">{{CONTENT}}</div></section>
```

## section:layout:design_detail

```html
<article class="des-det-root"><div class="backlink">{{BACKLINK}}</div><figure class="des-det-media candy-wrapper"><img src="{{PREVIEW}}" class="md-img"/><figcaption class="frosted-panel"><h1>{{NAME}}</h1><div>{{DESCRIPTION}}</div><div>{{CLIENT}}</div><div>{{ROLE}}</div><div>{{YEAR}}</div><div>{{TAG_BADGES}}</div><a href="{{LINK_URL}}" class="btn"></a><a href="{{SOURCE_PATH}}" class="src"></a></figcaption></figure><div>{{CONTENT}}</div></article>
```

## section:layout:page

```html
<section class="page-root candy-wrapper"><header class="frosted-panel"><h1>{{NAME}}</h1><div class="src">{{SOURCE_PATH}}</div></header><article class="page-content">{{CONTENT}}</article></section>
```

## section:layout:project_item

```html
<article class="proj-item-root candy-wrapper"><a href="{{URL}}" class="src frosted-panel">{{LOGO}}</a><div class="proj-item-meta"><h3><a href="{{URL}}" class="src">{{NAME}}</a></h3><p>{{DESCRIPTION}}</p><div><span class="badge">{{YEAR}}</span><span class="badge">{{INDEX}}</span></div><div>{{TECH_BADGES}}</div><a href="{{REPO_URL}}" class="backlink"></a></div></article>
```

## section:layout:design_item

```html
<article class="des-item-root candy-wrapper"><a href="{{URL}}" class="des-item-preview"><img src="{{PREVIEW}}" alt="{{NAME}}" /><div class="frosted-panel"><h3>{{NAME}}</h3><p>{{DESCRIPTION}}</p><p>{{CLIENT}}{{YEAR}}</p><div>{{TAG_BADGES}}</div></div></a></article>
```

## section:layout:nav_item

```html
<li class="nav-item-root {{NAV_ACTIVE_CLASS}}"><a href="{{NAV_URL}}" class="nav-item-link">{{NAV_NAME}}</a></li>
```
