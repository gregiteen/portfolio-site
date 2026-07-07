---
type: page
slug: "design-a-vibrant-hyper-modern-digital-design-st"
name: "NEO-GLASS SYSTEMA"
title: "NEO-GLASS SYSTEMA — Design Spec"
description: "AI-generated design: \"A vibrant, hyper-modern digital design studio with electric blue and vivid pink gradients, neo-morphism elements, playful rounded geometric typography, and energetic glass-like UI components. The vibe is fun, forward-thinking, and dynamic.\""
timestamp: "2026-07-07T11:03:17.317Z"
sandbox_entry: "designs/a-vibrant-hyper-modern-digital-design-st/index.html"
x_kind: "design"
x_year: "2026"
x_role: "AI-Generated Theme"
x_client: "Portfolio Generator"
x_tags:
  - "AI Generated"
  - "Theme"
x_preview: "/designs/a-vibrant-hyper-modern-digital-design-st/assets/hero.jpg"
x_logo: "/designs/a-vibrant-hyper-modern-digital-design-st/assets/logo.png"
x_link: "/designs/a-vibrant-hyper-modern-digital-design-st/index.html"
---

# Design System

---
theme: NEO-GLASS SYSTEMA
creator: Design Lead
client: Greg Iteen
colors:
  background: "#07040E"
  surface: "rgba(13, 9, 25, 0.7)"
  primary: "#00E5FF"
  secondary: "#FF2E93"
  border: "rgba(255, 255, 255, 0.1)"
  text-primary: "#FFFFFF"
  text-secondary: "#9B94B1"
typography:
  display: "'Outfit', sans-serif"
  body: "'Plus Jakarta Sans', sans-serif"
  code: "'Space Mono', monospace"
---

# DESIGN.md

## Vision & Rationale
This design shifts away from traditional heavy dark-mode engineering templates into a vivid, ultra-high-fidelity digital workspace. We reject both basic minimal-flat styles and overdone cyber-neon tropes. Instead, we implement a hyper-modern aesthetic: physical-digital transparency, interactive tactile glass surfaces, and rich fluid-dynamic ambient backdrops. 

This aesthetic matches Greg Iteen's domain: building high-performance, file-native, local intelligence layers. The visual language uses glassy file structures, precise geometric bounding boxes, and radiant glowing nodes to represent local context extraction directly from raw, physical disk arrays.

## Architecture & Layout Constraints
- **Typography**: Display elements use Outfit, a geometric typeface with rounded curves that projects approachability and extreme technological modernity. Body elements use Plus Jakarta Sans to maintain absolute readability under dense system readouts.
- **Depth & Materials**: We use deep composite glass panels (`backdrop-filter: blur(24px)`) backed by a double-gradient ring glow to achieve tactile neo-morphic weight. Light behaves with high-contrast refraction, utilizing 1px micro-borders to define edges clearly against moving ambient background nodes.
- **Mobile-First Realization**: Columns collapse into single-column layouts below 768px. Every touch element maintains a target clearance of 48px to satisfy tactile interactions.

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
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;700;800&family=Plus+Jakarta+Sans:wght@400;500;600&family=Space+Mono&display=swap');

:root {
  --color-bg: #07040E;
  --color-surface: rgba(13, 9, 25, 0.7);
  --color-surface-hover: rgba(22, 16, 41, 0.8);
  --color-accent-blue: #00E5FF;
  --color-accent-pink: #FF2E93;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #9B94B1;
  --color-border: rgba(255, 255, 255, 0.1);
  --color-border-active: rgba(0, 229, 255, 0.5);
  --font-display: 'Outfit', sans-serif;
  --font-body: 'Plus Jakarta Sans', sans-serif;
  --font-code: 'Space Mono', monospace;
  --transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  line-height: 1.6;
  overflow-x: hidden;
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(0, 229, 255, 0.1) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(255, 46, 147, 0.1) 0%, transparent 40%);
  background-attachment: fixed;
}

header {
  border-bottom: 1px solid var(--color-border);
  backdrop-filter: blur(20px);
  background: rgba(7, 4, 14, 0.8);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--color-text-primary);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.25rem;
}

.brand-logo img {
  height: 36px;
  width: auto;
}

.nav-menu {
  display: flex;
  gap: 8px;
}

