---
type: page
slug: "design-a-sleek-cutting-edge-creative-agency-wit"
name: "NEURAL_STATIC"
title: "NEURAL_STATIC — Design Spec"
description: "AI-generated design: \"A sleek, cutting-edge creative agency with deep dark mode aesthetics, neon green accents, bold brutalist typography, and stark high-contrast layouts. The vibe is mysterious, high-end, and rebellious.\""
timestamp: "2026-07-07T11:03:17.179Z"
sandbox_entry: "designs/a-sleek-cutting-edge-creative-agency-wit/index.html"
x_kind: "design"
x_year: "2026"
x_role: "AI-Generated Theme"
x_client: "Portfolio Generator"
x_tags:
  - "AI Generated"
  - "Theme"
x_preview: "/designs/a-sleek-cutting-edge-creative-agency-wit/assets/hero.jpg"
x_logo: "/designs/a-sleek-cutting-edge-creative-agency-wit/assets/logo.png"
x_link: "/designs/a-sleek-cutting-edge-creative-agency-wit/index.html"
---

# Design System

---
colors:
  bg: "#090A0C"
  bg_elevated: "#121418"
  bg_deep: "#050607"
  accent: "#00FF55"
  accent_dim: "rgba(0, 255, 85, 0.08)"
  border: "#22262B"
  text_primary: "#FFFFFF"
  text_muted: "#8E96A0"
typography:
  display_stack: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  code_stack: "ui-monospace, SFMono-Regular, 'SF Pro Mono', Menlo, Monaco, Consolas, monospace"
  sizes:
    display: "2.5rem"
    meta: "0.75rem"
    body: "0.95rem"
spacing:
  grid_unit: "8px"
  touch_target: "44px"
---

# DESIGN.md (NEURAL_STATIC Visual Specification)

## 1. Architectural Intent
This visual identity is designed for Greg Iteen, a systems engineer building file-native AI software. It rejects standard SaaS gradients, warm rounded cards, and generic decorative iconography in favor of an austere, high-contrast digital ledger aesthetic. The typography is brutally structured using a strict grid layout, razor-thin borders, and neon-green accents reminiscent of physical terminal instruments.

## 2. Layout Strategy (Mobile-First)
- **Mobile Base Layer**: A single-column grid with strict vertical borders. No overlapping layers or excessive margins. Standard interactive elements expand to fill the horizontal bounds to maximize the touch-target surface areas.
- **Desktop Scale-up (min-width: 768px)**: Expands into asymmetric multi-column splits. The layouts partition system metadata and primary documentation cleanly into logical columns separated by precise border rules.
- **Borders**: All primary sections are divided by exact `1px solid var(--border)` rules, reinforcing a CAD-like blueprints feeling.

## 3. Typography & Voice
- **Typography**: Large-scale titles use tracking compression (`letter-spacing: -0.04em`) and maximum weight to form visual architectural blocks. Metadata and utility labels use a monospace system stack to represent code paths and direct file-system attributes.
- **Copy Tone**: Severely professional, analytical, and highly technical. Entirely devoid of marketese, buzzwords, or expressive emojis. Every label refers strictly to technical artifacts, file structures, or performance outputs.

## 4. Interactive Micro-dynamics
- Interactive states do not use standard scale transforms. Instead, hover triggers a binary state change: an instant inverted background block or a neon-green monospace cursor symbol injection. These sharp micro-animations mirror the instant execution of local terminal commands.

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
/* ==========================================================================
   NEURAL_STATIC STYLESHEET (Mobile-First, Strictly Valid Custom CSS)
   ========================================================================== */

:root {
  --bg: #090A0C;
  --bg-elevated: #111317;
  --bg-deep: #050607;
  --accent: #00FF55;
  --accent-dim: rgba(0, 255, 85, 0.08);
  --border: #22262B;
  --text: #FFFFFF;
  --text-muted: #8E96A0;
  --font-display: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-code: ui-monospace, SFMono-Regular, "SF Pro Mono", Menlo, Monaco, Consolas, monospace;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg);
  color: var(--text);
  font-family: var(--font-display);
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

