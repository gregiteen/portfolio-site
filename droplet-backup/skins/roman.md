---
type: page
slug: "skin-roman"
name: "Imperial Dark Technica"
title: "Imperial Dark Technica — Generated Skin"
description: "AI-generated skin: \"ROMAN\""
timestamp: "2026-07-12T10:48:41.171Z"
sandbox_entry: "designs/roman/index.html"
x_kind: "theme-skin"
x_year: "2026"
x_preview: "/designs/roman/assets/hero.jpg"
x_logo: "/designs/roman/gi-logo-transparent-dark.png"
x_link: "/designs/roman/index.html"
---

---
color:
  base_obsidian: 'oklch(20% 0.02 260)'
  surface_basalt: 'oklch(28% 0.01 260)'
  text_alabaster: 'oklch(95% 0.01 90)'
  accent_brass: 'oklch(75% 0.15 80)'
  interactive_porphyry: 'oklch(45% 0.18 20)'
typography:
  display: '"Marcellus", "Trajan Pro", serif'
  body: '"JetBrains Mono", monospace'
  scale_base: '16px'
  scale_h1: 'clamp(2.5rem, 8vw, 6rem)'
spacing:
  colonnade_gap: 'clamp(16px, 2vw, 32px)'
  section_pad: 'clamp(64px, 10vw, 120px)'
shape:
  roman_arch_radius: '400px 400px 0 0'
  chiseled_edge: '0px'
---
# Design Intent
This system projects monumental authority. The stark contrast between the classic Roman display face and the rigid monospace body reflects the intersection of ancient empire and modern AI engineering. Shapes alternate between rigid architectural blocks and distinct Roman arches to frame imagery.

## Locked Design Constitution