.nav-link {
  text-decoration: none;
  color: var(--color-text-secondary);
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 0.95rem;
  padding: 10px 18px;
  border-radius: 99px;
  transition: var(--transition);
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

.nav-link:hover {
  color: var(--color-accent-blue);
  background: rgba(0, 229, 255, 0.08);
}

.nav-link.active {
  color: var(--color-text-primary);
  background: rgba(255, 255, 255, 0.07);
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.1);
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 80px 24px;
}

.hero-module {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  margin-bottom: 80px;
  align-items: center;
}

@media (min-width: 1024px) {
  .hero-module {
    grid-template-columns: 1.2fr 0.8fr;
  }
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.badge {
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.15) 0%, rgba(255, 46, 147, 0.15) 100%);
  border: 1px solid var(--color-accent-blue);
  padding: 6px 16px;
  border-radius: 99px;
  font-family: var(--font-code);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--color-accent-blue);
}

.hero-title {
  font-family: var(--font-display);
  font-size: 2.75rem;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

@media (min-width: 768px) {
  .hero-title {
    font-size: 4rem;
  }
}

.gradient-text {
  background: linear-gradient(135deg, var(--color-accent-blue) 30%, var(--color-accent-pink) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-desc {
  font-size: 1.15rem;
  color: var(--color-text-secondary);
  max-width: 580px;
}

.hero-console {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  backdrop-filter: blur(24px);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 
    0 24px 48px -12px rgba(0,0,0,0.5),
    inset 0 1px 1px rgba(255, 255, 255, 0.15);
  position: relative;
  overflow: hidden;
}

.hero-console::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--color-accent-blue), var(--color-accent-pink));
}

.console-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 16px;
  margin-bottom: 16px;
}

.window-dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
}

.dot.blue { background-color: var(--color-accent-blue); }
.dot.pink { background-color: var(--color-accent-pink); }

.console-title {
  font-family: var(--font-code);
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.console-body {
  font-family: var(--font-code);
  font-size: 0.9rem;
  line-height: 1.5;
  color: #D2CDFF;
}

.console-row {
  margin-bottom: 10px;
}

.prompt {
  color: var(--color-accent-blue);
}

.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 28px;
  border-radius: 16px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1rem;
  text-decoration: none;
  transition: var(--transition);
  cursor: pointer;
  min-height: 48px;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-accent-blue) 0%, #0099FF 100%);
  color: #07040E;
  box-shadow: 0 8px 24px rgba(0, 229, 255, 0.25);
  border: none;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 229, 255, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  backdrop-filter: blur(8px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 16px;
}

.section-title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.section-meta {
  font-family: var(--font-code);
  font-size: 0.85rem;
  color: var(--color-accent-blue);
}

.cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 768px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .cards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.project-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 280px;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.05);
  text-decoration: none;
  color: inherit;
}

.project-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.05) 0%, rgba(255, 46, 147, 0.05) 100%);
  opacity: 0;
  transition: var(--transition);
  z-index: 0;
}

.project-card:hover {
  border-color: var(--color-accent-blue);
  transform: translateY(-4px);
  box-shadow: 0 16px 40px -10px rgba(0, 229, 255, 0.15);
}

.project-card:hover::after {
  opacity: 1;
}

.card-meta {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-index {
  font-family: var(--font-code);
  color: var(--color-accent-pink);
  font-size: 0.85rem;
  font-weight: 700;
}

.card-year {
  font-family: var(--font-code);
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px;
  border-radius: 6px;
}

.card-content {
  position: relative;
  z-index: 1;
  margin-bottom: 24px;
}

.card-title {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1.25;
  color: var(--color-text-primary);
}

.card-desc {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 16px;
}

.tech-tag {
  font-family: var(--font-code);
  font-size: 0.75rem;
  color: var(--color-accent-blue);
  background: rgba(0, 229, 255, 0.08);
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid rgba(0, 229, 255, 0.15);
}

.project-list-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-row {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: var(--transition);
  text-decoration: none;
  color: inherit;
}

@media (min-width: 768px) {
  .project-row {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.project-row:hover {
  border-color: var(--color-accent-pink);
  background: var(--color-surface-hover);
  transform: translateX(4px);
}

.row-primary-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 500px;
}

.row-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--color-text-primary);
}

