#!/usr/bin/env node
/**
 * create-skill.mjs — scaffold a new skill in .agent/skills/<name>/
 *
 * Usage:
 *   node .agent/skills/skill-creator/scripts/create-skill.mjs <name> "<description>"
 *
 * Creates the six required items (SKILL.md + scripts/references/subagents/hooks/evals),
 * appends the .gitignore allowlist entry (without it the skill is silently untracked),
 * and symlinks the skill into .claude/skills/ for IDE discovery.
 *
 * The scaffold is deliberately full of TODO markers that validate-skills.mjs flags
 * as errors — a freshly scaffolded skill is NOT a valid skill until every folder
 * holds real content.
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync, appendFileSync, symlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../../');
const SKILLS_DIR = path.join(ROOT, '.agent/skills');
const CLAUDE_SKILLS_DIR = path.join(ROOT, '.claude/skills');

const [name, description] = process.argv.slice(2);

if (!name || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
  console.error('Usage: node create-skill.mjs <kebab-case-name> "<description>"');
  console.error('Name must be lowercase kebab-case (e.g. my-new-skill).');
  process.exit(1);
}
if (!description || description.trim().length < 20) {
  console.error('A real trigger-optimized description is required (≥20 chars).');
  console.error('State WHAT the skill does and WHEN to use it.');
  process.exit(1);
}

const target = path.join(SKILLS_DIR, name);
if (existsSync(target)) {
  console.error(`Skill '${name}' already exists at ${target}`);
  process.exit(1);
}

const desc = description.trim().replace(/"/g, "'");
const fullDesc = desc.endsWith('.') ? desc : `${desc}.`;

mkdirSync(target, { recursive: true });
for (const dir of ['scripts', 'references', 'subagents', 'hooks', 'evals']) {
  mkdirSync(path.join(target, dir));
}

writeFileSync(path.join(target, 'SKILL.md'), `---
name: ${name}
description: "${fullDesc} MANDATORY: read the full SKILL.md before executing."
---

# ${name}

TODO: replace this scaffold with the master instructions for the skill.
Cover: context (what problem this solves), concrete steps, hard rules,
pitfalls actually observed, and pointers into references/.

Run \`node .agent/skills/skill-creator/scripts/validate-skills.mjs ${name}\`
until it reports zero errors.
`);

writeFileSync(path.join(target, 'scripts', 'README.md'), `TODO: replace with runnable automation.
Ask: what in this domain should be deterministic code instead of an LLM guess?
Every script must pass node --check / bash -n and be executed once for real before shipping.
`);

writeFileSync(path.join(target, 'references', 'README.md'), `TODO: replace with verified domain knowledge.
Ask: what did I have to look up or verify against the live system to build this skill?
One topic per file, descriptive filenames, source URLs at the top of extracted docs.
`);

writeFileSync(path.join(target, 'subagents', 'README.md'), `TODO: replace with self-contained delegation prompts.
Ask: what subtask could a focused worker do with only this file as its brief?
Name files as verbs: audit-x.md, generate-y.md, verify-z.md.
`);

writeFileSync(path.join(target, 'hooks', 'README.md'), `TODO: replace with lifecycle scripts wired to real events (git pre-commit/pre-push, deploy).
Each hook's header comment must say exactly what invokes it and how to install it.
A hook nothing invokes is decoration — run it once for real before shipping.
`);

writeFileSync(path.join(target, 'evals', 'evals.json'), JSON.stringify([
  { name: 'TODO-1', assertion: 'TODO: falsifiable check that the skill was used correctly', severity: 'error' },
  { name: 'TODO-2', assertion: 'TODO: check for the most likely failure mode of this domain', severity: 'error' },
  { name: 'TODO-3', assertion: 'TODO: check that a claim in SKILL.md is still true against the live repo', severity: 'warning' },
], null, 2) + '\n');

// .gitignore allowlist — without this line the skill is invisible to git.
const gitignorePath = path.join(ROOT, '.gitignore');
const allowLine = `!.agent/skills/${name}/`;
const gitignore = readFileSync(gitignorePath, 'utf8');
if (!gitignore.includes(allowLine)) {
  appendFileSync(gitignorePath, `${allowLine}\n`);
  console.log(`Added ${allowLine} to .gitignore`);
} else {
  console.log(`.gitignore already allowlists ${name}`);
}

// .claude/skills symlink for IDE discovery.
const linkPath = path.join(CLAUDE_SKILLS_DIR, name);
if (existsSync(CLAUDE_SKILLS_DIR) && !existsSync(linkPath)) {
  symlinkSync(target, linkPath);
  console.log(`Symlinked ${linkPath} -> ${target}`);
}

console.log(`\nScaffolded .agent/skills/${name}/ — now populate every folder with real content.`);
console.log(`Validate with: node .agent/skills/skill-creator/scripts/validate-skills.mjs ${name}`);