```json
{
  "name": "Imperial Dark Technica",
  "accent": "oklch(75% 0.15 80)",
  "signatureGesture": "The 'Colonnade Reveal'. As users scroll, bento grid items in the projects index utilize native CSS scroll-driven animations (`animation-timeline: view()`) to perform a heavy, physical translation upward, scaling from 0.95 to 1.0, paired with an opacity fade. This simulates walking past massive stone monoliths emerging from shadow.",
  "mobileStrategy": "Single-column monolithic stacking. The layout acts as a vertical stele. Navigation links wrap tightly into a touch-friendly (44px min-height) block list without ever collapsing into a hamburger menu. Hover states are bypassed in favor of high-contrast active states.",
  "imageTreatment": "Deep chiaroscuro lighting. Images are treated with high-contrast low-key exposure, emphasizing deep shadows and metallic/stone textures. A subtle CSS `mix-blend-mode: luminosity` or OKLCH color matrix will unify the portfolio images into the dark, brass-tinted visual language.",
  "tokens": {
    "colors": "oklch(20% 0.02 260) (obsidian base), oklch(28% 0.01 260) (basalt surface), oklch(75% 0.15 80) (aged brass accent)",
    "typography": "Display: Marcellus (monumental serif). Body: JetBrains Mono (technical AI context). Text-wrap: balance for display.",
    "spacing": "Base unit 4px. Structural gaps use clamp(16px, 2vw, 32px). Sections padded heavily with clamp(64px, 10vw, 120px) to simulate architectural voids.",
    "shape": "Zero border-radius for technical bento cards. 'roman_arch_radius' (400px 400px 0 0) used exclusively for hero images and prominent portraits.",
    "motion": "Exclusively compositor-thread. Scroll-driven timelines using view() for monolithic card entrances. @starting-style for modal interactions."
  },
  "classVocabulary": [
    {
      "name": "app-shell",
      "owner": "shell",
      "purpose": "Root layout container governing global structure and positioning"
    },
    {
      "name": "global-nav",
      "owner": "shell",
      "purpose": "Primary site navigation bar"
    },
    {
      "name": "nav-list",
      "owner": "shell",
      "purpose": "Wrapped list of navigation items"
    },
    {
      "name": "site-footer",
      "owner": "shell",
      "purpose": "Monumental baseline footer"
    },
    {
      "name": "home-layout",
      "owner": "home",
      "purpose": "Orchestrates the home page bento and hero"
    },
    {
      "name": "hero-monument",
      "owner": "home",
      "purpose": "The primary hero container featuring the roman arch background image"
    },
    {
      "name": "featured-grid",
      "owner": "home",
      "purpose": "Bento grid for top tier projects"
    },
    {
      "name": "projects-layout",
      "owner": "projects_index",
      "purpose": "Container for the full project listing stele"
    },
    {
      "name": "colonnade-grid",
      "owner": "projects_index",
      "purpose": "The masonry/grid layout for project cards with scroll timelines"
    },
    {
      "name": "designs-layout",
      "owner": "designs_index",
      "purpose": "Container for the visual design portfolio"
    },
    {
      "name": "gallery-masonry",
      "owner": "designs_index",
      "purpose": "Native CSS masonry layout for design assets"
    },
    {
      "name": "project-view",
      "owner": "project_detail",
      "purpose": "Root for an individual project's deep dive"
    },
    {
      "name": "project-header",
      "owner": "project_detail",
      "purpose": "Typographic monumental header for project title"
    },
    {
      "name": "project-content",
      "owner": "project_detail",
      "purpose": "Article container for project details and markdown"
    },
    {
      "name": "design-view",
      "owner": "design_detail",
      "purpose": "Root for a specific visual design piece"
    },
    {
      "name": "design-asset",
      "owner": "design_detail",
      "purpose": "Wrapper for the main design image ensuring strict containment"
    },
    {
      "name": "design-meta",
      "owner": "design_detail",
      "purpose": "Data table for design specs"
    },
    {
      "name": "standard-page",
      "owner": "page",
      "purpose": "Root layout for about and contact"
    },
    {
      "name": "page-body",
      "owner": "page",
      "purpose": "Centered reading column for prose"
    },
    {
      "name": "project-card",
      "owner": "project_item",
      "purpose": "Individual physical card for a project"
    },
    {
      "name": "project-title",
      "owner": "project_item",
      "purpose": "Chiseled title typography inside project card"
    },
    {
      "name": "design-card",
      "owner": "design_item",
      "purpose": "Individual frameless card for a design thumbnail"
    },
    {
      "name": "nav-link",
      "owner": "nav_item",
      "purpose": "Interactive navigation anchor"
    },
    {
      "name": "badge",
      "owner": "css",
      "purpose": "Runtime injected class for technical tags"
    },
    {
      "name": "src",
      "owner": "css",
      "purpose": "Runtime injected class for source links"
    },
    {
      "name": "backlink",
      "owner": "css",
      "purpose": "Runtime injected class for return navigation"
    },
    {
      "name": "btn",
      "owner": "css",
      "purpose": "Runtime injected class for action buttons"
    },
    {
      "name": "md-img",
      "owner": "css",
      "purpose": "Runtime injected class for markdown imagery"
    }
  ],
  "layoutBlueprints": {
    "shell": {
      "rootClass": "app-shell",
      "composition": "Provides a flex column wrapping the entire viewport. Top contains 'global-nav' utilizing 'nav-list' to horizontally wrap 'nav-link' elements with no hidden states. The main content flows below. The 'site-footer' anchors the bottom."
    },
    "home": {
      "rootClass": "home-layout",
      "composition": "Opens with 'hero-monument', a massive top-rounded section that accepts background-image: url(assets/hero.jpg). It contains kinetic typography. Below it flows the 'featured-grid', a dense bento layout."
    },
    "projects_index": {
      "rootClass": "projects-layout",
      "composition": "A monumental vertical layout. Houses the 'colonnade-grid' which utilizes CSS Grid subgrid lanes to align 'project-card' elements perfectly. Triggers scroll-driven reveals."
    },
    "designs_index": {
      "rootClass": "designs-layout",
      "composition": "A highly dense gallery layout. Uses 'gallery-masonry' to orchestrate 'design-card' elements into a seamless stone wall of imagery."
    },
    "project_detail": {
      "rootClass": "project-view",
      "composition": "A deep dive layout starting with a massive 'project-header' for the title, flowing into 'project-content' where prose and code snippets are bounded by strict readable line lengths (max-width 65ch)."
    },
    "design_detail": {
      "rootClass": "design-view",
      "composition": "Focuses heavily on the 'design-asset' expanding to fill optimal viewport space, with a rigid 'design-meta' sidebar or block underneath detailing the specifics in monospace."
    },
    "page": {
      "rootClass": "standard-page",
      "composition": "A centered, symmetrical layout. The 'page-body' handles text with algorithmic text-wrap balancing, perfect for the About and Contact views."
    },
    "project_item": {
      "rootClass": "project-card",
      "composition": "A brutal, chiseled container. Holds the 'project-title' in serif, followed by technical metadata injected as 'badge' and 'src' elements."
    },
    "design_item": {
      "rootClass": "design-card",
      "composition": "An image-first container with zero padding. Hovering over it utilizes :has() to dim sibling cards in the grid."
    },
    "nav_item": {
      "rootClass": "nav-link",
      "composition": "A strictly sized anchor ensuring a 44px touch target. High contrast active states without relying on hover effects for mobile."
    }
  }
}
```
