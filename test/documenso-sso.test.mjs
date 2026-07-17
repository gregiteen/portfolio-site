import assert from 'node:assert/strict';
import test from 'node:test';

import {
  consumeDocumensoSsoHandoff,
  createDocumensoSsoHandoff,
  pruneDocumensoSsoHandoffs,
} from '../scripts/lib/documenso-sso.mjs';

test('Documenso SSO handoff is normalized and consumed exactly once', () => {
  const store = new Map();
  const code = createDocumensoSsoHandoff(store, ' Sales@GregIteen.xyz ', { now: 1_000, ttlMs: 60_000 });

  assert.match(code, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(consumeDocumensoSsoHandoff(store, code, { now: 2_000 }), 'sales@gregiteen.xyz');
  assert.equal(consumeDocumensoSsoHandoff(store, code, { now: 2_001 }), null);
});

test('Documenso SSO handoff rejects expired codes and pruning removes stale entries', () => {
  const store = new Map();
  const expiredCode = createDocumensoSsoHandoff(store, 'sales@gregiteen.xyz', { now: 1_000, ttlMs: 100 });
  const freshCode = createDocumensoSsoHandoff(store, 'sales@gregiteen.xyz', { now: 1_000, ttlMs: 1_000 });

  assert.equal(consumeDocumensoSsoHandoff(store, expiredCode, { now: 1_101 }), null);
  pruneDocumensoSsoHandoffs(store, { now: 1_500 });
  assert.equal(store.has(freshCode), true);
  pruneDocumensoSsoHandoffs(store, { now: 2_001 });
  assert.equal(store.size, 0);
});