/* Tap targets compliance */
a, button, .interactive-trigger {
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  transition: color 0.08s steps(2), background-color 0.08s steps(2), border-color 0.08s steps(2);
}

/* Layout Wrapper */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

/* Header and Global Navigation */
header.global-header {
  border-bottom: 1px solid var(--border);
  background-color: var(--bg-deep);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.logo-wrap {
  display: flex;
  align-items: center;
}

.logo-img {
  height: 32px;
  width: auto;
  filter: brightness(0) invert(1);
}

.nav-menu {
  display: flex;
  gap: 8px;
}

.nav-link {
  font-family: var(--font-code);
  font-size: 11px;
  text-transform: uppercase;
  padding: 0 16px;
  border: 1px solid transparent;
  height: 44px;
  letter-spacing: 0.05em;
}

.nav-link:hover, .nav-link.active {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-dim);
}

/* Main Hero Design */
.hero-section {
  position: relative;
  padding: 48px 0;
  border-bottom: 1px solid var(--border);
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(to bottom, rgba(9, 10, 12, 0.96), #090A0C), url('assets/hero.jpg');
  background-size: cover;
  background-position: center;
  z-index: 1;
  opacity: 0.12;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.sys-status-bar {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--bg-elevated);
  border: 1px solid var(--border);
  padding: 4px 12px;
  font-family: var(--font-code);
  font-size: 11px;
  letter-spacing: 0.05em;
  color: var(--accent);
  margin-bottom: 24px;
}

.status-dot {
  width: 6px;
  height: 6px;
  background-color: var(--accent);
  box-shadow: 0 0 8px var(--accent);
  animation: pulse 1.8s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.hero-title {
  font-size: 32px;
  font-weight: 900;
  line-height: 1.05;
  text-transform: uppercase;
  letter-spacing: -0.04em;
  margin-bottom: 16px;
}

.hero-title span {
  color: var(--accent);
}

.hero-lead {
  font-size: 16px;
  color: var(--text-muted);
  max-width: 600px;
  margin-bottom: 32px;
}

/* Technical Grid Blocks */
.panel-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-top: 32px;
}

.tech-panel {
  background-color: var(--bg-elevated);
  border: 1px solid var(--border);
  padding: 24px;
  position: relative;
}

.tech-panel::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background-color: var(--accent);
  opacity: 0;
  transition: opacity 0.1s steps(2);
}

.tech-panel:hover::before {
  opacity: 1;
}

.panel-label {
  font-family: var(--font-code);
  font-size: 11px;
  color: var(--accent);
  text-transform: uppercase;
  margin-bottom: 12px;
  display: block;
}

.panel-heading {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.panel-body {
  font-size: 14px;
  color: var(--text-muted);
}

/* Project Lists (Directory Format) */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid var(--border);
  padding: 32px 0 16px;
  margin-bottom: 24px;
}

.section-title {
  font-family: var(--font-code);
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.section-count {
  font-family: var(--font-code);
  font-size: 11px;
  color: var(--accent);
}

.project-directory {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
}

.directory-row {
  display: grid;
  grid-template-columns: 1fr;
  border-bottom: 1px solid var(--border);
  background-color: var(--bg-deep);
  transition: background-color 0.1s steps(2);
}

.directory-row:last-child {
  border-bottom: none;
}

.directory-row:hover {
  background-color: var(--bg-elevated);
}

.dir-cell {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.dir-meta {
  font-family: var(--font-code);
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.dir-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  transition: color 0.1s steps(2);
}

.directory-row:hover .dir-title {
  color: var(--accent);
}

.dir-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 8px;
  line-height: 1.4;
}

.dir-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.badge {
  font-family: var(--font-code);
  font-size: 10px;
  background-color: var(--bg);
  border: 1px solid var(--border);
  color: var(--text-muted);
  padding: 2px 8px;
  text-transform: uppercase;
}

/* Designs Index Grid */
.design-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-top: 24px;
}

