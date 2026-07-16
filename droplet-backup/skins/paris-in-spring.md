---
type: page
slug: "skin-paris-in-spring"
name: "Overcast Magnolia"
title: "Overcast Magnolia — Generated Skin"
description: "AI-generated skin: \"Paris in spring\""
timestamp: "2026-07-15T22:55:24.714Z"
sandbox_entry: "designs/paris-in-spring/index.html"
x_kind: "theme-skin"
x_year: "2026"
x_preview: "/designs/paris-in-spring/assets/hero.jpg"
x_logo: "/designs/paris-in-spring/gi-logo-transparent-dark.png"
x_link: "/designs/paris-in-spring/index.html"
---

--- tokens: color: bg-slate: 'oklch(22% 0.01 260)', bg-surface: 'oklch(28% 0.015 260)', text-limestone: 'oklch(95% 0.01 100)', accent-magnolia: 'oklch(70% 0.18 350)', border-iron: 'oklch(35% 0.01 260)' typography: display: '"Bodoni Moda", serif', body: '"Commissioner", sans-serif' spacing: section-y: 'clamp(64px, 10vw, 128px)', grid-gap: 'clamp(16px, 3vw, 32px)', shape: radius: '0px', border: '1px solid var(--border-iron)' --- This design strictly avoids the warm cream or neon cyber tropes. The visual identity of this AI engineering portfolio is rooted in a specific physical environment: Paris during a spring downpour. The interface functions as an austere ledger. We utilize Bodoni Moda to evoke high-end Parisian editorial design, grounding the technical subject matter in history and elegance. The complete absence of border radius mimics cut stone and forged iron. All structural dividers carry semantic meaning, mapping the technical data like an architectural schematic. The voice is dry, precise, and authoritative, letting the stark floral imagery provide the only emotional contrast.

## Locked Design Constitution

