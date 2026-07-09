---
name: "Stratified Sandstone"
accent: "#C2532D"
style: "warm terracotta desert modernist studio with sandstone and cactus green"
---

# Design System

---
palette:
  sandstone: "#E3D1C2"
  earth: "#36221A"
  cactus: "#1E442B"
  terracotta: "#C2532D"
typography:
  display: "Syne"
  mono: "Share Tech Mono"
  sans: "Plus Jakarta Sans"
---
# Stratified Sandstone Design Spec

This design system target represents a physical desert modernist aesthetic. Built around local, file-native systems, the layout enforces tectonic shift interactions. All plates slide dynamically on hover inside the Silt-Directory structure.

## Core Classes
- `.stratified-shell`: Wrapper enforcing borders and sandstone backdrop
- `.tectonic-card`: Fluid modular block shifting to represent geological expansion joints
- `.nav-link`: Touch targets conforming strictly to 44px standard
- `.badge`: Technical tag outlines mimicking map metadata symbols

## section:css

```css
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap'); :root { --bg-sandstone: #E3D1C2; --bg-sandstone-light: #ECDCCF; --text-earth: #36221A; --text-earth-muted: rgba(54, 34, 26, 0.7); --accent-cactus: #1E442B; --accent-cactus-muted: rgba(30, 68, 43, 0.15); --accent-terracotta: #C2532D; --border-width: 2px; --border-earth: var(--border-width) solid var(--text-earth); --font-display: 'Syne', system-ui, -apple-system, sans-serif; --font-mono: 'Share Tech Mono', monospace; --font-sans: 'Plus Jakarta Sans', system-ui, sans-serif; } *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { background-color: var(--bg-sandstone); color: var(--text-earth); font-family: var(--font-sans); line-height: 1.5; -webkit-font-smoothing: antialiased; } h1, h2, h3, h4 { font-family: var(--font-display); font-weight: 800; text-transform: uppercase; line-height: 1.05; letter-spacing: -0.02em; } code, pre, .mono-label { font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 0.05em; text-transform: uppercase; } .stratified-shell { display: flex; flex-direction: column; min-height: 100vh; border: var(--border-earth); margin: 12px; position: relative; background-color: var(--bg-sandstone); } .site-header { border-bottom: var(--border-earth); padding: 16px; display: flex; flex-direction: column; gap: 16px; } @media (min-width: 768px) { .stratified-shell { margin: 24px; } .site-header { flex-direction: row; align-items: center; justify-content: space-between; padding: 24px; } } .site-logo-link { display: flex; align-items: center; min-height: 44px; } .site-logo { height: 40px; width: auto; display: block; } .site-nav { display: flex; flex-wrap: wrap; gap: 8px; } .nav-link { font-family: var(--font-mono); text-decoration: none; color: var(--text-earth); border: var(--border-earth); padding: 10px 16px; min-height: 44px; display: inline-flex; align-items: center; background: transparent; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); text-transform: uppercase; font-weight: bold; } .nav-link:hover, .nav-link.active { background-color: var(--accent-cactus); color: var(--bg-sandstone); border-color: var(--accent-cactus); } .main-content { flex-grow: 1; } .hero-block { border-bottom: var(--border-earth); padding: 40px 16px; background-size: cover; background-position: center; position: relative; } @media (min-width: 768px) { .hero-block { padding: 80px 40px; } } .hero-content { max-width: 800px; position: relative; z-index: 2; background: rgba(227, 209, 194, 0.92); padding: 24px; border: var(--border-earth); } @media (min-width: 768px) { .hero-content { padding: 48px; } } .hero-headline { font-size: clamp(2rem, 6vw, 4rem); margin-bottom: 16px; color: var(--text-earth); } .hero-tagline { font-family: var(--font-mono); font-size: 1.1rem; color: var(--accent-terracotta); margin-bottom: 24px; display: block; } .hero-intro { font-size: 1.15rem; line-height: 1.6; color: var(--text-earth); } .tectonic-grid { display: grid; grid-template-columns: 1fr; border-bottom: var(--border-earth); } @media (min-width: 768px) { .tectonic-grid { grid-template-columns: repeat(2, 1fr); } } @media (min-width: 1200px) { .tectonic-grid { grid-template-columns: repeat(3, 1fr); } } .tectonic-card { border-bottom: var(--border-earth); border-right: none; background: var(--bg-sandstone-light); padding: 32px 24px; display: flex; flex-direction: column; justify-content: space-between; min-height: 320px; transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s; text-decoration: none; color: inherit; position: relative; overflow: hidden; } @media (min-width: 768px) { .tectonic-card { border-right: var(--border-earth); border-bottom: none; } } .tectonic-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background-color: var(--accent-terracotta); transform: scaleY(0); transform-origin: bottom; transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); } .tectonic-card:hover { background-color: var(--bg-sandstone); transform: translate(-4px, -4px); box-shadow: 6px 6px 0px var(--text-earth); } .tectonic-card:hover::before { transform: scaleY(1); } .tectonic-meta { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 24px; font-family: var(--font-mono); color: var(--accent-cactus); } .tectonic-index { font-size: 1.5rem; font-weight: bold; } .tectonic-title { font-size: 1.75rem; margin-bottom: 12px; word-wrap: break-word; } .tectonic-description { font-size: 0.95rem; color: var(--text-earth-muted); flex-grow: 1; margin-bottom: 24px; } .tectonic-footer { display: flex; flex-wrap: wrap; gap: 8px; } .badge { font-family: var(--font-mono); font-size: 0.75rem; background-color: var(--bg-sandstone); color: var(--text-earth); border: 1px solid var(--text-earth); padding: 4px 8px; text-transform: uppercase; } .site-footer { border-top: var(--border-earth); padding: 32px 16px; background-color: var(--bg-sandstone-light); display: flex; flex-direction: column; gap: 24px; } @media (min-width: 768px) { .site-footer { padding: 48px; flex-direction: row; justify-content: space-between; align-items: center; } } .footer-meta { display: flex; flex-direction: column; gap: 8px; } .footer-theme-pills { display: flex; flex-wrap: wrap; gap: 8px; } .stratified-section { padding: 40px 16px; border-bottom: var(--border-earth); } @media (min-width: 768px) { .stratified-section { padding: 80px 48px; } } .section-title-wrap { margin-bottom: 32px; border-bottom: var(--border-earth); padding-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; } .section-title { font-size: 2rem; } @media (min-width: 768px) { .section-title { font-size: 3rem; } } .count-badge { font-family: var(--font-mono); font-size: 1.25rem; color: var(--accent-terracotta); } .detail-grid { display: grid; grid-template-columns: 1fr; gap: 40px; } @media (min-width: 992px) { .detail-grid { grid-template-columns: 1fr 350px; gap: 64px; } } .detail-body { font-size: 1.1rem; line-height: 1.7; } .detail-body p { margin-bottom: 24px; } .detail-body h2, .detail-body h3 { margin-top: 40px; margin-bottom: 16px; } .detail-sidebar { border: var(--border-earth); background: var(--bg-sandstone-light); padding: 24px; align-self: start; } .sidebar-group { margin-bottom: 24px; border-bottom: 1px solid rgba(54, 34, 26, 0.15); padding-bottom: 16px; } .sidebar-group:last-child { margin-bottom: 0; border-bottom: none; padding-bottom: 0; } .sidebar-label { font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-cactus); display: block; margin-bottom: 8px; } .sidebar-value { font-size: 1.1rem; font-weight: 600; } .back-link-wrap { min-height: 44px; display: flex; align-items: center; } .back-link { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-mono); text-decoration: none; color: var(--accent-terracotta); min-height: 44px; text-transform: uppercase; font-weight: bold; } .back-link:hover { text-decoration: underline; } .btn-primary { display: inline-flex; align-items: center; justify-content: center; background-color: var(--accent-cactus); color: var(--bg-sandstone); border: none; padding: 14px 28px; font-family: var(--font-mono); text-transform: uppercase; font-weight: bold; text-decoration: none; cursor: pointer; min-height: 44px; transition: background-color 0.2s; } .btn-primary:hover { background-color: var(--accent-terracotta); } .preview-container { border: var(--border-earth); overflow: hidden; margin-bottom: 32px; background-color: var(--text-earth); } .preview-img { width: 100%; height: auto; display: block; object-fit: cover; max-height: 500px; } .preview-container-mini { border: var(--border-earth); overflow: hidden; margin-bottom: 16px; background-color: var(--text-earth); height: 120px; } .preview-container-mini img { width: 100%; height: 100%; object-fit: cover; } .md-img { border: var(--border-earth); filter: sepia(0.3) contrast(1.1) brightness(0.95); width: 100%; max-width: 400px; height: auto; margin-bottom: 24px; } .generator-form-wrap { border: var(--border-earth); padding: 24px; background: var(--bg-sandstone-light); margin-top: 40px; }
```

