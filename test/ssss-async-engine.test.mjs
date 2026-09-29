import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// SSSS >= 0.10 made processOperation() async. A call without `await` returns a
// Promise, `result.success` is undefined, and every write reports "unknown error"
// (A-019). This keeps any un-awaited call from coming back.
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.mjs')) out.push(p);
  }
  return out;
}

test('every engine.processOperation() call is awaited', () => {
  const offenders = [];
  for (const file of walk('scripts')) {
    readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      if (/engine\.processOperation\(/.test(line) && !/await\s+engine\.processOperation\(/.test(line) && !/^\s*(\/\/|\*)/.test(line)) offenders.push(`${file}:${i + 1}`);
    });
  }
  assert.deepEqual(offenders, []);
});
