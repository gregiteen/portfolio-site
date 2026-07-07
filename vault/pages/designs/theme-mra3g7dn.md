---
type: page
slug: "theme-mra3g7dn"
name: "Titanium Sovereign"
title: "Custom Theme Config"
description: "AI-generated bespoke skin for style: High-end industrial design aesthetic for an AI memory systems engineer. Matte titanium grays, stark white, and a single subtle safety-orange accent. Typography: dense, tightly tracked European grotesk. Layout: precise modular framing, flush-left alignment, evoking precision machining and immutable records."
timestamp: "2026-07-07T03:33:58.070Z"
sandbox_entry: "designs/theme-mra3g7dn.html"
x_kind: "theme"
x_accent: "#FF4500"
x_prompt: "High-end industrial design aesthetic for an AI memory systems engineer. Matte titanium grays, stark white, and a single subtle safety-orange accent. Typography: dense, tightly tracked European grotesk. Layout: precise modular framing, flush-left alignment, evoking precision machining and immutable records."
---

Bespoke generated theme. CSS and layout templates live in the fenced sections below; all copy is injected from the vault at build time.

## section:css

```css
@import url('https://fonts.googleapis.com/css2?family=Albert+Sans:wght@300;400;600;800&family=Saira+Extra+Condensed:wght@500;700;900&display=swap');

:root {
  --color-base: #0F1011;
  --color-border: #2B2D31;
  --color-border-hover: #4E5158;
  --color-muted: #8A8E94;
  --color-text: #E5E7EB;
  --color-white: #F3F4F6;
  --color-accent: #FF4500;
  
  --font-display: 'Saira Extra Condensed', sans-serif;
  --font-sans: 'Albert Sans', sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border-radius: 0 !important; /* No rounded corners under any circumstances */
}

body {
  background-color: var(--color-base);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 15px;
  line-height: 1.5;
  letter-spacing: -0.01em;
  overflow-x: hidden;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: var(--color-base);
  border-left: 2px solid var(--color-border);
}
::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border: 1px solid var(--color-base);
}
::-webkit-scrollbar-thumb:hover {
  background: var(--color-accent);
}

/* Layout Framework */
.system-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* System Header */
.sys-header {
  border: 2px solid var(--color-border);
  border-bottom: none;
  background: rgba(15, 16, 17, 0.9);
  z-index: 10;
}

.sys-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 2px solid var(--color-border);
}

.sys-identity {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.sys-logo {
  height: 28px;
  width: auto;
  filter: brightness(0) invert(1);
}

.sys-tag {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-white);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sys-tag::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  background: var(--color-accent);
}

.sys-meta-stats {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--color-muted);
  display: flex;
  gap: 2rem;
}

.sys-stat-item span {
  color: var(--color-accent);
}

/* Navigation Matrix */
.sys-nav {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-bottom: 2px solid var(--color-border);
}

@media (max-width: 768px) {
  .sys-nav {
    grid-template-columns: 1fr 1fr;
  }
}

.sys-nav a {
  display: block;
  padding: 1rem;
  text-align: center;
  text-decoration: none;
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-muted);
  border-right: 2px solid var(--color-border);
  transition: all 0.2s ease;
  background: transparent;
}

.sys-nav a:last-child {
  border-right: none;
}

.sys-nav a:hover {
  color: var(--color-white);
  background: rgba(255, 69, 0, 0.05);
}

.sys-nav a.active {
  color: var(--color-white);
  background: rgba(255, 69, 0, 0.1);
  border-bottom: 4px solid var(--color-accent);
}

/* Modular Frames */
.panel {
  border: 2px solid var(--color-border);
  margin-bottom: 2rem;
  background: rgba(15, 16, 17, 0.5);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--color-border);
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-white);
}

.panel-header-right {
  font-size: 0.9rem;
  color: var(--color-accent);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.panel-content {
  padding: 1.5rem;
}

/* Home & Hero Structure */
.hero-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

@media (max-width: 1024px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }
}

.hero-thesis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hero-headline {
  font-family: var(--font-display);
  font-size: 5rem;
  line-height: 0.85;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.03em;
  color: var(--color-white);
  margin-bottom: 2rem;
}

.hero-headline span {
  color: var(--color-accent);
}

.hero-intro {
  font-size: 1.25rem;
  color: var(--color-text);
  border-left: 3px solid var(--color-accent);
  padding-left: 1.5rem;
  margin-bottom: 2rem;
  max-width: 600px;
}

.hero-visual-frame {
  position: relative;
  height: 100%;
  min-height: 350px;
  background-size: cover;
  background-position: center;
  border: 2px solid var(--color-border);
}

.hero-visual-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(15, 16, 17, 0.95), rgba(15, 16, 17, 0.3));
  pointer-events: none;
}

.hero-visual-tag {
  position: absolute;
  bottom: 1.5rem;
  left: 1.5rem;
  right: 1.5rem;
  background: var(--color-base);
  border: 1px solid var(--color-accent);
  padding: 1rem;
  font-family: var(--font-display);
  text-transform: uppercase;
}

/* Form / Generator */
.generator-wrapper {
  background: #141618;
  border: 1px solid var(--color-border);
  padding: 1.5rem;
}

.generator-wrapper form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.generator-wrapper input, 
.generator-wrapper textarea, 
.generator-wrapper select {
  background: var(--color-base);
  border: 1px solid var(--color-border);
  color: var(--color-white);
  padding: 0.75rem 1rem;
  font-family: var(--font-sans);
  font-size: 1rem;
  width: 100%;
}

.generator-wrapper input:focus, 
.generator-wrapper textarea:focus {
  outline: none;
  border-color: var(--color-accent);
}

.generator-wrapper button {
  background: var(--color-accent);
  color: var(--color-white);
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.75rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.generator-wrapper button:hover {
  background: #e03d00;
}

/* Lists & Grids */
.list-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* Project Item Row */
.project-row {
  display: grid;
  grid-template-columns: 80px 1.5fr 2fr 100px;
  align-items: center;
  border: 2px solid var(--color-border);
  background: rgba(15, 16, 17, 0.3);
  text-decoration: none;
  color: var(--color-text);
  transition: all 0.2s ease;
}

@media (max-width: 768px) {
  .project-row {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1.5rem;
  }
}

.project-row:hover {
  border-color: var(--color-accent);
  transform: translateX(4px);
}

.project-index {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 900;
  color: var(--color-border-hover);
  border-right: 2px solid var(--color-border);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .project-index {
    border-right: none;
    justify-content: flex-start;
    height: auto;
  }
}

.project-meta {
  padding: 1rem 1.5rem;
}

.project-title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
  color: var(--color-white);
}

.project-desc {
  padding: 1rem 1.5rem;
  font-size: 1rem;
  color: var(--color-muted);
}

.project-year {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--color-accent);
  text-align: right;
  padding-right: 1.5rem;
}

@media (max-width: 768px) {
  .project-year {
    text-align: left;
    padding-left: 1.5rem;
  }
}

/* Design Item Cards */
.design-card {
  border: 2px solid var(--color-border);
  text-decoration: none;
  color: var(--color-text);
  background: rgba(15, 16, 17, 0.4);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.2s ease;
}

.design-card:hover {
  border-color: var(--color-accent);
}

.design-preview-container {
  aspect-ratio: 16/10;
  background-size: cover;
  background-position: center;
  border-bottom: 2px solid var(--color-border);
}

.design-body {
  padding: 1.5rem;
}

.design-title {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-white);
  line-height: 1;
  margin-bottom: 0.5rem;
}

.design-year-tag {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--color-accent);
  text-transform: uppercase;
}

/* Detail Pages */
.detail-layout {
  display: grid;
  grid-template-columns: 1fr 2.5fr;
  gap: 2rem;
}

@media (max-width: 992px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }
}

.detail-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-block {
  border: 2px solid var(--color-border);
  background: #141618;
}

.sidebar-header {
  background: var(--color-border);
  padding: 0.5rem 1rem;
  font-family: var(--font-display);
  font-size: 1rem;
  text-transform: uppercase;
  color: var(--color-white);
  font-weight: 700;
}

.sidebar-content {
  padding: 1rem 1.25rem;
}

.sidebar-meta-list {
  list-style: none;
}

.sidebar-meta-list li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
}

.sidebar-meta-list li:last-child {
  border-bottom: none;
}

.meta-label {
  font-family: var(--font-display);
  text-transform: uppercase;
  color: var(--color-muted);
}

.meta-value {
  font-weight: 600;
  color: var(--color-white);
}

.detail-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.detail-header-block {
  border: 2px solid var(--color-border);
  padding: 2.5rem 2rem;
  background: linear-gradient(135deg, rgba(20,22,24,1) 0%, rgba(15,16,17,1) 100%);
  border-bottom: 6px solid var(--color-accent);
}

.detail-title {
  font-family: var(--font-display);
  font-size: 4rem;
  line-height: 0.9;
  font-weight: 900;
  text-transform: uppercase;
  color: var(--color-white);
}

.detail-desc {
  font-size: 1.25rem;
  color: var(--color-muted);
  margin-top: 1rem;
  max-width: 800px;
}

.detail-content-area {
  background: rgba(15, 16, 17, 0.3);
  border: 2px solid var(--color-border);
  padding: 2rem;
  font-size: 1.1rem;
  line-height: 1.7;
}

.detail-content-area p {
  margin-bottom: 1.5rem;
}

.detail-content-area p:last-child {
  margin-bottom: 0;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-accent);
  text-decoration: none;
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.back-btn:hover {
  color: var(--color-white);
}

/* Tech Badges */
.tech-badge-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tech-badge {
  background: var(--color-border);
  color: var(--color-white);
  padding: 0.25rem 0.5rem;
  font-family: var(--font-display);
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  border: 1px solid var(--color-muted);
}

/* About / Portrait Styling */
.md-img {
  width: 100%;
  max-width: 100%;
  height: auto;
  filter: grayscale(100%) contrast(110%);
  border: 2px solid var(--color-border);
  margin: 1.5rem 0;
}

/* Site Footer */
.sys-footer {
  margin-top: auto;
  border: 2px solid var(--color-border);
  background: rgba(15, 16, 17, 0.9);
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-display);
  text-transform: uppercase;
  color: var(--color-muted);
}

@media (max-width: 768px) {
  .sys-footer {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}

.footer-stamp {
  color: var(--color-accent);
  font-weight: 700;
}

.footer-stamp::before {
  content: '[ ';
  color: var(--color-muted);
}

.footer-stamp::after {
  content: ' ]';
  color: var(--color-muted);
}
```

