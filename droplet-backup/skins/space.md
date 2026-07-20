---
type: page
slug: "skin-space"
name: "SELENE-1"
title: "SELENE-1 — Generated Skin"
description: "AI-generated skin: \"SPACE\""
timestamp: "2026-07-20T03:16:05.355Z"
sandbox_entry: "designs/space/index.html"
x_kind: "theme-skin"
x_year: "2026"
x_preview: "/designs/space/assets/hero.jpg"
x_logo: "/designs/space/gi-logo-transparent-dark.png"
x_link: "/designs/space/index.html"
---

```yaml
tokens:
  color:
    bg_base: '#0A0A0A'
    bg_elevated: '#141414'
    text_primary: '#E8E8E4'
    text_muted: '#8C8C81'
    accent_primary: '#DC2626'  # Apollo telemetry red, high-contrast alert
    accent_secondary: '#F5A623' # Flight plan yellow, precision UI states
    border_subtle: '#2E2E2A'
  typography:
    display: '"Space Grotesk", sans-serif'  # Exists on fonts.google.com, sharp geometric aerospace precision
    body: '"Inter", sans-serif' # Exists on fonts.google.com, technical readability
    # Strictly avoiding Fraunces, Archivo, IBM Plex Mono
  spacing:
    section_y: 'clamp(80px, 12vw, 160px)'
    grid_gap: 'clamp(16px, 2vw, 32px)'
    content_max: '1400px'
  motion:
    reveal_range: 'entry 5% cover 25%'
```

## Locked Design Constitution

