/**
 * Writes the personal site (see scripts/lib/personal/render.mjs) into the output
 * directory. Called by build-site.mjs unless SITE_GENERATION_ENABLED=1.
 */
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { renderPersonalSite } from './lib/personal/render.mjs';

export async function buildPersonal({ pages, outDir }) {
  const files = renderPersonalSite(pages);
  for (const [rel, html] of files) {
    const target = join(outDir, rel);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, html);
  }
  // Listing pages of the retired design: the home page now carries these sections.
  for (const retired of ['projects.html', 'designs.html', 'designs/index.html']) await rm(join(outDir, retired), { force: true });
  return [...files.keys()];
}
