---
type: page
slug: "theme-mra3irk0"
name: "Sovereign Swiss Grid"
title: "Custom Theme Config"
description: "AI-generated bespoke skin for style: A modern Swiss international style interpretation for a local-first systems architect. Pure white background, pitch black text, and ultramarine blue functional elements. Typography: strictly classic neo-grotesk, large scale contrast. Layout: rigid multi-column grid, rigorous alignment, distilling complex technical concepts into absolute clarity."
timestamp: "2026-07-07T03:35:54.912Z"
sandbox_entry: "designs/theme-mra3irk0.html"
x_kind: "theme"
x_accent: "#002FA7"
x_prompt: "A modern Swiss international style interpretation for a local-first systems architect. Pure white background, pitch black text, and ultramarine blue functional elements. Typography: strictly classic neo-grotesk, large scale contrast. Layout: rigid multi-column grid, rigorous alignment, distilling complex technical concepts into absolute clarity."
---

Bespoke generated theme. CSS and layout templates live in the fenced sections below; all copy is injected from the vault at build time.

## section:css

```css
/* Import Fonts */
@import url('https://fonts.googleapis.com/css2?family=Arimo:wght@400;700&family=Sometype+Mono:wght@400;700&display=swap');

/* Global Reset & Base Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: #ffffff;
  color: #000000;
  font-family: 'Arimo', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Top Datum Line */
body::before {
  content: "";
  display: block;
  height: 6px;
  background-color: #002FA7;
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 1000;
}

/* Layout Wrapper */
.site-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: calc(100vh - 6px);
  width: 100%;
}

@media (max-width: 900px) {
  .site-container {
    grid-template-columns: 1fr;
  }
}

/* Left Column: Structural Sidebar */
.sidebar {
  border-right: 1px solid #000000;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #ffffff;
}

@media (max-width: 900px) {
  .sidebar {
    border-right: none;
    border-bottom: 1px solid #000000;
    padding: 24px;
  }
}

.sidebar-top {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.logo-container {
  display: block;
  max-width: 50px;
}

.logo-container img {
  width: 100%;
  height: auto;
  display: block;
}

/* Nav Elements */
.main-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item-link {
  font-family: 'Arimo', sans-serif;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #000000;
  text-decoration: none;
  padding: 6px 12px;
  border: 1px solid transparent;
  display: block;
  width: fit-content;
}

.nav-item-link:hover,
.nav-item-link.active {
  background-color: #002FA7;
  color: #ffffff;
  border-color: #002FA7;
}

/* Sidebar Bottom Technical Metadata */
.sidebar-bottom {
  margin-top: 60px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: 'Sometype Mono', monospace;
  font-size: 11px;
  color: #8F94A0;
  text-transform: uppercase;
}

.system-coord {
  border-top: 1px solid #000000;
  padding-top: 16px;
}

/* Right Column: Content Engine */
.content-viewport {
  padding: 80px 80px 120px 80px;
  max-width: 1200px;
  width: 100%;
}

@media (max-width: 900px) {
  .content-viewport {
    padding: 40px 24px 80px 24px;
  }
}

/* Typography & Scale */
h1 {
  font-family: 'Arimo', sans-serif;
  font-size: 80px;
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  margin-bottom: 40px;
}

@media (max-width: 768px) {
  h1 {
    font-size: 48px;
  }
}

h2 {
  font-family: 'Arimo', sans-serif;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #000000;
}

.section-meta-header {
  font-family: 'Sometype Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  color: #002FA7;
  text-transform: uppercase;
  margin-bottom: 8px;
  display: block;
}

p {
  font-family: 'Arimo', sans-serif;
  font-size: 18px;
  line-height: 1.6;
  color: #000000;
  max-width: 720px;
  margin-bottom: 24px;
}

p.lead {
  font-size: 24px;
  line-height: 1.4;
  font-weight: 400;
  letter-spacing: -0.01em;
}

/* Monospace Technical UI elements */
.mono-text {
  font-family: 'Sometype Mono', monospace;
}

/* Dynamic Grid Structures */
.hero-block {
  margin-bottom: 80px;
}

.hero-visual-container {
  width: 100%;
  height: 400px;
  background-size: cover;
  background-position: center;
  margin-bottom: 48px;
  filter: grayscale(100%) contrast(110%);
  border: 1px solid #000000;
}

/* Projects/Designs Dynamic Grids */
.data-grid {
  display: flex;
  flex-direction: column;
  border-top: 1px solid #000000;
  margin-bottom: 60px;
}

.grid-item {
  display: grid;
  grid-template-columns: 80px 2fr 1fr;
  padding: 24px 0;
  border-bottom: 1px solid #000000;
  text-decoration: none;
  color: #000000;
  align-items: center;
}

@media (max-width: 768px) {
  .grid-item {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 16px 0;
  }
}

.grid-item:hover {
  background-color: #F4F5F6;
}

.grid-item-index {
  font-family: 'Sometype Mono', monospace;
  font-size: 13px;
  color: #8F94A0;
}

.grid-item-title {
  font-family: 'Arimo', sans-serif;
  font-weight: 700;
  font-size: 20px;
  text-transform: uppercase;
  color: #002FA7;
}

.grid-item-desc {
  font-family: 'Arimo', sans-serif;
  font-size: 15px;
  color: #000000;
}

/* Visual Design Cards (Visual Portfolio) */
.design-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
  margin-top: 40px;
}

.design-card {
  border: 1px solid #000000;
  text-decoration: none;
  color: #000000;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.design-card:hover {
  border-color: #002FA7;
}

.design-card-preview {
  width: 100%;
  height: 240px;
  background-size: cover;
  background-position: center;
  border-bottom: 1px solid #000000;
  filter: grayscale(100%) contrast(105%);
}

.design-card:hover .design-card-preview {
  filter: none;
}

.design-card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.design-card-title {
  font-family: 'Arimo', sans-serif;
  font-weight: 700;
  font-size: 18px;
  text-transform: uppercase;
}

.design-card-meta {
  font-family: 'Sometype Mono', monospace;
  font-size: 11px;
  color: #8F94A0;
  display: flex;
  justify-content: space-between;
}

/* Details Page Layout styling */
.detail-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.detail-header-group {
  border-bottom: 4px solid #000000;
  padding-bottom: 24px;
}

.detail-meta-table {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  background: #F4F5F6;
  padding: 24px;
  border: 1px solid #000000;
}

.meta-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-family: 'Sometype Mono', monospace;
  font-size: 11px;
  color: #8F94A0;
  text-transform: uppercase;
}

.meta-value {
  font-family: 'Arimo', sans-serif;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
}

.detail-body {
  font-size: 18px;
  line-height: 1.6;
}

.detail-body p {
  margin-bottom: 24px;
}

.detail-body h3 {
  font-family: 'Arimo', sans-serif;
  font-size: 24px;
  font-weight: 700;
  text-transform: uppercase;
  margin-top: 40px;
  margin-bottom: 16px;
}

/* Images inside page content (.md-img) stylized clinical style */
.md-img {
  width: 100%;
  max-width: 100%;
  height: auto;
  border: 1px solid #000000;
  filter: grayscale(100%);
  margin: 32px 0;
  display: block;
}

.action-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'Sometype Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  color: #FFFFFF;
  background-color: #002FA7;
  padding: 12px 24px;
  text-decoration: none;
  width: fit-content;
}

.action-link:hover {
  background-color: #000000;
}

.back-link {
  font-family: 'Sometype Mono', monospace;
  font-size: 12px;
  color: #8F94A0;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 24px;
  text-transform: uppercase;
}

.back-link:hover {
  color: #002FA7;
}

/* Generator Form Styling (Pure Swiss Functional Block) */
.form-container {
  margin-top: 80px;
  padding: 40px;
  border: 2px solid #000000;
  background-color: #F4F5F6;
}

.form-title {
  font-family: 'Arimo', sans-serif;
  font-weight: 700;
  font-size: 24px;
  text-transform: uppercase;
  margin-bottom: 16px;
}

.form-container form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-family: 'Sometype Mono', monospace;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 700;
}

.form-group input,
.form-group select,
.form-group textarea {
  font-family: 'Arimo', sans-serif;
  font-size: 16px;
  padding: 12px;
  border: 1px solid #000000;
  background: #ffffff;
  border-radius: 0;
  outline: none;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #002FA7;
  box-shadow: 0 0 0 1px #002FA7;
}

.form-submit-btn {
  font-family: 'Sometype Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  background-color: #002FA7;
  color: #ffffff;
  border: none;
  padding: 16px;
  text-transform: uppercase;
  cursor: pointer;
  width: fit-content;
  align-self: flex-start;
}

.form-submit-btn:hover {
  background-color: #000000;
}

/* Tech Badges */
.badge-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-badge {
  font-family: 'Sometype Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  background-color: #ffffff;
  border: 1px solid #000000;
  padding: 4px 8px;
  text-transform: uppercase;
  color: #000000;
}
```

