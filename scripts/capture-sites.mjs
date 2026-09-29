#!/usr/bin/env node
/**
 * Captures a preview image of each deployed site listed in vault/pages/sites/
 * into assets/sites/<slug>.jpg and prints the HTTP status it saw. Run by hand
 * (`npm run capture-sites`) whenever a site changes; the images are committed.
 * A site that does not load is reported and left without an image.
 */
import { chromium } from 'playwright';
import { readdirSync, readFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'vault', 'pages', 'sites');
const out = join(root, 'assets', 'sites');
mkdirSync(out, { recursive: true });

const field = (text, key) => (text.match(new RegExp(`^${key}:\\s*"?([^"\\n]+)"?\\s*$`, 'm')) || [])[1];
const browser = await chromium.launch();
let failed = 0;
for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
  const text = readFileSync(join(dir, file), 'utf8');
  const slug = field(text, 'x_slug');
  const url = field(text, 'x_url');
  if (!slug || !url) continue;
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  try {
    const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    // Clear consent banners the way a privacy-minded visitor would, and let
    // loading states finish so the image shows the site, not a spinner.
    for (const name of [/essential only/i, /reject/i, /decline/i, /necessary only/i]) {
      const button = page.getByRole('button', { name }).first();
      if (await button.count()) { await button.click({ timeout: 2000 }).catch(() => {}); break; }
    }
    await page.waitForFunction(() => !/initializing|verifying|loading/i.test(document.body.innerText.slice(0, 400)), null, { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(2500);
    await page.screenshot({ path: join(out, `${slug}.jpg`), type: 'jpeg', quality: 82 });
    console.log(`${slug}: HTTP ${res?.status()} -> assets/sites/${slug}.jpg`);
  } catch (error) {
    failed++;
    console.error(`${slug}: FAILED ${error.message}`);
  }
  await page.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
