// Job Search Navigator dashboard. Plain ES modules, no build. Every action calls
// the same API the `jsn` CLI uses; the server enforces the rules (e.g. 409 on Applied).

const STAGES = ['interested', 'tailoring', 'applied', 'screening', 'interviewing', 'offer'];
const CLOSED = ['rejected', 'withdrawn'];
const FIT = [['0', 'Any fit'], ['80', 'Strong (80+)'], ['60', 'Good (60+)'], ['40', 'Stretch (40+)']];
const SCREENS = [['today', 'Today'], ['leads', 'Leads'], ['pipeline', 'Pipeline'], ['inbox', 'Inbox'], ['resumes', 'Resumes'], ['searches', 'Searches']];

const view = document.getElementById('view');
const nav = document.getElementById('nav');
const toastEl = document.getElementById('toast');

/** Build a DOM node. Text is always inserted as text, never HTML. */
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'value') el.value = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) {
    if (kid === null || kid === undefined || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

// The portfolio site serves this same file at /jobs and sets window.JSN_API_BASE = '/api/jsn'.
const API_BASE = window.JSN_API_BASE || '/api';

async function api(method, path, body) {
  path = path.replace(/^\/api/, API_BASE);
  const url = method === 'GET' && body ? `${path}?${new URLSearchParams(body)}` : path;
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: method !== 'GET' && body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || res.statusText), { status: res.status });
  return data;
}

let toastTimer;
function toast(message, bad = false) {
  toastEl.textContent = message;
  toastEl.className = bad ? 'bad' : '';
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 4500);
}

/** Run an action, toast the outcome, then re-render. */
async function act(fn, okMessage) {
  try {
    await fn();
    if (okMessage) toast(okMessage);
  } catch (error) {
    toast(error.message, true);
  }
  render();
}

const fitBadge = (score) => {
  const n = Number(score);
  if (!Number.isFinite(n) || n <= 0) return h('span', { class: 'badge' }, 'unscored');
  return h('span', { class: `badge ${n >= 80 ? 'ok' : n >= 60 ? '' : 'warn'}` }, `${n >= 80 ? 'strong' : n >= 60 ? 'good' : n >= 40 ? 'stretch' : 'poor'} ${n}`);
};
const empty = (text) => h('div', { class: 'empty' }, text);
const appLink = (id, text) => h('a', { href: `#/app/${id}` }, text);

// ---------- Today ----------
async function today() {
  const t = await api('GET', '/api/today');
  const sections = [];
  const list = (title, items, render, none) => sections.push(h('section', {}, h('h2', {}, `${title} (${items.length})`), items.length ? h('div', { class: 'grid' }, items.map(render)) : empty(none)));

  list('Waiting for your approval', t.needs_approval, (n) => h('div', { class: 'card' },
    h('h3', {}, appLink(n.application_id, `${n.role} — ${n.company}`)),
    h('div', { class: 'muted' }, `${n.kind === 'resume' ? 'Custom resume' : 'Cover letter'} · ${n.status.replace('_', ' ')}`),
    n.status === 'draft' ? h('div', { class: 'row' }, h('button', { class: 'primary', onclick: () => act(() => api('POST', `/api/applications/${n.application_id}/documents/${n.kind}/approve`), 'Approved') }, 'Approve'), h('a', { href: `#/app/${n.application_id}` }, 'Review first')) : null));

  list('Replies waiting for you', t.replies, (r) => h('div', { class: 'card' },
    h('h3', {}, h('a', { href: '#/inbox' }, r.subject || r.thread_id)),
    h('div', { class: 'muted' }, `${CATEGORY_LABEL[r.category] || r.category} · reply ${r.reply_status}`),
    r.reply_status === 'draft' ? h('div', { class: 'row' }, h('button', { class: 'primary', onclick: () => act(() => api('POST', `/api/threads/${r.thread_id}/approve`), 'Approved') }, 'Approve'), h('a', { href: '#/inbox' }, 'Review first')) : null), 'No replies waiting.');

  list('Suggested stage changes', t.stage_suggestions, (r) => h('div', { class: 'card' },
    h('h3', {}, h('a', { href: '#/inbox' }, r.subject || r.thread_id)),
    h('div', { class: 'muted' }, `Move ${r.application_id} to ${r.suggested_stage}`),
    h('div', { class: 'row' },
      h('button', { class: 'primary', onclick: () => act(() => api('POST', `/api/threads/${r.thread_id}/accept-stage`), 'Moved') }, 'Accept'),
      h('button', { onclick: () => act(() => api('POST', `/api/threads/${r.thread_id}/reject-stage`), 'Rejected') }, 'Reject'))), 'No stage changes suggested.');

  list('Needs a custom resume and cover letter', t.needs_documents, (n) => h('div', { class: 'card' },
    h('h3', {}, appLink(n.application_id, `${n.role} — ${n.company}`)),
    h('div', { class: 'muted' }, 'Ask Claude or Codex to run the tailor workflow for this application.')), 'Every open application has both documents.');

  list('Follow-ups', t.follow_ups, (a) => h('div', { class: 'card' },
    h('h3', {}, appLink(a.application_id, `${a.role} — ${a.company}`)),
    h('div', { class: 'muted' }, `${a.next_action}${a.next_action_at ? ` · ${a.next_action_at}` : ''}`)), 'No follow-ups scheduled.');

  list('Strong new leads', t.strong_leads, (j) => leadCard(j), 'No strong new leads yet.');
  return h('div', {}, h('h1', {}, 'Today'), sections);
}

