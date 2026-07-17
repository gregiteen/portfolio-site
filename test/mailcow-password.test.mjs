import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMailcowConfig, retryMailcowCommand, updateEnvAssignment, validateMailboxPassword } from '../scripts/lib/mailcow-password.mjs';

test('mailcow configuration is parsed without evaluating shell syntax', () => {
  const config = parseMailcowConfig('# comment\nDBUSER=mailcow\nDBPASS="not-executed; value"\nDBNAME=mailcow\n');
  assert.deepEqual(config, { DBUSER: 'mailcow', DBPASS: 'not-executed; value', DBNAME: 'mailcow' });
});

test('IMAP password assignment safely replaces or appends one env line', () => {
  assert.equal(updateEnvAssignment('A=1\nIMAP_PASS=old\n', 'IMAP_PASS', 'new value'), 'A=1\nIMAP_PASS="new value"\n');
  assert.equal(updateEnvAssignment('A=1\n', 'IMAP_PASS', 'new'), 'A=1\nIMAP_PASS="new"\n');
});

test('mailbox password validation rejects unsafe inputs before commands run', () => {
  assert.throws(() => validateMailboxPassword('not-an-address', 'long-enough'), /mailbox/i);
  assert.throws(() => validateMailboxPassword('sales@gregiteen.xyz', 'short'), /between/i);
  assert.throws(() => validateMailboxPassword('sales@gregiteen.xyz', 'valid\npassword'), /control/i);
});

test('transient Mailcow command failures are retried before surfacing', async () => {
  let calls = 0;
  const result = await retryMailcowCommand(async () => {
    calls += 1;
    if (calls < 3) throw new Error('temporary Docker failure');
    return 'ok';
  }, { delayMs: 0 });
  assert.equal(result, 'ok');
  assert.equal(calls, 3);
});
