import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';

import {
  buildTransparentMark,
  despillTowardBackground,
  detectBackgroundColor,
  differenceMatte,
  keyOutBackground,
  makeLogoTransparent,
} from '../scripts/lib/logo-transparency.mjs';

/**
 * Composite artwork of colour `art` with coverage `cov` over `bg`, the way the
 * image model would render it. Half-covered pixels model an anti-aliased edge.
 */
function composite({ bg, art = [30, 60, 200], coverage }) {
  const data = new Uint8Array(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const a = coverage(x, y);
      for (let c = 0; c < 3; c++) data[i + c] = Math.round(art[c] * a + bg[c] * (1 - a));
      data[i + 3] = 255;
    }
  }
  return data;
}

// Solid core, a 1px half-covered anti-aliased rim, transparent outside — the
// rim width a real render actually produces. Anything fatter inflates the
// mid-alpha share that the divergence detector keys on.
const COVERAGE = (x, y) => {
  const inCore = x >= 18 && x < 46 && y >= 14 && y < 34;
  const inRim = x >= 17 && x < 47 && y >= 13 && y < 35;
  return inCore ? 1 : inRim ? 0.5 : 0;
};

const W = 64;
const H = 48;

/**
 * Build a raw RGBA test mark: solid background, a filled rect of `art` in the
 * middle, and an optional enclosed hole of `hole` inside that rect.
 */
function makeMark({ bg = [255, 255, 255], art = [20, 20, 20], hole = null } = {}) {
  const data = new Uint8Array(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const inArt = x >= 16 && x < 48 && y >= 12 && y < 36;
      const inHole = hole && x >= 26 && x < 38 && y >= 20 && y < 28;
      const c = inHole ? hole : inArt ? art : bg;
      data[i] = c[0]; data[i + 1] = c[1]; data[i + 2] = c[2]; data[i + 3] = 255;
    }
  }
  return data;
}

const alphaAt = (data, x, y) => data[(y * W + x) * 4 + 3];
const rgbAt = (data, x, y) => [...data.slice((y * W + x) * 4, (y * W + x) * 4 + 3)];

test('detects a near-white background the model did not render as pure #FFFFFF', () => {
  const data = makeMark({ bg: [250, 249, 246] });
  const { bg, spread } = detectBackgroundColor(data, W, H);
  assert.deepEqual(bg, [250, 249, 246]);
  assert.ok(spread < 1, `corners should agree, got spread ${spread}`);
});

test('background clears while dark artwork stays fully opaque', () => {
  const data = makeMark();
  const result = keyOutBackground(data, W, H);
  assert.equal(result.keyed, true);
  assert.equal(alphaAt(data, 1, 1), 0, 'corner should be transparent');
  assert.equal(alphaAt(data, 32, 24), 255, 'centre of the mark must stay opaque');
  assert.ok(result.cleared > 0);
});

// The exact defect that ghosted "GREG ITEEN" away: the old code set alpha from
// luminance, so pale artwork on a white background dissolved to ~7% opacity.
test('LIGHT artwork on a white background survives at full opacity', () => {
  const data = makeMark({ bg: [255, 255, 255], art: [242, 240, 236] });
  const result = keyOutBackground(data, W, H);
  assert.equal(result.keyed, true);
  assert.equal(
    alphaAt(data, 32, 24), 255,
    'cream artwork must stay opaque — luminance keying erased it before',
  );
  assert.equal(alphaAt(data, 1, 1), 0, 'the white background must still clear');
});

// The rainbow speckle: near-white noise got a tiny alpha and then had its RGB
// divided by that alpha, exploding into saturated colour. RGB is now untouched.
test('near-white compression noise never becomes saturated colour', () => {
  const data = makeMark();
  // scatter noisy near-white pixels through the background
  for (const [x, y] of [[3, 3], [60, 5], [8, 44], [55, 40]]) {
    const i = (y * W + x) * 4;
    data[i] = 250; data[i + 1] = 252; data[i + 2] = 248;
  }
  keyOutBackground(data, W, H);
  for (const [x, y] of [[3, 3], [60, 5], [8, 44], [55, 40]]) {
    assert.equal(alphaAt(data, x, y), 0, `noise at ${x},${y} should clear, not speckle`);
    const [r, g, b] = rgbAt(data, x, y);
    assert.ok(
      Math.max(r, g, b) - Math.min(r, g, b) < 12,
      `noise at ${x},${y} must not gain saturation, got rgb(${r},${g},${b})`,
    );
  }
});

test('enclosed light regions are preserved, not flood-filled through the artwork', () => {
  const data = makeMark({ bg: [255, 255, 255], art: [20, 20, 20], hole: [255, 255, 255] });
  keyOutBackground(data, W, H);
  assert.equal(alphaAt(data, 1, 1), 0, 'outer background clears');
  assert.equal(
    alphaAt(data, 32, 24), 255,
    'white enclosed by artwork must stay opaque — it is inside the letterform',
  );
});

