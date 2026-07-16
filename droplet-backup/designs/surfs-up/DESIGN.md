---
name: "Fiberglass & Resin"
accent: "#888888"
style: "SURFS UP"
constitution_version: "2"
token_colors: "--bg: oklch(20% 0.05 250); --text: oklch(95% 0.02 220); --accent: oklch(65% 0.2 45); --surface: oklch(25% 0.04 250); --resin: oklch(30% 0.06 250 / 0.5);"
token_typography: "--font-display: 'Teko', sans-serif; --font-body: 'Kumbh Sans', sans-serif;"
token_spacing: "--gap-sm: clamp(12px, 2vw, 16px); --gap-md: clamp(24px, 4vw, 32px); --gap-lg: clamp(48px, 8vw, 80px);"
signature_gesture: "Fluid, scroll-driven staggered cascades where project cards and design items rise into the viewport like swelling waves, controlled entirely by native CSS animation-timeline tied to the scroll position, ensuring zero JavaScript main-thread blocking."
---

# Design System

A high-end, highly polished technical architecture bridging hydrodynamic surfboard manufacturing and file-native AI engineering. The aesthetic relies on deep ocean hues, glossy translucent 'resin' card treatments, and sharp, athletic typography. The layout is strictly mobile-first, utilizing native bento grids and masonry structures with high-visibility accents to highlight critical data and interaction points. Copy is austere, precise, and authoritative, avoiding all marketing buzzwords.

## Locked Design Constitution

