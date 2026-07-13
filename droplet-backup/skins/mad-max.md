---
type: page
slug: "skin-mad-max"
name: "Scorched Earth Engineering"
title: "Scorched Earth Engineering — Generated Skin"
description: "AI-generated skin: \"MAD MAX\""
timestamp: "2026-07-12T22:29:20.762Z"
sandbox_entry: "designs/mad-max/index.html"
x_kind: "theme-skin"
x_year: "2026"
x_preview: "/designs/mad-max/assets/hero.jpg"
x_logo: "/designs/mad-max/gi-logo-transparent-dark.png"
x_link: "/designs/mad-max/index.html"
---

---
name: Scorched Earth Engineering
description: A high-end, post-apocalyptic technical visual system for an AI engineer, blending scavenged mechanics with precision layout.
tokens:
  color:
    bg: 'oklch(20% 0.02 45)'
    surface: 'oklch(25% 0.03 40)'
    text: 'oklch(90% 0.05 85)'
    accent: 'oklch(65% 0.22 35)'
    border: 'oklch(35% 0.05 45)'
  typography:
    display: '"Anton", "Oswald", sans-serif'
    body: '"JetBrains Mono", "IBM Plex Mono", monospace'
  spacing:
    gap: 'clamp(1rem, 2vw, 2rem)'
    section: 'clamp(4rem, 10vw, 8rem)'
  shape:
    radius: '0px'
    border_width: '2px'
---

# Scorched Earth Engineering

## Thematic Integration
This design approaches the portfolio of an AI systems engineer through the lens of a high-octane, post-apocalyptic wasteland. The engineer is not a generic developer, but a mechanic building complex, locally-run AI engines from raw parts. The aesthetic is serious, industrial, and high-performance. 

## Typography & Layout
The typographic scale uses an extremely condensed, aggressive display font for headings, providing the structural weight of engine blocks. This is paired with a strictly monospaced body font to retain the technical reality of the work. The layout avoids brutalist chaos by enforcing a rigid, high-end editorial bento grid, mimicking an expertly engineered survival rig where every component has a critical function.

## Motion & Physicality
Motion is tied directly to scroll velocity using native CSS animation timelines, creating a sense of forward momentum. Components enter the viewport with a slight scale and opacity shift, resembling dust clearing from a landscape. Borders are sharp and heavy, avoiding soft radii to project a hardened, scavenged aesthetic.

## Locked Design Constitution

