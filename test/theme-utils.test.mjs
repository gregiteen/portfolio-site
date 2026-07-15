/**
 * Unit tests for the theme generator/build machinery in scripts/lib/theme.mjs.
 * Run with `node --test` (picked up by `npm test` alongside the conformance suite).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseNestedMap,
  extractSections,
  serializeThemeDoc,
  scopeCss,
  fillTemplate,
  hoistCssImports,
  validateThemePayload,
  extractJson,
  enforceBrandAssetContract,
  analyzeThemeClassBindings,
} from '../scripts/lib/theme.mjs';

test('hoistCssImports moves a Google Fonts @import (semicolons in URL) above earlier rules', () => {
  const fontsImport = '@import url("https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700&family=Manrope:wght@400;600&display=swap");';
  const css = `body { color: red; }\n${fontsImport}\n.card { margin: 0; }`;
  const hoisted = hoistCssImports(css);
  assert.ok(hoisted.startsWith(fontsImport), 'full @import statement must be first');
  assert.equal(hoisted.match(/@import/g).length, 1, 'import must not be duplicated or split');
  assert.match(hoisted, /body \{ color: red; \}/);
  assert.match(hoisted, /\.card \{ margin: 0; \}/);
});

test('hoistCssImports leaves import-free CSS untouched', () => {
  const css = 'body { color: red; }';
  assert.equal(hoistCssImports(css), css);
});

test('validateThemePayload requireFontImport rejects a stylesheet with no Google Fonts import', () => {
  const layouts = { shell: '<div class="frame">{{CONTENT}}</div>' };
  const noFonts = validateThemePayload(
    { name: 'x', accent: '#123456', css: 'body { font-family: Impact; } '.repeat(10), layouts },
    { requireFontImport: true }
  );
  assert.ok(noFonts.errors.some((e) => e.includes('fonts.googleapis.com')), 'must flag missing font import');
  const withFonts = validateThemePayload(
    { name: 'x', accent: '#123456', css: '@import url("https://fonts.googleapis.com/css2?family=Sora&display=swap");\nbody { font-family: Sora; } '.repeat(1) + '.pad { margin: 0 auto; padding: 2rem; }', layouts },
    { requireFontImport: true }
  );
  assert.ok(!withFonts.errors.some((e) => e.includes('fonts.googleapis.com')));
});

test('parseNestedMap recovers theme tokens the canonical parser drops', () => {
  const raw = [
    '---', 'type: page', 'x_kind: "theme"', 'x_variables:',
    '  ink: "#12100d"', "  accent: '#ff5a1f'", '  blur: 0px', '---',
  ].join('\n');
  const vars = parseNestedMap(raw, 'x_variables');
  assert.deepEqual(vars, { ink: '#12100d', accent: '#ff5a1f', blur: '0px' });
});

test('parseNestedMap returns empty map when the key is absent', () => {
  assert.deepEqual(parseNestedMap('---\ntype: page\n---', 'x_variables'), {});
});

test('sections round-trip through serializeThemeDoc → extractSections', () => {
  const css = ':root { --a: red; }\nbody { margin: 0; }';
  const home = '<div class="hero">{{HEADLINE}}</div>\n{{FEATURED_PROJECTS}}';
  const doc = serializeThemeDoc({ slug: 'theme-custom', name: 'Test' }, { css, 'layout:home': home });
  const body = doc.slice(doc.indexOf('\n---\n', 4) + 5);
  const sections = extractSections(body);
  assert.equal(sections.css, css);
  assert.equal(sections['layout:home'], home);
});

test('serializeThemeDoc strips nested fences that would truncate a section', () => {
  const doc = serializeThemeDoc({ slug: 't' }, { css: 'a { b: c; }\n```\nbody { d: e; }' });
  const sections = extractSections(doc.slice(doc.indexOf('\n---\n', 4) + 5));
  assert.ok(sections.css.includes('body { d: e; }'), 'content after inner fence survives');
});

test('scopeCss prefixes plain selectors and maps :root/html onto the theme root', () => {
  const scoped = scopeCss(':root { --x: 1; }\nbody { margin: 0; }\n.card, h1 { color: red; }');
  assert.match(scoped, /html\[data-theme="custom"\] \{ --x: 1; \}/);
  assert.match(scoped, /html\[data-theme="custom"\] body \{ margin: 0; \}/);
  assert.match(scoped, /html\[data-theme="custom"\] \.card, html\[data-theme="custom"\] h1 \{/);
});

test('scopeCss recurses into @media but leaves @keyframes/@font-face alone', () => {
  const scoped = scopeCss(
    '@media (max-width: 600px) { .a { color: red; } }\n@keyframes spin { from { rotate: 0deg; } to { rotate: 360deg; } }'
  );
  assert.match(scoped, /@media \(max-width: 600px\) \{\s*html\[data-theme="custom"\] \.a/);
  assert.match(scoped, /@keyframes spin \{ from \{ rotate: 0deg; \} to \{ rotate: 360deg; \} \}/);
  assert.ok(!scoped.includes('@keyframes spin { html'), 'keyframe steps must not be scoped');
});

test('scopeCss passes through @import statements and survives comments', () => {
  const scoped = scopeCss("@import url('x.css');\n/* note { fake brace */\n.a { b: c; }");
  assert.match(scoped, /@import url\('x\.css'\);/);
  assert.match(scoped, /html\[data-theme="custom"\] \.a \{ b: c; \}/);
});

