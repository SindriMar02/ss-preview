/* ss.js — SS-only widgets built on the reference's map device (TEARDOWN Module 12):
   the history map (home) and the afurðaverð price grid (bændur). Same rules as site.js:
   swiper steps, recolour on step, counters 0 → value over 1200ms, run once in view. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const isNum = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const fmt = (n) => isNum(Math.round(n));
  const dec = (n) => n.toFixed(1).replace('.', ',');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* counter tween, 1200ms like the reference map (J:9897–9990) */
  const ease = (t) => 1 - Math.pow(1 - t, 3);   /* ease-out cubic: the readout lands fast */
  const tween = (el, from, to, suffix = '', signed = false, dur = 1200) => {
    if (el._raf) cancelAnimationFrame(el._raf);
    const paint = (v) => { el.textContent = (signed && v > 0 ? '+' : '') + (signed ? dec(v) : fmt(v)) + suffix; };
    if (reduce) { paint(to); el._v = to; return; }
    let t0 = null;
    const step = (now) => {
      t0 ??= now;
      const p = Math.min((now - t0) / dur, 1);
      const v = from + (to - from) * (dur > 600 ? p : ease(p));
      paint(signed ? Math.round(v * 10) / 10 : Math.floor(v));
      el._v = v;
      if (p < 1) el._raf = requestAnimationFrame(step); else { paint(to); el._v = to; }
    };
    el._raf = requestAnimationFrame(step);
  };

  const scrubber = (box, n, onChange, initial = 0) => {
    const years = new Swiper($('.vmap__years .swiper', box), { slidesPerView: 'auto', centeredSlides: true, slideToClickedSlide: true, speed: 10, initialSlide: initial, a11y: { slideRole: 'button' } });
    const prev = $('.prev', box), next = $('.next', box);
    const sync = () => { prev.disabled = years.activeIndex === 0; next.disabled = years.activeIndex === n - 1; };
    years.on('slideChange', () => { onChange(years.activeIndex); sync(); });
    prev.addEventListener('click', () => years.slidePrev());
    next.addEventListener('click', () => years.slideNext());
    sync();
    return years;
  };

  /* ---------- history map (home) ---------- */
  $$('[data-hmap]').forEach((box) => {
    const data = JSON.parse($('script[type="application/json"]', box).textContent);
    const svg = $('svg', box), yearEl = $('.hmap__year', box), textEl = $('.hmap__text', box);
    const fit = () => { const m = innerWidth < 768 && svg.dataset.vbMobile; svg.setAttribute('viewBox', m ? svg.dataset.vbMobile : svg.dataset.vb); };   /* phones: zoom to the south-west so the places stay legible */
    fit(); addEventListener('resize', fit);
    const set = (i) => {
      const y = data.years[i];
      svg.dataset.year = y.year;
      $$('.hmap__place', svg).forEach((p) => { p.dataset.lv = p.getAttribute('data-y' + y.year) || '0'; });
      yearEl.textContent = y.label || y.year;
      textEl.textContent = y.text;
    };
    set(0);
    if (window.Swiper) scrubber(box, data.years.length, set);
  });

  /* ---------- price grid (afurðaverð) ---------- */
  $$('[data-pgrid]').forEach((box) => {
    const d = JSON.parse($('script[type="application/json"]', box).textContent);
    const cells = $$('.pgrid__cell', box);
    const counts = Object.fromEntries($$('.pgrid__count', box).map((el) => [el.dataset.v, el]));
    const lPrice = $('.pgrid__l-price', box), lDelta = $('.pgrid__l-delta', box);
    let key = d.default, wi = 0, seen = false, first = true;

    /* the week that is on now, or the next one; before the season = first, after = last */
    const today = new Date();
    const iso = today.toISOString().slice(0, 10);
    wi = d.starts.findIndex((w) => iso <= w.end);
    if (wi < 0) wi = d.s26.weeks.length - 1;

    const levels = (w) => {
      const vals = cells.map((c) => d.s26.grid[c.dataset.k][w + 1]).sort((a, b) => a - b);
      const q = (p) => vals[Math.floor((vals.length - 1) * p)];
      const cut = [q(.2), q(.45), q(.7), q(.9)];
      cells.forEach((c) => {
        const v = d.s26.grid[c.dataset.k][w + 1];
        c.dataset.lv = String(cut.filter((t) => v >= t).length);
        $('.pgrid__v', c).textContent = fmt(v);
      });
    };
    const show = (animate = true) => {
      const v = d.s26.grid[key][wi + 1];
      const old = d.s25.grid[key][Math.min(wi, d.s25.weeks.length - 1) + 1];
      const delta = old ? Math.round((v / old - 1) * 1000) / 10 : 0;
      const wk = d.s26.weeks[wi].replace('v', 'viku ');
      lPrice.textContent = `kr/kg, ${key} í ${wk}`;
      lDelta.textContent = wi < d.s25.weeks.length ? `breyting frá ${wk} 2025` : 'breyting frá síðustu viku 2025';
      const dur = first ? 1200 : 260;   /* first reveal matches the reference map (1200ms); every later update is a response */
      const go = (el, to, suffix, signed) => (animate ? tween(el, el._v || 0, to, suffix, signed, dur) : (el._v = to, el.textContent = (signed && to > 0 ? '+' : '') + (signed ? dec(to) : fmt(to)) + suffix));
      go(counts.price, v, '');
      go(counts.bonus, v * (1 + d.bonus / 100), '');
      go(counts.delta, delta, ' %', true);
      first = false;
    };
    const select = (k) => {
      key = k;
      cells.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.k === k)));
      if (seen) show();
    };
    cells.forEach((c) => c.addEventListener('click', () => select(c.dataset.k)));
    levels(wi);
    if (window.Swiper) scrubber(box, d.s26.weeks.length, (i) => { wi = i; levels(i); if (seen) show(); }, wi);
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { seen = true; show(); io.disconnect(); } }), { threshold: 0.3 });
    io.observe(box);
  });
})();

