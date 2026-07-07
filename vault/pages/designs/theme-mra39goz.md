---
type: page
slug: "theme-mra39goz"
name: "NEON_NODE_808"
title: "Custom Theme Config"
description: "AI-generated bespoke skin for style: Cyberpunk Neon dashboard with glowing cyan and magenta"
timestamp: "2026-07-07T03:28:44.261Z"
sandbox_entry: "designs/theme-mra39goz.html"
x_kind: "theme"
x_accent: "#00f3ff"
x_prompt: "Cyberpunk Neon dashboard with glowing cyan and magenta"
---

Bespoke generated theme. CSS and layout templates live in the fenced sections below; all copy is injected from the vault at build time.

## section:css

```css
/* @import GOOGLE FONTS */
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Syncopate:wght@700&display=swap');

:root {
  --color-obsidian: #08020f;
  --color-undercurrent: #1a0933;
  --color-cyan: #00f3ff;
  --color-magenta: #ff007f;
  --color-tritium: #c4ff2a;
  --color-white: #f0f3f6;
  --color-muted: #8b7ca3;
  
  --font-header: 'Syncopate', sans-serif;
  --font-mono: 'Share Tech Mono', monospace;
  
  --glow-cyan: 0 0 8px rgba(0, 243, 255, 0.4), 0 0 16px rgba(0, 243, 255, 0.2);
  --glow-magenta: 0 0 8px rgba(255, 0, 127, 0.4), 0 0 16px rgba(255, 0, 127, 0.2);
  --border-glow: 1px solid rgba(0, 243, 255, 0.3);
}

/* RESET & BASE SYSTEM */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--color-obsidian);
  color: var(--color-white);
  font-family: var(--font-mono);
  font-size: 16px;
  line-height: 1.6;
  letter-spacing: 0.05em;
  overflow-x: hidden;
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(26, 9, 51, 0.3) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(255, 0, 127, 0.05) 0%, transparent 50%),
    linear-gradient(rgba(0, 243, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 243, 255, 0.02) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
  border: 1px solid var(--color-undercurrent);
  padding: 10px;
  min-height: 100vh;
}

/* GLOBAL SCROLLBARS */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: var(--color-obsidian);
}
::-webkit-scrollbar-thumb {
  background: var(--color-cyan);
  box-shadow: var(--glow-cyan);
}

/* TYPOGRAPHY OVERLAY */
h1, h2, h3, h4 {
  font-family: var(--font-header);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-weight: 700;
}

h1 {
  color: var(--color-cyan);
  text-shadow: var(--glow-cyan);
  font-size: clamp(1.8rem, 5vw, 3rem);
  line-height: 1.1;
  margin-bottom: 20px;
}

h2 {
  color: var(--color-magenta);
  text-shadow: var(--glow-magenta);
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  border-left: 4px solid var(--color-magenta);
  padding-left: 12px;
  margin-bottom: 25px;
}

p {
  color: var(--color-white);
  margin-bottom: 20px;
}

a {
  color: var(--color-cyan);
  text-decoration: none;
  transition: all 0.2s ease;
}

a:hover {
  color: var(--color-tritium);
  text-shadow: 0 0 8px rgba(196, 255, 42, 0.6);
}

/* PERSISTENT HEADER FRAME */
header.terminal-nav {
  border: var(--border-glow);
  background: rgba(8, 2, 15, 0.95);
  padding: 15px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 10px;
  z-index: 100;
  margin-bottom: 30px;
  box-shadow: inset 0 0 15px rgba(0, 243, 255, 0.1), var(--glow-cyan);
  clip-path: polygon(0 0, 98% 0, 100% 30%, 100% 100%, 2% 100%, 0 70%);
}

.logo-wrap {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-wrap img {
  height: 35px;
  filter: drop-shadow(0 0 5px var(--color-cyan));
}

.site-title {
  font-family: var(--font-header);
  font-size: 0.9rem;
  letter-spacing: 0.2em;
  color: var(--color-white);
  display: flex;
  flex-direction: column;
}

.site-title span {
  font-size: 0.6rem;
  color: var(--color-cyan);
}

nav.nav-links {
  display: flex;
  gap: 20px;
}

nav.nav-links a {
  font-size: 0.85rem;
  text-transform: uppercase;
  padding: 5px 12px;
  border: 1px solid transparent;
}

nav.nav-links a.active {
  border: 1px dashed var(--color-magenta);
  color: var(--color-magenta);
  background: rgba(255, 0, 127, 0.05);
  text-shadow: var(--glow-magenta);
}

/* HERO STRUCTURE */
.hero-hud {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 25px;
  margin-bottom: 40px;
}

@media (max-width: 900px) {
  .hero-hud {
    grid-template-columns: 1fr;
  }
}

.hero-main {
  background: linear-gradient(135deg, rgba(8, 2, 15, 0.9) 0%, rgba(26, 9, 51, 0.7) 100%), url('/assets/gen-hero.jpg') no-repeat center/cover;
  background-blend-mode: color-dodge;
  border: var(--border-glow);
  padding: 50px 40px;
  position: relative;
  min-height: 450px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  clip-path: polygon(0 0, 100% 0, 100% 90%, 95% 100%, 0 100%);
}

.hero-main::before {
  content: 'FILE_NATIVE_NODE';
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 0.7rem;
  color: var(--color-cyan);
  background: rgba(0, 243, 255, 0.1);
  padding: 3px 8px;
  border: 1px solid var(--color-cyan);
}

.hero-tagline {
  font-family: var(--font-header);
  font-size: 1.1rem;
  color: var(--color-tritium);
  margin-bottom: 25px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.hero-intro {
  max-width: 650px;
  color: var(--color-white);
  font-size: 1.1rem;
}

/* HERO SIDEBAR - COLD SYSTEM FEED */
.hero-status-panel {
  border: 1px solid var(--color-magenta);
  background: rgba(26, 9, 51, 0.5);
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.panel-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--color-magenta);
  margin-bottom: 15px;
  border-bottom: 1px solid var(--color-magenta);
  padding-bottom: 5px;
}

.telemetry-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  padding: 8px 0;
  border-bottom: 1px dotted rgba(255, 0, 127, 0.2);
}

.telemetry-row span:last-child {
  color: var(--color-tritium);
}

/* HUD MODULES */
.hud-module {
  background: rgba(26, 9, 51, 0.3);
  border: 1px solid rgba(0, 243, 255, 0.15);
  padding: 30px;
  margin-bottom: 30px;
  position: relative;
}

.hud-module::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  width: 15px;
  height: 15px;
  border-top: 2px solid var(--color-cyan);
  border-left: 2px solid var(--color-cyan);
}

.hud-module::after {
  content: '';
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 15px;
  height: 15px;
  border-bottom: 2px solid var(--color-magenta);
  border-right: 2px solid var(--color-magenta);
}

/* GRID LAYOUTS FOR DIRECTORIES */
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
}

/* PROJECT & DESIGN CARDS */
.terminal-card {
  background: rgba(8, 2, 15, 0.8);
  border: 1px solid var(--color-undercurrent);
  padding: 25px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 220px;
  transition: transform 0.2s, border-color 0.2s;
}

.terminal-card:hover {
  border-color: var(--color-cyan);
  box-shadow: var(--glow-cyan);
  transform: translateY(-2px);
}

.card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--color-muted);
  margin-bottom: 15px;
}

.card-index {
  color: var(--color-tritium);
}

.card-title {
  font-family: var(--font-header);
  font-size: 1.1rem;
  color: var(--color-white);
  margin-bottom: 10px;
  text-transform: uppercase;
}

.card-desc {
  color: var(--color-muted);
  font-size: 0.9rem;
  margin-bottom: 20px;
  flex-grow: 1;
}

.badge-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.badge {
  font-size: 0.7rem;
  background: rgba(0, 243, 255, 0.05);
  border: 1px solid rgba(0, 243, 255, 0.3);
  color: var(--color-cyan);
  padding: 2px 6px;
  text-transform: uppercase;
}

.terminal-link {
  font-size: 0.85rem;
  text-transform: uppercase;
  color: var(--color-magenta);
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.terminal-link:hover {
  color: var(--color-cyan);
}

/* VISUAL DESIGN ITEMS PORTFOLIO */
.design-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.design-card {
  background: rgba(8, 2, 15, 0.9);
  border: 1px solid rgba(255, 0, 127, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

.design-card:hover {
  border-color: var(--color-magenta);
  box-shadow: var(--glow-magenta);
}

.design-preview-container {
  width: 100%;
  height: 200px;
  position: relative;
  background: var(--color-undercurrent);
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 0, 127, 0.2);
}

.design-preview-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%) contrast(120%) brightness(80%);
  mix-blend-mode: screen;
  transition: all 0.3s ease;
}

.design-card:hover .design-preview-container img {
  filter: none;
  mix-blend-mode: normal;
  transform: scale(1.03);
}

.design-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* DETAIL PAGES */
.detail-header {
  border-bottom: 1px solid var(--color-undercurrent);
  padding-bottom: 30px;
  margin-bottom: 40px;
}

.detail-meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin: 25px 0;
  padding: 15px;
  background: rgba(26, 9, 51, 0.4);
  border-left: 3px solid var(--color-cyan);
}

.meta-cell {
  display: flex;
  flex-direction: column;
}

.meta-label {
  font-size: 0.7rem;
  color: var(--color-muted);
  text-transform: uppercase;
  margin-bottom: 5px;
}

.meta-value {
  font-size: 0.9rem;
  font-weight: bold;
  color: var(--color-white);
}

.detail-body {
  font-size: 1.1rem;
  line-height: 1.7;
  max-width: 800px;
}

.detail-body p {
  margin-bottom: 25px;
}

.detail-body h3 {
  font-size: 1.2rem;
  color: var(--color-cyan);
  margin-top: 40px;
  margin-bottom: 15px;
}

.detail-preview-frame {
  border: 1px solid var(--color-magenta);
  box-shadow: var(--glow-magenta);
  margin-bottom: 40px;
  max-height: 500px;
  overflow: hidden;
}

.detail-preview-frame img {
  width: 100%;
  height: auto;
  display: block;
}

/* FORM GENERATOR - TERMINAL STYLE */
.terminal-form {
  border: 1px dashed rgba(0, 243, 255, 0.5);
  background: rgba(8, 2, 15, 0.9);
  padding: 30px;
  margin-top: 40px;
}

.terminal-form-title {
  font-family: var(--font-header);
  font-size: 1rem;
  color: var(--color-cyan);
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(0, 243, 255, 0.2);
  padding-bottom: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 0.8rem;
  color: var(--color-muted);
  text-transform: uppercase;
  margin-bottom: 8px;
}

.form-control {
  width: 100%;
  background: var(--color-obsidian);
  border: 1px solid var(--color-undercurrent);
  color: var(--color-white);
  font-family: var(--font-mono);
  padding: 10px 15px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-cyan);
  box-shadow: var(--glow-cyan);
}

textarea.form-control {
  resize: vertical;
  min-height: 120px;
}

.terminal-btn {
  background: transparent;
  border: 1px solid var(--color-magenta);
  color: var(--color-magenta);
  font-family: var(--font-mono);
  text-transform: uppercase;
  font-weight: bold;
  padding: 12px 25px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--glow-magenta);
}

.terminal-btn:hover {
  background: var(--color-magenta);
  color: var(--color-obsidian);
  box-shadow: 0 0 15px var(--color-magenta);
}

/* MD-IMG PORTRAIT ALIGNMENT (ABOUT/CONTACT) */
.md-img {
  width: 100%;
  max-width: 320px;
  border: 2px solid var(--color-cyan);
  box-shadow: var(--glow-cyan);
  filter: grayscale(100%) contrast(110%);
  margin: 20px 0;
}

/* SYSTEM FOOTER */
footer.system-footer {
  border-top: 1px solid var(--color-undercurrent);
  margin-top: 60px;
  padding: 25px 0;
  text-align: center;
  font-size: 0.75rem;
  color: var(--color-muted);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 600px) {
  footer.system-footer {
    flex-direction: column;
    gap: 10px;
  }
}
```

