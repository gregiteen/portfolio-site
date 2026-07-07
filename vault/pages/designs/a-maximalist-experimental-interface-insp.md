---
type: page
slug: "design-a-maximalist-experimental-interface-insp"
name: "Swiss Punk Zine (Red/Black/White)"
title: "Swiss Punk Zine (Red/Black/White) — Design Spec"
description: "AI-generated design: \"A maximalist, experimental interface inspired by 1980s Swiss poster design and punk zines. The palette is a jarring mix of deep blood red, stark black, and pure white. The typography uses a massively bold, extended sans-serif set entirely in lowercase, breaking across lines arbitrarily without hyphens. The layout completely ignores standard web conventions, using rotated text, extreme negative space, and chaotic margins.\""
timestamp: "2026-07-07T11:03:17.176Z"
sandbox_entry: "designs/a-maximalist-experimental-interface-insp/index.html"
x_kind: "design"
x_year: "2026"
x_role: "AI-Generated Theme"
x_client: "Portfolio Generator"
x_tags:
  - "AI Generated"
  - "Theme"
x_preview: "/designs/a-maximalist-experimental-interface-insp/assets/hero.jpg"
x_logo: "/designs/a-maximalist-experimental-interface-insp/assets/logo.png"
x_link: "/designs/a-maximalist-experimental-interface-insp/index.html"
---

# Design System

---
name: swiss-punk-zine
description: Design tokens and structural principles for the Greg Iteen portfolio, combining 1980s Swiss poster design and punk zine aesthetics.
tokens:
  colors:
    background: "#FFFFFF"
    text_primary: "#000000"
    text_secondary: "#333333"
    accent_red: "#BC0000"
    accent_red_hover: "#8B0000"
  typography:
    display:
      font_family: "'Arial Black', 'Impact', sans-serif"
      weight: "900"
      case: "lowercase"
      word_break: "break-all"
      line_height: "0.8"
    body:
      font_family: "'Courier New', Courier, monospace"
      weight: "400"
      line_height: "1.4"
  spacing:
    scale_unit: "8px"
    margin_chaotic: "-15px"
  borders:
    heavy: "5px solid #000000"
    accent: "3px solid #BC0000"
    radius: "0px"
---

# DESIGN SYSTEM

## Visual Philosophy
This identity is modeled directly on the stark, uncompromising tension between modernist Swiss design (which uses layout grids rigorously, but breaks them intentionally) and raw punk zines (which assemble structural components by hand, paste-up style). This reflects Greg Iteen's professional identity: an architect of uncompromisingly raw, high-performance, local-first artificial intelligence systems who does not rely on sleek, generic, cloud-based abstraction layers.

## Typography Strategy
All headers are set in absolute lowercase and heavily compressed. To mimic high-intensity hand-typeset pasteups, headings break boundaries without hyphens. We use standard system sans-serif faces at extreme weights ('Arial Black' / 'Impact') and force them to wrap mid-word using 'word-break: break-all'.

## Spatial Rules
1. Zero Rounded Corners: Every element is built on hard, sharp physical edges. No borders may have a radius.
2. Extreme Contrast Layering: We layer black text on solid red blocks, red text on solid black blocks, and black text on solid white blocks without intermediate gradients or soft drop-shadows. All shadows use raw, high-contrast flat physical offsets.
3. Mobile-First Compression: Layout elements expand out from a dense physical columnar strip on mobile screens into a massive multi-axis layout on wide desktop screens using structured min-width queries.

<br>
<hr>

### Architecture by Greg Iteen

> **Generative Design Infrastructure**  
> This interface and underlying design system were procedurally generated using an AI-native build engine. The architecture bypasses traditional databases in favor of stateless, strictly typed markup pipelines.

**Infrastructure Consultation Offer**
We assist select organizations in migrating to fully automated, AI-driven digital architectures. Mention this design specification during your initial inquiry to receive a 20% credit toward your first architectural audit.

