/**
 * Personal-site mode: what is public, what is admin-only, and the proxy to the
 * Job Search Navigator API. Kept out of serve.mjs so it can be tested without
 * booting the server.
 */

/** AI site/theme generation is off unless explicitly enabled. */
export function generationEnabled(env = process.env) {
  return env.SITE_GENERATION_ENABLED === '1';
}

/** Paths that are never public, whatever the mode. */
export function isPrivatePath(urlPath) {
  return urlPath === '/crm-app.html'
    || urlPath === '/jobs' || urlPath === '/jobs/' || urlPath === '/jobs.html' || urlPath === '/jobs.js' || urlPath === '/jobs.css';
}

const PROXY_PATH = /^\/api\/[a-z0-9/_-]+$/;
const MAX_BODY = 1024 * 1024;

/**
 * Forward an admin request from /api/jsn/<x> to JSN_URL/api/<x>. The token is
 * added here, on the server; cookies and other headers are not forwarded.
 * `readBody(req)` returns the raw request body string; `send(res, status, obj)` writes JSON.
 */
export async function proxyJsn({ req, res, urlPath, search = '', env = process.env, fetchImpl = fetch, readBody, send }) {
  const base = (env.JSN_URL || '').replace(/\/+$/, '');
  const token = env.JSN_API_TOKEN || '';
  if (!base || !token) {
    return send(res, 503, { error: 'Job Search Navigator is not connected: set JSN_URL and JSN_API_TOKEN.' });
  }
  const target = `/api/${urlPath.slice('/api/jsn/'.length)}`;
  if (!PROXY_PATH.test(target) || target.includes('..')) return send(res, 400, { error: 'Invalid path' });
  if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return send(res, 405, { error: 'Method not allowed' });

  let body;
  if (!['GET', 'DELETE'].includes(req.method)) {
    body = await readBody(req, MAX_BODY);
    if (body === null) return send(res, 413, { error: 'Body too large' });
  }
  try {
    const upstream = await fetchImpl(`${base}${target}${search}`, {
      method: req.method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: body || undefined,
      signal: AbortSignal.timeout(15_000),
    });
    const text = await upstream.text();
    res.writeHead(upstream.status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
    res.end(text);
  } catch (error) {
    send(res, 502, { error: `Job Search Navigator is unreachable: ${error.message}` });
  }
}
