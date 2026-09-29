/*
 * Project brief: turns the plain form rendered by scripts/lib/personal/render.mjs
 * into one question per screen. Enter advances, Shift+Enter adds a line in the
 * long answer, letter keys pick a choice. Without this script the form still
 * posts to /api/lead as an ordinary form.
 */
(() => {
  const form = document.querySelector('[data-brief]');
  if (!form) return;
  const steps = [...form.querySelectorAll('.tf-step')];
  const count = form.querySelector('[data-count]');
  const bar = form.querySelector('.tf-bar span');
  const errorSlot = form.querySelector('[data-error-slot]');
  const back = form.querySelector('[data-prev]');
  const next = form.querySelector('[data-next]');
  const submit = form.querySelector('.tf-submit');
  const done = form.querySelector('.tf-done');
  const KEYS = 'ABCDEFGHIJ';
  const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
  let index = 0;
  let sending = false;

  form.classList.add('tf-on');
  form.setAttribute('novalidate', '');

  const pad = (n) => String(n).padStart(2, '0');
  const say = (msg) => { errorSlot.textContent = msg || ''; };

  function show(i, focus = true) {
    index = Math.max(0, Math.min(steps.length - 1, i));
    steps.forEach((s, k) => {
      s.classList.toggle('is-active', k === index);
      s.classList.toggle('is-past', k < index);
      s.toggleAttribute('inert', k !== index);
    });
    count.textContent = pad(index + 1);
    bar.style.transform = `scaleX(${(index + 1) / steps.length})`;
    back.disabled = index === 0;
    const last = index === steps.length - 1;
    next.hidden = last;
    submit.hidden = !last;
    say('');
    if (focus) {
      const step = steps[index];
      const target = step.querySelector('input:checked') || step.querySelector('textarea, input:not([type=hidden])');
      if (target) target.focus({ preventScroll: true });
    }
  }

  /** Returns an error message for the step, or '' when it is complete. */
  function problem(step) {
    const kind = step.dataset.kind;
    if (kind === 'choice') return step.querySelector('input:checked') ? '' : 'Please choose one option to continue.';
    if (kind === 'long') {
      const t = step.querySelector('textarea');
      const min = Number(t.getAttribute('minlength')) || 1;
      if (!t.value.trim()) return 'Please answer this question to continue.';
      return t.value.trim().length < min ? `Please add a little more detail (at least ${min} characters).` : '';
    }
    for (const input of step.querySelectorAll('input[required]')) {
      if (input.type === 'checkbox' && !input.checked) return 'Please confirm that I may contact you about this enquiry.';
      if (input.type !== 'checkbox' && !input.value.trim()) return 'Please complete this field to continue.';
      if (input.type === 'email' && !EMAIL.test(input.value.trim())) return 'Please enter a valid email address.';
    }
    return '';
  }

  function advance() {
    const msg = problem(steps[index]);
    if (msg) { say(msg); steps[index].classList.remove('shake'); void steps[index].offsetWidth; steps[index].classList.add('shake'); return; }
    if (index < steps.length - 1) show(index + 1);
    else form.requestSubmit();
  }

  back.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', advance);

  form.addEventListener('change', (e) => {
    const input = e.target;
    if (input.type !== 'radio') return;
    const step = input.closest('.tf-step');
    step.querySelectorAll('.tf-choice').forEach((l) => l.classList.toggle('is-picked', l.contains(input)));
    say('');
    if (steps.indexOf(step) === index && index < steps.length - 1) setTimeout(() => { if (steps.indexOf(step) === index) show(index + 1); }, 320);
  });

  form.addEventListener('keydown', (e) => {
    if (e.isComposing) return;
    const step = steps[index];
    if (e.key === 'Enter') {
      if (e.target.tagName === 'TEXTAREA' && e.shiftKey) return;
      if (e.target.tagName === 'BUTTON') return;
      e.preventDefault();
      advance();
      return;
    }
    if (step.dataset.kind === 'choice' && !e.metaKey && !e.ctrlKey && !e.altKey && e.key.length === 1) {
      const k = KEYS.indexOf(e.key.toUpperCase());
      const radios = step.querySelectorAll('input[type=radio]');
      if (k >= 0 && radios[k]) { e.preventDefault(); radios[k].click(); radios[k].focus(); }
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;
    const bad = steps.findIndex((s) => problem(s));
    if (bad !== -1) { show(bad); say(problem(steps[bad])); return; }
    const data = {};
    for (const [k, v] of new FormData(form)) data[k] = v;
    for (const box of form.querySelectorAll('input[type=checkbox]')) data[box.name] = box.checked;
    sending = true;
    submit.disabled = true;
    submit.classList.add('is-busy');
    try {
      const res = await fetch('/api/lead', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) {
        const field = body.errors && Object.keys(body.errors)[0];
        const at = field ? steps.findIndex((s) => s.querySelector(`[name="${CSS.escape(field)}"]`)) : -1;
        if (at !== -1) show(at);
        say(body.error || (field ? problem(steps[at]) || 'Please check this answer.' : form.dataset.error));
        return;
      }
      say('');
      form.classList.add('tf-complete');
      steps.forEach((s) => s.setAttribute('inert', ''));
      bar.style.transform = 'scaleX(1)';
      done.hidden = false;
      done.focus({ preventScroll: true });
      done.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    } catch {
      say(form.dataset.error);
    } finally {
      sending = false;
      submit.disabled = false;
      submit.classList.remove('is-busy');
    }
  });

  if (new URLSearchParams(location.search).get('sent') === '1') {
    form.classList.add('tf-complete');
    done.hidden = false;
  }
  show(0, false);
})();
