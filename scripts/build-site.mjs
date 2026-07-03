#!/usr/bin/env node
// Build the portfolio static site from the SSSS vault.
// The vault is the source of truth: every page on the site is a `type: page`
// document under vault/pages/, parsed with the canonical @ssss/cli frontmatter
// parser. Output goes to dist/site/.
import { readdir, readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDocument } from '@ssss/cli/frontmatter';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pagesDir = join(root, 'vault', 'pages');
const assetsDir = join(root, 'assets');
const outDir = join(root, 'dist', 'site');

async function collectMarkdown(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await collectMarkdown(p)));
    else if (entry.name.endsWith('.md')) out.push(p);
  }
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
  --ink: #12100d;
  --ink-2: #1a1713;
  --line: #2e2a24;
  --bone: #ece5d8;
  --bone-dim: #a89f8d;
  --accent: #ff5a1f;
  --accent-soft: #ffb86b;
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
}
/* grain overlay */
body::after {
  content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 999;
  opacity: .5; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.16'/%3E%3C/svg%3E");
}
a { color: inherit; text-decoration: none; }
::selection { background: var(--accent); color: var(--ink); }

.frame { max-width: 1100px; margin: 0 auto; padding: 0 clamp(1.2rem, 4vw, 3rem); }

/* ---------- nav ---------- */
header {
  border-bottom: 1px solid var(--line);
  position: sticky; top: 0; background: color-mix(in srgb, var(--ink) 88%, transparent);
  backdrop-filter: blur(10px); z-index: 10;
}
nav { display: flex; align-items: center; gap: 1.75rem; padding: 1rem 0; }
nav .brand {
  font-family: var(--serif); font-weight: 600; font-size: 1.25rem; letter-spacing: .01em;
  margin-right: auto;
}
nav .brand em { color: var(--accent); font-style: normal; }
nav a.item {
  font-family: var(--mono); font-size: .78rem; color: var(--bone-dim);
  transition: color .18s;
}
nav a.item::before { content: "./"; color: var(--line); }
nav a.item:hover, nav a.item.active { color: var(--accent); }

/* ---------- hero ---------- */
.hero { padding: clamp(3.5rem, 9vw, 7rem) 0 clamp(2.5rem, 6vw, 4.5rem); position: relative; }
.hero .path {
  font-family: var(--mono); font-size: .75rem; color: var(--bone-dim);
  display: inline-block; border: 1px solid var(--line); border-radius: 999px;
  padding: .25rem .8rem; margin-bottom: 2rem;
}
.hero .path b { color: var(--accent); font-weight: 400; }
h1.display {
  font-family: var(--serif); font-weight: 500; font-size: clamp(2.6rem, 7vw, 5.2rem);
  line-height: 1.02; letter-spacing: -0.02em; margin: 0 0 1.4rem; max-width: 18ch;
}
h1.display .swash { font-style: italic; color: var(--accent); }
.hero .tagline {
  font-size: clamp(1.05rem, 2vw, 1.3rem); color: var(--bone-dim);
  max-width: 52ch; margin: 0 0 1.2rem;
}
.reveal { opacity: 0; transform: translateY(18px); animation: rise .7s cubic-bezier(.2,.7,.2,1) forwards; }
.reveal.d1 { animation-delay: .08s } .reveal.d2 { animation-delay: .18s }
.reveal.d3 { animation-delay: .3s } .reveal.d4 { animation-delay: .44s }
@keyframes rise { to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .reveal { animation: none; opacity: 1; transform: none; } }