// ---------- Leads ----------
const leadFilters = { min: '0', source: '', status: 'new', q: '' };

function leadCard(j) {
  const id = j.job_id;
  const call = (path, method, body) => act(() => api(method, `/api/jobs/${j.source}/${id}${path}`, body));
  return h('div', { class: 'card' },
    h('h3', {}, j.job_title), h('div', {}, j.company),
    h('div', { class: 'muted' }, [j.location, j.source, j.salary, j.posted_at].filter(Boolean).join(' · ')),
    h('div', { class: 'row' }, fitBadge(j.fit_score), j.status !== 'new' ? h('span', { class: 'badge' }, j.status) : null),
    j.fit_reasons ? h('div', { class: 'muted' }, j.fit_reasons) : null,
    h('div', { class: 'row' },
      h('button', { class: 'primary', onclick: () => act(async () => { const a = await api('POST', `/api/jobs/${j.source}/${id}/track`); location.hash = `#/app/${a.application_id}`; }) }, 'Track'),
      h('button', { onclick: () => call('', 'PATCH', { status: 'saved' }) }, 'Save'),
      h('button', { class: 'danger', onclick: () => call('', 'PATCH', { status: 'dismissed' }) }, 'Dismiss'),
      j.url ? h('a', { href: j.url, target: '_blank', rel: 'noopener noreferrer' }, 'Open posting') : null));
}

async function leads() {
  const params = { sort: 'fit', min: leadFilters.min };
  for (const k of ['source', 'status', 'q']) if (leadFilters[k]) params[k] = leadFilters[k];
  const data = await api('GET', '/api/jobs', params);
  const set = (k) => (e) => { leadFilters[k] = e.target.value; render(); };
  const sources = [...new Set(data.jobs.map((j) => j.source))];
  return h('div', {}, h('h1', {}, 'Leads'),
    h('div', { class: 'filters' },
      h('select', { onchange: set('min'), 'aria-label': 'Fit' }, FIT.map(([v, l]) => h('option', { value: v, selected: v === leadFilters.min }, l))),
      h('select', { onchange: set('status'), 'aria-label': 'Status' }, ['', 'new', 'saved', 'dismissed', 'applied'].map((v) => h('option', { value: v, selected: v === leadFilters.status }, v || 'Any status'))),
      h('select', { onchange: set('source'), 'aria-label': 'Source' }, ['', ...sources].map((v) => h('option', { value: v, selected: v === leadFilters.source }, v || 'Any source'))),
      h('input', { type: 'search', placeholder: 'Search title, company, place', value: leadFilters.q, onchange: set('q') })),
    h('div', { class: 'muted' }, `${data.total} lead${data.total === 1 ? '' : 's'}`),
    data.jobs.length ? h('div', { class: 'grid cols' }, data.jobs.map(leadCard)) : empty('No leads match. Ask Claude or Codex to run refresh-leads.'));
}

