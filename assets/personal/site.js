/* gregiteen.xyz motion layer. No dependencies. Everything here is optional:
 * with scripting off or reduced motion on, the page is complete and static. */
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const pointer = { x: -9999, y: -9999, active: false };

  /* ---------- registration field: crosses that remember where they belong ---------- */
  const canvas = document.getElementById('field');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, dpr = 1, pts = [], cols = 0, rows = 0, gap = 48;
  const pulses = [];

  function build() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gap = W < 640 ? 36 : 48;
    cols = Math.ceil(W / gap) + 1; rows = Math.ceil(H / gap) + 1;
    pts = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) pts.push({ hx: c * gap, hy: r * gap, x: c * gap, y: r * gap, vx: 0, vy: 0 });
    if (reduced) draw();
  }

  function step() {
    const R = 170;
    for (const p of pts) {
      let ax = (p.hx - p.x) * 0.075, ay = (p.hy - p.y) * 0.075;
      if (pointer.active) {
        const dx = p.x - pointer.x, dy = p.y - pointer.y, d2 = dx * dx + dy * dy;
        if (d2 < R * R) { const d = Math.sqrt(d2) || 1, f = (1 - d / R) * 5.2; ax += (dx / d) * f; ay += (dy / d) * f; }
      }
      for (const w of pulses) {
        const dx = p.hx - w.x, dy = p.hy - w.y, d = Math.hypot(dx, dy), off = Math.abs(d - w.r);
        if (off < 46) { const f = (1 - off / 46) * 1.7 * w.a; ax += (dx / (d || 1)) * f; ay += (dy / (d || 1)) * f; }
      }
      p.vx = (p.vx + ax) * 0.8; p.vy = (p.vy + ay) * 0.8;
      p.x += p.vx; p.y += p.vy;
    }
    for (let i = pulses.length - 1; i >= 0; i--) { pulses[i].r += 9; pulses[i].a *= 0.985; if (pulses[i].r > Math.max(W, H) * 1.2 || pulses[i].a < 0.05) pulses.splice(i, 1); }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    // traces: a link is drawn between neighbours that have been pulled off their marks
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const p = pts[r * cols + c];
      const disp = Math.hypot(p.x - p.hx, p.y - p.hy);
      if (disp > 1.2) {
        const a = Math.min(disp / 26, 1) * 0.55;
        ctx.strokeStyle = `rgba(255,106,0,${a})`;
        ctx.beginPath();
        if (c + 1 < cols) { const q = pts[r * cols + c + 1]; ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); }
        if (r + 1 < rows) { const q = pts[(r + 1) * cols + c]; ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); }
        ctx.stroke();
      }
    }
    ctx.strokeStyle = 'rgba(156,199,232,0.30)';
    ctx.beginPath();
    for (const p of pts) { ctx.moveTo(p.x - 3.5, p.y); ctx.lineTo(p.x + 3.5, p.y); ctx.moveTo(p.x, p.y - 3.5); ctx.lineTo(p.x, p.y + 3.5); }
    ctx.stroke();
  }

  let raf = 0, last = 0, lastPulse = 0;
  function loop(t) {
    raf = requestAnimationFrame(loop);
    if (t - last < 15) return; // ~60fps ceiling
    last = t;
    if (t - lastPulse > 7000) { lastPulse = t; pulses.push({ x: Math.random() * W, y: Math.random() * H * 0.8, r: 0, a: 1 }); }
    step(); draw();
  }
  build();
  addEventListener('resize', () => { build(); });
  if (!reduced) {
    raf = requestAnimationFrame(loop);
    document.addEventListener('visibilitychange', () => { cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(loop); });
  }

  /* ---------- pointer tracking ---------- */
  const cursor = document.querySelector('.cursor');
  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true;
    if (cursor && fine) { cursor.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`; cursor.classList.add('on'); }
  }, { passive: true });
  addEventListener('pointerleave', () => { pointer.active = false; if (cursor) cursor.classList.remove('on'); });
  if (cursor && fine) {
    document.addEventListener('pointerover', (e) => { cursor.classList.toggle('big', Boolean(e.target.closest('a, button'))); });
  }

  /* ---------- headline: glyph width answers the pointer ---------- */
  const chars = [...document.querySelectorAll('h1 .ch')];
  if (chars.length) {
    const last = chars[chars.length - 1];
    const ready = () => root.classList.add('chars-ready');
    if (reduced) ready(); else last.addEventListener('animationend', ready, { once: true });
    setTimeout(ready, 4200); // never depend on the animation event alone
    if (!reduced && fine) {
      let boxes = [];
      const measure = () => { boxes = chars.map((c) => { const b = c.getBoundingClientRect(); return { c, cx: b.left + b.width / 2 + scrollX, cy: b.top + b.height / 2 + scrollY }; }); };
      addEventListener('load', measure); addEventListener('resize', measure); setTimeout(measure, 2600);
      const tick = () => {
        requestAnimationFrame(tick);
        if (!root.classList.contains('chars-ready') || !pointer.active) return;
        for (const b of boxes) {
          const d = Math.hypot(b.cx - scrollX - pointer.x, b.cy - scrollY - pointer.y);
          const k = Math.max(0, 1 - d / 240);
          const w = 100 + k * 55, wt = 720 + k * 160;
          const cw = Number(b.c.dataset.w || 100);
          const nw = cw + (w - cw) * 0.18;
          b.c.dataset.w = nw.toFixed(2);
          b.c.style.setProperty('--w', nw.toFixed(1));
          b.c.style.setProperty('--wt', (720 + (nw - 100) / 55 * 160).toFixed(0));
        }
      };
      requestAnimationFrame(tick);
    }
  }

  /* ---------- reveal on scroll ---------- */
  const targets = document.querySelectorAll('[data-reveal]');
  document.querySelectorAll('.dg').forEach((g) => [...g.children].forEach((el, i) => el.style.setProperty('--k', i)));
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    targets.forEach((t) => io.observe(t));
  } else {
    targets.forEach((t) => t.classList.add('in'));
  }

  /* ---------- scroll progress ---------- */
  const bar = document.querySelector('.progress');
  let ticking = false;
  const progress = () => { ticking = false; const h = document.documentElement; const max = h.scrollHeight - innerHeight; bar.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`; };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(progress); } }, { passive: true });
  progress();

  /* ---------- deployed sites: preview follows the pointer ---------- */
  if (fine && !reduced) {
    document.querySelectorAll('.site a').forEach((a) => {
      const img = a.querySelector('.site-shot');
      let tx = 0, ty = 0, x = 0, y = 0, on = false, id = 0;
      const move = () => {
        x += (tx - x) * 0.14; y += (ty - y) * 0.14;
        img.style.setProperty('--mx', x.toFixed(1)); img.style.setProperty('--my', y.toFixed(1));
        img.style.setProperty('--r', `${Math.max(-6, Math.min(6, (tx - x) * 0.05)).toFixed(2)}deg`);
        if (on) id = requestAnimationFrame(move);
      };
      a.addEventListener('pointerenter', (e) => { on = true; tx = x = e.clientX + 40; ty = y = e.clientY; cancelAnimationFrame(id); id = requestAnimationFrame(move); });
      a.addEventListener('pointermove', (e) => { tx = e.clientX + 40; ty = e.clientY; });
      a.addEventListener('pointerleave', () => { on = false; });
    });
  }

  /* ---------- magnetic mail link ---------- */
  const mag = document.querySelector('[data-magnet]');
  if (mag && fine && !reduced) {
    addEventListener('pointermove', (e) => {
      const b = mag.getBoundingClientRect();
      const dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2);
      const d = Math.hypot(dx, dy);
      const pull = d < 320 ? (1 - d / 320) * 0.18 : 0;
      mag.style.transform = `translate3d(${dx * pull}px, ${dy * pull}px, 0)`;
    }, { passive: true });
  }

  /* ---------- copy install commands ---------- */
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(btn.dataset.copy); } catch { const r = document.createRange(); r.selectNodeContents(btn.querySelector('code')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
      btn.classList.add('done'); setTimeout(() => btn.classList.remove('done'), 1400);
    });
  });
})();
