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

function shell({ title, description, path, page, body, nav, scripts = [] }) {
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
  <p class="mono">Compiled from a Markdown vault and validated by the SSSS engine. <a href="https://github.com/gregiteen/portfolio-site">Source</a></p>
  <p class="mono">&copy; Greg Iteen</p>
</footer>
<div class="cursor" aria-hidden="true"></div>
<script src="/assets/personal/site.js" defer></script>${scripts.map((s) => `\n<script src="${esc(s)}" defer></script>`).join('')}
</body>
</html>
`;
}

function navHtml(active) {
  const items = [['/#ideas', 'Principles', 'home'], ['/#deployed', 'Production', 'home'], ['/#open-source', 'Source', 'home'], ['/#projects', 'Write-ups', 'home'], ['/about.html', 'About', 'about']];
  const links = items.map(([href, label, key]) => `<a href="${href}"${active === key && !href.includes('#') ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  return `${links}<a class="nav-cta" href="/contact.html#brief"${active === 'contact' ? ' aria-current="page"' : ''}>Start a brief</a>`;
}

const arrow = '<svg class="arrow" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"/></svg>';

function ideaPlate(p) {
  const d = p.data;
  const diagram = DIAGRAMS[d.x_diagram] || '';
  const more = d.x_project ? `<a class="more" href="/projects/${esc(d.x_project)}.html">Read the write-up ${arrow}</a>` : '';
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
  <p class="eyebrow mono">Greg Iteen &middot; systems engineering</p>
  <h1 id="hero-title" aria-label="${esc(plain(headline))}">${splitHeadline(headline)}</h1>
  <p class="tagline">${esc(h.data.x_tagline)}</p>
  <div class="intro">${h.html}</div>
  <p class="hero-actions"><a class="cta" href="/contact.html#brief" data-magnet>Start a brief ${arrow}</a><a class="more" href="#projects">Read the write-ups ${arrow}</a></p>
  <a class="scroll" href="#ideas" aria-label="Scroll to the principles"><span></span></a>
</section>

<section id="ideas" class="block" aria-labelledby="ideas-title">
  <header class="block-head" data-reveal><p class="eyebrow mono">Principles</p><h2 id="ideas-title">Principles the software enforces</h2><p class="lede">Each principle below is implemented in running code and specified in writing, so it can be verified rather than taken on trust.</p></header>
  <div class="plates">${ideas.map(ideaPlate).join('\n')}</div>
</section>

<section id="deployed" class="block" aria-labelledby="deployed-title">
  <header class="block-head" data-reveal><p class="eyebrow mono">Production</p><h2 id="deployed-title">Systems in production</h2><p class="lede">Each status below records a live request made on the date shown.</p></header>
  <ul class="sites">${sites.map(siteRow).join('\n')}</ul>
</section>

<section id="open-source" class="block" aria-labelledby="oss-title">
  <header class="block-head" data-reveal><p class="eyebrow mono">Source</p><h2 id="oss-title">Published source</h2><p class="lede">Repositories I authored that are public on GitHub. Forks are excluded; private work is described in the write-ups.</p></header>
  <ul class="osslist">${oss.map(ossRow).join('\n')}</ul>
</section>

<section id="projects" class="block" aria-labelledby="projects-title">
  <header class="block-head" data-reveal><p class="eyebrow mono">Write-ups</p><h2 id="projects-title">Architecture, explained</h2><p class="lede">Long-form accounts of the problem each system addresses, the model it adopts and the mechanisms that enforce it.</p></header>
  <ul class="projects">${projects.map(projectRow).join('\n')}</ul>
</section>

<section class="close block" aria-labelledby="close-title">
  <p class="eyebrow mono" data-reveal>Engagements</p>
  <h2 id="close-title" data-reveal>Describe the system you intend to build.</h2>
  <p class="lede" data-reveal>Seven questions, about two minutes. Every brief receives a personal reply.</p>
  <a class="big-mail" href="/contact.html#brief" data-magnet>Start a brief</a>
  <p class="mono dim close-alt" data-reveal>Or write to <a href="mailto:me@gregiteen.xyz">me@gregiteen.xyz</a></p>
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

/**
 * The project brief: one question per screen when scripting is available
 * (assets/personal/brief.js), a plain form that posts to /api/lead otherwise.
 * Questions come from `x_brief` on the contact document.
 */
const KEYS = 'ABCDEFGHIJ';
function briefStep(q, n, total) {
  const num = `<span class="tf-n mono" aria-hidden="true">${String(n).padStart(2, '0')}</span>`;
  const help = q.help ? `<p class="tf-help" id="h-${esc(q.id)}">${esc(q.help)}</p>` : '';
  const described = q.help ? ` aria-describedby="h-${esc(q.id)}"` : '';
  let control = '';
  if (q.kind === 'choice') {
    control = `<div class="tf-choices">${(q.options || []).map((o, i) => `<label class="tf-choice"><input type="radio" name="${esc(q.id)}" value="${esc(o.value)}" required><span class="tf-key mono" aria-hidden="true">${KEYS[i]}</span><span class="tf-label">${esc(o.label)}</span></label>`).join('')}</div>`;
    return `<fieldset class="tf-step" data-step="${n}" data-kind="choice"${described}><legend>${num}${esc(q.prompt)}</legend>${help}${control}</fieldset>`;
  }
  if (q.kind === 'long') {
    control = `<textarea id="f-${esc(q.id)}" name="${esc(q.id)}" rows="5" minlength="${esc(q.min || 0)}" maxlength="${esc(q.max || 2000)}" placeholder="${esc(q.placeholder || '')}" required${described}></textarea>`;
    return `<div class="tf-step" data-step="${n}" data-kind="long" role="group" aria-labelledby="l-${esc(q.id)}"><label class="tf-q" id="l-${esc(q.id)}" for="f-${esc(q.id)}">${num}${esc(q.prompt)}</label>${help}${control}</div>`;
  }
  control = (q.fields || []).map((f) => f.type === 'checkbox'
    ? `<label class="tf-check"><input type="checkbox" name="${esc(f.name)}"${f.required ? ' required' : ''}><span>${esc(f.label)}</span></label>`
    : `<label class="tf-field"><span class="tf-flabel mono">${esc(f.label)}</span><input type="${esc(f.type || 'text')}" name="${esc(f.name)}" autocomplete="${esc(f.autocomplete || 'off')}" maxlength="${esc(f.max || 200)}"${f.required ? ' required' : ''}></label>`).join('');
  return `<fieldset class="tf-step" data-step="${n}" data-kind="fields"${described}><legend>${num}${esc(q.prompt)}</legend>${help}${control}</fieldset>`;
}

function briefForm(d) {
  const qs = list(d.x_brief);
  const total = qs.length;
  return `<section id="brief" class="brief" aria-labelledby="brief-title">
  <header class="brief-head">
    <p class="eyebrow mono">Brief</p>
    <h2 id="brief-title">${esc(d.x_form_title)}</h2>
    <p class="lede">${esc(d.x_form_lede)}</p>
  </header>
  <p id="brief-sent" class="tf-sent" tabindex="-1"><strong>${esc(d.x_form_done_title)}</strong> ${esc(d.x_form_done)}</p>
  <form class="tf" action="/api/lead" method="post" data-brief data-total="${total}" data-error="${esc(d.x_form_error)}">
    <div class="tf-bar" aria-hidden="true"><span></span></div>
    <p class="tf-count mono" aria-live="polite"><span data-count>01</span> / ${String(total).padStart(2, '0')}</p>
    <div class="tf-steps">
${qs.map((q, i) => briefStep(q, i + 1, total)).join('\n')}
    </div>
    <label class="tf-hp" aria-hidden="true">Leave this field empty <input type="text" name="fax" tabindex="-1" autocomplete="off"></label>
    <p class="tf-error" role="alert" data-error-slot></p>
    <div class="tf-nav">
      <button type="button" class="tf-back" data-prev>Back</button>
      <button type="button" class="tf-next" data-next>Continue <span class="mono" aria-hidden="true">Enter</span></button>
      <button type="submit" class="tf-submit">${esc(d.x_form_submit)} ${arrow}</button>
    </div>
    <div class="tf-done" role="status" tabindex="-1" hidden>
      <p class="eyebrow mono">Received</p>
      <h3>${esc(d.x_form_done_title)}</h3>
      <p>${esc(d.x_form_done)}</p>
    </div>
  </form>
</section>`;
}

function contact(pages) {
  const c = pages.find((p) => p.data.slug === 'contact');
  const body = `<article class="about contact">
  <p class="eyebrow mono">Contact</p>
  <h1 class="pt" aria-label="Start a project">${splitHeadline('Start a project')}</h1>
  <div class="prose" data-reveal>${c.html}</div>
  ${briefForm(c.data)}
</article>`;
  return shell({ title: c.data.title, description: c.data.description, path: '/contact.html', page: 'contact', body, nav: navHtml('contact'), scripts: ['/assets/personal/brief.js'] });
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