// ---------- Pipeline ----------
async function pipeline() {
  const { applications, stages } = await api('GET', '/api/applications');
  const move = (a, stage) => act(() => api('PATCH', `/api/applications/${a.application_id}`, { stage }), `Moved to ${stage}`);
  const card = (a) => h('div', { class: 'card' },
    h('h3', {}, appLink(a.application_id, a.role)), h('div', {}, a.company),
    a.next_action ? h('div', { class: 'muted' }, `Next: ${a.next_action}${a.next_action_at ? ` · ${a.next_action_at}` : ''}`) : null,
    h('div', { class: 'row' }, h('select', { 'aria-label': `Stage for ${a.role}`, onchange: (e) => move(a, e.target.value) },
      stages.map((s) => h('option', { value: s, selected: s === a.stage }, s)))));
  const col = (s) => h('section', {}, h('h2', {}, `${s} (${applications.filter((a) => a.stage === s).length})`),
    h('div', { class: 'grid' }, applications.filter((a) => a.stage === s).map(card)));
  const closed = applications.filter((a) => CLOSED.includes(a.stage));
  return h('div', {}, h('h1', {}, 'Pipeline'),
    applications.length ? h('div', { class: 'board' }, STAGES.map(col)) : empty('No applications yet. Track a lead to start one.'),
    closed.length ? h('details', {}, h('summary', {}, `Rejected and withdrawn (${closed.length})`), h('div', { class: 'grid cols' }, closed.map(card))) : null);
}

// ---------- Application ----------
function docPanel(app, kind, label) {
  const doc = app.documents[kind];
  const url = `/api/applications/${app.application_id}/documents/${kind}`;
  if (!doc) return h('section', { class: 'card' }, h('h2', {}, label), empty('Not written yet. Ask Claude or Codex to run the tailor workflow.'));
  const badge = { approved: 'ok', draft: 'warn', changes_requested: 'bad' }[doc.status] || '';
  return h('section', { class: 'card' },
    h('h2', {}, label, ' ', h('span', { class: `badge ${badge}` }, doc.status.replace('_', ' ')), ' ', h('span', { class: 'muted' }, `v${doc.version}`)),
    doc.change_note && doc.status === 'changes_requested' ? h('div', { class: 'muted' }, `Your note: ${doc.change_note}`) : null,
    h('pre', { class: 'doc' }, doc.body || '(empty)'),
    h('div', { class: 'row' },
      h('button', { class: 'primary', disabled: doc.status === 'approved', onclick: () => act(() => api('POST', `${url}/approve`), 'Approved') }, 'Approve'),
      h('button', { onclick: () => {
        const note = prompt('What should change?');
        if (note) act(() => api('POST', `${url}/request-changes`, { note }), 'Sent back with your note');
      } }, 'Request changes')));
}

async function application(id) {
  const app = await api('GET', `/api/applications/${id}`);
  const { stages } = await api('GET', '/api/applications');
  const na = h('input', { value: app.next_action || '', placeholder: 'Next action' });
  const nd = h('input', { type: 'date', value: app.next_action_at || '' });
  return h('div', {}, h('p', {}, h('a', { href: '#/pipeline' }, '← Pipeline')),
    h('h1', {}, `${app.role} — ${app.company}`),
    h('div', { class: 'muted' }, [app.location, app.source].filter(Boolean).join(' · ')),
    h('div', { class: 'row' },
      h('label', {}, 'Stage ', h('select', { onchange: (e) => act(() => api('PATCH', `/api/applications/${id}`, { stage: e.target.value }), 'Stage updated') },
        stages.map((s) => h('option', { value: s, selected: s === app.stage }, s)))),
      h('span', { class: `badge ${app.ready_to_apply ? 'ok' : 'warn'}` }, app.ready_to_apply ? 'documents approved' : 'documents not approved'),
      app.job_url ? h('a', { href: app.job_url, target: '_blank', rel: 'noopener noreferrer' }, 'Open posting') : null),
    h('h2', {}, 'Next action'),
    h('div', { class: 'row' }, na, nd, h('button', { onclick: () => act(() => api('PATCH', `/api/applications/${id}`, { next_action: na.value, next_action_at: nd.value }), 'Saved') }, 'Save')),
    h('div', { class: 'grid cols' }, docPanel(app, 'resume', 'Custom resume'), docPanel(app, 'cover-letter', 'Cover letter')),
    app.job ? h('details', {}, h('summary', {}, 'Posting'), h('pre', { class: 'doc' }, app.job.body || app.job.description || '(no description stored)')) : null,
    app.notes || app.body ? h('details', {}, h('summary', {}, 'Notes'), h('pre', { class: 'doc' }, app.body || app.notes)) : null,
    h('p', { class: 'muted' }, `Created ${app.created_at} · updated ${app.updated_at}${app.applied_at ? ` · applied ${app.applied_at}` : ''}`));
}

