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