.design-card {
  border: 1px solid var(--border);
  background-color: var(--bg-deep);
  display: flex;
  flex-direction: column;
  transition: border-color 0.1s steps(2);
}

.design-card:hover {
  border-color: var(--accent);
}

.design-preview-wrap {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background-color: var(--bg-elevated);
  border-bottom: 1px solid var(--border);
  position: relative;
}

.design-preview-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(1) contrast(1.15);
  transition: filter 0.15s ease-in-out;
}

.design-card:hover .design-preview-wrap img {
  filter: grayscale(0) contrast(1.05);
}

.design-info {
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.design-meta {
  font-family: var(--font-code);
  font-size: 11px;
  color: var(--accent);
  margin-bottom: 8px;
  text-transform: uppercase;
}

.design-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text);
}

.design-desc {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.4;
  margin-bottom: 16px;
  flex-grow: 1;
}

.design-link-btn {
  margin-top: auto;
  align-self: flex-start;
  font-family: var(--font-code);
  font-size: 11px;
  color: var(--text);
  border: 1px solid var(--border);
  padding: 0 16px;
  height: 44px;
  align-items: center;
  display: inline-flex;
  text-transform: uppercase;
}

.design-card:hover .design-link-btn {
  border-color: var(--accent);
  background-color: var(--accent-dim);
  color: var(--accent);
}

/* Form Element Integration */
.system-terminal-form {
  border: 1px solid var(--border);
  background: var(--bg-deep);
  padding: 24px;
  margin-top: 40px;
}

.form-input-wrap {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-family: var(--font-code);
  font-size: 11px;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  background-color: var(--bg);
  border: 1px solid var(--border);
  color: var(--text);
  font-family: var(--font-code);
  font-size: 14px;
  padding: 12px;
  outline: none;
  border-radius: 0;
  -webkit-appearance: none;
}

.form-input:focus {
  border-color: var(--accent);
}

.btn-primary {
  background-color: var(--accent);
  color: var(--bg);
  font-family: var(--font-code);
  font-weight: 700;
  text-transform: uppercase;
  font-size: 12px;
  border: none;
  padding: 0 24px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  transition: opacity 0.1s steps(2);
}

.btn-primary:hover {
  opacity: 0.9;
}

/* Detail Layouts */
.backlink-bar {
  margin-bottom: 24px;
}

.back-btn {
  font-family: var(--font-code);
  font-size: 11px;
  text-transform: uppercase;
  color: var(--accent);
  border: 1px solid var(--border);
  padding: 0 16px;
  height: 44px;
  display: inline-flex;
  align-items: center;
}

.back-btn:hover {
  background: var(--accent-dim);
  border-color: var(--accent);
}

.detail-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  margin-top: 24px;
}

.meta-sidebar {
  border: 1px solid var(--border);
  background-color: var(--bg-deep);
  padding: 24px;
}

.meta-block {
  margin-bottom: 20px;
}

.meta-block:last-child {
  margin-bottom: 0;
}

.meta-label {
  font-family: var(--font-code);
  font-size: 11px;
  color: var(--accent);
  text-transform: uppercase;
  display: block;
  margin-bottom: 6px;
}

.meta-val {
  font-size: 14px;
  color: var(--text);
}

.meta-val.mono {
  font-family: var(--font-code);
  font-size: 13px;
}

.tech-list,
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.project-header,
.design-header,
.page-header {
  border-bottom: 1px solid var(--border);
  padding-bottom: 24px;
  margin-bottom: 32px;
}

.project-logo-wrap {
  margin-bottom: 16px;
}

.project-logo {
  height: 40px;
  width: auto;
  filter: brightness(0) invert(1);
}

