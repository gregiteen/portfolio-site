/**
 * Unit tests for the deterministic pre-review artifact gate
 * (scripts/lib/artifact-gate.mjs). Run with `node --test`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  visibleTextSegments,
  scanLayoutSources,
  scanBuiltHtml,
} from '../scripts/lib/artifact-gate.mjs';

test('visibleTextSegments keeps text nodes whole and drops non-visible blocks', () => {
  const html = `<!-- note --><div>hello <b>world</b></div>
<script>const x = { a: "b" };</script>
<style>.x { color: red }</style>
<pre>{ "json": true }</pre>
<section>" }</section>`;
  const segments = visibleTextSegments(html);
  assert.deepEqual(segments, ['hello', 'world', '" }']);
});

test('layout source scan catches the historical stray quote-brace defect', () => {
  const issues = scanLayoutSources({
    project_item: '<section><a href="{{URL}}">{{NAME}}</a>" }</section>',
    home: '<div class="hero">{{HERO}}</div>',
  });
  assert.equal(issues.length, 1);
  assert.equal(issues[0].target, 'project_item');
  assert.equal(issues[0].severity, 'blocking');
  assert.match(issues[0].issue, /'" \}'/);
});

test('layout source scan allows the {{PLACEHOLDER}} templating contract', () => {
  const issues = scanLayoutSources({
    project_item: '<div>{{DESCRIPTION}}</div><span>{{YEAR}}</span>',
  });
  assert.equal(issues.length, 0);
});

test('layout source scan flags leaked markdown fences', () => {
  const issues = scanLayoutSources({
    page: '<div>```html leftover fence</div>',
  });
  assert.equal(issues.length, 1);
  assert.match(issues[0].issue, /markdown fence/);
});

test('built page scan flags unresolved placeholders that source scan allows', () => {
  const issues = scanBuiltHtml('<p>fine copy</p><p>{{URL}}</p>', 'home', 'index.html');
  assert.equal(issues.length, 1);
  assert.equal(issues[0].target, 'home');
  assert.match(issues[0].issue, /unresolved template placeholder/);
  assert.match(issues[0].issue, /index\.html/);
});

test('real prose with braces, quotes, and JSON in scripts is never flagged', () => {
  const html = `<div>Structured Semantic Syntax System — an open spec where {braces} appear in prose.</div>
<script>window.designs = [{"name":"Biolume Local","url":"/designs/biolume-local/index.html"}];</script>
<div class="card-subtitle">2026</div>`;
  assert.equal(scanBuiltHtml(html, 'home').length, 0);
  assert.equal(scanLayoutSources({ home: html }).length, 0);
});

test('empty and missing input is handled without findings', () => {
  assert.equal(scanBuiltHtml('', 'home').length, 0);
  assert.equal(scanBuiltHtml(undefined, 'home').length, 0);
  assert.equal(scanLayoutSources({}).length, 0);
});
