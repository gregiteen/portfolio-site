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
  const ssssPrompt = "A concept sheet showing exactly 4 different logo variations arranged in a 2x2 grid. Each of the 4 logos must be a perfectly proportioned lockup on a white background: a small flat 2D symbol on the left, and the lowercase text 'ssss' on the right. CRITICAL: NO ALL CAPS. Text must be lowercase 'ssss'. Perfect proportions between symbol and text. Flat colors, no 3D shading, no service marks.";
  await generateImageParts([{text: ssssPrompt}], "assets/logos/ssss_grid.jpg", "SSSS Grid");
  
  const trPrompt = "A concept sheet showing exactly 4 different logo variations arranged in a 2x2 grid. Each of the 4 logos must be a perfectly proportioned lockup on a white background: a small flat 2D symbol on the left, and the title-case text 'Total Recall' on the right. CRITICAL: NO ALL CAPS. Text must be 'Total Recall'. Perfect proportions between symbol and text. Flat colors, no 3D shading, no service marks.";
  await generateImageParts([{text: trPrompt}], "assets/logos/tr_grid.jpg", "TR Grid");
  
  console.log("Done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
