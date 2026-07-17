---
type: page
slug: "skin-candyland"
name: "Confectionary Lab System"
title: "Confectionary Lab System — Generated Skin"
description: "AI-generated skin: \"candyland\""
timestamp: "2026-07-17T01:54:08.181Z"
sandbox_entry: "designs/candyland/index.html"
x_kind: "theme-skin"
x_year: "2026"
x_preview: "/designs/candyland/assets/hero.jpg"
x_logo: "/designs/candyland/gi-logo-transparent-dark.png"
x_link: "/designs/candyland/index.html"
---

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
