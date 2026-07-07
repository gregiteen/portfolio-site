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
  console.log("Generating 3 SSSS logos...");
  await generateImageParts([{text: "A highly creative, stunning, professional app icon logo for 'SSSS'. Exact text 'SSSS' integrated perfectly into an elegant, abstract geometric structure. NO SERVICE MARKS. Variation 1: Bright red and blue primary colors on white."}], "assets/logos/ssss_1.jpg", "SSSS 1");
  await generateImageParts([{text: "A highly creative, stunning, professional app icon logo for 'SSSS'. Exact text 'SSSS' integrated perfectly into an elegant, abstract geometric structure. NO SERVICE MARKS. Variation 2: Deep navy, emerald, and gold, highly sophisticated."}], "assets/logos/ssss_2.jpg", "SSSS 2");
  await generateImageParts([{text: "A highly creative, stunning, professional app icon logo for 'SSSS'. Exact text 'SSSS' integrated perfectly into an elegant, abstract geometric structure. NO SERVICE MARKS. Variation 3: Stark, monochrome architectural blueprint style, white on black."}], "assets/logos/ssss_3.jpg", "SSSS 3");
  
  console.log("Generating 3 Total Recall logos...");
  await generateImageParts([{text: "A highly creative, stunning, professional app icon logo for 'TOTAL RECALL'. Exact text 'TOTAL RECALL' integrated perfectly into a beautiful visual representing memory. NO SERVICE MARKS. Variation 1: Organic layers of amber and stone."}], "assets/logos/total_recall_1.jpg", "TOTAL RECALL 1");
  await generateImageParts([{text: "A highly creative, stunning, professional app icon logo for 'TOTAL RECALL'. Exact text 'TOTAL RECALL' integrated perfectly into a beautiful visual representing memory. NO SERVICE MARKS. Variation 2: A sleek, minimal architectural archway casting a long shadow."}], "assets/logos/total_recall_2.jpg", "TOTAL RECALL 2");
  await generateImageParts([{text: "A highly creative, stunning, professional app icon logo for 'TOTAL RECALL'. Exact text 'TOTAL RECALL' integrated perfectly into a beautiful visual representing memory. NO SERVICE MARKS. Variation 3: Deep space obsidian and glowing silver dust."}], "assets/logos/total_recall_3.jpg", "TOTAL RECALL 3");
  
  console.log("Done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