.project-main-title,
.design-main-title,
.page-title {
  font-size: 32px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.04em;
  line-height: 1.1;
  margin-bottom: 12px;
}

.project-tagline,
.design-tagline {
  font-size: 18px;
  color: var(--text-muted);
  line-height: 1.4;
}

.preview-stage {
  border: 1px solid var(--border);
  background-color: var(--bg-deep);
  padding: 8px;
  margin-bottom: 32px;
  position: relative;
}

.preview-stage img {
  width: 100%;
  height: auto;
  display: block;
  filter: grayscale(1) contrast(1.15);
  transition: filter 0.3s ease;
  border: 1px solid var(--border);
}

.preview-stage:hover img {
  filter: grayscale(0) contrast(1.02);
}

/* Document Content Styling (Markdown Containers) */
.project-markdown,
.design-markdown,
.page-content {
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1.6;
}

.project-markdown h1, .project-markdown h2, .project-markdown h3,
.design-markdown h1, .design-markdown h2, .design-markdown h3,
.page-content h1, .page-content h2, .page-content h3 {
  color: var(--text);
  font-weight: 700;
  text-transform: uppercase;
  margin: 32px 0 16px;
  letter-spacing: -0.02em;
}

.project-markdown h2, .design-markdown h2, .page-content h2 {
  font-size: 22px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
}

.project-markdown h3, .design-markdown h3, .page-content h3 {
  font-size: 18px;
}

.project-markdown p, .design-markdown p, .page-content p {
  margin-bottom: 16px;
}

.project-markdown ul, .project-markdown ol,
.design-markdown ul, .design-markdown ol,
.page-content ul, .page-content ol {
  margin-bottom: 24px;
  padding-left: 20px;
}

.project-markdown li, .design-markdown li, .page-content li {
  margin-bottom: 8px;
}

.project-markdown code, .page-content code {
  font-family: var(--font-code);
  background-color: var(--bg-elevated);
  padding: 2px 6px;
  border: 1px solid var(--border);
  font-size: 13px;
  color: var(--accent);
}

.project-markdown pre, .page-content pre {
  background-color: var(--bg-deep);
  border: 1px solid var(--border);
  padding: 16px;
  overflow-x: auto;
  margin-bottom: 20px;
}

.project-markdown pre code, .page-content pre code {
  background: none;
  border: none;
  padding: 0;
  color: var(--text);
}

.page-content .md-img {
  display: block;
  max-width: 100%;
  height: auto;
  border: 1px solid var(--border);
  background-color: var(--bg-deep);
  padding: 8px;
  margin: 32px 0;
  filter: grayscale(1) contrast(1.2);
  transition: filter 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease;
}

.page-content .md-img:hover {
  filter: grayscale(0.2) contrast(1.1);
  border-color: var(--accent);
}

.page-content a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 4px;
  display: inline;
  min-height: auto;
  min-width: auto;
}

.page-content a:hover {
  background-color: var(--accent-dim);
  color: #FFFFFF;
}

.page-content table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 24px;
  font-family: var(--font-code);
  font-size: 13px;
}

.page-content th, .page-content td {
  border: 1px solid var(--border);
  padding: 12px;
  text-align: left;
}

.page-content th {
  background-color: var(--bg-deep);
  color: var(--accent);
  text-transform: uppercase;
}

.action-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 24px;
}

.action-btn {
  width: 100%;
  justify-content: center;
  font-family: var(--font-code);
  font-size: 12px;
  text-transform: uppercase;
  height: 44px;
  border: 1px solid var(--border);
  color: var(--text);
}

.action-btn:hover {
  border-color: var(--accent);
  background: var(--accent-dim);
  color: var(--accent);
}

.page-meta {
  font-family: var(--font-code);
  font-size: 11px;
  color: var(--accent);
  text-transform: uppercase;
  margin-bottom: 8px;
  display: block;
}

