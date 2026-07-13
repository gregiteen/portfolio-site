---
type: page
slug: "skin-surfs-up"
name: "Hydrofoil AI"
title: "Hydrofoil AI — Generated Skin"
description: "AI-generated skin: \"SURFS UP\""
timestamp: "2026-07-12T22:17:13.295Z"
sandbox_entry: "designs/surfs-up/index.html"
x_kind: "theme-skin"
x_year: "2026"
x_preview: "/designs/surfs-up/assets/hero.jpg"
x_logo: "/designs/surfs-up/gi-logo-transparent-dark.png"
x_link: "/designs/surfs-up/index.html"
---

A strict, mobile-first CSS architecture anchored in extreme technical precision and high-performance surfing motifs. Surfaces simulate wet carbon fiber using CSS gradients and low-opacity OKLCH overlays. Grids are dense, mimicking fluid dynamics software interfaces, with 1px borders denoting structural sections. All interactive elements use :has() for relational dimming, simulating a polarizing lens effect when focusing on a specific project.

## Locked Design Constitution

```json
{
  "name": "Hydrofoil AI",
  "accent": "High-Vis Orange",
  "signatureGesture": "The 'Swelling Wake' effect: Using pure CSS view() timelines, project cards and list items scale up slightly and increase in brightness as they scroll into the center of the viewport, mimicking a wave cresting, before settling back into the dark oceanic background as they exit.",
  "mobileStrategy": "Base CSS defaults to a single-column, full-bleed fluid layout. Navigation is exposed as a wrap-enabled flex container with strict 44px minimum touch targets, eliminating hidden states. Padding uses fluid vw units to maximize screen real estate, ensuring complex AI diagrams and surf imagery remain legible without horizontal overflow.",
  "imageTreatment": "Images will receive a 'Polarized Lens' treatment using CSS filters: high contrast, deep crushed shadows, saturated blues, and a slight metallic specular highlight overlay to simulate wet neoprene and fiberglass surfaces.",
  "tokens": {
    "colors": "bg: oklch(15% 0.02 250); text-primary: oklch(98% 0.01 250); text-muted: oklch(65% 0.05 250); accent: oklch(75% 0.2 45); surface: oklch(20% 0.03 250); border: oklch(25% 0.05 250);",
    "typography": "display: 'Clash Display', sans-serif, font-weight 600; body: 'JetBrains Mono', monospace, font-weight 400; text-wrap: balance for display, pretty for body.",
    "spacing": "fluid-gap: clamp(1rem, 2vw, 2rem); section-y: clamp(4rem, 8vw, 8rem); touch-target: 44px;",
    "shape": "radius-base: 2px (sharp fiberglass edges); radius-card: 8px (hydrofoil curve); border-width: 1px;",
    "motion": "easing-swell: cubic-bezier(0.25, 1, 0.5, 1); timeline-scroll: view(block);"
  },
  "classVocabulary": [
    {
      "name": "layout-shell",
      "owner": "shell",
      "purpose": "Maintains the global bounding box and application background"
    },
    {
      "name": "global-nav",
      "owner": "shell",
      "purpose": "Houses the wrap-enabled, visible mobile navigation items"
    },
    {
      "name": "nav-item",
      "owner": "nav_item",
      "purpose": "Individual navigation link with 44px hit area"
    },
    {
      "name": "hero-header",
      "owner": "home",
      "purpose": "Container for the thematic hero image and main thesis"
    },
    {
      "name": "hero-media",
      "owner": "home",
      "purpose": "Target for the background-image injection"
    },
    {
      "name": "grid-masonry",
      "owner": "projects_index",
      "purpose": "Native masonry container for project cards"
    },
    {
      "name": "grid-bento",
      "owner": "designs_index",
      "purpose": "High-density bento grid for visual design work"
    },
    {
      "name": "card-surface",
      "owner": "project_item",
      "purpose": "Individual project container with wet-gloss styling"
    },
    {
      "name": "card-meta",
      "owner": "project_item",
      "purpose": "Typographic container for project titles and dates"
    },
    {
      "name": "design-preview",
      "owner": "design_item",
      "purpose": "Image container for visual work with polarized filter"
    },
    {
      "name": "detail-header",
      "owner": "project_detail",
      "purpose": "Top-level metadata section for deep-dive case studies"
    },
    {
      "name": "detail-content",
      "owner": "project_detail",
      "purpose": "Text-heavy flow container for markdown content"
    },
    {
      "name": "page-layout",
      "owner": "page",
      "purpose": "Generic static page container (About, Contact)"
    },
    {
      "name": "badge",
      "owner": "css",
      "purpose": "Injected runtime class for technical tags"
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
      "purpose": "Injected runtime class for primary actions"
    },
    {
      "name": "md-img",
      "owner": "css",
      "purpose": "Injected runtime class for markdown-embedded images"
    }
  ],
  "layoutBlueprints": {
    "shell": {
      "rootClass": "layout-shell",
      "composition": "A high-level CSS grid establishing a fixed header row for 'global-nav' and a fluid main content area. Strict min-width media queries transition the navigation from a wrapped flex row on mobile to a staggered horizontal layout on desktop. No horizontal overflow permitted."
    },
    "home": {
      "rootClass": "hero-header",
      "composition": "The 'hero-header' spans full width, containing 'hero-media' which receives the injected hydrofoil asset. Below the visual thesis, a dense, subgrid-aligned section introduces the featured AI projects."
    },
    "projects_index": {
      "rootClass": "grid-masonry",
      "composition": "Implements pure CSS native masonry. Cards cascade vertically in fluid columns, leveraging scroll-driven timelines to swell into view as the user scrolls down the 'wave'."
    },
    "designs_index": {
      "rootClass": "grid-bento",
      "composition": "A rigid, mathematics-driven bento grid. Images are cropped tightly into 'design-preview' containers, forcing a dense, analytical layout contrasting with the fluid organic imagery."
    },
    "project_detail": {
      "rootClass": "detail-header",
      "composition": "Opens with massive, screen-spanning typography and metadata grid. 'detail-content' follows below with a strict reading width (max 65ch), ensuring text block legibility without multi-column collision."
    },
    "design_detail": {
      "rootClass": "detail-header",
      "composition": "Places the primary design asset front and center with edge-to-edge bleed on mobile, shrinking to a framed, polarized-glass container on desktop. Supporting text flows in a single column below."
    },
    "page": {
      "rootClass": "page-layout",
      "composition": "A clean, single-column prose container tailored for the About and Contact sections, utilizing fluid typography interpolation for seamless scaling."
    },
    "project_item": {
      "rootClass": "card-surface",
      "composition": "A layered, tactile component. The dark background receives a subtle noise texture. 'card-meta' positions typography at the very bottom, anchored to the edge for a brutalist, technical aesthetic."
    },
    "design_item": {
      "rootClass": "design-preview",
      "composition": "An interactive container that utilizes :has() to dim sibling items when hovered. The internal image uses CSS object-fit cover to ensure no grid overflow."
    },
    "nav_item": {
      "rootClass": "nav-item",
      "composition": "A structural link block enforcing a strict 44px minimum height and width. Text is center-aligned, using the monospace typeface with a high-vis orange underline on hover."
    }
  }
}
```