// ---------- Inbox ----------
const CATEGORY_LABEL = { interview: 'Interview', scheduling: 'Scheduling', rejection: 'Rejection', offer: 'Offer', recruiter_outreach: 'Recruiter', assessment: 'Assessment', info_request: 'Info request', confirmation: 'Confirmation', other: 'Other' };
const openReply = (t) => t.needs_reply === true && !['sent', 'discarded'].includes(t.reply_status);

async function inbox() {
  const { threads } = await api('GET', '/api/threads');
  const apps = (await api('GET', '/api/applications')).applications;
  const card = (t) => {
    const T = `/api/threads/${t.thread_id}`;
    const draft = h('textarea', { 'aria-label': 'Reply draft' }, t.reply_draft || '');
    draft.value = t.reply_draft || '';
    const link = h('select', { 'aria-label': 'Linked application', onchange: (e) => e.target.value && act(() => api('POST', `${T}/relink`, { application_id: e.target.value }), 'Linked') },
      h('option', { value: '' }, t.application_id ? 'Relink to another application' : 'Link to an application'),
      apps.map((a) => h('option', { value: a.application_id }, `${a.role} — ${a.company}`)));
    const statusBadge = { draft: 'warn', approved: 'ok', sent: 'ok', discarded: '' }[t.reply_status];
    return h('div', { class: 'card' },
      h('h3', {}, t.subject || t.title),
      h('div', { class: 'muted' }, [t.from, t.last_message_at].filter(Boolean).join(' · ')),
      h('div', { class: 'row' },
        h('span', { class: 'badge' }, CATEGORY_LABEL[t.category] || t.category),
        openReply(t) ? h('span', { class: 'badge warn' }, 'needs reply') : null,
        t.reply_status && t.reply_status !== 'none' ? h('span', { class: `badge ${statusBadge || ''}` }, `reply ${t.reply_status}`) : null,
        t.application_id ? appLink(t.application_id, 'Application') : h('span', { class: 'badge bad' }, 'not linked')),
      t.suggestion_status === 'pending' ? h('div', { class: 'row' },
        h('span', {}, `Move application to ${t.suggested_stage}?`),
        h('button', { class: 'primary', onclick: () => act(() => api('POST', `${T}/accept-stage`), `Moved to ${t.suggested_stage}`) }, 'Accept'),
        h('button', { onclick: () => act(() => api('POST', `${T}/reject-stage`), 'Suggestion rejected') }, 'Reject')) : null,
      h('details', {}, h('summary', {}, 'Thread'), h('pre', { class: 'doc' }, t.body || '(no messages stored)')),
      t.reply_status && !['none', 'discarded'].includes(t.reply_status) ? h('div', {},
        h('h2', {}, 'Drafted reply'), draft,
        h('div', { class: 'row' },
          t.reply_status === 'sent' ? h('span', { class: 'muted' }, `Sent ${t.sent_at}`) : [
            h('button', { onclick: () => act(() => api('POST', `${T}/draft`, { reply: draft.value }), 'Draft saved; approve again to send') }, 'Save edit'),
            h('button', { class: 'primary', disabled: t.reply_status === 'approved', onclick: () => act(() => api('POST', `${T}/approve`), 'Approved. It sends on the next send run') }, t.reply_status === 'approved' ? 'Approved' : 'Approve'),
            h('button', { class: 'danger', onclick: () => act(() => api('POST', `${T}/discard`), 'Discarded') }, 'Discard')])) : null,
      h('div', { class: 'row' }, link));
  };
  return h('div', {}, h('h1', {}, 'Inbox'),
    threads.length ? h('div', { class: 'grid cols' }, threads.map(card))
      : empty('No job-search email threads yet. The inbox check runs every 30 minutes once the email workflow is set up.'));
}

