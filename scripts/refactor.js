import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('scripts/compile-theme.mjs', 'utf8');

const newGenLogic = `  // ── Phase 2: Theme generation (lazy loaded + analyze & improve) ──
  console.log(\`[2/3] Theme generation (multi-pass lazy loading)…\`);

  const frontendSkillPath = join(__dirname, '..', '.agent', 'skills', 'frontend-design', 'SKILL.md');
  const frontendSkill = await import('node:fs/promises').then(m => m.readFile(frontendSkillPath, 'utf8')).catch(() => '');

  const baseContext = \`You are the design lead at a boutique studio. Every site you ship has a visual identity so specific it could never be mistaken for a template. You are designing for a REAL client — Greg Iteen, a full-stack engineer who builds sovereign, file-native AI systems.

THE BRIEF: "\${prompt}"

FRONTEND DESIGN PRINCIPLES & GUIDANCE:
\${frontendSkill}

SITE CONTEXT:
\${SITE_CONTEXT}

PLACEHOLDER CONTRACT:
\${placeholderContract}

IMAGES (already generated, use them):
- /assets/gen-logo.png — GI monogram, transparent PNG. Use as logo.
- /assets/favicon.png — GI favicon. Use in <link rel="icon">.
- /assets/gen-hero.jpg — hero background. Use prominently.
- /assets/gen-portrait.jpg — portrait of Greg restyled to match this theme. It appears inside page content (class .md-img) on the contact page — style it to sit well in your layout.
\`;

  async function callAgent(p) {
    if (GOOGLE_API_KEY) {
      try {
        const raw = await geminiText(p);
        console.log(\`  → API response (\${Math.round(raw.length / 1024)}KB)\`);
        return raw;
      } catch (err) {
        console.warn(\`  ⚠ API failed (\${err.message}), falling back to CLI…\`);
      }
    }
    return executeAgentCall(p);
  }

  // Pass 1: Base CSS & Core Pages
  console.log('  → Pass 1: DESIGN.md, CSS, home, projects_index');
  let raw1 = await callAgent(\`\${baseContext}\n\nOUTPUT: One JSON object. Generate the DESIGN.md, the complete CSS, and the first 2 pages (home, projects_index):\n{
  "name": "Short Theme Name",
  "accent": "#rrggbb",
  "designSpec": "A strict Google Standard DESIGN.md file format...",
  "css": "…complete stylesheet…",
  "layouts": { "home": "…", "projects_index": "…" }
}\`);
  let payload = extractJson(raw1);

  // Pass 2: Next 2 pages
  console.log('  → Pass 2: designs_index, project_detail');
  let raw2 = await callAgent(\`\${baseContext}\n\nHere is the base theme generated so far:\n\` + JSON.stringify(payload) + \`\n\nOUTPUT: One JSON object containing ONLY the next 2 layouts (designs_index, project_detail):\n{
  "layouts": { "designs_index": "…", "project_detail": "…" }
}\`);
  let payload2 = extractJson(raw2);
  Object.assign(payload.layouts, payload2.layouts);

  // Pass 3: Next 2 pages
  console.log('  → Pass 3: design_detail, page');
  let raw3 = await callAgent(\`\${baseContext}\n\nHere is the base theme generated so far:\n\` + JSON.stringify(payload) + \`\n\nOUTPUT: One JSON object containing ONLY the next 2 layouts (design_detail, page):\n{
  "layouts": { "design_detail": "…", "page": "…" }
}\`);
  let payload3 = extractJson(raw3);
  Object.assign(payload.layouts, payload3.layouts);

  // Pass 4: Remaining items
  console.log('  → Pass 4: project_item, design_item, nav_item');
  let raw4 = await callAgent(\`\${baseContext}\n\nHere is the base theme generated so far:\n\` + JSON.stringify(payload) + \`\n\nOUTPUT: One JSON object containing ONLY the remaining item layouts:\n{
  "layouts": { "project_item": "…", "design_item": "…", "nav_item": "…" }
}\`);
  let payload4 = extractJson(raw4);
  Object.assign(payload.layouts, payload4.layouts);

  // Pass 5: Analyze and Improve
  console.log('  → Pass 5: Analyze & Improve (Cleanup)');
  let raw5 = await callAgent(\`\${baseContext}\n\nYou have generated a full theme. Here is the complete assembled JSON:\n\` + JSON.stringify(payload) + \`\n\nANALYZE AND IMPROVE: Make a second pass to clean everything up. Check for unclosed HTML tags, ensure CSS classes match the layouts, and ensure the design principles and DESIGN.md constraints were perfectly followed. Improve any sloppy areas.\n\nOUTPUT: The FINAL cleaned up, validated JSON object with all fields:\n{ "name": "...", "accent": "...", "designSpec": "...", "css": "...", "layouts": { ...all 9 layouts... } }\`);
  
  let finalPayload = extractJson(raw5);
  let verdict = validateThemePayload(finalPayload, { strict: true });
  
  if (!verdict.theme) {
    console.log('  → Repairing final validation errors...');
    let raw6 = await callAgent(\`Fix these JSON problems:\\n\${verdict.errors.join('\\n')}\\n\\nRespond ONLY with corrected JSON.\\n\\nPrevious:\\n\${JSON.stringify(finalPayload).slice(0, 50000)}\`);
    finalPayload = extractJson(raw6);
    verdict = validateThemePayload(finalPayload, { strict: false });
  }

  if (!verdict.theme) throw new Error(\`Theme failed: \${verdict.errors.join('; ')}\`);
  for (const w of verdict.warnings) console.warn(\`  ⚠ \${w}\`);
  const theme = verdict.theme;
  payload = finalPayload;`;

// Replace from "// ── Phase 2" up to "// Wait for images"
const startIndex = content.indexOf('  // ── Phase 2: Theme generation');
const endIndex = content.indexOf('  // Wait for images');

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find start or end index");
    process.exit(1);
}

const finalContent = content.slice(0, startIndex) + newGenLogic + '\n' + content.slice(endIndex);
writeFileSync('scripts/compile-theme.mjs', finalContent);
console.log("Refactored successfully.");