```json
{
  "name": "SELENE-1",
  "accent": "#F5A623",
  "signatureGesture": "On the home hero, the display title 'Greg Iteen' uses `font-variation-settings: 'wght' 900` and scales down slightly via `transform: scale(0.98)` on viewport scroll-triggered exit, creating the optical illusion of being physically pulled deeper into the lunar horizon. The entire page is draped in a physical silver-gelatin grain overlay built with `<feTurbulence>`.",
  "mobileStrategy": "Mobile-first architecture. Base CSS defines a fluid single-column layout. The persistent global chrome (nav-cluster) wraps gracefully into a clean textual stack at narrow widths; no hidden menus or hamburger icons. Content grids collapse to linear sequences with generous 44px+ tap targets. All expansions occur via min-width: 768px and min-width: 1024px for bento and multi-column layout states.",
  "imageTreatment": "Ultra-high contrast greyscale photographic treatment with heavy film grain (SVG feTurbulence), mimicking silver gelatin prints. Sharp, directional hard light casting deep absolute-black shadows. The hero portrait is maintained but re-lit with a single harsh space-side key light, wearing a classic NASA-era military-style jumpsuit with subtle mission patches.",
  "tokens": {
    "colors": "OKLCH-defined absolute monochromatic spectrum. Base: oklch(15% 0 0). Elevated: oklch(22% 0 0). Text: oklch(95% 0 0). Accent (Red): oklch(65% 0.22 25). Accent (Yellow): oklch(85% 0.12 85).",
    "motion": "All reveals use `animation-timeline: view(); animation-range: entry 5% cover 30%;`. Transitions for interactive elements are strictly `opacity` and `filter` animation at 200ms duration.",
    "shape": "Sharp corners (0px), 1px hairline OKLCH borders, rationalist orthogonal divisions mirroring lunar module telemetry panels.",
    "spacing": "Fluid gaps based on 8px unit grid. `gap: clamp(16px, 2vw, 32px)`.",
    "typography": "Display: 'Space Grotesk', weight 300-700. Body: 'Inter', weight 400-500. Strictly no serif text; the geometric sans-serif supports the astronautical instrumentation theme."
  },
  "classVocabulary": [
    {
      "name": "shell",
      "owner": "shell",
      "purpose": "global site wrapper"
    },
    {
      "name": "primary-navigation",
      "owner": "shell",
      "purpose": "persistent visible top nav"
    },
    {
      "name": "nav-cluster",
      "owner": "shell",
      "purpose": "left-side logo + right-side links grouping"
    },
    {
      "name": "nav-links",
      "owner": "shell",
      "purpose": "list of navigation anchors"
    },
    {
      "name": "nav-item",
      "owner": "shell",
      "purpose": "single navigation entry"
    },
    {
      "name": "nav-link",
      "owner": "shell",
      "purpose": "anchor element for navigation"
    },
    {
      "name": "nav-toggle",
      "owner": "shell",
      "purpose": "mobile menu toggle button (visible only on mobile)"
    },
    {
      "name": "main-content",
      "owner": "shell",
      "purpose": "primary content region"
    },
    {
      "name": "content-container",
      "owner": "shell",
      "purpose": "centered max-width flow container"
    },
    {
      "name": "footer",
      "owner": "shell",
      "purpose": "global footer"
    },
    {
      "name": "home-hero",
      "owner": "home",
      "purpose": "hero section of home page"
    },
    {
      "name": "hero-grid",
      "owner": "home",
      "purpose": "two-column hero layout"
    },
    {
      "name": "hero-title",
      "owner": "home",
      "purpose": "large display heading"
    },
    {
      "name": "hero-tagline",
      "owner": "home",
      "purpose": "supporting subtitle / description"
    },
    {
      "name": "hero-cta",
      "owner": "home",
      "purpose": "call to action link"
    },
    {
      "name": "bento-grid",
      "owner": "home",
      "purpose": "featured projects masonry bento container"
    },
    {
      "name": "bento-item",
      "owner": "home",
      "purpose": "single bento card"
    },
    {
      "name": "projects-index",
      "owner": "projects_index",
      "purpose": "projects listing page wrapper"
    },
    {
      "name": "project-grid",
      "owner": "projects_index",
      "purpose": "grid of project items"
    },
    {
      "name": "project-item",
      "owner": "project_item",
      "purpose": "single project preview card"
    },
    {
      "name": "project-detail",
      "owner": "project_detail",
      "purpose": "project detail page layout"
    },
    {
      "name": "designs-index",
      "owner": "designs_index",
      "purpose": "designs listing page wrapper"
    },
    {
      "name": "design-grid",
      "owner": "designs_index",
      "purpose": "grid of design previews"
    },
    {
      "name": "design-item",
      "owner": "design_item",
      "purpose": "single design preview card"
    },
    {
      "name": "design-detail",
      "owner": "design_detail",
      "purpose": "design detail page layout"
    },
    {
      "name": "about-page",
      "owner": "page",
      "purpose": "about page layout structure"
    },
    {
      "name": "contact-page",
      "owner": "page",
      "purpose": "contact page layout structure"
    },
    {
      "name": "card-media",
      "owner": "css",
      "purpose": "image container for cards"
    },
    {
      "name": "card-body",
      "owner": "css",
      "purpose": "text content container for cards"
    },
    {
      "name": "card-title",
      "owner": "css",
      "purpose": "card heading"
    },
    {
      "name": "card-subtitle",
      "owner": "css",
      "purpose": "card supporting text"
    },
    {
      "name": "typography-portrait",
      "owner": "css",
      "purpose": "about page portrait container"
    },
    {
      "name": "grain-overlay",
      "owner": "css",
      "purpose": "fixed dimension non-interactive texture overlay"
    },
    {
      "name": "badge",
      "owner": "css",
      "purpose": "injected runtime badge styling"
    },
    {
      "name": "src",
      "owner": "css",
      "purpose": "injected code block styling"
    },
    {
      "name": "backlink",
      "owner": "css",
      "purpose": "injected back link styling"
    },
    {
      "name": "btn",
      "owner": "css",
      "purpose": "injected button styling"
    },
    {
      "name": "md-img",
      "owner": "css",
      "purpose": "injected markdown image styling"
    },
    {
      "name": "sr-only",
      "owner": "css",
      "purpose": "screen reader only accessible element"
    }
  ],
  "layoutBlueprints": {
    "design_detail": {
      "composition": "stack",
      "rootClass": "design-detail"
    },
    "design_item": {
      "composition": "stack",
      "rootClass": "design-item"
    },
    "designs_index": {
      "composition": "stack",
      "rootClass": "designs-index"
    },
    "home": {
      "composition": "stack",
      "rootClass": "home-hero",
      "regions": [
        {
          "role": "hero",
          "method": "split"
        },
        {
          "role": "index",
          "method": "bento",
          "class": "bento-grid"
        }
      ]
    },
    "nav_item": {
      "composition": "list-item",
      "rootClass": "nav-item"
    },
    "page": {
      "composition": "stack",
      "rootClass": "content-container"
    },
    "project_detail": {
      "composition": "stack",
      "rootClass": "project-detail"
    },
    "project_item": {
      "composition": "stack",
      "rootClass": "project-item"
    },
    "projects_index": {
      "composition": "stack",
      "rootClass": "projects-index"
    },
    "shell": {
      "composition": "stack",
      "rootClass": "shell"
    }
  }
}
```