/* Footer block */
footer.global-footer {
  border-top: 1px solid var(--border);
  margin-top: 64px;
  padding: 48px 0;
  background-color: var(--bg-deep);
  font-family: var(--font-code);
  font-size: 11px;
  color: var(--text-muted);
}

.footer-inner {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ==========================================================================
   RESPONSIVE DESIGN (Scale Up)
   ========================================================================== */
@media (min-width: 768px) {
  .hero-title {
    font-size: 56px;
  }
  
  .panel-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .directory-row {
    grid-template-columns: 200px 1fr 250px;
  }

  .dir-cell {
    padding: 20px 24px;
  }

  .dir-desc {
    margin-top: 0;
  }

  .dir-badges {
    justify-content: flex-end;
    margin-top: 0;
  }

  .design-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .detail-layout {
    grid-template-columns: 280px 1fr;
    align-items: start;
  }

  .footer-inner {
    flex-direction: row;
    justify-content: space-between;
  }
}
```

## section:layout:home

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{HEADLINE}} — Portfolio</title>
  <link rel="icon" href="assets/favicon.png">
  <link rel="stylesheet" href="theme.css">
</head>
<body>
  <header class="global-header">
    <div class="container header-inner">
      <div class="logo-wrap">
        <img src="assets/logo.png" alt="GI Logo" class="logo-img">
      </div>
      <nav class="nav-menu">
        <a href="/" class="nav-link active">Index</a>
        <a href="/projects" class="nav-link">System</a>
        <a href="/designs" class="nav-link">Output</a>
        <a href="/about" class="nav-link">Specs</a>
      </nav>
    </div>
  </header>

  <main class="container">
    <!-- HERO SECTION WITH BACKGROUND -->
    <section class="hero-section">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <div class="sys-status-bar">
          <span class="status-dot"></span>
          <span>RUNNING // LOCAL_BUILD.v2</span>
        </div>
        <h1 class="hero-title">{{HEADLINE}}</h1>
        <p class="hero-lead">{{TAGLINE}} {{INTRO}}</p>
      </div>
    </section>

    <!-- TECHNICAL BLUEPRINTS GRID -->
    <section class="panel-grid">
      <div class="tech-panel">
        <span class="panel-label">01 / PARSING</span>
        <h3 class="panel-heading">File-Native Execution</h3>
        <p class="panel-body">Processing unstructured datasets without pipeline overhead or heavy relational systems. Zero latency dependency layers.</p>
      </div>
      <div class="tech-panel">
        <span class="panel-label">02 / RUNTIME</span>
        <h3 class="panel-heading">Isolated Pipelines</h3>
        <p class="panel-body">Dedicated local configurations optimized for immediate execution directly on physical file arrays.</p>
      </div>
      <div class="tech-panel">
        <span class="panel-label">03 / INTERFACE</span>
        <h3 class="panel-heading">Stark Controls</h3>
        <p class="panel-body">Replacing generic dashboard abstractions with exact, machine-readable interfaces and automated file trees.</p>
      </div>
    </section>

    <!-- DIRECTORY / PROJECTS SECTION -->
    <section>
      <div class="section-header">
        <h2 class="section-title">Featured Deployments</h2>
        <span class="section-count">{{FEATURED_COUNT}} Active Nodes</span>
      </div>

      <div class="project-directory">
        {{FEATURED_PROJECTS}}
      </div>
    </section>

    <!-- GENERATOR FORM CONTEXT -->
    <section class="system-terminal-form">
      <h3 class="panel-heading" style="margin-bottom: 8px;">System Telemetry Probe</h3>
      <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 24px;">Register local endpoint attributes to test remote file-system ingestion pipeline compatibility.</p>
      {{GENERATOR_FORM}}
    </section>
  </main>

  <footer class="global-footer">
    <div class="container footer-inner">
      <div>SYSTEM CORE: GREG ITEEN &copy; 2026. ALL METRICS NORMAL.</div>
      <div>LATENCY: 0.12ms // ARCH: x86-64 LOCAL</div>
    </div>
  </footer>
</body>
</html>
```

## section:layout:projects_index

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>System Directory — Projects</title>
  <link rel="icon" href="assets/favicon.png">
  <link rel="stylesheet" href="theme.css">
</head>
<body>
  <header class="global-header">
    <div class="container header-inner">
      <div class="logo-wrap">
        <img src="assets/logo.png" alt="GI Logo" class="logo-img">
      </div>
      <nav class="nav-menu">
        <a href="/" class="nav-link">Index</a>
        <a href="/projects" class="nav-link active">System</a>
        <a href="/designs" class="nav-link">Output</a>
        <a href="/about" class="nav-link">Specs</a>
      </nav>
    </div>
  </header>

  <main class="container">
    <section class="hero-section" style="padding: 32px 0;">
      <div class="hero-content">
        <div class="sys-status-bar">
          <span class="status-dot"></span>
          <span>DIRECTORY STATUS: ALL SYSTEMS PARSED</span>
        </div>
        <h1 class="hero-title" style="font-size: 38px;">ENGINEERING SCHEMATICS</h1>
        <p class="hero-lead" style="margin-bottom: 0;">Functional projects index detailing structural data models, terminal parsing architecture, and high-performance pipeline configurations.</p>
      </div>
    </section>

    <section>
      <div class="section-header">
        <h2 class="section-title">Index Manifest</h2>
        <span class="section-count">{{PROJECT_COUNT}} Projects Loaded</span>
      </div>

      <div class="project-directory">
        {{PROJECT_LIST}}
      </div>
    </section>
  </main>

  <footer class="global-footer">
    <div class="container footer-inner">
      <div>SYSTEM CORE: GREG ITEEN &copy; 2026. ALL METRICS NORMAL.</div>
      <div>LATENCY: 0.12ms // ARCH: x86-64 LOCAL</div>
    </div>
  </footer>
</body>
</html>
```

## section:layout:designs_index

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>System Output Manifest — Greg Iteen</title>
  <link rel="icon" href="assets/favicon.png">
  <link rel="stylesheet" href="theme.css">
</head>
<body>
  <header class="global-header">
    <div class="container header-inner">
      <div class="logo-wrap">
        <img src="assets/logo.png" alt="GI Logo" class="logo-img">
      </div>
      <nav class="nav-menu">
        <a href="/" class="nav-link">Index</a>
        <a href="/projects" class="nav-link">System</a>
        <a href="/designs" class="nav-link active">Output</a>
        <a href="/about" class="nav-link">Specs</a>
      </nav>
    </div>
  </header>

  <main class="container">
    <section class="hero-section" style="padding: 32px 0;">
      <div class="hero-content">
        <div class="sys-status-bar">
          <span class="status-dot"></span>
          <span>RENDER MATRIX: ACTIVE</span>
        </div>
        <h1 class="hero-title" style="font-size: 38px;">GRAPHIC SYSTEM OUTPUTS</h1>
        <p class="hero-lead" style="margin-bottom: 0;">Architectural mockups, CAD-like schematics, and functional user interfaces mapped directly to terminal file systems and analytical instrumentation tools.</p>
      </div>
    </section>

    <section>
      <div class="section-header">
        <h2 class="section-title">Visual Modules Index</h2>
        <span class="section-count">{{DESIGN_COUNT}} Schematics Loaded</span>
      </div>

      <div class="design-grid">
        {{DESIGN_CARDS}}
      </div>
    </section>

    <!-- TERMINAL TELEMETRY INTERFACE -->
    <section class="system-terminal-form" style="margin-top: 64px;">
      <h3 class="panel-heading" style="margin-bottom: 8px;">Remote Display Query</h3>
      <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 24px;">Initialize display capability evaluation. Submit client endpoint dimensions to calibrate interface rendering engine parameters.</p>
      {{GENERATOR_FORM}}
    </section>
  </main>

  <footer class="global-footer">
    <div class="container footer-inner">
      <div>SYSTEM CORE: GREG ITEEN &copy; 2026. ALL METRICS NORMAL.</div>
      <div>LATENCY: 0.12ms // ARCH: x86-64 LOCAL</div>
    </div>
  </footer>
</body>
</html>
```

## section:layout:project_detail

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{NAME}} — System Engineering Detail</title>
  <link rel="icon" href="assets/favicon.png">
  <link rel="stylesheet" href="theme.css">
