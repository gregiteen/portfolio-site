---
type: page
slug: "skin-arabia"
name: "Dune & Code"
title: "Dune & Code — Generated Skin"
description: "AI-generated skin: \"ARABIA\""
timestamp: "2026-07-12T11:49:03.069Z"
sandbox_entry: "designs/arabia/index.html"
x_kind: "theme-skin"
x_year: "2026"
x_preview: "/designs/arabia/assets/hero.jpg"
x_logo: "/designs/arabia/gi-logo-transparent-dark.png"
x_link: "/designs/arabia/index.html"
---

A dark, premium visual system evoking the Arabian desert under a starry night. The architecture uses strict, high-density Bento Grids (native CSS Grid and subgrid) for portfolio items, contrasted against expansive, sweeping hero sections. Typography relies on a sophisticated hierarchy to guide the reader through dense technical case studies. Emojis and buzzwords are strictly forbidden; copy is austere and precise.

## Locked Design Constitution

```json
{
  "name": "Dune & Code",
  "accent": "Lapis & Brass",
  "signatureGesture": "A scroll-driven 'shifting sands' reveal. As the user scrolls, portfolio items and case study sections emerge from the deep background color, utilizing `animation-timeline: view()` and `@starting-style` for GPU-accelerated, staggered fade-ups.",
  "mobileStrategy": "Strictly mobile-first. The shell navigation is a compact, wrap-friendly horizontal list on mobile, avoiding hidden hamburger menus. Bento grids degrade gracefully to single-column vertical flows. Touch targets are rigorously padded to a minimum of 44x44px.",
  "imageTreatment": "Images feature deep contrast, heavy shadows, and subtle gold/brass color grading. The hero image will evoke a vast desert landscape fused with subtle technical motifs. Portraits will place the subject in a cinematic, low-key lighting environment with a hint of warm sand tones.",
  "tokens": {
    "colors": "--bg-base: oklch(20% 0.05 260); --bg-surface: oklch(25% 0.06 260); --text-main: oklch(90% 0.02 80); --text-muted: oklch(70% 0.03 260); --accent-brass: oklch(75% 0.15 80);",
    "typography": "--font-display: 'Cinzel Decorative', 'Optima', sans-serif; --font-body: 'JetBrains Mono', monospace; --text-scale-hero: clamp(2.5rem, 6vw, 5rem); --text-scale-h2: clamp(1.5rem, 4vw, 3rem);",
    "spacing": "--space-xs: 0.5rem; --space-sm: 1rem; --space-md: 2rem; --space-lg: 4rem; --space-xl: 8rem; --radius-bento: 2px;",
    "shape": "Strict rectangular bento grids with 2px corner radii, offset by occasional full-width sweeping curved dividers utilizing SVG masks.",
    "motion": "--easing-sand: cubic-bezier(0.25, 1, 0.5, 1); --duration-reveal: 0.8s;"
  },
  "classVocabulary": [
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
      "purpose": "Injected runtime class for return navigation"
    },
    {
      "name": "btn",
      "owner": "css",
      "purpose": "Injected runtime class for buttons"
    },
    {
      "name": "md-img",
      "owner": "css",
      "purpose": "Injected runtime class for markdown images"
    },
    {
      "name": "layout-shell",
      "owner": "shell",
      "purpose": "Root layout container"
    },
    {
      "name": "global-nav",
      "owner": "shell",
      "purpose": "Main navigation wrapper"
    },
    {
      "name": "nav-list",
      "owner": "shell",
      "purpose": "Navigation item list"
    },
    {
      "name": "view-home",
      "owner": "home",
      "purpose": "Home page root"
    },
    {
      "name": "hero-vista",
      "owner": "home",
      "purpose": "Full bleed hero image container"
    },
    {
      "name": "featured-grid",
      "owner": "home",
      "purpose": "Bento grid for featured work"
    },
    {
      "name": "view-projects",
      "owner": "projects_index",
      "purpose": "Projects index root"
    },
    {
      "name": "masonry-grid",
      "owner": "projects_index",
      "purpose": "Native masonry container"
    },
    {
      "name": "view-designs",
      "owner": "designs_index",
      "purpose": "Designs index root"
    },
    {
      "name": "design-gallery",
      "owner": "designs_index",
      "purpose": "Gallery container"
    },
    {
      "name": "view-project-detail",
      "owner": "project_detail",
      "purpose": "Project detail root"
    },
    {
      "name": "article-body",
      "owner": "project_detail",
      "purpose": "Main content column"
    },
    {
      "name": "view-design-detail",
      "owner": "design_detail",
      "purpose": "Design detail root"
    },
    {
      "name": "media-showcase",
      "owner": "design_detail",
      "purpose": "Media container"
    },
    {
      "name": "view-page",
      "owner": "page",
      "purpose": "Generic page root"
    },
    {
      "name": "content-flow",
      "owner": "page",
      "purpose": "Text content flow container"
    },
    {
      "name": "project-card",
      "owner": "project_item",
      "purpose": "Individual project list item"
    },
    {
      "name": "design-card",
      "owner": "design_item",
      "purpose": "Individual design list item"
    },
    {
      "name": "nav-link",
      "owner": "nav_item",
      "purpose": "Individual navigation link"
    }
  ],
  "layoutBlueprints": {
    "shell": {
      "rootClass": "layout-shell",
      "composition": "A persistent, dark lapis blue header containing a 'global-nav' that wraps 'nav-list' cleanly on mobile and flexes horizontally on desktop. Main content is injected below in a standard document flow."
    },
    "home": {
      "rootClass": "view-home",
      "composition": "Opens with 'hero-vista', a vast, full-bleed section featuring a dark desert landscape background and bold display typography. Followed by 'featured-grid', a tight bento grid of highlight projects."
    },
    "projects_index": {
      "rootClass": "view-projects",
      "composition": "A clean, technical list view using 'masonry-grid' to display projects dynamically. Emphasizes typography and tags over heavy imagery."
    },
    "designs_index": {
      "rootClass": "view-designs",
      "composition": "A highly visual 'design-gallery' utilizing dense bento grid arrangements. Images take priority, with minimal overlaid text on hover."
    },
    "project_detail": {
      "rootClass": "view-project-detail",
      "composition": "An editorial layout featuring a prominent title header, followed by a constrained, single-column 'article-body' for optimal readability of technical case studies."
    },
    "design_detail": {
      "rootClass": "view-design-detail",
      "composition": "Focuses on large, high-resolution imagery within a 'media-showcase', with technical metadata and brief context tucked to the side or below on mobile."
    },
    "page": {
      "rootClass": "view-page",
      "composition": "A simple, elegant 'content-flow' layout for About and Contact pages, utilizing strict max-widths and expansive vertical rhythm."
    },
    "project_item": {
      "rootClass": "project-card",
      "composition": "A surface-colored card within the grid, featuring high-contrast brass accents for titles and a dense cluster of 'badge' elements for technologies."
    },
    "design_item": {
      "rootClass": "design-card",
      "composition": "An image-heavy card with a subtle lapis blue overlay that fades on hover, revealing the raw image."
    },
    "nav_item": {
      "rootClass": "nav-link",
      "composition": "A heavily padded (min 44px) anchor element, featuring a subtle brass underline on hover."
    }
  }
}
```
