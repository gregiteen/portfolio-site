// Shared image-generation helper: renders one image via Fal and writes it to
// disk in the right format. Used by compile-theme.mjs (hero/portrait/brand
// marks) and by standalone tools that need to regenerate a single asset
// (e.g. regenerate-brand-marks.mjs) without pulling in the whole theme
// pipeline, which runs unconditionally on import.
import { writeFile, readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { callFalImage, IMAGE_MODEL } from './openrouter.mjs';

export async function generateImage(imagePrompt, outputPath, baseImagePath = null, model = IMAGE_MODEL) {
  let imageUrl = null;
  if (baseImagePath) {
    // Fal accepts data URIs for image_url
    const mimeType = /\.png$/i.test(baseImagePath) ? 'image/png' : 'image/jpeg';
    const data = (await readFile(baseImagePath)).toString('base64');
    imageUrl = `data:${mimeType};base64,${data}`;
  }
  const filename = outputPath.split('/').pop() || '';
  const aspectRatio = filename.startsWith('hero') || filename.startsWith('logo') || filename.startsWith('brandkit')
    ? '16:9'
    : filename.startsWith('portrait') ? '3:4' : '1:1';
  const result = await callFalImage({
    model,
    prompt: imagePrompt,
    imageUrl,
    aspectRatio,
  });
  const sharp = (await import('sharp')).default;
  let output = result.buffer;
  if (/\.jpe?g$/i.test(extname(outputPath))) {
    output = await sharp(output).jpeg({ quality: 90 }).toBuffer();
  } else if (/\.png$/i.test(extname(outputPath))) {
    output = await sharp(output).png().toBuffer();
  }
  await writeFile(outputPath, output);
  console.log(`  → Fal ${model} saved ${outputPath} (${Math.round(output.length / 1024)}KB)`);
  return true;
}
