/**
 * Project brief (the lead form on /contact.html).
 *
 * The questions live in the vault (`x_brief` on vault/pages/contact.md); this
 * module validates a submission against them so the renderer and the server
 * share one definition. Only values the document declares are accepted.
 */

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
const clip = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

/** Flatten the brief definition into the named inputs it declares. */
export function briefFields(questions = []) {
  const out = [];
  for (const q of questions) {
    if (q.kind === 'fields') for (const f of q.fields || []) out.push({ ...f, step: q.id });
    else out.push({ name: q.id, type: q.kind, required: q.required !== false, min: q.min, max: q.max, options: q.options, step: q.id });
  }
  return out;
}

/**
 * Validate a submission. Returns { ok, errors, answers } where `answers`
 * holds only declared, cleaned values (choice values stay machine values).
 */
export function validateBrief(questions, input = {}) {
  const errors = {};
  const answers = {};
  for (const f of briefFields(questions)) {
    const raw = input[f.name];
    if (f.type === 'choice') {
      const value = clip(raw, 80);
      if (!value) { if (f.required) errors[f.name] = 'required'; continue; }
      if (!(f.options || []).some((o) => o.value === value)) { errors[f.name] = 'invalid'; continue; }
      answers[f.name] = value;
    } else if (f.type === 'checkbox') {
      const on = raw === true || raw === 'on' || raw === 'true' || raw === '1';
      if (!on && f.required) errors[f.name] = 'required';
      answers[f.name] = on;
    } else {
      const max = Number(f.max) || 2000;
      const value = f.type === 'long' ? String(raw ?? '').trim().slice(0, max) : clip(raw, max);
      if (!value) { if (f.required) errors[f.name] = 'required'; continue; }
      if (f.min && value.length < Number(f.min)) { errors[f.name] = 'too_short'; continue; }
      if (f.type === 'email' && !EMAIL.test(value)) { errors[f.name] = 'invalid'; continue; }
      answers[f.name] = f.type === 'email' ? value.toLowerCase() : value;
    }
  }
  return { ok: Object.keys(errors).length === 0, errors, answers };
}

/** Human-readable [prompt, answer] rows, with choice values shown by their labels. */
export function briefSummary(questions, answers) {
  const rows = [];
  for (const q of questions) {
    if (q.kind === 'choice') {
      const opt = (q.options || []).find((o) => o.value === answers[q.id]);
      if (opt) rows.push([q.prompt, opt.label]);
    } else if (q.kind === 'long') {
      if (answers[q.id]) rows.push([q.prompt, answers[q.id]]);
    } else if (q.kind === 'fields') {
      for (const f of q.fields || []) {
        if (f.type === 'checkbox') continue;
        if (answers[f.name]) rows.push([f.label, answers[f.name]]);
      }
    }
  }
  return rows;
}