</head>
<body>
  <header class="global-header">
    <div class="container header-inner">
      <div class="logo-wrap">
        <img src="assets/logo.png" alt="GI Logo" class="logo-img">
      </div>
      <nav class="nav-menu">
        <a href="/" class="nav-link">Index</a>
        <a href="/projects" class="nav-link active">System</a>
        <a href="/designs" class="nav-link">Output</a>
        <a href="/about" class="nav-link">Specs</a>
      </nav>
    </div>
  </header>

  <main class="container">
    <div class="backlink-bar">
      {{BACKLINK}}
    </div>

    <div class="detail-layout">
      <!-- LEFT COLUMN: SYSTEM SPEC SHEETS -->
      <aside class="meta-sidebar">
        <div class="meta-block">
          <span class="meta-label">System Identification</span>
          <span class="meta-val mono">{{SOURCE_PATH}}</span>
        </div>
        
        <div class="meta-block">
          <span class="meta-label">Deployment Year</span>
          <span class="meta-val">{{YEAR}}</span>
        </div>

        <div class="meta-block">
          <span class="meta-label">Architecture Role</span>
          <span class="meta-val">{{ROLE}}</span>
        </div>

        <div class="meta-block">
          <span class="meta-label">Core Technology Stack</span>
          <div class="tech-list">
            {{TECH_BADGES}}
          </div>
        </div>

        <div class="action-links">
          {{REPO_LINK}}
          {{PROJECT_LINK}}
        </div>
      </aside>

      <!-- RIGHT COLUMN: SCHEMATICS & WORKINGS -->
      <article>
        <header class="project-header">
          <div class="project-logo-wrap">
            {{LOGO}}
          </div>
          <h1 class="project-main-title">{{NAME}}</h1>
          <p class="project-tagline">{{DESCRIPTION}}</p>
        </header>

        <div class="project-markdown">
          {{CONTENT}}
        </div>
      </article>
    </div>
  </main>

  <footer class="global-footer">
    <div class="container footer-inner">
      <div>SYSTEM CORE: GREG ITEEN &copy; 2026. ALL METRICS NORMAL.</div>
      <div>LATENCY: 0.12ms // ARCH: x86-64 LOCAL</div>
    </div>
  </footer>
