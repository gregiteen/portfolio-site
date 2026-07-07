#!/usr/bin/env node
// Promote a mature AI-generated theme skin to the real portfolio.
// Copies the design from designs/<slug> into vault/pages/designs/ with x_kind: "design".
//
// Usage: node scripts/promote-theme.mjs <slug> [--name "Display Name"]

import { readFile, writeFile, copyFile, mkdir, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const designsDir = join(__dirname, '..', 'designs');
const vaultDesignsDir = join(__dirname, '..', 'vault', 'pages', 'designs');

const args = process.argv.slice(2);
let slug = null;
let displayName = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--name' && args[i + 1]) {
    displayName = args[++i];
  } else if (!args[i].startsWith('-')) {
    slug = args[i];
  }
}

if (!slug) {
  // List available themes
  try {
    const entries = await readdir(designsDir, { withFileTypes: true });
    const dirs = entries.filter(e => e.isDirectory()).map(e => e.name);
    if (dirs.length === 0) {
      console.log('No generated designs found to promote.');
    } else {
      console.log('Available designs to promote:');
      for (const d of dirs) {
        const designMdPath = join(designsDir, d, 'DESIGN.md');
        try {
          const raw = await readFile(designMdPath, 'utf8');
          const nameMatch = raw.match(/^name:\s*"?([^"\n]+)"?/m);
          const scoreMatch = raw.match(/^improvement_score:\s*"?([^"\n]+)"?/m);
          console.log(`  ${d}${nameMatch ? ` (${nameMatch[1]})` : ''}${scoreMatch ? ` — score: ${scoreMatch[1]}` : ''}`);
        } catch {
          console.log(`  ${d}`);
        }
      }
    }
  } catch {
    console.log('No designs directory found.');
  }
  process.exit(0);
}

async function run() {
  const designDir = join(designsDir, slug);
  const designMdPath = join(designDir, 'DESIGN.md');

  let raw;
  try {
    raw = await readFile(designMdPath, 'utf8');
  } catch {
    console.error(`Error: No DESIGN.md found at ${designMdPath}`);
    process.exit(1);
  }

  // Extract current metadata
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  const fmLines = fmMatch ? fmMatch[1].split('\n') : [];
  const name = displayName || fmLines.find(l => l.startsWith('name:'))?.replace(/^name:\s*"?|"?\s*$/g, '') || slug;
  const accent = fmLines.find(l => l.startsWith('accent:'))?.replace(/^accent:\s*"?|"?\s*$/g, '') || '#888888';
  const style = fmLines.find(l => l.startsWith('style:'))?.replace(/^style:\s*"?|"?\s*$/g, '') || '';
  const body = raw.replace(/^---\n[\s\S]*?\n---\n*/, '').trim();

  // Write portfolio entry
  const portfolioMeta = {
    slug: `design-${slug}`,
    name,
    title: `${name} — Design`,
    description: `Generated design: "${style}"`,
    timestamp: new Date().toISOString(),
    sandbox_entry: `designs/${slug}/index.html`,
    x_kind: 'design',
    x_year: new Date().getFullYear(),
    x_role: 'AI-Generated (Promoted)',
    x_client: 'Portfolio Generator',
    x_tags: ['AI Generated', 'Promoted'],
    x_preview: `/designs/${slug}/assets/hero.jpg`,
    x_logo: `/designs/${slug}/assets/logo.png`,
    x_link: `/designs/${slug}/index.html`,
  };

  const specFm = Object.entries(portfolioMeta)
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}:\n${v.map(t => `  - "${t}"`).join('\n')}`;
      return `${k}: ${JSON.stringify(String(v))}`;
    }).join('\n');

  const vaultMd = `---\ntype: page\n${specFm}\n---\n\n${body}\n`;
  await writeFile(join(vaultDesignsDir, `${slug}.md`), vaultMd, 'utf8');

  console.log(`✓ Promoted "${name}" to portfolio (vault/pages/designs/${slug}.md)`);
  console.log(`  x_kind: "design" — will appear on Designs index`);

  // Rebuild
  console.log('Rebuilding site…');
  spawnSync(process.execPath, [join(__dirname, 'build-site.mjs')], { stdio: 'inherit' });
}

run().catch(e => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
