---
type: page
slug: "skin-irish"
name: "Basalt & Emerald"
title: "Basalt & Emerald — Generated Skin"
description: "AI-generated skin: \"IRISH\""
timestamp: "2026-07-12T11:24:56.617Z"
sandbox_entry: "designs/irish/index.html"
x_kind: "theme-skin"
x_year: "2026"
x_preview: "/designs/irish/assets/hero.jpg"
x_logo: "/designs/irish/gi-logo-transparent-dark.png"
x_link: "/designs/irish/index.html"
---

A dark, geological technical theme. Backgrounds are deep, overcast slate-blacks. Layouts are strictly locked into staggered bento grids that evoke columnar jointing. Edges are sharp (0px radius) to mimic chiseled stone. Typography pairs a sharp, commanding serif for structural headings with a dense, highly legible monospace for technical data. The visual hierarchy is heavily weighted by the striking contrast of vivid emerald green against the desaturated stone UI.

## Locked Design Constitution

```json
{
  "name": "Basalt & Emerald",
  "accent": "oklch(75% 0.25 150)",
  "signatureGesture": "Staggered, scroll-driven entry animations where bento cards rise into place at different depths, mimicking the uneven, interlocking columns of the Giant's Causeway.",
  "mobileStrategy": "Single-column fluid layout with touch targets strictly inflated to 44px. The bento grid flattens into a continuous scroll of stark, full-width blocks separated by 1px emerald borders. The navigation wraps into a visible, tactile bottom bar to avoid hidden menus.",
  "imageTreatment": "Desaturated, moody, high-contrast overcast aesthetics (classic Irish coastal weather) punctuated by vivid, glowing emerald data streams or UI elements.",
  "tokens": {
    "colors": "bg: oklch(20% 0.02 260); surface: oklch(25% 0.02 260); text: oklch(90% 0.01 260); accent: oklch(75% 0.25 150); border: oklch(35% 0.02 260);",
    "typography": "display: 'Cinzel', 'Playfair Display', serif; body: 'Inter', sans-serif; mono: 'JetBrains Mono', monospace;",
    "spacing": "xs: 0.5rem; sm: 1rem; md: 1.5rem; lg: 3rem; xl: 6rem; grid_gap: 1px;",
    "shape": "radius_none: 0px; radius_subtle: 2px;",
    "motion": "easing_stone: cubic-bezier(0.2, 0, 0, 1); duration_base: 400ms;"
  },
  "classVocabulary": [
    {
      "name": "shell-root",
      "owner": "shell",
      "purpose": "Main wrapper for the entire application"
    },
    {
      "name": "shell-nav",
      "owner": "shell",
      "purpose": "Global navigation container"
    },
    {
      "name": "shell-main",
      "owner": "shell",
      "purpose": "Primary content region"
    },
    {
      "name": "shell-footer",
      "owner": "shell",
      "purpose": "Global footer container"
    },
    {
      "name": "home-root",
      "owner": "home",
      "purpose": "Root layout for the homepage"
    },
    {
      "name": "home-hero",
      "owner": "home",
      "purpose": "Hero section requiring background-image"
    },
    {
      "name": "home-hero-content",
      "owner": "home",
      "purpose": "Typography and actions within the hero"
    },
    {
      "name": "home-featured",
      "owner": "home",
      "purpose": "Bento grid container for featured projects"
    },
    {
      "name": "projects-root",
      "owner": "projects_index",
      "purpose": "Root layout for the projects index"
    },
    {
      "name": "projects-header",
      "owner": "projects_index",
      "purpose": "Header region for projects"
    },
    {
      "name": "projects-grid",
      "owner": "projects_index",
      "purpose": "Masonry/Bento container for project items"
    },
    {
      "name": "project-card",
      "owner": "project_item",
      "purpose": "Individual project bento card"
    },
    {
      "name": "project-title",
      "owner": "project_item",
      "purpose": "Title of the project"
    },
    {
      "name": "project-meta",
      "owner": "project_item",
      "purpose": "Metadata and tags for the project"
    },
    {
      "name": "designs-root",
      "owner": "designs_index",
      "purpose": "Root layout for the designs gallery"
    },
    {
      "name": "designs-gallery",
      "owner": "designs_index",
      "purpose": "Grid container for design items"
    },
    {
      "name": "design-card",
      "owner": "design_item",
      "purpose": "Individual design bento card"
    },
    {
      "name": "design-media",
      "owner": "design_item",
      "purpose": "Image container for the design preview"
    },
    {
      "name": "project-detail-root",
      "owner": "project_detail",
      "purpose": "Root layout for a specific project"
    },
    {
      "name": "project-detail-header",
      "owner": "project_detail",
      "purpose": "Header metadata for the project detail"
    },
    {
      "name": "project-detail-body",
      "owner": "project_detail",
      "purpose": "Content body for the project detail"
    },
    {
      "name": "design-detail-root",
      "owner": "design_detail",
      "purpose": "Root layout for a specific design"
    },
    {
      "name": "design-detail-canvas",
      "owner": "design_detail",
      "purpose": "Main image presentation area"
    },
    {
      "name": "page-root",
      "owner": "page",
      "purpose": "Root layout for generic pages"
    },
    {
      "name": "page-content",
      "owner": "page",
      "purpose": "Markdown content container for generic pages"
    },
    {
      "name": "nav-item-root",
      "owner": "nav_item",
      "purpose": "Wrapper for a single navigation link"
    },
    {
      "name": "nav-item-link",
      "owner": "nav_item",
      "purpose": "The anchor tag for the navigation item"
    },
    {
      "name": "badge",
      "owner": "css",
      "purpose": "Injected runtime class for tags/labels"
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
      "purpose": "Injected runtime class for markdown images"
    }
  ],
  "layoutBlueprints": {
    "shell": {
      "rootClass": "shell-root",
      "composition": "A persistent, structural frame. The shell-nav spans the top edge, featuring stark typography and explicit 1px emerald borders. On mobile, the nav items wrap cleanly into a dense block. The shell-main holds all injected content. The shell-footer acts as the baseline."
    },
    "home": {
      "rootClass": "home-root",
      "composition": "The home-hero dominates the viewport, applying the dramatic Irish landscape asset. The home-hero-content is bottom-anchored, featuring a massive chiseled headline. Below, the home-featured section uses a native Bento grid with varying track sizes to mimic basalt columns."
    },
    "projects_index": {
      "rootClass": "projects-root",
      "composition": "A strictly ordered, highly technical index. The projects-header introduces the category. The projects-grid uses native subgrid and staggered columnar joints, ensuring cards stack seamlessly with a 1px emerald gap."
    },
    "designs_index": {
      "rootClass": "designs-root",
      "composition": "A visual masonry layout. The designs-gallery allows design-cards to span multiple rows natively, echoing the organic but rigid structure of the Giant's Causeway. Images are heavily desaturated until hovered."
    },
    "project_detail": {
      "rootClass": "project-detail-root",
      "composition": "An editorial deep-dive. The project-detail-header is a stark bento block detailing metadata. The project-detail-body is a single, central column restricted by max-width for optimal reading, utilizing pretty text-wrapping."
    },
    "design_detail": {
      "rootClass": "design-detail-root",
      "composition": "Immersive and cinematic. The design-detail-canvas expands the visual work edge-to-edge on mobile, and bounds it within a sharp, stone-like border on desktop. Minimal interference from UI chrome."
    },
    "page": {
      "rootClass": "page-root",
      "composition": "A utilitarian layout for text. The page-content centers the typography, prioritizing the high-contrast pairing of the chiseled serif headers and the technical monospace body."
    },
    "project_item": {
      "rootClass": "project-card",
      "composition": "A stark, unrounded block. The project-title sits at the top in a sharp serif. The project-meta anchors the bottom, styled as small technical monospace badges. Hovering triggers a subtle compositor-thread reveal of a glowing emerald border."
    },
    "design_item": {
      "rootClass": "design-card",
      "composition": "A container for visual media. The design-media fills the block completely. The relational state (:has) allows sibling cards to dim slightly when one is hovered, focusing attention."
    },
    "nav_item": {
      "rootClass": "nav-item-root",
      "composition": "A highly tactile, explicitly sized hit area (min 44px). The nav-item-link displays crisp monospace text, turning vivid emerald on hover."
    }
  }
}
```
