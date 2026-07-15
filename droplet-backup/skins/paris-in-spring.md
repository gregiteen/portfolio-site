---
type: page
slug: "skin-paris-in-spring"
name: "L'Heure Bleue"
title: "L'Heure Bleue — Generated Skin"
description: "AI-generated skin: \"Paris in spring\""
timestamp: "2026-07-15T08:46:42.047Z"
sandbox_entry: "designs/paris-in-spring/index.html"
x_kind: "theme-skin"
x_year: "2026"
x_preview: "/designs/paris-in-spring/assets/hero.jpg"
x_logo: "/designs/paris-in-spring/gi-logo-transparent-dark.png"
x_link: "/designs/paris-in-spring/index.html"
---

A high-end, editorial interpretation of a Parisian spring twilight mapped onto a dark, austere technical portfolio. The system relies on a deep indigo baseline cut by precise, 1px wrought-iron structural grids. Lighting is simulated via OKLCH color variables, producing a 'blue hour' glow accented by soft spring pinks and streetlamp golds. The aesthetic balances the romanticism of the subject with the rigid, mathematical reality of AI engineering. Typography juxtaposes classic European editorial serifs with stark, functional monospace data points.

## Locked Design Constitution

```json
{
  "name": "L'Heure Bleue",
  "accent": "oklch(80% 0.12 350)",
  "signatureGesture": "Scroll-Driven Twilight Emergence. As the user scrolls down the bento grid, structural elements and project cards fade upward with a slight, hardware-accelerated scale effect driven directly by `animation-timeline: view()`. The staggered reveal mimics the turning on of city streetlamps as dusk settles over the grid.",
  "mobileStrategy": "Strict mobile-first linear bento tracks. The navigation is permanently visible at the top, wrapping naturally into a compact configuration below 768px with explicit 44px touch targets. All grids default to a single fluid column `minmax(0, 1fr)` to prevent multi-column text collision, expanding via `min-width` media queries to multi-lane bento grids on desktop.",
  "imageTreatment": "Photography is treated with a moody, high-contrast twilight grade. Shadows are crushed into deep blues, while highlights retain a warm, low-angle spring light. A subtle SVG noise overlay encodes texture directly into the CSS, removing the sterile digital feel without compromising performance.",
  "tokens": {
    "colors": "--twilight-base: oklch(18% 0.04 260); --twilight-surface: oklch(24% 0.05 260); --iron-grid: oklch(12% 0.02 260); --text-primary: oklch(95% 0.02 260); --text-muted: oklch(75% 0.04 260); --spring-blush: oklch(80% 0.12 350); --lamp-gold: oklch(85% 0.15 80);",
    "typography": "--font-display: 'Ogg', 'Playfair Display', serif; --font-body: 'JetBrains Mono', 'Geist Mono', monospace; --font-weight-display: 400; --font-weight-body: 400;",
    "spacing": "--space-4: 0.25rem; --space-8: 0.5rem; --space-16: 1rem; --space-24: 1.5rem; --space-48: 3rem; --space-96: 6rem; --grid-gap: 1px; --touch-target: 44px;",
    "shape": "--radius-zero: 0px; --radius-sm: 2px;",
    "motion": "--timing-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275); --duration-fast: 200ms; --duration-slow: 600ms;"
  },
  "classVocabulary": [
    {
      "name": "badge",
      "owner": "css",
      "purpose": "Injected runtime class for metadata labels"
    },
    {
      "name": "src",
      "owner": "css",
      "purpose": "Injected runtime class for source links"
    },
    {
      "name": "backlink",
      "owner": "css",
      "purpose": "Injected runtime class for navigation return paths"
    },
    {
      "name": "btn",
      "owner": "css",
      "purpose": "Injected runtime class for interactive triggers"
    },
    {
      "name": "md-img",
      "owner": "css",
      "purpose": "Injected runtime class for markdown imagery"
    },
    {
      "name": "shell-root",
      "owner": "shell",
      "purpose": "Main layout wrapper and global context provider"
    },
    {
      "name": "global-header",
      "owner": "shell",
      "purpose": "Top navigation container, wraps on mobile"
    },
    {
      "name": "primary-nav",
      "owner": "shell",
      "purpose": "Visible site routing links"
    },
    {
      "name": "main-content",
      "owner": "shell",
      "purpose": "Viewport container for injected layouts"
    },
    {
      "name": "global-footer",
      "owner": "shell",
      "purpose": "Bottom metadata and closing information"
    },
    {
      "name": "home-root",
      "owner": "home",
      "purpose": "Landing page wrapper"
    },
    {
      "name": "hero-twilight",
      "owner": "home",
      "purpose": "Primary visual entry containing the background-image"
    },
    {
      "name": "intro-thesis",
      "owner": "home",
      "purpose": "Typographic block for the main structural statement"
    },
    {
      "name": "featured-work",
      "owner": "home",
      "purpose": "Bento grid container for highlighted items"
    },
    {
      "name": "projects-root",
      "owner": "projects_index",
      "purpose": "Index wrapper for all engineering work"
    },
    {
      "name": "project-grid",
      "owner": "projects_index",
      "purpose": "Native masonry container for project cards"
    },
    {
      "name": "designs-root",
      "owner": "designs_index",
      "purpose": "Index wrapper for visual design work"
    },
    {
      "name": "design-gallery",
      "owner": "designs_index",
      "purpose": "Grid layout for visual previews"
    },
    {
      "name": "project-detail-root",
      "owner": "project_detail",
      "purpose": "Wrapper for individual engineering case studies"
    },
    {
      "name": "project-header",
      "owner": "project_detail",
      "purpose": "Title and high-level architectural metadata"
    },
    {
      "name": "project-body",
      "owner": "project_detail",
      "purpose": "Main markdown content container"
    },
    {
      "name": "tech-specs",
      "owner": "project_detail",
      "purpose": "Sidebar or structured area for stack details"
    },
    {
      "name": "design-detail-root",
      "owner": "design_detail",
      "purpose": "Wrapper for individual design studies"
    },
    {
      "name": "design-showcase",
      "owner": "design_detail",
      "purpose": "Container for full-bleed or large-format imagery"
    },
    {
      "name": "design-meta",
      "owner": "design_detail",
      "purpose": "Context and specification data for the design"
    },
    {
      "name": "page-root",
      "owner": "page",
      "purpose": "Wrapper for standard text pages (about, contact)"
    },
    {
      "name": "page-prose",
      "owner": "page",
      "purpose": "Constrained reading column for standard text"
    },
    {
      "name": "contact-grid",
      "owner": "page",
      "purpose": "Structured layout for communication channels"
    },
    {
      "name": "project-card",
      "owner": "project_item",
      "purpose": "Individual bento item representing a project"
    },
    {
      "name": "project-title",
      "owner": "project_item",
      "purpose": "Typography for project name"
    },
    {
      "name": "project-meta",
      "owner": "project_item",
      "purpose": "Container for project badges and dates"
    },
    {
      "name": "design-card",
      "owner": "design_item",
      "purpose": "Individual gallery item for a visual piece"
    },
    {
      "name": "design-visual",
      "owner": "design_item",
      "purpose": "Image container within the design card"
    },
    {
      "name": "nav-link",
      "owner": "nav_item",
      "purpose": "Interactive link element with 44px touch target"
    },
    {
      "name": "nav-indicator",
      "owner": "nav_item",
      "purpose": "Visual mark denoting active state"
    }
  ],
  "layoutBlueprints": {
    "shell": {
      "rootClass": "shell-root",
      "composition": "A rigid full-height flex column. 'global-header' sits at the top, housing 'primary-nav' with wrapping flex items to ensure mobile legibility. Below is 'main-content', expanding to fill space, and finally 'global-footer'."
    },
    "home": {
      "rootClass": "home-root",
      "composition": "Opens with 'hero-twilight' occupying the top section (receives the exact background-image). 'intro-thesis' overlays or sits immediately below with stark editorial typography. 'featured-work' follows as a CSS Grid bento layout with 1px gaps."
    },
    "projects_index": {
      "rootClass": "projects-root",
      "composition": "A linear flow starting with a bold typographic header. 'project-grid' establishes a responsive bento/masonry grid where 'project_item' fragments are injected."
    },
    "designs_index": {
      "rootClass": "designs-root",
      "composition": "Similar to projects, but 'design-gallery' uses a denser grid structure optimized for visual aspect ratios rather than text metadata."
    },
    "project_detail": {
      "rootClass": "project-detail-root",
      "composition": "A split-pane or clearly delineated vertical flow. 'project-header' holds the title and 'tech-specs'. 'project-body' contains the injected markdown in a constrained, single-column reading width."
    },
    "design_detail": {
      "rootClass": "design-detail-root",
      "composition": "Focuses heavily on 'design-showcase' to let the visuals breathe, with 'design-meta' anchoring the bottom or side in a strict monospace readout."
    },
    "page": {
      "rootClass": "page-root",
      "composition": "A simple, highly legible structure. 'page-prose' handles text paragraphs with 'text-wrap: pretty', while 'contact-grid' (if applicable) structures links in a neat bento row."
    },
    "project_item": {
      "rootClass": "project-card",
      "composition": "A single block with strict padding. Contains 'project-title' and 'project-meta', utilizing view-timeline scroll animations to fade up."
    },
    "design_item": {
      "rootClass": "design-card",
      "composition": "A container focused on 'design-visual' (the image), with minimal text overlay or below-image text to keep focus on the asset."
    },
    "nav_item": {
      "rootClass": "nav-link",
      "composition": "A text node combined with an optional 'nav-indicator'. Styled to ensure minimum 44px tap area via padding."
    }
  }
}
```
