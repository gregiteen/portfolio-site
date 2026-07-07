---
type: page
slug: "design-editorial-broadsheet-newspaper-strict-mo"
name: "The Broadsheet Minimalist"
title: "The Broadsheet Minimalist — Design Spec"
description: "AI-generated design: \"Editorial broadsheet newspaper. Strict modular grid, massive high-contrast serif headlines, dense typography with multiple columns, black and white only with one striking primary red accent color. Clean, Swiss design influence. Use CSS Grid heavily.\""
timestamp: "2026-07-07T11:03:17.343Z"
sandbox_entry: "designs/editorial-broadsheet-newspaper-strict-mo/index.html"
x_kind: "design"
x_year: "2026"
x_role: "AI-Generated Theme"
x_client: "Portfolio Generator"
x_tags:
  - "AI Generated"
  - "Theme"
x_preview: "/designs/editorial-broadsheet-newspaper-strict-mo/assets/hero.jpg"
x_logo: "/designs/editorial-broadsheet-newspaper-strict-mo/assets/logo.png"
x_link: "/designs/editorial-broadsheet-newspaper-strict-mo/index.html"
---

# Design System

---
name: Broadsheet Editorial
author: Studio Design Lead
version: 2.0.0
tokens:
  color-bg: "#FFFFFF"
  color-text: "#111111"
  color-accent: "#D32F2F"
  color-border: "#111111"
  color-border-light: "#EAEAEA"
  font-display: "'Playfair Display', 'Georgia', 'Times New Roman', serif"
  font-sans: "'Inter', system-ui, -apple-system, sans-serif"
  font-mono: "'Courier New', Courier, monospace"
  spacing-unit: "8px"
---

# DESIGN.md

## Visual Strategy & Concept
This identity is modeled after classical editorial broadsheet journalism, updated with Swiss-influenced modernist structure. It rejects generic digital gradient-heavy tropes, treating Greg Iteen's high-performance, file-native AI software engineering as heavy industrial manufacturing: structural, precise, and permanent.

### Layout Strategy (CSS Grid)
We employ an uncompromising multi-column modular grid divided by explicit hairline borders (`1px solid var(--color-border)`). On desktop, the layout utilizes asymmetric columns, forcing metadata to the left and raw dense content to the right. Text justification, tight letter-spacing on massive display titles, and clean vertical lines dictate the eye's path.