.row-desc {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.row-right-panel {
  display: flex;
  align-items: center;
  gap: 24px;
  justify-content: space-between;
}

.row-tech-wrapper {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.row-arrow {
  color: var(--color-accent-pink);
  transition: var(--transition);
  font-family: var(--font-code);
  font-weight: bold;
}

.project-row:hover .row-arrow {
  transform: translateX(4px);
  color: var(--color-accent-blue);
}

.generator-panel {
  background: linear-gradient(135deg, rgba(16, 12, 30, 0.95) 0%, rgba(7, 4, 14, 0.95) 100%);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  padding: 32px;
  margin-top: 60px;
  box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.6);
  position: relative;
}

.generator-header {
  margin-bottom: 24px;
}

.generator-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.generator-desc {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

.input-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

@media (min-width: 768px) {
  .input-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-family: var(--font-code);
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  letter-spacing: 0.5px;
}

.input-field {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 14px 18px;
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: 0.95rem;
  transition: var(--transition);
}

.input-field:focus {
  outline: none;
  border-color: var(--color-accent-blue);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 4px rgba(0, 229, 255, 0.15);
}

footer {
  border-top: 1px solid var(--color-border);
  padding: 60px 24px;
  background: rgba(7, 4, 14, 0.9);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

@media (min-width: 768px) {
  .footer-container {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-copyright {
  font-family: var(--font-code);
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}
```

## section:layout:home

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{HEADLINE}} | Greg Iteen</title>
  <link rel="icon" href="assets/favicon.png" type="image/png">
</head>
<body>

  <header>
    <div class="nav-container">
      <a href="/" class="brand-logo">
        <img src="assets/logo.png" alt="GI Monogram">
        <span>GREG ITEEN</span>
      </a>
      <nav class="nav-menu">
        <a href="/" class="nav-link active">Systems</a>
        <a href="/projects" class="nav-link">Index</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="hero-module">
      <div class="hero-content">
        <div class="badge">
          <span class="dot blue"></span> DIRECT FILE SYSTEM ACCESS
        </div>
        <h1 class="hero-title">{{HEADLINE}}</h1>
        <p class="hero-desc">{{TAGLINE}}</p>
        <p class="hero-desc">{{INTRO}}</p>
        <div class="btn-group">
          <a href="/projects" class="btn btn-primary">View Systems Index</a>
          <a href="#terminal-interactive" class="btn btn-secondary">Access Console</a>
        </div>
      </div>
      
      <div class="hero-console" id="terminal-interactive">
        <div class="console-header">
          <div class="window-dots">
            <span class="dot blue"></span>
            <span class="dot pink"></span>
            <span class="dot"></span>
          </div>
          <div class="console-title">local_host_diagnostics.sh</div>
        </div>
        <div class="console-body" id="terminal-logs">
          <div class="console-row">
            <span class="prompt">$</span> systemctl status file-native-db
          </div>
          <div class="console-row" style="color: var(--color-accent-blue);">
            ● file-native-db.service - Local Knowledge Layer
          </div>
          <div class="console-row" style="opacity: 0.8;">
            Active: active (running) since Wed 10:42 UTC
          </div>
          <div class="console-row" style="opacity: 0.8;">
            Disk Mount: /dev/nvme0n1 [POSIX Compliant]
          </div>
          <div class="console-row">
            <span class="prompt">$</span> check-context-health
          </div>
          <div class="console-row" style="color: var(--color-accent-pink);">
            [OK] Sync complete. Indexed 4,192 local text entities in 42ms.
          </div>
          <div class="console-row">
            <span class="prompt">$</span> <input type="text" id="terminal-input" placeholder="type status, ingest or help..." style="background: transparent; border: none; color: var(--color-text-primary); font-family: var(--font-code); outline: none; width: 70%;">
          </div>
        </div>
      </div>
    </section>

    <section>
      <div class="section-header">
        <h2 class="section-title">Featured Systems</h2>
        <span class="section-meta">ACTIVE CONTEXTS: {{FEATURED_COUNT}}</span>
      </div>
      
      <div class="cards-grid">
        {{FEATURED_PROJECTS}}
      </div>
    </section>

    {{GENERATOR_FORM}}
  </main>

  <footer>
    <div class="footer-container">
      <div class="footer-brand">
        <div class="brand-logo">
          <img src="assets/logo.png" alt="GI Monogram">
          <span>GREG ITEEN</span>
        </div>
      </div>
      <div class="footer-copyright">
        &copy; 2026 GREG ITEEN. BUILT FOR HIGH-PERFORMANCE DIRECT LOCAL COMPUTING.
      </div>
    </div>
  </footer>

  &lt;script>
    document.addEventListener('DOMContentLoaded', () => {
      const terminalInput = document.getElementById('terminal-input');
      const terminalLogs = document.getElementById('terminal-logs');
      if (terminalInput && terminalLogs) {
        terminalInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            const cmd = terminalInput.value.trim().toLowerCase();
            terminalInput.value = '';
            
            const promptRow = document.createElement('div');
            promptRow.className = 'console-row';
            promptRow.innerHTML = `<span class="prompt">$</span> ${cmd}`;
            terminalLogs.insertBefore(promptRow, terminalInput.parentNode);
            
            const responseRow = document.createElement('div');
            responseRow.className = 'console-row';
            if (cmd === 'help') {
              responseRow.innerHTML = 'Available commands: status, ingest, clear';
              responseRow.style.color = 'var(--color-accent-blue)';
            } else if (cmd === 'status') {
              responseRow.innerHTML = '[ONLINE] Core index active. Context depth: 32k. Volatile memory: solid.';
              responseRow.style.color = '#00FF66';
            } else if (cmd === 'ingest') {
              responseRow.innerHTML = 'Scanning local storage block... complete.';
              responseRow.style.color = 'var(--color-accent-pink)';
            } else if (cmd === 'clear') {
              const rows = terminalLogs.querySelectorAll('.console-row');
              rows.forEach((row, idx) => {
                if (idx < rows.length - 1) row.remove();
              });
              return;
            } else {
              responseRow.innerHTML = `Unknown parameters: "${cmd}". Use "help".`;
              responseRow.style.color = '#FFCC00';
            }
            terminalLogs.insertBefore(responseRow, terminalInput.parentNode);
          }
        });
      }
    });
  &lt;script>
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
  <title>Architecture Index | Greg Iteen</title>
  <link rel="icon" href="assets/favicon.png" type="image/png">
</head>
<body>

  <header>
    <div class="nav-container">
      <a href="/" class="brand-logo">
        <img src="assets/logo.png" alt="GI Monogram">
        <span>GREG ITEEN</span>
      </a>
      <nav class="nav-menu">
        <a href="/" class="nav-link">Systems</a>
        <a href="/projects" class="nav-link active">Index</a>
      </nav>
    </div>
  </header>

  <main>
    <section>
      <div class="section-header">
        <div>
          <h1 class="section-title">Systems Directory</h1>
          <p style="color: var(--color-text-secondary); margin-top: 8px; max-width: 600px;">
            A comprehensive archive of file-native indexing layers, local contextual database environments, and custom engineering frameworks.
          </p>
        </div>
        <span class="section-meta">CATALOGUED: {{PROJECT_COUNT}} SYSTEMS</span>
      </div>

      <div class="project-list-layout">
        {{PROJECT_LIST}}
      </div>
    </section>
  </main>

  <footer>
    <div class="footer-container">
      <div class="footer-brand">
        <div class="brand-logo">
          <img src="assets/logo.png" alt="GI Monogram">
          <span>GREG ITEEN</span>
        </div>
      </div>
      <div class="footer-copyright">
        &copy; 2026 GREG ITEEN. DIRECT LOCAL PROCESSING ENGINES.
      </div>
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
  <title>System Interface Catalogue | Greg Iteen</title>
  <link rel="icon" href="assets/favicon.png" type="image/png">
</head>
<body>

  <header>
    <div class="nav-container">
      <a href="/" class="brand-logo">
        <img src="assets/logo.png" alt="GI Monogram">
        <span>GREG ITEEN</span>
      </a>
      <nav class="nav-menu">
        <a href="/" class="nav-link">Systems</a>
        <a href="/projects" class="nav-link">Index</a>
      </nav>
    </div>
  </header>

  <main>
    <section>
      <div class="section-header">
        <div>
          <h1 class="section-title">Visual & Interface Schematics</h1>
          <p style="color: var(--color-text-secondary); margin-top: 8px; max-width: 600px;">
            High-fidelity UI architectures, local data-flow visualization models, and clean vector frameworks designed for system performance monitoring.
          </p>
        </div>
        <span class="section-meta">COMPILED: {{DESIGN_COUNT}} SCHEMATICS</span>
      </div>

      <div class="cards-grid">
        {{DESIGN_CARDS}}
      </div>
    </section>

    {{GENERATOR_FORM}}
  </main>

  <footer>
    <div class="footer-container">
      <div class="footer-brand">
        <div class="brand-logo">
          <img src="assets/logo.png" alt="GI Monogram">
          <span>GREG ITEEN</span>
        </div>
      </div>
      <div class="footer-copyright">
        &copy; 2026 GREG ITEEN. INTERFACE LAYOUT SYSTEM v4.9.2
      </div>
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
  <title>{{NAME}} | Greg Iteen</title>
  <link rel="icon" href="assets/favicon.png" type="image/png">
</head>
<body>

  <header>
    <div class="nav-container">
      <a href="/" class="brand-logo">
        <img src="assets/logo.png" alt="GI Monogram">
        <span>GREG ITEEN</span>
      </a>
      <nav class="nav-menu">
        <a href="/" class="nav-link">Systems</a>
        <a href="/projects" class="nav-link active">Index</a>
      </nav>
    </div>
  </header>

  <main>
    <div style="margin-bottom: 32px;">
      {{BACKLINK}}
    </div>

    <article class="hero-console" style="margin-bottom: 40px; padding: 40px;">
      <div class="console-header">
        <div class="window-dots">
          <span class="dot blue"></span>
          <span class="dot pink"></span>
          <span class="dot"></span>
        </div>
        <div class="console-title">{{SOURCE_PATH}}</div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr; gap: 40px; margin-top: 24px;" class="project-detail-grid">
        <div class="hero-content">
          <h1 class="hero-title"><span class="gradient-text">{{NAME}}</span></h1>
          <p class="hero-desc">{{DESCRIPTION}}</p>
          
          <div class="btn-group" style="margin-top: 12px;">
            {{REPO_LINK}}
            {{PROJECT_LINK}}
          </div>
        </div>

        <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--color-border); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 16px;">
          <div>
            <span class="input-label" style="display: block; margin-bottom: 4px;">Developer Role</span>
            <span style="font-family: var(--font-display); font-weight: 700; font-size: 1.1rem; color: var(--color-accent-blue);">{{ROLE}}</span>
          </div>
          <div style="border-top: 1px solid var(--color-border); padding-top: 16px;">
            <span class="input-label" style="display: block; margin-bottom: 4px;">Release Cycle</span>
            <span style="font-family: var(--font-code); font-size: 0.95rem;">{{YEAR}}</span>
          </div>
          <div style="border-top: 1px solid var(--color-border); padding-top: 16px;">
            <span class="input-label" style="display: block; margin-bottom: 8px;">System Stack</span>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              {{TECH_BADGES}}
            </div>
          </div>
        </div>
      </div>
    </article>

    <section class="hero-console" style="padding: 40px;">
      <div class="console-body" style="font-family: var(--font-body); color: var(--color-text-primary);">
        <div class="markdown-body">
          {{CONTENT}}
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="footer-container">
      <div class="footer-brand">
        <div class="brand-logo">
          <img src="assets/logo.png" alt="GI Monogram">
          <span>GREG ITEEN</span>
        </div>
      </div>
      <div class="footer-copyright">
        &copy; 2026 GREG ITEEN. BUILT FOR HIGH-PERFORMANCE DIRECT LOCAL COMPUTING.
      </div>
    </div>
  </footer>

  <style>
    @media (min-width: 1024px) {
      .project-detail-grid {
        grid-template-columns: 1.3fr 0.7fr !important;
      }
    }
    .markdown-body h2 {
      font-family: var(--font-display);
      font-size: 1.75rem;
      font-weight: 700;
      margin-top: 32px;
      margin-bottom: 16px;
      color: var(--color-accent-blue);
      border-bottom: 1px solid var(--color-border);
      padding-bottom: 8px;
    }
    .markdown-body p {
      font-size: 1.05rem;
      line-height: 1.75;
      color: var(--color-text-secondary);
      margin-bottom: 20px;
    }
    .markdown-body ul {
      margin-bottom: 20px;
      padding-left: 24px;
    }
    .markdown-body li {
      color: var(--color-text-secondary);
      margin-bottom: 8px;
      font-size: 1rem;
    }
    .markdown-body code {
      font-family: var(--font-code);
      background: rgba(255, 255, 255, 0.05);
      padding: 3px 6px;
      border-radius: 4px;
      font-size: 0.9rem;
      color: var(--color-accent-pink);
    }
    .markdown-body pre {
      background: rgba(7, 4, 14, 0.9);
      border: 1px solid var(--color-border);
      padding: 20px;
      border-radius: 12px;
      overflow-x: auto;
      margin-bottom: 24px;
    }
    .markdown-body pre code {
      background: none;
      padding: 0;
      color: #D2CDFF;
    }
  </style>

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
  <link rel="icon" href="assets/favicon.png" type="image/png">
</head>
<body>

  <header>
    <div class="nav-container">
      <a href="/" class="brand-logo">
        <img src="assets/logo.png" alt="GI Monogram">
        <span>GREG ITEEN</span>
      </a>
      <nav class="nav-menu">
        <a href="/" class="nav-link">Systems</a>
        <a href="/projects" class="nav-link">Index</a>
      </nav>
    </div>
  </header>

  <main>
    <div style="margin-bottom: 32px; min-height: 44px; display: inline-flex; align-items: center;">
      {{BACKLINK}}
    </div>

    <article class="hero-console" style="margin-bottom: 40px; padding: 32px;">
      <div class="console-header">
        <div class="window-dots">
          <span class="dot blue"></span>
          <span class="dot pink"></span>
          <span class="dot"></span>
        </div>
        <div class="console-title">{{SOURCE_PATH}}</div>
      </div>

      <div class="detail-grid">
        <div class="detail-visual-container">
          {{PREVIEW}}
        </div>

        <div class="detail-meta-container">
          <h1 class="hero-title" style="font-size: 2.25rem; margin-bottom: 12px;"><span class="gradient-text">{{NAME}}</span></h1>
          <p class="hero-desc" style="font-size: 1rem; margin-bottom: 24px;">{{DESCRIPTION}}</p>
          
          <div class="meta-card">
            <div class="meta-row">
              <span class="meta-label">Client Authority</span>
              <span class="meta-value">{{CLIENT}}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">System Integration</span>
              <span class="meta-value">{{ROLE}}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Generation Cycle</span>
              <span class="meta-value">{{YEAR}}</span>
            </div>
            <div class="meta-row" style="border: none; padding-bottom: 0; margin-bottom: 0;">
              <span class="meta-label" style="margin-bottom: 8px;">Functional Tags</span>
              <div class="tag-flex">
                {{TAG_BADGES}}
              </div>
            </div>
          </div>

          <div class="action-row" style="margin-top: 24px; min-height: 48px;">
            {{LINK_URL}}
          </div>
        </div>
      </div>
    </article>

    <section class="hero-console" style="padding: 40px;">
      <div class="console-body" style="font-family: var(--font-body); color: var(--color-text-primary);">
        <div class="markdown-body">
          {{CONTENT}}
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="footer-container">
      <div class="footer-brand">
        <div class="brand-logo">
          <img src="assets/logo.png" alt="GI Monogram">
          <span>GREG ITEEN</span>
        </div>
      </div>
      <div class="footer-copyright">
        &copy; 2026 GREG ITEEN. INTERFACE LAYOUT SYSTEM v4.9.2
      </div>
    </div>
  </footer>

  <style>
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 32px;
      margin-top: 24px;
    }
    @media (min-width: 1024px) {
      .detail-grid {
        grid-template-columns: 1.1fr 0.9fr;
      }
    }
    .detail-visual-container {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid var(--color-border);
      border-radius: 20px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 320px;
      box-shadow: inset 0 2px 8px rgba(0,0,0,0.8);
    }
    .detail-visual-container img {
      max-width: 100%;
      height: auto;
      object-fit: cover;
      display: block;
    }
    .meta-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--color-border);
      border-radius: 16px;
      padding: 20px;
    }
    .meta-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
      border-bottom: 1px solid var(--color-border);
      padding-bottom: 12px;
      margin-bottom: 12px;
    }
    .meta-label {
      font-family: var(--font-code);
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .meta-value {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 1rem;
      color: var(--color-accent-blue);
    }
    .tag-flex {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .markdown-body h2 {
      font-family: var(--font-display);
      font-size: 1.75rem;
      font-weight: 700;
      margin-top: 32px;
      margin-bottom: 16px;
      color: var(--color-accent-blue);
      border-bottom: 1px solid var(--color-border);
      padding-bottom: 8px;
    }
    .markdown-body p {
      font-size: 1.05rem;
      line-height: 1.75;
      color: var(--color-text-secondary);
      margin-bottom: 20px;
    }
  </style>

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
  <link rel="icon" href="assets/favicon.png" type="image/png">
</head>
<body>

  <header>
    <div class="nav-container">
      <a href="/" class="brand-logo">
        <img src="assets/logo.png" alt="GI Monogram">
        <span>GREG ITEEN</span>
      </a>
      <nav class="nav-menu">
        <a href="/" class="nav-link">Systems</a>
        <a href="/projects" class="nav-link">Index</a>
      </nav>
    </div>
  </header>

  <main>
    <article class="hero-console" style="padding: 32px 24px;">
      <div class="console-header">
        <div class="window-dots">
          <span class="dot blue"></span>
          <span class="dot pink"></span>
          <span class="dot"></span>
        </div>
        <div class="console-title">{{SOURCE_PATH}}</div>
      </div>

      <div class="console-body" style="font-family: var(--font-body); color: var(--color-text-primary); margin-top: 24px;">
        <h1 class="hero-title" style="font-size: 2.5rem; margin-bottom: 32px;"><span class="gradient-text">{{NAME}}</span></h1>
        
        <div class="markdown-body custom-page-layout">
          {{CONTENT}}
        </div>
      </div>
    </article>
  </main>

  <footer>
    <div class="footer-container">
      <div class="footer-brand">
        <div class="brand-logo">
          <img src="assets/logo.png" alt="GI Monogram">
          <span>GREG ITEEN</span>
        </div>
      </div>
      <div class="footer-copyright">
        &copy; 2026 GREG ITEEN. COGNITIVE ENGINE PLATFORMS.
      </div>
    </div>
  </footer>

  <style>
    .custom-page-layout {
      line-height: 1.8;
    }
    .custom-page-layout h2 {
      font-family: var(--font-display);
      font-size: 1.75rem;
      font-weight: 700;
      margin-top: 32px;
      margin-bottom: 16px;
      color: var(--color-accent-blue);
      border-bottom: 1px solid var(--color-border);
      padding-bottom: 8px;
    }
    .custom-page-layout p {
      font-size: 1.05rem;
      color: var(--color-text-secondary);
      margin-bottom: 24px;
    }
    .custom-page-layout .md-img {
      display: block;
      max-width: 320px;
      width: 100%;
      height: auto;
      border-radius: 20px;
      border: 1px solid var(--color-accent-blue);
      box-shadow: 0 0 30px rgba(0, 229, 255, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2);
      margin: 32px auto;
    }
    @media (min-width: 768px) {
      .custom-page-layout .md-img {
        float: right;
        margin: 0 0 24px 32px;
      }
    }
  </style>

</body>
</html>
```

## section:layout:project_item

```html
<a href="{{URL}}" class="project-row">
  <div class="row-primary-info">
    <div class="row-title">{{NAME}}</div>
    <p class="row-desc">{{DESCRIPTION}}</p>
  </div>
  <div class="row-right-panel">
    <div class="row-tech-wrapper">
      {{TECH_BADGES}}
    </div>
    <div style="font-family: var(--font-code); font-size: 0.85rem; color: var(--color-text-secondary);">{{YEAR}}</div>
    <div class="row-arrow">INDEX_VIEW &rarr;</div>
  </div>
</a>
```

## section:layout:design_item

```html
<a href="{{URL}}" class="project-card" style="min-height: 380px;">
  <div class="card-meta">
    <span class="card-index">{{CLIENT}}</span>
    <span class="card-year">{{YEAR}}</span>
  </div>
  <div style="margin-bottom: 16px; border-radius: 12px; overflow: hidden; background: rgba(0, 0, 0, 0.4); border: 1px solid var(--color-border); height: 160px; display: flex; align-items: center; justify-content: center;">
    {{PREVIEW}}
  </div>
  <div class="card-content" style="margin-bottom: 16px;">
    <h3 class="card-title" style="font-size: 1.2rem; margin-bottom: 4px;">{{NAME}}</h3>
    <p class="card-desc" style="font-size: 0.85rem; line-height: 1.4;">{{DESCRIPTION}}</p>
  </div>
  <div class="card-footer" style="margin-top: auto;">
    {{TAG_BADGES}}
  </div>
</a>
```

## section:layout:nav_item

```html
<a href="{{NAV_URL}}" class="nav-link {{NAV_ACTIVE_CLASS}}">{{NAV_NAME}}</a>
```