/* ---------- prose ---------- */
.prose { max-width: 64ch; }
.prose p { color: color-mix(in srgb, var(--bone) 88%, transparent); }
.prose h2 {
  font-family: var(--serif); font-weight: 500; font-size: 1.7rem; letter-spacing: -.01em;
  margin: 2.6rem 0 .8rem; padding-top: 1.6rem; border-top: 1px solid var(--line);
}
.prose h2::before { content: "## "; font-family: var(--mono); font-size: .8rem; color: var(--accent); vertical-align: .35em; }
.prose ul { padding-left: 1.1rem; }
.prose li { margin: .45rem 0; color: color-mix(in srgb, var(--bone) 88%, transparent); }
.prose li::marker { color: var(--accent); }
.prose a { color: var(--accent-soft); border-bottom: 1px solid color-mix(in srgb, var(--accent-soft) 40%, transparent); }
.prose a:hover { color: var(--accent); border-color: var(--accent); }
.prose strong { color: var(--bone); }
code {
  font-family: var(--mono); font-size: .84em; color: var(--accent-soft);
  background: var(--ink-2); border: 1px solid var(--line); border-radius: 5px; padding: .1em .4em;
}

/* ---------- section heading ---------- */
.kicker {
  display: flex; align-items: baseline; gap: 1rem;
  margin: clamp(2.5rem, 6vw, 4.5rem) 0 0; padding-bottom: .8rem; border-bottom: 1px solid var(--bone);
}
.kicker h2 { font-family: var(--serif); font-weight: 500; font-size: clamp(1.6rem, 3.4vw, 2.4rem); margin: 0; letter-spacing: -.01em; }
.kicker .count { font-family: var(--mono); font-size: .78rem; color: var(--accent); }
.kicker .right { margin-left: auto; font-family: var(--mono); font-size: .75rem; color: var(--bone-dim); }
.kicker .right a:hover { color: var(--accent); }

/* ---------- project index rows ---------- */
.index { list-style: none; margin: 0; padding: 0; }
.row {
  display: grid; grid-template-columns: 3.2rem 64px 1fr auto; gap: 1.4rem; align-items: center;
  padding: 1.5rem 0; border-bottom: 1px solid var(--line);
  position: relative; transition: background .2s;
}
.row:hover { background: linear-gradient(90deg, color-mix(in srgb, var(--accent) 7%, transparent), transparent 60%); }
.row .num { font-family: var(--mono); font-size: .78rem; color: var(--bone-dim); }
.row:hover .num { color: var(--accent); }
.logo-tile {
  width: 64px; height: 64px; border-radius: 14px; background: var(--bone);
  display: grid; place-items: center; overflow: hidden; flex: none;
  box-shadow: 0 0 0 1px var(--line); transition: transform .25s cubic-bezier(.2,.7,.2,1);
}
.row:hover .logo-tile { transform: rotate(-4deg) scale(1.06); }
.logo-tile img { width: 74%; height: 74%; object-fit: contain; }
.logo-tile.cover { background: var(--ink-2); }
.logo-tile.cover img { width: 100%; height: 100%; object-fit: cover; }
.row .body h3 { font-family: var(--serif); font-weight: 500; font-size: 1.45rem; margin: 0 0 .15rem; letter-spacing: -.01em; }
.row .body p { margin: 0 0 .4rem; color: var(--bone-dim); font-size: .95rem; max-width: 58ch; }
.badges { display: flex; flex-wrap: wrap; gap: .4rem; }
.badge {
  font-family: var(--mono); font-size: .68rem; color: var(--bone-dim);
  border: 1px solid var(--line); border-radius: 999px; padding: .12rem .6rem;
}
.row .aside { text-align: right; display: flex; flex-direction: column; gap: .5rem; align-items: flex-end; }
.row .year { font-family: var(--mono); font-size: .75rem; color: var(--bone-dim); }
.row .arrow { color: var(--accent); font-size: 1.3rem; transform: translateX(-6px); opacity: 0; transition: all .25s; }
.row:hover .arrow { transform: none; opacity: 1; }
.row > a.cover { position: absolute; inset: 0; z-index: 1; }
.row .aside a.src { position: relative; z-index: 2; }
.src {
  font-family: var(--mono); font-size: .72rem; color: var(--bone-dim);
  border: 1px solid var(--line); border-radius: 999px; padding: .22rem .7rem; transition: all .18s;
}
.src:hover { color: var(--ink); background: var(--accent); border-color: var(--accent); }
@media (max-width: 640px) {
  .row { grid-template-columns: 48px 1fr; }
  .row .num, .row .aside { display: none; }
  .logo-tile { width: 48px; height: 48px; border-radius: 10px; }
}

