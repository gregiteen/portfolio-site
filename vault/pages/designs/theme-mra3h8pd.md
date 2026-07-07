---
type: page
slug: "theme-mra3h8pd"
name: "Biolume Sovereign"
title: "Custom Theme Config"
description: "AI-generated bespoke skin for style: A cinematic, deeply atmospheric interface for a sovereign software builder. Midnight blue and charcoal with bioluminescent teal micro-accents. Typography: geometric sans-serif with wide tracking, paired with a sharp, high-legibility code font. Layout: expansive use of negative space, large dramatic typography, evoking depth and quiet intelligence."
timestamp: "2026-07-07T03:35:09.181Z"
sandbox_entry: "designs/theme-mra3h8pd.html"
x_kind: "theme"
x_accent: "#0cf2c9"
x_prompt: "A cinematic, deeply atmospheric interface for a sovereign software builder. Midnight blue and charcoal with bioluminescent teal micro-accents. Typography: geometric sans-serif with wide tracking, paired with a sharp, high-legibility code font. Layout: expansive use of negative space, large dramatic typography, evoking depth and quiet intelligence."
---

Bespoke generated theme. CSS and layout templates live in the fenced sections below; all copy is injected from the vault at build time.

## section:css

```css
@import url('https://fonts.googleapis.com/css2?family=Syncopate:wght@700&family=Azeret+Mono:wght@300;400;600;800&display=swap');

:root {
  --bg-void: #040810;
  --bg-depth: #0d1424;
  --accent-glow: #0cf2c9;
  --accent-subdued: #0b666a;
  --text-primary: #f1f5f9;
  --text-muted: #64748b;
  --font-sans: 'Syncopate', sans-serif;
  --font-mono: 'Azeret Mono', monospace;
  --grid-spine: 80px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-void);
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.6;
  letter-spacing: -0.02em;
  overflow-x: hidden;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: var(--bg-void);
}
::-webkit-scrollbar-thumb {
  background: var(--accent-subdued);
}
::-webkit-scrollbar-thumb:hover {
  background: var(--accent-glow);
}

/* Base Typography */
h1, h2, h3, h4 {
  font-family: var(--font-sans);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
}

a {
  color: var(--accent-glow);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

a:hover {
  color: var(--text-primary);
  text-shadow: 0 0 10px rgba(12, 242, 201, 0.4);
}

/* Global Structural Spine */
.site-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  border-left: 2px solid var(--accent-subdued);
  margin-left: 20px;
  padding-left: 20px;
}

@media (min-width: 1024px) {
  .site-container {
    margin-left: var(--grid-spine);
    padding-left: 40px;
    border-left: 2px solid rgba(11, 102, 106, 0.4);
  }
}

/* Decorative Telemetry */
.site-container::before {
  content: "SYS_VER_4.12 // SOVEREIGN_NODE_IP_LOCAL";
  position: absolute;
  left: -15px;
  top: 100px;
  transform: rotate(-90deg) translateX(-100%);
  transform-origin: left top;
  font-size: 9px;
  color: var(--accent-subdued);
  font-family: var(--font-mono);
  letter-spacing: 0.2em;
  white-space: nowrap;
  opacity: 0.6;
}

/* Navigation */
.global-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 20px 30px 0;
  border-bottom: 1px solid rgba(11, 102, 106, 0.2);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 15px;
}

.nav-brand img {
  height: 32px;
  width: auto;
  filter: drop-shadow(0 0 8px rgba(12, 242, 201, 0.5));
}

.nav-links {
  display: flex;
  gap: 30px;
}

.nav-link {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-link.active, .nav-link:hover {
  color: var(--accent-glow);
}

.nav-marker {
  color: var(--accent-glow);
  font-size: 9px;
}

/* Home & Hero Layout */
.hero {
  position: relative;
  padding: 120px 20px 100px 0;
  background-size: cover;
  background-position: center;
  border-bottom: 1px solid rgba(11, 102, 106, 0.2);
}

.hero-content {
  max-width: 900px;
  position: relative;
  z-index: 2;
}

.hero-logo img {
  max-width: 140px;
  margin-bottom: 40px;
  filter: drop-shadow(0 0 15px rgba(12, 242, 201, 0.3));
}

.hero-headline {
  font-size: clamp(2rem, 5vw, 4rem);
  line-height: 1.1;
  color: var(--text-primary);
  margin-bottom: 24px;
  text-shadow: 0 4px 20px rgba(4, 8, 16, 0.9);
}

.hero-tagline {
  font-family: var(--font-mono);
  font-size: 18px;
  color: var(--accent-glow);
  margin-bottom: 30px;
  font-weight: 600;
}

.hero-intro {
  font-family: var(--font-mono);
  color: var(--text-muted);
  max-width: 680px;
  line-height: 1.8;
  font-size: 15px;
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin: 80px 20px 40px 0;
  border-bottom: 1px solid var(--accent-subdued);
  padding-bottom: 15px;
}

.section-title {
  font-size: 16px;
  color: var(--text-primary);
}

.section-count {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--accent-glow);
}

/* Grid Systems */
.projects-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
  padding-right: 20px;
  margin-bottom: 80px;
}

@media (min-width: 768px) {
  .projects-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Technical Cards */
.project-card {
  background: var(--bg-depth);
  border: 1px solid rgba(11, 102, 106, 0.3);
  padding: 30px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 250px;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.project-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--accent-subdued);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.project-card:hover {
  border-color: var(--accent-glow);
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(12, 242, 201, 0.05);
}

.project-card:hover::before {
  background: var(--accent-glow);
  height: 100%;
}

.project-header {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--accent-glow);
  margin-bottom: 20px;
}

.project-index {
  font-weight: 800;
}

.project-title {
  font-size: 18px;
  margin-bottom: 12px;
  font-family: var(--font-sans);
}

.project-desc {
  color: var(--text-muted);
  font-size: 13px;
  margin-bottom: 24px;
  flex-grow: 1;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-badge {
  font-size: 10px;
  background: rgba(11, 102, 106, 0.2);
  border: 1px solid rgba(11, 102, 106, 0.4);
  color: var(--text-primary);
  padding: 4px 8px;
  text-transform: uppercase;
}

/* Design/Visual Index Grid */
.designs-grid-wrapper {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  padding-right: 20px;
  margin-bottom: 80px;
}

@media (min-width: 768px) {
  .designs-grid-wrapper {
    grid-template-columns: repeat(2, 1fr);
  }
}

.design-card {
  background: var(--bg-depth);
  border: 1px solid rgba(11, 102, 106, 0.2);
  padding: 15px;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.design-card:hover {
  border-color: var(--accent-glow);
}

.design-preview-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16/10;
  overflow: hidden;
  margin-bottom: 20px;
  background: var(--bg-void);
}

.design-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(40%) contrast(110%);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.design-card:hover .design-preview {
  filter: grayscale(0%) contrast(100%);
  transform: scale(1.05);
}

.design-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--accent-glow);
  margin-bottom: 10px;
}

.design-title {
  font-size: 16px;
  font-family: var(--font-sans);
}

/* Form / Interactive Console */
.generator-section {
  background: var(--bg-depth);
  border: 1px solid var(--accent-subdued);
  padding: 40px;
  margin: 60px 20px 80px 0;
  position: relative;
}

.generator-section::after {
  content: "SYS_PROMPT_INPUT";
  position: absolute;
  top: -10px;
  left: 20px;
  background: var(--bg-void);
  padding: 0 10px;
  color: var(--accent-glow);
  font-size: 10px;
  font-weight: 800;
}

.generator-section form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.generator-section input, .generator-section textarea, .generator-section select {
  background: var(--bg-void);
  border: 1px solid rgba(11, 102, 106, 0.5);
  color: var(--text-primary);
  padding: 15px;
  font-family: var(--font-mono);
  font-size: 13px;
  width: 100%;
}

.generator-section input:focus, .generator-section textarea:focus, .generator-section select:focus {
  outline: none;
  border-color: var(--accent-glow);
  box-shadow: 0 0 10px rgba(12, 242, 201, 0.15);
}

.generator-section button {
  background: var(--accent-glow);
  color: var(--bg-void);
  border: none;
  padding: 15px 30px;
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  align-self: flex-start;
}

.generator-section button:hover {
  background: var(--text-primary);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
}

/* Detail View Layouts */
.detail-wrapper {
  padding: 80px 20px 100px 0;
  max-width: 1000px;
}

.detail-header {
  border-bottom: 1px solid rgba(11, 102, 106, 0.3);
  padding-bottom: 40px;
  margin-bottom: 40px;
}

.detail-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 30px;
  border-top: 1px solid rgba(11, 102, 106, 0.1);
  padding-top: 30px;
}

@media (min-width: 768px) {
  .detail-meta-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
}

.meta-value {
  font-size: 12px;
  color: var(--accent-glow);
  font-weight: 600;
}

.detail-body {
  font-size: 15px;
  line-height: 1.9;
  color: var(--text-primary);
}

.detail-body p {
  margin-bottom: 30px;
}

.detail-body h2, .detail-body h3 {
  color: var(--accent-glow);
  margin-top: 50px;
  margin-bottom: 20px;
  font-size: 18px;
}

.detail-body ul {
  margin-bottom: 30px;
  padding-left: 20px;
  list-style-type: square;
}

.detail-body li {
  margin-bottom: 10px;
}

/* Embedded portraits/images */
.md-img {
  width: 100%;
  max-width: 800px;
  height: auto;
  border: 1px solid var(--accent-subdued);
  padding: 10px;
  background: var(--bg-depth);
  margin: 40px 0;
}

/* Footer */
.site-footer {
  margin-top: auto;
  padding: 60px 20px 40px 0;
  border-top: 1px solid rgba(11, 102, 106, 0.2);
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-size: 11px;
  color: var(--text-muted);
}

@media (min-width: 768px) {
  .site-footer {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.footer-telemetry {
  display: flex;
  gap: 20px;
}

.footer-sys-state {
  color: var(--accent-glow);
}

/* Backlink */
.backlink {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 40px;
  color: var(--text-muted);
}

.backlink:hover {
  color: var(--accent-glow);
}
```

