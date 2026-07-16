---
type: page
slug: "skin-surfs-up"
name: "Fiberglass & Resin"
title: "Fiberglass & Resin — Generated Skin"
description: "AI-generated skin: \"SURFS UP\""
timestamp: "2026-07-15T22:59:17.176Z"
sandbox_entry: "designs/surfs-up/index.html"
x_kind: "theme-skin"
x_year: "2026"
x_preview: "/designs/surfs-up/assets/hero.jpg"
x_logo: "/designs/surfs-up/gi-logo-transparent-dark.png"
x_link: "/designs/surfs-up/index.html"
---

A high-end, highly polished technical architecture bridging hydrodynamic surfboard manufacturing and file-native AI engineering. The aesthetic relies on deep ocean hues, glossy translucent 'resin' card treatments, and sharp, athletic typography. The layout is strictly mobile-first, utilizing native bento grids and masonry structures with high-visibility accents to highlight critical data and interaction points. Copy is austere, precise, and authoritative, avoiding all marketing buzzwords.

## Locked Design Constitution

```json
{
  "name": "Fiberglass & Resin",
  "accent": "Safety Orange",
  "signatureGesture": "Fluid, scroll-driven staggered cascades where project cards and design items rise into the viewport like swelling waves, controlled entirely by native CSS animation-timeline tied to the scroll position, ensuring zero JavaScript main-thread blocking.",
  "mobileStrategy": "A rigorous mobile-first architecture where the global navigation remains visible but wraps cleanly into a compact horizontal scroll or stacked layout at narrow widths. All interactive areas enforce a strict 44px minimum touch target. Complex bento grids collapse to a single-column linear flow on mobile, expanding dynamically via min-width media queries.",
  "imageTreatment": "Photography and generative assets will feature stark, high-contrast ocean environments, technical surfboard components, and deep blue tonal overlays. Images will be framed within sharp, precision-cut containers with 1px translucent borders mimicking fiberglass layups.",
  "tokens": {
    "colors": "--bg: oklch(20% 0.05 250); --text: oklch(95% 0.02 220); --accent: oklch(65% 0.2 45); --surface: oklch(25% 0.04 250); --resin: oklch(30% 0.06 250 / 0.5);",
    "typography": "--font-display: 'Teko', sans-serif; --font-body: 'Kumbh Sans', sans-serif;",
    "spacing": "--gap-sm: clamp(12px, 2vw, 16px); --gap-md: clamp(24px, 4vw, 32px); --gap-lg: clamp(48px, 8vw, 80px);",
    "shape": "--radius-base: 0px; --border-resin: 1px solid oklch(95% 0.02 220 / 0.1);",
    "motion": "--transition-fluid: all 0.4s cubic-bezier(0.25, 1, 0.5, 1); --timeline-wave: view() entry 10% cover 30%;"
  },
  "classVocabulary": [
    {
      "name": "site-shell",
      "owner": "shell",
      "purpose": "Root container managing global page structure and background."
    },
    {
      "name": "global-nav",
      "owner": "shell",
      "purpose": "Primary navigation bar, explicitly visible and mobile-responsive."
    },
    {
      "name": "nav-element",
      "owner": "nav_item",
      "purpose": "Individual interactive navigation link with 44px touch target."
    },
    {
      "name": "home-layout",
      "owner": "home",
      "purpose": "Main container for the homepage layout and structural flow."
    },
    {
      "name": "hero-section",
      "owner": "home",
      "purpose": "Primary landing region, holds the required background-image hero asset."
    },
    {
      "name": "featured-grid",
      "owner": "home",
      "purpose": "Bento-style layout grid for highlighting key projects."
    },
    {
      "name": "projects-layout",
      "owner": "projects_index",
      "purpose": "Root container for the projects index view."
    },
    {
      "name": "projects-ledger",
      "owner": "projects_index",
      "purpose": "Linear tabular layout for listing detailed project items."
    },
    {
      "name": "project-item-card",
      "owner": "project_item",
      "purpose": "Individual project container within index or featured lists."
    },
    {
      "name": "project-item-meta",
      "owner": "project_item",
      "purpose": "Container for technical tags, dates, and metadata."
    },
    {
      "name": "designs-layout",
      "owner": "designs_index",
      "purpose": "Root container for the visual designs index view."
    },
    {
      "name": "masonry-layout",
      "owner": "designs_index",
      "purpose": "Native CSS masonry container for visual work previews."
    },
    {
      "name": "design-item-card",
      "owner": "design_item",
      "purpose": "Container for a single design preview image and its metadata."
    },
    {
      "name": "design-item-media",
      "owner": "design_item",
      "purpose": "Image wrapper inside the design card."
    },
    {
      "name": "project-detail-layout",
      "owner": "project_detail",
      "purpose": "Root container for the individual project deep-dive page."
    },
    {
      "name": "project-detail-hero",
      "owner": "project_detail",
      "purpose": "Top-level header and thesis statement for a project."
    },
    {
      "name": "project-detail-body",
      "owner": "project_detail",
      "purpose": "Main content and markdown container for project specifics."
    },
    {
      "name": "design-detail-layout",
      "owner": "design_detail",
      "purpose": "Root container for the individual design detail page."
    },
    {
      "name": "design-detail-media",
      "owner": "design_detail",
      "purpose": "Full-bleed presentation container for the design artwork."
    },
    {
      "name": "page-layout",
      "owner": "page",
      "purpose": "Root container for generic markdown pages like about or contact."
    },
    {
      "name": "badge",
      "owner": "css",
      "purpose": "Injected runtime class for small metadata tags."
    },
    {
      "name": "src",
      "owner": "css",
      "purpose": "Injected runtime class for code blocks or source references."
    },
    {
      "name": "backlink",
      "owner": "css",
      "purpose": "Injected runtime class for navigational return links."
    },
    {
      "name": "btn",
      "owner": "css",
      "purpose": "Injected runtime class for interactive action buttons."
    },
    {
      "name": "md-img",
      "owner": "css",
      "purpose": "Injected runtime class for markdown-generated imagery."
    }
  ],
  "layoutBlueprints": {
    "shell": {
      "rootClass": "site-shell",
      "composition": "A high-level grid spanning 100vh with a top-mounted global-nav. The nav enforces horizontal visibility without hidden menus. Main content is injected into a lower fluid track. The background utilizes the deep OKLCH blue."
    },
    "home": {
      "rootClass": "home-layout",
      "composition": "Starts with the hero-section occupying significant viewport height, applying the mandatory background-image to showcase crashing waves. Followed by the featured-grid using native bento box subgrids to display top-tier AI systems."
    },
    "projects_index": {
      "rootClass": "projects-layout",
      "composition": "A single-column vertical flow dominating the page width. Houses the projects-ledger which enforces strict typographic alignment and spacing between project cards for high-density reading."
    },
    "designs_index": {
      "rootClass": "designs-layout",
      "composition": "Utilizes the masonry-layout class invoking native display: grid-lanes to tightly pack design-item-cards. Images govern the row height while columns remain strictly proportional."
    },
    "project_detail": {
      "rootClass": "project-detail-layout",
      "composition": "A two-part vertical stack. The project-detail-hero provides a massive typographic entry point setting the technical context. The project-detail-body is a narrow, centered reading column optimized for technical markdown comprehension."
    },
    "design_detail": {
      "rootClass": "design-detail-layout",
      "composition": "Focuses entirely on visual impact. The design-detail-media pushes the artwork to maximum viewport boundaries, with metadata strictly contained below to prevent collision with the imagery."
    },
    "page": {
      "rootClass": "page-layout",
      "composition": "A minimal, single-column reading environment. Enforces strict max-width constraints on body text to prevent horizontal reading fatigue on massive displays."
    },
    "project_item": {
      "rootClass": "project-item-card",
      "composition": "A dense horizontal row on desktop that stacks vertically on mobile. Features high-contrast titles with the project-item-meta tags floating securely to one side without overlapping text."
    },
    "design_item": {
      "rootClass": "design-item-card",
      "composition": "A seamless container bounding the design-item-media. It uses :has() to dim sibling cards on hover, bringing immediate focus to the targeted visual asset."
    },
    "nav_item": {
      "rootClass": "nav-element",
      "composition": "A highly tactile hit area enforcing a 44px minimum square. Implements subtle kinetic typography weight shifts via font-variation-settings on interaction."
    }
  }
}
```