```json
{
  "name": "Fiberglass & Resin",
  "accent": "Safety Orange",
  "signatureGesture": "Fluid, scroll-driven staggered cascades where project cards and design items rise into the viewport like swelling waves, controlled entirely by native CSS animation-timeline tied to the scroll position, ensuring zero JavaScript main-thread blocking.",
  "mobileStrategy": "A rigorous mobile-first architecture where the global navigation remains visible but wraps cleanly into a compact horizontal scroll or stacked layout at narrow widths. All interactive areas enforce a strict 44px minimum touch target. Complex bento grids collapse to a single-column linear flow on mobile, expanding dynamically via min-width media queries.",
  "imageTreatment": "Photography and generative assets will feature stark, high-contrast ocean environments, technical surfboard components, and deep blue tonal overlays. Images will be framed within sharp, precision-cut containers with 1px translucent borders mimicking fiberglass layups.",
  "tokens": {
    "colors": "--bg: oklch(20% 0.05 250); --text: oklch(95% 0.02 220); --accent: oklch(65% 0.2 45); --surface: oklch(25% 0.04 250); --resin: oklch(30% 0.06 250 / 0.5);",
    "typography": "--font-display: 'Teko', sans-serif; --font-body: 'Kumbh Sans', sans-serif;",
    "spacing": "--gap-sm: clamp(12px, 2vw, 16px); --gap-md: clamp(24px, 4vw, 32px); --gap-lg: clamp(48px, 8vw, 80px);",
    "shape": "--radius-base: 0px; --border-resin: 1px solid oklch(95% 0.02 220 / 0.1);",
    "motion": "--transition-fluid: all 0.4s cubic-bezier(0.25, 1, 0.5, 1); --timeline-wave: view() entry 10% cover 30%;"
  },
  "classVocabulary": [
    {
      "name": "site-shell",
      "owner": "shell",
      "purpose": "Root container managing global page structure and background."
    },
    {
      "name": "global-nav",
      "owner": "shell",
      "purpose": "Primary navigation bar, explicitly visible and mobile-responsive."
    },
    {
      "name": "nav-element",
      "owner": "nav_item",
      "purpose": "Individual interactive navigation link with 44px touch target."
    },
    {
      "name": "home-layout",
      "owner": "home",
      "purpose": "Main container for the homepage layout and structural flow."
    },
    {
      "name": "hero-section",
      "owner": "home",
      "purpose": "Primary landing region, holds the required background-image hero asset."
    },
    {
      "name": "featured-grid",
      "owner": "home",
      "purpose": "Bento-style layout grid for highlighting key projects."
    },
    {
      "name": "projects-layout",
      "owner": "projects_index",
      "purpose": "Root container for the projects index view."
    },
    {
      "name": "projects-ledger",
      "owner": "projects_index",
      "purpose": "Linear tabular layout for listing detailed project items."
    },
    {
      "name": "project-item-card",
      "owner": "project_item",
      "purpose": "Individual project container within index or featured lists."
    },
    {
      "name": "project-item-meta",
      "owner": "project_item",
      "purpose": "Container for technical tags, dates, and metadata."
    },
    {
      "name": "designs-layout",
      "owner": "designs_index",
      "purpose": "Root container for the visual designs index view."
    },
    {
      "name": "masonry-layout",
      "owner": "designs_index",
      "purpose": "Native CSS masonry container for visual work previews."
    },
    {
      "name": "design-item-card",
      "owner": "design_item",
      "purpose": "Container for a single design preview image and its metadata."
    },
    {
      "name": "design-item-media",
      "owner": "design_item",
      "purpose": "Image wrapper inside the design card."
    },
    {
      "name": "project-detail-layout",
      "owner": "project_detail",
      "purpose": "Root container for the individual project deep-dive page."
    },
    {
      "name": "project-detail-hero",
      "owner": "project_detail",
      "purpose": "Top-level header and thesis statement for a project."
    },
    {
      "name": "project-detail-body",
      "owner": "project_detail",
      "purpose": "Main content and markdown container for project specifics."
    },
    {
      "name": "design-detail-layout",
      "owner": "design_detail",
      "purpose": "Root container for the individual design detail page."
    },
    {
      "name": "design-detail-media",
      "owner": "design_detail",
      "purpose": "Full-bleed presentation container for the design artwork."
    },
    {
      "name": "page-layout",
      "owner": "page",
      "purpose": "Root container for generic markdown pages like about or contact."
    },
    {
      "name": "badge",
      "owner": "css",
      "purpose": "Injected runtime class for small metadata tags."
    },
    {
      "name": "src",
      "owner": "css",
      "purpose": "Injected runtime class for code blocks or source references."
    },
    {
      "name": "backlink",
      "owner": "css",
      "purpose": "Injected runtime class for navigational return links."
    },
    {
      "name": "btn",
      "owner": "css",
      "purpose": "Injected runtime class for interactive action buttons."
    },
    {
      "name": "md-img",
      "owner": "css",
      "purpose": "Injected runtime class for markdown-generated imagery."
    }
  ],
  "layoutBlueprints": {
    "shell": {
      "rootClass": "site-shell",
      "composition": "A high-level grid spanning 100vh with a top-mounted global-nav. The nav enforces horizontal visibility without hidden menus. Main content is injected into a lower fluid track. The background utilizes the deep OKLCH blue."
    },
    "home": {
      "rootClass": "home-layout",
      "composition": "Starts with the hero-section occupying significant viewport height, applying the mandatory background-image to showcase crashing waves. Followed by the featured-grid using native bento box subgrids to display top-tier AI systems."
    },
    "projects_index": {
      "rootClass": "projects-layout",
      "composition": "A single-column vertical flow dominating the page width. Houses the projects-ledger which enforces strict typographic alignment and spacing between project cards for high-density reading."
    },
    "designs_index": {
      "rootClass": "designs-layout",
      "composition": "Utilizes the masonry-layout class invoking native display: grid-lanes to tightly pack design-item-cards. Images govern the row height while columns remain strictly proportional."
    },
    "project_detail": {
      "rootClass": "project-detail-layout",
      "composition": "A two-part vertical stack. The project-detail-hero provides a massive typographic entry point setting the technical context. The project-detail-body is a narrow, centered reading column optimized for technical markdown comprehension."
    },
    "design_detail": {
      "rootClass": "design-detail-layout",
      "composition": "Focuses entirely on visual impact. The design-detail-media pushes the artwork to maximum viewport boundaries, with metadata strictly contained below to prevent collision with the imagery."
    },
    "page": {
      "rootClass": "page-layout",
      "composition": "A minimal, single-column reading environment. Enforces strict max-width constraints on body text to prevent horizontal reading fatigue on massive displays."
    },
    "project_item": {
      "rootClass": "project-item-card",
      "composition": "A dense horizontal row on desktop that stacks vertically on mobile. Features high-contrast titles with the project-item-meta tags floating securely to one side without overlapping text."
    },
    "design_item": {
      "rootClass": "design-item-card",
      "composition": "A seamless container bounding the design-item-media. It uses :has() to dim sibling cards on hover, bringing immediate focus to the targeted visual asset."
    },
    "nav_item": {
      "rootClass": "nav-element",
      "composition": "A highly tactile hit area enforcing a 44px minimum square. Implements subtle kinetic typography weight shifts via font-variation-settings on interaction."
    }
  }
}
```

