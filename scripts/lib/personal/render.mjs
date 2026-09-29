/**
 * Personal-site renderer. Turns vault page documents into the static site:
 * every word comes from a document; this file only supplies structure.
 *
 *   renderPersonalSite(pages) -> Map<relative output path, html>
 *
 * `pages` are { data, html } as parsed by build-site.mjs (`html` is the
 * document body already rendered from Markdown).
 */
import { DIAGRAMS } from './diagrams.mjs';

const esc = (s) => String(s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const SITE = 'https://gregiteen.xyz';
const FONTS = 'https://fonts.googleapis.com/css2?family=Anybody:wdth,wght@50..150,100..900&family=Hanken+Grotesk:wght@400;500;600&family=Martian+Mono:wdth,wght@75..112.5,300..600&display=swap';

const byOrder = (a, b) => (a.data.x_order ?? 99) - (b.data.x_order ?? 99);
const kind = (pages, k) => pages.filter((p) => p.data.x_kind === k);
const list = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const isoDate = (v) => String(v ?? '').slice(0, 10);

/**
 * Headline split into words and characters so each glyph can animate its own
 * width. `*word*` marks the emphasised word (kept from the vault's own markup).
 */
const plain = (text) => String(text).replaceAll('*', '');
function splitHeadline(text) {
  let i = 0;
  return String(text).split(' ').map((token) => {
    const emphasised = /^\*.*\*[^\w]*$/.test(token) || /^\*[^*]+\*/.test(token);
    const word = plain(token);
    const chars = [...word].map((c) => `<span class="ch" style="--i:${i++}" aria-hidden="true">${esc(c)}</span>`).join('');
    i += 1;
    return `<span class="w${emphasised ? ' em' : ''}">${chars}</span>`;
  }).join(' ');
}

function shell({ title, description, path, page, body, nav }) {
  const canonical = `${SITE}${path === '/index.html' ? '/' : path}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#061f3a">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${esc(canonical)}">
<link rel="icon" type="image/png" href="/assets/favicon.png">
<script>document.documentElement.classList.add('js')</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="/assets/personal/site.css">
</head>
<body data-page="${esc(page)}">
<a class="skip" href="#main">Skip to content</a>
<canvas id="field" aria-hidden="true"></canvas>
<div class="progress" aria-hidden="true"></div>
<header class="bar">
  <a class="mark" href="/" aria-label="Greg Iteen, home">greg<i class="dot"></i>iteen</a>
  <nav aria-label="Primary">${nav}</nav>
</header>
<main id="main">
${body}
</main>
<footer class="foot">
  <p class="mono">Built from a Markdown vault and validated by the SSSS engine. <a href="https://github.com/gregiteen/portfolio-site">Source</a></p>
  <p class="mono">&copy; Greg Iteen</p>
</footer>
<div class="cursor" aria-hidden="true"></div>
<script src="/assets/personal/site.js" defer></script>
</body>
</html>
`;
}

function navHtml(active) {
  const items = [['/#ideas', 'Ideas', 'home'], ['/#deployed', 'Deployed', 'home'], ['/#open-source', 'Open source', 'home'], ['/about.html', 'About', 'about'], ['/contact.html', 'Contact', 'contact']];
  return items.map(([href, label, key]) => `<a href="${href}"${active === key && !href.includes('#') ? ' aria-current="page"' : ''}>${label}</a>`).join('');
}

const arrow = '<svg class="arrow" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"/></svg>';

function ideaPlate(p) {
  const d = p.data;
  const diagram = DIAGRAMS[d.x_diagram] || '';
  const more = d.x_project ? `<a class="more" href="/projects/${esc(d.x_project)}.html">Read the project ${arrow}</a>` : '';
  return `<article class="plate" data-reveal>
  <div class="diagram" data-diagram>${diagram}</div>
  <div class="plate-text">
    <h3>${esc(d.title)}</h3>
    ${p.html}
    ${more}
  </div>
</article>`;
}

function siteRow(p) {
  const d = p.data;
  const stack = list(d.x_stack).map((t) => `<li>${esc(t)}</li>`).join('');
  return `<li class="site" data-reveal>
  <a href="${esc(d.x_url)}" rel="noopener" data-preview="/assets/sites/${esc(d.x_slug)}.jpg" aria-label="${esc(d.title)}, opens ${esc(d.x_host)}">
    <img class="site-shot" src="/assets/sites/${esc(d.x_slug)}.jpg" alt="" loading="lazy" width="1440" height="900">
    <span class="site-head"><span class="host">${esc(d.x_host)}</span>${arrow}</span>
    <span class="site-desc">${esc(d.description)}</span>
    <span class="site-meta">
      <span class="status"><i class="live"></i>HTTP ${esc(d.x_status)} on ${esc(isoDate(d.x_verified))}</span>
      <span>${esc(d.x_year)} &middot; ${esc(d.x_role)}</span>
    </span>
    <ul class="tags">${stack}</ul>
  </a>
</li>`;
}

function ossRow(p) {
  const d = p.data;
  const tags = list(d.x_tags).map((t) => `<li>${esc(t)}</li>`).join('');
  const npm = d.x_npm ? `<a href="${esc(d.x_npm_url)}" rel="noopener">npm</a>` : '';
  const install = d.x_install ? `<button type="button" class="copy" data-copy="${esc(d.x_install)}" aria-label="Copy install command for ${esc(d.title)}"><code>${esc(d.x_install)}</code><span class="copied" aria-hidden="true">Copied</span></button>` : '';
  const project = d.x_project ? `<a href="/projects/${esc(d.x_project)}.html">Write-up</a>` : '';
  return `<li class="oss" data-reveal>
  <div class="oss-main">
    <h3><a href="${esc(d.x_repo)}" rel="noopener">${esc(d.title)}</a></h3>
    <p>${esc(d.description)}</p>
    <ul class="tags">${tags}<li>${esc(d.x_language)}</li></ul>
  </div>
  <div class="oss-side">
    ${install}
    <span class="links"><a href="${esc(d.x_repo)}" rel="noopener">Source</a>${npm}${project}</span>
    <span class="mono dim">Checked ${esc(isoDate(d.x_verified))}</span>
  </div>
</li>`;
}

function projectRow(p) {
  const d = p.data;
  return `<li data-reveal><a href="/${esc(d.sandbox_entry)}"><span class="p-year mono">${esc(d.x_year)}</span><span class="p-name">${esc(d.name)}</span><span class="p-role">${esc(d.x_role)}</span>${arrow}</a></li>`;
}

function home(pages) {
  const h = pages.find((p) => p.data.slug === 'home');
  const ideas = kind(pages, 'idea').sort(byOrder);
  const sites = kind(pages, 'deployed-site').sort(byOrder);
  const oss = kind(pages, 'open-source').sort(byOrder);
  const projects = kind(pages, 'project').sort((a, b) => (b.data.x_year ?? 0) - (a.data.x_year ?? 0) || String(a.data.name).localeCompare(a.data.name));
  const headline = h.data.x_headline;
  const body = `<section class="hero" aria-labelledby="hero-title">
  <p class="eyebrow mono">Greg Iteen &middot; software</p>
  <h1 id="hero-title" aria-label="${esc(plain(headline))}">${splitHeadline(headline)}</h1>
  <p class="tagline">${esc(h.data.x_tagline)}</p>
  <div class="intro">${h.html}</div>
  <a class="scroll" href="#ideas" aria-label="Scroll to ideas"><span></span></a>
</section>

<section id="ideas" class="block" aria-labelledby="ideas-title">
  <header class="block-head" data-reveal><p class="eyebrow mono">Ideas</p><h2 id="ideas-title">Three claims the software makes</h2></header>
  <div class="plates">${ideas.map(ideaPlate).join('\n')}</div>
</section>

<section id="deployed" class="block" aria-labelledby="deployed-title">
  <header class="block-head" data-reveal><p class="eyebrow mono">Deployed</p><h2 id="deployed-title">Running now</h2><p class="lede">Each status below comes from a live request made on the date shown.</p></header>
  <ul class="sites">${sites.map(siteRow).join('\n')}</ul>
</section>

<section id="open-source" class="block" aria-labelledby="oss-title">
  <header class="block-head" data-reveal><p class="eyebrow mono">Open source</p><h2 id="oss-title">Published and public</h2><p class="lede">Repositories I wrote, public on GitHub. Forks of other people's projects are not listed.</p></header>
  <ul class="osslist">${oss.map(ossRow).join('\n')}</ul>
</section>

<section id="projects" class="block" aria-labelledby="projects-title">
  <header class="block-head" data-reveal><p class="eyebrow mono">Write-ups</p><h2 id="projects-title">How the larger systems are built</h2></header>
  <ul class="projects">${projects.map(projectRow).join('\n')}</ul>
</section>

<section class="close block" aria-labelledby="close-title">
  <p class="eyebrow mono" data-reveal>Contact</p>
  <h2 id="close-title" class="visually-hidden">Email</h2>
  <a class="big-mail" href="mailto:me@gregiteen.xyz" data-magnet>me@gregiteen.xyz</a>
</section>`;
  return shell({ title: h.data.title, description: h.data.description, path: '/index.html', page: 'home', body, nav: navHtml('home') });
}

function projectPage(p, all) {
  const d = p.data;
  const stack = list(d.x_tech).map((t) => `<li>${esc(t)}</li>`).join('');
  const links = [d.x_link && d.x_link !== d.x_repo ? `<a href="${esc(d.x_link)}" rel="noopener">Visit ${arrow}</a>` : '', d.x_repo ? `<a href="${esc(d.x_repo)}" rel="noopener">Source ${arrow}</a>` : ''].join('');
  const idx = all.findIndex((x) => x.data.slug === d.slug);
  const next = all[(idx + 1) % all.length];
  const body = `<article class="project">
  <p class="eyebrow mono"><a href="/#projects">Write-ups</a></p>
  <h1 class="pt" aria-label="${esc(d.name)}">${splitHeadline(d.name)}</h1>
  <p class="tagline">${esc(d.description)}</p>
  <dl class="facts">
    <div><dt class="mono">Year</dt><dd>${esc(d.x_year)}</dd></div>
    <div><dt class="mono">Role</dt><dd>${esc(d.x_role)}</dd></div>
    <div><dt class="mono">Stack</dt><dd><ul class="tags">${stack}</ul></dd></div>
  </dl>
  <div class="prose" data-reveal>${p.html}</div>
  <p class="links-row" data-reveal>${links}</p>
  <a class="next" href="/${esc(next.data.sandbox_entry)}" data-reveal><span class="mono">Next write-up</span><span class="next-name">${esc(next.data.name)}</span>${arrow}</a>
</article>`;
  return shell({ title: `${d.name} — Greg Iteen`, description: d.description, path: `/${d.sandbox_entry}`, page: 'project', body, nav: navHtml('') });
}

function about(pages) {
  const a = pages.find((p) => p.data.slug === 'about');
  const d = a.data;
  const body = `<article class="about">
  <p class="eyebrow mono">About</p>
  <h1 class="pt" aria-label="About">${splitHeadline('About')}</h1>
  <div class="about-grid">
    <figure class="portrait" data-reveal><img src="/assets/greg-portrait.jpg" alt="Greg Iteen" width="640" height="800" loading="eager"></figure>
    <div class="prose" data-reveal>${a.html}
      <p class="find mono">Elsewhere</p>
      <p class="elsewhere">
        <a class="ext" href="${esc(d.x_linkedin)}" rel="me noopener">LinkedIn ${arrow}</a>
        <a class="ext" href="${esc(d.x_github)}" rel="me noopener">GitHub ${arrow}</a>
      </p>
    </div>
  </div>
</article>`;
  return shell({ title: d.title, description: d.description, path: '/about.html', page: 'about', body, nav: navHtml('about') });
}

function contact(pages) {
  const c = pages.find((p) => p.data.slug === 'contact');
  const body = `<article class="about">
  <p class="eyebrow mono">Contact</p>
  <h1 class="pt" aria-label="Contact">${splitHeadline('Contact')}</h1>
  <div class="prose" data-reveal>${c.html}</div>
</article>`;
  return shell({ title: c.data.title, description: c.data.description, path: '/contact.html', page: 'contact', body, nav: navHtml('contact') });
}

export function renderPersonalSite(pages) {
  const out = new Map();
  out.set('index.html', home(pages));
  out.set('about.html', about(pages));
  out.set('contact.html', contact(pages));
  const projects = kind(pages, 'project').sort((a, b) => (b.data.x_year ?? 0) - (a.data.x_year ?? 0) || String(a.data.name).localeCompare(String(b.data.name)));
  for (const p of projects) out.set(p.data.sandbox_entry, projectPage(p, projects));
  return out;
}
