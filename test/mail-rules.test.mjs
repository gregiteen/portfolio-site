import { test } from 'node:test';
import assert from 'node:assert/strict';
import { folderFor, toSieve, MAIL_FOLDERS } from '../scripts/lib/mail-rules.mjs';

test('DMARC aggregate reports go to Reports', () => {
  assert.equal(folderFor({ from: 'noreply-dmarc-support@google.com', subject: 'Report domain: gregiteen.xyz Submitter: google.com' }), 'Reports');
  assert.equal(folderFor({ from: 'noreply@dmarc.yahoo.com', subject: 'Report Domain: gregiteen.xyz Submitter: yahoo.com' }), 'Reports');
});

test('bounces go to Bounces', () => {
  assert.equal(folderFor({ from: 'Mailer-Daemon@smtpservice.net', subject: 'Mail delivery failed : returning message to sender' }), 'Bounces');
  assert.equal(folderFor({ from: 'someone@example.com', subject: 'Undelivered Mail Returned to Sender' }), 'Bounces');
});

test('signing notifications from our own domain go to Signing', () => {
  assert.equal(folderFor({ from: 'sales@gregiteen.xyz', subject: 'Crown Jewell Buyer has signed "Wholesale Proposal"' }), 'Signing');
  assert.equal(folderFor({ from: 'sales@gregiteen.xyz', subject: 'Signing Complete!' }), 'Signing');
});

test('other self-sent mail goes to System', () => {
  assert.equal(folderFor({ from: 'me@gregiteen.xyz', subject: 'Me sender check 2a356e7e' }), 'System');
  assert.equal(folderFor({ from: 'sales@gregiteen.xyz', subject: 'Please confirm your email' }), 'System');
});

test('correspondence stays in the inbox', () => {
  assert.equal(folderFor({ from: 'buyer@example.com', subject: 'Question about the proposal' }), null);
  assert.equal(folderFor({ from: 'buyer@example.com', subject: 'I have signed up for the newsletter' }), null);
  assert.equal(folderFor({ from: '', subject: '' }), null);
});

test('sieve script files every rule folder and escapes strings', () => {
  const script = toSieve();
  assert.match(script, /^# .*\nrequire \["fileinto", "mailbox"\];/);
  for (const folder of MAIL_FOLDERS.filter((f) => f !== 'INBOX' && f !== 'Junk')) {
    assert.ok(script.includes(`fileinto :create "${folder}";`), folder);
  }
  assert.match(script, /allof\(address :contains "from" \["@gregiteen\.xyz"\], header :contains "subject"/);
  const escaped = toSieve([{ folder: 'X', mode: 'any', from: ['a"b\\c'], subject: [] }]);
  assert.ok(escaped.includes('["a\\"b\\\\c"]'));
});