### Color Palette
- **Pure White (#FFFFFF)**: The canvas. Recalls fresh newsprint.
- **Carbon Black (#111111)**: High-contrast typography mimicking lead letterpress ink.
- **Cadmium Red (#D32F2F)**: A singular, intense red accent used only for micro-data callouts, critical structural accents, or system status lines. Never used for decorative gradients.

### Typography & Copy
- **Serif Display**: Used for massive, high-contrast, tight-leading headlines that demand immediate authority.
- **Monospace & Sans-Serif**: Used for technical indexes, metrics, and parameters, ensuring readable hierarchy.
- **Tone**: The prose is dry, technical, precise, and authoritative. Every component does real structural work.

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
/* CSS RESET & VARIABLES */
:root {
  --color-bg: #ffffff;
  --color-text: #111111;
  --color-accent: #d32f2f;
  --color-border: #111111;
  --color-border-light: #eaeaea;
  --font-display: "Playfair Display", "Georgia", "Times New Roman", serif;
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: "Courier New", Courier, monospace;
  --spacing: 8px;
  --touch-target: 44px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 0;
  margin: 0;
  border: 12px solid var(--color-border);
  min-height: 100vh;
}

/* TYPOGRAPHY */
h1, h2, h3, h4 {
  font-family: var(--font-display);
  font-weight: 900;
  line-height: 0.95;
  letter-spacing: -0.03em;
  color: var(--color-text);
}

p {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: calc(var(--spacing) * 2);
}

a {
  color: var(--color-text);
  text-decoration: none;
  transition: color 0.15s ease-in-out;
}

a:hover {
  color: var(--color-accent);
}

/* TOUCH TARGETS & NAVIGATION */
.nav-link,
button,
.btn {
  min-height: var(--touch-target);
  padding: var(--spacing) calc(var(--spacing) * 2);
  display: inline-flex;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid transparent;
}

/* GRID LAYOUT STRUCTURE */
.site-wrapper {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

/* MASTHEAD */
.masthead {
  border-bottom: 4px double var(--color-border);
  padding: calc(var(--spacing) * 4) 0;
  text-align: center;
  margin: 0 calc(var(--spacing) * 2);
}

.masthead-logo {
  max-height: 80px;
  margin-bottom: calc(var(--spacing) * 2);
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.masthead-title {
  font-size: clamp(2.5rem, 9vw, 5.5rem);
  text-transform: uppercase;
  letter-spacing: -0.05em;
  margin-bottom: var(--spacing);
  font-family: var(--font-display);
}

.masthead-meta {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding: var(--spacing) 0;
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* MAIN GRID SYSTEM */
.main-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  border-bottom: 1px solid var(--color-border);
}

/* HERO / INTRO */
.hero-block {
  padding: calc(var(--spacing) * 4) calc(var(--spacing) * 2);
  border-bottom: 1px solid var(--color-border);
}

.hero-headline {
  font-size: clamp(2.4rem, 7vw, 4.5rem);
  margin-bottom: calc(var(--spacing) * 2.5);
  text-transform: none;
  font-weight: 900;
}

.hero-intro {
  font-family: var(--font-sans);
  font-size: 1.2rem;
  line-height: 1.7;
  max-width: 720px;
  text-align: justify;
}

/* COLUMNS & SECTIONS */
.section-title {
  font-family: var(--font-mono);
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-accent);
  padding: var(--spacing) calc(var(--spacing) * 2);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title span {
  font-weight: bold;
}

/* PROJECT LISTS */
.project-grid {
  display: grid;
  grid-template-columns: 1fr;
}

.project-card {
  border-bottom: 1px solid var(--color-border-light);
  padding: calc(var(--spacing) * 3) calc(var(--spacing) * 2);
  transition: background-color 0.2s ease;
}

.project-card:hover {
  background-color: #fafafa;
}

.project-meta {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-accent);
  margin-bottom: var(--spacing);
  display: flex;
  gap: calc(var(--spacing) * 2);
  text-transform: uppercase;
}

.project-name {
  font-size: 2rem;
  font-family: var(--font-display);
  margin-bottom: calc(var(--spacing) * 1.5);
  font-weight: 900;
}

.project-description {
  font-family: var(--font-sans);
  font-size: 14px;
  color: #333;
  margin-bottom: calc(var(--spacing) * 2);
  max-width: 720px;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing);
}

.tag-badge {
  font-family: var(--font-mono);
  font-size: 11px;
  background-color: #ffffff;
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  text-transform: uppercase;
  color: var(--color-text);
}

/* NAV COMPONENT */
.site-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg);
}

.site-nav a {
  flex-grow: 1;
  text-align: center;
  justify-content: center;
  border-right: 1px solid var(--color-border);
  padding: calc(var(--spacing) * 2);
}

.site-nav a:last-child {
  border-right: none;
}

/* ASSETS CONTAINER (FOR HERO IMAGES ETC) */
.hero-image-container {
  width: 100%;
  height: 300px;
  background-size: cover;
  background-position: center;
  filter: grayscale(100%) contrast(130%) brightness(90%);
  border-bottom: 1px solid var(--color-border);
}

/* FOOTER */
.footer {
  border-top: 4px double var(--color-border);
  margin-top: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 4) calc(var(--spacing) * 2);
  font-family: var(--font-mono);
  font-size: 11px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* PORTRAIT AND CONTENT IMAGES */
.md-img {
  width: 100%;
  max-width: 600px;
  height: auto;
  border: 1px solid var(--color-border);
  filter: grayscale(100%) contrast(125%);
  margin: calc(var(--spacing) * 3) 0;
  display: block;
}

/* SCALED LAYOUT VIA MIN-WIDTH MEDIA QUERIES ONLY (MOBILE FIRST) */
@media (min-width: 768px) {
  .masthead-meta {
    grid-template-columns: 1fr auto 1fr;
    text-align: left;
  }
  
  .masthead-meta span:nth-child(2) {
    text-align: center;
  }
  
  .masthead-meta span:nth-child(3) {
    text-align: right;
  }

  .main-layout {
    grid-template-columns: 1fr 3fr;
  }

  .side-col {
    border-right: 1px solid var(--color-border);
    padding: calc(var(--spacing) * 4) calc(var(--spacing) * 3);
  }

  .main-content {
    padding: 0;
  }

  .hero-block {
    padding: calc(var(--spacing) * 6) calc(var(--spacing) * 4);
  }

  .hero-image-container {
    height: 450px;
  }

  .project-card {
    padding: calc(var(--spacing) * 4);
  }

  .site-nav a {
    flex-grow: 0;
    padding: calc(var(--spacing) * 2) calc(var(--spacing) * 4);
  }
}

@media (min-width: 1024px) {
  .main-layout {
    grid-template-columns: 340px 1fr;
  }
}
```

## section:layout:home

```html
<div class="site-wrapper">
  <nav class="site-nav" aria-label="Primary">
    <a href="/" class="nav-link">Index</a>
    <a href="/projects" class="nav-link">Systems Directory</a>
    <a href="/designs" class="nav-link">Visual Portfolio</a>
    <a href="/about" class="nav-link">Profile</a>
    <a href="/contact" class="nav-link">Contact</a>
  </nav>

  <header class="masthead">
    <img src="assets/logo.png" alt="Greg Iteen Monogram" class="masthead-logo" />
    <h1 class="masthead-title">The Iteen Protocol</h1>
    <div class="masthead-meta">
      <span>ENG. DEPT: GREG ITEEN</span>
      <span>EST. 2012 / HIGH-DENSITY ARCHITECTURE</span>
      <span>VOL. XXIV NO. II</span>
    </div>
  </header>

  <section class="hero-image-container" style="background-image: url('assets/hero.jpg');" aria-label="Hero Visual"></section>

  <div class="main-layout">
    <aside class="side-col">
      <div style="margin-bottom: calc(var(--spacing) * 3);">
        <h3 style="font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; margin-bottom: var(--spacing); color: var(--color-accent);">Core Thesis</h3>
        <p style="font-size: 14px; text-align: justify;">Architecting native computer engines optimized for raw-level file interfaces. Bypassing bloated hypervisors to secure microsecond data loops. Highly optimized, predictable digital tools.</p>
      </div>
      <hr style="border: 0; border-top: 1px solid var(--color-border); margin: calc(var(--spacing) * 2) 0;" />
      <div style="margin-bottom: calc(var(--spacing) * 3);">
        <h3 style="font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; margin-bottom: var(--spacing);">Operational Directives</h3>
        <ul style="list-style: none; font-family: var(--font-mono); font-size: 11px; line-height: 1.8;">
          <li>[01] LOCAL FILE NATIVE</li>
          <li>[02] LOWEST ABSOLUTE LATENCY</li>
          <li>[03] EXPLICIT MEMORY CONTROL</li>
          <li>[04] NO COMPROMISES ON DATA AGENCY</li>
        </ul>
      </div>
      <hr style="border: 0; border-top: 1px solid var(--color-border); margin: calc(var(--spacing) * 2) 0;" />
      <div>
        {{GENERATOR_FORM}}
      </div>
    </aside>

    <main class="main-content">
      <article class="hero-block">
        <h2 class="hero-headline">{{HEADLINE}}</h2>
        <p class="hero-intro">{{INTRO}}</p>
        <p style="font-family: var(--font-mono); font-size: 12px; color: var(--color-accent); margin-top: calc(var(--spacing) * 2); text-transform: uppercase;">TAGLINE: {{TAGLINE}}</p>
      </article>

      <div class="section-title">
        <span>FEATURED UTILITIES</span>
        <span>TOTAL SHIPPED [{{FEATURED_COUNT}}]</span>
      </div>

      <section class="project-grid">
        {{FEATURED_PROJECTS}}
      </section>
    </main>
  </div>

  <footer class="footer">
    &copy; Greg Iteen. All rights reserved. Built with raw editorial layouts. No templates used.
  </footer>
</div>
```

## section:layout:projects_index

```html
<div class="site-wrapper">
  <nav class="site-nav" aria-label="Primary">
    <a href="/" class="nav-link">Index</a>
    <a href="/projects" class="nav-link" style="border-bottom: 2px solid var(--color-accent);">Systems Directory</a>
    <a href="/designs" class="nav-link">Visual Portfolio</a>
    <a href="/about" class="nav-link">Profile</a>
    <a href="/contact" class="nav-link">Contact</a>
  </nav>

  <header class="masthead">
    <h1 class="masthead-title">Systems Directory</h1>
    <div class="masthead-meta">
      <span>CLASSIFIED ARCHIVES</span>
      <span>INDEXED UTILITIES ({{PROJECT_COUNT}})</span>
      <span>VERSION: LOCAL.01</span>
    </div>
  </header>

  <div class="main-layout">
    <aside class="side-col">
      <h3 style="font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; margin-bottom: var(--spacing); color: var(--color-accent);">The Directory</h3>
      <p style="font-size: 14px; text-align: justify;">A comprehensive manifest of active file-native AI software and utility systems designed, engineered, and shipped by Greg Iteen. Pure performance-driven designs.</p>
    </aside>

    <main class="main-content">
      <div class="section-title">
        <span>ALL SYSTEMS COMPILING</span>
        <span>STATUS: ACTIVE</span>
      </div>

      <section class="project-grid">
        {{PROJECT_LIST}}
      </section>
    </main>
  </div>

  <footer class="footer">
    &copy; Greg Iteen. Pure functional design. Classified under broadsheet systems.
  </footer>
</div>
```

## section:layout:designs_index

```html
<div class="site-wrapper">
  <nav class="site-nav" aria-label="Primary">
    <a href="/" class="nav-link">Index</a>
    <a href="/projects" class="nav-link">Systems Directory</a>
    <a href="/designs" class="nav-link" style="border-bottom: 2px solid var(--color-accent);">Visual Portfolio</a>
    <a href="/about" class="nav-link">Profile</a>
    <a href="/contact" class="nav-link">Contact</a>
  </nav>

  <header class="masthead">
    <h1 class="masthead-title">Visual Portfolio</h1>
    <div class="masthead-meta">
      <span>SYSTEM SCHEMATICS & GRAPHICS</span>
      <span>INDEXED WORKS ({{DESIGN_COUNT}})</span>
      <span>SYS.OP: GREG ITEEN</span>
    </div>
  </header>

  <div class="main-layout">
    <aside class="side-col">
      <div style="margin-bottom: calc(var(--spacing) * 3);">
        <h3 style="font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; margin-bottom: var(--spacing); color: var(--color-accent);">Theory of Form</h3>
        <p style="font-size: 14px; text-align: justify; margin-bottom: calc(var(--spacing) * 2);">
          Visual interface designs are treated as high-precision engineering blueprints. We reject soft gradients, simulated depth, and marketing distractions. Layouts utilize pure structural divisions and dynamic asymmetric grids to present performance-critical metrics.
        </p>
        <p style="font-size: 14px; text-align: justify;">
          All visual work adheres strictly to binary typographic hierarchy, absolute alignment systems, and highly structured grid architecture.
        </p>
      </div>
      <hr style="border: 0; border-top: 1px solid var(--color-border); margin: calc(var(--spacing) * 2) 0;" />
      {{GENERATOR_FORM}}
    </aside>

    <main class="main-content">
      <div class="section-title">
        <span>INTERFACE BLUEPRINTS & ARCHITECTURE</span>
        <span>CATALOGUE STATUS: ARCHIVED</span>
      </div>

      <div class="project-grid">
        {{DESIGN_CARDS}}
      </div>
    </main>
  </div>

  <footer class="footer">
    &copy; Greg Iteen. Pure functional design. Calculated grid alignments only.
  </footer>
</div>
```

## section:layout:project_detail

```html
<div class="site-wrapper">
  <nav class="site-nav" aria-label="Primary">
    <a href="/" class="nav-link">Index</a>
    <a href="/projects" class="nav-link" style="border-bottom: 2px solid var(--color-accent);">Systems Directory</a>
    <a href="/designs" class="nav-link">Visual Portfolio</a>
    <a href="/about" class="nav-link">Profile</a>
    <a href="/contact" class="nav-link">Contact</a>
  </nav>

  <header class="masthead">
    <h1 class="masthead-title">Technical Manifest</h1>
    <div class="masthead-meta">
      <span>DEPT: ENGINE INFRASTRUCTURE</span>
      <span>PROJECT REVIEW</span>
      <span>{{BACKLINK}}</span>
    </div>
  </header>

  <div class="main-layout">
    <aside class="side-col">
      <div style="margin-bottom: calc(var(--spacing) * 3);">
        <div style="width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; filter: grayscale(100%); margin-bottom: calc(var(--spacing) * 2); border: 1px solid var(--color-border);">
          {{LOGO}}
        </div>
        <h2 style="font-family: var(--font-display); font-size: 2.2rem; font-weight: 900; line-height: 1.0; margin: calc(var(--spacing) * 2) 0; letter-spacing: -0.03em;">{{NAME}}</h2>
        <p style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--color-accent); margin-bottom: calc(var(--spacing) * 3);">
          SYSTEM IDENTIFICATION RECORD
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 12px; margin-bottom: calc(var(--spacing) * 3);">
        <tbody>
          <tr style="border-bottom: 1px solid var(--color-border-light);">
            <td style="padding: var(--spacing) 0; font-weight: bold; text-transform: uppercase;">Year</td>
            <td style="padding: var(--spacing) 0; text-align: right;">{{YEAR}}</td>
          </tr>
          <tr style="border-bottom: 1px solid var(--color-border-light);">
            <td style="padding: var(--spacing) 0; font-weight: bold; text-transform: uppercase;">Role</td>
            <td style="padding: var(--spacing) 0; text-align: right;">{{ROLE}}</td>
          </tr>
          <tr style="border-bottom: 1px solid var(--color-border-light);">
            <td style="padding: var(--spacing) 0; font-weight: bold; text-transform: uppercase;">Source</td>
            <td style="padding: var(--spacing) 0; text-align: right; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{SOURCE_PATH}}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-bottom: calc(var(--spacing) * 3);">
        <h4 style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; margin-bottom: var(--spacing); color: var(--color-text);">System Badges</h4>
        <div class="project-tags" style="margin-top: var(--spacing);">
          {{TECH_BADGES}}
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--spacing);">
        {{REPO_LINK}}
        {{PROJECT_LINK}}
      </div>
    </aside>

    <main class="main-content">
      <article class="hero-block" style="border-bottom: none;">
        <div style="border-bottom: 1px solid var(--color-border); padding-bottom: calc(var(--spacing) * 3); margin-bottom: calc(var(--spacing) * 3);">
          <h3 style="font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; margin-bottom: calc(var(--spacing) * 2); color: var(--color-accent);">
            System Overview
          </h3>
          <p class="hero-intro" style="font-size: 1.3rem; line-height: 1.5; font-family: var(--font-display); font-weight: normal; color: var(--color-text);">
            {{DESCRIPTION}}
          </p>
        </div>

        <div class="editorial-content" style="max-width: 780px;">
          {{CONTENT}}
        </div>
      </article>
    </main>
  </div>

  <footer class="footer">
    &copy; Greg Iteen. Hard technical documentation. Transmission complete.
  </footer>