/* ---------- project page ---------- */
.project-head { padding: clamp(3rem, 7vw, 5rem) 0 0; display: flex; gap: 2rem; align-items: flex-start; }
.project-head .logo-tile { width: 92px; height: 92px; border-radius: 20px; }
.project-head .logo-tile:hover { transform: rotate(-4deg) scale(1.04); }
.meta-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1px;
  background: var(--line); border: 1px solid var(--line); border-radius: 12px; overflow: hidden;
  margin: 2.2rem 0;
}
.meta-cell { background: var(--ink-2); padding: .9rem 1.1rem; }
.meta-cell .k { font-family: var(--mono); font-size: .66rem; color: var(--bone-dim); text-transform: uppercase; letter-spacing: .08em; display: block; margin-bottom: .25rem; }
.meta-cell .v { font-size: .92rem; overflow-wrap: anywhere; }
.meta-cell .v a { color: var(--accent-soft); }
.meta-cell .v a:hover { color: var(--accent); }
.btn {
  display: inline-flex; align-items: center; gap: .5rem;
  font-family: var(--mono); font-size: .8rem; color: var(--ink);
  background: var(--accent); border-radius: 999px; padding: .55rem 1.2rem; margin-top: 1.4rem;
  transition: transform .18s, box-shadow .18s;
}
.btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px color-mix(in srgb, var(--accent) 35%, transparent); }
.backlink { font-family: var(--mono); font-size: .78rem; color: var(--bone-dim); display: inline-block; margin-top: 2.5rem; }
.backlink:hover { color: var(--accent); }

/* ---------- footer ---------- */
footer { border-top: 1px solid var(--line); margin-top: clamp(3rem, 8vw, 6rem); }
footer .frame { display: flex; flex-wrap: wrap; gap: 1rem; padding-top: 1.4rem; padding-bottom: 2.2rem; align-items: baseline; }
footer p { margin: 0; font-family: var(--mono); font-size: .72rem; color: var(--bone-dim); }
footer .gh { margin-left: auto; }
footer a { color: var(--accent-soft); } footer a:hover { color: var(--accent); }
main { min-height: 60vh; }
`;

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400..700;1,400..700&family=Archivo:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">`;

const FAVICON = `<link rel="icon" type="image/svg+xml" href="/assets/logos/ssss.svg">`;