test('a non-uniform background is refused rather than guessed at', () => {
  const data = makeMark();
  // repaint one corner a wildly different colour
  for (let y = 0; y < 6; y++) {
    for (let x = 0; x < 6; x++) {
      const i = (y * W + x) * 4;
      data[i] = 10; data[i + 1] = 90; data[i + 2] = 200;
    }
  }
  const result = keyOutBackground(data, W, H);
  assert.equal(result.keyed, false);
  assert.equal(result.cleared, 0);
  assert.equal(alphaAt(data, 40, 24), 255, 'image must be left untouched');
});

test('makeLogoTransparent trims the dead canvas so the mark fills its box', async () => {
  // The SPACE logo shape: a small mark centred in a large canvas.
  const png = await sharp(Buffer.from(makeMark()), { raw: { width: W, height: H, channels: 4 } })
    .png().toBuffer();

  const { buffer, keyed } = await makeLogoTransparent(png, sharp);
  assert.equal(keyed, true);
  const meta = await sharp(buffer).metadata();
  assert.equal(meta.hasAlpha, true, 'output must carry an alpha channel');
  assert.equal(meta.width, 32, `art is 32px wide, got ${meta.width}`);
  assert.equal(meta.height, 24, `art is 24px tall, got ${meta.height}`);
});

test('an all-background image is refused instead of shipping a blank mark', async () => {
  const blank = new Uint8Array(W * H * 4).fill(255);
  const png = await sharp(Buffer.from(blank), { raw: { width: W, height: H, channels: 4 } })
    .png().toBuffer();

  const { buffer, reason } = await makeLogoTransparent(png, sharp);
  assert.equal(buffer, null);
  assert.match(reason, /survived/);
});

// ── Difference matting ──────────────────────────────────────────────────────
// Colour keying can only guess at a half-covered edge pixel. Matting solves it
// exactly, which is the whole reason for spending a second generation.

test('difference matting recovers exact alpha including anti-aliased edges', () => {
  const white = composite({ bg: [255, 255, 255], coverage: COVERAGE });
  const black = composite({ bg: [0, 0, 0], coverage: COVERAGE });

  const matte = differenceMatte(white, black, W, H);
  const alpha = (x, y) => matte.data[(y * W + x) * 4 + 3];

  assert.equal(alpha(1, 1), 0, 'background must resolve to fully transparent');
  assert.equal(alpha(32, 24), 255, 'solid core must resolve to fully opaque');
  // The rim is the payoff: 50% coverage recovered as ~50% alpha.
  assert.ok(Math.abs(alpha(17, 24) - 128) <= 2, `rim alpha should be ~128, got ${alpha(17, 24)}`);
  // Agreeing renders must stay clear of the rejection bar. A real pair from the
  // image model scored 9.2% here because the mark was redrawn in a different
  // place, which is exactly what the bar exists to catch.
  assert.ok(matte.divergence < 0.05, `consistent renders must not be rejected, got ${matte.divergence}`);
});

test('difference matting recovers the true unpremultiplied colour', () => {
  const art = [30, 60, 200];
  const white = composite({ bg: [255, 255, 255], art, coverage: COVERAGE });
  const black = composite({ bg: [0, 0, 0], art, coverage: COVERAGE });

  const matte = differenceMatte(white, black, W, H);
  const i = (24 * W + 32) * 4;
  for (let c = 0; c < 3; c++) {
    assert.ok(
      Math.abs(matte.data[i + c] - art[c]) <= 2,
      `channel ${c} should recover ${art[c]}, got ${matte.data[i + c]}`,
    );
  }
});

test('diverged renders are detected instead of producing a mangled matte', () => {
  const white = composite({ bg: [255, 255, 255], coverage: COVERAGE });
  // The model redrew the mark somewhere else entirely on the second run.
  const black = composite({
    bg: [0, 0, 0],
    coverage: (x, y) => (x >= 2 && x < 14 && y >= 2 && y < 14 ? 1 : 0),
  });

  const matte = differenceMatte(white, black, W, H);
  assert.ok(matte.divergence > 0.02, `divergence should be flagged, got ${matte.divergence}`);
});

test('buildTransparentMark falls back to keying when the renders disagree', async () => {
  const toPng = (data) => sharp(Buffer.from(data), { raw: { width: W, height: H, channels: 4 } })
    .png().toBuffer();
  const white = await toPng(composite({ bg: [255, 255, 255], coverage: COVERAGE }));
  const black = await toPng(composite({
    bg: [0, 0, 0],
    coverage: (x, y) => (x >= 2 && x < 14 && y >= 2 && y < 14 ? 1 : 0),
  }));

  const result = await buildTransparentMark(white, black, sharp);
  assert.match(result.method, /colour-key/);
  assert.match(result.reason, /diverged/);
  assert.ok(result.buffer, 'the fallback must still produce a usable mark');
});