## section:layout:home

```html
<header class="terminal-nav">
  <div class="logo-wrap">
    <img src="/assets/gen-logo.png" alt="GI Monogram Logo">
    <div class="site-title">
      GREG ITEEN
      <span>SOVEREIGN FILE-NATIVE AI SYS</span>
    </div>
  </div>
  <nav class="nav-links">
    <a href="/" class="active">NODE.HOME</a>
    <a href="/projects">PROJECTS</a>
    <a href="/designs">DESIGN.VECTORS</a>
    <a href="/about">ABOUT</a>
    <a href="/contact">CONTACT</a>
  </nav>
</header>

<main>
  <section class="hero-hud">
    <div class="hero-main">
      <h1>{{HEADLINE}}</h1>
      <div class="hero-tagline">// {{TAGLINE}}</div>
      <div class="hero-intro">{{INTRO}}</div>
    </div>
    
    <div class="hero-status-panel">
      <div>
        <div class="panel-label">NODE TELEMETRY</div>
        <div class="telemetry-row"><span>ENGINE_STATUS</span><span>ACTIVE</span></div>
        <div class="telemetry-row"><span>PROTOCOL</span><span>IPFS // FILE-NATIVE</span></div>
        <div class="telemetry-row"><span>INTEGRITY</span><span>100% SECURE</span></div>
        <div class="telemetry-row"><span>GEOLOCATION</span><span>[0x7F] SECURE</span></div>
      </div>
      <div>
        <div class="panel-label" style="margin-top: 20px;">DEPLOYMENTS</div>
        <div class="telemetry-row"><span>ACTIVE NODES</span><span>{{FEATURED_COUNT}} DETECTED</span></div>
      </div>
    </div>
  </section>

  <section class="hud-module">
    <h2>FEATURED_PROJECTS</h2>
    <div class="project-grid">
      {{FEATURED_PROJECTS}}
    </div>
  </section>

  <section class="hud-module">
    <h2>ESTABLISH TERMINAL HANDSHAKE</h2>
    {{GENERATOR_FORM}}
  </section>
</main>

<footer class="system-footer">
  <div>EST. 2026 // NEON_NODE_808 OPERATIONAL</div>
  <div>[PORT: 443] CONNECTED</div>
</footer>
```

