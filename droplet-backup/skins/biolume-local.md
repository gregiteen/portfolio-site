---
type: page
slug: "skin-biolume-local"
name: "Biolume Local"
title: "Biolume Local — Generated Skin"
description: "AI-generated skin: \"Biolume Local\""
timestamp: "2026-07-17T05:26:34.862Z"
sandbox_entry: "designs/biolume-local/index.html"
x_kind: "theme-skin"
x_year: "2026"
x_preview: "/designs/biolume-local/assets/hero.jpg"
x_logo: "/designs/biolume-local/gi-logo-transparent-dark.png"
x_link: "/designs/biolume-local/index.html"
---

---
name: biolume-local
description: An abyssal, editorial approach to local AI systems, blending strict technical grids with organic bioluminescent aesthetics.
tokens:
  color:
    bg-abyss: 'oklch(15% 0.02 240)'
    bg-surface: 'oklch(22% 0.03 240)'
    text-bone: 'oklch(90% 0.01 240)'
    text-muted: 'oklch(70% 0.02 240)'
    glow-flora: 'oklch(85% 0.15 160)'
  typography:
    display: '"Cormorant Upright", serif'
    body: '"Sora", sans-serif'
  spacing:
    gap-tight: '0.5rem'
    gap-bento: '1.5rem'
    section-pad: 'clamp(4rem, 10vw, 8rem)'
  shape:
    rad-soft: '12px'
    rad-pill: '100px'
---

# Design Intent
This design represents local AI models as localized biological ecosystems operating in the deep. We strictly avoid brutalism or cyberpunk tropes, opting instead for a highly polished, editorial presentation. Grid systems are mathematically precise, utilizing native masonry and subgrid features to maintain extreme information density. Visual interest is generated through high-contrast OKLCH glowing accents against deep, desaturated oceanic darks. Typography provides a deliberate contrast: a highly organic, sweeping serif for thesis statements, grounded by a geometric sans-serif for technical data.

## Locked Design Constitution