## section:layout:shell

```html
<div class="stratified-shell"><header class="site-header"><a href="/" class="site-logo-link"><img src="/assets/logo.png" alt="" class="site-logo"></a><nav class="site-nav">{{NAV_LINKS}}</nav></header><main class="main-content">{{CONTENT}}</main><footer class="site-footer"><div class="footer-meta"><div class="footer-theme-pills">{{THEME_PILLS}}</div><code class="mono-label">{{SOURCE_PATH}}</code></div></footer></div>
```

## section:layout:home

```html
<section class="hero-block" style="background-image: linear-gradient(rgba(54, 34, 26, 0.45), rgba(54, 34, 26, 0.45)), url('/assets/hero.jpg');"><div class="hero-content"><span class="hero-tagline">{{TAGLINE}}</span><h1 class="hero-headline">{{HEADLINE}}</h1><div class="hero-intro">{{INTRO}}</div></div></section><section class="stratified-section"><div class="section-title-wrap"><h2 class="section-title">{{TAGLINE}}</h2><span class="count-badge">{{FEATURED_COUNT}}</span></div><div class="tectonic-grid">{{FEATURED_PROJECTS}}</div></section><section class="stratified-section"><div class="generator-form-wrap">{{GENERATOR_FORM}}</div></section>
```

