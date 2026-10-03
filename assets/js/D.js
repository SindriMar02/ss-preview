/* D.js — group D behaviour, own code written from tooling/modules-D.md (D1–D17, TEARDOWN Modules 6–7).
   No server in the rebuild: the reference's AJAX filters (filter_learn, filter_news; D17) are replaced by filtering the
   cards that are in the page, and the server-side events view switch by a client-side one. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------------------------------------------------------------- D8 staff tabs (J:4068–4091) */
  $$('.stf').forEach((root) => {
    const pills = $$('.stf__pill', root), cards = $$('.stf__card', root), none = $('.stf__none', root);
    const apply = (pill) => {
      pills.forEach((p) => { p.classList.toggle('is-current', p === pill); p.setAttribute('aria-selected', String(p === pill)); });
      const cat = pill.dataset.cat, bg = pill.dataset.bg;
      let n = 0;
      cards.forEach((c) => {
        [...c.classList].filter((k) => k.startsWith('bg-')).forEach((k) => c.classList.remove(k));
        const ok = cat === 'all' || c.dataset.cats.split(',').includes(cat);
        if (ok) {
          n++;
          if (bg && bg !== 'none') c.classList.add('bg-' + bg);
          c.hidden = false; c.classList.remove('is-in'); void c.offsetWidth; c.classList.add('is-in');
        } else { c.hidden = true; c.classList.remove('is-in'); }
      });
      none.hidden = n > 0;
    };
    pills.forEach((p) => {
      p.addEventListener('click', () => apply(p));
      p.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); apply(p); } });
    });
  });

  /* ---------------------------------------------------------------- D9 FAQ accordion, single open (accordion.js J:4718–4739) */
  $$('.faq').forEach((root) => {
    const qs = $$('.faq__q', root);
    const close = (q) => { q.classList.remove('is-active'); q.setAttribute('aria-expanded', 'false'); q.nextElementSibling.style.maxHeight = '0px'; };
    const toggle = (q) => {
      const was = q.classList.contains('is-active');
      qs.forEach(close);
      if (!was) { q.classList.add('is-active'); q.setAttribute('aria-expanded', 'true'); q.nextElementSibling.style.maxHeight = q.nextElementSibling.scrollHeight + 'px'; }
    };
    qs.forEach((q) => {
      q.addEventListener('click', () => toggle(q));
      q.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(q); } });
    });
    addEventListener('resize', () => { const a = $('.faq__q.is-active', root); if (a) a.nextElementSibling.style.maxHeight = a.nextElementSibling.scrollHeight + 'px'; });
  });

  /* ---------------------------------------------------------------- D1/D2/D3/D4 filter bar, dropdowns, card filtering, pager popup */
  const PARAM = { learn: { 'learn-type': 'learn-type', 'learn-topic': 'learn-topic', 'learn-crops': 'learn-crop', 'learn-crop': 'learn-crop', 'learn-audience': 'learn-audience' },
                  news: { 'news-type': 'type', 'news-topic': 'topic', 'news-audience': 'audience', 'news-crop': 'crop' } };
  const EMPTY = { learn: 'No results found.', news: 'No news posts found.', events: 'No past events found.' };
  const closeAllDropdowns = () => {
    $$('.tdd__menu.is-open').forEach((u) => u.classList.remove('is-open'));
    $$('.tdd.is-open').forEach((d) => { d.classList.remove('is-open'); $('.tdd__toggle', d).setAttribute('aria-expanded', 'false'); });
  };
  document.addEventListener('click', (e) => { if (!e.target.closest('.tdd, .tdd__menu')) closeAllDropdowns(); });

  $$('.lst').forEach((lst) => {
    const kind = lst.dataset.kind, archive = lst.classList.contains('lst--archive');
    const cards = $$('.lc', lst), empty = $('.lempty', lst);
    const menus = $$('.tdd__menu', lst);
    const state = {};
    const menuOf = (id) => menus.find((u) => u.id === id);

    const run = () => {
      let n = 0;
      cards.forEach((c) => {
        const scope = (c.dataset.scope || '').split(' ').filter(Boolean);
        const ok = Object.entries(state).every(([id, term]) => term === 'all' || !scope.some((t) => t.startsWith(id + ':')) || scope.includes(id + ':' + term));
        c.hidden = !ok; if (ok) n++;
      });
      empty.hidden = n > 0; empty.textContent = n > 0 ? '' : EMPTY[kind];
    };
    const place = (dd, ul) => {   // under the toggle, same width (J:3774–3851)
      const t = $('.tdd__toggle', dd).getBoundingClientRect(), op = (ul.offsetParent || document.body).getBoundingClientRect();
      ul.style.top = (t.bottom - op.top) + 'px'; ul.style.left = (t.left - op.left) + 'px'; ul.style.width = t.width + 'px';
    };
    const setLabel = (toggle, prefix, text) => { $('.tdd__label', toggle).textContent = prefix + ': ' + text; };

    $$('.tdd', lst).forEach((dd) => {
      const toggle = $('.tdd__toggle', dd), ul = menuOf(toggle.getAttribute('aria-controls'));
      if (!ul) return;
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const was = dd.classList.contains('is-open');
        closeAllDropdowns();
        if (was) return;
        dd.classList.add('is-open'); ul.classList.add('is-open'); toggle.setAttribute('aria-expanded', 'true');
        place(dd, ul);
        $$('li', ul).forEach((li, i) => { li.style.animationDelay = (0.1 * i) + 's'; });
      });
      addEventListener('resize', () => { if (dd.classList.contains('is-open')) place(dd, ul); });
      $$('a', ul).forEach((a) => a.addEventListener('click', (e) => {
        e.preventDefault();
        const prefix = $('.tdd__label', toggle).textContent.split(':')[0];
        const term = a.dataset.term, href = a.getAttribute('href');
        setLabel(toggle, prefix, term === 'all' ? a.dataset.label : term.replace(/-/g, ' '));
        $$('li', ul).forEach((li) => li.classList.toggle('is-active', li === a.parentElement));
        closeAllDropdowns();
        if (href && !href.startsWith('javascript') && href !== '#') { setTimeout(() => { location.href = href; }, 300); return; }   // archive pages: real links, 300 ms
        state[ul.id] = term; run();
        const bp = (PARAM[kind] || {})[ul.id];
        if (bp && !archive) {   // keep the address bar in step like the reference's pushState (J:4472–4525)
          const q = new URLSearchParams(location.search);
          if (term === 'all') q.delete(bp); else q.set(bp, term);
          history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : ''));
        }
        const top = lst.getBoundingClientRect().top + scrollY - 100;
        scrollTo({ top, behavior: 'instant' });
      }));
    });

    /* learn page: read the filter from the address on load (archive pages link to /learn/?learn-topic=…) */
    if (kind === 'learn' && !archive) {
      const q = new URLSearchParams(location.search);
      let any = false;
      menus.forEach((ul) => {
        const bp = PARAM.learn[ul.id], term = bp && q.get(bp);
        if (!term) return;
        const a = $$('a', ul).find((x) => x.dataset.term === term);
        if (!a) return;
        const toggle = $$('.tdd__toggle', lst).find((t) => t.getAttribute('aria-controls') === ul.id);
        setLabel(toggle, $('.tdd__label', toggle).textContent.split(':')[0], term.replace(/-/g, ' '));
        $$('li', ul).forEach((li) => li.classList.toggle('is-active', li === a.parentElement));
        state[ul.id] = term; any = true;
      });
      if (any) run();
    }

    /* mobile "Show Filter" row (J:4092–4097) */
    const show = $('.lbar__show', lst), row = $('.lbar__row', lst);
    show?.addEventListener('click', () => { const on = !show.classList.contains('is-active'); show.classList.toggle('is-active', on); row.classList.toggle('is-active', on); show.setAttribute('aria-expanded', String(on)); });

    /* mobile pager popup (J:4264–4276) */
    $$('.pg', lst).forEach((pg) => {
      const trig = $('.pg__trigger', pg), pop = $('.pg__pop', pg);
      trig?.addEventListener('click', (e) => { e.stopPropagation(); const on = !pop.classList.contains('is-open'); pop.classList.toggle('is-open', on); trig.setAttribute('aria-expanded', String(on)); });
      document.addEventListener('click', (e) => { if (!pg.contains(e.target)) pop?.classList.remove('is-open'); });
    });
  });

  /* ---------------------------------------------------------------- D5–D7 events: list / calendar view + calendar build (events.js J:10434–10514) */
  $$('.evl').forEach((root) => {
    const tabs = $$('.evl__tab', root), list = $('.evl__list', root), cal = $('.cal', root);
    const events = JSON.parse($('.evl__data', root).textContent).filter((e) => e.start);
    const MN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const DN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const iso = (y, m, d) => y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    let built = false;
    const build = () => {
      built = true;
      if (!events.length) return;
      const first = events.map((e) => e.start).sort()[0].split('-').map(Number), last = events.map((e) => e.end).sort().pop().split('-').map(Number);
      let y = first[0], m = first[1] - 1, html = '';
      while (y < last[0] || (y === last[0] && m <= last[1] - 1)) {
        const days = new Date(y, m + 1, 0).getDate(), lead = new Date(y, m, 1).getDay();
        html += '<div class="cal__row"><div class="cal__month h5">' + MN[m] + ' ' + y + '</div><div class="s20"></div>';
        html += '<div class="cal__names">' + DN.map((n) => '<div class="cal__name"><span class="f">' + n + '</span><span class="m">' + n.slice(0, 3) + '</span></div>').join('') + '</div><div class="cal__days">';
        for (let i = 0; i < lead; i++) html += '<div class="cal__col is-blank"><div class="cal__date">&nbsp;</div></div>';
        for (let d = 1; d <= days; d++) {
          const day = iso(y, m, d), on = events.filter((e) => e.start <= day && day <= e.end);
          html += '<div class="cal__col' + (on.length ? ' has-event' : '') + '"><div class="cal__date">' + d + '</div>';
          on.forEach((e) => { html += '<div class="cal__ev"><div class="cal__mq">' + (e.image ? '<img src="' + esc(e.image.src) + '" alt="" loading="lazy">' : '') + '<span class="cal__tt">' + esc(e.title) + '</span></div></div>'; });
          if (on.length) {
            html += '<div class="cal__tip" role="dialog" aria-label="Events on ' + MN[m] + ' ' + d + '"><button class="cal__close" type="button" aria-label="Close"><img src="' + root.dataset.root + 'assets/img/close-white.svg" alt=""></button>';
            on.forEach((e) => { html += '<div class="cal__item"><div class="cal__timg"><a href="' + esc(e.href) + '">' + (e.image ? '<img src="' + esc(e.image.src) + '" alt="">' : '') + '</a></div><div class="cal__tcontent"><div class="cal__tdate">' + esc(e.when) + '</div><a class="cal__thead" href="' + esc(e.href) + '">' + esc(e.title) + '</a><div class="cal__tmore"><a class="ulink" href="' + esc(e.href) + '">' + esc(e.more || 'Event Details') + '</a></div></div></div>'; });
            html += '</div>';
          }
          html += '</div>';
        }
        html += '</div></div>';
        if (++m > 11) { m = 0; y++; }
      }
      cal.innerHTML = html;
      cal.addEventListener('click', (ev) => {
        const close = ev.target.closest('.cal__close');
        if (close) { close.closest('.cal__tip').classList.remove('is-show'); setTimeout(() => document.documentElement.classList.remove('popup-overflow'), 400); return; }
        const col = ev.target.closest('.cal__col.has-event');
        if (!col || ev.target.closest('a')) return;
        $$('.cal__tip.is-show', cal).forEach((t) => t.classList.remove('is-show'));
        $('.cal__tip', col).classList.add('is-show');
        document.documentElement.classList.add('popup-overflow');
      });
    };
    const view = (v) => {
      tabs.forEach((t) => t.classList.toggle('is-current', t.dataset.view === v));
      list.hidden = v === 'calendar'; cal.hidden = v !== 'calendar';
      if (v === 'calendar' && !built) build();
    };
    tabs.forEach((t) => t.addEventListener('click', (e) => { e.preventDefault(); view(t.dataset.view); history.replaceState(null, '', '?eventsview=' + t.dataset.view); }));
    if (new URLSearchParams(location.search).get('eventsview') === 'calendar') view('calendar');
  });

  /* ---------------------------------------------------------------- D12b map: "Show Map Filter" + height (J:4045–4067) */
  $$('.amap').forEach((m) => {
    const panel = $('.amap__panel', m), tg = $('.amap__toggle', m), list = $('.amap__list', m);
    tg.addEventListener('click', () => {
      const on = list.hidden;
      list.hidden = !on; tg.textContent = on ? 'Hide Map Filter' : 'Show Map Filter';
      panel.classList.toggle('is-visible', on); tg.setAttribute('aria-expanded', String(on));
    });
    /* the reference's J:4045 sets the section height from header and sub-nav heights, but its captured state is exactly 100vh (902 px at 1440x900, borders included): the map keeps its 100vh height here. */
  });

  /* ---------------------------------------------------------------- D11 donate: amount tiles highlight (the form posts nowhere) */
  $$('.dform__gift').forEach((g) => {
    const pick = () => { $$('.dform__gift').forEach((o) => { o.classList.toggle('is-on', o === g); o.setAttribute('aria-checked', String(o === g)); }); const t = $('.dform__total'); if (t) t.textContent = 'Total: ' + g.textContent.trim(); };
    g.addEventListener('click', pick);
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
  });
})();