## section:css

```css
@import url("https://fonts.googleapis.com/css2?family=Kumbh+Sans:wght@300;400;600&family=Teko:wght@400;500;600;700&display=swap"); :root{--bg:oklch(20% 0.05 250);--text:oklch(95% 0.02 220);--accent:oklch(65% 0.2 45);--surface:oklch(25% 0.04 250);--resin:oklch(30% 0.06 250 / 0.5);--font-display:'Teko', sans-serif;--font-body:'Kumbh Sans', sans-serif;--gap-sm:clamp(12px, 2vw, 16px);--gap-md:clamp(24px, 4vw, 32px);--gap-lg:clamp(48px, 8vw, 80px);--radius-base:0px;--border-resin:1px solid oklch(95% 0.02 220 / 0.1);--transition-fluid:all 0.4s cubic-bezier(0.25, 1, 0.5, 1);--timeline-wave:view() entry 10% cover 30%;} *{box-sizing:border-box;margin:0;padding:0;} body{background:var(--bg);color:var(--text);font-family:var(--font-body);line-height:1.6;-webkit-font-smoothing:antialiased;} h1,h2,h3,h4,h5,h6{font-family:var(--font-display);text-transform:uppercase;line-height:1.1;font-weight:600;letter-spacing:0.02em;} a{color:inherit;text-decoration:none;} .site-shell{display:flex;flex-direction:column;min-height:100vh;} .global-nav{display:flex;flex-wrap:nowrap;overflow-x:auto;gap:var(--gap-sm);padding:var(--gap-sm);border-bottom:var(--border-resin);background:var(--surface);position:sticky;top:0;z-index:100;scrollbar-width:none;} .global-nav::-webkit-scrollbar{display:none;} .nav-element{display:flex;align-items:center;min-height:44px;min-width:44px;padding:0.5rem 1rem;font-family:var(--font-display);text-transform:uppercase;font-size:1.5rem;transition:var(--transition-fluid);white-space:nowrap;} .nav-element:hover{color:var(--accent);font-variation-settings:"wght" 700;} .home-layout{display:flex;flex-direction:column;width:100%;} .hero-section{min-height:75vh;background-image:url('assets/hero.jpg');background-size:cover;background-position:center;display:flex;flex-direction:column;justify-content:flex-end;padding:var(--gap-md);position:relative;border-bottom:var(--border-resin);} .hero-section::before{content:'';position:absolute;inset:0;background:linear-gradient(to top, var(--bg), transparent 80%);} .hero-section > *{position:relative;z-index:2;} .featured-grid{display:grid;grid-template-columns:minmax(0, 1fr);gap:var(--gap-md);padding:var(--gap-md);} .projects-layout{display:flex;flex-direction:column;padding:var(--gap-md);} .projects-ledger{display:flex;flex-direction:column;gap:var(--gap-lg);} .project-item-card{display:flex;flex-direction:column;gap:var(--gap-sm);padding-bottom:var(--gap-md);border-bottom:var(--border-resin);transition:var(--transition-fluid);} .project-item-meta{display:flex;flex-wrap:wrap;gap:var(--gap-sm);align-items:center;margin-top:var(--gap-sm);} .designs-layout{display:flex;flex-direction:column;padding:var(--gap-md);} .masonry-layout{display:grid;grid-template-columns:minmax(0, 1fr);gap:var(--gap-md);} .design-item-card{position:relative;transition:var(--transition-fluid);display:flex;flex-direction:column;background:var(--surface);} .masonry-layout:has(.design-item-card:hover) .design-item-card:not(:hover){opacity:0.3;filter:grayscale(100%);} .design-item-media{width:100%;height:auto;display:block;border:var(--border-resin);object-fit:cover;} .project-detail-layout{display:flex;flex-direction:column;width:100%;} .project-detail-hero{padding:var(--gap-lg) var(--gap-md);border-bottom:var(--border-resin);background:var(--surface);} .project-detail-hero h1{font-size:clamp(3rem, 10vw, 8rem);color:var(--text);} .project-detail-body{padding:var(--gap-lg) var(--gap-md);max-width:70ch;margin:0 auto;width:100%;overflow-wrap:break-word;} .design-detail-layout{display:flex;flex-direction:column;align-items:center;width:100%;} .design-detail-media{width:100%;max-width:1440px;height:auto;max-height:90vh;object-fit:contain;border:var(--border-resin);margin:var(--gap-md);background:var(--surface);} .page-layout{max-width:70ch;margin:0 auto;padding:var(--gap-lg) var(--gap-md);width:100%;overflow-wrap:break-word;} .badge{display:inline-flex;align-items:center;min-height:24px;padding:0 8px;font-size:0.875rem;font-family:var(--font-display);text-transform:uppercase;background:var(--resin);color:var(--accent);border:var(--border-resin);} .src{font-family:monospace;background:var(--surface);padding:0.125rem 0.375rem;color:var(--text);border:var(--border-resin);word-break:break-all;} .backlink{display:inline-flex;align-items:center;min-height:44px;min-width:44px;font-family:var(--font-display);text-transform:uppercase;font-size:1.5rem;color:var(--accent);transition:var(--transition-fluid);} .backlink:hover{color:var(--text);} .btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;min-width:44px;padding:0 var(--gap-md);font-family:var(--font-display);text-transform:uppercase;font-size:1.25rem;font-weight:600;background:var(--accent);color:var(--bg);border:none;cursor:pointer;transition:var(--transition-fluid);} .btn:hover{background:var(--text);} .md-img{max-width:100%;height:auto;border:var(--border-resin);margin:var(--gap-md) 0;display:block;} .gi-reveal{opacity:0;transform:translateY(20px);transition:opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1), transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);} .gi-reveal.gi-in{opacity:1;transform:translateY(0);} @media (min-width:768px){.global-nav{flex-wrap:wrap;justify-content:center;padding:var(--gap-md);} .featured-grid{grid-template-columns:repeat(2, minmax(0, 1fr));} .project-item-card{flex-direction:row;justify-content:space-between;align-items:center;} .project-item-meta{margin-top:0;} .masonry-layout{grid-template-columns:repeat(2, minmax(0, 1fr));}} @media (min-width:1024px){.masonry-layout{grid-template-columns:repeat(3, minmax(0, 1fr));}} @keyframes waveReveal{0%{opacity:0;transform:translateY(40px);} 100%{opacity:1;transform:translateY(0);}} @supports (animation-timeline: view()){.project-item-card, .design-item-card{animation:waveReveal both;animation-timeline:var(--timeline-wave);}}

/* Release invariant: a generated skin may not let an untrusted logo asset take over the viewport. */
.nav-bar img[src*="gi-logo-transparent"], header img[src*="gi-logo-transparent"],
.nav-bar img[src*="assets/logo"], header img[src*="assets/logo"] {
  display: block;
  inline-size: min(11.25rem, 48vw) !important;
  block-size: 3.5rem !important;
  max-inline-size: 100% !important;
  max-block-size: 3.5rem !important;
  object-fit: contain !important;
  object-position: left center !important;
}
.verified-brand-mark {
  inline-size: min(11.25rem, 48vw) !important;
  block-size: 3.5rem !important;
  max-inline-size: 100% !important;
  max-block-size: 3.5rem !important;
  object-fit: contain !important;
}
/* Vault-injected project marks have their own stable wrapper regardless of
   the generated layout vocabulary. Bound them mechanically so intrinsic
   source dimensions can never escape a card or grid track. */
.logo-tile {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  inline-size: 100% !important;
  min-inline-size: 0 !important;
  max-inline-size: 100% !important;
  overflow: hidden !important;
}
.logo-tile img {
  display: block !important;
  inline-size: 100% !important;
  min-inline-size: 0 !important;
  max-inline-size: 100% !important;
  block-size: auto !important;
  max-block-size: 18rem !important;
  object-fit: contain !important;
}
/* Build-owned navigation wrapper and badge fragments need invariant spacing;
   aesthetic styling remains theme-owned. */
.nav-links {
  display: flex !important;
  flex-wrap: wrap !important;
  align-items: center !important;
  gap: .25rem 1rem !important;
  min-inline-size: 0 !important;
}
.nav-links a {
  display: inline-flex !important;
  align-items: center !important;
  min-block-size: 44px !important;
  white-space: nowrap !important;
}
.badge {
  margin: .2rem !important;
}
/* build-site emits both navigation layers; generated skins own the custom one. */
.tl-default { display: none !important; }
.tl-custom { display: flex; flex-wrap: wrap; align-items: center; }


/* review-board fix layer (pass 1) */
/* CSS Fix Layer Overrides */

/* Fix 1: Constrain unconstrained project images on home & project index */
.project-item-card img,
.project-item-card .logo,
.featured-grid img,
.projects-ledger img,
.md-img {
  max-width: 100%;
  height: auto;
  object-fit: cover;
  display: block;
  border: var(--border-resin);
}

.featured-grid img,
.project-item-card img {
  width: 100%;
  max-height: 250px;
  background-color: var(--surface);
}

/* Fix 2: Prevent overlapping inside designs masonry layout */
.masonry-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--gap-md, 24px);
  align-items: start;
}

@media (min-width: 768px) {
  .masonry-layout {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

.design-item-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: auto;
  background: var(--surface);
  border: var(--border-resin);
  overflow: hidden;
  transition: var(--transition-fluid);
}

.design-item-media {
  width: 100%;
  position: relative;
  overflow: hidden;
}

.design-item-media img {
  width: 100%;
  height: auto;
  max-height: 480px;
  object-fit: cover;
  display: block;
}

/* Fix 3: Bento Grid Layout Alignment with Subgrid fallback */
.featured-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--gap-md, 24px);
}

@media (min-width: 768px) {
  .featured-grid {
    grid-template-columns: repeat(12, 1fr);
  }
  
  .featured-grid > *:nth-child(4n+1) {
    grid-column: span 8;
  }
  .featured-grid > *:nth-child(4n+2) {
    grid-column: span 4;
  }
  .featured-grid > *:nth-child(4n+3) {
    grid-column: span 4;
  }
  .featured-grid > *:nth-child(4n+4) {
    grid-column: span 8;
  }
  
  /* Align content internally to maintain bento symmetry */
  .featured-grid > .project-item-card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }
}

/* Mobile Global Navigation and Touch Targets */
.global-nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap-sm, 12px);
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
}

.nav-element {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  min-width: 44px;
  padding: 10px 16px;
  text-decoration: none;
}

/* Build-Injected Runtime Classes Explicitly Styled */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background: var(--resin);
  color: var(--accent);
  border: var(--border-resin);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.src {
  font-family: monospace;
  color: var(--text);
  background: var(--surface);
  padding: 12px;
  border: var(--border-resin);
  display: block;
  overflow-x: auto;
}

.backlink {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--accent);
  text-decoration: none;
  transition: var(--transition-fluid);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 12px 24px;
  background: var(--accent);
  color: var(--bg);
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: var(--transition-fluid);
}

.btn:hover {
  opacity: 0.95;
}

/* review-board fix layer (pass 2) */
:root { --bg: oklch(20% 0.05 250); --text: oklch(95% 0.02 220); --accent: oklch(65% 0.2 45); --surface: oklch(25% 0.04 250); --resin: oklch(30% 0.06 250 / 0.5); --font-display: 'Teko', sans-serif; --font-body: 'Kumbh Sans', sans-serif; --gap-sm: clamp(12px, 2vw, 16px); --gap-md: clamp(24px, 4vw, 32px); --gap-lg: clamp(48px, 8vw, 80px); --radius-base: 0px; --border-resin: 1px solid oklch(95% 0.02 220 / 0.15); --transition-fluid: all 0.4s cubic-bezier(0.25, 1, 0.5, 1); --timeline-wave: view() entry 10% cover 30%; } .site-shell { background-color: var(--bg); color: var(--text); font-family: var(--font-body); min-height: 100vh; display: flex; flex-direction: column; } h1, h2, h3, h4, .nav-element, .backlink, .btn { font-family: var(--font-display); text-transform: uppercase; letter-spacing: 0.06em; line-height: 1; } .project-item-card, .design-item-card, .featured-grid > * { background: var(--resin); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: var(--border-resin); border-radius: var(--radius-base); padding: var(--gap-md); transition: var(--transition-fluid); position: relative; overflow: hidden; box-shadow: 0 8px 32px 0 oklch(0% 0 0 / 0.25), inset 0 1px 0 0 oklch(100% 0 0 / 0.1); } .project-item-card::before, .design-item-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 100%; background: linear-gradient(135deg, oklch(100% 0 0 / 0.15) 0%, oklch(100% 0 0 / 0) 60%); pointer-events: none; z-index: 2; } .project-item-card:hover, .design-item-card:hover { border-color: var(--accent); box-shadow: 0 12px 40px 0 oklch(65% 0.2 45 / 0.2), inset 0 0 20px oklch(65% 0.2 45 / 0.1); transform: translateY(-4px); } .featured-grid { display: grid; grid-template-columns: 1fr; gap: var(--gap-md); } @media (min-width: 768px) { .featured-grid { grid-template-columns: repeat(12, 1fr); } .featured-grid > *:nth-child(1) { grid-column: span 8; grid-row: span 2; } .featured-grid > *:nth-child(2) { grid-column: span 4; } .featured-grid > *:nth-child(3) { grid-column: span 4; } .featured-grid > *:nth-child(4) { grid-column: span 6; } .featured-grid > *:nth-child(5) { grid-column: span 6; } .featured-grid > * { min-height: 280px; display: flex; flex-direction: column; justify-content: flex-end; } } @media (hover: hover) { .masonry-layout:hover .design-item-card:not(:hover), .featured-grid:hover .project-item-card:not(:hover) { opacity: 0.35; filter: grayscale(0.4) blur(1px); } } @supports (animation-timeline: view()) { .project-item-card, .design-item-card { animation: waveRise linear both; animation-timeline: var(--timeline-wave); } @keyframes waveRise { from { opacity: 0; transform: translateY(40px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } } } .global-nav { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--gap-sm); padding: var(--gap-sm) var(--gap-md); background: var(--resin); border-bottom: var(--border-resin); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); z-index: 100; } .nav-element { min-height: 44px; display: inline-flex; align-items: center; padding: 0 var(--gap-sm); font-size: 1.3rem; transition: var(--transition-fluid); color: var(--text); text-decoration: none; position: relative; } .nav-element:hover, .nav-element.active { color: var(--accent); } .nav-element::after { content: ''; position: absolute; bottom: 8px; left: var(--gap-sm); right: var(--gap-sm); height: 2px; background: var(--accent); transform: scaleX(0); transition: var(--transition-fluid); } .nav-element:hover::after, .nav-element.active::after { transform: scaleX(1); } .badge { background: oklch(95% 0.02 220 / 0.08); border: 1px solid oklch(95% 0.02 220 / 0.15); color: var(--text); padding: 4px 10px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; font-family: var(--font-display); letter-spacing: 0.08em; display: inline-flex; align-items: center; gap: 4px; } .src { font-family: monospace; background: oklch(15% 0.04 250); border: var(--border-resin); padding: var(--gap-sm); color: var(--accent); overflow-x: auto; font-size: 0.9rem; } .backlink { color: var(--text); text-decoration: none; display: inline-flex; align-items: center; gap: var(--gap-sm); min-height: 44px; font-size: 1.1rem; transition: var(--transition-fluid); } .backlink:hover { color: var(--accent); transform: translateX(-4px); } .btn { background: var(--accent); color: oklch(10% 0.02 250); padding: 12px 24px; font-size: 1.2rem; font-weight: bold; border: none; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; transition: var(--transition-fluid); cursor: pointer; text-decoration: none; } .btn:hover { background: oklch(75% 0.2 45); box-shadow: 0 0 20px var(--accent); } .md-img { width: 100%; height: auto; border: var(--border-resin); object-fit: cover; display: block; background: var(--surface); } .design-item-media img { width: 100%; height: 100%; object-fit: cover; transition: var(--transition-fluid); filter: brightness(0.85) contrast(1.05); } .design-item-card:hover .design-item-media img { filter: brightness(1) contrast(1.1); transform: scale(1.02); }
```

