#!/usr/bin/env node
// Build the portfolio static site from the SSSS vault.
// The vault is the source of truth: every page on the site is a `type: page`
// document under vault/pages/, parsed with the canonical @ssss/cli frontmatter
// parser. Output goes to dist/site/.
import { readdir, readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
// @ts-ignore
import { parseDocument } from '@ssss/cli/frontmatter';
import { parseNestedMap, extractSections, scopeCss, fillTemplate } from './lib/theme.mjs';

let targetDesign = null;
const designArgIdx = process.argv.indexOf('--design');
if (designArgIdx >= 0 && designArgIdx + 1 < process.argv.length) {
  targetDesign = process.argv[designArgIdx + 1];
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pagesDir = join(root, 'vault', 'pages');
const assetsDir = join(root, 'assets');
const outDir = targetDesign ? join(root, 'dist', 'site', 'designs', targetDesign) : join(root, 'dist', 'site');

async function collectMarkdown(dir) {
  const out = [];
  try {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) out.push(...(await collectMarkdown(p)));
      else if (entry.name.endsWith('.md')) out.push(p);
    }
  } catch (e) { console.error(String(e)); }
  return out;
}

function escapeHtml(s) {
  return String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

// Minimal Markdown renderer: headings, lists, links, bold/em, inline code, paragraphs.
function renderMarkdown(md) {
  const inline = (s) =>
    escapeHtml(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="md-img" loading="lazy">')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  const blocks = md.trim().split(/\n{2,}/);
  return blocks
    .map((block) => {
      const lines = block.split('\n');
      const h = block.match(/^(#{1,4})\s+(.*)$/);
      if (h && lines.length === 1) return `<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`;
      if (lines.every((l) => /^\s*-\s+/.test(l))) {
        const items = lines.map((l) => `<li>${inline(l.replace(/^\s*-\s+/, ''))}</li>`).join('');
        return `<ul>${items}</ul>`;
      }
      return `<p>${inline(lines.join(' '))}</p>`;
    })
    .join('\n');
}

const STYLE = /* css */ `
:root {
  --mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --serif: "Fraunces", Georgia, serif;
  --sans: "Archivo", -apple-system, Helvetica, Arial, sans-serif;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0; background: var(--ink); color: var(--bone);
  font: 400 17px/1.7 var(--sans);
  -webkit-font-smoothing: antialiased;
  transition: background .4s ease, color .4s ease;
  position: relative;
}

/* cyber grid overlay */
body::before {
  content: ""; position: fixed; inset: 0; pointer-events: none; z-index: -1;
  opacity: var(--grid-opacity);
  background-size: 40px 40px;
  background-image: 
    linear-gradient(to right, var(--line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--line) 1px, transparent 1px);
  transition: opacity .4s ease;
}

/* grain overlay */
body::after {
  content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 999;
  opacity: var(--grain-opacity); mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.16'/%3E%3C/svg%3E");
  transition: opacity .4s ease;
}

a { color: inherit; text-decoration: none; }
::selection { background: var(--accent); color: var(--ink); }

.frame { max-width: 1100px; margin: 0 auto; padding: 0 clamp(1.2rem, 4vw, 3rem); }

/* ---------- nav ---------- */
header {
  border-bottom: 1px solid var(--glass-border);
  position: sticky; top: 0; background: color-mix(in srgb, var(--ink) 85%, transparent);
  backdrop-filter: blur(var(--blur)); z-index: 10;
  transition: background .4s ease, border-color .4s ease, backdrop-filter .4s ease;
}
nav { display: flex; align-items: center; gap: 1.75rem; padding: 1rem 0; }
nav .brand {
  font-family: var(--serif); font-weight: 600; font-size: 1.25rem; letter-spacing: .01em;
  margin-right: auto;
}
nav .brand em { color: var(--accent); font-style: normal; transition: color .3s ease; }
nav a.item {
  font-family: var(--mono); font-size: .78rem; color: var(--bone-dim);
  transition: color .25s ease;
  position: relative;
}
nav a.item::before { content: "./"; color: var(--line); transition: color .25s ease; }
nav a.item:hover::before { color: var(--accent); }
nav a.item:hover, nav a.item.active { color: var(--accent); }

/* ---------- theme switcher pills ---------- */
.theme-pills {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.25rem 0.5rem; background: var(--ink-2);
  border: 1px solid var(--glass-border); border-radius: 999px;
  transition: background .3s, border-color .3s;
  view-transition-name: theme-flipper;
}
.theme-pill {
  width: 36px; height: 36px; border: 1px solid transparent; background: transparent;
  cursor: pointer; padding: 0; outline: none; transition: transform 0.2s;
  display: flex; align-items: center; justify-content: center;
  -webkit-tap-highlight-color: transparent;
}
.theme-pill::after {
  content: ""; width: 12px; height: 12px; border-radius: 50%;
  transition: transform 0.25s ease;
}
.theme-pill.active::after {
  transform: scale(1.2);
  box-shadow: 0 0 0 2px var(--bone), 0 0 10px var(--accent);
}

/* ---------- ambient animated glows ---------- */
.ambient-glows {
  position: fixed; inset: 0; overflow: hidden; pointer-events: none; z-index: -2;
  opacity: 0; transition: opacity 0.8s ease;
}
[data-theme="glass-blue"] .ambient-glows { opacity: 0.5; }
[data-theme="cyber-green"] .ambient-glows { opacity: 0.25; }
[data-theme="custom"] .ambient-glows { opacity: 0.4; }

.glow-blob {
  position: absolute; border-radius: 50%; filter: blur(90px);
  mix-blend-mode: screen; opacity: 0.45;
  animation: float 25s ease-in-out infinite alternate;
  background: var(--accent);
  transition: background .8s ease;
}
.glow-1 {
  top: -5%; left: 10%; width: 450px; height: 450px;
  animation-duration: 22s;
}
.glow-2 {
  bottom: -5%; right: 10%; width: 500px; height: 500px;
  background: var(--accent-soft);
  animation-duration: 28s;
  animation-delay: -7s;
  transition: background .8s ease;
}
@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(6%, 10%) scale(1.08); }
  100% { transform: translate(-6%, -8%) scale(0.92); }
}

/* ---------- hero ---------- */
.hero { padding: clamp(3.5rem, 9vw, 7rem) 0 clamp(2.5rem, 6vw, 4.5rem); position: relative; }
.hero .path {
  font-family: var(--mono); font-size: .75rem; color: var(--bone-dim);
  display: inline-block; border: 1px solid var(--glass-border); border-radius: 999px;
  padding: .25rem .8rem; margin-bottom: 2rem;
  transition: border-color .3s;
}
.hero .path b { color: var(--accent); font-weight: 400; transition: color .3s; }
h1.display {
  font-family: var(--serif); font-weight: 500; font-size: clamp(2.6rem, 7vw, 5.2rem);
  line-height: 1.02; letter-spacing: -0.02em; margin: 0 0 1.4rem; max-width: 18ch;
}
h1.display .swash { font-style: italic; color: var(--accent); transition: color .3s; }
.hero .tagline {
  font-size: clamp(1.05rem, 2vw, 1.3rem); color: var(--bone-dim);
  max-width: 52ch; margin: 0 0 1.2rem;
}
.reveal { opacity: 0; transform: translateY(18px); animation: rise 1.2s cubic-bezier(.16,1,.3,1) forwards; }
.reveal.d1 { animation-delay: .15s } .reveal.d2 { animation-delay: .30s }
.reveal.d3 { animation-delay: .45s } .reveal.d4 { animation-delay: .60s }
@keyframes rise { to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .reveal { animation: none; opacity: 1; transform: none; } }

/* ---------- prose ---------- */
.prose { max-width: 64ch; }
.prose p { color: color-mix(in srgb, var(--bone) 88%, transparent); }
.prose h2 {
  font-family: var(--serif); font-weight: 500; font-size: 1.7rem; letter-spacing: -.01em;
  margin: 2.6rem 0 .8rem; padding-top: 1.6rem; border-top: 1px solid var(--glass-border);
  transition: border-color .3s;
}
.prose h2::before { content: "## "; font-family: var(--mono); font-size: .8rem; color: var(--accent); vertical-align: .35em; transition: color .3s; }
.prose ul { padding-left: 1.1rem; }
.prose li { margin: .45rem 0; color: color-mix(in srgb, var(--bone) 88%, transparent); }
.prose li::marker { color: var(--accent); transition: color .3s; }
.prose a { color: var(--accent-soft); border-bottom: 1px solid color-mix(in srgb, var(--accent-soft) 40%, transparent); transition: color .3s, border-color .3s; }
.prose a:hover { color: var(--accent); border-color: var(--accent); }
.prose strong { color: var(--bone); }
code {
  font-family: var(--mono); font-size: .84em; color: var(--accent-soft);
  background: var(--ink-2); border: 1px solid var(--glass-border); border-radius: 5px; padding: .1em .4em;
  transition: background .3s, border-color .3s, color .3s;
}

/* ---------- section heading ---------- */
.kicker {
  display: flex; align-items: baseline; gap: 1rem;
  margin: clamp(2.5rem, 6vw, 4.5rem) 0 0; padding-bottom: .8rem; border-bottom: 1px solid var(--bone);
  transition: border-color .3s;
}
.kicker h2 { font-family: var(--serif); font-weight: 500; font-size: clamp(1.6rem, 3.4vw, 2.4rem); margin: 0; letter-spacing: -.01em; }
.kicker .count { font-family: var(--mono); font-size: .78rem; color: var(--accent); transition: color .3s; }
.kicker .right { margin-left: auto; font-family: var(--mono); font-size: .75rem; color: var(--bone-dim); }
.kicker .right a:hover { color: var(--accent); }

/* ---------- project index rows ---------- */
.index { list-style: none; margin: 0; padding: 0; }
.row {
  display: grid; grid-template-columns: 3.2rem 64px 1fr auto; gap: 1.4rem; align-items: center;
  padding: 1.5rem 0; border-bottom: 1px solid var(--glass-border);
  position: relative; transition: background .3s ease, border-color .3s ease;
}
.row .num { font-family: var(--mono); font-size: .78rem; color: var(--bone-dim); transition: color .3s; }
.logo-tile {
  width: 64px; height: 64px; border-radius: 14px; background: var(--bone);
  display: grid; place-items: center; overflow: hidden; flex: none;
  box-shadow: 0 0 0 1px var(--glass-border); transition: transform .25s cubic-bezier(.2,.7,.2,1), box-shadow .3s;
}
.logo-tile img { width: 74%; height: 74%; object-fit: contain; }
.logo-tile.cover { background: var(--ink-2); transition: background .3s; }
.logo-tile.cover img { width: 100%; height: 100%; object-fit: cover; }
.row .body h3 { font-family: var(--serif); font-weight: 500; font-size: 1.45rem; margin: 0 0 .15rem; letter-spacing: -.01em; }
.row .body p { margin: 0 0 .4rem; color: var(--bone-dim); font-size: .95rem; max-width: 58ch; transition: color .3s; }
.badges { display: flex; flex-wrap: wrap; gap: .4rem; }
.badge {
  font-family: var(--mono); font-size: .68rem; color: var(--bone-dim);
  border: 1px solid var(--glass-border); border-radius: 999px; padding: .12rem .6rem;
  transition: border-color .3s, color .3s;
}
.row .aside { text-align: right; display: flex; flex-direction: column; gap: .5rem; align-items: flex-end; }
.row .year { font-family: var(--mono); font-size: .75rem; color: var(--bone-dim); }
.row .arrow { color: var(--accent); font-size: 1.3rem; transform: translateX(-6px); opacity: 0; transition: all .25s; }
.row > a.cover { position: absolute; inset: 0; z-index: 1; }
.row .aside a.src { position: relative; z-index: 2; }
.src {
  font-family: var(--mono); font-size: .72rem; color: var(--bone-dim);
  border: 1px solid var(--glass-border); border-radius: 999px; padding: .22rem .7rem; transition: all .18s;
}

/* ---------- design cards ---------- */
.design-grid {
  display: flex; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;
  gap: 1.6rem; margin-top: 1.6rem; padding-bottom: 1.6rem; scrollbar-width: none;
}
.design-grid::-webkit-scrollbar { display: none; }
.design-card {
  flex: 0 0 clamp(280px, 75vw, 400px); scroll-snap-align: start;
  position: relative; display: block; border-radius: 14px; overflow: hidden;
  border: 1px solid var(--glass-border); background: var(--ink-2);
  backdrop-filter: blur(var(--blur));
  box-shadow: 0 0 0 0 transparent;
  transition: box-shadow .4s cubic-bezier(.16,1,.3,1), transform .4s cubic-bezier(.16,1,.3,1), border-color .4s, background .4s, backdrop-filter .4s;
}
.design-card .frame-shot {
  display: block; aspect-ratio: 16 / 10.4; overflow: hidden; position: relative;
  background: var(--ink);
  border-bottom: 1px solid var(--glass-border);
  transition: background .3s, border-color .3s;
}
.design-card .frame-shot img {
  display: block; width: 100%; height: 100%; object-fit: cover; object-position: top;
  transform: scale(1.08); transform-origin: top center;
  animation: kenburns 14s ease-in-out infinite alternate;
  transition: transform .6s cubic-bezier(.2,.7,.2,1), filter .4s;
  filter: saturate(.92) brightness(.94);
}
@keyframes kenburns {
  from { transform: scale(1.08) translateY(0); }
  to   { transform: scale(1.14) translateY(-2.5%); }
}
@media (prefers-reduced-motion: reduce) {
  .design-card .frame-shot img { animation: none; }
}
.design-card .frame-shot::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(180deg, transparent 50%, color-mix(in srgb, var(--ink) 92%, transparent) 100%);
  pointer-events: none;
}
.design-card .scrim-tag {
  position: absolute; top: .8rem; right: .8rem; z-index: 2;
  font-family: var(--mono); font-size: .68rem; color: var(--bone);
  background: color-mix(in srgb, var(--ink) 60%, transparent); backdrop-filter: blur(6px);
  border: 1px solid color-mix(in srgb, var(--bone) 25%, transparent);
  border-radius: 999px; padding: .2rem .65rem;
}
.design-card .body { display: block; padding: 1.1rem 1.3rem 1.3rem; }
.design-card h3, .design-card p, .design-card .tags, .design-card .foot { display: block; }
.design-card h3 { font-family: var(--serif); font-weight: 500; font-size: 1.3rem; margin: 0 0 .3rem; letter-spacing: -.01em; }
.design-card p { margin: 0 0 .7rem; color: var(--bone-dim); font-size: .88rem; transition: color .3s; }
.design-card .tags { display: flex; flex-wrap: wrap; gap: .35rem; margin-bottom: .2rem; }
.design-card .foot { display: flex; align-items: center; justify-content: space-between; margin-top: .7rem; }
.design-card .visit { font-family: var(--mono); font-size: .72rem; color: var(--accent-soft); transition: color .3s; }
.design-card .year { font-family: var(--mono); font-size: .72rem; color: var(--bone-dim); }

/* ---------- design detail page ---------- */
.design-hero-shot {
  aspect-ratio: 16 / 8.4; border-radius: 16px; overflow: hidden; border: 1px solid var(--glass-border);
  margin-top: 1.8rem; position: relative; transition: border-color .3s;
}
.design-hero-shot img {
  width: 100%; height: 100%; object-fit: cover; object-position: top;
  transform: scale(1.05); animation: kenburns 16s ease-in-out infinite alternate;
}
@media (prefers-reduced-motion: reduce) { .design-hero-shot img { animation: none; } }

/* ---------- project page ---------- */
.project-head { padding: clamp(3rem, 7vw, 5rem) 0 0; display: flex; gap: 2rem; align-items: flex-start; }
.project-head .logo-tile { width: 92px; height: 92px; border-radius: 20px; }
.project-head .logo-tile:hover { transform: rotate(-4deg) scale(1.04); }
.meta-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1px;
  background: var(--glass-border); border: 1px solid var(--glass-border); border-radius: 12px; overflow: hidden;
  margin: 2.2rem 0; transition: border-color .3s, background .3s;
}
.meta-cell { background: var(--ink-2); padding: .9rem 1.1rem; transition: background .3s; }
.meta-cell .k { font-family: var(--mono); font-size: .66rem; color: var(--bone-dim); text-transform: uppercase; letter-spacing: .08em; display: block; margin-bottom: .25rem; }
.meta-cell .v { font-size: .92rem; overflow-wrap: anywhere; }
.meta-cell .v a { color: var(--accent-soft); }
.meta-cell .v a:hover { color: var(--accent); }
.btn {
  display: inline-flex; align-items: center; gap: .5rem;
  font-family: var(--mono); font-size: .8rem; color: var(--ink);
  background: var(--accent); border-radius: 999px; padding: .65rem 1.4rem; margin-top: 1.4rem;
  transition: transform .18s, box-shadow .18s, background .3s, color .3s;
  -webkit-tap-highlight-color: transparent;
}
.backlink { font-family: var(--mono); font-size: .78rem; color: var(--bone-dim); display: inline-block; margin-top: 2.5rem; transition: color .3s; padding: 0.5rem 0; }

/* ---------- footer ---------- */
footer { border-top: 1px solid var(--glass-border); margin-top: clamp(3rem, 8vw, 6rem); transition: border-color .3s; }
footer .frame { display: flex; flex-wrap: wrap; gap: 1rem; padding-top: 1.4rem; padding-bottom: 2.2rem; align-items: baseline; }
footer p { margin: 0; font-family: var(--mono); font-size: .72rem; color: var(--bone-dim); }
footer .gh { margin-left: auto; }
footer a { color: var(--accent-soft); transition: color .3s; } footer a:hover { color: var(--accent); }
main { min-height: 60vh; }

/* ---------- responsive interactions & breakpoints ---------- */
@media (hover: hover) {
  nav a.item:hover::before { color: var(--accent); }
  nav a.item:hover { color: var(--accent); }
  nav a.item::after {
    content: ""; position: absolute; bottom: -2px; left: 0; width: 0; height: 1px;
    background: var(--accent); transition: width 0.25s ease;
  }
  nav a.item:hover::after, nav a.item.active::after { width: 100%; }

  .theme-pill:hover::after { transform: scale(1.25); }

  .row:hover { background: linear-gradient(90deg, var(--glow), transparent 60%); }
  .row:hover .num { color: var(--accent); }
  .row:hover .logo-tile { transform: rotate(-4deg) scale(1.06); }
  .row:hover .arrow { transform: none; opacity: 1; }
  .src:hover { color: var(--ink); background: var(--accent); border-color: var(--accent); }
  
  .design-card:hover {
    transform: translateY(-4px); border-color: var(--accent);
    box-shadow: 0 20px 40px -18px var(--glow);
  }
  .design-card:hover .frame-shot img { transform: scale(1.16) translateY(-1.5%); filter: saturate(1.05) brightness(1); animation-play-state: paused; }
  
  .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px var(--glow); }
  .backlink:hover { color: var(--accent); }
}

/* Touch active compression states (taptic feel) */
.row:active { background: var(--glow); }
.design-card:active { transform: scale(0.985); border-color: var(--accent); }
.btn:active { transform: translateY(1px); opacity: 0.95; }
.backlink:active { color: var(--accent); }

@media (max-width: 767px) {
  /* Mobile container padding relaxation */
  .frame { padding: 0 clamp(0.8rem, 4vw, 1.2rem); }
}

@media (max-width: 640px) {
  /* Grid mobile row collapse & wrap */
  .row {
    grid-template-columns: 48px 1fr;
    grid-template-rows: auto auto;
    gap: 0.6rem 1rem;
    padding: 1.2rem 0;
  }
  .row .num { display: none; }
  .logo-tile { 
    width: 48px; height: 48px; border-radius: 10px;
    grid-column: 1; grid-row: 1;
  }
  .row .body {
    grid-column: 2; grid-row: 1;
  }
  .row .body h3 { font-size: 1.25rem; }
  .row .body p { font-size: 0.9rem; }
  .row .aside {
    grid-column: 2; grid-row: 2;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 1rem;
    text-align: left;
  }
  .row .year { font-size: 0.75rem; }
  .row .arrow { display: none; }
  
  .design-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.2rem;
  }
}

@media (max-width: 767px) {
  nav {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas: 
      "brand theme"
      "links links";
    gap: 1rem 0;
    padding: 1rem 0;
  }
  nav .brand { grid-area: brand; }
  .theme-pills { grid-area: theme; margin-left: auto; }
  .nav-links {
    grid-area: links;
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    gap: 1.5rem;
    padding: 0.2rem 0 0.6rem;
    margin: 0 -0.8rem;
    scrollbar-width: none;
  }
  .nav-links::-webkit-scrollbar { display: none; }
  .nav-links a.item {
    flex: 0 0 auto;
    padding: 0.5rem 0.8rem;
  }
}

@media (min-width: 768px) {
  nav {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1.75rem;
    padding: 1.1rem 0;
  }
  nav .brand {
    margin-right: auto;
  }
  .nav-links {
    display: flex;
    flex-direction: row;
    gap: 1.75rem;
  }
}

/* ---------- theme layers (default vs generated custom skin) ---------- */
.tl-custom { display: none; }
html[data-theme="custom"] .tl-default { display: none !important; }
html[data-theme="custom"] .tl-custom { display: block; }

/* ---------- custom style generator form ---------- */
.custom-generator {
  margin: 2.5rem 0 1rem;
  padding: 1.5rem;
  background: var(--ink-2);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  backdrop-filter: blur(var(--blur));
  transition: border-color 0.3s, background 0.3s;
}
.gen-label {
  font-family: var(--mono); font-size: 0.8rem; color: var(--bone-dim);
  margin: 0 0 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;
}
.gen-form {
  display: flex;
  gap: 0.75rem;
}
.gen-form input {
  flex: 1;
  background: var(--ink);
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  padding: 0.65rem 1.3rem;
  color: var(--bone);
  font-family: var(--sans);
  outline: none;
  font-size: 0.95rem;
  transition: border-color 0.3s, background 0.3s;
}
.gen-form input:focus {
  border-color: var(--accent);
}
.gen-form button {
  background: var(--accent);
  color: var(--ink);
  border: none;
  border-radius: 999px;
  padding: 0.65rem 1.5rem;
  font-family: var(--mono);
  font-size: 0.82rem;
  cursor: pointer;
  font-weight: 500;
  transition: transform 0.2s, box-shadow 0.2s, background 0.3s, color 0.3s;
  -webkit-tap-highlight-color: transparent;
}
.gen-form button[disabled] { opacity: 0.6; cursor: progress; }
.gen-status {
  font-family: var(--mono); font-size: 0.75rem; color: var(--accent-soft);
  margin: 0.75rem 0 0;
}
.gen-status.error { color: #ff6b6b; }

a:focus-visible, button:focus-visible, input:focus-visible {
  outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 4px;
}

@media (hover: hover) {
  .gen-form button:hover:not([disabled]) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px var(--glow);
  }
}
.gen-form button:active {
  transform: scale(0.96);
}

@media (max-width: 640px) {
  .gen-form {
    flex-direction: column;
    gap: 0.6rem;
  }
  .gen-form button {
    width: 100%;
  }
}

.md-img {
  display: block;
  max-width: min(340px, 100%);
  height: auto;
  border-radius: 4px;
  margin: 0.5rem 0 1.5rem;
}
`;

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400..700;1,400..700&family=Archivo:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">`;

const FAVICON = `<link rel="icon" type="image/svg+xml" href="/assets/logos/ssss.svg">`;

// Cross-page fades + 3D design-morph (View Transition API; no-op where unsupported).
const TRANSITIONS = `<style>
@view-transition { navigation: auto; }
@media (prefers-reduced-motion: no-preference) {
  ::view-transition-old(root) {
    animation: vt-leave .45s cubic-bezier(.4,0,.2,1) both;
  }
  ::view-transition-new(root) {
    animation: vt-enter .45s cubic-bezier(.16,1,.3,1) both;
  }
  /* Stronger 3D morph when switching designs in place */
  .theme-morph::view-transition-old(root) {
    animation: vt-morph-leave .6s cubic-bezier(.4,0,.2,1) both;
  }
  .theme-morph::view-transition-new(root) {
    animation: vt-morph-enter .6s cubic-bezier(.16,1,.3,1) both;
  }
}
@keyframes vt-leave  { to { opacity: 0; transform: perspective(1200px) translateZ(-40px); } }
@keyframes vt-enter  { from { opacity: 0; transform: perspective(1200px) translateZ(24px); } }
@keyframes vt-morph-leave {
  to { opacity: 0; transform: perspective(1000px) rotateX(6deg) scale(.96); filter: blur(6px); }
}
@keyframes vt-morph-enter {
  from { opacity: 0; transform: perspective(1000px) rotateX(-4deg) scale(1.03); filter: blur(6px); }
}
</style>`;

const FLIPPER_SCRIPT_TEMPLATE = `<script>
(function() {
  const designs = __VALID_THEMES__;
  if (!designs || designs.length === 0) return;

  const currentUrl = window.location.pathname;
  let currentIndex = designs.findIndex(d => currentUrl.startsWith(d.url.replace('/index.html', '')));
  if (currentIndex === -1) {
    currentIndex = designs.findIndex(d => d.url === '/index.html' || d.url === '/');
    if (currentIndex === -1) currentIndex = 0;
  }

  const prev = designs[(currentIndex - 1 + designs.length) % designs.length];
  const next = designs[(currentIndex + 1) % designs.length];

  let subPath = currentUrl;
  const currentBase = designs[currentIndex].url.replace('/index.html', '').replace(/\\/$/, '');
  if (currentBase && currentUrl.startsWith(currentBase)) {
    subPath = currentUrl.substring(currentBase.length);
  }
  if (!subPath || subPath === '/') subPath = '/index.html';

  const prevBase = prev.url.replace('/index.html', '').replace(/\\/$/, '');
  const nextBase = next.url.replace('/index.html', '').replace(/\\/$/, '');

  const prevUrl = prevBase + subPath;
  const nextUrl = nextBase + subPath;

  const flipperHtml = \`
    <div id="ai-design-flipper" style="position:fixed; top:0; left:0; right:0; height:44px; background:#111; color:#eee; display:flex; align-items:center; justify-content:center; z-index:99999; font-family:monospace; font-size: 13px; border-bottom:1px solid #333;">
      <a href="\${prevUrl}" style="color:#aaa; text-decoration:none; padding:10px 20px;">&larr; Prev Design</a>
      <span style="margin:0 20px; font-weight:bold; color:#fff;">\${designs[currentIndex].name}</span>
      <a href="\${nextUrl}" style="color:#aaa; text-decoration:none; padding:10px 20px;">Next Design &rarr;</a>
    </div>
  \`;
  
  document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('afterbegin', flipperHtml);
    document.body.style.paddingTop = '44px';
  });
})();
</script>`;

const GENERATOR_SCRIPT = `<script>
(function() {
  document.addEventListener('DOMContentLoaded', () => {
    const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    document.querySelectorAll('.custom-generator').forEach(box => {
      if (!isLocal) { box.hidden = true; return; }
      const form = box.querySelector('.gen-form');
      const input = form.querySelector('input');
      const btn = form.querySelector('button');
      const status = box.querySelector('.gen-status');

      const setStatus = (msg, isError) => {
        status.hidden = !msg;
        status.textContent = msg || '';
        status.classList.toggle('error', !!isError);
      };
      const setBusy = (busy) => {
        btn.disabled = busy;
        btn.textContent = busy ? 'Generating…' : 'Generate';
        input.disabled = busy;
      };

      let pollTimer = null;
      const poll = () => {
        fetch('/generate-status')
          .then(r => r.json())
          .then(job => {
            if (job.status === 'running') {
              setStatus(job.phase || 'Working…');
              pollTimer = setTimeout(poll, 1500);
            } else if (job.status === 'done') {
              setStatus('Compiled! Redirecting to your new design…');
              setTimeout(() => { window.location.href = job.latestUrl || '/'; }, 1200);
            } else if (job.status === 'error') {
              setStatus('Generation failed: ' + (job.error || 'unknown error'), true);
              setBusy(false);
            } else {
              setBusy(false);
            }
          })
          .catch(() => { pollTimer = setTimeout(poll, 3000); });
      };

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        setBusy(true);
        setStatus('Dispatching to a CLI agent…');
        fetch('/generate-theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: input.value })
        })
        .then(r => r.json())
        .then(data => {
          if (data.started) { poll(); }
          else { setStatus(data.error || 'Could not start generation.', true); setBusy(false); }
        })
        .catch(() => { setStatus('Error connecting to the dev server.', true); setBusy(false); });
      });

      fetch('/generate-status').then(r => r.json()).then(job => {
        if (job.status === 'running') { setBusy(true); poll(); }
      }).catch(() => {});
    });
  });
})();
</script>`;

let themePillsHtml = '';
let themeCss = '';
let flipperScript = '';
let generatorScript = '';
let scopedCustomCss = '';
let customLayouts = {};
let LIVE_RELOAD_SCRIPT = '';

const GENERATOR_FORM = `<div class="custom-generator">
  <p class="gen-label">🔮 SSSS Style Generator (Compile on Demand)</p>
  <form class="gen-form">
    <input type="text" placeholder="Describe a style — e.g. brutalist newspaper, vaporwave arcade…" maxlength="500" required>
    <button type="submit">Generate</button>
  </form>
  <p class="gen-status" hidden></p>
</div>`;

/**
 * Render both theme layers: the default layout (hidden while the custom theme
 * is active) and the generated custom layout (visible only under it). This is
 * what makes the theme flipper instant and lossless — nothing is replaced,
 * only toggled.
 */
function withCustomLayer(defaultHtml, customHtml) {
  if (!customHtml) return defaultHtml;
  return `<div class="tl tl-default">\n${defaultHtml}\n</div>\n<div class="tl tl-custom">\n${customHtml}\n</div>`;
}

function navLinksHtml(nav, activeSlug, itemTemplate) {
  const links = nav.map((p) => {
    const isActive = p.data.slug === activeSlug;
    if (itemTemplate) {
      return fillTemplate(itemTemplate, {
        NAV_URL: `/${p.data.sandbox_entry}`,
        NAV_NAME: escapeHtml(p.data.name.toLowerCase()),
        NAV_ACTIVE_CLASS: isActive ? 'active' : '',
      });
    }
    return `<a class="item${isActive ? ' active' : ''}" href="/${p.data.sandbox_entry}">${escapeHtml(p.data.name.toLowerCase())}</a>`;
  });
  if (!itemTemplate) links.push(`<a class="item" href="https://github.com/gregiteen">github</a>`);
  return links.join('\n        ');
}

function layout({ title, description, nav, content, activeSlug, sourcePath }) {
  const defaultLinks = navLinksHtml(nav, activeSlug, null);
  const customNavTpl = customLayouts.nav_item;
  const navHtml = customNavTpl
    ? `<div class="nav-links tl-default">\n        ${defaultLinks}\n      </div>\n      <div class="nav-links tl-custom">\n        ${navLinksHtml(nav, activeSlug, customNavTpl)}\n      </div>`
    : `<div class="nav-links">\n        ${defaultLinks}\n      </div>`;

  // The custom skin is scoped to [data-theme="custom"], so shipping it on
  // every page is safe: other themes are untouched and flipping is instant.
  const stylesheet = [themeCss, STYLE, scopedCustomCss].filter(Boolean).join('\n');

  let finalHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="greg.iteen">
${flipperScript}
${generatorScript}
${LIVE_RELOAD_SCRIPT}
${FONTS}
${FAVICON}
${TRANSITIONS}
<style>${stylesheet}</style>
</head>
<body>
<div class="ambient-glows">
  <div class="glow-blob glow-1"></div>
  <div class="glow-blob glow-2"></div>
</div>
<header>
  <div class="frame">
    <nav>
      <a class="brand" href="/index.html">greg<em>.</em>iteen</a>
      ${navHtml}
      <div class="theme-pills" role="group" aria-label="Theme switcher">
        ${themePillsHtml}
      </div>
    </nav>
  </div>
</header>
<main>
  <div class="frame">
${content}
  </div>
</main>
<footer>
  <div class="frame">
    <p>rendered from <code>${escapeHtml(sourcePath)}</code> · vault → html, no database</p>
    <p class="gh">open source: <a href="https://github.com/gregiteen/ssss">ssss</a> · <a href="https://github.com/gregiteen/total-recall">total-recall</a></p>
  </div>
</footer>
<a href="/api/design-spec" download="design.md" class="design-dl" title="Download design spec" aria-label="Download design spec">
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v9M4 8l4 4 4-4M2 14h12"/></svg>
  design.md
</a>
<style>
.design-dl{
  position:fixed;bottom:16px;right:16px;z-index:999;
  display:inline-flex;align-items:center;gap:6px;
  padding:8px 14px;border-radius:8px;
  font-size:11px;font-family:monospace;text-decoration:none;
  background:rgba(20,20,30,0.85);color:rgba(240,238,246,0.6);
  border:1px solid rgba(255,255,255,0.08);
  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  transition:color .2s,border-color .2s,background .2s;
}
.design-dl:hover{color:#8b5cf6;border-color:rgba(139,92,246,0.3);background:rgba(20,20,30,0.95)}
</style>
<div class="cookie-banner" id="cookieBanner">
  <p class="cookie-text">This site uses cookies to authenticate your session and remember your design preferences. By continuing, you agree to our use of cookies.</p>
  <div class="cookie-actions">
    <button class="cookie-btn cookie-decline" id="cookieDecline">Decline</button>
    <button class="cookie-btn cookie-accept" id="cookieAccept">Accept</button>
  </div>
</div>
<script>
(function(){
  if(localStorage.getItem('gi_cookies')==='accepted'){
    document.getElementById('cookieBanner').style.display='none';
  }
  document.getElementById('cookieAccept').addEventListener('click',()=>{
    localStorage.setItem('gi_cookies','accepted');
    document.getElementById('cookieBanner').style.display='none';
  });
  document.getElementById('cookieDecline').addEventListener('click',()=>{
    document.getElementById('cookieBanner').style.display='none';
  });
})();
</script>
<style>
.cookie-banner{
  position:fixed;bottom:0;left:0;right:0;z-index:100;
  background:var(--black, #111);border-top:1px solid var(--line, #333);
  padding:16px clamp(20px,4vw,56px);
  display:flex;align-items:center;gap:24px;flex-wrap:wrap;
  animation:slideUp .5s cubic-bezier(.16,1,.3,1) both;
}
@keyframes slideUp{0%{transform:translateY(100%)}100%{transform:none}}
.cookie-text{
  flex:1;min-width:260px;font-family:'IBM Plex Mono',monospace;
  font-size:.64rem;letter-spacing:.03em;line-height:1.6;color:var(--gray, #999);margin:0;
}
.cookie-actions{display:flex;gap:12px}
.cookie-btn{
  padding:9px 22px;font-family:'IBM Plex Mono',monospace;font-size:.64rem;
  letter-spacing:.14em;text-transform:uppercase;cursor:pointer;transition:.2s;
  border:1px solid var(--line, #333);background:transparent;color:var(--gray, #999);
}
.cookie-accept{background:var(--white, #fff);color:var(--black, #111);border-color:var(--white, #fff)}
.cookie-accept:hover{background:transparent;color:var(--white, #fff)}
.cookie-decline:hover{border-color:var(--white, #fff);color:var(--white, #fff)}
</style>
</body>
</html>
`;
  if (targetDesign) {
    finalHtml = finalHtml.replace(/href="\//g, `href="/designs/${targetDesign}/`);
    finalHtml = finalHtml.replace(/src="\//g, `src="/designs/${targetDesign}/`);
  }
  return finalHtml;
}

function logoTile(p) {
  const cls = p.data.x_logo_style === 'cover' ? 'logo-tile cover' : 'logo-tile';
  return p.data.x_logo
    ? `<span class="${cls}"><img src="/${escapeHtml(p.data.x_logo)}" alt="${escapeHtml(p.data.name)} logo"></span>`
    : `<span class="logo-tile"></span>`;
}

const files = await collectMarkdown(pagesDir);
const pages = [];
for (const file of files) {
  const raw = await readFile(file, 'utf8');
  const doc = parseDocument(raw);
  if (doc.data.type !== 'page') continue;
  pages.push({ file, raw, data: doc.data, body: doc.body, html: renderMarkdown(doc.body) });
}

// ── SSSS dynamic themes from the vault ──────────────────────────────────────
// Built-in themes declare token maps in x_variables. The canonical @ssss/cli
// parser only records nested maps as present, so tokens are re-parsed from the
// raw document — this is what feeds the [data-theme] blocks the flipper needs.
const themes = pages.filter((p) => p.data.x_kind === 'theme');
const builtinThemes = themes.filter((t) => t.data.slug !== 'theme-custom');
const customTheme = themes.find((t) => t.data.slug === 'theme-custom') ?? null;

// Emit the warm (default) tokens on :root FIRST, then every theme as a
// higher-specificity html[data-theme] block — otherwise the fallback would
// win the cascade tie and the flipper would be a no-op.
const themeCssBlocks = [];
for (const t of builtinThemes) {
  if (targetDesign) continue;
  const name = t.data.slug.replace('theme-', '');
  const tokens = parseNestedMap(t.raw, 'x_variables');
  const vars = Object.entries(tokens)
    .map(([k, v]) => `  --${k.replace(/_/g, '-')}: ${v};`)
    .join('\n');
  const accent = tokens.accent ?? '#ffffff';
  if (name === 'warm') themeCssBlocks.unshift(`:root {\n${vars}\n}`);
  themeCssBlocks.push(`html[data-theme="${name}"] {\n${vars}\n}\n.theme-pill.${name}::after { background: ${accent}; }`);
}

// The generated custom theme: scoped CSS + layout templates from fenced sections.
if (targetDesign) {
  try {
    const designMdRaw = await readFile(join(root, 'designs', targetDesign, 'DESIGN.md'), 'utf8');
    const doc = parseDocument(designMdRaw);
    const sections = extractSections(doc.body);
    if (sections.css) {
      scopedCustomCss = sections.css; // Un-scoped for standalone site
      customLayouts = {};
      for (const [key, content] of Object.entries(sections)) {
        if (key.startsWith('layout:')) customLayouts[key.slice('layout:'.length)] = content;
      }
    }
  } catch (e) {
    console.warn(`[Warn] Could not parse DESIGN.md for ${targetDesign}: ${String(e)}`);
  }
} else if (customTheme) {
  const sections = extractSections(customTheme.body);
  if (sections.css) {
    scopedCustomCss = scopeCss(sections.css);
    customLayouts = {};
    for (const [key, content] of Object.entries(sections)) {
      if (key.startsWith('layout:')) customLayouts[key.slice('layout:'.length)] = content;
    }
    const customAccent = customTheme.data.x_accent || '#888888';
    themeCssBlocks.push(`.theme-pill.custom::after { background: ${customAccent}; }`);
  }
}

const aiDesigns = pages
  .filter((p) => p.data.x_kind === 'design' && p.data.x_role === 'AI-Generated Theme')
  .sort((a, b) => (b.data.x_year ?? 0) - (a.data.x_year ?? 0) || a.data.name.localeCompare(b.data.name));

const flipperData = aiDesigns.map(d => ({ name: d.data.name, url: d.data.x_link }));
flipperScript = FLIPPER_SCRIPT_TEMPLATE.replace('__VALID_THEMES__', JSON.stringify(flipperData));
themePillsHtml = ''; // No more CSS theme pills!

if (!targetDesign) {
  themeCss = themeCssBlocks.join('\n\n');
  generatorScript = GENERATOR_SCRIPT;
} else {
  themeCss = '';
  generatorScript = '';
}

LIVE_RELOAD_SCRIPT = `
<script>
  (function() {
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      let currentVersion = null;
      setInterval(() => {
        fetch('/dev-status')
          .then(r => r.json())
          .then(data => {
            if (currentVersion === null) {
              currentVersion = data.version;
            } else if (currentVersion !== data.version) {
              console.error('Build failed: reload requested');
              location.reload();
            }
          })
          .catch(() => {});
      }, 800);
    }
  })();
</script>
`;

const sections = pages
  .filter((p) => p.data.x_kind === 'section')
  .sort((a, b) => (a.data.x_nav_order ?? 99) - (b.data.x_nav_order ?? 99));
const projects = pages
  .filter((p) => p.data.x_kind === 'project')
  .sort((a, b) => (b.data.x_year ?? 0) - (a.data.x_year ?? 0) || a.data.name.localeCompare(b.data.name));
const designs = pages
  .filter((p) => p.data.x_kind === 'design')
  .sort((a, b) => (b.data.x_year ?? 0) - (a.data.x_year ?? 0) || a.data.name.localeCompare(b.data.name));

const nav = [
  { data: { slug: '_projects', name: 'projects', sandbox_entry: 'projects.html' } },
  { data: { slug: '_designs', name: 'designs', sandbox_entry: 'designs.html' } },
  ...sections.filter((p) => p.data.slug !== 'home'),
];

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await cp(assetsDir, join(outDir, 'assets'), { recursive: true });
if (targetDesign) {
  try {
    await cp(join(root, 'designs', targetDesign, 'assets'), join(outDir, 'assets'), { recursive: true });
  } catch {}
}

function projectRow(p, i) {
  const badges = (p.data.x_tech ?? []).map((t) => `<span class="badge">${escapeHtml(t)}</span>`).join('');
  const src = p.data.x_repo
    ? `<a class="src" href="${escapeHtml(p.data.x_repo)}">source ↗</a>`
    : '';
  
  return `<li class="row reveal d${Math.min(i + 1, 4)}">
  <a class="cover" href="/${p.data.sandbox_entry}" aria-label="${escapeHtml(p.data.name)}"></a>
  <span class="num">0${i + 1}</span>
  ${logoTile(p)}
  <span class="body">
    <h3>${escapeHtml(p.data.name)}</h3>
    <p>${escapeHtml(p.data.description)}</p>
    <span class="badges">${badges}</span>
  </span>
  <span class="aside">
    <span class="year">${p.data.x_year ?? ''}</span>
    ${src}
    <span class="arrow">→</span>
  </span>
  </li>`;
}

function designCard(d, i) {
  const tags = (d.data.x_tags ?? []).map((t) => `<span class="badge">${escapeHtml(t)}</span>`).join('');
  return `<a class="design-card reveal d${Math.min(i + 1, 4)}" href="${escapeHtml(d.data.x_link)}" target="_blank" rel="noopener">
  <span class="frame-shot">
    <img src="/${escapeHtml(d.data.x_preview)}" alt="${escapeHtml(d.data.name)} preview" loading="lazy">
    ${d.data.x_client ? `<span class="scrim-tag">${escapeHtml(d.data.x_client)}</span>` : ''}
  </span>
  <span class="body">
    <h3>${escapeHtml(d.data.name)}</h3>
    <p>${escapeHtml(d.data.description)}</p>
    <span class="tags">${tags}</span>
    <span class="foot">
      <span class="year">${d.data.x_year ?? ''}</span>
      <span>
        <a href="/api/design-spec?slug=${escapeHtml(d.data.slug)}" download="design.md" onclick="event.stopPropagation()" style="text-decoration: none; border-bottom: 1px solid var(--line); margin-right: 12px;">↓ DESIGN.md</a>
        <span class="visit">view live ↗</span>
      </span>
    </span>
  </span>
</a>`;
}

// ── Vault → custom-template variable builders ───────────────────────────────
// Every {{SLOT}} in a generated layout is filled from the parsed vault docs at
// build time, so custom skins can never carry stale or hallucinated content.

function badgesHtml(list) {
  return (list ?? []).map((t) => `<span class="badge">${escapeHtml(t)}</span>`).join('');
}

function customProjectItem(p, i) {
  return fillTemplate(customLayouts.project_item, {
    URL: `/${p.data.sandbox_entry}`,
    NAME: escapeHtml(p.data.name),
    DESCRIPTION: escapeHtml(p.data.description),
    YEAR: p.data.x_year ?? '',
    TECH_BADGES: badgesHtml(p.data.x_tech),
    LOGO: p.data.x_logo ? `<img src="/${escapeHtml(p.data.x_logo)}" alt="${escapeHtml(p.data.name)} logo">` : '',
    INDEX: String(i + 1).padStart(2, '0'),
    REPO_URL: p.data.x_repo ? escapeHtml(p.data.x_repo) : '',
  });
}

function customDesignItem(d, i) {
  return fillTemplate(customLayouts.design_item, {
    URL: escapeHtml(d.data.x_link ?? `/${d.data.sandbox_entry}`),
    NAME: escapeHtml(d.data.name),
    DESCRIPTION: escapeHtml(d.data.description),
    YEAR: d.data.x_year ?? '',
    CLIENT: escapeHtml(d.data.x_client ?? ''),
    TAG_BADGES: badgesHtml(d.data.x_tags),
    PREVIEW: d.data.x_preview ? `/${escapeHtml(d.data.x_preview)}` : '',
  });
}

function customProjectList(list) {
  return customLayouts.project_item
    ? list.map(customProjectItem).join('\n')
    : `<ul class="index">\n${list.map(projectRow).join('\n')}\n</ul>`;
}

function customDesignList(list) {
  return customLayouts.design_item
    ? list.map(customDesignItem).join('\n')
    : `<div class="design-grid">\n${list.map(designCard).join('\n')}\n</div>`;
}

// Ensure the generator UI exists in the custom layer even if the model forgot
// the {{GENERATOR_FORM}} slot — otherwise you could never flip designs again
// from within the custom skin.
function ensureGeneratorForm(html) {
  return html.includes(GENERATOR_FORM) ? html : `${html}\n${GENERATOR_FORM}`;
}

for (const page of pages) {
  if (page.data.x_kind === 'theme') continue; // Skip compiling theme config files
  const sourcePath = 'vault/pages/' + relative(pagesDir, page.file);
  let content = null;
  
  if (page.data.slug === 'home') {
    const featured = projects.filter((p) => p.data.x_featured);
    // Headline lives in the vault (x_headline); *word* marks the accent swash.
    const headline = escapeHtml(page.data.x_headline ?? 'Software that *remembers* to whom it belongs.')
      .replace(/\*([^*]+)\*/g, '<span class="swash">$1</span>');
    const featuredCount = String(featured.length).padStart(2, '0');
    const defaultContent = `<section class="hero" style="padding-bottom: 2rem;">
  <span class="path reveal d1"><b>~</b>/vault/pages/home.md</span>
  <h1 class="display reveal d2">${headline}</h1>
  <p class="tagline reveal d3">${escapeHtml(page.data.x_tagline ?? '')}</p>
  <div class="prose reveal d4">${page.html}</div>
  <div class="reveal d4">${GENERATOR_FORM}</div>
</section>
<div class="kicker">
  <h2>Featured work</h2><span class="count">${featuredCount}</span>
  <span class="right"><a href="/projects.html">all projects →</a></span>
</div>
<ul class="index">
${featured.map(projectRow).join('\n')}
</ul>`;
    const customContent = customLayouts.home
      ? ensureGeneratorForm(fillTemplate(customLayouts.home, {
          HEADLINE: headline,
          TAGLINE: escapeHtml(page.data.x_tagline ?? ''),
          INTRO: page.html,
          FEATURED_PROJECTS: customProjectList(featured),
          FEATURED_COUNT: featuredCount,
          GENERATOR_FORM,
        }))
      : null;
    content = withCustomLayer(defaultContent, customContent);
  } else if (page.data.x_kind === 'project') {
    const badges = badgesHtml(page.data.x_tech);
    const repoLink = page.data.x_repo
      ? `<a href="${escapeHtml(page.data.x_repo)}">${escapeHtml(page.data.x_repo.replace('https://', ''))}</a>`
      : '';
    const projectLink = page.data.x_link
      ? `<a href="${escapeHtml(page.data.x_link)}">${escapeHtml(page.data.x_link.replace('https://', ''))}</a>`
      : '';
    const cells = [
      ['role', escapeHtml(page.data.x_role ?? '—')],
      ['year', String(page.data.x_year ?? '—')],
      ['stack', badges || '—'],
    ];
    if (repoLink) cells.push(['source', repoLink]);
    if (page.data.x_link && page.data.x_link !== page.data.x_repo) cells.push(['link', projectLink]);
    const defaultContent = `<section class="project-head">
  ${logoTile(page)}
  <div>
    <span class="path reveal d1" style="font-family:var(--mono);font-size:.75rem;color:var(--bone-dim)">~/${sourcePath}</span>
    <h1 class="display reveal d2" style="font-size:clamp(2.2rem,5vw,3.6rem)">${escapeHtml(page.data.name)}</h1>
    <p class="tagline reveal d3">${escapeHtml(page.data.description)}</p>
  </div>
</section>
<div class="meta-grid reveal d3">
${cells.map(([k, v]) => `  <div class="meta-cell"><span class="k">${k}</span><span class="v">${v}</span></div>`).join('\n')}
</div>
<div class="prose reveal d4">${page.html}</div>
${page.data.x_link ? `<a class="btn" href="${escapeHtml(page.data.x_link)}">visit ${escapeHtml(page.data.x_link.replace(/https?:\/\/(www\.)?/, '').replace(/\/$/, ''))} ↗</a>` : ''}
<br><a class="backlink" href="/projects.html">← cd ../projects</a>`;
    const customContent = customLayouts.project_detail
      ? fillTemplate(customLayouts.project_detail, {
          NAME: escapeHtml(page.data.name),
          DESCRIPTION: escapeHtml(page.data.description),
          ROLE: escapeHtml(page.data.x_role ?? '—'),
          YEAR: String(page.data.x_year ?? '—'),
          TECH_BADGES: badges || '—',
          REPO_LINK: repoLink || '—',
          PROJECT_LINK: projectLink || '—',
          LOGO: page.data.x_logo ? `<img src="/${escapeHtml(page.data.x_logo)}" alt="${escapeHtml(page.data.name)} logo">` : '',
          SOURCE_PATH: `~/${sourcePath}`,
          CONTENT: page.html,
          BACKLINK: `<a class="backlink" href="/projects.html">← cd ../projects</a>`,
        })
      : null;
    content = withCustomLayer(defaultContent, customContent);
  } else if (page.data.x_kind === 'design') {
    const tags = badgesHtml(page.data.x_tags);
    const cells = [
      ['role', escapeHtml(page.data.x_role ?? '—')],
      ['client', escapeHtml(page.data.x_client ?? '—')],
      ['year', String(page.data.x_year ?? '—')],
      ['tags', tags || '—'],
    ];
    const defaultContent = `<section class="hero" style="padding-bottom:0">
  <span class="path reveal d1"><b>~</b>/${sourcePath}</span>
  <h1 class="display reveal d2" style="font-size:clamp(2.2rem,5vw,3.6rem)">${escapeHtml(page.data.name)}</h1>
  <p class="tagline reveal d3">${escapeHtml(page.data.description)}</p>
</section>
<div class="design-hero-shot reveal d3">
  <img src="/${escapeHtml(page.data.x_preview)}" alt="${escapeHtml(page.data.name)} preview">
</div>
<div class="meta-grid reveal d3">
${cells.map(([k, v]) => `  <div class="meta-cell"><span class="k">${k}</span><span class="v">${v}</span></div>`).join('\n')}
</div>
<div class="prose reveal d4">${page.html}</div>
${page.data.x_link ? `<a class="btn" href="${escapeHtml(page.data.x_link)}" target="_blank" rel="noopener">visit ${escapeHtml(page.data.x_link.replace(/https?:\/\/(www\.)?/, '').replace(/\/$/, ''))} ↗</a>` : ''}
${page.data.slug?.startsWith('design-') ? `<a class="btn design-dl-inline" href="/api/design-spec?slug=${escapeHtml(page.data.slug)}" download="${escapeHtml(page.data.slug)}.md">↓ Download design.md</a>` : ''}
<br><a class="backlink" href="/designs.html">← cd ../designs</a>`;
    const customContent = customLayouts.design_detail
      ? fillTemplate(customLayouts.design_detail, {
          NAME: escapeHtml(page.data.name),
          DESCRIPTION: escapeHtml(page.data.description),
          CLIENT: escapeHtml(page.data.x_client ?? '—'),
          ROLE: escapeHtml(page.data.x_role ?? '—'),
          YEAR: String(page.data.x_year ?? '—'),
          TAG_BADGES: tags || '—',
          PREVIEW: page.data.x_preview ? `/${escapeHtml(page.data.x_preview)}` : '',
          LINK_URL: page.data.x_link ? escapeHtml(page.data.x_link) : '',
          SOURCE_PATH: `~/${sourcePath}`,
          CONTENT: page.html,
          BACKLINK: `<a class="backlink" href="/designs.html">← cd ../designs</a>`,
        })
      : null;
    content = withCustomLayer(defaultContent, customContent);
  } else {
    const defaultContent = `<section class="hero" style="padding-bottom:1rem">
  <span class="path reveal d1"><b>~</b>/${sourcePath}</span>
  <h1 class="display reveal d2" style="font-size:clamp(2.2rem,5vw,3.6rem)">${escapeHtml(page.data.name)}</h1>
</section>
<div class="prose reveal d3">${page.html}</div>`;
    const customContent = customLayouts.page
      ? fillTemplate(customLayouts.page, {
          NAME: escapeHtml(page.data.name),
          CONTENT: page.html,
          SOURCE_PATH: `~/${sourcePath}`,
        })
      : null;
    content = withCustomLayer(defaultContent, customContent);
  }

  const outPath = join(outDir, page.data.sandbox_entry);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(
    outPath,
    layout({
      title: page.data.title,
      description: page.data.description,
      nav,
      content,
      activeSlug: page.data.slug,
      sourcePath,
    })
  );
}

// Projects index page (derived — a projection of the project docs, not a vault doc).
const projectsDefault = `<section class="hero" style="padding-bottom:1rem">
  <span class="path reveal d1"><b>~</b>/vault/pages/projects/</span>
  <h1 class="display reveal d2" style="font-size:clamp(2.2rem,5vw,3.6rem)">Projects</h1>
</section>
<ul class="index reveal d3">
${projects.map(projectRow).join('\n')}
</ul>`;
const projectsCustom = customLayouts.projects_index
  ? fillTemplate(customLayouts.projects_index, {
      PROJECT_LIST: customProjectList(projects),
      PROJECT_COUNT: String(projects.length).padStart(2, '0'),
    })
  : null;

await writeFile(
  join(outDir, 'projects.html'),
  layout({
    title: 'Projects — Greg Iteen',
    description: 'All projects by Greg Iteen.',
    nav,
    activeSlug: '_projects',
    sourcePath: 'vault/pages/projects/',
    content: withCustomLayer(projectsDefault, projectsCustom),
  })
);

// Designs index page (derived — a projection of the design docs, not a vault doc).
const designsDefault = `<section class="hero" style="padding-bottom:1rem">
  <span class="path reveal d1"><b>~</b>/vault/pages/designs/</span>
  <h1 class="display reveal d2" style="font-size:clamp(2.2rem,5vw,3.6rem)">Designs</h1>
  <p class="tagline reveal d3">Live previews — click through to the real, deployed site.</p>
</section>
<div class="design-grid reveal d3">
${designs.map(designCard).join('\n')}
</div>`;
const designsCustom = customLayouts.designs_index
  ? fillTemplate(customLayouts.designs_index, {
      DESIGN_CARDS: customDesignList(designs),
      DESIGN_COUNT: String(designs.length).padStart(2, '0'),
      GENERATOR_FORM: '',
    })
  : null;

await writeFile(
  join(outDir, 'designs.html'),
  layout({
    title: 'Designs — Greg Iteen',
    description: 'Visual design work by Greg Iteen — event pages, brand one-pagers, and pitch decks.',
    nav,
    activeSlug: '_designs',
    sourcePath: 'vault/pages/designs/',
    content: withCustomLayer(designsDefault, designsCustom),
  })
);

// ─── Copy static files (splash, verify, generated assets) ──────────────────
const staticDir = join(root, 'static');
try {
  for (const f of await readdir(staticDir)) {
    await cp(join(staticDir, f), join(outDir, f), { force: true });
  }
} catch {}
// Ensure generated assets survive rebuilds
const genAssetsDir = join(outDir, 'assets');
await mkdir(genAssetsDir, { recursive: true });
try { await cp(join(root, 'static', 'gi-logo.png'), join(genAssetsDir, 'gi-logo.png'), { force: true }); } catch {}

console.log(`Built ${pages.length + 2} pages → ${outDir}`);

// ─── Auto-build all designs ──────────────────────────────────────────────────
import { execSync } from 'child_process';
if (!targetDesign) {
  for (const d of aiDesigns) {
    const slug = d.data.slug.replace('design-', '');
    console.log(`Building design layer: ${slug}`);
    try {
      execSync(`node scripts/build-site.mjs --design ${slug}`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`Failed to build design ${slug}:`, e.message);
    }
  }
}