function layout({ title, description, nav, content, activeSlug, sourcePath }) {
  const navLinks = nav
    .map(
      (p) =>
        `<a class="item${p.data.slug === activeSlug ? ' active' : ''}" href="/${p.data.sandbox_entry}">${escapeHtml(p.data.name.toLowerCase())}</a>`
    )
    .join('\n      ');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
${FONTS}
${FAVICON}
<style>${STYLE}</style>
</head>
<body>
<header>
  <div class="frame">
    <nav>
      <a class="brand" href="/index.html">greg<em>.</em>iteen</a>
      ${navLinks}
      <a class="item" href="https://github.com/gregiteen">github</a>
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
</body>
</html>
`;
}

function logoTile(p) {
  const cls = p.data.x_logo_style === 'cover' ? 'logo-tile cover' : 'logo-tile';
  return p.data.x_logo
    ? `<span class="${cls}"><img src="/${escapeHtml(p.data.x_logo)}" alt="${escapeHtml(p.data.name)} logo"></span>`
    : `<span class="logo-tile"></span>`;
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

const files = await collectMarkdown(pagesDir);
const pages = [];
for (const file of files) {
  const doc = parseDocument(await readFile(file, 'utf8'));
  if (doc.data.type !== 'page') continue;
  pages.push({ file, data: doc.data, html: renderMarkdown(doc.body) });
}

const sections = pages
  .filter((p) => p.data.x_kind === 'section')
  .sort((a, b) => (a.data.x_nav_order ?? 99) - (b.data.x_nav_order ?? 99));
const projects = pages
  .filter((p) => p.data.x_kind === 'project')
  .sort((a, b) => (b.data.x_year ?? 0) - (a.data.x_year ?? 0) || a.data.name.localeCompare(b.data.name));
const navPages = [...sections.filter((p) => p.data.slug !== 'home'), { data: { slug: '_projects', name: 'projects', sandbox_entry: 'projects.html' } }].sort(
  (a, b) => (a.data.slug === '_projects' ? 0 : 1) - (b.data.slug === '_projects' ? 0 : 1)
);
// nav order: projects, about, contact
const nav = [
  { data: { slug: '_projects', name: 'projects', sandbox_entry: 'projects.html' } },
  ...sections.filter((p) => p.data.slug !== 'home'),
];

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await cp(assetsDir, join(outDir, 'assets'), { recursive: true });

for (const page of pages) {
  const sourcePath = 'vault/pages/' + relative(pagesDir, page.file);
  let content;
  if (page.data.slug === 'home') {
    const featured = projects.filter((p) => p.data.x_featured);
    content = `<section class="hero">
  <span class="path reveal d1"><b>~</b>/vault/pages/home.md</span>
  <h1 class="display reveal d2">Software that <span class="swash">remembers</span> who it belongs to.</h1>
  <p class="tagline reveal d3">${escapeHtml(page.data.x_tagline ?? '')}</p>
  <div class="prose reveal d4">${page.html}</div>
</section>
<div class="kicker">
  <h2>Featured work</h2><span class="count">${String(featured.length).padStart(2, '0')}</span>
  <span class="right"><a href="/projects.html">all projects →</a></span>
</div>
<ul class="index">
${featured.map(projectRow).join('\n')}
</ul>`;
  } else if (page.data.x_kind === 'project') {
    const badges = (page.data.x_tech ?? []).map((t) => `<span class="badge">${escapeHtml(t)}</span>`).join(' ');
    const cells = [
      ['role', escapeHtml(page.data.x_role ?? '—')],
      ['year', String(page.data.x_year ?? '—')],
      ['stack', badges || '—'],
    ];
    if (page.data.x_repo)
      cells.push(['source', `<a href="${escapeHtml(page.data.x_repo)}">${escapeHtml(page.data.x_repo.replace('https://', ''))}</a>`]);
    if (page.data.x_link && page.data.x_link !== page.data.x_repo)
      cells.push(['link', `<a href="${escapeHtml(page.data.x_link)}">${escapeHtml(page.data.x_link.replace('https://', ''))}</a>`]);
    content = `<section class="project-head">
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
  } else {
    content = `<section class="hero" style="padding-bottom:1rem">
  <span class="path reveal d1"><b>~</b>/${sourcePath}</span>
  <h1 class="display reveal d2" style="font-size:clamp(2.2rem,5vw,3.6rem)">${escapeHtml(page.data.name)}</h1>
</section>
<div class="prose reveal d3">${page.html}</div>`;
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
await writeFile(
  join(outDir, 'projects.html'),
  layout({
    title: 'Projects — Greg Iteen',
    description: 'All projects by Greg Iteen.',
    nav,
    activeSlug: '_projects',
    sourcePath: 'vault/pages/projects/',
    content: `<section class="hero" style="padding-bottom:1rem">
  <span class="path reveal d1"><b>~</b>/vault/pages/projects/</span>
  <h1 class="display reveal d2" style="font-size:clamp(2.2rem,5vw,3.6rem)">Projects</h1>
</section>
<ul class="index reveal d3">
${projects.map(projectRow).join('\n')}
</ul>`,
  })
);

console.log(`Built ${pages.length + 1} pages → ${outDir}`);