## section:layout:home

```html
<div class="site-container">
  <aside class="sidebar">
    <div class="sidebar-top">
      <a href="/" class="logo-container">
        <img src="/assets/gen-logo.png" alt="GI Monogram Logo" />
      </a>
      <nav class="main-nav">
        <a href="/" class="nav-item-link active">Index</a>
        <a href="/projects" class="nav-item-link">Systems</a>
        <a href="/designs" class="nav-item-link">Prototypes</a>
        <a href="/about" class="nav-item-link">About</a>
        <a href="/contact" class="nav-item-link">Contact</a>
      </nav>
    </div>
    <div class="sidebar-bottom">
      <div class="system-coord">
        LOC: LCL.FRST.AI<br>
        LAT: SOVEREIGN.SYS.01<br>
        METRIC: 0.00 MS
      </div>
    </div>
  </aside>

  <main class="content-viewport">
    <section class="hero-block">
      <span class="section-meta-header">[ ARCHITECTURAL OVERVIEW ]</span>
      <h1>{{HEADLINE}}</h1>
      <div class="hero-visual-container" style="background-image: url('/assets/gen-hero.jpg');"></div>
      <p class="lead">{{TAGLINE}}</p>
      <p>{{INTRO}}</p>
    </section>

    <section class="project-section">
      <span class="section-meta-header">[ STRUCTURAL SELECTIONS / COUNT: {{FEATURED_COUNT}} ]</span>
      <h2>Featured Local Systems</h2>
      <div class="data-grid">
        {{FEATURED_PROJECTS}}
      </div>
    </section>

    <section class="system-generator">
      <span class="section-meta-header">[ AUTOMATED COMPILATION ]</span>
      <div class="form-container">
        <div class="form-title">Compile System Spec</div>
        {{GENERATOR_FORM}}
      </div>
    </section>
  </main>
</div>
```