test('fillTemplate fills known slots and blanks unknown ones', () => {
  const out = fillTemplate('<h1>{{NAME}}</h1><p>{{BOGUS}}</p>{{YEAR}}', { NAME: 'ssss', YEAR: 2026 });
  assert.equal(out, '<h1>ssss</h1><p></p>2026');
});

test('validateThemePayload accepts a well-formed payload', () => {
  const { errors, theme } = validateThemePayload({
    name: 'Neon',
    accent: '#ccff00',
    css: 'body { background: #000; color: #ccff00; font-family: monospace; } h1 { text-transform: uppercase; }',
    layouts: { home: '<main>{{HEADLINE}}{{FEATURED_PROJECTS}}</main>' },
  });
  assert.deepEqual(errors, []);
  assert.equal(theme.accent, '#ccff00');
  assert.ok(theme.layouts.home.includes('{{FEATURED_PROJECTS}}'));
});

test('validateThemePayload flags missing required placeholders (strict) and drops them (lenient)', () => {
  const payload = {
    name: 'X',
    css: 'body { background: #101010; color: #eee; margin: 0; padding: 0; } a { color: #fff; }',
    layouts: { home: '<main>no slots here</main>' },
  };
  const strict = validateThemePayload(payload);
  assert.ok(strict.errors.some((e) => e.includes('FEATURED_PROJECTS')));
  const lenient = validateThemePayload(payload, { strict: false });
  assert.deepEqual(lenient.errors, []);
  assert.equal(lenient.theme.layouts.home, undefined, 'invalid layout dropped, build falls back to default');
});

test('validateThemePayload neutralizes script tags in layouts', () => {
  const { theme } = validateThemePayload({
    name: 'X',
    css: 'body { background: #101010; color: #eee; margin: 0; padding: 0; } a { color: #fff; }',
    layouts: { page: '<div>{{NAME}}{{CONTENT}}<script>alert(1)</script></div>' },
  });
  assert.ok(!/<\s*script/i.test(theme.layouts.page));
});

test('validateThemePayload rejects malformed HTML and unknown placeholders', () => {
  const { errors } = validateThemePayload({
    name: 'X',
    css: 'body { background: #101010; color: #eee; margin: 0; padding: 0; } a { color: #fff; }',
    layouts: { home: '<main>{{HEADLINE}}{{FEATURED_PROJECTS}}</section>{{INVENTED_SLOT}}' },
  });
  assert.ok(errors.some((error) => error.includes('unknown placeholder')));
  assert.ok(errors.some((error) => error.includes('unmatched or misnested')));
});

test('validateThemePayload enforces raw URL and preformatted HTML placement', () => {
  const bad = validateThemePayload({
    name: 'X',
    css: 'body { background: #101010; color: #eee; margin: 0; padding: 0; } a { color: #fff; }',
    layouts: {
      design_item: '<article><a href="{{URL}}">{{NAME}}</a><span>{{PREVIEW}}</span></article>',
      project_detail: '<article><a href="{{PROJECT_LINK}}">{{NAME}}</a>{{CONTENT}}</article>',
    },
  });
  assert.ok(bad.errors.some((error) => error.includes('{{PREVIEW}}') && error.includes('src')));
  assert.ok(bad.errors.some((error) => error.includes('{{PROJECT_LINK}}') && error.includes('preformatted HTML')));

  const good = validateThemePayload({
    name: 'X',
    css: 'body { background: #101010; color: #eee; margin: 0; padding: 0; } a { color: #fff; }',
    layouts: {
      design_item: '<article><a href="{{URL}}">{{NAME}}</a><img src="{{PREVIEW}}" alt=""></article>',
    },
  });
  assert.ok(!good.errors.some((error) => error.includes('raw URL')));
});

test('validateThemePayload rejects generated dialog and popover navigation', () => {
  const { errors } = validateThemePayload({
    name: 'X',
    css: 'body { background: #101010; color: #eee; margin: 0; padding: 0; } a { color: #fff; }',
    layouts: { shell: '<dialog popover="auto">{{NAV_LINKS}}</dialog><main>{{CONTENT}}</main>' },
  });
  assert.ok(errors.some((error) => error.includes('dialog/popover')));
});