## section:layout:shell

```html
<div class="site-shell"><header><nav class="global-nav">{{NAV_LINKS}}</nav></header><main>{{CONTENT}}</main><footer>{{THEME_PILLS}}{{SOURCE_PATH}}</footer></div>
```

## section:layout:home

```html
<div class="home-layout"><section class="hero-section"><h1>{{HEADLINE}}</h1><p>{{TAGLINE}}</p><div>{{INTRO}}</div><div>{{FEATURED_COUNT}}</div></section><section class="featured-grid">{{FEATURED_PROJECTS}}</section></div>
```

## section:layout:projects_index

```html
<section class="projects-layout"><div class="badge">{{PROJECT_COUNT}}</div><div class="projects-ledger">{{PROJECT_LIST}}</div></section>
```

## section:layout:designs_index

```html
<section class="designs-layout"><div class="badge">{{DESIGN_COUNT}}</div><div class="masonry-layout">{{DESIGN_CARDS}}</div></section>
```

## section:layout:project_detail

```html
<section class="project-detail-layout"><header class="project-detail-hero">{{BACKLINK}}{{LOGO}}<h1>{{NAME}}</h1><p>{{DESCRIPTION}}</p><span class="badge">{{ROLE}}</span><span class="badge">{{YEAR}}</span>{{TECH_BADGES}}{{PROJECT_LINK}}{{REPO_LINK}}</header><div class="project-detail-body">{{CONTENT}}<div class="src">{{SOURCE_PATH}}</div></div></section>
```