## section:layout:projects_index

```html
<div class="site-container">
  <aside class="sidebar">
    <div class="sidebar-top">
      <a href="/" class="logo-container">
        <img src="/assets/gen-logo.png" alt="GI Monogram Logo" />
      </a>
      <nav class="main-nav">
        <a href="/" class="nav-item-link">Index</a>
        <a href="/projects" class="nav-item-link active">Systems</a>
        <a href="/designs" class="nav-item-link">Prototypes</a>
        <a href="/about" class="nav-item-link">About</a>
        <a href="/contact" class="nav-item-link">Contact</a>
      </nav>
    </div>
    <div class="sidebar-bottom">
      <div class="system-coord">
        INDEX_COUNT: {{PROJECT_COUNT}}<br>
        STATE: STABLE<br>
        LCL: FI_NTV
      </div>
    </div>
  </aside>

  <main class="content-viewport">
    <span class="section-meta-header">[ SYSTEM LOGS ]</span>
    <h1>All Active Systems</h1>
    <p class="lead">Production-grade architectures designed around spatial autonomy, local data integrity, and deterministic execution structures.</p>
    
    <div class="data-grid">
      {{PROJECT_LIST}}
    </div>
  </main>
</div>
```

## section:layout:designs_index

```html
<div class="site-container">
  <aside class="sidebar">
    <div class="sidebar-top">
      <a href="/" class="logo-container">
        <img src="/assets/gen-logo.png" alt="GI Monogram Logo" />
      </a>
      <nav class="main-nav">
        <a href="/" class="nav-item-link">Index</a>
        <a href="/projects" class="nav-item-link">Systems</a>
        <a href="/designs" class="nav-item-link active">Prototypes</a>
        <a href="/about" class="nav-item-link">About</a>
        <a href="/contact" class="nav-item-link">Contact</a>
      </nav>
    </div>
    <div class="sidebar-bottom">
      <div class="system-coord">
        REGISTRY: VIS_DB<br>
        COUNT: {{DESIGN_COUNT}}<br>
        STAT: VERIFIED
      </div>
    </div>
  </aside>

  <main class="content-viewport">
    <span class="section-meta-header">[ VISUAL REGISTRY ]</span>
    <h1>Interface Prototypes</h1>
    <p class="lead">Rigid interface layout schemas, functional diagrams, and user flows designed to navigate local system configurations.</p>
    
    <div class="design-gallery">
      {{DESIGN_CARDS}}
    </div>

    <section class="system-generator">
      <span class="section-meta-header">[ AUTOMATED CONFIG ]</span>
      <div class="form-container">
        <div class="form-title">Generate Blueprint Spec</div>
        {{GENERATOR_FORM}}
      </div>
    </section>
  </main>
</div>
```

