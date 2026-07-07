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

async function run() {
  const prompt = "A perfectly square, perfectly centered, flat 2D app icon on a pure white background. The icon is JUST the lowercase letter 'g' followed immediately by a period ('g.'). CRITICAL: Bold, heavy vintage mechanical typewriter font. The 'g' is pure black. The period is BRIGHT VIBRANT ORANGE. NO other symbols or graphics. Just 'g.' perfectly centered.";
  
  const parts = await geminiApiCall('gemini-3.1-flash-lite-image', {
    contents: [{ parts: [{text: prompt}] }],
    generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
  });
  
  for (const part of parts) {
    if (part.inlineData?.data && part.inlineData?.mimeType) {
      const buf = Buffer.from(part.inlineData.data, 'base64');
      await writeFile("assets/favicon.png", buf);
      console.log(`  → saved assets/favicon.png`);
      return;
    }
  }
}

run().catch(console.error);
