/* A.js — group A behaviour (own code, written from tooling/modules-A.md A1, A6, A10):
   sticky-left image pinning, sticky scrolling-text title, read-more slider. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const head = $('.site-head');
  const headH = () => (head ? head.offsetHeight : 0);

  /* A1: pin the image of every .sl while its row is in range (J:3532–3568). The CSS sticky of the reference is dead
     (an ancestor clips overflow), so this is the whole effect: fixed under the header, then parked at the row bottom. */
  const sticky = $$('.sl').map((el) => ({ row: $('.sl__row', el), col: $('.sl__img', el), stick: $('.sl__stick', el) })).filter((s) => s.row && s.col && s.stick);
  const pin = () => {
    const H = headH();
    sticky.forEach(({ row, col, stick }) => {
      if (innerWidth < 992) { stick.style.cssText = 'position:relative;top:0;left:0;width:100%'; return; }
      const o = col.offsetHeight, r = row.getBoundingClientRect();
      if (r.top < H && H + o < r.bottom) {
        const c = col.getBoundingClientRect();
        stick.style.cssText = `position:fixed;top:${H}px;left:${c.left}px;width:${col.offsetWidth}px;bottom:auto`;
      } else if (r.top < H) {
        stick.style.cssText = `position:absolute;top:${Math.max(0, r.height - o)}px;left:0;width:100%`;
      } else {
        stick.style.cssText = 'position:absolute;top:0;left:0;width:100%';
      }
    });
  };

  /* A6: title column of .stx follows the header, then rests at the bottom of the block (J:3852–3889) */
  const titles = $$('.stx').map((el) => ({ el, parent: $('.stx__parent', el), stick: $('.stx__stick', el) })).filter((s) => s.parent && s.stick);
  const follow = () => {
    const H = headH();
    titles.forEach(({ el, parent, stick }) => {
      if (innerWidth < 992) { stick.style.cssText = ''; parent.style.height = ''; return; }
      const r = el.getBoundingClientRect(), d = stick.offsetHeight;
      parent.style.height = d + 'px';
      const w = parent.offsetWidth;
      if (r.top <= H && r.bottom - d > H) stick.style.cssText = `position:fixed;top:${H}px;width:${w}px`;
      else if (r.top <= H) stick.style.cssText = `position:absolute;bottom:0;width:${w}px`;
      else stick.style.cssText = 'position:relative';
    });
  };

  const update = () => { if (sticky.length) pin(); if (titles.length) follow(); };
  if (sticky.length || titles.length) {
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    addEventListener('load', update);
    update();
  }

  /* A10: read-more slider, 1 / 2 / 3 slides per view at 0 / 480 / 1028 (J:10123–10145) */
  const init = () => {
    if (!window.Swiper) return;
    $$('.rm__swiper').forEach((el) => {
      const box = el.closest('.rm__slider');
      new Swiper(el, {
        slidesPerView: 1, spaceBetween: 0,
        breakpoints: { 480: { slidesPerView: 2 }, 1028: { slidesPerView: 3 }, 1920: { slidesPerView: 3 } },
        navigation: { nextEl: $('.nav-btn--next', box), prevEl: $('.nav-btn--prev', box) },
      });
    });
  };
  if (document.readyState === 'complete') init(); else addEventListener('load', init);
})();