```json
{
  "name": "Biolume Local",
  "accent": "Abyssal Glow",
  "signatureGesture": "Project cards and list items emerge from the dark with a slow, scroll-driven fade-up (`animation-timeline: view(); animation-range: entry 5% cover 25%;`), mimicking deep-sea organisms entering the light of a submersible. Hovering over a bento grid card utilizes `:has()` on the parent to slightly dim sibling cards, while the hovered card's border illuminates with a soft, glowing OKLCH bioluminescent green hue, achieved without JavaScript.",
  "mobileStrategy": "Strict mobile-first bento grids. The core layout collapses to a single column, utilizing fluid typography to maintain readability. Touch targets are strictly enforced to 48px minimums via padding, maintaining the visual density without compromising usability. Navigation remains visible and wraps cleanly, expanding into a horizontal alignment at the 768px min-width breakpoint.",
  "imageTreatment": "Imagery must be high-contrast and deeply shadowed. Bioluminescent subjects (glowing hydrozoa, deep-sea flora) act as visual metaphors for local AI nodes. Backgrounds in images should melt seamlessly into the `--bg-abyss` base color to prevent hard visual borders.",
  "tokens": {
    "colors": "--bg-abyss: oklch(15% 0.02 240); --bg-surface: oklch(22% 0.03 240); --text-bone: oklch(90% 0.01 240); --text-muted: oklch(70% 0.02 240); --glow-flora: oklch(85% 0.15 160); --surface-border: oklch(35% 0.04 240);",
    "typography": "--font-display: 'Cormorant Upright', serif; --font-body: 'Sora', sans-serif; --weight-regular: 400; --weight-bold: 600;",
    "spacing": "--gap-tight: 0.5rem; --gap-bento: 1.5rem; --section-pad: clamp(4rem, 10vw, 8rem); --nav-height: 80px;",
    "shape": "--rad-soft: 12px; --rad-pill: 100px;",
    "motion": "--spring-slow: 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); --fade-up: fade-up linear both;"
  },
  "classVocabulary": [
    {
      "name": "app-shell",
      "owner": "shell",
      "purpose": "Root layout container managing global grid and background"
    },
    {
      "name": "nav-header",
      "owner": "shell",
      "purpose": "Global navigation wrapper"
    },
    {
      "name": "logo-img",
      "owner": "shell",
      "purpose": "Brand logo image container"
    },
    {
      "name": "nav-links-container",
      "owner": "shell",
      "purpose": "Flex container for primary navigation links"
    },
    {
      "name": "nav-item",
      "owner": "nav_item",
      "purpose": "Individual navigation link styling"
    },
    {
      "name": "page-layout",
      "owner": "page",
      "purpose": "Standard page wrapper for prose content"
    },
    {
      "name": "hero-section",
      "owner": "home",
      "purpose": "Home hero block with background imagery"
    },
    {
      "name": "hero-headline",
      "owner": "home",
      "purpose": "Display typography for the hero thesis"
    },
    {
      "name": "bento-grid",
      "owner": "projects_index",
      "purpose": "Native masonry grid for collection lists"
    },
    {
      "name": "design-grid",
      "owner": "designs_index",
      "purpose": "Grid container for visual assets"
    },
    {
      "name": "card-item",
      "owner": "project_item",
      "purpose": "Bento grid item shell with hover state orchestration"
    },
    {
      "name": "card-title",
      "owner": "project_item",
      "purpose": "Project card heading"
    },
    {
      "name": "card-media",
      "owner": "project_item",
      "purpose": "Image wrapper for project previews"
    },
    {
      "name": "card-meta",
      "owner": "project_item",
      "purpose": "Metadata text container inside cards"
    },
    {
      "name": "design-card",
      "owner": "design_item",
      "purpose": "Container for design grid items"
    },
    {
      "name": "content-container",
      "owner": "project_detail",
      "purpose": "Max-width container for detail pages"
    },
    {
      "name": "design-content",
      "owner": "design_detail",
      "purpose": "Container for design detail views"
    },
    {
      "name": "prose-body",
      "owner": "project_detail",
      "purpose": "Typography rules for article content"
    },
    {
      "name": "badge",
      "owner": "css",
      "purpose": "Injected runtime class for taxonomy tags"
    },
    {
      "name": "src",
      "owner": "css",
      "purpose": "Injected runtime class for source links"
    },
    {
      "name": "backlink",
      "owner": "css",
      "purpose": "Injected runtime class for navigation return links"
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
      "name": "overlay-noise",
      "owner": "css",
      "purpose": "Decorative texture layer, pointer-events: none"
    }
  ],
  "layoutBlueprints": {
    "shell": {
      "rootClass": "app-shell",
      "composition": "<div class=\"app-shell\"><div class=\"overlay-noise\"></div><header class=\"nav-header\"><a href=\"/\"><img src=\"assets/logo.png\" class=\"logo-img\" alt=\"Biolume Local\"></a><nav class=\"nav-links-container\">{{NAV_LINKS}}</nav></header><main>{{CONTENT}}</main></div>"
    },
    "home": {
      "rootClass": "hero-section",
      "composition": "<section class=\"hero-section\"><div class=\"content-container\"><h1 class=\"hero-headline\">Local AI ecosystems. Designed for the deep.</h1><p class=\"prose-body\">High-end technical architecture with bioluminescent specificity.</p></div></section><section class=\"content-container\"><div class=\"bento-grid\">{{FEATURED_PROJECTS}}</div></section>"
    },
    "projects_index": {
      "rootClass": "bento-grid",
      "composition": "<div class=\"content-container\"><h1 class=\"hero-headline\">Systems</h1><div class=\"bento-grid\">{{PROJECTS}}</div></div>"
    },
    "designs_index": {
      "rootClass": "design-grid",
      "composition": "<div class=\"content-container\"><h1 class=\"hero-headline\">Visual Output</h1><div class=\"design-grid\">{{DESIGNS}}</div></div>"
    },
    "project_detail": {
      "rootClass": "content-container",
      "composition": "<article class=\"content-container\"><header><h1 class=\"hero-headline\">{{TITLE}}</h1><div class=\"card-meta\">{{DATE}}</div></header><div class=\"prose-body\">{{CONTENT}}</div>{{PROJECT_LINK}}{{REPO_LINK}}</article>"
    },
    "design_detail": {
      "rootClass": "design-content",
      "composition": "<article class=\"design-content\"><header><h1 class=\"hero-headline\">{{TITLE}}</h1></header><figure class=\"card-media\">{{PREVIEW}}</figure><div class=\"prose-body\">{{CONTENT}}</div></article>"
    },
    "page": {
      "rootClass": "page-layout",
      "composition": "<div class=\"page-layout content-container\"><h1 class=\"hero-headline\">{{TITLE}}</h1><div class=\"prose-body\">{{CONTENT}}</div></div>"
    },
    "project_item": {
      "rootClass": "card-item",
      "composition": "<a href=\"{{URL}}\" class=\"card-item\"><div class=\"card-media\">{{PREVIEW}}</div><h2 class=\"card-title\">{{TITLE}}</h2><p class=\"card-meta\">{{DESCRIPTION}}</p></a>"
    },
    "design_item": {
      "rootClass": "design-card",
      "composition": "<a href=\"{{URL}}\" class=\"design-card\"><div class=\"card-media\">{{PREVIEW}}</div><h2 class=\"card-title\">{{TITLE}}</h2></a>"
    },
    "nav_item": {
      "rootClass": "nav-item",
      "composition": "<a href=\"{{URL}}\" class=\"nav-item\">{{LABEL}}</a>"
    }
  }
}
```
