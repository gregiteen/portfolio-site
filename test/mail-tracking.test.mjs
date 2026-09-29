import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePostfixDelivery, findBouncedMessageIds, isProxyOpen } from '../scripts/lib/mail-tracking.mjs';
import { prepareEmailHtml, isTrackingPixel } from '../scripts/lib/email-html.mjs';
import { composeOutgoing, signatureText } from '../scripts/lib/mail-signature.mjs';

const LOG = [
  'postfix-mailcow-1  | Sep 28 22:43:52 host postfix/cleanup[84616]: A993C16F8E8: message-id=<abc123@gregiteen.xyz>',
  'postfix-mailcow-1  | Sep 28 22:43:54 host postfix/smtp[84617]: A993C16F8E8: to=<ada@example.com>, relay=smtp-relay.brevo.com[1.179.119.1]:2525, delay=3, dsn=2.0.0, status=sent (250 2.0.0 OK: queued as <x@y>)',
  'postfix-mailcow-1  | Sep 28 22:57:32 host postfix/cleanup[84652]: E2B4C16F8C6: message-id=<other@gregiteen.xyz>',
  'postfix-mailcow-1  | Sep 28 22:57:34 host postfix/smtp[84653]: E2B4C16F8C6: to=<bob@example.com>, relay=none, delay=1, dsn=5.1.1, status=bounced (host said: 550 no such user)',
].join('\n');

test('postfix log: relayed, bounced and queued', () => {
  assert.equal(parsePostfixDelivery(LOG, '<abc123@gregiteen.xyz>').status, 'relayed');
  const bounced = parsePostfixDelivery(LOG, 'other@gregiteen.xyz');
  assert.equal(bounced.status, 'bounced');
  assert.match(bounced.detail, /no such user/);
  assert.equal(parsePostfixDelivery(LOG, 'missing@gregiteen.xyz').status, 'queued');
});

test('bounce notices are matched to the original message', () => {
  const ndr = 'Original-Message-ID: <abc123@gregiteen.xyz>\nDiagnostic-Code: smtp; 550';
  assert.deepEqual(findBouncedMessageIds(ndr, ['<abc123@gregiteen.xyz>', '<zzz@gregiteen.xyz>']), ['<abc123@gregiteen.xyz>']);
});

test('image proxy opens are told apart from reader opens', () => {
  assert.equal(isProxyOpen('Mozilla/5.0 (Windows NT 5.1; rv:11.0) Gecko Firefox/11.0 (via ggpht.com GoogleImageProxy)'), true);
  assert.equal(isProxyOpen('Mozilla/5.0'), true);
  assert.equal(isProxyOpen('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'), false);
});

test('tracking pixels are stripped, real images kept', () => {
  assert.equal(isTrackingPixel('<img src="https://x.com/a.gif" width="1" height="1">'), true);
  assert.equal(isTrackingPixel('<img src="https://x.com/logo.png" style="display:none">'), true);
  assert.equal(isTrackingPixel('<img src="https://mandrillapp.com/track/open.php?u=1">'), true);
  assert.equal(isTrackingPixel('<img src="https://x.com/hero.jpg" width="600">'), false);
  const { html, pixelCount, remoteCount } = prepareEmailHtml('<html><head></head><body><img src="https://x.com/hero.jpg" width="600"><img src="https://t.co/o.gif" width="1" height="1"></body></html>');
  assert.equal(pixelCount, 1);
  assert.equal(remoteCount, 1);
  assert.ok(!html.includes('t.co/o.gif'));
  assert.match(html, /<head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:;/);
});

test('remote images load only when asked; cid images always resolve', () => {
  const shown = prepareEmailHtml('<p>hi</p>', { showRemote: true }).html;
  assert.match(shown, /img-src data: https: http:/);
  const { html } = prepareEmailHtml('<img src="cid:logo@x">', { attachments: [{ contentId: '<logo@x>', contentType: 'image/png', content: Buffer.from('png') }] });
  assert.match(html, /src="data:image\/png;base64,cG5n"/);
});

test('outgoing mail carries the signature and the open pixel', () => {
  const { text, html } = composeOutgoing({ text: 'Hello Ada,\n\nSee https://gregiteen.xyz.\n', pixelUrl: 'https://gregiteen.xyz/api/track/open/abc.gif' });
  assert.ok(text.endsWith(`${signatureText()}\n`));
  assert.match(html, /Greg Iteen<span/);
  assert.match(html, /<a href="https:\/\/gregiteen\.xyz"/);
  assert.match(html, /<img src="https:\/\/gregiteen\.xyz\/api\/track\/open\/abc\.gif" width="1" height="1"/);
  assert.ok(!composeOutgoing({ text: '<b>x</b>' }).html.includes('<b>x</b>'));
});