```json
{
  "name": "Scorched Earth Engineering",
  "accent": "oklch(65% 0.22 35)",
  "signatureGesture": "Scroll-driven 'Velocity Throttle': As the user scrolls down, section headers dynamically skew and scale up slightly, linked directly to the scrollbar's physical pixel offset via animation-timeline: view(), simulating the acceleration of a high-powered engine.",
  "mobileStrategy": "The mobile architecture relies on a single-column, strictly linear bento grid. The navigation is a persistent, wrap-enabled mechanical dashboard locked to the bottom of the screen on mobile for optimal thumb reach (touch targets > 44px), scaling to a top-anchored alignment on desktop.",
  "imageTreatment": "Desaturated base imagery with a harsh, high-contrast curve. Applied natively via CSS filters: sepia(30%) contrast(120%) saturate(70%), simulating the harsh sun and dust of a post-apocalyptic wasteland.",
  "tokens": {
    "colors": "Base: oklch(20% 0.02 45) [Asphalt Ash], Surface: oklch(25% 0.03 40) [Oxidized Metal], Text: oklch(90% 0.05 85) [Bleached Bone], Accent: oklch(65% 0.22 35) [Rusted Chrome], Border: oklch(35% 0.05 45) [Scorched Steel]",
    "typography": "Display: 'Anton' or 'Oswald' (Heavily condensed, uppercase, tracking-tight). Body: 'JetBrains Mono' (Mechanical, precise, tabular lining).",
    "spacing": "Base unit: 0.5rem. Grid gaps scale fluidly: clamp(1rem, 2vw, 2rem). Dense padding for internal card content to reflect scavenged efficiency.",
    "shape": "Zero border-radius. Absolute sharp corners. Borders are consistently 2px solid Scorched Steel, giving elements a bolted-together weight.",
    "motion": "Compositor-thread entry animations using @starting-style. Scroll-driven timelines for subtle parallax and reveal mechanics. No JS layout shifts."
  },
  "classVocabulary": [
    {
      "name": "app-shell",
      "owner": "shell",
      "purpose": "Root layout container maintaining the global mechanical structure"
    },
    {
      "name": "nav-bar",
      "owner": "shell",
      "purpose": "Global navigation dashboard containing all routing links"
    },
    {
      "name": "site-footer",
      "owner": "shell",
      "purpose": "Global footer for baseline technical metadata"
    },
    {
      "name": "nav-item-wrap",
      "owner": "nav_item",
      "purpose": "Wrapper for individual navigation links enforcing touch target size"
    },
    {
      "name": "nav-link",
      "owner": "nav_item",
      "purpose": "Interactive routing text with kinetic hover state"
    },
    {
      "name": "hero-section",
      "owner": "home",
      "purpose": "Primary landing viewport establishing the engine and wasteland thesis"
    },
    {
      "name": "hero-title",
      "owner": "home",
      "purpose": "Massive, condensed typographic lockup for the engineer's name"
    },
    {
      "name": "feature-grid",
      "owner": "home",
      "purpose": "Bento grid for highlighted systems and technical achievements"
    },
    {
      "name": "project-feed",
      "owner": "projects_index",
      "purpose": "Masonry container for the archive of engineered systems"
    },
    {
      "name": "project-card",
      "owner": "project_item",
      "purpose": "Individual bento container for a project overview"
    },
    {
      "name": "project-title",
      "owner": "project_item",
      "purpose": "Condensed heading for the project name"
    },
    {
      "name": "project-meta",
      "owner": "project_item",
      "purpose": "Monospaced technical specifications and tooling data"
    },
    {
      "name": "design-feed",
      "owner": "designs_index",
      "purpose": "Grid lanes layout for visual architectural diagrams"
    },
    {
      "name": "design-card",
      "owner": "design_item",
      "purpose": "Framed container for visual design artifacts"
    },
    {
      "name": "design-media",
      "owner": "design_item",
      "purpose": "Image wrapper applying the harsh wasteland filter treatment"
    },
    {
      "name": "detail-header",
      "owner": "project_detail",
      "purpose": "Full-width structural header for project specifications"
    },
    {
      "name": "detail-body",
      "owner": "project_detail",
      "purpose": "Constrained reading column for linear technical documentation"
    },
    {
      "name": "design-detail-view",
      "owner": "design_detail",
      "purpose": "Immersive, edge-to-edge layout for reviewing visual schematics"
    },
    {
      "name": "page-container",
      "owner": "page",
      "purpose": "Standardized wrapper for generic content pages"
    },
    {
      "name": "page-content",
      "owner": "page",
      "purpose": "Flow container for linear text and markdown elements"
    },
    {
      "name": "badge",
      "owner": "css",
      "purpose": "Injected component: pill-shaped technical marker in rusted chrome"
    },
    {
      "name": "src",
      "owner": "css",
      "purpose": "Injected component: raw monospaced source code display"
    },
    {
      "name": "backlink",
      "owner": "css",
      "purpose": "Injected component: return navigation with mechanical arrow"
    },
    {
      "name": "btn",
      "owner": "css",
      "purpose": "Injected component: solid, sharp-edged interactive trigger"
    },
    {
      "name": "md-img",
      "owner": "css",
      "purpose": "Injected component: markdown image wrapped in heavy steel borders"
    },
    {
      "name": "section-header",
      "owner": "css",
      "purpose": "Global utility for dividing distinct functional areas"
    }
  ],
  "layoutBlueprints": {
    "shell": {
      "rootClass": "app-shell",
      "composition": "The outer hull of the application. Renders a persistent `nav-bar` containing navigation links at the top on desktop, moving to a safe-area anchored bottom bar on mobile. Encapsulates the main document flow and a minimal `site-footer` for baseline system status."
    },
    "home": {
      "rootClass": "hero-section",
      "composition": "Opens with `hero-section` displaying a massive `hero-title` over a generative wasteland engine background. Followed by a tightly packed `feature-grid` (Bento layout) highlighting recent project cards and technical specs, driven by scroll-linked velocity animations."
    },
    "projects_index": {
      "rootClass": "project-feed",
      "composition": "A strictly mathematical Native Masonry `project-feed` where all items align to fluid grid lanes. Features a `section-header` defining the archive scope. Items are sequenced with entry-range view timelines."
    },
    "designs_index": {
      "rootClass": "design-feed",
      "composition": "A dense grid layout maximizing visual density. `design-card` elements are locked into subgrid rows to ensure metadata and heavy `design-media` borders align perfectly across the horizontal axis."
    },
    "project_detail": {
      "rootClass": "detail-header",
      "composition": "A highly structural documentation view. Begins with a `detail-header` containing the title and `badge` metadata. Transitions into a single-column `detail-body` restricted to a maximum width to prevent text collision, displaying `md-img` and `src` with sharp, bolted borders."
    },
    "design_detail": {
      "rootClass": "design-detail-view",
      "composition": "An immersive review interface. The media is expanded to near edge-to-edge bounds with extreme contrast applied. Technical metadata is stacked neatly in a monospace grid directly below or alongside the artifact."
    },
    "page": {
      "rootClass": "page-container",
      "composition": "A utilitarian layout for standard text (About, Contact). Uses `page-content` to enforce a linear, readable flow with fluid typography, avoiding multi-column complexities. Text wrap is set to pretty for optimal reading."
    },
    "project_item": {
      "rootClass": "project-card",
      "composition": "A sharp-edged bento fragment. Contains a condensed `project-title` and a monospaced `project-meta` block. Hover states trigger kinetic text weight shifts and a subtle translation effect simulating mechanical engagement."
    },
    "design_item": {
      "rootClass": "design-card",
      "composition": "A sturdy frame holding `design-media`. The image treatment enforces the desaturated wasteland look. Interaction causes the border color to heat up to the rusted chrome accent color via OKLCH interpolation."
    },
    "nav_item": {
      "rootClass": "nav-item-wrap",
      "composition": "A structural wrapper ensuring a minimum 44x44px touch area. Contains the `nav-link` which features a monospace mechanical label. When active or hovered, uses relational DOM state (:has) to dim sibling navigation items."
    }
  }
}
```