test('buildTransparentMark prefers the matte when the renders agree', async () => {
  const toPng = (data) => sharp(Buffer.from(data), { raw: { width: W, height: H, channels: 4 } })
    .png().toBuffer();
  const white = await toPng(composite({ bg: [255, 255, 255], coverage: COVERAGE }));
  const black = await toPng(composite({ bg: [0, 0, 0], coverage: COVERAGE }));

  const result = await buildTransparentMark(white, black, sharp);
  assert.equal(result.method, 'difference-matte');
  const meta = await sharp(result.buffer).metadata();
  assert.equal(meta.hasAlpha, true);
  assert.equal(meta.width, 30, "trimmed to the artwork including its soft rim");
});

// ── Despill ─────────────────────────────────────────────────────────────────
// Keying a green screen leaves green bleed on anti-aliased edges, which reads
// as a halo once the mark sits on a dark page.

test('green spill is removed from soft edges but opaque artwork is untouched', () => {
  const GREEN = [0, 255, 0];
  const data = makeMark({ bg: GREEN, art: [200, 40, 40] });
  const result = keyOutBackground(data, W, H);
  assert.equal(result.keyed, true);
  assert.equal(alphaAt(data, 1, 1), 0, 'green background clears');
  assert.equal(alphaAt(data, 32, 24), 255, 'red artwork stays opaque');

  // Opaque artwork must keep its real colour — despill only touches the rim.
  const [r, g, b] = rgbAt(data, 32, 24);
  assert.deepEqual([r, g, b], [200, 40, 40], 'opaque pixels must not be despilled');
});

test('despill pulls a dominant background channel back to the other two', () => {
  const build = () => {
    const data = new Uint8Array(4 * 4 * 4);
    const set = (px, rgba) => { for (let c = 0; c < 4; c++) data[px * 4 + c] = rgba[c]; };
    set(0, [120, 220, 100, 128]); // partial, green-dominant
    set(1, [120, 220, 100, 255]); // opaque, green-dominant
    return data;
  };

  // Default: opaque pixels are despilled too. Green that blended into dark
  // artwork survives the key as "artwork" but is still visible green fringe.
  const all = build();
  assert.equal(despillTowardBackground(all, 4, 4, [0, 255, 0]), 2);
  assert.equal(all[1], 110, 'green pulled to the mean of red and blue');
  assert.equal(all[4 + 1], 110, 'opaque green fringe is corrected as well');

  // partialOnly is retained for a soft-edge-only pass.
  const partial = build();
  assert.equal(despillTowardBackground(partial, 4, 4, [0, 255, 0], { partialOnly: true }), 1);
  assert.equal(partial[4 + 1], 220, 'opaque pixel untouched in partialOnly mode');
});

test('despill is a no-op on a neutral background', () => {
  const data = new Uint8Array(4 * 4 * 4);
  for (let c = 0; c < 4; c++) data[c] = [120, 220, 100, 128][c];
  const touched = despillTowardBackground(data, 4, 4, [255, 255, 255]);
  assert.equal(touched, 0, 'white has no dominant channel to spill');
  assert.equal(data[1], 220);
});

// A chroma key is not artwork. Green trapped inside a glyph counter must clear
// too — a live render left an opaque rgb(8,125,37) pixel inside the wordmark.
test('enclosed CHROMA KEY green is cleared, unlike enclosed white', () => {
  const data = makeMark({ bg: [0, 255, 0], art: [30, 40, 120], hole: [0, 255, 0] });
  const result = keyOutBackground(data, W, H);
  assert.equal(result.keyed, true);
  assert.equal(alphaAt(data, 1, 1), 0, 'outer green clears');
  assert.equal(alphaAt(data, 32, 24), 0, 'green enclosed by the mark must clear too');
  assert.equal(alphaAt(data, 20, 24), 255, 'the mark itself stays opaque');
});

test('cleared pixels carry the artwork mean, not the key colour', () => {
  const art = [30, 40, 120];
  const data = makeMark({ bg: [0, 255, 0], art });
  keyOutBackground(data, W, H);
  const [r, g, b] = rgbAt(data, 1, 1);
  assert.equal(alphaAt(data, 1, 1), 0);
  assert.ok(g < 100, `cleared pixel must not retain key green, got rgb(${r},${g},${b})`);
  // it should sit near the artwork colour so downscaling fringes invisibly
  assert.ok(Math.abs(b - art[2]) < 40, `expected a fill near the art colour, got rgb(${r},${g},${b})`);
});