/* recipe: copy the unticked ingredients as a shopping list */
(() => {
  document.querySelectorAll('[data-recipe]').forEach((box) => {
    const btn = box.querySelector('.rcp__copy');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const title = box.querySelector('h2').textContent.trim();
      const items = [...box.querySelectorAll('.rcp__ing li')].filter((li) => !li.querySelector('input').checked).map((li) => '- ' + li.textContent.trim());
      const text = `Innkaupalisti: ${title}\n` + items.join('\n');
      try { await navigator.clipboard.writeText(text); } catch (e) { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
      btn.textContent = btn.dataset.doneLabel;
      setTimeout(() => { btn.textContent = btn.dataset.copyLabel; }, 2400);
    });
  });
})();

/* Mínar síður mock: tabs, and any sign-in or the sample link opens the sample overview (no data leaves the page) */
(() => {
  const box = document.querySelector('[data-portal]');
  if (!box) return;
  const tabs = [...box.querySelectorAll('.portal__tab')];
  tabs.forEach((t) => t.addEventListener('click', () => {
    tabs.forEach((o) => { o.setAttribute('aria-selected', String(o === t)); document.getElementById(o.getAttribute('aria-controls')).hidden = o !== t; });
  }));
  const login = box.querySelector('.portal__login'), dash = box.querySelector('.portal__dash');
  const open = (e) => { e?.preventDefault(); login.hidden = true; dash.hidden = false; dash.querySelector('.h4').setAttribute('tabindex', '-1'); dash.querySelector('.h4').focus(); };
  box.querySelectorAll('.portal__form').forEach((f) => f.addEventListener('submit', open));
  box.querySelector('.portal__demo').addEventListener('click', open);
  box.querySelector('.portal__out').addEventListener('click', () => { dash.hidden = true; login.hidden = false; });
})();

/* portal tabs: arrow keys move between tabs (WAI tabs pattern) */
(() => {
  const tabs = [...document.querySelectorAll('.portal__tab')];
  tabs.forEach((t, i) => t.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    n.focus(); n.click();
  }));
})();

/* links to pages that are not part of the prototype: say so instead of doing nothing */
(() => {
  let toast;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href$="#ekki-i-frumgerd"]');
    if (!a) return;
    e.preventDefault();
    if (!toast) { toast = document.createElement('div'); toast.className = 'proto-toast'; toast.setAttribute('role', 'status'); document.body.appendChild(toast); }
    toast.textContent = `„${a.textContent.trim()}“ er ekki hluti af frumgerðinni. Frumgerðin sýnir forsíðu, haustvef, afurðaverð sauðfjár og Mínar síður.`;
    toast.classList.add('is-on');
    clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove('is-on'), 3200);
  });
})();