## section:layout:projects_index

```html
<header class="terminal-nav">
  <div class="logo-wrap">
    <img src="/assets/gen-logo.png" alt="GI Monogram Logo">
    <div class="site-title">
      GREG ITEEN
      <span>SOVEREIGN FILE-NATIVE AI SYS</span>
    </div>
  </div>
  <nav class="nav-links">
    <a href="/">NODE.HOME</a>
    <a href="/projects" class="active">PROJECTS</a>
    <a href="/designs">DESIGN.VECTORS</a>
    <a href="/about">ABOUT</a>
    <a href="/contact">CONTACT</a>
  </nav>
</header>

<main class="hud-module">
  <h2>PROJECT DATABASE [{{PROJECT_COUNT}}]</h2>
  <div class="project-grid" style="margin-top: 25px;">
    {{PROJECT_LIST}}
  </div>
</main>

<footer class="system-footer">
  <div>EST. 2026 // NEON_NODE_808 OPERATIONAL</div>
  <div>[PORT: 443] CONNECTED</div>
</footer>
```

## section:layout:designs_index

```html
<header class="terminal-nav">
  <div class="logo-wrap">
    <img src="/assets/gen-logo.png" alt="GI Monogram Logo">
    <div class="site-title">
      GREG ITEEN
      <span>SOVEREIGN FILE-NATIVE AI SYS</span>
    </div>
  </div>
  <nav class="nav-links">
    <a href="/">NODE.HOME</a>
    <a href="/projects">PROJECTS</a>
    <a href="/designs" class="active">DESIGN.VECTORS</a>
    <a href="/about">ABOUT</a>
    <a href="/contact">CONTACT</a>
  </nav>
</header>

<main class="hud-module">
  <h2>DESIGN VECTOR MATRIX [{{DESIGN_COUNT}}]</h2>
  <div class="design-grid" style="margin-top: 25px;">
    {{DESIGN_CARDS}}
  </div>
  
  <section class="hud-module" style="margin-top: 40px;">
    <h2>ESTABLISH DESIGN CONSULTATION</h2>
    {{GENERATOR_FORM}}
  </section>
</main>

<footer class="system-footer">
  <div>EST. 2026 // NEON_NODE_808 OPERATIONAL</div>
  <div>[PORT: 443] CONNECTED</div>
</footer>
```