</div>
```

## section:layout:design_detail

```html
<div class="site-wrapper">
  <nav class="site-nav" aria-label="Primary">
    <a href="/" class="nav-link">Index</a>
    <a href="/projects" class="nav-link">Systems Directory</a>
    <a href="/designs" class="nav-link" style="border-bottom: 2px solid var(--color-accent);">Visual Portfolio</a>
    <a href="/about" class="nav-link">Profile</a>
    <a href="/contact" class="nav-link">Contact</a>
  </nav>

  <header class="masthead">
    <h1 class="masthead-title">Design Blueprint</h1>
    <div class="masthead-meta">
      <span>DEPT: VISUAL SYSTEMS</span>
      <span>SCHEMATIC ANALYSIS</span>
      <span>{{BACKLINK}}</span>
    </div>
  </header>

  <div class="main-layout">
    <aside class="side-col">
      <div style="margin-bottom: calc(var(--spacing) * 3);">
        <h2 style="font-family: var(--font-display); font-size: 2.2rem; font-weight: 900; line-height: 1.0; margin-bottom: calc(var(--spacing) * 1); letter-spacing: -0.03em;">{{NAME}}</h2>
        <p style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--color-accent); margin-bottom: calc(var(--spacing) * 3);">
          VISUAL ARCHIVE DATA SHEET
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 12px; margin-bottom: calc(var(--spacing) * 3);">
        <tbody>
          <tr style="border-bottom: 1px solid var(--color-border-light);">
            <td style="padding: var(--spacing) 0; font-weight: bold; text-transform: uppercase;">Client</td>
            <td style="padding: var(--spacing) 0; text-align: right;">{{CLIENT}}</td>
          </tr>
          <tr style="border-bottom: 1px solid var(--color-border-light);">
            <td style="padding: var(--spacing) 0; font-weight: bold; text-transform: uppercase;">Year</td>
            <td style="padding: var(--spacing) 0; text-align: right;">{{YEAR}}</td>
          </tr>
          <tr style="border-bottom: 1px solid var(--color-border-light);">
            <td style="padding: var(--spacing) 0; font-weight: bold; text-transform: uppercase;">Role</td>
            <td style="padding: var(--spacing) 0; text-align: right;">{{ROLE}}</td>
          </tr>
          <tr style="border-bottom: 1px solid var(--color-border-light);">
            <td style="padding: var(--spacing) 0; font-weight: bold; text-transform: uppercase;">Source</td>
            <td style="padding: var(--spacing) 0; text-align: right; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{SOURCE_PATH}}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-bottom: calc(var(--spacing) * 3);">
        <h4 style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; margin-bottom: var(--spacing); color: var(--color-text);">Tags</h4>
        <div class="project-tags" style="margin-top: var(--spacing);">
          {{TAG_BADGES}}
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--spacing);">
        {{LINK_URL}}
      </div>
    </aside>

    <main class="main-content">
      <article class="hero-block" style="border-bottom: none;">
        <div style="margin-bottom: calc(var(--spacing) * 4); border: 1px solid var(--color-border); padding: var(--spacing); background-color: #fafafa;">
          <div style="filter: grayscale(100%) contrast(120%); max-height: 600px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
            {{PREVIEW}}
          </div>
        </div>

        <div style="border-bottom: 1px solid var(--color-border); padding-bottom: calc(var(--spacing) * 3); margin-bottom: calc(var(--spacing) * 3);">
          <h3 style="font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; margin-bottom: calc(var(--spacing) * 2); color: var(--color-accent);">
            Executive Abstract
          </h3>
          <p class="hero-intro" style="font-size: 1.3rem; line-height: 1.5; font-family: var(--font-display); font-weight: normal; color: var(--color-text);">
            {{DESCRIPTION}}
          </p>
        </div>

        <div class="editorial-content" style="max-width: 780px;">
          {{CONTENT}}
        </div>
      </article>
    </main>
  </div>

  <footer class="footer">
    &copy; Greg Iteen. Pure functional design. Calculated grid alignments only.
  </footer>