## section:layout:project_detail

```html
<div class="site-container">
  <aside class="sidebar">
    <div class="sidebar-top">
      <a href="/" class="logo-container">
        <img src="/assets/gen-logo.png" alt="GI Monogram" />
      </a>
      <nav class="main-nav">
        <a href="/" class="nav-item-link">Index</a>
        <a href="/projects" class="nav-item-link active">Systems</a>
        <a href="/designs" class="nav-item-link">Prototypes</a>
        <a href="/about" class="nav-item-link">About</a>
        <a href="/contact" class="nav-item-link">Contact</a>
      </nav>
    </div>
    <div class="sidebar-bottom">
      <div class="system-coord">
        ID: {{SOURCE_PATH}}<br>
        SYS_LOCK: ON
      </div>
    </div>
  </aside>

  <main class="content-viewport">
    <div class="detail-container">
      <div>
        {{BACKLINK}}
      </div>

      <div class="detail-header-group">
        <span class="section-meta-header">[ COMPONENT SPECS ]</span>
        <h1>{{NAME}}</h1>
        <p class="lead">{{DESCRIPTION}}</p>
      </div>

      <div class="detail-meta-table">
        <div class="meta-cell">
          <span class="meta-label">ROLE</span>
          <span class="meta-value">{{ROLE}}</span>
        </div>
        <div class="meta-cell">
          <span class="meta-label">YEAR</span>
          <span class="meta-value">{{YEAR}}</span>
        </div>
        <div class="meta-cell">
          <span class="meta-label">RESOURCES</span>
          <span class="meta-value">
            <a href="{{PROJECT_LINK}}" style="color: #002FA7; text-decoration: none;">LAUNCH SYSTEM</a>
          </span>
        </div>
        <div class="meta-cell">
          <span class="meta-label">SOURCE_PATH</span>
          <span class="meta-value" style="font-family: 'Sometype Mono', monospace; font-size: 12px;">{{SOURCE_PATH}}</span>
        </div>
      </div>

      <div class="badge-container">
        {{TECH_BADGES}}
      </div>

      <div class="detail-body">
        {{CONTENT}}
      </div>

      <div style="margin-top: 40px;">
        <a href="{{REPO_LINK}}" class="action-link">ACCESS RAW SOURCE CODE ↗</a>
      </div>
    </div>
  </main>
</div>
```

## section:layout:design_detail

