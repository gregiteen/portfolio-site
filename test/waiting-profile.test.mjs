import test from 'node:test';
import assert from 'node:assert/strict';
import { createWaitingProfile } from '../scripts/lib/waiting-profile.mjs';

const pages = [
  { data: { slug: 'home', x_headline: 'Software that *remembers* to whom it belongs.' }, body: "I'm **Greg Iteen** — a full-stack engineer building AI-native tools." },
  { data: { slug: 'about' }, body: `## Who I am\n\nI build local systems.\n\n## How I work\n\n- **Files over databases.**\n- **Contracts over vibes.**\n\n## Toolbox\n\nTypeScript / Node.js` },
];

test('waiting profile uses only canonical page material', () => {
  const profile = createWaitingProfile(pages);
  assert.equal(profile.sections.length, 4);
  assert.match(profile.sections[0].copy, /Greg Iteen/);
  assert.match(profile.sections[1].copy, /Files over databases/);
  assert.match(profile.sections[2].copy, /TypeScript/);
  assert.match(profile.sections[3].copy, /local systems/);
});