test('validateThemePayload enforces each constitution root class', () => {
  const { errors } = validateThemePayload({
    name: 'X',
    css: '.actual-root { background: #101010; color: #eee; margin: 0; padding: 0; }',
    layouts: { home: '<section class="actual-root">{{FEATURED_PROJECTS}}</section>' },
  }, { requiredLayoutClasses: { home: 'planned-root' } });
  assert.ok(errors.some((error) => error.includes('planned-root')));
});

test('validateThemePayload release mode requires complete layout coverage and a hero asset', () => {
  const { errors } = validateThemePayload({
    name: 'X',
    css: 'body { background: #101010; color: #eee; margin: 0; padding: 0; } a { color: #fff; }',
    layouts: { home: '<main>{{HEADLINE}}{{FEATURED_PROJECTS}}</main>' },
  }, { requireAllLayouts: true, requireHero: true });
  assert.ok(errors.some((error) => error.includes('missing required layout "shell"')));
  assert.ok(errors.some((error) => error.includes('assets/hero.jpg')));
});

test('release class binding rejects layout classes that CSS never defines', () => {
  const bindings = analyzeThemeClassBindings({
    css: '.site-shell { display: block; } .badge, .btn, .src, .backlink, .md-img { color: inherit; }',
    layouts: { shell: '<div class="site-shell invented-shell">{{CONTENT}}</div>' },
  });
  assert.deepEqual(bindings.missingByLayout, { shell: ['invented-shell'] });

  const { errors } = validateThemePayload({
    name: 'Bound',
    css: '.site-shell { background: url(assets/hero.jpg); } .badge, .btn, .src, .backlink, .md-img { color: inherit; }',
    layouts: { shell: '<div class="site-shell invented-shell">{{CONTENT}}</div>' },
  }, { requireClassBindings: true });
  assert.ok(errors.some((error) => error.includes('invented-shell')));
});

test('release class binding requires CSS for build-injected content classes', () => {
  const { errors } = validateThemePayload({
    name: 'Bound',
    css: '.site-shell { background: url(assets/hero.jpg); }',
    layouts: { shell: '<div class="site-shell">{{CONTENT}}</div>' },
  }, { requireClassBindings: true });
  assert.ok(errors.some((error) => error.includes('badge')));
  assert.ok(errors.some((error) => error.includes('md-img')));
});

test('enforceBrandAssetContract keeps the generated logo and bounds brand marks', () => {
  const normalized = enforceBrandAssetContract({
    css: '.nav-bar { display: flex; }',
    layouts: { shell: '<header><img src="assets/logo.png" /></header>{{CONTENT}}' },
  });
  // The per-theme generated logo is a first-class audited asset now — it must
  // survive untouched but receive the size-bounding brand-mark class.
  assert.match(normalized.layouts.shell, /src="assets\/logo\.png"/);
  assert.match(normalized.layouts.shell, /class="verified-brand-mark"/);
  assert.match(normalized.css, /inline-size: min\(11\.25rem, 48vw\) !important/);
  assert.match(normalized.css, /\.tl-default \{ display: none !important; \}/);
  assert.match(normalized.css, /\.gi-reveal/);
});

test('extractJson handles fences, prose, and trailing commas', () => {
  assert.deepEqual(extractJson('Sure! Here you go:\n```json\n{"a": 1}\n```\nEnjoy.'), { a: 1 });
  assert.deepEqual(extractJson('prefix {"a": [1, 2,], "b": {"c": 3,},} suffix'), { a: [1, 2], b: { c: 3 } });
  assert.throws(() => extractJson('no json here'), /no JSON object/);
});

test('extractJson ignores a stray trailing brace after a complete object', () => {
  // Observed live: gemini-3.5-flash occasionally tacks on an extra '}' after
  // an otherwise well-formed object. lastIndexOf('}') would slice that in,
  // producing invalid JSON whose caller then leaked the raw text to users.
  const raw = '{\n  "message": "hi there",\n  "complete": false\n}\n}\n';
  assert.deepEqual(extractJson(raw), { message: 'hi there', complete: false });
});

test('extractJson repairs a single stray character spliced into otherwise-valid JSON', () => {
  // Also observed live: a stray '"' spliced in right after a boolean literal,
  // e.g. `"complete": false"}`. This isn't trailing garbage — the object
  // itself is malformed — so it needs the position-based repair, not just
  // brace-balancing.
  const raw = '{"message": "hi there", "complete": false"}\n';
  assert.deepEqual(extractJson(raw), { message: 'hi there', complete: false });
});

test('extractJson closes an object the model stopped emitting mid-way', () => {
  // Also observed live: finishReason STOP (not MAX_TOKENS) but the model
  // never emitted a closing brace at all — no '}' exists anywhere in the
  // output, so brace-balancing alone can't recover it.
  const raw = '{\n  "message": "hi there",\n  "complete": false';
  assert.deepEqual(extractJson(raw), { message: 'hi there', complete: false });
});