</div>
```

## section:layout:page

```html
<div class="site-wrapper">
  <nav class="site-nav" aria-label="Primary">
    <a href="/" class="nav-link">Index</a>
    <a href="/projects" class="nav-link">Systems Directory</a>
    <a href="/designs" class="nav-link">Visual Portfolio</a>
    <a href="/about" class="nav-link">Profile</a>
    <a href="/contact" class="nav-link">Contact</a>
  </nav>

  <header class="masthead">
    <h1 class="masthead-title">{{NAME}}</h1>
    <div class="masthead-meta">
      <span>DOCUMENTATION DESK</span>
      <span>RECORD REF: GENERAL</span>
      <span>PATH: {{SOURCE_PATH}}</span>
    </div>
  </header>

  <div class="main-layout">
    <aside class="side-col">
      <div style="margin-bottom: calc(var(--spacing) * 3);">
        <h3 style="font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; margin-bottom: var(--spacing); color: var(--color-accent);">SYSTEM OVERVIEW</h3>
        <p style="font-size: 14px; text-align: justify; line-height: 1.6;">This section outlines Greg Iteen's operational principles, background in low-latency systems development, and options for securing developer integration pipelines.</p>
      </div>
      <hr style="border: 0; border-top: 1px solid var(--color-border); margin: calc(var(--spacing) * 2) 0;" />
      <div>
        <h3 style="font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; margin-bottom: var(--spacing);">SECURE CHANNELS</h3>
        <p style="font-size: 12px; font-family: var(--font-mono); line-height: 1.6; color: #444;">
          All communications are handled over cryptographic and standard mail routes. Zero tracking metrics are retained.
        </p>
      </div>
    </aside>

    <main class="main-content">
      <article class="hero-block" style="border-bottom: none;">
        <div class="editorial-content" style="max-width: 780px;">
          {{CONTENT}}
        </div>
      </article>
    </main>
  </div>

  <style>
    .editorial-content img,
    .editorial-content .md-img {
      max-width: 100%;
      height: auto;
      border: 1px solid var(--color-border);
      filter: grayscale(100%) contrast(120%);
      margin: calc(var(--spacing) * 3) 0;
      display: block;
    }
    .editorial-content blockquote {
      border-left: 3px solid var(--color-accent);
      padding-left: calc(var(--spacing) * 2);
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-style: italic;
      margin: calc(var(--spacing) * 3) 0;
    }
    .editorial-content ul {
      margin-bottom: calc(var(--spacing) * 3);
      padding-left: calc(var(--spacing) * 3);
    }
    .editorial-content li {
      margin-bottom: var(--spacing);
    }
  </style>

  <footer class="footer">
    &copy; Greg Iteen. Pure functional design. Verified editorial output.
  </footer>
