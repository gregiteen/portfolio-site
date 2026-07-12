---
type: page
slug: "skin-20s-flapper"
name: "Brutalist Deco"
title: "Brutalist Deco — Generated Skin"
description: "AI-generated skin: \"20S FLAPPER\""
timestamp: "2026-07-12T10:41:56.063Z"
sandbox_entry: "designs/20s-flapper/index.html"
x_kind: "theme-skin"
x_year: "2026"
x_preview: "/designs/20s-flapper/assets/hero.jpg"
x_logo: "/designs/20s-flapper/gi-logo-transparent-dark.png"
x_link: "/designs/20s-flapper/index.html"
---

tokens: color: bg: oklch(15% 0.02 85) text: oklch(90% 0.02 85) accent: oklch(75% 0.15 85) typography: display: 'Antonio', sans-serif body: 'JetBrains Mono', monospace spacing: section_y: clamp(60px, 8vw, 120px) grid_gap: 1px layout: max_width: 1440px border_radius: 0px

## Locked Design Constitution

```json
{
  "name": "Brutalist Deco",
  "accent": "oklch(75% 0.15 85)",
  "signatureGesture": "Mechanical Brass Drawer: Hovering over metadata or badges triggers a native anchor-positioned top-layer element that slides out horizontally with a distinct, rigid easing curve, revealing secondary technical details like an antique cash register or filing cabinet.",
  "mobileStrategy": "Single-column bento stacking with rigid 1px brass borders separating all modules. Touch targets are strictly inflated via internal padding to a minimum of 44px. Navigation remains a visible, wrap-friendly typographic list at the top of the shell, avoiding hidden hamburger menus. Expansion to multi-column bento grids occurs exclusively via min-width media queries.",
  "imageTreatment": "Deep monochrome or sepia-toned with high-contrast, metallic specular highlights. SVG turbulence filters applied via CSS data URIs will provide a subtle, tactile film grain over all images, grounding them in the 1920s era.",
  "tokens": {
    "colors": "bg: oklch(15% 0.02 85), text: oklch(90% 0.02 85), accent: oklch(75% 0.15 85), surface: oklch(20% 0.02 85), rule: oklch(40% 0.05 85)",
    "typography": "display: 'Antonio', 'Oswald', sans-serif, body: 'JetBrains Mono', monospace, scale: fluid clamp from 14px to 120px",
    "spacing": "xs: 4px, sm: 8px, md: 16px, lg: 32px, xl: 64px, touch: 44px minimum",
    "shape": "radius: 0px (strict brutalist corners), border: 1px solid var(--rule), nested inner frames: 1px solid var(--accent)",
    "motion": "easing: cubic-bezier(0.76, 0, 0.24, 1) (mechanical snap), duration: 400ms, scroll-timeline: view() entry 10% cover 30%"
  },
  "classVocabulary": [
    {
      "name": "deco-shell",
      "owner": "shell",
      "purpose": "Main layout wrapper with 1px geometric borders"
    },
    {
      "name": "deco-nav",
      "owner": "shell",
      "purpose": "Top navigation container"
    },
    {
      "name": "nav-list",
      "owner": "shell",
      "purpose": "Flex container for navigation items"
    },
    {
      "name": "nav-item-link",
      "owner": "nav_item",
      "purpose": "Interactive link with 44px touch target"
    },
    {
      "name": "deco-hero",
      "owner": "home",
      "purpose": "Hero container with background image injection"
    },
    {
      "name": "hero-title",
      "owner": "home",
      "purpose": "Ultra-condensed display typography"
    },
    {
      "name": "hero-marquee",
      "owner": "home",
      "purpose": "Scrolling technical ticker"
    },
    {
      "name": "bento-grid",
      "owner": "home",
      "purpose": "Native grid container with 1px gaps"
    },
    {
      "name": "bento-cell",
      "owner": "home",
      "purpose": "Individual bento card with inner frame"
    },
    {
      "name": "projects-grid",
      "owner": "projects_index",
      "purpose": "Grid lanes layout for index"
    },
    {
      "name": "project-card",
      "owner": "project_item",
      "purpose": "Container for individual project"
    },
    {
      "name": "project-title",
      "owner": "project_item",
      "purpose": "Project heading"
    },
    {
      "name": "designs-masonry",
      "owner": "designs_index",
      "purpose": "Native masonry grid for visual work"
    },
    {
      "name": "design-card",
      "owner": "design_item",
      "purpose": "Wrapper for visual design items"
    },
    {
      "name": "design-visual",
      "owner": "design_item",
      "purpose": "Image container with SVG grain overlay"
    },
    {
      "name": "detail-header",
      "owner": "project_detail",
      "purpose": "Project detail typographic intro"
    },
    {
      "name": "detail-body",
      "owner": "project_detail",
      "purpose": "Markdown content container for projects"
    },
    {
      "name": "visual-header",
      "owner": "design_detail",
      "purpose": "Design detail title area"
    },
    {
      "name": "visual-body",
      "owner": "design_detail",
      "purpose": "Full-bleed visual asset container"
    },
    {
      "name": "page-layout",
      "owner": "page",
      "purpose": "Standard page structural wrapper"
    },
    {
      "name": "page-content",
      "owner": "page",
      "purpose": "Text-heavy page content formatting"
    },
    {
      "name": "badge",
      "owner": "css",
      "purpose": "Injected metadata pill with brass styling"
    },
    {
      "name": "src",
      "owner": "css",
      "purpose": "Injected source code link styling"
    },
    {
      "name": "backlink",
      "owner": "css",
      "purpose": "Injected contextual return link"
    },
    {
      "name": "btn",
      "owner": "css",
      "purpose": "Injected standard action button"
    },
    {
      "name": "md-img",
      "owner": "css",
      "purpose": "Injected markdown image formatting"
    },
    {
      "name": "brass-rule",
      "owner": "css",
      "purpose": "1px horizontal separator"
    },
    {
      "name": "deco-frame",
      "owner": "css",
      "purpose": "Nested concentric border utility"
    },
    {
      "name": "tarnished-bg",
      "owner": "css",
      "purpose": "Dark background utility with noise"
    },
    {
      "name": "radium-text",
      "owner": "css",
      "purpose": "Highlight text color utility"
    }
  ],
  "layoutBlueprints": {
    "shell": {
      "rootClass": "deco-shell",
      "composition": "A rigid, full-viewport container featuring a concentric 1px brass border setup. The deco-nav sits at the very top, flowing naturally into a wrap-friendly nav-list. Global chrome uses strict physical bounds with no overlapping absolute positioning. Touch targets are preserved on mobile."
    },
    "home": {
      "rootClass": "deco-hero",
      "composition": "The deco-hero occupies the top viewport segment, carrying the background-image URL and overlaid with hero-title typography. Below the hero, a bento-grid organizes featured capabilities and projects into strict geometric bento-cells, utilizing CSS subgrid to align interior data seamlessly across the parent tracks."
    },
    "projects_index": {
      "rootClass": "projects-grid",
      "composition": "A disciplined grid layout relying on minmax columns to flow project items. Uses scroll-driven entry animations to reveal each track sequentially. The layout is bounded by deco-frame utilities to maintain the architectural 1920s aesthetic."
    },
    "designs_index": {
      "rootClass": "designs-masonry",
      "composition": "Utilizes native CSS masonry (with fallback grid lanes) to tightly pack visual assets. Images are treated with SVG turbulence filters to feel tactile and printed, avoiding modern glossy web aesthetics. Minimal textual chrome, letting the visuals dominate."
    },
    "project_detail": {
      "rootClass": "detail-header",
      "composition": "Opens with a massive, ultra-condensed typographic lockup detailing the system architecture. Transitions into the detail-body, which strictly bounds markdown content, code snippets, and md-img tags within a central, highly readable column framed by brass-rules."
    },
    "design_detail": {
      "rootClass": "visual-header",
      "composition": "A stark visual-header provides context via geometric typography, leading directly into a massive, edge-to-edge visual-body container. The layout emphasizes the artifact itself, using mechanical easing for any interactive panning or zooming."
    },
    "page": {
      "rootClass": "page-layout",
      "composition": "A single-column page-layout utilizing text-wrap: pretty for the page-content. Designed for austere, business-focused text like About or Contact. Uses inset deco-frames to block out different sections of copy without relying on generic whitespace alone."
    },
    "project_item": {
      "rootClass": "project-card",
      "composition": "An interactive block representing a single technical project. Contains a project-title and metadata. Uses :has() to dim sibling project-cards when one is hovered, focusing the user's attention. Structured with internal 1px borders."
    },
    "design_item": {
      "rootClass": "design-card",
      "composition": "A tactile container for a visual preview. The design-visual houses the image, while the surrounding card provides a strict geometric frame. Hovering triggers a compositor-thread scale animation on the inner image, constrained strictly by the parent's overflow."
    },
    "nav_item": {
      "rootClass": "nav-item-link",
      "composition": "A purely functional typographic link inside the global navigation. Enforces a strict 44px minimum touch area via padding. Active states are indicated by an underline that animates in using a mechanical, zero-delay step function rather than a smooth slide."
    }
  }
}
```