## section:layout:project_detail

```html
<header class="terminal-nav">
  <div class="logo-wrap">
    <img src="/assets/gen-logo.png" alt="GI Monogram Logo">
    <div class="site-title">
      GREG ITEEN
      <span>SOVEREIGN FILE-NATIVE AI SYS</span>
    </div>
  </div>
  <nav class="nav-links">
    <a href="/">NODE.HOME</a>
    <a href="/projects" class="active">PROJECTS</a>
    <a href="/designs">DESIGN.VECTORS</a>
    <a href="/about">ABOUT</a>
    <a href="/contact">CONTACT</a>
  </nav>
</header>

<main class="hud-module">
  <div class="detail-header">
    <a href="{{BACKLINK}}" class="terminal-link">◀ RETURN TO SYSTEM REPO</a>
    <h1 style="margin-top: 20px;">{{NAME}}</h1>
    <div style="color: var(--color-tritium); margin-top: 5px;">// {{DESCRIPTION}}</div>
    
    <div class="detail-meta-grid">
      <div class="meta-cell">
        <div class="meta-label">ROLE</div>
        <div class="meta-value">{{ROLE}}</div>
      </div>
      <div class="meta-cell">
        <div class="meta-label">TIMELINE</div>
        <div class="meta-value">{{YEAR}}</div>
      </div>
      <div class="meta-cell">
        <div class="meta-label">STACK DEPLOYMENT</div>
        <div class="meta-value">{{TECH_BADGES}}</div>
      </div>
      <div class="meta-cell">
        <div class="meta-label">SOURCE_PATH</div>
        <div class="meta-value">{{SOURCE_PATH}}</div>
      </div>
    </div>
    
    <div style="display: flex; gap: 15px; margin-top: 20px;">
      {{REPO_LINK}}
      {{PROJECT_LINK}}
    </div>
  </div>

  <div class="detail-body">
    {{CONTENT}}
  </div>
</main>

<footer class="system-footer">
  <div>EST. 2026 // NEON_NODE_808 OPERATIONAL</div>
  <div>[PORT: 443] CONNECTED</div>
</footer>
```

