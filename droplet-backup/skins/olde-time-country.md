---
type: page
slug: "skin-olde-time-country"
name: "Mercantile Ledger AI"
title: "Mercantile Ledger AI — Generated Skin"
description: "AI-generated skin: \"OLDE TIME COUNTRY\""
timestamp: "2026-07-12T22:02:16.772Z"
sandbox_entry: "designs/olde-time-country/index.html"
x_kind: "theme-skin"
x_year: "2026"
x_preview: "/designs/olde-time-country/assets/hero.jpg"
x_logo: "/designs/olde-time-country/gi-logo-transparent-dark.png"
x_link: "/designs/olde-time-country/index.html"
---

Design Constitution: Mercantile Ledger AI. Typography: Primary display is 'Playfair Display' or a similar high-contrast vintage serif, scaled massively for the hero thesis. Body copy and technical data utilize 'JetBrains Mono' to ground the antique aesthetic in the reality of software engineering. Color Palette: Built strictly on OKLCH. Backgrounds are an aged parchment tone oklch(92% 0.02 90), text is a faded iron-gall ink oklch(25% 0.02 260), and the accent is a muted oxblood oklch(40% 0.1 20). Layout Strategy: The ledger. Every container is bounded by 1px solid borders resembling ruled paper. We use CSS Grid heavily, allowing nested elements to align perfectly across parent tracks using subgrid. Motion: Subdued and physical. Cards fade up and borders 'draw' themselves in via scroll-driven animations, anchored entirely on the compositor thread. There is no bouncy, elastic movement; only the heavy, deliberate placement of archived materials.

## Locked Design Constitution

