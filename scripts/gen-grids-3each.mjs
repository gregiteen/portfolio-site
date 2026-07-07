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
  const ssssBase = "A concept sheet showing exactly 4 different professional logo variations arranged in a 2x2 grid. Each logo is a perfectly proportioned lockup: small flat 2D symbol on the left, and lowercase text 'ssss' on the right. NO ALL CAPS. Flat colors, no 3D shading.";
  await generateImageParts([{text: `${ssssBase} Theme: Modern tech startup, vibrant blues and purples, abstract geometric nodes.`}], "assets/logos/ssss_grid_1.jpg", "SSSS Grid 1");
  await generateImageParts([{text: `${ssssBase} Theme: Clean eco-friendly software, mint greens and soft greys, organic leaf-like data symbols.`}], "assets/logos/ssss_grid_2.jpg", "SSSS Grid 2");
  await generateImageParts([{text: `${ssssBase} Theme: Aggressive cybersecurity, dark charcoal and crimson red, sharp angular shield symbols.`}], "assets/logos/ssss_grid_3.jpg", "SSSS Grid 3");
  
  const trBase = "A concept sheet showing exactly 4 different professional logo variations arranged in a 2x2 grid. Each logo is a perfectly proportioned lockup: small flat 2D symbol on the left, and title-case text 'Total Recall' on the right. NO ALL CAPS. Flat colors, no 3D shading.";
  await generateImageParts([{text: `${trBase} Theme: Premium luxury tech, metallic gold and deep navy, elegant sweeping infinity loops.`}], "assets/logos/tr_grid_1.jpg", "TR Grid 1");
  await generateImageParts([{text: `${trBase} Theme: Clinical medical data, pure white and cerulean blue, minimalist neural pathways.`}], "assets/logos/tr_grid_2.jpg", "TR Grid 2");
  await generateImageParts([{text: `${trBase} Theme: Retro archival, sepia and dusty orange, stylized vintage filing cabinet or rolodex symbols.`}], "assets/logos/tr_grid_3.jpg", "TR Grid 3");
  
  console.log("Done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