## section:layout:projects_index

```html
<section class="stratified-section"><div class="desert-horizon-visual" style="border: var(--border-earth); margin-bottom: 40px; background: var(--bg-sandstone-light); height: 180px; position: relative; overflow: hidden; display: flex; align-items: flex-end; justify-content: space-between; padding: 24px;"><div style="position: absolute; right: 8%; bottom: -30px; width: 140px; height: 140px; border-radius: 50%; background: var(--accent-terracotta); opacity: 0.9; transform: rotate(-15deg); display: flex; align-items: center; justify-content: center;"><div style="width: 100px; height: 2px; background: var(--text-earth); opacity: 0.3;"></div></div><div style="display: flex; align-items: flex-end; gap: 16px; z-index: 1;"><div style="width: 20px; height: 70px; background: var(--accent-cactus); border: var(--border-earth); border-radius: 10px 10px 0 0;"></div><div style="width: 24px; height: 110px; background: var(--accent-cactus); border: var(--border-earth); border-radius: 12px 12px 0 0; position: relative;"><div style="position: absolute; left: -14px; top: 30px; width: 14px; height: 28px; background: var(--accent-cactus); border: var(--border-earth); border-right: none; border-radius: 8px 0 0 8px;"></div><div style="position: absolute; right: -14px; top: 48px; width: 14px; height: 28px; background: var(--accent-cactus); border: var(--border-earth); border-left: none; border-radius: 0 8px 8px 0;"></div></div><div style="width: 16px; height: 50px; background: var(--accent-cactus); border: var(--border-earth); border-radius: 8px 8px 0 0;"></div></div><div style="position: absolute; left: 0; right: 0; bottom: 0; height: 16px; background: var(--accent-terracotta); border-top: var(--border-earth);"></div></div><div class="section-title-wrap"><h1 class="section-title"><span class="count-badge">{{PROJECT_COUNT}}</span></h1></div><div class="tectonic-grid">{{PROJECT_LIST}}</div></section>
```

## section:layout:designs_index