## section:layout:home

```html
<header class="sys-header">
  <div class="sys-top-bar">
    <div class="sys-identity">
      <img src="/assets/gen-logo.png" alt="GI Monogram" class="sys-logo" />
      <div class="sys-tag">GREG ITEEN</div>
    </div>
    <div class="sys-meta-stats">
      <div class="sys-stat-item">SYSTEM: <span>SOVEREIGN // FILE-NATIVE AI</span></div>
    </div>
  </div>
  <nav class="sys-nav">
    <a href="/" class="active">01_HOME</a>
    <a href="/projects">02_SYSTEMS</a>
    <a href="/designs">03_BLUEPRINTS</a>
    <a href="/about">04_DOSSIER</a>
  </nav>
</header>

<main style="margin-top: 2rem;">
  <div class="hero-grid">
    <div class="hero-thesis panel">
      <div class="panel-header">
        <span>SYSTEM_THESIS</span>
        <span class="panel-header-right">0x4096</span>
      </div>
      <div class="panel-content" style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <h1 class="hero-headline">Sovereign<br/>Memory<br/><span>Architectures</span></h1>
          <p class="hero-intro">{{TAGLINE}}</p>
        </div>
        <div style="color: var(--color-muted); font-size: 0.95rem;">
          {{INTRO}}
        </div>
      </div>
    </div>
    
    <div class="panel">
      <div class="panel-header">
        <span>VISUALIZATION_FEED</span>
        <span class="panel-header-right">LIVE</span>
      </div>
      <div class="panel-content">
        <div class="hero-visual-frame" style="background-image: url('/assets/gen-hero.jpg');">
          <div class="hero-visual-overlay"></div>
          <div class="hero-visual-tag">
            INTEGRITY METRIC: SECURED
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="panel">
    <div class="panel-header">
      <span>FEATURED_PROJECTS_REGISTRY</span>
      <span class="panel-header-right">COUNT: {{FEATURED_COUNT}}</span>
    </div>
    <div class="panel-content">
      <div class="list-grid">
        {{FEATURED_PROJECTS}}
      </div>
    </div>
  </div>

  <div class="panel">
    <div class="panel-header">
      <span>CONTACT_SECURE_CHANNEL</span>
      <span class="panel-header-right">STATION_00</span>
    </div>
    <div class="panel-content">
      <div class="generator-wrapper">
        {{GENERATOR_FORM}}
      </div>
    </div>
  </div>
</main>

<footer class="sys-footer">
  <div>GREG ITEEN &copy; 2026</div>
  <div class="footer-stamp">FILE-NATIVE STORAGE COMPLIANT</div>
  <div>IP_SECURE_ADDR: LOCALHOST</div>
</footer>
```

