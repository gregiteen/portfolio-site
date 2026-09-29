import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseDocument } from '@ssss/cli/frontmatter';
import { renderPersonalSite } from '../scripts/lib/personal/render.mjs';

function collect(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) collect(p, out);
    else if (name.endsWith('.md')) out.push(p);
  }
  return out;
}
const pages = collect('vault/pages').map((f) => parseDocument(readFileSync(f, 'utf8')))
  .filter((d) => d.data.type === 'page')
  .map((d) => ({ data: d.data, html: `<p>${d.body.replace(/[<>]/g, '')}</p>` }));
const site = renderPersonalSite(pages);
const visibleText = (html) => [...html.replace(/<(script|style)[\s\S]*?<\/\1>/g, '').matchAll(/>([^<]+)</g)].map((m) => m[1]).join(' ');

test('renders home, about, contact and one page per project', () => {
  const projects = pages.filter((p) => p.data.x_kind === 'project');
  assert.ok(projects.length >= 4);
  for (const f of ['index.html', 'about.html', 'contact.html', ...projects.map((p) => p.data.sandbox_entry)]) assert.ok(site.has(f), f);
});

test('the home page lists every deployed site and every open-source project from the vault', () => {
  const html = site.get('index.html');
  const sites = pages.filter((p) => p.data.x_kind === 'deployed-site');
  const oss = pages.filter((p) => p.data.x_kind === 'open-source');
  assert.ok(sites.length >= 4 && oss.length >= 5);
  for (const s of sites) { assert.ok(html.includes(`href="${s.data.x_url}"`), s.data.x_url); assert.ok(html.includes(s.data.x_host)); }
  for (const o of oss) assert.ok(html.includes(`href="${o.data.x_repo}"`), o.data.x_repo);
});

test('every listed fact is verified and dated, and nothing claims a licence the repos do not declare', () => {
  for (const p of pages.filter((p) => ['deployed-site', 'open-source'].includes(p.data.x_kind))) {
    assert.match(String(p.data.x_verified), /^\d{4}-\d{2}-\d{2}/, p.data.slug);
  }
  for (const p of pages.filter((p) => p.data.x_kind === 'deployed-site')) {
    assert.equal(p.data.x_status, 200, p.data.slug);
    assert.match(p.data.x_url, /^https:\/\//);
    assert.ok(existsSync(`assets/sites/${p.data.x_slug}.jpg`), `preview image for ${p.data.x_slug}`);
  }
  for (const p of pages.filter((p) => p.data.x_kind === 'open-source')) {
    assert.match(p.data.x_repo, /^https:\/\/github\.com\/gregiteen\/[\w.-]+$/);
    assert.doesNotMatch(JSON.stringify(p.data) + p.html, /licen[cs]|\bMIT\b|apache/i, `${p.data.slug} must not claim a licence`);
  }
});

test('about links LinkedIn, and only about', () => {
  assert.match(site.get('about.html'), /href="https:\/\/www\.linkedin\.com\/in\/gregiteen"/);
  for (const [file, html] of site) if (file !== 'about.html') assert.doesNotMatch(html, /linkedin\.com/, file);
});

test('copy rules: no emoji, no banned words, no personal address', () => {
  for (const [file, html] of site) {
    const text = visibleText(html);
    assert.doesNotMatch(text, /\p{Extended_Pictographic}/u, `${file} has an emoji`);
    assert.doesNotMatch(text, /sovereign|cyberpunk|\bcursor\b|windsurf|supercharge|unleash|dive into|elevate your/i, `${file} has banned copy`);
    assert.doesNotMatch(text, /Miller Dr|303\s?489|80227/i, `${file} leaks a personal address or number`);
  }
});

test('every internal link resolves to a generated page or a shipped asset', () => {
  const known = new Set([...site.keys()].map((f) => `/${f}`));
  for (const [file, html] of site) {
    for (const [, href] of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
      if (href === '/') continue;
      const ok = known.has(href) || existsSync(`.${href}`) || existsSync(`static${href}`) || (href.startsWith('/assets/') && existsSync(href.slice(1)));
      assert.ok(ok, `${file} -> ${href}`);
    }
  }
});

test('accessibility and motion contract', () => {
  const html = site.get('index.html');
  const css = readFileSync('assets/personal/site.css', 'utf8');
  assert.match(html, /<h1[^>]+aria-label="Software that remembers whom it belongs to\."/);
  assert.match(html, /class="skip"/);
  assert.match(html, /<html lang="en">/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(css, /@media \(max-width/, 'layout is mobile first: min-width queries only');
  assert.match(html, /\.js|classList\.add\('js'\)/);
});
