---
type: page
slug: "theme-mra3fi20"
name: "Sovereign Ledger"
title: "Custom Theme Config"
description: "AI-generated bespoke skin for style: A sophisticated editorial layout for a software engineer focused on sovereign data. Palette: muted slate, off-white paper textures, deep navy typography. Typography: elegant transitional serif paired with a technical micro-mono. Layout: asymmetric but strictly gridded, evoking physical library archives and ledgers."
timestamp: "2026-07-07T03:33:09.686Z"
sandbox_entry: "designs/theme-mra3fi20.html"
x_kind: "theme"
x_accent: "#0F1E2C"
x_prompt: "A sophisticated editorial layout for a software engineer focused on sovereign data. Palette: muted slate, off-white paper textures, deep navy typography. Typography: elegant transitional serif paired with a technical micro-mono. Layout: asymmetric but strictly gridded, evoking physical library archives and ledgers."
---

Bespoke generated theme. CSS and layout templates live in the fenced sections below; all copy is injected from the vault at build time.

## section:css

```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=PT+Mono&display=swap');

:root {
  --color-bg: #F5F4F0;
  --color-text: #0F1E2C;
  --color-slate: #6A7B83;
  --color-border: #D1CFCE;
  --color-accent: #B3543D;
  --font-serif: 'Cormorant Garamond', serif;
  --font-mono: 'PT Mono', monospace;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--color-bg);
  background-image: radial-gradient(var(--color-border) 1px, transparent 1px);
  background-size: 24px 24px;
  color: var(--color-text);
  font-family: var(--font-serif);
  font-size: 1.15rem;
  line-height: 1.6;
  padding: 2rem;
  min-height: 100vh;
}

header.global-header {
  display: grid;
  grid-template-columns: 1fr 3fr;
  border-bottom: 2px solid var(--color-text);
  padding-bottom: 1.5rem;
  margin-bottom: 3rem;
}

.logo-wrap {
  display: flex;
  align-items: center;
}

.logo-wrap img {
  max-height: 50px;
  width: auto;
  filter: grayscale(100%) contrast(120%);
}

nav.global-nav {
  display: flex;
  justify-content: flex-end;
  gap: 2rem;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  align-items: center;
}

nav.global-nav a {
  color: var(--color-text);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

nav.global-nav a:hover, nav.global-nav a.active {
  color: var(--color-accent);
  border-bottom: 1px solid var(--color-accent);
}

.ledger-grid {
  display: grid;
  grid-template-columns: 1fr 2.5fr;
  gap: 3rem;
  border-left: 1px solid var(--color-border);
  padding-left: 2rem;
}

.ledger-meta {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--color-slate);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-right: 1px solid var(--color-border);
  padding-right: 1.5rem;
}

.ledger-meta h2 {
  font-size: 1rem;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.ledger-content {
  padding-bottom: 4rem;
}

.hero-section {
  position: relative;
  margin-bottom: 4rem;
  border: 1px solid var(--color-text);
  background-color: #EBEAE3;
  overflow: hidden;
}

.hero-image {
  width: 100%;
  height: 380px;
  object-fit: cover;
  filter: grayscale(100%) contrast(110%) brightness(95%);
  border-bottom: 1px solid var(--color-text);
}

.hero-text-block {
  padding: 2.5rem;
}

.hero-thesis {
  font-size: 2.5rem;
  line-height: 1.2;
  font-weight: 400;
  max-width: 800px;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.hero-tagline {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  text-transform: uppercase;
  color: var(--color-accent);
  letter-spacing: 0.05em;
}

.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

.project-card {
  border: 1px solid var(--color-border);
  padding: 1.5rem;
  background: #FDFDFD;
  transition: border-color 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 250px;
}

.project-card:hover {
  border-color: var(--color-text);
}

.project-card h3 {
  font-family: var(--font-serif);
  font-size: 1.8rem;
  font-weight: 400;
  margin-bottom: 0.5rem;
}

.project-card p {
  font-size: 1rem;
  color: var(--color-slate);
  margin-bottom: 1.5rem;
}

.project-card .card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  border-top: 1px dashed var(--color-border);
  padding-top: 1rem;
}

.project-card a {
  color: var(--color-text);
  text-decoration: none;
  font-weight: bold;
}

.project-card a:hover {
  color: var(--color-accent);
}

.detail-container {
  max-width: 900px;
  margin: 0 auto;
}

.detail-header {
  border-bottom: 1px solid var(--color-text);
  padding-bottom: 2rem;
  margin-bottom: 2rem;
}

.detail-header h1 {
  font-family: var(--font-serif);
  font-size: 3.5rem;
  font-weight: 400;
  line-height: 1.1;
  margin-bottom: 1rem;
}

.metadata-bar {
  display: flex;
  gap: 3rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--color-slate);
}

.metadata-bar strong {
  color: var(--color-text);
}

.detail-body {
  font-size: 1.25rem;
  line-height: 1.7;
  color: var(--color-text);
}

.detail-body p {
  margin-bottom: 1.5rem;
}

.md-img {
  width: 100%;
  max-height: 500px;
  object-fit: cover;
  filter: grayscale(100%);
  border: 1px solid var(--color-text);
  margin: 2rem 0;
}

.badge {
  background: #EBEAE3;
  border: 1px solid var(--color-border);
  padding: 0.2rem 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  text-transform: uppercase;
  display: inline-block;
}

.design-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.design-card {
  border: 1px solid var(--color-border);
  background: #FDFDFD;
  overflow: hidden;
}

.design-preview {
  width: 100%;
  height: 200px;
  object-fit: cover;
  filter: grayscale(100%) contrast(110%);
  border-bottom: 1px solid var(--color-border);
}

.design-info {
  padding: 1rem;
}

.design-info h3 {
  font-family: var(--font-serif);
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
}

footer.global-footer {
  margin-top: 5rem;
  border-top: 1px solid var(--color-border);
  padding-top: 2rem;
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--color-slate);
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 500px;
  margin-top: 2rem;
}

input, textarea, button {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  padding: 0.8rem;
  border: 1px solid var(--color-text);
  background: transparent;
}

button {
  background: var(--color-text);
  color: var(--color-bg);
  cursor: pointer;
  text-transform: uppercase;
  transition: opacity 0.2s;
}

button:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .ledger-grid {
    grid-template-columns: 1fr;
    padding-left: 0;
    border-left: none;
  }
  .ledger-meta {
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 1rem;
    padding-right: 0;
  }
  .grid-container {
    grid-template-columns: 1fr;
  }
  header.global-header {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  nav.global-nav {
    justify-content: flex-start;
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
  <title>Greg Iteen / Sovereign AI &amp; Architecture</title>
  <link rel="icon" href="/assets/favicon.png">
  <style>{{CSS}}</style>
</head>
<body>
  <header class="global-header">
    <div class="logo-wrap">
      <img src="/assets/gen-logo.png" alt="GI Monogram" />
    </div>
    <nav class="global-nav">
      <a href="/" class="active">Index</a>
      <a href="/projects">Repository</a>
      <a href="/designs">Visual Log</a>
      <a href="/about">Thesis</a>
      <a href="/contact">Handshake</a>
    </nav>
  </header>

  <section class="hero-section">
    <img class="hero-image" src="/assets/gen-hero.jpg" alt="Sovereign Archive" />
    <div class="hero-text-block">
      <h1 class="hero-thesis">{{HEADLINE}}</h1>
      <div class="hero-tagline">{{TAGLINE}}</div>
    </div>
  </section>

  <div class="ledger-grid">
    <div class="ledger-meta">
      <h2>System Index</h2>
      <div>LOC: US-EAST</div>
      <div>MUTED SLATE // PAPER</div>
      <div style="margin-top: 1rem;">PROJECT COUNT: {{FEATURED_COUNT}}</div>
    </div>
    <div class="ledger-content">
      <p class="intro-thesis" style="font-size: 1.5rem; margin-bottom: 3rem; max-width: 700px;">{{INTRO}}</p>
      <div class="grid-container">
        {{FEATURED_PROJECTS}}
      </div>
      <div style="margin-top: 4rem; border-top: 1px dashed var(--color-border); padding-top: 3rem;">
        <h3 style="font-family: var(--font-mono); font-size: 1rem; margin-bottom: 1rem; text-transform: uppercase;">System Generation Protocol</h3>
        {{GENERATOR_FORM}}
      </div>
    </div>
  </div>

  <footer class="global-footer">
    <div>ARCHIVAL LOG V1.0</div>
    <div>&copy; 2026 GREG ITEEN. SOVEREIGN AND IMMUTABLE.</div>
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
  <title>Repository / Greg Iteen</title>
  <link rel="icon" href="/assets/favicon.png">
  <style>{{CSS}}</style>
</head>
<body>
  <header class="global-header">
    <div class="logo-wrap">
      <img src="/assets/gen-logo.png" alt="GI Monogram" />
    </div>
    <nav class="global-nav">
      <a href="/">Index</a>
      <a href="/projects" class="active">Repository</a>
      <a href="/designs">Visual Log</a>
      <a href="/about">Thesis</a>
      <a href="/contact">Handshake</a>
    </nav>
  </header>

  <div class="ledger-grid">
    <div class="ledger-meta">
      <h2>File native</h2>
      <div>RECORD COUNT: {{PROJECT_COUNT}}</div>
      <div>SOVEREIGN STACK</div>
    </div>
    <div class="ledger-content">
      <h1 style="font-size: 3rem; font-weight: 400; margin-bottom: 2rem;">Sovereign Repositories</h1>
      <div class="grid-container">
        {{PROJECT_LIST}}
      </div>
    </div>
  </div>

  <footer class="global-footer">
    <div>ARCHIVAL LOG V1.0</div>
    <div>&copy; 2026 GREG ITEEN.</div>
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
  <title>Visual Ledger / Greg Iteen</title>
  <link rel="icon" href="/assets/favicon.png">
  <style>{{CSS}}</style>
</head>
<body>
  <header class="global-header">
    <div class="logo-wrap">
      <img src="/assets/gen-logo.png" alt="GI Monogram" />
    </div>
    <nav class="global-nav">
      <a href="/">Index</a>
      <a href="/projects">Repository</a>
      <a href="/designs" class="active">Visual Log</a>
      <a href="/about">Thesis</a>
      <a href="/contact">Handshake</a>
    </nav>
  </header>

  <div class="ledger-grid">
    <div class="ledger-meta">
      <h2>Visual Ledger</h2>
      <div>ITEMS: {{DESIGN_COUNT}}</div>
      <div>RAW IMAGES</div>
    </div>
    <div class="ledger-content">
      <h1 style="font-size: 3rem; font-weight: 400; margin-bottom: 2rem;">Artifact Storage</h1>
      <div class="design-grid">
        {{DESIGN_CARDS}}
      </div>
      <div style="margin-top: 4rem; border-top: 1px dashed var(--color-border); padding-top: 3rem;">
        {{GENERATOR_FORM}}
      </div>
    </div>
  </div>

  <footer class="global-footer">
    <div>ARCHIVAL LOG V1.0</div>
    <div>&copy; 2026 GREG ITEEN.</div>
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
  <title>{{NAME}} / Sovereign Ledger</title>
  <link rel="icon" href="/assets/favicon.png">
  <style>{{CSS}}</style>
</head>
<body>
  <header class="global-header">
    <div class="logo-wrap">
      <img src="/assets/gen-logo.png" alt="GI Monogram" />
    </div>
    <nav class="global-nav">
      <a href="/">Index</a>
      <a href="/projects" class="active">Repository</a>
      <a href="/designs">Visual Log</a>
      <a href="/about">Thesis</a>
      <a href="/contact">Handshake</a>
    </nav>
  </header>

  <div class="detail-container">
    <div class="detail-header">
      <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--color-accent); margin-bottom: 0.5rem;">{{BACKLINK}}</div>
      <h1>{{NAME}}</h1>
      <div class="metadata-bar">
        <div>YEAR: <strong>{{YEAR}}</strong></div>
        <div>ROLE: <strong>{{ROLE}}</strong></div>
        <div>SOURCE: <strong>{{SOURCE_PATH}}</strong></div>
      </div>
    </div>
    
    <div class="detail-body">
      <div style="margin-bottom: 2rem;">
        {{TECH_BADGES}}
      </div>
      <p style="font-family: var(--font-mono); font-size: 1rem; color: var(--color-slate); line-height: 1.5; border-left: 2px solid var(--color-accent); padding-left: 1rem; margin-bottom: 2rem;">
        {{DESCRIPTION}}
      </p>
      {{CONTENT}}
      
      <div style="margin-top: 3rem; display: flex; gap: 1rem;">
        {{REPO_LINK}}
        {{PROJECT_LINK}}
      </div>
    </div>
  </div>

  <footer class="global-footer">
    <div>ARCHIVAL LOG V1.0</div>
    <div>&copy; 2026 GREG ITEEN.</div>
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
  <title>{{NAME}} / Sovereign Ledger</title>
  <link rel="icon" href="/assets/favicon.png">
  <style>{{CSS}}</style>
</head>
<body>
  <header class="global-header">
    <div class="logo-wrap">
      <img src="/assets/gen-logo.png" alt="GI Monogram" />
    </div>
    <nav class="global-nav">
      <a href="/">Index</a>
      <a href="/projects">Repository</a>
      <a href="/designs" class="active">Visual Log</a>
      <a href="/about">Thesis</a>
      <a href="/contact">Handshake</a>
    </nav>
  </header>

  <div class="detail-container">
    <div class="detail-header">
      <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--color-accent); margin-bottom: 0.5rem;">{{BACKLINK}}</div>
      <h1>{{NAME}}</h1>
      <div class="metadata-bar">
        <div>CLIENT: <strong>{{CLIENT}}</strong></div>
        <div>YEAR: <strong>{{YEAR}}</strong></div>
        <div>ROLE: <strong>{{ROLE}}</strong></div>
      </div>
    </div>
    
    <div class="detail-body">
      <img src="{{PREVIEW}}" alt="{{NAME}} preview" style="width: 100%; height: auto; border: 1px solid var(--color-text); margin-bottom: 2rem; filter: grayscale(100%) contrast(110%);" />
      <p style="font-size: 1.4rem; line-height: 1.5; color: var(--color-slate); margin-bottom: 2rem;">{{DESCRIPTION}}</p>
      {{CONTENT}}
    </div>
  </div>

  <footer class="global-footer">
    <div>ARCHIVAL LOG V1.0</div>
    <div>&copy; 2026 GREG ITEEN.</div>
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
  <title>{{NAME}} / Greg Iteen</title>
  <link rel="icon" href="/assets/favicon.png">
  <style>{{CSS}}</style>
</head>
<body>
  <header class="global-header">
    <div class="logo-wrap">
      <img src="/assets/gen-logo.png" alt="GI Monogram" />
    </div>
    <nav class="global-nav">
      <a href="/">Index</a>
      <a href="/projects">Repository</a>
      <a href="/designs">Visual Log</a>
      <a href="/about">Thesis</a>
      <a href="/contact">Handshake</a>
    </nav>
  </header>

  <div class="ledger-grid">
    <div class="ledger-meta">
      <h2>Information Schema</h2>
      <div>PATH: {{SOURCE_PATH}}</div>
    </div>
    <div class="ledger-content">
      <h1 style="font-size: 3rem; font-weight: 400; margin-bottom: 2rem;">{{NAME}}</h1>
      <div class="detail-body">
        {{CONTENT}}
      </div>
    </div>
  </div>

  <footer class="global-footer">
    <div>ARCHIVAL LOG V1.0</div>
    <div>&copy; 2026 GREG ITEEN.</div>
  </footer>
</body>
</html>
```

## section:layout:project_item

```html
<div class="project-card">
  <div>
    <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-accent); margin-bottom: 0.5rem;">[{{INDEX}}]</div>
    <h3>{{NAME}}</h3>
    <p>{{DESCRIPTION}}</p>
  </div>
  <div class="card-footer">
    <div>{{YEAR}}</div>
    <a href="{{URL}}">READ LOG &rarr;</a>
  </div>
</div>
```

## section:layout:design_item

```html
<div class="design-card">
  <img class="design-preview" src="{{PREVIEW}}" alt="{{NAME}} preview" />
  <div class="design-info">
    <div style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--color-slate); text-transform: uppercase;">{{CLIENT}} &mdash; {{YEAR}}</div>
    <h3>{{NAME}}</h3>
    <a href="{{URL}}" style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--color-text); text-decoration: none; border-bottom: 1px solid var(--color-text);">INSPECT</a>
  </div>
</div>
```

## section:layout:nav_item

```html
<a href="{{NAV_URL}}" class="{{NAV_ACTIVE_CLASS}}">{{NAV_NAME}}</a>
```