## section:layout:home

```html
<div class="site-container">
  <nav class="global-nav">
    <div class="nav-brand">
      <a href="/">/assets/gen-logo.png</a>
    </div>
    <div class="nav-links">
      {{NAV_ITEMS}}
    </div>
  </nav>

  <div class="home-wrapper">
    <section class="hero" style="background-image: linear-gradient(to bottom, rgba(4,8,16,0.85), var(--bg-void)), url('/assets/gen-hero.jpg')">
      <div class="hero-content">
        <div class="hero-logo"><img src="/assets/gen-logo.png" alt="GI Monogram"></div>
        <h1 class="hero-headline">{{HEADLINE}}</h1>
        <p class="hero-tagline">{{TAGLINE}}</p>
        <div class="hero-intro">{{INTRO}}</div>
      </div>
    </section>

    <section class="featured-section">
      <div class="section-header">
        <h2 class="section-title">ACTIVE_DEPLOYMENTS</h2>
        <span class="section-count">[{{FEATURED_COUNT}}]</span>
      </div>
      <div class="projects-grid">
        {{FEATURED_PROJECTS}}
      </div>
    </section>

    {{GENERATOR_FORM}}
  </div>

  <footer class="site-footer">
    <div>&copy; 2026 GREG ITEEN. SOVEREIGN EXECUTION.</div>
    <div class="footer-telemetry">
      <span class="footer-sys-state">SYS_STATUS: OPTIMAL</span>
      <span>LAT_0.02ms</span>
    </div>
  </footer>
</div>
```