</body>
</html>
```

## section:layout:design_detail

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{NAME}} — Graphic Design Specification</title>
  <link rel="icon" href="assets/favicon.png">
  <link rel="stylesheet" href="theme.css">
</head>
<body>
  <header class="global-header">
    <div class="container header-inner">
      <div class="logo-wrap">
        <img src="assets/logo.png" alt="GI Logo" class="logo-img">
      </div>
      <nav class="nav-menu">
        <a href="/" class="nav-link">Index</a>
        <a href="/projects" class="nav-link">System</a>
        <a href="/designs" class="nav-link active">Output</a>
        <a href="/about" class="nav-link">Specs</a>
      </nav>
    </div>
  </header>

  <main class="container">
    <div class="backlink-bar">
      {{BACKLINK}}
    </div>

    <div class="detail-layout">
      <aside class="meta-sidebar">
        <div class="meta-block">
          <span class="meta-label">Output Reference</span>
          <span class="meta-val mono">{{SOURCE_PATH}}</span>
        </div>
        
        <div class="meta-block">
          <span class="meta-label">Execution Date</span>
          <span class="meta-val">{{YEAR}}</span>
        </div>

        <div class="meta-block">
          <span class="meta-label">Client Target</span>
          <span class="meta-val">{{CLIENT}}</span>
        </div>

        <div class="meta-block">
          <span class="meta-label">Functional Role</span>
          <span class="meta-val">{{ROLE}}</span>
        </div>

        <div class="meta-block">
          <span class="meta-label">Visual Directives</span>
          <div class="tag-list">
            {{TAG_BADGES}}
          </div>
        </div>

        <div class="action-links">
          <a href="{{LINK_URL}}" class="action-btn" target="_blank" rel="noopener">Launch Interface</a>
        </div>
      </aside>

      <article>
        <header class="design-header">
          <h1 class="design-main-title">{{NAME}}</h1>
          <p class="design-tagline">{{DESCRIPTION}}</p>
        </header>

        <div class="preview-stage">
          {{PREVIEW}}
        </div>

        <div class="design-markdown">
          {{CONTENT}}
        </div>
      </article>
    </div>
  </main>

  <footer class="global-footer">
    <div class="container footer-inner">
      <div>SYSTEM CORE: GREG ITEEN &copy; 2026. ALL METRICS NORMAL.</div>
      <div>LATENCY: 0.12ms // ARCH: x86-64 LOCAL</div>
    </div>
  </footer>
</body>
</html>
```

