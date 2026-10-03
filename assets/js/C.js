/* C.js — group C: sliders and media (modules-C.md C0–C12, TEARDOWN Module 7). Own code; Swiper 11 from assets/lib.
   Swiper params are the literal values from the teardown (J: refs = tooling/scripts.pretty.js lines). */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const nav = (box) => ({ nextEl: $('.nav-btn--next', box), prevEl: $('.nav-btn--prev', box) });
  const script = document.currentScript;

  if (window.Swiper) {
    /* timeline, fancy (J:9788–9820) */
    $$('.tl--fancy .tl__swiper').forEach((el) => {
      new Swiper(el, {
        loop: false, autoHeight: true, initialSlide: 0, observer: true, observeParents: true, updateOnWindowResize: true,
        centeredSlides: false, slidesPerView: 1.2, spaceBetween: 0, navigation: nav(el.closest('.tl')),
        breakpoints: { 640: { slidesPerView: 2.285, spaceBetween: 0 }, 1028: { slidesPerView: 2.285, spaceBetween: 0 }, 1920: { slidesPerView: 2.285, spaceBetween: 0 } },
      });
    });

    /* timeline, plain (J:9991–10029) */
    $$('.tl:not(.tl--fancy) .tl__swiper').forEach((el) => {
      new Swiper(el, {
        loop: false, slidesPerView: 1.28, spaceBetween: 0, navigation: nav(el.closest('.tl')),
        breakpoints: { 480: { slidesPerView: 1.8, spaceBetween: 0 }, 767: { slidesPerView: 2.2, spaceBetween: 0 }, 1028: { slidesPerView: 2.43, spaceBetween: 0 }, 1920: { slidesPerView: 2.43, spaceBetween: 0 } },
        on: { init(sw) { sw.slideTo(0, 0); } },
      });
    });

    /* testimonial, traditional (J:10030–10047) */
    $$('.tt .tt__swiper').forEach((el) => {
      if (!$('.swiper-wrapper', el) || !$('.swiper-slide', el)) return;
      new Swiper(el, { loop: false, slidesPerView: 1, spaceBetween: 20, navigation: nav(el.closest('.tt')) });
    });

    /* testimonial, single view (J:10048–10065): buttons hidden when there is one slide or none */
    $$('.tsv').forEach((box) => {
      const el = $('.tsv__swiper', box);
      if (!el) return;
      if ($$('.swiper-slide', el).length <= 1) { $$('.nav-btn', box).forEach((b) => { b.style.display = 'none'; }); return; }
      new Swiper(el, { loop: false, slidesPerView: 1, spaceBetween: 10, navigation: nav(box) });
    });

    /* cta-grid slider cards (J:10066–10103) */
    $$('.cgs__swiper').forEach((el) => {
      new Swiper(el, {
        loop: false, slidesPerView: 1, spaceBetween: 0, navigation: nav(el.closest('.cgs')),
        breakpoints: { 375: { slidesPerView: 1.5, spaceBetween: 0 }, 580: { slidesPerView: 2.5, spaceBetween: 0 }, 641: { slidesPerView: 3, spaceBetween: 0 }, 1028: { slidesPerView: 4, spaceBetween: 0 }, 1920: { slidesPerView: 4, spaceBetween: 0 } },
      });
    });

    /* image gallery, looping carousel (J:10151–10183) */
    $$('.ig__swiper').forEach((el) => {
      new Swiper(el, {
        loop: true, slidesPerView: 1.5, spaceBetween: 16, centeredSlides: false, navigation: nav(el.closest('.ig__block')),
        breakpoints: { 375: { slidesPerView: 1.27, spaceBetween: 16 }, 641: { slidesPerView: 2.5, spaceBetween: 16 }, 1440: { slidesPerView: 2.97, spaceBetween: 20 }, 1920: { slidesPerView: 3.7, spaceBetween: 20 } },
      });
    });

    /* cta slider, fade mode (J:9833–9896; markup inferred, on no captured page) */
    $$('.cs').forEach((box) => {
      const el = $('.cs__swiper', box), counter = $('.cs__counter', box);
      if (!el) return;
      const btns = $$('.slider-btn', box);
      const total = $$('.swiper-slide', el).length;
      if (total <= 1) { if (counter) counter.style.display = 'none'; btns.forEach((b) => { b.style.display = 'none'; }); return; }
      const pad = (n) => String(n).padStart(2, '0');
      const updateCounter = (sw) => { if (counter) { counter.textContent = `${pad(sw.realIndex + 1)} / ${pad(total)}`; counter.style.display = 'block'; } };
      const positionNav = () => {
        const c = $('.swiper-slide-active .cs__content', el);
        if (c) btns.forEach((b) => { b.style.top = (c.offsetHeight + 26) + 'px'; });
      };
      const sw = new Swiper(el, {
        loop: false, effect: 'fade', autoHeight: true, fadeEffect: { crossFade: true }, slidesPerView: 1, spaceBetween: 0, navigation: nav(box),
        on: {
          init(s) {
            updateCounter(s); positionNav();
            $$('.swiper-slide', el).forEach((sl) => { const l = $('.cs__left', sl), im = $('.cs__img', sl); if (l && im) im.style.height = l.offsetHeight + 'px'; });
          },
          slideChangeTransitionEnd(s) { updateCounter(s); positionNav(); },
        },
      });
      addEventListener('resize', positionNav);
      return sw;
    });
  }

  /* ---------- hero video: preview + lightbox (C11, C12) ---------- */
  /* The shared hero template carries only the Play link (href = #hero-video-<id>); the sources live here, keyed by that id
     (the extractor drops the popup element, which sits outside any section). */
  const UP = 'https://landinstitute.org/wp-content/uploads/';
  const vendorUp = script ? new URL('../../../vendor/landinstitute.org/wp-content/uploads/', script.src).href : UP;
  const HERO = {
    'hero-video-6ac0ec154baf9': { src: UP + 'about-video-optimized.mp4', preview: UP + 'intro-optimized-1.mp4', poster: vendorUp + 'intro-optimized-img.jpg' },   // about-us
    'hero-video-6ac0ec54814c6': { src: UP + 'hero-campus-video.mp4', preview: UP + 'hero-campus-video.mp4', poster: '' },                                      // visit-us
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroOf = (a) => HERO[(a.getAttribute('href') || '').replace(/^#/, '')] || null;

  // looping muted preview under the Play bar (S#2195, S#2197)
  $$('.hero__video').forEach((hv) => {
    const a = $('a[href^="#hero-video-"]', hv), h = a && heroOf(a);
    if (!h || $('video', hv)) return;
    const v = document.createElement('video');
    v.className = 'hero__preview'; v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'metadata';
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true'); v.tabIndex = -1;
    if (h.poster) v.poster = h.poster;
    if (!reduced) v.autoplay = true;
    v.src = h.preview;
    $('img', hv)?.remove();
    hv.insertBefore(v, $('.play', hv));
  });

  // lightbox: backdrop .5 fade .3s, content scale .8 → 1, Esc / backdrop / × close, Tab trapped, page behind hidden
  let open = null;
  function openVideo(h, trigger) {
    if (open) return;
    const root = document.createElement('div');
    root.className = 'lb lb--loading';
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Dialog Window (Press escape to close)'); root.tabIndex = -1;
    root.innerHTML = '<div class="lb__wrap" data-lb-close role="document"><div class="lb__loader" aria-hidden="true">Loading...</div>' +
      '<div class="lb__container"><div class="lb__content"></div><button class="lb__close" type="button" aria-label="Close (Press escape to close)" data-lb-close>&times;</button></div></div>';
    const v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.controls = true; v.autoplay = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    if (h.poster) v.poster = h.poster;
    v.src = h.src;
    const pop = document.createElement('div');
    pop.className = 'popup-block';
    pop.innerHTML = '<div class="popup-block__design"><div class="popup-block__video"></div></div>';
    $('.popup-block__video', pop).appendChild(v);
    $('.lb__content', root).appendChild(pop);

    const hidden = [...document.body.children].filter((n) => n.nodeType === 1 && n.tagName !== 'SCRIPT').map((n) => [n, n.getAttribute('aria-hidden')]);
    hidden.forEach(([n]) => n.setAttribute('aria-hidden', 'true'));
    document.body.appendChild(root);
    document.documentElement.classList.add('lb-active');
    root.focus();
    requestAnimationFrame(() => requestAnimationFrame(() => { root.classList.remove('lb--loading'); root.classList.add('lb--opened'); }));
    v.play?.().catch(() => {});

    const focusables = () => $$('button, [href], input, select, textarea, video[controls], [tabindex]:not([tabindex="-1"])', root);
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'Tab') {
        const f = focusables();
        if (!f.length) { e.preventDefault(); return; }
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === root)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    const onClick = (e) => { if (e.target.hasAttribute('data-lb-close')) { e.preventDefault(); close(); } };
    function close() {
      if (!open) return;
      open = null;
      document.removeEventListener('keydown', onKey, true);
      root.removeEventListener('click', onClick);
      root.classList.remove('lb--opened'); root.classList.add('lb--closed');
      v.pause();
      let done = false;
      const finish = () => {
        if (done) return; done = true;
        root.remove();
        document.documentElement.classList.remove('lb-active');
        hidden.forEach(([n, prev]) => (prev === null ? n.removeAttribute('aria-hidden') : n.setAttribute('aria-hidden', prev)));
        trigger?.focus?.();
      };
      root.addEventListener('transitionend', (e) => { if (e.target === root) finish(); });
      setTimeout(finish, 500);
    }
    document.addEventListener('keydown', onKey, true);
    root.addEventListener('click', onClick);
    open = { close };
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('.hero__video a[href^="#hero-video-"], a[data-lity][href^="#hero-video-"]');
    const h = a && heroOf(a);
    if (!h) return;
    e.preventDefault();
    openVideo(h, a);
  });
})();