**Website:** [gregiteen.xyz](https://gregiteen.xyz)  
**Direct Inquiry:** [sales@gregiteen.xyz](mailto:sales@gregiteen.xyz)

## section:css

```css
/* ========================================== 
   SWISS PUNK ZINE SYSTEM - CSS ARCHITECTURE
   ========================================== */

/* BASE RESET & VARIABLES */
:root {
  --color-white: #FFFFFF;
  --color-black: #000000;
  --color-red: #BC0000;
  --color-red-muted: #5E0000;
  --font-display: 'Arial Black', 'Impact', sans-serif;
  --font-mono: 'Courier New', Courier, monospace;
  --spacing-base: 8px;
  --border-heavy: 5px solid #000000;
  --border-light: 2px solid #000000;
  --border-red: 4px solid #BC0000;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border-radius: 0 !important; /* STRICT PROHIBITION OF ROUNDED EDGES */
}

body {
  background-color: var(--color-white);
  color: var(--color-black);
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-x: hidden;
  border: 10px solid var(--color-black);
  min-height: 100vh;
}

/* CUSTOM SCROLLBAR */
::-webkit-scrollbar {
  width: 12px;
}
::-webkit-scrollbar-track {
  background: var(--color-black);
}
::-webkit-scrollbar-thumb {
  background: var(--color-red);
  border: 2px solid var(--color-black);
}

/* TYPOGRAPHY OVERRIDES */
h1, h2, h3, h4 {
  font-family: var(--font-display);
  text-transform: lowercase;
  font-weight: 900;
  line-height: 0.85;
  letter-spacing: -0.05em;
  color: var(--color-black);
  word-break: break-all;
  margin-bottom: 1.5rem;
}

h1 {
  font-size: clamp(3rem, 12vw, 8rem);
}

h2 {
  font-size: clamp(2rem, 8vw, 4rem);
  border-left: 10px solid var(--color-red);
  padding-left: 15px;
}

h3 {
  font-size: clamp(1.5rem, 5vw, 2.5rem);
}

a {
  color: var(--color-red);
  text-decoration: underline;
  text-underline-offset: 4px;
  font-weight: bold;
  transition: color 0.1s steps(2);
  cursor: pointer;
}

a:hover {
  color: var(--color-black);
  background-color: var(--color-red);
  text-decoration: none;
}

/* WRAPPERS & LAYOUT FRAMEWORK (MOBILE FIRST) */
.zine-container {
  width: 100%;
  max-width: 100%;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* SYSTEM HEADER & BRAND BAR */
.zine-header {
  border-bottom: 8px solid var(--color-black);
  padding-bottom: 20px;
  position: relative;
}

.logo-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 25px;
}

.logo-wrapper {
  max-width: 120px;
  background: var(--color-black);
  padding: 10px;
  border: 4px solid var(--color-red);
}

.logo-wrapper img {
  width: 100%;
  height: auto;
  display: block;
  filter: grayscale(1) contrast(300%);
}

/* ZINE NAVIGATION */
.zine-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.nav-item-link {
  display: inline-block;
  font-family: var(--font-mono);
  font-weight: bold;
  text-transform: uppercase;
  padding: 12px 20px;
  border: var(--border-light);
  background-color: var(--color-white);
  color: var(--color-black);
  text-decoration: none;
  min-height: 44px; /* Touch target */
  display: flex;
  align-items: center;
  transition: transform 0.1s steps(2), box-shadow 0.1s steps(2);
  box-shadow: 4px 4px 0px var(--color-black);
}

.nav-item-link:hover,
.nav-item-link.active-link {
  background-color: var(--color-red);
  color: var(--color-white);
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0px var(--color-black);
}

/* EXPERIMENTAL SIDE PANEL TELEMETRY */
.telemetry-sidebar {
  background-color: var(--color-black);
  color: var(--color-white);
  padding: 20px;
  border: 4px solid var(--color-red);
  font-size: 11px;
  line-height: 1.3;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.telemetry-sidebar::before {
  content: "LOCAL-ONLY CORE";
  position: absolute;
  right: -30px;
  top: 20px;
  transform: rotate(90deg);
  font-family: var(--font-display);
  font-size: 16px;
  color: var(--color-red);
  opacity: 0.5;
}

/* MAIN ZONE CHASSIS */
.hero-raw {
  background: var(--color-black);
  color: var(--color-white);
  padding: 30px 15px;
  margin-left: -15px;
  margin-right: -15px;
  position: relative;
  border-bottom: 12px solid var(--color-red);
}

.hero-raw-bg {
  position: absolute;
  inset: 0;
  opacity: 0.15;
  background-size: cover;
  background-position: center;
  mix-blend-mode: color-burn;
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-headline {
  color: var(--color-white);
  margin-bottom: 20px;
}

.hero-tagline {
  background-color: var(--color-red);
  color: var(--color-white);
  font-family: var(--font-mono);
  font-weight: bold;
  font-size: 1.2rem;
  padding: 10px;
  display: inline-block;
  margin-bottom: 30px;
  text-transform: uppercase;
}

/* PROJECT LISTINGS (PUNK STACKED CARDS) */
.project-stack {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.project-card {
  border: var(--border-heavy);
  background: var(--color-white);
  padding: 25px;
  position: relative;
  box-shadow: 10px 10px 0px var(--color-red);
  transition: transform 0.1s steps(2), box-shadow 0.1s steps(2);
}

.project-card:hover {
  transform: translate(-4px, -4px);
  box-shadow: 14px 14px 0px var(--color-black);
}

.project-index {
  position: absolute;
  top: 10px;
  right: 15px;
  font-family: var(--font-display);
  font-size: 3rem;
  color: rgba(0,0,0,0.15);
  line-height: 1;
}

.project-tech-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 15px;
  margin-bottom: 15px;
}

.tech-badge {
  background-color: var(--color-black);
  color: var(--color-white);
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 4px 8px;
  font-weight: bold;
  text-transform: uppercase;
}

/* RUNNING VERTICAL TEXT BANNER */
.running-text-banner {
  background-color: var(--color-red);
  color: var(--color-white);
  padding: 10px 0;
  overflow: hidden;
  white-space: nowrap;
  display: flex;
  border-top: 5px solid var(--color-black);
  border-bottom: 5px solid var(--color-black);
}

.running-text-inner {
  display: inline-block;
  animation: marquee 25s linear infinite;
  font-family: var(--font-display);
  text-transform: lowercase;
  font-size: 1.5rem;
}

@keyframes marquee {
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-50%, 0, 0); }
}

/* SYSTEM CONTROLS / THEME PILLS PANEL */
.pills-panel {
  background-color: var(--color-white);
  border: var(--border-heavy);
  padding: 20px;
  margin-top: 40px;
}

.pills-title {
  font-family: var(--font-display);
  font-size: 1.2rem;
  margin-bottom: 10px;
  border-bottom: var(--border-light);
  padding-bottom: 5px;
}

.pills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* GENERAL INNER CONTAINER SPACING */
.content-block {
  margin-bottom: 40px;
}

.content-block-title {
  border-bottom: 6px solid var(--color-black);
  padding-bottom: 10px;
  margin-bottom: 25px;
}

/* MEDIA QUERY TO UNFURL GRID ON TABLETS/DESKTOPS */
@media (min-width: 768px) {
  body {
    border: 20px solid var(--color-black);
  }
  
  .zine-container {
    padding: 40px;
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 3fr 1fr;
    gap: 40px;
  }

  .zine-header-wrapper {
    grid-column: 1 / span 2;
  }

  .zine-main-content {
    grid-column: 1 / span 1;
  }

  .zine-side-content {
    grid-column: 2 / span 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .hero-raw {
    padding: 60px 40px;
    margin-left: 0;
    margin-right: 0;
    grid-column: 1 / span 2;
  }

  .logo-row {
    margin-bottom: 40px;
  }

  .logo-wrapper {
    max-width: 180px;
  }
  
  .pills-panel {
    grid-column: 1 / span 2;
  }
}

/* SYSTEM TELEMETRY SIMULATION */
.telemetry-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

.telemetry-table td {
  padding: 8px;
  border-bottom: 1px dashed var(--color-black);
  font-size: 12px;
}

.telemetry-table td:last-child {
  text-align: right;
  font-weight: bold;
  color: var(--color-red);
}

.portrait-frame {
  border: var(--border-heavy);
  background-color: var(--color-red);
  padding: 15px;
  box-shadow: 10px 10px 0 var(--color-black);
  margin-bottom: 30px;
}

.portrait-frame img,
.portrait-frame svg {
  width: 100%;
  height: auto;
  filter: grayscale(1) contrast(200%) brightness(90%);
  mix-blend-mode: multiply;
  display: block;
  border: 3px solid var(--color-black);
}

/* STYLING FOR CONTACT PORTRAIT EMBEDDED IN PAGES */
body .md-img, img.md-img {
  border: var(--border-heavy);
  background-color: var(--color-red);
  padding: 15px;
  box-shadow: 10px 10px 0 var(--color-black);
  width: 100%;
  height: auto;
  filter: grayscale(1) contrast(200%) brightness(90%);
  mix-blend-mode: multiply;
  display: block;
  max-width: 400px;
  margin: 30px 0;
}

/* CONTACT / SUBMISSION FORM IN ZINE SYSTEM */
.zine-form-group {
  margin-bottom: 20px;
}

.zine-label {
  display: block;
  font-family: var(--font-display);
  font-size: 1.1rem;
  margin-bottom: 5px;
  text-transform: lowercase;
}

.zine-input,
.zine-textarea {
  width: 100%;
  padding: 12px;
  border: var(--border-light);
  font-family: var(--font-mono);
  background-color: var(--color-white);
  color: var(--color-black);
}

.zine-input:focus,
.zine-textarea:focus {
  outline: 4px solid var(--color-red);
}

.zine-btn {
  background-color: var(--color-black);
  color: var(--color-white);
  border: none;
  padding: 15px 30px;
  font-family: var(--font-display);
  font-size: 1.5rem;
  text-transform: lowercase;
  cursor: pointer;
  transition: background-color 0.1s steps(2);
  box-shadow: 6px 6px 0 var(--color-red);
}

.zine-btn:hover {
  background-color: var(--color-red);
  box-shadow: 6px 6px 0 var(--color-black);
}
```

## section:layout:shell

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>greg iteen // file-native engineering</title>
  <link rel="icon" href="assets/favicon.png">
</head>
<body>

  <div class="zine-container">
    <!-- HEADER BLOCK -->
    <header class="zine-header-wrapper">
      <div class="zine-header">
        <div class="logo-row">
          <div class="logo-wrapper">
            <img src="assets/logo.png" alt="greg iteen logo">
          </div>
          <div style="text-align: right; font-family: var(--font-mono); font-size: 11px;">
            // system terminal running<br>
            // local node isolated
          </div>
        </div>
        <nav class="zine-nav">
          {{NAV_LINKS}}
        </nav>
      </div>
    </header>

    <!-- MAIN DYNAMIC CONTENT SLAP -->
    <main class="zine-main-content">
      {{CONTENT}}
    </main>

    <!-- SIDEBAR ARCHIVE & TELEMETRY -->
    <aside class="zine-side-content">
      <div class="telemetry-sidebar">
        <div style="font-family: var(--font-display); font-size: 1.2rem; margin-bottom: 10px; color: var(--color-red);">
          telemetry.log
        </div>
        <p>autonomous system active. processing intelligence strictly on client devices. zero third-party leakage.</p>
        <table class="telemetry-table">
          <tr><td>architecture</td><td>x86_64 / mxs</td></tr>
          <tr><td>isolation</td><td>100% network gap</td></tr>
          <tr><td>storage</td><td>file-native direct</td></tr>
          <tr><td>latency</td><td>&lt; 2.4ms local</td></tr>
        </table>
      </div>

      <div class="telemetry-sidebar" style="background-color: var(--color-red); color: var(--color-white); border-color: var(--color-black);">
        <div style="font-family: var(--font-display); font-size: 1.2rem; margin-bottom: 10px;">
          philosophy
        </div>
        <p>computational integrity starts at the physical drive. if your model resides in someone else's datacenter, it is not your intelligence.</p>
      </div>
    </aside>

    <!-- RUNNING VERTICAL FOOTER MARQUEE -->
    <div style="grid-column: 1 / span 2; margin-top: 40px;">
      <div class="running-text-banner">
        <div class="running-text-inner">
          local first local first local first file native absolute control zero cloud bloat pure compilation hardware direct local first local first local first file native absolute control zero cloud bloat pure compilation hardware direct
        </div>
      </div>
    </div>

    <!-- SYSTEM CONTROLS FOOTER PANEL -->
    <footer class="pills-panel">
      <div class="pills-title">active system interfaces</div>
      <div class="pills-list">
        {{THEME_PILLS}}
      </div>
      <div style="margin-top: 20px; font-family: var(--font-mono); font-size: 10px; color: #666;">
        source: {{SOURCE_PATH}} // no telemetry transmitted.
      </div>
    </footer>
  </div>

</body>
</html>
```

## section:layout:home

```html
<!-- HERO ZONE -->
<section class="hero-raw">
  <div class="hero-raw-bg" style="background-image: url('assets/hero.jpg');"></div>
  <div class="hero-content">
    <div class="hero-tagline">system level. file native. autonomous.</div>
    <h1 class="hero-headline">local<br>file<br>native<br>ai</h1>
    <div style="max-width: 600px; font-size: 1.1rem; line-height: 1.6;">
      greg iteen constructs custom hardware-embedded AI runtimes. no API relays, no subscription traps, no cloud vulnerability. architectures designed for extreme privacy and absolute execution speed.
    </div>
  </div>
</section>

<!-- FEATURED WORK BLOCK -->
<section class="content-block" style="margin-top: 40px;">
  <h2 class="content-block-title">selected installations</h2>
  <div class="project-stack">
    {{FEATURED_PROJECTS}}
  </div>
</section>
```

## section:layout:projects_index

```html
<section class="content-block">
  <h2 class="content-block-title">system deployment log</h2>
  <p style="margin-bottom: 30px; font-size: 1.1rem; max-width: 600px;">
    the following local execution models have been compiled and shipped to production machinery. these represent non-cloud architectural realities.
  </p>
  <div class="project-stack">
    {{PROJECT_LIST}}
  </div>
</section>
```

## section:layout:designs_index

```html
<section class="content-block">
  <div style="position: relative; margin-bottom: 60px;">
    <div style="font-family: var(--font-display); font-size: clamp(4rem, 15vw, 10rem); color: var(--color-red); line-height: 0.7; transform: rotate(-3deg); transform-origin: left top; margin-bottom: 20px; word-break: break-all; mix-blend-mode: multiply; opacity: 0.9;">
      visual<br>manifesto
    </div>
    <div style="background-color: var(--color-black); color: var(--color-white); padding: 20px; margin-top: -20px; border: 5px solid var(--color-red); position: relative; z-index: 2; box-shadow: 10px 10px 0 var(--color-black);">
      <h2 style="color: var(--color-white); border: none; padding: 0; margin-bottom: 10px; font-size: 2rem;">index.of.artifacts [{{DESIGN_COUNT}}]</h2>
      <p style="font-family: var(--font-mono); font-size: 13px; line-height: 1.5; max-width: 500px;">
        physical spatial blueprints, silkscreen layouts, and interface prototypes exploring high-performance interface aesthetics. raw execution. zero digital dilution.
      </p>
    </div>
  </div>

  <div class="project-stack" style="margin-top: 40px;">
    {{DESIGN_CARDS}}
  </div>

  {{GENERATOR_FORM}}
</section>
```

## section:layout:project_detail

```html
<article class="content-block">
  <div style="margin-bottom: 20px;">
    {{BACKLINK}}
  </div>

  <div style="display: flex; flex-direction: column; gap: 20px;">
    <!-- HEADER PUNK POSTER BLOCK -->
    <div style="background-color: var(--color-red); color: var(--color-white); border: 8px solid var(--color-black); padding: 40px 20px; position: relative; overflow: hidden; box-shadow: 15px 15px 0 var(--color-black);">
      <div style="position: absolute; right: -20px; bottom: -20px; font-family: var(--font-display); font-size: 12rem; color: rgba(0,0,0,0.15); line-height: 0.8; pointer-events: none; user-select: none;">
        raw
      </div>
      <div style="position: relative; z-index: 2;">
        <div style="font-family: var(--font-mono); font-size: 12px; background: var(--color-black); color: var(--color-white); display: inline-block; padding: 5px 10px; text-transform: uppercase; margin-bottom: 20px;">
          build registry: {{YEAR}} // system deployment
        </div>
        <h1 style="color: var(--color-white); margin-bottom: 15px; word-break: break-all; font-size: clamp(3rem, 10vw, 6rem);">
          {{NAME}}
        </h1>
        <p style="font-family: var(--font-mono); font-size: 1.2rem; max-width: 700px; line-height: 1.4; font-weight: bold; color: var(--color-black); background: var(--color-white); padding: 15px; border-left: 10px solid var(--color-black);">
          {{DESCRIPTION}}
        </p>
      </div>
    </div>

    <!-- SPECS GRID (MOBILE RESPONSIVE -> UNFOLDS VIA CSS IF NEEDED) -->
    <div style="display: grid; grid-template-columns: 1fr; gap: 20px; margin-top: 20px;">
      
      <!-- SPEC PANEL -->
      <div style="border: 5px solid var(--color-black); padding: 25px; background: var(--color-white); position: relative;">
        <div style="font-family: var(--font-display); font-size: 1.5rem; text-transform: lowercase; border-bottom: 4px solid var(--color-red); padding-bottom: 5px; margin-bottom: 15px;">
          system.specs
        </div>
        <table class="telemetry-table" style="margin-top: 0;">
          <tr>
            <td>Role / Execution</td>
            <td>{{ROLE}}</td>
          </tr>
          <tr>
            <td>Hardware Isolation</td>
            <td>100% Local / Zero API Relays</td>
          </tr>
          <tr>
            <td>Deploy State</td>
            <td>Active Production Runtime</td>
          </tr>
          <tr>
            <td>Registry Node</td>
            <td>{{SOURCE_PATH}}</td>
          </tr>
        </table>

        <div class="project-tech-badges" style="margin-top: 20px;">
          {{TECH_BADGES}}
        </div>

        <div style="margin-top: 25px; display: flex; flex-direction: column; gap: 10px;">
          {{REPO_LINK}}
          {{PROJECT_LINK}}
        </div>
      </div>

      <!-- MAIN DOCUMENTATION ZONE -->
      <div style="border: 5px solid var(--color-black); background: var(--color-white); padding: 25px; font-family: var(--font-mono); line-height: 1.6;">
        <div style="font-family: var(--font-display); font-size: 1.5rem; text-transform: lowercase; border-bottom: 4px solid var(--color-black); padding-bottom: 5px; margin-bottom: 20px; color: var(--color-red);">
          architectural.breakdown
        </div>
        <div class="markdown-body-raw" style="color: var(--color-black);">
          {{CONTENT}}
        </div>
      </div>

    </div>
  </div>
</article>
```

## section:layout:design_detail

```html
<article class="content-block">
  <div style="margin-bottom: 30px;">
    {{BACKLINK}}
  </div>

  <div style="display: flex; flex-direction: column; gap: 30px;">
    <!-- MAIN PUNK HEADER CARD -->
    <div style="position: relative; background: var(--color-black); color: var(--color-white); border: 8px solid var(--color-red); padding: 40px 20px; box-shadow: -12px 12px 0 var(--color-black);">
      <div style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--color-red); margin-bottom: 10px;">
        visual.artifact // registry {{YEAR}}
      </div>
      <h1 style="color: var(--color-white); margin-bottom: 0; word-break: break-all; font-size: clamp(3.5rem, 12vw, 7rem); font-family: var(--font-display); text-transform: lowercase; line-height: 0.8;">
        {{NAME}}
      </h1>
    </div>

    <!-- DUAL COLUMN PHYSICAL LAYOUT -->
    <div style="display: grid; grid-template-columns: 1fr; gap: 30px;" class="zine-desktop-split">
      <style>
        @media (min-width: 768px) {
          .zine-desktop-split {
            grid-template-columns: 1.2fr 1.8fr !important;
          }
        }
      </style>
      
      <!-- LEFT COLUMN: THE PHYSICAL PREVIEW & SPEC BLUEPRINT -->
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div class="portrait-frame" style="margin-bottom: 0; position: relative;">
          <div style="position: absolute; top: 10px; left: 10px; background: var(--color-black); color: var(--color-white); font-family: var(--font-mono); font-size: 10px; padding: 4px 8px; z-index: 10;">
            plate.layout // alpha
          </div>
          {{PREVIEW}}
        </div>
        
        <div style="border: 5px solid var(--color-black); padding: 20px; background: var(--color-white);">
          <div style="font-family: var(--font-display); font-size: 1.2rem; text-transform: lowercase; border-bottom: 3px solid var(--color-black); padding-bottom: 5px; margin-bottom: 15px;">
            classification.metrics
          </div>
          <table class="telemetry-table" style="margin-top: 0;">
            <tr><td>Client</td><td>{{CLIENT}}</td></tr>
            <tr><td>Function</td><td>{{ROLE}}</td></tr>
            <tr><td>Execution</td><td>{{YEAR}}</td></tr>
            <tr><td>Verification</td><td>local storage native</td></tr>
          </table>
          <div class="project-tech-badges" style="margin-top: 15px;">
            {{TAG_BADGES}}
          </div>
        </div>

        <div style="margin-top: 10px;">
          {{LINK_URL}}
        </div>
      </div>

      <!-- RIGHT COLUMN: THE CONCEPTUAL DISSECTION -->
      <div style="border: 5px solid var(--color-black); background: var(--color-white); padding: 30px; display: flex; flex-direction: column; gap: 25px;">
        <div style="font-family: var(--font-display); font-size: 1.8rem; text-transform: lowercase; line-height: 0.9; border-bottom: 6px solid var(--color-red); padding-bottom: 10px;">
          system.execution.manifesto
        </div>
        
        <div style="font-family: var(--font-mono); font-size: 1rem; font-weight: bold; line-height: 1.4; color: var(--color-red); border-left: 5px solid var(--color-black); padding-left: 15px;">
          {{DESCRIPTION}}
        </div>

        <div class="markdown-body-raw" style="font-family: var(--font-mono); font-size: 13px; line-height: 1.6; color: var(--color-black);">
          {{CONTENT}}
        </div>
        
        <div style="margin-top: auto; padding-top: 20px; border-top: 1px dashed var(--color-black); font-family: var(--font-mono); font-size: 11px; color: #666;">
          source link: {{SOURCE_PATH}}
        </div>
      </div>
    </div>
  </div>
