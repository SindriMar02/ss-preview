/* site.js — clean-room behaviour for the rebuild (TEARDOWN Modules 1, 5–9, 12, 17–18).
   No reference code; behaviour and numbers from the teardown. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const desktop = () => innerWidth > 1200;
  const isNum = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');   /* SS: Icelandic thousands dot, independent of the browser's ICU data */

  /* header shrink + logo 88 → 54px over the first 120px (J:3494, J:4104–4110, H:47) */
  const head = $('.site-head');
  const logo = $('.logo img');
  const onScroll = () => {
    const y = scrollY;
    head?.classList.toggle('is-shrunk', y > 0);
    document.body.classList.toggle('is-shrunk', y > 0);
    if (logo && innerWidth >= 1200) {
      const s = 88 * (1 - Math.min(y, 120) / 120 * (1 - 54 / 88));
      logo.style.height = s + 'px';   /* SS: the lockup is landscape (684×400); size by height, width follows */
    } else if (logo) { logo.style.height = ''; }
    if (desktop()) closeMegas();                                             // any scroll closes mega menus (J:3725)
  };
  addEventListener('scroll', onScroll, { passive: true });

  /* button bubble: in/out classes on hover (J:3508–3514) */
  $$('.btn').forEach((b) => {
    b.addEventListener('mouseenter', () => { b.classList.remove('out'); b.classList.add('in'); });
    b.addEventListener('mouseleave', () => { b.classList.remove('in'); b.classList.add('out'); });
  });

  /* sibling dimming (J:3740–3758) */
  $$('[data-dim]').forEach((group) => {
    const kids = [...group.children];
    kids.forEach((k) => {
      k.addEventListener('mouseenter', () => kids.forEach((o) => o !== k && o.classList.add('is-dim')));
      k.addEventListener('mouseleave', () => kids.forEach((o) => o.classList.remove('is-dim')));
    });
  });

  /* mega menus — desktop hover/focus, mobile panels (J:3637–3734, H:93–137) */
  const megas = $$('.has-mega');
  function closeMegas() {
    megas.forEach((m) => { m.classList.remove('is-open'); m.querySelector('.head-nav__link')?.setAttribute('aria-expanded', 'false'); });
    document.body.classList.remove('dimmed');
  }
  megas.forEach((li) => {
    const open = () => { if (!desktop()) return; closeMegas(); li.classList.add('is-open'); li.querySelector('.head-nav__link').setAttribute('aria-expanded', 'true'); document.body.classList.add('dimmed'); };
    const close = () => { if (!desktop()) return; li.classList.remove('is-open'); li.querySelector('.head-nav__link').setAttribute('aria-expanded', 'false'); document.body.classList.remove('dimmed'); };
    li.addEventListener('mouseenter', open);
    li.addEventListener('mouseleave', close);
    li.addEventListener('focusin', open);
    li.addEventListener('focusout', (e) => { if (!li.contains(e.relatedTarget)) close(); });
    li.querySelector('.expand')?.addEventListener('click', (e) => {
      e.preventDefault();
      const was = li.classList.contains('is-open');
      closeMegas();
      head.classList.toggle('has-sub-open', !was);
      if (!was) li.classList.add('is-open');
    });
  });
  $('.mega-back')?.addEventListener('click', (e) => { e.preventDefault(); closeMegas(); head.classList.remove('has-sub-open'); });
  const setLogoH = () => head && head.style.setProperty('--logo-h', $('.logo')?.getBoundingClientRect().height + 'px');
  setLogoH(); addEventListener('resize', setLogoH);

  /* hamburger + overlay (J:3524–3531) */
  const burger = $('.menu-btn'), overlay = $('.head-nav');
  burger?.addEventListener('click', () => {
    const open = !burger.classList.contains('is-open');
    burger.classList.toggle('is-open', open);
    overlay.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('no-scroll', open);
    burger.setAttribute('aria-expanded', String(open));
    closeMegas(); head.classList.remove('has-sub-open');
  });

  /* dropdowns: one open at a time, items stagger .1s (J:3582–3608, J:3774–3851) */
  $$('.dd').forEach((dd) => {
    const t = $('.dd__toggle', dd);
    t.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !dd.classList.contains('is-open');
      $$('.dd.is-open').forEach((o) => { o.classList.remove('is-open'); $('.dd__toggle', o).setAttribute('aria-expanded', 'false'); });
      dd.classList.toggle('is-open', open);
      t.setAttribute('aria-expanded', String(open));
      if (open) $$('li', dd).forEach((li, i) => { li.style.animationDelay = (0.1 * i) + 's'; });
    });
  });
  document.addEventListener('click', (e) => $$('.dd.is-open').forEach((o) => { if (!o.contains(e.target)) o.classList.remove('is-open'); }));

  /* header search panel: icon toggles, any click outside closes (J:3736–3757); type picker relabels the toggle (J:4576–4586) */
  const sBox = $('.head-search'), sBtn = $('.head-search > button');
  if (sBox && sBtn && $('.search-panel', sBox)) {
    sBtn.addEventListener('click', (e) => { e.preventDefault(); const open = sBox.classList.toggle('is-open'); sBtn.setAttribute('aria-expanded', String(open)); });
    document.addEventListener('click', (e) => { if (!sBox.contains(e.target)) { sBox.classList.remove('is-open'); sBtn.setAttribute('aria-expanded', 'false'); } });
    const form = $('.search-form', sBox), dd = $('.dd--search', sBox);
    $$('.dd__menu a', dd).forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      $$('li', dd).forEach((li) => li.classList.remove('is-active')); a.closest('li').classList.add('is-active');
      const post = a.dataset.post;
      $('.dd__toggle', dd).textContent = 'Search: ' + (post === 'all' ? 'Everything' : a.textContent.trim());
      form.elements['search-type'].value = post; form.elements['learn-type'].value = a.dataset.taxonomy;
      dd.classList.remove('is-open'); $('.dd__toggle', dd).setAttribute('aria-expanded', 'false');
    }));
  }

  /* footer accordion ≤991, one open (J:4111–4124) */
  $$('.foot-group__title').forEach((t) => t.addEventListener('click', () => {
    if (innerWidth > 991) return;
    const g = t.closest('.foot-group');
    $$('.foot-group').forEach((o) => o !== g && o.classList.remove('is-open'));
    g.classList.toggle('is-open');
    t.setAttribute('aria-expanded', String(g.classList.contains('is-open')));
  }));
  addEventListener('resize', () => { if (innerWidth > 991) $$('.foot-group.is-open').forEach((g) => g.classList.remove('is-open')); });

  /* stat counters: 0 → target, 3000ms linear, ceil, once at 10% (J:3614–3636) */
  const statIO = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (!en.isIntersecting) return;
    statIO.unobserve(en.target);
    const el = $('.count', en.target), target = +en.target.dataset.target, t0 = performance.now();
    const tick = (now) => { const p = Math.min((now - t0) / 3000, 1); el.textContent = isNum(Math.ceil(p * target)); if (p < 1) requestAnimationFrame(tick); else el.textContent = isNum(target); };
    requestAnimationFrame(tick);
  }), { threshold: 0.1 });
  $$('[data-target]').forEach((el) => statIO.observe(el));

  /* research slider (J:9821–9832) */
  if (window.Swiper) $$('.rs .swiper').forEach((el) => {
    const box = el.closest('.rs-box');
    new Swiper(el, { slidesPerView: 'auto', spaceBetween: 0, navigation: { nextEl: $('.nav-btn--next', box), prevEl: $('.nav-btn--prev', box) } });
  });

  /* vision map: linked year scrubber, recolour, counters (J:9897–9990) */
  $$('.vmap').forEach((box) => {
    const svg = $('svg', box), data = JSON.parse($('script[type="application/json"]', box).textContent);
    const counts = $$('.vmap__count', box);
    let shown = data.years[0].values.map((v) => v.start), raf = [];
    const fmt = (n) => isNum(n);
    const run = (yi, fromStart) => {
      raf.forEach(cancelAnimationFrame); raf = [];
      data.years[yi].values.forEach((v, i) => {
        const from = fromStart ? v.start : shown[i], to = v.end; let t0 = null;
        const step = (now) => { t0 ??= now; const p = Math.min((now - t0) / 1200, 1); shown[i] = Math.floor(from + (to - from) * p); counts[i].textContent = fmt(shown[i]); if (p < 1) raf.push(requestAnimationFrame(step)); };
        raf.push(requestAnimationFrame(step));
      });
    };
    const setYear = (yi) => {
      const y = data.years[yi].year; svg.dataset.year = y;
      $$('.country', svg).forEach((p) => { p.dataset.lv = p.getAttribute('data-y' + y) || '0'; });
      $$('.vmap__label', box).forEach((l, i) => { l.textContent = data.years[yi].values[i].label; });
    };
    setYear(0);
    const years = new Swiper($('.vmap__years .swiper', box), { slidesPerView: 'auto', centeredSlides: true, slideToClickedSlide: true, speed: 10, a11y: { slideRole: 'button' } });
    const prev = $('.vmap__drag .prev', box), next = $('.vmap__drag .next', box);
    const sync = () => { prev.disabled = years.activeIndex === 0; next.disabled = years.activeIndex === data.years.length - 1; };
    years.on('slideChange', () => { setYear(years.activeIndex); sync(); });
    years.on('slideChangeTransitionEnd', () => run(years.activeIndex, false));
    prev.addEventListener('click', () => years.slidePrev()); next.addEventListener('click', () => years.slideNext());
    sync();
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { run(years.activeIndex, true); io.disconnect(); } }), { threshold: 0.3 });
    io.observe(box);
  });

  onScroll();   // first run after the menu list exists

  /* sticky sub-nav: reserve space so the footer is not hidden */
  if ($('.subnav')) document.body.classList.add('has-subnav');
})();