## section:layout:projects_index

```html
<header class="sys-header">
  <div class="sys-top-bar">
    <div class="sys-identity">
      <img src="/assets/gen-logo.png" alt="GI Monogram" class="sys-logo" />
      <div class="sys-tag">GREG ITEEN</div>
    </div>
    <div class="sys-meta-stats">
      <div class="sys-stat-item">SYSTEM: <span>SOVEREIGN // FILE-NATIVE AI</span></div>
    </div>
  </div>
  <nav class="sys-nav">
    <a href="/">01_HOME</a>
    <a href="/projects" class="active">02_SYSTEMS</a>
    <a href="/designs">03_BLUEPRINTS</a>
    <a href="/about">04_DOSSIER</a>
  </nav>
</header>

<main style="margin-top: 2rem;">
  <div class="panel">
    <div class="panel-header">
      <span>INDEXED_SYSTEMS</span>
      <span class="panel-header-right">REGISTRY_COUNT: {{PROJECT_COUNT}}</span>
    </div>
    <div class="panel-content">
      <div class="list-grid">
        {{PROJECT_LIST}}
      </div>
    </div>
  </div>
</main>

<footer class="sys-footer">
  <div>GREG ITEEN &copy; 2026</div>
  <div class="footer-stamp">SYSTEM_RUNNING</div>
  <div>IP_SECURE_ADDR: LOCALHOST</div>
</footer>
```

