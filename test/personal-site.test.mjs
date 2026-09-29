import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { generationEnabled, isPrivatePath, proxyJsn } from '../scripts/lib/site-mode.mjs';

test('generation is off unless SITE_GENERATION_ENABLED=1', () => {
  assert.equal(generationEnabled({}), false);
  assert.equal(generationEnabled({ SITE_GENERATION_ENABLED: '0' }), false);
  assert.equal(generationEnabled({ SITE_GENERATION_ENABLED: '1' }), true);
});

test('only admin surfaces are private', () => {
  for (const p of ['/crm-app.html', '/jobs', '/jobs/', '/jobs.html', '/jobs.js', '/jobs.css']) assert.equal(isPrivatePath(p), true, p);
  for (const p of ['/', '/about.html', '/projects/ssss.html', '/generate.html', '/api/health']) assert.equal(isPrivatePath(p), false, p);
});

function fakeRes() {
  const r = { status: 0, headers: {}, body: '' };
  r.writeHead = (s, h) => { r.status = s; r.headers = h || {}; };
  r.end = (b) => { r.body = b; };
  return r;
}
const send = (res, status, obj) => { res.status = status; res.body = JSON.stringify(obj); };
const base = { req: { method: 'GET', headers: { cookie: 'gi_auth=secret-session' } }, send, readBody: async () => '' };

test('proxy: needs JSN_URL and a token, and says so', async () => {
  const res = fakeRes();
  await proxyJsn({ ...base, res, urlPath: '/api/jsn/overview', env: {} });
  assert.equal(res.status, 503);
  assert.match(res.body, /JSN_URL and JSN_API_TOKEN/);
});

test('proxy: rewrites the path, adds the token, forwards no cookies, passes status through', async () => {
  const seen = [];
  const res = fakeRes();
  const fetchImpl = async (url, init) => { seen.push({ url, init }); return new Response('{"ok":true}', { status: 201 }); };
  await proxyJsn({ ...base, res, urlPath: '/api/jsn/jobs/indeed/job-x', search: '?a=1', env: { JSN_URL: 'http://100.64.0.9:4317/', JSN_API_TOKEN: 'tok' }, fetchImpl });
  assert.equal(res.status, 201);
  assert.equal(seen[0].url, 'http://100.64.0.9:4317/api/jobs/indeed/job-x?a=1');
  assert.equal(seen[0].init.headers.Authorization, 'Bearer tok');
  assert.ok(!JSON.stringify(seen[0].init.headers).includes('secret-session'), 'cookies are never forwarded');
});

test('proxy: rejects bad paths and methods, oversize bodies, and reports an unreachable JSN', async () => {
  const env = { JSN_URL: 'http://x', JSN_API_TOKEN: 't' };
  let res = fakeRes();
  await proxyJsn({ ...base, res, urlPath: '/api/jsn/../../etc/passwd', env, fetchImpl: async () => { throw new Error('should not fetch'); } });
  assert.equal(res.status, 400);
  res = fakeRes();
  await proxyJsn({ ...base, req: { method: 'TRACE', headers: {} }, res, urlPath: '/api/jsn/overview', env });
  assert.equal(res.status, 405);
  res = fakeRes();
  await proxyJsn({ ...base, req: { method: 'POST', headers: {} }, res, urlPath: '/api/jsn/docs', env, readBody: async () => null });
  assert.equal(res.status, 413);
  res = fakeRes();
  await proxyJsn({ ...base, res, urlPath: '/api/jsn/overview', env, fetchImpl: async () => { throw new Error('ECONNREFUSED'); } });
  assert.equal(res.status, 502);
  assert.match(res.body, /unreachable/);
});

test('server (generation off): public site, generation refused, admin surfaces private', async () => {
  const port = 4700 + Math.floor(Math.random() * 200);
  execFileSync(process.execPath, ['scripts/build-site.mjs'], { env: { ...process.env, SITE_GENERATION_ENABLED: '0' }, stdio: 'ignore' });
  const child = spawn(process.execPath, ['scripts/serve.mjs'], { env: { ...process.env, PORT: String(port), SITE_GENERATION_ENABLED: '0' }, stdio: 'ignore' });
  try {
    let up = false;
    for (let i = 0; i < 60 && !up; i++) {
      try { up = (await fetch(`http://127.0.0.1:${port}/api/health`)).ok; } catch { await new Promise((r) => setTimeout(r, 250)); }
    }
    assert.ok(up, 'server did not start');
    const get = (p, init = {}) => fetch(`http://127.0.0.1:${port}${p}`, { redirect: 'manual', ...init });
    assert.equal((await get('/')).status, 200);
    assert.equal((await get('/about.html')).status, 200);
    const gen = await get('/generate.html');
    assert.equal(gen.status, 302);
    assert.equal(new URL(gen.headers.get('location'), 'http://x').pathname, '/');
    assert.equal((await get('/generate-theme', { method: 'POST', body: '{"prompt":"x"}' })).status, 410);
    assert.equal((await (await get('/generate-status')).json()).status, 'disabled');
    const jobs = await get('/jobs');
    assert.equal(jobs.status, 302);
    assert.match(jobs.headers.get('location'), /\/splash\.html\?next=\/jobs/);
    assert.equal((await get('/api/jsn/overview')).status, 403);
    assert.equal((await get('/crm-app.html')).status, 302);
    const html = await (await get('/')).text();
    for (const marker of ['cna-banner"', 'cookieBanner', 'visitor-exit', 'ai-design-flipper', '/consult.html']) {
      assert.ok(!html.includes(marker), `personal page still contains ${marker}`);
    }
  } finally { child.kill('SIGTERM'); }
});
