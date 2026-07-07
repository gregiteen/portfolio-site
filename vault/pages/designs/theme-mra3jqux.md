---
type: page
slug: "theme-mra3jqux"
name: "Sovereign Clay"
title: "Custom Theme Config"
description: "AI-generated bespoke skin for style: A tactile, organic-tech aesthetic for a developer of AI tools. Earthy tones like sage green, raw clay, and soft charcoal. Typography: a warm, humanist sans-serif that feels approachable but highly legible. Layout: soft boundaries, physical-feeling elements, evoking tools that belong to humans and live in the real world."
timestamp: "2026-07-07T03:36:31.728Z"
sandbox_entry: "designs/theme-mra3jqux.html"
x_kind: "theme"
x_accent: "#C28469"
x_prompt: "A tactile, organic-tech aesthetic for a developer of AI tools. Earthy tones like sage green, raw clay, and soft charcoal. Typography: a warm, humanist sans-serif that feels approachable but highly legible. Layout: soft boundaries, physical-feeling elements, evoking tools that belong to humans and live in the real world."
---

Bespoke generated theme. CSS and layout templates live in the fenced sections below; all copy is injected from the vault at build time.

## section:css

```css
@import url('https://fonts.googleapis.com/css2?family=Albert+Sans:wght@300;400;500;600&family=Courier+Prime&display=swap');

:root {
  --color-bg: #181A18;
  --color-panel: #222622;
  --color-border: #3A423B;
  --color-text-main: #F1EFEA;
  --color-text-muted: #9EAB9F;
  --color-sage: #7A8B7B;
  --color-clay: #C28469;
  --color-ochre: #CCA250;
  --font-sans: 'Albert Sans', sans-serif;
  --font-mono: 'Courier Prime', monospace;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text-main);
  font-family: var(--font-sans);
  line-height: 1.6;
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
}

/* Structural Layouts */
.site-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
}

header.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 1.5rem;
  margin-bottom: 3rem;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-img {
  height: 40px;
  width: auto;
  filter: grayscale(1) contrast(1.2);
}

.logo-text {
  font-family: var(--font-mono);
  font-weight: bold;
  font-size: 1.2rem;
  color: var(--color-clay);
}

nav.site-nav {
  display: flex;
  gap: 1.5rem;
}

nav.site-nav a {
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

nav.site-nav a:hover, nav.site-nav a.active {
  color: var(--color-text-main);
  background: var(--color-panel);
}

/* Hero / Intro */
.hero-section {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 3rem;
  margin-bottom: 5rem;
  background: var(--color-panel);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 4px 4px 0px rgba(0,0,0,0.3);
}

.hero-content {
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-badge {
  font-family: var(--font-mono);
  color: var(--color-ochre);
  font-size: 0.85rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hero-headline {
  font-size: 2.5rem;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.hero-tagline {
  font-family: var(--font-mono);
  color: var(--color-sage);
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.hero-intro {
  color: var(--color-text-muted);
  font-size: 1.05rem;
}

.hero-image-wrapper {
  background-image: url('/assets/gen-hero.jpg');
  background-size: cover;
  background-position: center;
  min-height: 320px;
  border-left: 2px solid var(--color-border);
}

/* File Lists / Cards */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.75rem;
  margin-bottom: 2rem;
}

.section-title {
  font-family: var(--font-mono);
  font-size: 1.2rem;
  color: var(--color-text-muted);
}

.project-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.project-card {
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem 2rem;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 2rem;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, transform 0.2s;
}

.project-card:hover {
  border-color: var(--color-clay);
  transform: translateY(-2px);
}

.project-index {
  font-family: var(--font-mono);
  color: var(--color-ochre);
  font-size: 1rem;
}

.project-meta h3 {
  font-size: 1.3rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.project-meta p {
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.project-year {
  font-family: var(--font-mono);
  color: var(--color-sage);
}

/* Designs Page Specifics */
.design-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.design-card {
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s;
}

.design-card:hover {
  border-color: var(--color-clay);
}

.design-preview {
  aspect-ratio: 4/3;
  overflow: hidden;
  background-color: #111;
  border-bottom: 1px solid var(--color-border);
}

.design-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.design-info {
  padding: 1.25rem;
}

.design-info h3 {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

/* Detail Pages */
.detail-container {
  background: var(--color-panel);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  padding: 3.5rem;
  margin-bottom: 3rem;
}

.detail-header {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 2rem;
  margin-bottom: 2.5rem;
}

.detail-title {
  font-size: 2.8rem;
  font-weight: 500;
  line-height: 1.1;
  margin-bottom: 1rem;
}

.detail-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.meta-item strong {
  color: var(--color-clay);
}

.detail-body {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--color-text-main);
}

.detail-body p {
  margin-bottom: 1.5rem;
}

.detail-body h2, .detail-body h3 {
  font-family: var(--font-sans);
  color: var(--color-ochre);
  margin: 2.5rem 0 1rem 0;
}

/* Backlink button */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-sage);
  text-decoration: none;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  margin-bottom: 2rem;
  transition: color 0.2s;
}

.back-btn:hover {
  color: var(--color-clay);
}

/* Generator Form & Tech Interventions */
.generator-wrapper {
  background: #252a25;
  border: 1px dashed var(--color-sage);
  padding: 2rem;
  border-radius: 8px;
  margin-top: 4rem;
}

.generator-wrapper h4 {
  font-family: var(--font-mono);
  color: var(--color-clay);
  margin-bottom: 0.75rem;
}

/* Portrait layout specifics */
.md-img {
  max-width: 100%;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  filter: sepia(0.2) contrast(1.1);
  margin: 1.5rem 0;
}

/* Footer */
.site-footer {
  border-top: 1px solid var(--color-border);
  padding-top: 2rem;
  margin-top: 5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

@media(max-width: 768px) {
  .hero-section {
    grid-template-columns: 1fr;
  }
  .hero-image-wrapper {
    min-height: 200px;
    border-left: none;
    border-top: 2px solid var(--color-border);
  }
  .project-card {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  .detail-container {
    padding: 2rem 1.5rem;
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
  <title>{{HEADLINE}} | Sovereign AI</title>
  <link rel="icon" href="/assets/favicon.png" type="image/png">
</head>
<body>
  <div class="site-container">
    <header class="site-header">
      <div class="logo-wrapper">
        <img src="/assets/gen-logo.png" alt="GI Monogram" class="logo-img">
        <span class="logo-text">GREG ITEEN</span>
      </div>
      <nav class="site-nav">
        <a href="/" class="active">Home</a>
        <a href="/projects">Projects</a>
        <a href="/designs">System Designs</a>
      </nav>
    </header>

    <section class="hero-section">
      <div class="hero-content">
        <span class="hero-badge">[ SOVEREIGN SYSTEMS DEVELOPER ]</span>
        <h1 class="hero-headline">{{HEADLINE}}</h1>
        <p class="hero-tagline">{{TAGLINE}}</p>
        <p class="hero-intro">{{INTRO}}</p>
      </div>
      <div class="hero-image-wrapper"></div>
    </section>

    <main>
      <div class="section-header">
        <span class="section-title">SELECTED EXPERIMENTS ({{FEATURED_COUNT}})</span>
        <a href="/projects" style="color: var(--color-clay); font-family: var(--font-mono); text-decoration: none;">All Projects &rarr;</a>
      </div>
      <div class="project-grid">
        {{FEATURED_PROJECTS}}
      </div>

      <div class="generator-wrapper">
        <h4>LOCAL GENERATIVE EXPERIMENTS</h4>
        <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">Re-seed or interface with Greg's sovereign sandbox context directly.</p>
        {{GENERATOR_FORM}}
      </div>
    </main>

    <footer class="site-footer">
      <span>EST. 2026 // LOCAL FILE-NATIVE COGNITION</span>
      <span>&copy; Greg Iteen. All rights reserved.</span>
    </footer>
  </div>
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
  <title>System Directory | Greg Iteen</title>
  <link rel="icon" href="/assets/favicon.png" type="image/png">
</head>
<body>
  <div class="site-container">
    <header class="site-header">
      <div class="logo-wrapper">
        <img src="/assets/gen-logo.png" alt="GI Monogram" class="logo-img">
        <span class="logo-text">GREG ITEEN</span>
      </div>
      <nav class="site-nav">
        <a href="/">Home</a>
        <a href="/projects" class="active">Projects</a>
        <a href="/designs">System Designs</a>
      </nav>
    </header>

    <main>
      <div class="section-header">
        <span class="section-title">PROJECT DIRECTORY ({{PROJECT_COUNT}})</span>
        <span style="color: var(--color-ochre); font-family: var(--font-mono); font-size: 0.9rem;">LOCALLY CACHED</span>
      </div>
      
      <div class="project-grid">
        {{PROJECT_LIST}}
      </div>
    </main>

    <footer class="site-footer">
      <span>EST. 2026 // LOCAL FILE-NATIVE COGNITION</span>
      <span>&copy; Greg Iteen. All rights reserved.</span>
    </footer>
  </div>
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
  <title>System Design Visualizations | Greg Iteen</title>
  <link rel="icon" href="/assets/favicon.png" type="image/png">
</head>
<body>
  <div class="site-container">
    <header class="site-header">
      <div class="logo-wrapper">
        <img src="/assets/gen-logo.png" alt="GI Monogram" class="logo-img">
        <span class="logo-text">GREG ITEEN</span>
      </div>
      <nav class="site-nav">
        <a href="/">Home</a>
        <a href="/projects">Projects</a>
        <a href="/designs" class="active">System Designs</a>
      </nav>
    </header>

    <main>
      <div class="section-header">
        <span class="section-title">PHYSICAL & ARCHITECTURAL SCHEMATICS ({{DESIGN_COUNT}})</span>
        <span style="color: var(--color-clay); font-family: var(--font-mono); font-size: 0.9rem;">TACTILE ARTIFACTS</span>
      </div>

      <div class="design-grid">
        {{DESIGN_CARDS}}
      </div>

      <div class="generator-wrapper">
        <h4>COGNITIVE SCHEMATICS PIPELINE</h4>
        <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">Inject custom neural tokens to visualize different model layer densities.</p>
        {{GENERATOR_FORM}}
      </div>
    </main>

    <footer class="site-footer">
      <span>EST. 2026 // LOCAL FILE-NATIVE COGNITION</span>
      <span>&copy; Greg Iteen. All rights reserved.</span>
    </footer>
  </div>
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
  <title>{{NAME}} | Greg Iteen</title>
  <link rel="icon" href="/assets/favicon.png" type="image/png">
</head>
<body>
  <div class="site-container">
    <header class="site-header">
      <div class="logo-wrapper">
        <img src="/assets/gen-logo.png" alt="GI Monogram" class="logo-img">
        <span class="logo-text">GREG ITEEN</span>
      </div>
      <nav class="site-nav">
        <a href="/">Home</a>
        <a href="/projects" class="active">Projects</a>
        <a href="/designs">System Designs</a>
      </nav>
    </header>

    <main>
      <a href="/projects" class="back-btn">&larr; Return to directory</a>
      
      <article class="detail-container">
        <div class="detail-header">
          <h1 class="detail-title">{{NAME}}</h1>
          <div class="detail-meta-row">
            <div class="meta-item"><strong>YEAR:</strong> {{YEAR}}</div>
            <div class="meta-item"><strong>ROLE:</strong> {{ROLE}}</div>
            <div class="meta-item"><strong>STACK:</strong> {{TECH_BADGES}}</div>
          </div>
        </div>
        
        <div class="detail-body">
          <p style="font-size: 1.3rem; line-height: 1.5; color: var(--color-text-muted); margin-bottom: 2rem;">{{DESCRIPTION}}</p>
          {{CONTENT}}
        </div>
      </article>
    </main>

    <footer class="site-footer">
      <span>EST. 2026 // LOCAL FILE-NATIVE COGNITION</span>
      <span>&copy; Greg Iteen. All rights reserved.</span>
    </footer>
  </div>
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
  <title>{{NAME}} | Greg Iteen</title>
  <link rel="icon" href="/assets/favicon.png" type="image/png">
</head>
<body>
  <div class="site-container">
    <header class="site-header">
      <div class="logo-wrapper">
        <img src="/assets/gen-logo.png" alt="GI Monogram" class="logo-img">
        <span class="logo-text">GREG ITEEN</span>
      </div>
      <nav class="site-nav">
        <a href="/">Home</a>
        <a href="/projects">Projects</a>
        <a href="/designs" class="active">System Designs</a>
      </nav>
    </header>

    <main>
      <a href="/designs" class="back-btn">&larr; Return to schematics</a>
      
      <article class="detail-container">
        <div class="detail-header">
          <h1 class="detail-title">{{NAME}}</h1>
          <div class="detail-meta-row">
            <div class="meta-item"><strong>MEDIUM:</strong> Tactile System Design</div>
            <div class="meta-item"><strong>CLIENT:</strong> Sovereign Core</div>
          </div>
        </div>

        <div style="margin-bottom: 3rem; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;">
          <img src="{{PREVIEW}}" alt="{{NAME}}" style="width: 100%; display: block;">
        </div>
        
        <div class="detail-body">
          {{CONTENT}}
        </div>
      </article>
    </main>

    <footer class="site-footer">
      <span>EST. 2026 // LOCAL FILE-NATIVE COGNITION</span>
      <span>&copy; Greg Iteen. All rights reserved.</span>
    </footer>
  </div>
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
  <title>{{NAME}} | Greg Iteen</title>
  <link rel="icon" href="/assets/favicon.png" type="image/png">
</head>
<body>
  <div class="site-container">
    <header class="site-header">
      <div class="logo-wrapper">
        <img src="/assets/gen-logo.png" alt="GI Monogram" class="logo-img">
        <span class="logo-text">GREG ITEEN</span>
      </div>
      <nav class="site-nav">
        <a href="/">Home</a>
        <a href="/projects">Projects</a>
        <a href="/designs">System Designs</a>
      </nav>
    </header>

    <main class="detail-container">
      <h1 class="detail-title" style="border-bottom: 1px solid var(--color-border); padding-bottom: 1.5rem; margin-bottom: 2rem;">{{NAME}}</h1>
      <div class="detail-body">
        {{CONTENT}}
      </div>
    </main>

    <footer class="site-footer">
      <span>EST. 2026 // LOCAL FILE-NATIVE COGNITION</span>
      <span>&copy; Greg Iteen. All rights reserved.</span>
    </footer>
  </div>
</body>
</html>
```

## section:layout:project_item

```html
<a href="{{URL}}" class="project-card">
  <span class="project-index">[{{INDEX}}]</span>
  <div class="project-meta">
    <h3>{{NAME}}</h3>
    <p>{{DESCRIPTION}}</p>
  </div>
  <span class="project-year">{{YEAR}}</span>
</a>
```

## section:layout:design_item

```html
<a href="{{URL}}" class="design-card">
  <div class="design-preview">
    <img src="{{PREVIEW}}" alt="{{NAME}}">
  </div>
  <div class="design-info">
    <h3>{{NAME}}</h3>
    <p style="color: var(--color-text-muted); font-size: 0.9rem;">{{DESCRIPTION}}</p>
  </div>
</a>
```

## section:layout:nav_item

```html
<a href="{{NAV_URL}}" class="{{NAV_ACTIVE_CLASS}}">{{NAV_NAME}}</a>
```
