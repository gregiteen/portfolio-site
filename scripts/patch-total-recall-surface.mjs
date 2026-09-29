import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const packageDir = path.join(repoRoot, 'node_modules', 'total-recall-brain');
const packageJsonPath = path.join(packageDir, 'package.json');
const surfacePath = path.join(packageDir, 'src', 'core', 'surface.mjs');
const layeringPatchMarker = 'portfolio-site compatibility: project surfaces inherit active global directives';
const priorityPatchMarker = 'portfolio-site compatibility: project directives win capped-surface ties';
const whitespacePatchMarker = 'portfolio-site compatibility: multiline directives avoid whitespace-only lines';

if (!fs.existsSync(packageJsonPath) || !fs.existsSync(surfacePath)) {
  console.log('Total Recall is not installed; skipping the project-surface compatibility patch.');
  process.exit(0);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
let source = fs.readFileSync(surfacePath, 'utf8');

let changed = false;

if (!source.includes(layeringPatchMarker)) {
  const replacements = [
    {
      before: "import { loadSkills, atomicWrite, walkMd } from './vault.mjs';",
      after: "import { loadSkills, atomicWrite, walkMd, loadMergedNodes } from './vault.mjs';",
    },
    {
      before: `/**
 * Main surface compilation entry point.
 */
export async function compileSurface({ vaultDir, skillsDir, derivedDir, instructionsFile, force = false }) {
  const nodes = getNodes(vaultDir);`,
      after: `/**
 * Resolve the global vault inherited by a project instruction surface.
 * Indexes remain project-local; only active directives are layered.
 */
function inheritedGlobalVault(vaultDir, configuredGlobalVaultDir) {
  const selectedVaultDir = path.resolve(vaultDir);
  const brainDir = path.dirname(selectedVaultDir);
  const skillsDir = path.dirname(brainDir);
  const agentDir = path.dirname(skillsDir);
  const isProjectVault = path.basename(selectedVaultDir) === 'memory-vault'
    && path.basename(brainDir) === 'total-recall'
    && path.basename(skillsDir) === 'skills'
    && ['.agent', '.agents'].includes(path.basename(agentDir));

  if (!isProjectVault) return null;

  const globalAgentDir = process.env.AGENT_DIR || path.join(os.homedir(), '.agent');
  const globalVaultDir = path.resolve(
    configuredGlobalVaultDir
      || path.join(globalAgentDir, 'skills', 'total-recall', 'memory-vault'),
  );

  if (globalVaultDir === selectedVaultDir || !fs.existsSync(globalVaultDir)) return null;
  return globalVaultDir;
}

// ${layeringPatchMarker}
export function loadSurfaceNodes(vaultDir, { globalVaultDir } = {}) {
  const inheritedVaultDir = inheritedGlobalVault(vaultDir, globalVaultDir);
  return inheritedVaultDir
    ? loadMergedNodes(inheritedVaultDir, vaultDir)
    : getNodes(vaultDir);
}

/**
 * Main surface compilation entry point.
 */
export async function compileSurface({ vaultDir, skillsDir, derivedDir, instructionsFile, force = false, globalVaultDir }) {
  const nodes = getNodes(vaultDir);
  const inheritedVaultDir = inheritedGlobalVault(vaultDir, globalVaultDir);
  const surfaceNodes = inheritedVaultDir
    ? loadMergedNodes(inheritedVaultDir, vaultDir)
    : nodes;`,
    },
    {
      before: '  const currentHash = computeVaultHash(vaultDir);',
      after: '  const currentHash = computeVaultHash(vaultDir, inheritedVaultDir);',
    },
    {
      before: '  const skillsInjected = await compilePointers(instructionsFile, skillsDir, nodes, { vaultDir, derivedDir, force });',
      after: '  const skillsInjected = await compilePointers(instructionsFile, skillsDir, surfaceNodes, { vaultDir, derivedDir, force });',
    },
    {
      before: `function computeVaultHash(vaultDir) {
  const files = walkMd(vaultDir).sort();`,
      after: `function computeVaultHash(...vaultDirs) {
  const files = [...new Set(
    vaultDirs.filter(Boolean).flatMap(vaultDir => walkMd(vaultDir)),
  )].sort();`,
    },
  ];

  for (const { before, after } of replacements) {
    if (!source.includes(before)) {
      throw new Error(
        `Total Recall ${packageJson.version} no longer matches the expected surface compiler. `
        + 'Refusing to apply a partial compatibility patch.',
      );
    }
    source = source.replace(before, after);
  }
  changed = true;
}

if (!source.includes(priorityPatchMarker)) {
  const before = `    const sorted = [...list].sort((a, b) => {
      const aAbs = a.priority === 'absolute' ? 10 : 0;
      const bAbs = b.priority === 'absolute' ? 10 : 0;
      const aScore = (a.importance || 3) + aAbs;
      const bScore = (b.importance || 3) + bAbs;
      return bScore - aScore;
    });`;
  const after = `    const sorted = [...list].sort((a, b) => {
      // ${priorityPatchMarker}
      const aProject = a._layer === 'project' ? 1 : 0;
      const bProject = b._layer === 'project' ? 1 : 0;
      if (aProject !== bProject) return bProject - aProject;

      const aAbs = a.priority === 'absolute' ? 10 : 0;
      const bAbs = b.priority === 'absolute' ? 10 : 0;
      const aScore = (a.importance || 3) + aAbs;
      const bScore = (b.importance || 3) + bAbs;
      return bScore - aScore;
    });`;
  if (!source.includes(before)) {
    throw new Error(
      `Total Recall ${packageJson.version} no longer matches the expected directive ranker. `
      + 'Refusing to apply a partial compatibility patch.',
    );
  }
  source = source.replace(before, after);
  changed = true;
}

if (!source.includes(whitespacePatchMarker)) {
  const before = `      const lines = text.split('\\n');
      if (lines.length > 1) {
        return \`\${prefix}\${title}:\\n  \${lines.map(l => l.trim()).join('\\n  ')}\`;
      }`;
  const after = `      const lines = text.split('\\n');
      if (lines.length > 1) {
        // ${whitespacePatchMarker}
        const indented = lines.map((line) => {
          const trimmed = line.trim();
          return trimmed ? \`  \${trimmed}\` : '';
        });
        return \`\${prefix}\${title}:\\n\${indented.join('\\n')}\`;
      }`;
  if (!source.includes(before)) {
    throw new Error(
      `Total Recall ${packageJson.version} no longer matches the expected multiline compactor. `
      + 'Refusing to apply a partial compatibility patch.',
    );
  }
  source = source.replace(before, after);
  changed = true;
}

if (!changed) {
  console.log(`Total Recall ${packageJson.version} project-surface compatibility patch already applied.`);
  process.exit(0);
}

const temporaryPath = `${surfacePath}.patch-${process.pid}`;
fs.writeFileSync(temporaryPath, source, 'utf8');
fs.renameSync(temporaryPath, surfacePath);
console.log(`Patched Total Recall ${packageJson.version} project-surface directive layering.`);