```json
{
  "name": "Mercantile Ledger AI",
  "accent": "oklch(35% 0.05 45)",
  "signatureGesture": "Ledger Entry Reveal: As the user scrolls, new projects and designs are revealed using a view() timeline that animates their opacity and applies a subtle sepia filter transition, simulating the uncovering of a historical document from an archive.",
  "mobileStrategy": "The multi-column ledger collapses into a continuous vertical scroll, reminiscent of an adding-machine tape. Borders remain prominent to distinguish individual entries, and touch targets are expanded to 44px minimum by padding out the 'cells' of the ledger rather than scaling up text.",
  "imageTreatment": "All imagery is processed with a high-contrast, sepia-toned filter and overlaid with a subtle CSS-generated SVG static grain to emulate 19th-century tintypes or woodcut engravings.",
  "tokens": {
    "colors": "bg: oklch(94% 0.015 85); text: oklch(20% 0.01 250); accent: oklch(35% 0.08 30); border: oklch(50% 0.02 250); surface: oklch(90% 0.02 85)",
    "typography": "display: 'Playfair Display', serif; body: 'JetBrains Mono', monospace; scale: 1.15; weight-display: 700; weight-body: 400",
    "spacing": "base: 1rem; ledger-padding: clamp(1rem, 3vw, 2rem); section-gap: clamp(4rem, 8vw, 8rem); border-width: 1px",
    "shape": "radius-none: 0px; radius-subtle: 2px; ledger-border: 1px solid var(--border)",
    "motion": "easing-heavy: cubic-bezier(0.2, 0, 0, 1); duration-slow: 600ms; transition-opacity: opacity 400ms ease-in-out"
  },
  "classVocabulary": [
    {
      "name": "ledger-shell",
      "owner": "shell",
      "purpose": "Root container establishing the vintage document canvas and SVG grain"
    },
    {
      "name": "ledger-header",
      "owner": "shell",
      "purpose": "Global navigation wrapper styled as a mercantile invoice header"
    },
    {
      "name": "nav-list",
      "owner": "shell",
      "purpose": "Unordered list wrapping navigation items"
    },
    {
      "name": "nav-item",
      "owner": "nav_item",
      "purpose": "Individual navigation link with 44px tap target"
    },
    {
      "name": "home-hero",
      "owner": "home",
      "purpose": "Massive typography and vintage landscape hero section"
    },
    {
      "name": "home-grid",
      "owner": "home",
      "purpose": "Bento grid for featured archival projects"
    },
    {
      "name": "projects-archive",
      "owner": "projects_index",
      "purpose": "Index container for all engineering works"
    },
    {
      "name": "project-row",
      "owner": "project_item",
      "purpose": "Individual project entry in the ledger"
    },
    {
      "name": "project-title",
      "owner": "project_item",
      "purpose": "Serif heading for the project name"
    },
    {
      "name": "project-meta",
      "owner": "project_item",
      "purpose": "Monospace technical details for the project"
    },
    {
      "name": "designs-catalog",
      "owner": "designs_index",
      "purpose": "Masonry grid for visual and architectural works"
    },
    {
      "name": "design-card",
      "owner": "design_item",
      "purpose": "Container for a single design preview"
    },
    {
      "name": "design-preview",
      "owner": "design_item",
      "purpose": "Sepia-toned image thumbnail"
    },
    {
      "name": "detail-canvas",
      "owner": "project_detail",
      "purpose": "Main content wrapper for full project readouts"
    },
    {
      "name": "detail-header",
      "owner": "project_detail",
      "purpose": "Title and metadata lockup for the project detail"
    },
    {
      "name": "detail-body",
      "owner": "project_detail",
      "purpose": "Monospace rich text container for engineering prose"
    },
    {
      "name": "design-detail-canvas",
      "owner": "design_detail",
      "purpose": "Wrapper for high-resolution visual work"
    },
    {
      "name": "design-detail-hero",
      "owner": "design_detail",
      "purpose": "Full bleed container for the primary design artifact"
    },
    {
      "name": "page-canvas",
      "owner": "page",
      "purpose": "Standard text page container for about or contact"
    },
    {
      "name": "badge",
      "owner": "css",
      "purpose": "Small technical indicator tag"
    },
    {
      "name": "src",
      "owner": "css",
      "purpose": "Source code link or reference"
    },
    {
      "name": "backlink",
      "owner": "css",
      "purpose": "Navigation link returning to previous ledger index"
    },
    {
      "name": "btn",
      "owner": "css",
      "purpose": "Primary interaction target styled as a vintage stamp or seal"
    },
    {
      "name": "md-img",
      "owner": "css",
      "purpose": "Injected markdown image with sepia styling"
    }
  ],
  "layoutBlueprints": {
    "shell": {
      "rootClass": "ledger-shell",
      "composition": "A full-viewport flex column with a fixed top border. The ledger-header sits at the top, containing a wordmark and the nav-list. Main content area fills the remaining space. An SVG grain filter is applied to the pseudo-element of the ledger-shell to texture the entire application."
    },
    "home": {
      "rootClass": "home-hero",
      "composition": "A striking two-part layout. The top half features massive, tightly kerned serif typography overlaying a faded 19th-century landscape image. The bottom half transitions into the home-grid, a 3-column subgrid displaying featured project-row items."
    },
    "projects_index": {
      "rootClass": "projects-archive",
      "composition": "A strict vertical stack. Each child is a project-row with heavy top and bottom borders, acting like an itemized list in an old general store catalog. Metadata aligns to right-hand columns on desktop."
    },
    "designs_index": {
      "rootClass": "designs-catalog",
      "composition": "A native CSS masonry layout of design-card items. Each card has a thick ruled border and contains a design-preview image, scaled and filtered to look like a vintage archive."
    },
    "project_detail": {
      "rootClass": "detail-canvas",
      "composition": "A single-column reading experience centered on the page. The detail-header displays the title in massive serif font, followed by a metadata block. The detail-body contains the project description with strict monospace formatting and sepia-toned md-img elements."
    },
    "design_detail": {
      "rootClass": "design-detail-canvas",
      "composition": "A wide, immersive layout. The design-detail-hero takes up the majority of the viewport, styled with heavy frame borders, followed by a smaller text description area below."
    },
    "page": {
      "rootClass": "page-canvas",
      "composition": "A centered, narrow reading column for text-heavy pages, utilizing the body monospace typography for a raw, typed-document feel."
    },
    "project_item": {
      "rootClass": "project-row",
      "composition": "A horizontal flex container (or grid on desktop) containing the project-title and project-meta. It has 44px minimum height and uses :has() to darken the background subtly when hovered or focused."
    },
    "design_item": {
      "rootClass": "design-card",
      "composition": "A vertical card holding the design-preview image and a small caption area. Uses native starting-style for smooth scale-in animations when entering the viewport."
    },
    "nav_item": {
      "rootClass": "nav-item",
      "composition": "A simple anchor link with generous padding to ensure a 44px tap target, styled with uppercase monospace text and a subtle underline on hover."
    }
  }
}
```
