#!/usr/bin/env node
/**
 * validate-skills.mjs — structural audit of .agent/skills/ against the required format.
 *
 * Usage:
 *   node .agent/skills/skill-creator/scripts/validate-skills.mjs          # all skills
 *   node .agent/skills/skill-creator/scripts/validate-skills.mjs <name>   # one skill
 *
 * Checks, per skill:
 *   - SKILL.md frontmatter: only name+description, name matches folder, description
 *     is trigger-optimized (<1024 chars) and non-empty
 *   - all five directories (scripts/references/subagents/hooks/evals) exist with
 *     at least one real file (.gitkeep alone doesn't count)
 *   - evals/evals.json parses as an array of ≥3 {name, assertion} entries
 *   - every .mjs/.js in the skill passes `node --check`; every .sh passes `bash -n`
 *   - no scaffold TODO markers left behind
 *   - .gitignore allowlists the skill (otherwise it is silently untracked)
 *   - .claude/skills/<name> symlink exists for IDE discovery
 *
 * External symlinked skills (e.g. total-recall) are reported and skipped — they
 * have their own lifecycle. Exit 1 if any skill has errors, so this can gate a
 * commit via hooks/pre-commit-validate.sh.
 */
import { readdirSync, readFileSync, lstatSync, statSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../../');
const SKILLS_DIR = path.join(ROOT, '.agent/skills');
const REQUIRED_DIRS = ['scripts', 'references', 'subagents', 'hooks', 'evals'];

const only = process.argv[2];
let totalErrors = 0;
let totalWarnings = 0;

function realFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.name !== '.gitkeep' && e.name !== '.DS_Store')
    .map((e) => e.name);
}

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.isFile()) out.push(p);
  }
  return out;
}

const gitignore = existsSync(path.join(ROOT, '.gitignore'))
  ? readFileSync(path.join(ROOT, '.gitignore'), 'utf8')
  : '';

const entries = readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter((e) => !e.name.startsWith('.'))
  .filter((e) => (only ? e.name === only : true));

if (only && entries.length === 0) {
  console.error(`No skill named '${only}' in ${SKILLS_DIR}`);
  process.exit(1);
}

for (const entry of entries) {
  const skillPath = path.join(SKILLS_DIR, entry.name);
  const errors = [];
  const warnings = [];

  if (lstatSync(skillPath).isSymbolicLink()) {
    console.log(`↷ ${entry.name} — external symlink, skipped (own lifecycle)`);
    continue;
  }

  // SKILL.md + frontmatter
  const skillMd = path.join(skillPath, 'SKILL.md');
  if (!existsSync(skillMd)) {
    errors.push('SKILL.md missing');
  } else {
    const content = readFileSync(skillMd, 'utf8');
    const fm = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fm) {
      errors.push('SKILL.md has no YAML frontmatter');
    } else {
      const fields = {};
      for (const line of fm[1].split('\n')) {
        const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
        if (kv) fields[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
      }
      if (fields.name !== entry.name) errors.push(`frontmatter name '${fields.name}' ≠ folder '${entry.name}'`);
      if (!fields.description || fields.description.length < 20) errors.push('description missing or too short to trigger');
      if (fields.description && fields.description.length > 1024) errors.push('description over 1024 chars');
      // `command` (slash-command mapping), `license` (stock Anthropic skills) and
      // `repo_scoped` (sync metadata) are functional in this repo — tolerated.
      const TOLERATED = ['command', 'license', 'repo_scoped'];
      const MEMORY_NODE_FIELDS = ['type', 'slug', 'category', 'importance', 'schema_version', 'title', 'status', 'source'];
      for (const k of Object.keys(fields)) {
        if (['name', 'description', ...TOLERATED].includes(k)) continue;
        if (MEMORY_NODE_FIELDS.includes(k)) errors.push(`frontmatter field '${k}' is memory-node contamination — skill won't be discovered`);
        else warnings.push(`unexpected frontmatter field '${k}'`);
      }
    }
    if (/^TODO:/m.test(content)) errors.push('SKILL.md still contains scaffold TODO markers');
  }

  // required directories with real content
  for (const dir of REQUIRED_DIRS) {
    const files = realFiles(path.join(skillPath, dir));
    if (!existsSync(path.join(skillPath, dir))) errors.push(`${dir}/ missing`);
    else if (files.length === 0) errors.push(`${dir}/ has no real content (.gitkeep alone doesn't count)`);
    else if (files.length === 1 && files[0] === 'README.md') {
      const body = readFileSync(path.join(skillPath, dir, 'README.md'), 'utf8');
      if (/^TODO:/m.test(body)) errors.push(`${dir}/ only holds the scaffold TODO placeholder`);
    }
  }

  // evals.json shape
  const evalsPath = path.join(skillPath, 'evals', 'evals.json');
  if (existsSync(evalsPath)) {
    try {
      const evals = JSON.parse(readFileSync(evalsPath, 'utf8'));
      // Two valid shapes: prose assertions {name, assertion} or — better —
      // executable checks {id, description, command, expected_exit_code}.
      const validEntry = (e) => (e.name && e.assertion) || (e.id && e.description && e.command);
      if (!Array.isArray(evals) || evals.length < 3) errors.push('evals.json needs ≥3 assertions');
      else if (!evals.every(validEntry)) errors.push('evals.json entries need {name, assertion} or executable {id, description, command}');
      else if (evals.some((e) => /TODO/.test(JSON.stringify(e)))) errors.push('evals.json still contains scaffold TODOs');
    } catch (e) {
      errors.push(`evals.json does not parse: ${e.message}`);
    }
  } else if (existsSync(path.join(skillPath, 'evals'))) {
    errors.push('evals/evals.json missing');
  }

  // scripts and hooks must at least parse
  if (existsSync(skillPath)) {
    for (const file of walk(skillPath)) {
      if (statSync(file).size === 0 && path.basename(file) !== '.gitkeep') {
        errors.push(`empty file (placeholder masquerading as content): ${path.relative(skillPath, file)}`);
        continue;
      }
      if (/\.(mjs|js|cjs)$/.test(file)) {
        const r = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
        if (r.status !== 0) errors.push(`node --check failed: ${path.relative(skillPath, file)} — ${(r.stderr || '').split('\n')[0]}`);
      } else if (file.endsWith('.sh')) {
        const r = spawnSync('bash', ['-n', file], { encoding: 'utf8' });
        if (r.status !== 0) errors.push(`bash -n failed: ${path.relative(skillPath, file)} — ${(r.stderr || '').split('\n')[0]}`);
      }
    }
  }

  // repo wiring
  if (!gitignore.includes(`!.agent/skills/${entry.name}/`)) {
    errors.push(`.gitignore has no '!.agent/skills/${entry.name}/' allowlist line — skill is invisible to git`);
  }
  if (!existsSync(path.join(ROOT, '.claude/skills', entry.name))) {
    warnings.push(`.claude/skills/${entry.name} symlink missing — IDE won't discover the skill`);
  }

  const mark = errors.length ? '✗' : warnings.length ? '⚠' : '✓';
  console.log(`${mark} ${entry.name}`);
  for (const e of errors) console.log(`    ERROR: ${e}`);
  for (const w of warnings) console.log(`    warn:  ${w}`);
  totalErrors += errors.length;
  totalWarnings += warnings.length;
}

console.log(`\n${totalErrors} error(s), ${totalWarnings} warning(s).`);
process.exit(totalErrors ? 1 : 0);
