import { createHash } from 'node:crypto';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidCnaEmail(value) {
  return EMAIL_RE.test(String(value || '').trim().toLowerCase());
}

export function normalizeCnaHistory(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(-60).flatMap((message) => {
    const content = String(message?.content || '').trim().slice(0, 6000);
    if (!content) return [];
    return [{
      role: message?.role === 'assistant' ? 'assistant' : 'user',
      content,
    }];
  });
}

export function proposalIdForRequest(requestId, email) {
  const request = String(requestId || '').trim();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!/^[a-zA-Z0-9_-]{8,128}$/.test(request)) {
    throw new Error('A valid proposal request ID is required.');
  }
  if (!isValidCnaEmail(normalizedEmail)) {
    throw new Error('A valid client email is required.');
  }
  return createHash('sha256').update(`${normalizedEmail}\n${request}`).digest('hex').slice(0, 16);
}
