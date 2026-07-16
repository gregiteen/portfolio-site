---
type: page
slug: "skin-olde-time-country"
name: "Mercantile Ledger"
title: "Mercantile Ledger — Generated Skin"
description: "AI-generated skin: \"OLDE TIME COUNTRY\""
timestamp: "2026-07-15T22:51:55.078Z"
sandbox_entry: "designs/olde-time-country/index.html"
x_kind: "theme-skin"
x_year: "2026"
x_preview: "/designs/olde-time-country/assets/hero.jpg"
x_logo: "/designs/olde-time-country/gi-logo-transparent-dark.png"
x_link: "/designs/olde-time-country/index.html"
---

A high-end technical portfolio themed as an 1890s general store ledger. The design is highly structured, relying on strict CSS grids with visible 1px borders to mimic ruled paper. Copy is dry, precise, and authoritative. NO emojis, NO buzzwords. We treat the digital products as physical inventory cataloged in a historical archive. The aesthetic relies on tactile materiality achieved through CSS SVG noise filters and vintage typography.

## Locked Design Constitution

```json
{
  "name": "Mercantile Ledger",
  "accent": "Tobacco Red",
  "signatureGesture": "Scroll-driven 'ink stamp' reveals. As the user scrolls, badges, dates, and project metadata are animated via animation-timeline: view(), scaling down and fading in abruptly as if being stamped onto the ledger page by a heavy mercantile stamp.",
  "mobileStrategy": "Mobile-first single-column ledger rows. Content is stacked vertically with continuous horizontal borders. Interactive touch targets are artificially inflated to 44px using padding within the ledger cells. Navigation wraps naturally without hiding behind a hamburger menu.",
  "imageTreatment": "Cabinet Card aesthetic. Images are constrained within stiff, border-heavy containers with a slight sepia filter (sepia(0.4) contrast(1.1)) and a faint inner shadow to mimic aged, thick cardboard photographs.",
  "tokens": {
    "colors": "--bg: oklch(92% 0.02 85); --text: oklch(25% 0.02 85); --accent: oklch(45% 0.15 30); --line: oklch(80% 0.02 85); --glass: oklch(92% 0.02 85 / 0.8);",
    "typography": "--font-display: 'Vast Shadow', serif; --font-body: 'Cutive Mono', monospace; font-synthesis: none; text-rendering: optimizeLegibility;",
    "spacing": "--gap-sm: 0.5rem; --gap-md: 1.5rem; --gap-lg: 3rem; --tap-target: 44px;",
    "shape": "--radius: 4px; --border: 1px solid var(--line); --border-thick: 3px solid var(--text);",
    "motion": "--easing: cubic-bezier(0.25, 1, 0.5, 1); --stamp-duration: 0.3s;"
  },
  "classVocabulary": [
    {
      "name": "app-shell",
      "owner": "shell",
      "purpose": "Main layout wrapper and texture provider"
    },
    {
      "name": "ledger-nav",
      "owner": "shell",
      "purpose": "Global navigation constrained by ruled lines"
    },
    {
      "name": "ledger-hero",
      "owner": "home",
      "purpose": "Home page hero section with cabinet card background"
    },
    {
      "name": "inventory-grid",
      "owner": "home",
      "purpose": "Bento grid for featured projects"
    },
    {
      "name": "archive-index",
      "owner": "projects_index",
      "purpose": "Root layout for the projects archive"
    },
    {
      "name": "visual-index",
      "owner": "designs_index",
      "purpose": "Root layout for the design archive"
    },
    {
      "name": "dossier-root",
      "owner": "project_detail",
      "purpose": "Root layout for detailed project dossiers"
    },
    {
      "name": "blueprint-root",
      "owner": "design_detail",
      "purpose": "Root layout for detailed design blueprints"
    },
    {
      "name": "document-root",
      "owner": "page",
      "purpose": "Root layout for standard text pages"
    },
    {
      "name": "ledger-entry",
      "owner": "project_item",
      "purpose": "Individual project list item resembling a ledger row"
    },
    {
      "name": "cabinet-card",
      "owner": "design_item",
      "purpose": "Individual design list item resembling a vintage photo"
    },
    {
      "name": "nav-link",
      "owner": "nav_item",
      "purpose": "Navigation anchor with 44px touch target"
    },
    {
      "name": "badge",
      "owner": "css",
      "purpose": "Injected metadata tag styled like an ink stamp"
    },
    {
      "name": "src",
      "owner": "css",
      "purpose": "Injected image source class"
    },
    {
      "name": "backlink",
      "owner": "css",
      "purpose": "Injected return link styled as a ledger reference"
    },
    {
      "name": "btn",
      "owner": "css",
      "purpose": "Injected button styled as a mercantile label"
    },
    {
      "name": "md-img",
      "owner": "css",
      "purpose": "Injected markdown image with sepia treatment"
    },
    {
      "name": "typewriter-text",
      "owner": "css",
      "purpose": "Monospace typography utility"
    },
    {
      "name": "ruled-container",
      "owner": "css",
      "purpose": "Container with strict borders and subgrid alignment"
    },
    {
      "name": "stamp-reveal",
      "owner": "css",
      "purpose": "Scroll-driven animation utility class"
    },
    {
      "name": "hero-title",
      "owner": "css",
      "purpose": "Display typography for main headings"
    },
    {
      "name": "meta-data",
      "owner": "css",
      "purpose": "Small technical text for dates and roles"
    },
    {
      "name": "ink-block",
      "owner": "css",
      "purpose": "High contrast inverted block for emphasis"
    },
    {
      "name": "dust-overlay",
      "owner": "css",
      "purpose": "SVG noise filter utility"
    }
  ],
  "layoutBlueprints": {
    "shell": {
      "rootClass": "app-shell",
      "composition": "A full-viewport container with a fixed SVG noise overlay. The ledger-nav spans the top edge with a thick bottom border, housing flex-wrapped nav-links. The main content area sits below, constrained by a max-width and centered."
    },
    "home": {
      "rootClass": "ledger-hero",
      "composition": "A massive header region featuring the background-image hero asset, heavily tinted with a dark scrim to ensure text legibility. Contains a hero-title and typewriter-text introduction. Followed by the inventory-grid utilizing native CSS grid-lanes to display featured project-items."
    },
    "projects_index": {
      "rootClass": "archive-index",
      "composition": "A stacked, single-column list of ledger-entry elements. Each entry acts as a subgrid row, aligning the title, date, and badges precisely across vertical ruled lines."
    },
    "designs_index": {
      "rootClass": "visual-index",
      "composition": "A native masonry or bento grid of cabinet-card items. Thick borders separate the items, and images use the md-img class for vintage filtering."
    },
    "project_detail": {
      "rootClass": "dossier-root",
      "composition": "Opens with an ink-block header containing the project title and meta-data badges. The main body uses a ruled-container with max-width text-wrap: pretty constraints for readable typewriter-text paragraphs."
    },
    "design_detail": {
      "rootClass": "blueprint-root",
      "composition": "A large immersive view of the design asset using md-img, followed by a strict two-column grid (on desktop) detailing the specifications and context in typewriter-text."
    },
    "page": {
      "rootClass": "document-root",
      "composition": "A simple, centralized ruled-container for standard markdown content like the About or Contact pages, mimicking a typed letter on general store stationery."
    },
    "project_item": {
      "rootClass": "ledger-entry",
      "composition": "A horizontal flex or subgrid row containing the project title, a stamp-reveal badge, and a brief typewriter-text description. Borders divide each row."
    },
    "design_item": {
      "rootClass": "cabinet-card",
      "composition": "A vertically stacked card with a thick border, containing a constrained md-img and a small meta-data caption bar below it."
    },
    "nav_item": {
      "rootClass": "nav-link",
      "composition": "A simple anchor element with explicit 44px minimum height padding and typewriter-text styling. Displays a kinetic hover effect that underlines the text with a thick tobacco-red line."
    }
  }
}
```