</div>
```

## section:layout:project_item

```html
<div class="project-card" style="border-bottom: 1px solid var(--color-border); padding: calc(var(--spacing) * 3) calc(var(--spacing) * 2); display: flex; flex-direction: column; gap: var(--spacing);">
  <div class="project-meta" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border-light); padding-bottom: var(--spacing); margin-bottom: var(--spacing);">
    <span style="font-family: var(--font-mono); font-size: 11px; color: var(--color-accent); font-weight: bold;">RECORD #{{INDEX}}</span>
    <span style="font-family: var(--font-mono); font-size: 11px; color: var(--color-text);">YEAR: {{YEAR}}</span>
  </div>
  <div style="display: flex; align-items: flex-start; gap: calc(var(--spacing) * 2); margin-bottom: var(--spacing);">
    <div style="flex-shrink: 0; filter: grayscale(100%); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--color-border);">
      {{LOGO}}
    </div>
    <div style="flex-grow: 1;">
      <h3 class="project-name" style="margin: 0; font-size: 1.8rem; font-family: var(--font-display); font-weight: 900; line-height: 1.1; letter-spacing: -0.02em;">
        <a href="{{URL}}" style="color: var(--color-text); text-decoration: none;">{{NAME}}</a>
      </h3>
    </div>
  </div>
  <p class="project-description" style="font-family: var(--font-sans); font-size: 14px; line-height: 1.6; color: #333; text-align: justify; margin-bottom: calc(var(--spacing) * 2);">
    {{DESCRIPTION}}
  </p>
  <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: calc(var(--spacing) * 2); padding-top: var(--spacing); border-top: 1px dotted var(--color-border-light);">
    <div class="project-tags" style="display: flex; flex-wrap: wrap; gap: 4px;">
      {{TECH_BADGES}}
    </div>
    <div style="display: flex; gap: calc(var(--spacing) * 2); align-items: center;">
      {{REPO_URL}}
      <a href="{{URL}}" style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--color-accent); font-weight: bold; border-bottom: 1px solid var(--color-accent); padding-bottom: 2px; min-height: 44px; display: inline-flex; align-items: center; text-decoration: none;">
        Manifest &rarr;
      </a>
    </div>
  </div>