## section:layout:designs_index

```html
<header class="sys-header">
  <div class="sys-top-bar">
    <div class="sys-identity">
      <img src="/assets/gen-logo.png" alt="GI Monogram" class="sys-logo" />
      <div class="sys-tag">GREG ITEEN</div>
    </div>
    <div class="sys-meta-stats">
      <div class="sys-stat-item">SYSTEM: <span>SOVEREIGN // FILE-NATIVE AI</span></div>
    </div>
  </div>
  <nav class="sys-nav">
    <a href="/">01_HOME</a>
    <a href="/projects">02_SYSTEMS</a>
    <a href="/designs" class="active">03_BLUEPRINTS</a>
    <a href="/about">04_DOSSIER</a>
  </nav>
</header>

<main style="margin-top: 2rem;">
  <div class="panel">
    <div class="panel-header">
      <span>VISUAL_ENGINE_INDEX</span>
      <span class="panel-header-right">REGISTRY_COUNT: {{DESIGN_COUNT}}</span>
    </div>
    <div class="panel-content">
      <div class="card-grid">
        {{DESIGN_CARDS}}
      </div>
    </div>
  </div>

  <div class="panel">
    <div class="panel-header">
      <span>RENDERER_CONTROLS</span>
      <span class="panel-header-right">SYS_GEN</span>
    </div>
    <div class="panel-content">
      <div class="generator-wrapper">
        {{GENERATOR_FORM}}
      </div>
    </div>
  </div>
</main>

<footer class="sys-footer">
  <div>GREG ITEEN &copy; 2026</div>
  <div class="footer-stamp">RENDER_MATRIX_OK</div>
  <div>IP_SECURE_ADDR: LOCALHOST</div>
</footer>
```

## section:layout:project_detail

```html
<header class="sys-header">
  <div class="sys-top-bar">
    <div class="sys-identity">
      <img src="/assets/gen-logo.png" alt="GI Monogram" class="sys-logo" />
      <div class="sys-tag">GREG ITEEN</div>
    </div>
    <div class="sys-meta-stats">
      <div class="sys-stat-item">SYSTEM: <span>SOVEREIGN // FILE-NATIVE AI</span></div>
    </div>
  </div>
  <nav class="sys-nav">
    <a href="/">01_HOME</a>
    <a href="/projects" class="active">02_SYSTEMS</a>
    <a href="/designs">03_BLUEPRINTS</a>
    <a href="/about">04_DOSSIER</a>
  </nav>
</header>

<main style="margin-top: 2rem;">
  <a href="/projects" class="back-btn">&larr; Return to Index</a>
  <div class="detail-layout">
    <div class="detail-sidebar">
      <div class="sidebar-block">
        <div class="sidebar-header">METRICS</div>
        <div class="sidebar-content">
          <ul class="sidebar-meta-list">
            <li>
              <span class="meta-label">Year</span>
              <span class="meta-value">{{YEAR}}</span>
            </li>
            <li>
              <span class="meta-label">Role</span>
              <span class="meta-value">{{ROLE}}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="sidebar-block">
        <div class="sidebar-header">TECHNOLOGY_STACK</div>
        <div class="sidebar-content">
          <div class="tech-badge-container">
            {{TECH_BADGES}}
          </div>
        </div>
      </div>
    </div>

    <div class="detail-main">
      <div class="detail-header-block">
        <h1 class="detail-title">{{NAME}}</h1>
        <p class="detail-desc">{{DESCRIPTION}}</p>
      </div>
      <div class="detail-content-area">
        {{CONTENT}}
      </div>
    </div>
  </div>
</main>

<footer class="sys-footer">
  <div>GREG ITEEN &copy; 2026</div>
  <div class="footer-stamp">ACTIVE RECORD DISPLAYED</div>
  <div>IP_SECURE_ADDR: LOCALHOST</div>
</footer>
```