```html
<div class="site-container">
  <aside class="sidebar">
    <div class="sidebar-top">
      <a href="/" class="logo-container">
        <img src="/assets/gen-logo.png" alt="GI Monogram" />
      </a>
      <nav class="main-nav">
        <a href="/" class="nav-item-link">Index</a>
        <a href="/projects" class="nav-item-link">Systems</a>
        <a href="/designs" class="nav-item-link active">Prototypes</a>
        <a href="/about" class="nav-item-link">About</a>
        <a href="/contact" class="nav-item-link">Contact</a>
      </nav>
    </div>
    <div class="sidebar-bottom">
      <div class="system-coord">
        TARGET: {{SOURCE_PATH}}<br>
        MODE: DIRECT_RENDER
      </div>
    </div>
  </aside>

  <main class="content-viewport">
    <div class="detail-container">
      <div>
        {{BACKLINK}}
      </div>

      <div class="detail-header-group">
        <span class="section-meta-header">[ VISUAL UNIT ]</span>
        <h1>{{NAME}}</h1>
        <p class="lead">{{DESCRIPTION}}</p>
      </div>

      <div class="detail-meta-table">
        <div class="meta-cell">
          <span class="meta-label">CLIENT</span>
          <span class="meta-value">{{CLIENT}}</span>
        </div>
        <div class="meta-cell">
          <span class="meta-label">ROLE</span>
          <span class="meta-value">{{ROLE}}</span>
        </div>
        <div class="meta-cell">
          <span class="meta-label">COMPILE_YEAR</span>
          <span class="meta-value">{{YEAR}}</span>
        </div>
        <div class="meta-cell">
          <span class="meta-label">TAGS</span>
          <span class="meta-value">{{TAG_BADGES}}</span>
        </div>
      </div>

      <div class="detail-body">
        <img src="{{PREVIEW}}" alt="{{NAME}} Blueprint" class="md-img" />
        {{CONTENT}}
      </div>

      <div style="margin-top: 40px;">
        <a href="{{LINK_URL}}" class="action-link">VIEW ORIGINAL TARGET FILE</a>
      </div>
    </div>
  </main>
</div>
```

## section:layout:page

```html
<div class="site-container">
  <aside class="sidebar">
    <div class="sidebar-top">
      <a href="/" class="logo-container">
        <img src="/assets/gen-logo.png" alt="GI Monogram" />
      </a>
      <nav class="main-nav">
        <a href="/" class="nav-item-link">Index</a>
        <a href="/projects" class="nav-item-link">Systems</a>
        <a href="/designs" class="nav-item-link">Prototypes</a>
        <a href="/about" class="nav-item-link">About</a>
        <a href="/contact" class="nav-item-link">Contact</a>
      </nav>
    </div>
    <div class="sidebar-bottom">
      <div class="system-coord">
        MD: {{SOURCE_PATH}}<br>
        RENDER: STATIC
      </div>
    </div>
  </aside>

  <main class="content-viewport">
    <span class="section-meta-header">[ SYSTEM CONTEXT ]</span>
    <h1>{{NAME}}</h1>
    <div class="detail-body">
      {{CONTENT}}
    </div>
  </main>
</div>
```

## section:layout:project_item

```html
<a href="{{URL}}" class="grid-item">
  <div class="grid-item-index">[{{INDEX}}]</div>
  <div class="grid-item-title">{{NAME}}</div>
  <div class="grid-item-desc">{{DESCRIPTION}}</div>
</a>
```

## section:layout:design_item

```html
<a href="{{URL}}" class="design-card">
  <div class="design-card-preview" style="background-image: url('{{PREVIEW}}');"></div>
  <div class="design-card-body">
    <div class="design-card-title">{{NAME}}</div>
    <div class="design-card-meta">
      <span>CLIENT: {{CLIENT}}</span>
      <span>YEAR: {{YEAR}}</span>
    </div>
  </div>
</a>
```

## section:layout:nav_item

```html
<a href="{{NAV_URL}}" class="nav-item-link {{NAV_ACTIVE_CLASS}}">{{NAV_NAME}}</a>
```
