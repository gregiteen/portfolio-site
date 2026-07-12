---
type: page
slug: "skin-clowns"
name: "Avant-Garde Pierrot"
title: "Avant-Garde Pierrot — Generated Skin"
description: "AI-generated skin: \"CLOWNS\""
timestamp: "2026-07-12T11:19:06.616Z"
sandbox_entry: "designs/clowns/index.html"
x_kind: "theme-skin"
x_year: "2026"
x_preview: "/designs/clowns/assets/hero.jpg"
x_logo: "/designs/clowns/gi-logo-transparent-dark.png"
x_link: "/designs/clowns/index.html"
---

---
tokens:
  color:
    bg: 'oklch(15% 0 0)'
    text: 'oklch(95% 0 0)'
    accent: 'oklch(45% 0.25 29)'
    surface: 'oklch(20% 0 0)'
  typography:
    display: '"Playfair Display", serif'
    body: '"Inter", sans-serif'
  spacing:
    mobile_gap: '1rem'
    desktop_gap: 'clamp(1.5rem, 3vw, 3rem)'
    touch_target: '44px'
  shape:
    radius: '0px'
---
# Avant-Garde Pierrot Design Constitution

This design merges the literal subject matter of CLOWNS with a highly technical, dark editorial portfolio. We avoid cheap carnival tropes by treating the clown aesthetic as high fashion: stark black-and-white greasepaint, rigid ruffled collars, and dramatic spotlighting. 

The layout uses strict mobile-first uncollapsed navigation and stark mathematical bento grids on desktop. No borders are rounded. All interactivity uses a signature greasepaint crimson accent to draw the eye, mirroring a clown's red nose or painted smile in an otherwise austere landscape.

## Locked Design Constitution

