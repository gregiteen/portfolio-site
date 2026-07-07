import { writeFile } from 'node:fs/promises';
import https from 'node:https';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';

function geminiApiCall(model, bodyObj) {
  return new Promise((resolve, reject) => {
    if (!GOOGLE_API_KEY) return reject(new Error('GOOGLE_API_KEY not set'));
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_API_KEY}`;
    const body = JSON.stringify(bodyObj);
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (!json.candidates?.[0]?.content?.parts) {
            return reject(new Error(`Gemini API error: ${data.slice(0, 300)}`));
          }
          resolve(json.candidates[0].content.parts);
        } catch (e) {
          reject(new Error(`Failed to parse Gemini response: ${String(e)}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(180_000, () => { req.destroy(); reject(new Error('Gemini API timeout')); });
    req.write(body);
    req.end();
  });
}

async function generateImageParts(requestParts, outputPath, label) {
  const parts = await geminiApiCall('gemini-3.1-flash-lite-image', {
    contents: [{ parts: requestParts }],
    generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
  });
  for (const part of parts) {
    if (part.inlineData?.data && part.inlineData?.mimeType) {
      const buf = Buffer.from(part.inlineData.data, 'base64');
      await writeFile(outputPath, buf);
      console.log(`  → saved ${outputPath} (${Math.round(buf.length / 1024)}KB)`);
      return true;
    }
  }
  console.warn(`  ⚠ No image data for: ${label.slice(0, 80)}`);
  return false;
}

async function run() {
  const ssssBase = "A professional tech startup logo lockup for 'SSSS'. Layout: A highly creative, small distinct symbol on the far left, followed immediately on the right by the exact text 'SSSS' written in a cool, modern, sleek font. Standard corporate lockup on a pure white background. Flat vector graphic style. NO SERVICE MARKS. NO EXTRA TEXT.";
  await generateImageParts([{text: `${ssssBase} Variation 1: Symbol is an abstract origami fold in neon blue and purple.`}], "assets/logos/ssss_lockup_1.jpg", "SSSS 1");
  await generateImageParts([{text: `${ssssBase} Variation 2: Symbol is a sleek geometric mesh in dark charcoal and crimson.`}], "assets/logos/ssss_lockup_2.jpg", "SSSS 2");
  await generateImageParts([{text: `${ssssBase} Variation 3: Symbol is a minimalist continuous line knot in emerald green.`}], "assets/logos/ssss_lockup_3.jpg", "SSSS 3");
  
  const trBase = "A professional tech startup logo lockup for 'TOTAL RECALL'. Layout: A highly creative, small distinct symbol on the far left, followed immediately on the right by the exact text 'TOTAL RECALL' written in a cool, modern, sleek font. Standard corporate lockup on a pure white background. Flat vector graphic style. NO SERVICE MARKS. NO EXTRA TEXT.";
  await generateImageParts([{text: `${trBase} Variation 1: Symbol is an elegant, abstract golden brain/tree-ring hybrid.`}], "assets/logos/tr_lockup_1.jpg", "TR 1");
  await generateImageParts([{text: `${trBase} Variation 2: Symbol is a minimal cybernetic eye or lens in stark black and cyan.`}], "assets/logos/tr_lockup_2.jpg", "TR 2");
  await generateImageParts([{text: `${trBase} Variation 3: Symbol is an infinity loop intersecting a memory disk in deep violet.`}], "assets/logos/tr_lockup_3.jpg", "TR 3");
  
  console.log("Done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
