/**
 * Background removal for generated brand marks.
 *
 * The generator asks the image model for flat 2D logo art "on a perfectly
 * solid #FFFFFF white background", then has to key that background out so the
 * mark can sit on a dark themed page.
 *
 * The previous implementation derived alpha from luminance for EVERY pixel
 * (`alpha = 255 - min(r,g,b)`, then unpremultiplied against white). That is not
 * background removal:
 *   - light-coloured ARTWORK dissolved (a cream glyph became 7% opaque — the
 *     "GREG ITEEN" wordmark ghosted away entirely on the mad-max skin),
 *   - and near-white compression noise got alpha ~7 then had its colour
 *     divided by ~0.027, exploding into saturated rainbow speckle.
 *
 * This module keys on COLOUR PROXIMITY TO THE ACTUAL BACKGROUND instead, and
 * only from the outside in:
 *   1. sample the corners to learn the real background colour (the model does
 *      not always honour pure #FFFFFF),
 *   2. flood-fill inward from the border, so enclosed light regions (the inside
 *      of an O, a highlight) stay opaque,
 *   3. feather only the thin anti-aliased rim, by distance, without ever
 *      touching RGB — which is what kept the noise from being amplified.
 */

/** Squared euclidean RGB distance — avoids a sqrt in the hot loop. */
function distanceSq(data, i, bg) {
  const dr = data[i] - bg[0];
  const dg = data[i + 1] - bg[1];
  const db = data[i + 2] - bg[2];
  return dr * dr + dg * dg + db * db;
}

/**
 * Median-ish background probe. Corners are sampled rather than a single pixel
 * so one stray artifact cannot define the key colour, and disagreement between
 * corners is reported so the caller can decline to key an image whose
 * background was never actually solid.
 */