## section:layout:design_detail

```html
<header class="sys-header">
  <div class="sys-top-bar">
    <div class="sys-identity">
      <img src="/assets/gen-logo.png" alt="GI Monogram" class="sys-logo" />
      <div class="sys-tag">GREG ITEEN</div>
    </div>
    <div class="sys-meta-stats">
      <div class="sys-stat-item">SYSTEM: <span>SOVEREIGN // FILE-NATIVE AI</span></div>
    </div>
  </div>
  <nav class="sys-nav">
    <a href="/">01_HOME</a>
    <a href="/projects">02_SYSTEMS</a>
    <a href="/designs" class="active">03_BLUEPRINTS</a>
    <a href="/about">04_DOSSIER</a>
  </nav>
</header>

<main style="margin-top: 2rem;">
  <a href="/designs" class="back-btn">&larr; Return to Blueprints</a>
  <div class="detail-layout">
    <div class="detail-sidebar">
      <div class="sidebar-block">
        <div class="sidebar-header">METADATA</div>
        <div class="sidebar-content">
          <ul class="sidebar-meta-list">
            <li>
              <span class="meta-label">Year</span>
              <span class="meta-value">{{YEAR}}</span>
            </li>
            <li>
              <span class="meta-label">Aspect</span>
              <span class="meta-value">{{ROLE}}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="sidebar-block">
        <div class="sidebar-header">PREVIEW_MODULE</div>
        <div class="sidebar-content" style="padding: 0;">
          <img src="{{PREVIEW}}" alt="{{NAME}}" style="width:100%; height:auto; display:block; filter: grayscale(100%);" />
        </div>
      </div>
    </div>

    <div class="detail-main">
      <div class="detail-header-block">
        <h1 class="detail-title">{{NAME}}</h1>
        <p class="detail-desc">{{DESCRIPTION}}</p>
      </div>
      <div class="detail-content-area">
        {{CONTENT}}
      </div>
    </div>
  </div>
</main>

<footer class="sys-footer">
  <div>GREG ITEEN &copy; 2026</div>
  <div class="footer-stamp">ACTIVE BLUEPRINT DISPLAYED</div>
  <div>IP_SECURE_ADDR: LOCALHOST</div>
</footer>
```

## section:layout:page

```html
<header class="sys-header">
  <div class="sys-top-bar">
    <div class="sys-identity">
      <img src="/assets/gen-logo.png" alt="GI Monogram" class="sys-logo" />
      <div class="sys-tag">GREG ITEEN</div>
    </div>
    <div class="sys-meta-stats">
      <div class="sys-stat-item">SYSTEM: <span>SOVEREIGN // FILE-NATIVE AI</span></div>
    </div>
  </div>
  <nav class="sys-nav">
    <a href="/">01_HOME</a>
    <a href="/projects">02_SYSTEMS</a>
    <a href="/designs">03_BLUEPRINTS</a>
    <a href="/about" class="active">04_DOSSIER</a>
  </nav>
</header>

<main style="margin-top: 2rem;">
  <div class="panel">
    <div class="panel-header">
      <span>{{NAME}}</span>
      <span class="panel-header-right">SYS_PAGE</span>
    </div>
    <div class="panel-content">
      <div class="detail-content-area" style="border: none; padding: 0;">
        {{CONTENT}}
      </div>
    </div>
  </div>
</main>

<footer class="sys-footer">
  <div>GREG ITEEN &copy; 2026</div>
  <div class="footer-stamp">DOSSIER READ_OK</div>
  <div>IP_SECURE_ADDR: LOCALHOST</div>
</footer>
```

## section:layout:project_item

```html
<a href="{{URL}}" class="project-row">
  <div class="project-index">{{INDEX}}</div>
  <div class="project-meta">
    <div class="project-title">{{NAME}}</div>
  </div>
  <div class="project-desc">{{DESCRIPTION}}</div>
  <div class="project-year">{{YEAR}}</div>
</a>
```

## section:layout:design_item

```html
<a href="{{URL}}" class="design-card">
  <div class="design-preview-container" style="background-image: url('{{PREVIEW}}');"></div>
  <div class="design-body">
    <div class="design-title">{{NAME}}</div>
    <div class="design-year-tag">{{YEAR}}</div>
  </div>
</a>
```

## section:layout:nav_item

```html
<a href="{{NAV_URL}}" class="{{NAV_ACTIVE_CLASS}}">{{NAV_NAME}}</a>
```
