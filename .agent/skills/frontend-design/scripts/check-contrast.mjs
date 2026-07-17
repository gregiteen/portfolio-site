#!/usr/bin/env node
/**
 * check-contrast.mjs — WCAG 2.1 contrast-ratio calculator for design work.
 *
 * Usage:
 *   node .agent/skills/frontend-design/scripts/check-contrast.mjs '#060608' '#f0f0ec'
 *   node .agent/skills/frontend-design/scripts/check-contrast.mjs 060608 f0f0ec 8a8a8a
 *
 * With 2 colors: reports the ratio and AA/AAA verdicts for normal + large text.
 * With 3+: checks every pair (useful for a palette).
 *
 * Deterministic math instead of eyeballing — a body-text pair below 4.5:1 fails
 * AA and will be flagged in any serious design review.
 */

function parseHex(input) {
  const hex = String(input).replace(/^#/, '');
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    console.error(`Not a hex color: '${input}' (use #rgb or #rrggbb)`);
    process.exit(1);
  }
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}

function luminance([r, g, b]) {
  const chan = (v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
}

function ratio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

const colors = process.argv.slice(2);
if (colors.length < 2) {
  console.error("Usage: check-contrast.mjs '#color1' '#color2' [more colors...]");
  process.exit(1);
}

const parsed = colors.map((c) => ({ raw: c.startsWith('#') ? c : `#${c}`, rgb: parseHex(c) }));
let worst = Infinity;

for (let i = 0; i < parsed.length; i++) {
  for (let j = i + 1; j < parsed.length; j++) {
    const r = ratio(parsed[i].rgb, parsed[j].rgb);
    worst = Math.min(worst, r);
    const verdicts = [
      r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : 'FAIL (normal text)',
      r >= 4.5 ? 'AAA-large' : r >= 3 ? 'AA-large' : 'FAIL (large text)',
    ];
    console.log(`${parsed[i].raw} vs ${parsed[j].raw}: ${r.toFixed(2)}:1 — ${verdicts.join(', ')}`);
  }
}

process.exit(worst >= 4.5 ? 0 : 1);