## section:layout:page

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{NAME}} — Greg Iteen System Specification</title>
  <link rel="icon" href="assets/favicon.png">
  <link rel="stylesheet" href="theme.css">
</head>
<body>
  <header class="global-header">
    <div class="container header-inner">
      <div class="logo-wrap">
        <img src="assets/logo.png" alt="GI Logo" class="logo-img">
      </div>
      <nav class="nav-menu">
        <a href="/" class="nav-link">Index</a>
        <a href="/projects" class="nav-link">System</a>
        <a href="/designs" class="nav-link">Output</a>
        <a href="/about" class="nav-link active">Specs</a>
      </nav>
    </div>
  </header>

  <main class="container">
    <article>
      <header class="page-header">
        <span class="page-meta">{{SOURCE_PATH}}</span>
        <h1 class="page-title">{{NAME}}</h1>
      </header>

      <div class="page-content">
        {{CONTENT}}
      </div>
    </article>
  </main>

  <footer class="global-footer">
    <div class="container footer-inner">
      <div>SYSTEM CORE: GREG ITEEN &copy; 2026. ALL METRICS NORMAL.</div>
      <div>LATENCY: 0.12ms // ARCH: x86-64 LOCAL</div>
    </div>
  </footer>
</body>
</html>
```

## section:layout:project_item

```html
<a href="{{URL}}" class="directory-row">
  <div class="dir-cell">
    <span class="dir-meta">NODE_REF // {{INDEX}}</span>
    <span class="dir-meta">DEPLOY_YR // {{YEAR}}</span>
  </div>
  <div class="dir-cell">
    <div class="dir-title">{{NAME}}</div>
    <p class="dir-desc">{{DESCRIPTION}}</p>
  </div>
  <div class="dir-cell">
    <div class="dir-badges">
      {{TECH_BADGES}}
    </div>
  </div>
</a>
```

## section:layout:design_item

```html
<div class="design-card">
  <div class="design-preview-wrap">
    {{PREVIEW}}
  </div>
  <div class="design-info">
    <span class="design-meta">CLIENT // {{CLIENT}} — {{YEAR}}</span>
    <h3 class="design-title">{{NAME}}</h3>
    <p class="design-desc">{{DESCRIPTION}}</p>
    <div class="dir-badges" style="margin-bottom: 20px;">
      {{TAG_BADGES}}
    </div>
    <a href="{{URL}}" class="design-link-btn">Inspect Schematic</a>
  </div>
</div>
```

## section:layout:nav_item

```html
<a href="{{NAV_URL}}" class="nav-link {{NAV_ACTIVE_CLASS}}">{{NAV_NAME}}</a>
```