export function detectBackgroundColor(data, width, height, { inset = 2 } = {}) {
  const at = (x, y) => {
    const i = (y * width + x) * 4;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const corners = [
    at(inset, inset),
    at(width - 1 - inset, inset),
    at(inset, height - 1 - inset),
    at(width - 1 - inset, height - 1 - inset),
  ];
  const bg = [0, 1, 2].map((c) => {
    const values = corners.map((corner) => corner[c]).sort((a, b) => a - b);
    return Math.round((values[1] + values[2]) / 2); // mean of the middle two
  });
  const spread = Math.max(...corners.map((corner) => Math.sqrt(
    (corner[0] - bg[0]) ** 2 + (corner[1] - bg[1]) ** 2 + (corner[2] - bg[2]) ** 2,
  )));
  return { bg, spread };
}

/**
 * Key the background out of a raw RGBA buffer, in place.
 *
 * @param {Uint8Array|Buffer} data  raw RGBA, length width*height*4
 * @param {number} tolerance  colour distance treated as definitely background
 * @param {number} feather    extra distance band that gets a soft alpha ramp
 * @returns {{cleared:number, feathered:number, bg:number[], spread:number, keyed:boolean}}
 */
export function keyOutBackground(data, width, height, { tolerance = 20, feather = 24, despill = true } = {}) {
  const { bg, spread } = detectBackgroundColor(data, width, height);

  // A background that is not actually uniform is not safe to key: the corners
  // disagreeing means we would be guessing, and guessing is how the old code
  // ate the artwork. Leave the image untouched and let the caller keep the
  // opaque original rather than ship a damaged mark.
  if (spread > tolerance) {
    return { cleared: 0, feathered: 0, bg, spread, keyed: false };
  }

  const tolSq = tolerance * tolerance;
  const outerSq = (tolerance + feather) * (tolerance + feather);
  const total = width * height;
  const isBackground = new Uint8Array(total);

  // How the background is identified depends on whether it could plausibly BE
  // artwork:
  //   neutral key (white/grey) — flood fill inward from the border only, so a
  //     white region enclosed by a letterform stays opaque; it is part of the
  //     mark, not the backdrop.
  //   chroma key (saturated green) — clear it everywhere. Green is never real
  //     logo art, and a flood fill leaves opaque green trapped inside glyph
  //     counters and between letters (measured on a live render: an opaque
  //     rgb(8,125,37) pixel sitting inside the wordmark).
  const isChromaKey = Math.max(...bg) - Math.min(...bg) >= 40;

  if (isChromaKey) {
    for (let px = 0; px < total; px++) {
      if (distanceSq(data, px * 4, bg) <= tolSq) isBackground[px] = 1;
    }
  } else {
    const stack = [];
    for (let x = 0; x < width; x++) {
      stack.push(x, (height - 1) * width + x);
    }
    for (let y = 0; y < height; y++) {
      stack.push(y * width, y * width + width - 1);
    }

    while (stack.length) {
      const px = stack.pop();
      if (isBackground[px]) continue;
      if (distanceSq(data, px * 4, bg) > tolSq) continue;
      isBackground[px] = 1;
      const x = px % width;
      const y = (px - x) / width;
      if (x > 0) stack.push(px - 1);
      if (x < width - 1) stack.push(px + 1);
      if (y > 0) stack.push(px - width);
      if (y < height - 1) stack.push(px + width);
    }
  }

  let cleared = 0;
  let feathered = 0;
  // Colour to leave underneath fully-transparent pixels. A browser downscaling
  // the PNG blends neighbouring RGB regardless of alpha, so leaving the key
  // colour there fringes every edge with it — bright green haloes on a chroma
  // key, and zeroing instead just trades those for black ones. The mean of the
  // surviving artwork fringes toward the mark itself, which is invisible.
  const fill = [0, 0, 0];
  let opaqueCount = 0;
  for (let px = 0; px < total; px++) {
    if (isBackground[px]) continue;
    const i = px * 4;
    for (let c = 0; c < 3; c++) fill[c] += data[i + c];
    opaqueCount++;
  }
  if (opaqueCount) for (let c = 0; c < 3; c++) fill[c] = Math.round(fill[c] / opaqueCount);

  for (let px = 0; px < total; px++) {
    const i = px * 4;
    if (isBackground[px]) {
      data[i] = fill[0]; data[i + 1] = fill[1]; data[i + 2] = fill[2];
      data[i + 3] = 0;
      cleared++;
      continue;
    }
    // Soft rim: only pixels sitting between the key colour and the artwork, and
    // only when they touch the flood-filled region, are ramped. Everything else
    // stays fully opaque — this is the guarantee the old version lacked.
    const dSq = distanceSq(data, i, bg);
    if (dSq >= outerSq) continue;
    const x = px % width;
    const y = (px - x) / width;
    const touchesBackground = (x > 0 && isBackground[px - 1])
      || (x < width - 1 && isBackground[px + 1])
      || (y > 0 && isBackground[px - width])
      || (y < height - 1 && isBackground[px + width]);
    if (!touchesBackground) continue;
    const d = Math.sqrt(dSq);
    const ramp = (d - tolerance) / feather; // 0 at the key colour → 1 at the art
    data[i + 3] = Math.max(0, Math.min(255, Math.round(ramp * 255)));
    feathered++;
  }

  if (despill) despillTowardBackground(data, width, height, bg);
  return { cleared, feathered, bg, spread, keyed: true };
}

/**
 * Remove background colour that bled onto anti-aliased edges.
 *
 * Keying against a saturated backdrop (a green screen) leaves a rim of pixels
 * carrying that hue, which reads as a coloured halo once the mark sits on a
 * dark themed page. For each partially-transparent pixel, the channel the
 * background dominates is pulled back to the average of the other two — the
 * standard despill, and a no-op on a neutral backdrop like white, where no
 * single channel dominates.
 */
export function despillTowardBackground(data, width, height, bg, { partialOnly = false } = {}) {
  const dominant = bg.indexOf(Math.max(...bg));
  const others = [0, 1, 2].filter((c) => c !== dominant);
  // Neutral backgrounds (white/grey/black) have nothing to spill.
  if (bg[dominant] - Math.min(...bg) < 40) return 0;

  let touched = 0;
  for (let px = 0; px < width * height; px++) {
    const i = px * 4;
    const alpha = data[i + 3];
    if (alpha === 0) continue;
    // Fully-opaque pixels need despilling too against a chroma key. Where the
    // backdrop blended into dark artwork it lands far enough from pure green to
    // survive as "artwork", but it is still green fringe — 19k such pixels
    // remained inside a real wordmark when only partial pixels were treated.
    if (partialOnly && alpha === 255) continue;
    const limit = (data[i + others[0]] + data[i + others[1]]) / 2;
    if (data[i + dominant] > limit) {
      data[i + dominant] = Math.round(limit);
      touched++;
    }
  }
  return touched;
}

/**
 * Recover a TRUE alpha channel from the same artwork composited over white and
 * over black. Google's image models cannot emit alpha at all, so this is the
 * only route to correct anti-aliased and semi-transparent edges — colour
 * keying can only ever guess at them.
 *
 * For a pixel with true colour C and coverage a:
 *   over white: Cw = a*C + (1-a)*255
 *   over black: Cb = a*C
 *   subtracting: Cw - Cb = (1-a)*255   →   a = 1 - (Cw - Cb)/255
 *   and then:   C = Cb / a
 *
 * Background solves to a=0, fully opaque artwork to a=1, and a half-covered
 * edge pixel to a=0.5 — no tolerance, no flood fill, no guessing.
 *
 * The whole method depends on the two renders being the SAME artwork. When
 * they diverge, Cb comes out brighter than Cw in places, which is physically
 * impossible; that is measured here and reported so the caller can fall back
 * to keying rather than ship a mangled matte.
 *
 * @returns {{data:Uint8Array,width:number,height:number,divergence:number,opaqueRatio:number}}
 */
export function differenceMatte(whiteData, blackData, width, height) {
  const total = width * height;
  const out = new Uint8Array(total * 4);
  let ambiguous = 0;
  let opaque = 0;

  for (let px = 0; px < total; px++) {
    const i = px * 4;
    // Mean across channels: steadier than any single channel under the
    // compression noise these renders carry.
    let diff = 0;
    for (let c = 0; c < 3; c++) diff += whiteData[i + c] - blackData[i + c];
    diff /= 3;

    const a = Math.max(0, Math.min(1, 1 - diff / 255));
    if (a >= 0.996) opaque++;

    // Divergence detector. Flat logo art mattes to a near-binary alpha map —
    // solid interior, transparent exterior, and a rim only a pixel or two
    // wide. When the model redraws the mark in the second render, the two
    // images disagree over whole REGIONS and those resolve to broad mid-alpha
    // instead. Measuring that is far more sensitive than looking for pixels
    // where the black composite is brighter than the white one, which a white
    // background (already maximum brightness) essentially never produces.
    if (a > 0.15 && a < 0.85) ambiguous++;

    if (a <= 0.004) {
      out[i] = 0; out[i + 1] = 0; out[i + 2] = 0; out[i + 3] = 0;
      continue;
    }
    // Unpremultiply from the black composite, where Cb = a*C exactly.
    for (let c = 0; c < 3; c++) {
      out[i + c] = Math.max(0, Math.min(255, Math.round(blackData[i + c] / a)));
    }
    out[i + 3] = Math.round(a * 255);
  }

  return {
    data: out,
    width,
    height,
    divergence: ambiguous / total,
    opaqueRatio: opaque / total,
  };
}

/**
 * Full pipeline for one generated brand mark: key the background out, then trim
 * the now-transparent margin.
 *
 * The trim matters as much as the transparency. The model returns the mark
 * centred in a wide canvas — the SPACE skin's logo was a small glyph in a
 * 1376x768 frame — so once a theme bounds the image, the visible mark renders
 * tiny. Trimming to the artwork lets it fill its box.
 *
 * Returns a PNG buffer, or null when the image should be left as-is.
 */
export async function makeLogoTransparent(inputBuffer, sharpImpl, {
  // Deliberately tight. Generated backgrounds are near-solid, so only
  // compression noise deviates; a loose tolerance flood-fills straight through
  // pale ARTWORK (cream on white is only ~27 apart) and eats the mark.
  tolerance = 20,
  feather = 24,
  trim = true,
  minOpaqueRatio = 0.002,
} = {}) {
  const sharp = sharpImpl;
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const result = keyOutBackground(data, info.width, info.height, { tolerance, feather });
  if (!result.keyed) return { buffer: null, ...result, reason: 'background is not uniform' };

  // Refuse to ship a mark we just erased. If almost nothing survived as opaque
  // the key colour was wrong (or the art really was near-white), and the
  // untouched original is strictly better than a blank PNG.
  const opaqueRatio = 1 - result.cleared / (info.width * info.height);
  if (opaqueRatio < minOpaqueRatio) {
    return { buffer: null, ...result, reason: `only ${(opaqueRatio * 100).toFixed(2)}% of the mark survived` };
  }

  let pipeline = sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
  if (trim) pipeline = pipeline.trim({ threshold: 1 });
  return { buffer: await pipeline.png().toBuffer(), ...result, reason: null };
}

/**
 * Preferred path for a generated brand mark: difference-matte the white and
 * black renders for true edges, and fall back to keying the white render alone
 * when the two renders did not agree.
 *
 * `maxDivergence` is the share of pixels allowed to land in mid-alpha before
 * the matte is rejected. A real mark's soft rim is a small fraction of one
 * percent at generated resolutions; whole regions of mid-alpha mean the model
 * redrew the mark and the two renders cannot be subtracted.
 */
export async function buildTransparentMark(whiteBuffer, blackBuffer, sharpImpl, {
  // Measured, not guessed: a real white/black pair from the image model came
  // back with the mark drawn at a different position and scale in each run,
  // which mattes to a double-exposure ghost and scored 9.2% here. These models
  // are not deterministic enough to rely on matting, so the bar is set below
  // that — matting is now an opportunistic bonus when the renders happen to
  // line up, and keying is the path that actually carries the work.
  maxDivergence = 0.05,
  minOpaqueRatio = 0.002,
  trim = true,
} = {}) {
  const sharp = sharpImpl;

  if (blackBuffer) {
    const white = await sharp(whiteBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const black = await sharp(blackBuffer)
      // The two renders come back at whatever size the model chose; the matte
      // is per-pixel, so they must be aligned before anything is subtracted.
      .resize(white.info.width, white.info.height, { fit: 'fill' })
      .ensureAlpha().raw().toBuffer({ resolveWithObject: true });

    const matte = differenceMatte(white.data, black.data, white.info.width, white.info.height);
    if (matte.divergence <= maxDivergence && matte.opaqueRatio >= minOpaqueRatio) {
      let pipeline = sharp(matte.data, {
        raw: { width: matte.width, height: matte.height, channels: 4 },
      });
      if (trim) pipeline = pipeline.trim({ threshold: 1 });
      return {
        buffer: await pipeline.png().toBuffer(),
        method: 'difference-matte',
        divergence: matte.divergence,
        reason: null,
      };
    }
    // Fall through to keying, and say why — silently degrading quality is how
    // the previous version shipped broken marks for days without anyone knowing.
    const keyed = await makeLogoTransparent(whiteBuffer, sharp, { trim, minOpaqueRatio });
    return {
      ...keyed,
      method: keyed.buffer ? 'colour-key (matte rejected)' : 'none',
      reason: keyed.reason
        || `renders diverged (${(matte.divergence * 100).toFixed(1)}% impossible pixels)`,
    };
  }

  const keyed = await makeLogoTransparent(whiteBuffer, sharp, { trim, minOpaqueRatio });
  return { ...keyed, method: keyed.buffer ? 'colour-key' : 'none' };
}

/**
 * Locate the separate marks on a two-up brand-kit sheet.
 *
 * Operates on RGBA that has ALREADY been keyed (alpha 0 = background), and is
 * pure so it can be tested without sharp.
 *
 * The sheet is "logo lockup on the left, favicon on the right, on a solid
 * ground". Marks are found by column occupancy: a column is occupied if any
 * pixel in it is opaque. Runs of occupied columns are clusters; clusters
 * separated by less than `mergeGapRatio` of the width are merged, which fuses
 * letter- and word-spacing inside the wordmark back into one lockup while
 * leaving the much larger gap before the favicon intact. On a measured sheet
 * the inter-mark gap was ~13% of width against ~1-2% between glyphs.
 *
 * @returns {{boxes: Array<{x0:number,x1:number,y0:number,y1:number}>, reason: string|null}}
 */
export function segmentMarkBoxes(data, width, height, {
  alphaThreshold = 8,
  mergeGapRatio = 0.03,
  minAreaRatio = 0.0005,
  minLineFillRatio = 0.005,
  axis = 'x',
} = {}) {
  // Segment along `axis`; the cross axis is measured per cluster afterwards.
  // The image model does not reliably honour "logo left, favicon right" — it
  // stacks them vertically often enough (observed on mad-max and
  // paris-in-spring) that both orientations have to be supported.
  const along = axis === 'x' ? width : height;
  const across = axis === 'x' ? height : width;
  const alphaAt = (a, b) => (axis === 'x'
    ? data[(b * width + a) * 4 + 3]
    : data[(a * width + b) * 4 + 3]);

  // A line counts as occupied only if ENOUGH of it is opaque. Testing for a
  // single opaque pixel makes every line occupied on a real sheet: keying
  // leaves faint residue (edge gradients, compression noise) scattered across
  // the canvas, which merged mad-max's two stacked marks into one cluster even
  // though a 75px gap separated them.
  const minFill = Math.max(1, Math.round(across * minLineFillRatio));
  const occupied = new Uint8Array(along);
  for (let a = 0; a < along; a++) {
    let hits = 0;
    for (let b = 0; b < across; b++) {
      if (alphaAt(a, b) > alphaThreshold && ++hits >= minFill) { occupied[a] = 1; break; }
    }
  }

  const runs = [];
  let start = -1;
  for (let a = 0; a < along; a++) {
    if (occupied[a] && start === -1) start = a;
    if ((!occupied[a] || a === along - 1) && start !== -1) {
      runs.push({ a0: start, a1: occupied[a] ? a : a - 1 });
      start = -1;
    }
  }
  if (!runs.length) return { boxes: [], reason: 'sheet is empty after keying' };

  // Merge runs separated by intra-mark spacing (letter and word gaps).
  const mergeGap = Math.max(1, Math.round(along * mergeGapRatio));
  const merged = [runs[0]];
  for (let i = 1; i < runs.length; i++) {
    const prev = merged[merged.length - 1];
    if (runs[i].a0 - prev.a1 <= mergeGap) prev.a1 = runs[i].a1;
    else merged.push(runs[i]);
  }

  // Cross-axis bounds per cluster, and drop specks.
  const boxes = [];
  for (const run of merged) {
    let b0 = across; let b1 = -1;
    for (let b = 0; b < across; b++) {
      for (let a = run.a0; a <= run.a1; a++) {
        if (alphaAt(a, b) > alphaThreshold) {
          if (b < b0) b0 = b;
          if (b > b1) b1 = b;
          break;
        }
      }
    }
    if (b1 < b0) continue;
    const area = (run.a1 - run.a0 + 1) * (b1 - b0 + 1);
    if (area < width * height * minAreaRatio) continue;
    boxes.push(axis === 'x'
      ? { x0: run.a0, x1: run.a1, y0: b0, y1: b1 }
      : { x0: b0, x1: b1, y0: run.a0, y1: run.a1 });
  }

  return { boxes, reason: boxes.length ? null : 'no cluster survived the size floor' };
}

/**
 * Split a generated brand-kit sheet into its logo and favicon, WITHOUT asking
 * an image model to redraw them.
 *
 * The sheet already contains correct, on-palette, flat-vector marks — it is
 * drawn by the text-and-vector image model from an art-directed prompt. The
 * previous approach fed the sheet back to a photoreal image model as an
 * image-to-image "extraction", which does not extract: it re-generates. In a
 * measured run (2026-08-12, SELENE-1) the sheet held a clean two-colour hatch
 * emblem and the redraw returned a chrome-and-navy photograph of a porthole,
 * discarding both the flat-vector constraint and the art-directed palette.
 * Cropping the sheet is deterministic, free, instant, and preserves exactly
 * what was drawn.
 *
 * Fail-closed: anything other than a confident two-mark split returns nulls so
 * the caller keeps the existing verified asset.
 *
 * @returns {{logo: Buffer|null, favicon: Buffer|null, reason: string|null}}
 */
/**
 * Shrink a logo box that swallowed a detached decorative rule.
 *
 * A divider drawn under the wordmark occupies the SAME columns as the wordmark,
 * so column segmentation cannot separate them — it lands inside the logo's own
 * cluster and stretches the box downward (paris-in-spring: 136px of artwork in
 * a 254px box, the extra being empty space and a hairline). Row bands inside
 * the box that are both thin and clearly detached from the main body of the
 * mark are decoration, not part of it.
 *
 * Exported for testing; safe to call on any box (returns it unchanged when
 * nothing qualifies).
 */
export function trimDetachedRules(data, imageWidth, box, {
  alphaThreshold = 8,
  thinRatio = 0.06,
  gapRatio = 0.04,
} = {}) {
  const height = box.y1 - box.y0 + 1;
  const rowHas = [];
  for (let y = box.y0; y <= box.y1; y++) {
    let hit = false;
    for (let x = box.x0; x <= box.x1; x++) {
      if (data[(y * imageWidth + x) * 4 + 3] > alphaThreshold) { hit = true; break; }
    }
    rowHas.push(hit);
  }

  // Row bands within the box.
  const bands = [];
  let start = -1;
  for (let i = 0; i < rowHas.length; i++) {
    if (rowHas[i] && start === -1) start = i;
    if ((!rowHas[i] || i === rowHas.length - 1) && start !== -1) {
      bands.push({ i0: start, i1: rowHas[i] ? i : i - 1 });
      start = -1;
    }
  }
  if (bands.length < 2) return box;

  const tallest = bands.reduce((a, b) => ((b.i1 - b.i0) > (a.i1 - a.i0) ? b : a));
  const thin = Math.max(2, Math.round(height * thinRatio));
  const minGap = Math.max(2, Math.round(height * gapRatio));
  const keep = bands.filter((b) => {
    if (b === tallest) return true;
    const isThin = (b.i1 - b.i0 + 1) <= thin;
    const gap = b.i0 > tallest.i1 ? b.i0 - tallest.i1 : tallest.i0 - b.i1;
    return !(isThin && gap >= minGap);
  });

  return {
    x0: box.x0,
    x1: box.x1,
    y0: box.y0 + Math.min(...keep.map((b) => b.i0)),
    y1: box.y0 + Math.max(...keep.map((b) => b.i1)),
  };
}

export async function extractKitMarks(kitBuffer, sharpImpl, {
  tolerance = 20,
  feather = 24,
  padRatio = 0.02,
} = {}) {
  const sharp = sharpImpl;
  const { data, info } = await sharp(kitBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const keyResult = keyOutBackground(data, info.width, info.height, { tolerance, feather });
  if (!keyResult.keyed) return { logo: null, favicon: null, reason: 'brand kit background is not uniform' };

  // Count opaque pixels inside a box — its "mass". Used to tell real marks
  // from decoration: the sheet often carries a divider rule between the two
  // marks, which is a legitimate cluster but a negligible fraction of the ink.
  const massOf = (box) => {
    let n = 0;
    for (let y = box.y0; y <= box.y1; y++) {
      for (let x = box.x0; x <= box.x1; x++) if (data[(y * info.width + x) * 4 + 3] > 8) n++;
    }
    return n;
  };

  // The sheet is "logo lockup, then favicon" — side by side or stacked,
  // depending on what the image model felt like doing. The lockup is NOT
  // reliably one cluster: when the emblem sits well clear of the wordmark it
  // segments separately (olde-time-country: emblem | wordmark | GI tile). So
  // the rule is positional, not count-based — the favicon is the trailing
  // square tile, and the logo is everything before it, merged.
  const union = (list) => list.reduce((acc, b) => ({
    x0: Math.min(acc.x0, b.x0), x1: Math.max(acc.x1, b.x1),
    y0: Math.min(acc.y0, b.y0), y1: Math.max(acc.y1, b.y1),
  }));
  const aspect = (b) => (b.x1 - b.x0 + 1) / (b.y1 - b.y0 + 1);

  let split = null;
  for (const axis of ['x', 'y']) {
    const { boxes } = segmentMarkBoxes(data, info.width, info.height, { axis });
    if (boxes.length < 2) continue;
    const ordered = [...boxes].sort((a, b) => (axis === 'x' ? a.x0 - b.x0 : a.y0 - b.y0));
    const faviconBox = ordered[ordered.length - 1];
    // The trailing cluster must actually look like a favicon tile, or we are
    // about to crop the tail of a lockup and call it an icon.
    const ratio = aspect(faviconBox);
    if (ratio < 0.6 || ratio > 1.7) continue;
    // Only real lockup parts join the union. Sheets often carry a hairline
    // divider between the marks; unioning that in drags the logo's bounding
    // box down to enclose a stray rule (measured on paris-in-spring: 494x136
    // of artwork became a 501x254 box with a floating line under it).
    const parts = ordered.slice(0, -1).map((b) => ({ ...b, mass: massOf(b) }));
    const heaviest = Math.max(...parts.map((b) => b.mass));
    const lockup = parts.filter((b) => b.mass >= heaviest * 0.03);
    const logoBox = trimDetachedRules(data, info.width, union(lockup));
    // A lockup is wider than its own favicon; if it is not, the split is wrong.
    if ((logoBox.x1 - logoBox.x0) <= (faviconBox.x1 - faviconBox.x0)) continue;
    if (!massOf(logoBox) || !massOf(faviconBox)) continue;
    split = { logoBox, faviconBox };
    break;
  }

  if (!split) {
    return { logo: null, favicon: null, reason: 'sheet does not separate into a logo lockup and a favicon tile' };
  }
  const { logoBox, faviconBox } = split;

  const cut = async (box) => {
    const pad = Math.round(Math.min(info.width, info.height) * padRatio);
    const left = Math.max(0, box.x0 - pad);
    const top = Math.max(0, box.y0 - pad);
    const width = Math.min(info.width - left, box.x1 - box.x0 + 1 + pad * 2);
    const height = Math.min(info.height - top, box.y1 - box.y0 + 1 + pad * 2);
    return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
      .extract({ left, top, width, height })
      .png()
      .toBuffer();
  };

  return { logo: await cut(logoBox), favicon: await cut(faviconBox), reason: null };
}
