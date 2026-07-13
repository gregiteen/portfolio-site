const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'compile-theme.mjs');
let content = fs.readFileSync(file, 'utf8');

const brokenChunk = `      // AUTOMATED FEEDBACK LOOP
      if (allEncounteredIssues.size > 0) {
          brainStr += '\\n\\n## KNOWN FAILURE PATTERNS (AVOID THESE AT ALL COSTS)\\nBased on past failures, you MUST explicitly order your specialists to prevent the following layout bugs:\\n';
        }
        const newFailures = [...allEncounteredIssues].map((i) => \`\\n- AUTO-LOGGED MISTAKE: \${i}\`).join('');
        await writeFile(brainPath, brainStr + newFailures, 'utf8');
        console.log(\`  → Automated Feedback Loop: Injected \${allEncounteredIssues.size} new failure constraints into the Orchestrator's brain for future runs.\`);
      }
    }`;

const fixedChunk = `      // AUTOMATED FEEDBACK LOOP
      if (allEncounteredIssues.size > 0) {
        const pitPath = join(__dirname, 'lib', 'pitfalls.md');
        const currentPitfalls = await import('node:fs/promises').then(m => m.readFile(pitPath, 'utf8')).catch(() => '');
        
        const synthesisPrompt = \`You are the core memory bank for an AI website builder.
Your job is to update the system's "Pitfalls" document with new failures so they never happen again.
NEVER drop existing rules. Always keep the rules that are working.
Consolidate highly specific errors into broader, overarching constraints (e.g., instead of two separate rules about overlapping buttons on mobile, write one strict rule about mobile flex-wrapping).
Remove exact duplicates, but preserve all unique constraints.
Format as a clean markdown list.

CURRENT PITFALLS DOC:
\${currentPitfalls}

NEW FAILURES FROM THIS RUN:
\${[...allEncounteredIssues].map(i => '- ' + i).join('\\n')}

Output ONLY the completely updated markdown list.\`;

        try {
          const updatedPitfalls = await callAgent(synthesisPrompt, null, 4096, null, 'gemini-3.1-pro-preview');
          await writeFile(pitPath, updatedPitfalls.trim(), 'utf8');
          console.log(\`  → Automated Feedback Loop: Synthesized \${allEncounteredIssues.size} new failure constraints into pitfalls.md for future runs.\`);
        } catch (err) {
          console.warn(\`  ⚠ Automated Feedback Loop failed to synthesize pitfalls: \${err}\`);
        }
      }
    }`;

if (content.includes(brokenChunk)) {
  fs.writeFileSync(file, content.replace(brokenChunk, fixedChunk), 'utf8');
  console.log('Successfully fixed compile-theme.mjs');
} else {
  console.log('Broken chunk not found. Could not fix.');
}