## section:layout:design_detail

```html
<header class="terminal-nav">
  <div class="logo-wrap">
    <img src="/assets/gen-logo.png" alt="GI Monogram Logo">
    <div class="site-title">
      GREG ITEEN
      <span>SOVEREIGN FILE-NATIVE AI SYS</span>
    </div>
  </div>
  <nav class="nav-links">
    <a href="/">NODE.HOME</a>
    <a href="/projects">PROJECTS</a>
    <a href="/designs" class="active">DESIGN.VECTORS</a>
    <a href="/about">ABOUT</a>
    <a href="/contact">CONTACT</a>
  </nav>
</header>

<main class="hud-module">
  <div class="detail-header">
    <a href="{{BACKLINK}}" class="terminal-link">◀ RETURN TO MATRIX</a>
    <h1 style="margin-top: 20px;">{{NAME}}</h1>
    <div style="color: var(--color-cyan); margin-top: 5px;">// {{DESCRIPTION}}</div>

    <div class="detail-meta-grid">
      <div class="meta-cell">
        <div class="meta-label">CLIENT</div>
        <div class="meta-value">{{CLIENT}}</div>
      </div>
      <div class="meta-cell">
        <div class="meta-label">ROLE</div>
        <div class="meta-value">{{ROLE}}</div>
      </div>
      <div class="meta-cell">
        <div class="meta-label">YEAR</div>
        <div class="meta-value">{{YEAR}}</div>
      </div>
      <div class="meta-cell">
        <div class="meta-label">TAG_BADGES</div>
        <div class="meta-value">{{TAG_BADGES}}</div>
      </div>
    </div>
  </div>

  <div class="detail-preview-frame">
    <img src="{{PREVIEW}}" alt="{{NAME}}">
  </div>

  <div class="detail-body">
    {{CONTENT}}
    
    <div style="margin-top: 30px;">
      <a href="{{LINK_URL}}" class="terminal-btn" target="_blank">LAUNCH LIVE DEPLOYMENT</a>
    </div>
  </div>
</main>

<footer class="system-footer">
  <div>EST. 2026 // NEON_NODE_808 OPERATIONAL</div>
  <div>[PORT: 443] CONNECTED</div>
</footer>
```