## section:layout:projects_index

```html
<div class="site-container">
  <nav class="global-nav">
    <div class="nav-brand">
      <a href="/"><img src="/assets/gen-logo.png" alt="GI"></a>
    </div>
    <div class="nav-links">
      {{NAV_ITEMS}}
    </div>
  </nav>

  <div class="index-wrapper">
    <header class="section-header">
      <h1 class="section-title">SYSTEMS_DIRECTORY</h1>
      <span class="section-count">[{{PROJECT_COUNT}}] UNITS</span>
    </header>
    <div class="projects-grid">
      {{PROJECT_LIST}}
    </div>
  </div>

  <footer class="site-footer">
    <div>&copy; 2026 GREG ITEEN. FILE-NATIVE AI.</div>
    <div class="footer-telemetry">
      <span class="footer-sys-state">SECURE_LINK_CONNECTED</span>
    </div>
  </footer>
</div>
```

## section:layout:designs_index

```html
<div class="site-container">
  <nav class="global-nav">
    <div class="nav-brand">
      <a href="/"><img src="/assets/gen-logo.png" alt="GI"></a>
    </div>
    <div class="nav-links">
      {{NAV_ITEMS}}
    </div>
  </nav>

  <div class="index-wrapper">
    <header class="section-header">
      <h1 class="section-title">VISUAL_MANIFESTS</h1>
      <span class="section-count">[{{DESIGN_COUNT}}] PLOTS</span>
    </header>
    <div class="designs-grid-wrapper">
      {{DESIGN_CARDS}}
    </div>
    {{GENERATOR_FORM}}
  </div>

  <footer class="site-footer">
    <div>&copy; 2026 GREG ITEEN. ALL RIGHTS RESERVED.</div>
    <div class="footer-telemetry">
      <span class="footer-sys-state">TELEMETRY_STREAM_OK</span>
    </div>
  </footer>
</div>
```

## section:layout:project_detail