## section:layout:design_detail

```html
<section class="design-detail-layout"><div class="design-detail-media"><img src="{{PREVIEW}}" class="md-img" alt="{{NAME}}"></div><div class="project-detail-hero"><h1>{{NAME}}</h1><p>{{DESCRIPTION}}</p><div class="badge">{{TAG_BADGES}}</div></div><div class="project-item-meta"><span>{{CLIENT}}</span><span>{{ROLE}}</span><span>{{YEAR}}</span></div><div class="project-detail-body">{{CONTENT}}</div><a href="{{LINK_URL}}" class="btn">{{NAME}}</a><div class="backlink">{{BACKLINK}}</div><div class="src">{{SOURCE_PATH}}</div></section>
```

## section:layout:page

```html
<article class="page-layout"><header><h1>{{NAME}}</h1></header>{{CONTENT}}<footer>{{SOURCE_PATH}}</footer></article>
```

## section:layout:project_item

```html
<section class="project-item-card"><a href="{{URL}}">{{LOGO}}</a><a href="{{URL}}" class="btn">{{NAME}}</a><p>{{DESCRIPTION}}</p><div class="project-item-meta"><span class="badge">{{INDEX}}</span><span class="badge">{{YEAR}}</span>{{TECH_BADGES}}<a href="{{REPO_URL}}" class="src">{{NAME}}</a></div></section>
```

## section:layout:design_item

```html
<article class="design-item-card"><a href="{{URL}}"><div class="design-item-media"><img src="{{PREVIEW}}" alt="{{NAME}}" loading="lazy" /></div><h2>{{NAME}}</h2><p>{{DESCRIPTION}}</p><p>{{CLIENT}}</p><time>{{YEAR}}</time></a><div>{{TAG_BADGES}}</div></article>
```

## section:layout:nav_item

```html
<a href="{{NAV_URL}}" class="nav-element {{NAV_ACTIVE_CLASS}}">{{NAV_NAME}}</a>
```
