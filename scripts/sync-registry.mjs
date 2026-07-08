#!/usr/bin/env node
import { mkdir, copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const source = require.resolve('@ssss/cli/registry/core.json');
const targetDir = join(__dirname, '..', 'vault-registry');
const target = join(targetDir, 'core.json');

await mkdir(targetDir, { recursive: true });
await copyFile(source, target);
console.log(`synced ${target}`);