</div>
```

## section:layout:design_item

```html
<div class="project-card" style="border-bottom: 1px solid var(--color-border); padding: calc(var(--spacing) * 3) calc(var(--spacing) * 2); display: flex; flex-direction: column; gap: calc(var(--spacing) * 2);">
  <div style="display: flex; flex-direction: column; gap: var(--spacing);">
    <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 11px; border-bottom: 1px solid var(--color-border-light); padding-bottom: var(--spacing); text-transform: uppercase;">
      <span>CLIENT: {{CLIENT}}</span>
      <span style="color: var(--color-accent); font-weight: bold;">ARCHIVE // {{YEAR}}</span>
    </div>
    <h3 class="project-name" style="margin: 0; font-size: 1.6rem; font-family: var(--font-display); font-weight: 900; line-height: 1.1; letter-spacing: -0.02em;">
      <a href="{{URL}}" style="color: var(--color-text); text-decoration: none;">{{NAME}}</a>
    </h3>
  </div>
  
  <div style="filter: grayscale(100%) contrast(120%); border: 1px solid var(--color-border); max-height: 240px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #fafafa;">
    {{PREVIEW}}
  </div>
  
  <p class="project-description" style="font-family: var(--font-sans); font-size: 14px; line-height: 1.5; color: #444; margin: 0; text-align: justify;">
    {{DESCRIPTION}}
  </p>
  
  <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dotted var(--color-border-light); padding-top: var(--spacing); flex-wrap: wrap; gap: var(--spacing);">
    <div class="project-tags" style="display: flex; flex-wrap: wrap; gap: 4px;">
      {{TAG_BADGES}}
    </div>
    <a href="{{URL}}" style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--color-text); font-weight: bold; border-bottom: 1px solid var(--color-border); padding-bottom: 2px; min-height: 44px; display: inline-flex; align-items: center; text-decoration: none;">
      Schematic &rarr;
    </a>
  </div>
</div>
```

## section:layout:nav_item

```html
<a href="{{NAV_URL}}" class="nav-link {{NAV_ACTIVE_CLASS}}" style="min-height: var(--touch-target); display: inline-flex; align-items: center; justify-content: center; text-transform: uppercase; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; border-right: 1px solid var(--color-border); flex-grow: 1; padding: calc(var(--spacing) * 2); text-decoration: none;">{{NAV_NAME}}</a>
```