```html
<section class="stratified-section"><div class="detail-grid"><div class="designs-main-col"><div class="section-title-wrap"><div class="back-link-wrap"><a href="/" class="back-link"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 12H4M4 12L10 6M4 12L10 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></a></div><div class="count-badge">{{DESIGN_COUNT}}</div></div><div class="tectonic-grid">{{DESIGN_CARDS}}</div></div><aside class="detail-sidebar"><div class="sidebar-group"><span class="sidebar-label"></span><div class="sidebar-value"><div style="display:flex;flex-direction:column;gap:8px;margin-top:16px;"><div style="height:48px;background:var(--accent-terracotta);opacity:0.9;clip-path:polygon(0 0,100% 20%,100% 100%,0 80%);"></div><div style="height:64px;background:var(--accent-cactus);opacity:0.8;clip-path:polygon(0 10%,100% 0,100% 90%,0 100%);"></div><div style="height:32px;background:var(--text-earth);opacity:0.95;clip-path:polygon(0 0,100% 30%,100% 100%,0 70%);"></div><div style="height:80px;background:var(--bg-sandstone-light);border:var(--border-earth);opacity:0.5;"></div></div></div></div></aside></div></section>
```

## section:layout:project_detail

```html
<div class="stratified-section"><div class="back-link-wrap">{{BACKLINK}}</div><header class="section-title-wrap"><h1 class="section-title">{{NAME}}</h1><div class="count-badge">{{YEAR}}</div></header><div class="detail-grid"><div class="detail-main"><div class="preview-container"><img src="{{LOGO}}" alt="" class="preview-img"></div><div class="detail-body">{{CONTENT}}</div></div><aside class="detail-sidebar"><div class="sidebar-group"><div class="sidebar-value">{{ROLE}}</div></div><div class="sidebar-group"><div class="sidebar-value">{{DESCRIPTION}}</div></div><div class="sidebar-group"><div class="tectonic-footer">{{TECH_BADGES}}</div></div><div class="sidebar-group" style="display:flex;flex-direction:column;gap:12px;border-bottom:none;padding-bottom:0;">{{PROJECT_LINK}}{{REPO_LINK}}</div></aside></div></div>
```

## section:layout:design_detail

```html
<section class="stratified-section"><div class="back-link-wrap">{{BACKLINK}}</div><div class="section-title-wrap"><h1 class="section-title">{{NAME}}</h1></div><div class="preview-container">{{PREVIEW}}</div><div class="detail-grid"><div class="detail-body">{{CONTENT}}</div><aside class="detail-sidebar"><div class="sidebar-group"><span class="sidebar-label">Description</span><div class="sidebar-value">{{DESCRIPTION}}</div></div><div class="sidebar-group"><span class="sidebar-label">Client</span><div class="sidebar-value">{{CLIENT}}</div></div><div class="sidebar-group"><span class="sidebar-label">Role</span><div class="sidebar-value">{{ROLE}}</div></div><div class="sidebar-group"><span class="sidebar-label">Year</span><div class="sidebar-value">{{YEAR}}</div></div><div class="sidebar-group"><span class="sidebar-label">Tags</span><div class="tectonic-footer">{{TAG_BADGES}}</div></div><div class="sidebar-group" style="border-bottom:none;padding-bottom:0;margin-bottom:0;">{{LINK_URL}}</div></aside></div></section>
```

## section:layout:page

```html
<section class="stratified-section"><div class="section-title-wrap"><h1 class="section-title">{{NAME}}</h1></div><div class="detail-grid"><div class="detail-body">{{CONTENT}}</div><aside class="detail-sidebar"><div class="sidebar-group"><code class="mono-label">{{SOURCE_PATH}}</code></div></aside></div></section>
```

## section:layout:project_item

```html
<a href="{{URL}}" class="tectonic-card"><div class="tectonic-meta"><span class="tectonic-index">{{INDEX}}</span><span class="mono-label">{{YEAR}}</span></div><div class="tectonic-brand" style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">{{LOGO}}<h3 class="tectonic-title" style="margin-bottom: 0;">{{NAME}}</h3></div><p class="tectonic-description">{{DESCRIPTION}}</p><div class="tectonic-footer">{{TECH_BADGES}}</div></a>
```

## section:layout:design_item

```html
<a href="{{URL}}" class="tectonic-card"><div class="preview-container-mini"><img src="{{PREVIEW}}" alt=""></div><div class="tectonic-meta"><span>{{CLIENT}}</span><span>{{YEAR}}</span></div><h3 class="tectonic-title">{{NAME}}</h3><p class="tectonic-description">{{DESCRIPTION}}</p><div class="tectonic-footer">{{TAG_BADGES}}</div></a>
```

## section:layout:nav_item

```html
<a href="{{NAV_URL}}" class="nav-link {{NAV_ACTIVE_CLASS}}">{{NAV_NAME}}</a>
```
