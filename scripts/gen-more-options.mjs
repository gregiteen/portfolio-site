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
  const ssssBase = "A masterpiece corporate logo lockup on a pure white background. Left: A highly creative, distinct, small vector symbol. Right: The exact word 'SSSS' in a flawless font. NO service marks. NO extra text.";
  await generateImageParts([{text: `${ssssBase} Style: Glassmorphism. Symbol is translucent frosted glass. Text is elegant and modern.`}], "assets/logos/ssss_more_1.jpg", "SSSS 1");
  await generateImageParts([{text: `${ssssBase} Style: 70s Vintage. Symbol is warm sunset geometric shapes. Text is a bold, retro serif.`}], "assets/logos/ssss_more_2.jpg", "SSSS 2");
  await generateImageParts([{text: `${ssssBase} Style: Ultra-minimalist Swiss. Symbol is a perfect red circle. Text is flawless, bold Helvetica-style.`}], "assets/logos/ssss_more_3.jpg", "SSSS 3");
  
  const trBase = "A masterpiece corporate logo lockup on a pure white background. Left: A highly creative, distinct, small vector symbol representing memory or time. Right: The exact words 'TOTAL RECALL' in a flawless font. NO service marks. NO extra text.";
  await generateImageParts([{text: `${trBase} Style: Soft & Delicate. Symbol is a beautiful, minimalist watercolor droplet. Text is an elegant, thin serif font.`}], "assets/logos/tr_more_1.jpg", "TR 1");
  await generateImageParts([{text: `${trBase} Style: Museum Classic. Symbol is a minimalist marble-textured geometric stone. Text is a classic, sophisticated museum-style font.`}], "assets/logos/tr_more_2.jpg", "TR 2");
  await generateImageParts([{text: `${trBase} Style: Sleek Organic. Symbol is an elegant, sweeping metallic gold curve. Text is a sleek, futuristic sans-serif.`}], "assets/logos/tr_more_3.jpg", "TR 3");
  
  console.log("Done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