</article>
```

## section:layout:page

```html
<article class="content-block">
  <!-- DRAMATIC HEADLINE POSTER BLOCK -->
  <div style="position: relative; margin-bottom: 40px; background: var(--color-red); color: var(--color-white); padding: 40px 20px; border: 8px solid var(--color-black); box-shadow: 10px 10px 0 var(--color-black);">
    <div style="position: absolute; right: 15px; top: 15px; font-family: var(--font-mono); font-size: 11px; color: var(--color-black); font-weight: bold;">
      node: {{SOURCE_PATH}}
    </div>
    <h1 style="color: var(--color-white); margin: 0; font-size: clamp(3rem, 10vw, 6rem); line-height: 0.85; word-break: break-all; font-family: var(--font-display); text-transform: lowercase;">
      {{NAME}}
    </h1>
  </div>

  <!-- RAW PASTE-UP SYSTEM BODY CONTAINER -->
  <div style="background: var(--color-white); border: 5px solid var(--color-black); padding: 30px; font-family: var(--font-mono); line-height: 1.6; box-shadow: 8px 8px 0 var(--color-red);">
    <div class="markdown-body-raw" style="color: var(--color-black);">
      {{CONTENT}}
    </div>
  </div>
</article>
```

## section:layout:project_item

```html
<div class="project-card" style="margin-bottom: 25px; position: relative; border: var(--border-heavy); background: var(--color-white); padding: 30px; box-shadow: 10px 10px 0px var(--color-red);"><div class="project-index" style="position: absolute; top: 10px; right: 20px; font-family: var(--font-display); font-size: 4rem; color: rgba(188, 0, 0, 0.15); line-height: 0.8; user-select: none;">{{INDEX}}</div><div style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; margin-bottom: 15px; color: var(--color-red); font-weight: bold; border-bottom: 2px dashed var(--color-black); padding-bottom: 5px;">deploy.registry // year: {{YEAR}}</div><h3 style="font-family: var(--font-display); font-size: 2.2rem; margin-bottom: 10px; text-transform: lowercase; word-break: break-all; line-height: 0.9; color: var(--color-black);">{{NAME}}</h3><p style="font-family: var(--font-mono); font-size: 13px; line-height: 1.5; color: var(--color-black); margin-bottom: 20px; max-width: 600px;">{{DESCRIPTION}}</p><div class="project-tech-badges" style="margin-bottom: 25px;">{{TECH_BADGES}}</div><div style="display: flex; flex-wrap: wrap; gap: 15px;"><a href="{{URL}}" class="nav-item-link" style="text-decoration: none; font-size: 11px; letter-spacing: 1px; padding: 12px 18px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; background-color: var(--color-black); color: var(--color-white); font-weight: bold;">inspect.runtime</a><a href="{{REPO_URL}}" class="nav-item-link" style="text-decoration: none; font-size: 11px; letter-spacing: 1px; padding: 12px 18px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; background-color: var(--color-white); color: var(--color-black); border: var(--border-light);">source.repository</a></div></div>
```

## section:layout:design_item

```html
<div class="project-card" style="margin-bottom: 35px; border: var(--border-heavy); background: var(--color-white); padding: 25px; box-shadow: -10px 10px 0px var(--color-black);"><div style="display: grid; grid-template-columns: 1fr; gap: 20px;"><div class="portrait-frame" style="margin-bottom: 0; padding: 10px; border: 3px solid var(--color-black); background: var(--color-black);">{{PREVIEW}}</div><div><div style="font-family: var(--font-mono); font-size: 11px; color: var(--color-red); font-weight: bold; margin-bottom: 8px; text-transform: uppercase;">artifact.spec // client: {{CLIENT}} // {{YEAR}}</div><h3 style="font-family: var(--font-display); font-size: 2rem; margin-bottom: 12px; text-transform: lowercase; word-break: break-all; line-height: 0.9;">{{NAME}}</h3><p style="font-family: var(--font-mono); font-size: 13px; line-height: 1.4; color: var(--color-black); margin-bottom: 20px;">{{DESCRIPTION}}</p><div class="project-tech-badges" style="margin-bottom: 20px;">{{TAG_BADGES}}</div><a href="{{URL}}" class="nav-item-link" style="text-decoration: none; font-size: 11px; padding: 12px 20px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; background-color: var(--color-red); color: var(--color-white); font-weight: bold; box-shadow: 4px 4px 0px var(--color-black);">analyze.blueprint</a></div></div></div>
```

## section:layout:nav_item

```html
<a href="{{NAV_URL}}" class="nav-item-link {{NAV_ACTIVE_CLASS}}">{{NAV_NAME}}</a>
```
