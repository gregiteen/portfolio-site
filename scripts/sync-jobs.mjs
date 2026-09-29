#!/usr/bin/env node
/**
 * Copies the Job Search Navigator dashboard frontend into static/ so the site can
 * serve it at /jobs. One source: the JSN repo's public/ directory.
 *
 *   JSN_REPO=/path/to/job-search-navigator node scripts/sync-jobs.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repo = process.env.JSN_REPO;
if (!repo) {
  console.error('Set JSN_REPO to the job-search-navigator checkout.');
  process.exit(1);
}
const pub = join(resolve(repo), 'public');
for (const f of ['index.html', 'app.js', 'styles.css']) {
  if (!existsSync(join(pub, f))) {
    console.error(`Missing ${join(pub, f)}`);
    process.exit(1);
  }
}

const html = readFileSync(join(pub, 'index.html'), 'utf8')
  .replace('href="/styles.css"', 'href="/jobs.css"')
  .replace('<script type="module" src="/app.js"></script>', '<script>window.JSN_API_BASE = \'/api/jsn\';</script>\n<script type="module" src="/jobs.js"></script>');
if (!html.includes('/jobs.js') || !html.includes('/jobs.css')) {
  console.error('JSN index.html changed shape; update scripts/sync-jobs.mjs');
  process.exit(1);
}
writeFileSync(join(root, 'static', 'jobs.html'), html);
writeFileSync(join(root, 'static', 'jobs.js'), readFileSync(join(pub, 'app.js'), 'utf8'));
writeFileSync(join(root, 'static', 'jobs.css'), readFileSync(join(pub, 'styles.css'), 'utf8'));
console.log('Synced static/jobs.html, jobs.js, jobs.css from', pub);