// ---------- Resumes ----------
async function resumes() {
  const { resumes: source } = await api('GET', '/api/resumes');
  const { docs } = await api('GET', '/api/docs/list', { dir: 'tailored' });
  const open = async (id) => {
    const r = await api('GET', `/api/resumes/${id}`);
    const box = document.getElementById('resume-view');
    box.replaceChildren(h('h2', {}, r.name), h('pre', { class: 'doc' }, r.body || '(no text ingested yet)'));
  };
  return h('div', {}, h('h1', {}, 'Resume library'),
    h('h2', {}, `Source resumes (${source.length})`),
    source.length ? h('div', { class: 'grid cols' }, source.map((r) => h('div', { class: 'card' }, h('h3', {}, r.name), h('div', { class: 'muted' }, `${r.focus} · ${r.format} · ${r.words} words`), h('div', { class: 'row' }, h('button', { onclick: () => open(r.resume_id) }, 'Read'))))) : empty('No resumes ingested yet. Run ingest-resumes.'),
    h('div', { id: 'resume-view' }),
    h('h2', {}, `Tailored documents (${docs.length})`),
    docs.length ? h('div', { class: 'grid cols' }, docs.map((d) => h('div', { class: 'card' }, h('h3', {}, appLink(d.application_id, d.title || d.path)), h('div', { class: 'muted' }, `${d.status} · v${d.version}`)))) : empty('Custom resumes and cover letters appear here once written.'));
}

// ---------- Searches ----------
async function searches() {
  const { searches: list } = await api('GET', '/api/searches');
  const card = (s) => {
    const q = h('input', { value: s.query || '', 'aria-label': 'Query' });
    const l = h('input', { value: s.location || '', 'aria-label': 'Location' });
    return h('div', { class: 'card' },
      h('h3', {}, s.name || s.title), h('div', { class: 'muted' }, `Last run: ${s.last_run_at || 'never'}${s.last_result_count != null ? ` · ${s.last_result_count} results` : ''}`),
      h('div', { class: 'row' }, q, l),
      h('div', { class: 'row' },
        h('label', {}, h('input', { type: 'checkbox', checked: s.enabled === true || s.enabled === 'true', onchange: (e) => act(() => api('PATCH', `/api/searches/${s.search_id}`, { enabled: e.target.checked })) }), ' Enabled'),
        h('button', { onclick: () => act(() => api('PATCH', `/api/searches/${s.search_id}`, { query: q.value, location: l.value }), 'Saved') }, 'Save')));
  };
  return h('div', {}, h('h1', {}, 'Searches'), list.length ? h('div', { class: 'grid cols' }, list.map(card)) : empty('No saved searches yet.'));
}

// ---------- Router ----------
async function render() {
  const [screen = 'today', arg] = location.hash.replace(/^#\//, '').split('/');
  nav.replaceChildren(...SCREENS.map(([key, label]) => h('a', { href: `#/${key}`, 'aria-current': key === screen || (screen === 'app' && key === 'pipeline') ? 'page' : null }, label)));
  const screens = { today, leads, pipeline, inbox, resumes, searches, app: () => application(arg) };
  try {
    view.replaceChildren(await (screens[screen] || today)());
  } catch (error) {
    view.replaceChildren(h('div', { class: 'card' }, h('h1', {}, 'Something went wrong'), h('p', {}, error.message), h('button', { onclick: render }, 'Retry')));
  }
}

window.addEventListener('hashchange', render);
setInterval(() => {
  const el = document.activeElement;
  if (el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return; // never rebuild under the user's cursor
  render();
}, 30000);
render();
