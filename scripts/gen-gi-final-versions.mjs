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

async function generateImageParts(prompt, outputPath, label) {
  const parts = await geminiApiCall('gemini-3.1-flash-lite-image', {
    contents: [{ parts: [{text: prompt}] }],
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
  console.log("Generating Main Logo (B&W)...");
  await generateImageParts(
    "A perfectly centered, large professional wordmark logo taking up the entire image (NO GRID, JUST ONE LOGO). ONLY the text 'greg.iteen' on a PURE WHITE background. Bold, heavy vintage mechanical typewriter font. THE ENTIRE IMAGE IS PURE MONOCHROME. The text and period are pure black. NO colors, NO standard symbols, NO icons.", 
    "static/gi-logo-bw.jpg", 
    "Main Logo BW"
  );
  
  console.log("Generating Main Logo (W&B)...");
  await generateImageParts(
    "A perfectly centered, large professional wordmark logo taking up the entire image (NO GRID, JUST ONE LOGO). ONLY the text 'greg.iteen' on a PURE BLACK background. Bold, heavy vintage mechanical typewriter font. THE ENTIRE IMAGE IS PURE MONOCHROME. The text and period are pure white. NO colors, NO standard symbols, NO icons.", 
    "static/gi-logo-wb.jpg", 
    "Main Logo WB"
  );
  
  console.log("Generating Favicon (B&W)...");
  await generateImageParts(
    "A perfectly square, perfectly centered, flat 2D app icon taking up the entire image (NO GRID). The icon is JUST the lowercase text 'g.i' (lowercase g, period, lowercase i) on a PURE WHITE background. Bold, heavy vintage mechanical typewriter font. THE ENTIRE IMAGE IS PURE MONOCHROME. The letters and period are pure black. NO colors, NO other symbols.", 
    "assets/favicon-bw_temp.jpg", 
    "Favicon BW"
  );
  
  console.log("Generating Favicon (W&B)...");
  await generateImageParts(
    "A perfectly square, perfectly centered, flat 2D app icon taking up the entire image (NO GRID). The icon is JUST the lowercase text 'g.i' (lowercase g, period, lowercase i) on a PURE BLACK background. Bold, heavy vintage mechanical typewriter font. THE ENTIRE IMAGE IS PURE MONOCHROME. The letters and period are pure white. NO colors, NO other symbols.", 
    "assets/favicon-wb_temp.jpg", 
    "Favicon WB"
  );
  
  console.log("Done generating files.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
