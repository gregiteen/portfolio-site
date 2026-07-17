import { randomBytes } from 'node:crypto';

const DEFAULT_TTL_MS = 60_000;

export function createDocumensoSsoHandoff(store, email, { now = Date.now(), ttlMs = DEFAULT_TTL_MS } = {}) {
  const code = randomBytes(32).toString('base64url');

  store.set(code, {
    email: String(email || '').trim().toLowerCase(),
    expiresAt: now + ttlMs,
  });

  return code;
}

export function consumeDocumensoSsoHandoff(store, code, { now = Date.now() } = {}) {
  const handoff = store.get(code);

  // Consume before validating so a malformed or expired handoff is still
  // strictly single-use.
  store.delete(code);

  if (!handoff || !handoff.email || handoff.expiresAt <= now) {
    return null;
  }

  return handoff.email;
}

export function pruneDocumensoSsoHandoffs(store, { now = Date.now() } = {}) {
  for (const [code, handoff] of store.entries()) {
    if (!handoff || handoff.expiresAt <= now) {
      store.delete(code);
    }
  }
}
