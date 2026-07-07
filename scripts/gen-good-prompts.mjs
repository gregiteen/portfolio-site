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
  const ssssPrompt = "A brilliant, high-end professional corporate logo design on a pure white background. The layout MUST be a standard horizontal lockup: on the left, a small, highly creative, minimalist, beautiful, vector-style abstract icon symbol. Next to the symbol on the right, the exact word 'SSSS' written in an incredibly cool, sleek, modern, bold sans-serif font. The typography must be flawless. NO extra text, NO service marks, NO messy artifacts. A masterpiece of branding and graphic design.";
  
  await generateImageParts([{text: `${ssssPrompt} Theme: Electric blue and silver geometric tech.`}], "assets/logos/ssss_good_1.jpg", "SSSS 1");
  await generateImageParts([{text: `${ssssPrompt} Theme: Dark crimson and black sleek cyber styling.`}], "assets/logos/ssss_good_2.jpg", "SSSS 2");
  await generateImageParts([{text: `${ssssPrompt} Theme: Minimalist monochrome, pure black and white.`}], "assets/logos/ssss_good_3.jpg", "SSSS 3");
  
  const trPrompt = "A brilliant, high-end professional corporate logo design on a pure white background. The layout MUST be a standard horizontal lockup: on the left, a small, highly creative, minimalist, beautiful, vector-style abstract icon symbol representing memory or an hourglass. Next to the symbol on the right, the exact words 'TOTAL RECALL' written in an incredibly cool, sleek, modern, bold sans-serif font. The typography must be flawless. NO extra text, NO service marks, NO messy artifacts. A masterpiece of branding and graphic design.";
  
  await generateImageParts([{text: `${trPrompt} Theme: Deep violet and gold.`}], "assets/logos/tr_good_1.jpg", "TR 1");
  await generateImageParts([{text: `${trPrompt} Theme: Stark black and cyan.`}], "assets/logos/tr_good_2.jpg", "TR 2");
  await generateImageParts([{text: `${trPrompt} Theme: Minimalist charcoal grey.`}], "assets/logos/tr_good_3.jpg", "TR 3");
  
  console.log("Done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