```json
{
  "name": "Avant-Garde Pierrot",
  "accent": "oklch(45% 0.25 29)",
  "signatureGesture": "Theatrical Spotlight Reveal: Using native CSS animation-timeline: view(), content cards and case studies fade in with a sweeping linear gradient mask that mimics a circus ringmaster's spotlight passing over them as they enter the viewport.",
  "mobileStrategy": "Strictly mobile-first. Navigation is permanently visible (no hamburger menus) and stacked vertically on mobile devices with padded 44px minimum touch targets. Content flows in a single linear column. Media queries using min-width expand these single columns into dense bento grids for larger viewports. Text uses text-wrap: pretty to prevent awkward ragging on narrow screens.",
  "imageTreatment": "Monochromatic high-contrast photography with a single vivid crimson element (a nose, a lip, a button). Literal clown attire (ruffles, hats, greasepaint) framed in extreme close-up, utilizing stark studio lighting against pitch-black voids.",
  "tokens": {
    "colors": "Background: oklch(15% 0 0). Text: oklch(95% 0 0). Accent/Interactive: oklch(45% 0.25 29). Surface: oklch(20% 0 0).",
    "typography": "Display: 'Playfair Display', serif (stark, theatrical contrast). Body: 'Inter', sans-serif (austere, technical readability).",
    "spacing": "Base touch target: 44px minimum. Section gaps scale fluidly: clamp(4rem, 8vw, 8rem). Grid gaps: 1px (using surface color to create hairline borders) or 2rem for floating bento items.",
    "shape": "Absolute zero border radius. Razor-sharp corners. Brutal rectangular intersections that contrast with the organic nature of the clown imagery.",
    "motion": "Exclusively GPU-composited. starting-style for instant initial renders. Scroll-driven timelines for all reveals. No JavaScript layout recalculations."
  },
  "classVocabulary": [
    {
      "name": "badge",
      "owner": "css",
      "purpose": "Injected runtime class for metadata tags"
    },
    {
      "name": "src",
      "owner": "css",
      "purpose": "Injected runtime class for code sources"
    },
    {
      "name": "backlink",
      "owner": "css",
      "purpose": "Injected runtime class for return navigation"
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
      "name": "shell-root",
      "owner": "shell",
      "purpose": "Main layout wrapper and stacking context"
    },
    {
      "name": "global-nav",
      "owner": "shell",
      "purpose": "Header container for navigation links"
    },
    {
      "name": "nav-list",
      "owner": "shell",
      "purpose": "Unordered list wrapping navigation items"
    },
    {
      "name": "home-root",
      "owner": "home",
      "purpose": "Root container for the home page"
    },
    {
      "name": "hero-section",
      "owner": "home",
      "purpose": "Theatrical hero section with background image"
    },
    {
      "name": "spotlight-grid",
      "owner": "home",
      "purpose": "Bento grid for featured content"
    },
    {
      "name": "projects-root",
      "owner": "projects_index",
      "purpose": "Root container for projects list"
    },
    {
      "name": "masonry-list",
      "owner": "projects_index",
      "purpose": "Native CSS masonry container for project cards"
    },
    {
      "name": "project-card",
      "owner": "project_item",
      "purpose": "Individual project container"
    },
    {
      "name": "project-meta",
      "owner": "project_item",
      "purpose": "Technical metadata for a project"
    },
    {
      "name": "project-title",
      "owner": "project_item",
      "purpose": "Display heading for a project"
    },
    {
      "name": "project-doc",
      "owner": "project_detail",
      "purpose": "Root container for project case study"
    },
    {
      "name": "doc-header",
      "owner": "project_detail",
      "purpose": "Theatrical header for the document"
    },
    {
      "name": "doc-content",
      "owner": "project_detail",
      "purpose": "Prose and markdown content wrapper"
    },
    {
      "name": "designs-root",
      "owner": "designs_index",
      "purpose": "Root container for visual designs"
    },
    {
      "name": "bento-gallery",
      "owner": "designs_index",
      "purpose": "Bento grid for visual design items"
    },
    {
      "name": "design-card",
      "owner": "design_item",
      "purpose": "Container for a single design preview"
    },
    {
      "name": "design-figure",
      "owner": "design_item",
      "purpose": "Image wrapper inside a design card"
    },
    {
      "name": "design-doc",
      "owner": "design_detail",
      "purpose": "Root container for design detail view"
    },
    {
      "name": "showcase-frame",
      "owner": "design_detail",
      "purpose": "Large viewport for design assets"
    },
    {
      "name": "page-root",
      "owner": "page",
      "purpose": "Standard text page container"
    },
    {
      "name": "page-body",
      "owner": "page",
      "purpose": "Content wrapper for standard pages"
    },
    {
      "name": "nav-link",
      "owner": "nav_item",
      "purpose": "Individual anchor tag in the navigation"
    }
  ],
  "layoutBlueprints": {
    "shell": {
      "rootClass": "shell-root",
      "composition": "Provides a dark, theatrical backdrop. Contains the global-nav which stacks vertically on mobile for large touch targets, expanding into a stark horizontal bar on desktop via min-width. Injects the main content via router outlet below the navigation."
    },
    "home": {
      "rootClass": "home-root",
      "composition": "Opens with hero-section applying the main theatrical clown imagery. Below, the spotlight-grid organizes featured capabilities into a dense, severe bento layout that reveals via scroll-driven spotlights."
    },
    "projects_index": {
      "rootClass": "projects-root",
      "composition": "Displays a strict masonry-list of technical systems. Single column on mobile, expanding to a native CSS masonry layout on desktop using grid-template-rows: masonry."
    },
    "designs_index": {
      "rootClass": "designs-root",
      "composition": "A visually aggressive bento-gallery of visual work. Items are tightly packed with 1px hairline gaps, utilizing object-fit to maintain strict geometric boundaries."
    },
    "project_detail": {
      "rootClass": "project-doc",
      "composition": "Begins with a doc-header establishing the technical context, followed by a single-column doc-content area optimized for reading. Images and code blocks span full width."
    },
    "design_detail": {
      "rootClass": "design-doc",
      "composition": "Centers the visual work in a massive showcase-frame spanning the full viewport, with technical rationale trailing below in a stark, legible format."
    },
    "page": {
      "rootClass": "page-root",
      "composition": "A minimal, austere reading environment. Centers page-body content with a strict max-width for line lengths, heavily utilizing text-wrap: pretty."
    },
    "project_item": {
      "rootClass": "project-card",
      "composition": "A severe rectangular card. Contains project-title in a dramatic serif and project-meta in an austere monospace. Hover states use :has() to dim siblings and illuminate the hovered card."
    },
    "design_item": {
      "rootClass": "design-card",
      "composition": "A container dominated by a design-figure. Metadata is hidden on mobile to maximize image space, revealing on desktop via kinetic hover states."
    },
    "nav_item": {
      "rootClass": "nav-link",
      "composition": "A stark, unadorned anchor link ensuring a minimum 44px hit area. Uses the crimson accent color on active/focus states."
    }
  }
}
```