```html
<div class="site-container">
  <nav class="global-nav">
    <div class="nav-brand">
      <a href="/"><img src="/assets/gen-logo.png" alt="GI"></a>
    </div>
    <div class="nav-links">
      {{NAV_ITEMS}}
    </div>
  </nav>

  <div class="detail-wrapper">
    <a href="/projects" class="backlink">&larr; BACK_TO_SYSTEMS</a>
    <header class="detail-header">
      <h1 class="hero-headline">{{NAME}}</h1>
      <p class="hero-tagline">{{DESCRIPTION}}</p>
      <div class="detail-meta-grid">
        <div class="meta-item">
          <span class="meta-label">ROLE</span>
          <span class="meta-value">{{ROLE}}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">YEAR</span>
          <span class="meta-value">{{YEAR}}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">SOURCE_PATH</span>
          <span class="meta-value">{{SOURCE_PATH}}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">BADGES</span>
          <span class="meta-value">{{TECH_BADGES}}</span>
        </div>
      </div>
    </header>

    <article class="detail-body">
      {{CONTENT}}
    </article>
  </div>

  <footer class="site-footer">
    <div>&copy; 2026 GREG ITEEN. SOVEREIGN ENGINE.</div>
    <div class="footer-telemetry">
      <span>HASH_8F9C4D</span>
    </div>
  </footer>
</div>
```

## section:layout:design_detail

```html
<div class="site-container">
  <nav class="global-nav">
    <div class="nav-brand">
      <a href="/"><img src="/assets/gen-logo.png" alt="GI"></a>
    </div>
    <div class="nav-links">
      {{NAV_ITEMS}}
    </div>
  </nav>

  <div class="detail-wrapper">
    <a href="/designs" class="backlink">&larr; BACK_TO_MANIFESTS</a>
    <header class="detail-header">
      <h1 class="hero-headline">{{NAME}}</h1>
      <p class="hero-tagline">{{DESCRIPTION}}</p>
      <div class="detail-meta-grid">
        <div class="meta-item">
          <span class="meta-label">CLIENT</span>
          <span class="meta-value">{{CLIENT}}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">ROLE</span>
          <span class="meta-value">{{ROLE}}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">YEAR</span>
          <span class="meta-value">{{YEAR}}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">PATH</span>
          <span class="meta-value">{{SOURCE_PATH}}</span>
        </div>
      </div>
    </header>

    <div class="md-img">
      <img src="{{PREVIEW}}" alt="{{NAME}}" style="width:100%; display:block;">
    </div>

    <article class="detail-body">
      {{CONTENT}}
    </article>
  </div>

  <footer class="site-footer">
    <div>&copy; 2026 GREG ITEEN.</div>
    <div class="footer-telemetry">
      <span>PLOT_COMPLETE</span>
    </div>
  </footer>
</div>
```

## section:layout:page

```html
<div class="site-container">
  <nav class="global-nav">
    <div class="nav-brand">
      <a href="/"><img src="/assets/gen-logo.png" alt="GI"></a>
    </div>
    <div class="nav-links">
      {{NAV_ITEMS}}
    </div>
  </nav>

  <div class="detail-wrapper">
    <header class="detail-header">
      <h1 class="hero-headline">{{NAME}}</h1>
    </header>
    <article class="detail-body">
      {{CONTENT}}
    </article>
  </div>

  <footer class="site-footer">
    <div>&copy; 2026 GREG ITEEN. FILE-NATIVE FUTURE.</div>
  </footer>
</div>
```

## section:layout:project_item

```html
<div class="project-card">
  <div class="project-header">
    <span class="project-index">[SYS_0{{INDEX}}]</span>
    <span class="project-year">{{YEAR}}</span>
  </div>
  <div>
    <h3 class="project-title"><a href="{{URL}}">{{NAME}}</a></h3>
    <p class="project-desc">{{DESCRIPTION}}</p>
  </div>
  <div class="project-tags">
    {{TECH_BADGES}}
  </div>
</div>
```

## section:layout:design_item

```html
<div class="design-card">
  <div class="design-preview-wrap">
    <a href="{{URL}}"><img class="design-preview" src="{{PREVIEW}}" alt="{{NAME}}"></a>
  </div>
  <div class="design-meta">
    <span>{{YEAR}}</span>
    <span>{{CLIENT}}</span>
  </div>
  <h3 class="design-title"><a href="{{URL}}">{{NAME}}</a></h3>
</div>
```

## section:layout:nav_item

```html
<a href="{{NAV_URL}}" class="nav-link {{NAV_ACTIVE_CLASS}}"><span class="nav-marker">//</span> {{NAV_NAME}}</a>
```