```json
{
  "name": "Overcast Magnolia",
  "accent": "Magnolia Pink",
  "signatureGesture": "A scroll-driven 'lifting fog' reveal. As the user scrolls down the page, elements utilize animation-timeline: view() and @starting-style to fade up from a lower opacity and slight physical depression, mimicking visibility cutting through a dense, overcast spring morning. Hover states on bento grid items trigger an OKLCH chroma shift on the borders, glowing faintly with magnolia pink while sibling elements dim via the :has() selector.",
  "mobileStrategy": "Mobile layout is the foundation, enforcing a rigid single-column flow with explicit vertical gaps. The navigation is entirely visible and wraps cleanly, utilizing strict 44px touch targets enforced by padding, not just element size. Grids expand to bento and masonry structures exclusively via min-width media queries at 768px and 1024px. Deep hierarchies in project details stack logically, keeping metadata chips bounded in flex-wrap containers to prevent horizontal collisions.",
  "imageTreatment": "Photography must strictly adhere to high-contrast, desaturated environments (rain, iron, slate, fog) with isolated, highly saturated elements of spring flora (cherry blossoms, magnolias, pale green buds). Strict Subject-Context-Style constraints must maintain this dualism. Images should have 0px border radius and sit flush against the 1px iron grid borders.",
  "tokens": {
    "colors": "bg-slate: oklch(22% 0.01 260), bg-surface: oklch(28% 0.015 260), text-limestone: oklch(95% 0.01 100), accent-magnolia: oklch(70% 0.18 350), border-iron: oklch(35% 0.01 260)",
    "typography": "display: 'Bodoni Moda', serif, body: 'Commissioner', sans-serif, weight-display: 400, weight-body: 300",
    "spacing": "xs: 0.5rem, sm: 1rem, md: 2rem, lg: 4rem, xl: 8rem, grid-gap: 1px, tap-target: 44px",
    "shape": "radius-none: 0px, border-thin: 1px solid oklch(35% 0.01 260)",
    "motion": "easing-fog: cubic-bezier(0.2, 0, 0, 1), duration-slow: 800ms, duration-snap: 150ms"
  },
  "classVocabulary": [
    {
      "name": "shell-root",
      "owner": "shell",
      "purpose": "Establishes the global layout wrapper and viewport boundaries"
    },
    {
      "name": "site-nav",
      "owner": "shell",
      "purpose": "Contains the global navigation links and brand marker"
    },
    {
      "name": "site-footer",
      "owner": "shell",
      "purpose": "Anchors the bottom of the page with contact and legal data"
    },
    {
      "name": "home-root",
      "owner": "home",
      "purpose": "Wraps the entire home page composition"
    },
    {
      "name": "hero-section",
      "owner": "home",
      "purpose": "Contains the main thesis statement and atmospheric background"
    },
    {
      "name": "featured-grid",
      "owner": "home",
      "purpose": "Bento grid container for highlighted work"
    },
    {
      "name": "projects-root",
      "owner": "projects_index",
      "purpose": "Wraps the project index list layout"
    },
    {
      "name": "projects-ledger",
      "owner": "projects_index",
      "purpose": "Architectural grid for listing technical repositories"
    },
    {
      "name": "designs-root",
      "owner": "designs_index",
      "purpose": "Wraps the visual design gallery"
    },
    {
      "name": "masonry-gallery",
      "owner": "designs_index",
      "purpose": "Native CSS masonry container for visual outputs"
    },
    {
      "name": "project-detail-root",
      "owner": "project_detail",
      "purpose": "Wraps the case study layout"
    },
    {
      "name": "project-header",
      "owner": "project_detail",
      "purpose": "Contains the title and metadata for the project"
    },
    {
      "name": "project-body",
      "owner": "project_detail",
      "purpose": "Contains the long-form text and technical markdown content"
    },
    {
      "name": "design-detail-root",
      "owner": "design_detail",
      "purpose": "Wraps the high-resolution design inspection layout"
    },
    {
      "name": "design-showcase",
      "owner": "design_detail",
      "purpose": "Presents the primary visual asset in an isolated frame"
    },
    {
      "name": "page-root",
      "owner": "page",
      "purpose": "Standard wrapper for generic text pages"
    },
    {
      "name": "page-content",
      "owner": "page",
      "purpose": "Constrains readable width for about and contact text"
    },
    {
      "name": "project-card",
      "owner": "project_item",
      "purpose": "Interactive surface for individual project previews"
    },
    {
      "name": "project-meta",
      "owner": "project_item",
      "purpose": "Flex container for taxonomy chips within a card"
    },
    {
      "name": "design-card",
      "owner": "design_item",
      "purpose": "Interactive surface for visual design previews"
    },
    {
      "name": "nav-link",
      "owner": "nav_item",
      "purpose": "Interactive anchor enforcing 44px tap targets"
    },
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
      "purpose": "Injected runtime class for navigational return links"
    },
    {
      "name": "btn",
      "owner": "css",
      "purpose": "Injected runtime class for primary actions"
    },
    {
      "name": "md-img",
      "owner": "css",
      "purpose": "Injected runtime class for bounding markdown imagery"
    }
  ],
  "layoutBlueprints": {
    "shell": {
      "rootClass": "shell-root",
      "composition": "A persistent, structural outer frame. The site-nav sits flush at the top with a 1px border-bottom, acting as an architectural header. The site-footer mirrors this at the bottom. The main content area sits between them, utilizing min-height: 100dvh."
    },
    "home": {
      "rootClass": "home-root",
      "composition": "Opens with the hero-section occupying 80vh, displaying the macro botanical background and a massive Bodoni Moda headline. Followed by the featured-grid, a dense bento layout applying strict 1px gaps."
    },
    "projects_index": {
      "rootClass": "projects-root",
      "composition": "A single-column architectural ledger (projects-ledger) that maps each item to a strict horizontal row. Border-top on each row creates a continuous tabular aesthetic."
    },
    "designs_index": {
      "rootClass": "designs-root",
      "composition": "Utilizes the masonry-gallery to pack variable-height design-card elements tightly. Governed by native CSS grid masonry where supported, falling back to standard grid tracks."
    },
    "project_detail": {
      "rootClass": "project-detail-root",
      "composition": "The project-header establishes the hierarchy with massive type and a flex-wrap row for metadata. The project-body strictly constrains text to 65ch to prevent multi-column collision, ensuring pristine reading ergonomics."
    },
    "design_detail": {
      "rootClass": "design-detail-root",
      "composition": "Centers the design-showcase in an expansive, minimally decorated frame. Uses deep slate margins to let the artwork breathe, with metadata pushed to the absolute bottom edge."
    },
    "page": {
      "rootClass": "page-root",
      "composition": "A refined reading environment. The page-content container is centrally aligned, utilizing generous clamp spacing and strict max-widths to maintain an editorial column feel."
    },
    "project_item": {
      "rootClass": "project-card",
      "composition": "A surface acting as a bento tile or ledger row. Contains a bold title, a brief abstract, and the project-meta container for badges. Uses :has() on the parent to dim non-hovered cards."
    },
    "design_item": {
      "rootClass": "design-card",
      "composition": "An image-first container. The image fills the track completely, with a thin 1px overlay border. Hovering triggers a kinetic color shift on the border and reveals a minimal label."
    },
    "nav_item": {
      "rootClass": "nav-link",
      "composition": "A discrete typography element. Employs padding to guarantee a 44px touch target on mobile without disrupting the austere visual alignment."
    }
  }
}
```
