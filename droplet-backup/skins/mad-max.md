---
type: page
slug: "skin-mad-max"
name: "Wasteland Scavenger"
title: "Wasteland Scavenger — Generated Skin"
description: "AI-generated skin: \"MAD MAX\""
timestamp: "2026-07-15T22:46:40.765Z"
sandbox_entry: "designs/mad-max/index.html"
x_kind: "theme-skin"
x_year: "2026"
x_preview: "/designs/mad-max/assets/hero.jpg"
x_logo: "/designs/mad-max/gi-logo-transparent-dark.png"
x_link: "/designs/mad-max/index.html"
---

tokens: colors: bg: '#080605' text: '#DED8D1' accent: '#D94814' chrome: '#8A8D91' typography: display: '"Tourney", sans-serif' body: '"Khand", sans-serif' spacing: section_y: 'clamp(64px, 10vw, 120px)' grid_gap: 'clamp(16px, 3vw, 32px)' layout: max_width: '1200px' borders: thick_weld: '4px solid #D94814' radius: '0px' rationale: The design token framework enforces a harsh, sun-scorched environment. Tourney provides a meshed, industrial radiator-grille aesthetic for display text, while Khand allows for ultra-dense, HUD-like readouts. All containers avoid standard border-radii in favor of chamfered clip-paths.

## Locked Design Constitution