## section:layout:page

```html
<header class="terminal-nav">
  <div class="logo-wrap">
    <img src="/assets/gen-logo.png" alt="GI Monogram Logo">
    <div class="site-title">
      GREG ITEEN
      <span>SOVEREIGN FILE-NATIVE AI SYS</span>
    </div>
  </div>
  <nav class="nav-links">
    <a href="/">NODE.HOME</a>
    <a href="/projects">PROJECTS</a>
    <a href="/designs">DESIGN.VECTORS</a>
    <a href="/about">ABOUT</a>
    <a href="/contact">CONTACT</a>
  </nav>
</header>

<main class="hud-module">
  <h2>SYSTEM_PAGE // {{NAME}}</h2>
  <div style="font-size: 0.75rem; color: var(--color-muted); margin-bottom: 30px;">NODE_SOURCE: {{SOURCE_PATH}}</div>
  <div class="detail-body">
    {{CONTENT}}
  </div>
</main>

<footer class="system-footer">
  <div>EST. 2026 // NEON_NODE_808 OPERATIONAL</div>
  <div>[PORT: 443] CONNECTED</div>
</footer>
```

## section:layout:project_item

```html
<div class="terminal-card">
  <div>
    <div class="card-meta">
      <span class="card-index">[NODE_{{INDEX}}]</span>
      <span>{{YEAR}}</span>
    </div>
    <h3 class="card-title">{{NAME}}</h3>
    <p class="card-desc">{{DESCRIPTION}}</p>
    <div class="badge-container">
      {{TECH_BADGES}}
    </div>
  </div>
  <a href="{{URL}}" class="terminal-link">QUERY CORE LOGS ▶</a>
</div>
```

## section:layout:design_item

```html
<div class="design-card">
  <div class="design-preview-container">
    <img src="{{PREVIEW}}" alt="{{NAME}} preview image">
  </div>
  <div class="design-body">
    <div class="card-meta">
      <span>{{CLIENT}}</span>
      <span>{{YEAR}}</span>
    </div>
    <h3 class="card-title" style="font-size: 1rem;">{{NAME}}</h3>
    <p class="card-desc" style="margin-bottom: 10px;">{{DESCRIPTION}}</p>
    <a href="{{URL}}" class="terminal-link">EXPAND GRAPHIC ▶</a>
  </div>
</div>
```

## section:layout:nav_item

```html
<a href="{{NAV_URL}}" class="{{NAV_ACTIVE_CLASS}}">{{NAV_NAME}}</a>
```