```json
{
  "name": "Wasteland Scavenger",
  "accent": "oklch(55% 0.20 35)",
  "signatureGesture": "Scroll-driven 'Wasteland Wind' effect: An embedded SVG noise texture pseudo-element anchored to animation-timeline: view() that shifts laterally and increases in opacity as the user scrolls deeper into the page, mimicking a sandstorm hitting a windshield.",
  "mobileStrategy": "Thick, finger-friendly 'welded' armor-plate buttons with strict 44px minimum heights. Full-width cards with deep bottom borders to imply physical weight and machinery. Global navigation is a persistent, thick top-bar with horizontal overflow scrolling for items, ensuring no hidden hamburger menus.",
  "imageTreatment": "High-contrast, crushed shadow 'Fury Road' color grade. Warm, desolate orange-teal split toning applied via CSS mix-blend-mode. Images are housed inside clip-path: polygon() shapes to look like bolted-on metal viewports.",
  "tokens": {
    "colors": "Primary Background: oklch(15% 0.02 50) Scorched Asphalt. Surface: oklch(20% 0.03 45) Rusted Iron. Text: oklch(90% 0.02 80) Sun-bleached Bone. Accent: oklch(55% 0.20 35) Oxidized Orange.",
    "typography": "Display: 'Tourney', sans-serif (Weights 700-900, variable width). Body: 'Khand', sans-serif (Weight 400, 600 for emphasis). Both exist on fonts.google.com.",
    "spacing": "Mathematical, engine-block spacing. Base unit 8px. Grid gaps: 24px (mobile) to 48px (desktop). Padding relies on thick 32px inset blocks.",
    "shape": "Zero border radius. Heavy use of clip-path: polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px) to create angled, machined steel cuts.",
    "motion": "Heavy, physical snaps. Hardware-accelerated transforms using @starting-style. Drop-in animations simulate the weight of falling scrap metal with fast entry and rigid stops."
  },
  "classVocabulary": [
    {
      "name": "site-root",
      "owner": "shell",
      "purpose": "Main layout wrapper and wasteland background context"
    },
    {
      "name": "global-nav",
      "owner": "shell",
      "purpose": "Thick tactical top bar for site traversal"
    },
    {
      "name": "nav-list",
      "owner": "shell",
      "purpose": "Horizontal flex container for navigation links"
    },
    {
      "name": "main-content",
      "owner": "shell",
      "purpose": "Primary engine block housing page views"
    },
    {
      "name": "footer-region",
      "owner": "shell",
      "purpose": "Bottom baseline signature and contact"
    },
    {
      "name": "nav-item",
      "owner": "nav_item",
      "purpose": "Individual routing control unit"
    },
    {
      "name": "hero-section",
      "owner": "home",
      "purpose": "Monumental entry viewport showcasing the wasteland thesis"
    },
    {
      "name": "bento-grid",
      "owner": "home",
      "purpose": "Dense grid mapping featured salvage and projects"
    },
    {
      "name": "bento-cell",
      "owner": "home",
      "purpose": "Individual armored plate within the home grid"
    },
    {
      "name": "project-grid",
      "owner": "projects_index",
      "purpose": "Native masonry container for the project inventory"
    },
    {
      "name": "section-header",
      "owner": "projects_index",
      "purpose": "Industrial stamped text declaring the page scope"
    },
    {
      "name": "design-grid",
      "owner": "designs_index",
      "purpose": "Strict structural matrix for visual artifacts"
    },
    {
      "name": "project-card",
      "owner": "project_item",
      "purpose": "Chamfered casing for an individual project"
    },
    {
      "name": "project-thumb",
      "owner": "project_item",
      "purpose": "Media viewport with split-tone overlays"
    },
    {
      "name": "project-meta",
      "owner": "project_item",
      "purpose": "Technical telemetry and data readout for the project"
    },
    {
      "name": "design-card",
      "owner": "design_item",
      "purpose": "Heavy-bordered artifact frame"
    },
    {
      "name": "page-header",
      "owner": "page",
      "purpose": "Standardized utilitarian title block for text pages"
    },
    {
      "name": "page-body",
      "owner": "page",
      "purpose": "Reading environment with restricted line lengths"
    },
    {
      "name": "detail-hero",
      "owner": "project_detail",
      "purpose": "Massive immersive header for project teardowns"
    },
    {
      "name": "detail-body",
      "owner": "project_detail",
      "purpose": "Technical documentation layout for project internals"
    },
    {
      "name": "design-focus",
      "owner": "design_detail",
      "purpose": "Singular massive media display for isolated designs"
    },
    {
      "name": "badge",
      "owner": "css",
      "purpose": "Injected runtime class for tiny metadata pills"
    },
    {
      "name": "src",
      "owner": "css",
      "purpose": "Injected runtime class for code blocks or source references"
    },
    {
      "name": "backlink",
      "owner": "css",
      "purpose": "Injected runtime class for utility return links"
    },
    {
      "name": "btn",
      "owner": "css",
      "purpose": "Injected runtime class for interactive triggers"
    },
    {
      "name": "md-img",
      "owner": "css",
      "purpose": "Injected runtime class for markdown image formatting"
    }
  ],
  "layoutBlueprints": {
    "shell": {
      "rootClass": "site-root",
      "composition": "A full viewport grid defining top navigation (global-nav > nav-list), main-content area, and footer-region. Built to constrain maximum width to 1200px while centering the content on large screens, utilizing a heavy dust-textured SVG background."
    },
    "home": {
      "rootClass": "hero-section",
      "composition": "Opens with hero-section containing a massive Tourney display title. Below it, the bento-grid takes over, defining an auto-fit dense matrix where bento-cell elements showcase top technical builds like scavenged car parts."
    },
    "projects_index": {
      "rootClass": "project-grid",
      "composition": "Begins with section-header for the title, followed by project-grid utilizing CSS native masonry (grid-template-rows: masonry) to stack various sized project units efficiently."
    },
    "designs_index": {
      "rootClass": "design-grid",
      "composition": "A rigid, auto-fill bento grid (design-grid) prioritizing large image thumbs over text, giving a gallery effect reminiscent of a parts catalog."
    },
    "project_detail": {
      "rootClass": "detail-hero",
      "composition": "Starts with detail-hero, utilizing scroll-driven timelines to fade and scale the cover image. Flows into detail-body, structured as a single-column technical read with generous margin for code blocks and md-img injections."
    },
    "design_detail": {
      "rootClass": "design-focus",
      "composition": "A highly minimal, screen-filling layout (design-focus) that pushes text to the absolute bottom, letting the visual design artifact dominate the viewport with a crushed-black backdrop."
    },
    "page": {
      "rootClass": "page-header",
      "composition": "Stacks page-header above page-body. Typography in page-body uses text-wrap: pretty and max-width: 65ch to ensure maximum legibility for long-form technical prose."
    },
    "project_item": {
      "rootClass": "project-card",
      "composition": "A tactile component (project-card) utilizing clip-path for cut corners. Contains project-thumb at the top, and project-meta at the bottom displaying tags via the badge class."
    },
    "design_item": {
      "rootClass": "design-card",
      "composition": "A thick-bordered container (design-card) that focuses entirely on an image viewport, with a kinetic hover effect that shifts the image scale and color grading."
    },
    "nav_item": {
      "rootClass": "nav-item",
      "composition": "A robust, block-level anchor (nav-item) with a strict 44px height, featuring an oxidized orange bottom border indicator on current state or hover."
    }
  }
}
```
